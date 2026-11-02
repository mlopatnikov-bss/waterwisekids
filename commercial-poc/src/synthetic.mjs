// Deterministic synthetic traffic for the local POC. Every number this produces is
// fake and is labeled as such in the portal. The generator independently tallies
// what the pipeline SHOULD count so tests can reconcile exactly.
import { addDays, eachDate, localDate, zonedToUtcMs } from './time.mjs';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function uuidFrom(rand) {
  const b = new Array(16).fill(0).map(() => Math.floor(rand() * 256));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const pick = (rand, items, weights) => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i += 1) { r -= weights[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
};
const poisson = (rand, lambda) => { let L = Math.exp(-lambda), k = 0, p = 1; do { k += 1; p *= rand(); } while (p > L); return k - 1; };

export const TENANT_PROFILES = Object.freeze({
  'northwest-philadelphia': { sponsoredViews: 62, organicViews: 34, viewRate: 0.61, ctr: 0.052, outboundRate: 0.82, organicCtr: 0.024, outages: [] },
  'jersey-shore': { sponsoredViews: 96, organicViews: 48, viewRate: 0.63, ctr: 0.057, outboundRate: 0.8, organicCtr: 0.026, outages: [{ from: '2026-10-12', to: '2026-10-12', reason: 'simulated collector outage' }] },
  manhattan: { sponsoredViews: 41, organicViews: 22, viewRate: 0.58, ctr: 0.044, outboundRate: 0.84, organicCtr: 0.021, outages: [{ from: '2026-10-30', to: '2026-11-01', reason: 'simulated collector outage (stale feed)' }] },
});
const WEEKDAY = [1.12, 0.94, 0.97, 0.98, 1.0, 1.02, 1.18]; // Sun..Sat

/**
 * @param manifest seed manifest
 * @returns {{deliveries: Array<{receivedAtMs:number, payload:object}>, expected: object, conversionBatches: Array}}
 */
export function generateSynthetic(manifest, { seed = 20261102, from = '2026-08-04', to = '2026-11-01', siteHost = 'www.waterwisekids.com' } = {}) {
  const rand = mulberry32(seed);
  const deliveries = [];
  const expected = { byTenant: {}, byTenantDay: {}, rejected: {}, rejectedByTenant: {}, duplicates: { duplicate_event_id: 0, duplicate_semantic: 0 }, outages: {} };
  const valid = [];

  for (const tenant of manifest.tenants) {
    const prof = TENANT_PROFILES[tenant.tenant_key];
    const tz = tenant.timezone;
    const school = manifest.schools.find((s) => s.tenant_id === tenant.tenant_id);
    const placements = manifest.placements.filter((p) => p.tenant_id === tenant.tenant_id);
    const sponsored = placements.filter((p) => p.kind === 'sponsored_card');
    const organic = placements.filter((p) => p.kind === 'organic_listing');
    const campaigns = Object.fromEntries(manifest.campaigns.filter((c) => c.tenant_id === tenant.tenant_id).map((c) => [c.kind, c]));
    const pagesOf = (p) => manifest.placement_pages.filter((pp) => pp.placement_id === p.placement_id).map((pp) => pp.page_path);
    const destsOf = (p) => manifest.placement_destinations.filter((pd) => pd.placement_id === p.placement_id).map((pd) => manifest.destinations.find((d) => d.destination_id === pd.destination_id));
    expected.byTenant[tenant.tenant_id] = { eligible_view: 0, viewable_impression: 0, sponsored_click: 0, outbound_click: 0 };
    expected.byTenantDay[tenant.tenant_id] = {};
    expected.outages[tenant.tenant_id] = prof.outages;
    const inOutage = (d) => prof.outages.some((o) => d >= o.from && d <= o.to);
    const sponsoredWeights = sponsored.map((_, i) => (i === 0 ? 1.6 : 1));
    const organicWeights = organic.map(() => 1);

    for (const day of eachDate(from, to)) {
      if (inOutage(day)) continue;
      const dow = new Date(`${day}T12:00:00Z`).getUTCDay();
      const dayIndex = (Date.parse(`${day}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000;
      const factor = WEEKDAY[dow] * (1 + dayIndex * 0.003) * (0.85 + rand() * 0.3);
      const runs = [];
      if (organic.length && day >= campaigns.organic_baseline.starts_on) runs.push({ list: organic, weights: organicWeights, views: Math.round(prof.organicViews * factor), campaign: campaigns.organic_baseline, kind: 'organic_listing' });
      if (sponsored.length && day >= campaigns.sponsored_pilot.starts_on) runs.push({ list: sponsored, weights: sponsoredWeights, views: Math.round(prof.sponsoredViews * factor), campaign: campaigns.sponsored_pilot, kind: 'sponsored_card' });
      for (const run of runs) {
        for (let i = 0; i < run.views; i += 1) {
          const p = pick(rand, run.list, run.weights);
          const pages = pagesOf(p);
          const page = pages[Math.floor(rand() * pages.length)];
          const pv = uuidFrom(rand);
          const hour = 7 + Math.floor(rand() * 15);
          const minute = Math.floor(rand() * 60);
          const t0 = zonedToUtcMs(day, hour, minute, Math.floor(rand() * 60), tz);
          const common = {
            v: 1, site_host: siteHost, page_path: page, tenant_id: tenant.tenant_id, school_id: school.school_id, campaign_id: run.campaign.campaign_id,
            placement_id: p.placement_id, page_view_id: pv,
            referrer_category: pick(rand, ['search', 'direct', 'social', 'internal', 'email', 'other'], [52, 18, 12, 10, 3, 5]),
            device_class: pick(rand, ['mobile', 'desktop', 'tablet'], [64, 30, 6]),
          };
          const emit = (type, at, extra = {}) => {
            const payload = { ...common, event_id: uuidFrom(rand), type, occurred_at: new Date(at).toISOString(), ...extra };
            valid.push({ payload, at, tenant_id: tenant.tenant_id, day: localDate(at, tz), type });
          };
          emit('eligible_view', t0);
          const viewRate = run.kind === 'sponsored_card' ? prof.viewRate : prof.viewRate * 0.85;
          if (rand() >= viewRate) continue;
          const t1 = t0 + 2000 + Math.floor(rand() * 28000);
          emit('viewable_impression', t1, { viewability: { visible_ratio: Math.round((0.5 + rand() * 0.5) * 100) / 100, visible_ms: 1000 + Math.floor(rand() * 19000) } });
          const dests = destsOf(p);
          if (run.kind === 'sponsored_card') {
            if (rand() >= prof.ctr) continue;
            const t2 = t1 + 3000 + Math.floor(rand() * 90000);
            emit('sponsored_click', t2);
            if (rand() >= prof.outboundRate) continue;
            const featuredDest = p.featured_location_id ? dests.find((d) => d.location_id === p.featured_location_id) : null;
            const dest = featuredDest && rand() < 0.65 ? featuredDest : (featuredDest ? dests.find((d) => d.location_id === null) : pick(rand, dests, dests.map((d) => (d.location_id ? 1 : dests.length - 1))));
            emit('outbound_click', t2 + 200 + Math.floor(rand() * 800), { destination_id: dest.destination_id });
          } else {
            if (rand() >= prof.organicCtr) continue;
            emit('outbound_click', t1 + 3000 + Math.floor(rand() * 60000), { destination_id: dests[0].destination_id });
          }
        }
      }
    }
  }

  // Tally expected unique valid events; then schedule deliveries with noise.
  for (const v of valid) {
    expected.byTenant[v.tenant_id][v.type] += 1;
    const d = (expected.byTenantDay[v.tenant_id][v.day] ||= { eligible_view: 0, viewable_impression: 0, sponsored_click: 0, outbound_click: 0 });
    d[v.type] += 1;
    const r0 = v.at + 1000 + Math.floor(rand() * 90000);
    deliveries.push({ receivedAtMs: r0, payload: v.payload });
    if (rand() < 0.02) { // client retry with the same event_id
      deliveries.push({ receivedAtMs: r0 + 120000 + Math.floor(rand() * 60000), payload: { ...v.payload } });
      expected.duplicates.duplicate_event_id += 1;
    }
    if (v.type === 'eligible_view' && rand() < 0.005) { // double-fired view with a fresh event_id
      deliveries.push({ receivedAtMs: r0 + 3000, payload: { ...v.payload, event_id: uuidFrom(rand) } });
      expected.duplicates.duplicate_semantic += 1;
    }
  }

  // Invalid payloads: one possible per tenant-day, rotating through rejection classes.
  const variants = [
    ['pii_field', (p) => ({ ...p, email: 'parent@example.com' })],
    ['pii_value', (p) => ({ ...p, page_path: '/swim-lessons/contact-jane.doe@example.com' })],
    ['page_path_query_or_fragment', (p) => ({ ...p, page_path: `${p.page_path}?utm_source=newsletter&child=sam` })],
    ['unknown_placement', (p) => ({ ...p, placement_id: 'plc_0000000000000000' })],
    ['host_not_allowed', (p) => ({ ...p, site_host: 'evil.example' })],
    ['timestamp_in_future', (p, at) => ({ ...p, occurred_at: new Date(at + 3 * 3600000).toISOString() })],
    ['cross_tenant_reference', (p) => ({ ...p, placement_id: manifest.placements.find((x) => x.tenant_id !== p.tenant_id).placement_id })],
    ['unknown_field', (p) => ({ ...p, experiment_bucket: 'b' })],
  ];
  const seedViews = valid.filter((v) => v.type === 'eligible_view');
  let vi = 0;
  for (let i = 0; i < seedViews.length; i += 1) {
    if (rand() >= 0.006) continue;
    const base = seedViews[i];
    const [reason, mutate] = variants[vi % variants.length];
    vi += 1;
    const payload = mutate({ ...base.payload, event_id: uuidFrom(rand) }, base.at);
    deliveries.push({ receivedAtMs: base.at + 2000, payload });
    expected.rejected[reason] = (expected.rejected[reason] || 0) + 1;
    // Every variant keeps a valid, known tenant_id, so the rejection is counted against that tenant.
    expected.rejectedByTenant[base.tenant_id] = (expected.rejectedByTenant[base.tenant_id] || 0) + 1;
  }
  deliveries.sort((a, b) => a.receivedAtMs - b.receivedAtMs);

  return { deliveries, expected, conversionBatches: conversionBatches(manifest, rand, { from, to }) };
}

function conversionBatches(manifest, rand, { from, to }) {
  const batches = [];
  const sundays = eachDate(from, to).filter((d) => new Date(`${d}T12:00:00Z`).getUTCDay() === 0);
  for (const tenant of manifest.tenants) {
    const sp = manifest.campaigns.find((c) => c.tenant_id === tenant.tenant_id && c.kind === 'sponsored_pilot');
    if (tenant.tenant_key === 'northwest-philadelphia') {
      for (const wk of sundays) {
        const lift = wk >= sp.starts_on ? 1.6 : 1;
        batches.push({ tenant_id: tenant.tenant_id, receivedAt: `${addDays(wk, 1)}T15:00:00.000Z`, batch: {
          import_id: uuidFrom(rand), method: 'booking_system_export', source_label: 'Booking system export (synthetic)', confidence: 'medium',
          rows: [
            { conversion_date: wk, conversion_type: 'assessment_start', location_id: null, attribution_basis: 'utm_matched_in_sponsor_system', count: poisson(rand, 2.2 * lift) },
            { conversion_date: wk, conversion_type: 'enrollment', location_id: null, attribution_basis: 'utm_matched_in_sponsor_system', count: poisson(rand, 0.9 * lift) },
          ] } });
      }
    } else if (tenant.tenant_key === 'jersey-shore') {
      for (const wk of sundays.filter((d) => d >= sp.starts_on)) {
        batches.push({ tenant_id: tenant.tenant_id, receivedAt: `${addDays(wk, 2)}T22:00:00.000Z`, batch: {
          import_id: uuidFrom(rand), method: 'manual_entry', source_label: 'Owner weekly tally (synthetic)', confidence: 'low',
          rows: [
            { conversion_date: wk, conversion_type: 'call', location_id: null, attribution_basis: 'self_reported_wwk_mention', count: poisson(rand, 3.1) },
            { conversion_date: wk, conversion_type: 'qualified_lead', location_id: null, attribution_basis: 'self_reported_wwk_mention', count: poisson(rand, 2.4) },
            { conversion_date: wk, conversion_type: 'enrollment', location_id: null, attribution_basis: 'self_reported_wwk_mention', count: poisson(rand, 1.1) },
          ] } });
      }
      // A correction for the first sponsored week: must supersede, never add.
      const first = batches.find((b) => b.tenant_id === tenant.tenant_id);
      batches.push({ tenant_id: tenant.tenant_id, receivedAt: `${addDays(first.batch.rows[0].conversion_date, 9)}T22:00:00.000Z`, correction: true, batch: {
        ...first.batch, import_id: uuidFrom(rand), rows: first.batch.rows.map((r) => (r.conversion_type === 'qualified_lead' ? { ...r, count: r.count + 1 } : r)) } });
      // A replay of an earlier import: must be a no-op.
      batches.push({ tenant_id: tenant.tenant_id, receivedAt: first.receivedAt, replay: true, batch: first.batch });
    }
  }
  return batches;
}

/** Expected reported totals after supersede/replay semantics. */
export function expectedConversionTotals(batches) {
  const latest = new Map();
  const seen = new Set();
  for (const b of [...batches].sort((a, c) => (a.receivedAt < c.receivedAt ? -1 : a.receivedAt > c.receivedAt ? 1 : 0))) {
    if (seen.has(b.batch.import_id)) continue;
    seen.add(b.batch.import_id);
    for (const r of b.batch.rows) latest.set([b.tenant_id, r.conversion_date, r.conversion_type, r.location_id ?? '_none', r.attribution_basis, b.batch.method].join('|'), { tenant_id: b.tenant_id, type: r.conversion_type, count: r.count });
  }
  const out = {};
  for (const v of latest.values()) { out[v.tenant_id] ||= {}; out[v.tenant_id][v.type] = (out[v.tenant_id][v.type] || 0) + v.count; }
  return out;
}
