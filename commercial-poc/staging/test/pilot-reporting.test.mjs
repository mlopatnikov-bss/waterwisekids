// Live-pilot reporting (PORTAL_ENV = "pilot") end to end on a pilot-seeded D1:
// generated control SQL -> real collector ingest for sponsored AND ordinary placements
// -> generated aggregate import SQL -> rendered dashboard. Staging/local rendering is
// covered (unchanged, byte-for-byte) by portal-output.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pilotManifest } from '../scripts/build-pilot-seed.mjs';
import { loadManifestD1, ADMIN_USER_ID } from '../scripts/lib/seed-pipeline.mjs';
import { loadRegistry } from '../src/shared/registry.mjs';
import { ingestDeliveries } from '../src/shared/ingest.mjs';
import { handlePortal } from '../src/portal/worker.mjs';
import { pilotPlan, selectHeadlineBasis } from '../src/portal/pilot-report.mjs';
import { TenantScope } from '../src/shared/scope.mjs';
import { freshD1, loadManifest, POC_ROOT, IDENTITIES, independentSubject, TEST_HMAC_KEY, accessCtx, portalEnv } from './support.mjs';
import { createRepo } from '../../onboarding/src/repo.mjs';
import { buildControlArtifacts } from '../../onboarding/src/controls.mjs';
import { planImport, importSql } from '../../onboarding/src/conversion-import.mjs';

const ONB = join(POC_ROOT, 'onboarding');
const readJson = (p) => JSON.parse(readFileSync(join(ONB, p), 'utf8'));
const DEF = readJson('definitions/bss-pilot-2026.sponsor.json');
const PLAN = readJson('definitions/bss-pilot-2026.controls.json');
const NWP = 'ten_b234a48144f47f06'; const JS = 'ten_9d294d23e0e9841e';
const AS_OF = '2026-11-21T14:00:00.000Z';
let repo = null;
const repoOnce = () => (repo ??= createRepo());

async function pilotDb({ controls = true, imports = true } = {}) {
  const db = freshD1();
  await loadManifestD1(db, pilotManifest(loadManifest()), { at: '2026-11-02T05:00:00.000Z', actor: 'pilot-release' });
  await db.prepare('UPDATE users SET auth_subject = ? WHERE user_id = ?').bind(independentSubject(TEST_HMAC_KEY, IDENTITIES.admin), ADMIN_USER_ID).run();
  if (controls) {
    const c = buildControlArtifacts(PLAN, DEF, { repo: repoOnce() });
    assert.equal(c.ok, true, JSON.stringify(c.errors));
    db.db.exec(c.files['control/d1-control-upsert.sql']);
  }
  return db;
}

function ev(type, p, day, extra = {}) {
  return { v: 1, event_id: randomUUID(), type, occurred_at: `${day}T15:00:00.000Z`, site_host: 'www.waterwisekids.com', page_path: p.page_path,
    tenant_id: p.tenant_id, school_id: p.school_id, campaign_id: p.campaign_id, placement_id: p.placement_id, page_view_id: p.pv,
    referrer_category: 'search', device_class: 'desktop', ...(p.location_id ? { location_id: p.location_id } : {}), ...extra };
}

const SCH_JS = 'sch_5b7e6d81d52e8ed5'; const SCH_NWP = 'sch_ca091723c9670adc';
const P = {
  // Location-paired (Howell): featured sponsored card + ordinary directory listing.
  howellCard: { tenant_id: JS, school_id: SCH_JS, campaign_id: 'cmp_88f0a7279a2972e2', placement_id: 'plc_bb4b763cf97d56ee', location_id: 'loc_3c6664af3a15b390', page_path: '/swim-lessons/howell-nj.html', dst: 'dst_cd581fee5ef6a610', sponsored: true },
  howellListing: { tenant_id: JS, school_id: SCH_JS, campaign_id: 'cmp_91a15f49d66bdeef', placement_id: 'plc_d6a6673732411e04', location_id: 'loc_3c6664af3a15b390', page_path: '/swim-lessons/directory/new-jersey.html', dst: 'dst_cd581fee5ef6a610', sponsored: false },
  // Broad: regional Jersey Shore card, featured_location_id NULL. Must never enter the comparison.
  regionalCard: { tenant_id: JS, school_id: SCH_JS, campaign_id: 'cmp_88f0a7279a2972e2', placement_id: 'plc_3febe5cc1afd2bd6', location_id: null, page_path: '/swim-lessons/jersey-shore.html', dst: 'dst_b6938518f71f3efe', sponsored: true },
  // Other tenant (Cheltenham), paired, for isolation.
  chelCard: { tenant_id: NWP, school_id: SCH_NWP, campaign_id: 'cmp_e4ca517dbb784119', placement_id: 'plc_759c890d4a301219', location_id: 'loc_d3c46e7d6efc62f7', page_path: '/swim-lessons/cheltenham-pa.html', dst: 'dst_14bd700cb26d66c4', sponsored: true },
  chelListing: { tenant_id: NWP, school_id: SCH_NWP, campaign_id: 'cmp_8f06c46a4a1e41f2', placement_id: 'plc_b9c9377c3e32a761', location_id: 'loc_d3c46e7d6efc62f7', page_path: '/swim-lessons/directory/pennsylvania.html', dst: 'dst_14bd700cb26d66c4', sponsored: false },
};

/** Paired Howell traffic of identical shape on both sides (Nov 2-4), plus broad regional and other-tenant traffic. */
async function ingestTraffic(db) {
  const reg = await loadRegistry(db);
  const deliveries = [];
  const view = (p, day, click) => {
    const x = { ...p, pv: randomUUID() };
    delete x.dst; delete x.sponsored;
    deliveries.push(ev('eligible_view', x, day), ev('viewable_impression', x, day, { viewability: { visible_ratio: 0.8, visible_ms: 1500 } }));
    if (click) {
      if (p.sponsored) deliveries.push(ev('sponsored_click', x, day));
      deliveries.push(ev('outbound_click', x, day, { destination_id: p.dst }));
    }
  };
  for (const day of ['2026-11-02', '2026-11-03', '2026-11-04']) {
    for (const p of [P.howellCard, P.howellListing]) { view(p, day, true); view(p, day, false); }
    for (let k = 0; k < 5; k += 1) view(P.regionalCard, day, true);
    view(P.chelCard, day, true); view(P.chelListing, day, true);
  }
  const out = await ingestDeliveries(db, reg, deliveries.map((payload) => ({ receivedAtMs: Date.parse(payload.occurred_at) + 1000, payload })), { computedAt: AS_OF });
  const early = { ...P.howellListing, pv: randomUUID() }; delete early.dst; delete early.sponsored;
  const beforeStart = await ingestDeliveries(db, reg, [{ receivedAtMs: Date.parse('2026-11-01T15:00:01Z'), payload: ev('eligible_view', early, '2026-11-01') }], { computedAt: AS_OF });
  return { out, beforeStart };
}

async function dashboard(db, tid, q = '?from=2026-11-02&to=2026-11-20', env = {}) {
  // Pilot mode refuses REPORT_AS_OF (local-only); the report clock is injected instead.
  const e = portalEnv(db, { PORTAL_ENV: 'pilot', ...env }); delete e.REPORT_AS_OF;
  const res = await handlePortal(new Request(`https://portal.wwk-staging.invalid/t/${tid}/${q}`), e, accessCtx(IDENTITIES.admin), { log() {}, now: () => Date.parse(AS_OF) });
  return { status: res.status, body: await res.text() };
}

test('collector accepts ordinary-listing events only inside the control window, and never a sponsored_click', async () => {
  const db = await pilotDb();
  const { out, beforeStart } = await ingestTraffic(db);
  assert.equal(out.rejected, 0, JSON.stringify(out.reasons));
  assert.equal(beforeStart.rejected, 1, 'ordinary listing before its control start (2026-11-02) is rejected');
  assert.ok(Object.keys(beforeStart.reasons).includes('outside_campaign_window'));
  const reg = await loadRegistry(db);
  const bad = await ingestDeliveries(db, reg, [{ receivedAtMs: Date.parse('2026-11-04T15:00:01Z'), payload: ev('sponsored_click', { tenant_id: JS, school_id: 'sch_5b7e6d81d52e8ed5', campaign_id: 'cmp_91a15f49d66bdeef', placement_id: 'plc_d6a6673732411e04', location_id: 'loc_3c6664af3a15b390', page_path: '/swim-lessons/directory/new-jersey.html', pv: randomUUID() }, '2026-11-04') }], { computedAt: AS_OF });
  assert.equal(bad.rejected, 1);
  assert.ok(Object.keys(bad.reasons).includes('sponsored_click_on_organic_listing'));
});

test('pilot dashboard: location-paired, same-days comparison; no invented baseline, no lift claim', async () => {
  const db = await pilotDb();
  await ingestTraffic(db);
  const { status, body } = await dashboard(db, JS);
  assert.equal(status, 200);
  assert.match(body, /Same locations and same days for both, Nov 2, 2026 – Nov 20, 2026/);
  // Paired Howell only: 6 eligible views, 6 viewable, 3 clicks to site on EACH side. The 15 regional-card views are excluded.
  const row = (label) => new RegExp(`<th scope="row">${label}</th><td class="num">6</td><td class="num">6</td><td class="num">3</td><td class="num">50.00%</td>`);
  assert.match(body, row('Sponsored card')); assert.match(body, row('Ordinary directory listing'));
  // The broad sponsored total above the comparison still includes the regional card (6 + 15 = 21).
  assert.match(body, /data-metric="eligible_view" data-value="21"/);
  assert.match(body, /data-pilot-paired-locations="loc_b5b7d777c4bea81a loc_3c6664af3a15b390 loc_096d7703f7c65cd6"/);
  assert.match(body, /Regional sponsored cards that list several locations are excluded from this comparison/);
  assert.doesNotMatch(body, /Baseline \(ordinary listing only\)|Change in clicks to site per day|before vs during/);
  assert.match(body, /Side by side, not a controlled test\./);
  assert.match(body, /no lift is claimed/);
  assert.doesNotMatch(body, /synthetic|fixture data/i);
});

test('paired comparison query excludes null-location sponsored cards and stays inside the tenant', async () => {
  const db = await pilotDb();
  await ingestTraffic(db);
  const js = new TenantScope(db, JS, 'test'); const nwp = new TenantScope(db, NWP, 'test');
  const broad = await js.totals('2026-11-02', '2026-11-04');
  const paired = await js.pairedComparisonTotals('2026-11-02', '2026-11-04');
  assert.equal(broad.sponsored_card.eligible_view, 21, 'broad totals include the regional card');
  assert.deepEqual(paired.sponsored_card, { eligible_view: 6, viewable_impression: 6, sponsored_click: 3, outbound_click: 3 });
  assert.deepEqual(paired.organic_listing, { eligible_view: 6, viewable_impression: 6, outbound_click: 3 });
  // Same-day window is respected.
  assert.deepEqual(await js.pairedComparisonTotals('2026-11-05', '2026-11-20'), { sponsored_card: {}, organic_listing: {} });
  // Isolation: Cheltenham traffic never reaches Jersey Shore, and vice versa.
  assert.deepEqual(await nwp.pairedComparisonTotals('2026-11-02', '2026-11-04'), {
    sponsored_card: { eligible_view: 3, viewable_impression: 3, sponsored_click: 3, outbound_click: 3 }, organic_listing: { eligible_view: 3, viewable_impression: 3, outbound_click: 3 } });
  assert.deepEqual((await nwp.pairedLocations()).map((l) => l.display_name), ['LA Fitness - Cheltenham']);
  assert.deepEqual((await js.pairedLocations()).map((l) => l.display_name), ['LA Fitness - Brick', 'LA Fitness - Howell', 'LA Fitness - Toms River']);
  // Without controls there is nothing to pair, even though sponsored traffic exists.
  const bare = await pilotDb({ controls: false });
  assert.deepEqual(await new TenantScope(bare, JS, 'test').pairedLocations(), []);
});

test('pilot dashboard without controls says the ordinary listing is not measured', async () => {
  const db = await pilotDb({ controls: false });
  const reg = await loadRegistry(db);
  await ingestDeliveries(db, reg, [{ receivedAtMs: Date.parse('2026-11-03T15:00:01Z'), payload: ev('eligible_view', { tenant_id: JS, school_id: 'sch_5b7e6d81d52e8ed5', campaign_id: 'cmp_88f0a7279a2972e2', placement_id: 'plc_bb4b763cf97d56ee', location_id: 'loc_3c6664af3a15b390', page_path: '/swim-lessons/howell-nj.html', pv: randomUUID() }, '2026-11-03') }], { computedAt: AS_OF });
  const { body } = await dashboard(db, JS);
  assert.match(body, /Your ordinary directory listing is not measured yet\./);
  assert.doesNotMatch(body, /Ordinary directory listing<\/th>/);
});

test('headline leads/enrollments use one WWK-linked basis; all-source totals are context only', async () => {
  const db = await pilotDb();
  await ingestTraffic(db);
  const plan = planImport(DEF, readJson('examples/aggregate-conversions.example.json'), readJson('examples/location-map.example.json'));
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
  db.db.exec(importSql(plan));
  const { body } = await dashboard(db, JS);
  // Example file: WWK-mention enrollments 0 + 1 = 1; all-source enrollments 3 + 4 = 7. The headline must be 1, never 8.
  assert.match(body, /data-metric="reported_enrollments" data-value="1"/);
  assert.match(body, /data-metric="reported_leads" data-value="2"/);
  assert.match(body, /data-pilot-headline-basis="self_reported_wwk_mention"/);
  assert.match(body, /<h2 id="ab-h">Attribution basis<\/h2>/);
  assert.match(body, /All sources \(not WWK-specific; context only\)<\/th><td class="num">—<\/td><td class="num">—<\/td><td class="num">—<\/td><td class="num">7<\/td>/);
  assert.match(body, /Rows are never added together/);
  // Tenant isolation: the Jersey Shore import never shows on Northwest Philadelphia.
  const nwp = await dashboard(db, NWP);
  // (No NWP traffic in this test, so its dashboard uses the empty-range layout without headline figures.)
  assert.doesNotMatch(nwp.body, /Jackrabbit week totals/);
  assert.match(nwp.body, /No school-reported totals for this range yet\./);
});

test('only all-source totals: headline says not reported instead of counting them', async () => {
  const db = await pilotDb();
  await ingestTraffic(db);
  const exp = readJson('examples/aggregate-conversions.example.json');
  exp.rows = exp.rows.filter((r) => r.attribution_basis === 'self_reported_any_source');
  exp.basis_definitions = { self_reported_any_source: exp.basis_definitions.self_reported_any_source };
  const plan = planImport(DEF, exp, readJson('examples/location-map.example.json'));
  db.db.exec(importSql(plan));
  const { body } = await dashboard(db, JS);
  assert.match(body, /data-metric="reported_enrollments" data-value="Not reported"/);
  assert.match(body, /No WWK-linked enrollments reported\./);
  assert.match(body, /data-pilot-headline-basis="none"/);
});

test('pilotPlan: a genuine pre-period baseline is kept, a same-day or later control never is', () => {
  const sp = { kind: 'sponsored_pilot', starts_on: '2026-11-02', ends_on: '2026-12-31' };
  const cmp = { baseline: { days: 5 }, sponsored: { days: 5 } };
  assert.equal(pilotPlan({ campaigns: [sp, { kind: 'organic_baseline', starts_on: '2026-11-03', ends_on: '2026-12-31' }], from: '2026-11-01', to: '2026-11-30', comparison: cmp, byBasis: {} }).comparison, null);
  assert.equal(pilotPlan({ campaigns: [sp, { kind: 'organic_baseline', starts_on: '2026-10-01', ends_on: '2026-12-31' }], from: '2026-11-01', to: '2026-11-30', comparison: { baseline: { days: 0 } }, byBasis: {} }).comparison, null);
  assert.equal(pilotPlan({ campaigns: [sp, { kind: 'organic_baseline', starts_on: '2026-10-01', ends_on: '2026-12-31' }], from: '2026-11-01', to: '2026-11-30', comparison: cmp, byBasis: {} }).comparison, cmp);
  const p = pilotPlan({ campaigns: [sp, { kind: 'organic_baseline', starts_on: '2026-11-10', ends_on: '2026-12-31' }], from: '2026-11-01', to: '2026-11-30', comparison: null,
    byBasis: { utm_matched_in_sponsor_system: { enrollment: 1 }, self_reported_wwk_mention: { enrollment: 3 }, self_reported_any_source: { enrollment: 9 } } });
  assert.deepEqual(p.overlap, { from: '2026-11-10', to: '2026-11-30' });
  assert.equal(p.headlineBasis, 'utm_matched_in_sponsor_system');
  assert.deepEqual(p.headlineConv, { enrollment: 1, qualified_lead: 0 });
});

// ---- Headline basis selection with explicit zero rows (conversion-feed emits zeros for both bases) ----
const UTM = 'utm_matched_in_sponsor_system'; const SELF = 'self_reported_wwk_mention'; const ALL = 'self_reported_any_source';
const zeros = () => ({ qualified_lead: 0, enrollment: 0 });

test('headline basis (1): UTM with a positive total wins even when self-reported is also positive', () => {
  assert.equal(selectHeadlineBasis({ [UTM]: { qualified_lead: 1, enrollment: 0 }, [SELF]: { qualified_lead: 5, enrollment: 3 } }), UTM);
  assert.equal(selectHeadlineBasis({ [UTM]: { enrollment: 1 }, [SELF]: { enrollment: 9 } }), UTM);
});

test('headline basis (2): UTM explicit zero + self-reported positive falls back to self-reported', () => {
  assert.equal(selectHeadlineBasis({ [UTM]: zeros(), [SELF]: { qualified_lead: 0, enrollment: 2 } }), SELF);
  const p = pilotPlan({ campaigns: [], from: '2026-11-02', to: '2026-11-15', comparison: null, byBasis: { [UTM]: zeros(), [SELF]: { qualified_lead: 1, enrollment: 2 }, [ALL]: { enrollment: 7 } } });
  assert.equal(p.headlineBasis, SELF);
  assert.deepEqual(p.headlineConv, { qualified_lead: 1, enrollment: 2 });
  assert.equal(p.headlineZero, false);
});

test('headline basis (3): both WWK bases explicit zero chooses UTM and shows 0, not Not reported', () => {
  for (const byBasis of [{ [UTM]: zeros(), [SELF]: zeros() }, { [SELF]: zeros() }, { [UTM]: zeros(), [ALL]: { enrollment: 4 } }]) {
    assert.equal(selectHeadlineBasis(byBasis), UTM);
    const p = pilotPlan({ campaigns: [], from: '2026-11-02', to: '2026-11-15', comparison: null, byBasis });
    assert.deepEqual(p.headlineConv, { ...(byBasis[UTM] || {}), qualified_lead: 0, enrollment: 0 });
    assert.equal(p.headlineZero, true);
  }
});

test('headline basis (4) neither basis -> null; (5) all-source only -> null', () => {
  assert.equal(selectHeadlineBasis({}), null);
  assert.equal(selectHeadlineBasis(undefined), null);
  assert.equal(selectHeadlineBasis({ [ALL]: { qualified_lead: 3, enrollment: 7 } }), null);
  assert.deepEqual(pilotPlan({ campaigns: [], from: '2026-11-02', to: '2026-11-15', comparison: null, byBasis: { [ALL]: { enrollment: 7 } } }).headlineConv, {});
});

test('only qualified_lead and enrollment decide: assessment_start-only or call-only rows never change the basis', () => {
  // Baselines without the extra rows, then the same with assessment_start / call added: selection is identical.
  const cases = [
    [{ [UTM]: zeros(), [SELF]: { qualified_lead: 0, enrollment: 1 } }, SELF],
    [{ [UTM]: { qualified_lead: 1, enrollment: 0 }, [SELF]: zeros() }, UTM],
    [{ [UTM]: zeros(), [SELF]: zeros() }, UTM],
    [{}, null],
  ];
  for (const [base, expected] of cases) {
    assert.equal(selectHeadlineBasis(base), expected);
    for (const extra of [{ assessment_start: 9 }, { call: 9 }, { assessment_start: 9, call: 9 }]) for (const b of [UTM, SELF]) {
      const withExtra = { ...base, [b]: { ...(base[b] || {}), ...extra } };
      const got = selectHeadlineBasis(withExtra);
      // A basis that gains only assessment_start/call rows is still "absent" for selection, except via existing rows.
      assert.equal(got, expected, `${JSON.stringify(withExtra)}`);
    }
  }
  // Explicit: positive assessment starts / calls under self-reported cannot beat a zero UTM headline.
  assert.equal(selectHeadlineBasis({ [UTM]: zeros(), [SELF]: { ...zeros(), assessment_start: 5, call: 3 } }), UTM);
  // Explicit: assessment_start-only or call-only rows make no basis present at all.
  assert.equal(selectHeadlineBasis({ [SELF]: { assessment_start: 3 } }), null);
  assert.equal(selectHeadlineBasis({ [UTM]: { call: 2 } }), null);
  // Display still includes the chosen basis's assessment starts in "Reported leads".
  const p = pilotPlan({ campaigns: [], from: '2026-11-02', to: '2026-11-15', comparison: null, byBasis: { [SELF]: { assessment_start: 2, enrollment: 1 } } });
  assert.equal(p.headlineBasis, SELF);
  assert.deepEqual(p.headlineConv, { assessment_start: 2, enrollment: 1, qualified_lead: 0 });
  assert.equal(p.headlineZero, false);
});

/** A feed-style export: explicit zero rows for both bases, with optional positive cells. */
function feedExport(cells) {
  const ex = readJson('examples/aggregate-conversions.example.json');
  ex.extraction = 'bss_messenger_instant';
  ex.basis_definitions = { [UTM]: 'EXAMPLE: sponsored UTM on booking-page lead', [SELF]: 'EXAMPLE: heard WaterWiseKids, no sponsored UTM' };
  ex.rows = [];
  for (const date of ['2026-11-08', '2026-11-15']) for (const ref of ['EXAMPLE-HOW', 'EXAMPLE-BRK', 'EXAMPLE-TR']) for (const type of ['qualified_lead', 'enrollment']) for (const basis of [UTM, SELF]) {
    ex.rows.push({ date, location_ref: ref, conversion_type: type, attribution_basis: basis, count: cells[`${date}|${ref}|${type}|${basis}`] || 0 });
  }
  return ex;
}

test('dashboard: UTM explicit zeros + self-reported positive headline is self-reported, not a hidden 0', async () => {
  const db = await pilotDb();
  await ingestTraffic(db);
  const plan = planImport(DEF, feedExport({ [`2026-11-15|EXAMPLE-HOW|enrollment|${SELF}`]: 2, [`2026-11-08|EXAMPLE-BRK|qualified_lead|${SELF}`]: 3 }), readJson('examples/location-map.example.json'));
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
  db.db.exec(importSql(plan));
  const { body } = await dashboard(db, JS);
  assert.match(body, /data-pilot-headline-basis="self_reported_wwk_mention"/);
  assert.match(body, /data-metric="reported_enrollments" data-value="2"/);
  assert.match(body, /data-metric="reported_leads" data-value="3"/);
});

test('dashboard: both bases explicit zero shows 0 with the zero note, not Not reported', async () => {
  const db = await pilotDb();
  await ingestTraffic(db);
  const plan = planImport(DEF, feedExport({}), readJson('examples/location-map.example.json'));
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
  db.db.exec(importSql(plan));
  const { body } = await dashboard(db, JS);
  assert.match(body, /data-pilot-headline-basis="utm_matched_in_sponsor_system" data-pilot-headline-zero="true"/);
  assert.match(body, /data-metric="reported_enrollments" data-value="0"/);
  assert.match(body, /data-metric="reported_leads" data-value="0"/);
  assert.doesNotMatch(body, /data-metric="reported_enrollments" data-value="Not reported"/);
});
