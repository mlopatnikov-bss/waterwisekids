// Daily rollups. Recomputing a range is idempotent: the range is deleted and
// rebuilt from accepted events inside one transaction.
import { tx, audit } from './db.mjs';

export function rollupRange(db, { from, to, tenantId = null, computedAt = new Date().toISOString(), actor = 'rollup' }) {
  return tx(db, () => {
    const tenantClause = tenantId ? 'AND tenant_id = ?' : '';
    const params = tenantId ? [from, to, tenantId] : [from, to];
    db.prepare(`DELETE FROM daily_metrics WHERE metric_date BETWEEN ? AND ? ${tenantClause}`).run(...params);
    const r = db.prepare(`INSERT INTO daily_metrics (metric_date, tenant_id, campaign_id, placement_id, location_key, page_path, destination_key, metric, value, computed_at)
      SELECT local_date, tenant_id, campaign_id, placement_id, COALESCE(location_id, '_none'), page_path, COALESCE(destination_id, '_none'), event_type, COUNT(*), ?
      FROM events WHERE local_date BETWEEN ? AND ? ${tenantClause}
      GROUP BY local_date, tenant_id, campaign_id, placement_id, COALESCE(location_id, '_none'), page_path, COALESCE(destination_id, '_none'), event_type`)
      .run(computedAt, ...params);
    audit(db, { actor, action: 'rollup.range', tenantId, at: computedAt, detail: { from, to, rows: r.changes } });
    return { rows: r.changes };
  });
}

/** Compare raw accepted events against rollups, per tenant and metric. */
export function reconcile(db, { tenantId, from, to }) {
  const raw = db.prepare(`SELECT event_type AS metric, COUNT(*) AS n FROM events WHERE tenant_id = ? AND local_date BETWEEN ? AND ? GROUP BY event_type`).all(tenantId, from, to);
  const rolled = db.prepare(`SELECT metric, SUM(value) AS n FROM daily_metrics WHERE tenant_id = ? AND metric_date BETWEEN ? AND ? GROUP BY metric`).all(tenantId, from, to);
  const a = Object.fromEntries(raw.map((r) => [r.metric, Number(r.n)]));
  const b = Object.fromEntries(rolled.map((r) => [r.metric, Number(r.n)]));
  const metrics = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  const diffs = metrics.filter((m) => (a[m] || 0) !== (b[m] || 0)).map((m) => ({ metric: m, events: a[m] || 0, daily_metrics: b[m] || 0 }));
  return { ok: diffs.length === 0, events: a, daily_metrics: b, diffs };
}
