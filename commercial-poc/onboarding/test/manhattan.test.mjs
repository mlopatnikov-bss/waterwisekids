// Manhattan expansion (bss-manhattan-pilot-2026): a separate no-fee sponsor account with the
// seven venues verified on 2026-11-02, two independently attributed sponsored cards (the existing
// NY directory page and the editorial Manhattan guide added by the 2026-11-02 territory SEO work),
// no ordinary-listing control and no sponsor portal user.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { stableId } from '../../src/ids.mjs';
import { pilotManifest } from '../../staging/scripts/build-pilot-seed.mjs';
import { migratedD1 } from '../../staging/scripts/lib/d1-sqlite.mjs';
import { migrationFiles } from '../../staging/scripts/lib/migrations.mjs';
import { loadManifestD1 } from '../../staging/scripts/lib/seed-pipeline.mjs';
import { applyFilePatch, parseUnifiedDiff } from '../../proposal/src/udiff.mjs';
import { checkShape, MAX_PLACEMENT_LOCATIONS } from '../src/schema.mjs';
import { validateDefinition } from '../src/validate.mjs';
import { buildPacket, canonical } from '../src/packet.mjs';
import { findCardBlock, renderCardLines } from '../src/render.mjs';
import { validateControlPlan } from '../src/controls.mjs';
import { POC_ROOT } from '../src/repo.mjs';
import { clone, loadManhattan, loadManifest, loadPilot, realRepo, sliceFor, tenantIdsOf } from './support.mjs';

const PAGE_FILE = 'swim-lessons/directory/new-york.html';
const PRE_PATCH_SHA = 'f5785f02de1c24db19442bd9a4e956ca683758654cd42ab5c9fdf310dcf9cccc';
const MAN = 'ten_52bf92991a0305d0'; const PLC = 'plc_10e8497ef216c69d'; const CMP = 'cmp_c7fea2983961d658';
const GUIDE_FILE = 'swim-lessons/manhattan-ny.html'; const PLC_GUIDE = 'plc_e487fb00e271338e';
// The reviewed editorial guide without its card (includes the Nov. 3 local-checklist link).
const GUIDE_PRE_CARD_SHA = '336d30dd27ddcf1b63bb5fd862405cc7269cd9d25766fb3d28b39515994006c8';
const EAST_VILLAGE = /East Village|east-village|loc_f5b267a33189a894|710 E 11th|720 E 11th/;
const ENTITY_TABLES = ['tenants', 'schools', 'locations', 'campaigns', 'destinations', 'placements', 'placement_pages', 'placement_destinations'];
const sha = (s) => createHash('sha256').update(s).digest('hex');
const snapshot = JSON.parse(readFileSync(join(POC_ROOT, 'seed/sources/official-operator-snapshot-2026-11-02.json'), 'utf8'));
// Same context the CLI builds: the live manifest plus every other committed definition.
const ctxFor = (def) => ({ repo: realRepo(), existingManifest: loadManifest(), others: [loadPilot(), loadManhattan()].filter((o) => o.definition_key !== def.definition_key) });
let cached = null;
const packet = () => (cached ??= buildPacket(loadManhattan(), ctxFor(loadManhattan())));

test('definition: validates against the live pilot, with only the intended no-portal-owner warning', () => {
  const v = validateDefinition(loadManhattan(), ctxFor(loadManhattan()));
  assert.equal(v.ok, true, JSON.stringify(v.errors));
  assert.deepEqual(v.warnings.map((w) => w.code), ['no_owner']);
  const p = validateDefinition(loadPilot(), ctxFor(loadPilot()));
  assert.equal(p.ok, true, JSON.stringify(p.errors));
  assert.deepEqual(p.warnings, [], 'the existing pilot definition is unaffected');
});

test('definition: every venue, address and URL is the verified official-snapshot value; East Village is held', () => {
  const d = loadManhattan(); const t = d.tenants[0];
  const official = snapshot.territories.find((x) => x.territory_key === 'manhattan');
  assert.equal(t.school.territory_url, official.territory_url);
  assert.equal(t.display_name, official.school_name);
  const eligible = official.locations.filter((l) => l.listed_on_territory_page && !l.no_classes_notice && !l.address_conflict);
  assert.equal(eligible.length, 7);
  assert.deepEqual(t.locations.map((l) => [l.display_name, l.address_display, l.official_url]), eligible.map((l) => [l.venue, l.address, l.location_url]));
  const directory = readFileSync(join(POC_ROOT, '..', 'swim-lessons/directory/schools-data.js'), 'utf8');
  for (const l of t.locations) assert.ok(directory.includes(l.address_display), `${l.display_name} address is also in WWK directory data`);
  assert.doesNotMatch(JSON.stringify(d), EAST_VILLAGE);
  assert.deepEqual(t.placements.map((p) => [p.placement_id, p.page_path, p.variant, p.location_keys.length]), [[PLC, '/swim-lessons/directory/new-york.html', 'venue_list', 7], [PLC_GUIDE, '/swim-lessons/manhattan-ny.html', 'venue_list', 7]]);
  assert.equal(PLC_GUIDE, stableId('plc', `${t.school.territory_url}#man-guide-manhattan`), 'guide placement has its own stable ID; the statewide ID is not reused');
  assert.deepEqual([t.campaign.kind, t.campaign.price_cents, t.campaign.disclosure_label, t.campaign.campaign_id], ['sponsored_pilot', 0, 'Sponsored pilot', CMP]);
});

test('definition: IDs are the stable Phase 1 IDs already in the manifest for Manhattan', () => {
  const t = loadManhattan().tenants[0]; const m = loadManifest();
  assert.equal(t.tenant_id, MAN);
  assert.equal(t.school.school_id, m.schools.find((s) => s.tenant_id === MAN).school_id);
  assert.deepEqual(t.locations.map((l) => l.location_id).sort(), m.locations.filter((l) => l.tenant_id === MAN && l.status === 'eligible_fixture').map((l) => l.location_id).sort());
  assert.deepEqual(t.destinations.map((x) => x.destination_id).sort(), m.destinations.filter((x) => x.tenant_id === MAN).map((x) => x.destination_id).sort());
  assert.equal(m.placements.find((x) => x.slot_key === 'man-directory-new-york').placement_id, PLC);
  assert.equal(m.placements.find((x) => x.slot_key === 'man-guide-manhattan').placement_id, PLC_GUIDE);
  const cards = new Set(m.placements.filter((x) => x.tenant_id === MAN && x.kind === 'sponsored_card').map((x) => x.placement_id));
  assert.deepEqual(m.placement_pages.filter((x) => cards.has(x.placement_id)).map((x) => [x.placement_id, x.page_path]), [[PLC, '/swim-lessons/directory/new-york.html'], [PLC_GUIDE, '/swim-lessons/manhattan-ny.html']]);
});

test('privacy: no sponsor person exists anywhere (no user, invite, membership or contact value)', () => {
  const d = loadManhattan();
  assert.deepEqual(d.portal.users, []);
  const p = packet();
  assert.equal(p.ok, true, JSON.stringify(p.errors));
  assert.equal(p.summary.counts.portal_users, 0);
  assert.doesNotMatch(p.files['portal-memberships.sql'], /INSERT/);
  const all = [JSON.stringify(d), ...Object.values(p.files)].join('\n');
  assert.doesNotMatch(all, /[^\s@"]+@[^\s@"]+\.[a-z]{2,}/i, 'no email-shaped value');
  assert.doesNotMatch(all, /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/, 'no phone-shaped value');
  assert.doesNotMatch(all, /invite_ref"\s*:\s*"/);
});

test('cap: venue_list takes up to seven locations in schema and renderer; eight is refused by both', () => {
  assert.equal(MAX_PLACEMENT_LOCATIONS, 7);
  const d = loadManhattan();
  assert.deepEqual(checkShape(d), []);
  const t = d.tenants[0];
  assert.equal(renderCardLines(d, t, t.placements[0]).filter((l) => l.includes('data-wwk-location=')).length, 7);
  const eight = clone(d); eight.tenants[0].placements[0].location_keys.push('extra-venue');
  assert.ok(checkShape(eight).some((e) => e.code === 'too_many' && e.path.endsWith('location_keys')));
  assert.throws(() => renderCardLines(eight, eight.tenants[0], eight.tenants[0].placements[0]), /1 to 7 locations/);
});

test('public page: one labeled card, outside the directory list, with exactly the eight tagged official links', () => {
  const text = realRepo().read(PAGE_FILE);
  const lines = text.split('\n');
  assert.equal((text.match(/data-wwk-sponsored-card/g) || []).length, 1);
  assert.equal((text.match(/<!-- WWK sponsored placement /g) || []).length, 1);
  const b = findCardBlock(lines, PLC);
  const card = lines.slice(b.start, b.end).join('\n');
  assert.equal(`${card}\n`, packet().files['cards/man-directory-new-york.html'], 'page card is byte-identical to the rendered card');
  assert.match(card, /<p class="wwk-sponsored__label" id="wwk-sp-plc_10e8497ef216c69d-label">Sponsored pilot<\/p>/);
  assert.match(card, /No-fee pilot placement\. .*Sponsorship does not change directory order or editorial content\./);
  const anchors = [...card.matchAll(/<a href="([^"]+)" rel="([^"]+)"/g)];
  assert.equal(anchors.length, 8);
  for (const [, href, rel] of anchors) {
    assert.equal(rel, 'sponsored noopener');
    const u = new URL(href.replace(/&amp;/g, '&'));
    assert.equal(u.hostname, 'britishswimschool.com'); assert.ok(u.pathname.startsWith('/manhattan/'));
    assert.deepEqual([...u.searchParams.entries()], [['utm_source', 'waterwisekids'], ['utm_medium', 'sponsored_pilot'], ['utm_campaign', CMP], ['utm_content', PLC]]);
  }
  assert.doesNotMatch(card, EAST_VILLAGE);
  const cardAt = text.indexOf('<!-- WWK sponsored placement plc_10e8497ef216c69d');
  assert.ok(cardAt > text.indexOf('inclusion is not a ranking') && cardAt < text.indexOf('id="schoolsList"'), 'card sits after the disclaimer and before the directory list');
  assert.ok(cardAt > text.indexOf('<section class="dir-coverage" id="cities"') && cardAt < text.indexOf('</section>', text.indexOf('id="cities"')), 'inside section#cities');
});

test('public page: removing the card restores the previous page byte-for-byte (copy and directory order untouched)', () => {
  const text = realRepo().read(PAGE_FILE);
  const p = packet();
  const [plan] = JSON.parse(p.files['patch-plan.json']);
  assert.equal(plan.action, 'unchanged');
  assert.equal(plan.file_sha256_before, sha(text));
  const restored = applyFilePatch(text, parseUnifiedDiff(p.files['rollback/remove-man-directory-new-york.diff'])[0]);
  assert.equal(sha(restored), PRE_PATCH_SHA);
  const rows = (s) => [...s.matchAll(/<div class="school-card" id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(rows(text), rows(restored));
  assert.equal(rows(text).length, 39);
  // Only the two approved pages carry the Manhattan tenant; each carries only its own placement.
  assert.doesNotMatch(text, new RegExp(PLC_GUIDE), 'the directory never carries the guide placement');
  for (const f of realRepo().listHtml()) if (f !== PAGE_FILE && f !== GUIDE_FILE) assert.doesNotMatch(realRepo().read(f), /plc_10e8497ef216c69d|plc_e487fb00e271338e|ten_52bf92991a0305d0/, f);
});

test('guide page: one labeled card after the editorial venue table, byte-identical to the renderer, eight tagged links attributed to the guide placement', () => {
  const text = realRepo().read(GUIDE_FILE);
  const lines = text.split('\n');
  assert.equal((text.match(/data-wwk-sponsored-card/g) || []).length, 1);
  assert.doesNotMatch(text, new RegExp(PLC), 'the statewide placement ID is not reused on the guide');
  const b = findCardBlock(lines, PLC_GUIDE);
  const card = lines.slice(b.start, b.end).join('\n');
  assert.equal(`${card}\n`, packet().files['cards/man-guide-manhattan.html'], 'page card is byte-identical to the rendered card');
  assert.match(card, /<p class="wwk-sponsored__label" id="wwk-sp-plc_e487fb00e271338e-label">Sponsored pilot<\/p>/);
  assert.match(card, /data-wwk-placement="plc_e487fb00e271338e" data-wwk-page-path="\/swim-lessons\/manhattan-ny\.html"/);
  const anchors = [...card.matchAll(/<a href="([^"]+)" rel="([^"]+)"/g)];
  assert.equal(anchors.length, 8);
  for (const [, href, rel] of anchors) {
    assert.equal(rel, 'sponsored noopener');
    const u = new URL(href.replace(/&amp;/g, '&'));
    assert.equal(u.hostname, 'britishswimschool.com'); assert.ok(u.pathname.startsWith('/manhattan/'));
    assert.deepEqual([...u.searchParams.entries()], [['utm_source', 'waterwisekids'], ['utm_medium', 'sponsored_pilot'], ['utm_campaign', CMP], ['utm_content', PLC_GUIDE]]);
  }
  assert.doesNotMatch(card, EAST_VILLAGE);
  const at = text.indexOf('<!-- WWK sponsored placement plc_e487fb00e271338e');
  assert.ok(at > text.indexOf('id="man-pools-h"') && at < text.indexOf('Where Else Can Manhattan Families Look?'), 'card follows the editorial venue section');
  const p = packet();
  const plan = JSON.parse(p.files['patch-plan.json']).find((x) => x.placement_id === PLC_GUIDE);
  assert.equal(plan.action, 'unchanged');
  const restored = applyFilePatch(text, parseUnifiedDiff(p.files['rollback/remove-man-guide-manhattan.diff'])[0]);
  assert.equal(sha(restored), GUIDE_PRE_CARD_SHA, 'removing the card restores the editorial page byte-for-byte');
});

test('D1: on the live three-tenant database the upsert adds only the guide placement, its page and its eight destinations', async () => {
  const p = packet();
  const full = pilotManifest(loadManifest());
  const drop = (rows) => rows.filter((x) => x.placement_id !== PLC_GUIDE);
  const live = { ...full, placements: drop(full.placements), placement_pages: drop(full.placement_pages), placement_destinations: drop(full.placement_destinations) };
  const rows = (db, t) => db.db.prepare(`SELECT * FROM ${t}`).all().map((r) => { const o = { ...r }; delete o.created_at; delete o.sources_json; return JSON.stringify(o); }).sort();
  const snap = (db) => Object.fromEntries(ENTITY_TABLES.map((t) => [t, rows(db, t)]));
  const db = migratedD1(migrationFiles());
  await loadManifestD1(db, live, { at: '2026-11-02T05:00:00.000Z', actor: 'pilot-release' });
  const before = snap(db);
  db.db.exec(p.files['d1-upsert.sql']);
  const after = snap(db);
  db.db.exec(p.files['d1-upsert.sql']);
  assert.deepEqual(snap(db), after, 'idempotent');
  for (const t of ENTITY_TABLES) {
    assert.deepEqual(before[t].filter((r) => !after[t].includes(r)), [], `${t}: no existing row removed or changed`);
    const added = after[t].filter((r) => !before[t].includes(r));
    assert.equal(added.length, { placements: 1, placement_pages: 1, placement_destinations: 8 }[t] || 0, t);
    for (const r of added) assert.equal(JSON.parse(r).placement_id, PLC_GUIDE, t);
  }
  const target = migratedD1(migrationFiles());
  await loadManifestD1(target, full, { at: '2026-11-02T05:00:00.000Z', actor: 'pilot-release' });
  assert.deepEqual(snap(db), snap(target), 'equals the rebuilt nine-placement pilot seed');
  for (const d of [db, target]) d.close();
});

test('D1: the Manhattan upsert turns the live two-tenant database into the three-tenant seed, idempotently', async () => {
  const p = packet();
  const full = pilotManifest(loadManifest());
  const before = sliceFor(full, tenantIdsOf(loadPilot()));
  const dump = (db, tables = ENTITY_TABLES) => Object.fromEntries(tables.map((t) => [t, db.db.prepare(`SELECT * FROM ${t}`).all().map((r) => { const o = { ...r }; delete o.created_at; delete o.sources_json; return JSON.stringify(o); }).sort()]));
  const preflight = (db) => {
    for (const stmt of p.files['d1-preflight.sql'].split(/;\n/)) {
      const body = stmt.split('\n').filter((l) => !l.startsWith('--')).join('\n').trim();
      if (/^SELECT/.test(body)) assert.deepEqual(db.db.prepare(body).all(), [], `preflight not clean: ${body.slice(0, 80)}`);
    }
  };
  // Live D1 today: NW Philadelphia + Jersey Shore only.
  const liveNow = migratedD1(migrationFiles());
  await loadManifestD1(liveNow, before, { at: '2026-11-02T05:00:00.000Z', actor: 'pilot-release' });
  const twoTenant = dump(liveNow);
  preflight(liveNow);
  liveNow.db.exec(p.files['d1-upsert.sql']);
  const once = dump(liveNow, [...ENTITY_TABLES, 'audit_log']);
  liveNow.db.exec(p.files['d1-upsert.sql']);
  assert.deepEqual(dump(liveNow, [...ENTITY_TABLES, 'audit_log']), once, 'second apply changed rows');
  // Existing tenants' rows are untouched.
  const keep = (d) => Object.fromEntries(Object.entries(d).map(([t, rows]) => [t, rows.filter((r) => JSON.parse(r).tenant_id !== MAN)]));
  assert.deepEqual(keep(dump(liveNow)), twoTenant);
  // Result equals the rebuilt three-tenant seed.
  const target = migratedD1(migrationFiles());
  await loadManifestD1(target, full, { at: '2026-11-02T05:00:00.000Z', actor: 'pilot-release' });
  assert.deepEqual(dump(liveNow), dump(target));
  preflight(target);
  // No people: the upsert creates no user or membership.
  assert.equal(liveNow.db.prepare('SELECT COUNT(*) AS n FROM tenant_memberships').get().n, 0);
  assert.equal(liveNow.db.prepare("SELECT COUNT(*) AS n FROM users WHERE user_id <> 'usr_5ea9892a9f11c6dc'").get().n, 0);
  assert.equal(liveNow.db.prepare("SELECT COUNT(*) AS n FROM locations WHERE tenant_id = ? AND status = 'eligible_fixture'").get(MAN).n, 7);
  assert.doesNotMatch(p.files['d1-upsert.sql'], /\bDELETE\s+FROM\b|\bDROP\s/);
  for (const db of [liveNow, target]) db.close();
});

test('limitation: an ordinary-listing control for Manhattan is refused by the control rules (launches without one)', () => {
  const d = loadManhattan(); const t = d.tenants[0];
  const loc = t.locations[0];
  const plan = {
    schema: 'wwk.control-plan', schema_version: 1, definition_key: d.definition_key, prepared_on: d.prepared_on, client: { asset_version: 'ol1c' }, tag_ordinary_links: false,
    tenants: [{ tenant_key: 'manhattan', campaign: { campaign_key: 'ordinary-listing-control-2026', campaign_id: stableId('cmp', `${t.school.territory_url}#ordinary-listing-control-2026`), starts_on: '2026-11-02', ends_on: '2026-12-31' },
      listings: [{ location_key: loc.location_key, placement_id: stableId('plc', `${t.school.territory_url}#organic:${loc.official_url}`), page_path: '/swim-lessons/directory/new-york.html', row_id: 'school-british-swim-school-of-manhattan-ny' }] }],
    approvals: ['editorial_review', 'preview_qa', 'activation'].map((gate) => ({ gate, status: 'pending', recorded_on: null, evidence_ref: null })),
  };
  const r = validateControlPlan(plan, d, ctxFor(d));
  const codes = new Set(r.errors.map((e) => e.code));
  assert.equal(r.ok, false);
  for (const c of ['control_contaminated', 'control_row_mismatch', 'missing_control']) assert.ok(codes.has(c), `${c} in ${[...codes]}`);
  assert.equal(packet().files['control/plan.json'], undefined, 'the Manhattan packet carries no control artifacts');
});

test('determinism: rebuilding and reordering keys give an identical Manhattan packet', () => {
  const a = packet();
  assert.deepEqual(buildPacket(loadManhattan(), ctxFor(loadManhattan())).files, a.files);
  assert.deepEqual(buildPacket(JSON.parse(JSON.stringify(canonical(loadManhattan()))), ctxFor(loadManhattan())).files, a.files);
  assert.equal(a.summary.network_actions + a.summary.deploy_actions + a.summary.database_actions, 0);
  assert.deepEqual(a.summary.pending_gates, []);
  assert.equal(a.summary.activation_ready, true);
  assert.deepEqual(a.summary.patch_actions, { unchanged: 2 });
  for (const v of Object.values(a.files)) assert.doesNotMatch(v, /generated_at|Date\.now/);
});
