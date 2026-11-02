// Manhattan expansion of the live pilot (owner-approved 2026-11-02): a separate no-fee
// sponsor tenant with seven verified venues, two independently attributed sponsored cards
// (NY directory page and, from the 2026-11-02 territory SEO work, the Manhattan guide),
// no ordinary-listing control and no sponsor portal user. The WWK administrator role must
// expose it automatically; nobody else may read it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pilotManifest, MANHATTAN_TENANT_ID, MANHATTAN_LOCATION_IDS, PILOT_START, PILOT_END } from '../scripts/build-pilot-seed.mjs';
import { loadManifestD1, ADMIN_USER_ID } from '../scripts/lib/seed-pipeline.mjs';
import { loadRegistry } from '../src/shared/registry.mjs';
import { ingestDeliveries } from '../src/shared/ingest.mjs';
import { membershipsFor, scopeForUser, TenantScope } from '../src/shared/scope.mjs';
import { handlePortal } from '../src/portal/worker.mjs';
import { freshD1, loadManifest, IDENTITIES, independentSubject, TEST_HMAC_KEY, accessCtx, portalEnv } from './support.mjs';

const MAN = MANHATTAN_TENANT_ID; const JS = 'ten_9d294d23e0e9841e'; const NWP = 'ten_b234a48144f47f06';
const SCH = 'sch_86917fa1e77abc43'; const CMP = 'cmp_c7fea2983961d658'; const PLC = 'plc_10e8497ef216c69d';
const PAGE = '/swim-lessons/directory/new-york.html';
const PLC_GUIDE = 'plc_e487fb00e271338e'; const GUIDE = '/swim-lessons/manhattan-ny.html';
const EAST_VILLAGE = 'loc_f5b267a33189a894';
const DWIGHT = { loc: 'loc_62b36f46fcdb5e47', dst: 'dst_67fabacbc6c1fbfe' };
const TERRITORY_DST = 'dst_941c2435cc290c12';
const AS_OF = '2026-11-21T14:00:00.000Z';

async function pilotDb() {
  const db = freshD1();
  await loadManifestD1(db, pilotManifest(loadManifest()), { at: '2026-11-02T05:00:00.000Z', actor: 'pilot-release' });
  await db.prepare('UPDATE users SET auth_subject = ? WHERE user_id = ?').bind(independentSubject(TEST_HMAC_KEY, IDENTITIES.admin), ADMIN_USER_ID).run();
  return db;
}

const ev = (type, day, extra = {}) => ({ v: 1, event_id: randomUUID(), type, occurred_at: `${day}T15:00:00.000Z`, site_host: 'www.waterwisekids.com', page_path: PAGE,
  tenant_id: MAN, school_id: SCH, campaign_id: CMP, placement_id: PLC, page_view_id: extra.pv || randomUUID(), referrer_category: 'search', device_class: 'desktop', ...extra, pv: undefined });
const deliver = (payloads) => payloads.map((payload) => ({ receivedAtMs: Date.parse(payload.occurred_at) + 1000, payload: JSON.parse(JSON.stringify(payload)) }));

test('pilot seed: Manhattan is its own tenant with exactly the seven verified venues, two cards and no people', () => {
  const p = pilotManifest(loadManifest());
  assert.deepEqual(p.tenants.map((t) => t.tenant_id).sort(), [MAN, JS, NWP].sort());
  const locs = p.locations.filter((l) => l.tenant_id === MAN);
  assert.deepEqual(locs.map((l) => l.location_id).sort(), [...MANHATTAN_LOCATION_IDS].sort());
  assert.ok(locs.every((l) => l.status === 'eligible_fixture' && l.address_display), 'every Manhattan location is approved and has an address');
  assert.deepEqual(locs.map((l) => l.display_name).sort(), ['BMCC (Borough of Manhattan Community College)', 'John Jay College', 'Liberty Terrace', "St. Bart's Church", 'The Continental', 'Upper East Side - Dwight School', 'Wall Street']);
  assert.doesNotMatch(JSON.stringify(p), new RegExp(`${EAST_VILLAGE}|East Village|east-village`), 'East Village stays held');
  const campaigns = p.campaigns.filter((c) => c.tenant_id === MAN);
  assert.deepEqual(campaigns.map((c) => [c.campaign_id, c.kind, c.price_cents, c.disclosure_label, c.starts_on, c.ends_on]), [[CMP, 'sponsored_pilot', 0, 'Sponsored pilot', PILOT_START, PILOT_END]]);
  assert.equal(p.campaigns.some((c) => c.kind === 'organic_baseline'), false, 'no ordinary-listing control campaign for any tenant in the seed');
  const placements = p.placements.filter((x) => x.tenant_id === MAN);
  assert.deepEqual(placements.map((x) => [x.placement_id, x.kind, x.featured_location_id, x.link_rel]).sort(), [[PLC, 'sponsored_card', null, 'sponsored noopener'], [PLC_GUIDE, 'sponsored_card', null, 'sponsored noopener']].sort());
  assert.deepEqual(p.placement_pages.filter((x) => x.tenant_id === MAN).map((x) => [x.placement_id, x.page_path]).sort(), [[PLC, PAGE], [PLC_GUIDE, GUIDE]].sort(), 'one page per placement; never shared');
  for (const plc of [PLC, PLC_GUIDE]) assert.equal(p.placement_destinations.filter((x) => x.placement_id === plc).length, 8, 'seven venues + territory');
  assert.equal(p.users.length, 0); assert.equal(p.memberships.length, 0);
  assert.equal(p.placements.length, 9); assert.equal(p.locations.length, 11);
});

test('administrator role exposes Manhattan automatically; no membership, user or invite exists for it', async () => {
  const db = await pilotDb();
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM tenant_memberships').first()).n, 0);
  assert.deepEqual((await db.prepare('SELECT user_id FROM users').all()).results.map((r) => r.user_id), [ADMIN_USER_ID], 'the administrator is the only user');
  const m = await membershipsFor(db, ADMIN_USER_ID);
  assert.deepEqual(m.map((x) => x.display_name), ['British Swim School of Jersey Shore', 'British Swim School of Manhattan', 'British Swim School of Northwest Philadelphia']);
  assert.ok(m.every((x) => x.role === 'admin'));
  assert.ok(await scopeForUser(db, ADMIN_USER_ID, MAN));
  // Anyone else (a non-admin user id, or an unknown one) gets nothing.
  await db.prepare("INSERT INTO users (user_id, display_label, auth_subject, is_demo) VALUES ('usr_0000000000000001', 'Not provisioned', NULL, 0)").run();
  assert.equal(await scopeForUser(db, 'usr_0000000000000001', MAN), null);
  assert.deepEqual(await membershipsFor(db, 'usr_0000000000000001'), []);
  db.close();
});

test('collector: Manhattan card events count only for the seven venues on the NY directory page', async () => {
  const db = await pilotDb();
  const reg = await loadRegistry(db);
  const pv = randomUUID();
  const ok = await ingestDeliveries(db, reg, deliver([
    ev('eligible_view', '2026-11-03', { pv }), ev('viewable_impression', '2026-11-03', { pv, viewability: { visible_ratio: 0.8, visible_ms: 1500 } }),
    ev('sponsored_click', '2026-11-03', { pv }), ev('outbound_click', '2026-11-03', { pv, destination_id: DWIGHT.dst, location_id: DWIGHT.loc }),
    ev('outbound_click', '2026-11-03', { destination_id: TERRITORY_DST })]), { computedAt: AS_OF });
  assert.equal(ok.accepted, 5, JSON.stringify(ok.reasons));
  const bad = await ingestDeliveries(db, reg, deliver([
    ev('eligible_view', '2026-11-03', { location_id: EAST_VILLAGE }), // held venue
    ev('eligible_view', '2026-11-03', { page_path: '/swim-lessons/howell-nj.html' }), // card not placed there
    ev('eligible_view', '2026-11-03', { location_id: 'loc_3c6664af3a15b390' }), // Jersey Shore venue
    ev('eligible_view', '2026-10-30'), // before the campaign window
  ]), { computedAt: AS_OF });
  assert.equal(bad.accepted, 0); assert.equal(bad.rejected, 4, JSON.stringify(bad.reasons));
  assert.ok(Object.keys(bad.reasons).includes('outside_campaign_window'));
  // Isolation: Manhattan traffic is invisible to the other tenants.
  const man = await new TenantScope(db, MAN, 't').totals('2026-11-02', '2026-11-20');
  assert.equal(man.sponsored_card.eligible_view, 1); assert.equal(man.sponsored_card.outbound_click, 2);
  for (const other of [JS, NWP]) assert.equal((await new TenantScope(db, other, 't').totals('2026-11-02', '2026-11-20')).sponsored_card.eligible_view ?? 0, 0);
  db.close();
});

test('pilot dashboard (administrator): Manhattan renders with the no-control limitation and no comparison figures', async () => {
  const db = await pilotDb();
  const reg = await loadRegistry(db);
  await ingestDeliveries(db, reg, deliver([ev('eligible_view', '2026-11-03')]), { computedAt: AS_OF });
  const e = portalEnv(db, { PORTAL_ENV: 'pilot' }); delete e.REPORT_AS_OF;
  const get = async (path, who = IDENTITIES.admin) => {
    const res = await handlePortal(new Request(`https://portal.wwk-staging.invalid${path}`), e, accessCtx(who), { log() {}, now: () => Date.parse(AS_OF) });
    return { status: res.status, body: await res.text() };
  };
  const { status, body } = await get(`/t/${MAN}/?from=2026-11-02&to=2026-11-20`);
  assert.equal(status, 200);
  assert.match(body, /British Swim School of Manhattan/);
  assert.match(body, /Your ordinary directory listing is not measured yet\./);
  assert.doesNotMatch(body, /Ordinary directory listing<\/th>|data-pilot-paired-locations|lift of|Baseline \(ordinary listing only\)/);
  assert.doesNotMatch(body, /East Village|synthetic|fixture data/i);
  // The administrator's account switcher lists all three sponsor accounts.
  for (const tid of [MAN, JS, NWP]) assert.match(body, new RegExp(`href="/t/${tid}/"`));
  // A signed-in identity with no provisioned user gets no Manhattan data.
  const stranger = await get(`/t/${MAN}/?from=2026-11-02&to=2026-11-20`, IDENTITIES.stranger);
  assert.notEqual(stranger.status, 200);
  assert.doesNotMatch(stranger.body, /British Swim School of Manhattan/);
  db.close();
});

test('collector + portal: the NY directory card and the Manhattan guide card are attributed independently', async () => {
  const db = await pilotDb();
  const reg = await loadRegistry(db);
  const g = (type, day, extra = {}) => ev(type, day, { page_path: GUIDE, placement_id: PLC_GUIDE, ...extra });
  const pv1 = randomUUID(); const pv2 = randomUUID();
  const ok = await ingestDeliveries(db, reg, deliver([
    ev('eligible_view', '2026-11-03', { pv: pv1 }), ev('sponsored_click', '2026-11-03', { pv: pv1 }),
    g('eligible_view', '2026-11-03', { pv: pv2 }), g('eligible_view', '2026-11-04'), g('sponsored_click', '2026-11-03', { pv: pv2 }),
    g('outbound_click', '2026-11-03', { pv: pv2, destination_id: DWIGHT.dst, location_id: DWIGHT.loc })]), { computedAt: AS_OF });
  assert.equal(ok.accepted, 6, JSON.stringify(ok.reasons));
  // Each placement is valid only on its own page: no cross-page reuse of either ID.
  const bad = await ingestDeliveries(db, reg, deliver([
    ev('eligible_view', '2026-11-03', { page_path: GUIDE }), // statewide placement on the guide
    g('eligible_view', '2026-11-03', { page_path: PAGE }), // guide placement on the directory
    g('eligible_view', '2026-11-03', { location_id: EAST_VILLAGE }), // held venue
  ]), { computedAt: AS_OF });
  assert.equal(bad.accepted, 0); assert.equal(bad.rejected, 3, JSON.stringify(bad.reasons));
  const rows = await new TenantScope(db, MAN, 't').byPlacement('2026-11-02', '2026-11-20');
  const by = Object.fromEntries(rows.map((r) => [`${r.placement_id}|${r.page_path}`, r]));
  assert.deepEqual(Object.keys(by).sort(), [`${PLC}|${PAGE}`, `${PLC_GUIDE}|${GUIDE}`].sort());
  assert.equal(by[`${PLC}|${PAGE}`].eligible_view, 1); assert.equal(by[`${PLC}|${PAGE}`].sponsored_click, 1);
  assert.equal(by[`${PLC_GUIDE}|${GUIDE}`].eligible_view, 2); assert.equal(by[`${PLC_GUIDE}|${GUIDE}`].sponsored_click, 1); assert.equal(by[`${PLC_GUIDE}|${GUIDE}`].outbound_click, 1);
  const totals = await new TenantScope(db, MAN, 't').totals('2026-11-02', '2026-11-20');
  assert.equal(totals.sponsored_card.eligible_view, 3, 'tenant totals are the sum of both placements');
  for (const other of [JS, NWP]) assert.equal((await new TenantScope(db, other, 't').byPlacement('2026-11-02', '2026-11-20')).some((r) => [PLC, PLC_GUIDE].includes(r.placement_id)), false);
  db.close();
});
