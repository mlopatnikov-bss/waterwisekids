// Exact daily rollups on D1. The SQL is the Phase 1 rollup (src/rollup.mjs) applied to
// one tenant-day at a time, so the collector can rebuild every tenant-day it touched
// inside the SAME D1 batch (one transaction) as the event inserts. No scheduler is
// needed and rollups always reconcile with accepted events.
const ROLLUP_INSERT = `INSERT INTO daily_metrics (metric_date, tenant_id, campaign_id, placement_id, location_key, page_path, destination_key, metric, value, computed_at)
  SELECT local_date, tenant_id, campaign_id, placement_id, COALESCE(location_id, '_none'), page_path, COALESCE(destination_id, '_none'), event_type, COUNT(*), ?3
  FROM events WHERE tenant_id = ?1 AND local_date = ?2
  GROUP BY local_date, tenant_id, campaign_id, placement_id, COALESCE(location_id, '_none'), page_path, COALESCE(destination_id, '_none'), event_type`;

/** Two statements that rebuild one tenant-day; append them to an ingest batch. */
export function rollupDayStatements(db, tenantId, date, computedAt) {
  return [
    db.prepare('DELETE FROM daily_metrics WHERE tenant_id = ?1 AND metric_date = ?2').bind(tenantId, date),
    db.prepare(ROLLUP_INSERT).bind(tenantId, date, computedAt),
  ];
}

/** Rebuild a whole date range (all tenants) in one batch. Idempotent. */
export async function rollupRange(db, { from, to, computedAt }) {
  const r = await db.batch([
    db.prepare('DELETE FROM daily_metrics WHERE metric_date BETWEEN ?1 AND ?2').bind(from, to),
    db.prepare(`INSERT INTO daily_metrics (metric_date, tenant_id, campaign_id, placement_id, location_key, page_path, destination_key, metric, value, computed_at)
      SELECT local_date, tenant_id, campaign_id, placement_id, COALESCE(location_id, '_none'), page_path, COALESCE(destination_id, '_none'), event_type, COUNT(*), ?3
      FROM events WHERE local_date BETWEEN ?1 AND ?2
      GROUP BY local_date, tenant_id, campaign_id, placement_id, COALESCE(location_id, '_none'), page_path, COALESCE(destination_id, '_none'), event_type`).bind(from, to, computedAt),
  ]);
  return { rows: r[1].meta.changes };
}

/** Compare raw accepted events against rollups, per tenant and metric (Phase 1 semantics). */
export async function reconcile(db, { tenantId, from, to }) {
  const [raw, rolled] = await db.batch([
    db.prepare('SELECT event_type AS metric, COUNT(*) AS n FROM events WHERE tenant_id = ?1 AND local_date BETWEEN ?2 AND ?3 GROUP BY event_type').bind(tenantId, from, to),
    db.prepare('SELECT metric, SUM(value) AS n FROM daily_metrics WHERE tenant_id = ?1 AND metric_date BETWEEN ?2 AND ?3 GROUP BY metric').bind(tenantId, from, to),
  ]);
  const a = Object.fromEntries(raw.results.map((r) => [r.metric, Number(r.n)]));
  const b = Object.fromEntries(rolled.results.map((r) => [r.metric, Number(r.n)]));
  const metrics = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  const diffs = metrics.filter((m) => (a[m] || 0) !== (b[m] || 0)).map((m) => ({ metric: m, events: a[m] || 0, daily_metrics: b[m] || 0 }));
  return { ok: diffs.length === 0, events: a, daily_metrics: b, diffs };
}
