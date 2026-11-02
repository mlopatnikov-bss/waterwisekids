// Transport-independent collector core: validate -> dedupe -> store -> count.
// Wrap with any transport (local HTTP here; an edge handler later).
//
// Every delivery is validated and deduplicated individually by ingestOne(); the
// only thing callers choose is how many deliveries share one SQLite transaction.
// The HTTP transport keeps its 25-event request cap (http-collector.mjs); the
// local synthetic seed groups thousands of deliveries per transaction to avoid
// one disk commit per 25 events (see pipeline.mjs).
import { validateEvent } from './events.mjs';
import { localDate } from './time.mjs';
import { tx } from './db.mjs';

const OUTCOME_TZ = 'America/New_York';

function statements(db) {
  return {
    insert: db.prepare(`INSERT INTO events (event_id, schema_version, event_type, tenant_id, school_id, campaign_id, placement_id, location_id, destination_id,
      page_path, referrer_category, device_class, page_view_id, occurred_minute, local_date, received_date, dedupe_key)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT DO NOTHING`),
    byId: db.prepare('SELECT 1 FROM events WHERE event_id = ?'),
    bump: db.prepare(`INSERT INTO ingest_outcomes (received_date, tenant_key, outcome, reason_code, count) VALUES (?,?,?,?,1)
      ON CONFLICT (received_date, tenant_key, outcome, reason_code) DO UPDATE SET count = count + 1`),
  };
}

/** Validate, dedupe, store and count one delivery. Must run inside a transaction. */
function ingestOne(registry, raw, receivedAtMs, st, summary) {
  const v = validateEvent(raw, registry, { receivedAtMs });
  if (!v.ok) {
    const rd = v.tenantKey !== '_unknown' ? localDate(receivedAtMs, registry.tenants.get(v.tenantKey).timezone) : localDate(receivedAtMs, OUTCOME_TZ);
    st.bump.run(rd, v.tenantKey, 'rejected', v.reason);
    summary.rejected += 1;
    summary.results.push({ status: 'rejected', reason: v.reason });
    return;
  }
  const e = v.event;
  if (st.byId.get(e.event_id)) {
    st.bump.run(e.received_date, e.tenant_id, 'duplicate_event_id', 'retry');
    summary.duplicates += 1;
    summary.results.push({ status: 'duplicate', reason: 'duplicate_event_id' });
    return;
  }
  const r = st.insert.run(e.event_id, e.schema_version, e.event_type, e.tenant_id, e.school_id, e.campaign_id, e.placement_id, e.location_id, e.destination_id,
    e.page_path, e.referrer_category, e.device_class, e.page_view_id, e.occurred_minute, e.local_date, e.received_date, e.dedupe_key);
  if (r.changes === 0) {
    st.bump.run(e.received_date, e.tenant_id, 'duplicate_semantic', 'same_page_view');
    summary.duplicates += 1;
    summary.results.push({ status: 'duplicate', reason: 'duplicate_semantic' });
    return;
  }
  st.bump.run(e.received_date, e.tenant_id, 'accepted', 'ok');
  summary.accepted += 1;
  summary.results.push({ status: 'accepted' });
}

/**
 * Ingest deliveries, each with its own receipt time, in ONE transaction
 * (all-or-nothing on an unexpected storage error; validation rejections never throw).
 * @param deliveries Array<{payload: unknown, receivedAtMs: number}>
 */
export function ingestDeliveries(db, registry, deliveries) {
  for (const d of deliveries) {
    if (!d || !Number.isFinite(d.receivedAtMs)) throw new TypeError('each delivery needs a finite receivedAtMs');
  }
  const summary = { accepted: 0, duplicates: 0, rejected: 0, results: [] };
  const st = statements(db);
  tx(db, () => {
    for (const d of deliveries) ingestOne(registry, d.payload, d.receivedAtMs, st, summary);
  });
  return summary;
}

/**
 * Ingest a batch of raw payloads received at one instant (HTTP request semantics).
 * @returns {{accepted:number, duplicates:number, rejected:number, results:Array<{status:string, reason?:string}>}}
 */
export function ingestBatch(db, registry, payloads, { receivedAtMs = Date.now() } = {}) {
  return ingestDeliveries(db, registry, payloads.map((payload) => ({ payload, receivedAtMs })));
}

/** Drop raw events older than the retention window (aggregates in daily_metrics remain). */
export function purgeRawEvents(db, { olderThanLocalDate }) {
  const r = db.prepare('DELETE FROM events WHERE local_date < ?').run(olderThanLocalDate);
  return r.changes;
}
