// D1 ingest core for the collector Worker. Validation is the accepted Phase 1
// validateEvent() (src/events.mjs), unchanged. Storage is one D1 batch per request,
// which D1 runs as a single transaction, in order:
//   rejected event   -> bump its reason-code counter (the payload is never stored)
//   valid event      -> classify + count (accepted | duplicate_event_id | duplicate_semantic)
//                       using the same precedence as Phase 1, then INSERT ... ON CONFLICT DO NOTHING
//   each tenant-day touched -> exact rollup rebuild (src/shared/rollup.mjs)
// Later statements see earlier ones, so duplicates inside one request are caught too.
import { validateEvent } from '../../../src/events.mjs';
import { localDate } from '../../../src/time.mjs';
import { rollupDayStatements } from './rollup.mjs';

const OUTCOME_TZ = 'America/New_York';

const BUMP_SQL = `INSERT INTO ingest_outcomes (received_date, tenant_key, outcome, reason_code, count) VALUES (?1, ?2, ?3, ?4, 1)
  ON CONFLICT (received_date, tenant_key, outcome, reason_code) DO UPDATE SET count = count + 1`;
const CLASSIFY_SQL = `INSERT INTO ingest_outcomes (received_date, tenant_key, outcome, reason_code, count)
  SELECT ?1, ?2,
    CASE WHEN EXISTS (SELECT 1 FROM events WHERE event_id = ?3) THEN 'duplicate_event_id'
         WHEN EXISTS (SELECT 1 FROM events WHERE dedupe_key = ?4) THEN 'duplicate_semantic' ELSE 'accepted' END,
    CASE WHEN EXISTS (SELECT 1 FROM events WHERE event_id = ?3) THEN 'retry'
         WHEN EXISTS (SELECT 1 FROM events WHERE dedupe_key = ?4) THEN 'same_page_view' ELSE 'ok' END,
    1
  WHERE true
  ON CONFLICT (received_date, tenant_key, outcome, reason_code) DO UPDATE SET count = count + 1
  RETURNING outcome`;
const INSERT_SQL = `INSERT INTO events (event_id, schema_version, event_type, tenant_id, school_id, campaign_id, placement_id, location_id, destination_id,
  page_path, referrer_category, device_class, page_view_id, occurred_minute, local_date, received_date, dedupe_key)
  VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17) ON CONFLICT DO NOTHING`;

/**
 * Validate, dedupe, store and count deliveries in ONE D1 batch.
 * @param deliveries Array<{payload: unknown, receivedAtMs: number}>
 * @returns {{accepted:number, duplicates:number, rejected:number, reasons: Record<string, number>}}
 *   Counts and reason codes only; never payload values.
 */
export async function ingestDeliveries(db, registry, deliveries, { computedAt } = {}) {
  const statements = [];
  const plan = [];
  const days = new Map();
  const summary = { accepted: 0, duplicates: 0, rejected: 0, reasons: {} };
  let lastReceived = 0;
  for (const d of deliveries) {
    if (!d || !Number.isFinite(d.receivedAtMs)) throw new TypeError('each delivery needs a finite receivedAtMs');
    lastReceived = Math.max(lastReceived, d.receivedAtMs);
    const v = validateEvent(d.payload, registry, { receivedAtMs: d.receivedAtMs });
    if (!v.ok) {
      const tz = v.tenantKey !== '_unknown' ? registry.tenants.get(v.tenantKey).timezone : OUTCOME_TZ;
      statements.push(db.prepare(BUMP_SQL).bind(localDate(d.receivedAtMs, tz), v.tenantKey, 'rejected', v.reason));
      summary.rejected += 1;
      summary.reasons[v.reason] = (summary.reasons[v.reason] || 0) + 1;
      continue;
    }
    const e = v.event;
    plan.push(statements.length);
    statements.push(db.prepare(CLASSIFY_SQL).bind(e.received_date, e.tenant_id, e.event_id, e.dedupe_key));
    statements.push(db.prepare(INSERT_SQL).bind(e.event_id, e.schema_version, e.event_type, e.tenant_id, e.school_id, e.campaign_id, e.placement_id,
      e.location_id, e.destination_id, e.page_path, e.referrer_category, e.device_class, e.page_view_id, e.occurred_minute, e.local_date, e.received_date, e.dedupe_key));
    days.set(`${e.tenant_id}|${e.local_date}`, [e.tenant_id, e.local_date]);
  }
  const stamp = computedAt || new Date(lastReceived).toISOString();
  for (const [tenantId, date] of days.values()) statements.push(...rollupDayStatements(db, tenantId, date, stamp));
  if (!statements.length) return summary;
  const results = await db.batch(statements);
  for (const i of plan) {
    const outcome = results[i].results[0]?.outcome;
    if (outcome === 'accepted') summary.accepted += 1;
    else if (outcome === 'duplicate_event_id' || outcome === 'duplicate_semantic') {
      summary.duplicates += 1;
      summary.reasons[outcome] = (summary.reasons[outcome] || 0) + 1;
    } else throw new Error('ingest classification missing');
  }
  return summary;
}
