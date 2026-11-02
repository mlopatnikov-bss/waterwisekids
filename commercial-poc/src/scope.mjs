// Tenant-scoped read model. Every query binds the scope's tenant_id; there is no
// unscoped read path for portal code. A scope can only be obtained through
// membership (scopeForSession) or explicitly by an operator CLI (operatorScope).
import { addDays, eachDate } from './time.mjs';

export class TenantScope {
  constructor(db, tenantId, actorId) {
    if (!/^ten_[a-f0-9]{16}$/.test(tenantId)) throw new Error('invalid tenant id');
    this.db = db; this.tenantId = tenantId; this.actorId = actorId;
    Object.freeze(this);
  }

  #all(sql, ...params) { return this.db.prepare(sql).all(this.tenantId, ...params); }
  #get(sql, ...params) { return this.db.prepare(sql).get(this.tenantId, ...params); }

  tenant() {
    return this.#get('SELECT tenant_id, display_name, timezone, pilot_status, pilot_price_cents FROM tenants WHERE tenant_id = ?');
  }

  campaigns() {
    return this.#all('SELECT campaign_id, kind, display_name, disclosure_label, price_cents, starts_on, ends_on FROM campaigns WHERE tenant_id = ? ORDER BY kind DESC');
  }

  locations() {
    return this.#all('SELECT location_id, display_name, address_display, official_url, status, status_reason, verified_on FROM locations WHERE tenant_id = ? ORDER BY display_name');
  }

  dataExtent() {
    return this.#get(`SELECT MIN(local_date) AS first_date, MAX(local_date) AS last_date, MAX(occurred_minute) AS last_event_at, COUNT(*) AS events
                      FROM events WHERE tenant_id = ?`);
  }

  /** Totals by placement kind and metric. */
  totals(from, to) {
    const rows = this.#all(`SELECT p.kind AS kind, dm.metric AS metric, SUM(dm.value) AS value
      FROM daily_metrics dm JOIN placements p ON p.placement_id = dm.placement_id AND p.tenant_id = dm.tenant_id
      WHERE dm.tenant_id = ? AND dm.metric_date BETWEEN ? AND ? GROUP BY p.kind, dm.metric`, from, to);
    const out = { sponsored_card: {}, organic_listing: {} };
    for (const r of rows) out[r.kind][r.metric] = Number(r.value);
    return out;
  }

  daily(from, to, kind = 'sponsored_card') {
    const rows = this.#all(`SELECT dm.metric_date AS d, dm.metric AS metric, SUM(dm.value) AS value
      FROM daily_metrics dm JOIN placements p ON p.placement_id = dm.placement_id AND p.tenant_id = dm.tenant_id
      WHERE dm.tenant_id = ? AND dm.metric_date BETWEEN ? AND ? AND p.kind = ? GROUP BY dm.metric_date, dm.metric`, from, to, kind);
    const map = new Map(eachDate(from, to).map((d) => [d, { date: d, eligible_view: 0, viewable_impression: 0, sponsored_click: 0, outbound_click: 0, has_data: false }]));
    for (const r of rows) { const day = map.get(r.d); if (day) { day[r.metric] = Number(r.value); day.has_data = true; } }
    return [...map.values()];
  }

  byPlacement(from, to) {
    const rows = this.#all(`SELECT p.placement_id, p.kind, p.display_name, pp.page_path, dm.metric, COALESCE(SUM(dm.value), 0) AS value
      FROM placements p
      JOIN placement_pages pp ON pp.placement_id = p.placement_id AND pp.tenant_id = p.tenant_id
      LEFT JOIN daily_metrics dm ON dm.placement_id = p.placement_id AND dm.tenant_id = p.tenant_id AND dm.page_path = pp.page_path AND dm.metric_date BETWEEN ?2 AND ?3
      WHERE p.tenant_id = ?1 GROUP BY p.placement_id, pp.page_path, dm.metric ORDER BY p.kind DESC, pp.page_path`, from, to);
    return pivot(rows, (r) => `${r.placement_id}|${r.page_path}`, (r) => ({ placement_id: r.placement_id, kind: r.kind, display_name: r.display_name, page_path: r.page_path }));
  }

  byLocation(from, to) {
    const locs = this.locations();
    const featured = this.#all(`SELECT p.featured_location_id AS location_id, dm.metric, SUM(dm.value) AS value
      FROM daily_metrics dm JOIN placements p ON p.placement_id = dm.placement_id AND p.tenant_id = dm.tenant_id
      WHERE dm.tenant_id = ? AND dm.metric_date BETWEEN ? AND ? AND p.kind = 'sponsored_card' AND p.featured_location_id IS NOT NULL
      GROUP BY p.featured_location_id, dm.metric`, from, to);
    const outbound = this.#all(`SELECT dm.location_key AS location_id, p.kind, SUM(dm.value) AS value
      FROM daily_metrics dm JOIN placements p ON p.placement_id = dm.placement_id AND p.tenant_id = dm.tenant_id
      WHERE dm.tenant_id = ? AND dm.metric_date BETWEEN ? AND ? AND dm.metric = 'outbound_click' GROUP BY dm.location_key, p.kind`, from, to);
    return locs.map((l) => {
      const f = Object.fromEntries(featured.filter((x) => x.location_id === l.location_id).map((x) => [x.metric, Number(x.value)]));
      const o = Object.fromEntries(outbound.filter((x) => x.location_id === l.location_id).map((x) => [x.kind, Number(x.value)]));
      return { ...l, featured_viewable_impression: f.viewable_impression || 0, featured_sponsored_click: f.sponsored_click || 0,
        outbound_sponsored: o.sponsored_card || 0, outbound_organic: o.organic_listing || 0 };
    });
  }

  byDestination(from, to) {
    const rows = this.#all(`SELECT d.destination_id, d.display_name, d.url, d.location_id, p.kind, COALESCE(SUM(dm.value), 0) AS value
      FROM destinations d
      LEFT JOIN daily_metrics dm ON dm.destination_key = d.destination_id AND dm.tenant_id = d.tenant_id AND dm.metric = 'outbound_click' AND dm.metric_date BETWEEN ?2 AND ?3
      LEFT JOIN placements p ON p.placement_id = dm.placement_id AND p.tenant_id = dm.tenant_id
      WHERE d.tenant_id = ?1 GROUP BY d.destination_id, p.kind ORDER BY d.location_id IS NOT NULL, d.display_name`, from, to);
    const map = new Map();
    for (const r of rows) {
      if (!map.has(r.destination_id)) map.set(r.destination_id, { destination_id: r.destination_id, display_name: r.display_name, url: r.url, location_id: r.location_id, sponsored_card: 0, organic_listing: 0 });
      if (r.kind) map.get(r.destination_id)[r.kind] += Number(r.value);
    }
    return [...map.values()];
  }

  conversions(from, to) {
    return this.#all(`SELECT conversion_type, method, confidence, source_label, attribution_basis, SUM(count) AS count,
        SUM(estimated_value_cents) AS estimated_value_cents, SUM(CASE WHEN estimated_value_cents IS NULL THEN 0 ELSE 1 END) AS valued_rows, MAX(conversion_date) AS last_date
      FROM conversion_records WHERE tenant_id = ? AND conversion_date BETWEEN ? AND ?
      GROUP BY conversion_type, method, confidence, source_label, attribution_basis ORDER BY conversion_type`, from, to)
      .map((r) => ({ ...r, count: Number(r.count), estimated_value_cents: r.estimated_value_cents === null ? null : Number(r.estimated_value_cents) }));
  }

  conversionTotals(from, to) {
    const rows = this.#all(`SELECT conversion_type, SUM(count) AS n FROM conversion_records WHERE tenant_id = ? AND conversion_date BETWEEN ? AND ? GROUP BY conversion_type`, from, to);
    return Object.fromEntries(rows.map((r) => [r.conversion_type, Number(r.n)]));
  }

  lastConversionImport() {
    return this.#get('SELECT MAX(received_at) AS received_at, MAX(conversion_date) AS last_date FROM conversion_records r JOIN conversion_imports i ON i.import_id = r.import_id AND i.tenant_id = r.tenant_id WHERE r.tenant_id = ?');
  }

  /** Ordinary-listing outbound clicks per active day before vs during the sponsored campaign. */
  baselineComparison() {
    const sponsored = this.campaigns().find((c) => c.kind === 'sponsored_pilot');
    const organic = this.campaigns().find((c) => c.kind === 'organic_baseline');
    if (!sponsored || !organic) return null;
    const extent = this.dataExtent();
    if (!extent || !extent.last_date) return null;
    const baseFrom = organic.starts_on; const baseTo = addDays(sponsored.starts_on, -1);
    const spFrom = sponsored.starts_on; const spTo = extent.last_date < sponsored.ends_on ? extent.last_date : sponsored.ends_on;
    const q = (from, to) => this.#get(`SELECT COUNT(DISTINCT dm.metric_date) AS days, COALESCE(SUM(CASE WHEN dm.metric = 'outbound_click' THEN dm.value END), 0) AS outbound,
        COALESCE(SUM(CASE WHEN dm.metric = 'viewable_impression' AND p.kind = 'organic_listing' THEN dm.value END), 0) AS organic_viewable,
        COALESCE(SUM(CASE WHEN dm.metric = 'outbound_click' AND p.kind = 'organic_listing' THEN dm.value END), 0) AS organic_outbound
      FROM daily_metrics dm JOIN placements p ON p.placement_id = dm.placement_id AND p.tenant_id = dm.tenant_id
      WHERE dm.tenant_id = ? AND dm.metric_date BETWEEN ? AND ?`, from, to);
    return { baseline: { from: baseFrom, to: baseTo, ...q(baseFrom, baseTo) }, sponsored: { from: spFrom, to: spTo, ...q(spFrom, spTo) } };
  }

  latestQuality() {
    const r = this.#get('SELECT run_id, as_of, range_start, range_end, status, checks_json, created_at FROM data_quality_runs WHERE tenant_id = ? ORDER BY created_at DESC, run_id DESC LIMIT 1');
    return r ? { ...r, checks: JSON.parse(r.checks_json) } : null;
  }
}

function pivot(rows, keyFn, baseFn) {
  const map = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (!map.has(k)) map.set(k, { ...baseFn(r), eligible_view: 0, viewable_impression: 0, sponsored_click: 0, outbound_click: 0 });
    if (r.metric) map.get(k)[r.metric] = Number(r.value);
  }
  return [...map.values()];
}

/** Memberships for a user (fresh from storage on every request). */
export function membershipsFor(db, userId) {
  return db.prepare(`SELECT m.tenant_id, m.role, t.display_name FROM tenant_memberships m JOIN tenants t ON t.tenant_id = m.tenant_id
                     WHERE m.user_id = ? ORDER BY t.display_name`).all(userId);
}

/** The only way portal code obtains a scope. Returns null when the user is not a member. */
export function scopeForSession(db, session, tenantId) {
  if (!session || typeof tenantId !== 'string') return null;
  const ok = db.prepare('SELECT 1 FROM tenant_memberships WHERE user_id = ? AND tenant_id = ?').get(session.userId, tenantId);
  return ok ? new TenantScope(db, tenantId, session.userId) : null;
}

/** Operator/CLI scope (never reachable from the portal HTTP surface). */
export function operatorScope(db, tenantId, actor = 'operator-cli') {
  return new TenantScope(db, tenantId, actor);
}
