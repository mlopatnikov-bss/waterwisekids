// Tenant-scoped data-quality checks on D1: an async port of Phase 1 runQuality()
// (src/quality.mjs) with the same SQL, thresholds and messages. Tests assert the output
// equals Phase 1 on the same seeded data. There is deliberately NO cross-tenant
// healthSummary() here: the portal never exposes an operator-wide view.
import { addDays, eachDate, localDate } from '../../../src/time.mjs';
import { sha256Hex } from '../../../src/ids.mjs';
import { reconcile } from './rollup.mjs';

export const THRESHOLDS = Object.freeze({
  freshness_warn_hours: 26,
  freshness_critical_hours: 72,
  completeness_warn_pct: 99.9,
  rejected_warn_pct: 5,
  duplicate_warn_pct: 10,
  conversion_stale_days: 14,
  anomaly_low_ratio: 0.4,
  anomaly_high_ratio: 2.5,
  anomaly_min_median: 10,
});
const RANK = { ok: 0, info: 1, warn: 2, critical: 3 };
const worst = (a, b) => (RANK[a] >= RANK[b] ? a : b);
const rows = async (db, sql, ...p) => (await db.prepare(sql).bind(...p).all()).results;
const row = (db, sql, ...p) => db.prepare(sql).bind(...p).first();

export async function runQuality(db, { tenantId, asOf, from, to, record = false }) {
  const tenant = await row(db, 'SELECT tenant_id, timezone FROM tenants WHERE tenant_id = ?', tenantId);
  if (!tenant) throw new Error('unknown tenant');
  const asOfMs = Date.parse(asOf);
  const asOfDate = localDate(asOfMs, tenant.timezone);
  const lastCompleteDay = addDays(asOfDate, -1);
  const end = to < lastCompleteDay ? to : lastCompleteDay;
  const checks = [];
  const add = (c) => checks.push(c);

  // 1. Freshness.
  const last = (await row(db, 'SELECT MAX(occurred_minute) AS t FROM events WHERE tenant_id = ?', tenantId)).t;
  if (!last) {
    add({ check: 'freshness', severity: 'warn', message: 'No observed events have been received for this account yet.', value: null });
  } else {
    const hours = Math.round(((asOfMs - Date.parse(last)) / 3600000) * 10) / 10;
    const sev = hours >= THRESHOLDS.freshness_critical_hours ? 'critical' : hours >= THRESHOLDS.freshness_warn_hours ? 'warn' : 'ok';
    add({ check: 'freshness', severity: sev, value: hours, last_event_at: last,
      message: sev === 'ok' ? `Latest observed event ${hours} hours before the report time.` : `No observed events for ${hours} hours before the report time. Recent days may be incomplete.` });
  }

  // 2. Completeness.
  const campaigns = await rows(db, "SELECT campaign_id, starts_on, ends_on FROM campaigns WHERE tenant_id = ? AND kind = 'sponsored_pilot'", tenantId);
  const expectedDays = new Set();
  for (const c of campaigns) {
    const a = c.starts_on > from ? c.starts_on : from;
    const b = c.ends_on < end ? c.ends_on : end;
    if (a <= b) for (const d of eachDate(a, b)) expectedDays.add(d);
  }
  const seenDays = new Set((await rows(db, `SELECT DISTINCT dm.metric_date AS d FROM daily_metrics dm JOIN placements p ON p.placement_id = dm.placement_id AND p.tenant_id = dm.tenant_id
      WHERE dm.tenant_id = ? AND p.kind = 'sponsored_card' AND dm.metric = 'eligible_view' AND dm.metric_date BETWEEN ? AND ?`, tenantId, from, end)).map((r) => r.d));
  const missing = [...expectedDays].filter((d) => !seenDays.has(d)).sort();
  const pct = expectedDays.size ? Math.round(((expectedDays.size - missing.length) / expectedDays.size) * 1000) / 10 : null;
  add({ check: 'completeness', severity: pct === null ? 'info' : pct < THRESHOLDS.completeness_warn_pct ? 'warn' : 'ok', value: pct, expected_days: expectedDays.size, missing_days: missing,
    message: pct === null ? 'No sponsored campaign days in this range.' : missing.length ? `${missing.length} of ${expectedDays.size} campaign days have no observed data: ${missing.join(', ')}.` : `All ${expectedDays.size} campaign days have observed data.` });

  // 3. Funnel integrity per placement-day.
  const funnelRows = await rows(db, `SELECT dm.metric_date AS metric_date, dm.placement_id AS placement_id, p.kind AS kind,
      SUM(CASE WHEN dm.metric='eligible_view' THEN dm.value ELSE 0 END) AS ev,
      SUM(CASE WHEN dm.metric='viewable_impression' THEN dm.value ELSE 0 END) AS vi,
      SUM(CASE WHEN dm.metric='sponsored_click' THEN dm.value ELSE 0 END) AS sc,
      SUM(CASE WHEN dm.metric='outbound_click' THEN dm.value ELSE 0 END) AS oc
      FROM daily_metrics dm JOIN placements p ON p.placement_id = dm.placement_id AND p.tenant_id = dm.tenant_id
      WHERE dm.tenant_id = ? AND dm.metric_date BETWEEN ? AND ?
      GROUP BY dm.metric_date, dm.placement_id, p.kind ORDER BY dm.metric_date, dm.placement_id`, tenantId, from, to);
  const FUNNEL_RULES = [
    ['viewable_exceeds_eligible', 'more viewable impressions than eligible views', (r) => r.vi > r.ev],
    ['sponsored_click_exceeds_viewable', 'more sponsored-card clicks than viewable impressions', (r) => r.sc > r.vi],
    ['sponsored_outbound_exceeds_sponsored_click', 'more sponsored-card clicks to the official site than sponsored-card clicks', (r) => r.kind === 'sponsored_card' && r.oc > r.sc],
  ];
  const byRule = Object.fromEntries(FUNNEL_RULES.map(([k]) => [k, 0]));
  const violations = [];
  for (const r of funnelRows) {
    for (const [key, , test] of FUNNEL_RULES) {
      if (test(r)) {
        byRule[key] += 1;
        violations.push({ rule: key, date: r.metric_date, placement_id: r.placement_id, kind: r.kind,
          eligible_view: Number(r.ev), viewable_impression: Number(r.vi), sponsored_click: Number(r.sc), outbound_click: Number(r.oc) });
      }
    }
  }
  const badDays = new Set(violations.map((v) => `${v.date}|${v.placement_id}`)).size;
  add({ check: 'funnel_integrity', severity: violations.length ? 'warn' : 'ok', value: badDays, by_rule: byRule, violations: violations.slice(0, 20),
    message: violations.length
      ? `${badDays} placement-day(s) fail funnel integrity: ${FUNNEL_RULES.filter(([k]) => byRule[k]).map(([k, label]) => `${byRule[k]} with ${label}`).join('; ')}.`
      : 'Funnel steps never exceed the previous step (views ≥ viewable impressions ≥ sponsored-card clicks ≥ sponsored-card clicks to the official site).' });

  // 4. Ingest rejection and duplicate rates (by receipt day).
  const outc = await rows(db, 'SELECT outcome, SUM(count) AS n FROM ingest_outcomes WHERE tenant_key = ? AND received_date BETWEEN ? AND ? GROUP BY outcome', tenantId, from, addDays(to, 1));
  const o = Object.fromEntries(outc.map((r) => [r.outcome, Number(r.n)]));
  const total = (o.accepted || 0) + (o.rejected || 0) + (o.duplicate_event_id || 0) + (o.duplicate_semantic || 0);
  const rejPct = total ? Math.round(((o.rejected || 0) / total) * 1000) / 10 : 0;
  const dupPct = total ? Math.round((((o.duplicate_event_id || 0) + (o.duplicate_semantic || 0)) / total) * 1000) / 10 : 0;
  add({ check: 'ingest_rejections', severity: rejPct > THRESHOLDS.rejected_warn_pct ? 'warn' : 'ok', value: rejPct, counts: o,
    message: `${o.rejected || 0} of ${total} received events rejected (${rejPct}%). Rejected events are never counted.` });
  add({ check: 'ingest_duplicates', severity: dupPct > THRESHOLDS.duplicate_warn_pct ? 'warn' : 'ok', value: dupPct,
    message: `${(o.duplicate_event_id || 0) + (o.duplicate_semantic || 0)} duplicates discarded (${dupPct}%). Duplicates never inflate totals.` });

  // 5. Rollup reconciliation.
  const rec = await reconcile(db, { tenantId, from, to });
  add({ check: 'rollup_reconciliation', severity: rec.ok ? 'ok' : 'critical', value: rec.ok, diffs: rec.diffs,
    message: rec.ok ? 'Daily rollups reconcile exactly with accepted events.' : 'Daily rollups do not match accepted events.' });

  // 6. Reported conversions freshness.
  const conv = await row(db, 'SELECT MAX(conversion_date) AS d, COUNT(*) AS n FROM conversion_records WHERE tenant_id = ?', tenantId);
  if (!conv.n) add({ check: 'conversion_imports', severity: 'info', value: null, message: 'No reported conversions have been imported. Lead and enrollment figures are unavailable.' });
  else {
    const age = Math.round((Date.parse(`${asOfDate}T00:00:00Z`) - Date.parse(`${conv.d}T00:00:00Z`)) / 86400000);
    add({ check: 'conversion_imports', severity: age > THRESHOLDS.conversion_stale_days ? 'warn' : 'ok', value: age, last_date: conv.d,
      message: age > THRESHOLDS.conversion_stale_days ? `Latest reported conversions are ${age} days old (${conv.d}).` : `Reported conversions current through ${conv.d}.` });
  }

  // 7. Anomalies vs trailing 14-day median.
  const series = await rows(db, `SELECT dm.metric_date AS d, SUM(dm.value) AS v FROM daily_metrics dm JOIN placements p ON p.placement_id = dm.placement_id AND p.tenant_id = dm.tenant_id
      WHERE dm.tenant_id = ? AND p.kind = 'sponsored_card' AND dm.metric = 'eligible_view' AND dm.metric_date BETWEEN ? AND ? GROUP BY dm.metric_date`, tenantId, addDays(from, -14), end);
  const vals = new Map(series.map((r) => [r.d, Number(r.v)]));
  const anomalies = [];
  for (const d of [...expectedDays].sort()) {
    if (d < from) continue;
    const prior = eachDate(addDays(d, -14), addDays(d, -1)).map((x) => vals.get(x)).filter((x) => x !== undefined);
    if (prior.length < 7) continue;
    const med = median(prior);
    if (med < THRESHOLDS.anomaly_min_median) continue;
    const v = vals.get(d) || 0;
    if (v < med * THRESHOLDS.anomaly_low_ratio || v > med * THRESHOLDS.anomaly_high_ratio) anomalies.push({ date: d, value: v, trailing_median: med });
  }
  add({ check: 'anomalies', severity: anomalies.length ? 'warn' : 'ok', value: anomalies.length, flags: anomalies,
    message: anomalies.length ? `${anomalies.length} day(s) deviate sharply from the trailing 14-day median: ${anomalies.map((a) => `${a.date} (${a.value} vs ${a.trailing_median})`).join(', ')}.` : 'No sharp daily deviations.' });

  // 8. Locations awaiting confirmation.
  const pending = await rows(db, "SELECT display_name, status FROM locations WHERE tenant_id = ? AND status <> 'eligible_fixture' ORDER BY display_name", tenantId);
  add({ check: 'pending_locations', severity: pending.length ? 'info' : 'ok', value: pending.length, locations: pending.map((p) => p.display_name),
    message: pending.length ? `${pending.length} location(s) awaiting owner confirmation and excluded from placements: ${pending.map((p) => p.display_name).join(', ')}.` : 'All listed locations are eligible.' });

  const status = checks.reduce((s, c) => worst(s, c.severity), 'ok');
  const run = { run_id: `dq_${sha256Hex(`${tenantId}|${asOf}|${from}|${to}`).slice(0, 16)}`, tenant_id: tenantId, as_of: asOf, range_start: from, range_end: to, status, checks };
  if (record) {
    await db.prepare('INSERT OR REPLACE INTO data_quality_runs (run_id, tenant_id, as_of, range_start, range_end, status, checks_json, created_at) VALUES (?,?,?,?,?,?,?,?)')
      .bind(run.run_id, tenantId, asOf, from, to, status, JSON.stringify(checks), asOf).run();
  }
  return run;
}

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round(((s[m - 1] + s[m]) / 2) * 10) / 10;
}
