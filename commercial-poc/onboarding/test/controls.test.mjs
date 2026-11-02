import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { migratedD1 } from '../../staging/scripts/lib/d1-sqlite.mjs';
import { migrationFiles } from '../../staging/scripts/lib/migrations.mjs';
import { loadManifestD1 } from '../../staging/scripts/lib/seed-pipeline.mjs';
import { pilotManifest } from '../../staging/scripts/build-pilot-seed.mjs';
import { applyFilePatch, parseUnifiedDiff } from '../../proposal/src/udiff.mjs';
import { buildControlArtifacts, validateControlPlan, CONTROL_ASSET_SOURCE } from '../src/controls.mjs';
import { buildPacket } from '../src/packet.mjs';
import { ONBOARDING_ROOT } from '../src/repo.mjs';
import { clone, loadManifest, loadPilot, realCtx, realRepo } from './support.mjs';

const loadPlan = () => JSON.parse(readFileSync(join(ONBOARDING_ROOT, 'definitions/bss-pilot-2026.controls.json'), 'utf8'));
const codes = (r) => r.errors.map((e) => e.code);
const fails = (plan, code, def = loadPilot()) => { const r = validateControlPlan(plan, def, realCtx()); assert.ok(codes(r).includes(code), `expected ${code}, got ${JSON.stringify(r.errors)}`); };
const mut = (fn) => { const p = loadPlan(); fn(p, p.tenants.find((t) => t.tenant_key === 'jersey-shore')); return p; };
let built = null;
const artifacts = () => (built ??= buildControlArtifacts(loadPlan(), loadPilot(), realCtx()));
let builtBaseline = null;
const inactiveCtx = () => {
  const base = realCtx();
  const pages = new Set(['swim-lessons/directory/new-jersey.html', 'swim-lessons/directory/pennsylvania.html']);
  return { ...base, repo: { ...base.repo, read(rel) {
    if (rel === 'assets/js/wwk-ordinary-listing.js') return null;
    const text = base.repo.read(rel);
    if (text === null || !pages.has(rel)) return text;
    return text.replace(/ data-wwk-[a-z-]+="[^"]*"/g, '')
      .replace(/^<script src="\/assets\/js\/wwk-ordinary-listing\.js[^>]*><\/script>\n/m, '');
  } } };
};
const baselineArtifacts = () => (builtBaseline ??= buildControlArtifacts(loadPlan(), loadPilot(), inactiveCtx()));

test('pilot control plan validates and reuses the Phase 1 ordinary-listing placement IDs', () => {
  const r = validateControlPlan(loadPlan(), loadPilot(), realCtx());
  assert.deepEqual(r.errors, []);
  const phase1 = new Set(loadManifest().placements.filter((p) => p.kind === 'organic_listing').map((p) => p.placement_id));
  for (const t of loadPlan().tenants) for (const l of t.listings) assert.ok(phase1.has(l.placement_id), l.placement_id);
  assert.equal(r.resolved.length, 4);
});

test('fairness rules: no backdating, concurrent window, full coverage, no contamination', () => {
  fails(mut((p, t) => { t.campaign.starts_on = '2026-10-01'; }), 'backdated_control');
  fails(mut((p, t) => { t.campaign.starts_on = '2026-11-01'; p.prepared_on = '2026-11-01'; }), 'backdated_control');
  fails(mut((p, t) => { t.campaign.ends_on = '2026-12-15'; }), 'window_mismatch');
  fails(mut((p, t) => { t.listings = t.listings.filter((l) => l.location_key !== 'la-fitness-brick'); }), 'missing_control');
  fails(mut((p, t) => { t.listings[0].page_path = '/swim-lessons/howell-nj.html'; }), 'control_contaminated');
  fails(mut((p, t) => { t.campaign.campaign_key = 'sponsored-pilot-2026'; t.campaign.campaign_id = 'cmp_88f0a7279a2972e2'; }), 'invalid_value');
});

test('strictness: unknown fields, IDs, rows, ownership', () => {
  fails(mut((p) => { p.extra = true; }), 'unknown_field');
  fails(mut((p) => { p.tag_ordinary_links = 'yes'; }), 'invalid_type');
  fails(mut((p, t) => { t.listings[0].placement_id = 'plc_0000000000000000'; }), 'id_mismatch');
  fails(mut((p, t) => { t.campaign.campaign_id = 'cmp_0000000000000000'; }), 'id_mismatch');
  fails(mut((p, t) => { t.listings[0].row_id = 'school-not-a-real-row'; }), 'control_row_mismatch');
  fails(mut((p, t) => { t.listings[1].row_id = t.listings[0].row_id; }), 'control_row_mismatch');
  fails(mut((p, t) => { t.listings.push({ ...clone(t.listings[0]), location_key: 'la-fitness-cheltenham' }); }), 'ownership_conflict');
  fails(mut((p) => { p.tenants.push({ ...clone(p.tenants[0]), tenant_key: 'manhattan' }); }), 'ownership_conflict');
  fails(mut((p, t) => { t.listings[0].page_path = '/../x.html'; }), 'unsafe_path');
  fails(mut((p) => { p.definition_key = 'other-def'; }), 'definition_mismatch');
});

test('row patches add data-wwk-* only: same text, order and hrefs; rollback restores bytes', () => {
  const a = baselineArtifacts();
  assert.equal(a.ok, true, JSON.stringify(a.errors));
  const plan = JSON.parse(a.files['control/plan.json']);
  for (const f of plan.files) {
    const before = inactiveCtx().repo.read(f.source_file);
    const after = applyFilePatch(before, parseUnifiedDiff(a.files[f.patch])[0]);
    const strip = (h) => h.replace(/ data-wwk-[a-z-]+="[^"]*"/g, '').replace(/<script src="\/assets\/js\/wwk-ordinary-listing\.js[^>]*><\/script>\n/, '');
    assert.equal(strip(after), before, f.source_file);
    const ids = (h) => [...h.matchAll(/class="school-card" id="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(ids(after), ids(before));
    const hrefs = (h) => [...h.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((x) => !x.startsWith('/assets/js/wwk-ordinary-listing'));
    assert.deepEqual(hrefs(after), hrefs(before), 'no href changes when tag_ordinary_links is false');
    assert.doesNotMatch(after, /rel="sponsored|Sponsored pilot/);
    assert.equal(after.split('data-wwk-ordinary-listing=""').length - 1, f.placements.length);
    assert.equal(applyFilePatch(after, parseUnifiedDiff(a.files[f.removal_patch])[0]), before);
  }
  assert.match(a.files['control/patches/new-asset-wwk-ordinary-listing.diff'], /new file mode 100644\n--- \/dev\/null\n\+\+\+ b\/assets\/js\/wwk-ordinary-listing\.js/);
  for (const d of Object.values(a.files)) assert.doesNotMatch(d, /^(---|\+\+\+) [ab]\/assets\/js\/wwk-sponsored\.js/m, 'the live sponsored client is never patched');
});

test('tag_ordinary_links adds campaign-level UTM (referral) to the ordinary link only', () => {
  const p = loadPlan(); p.tag_ordinary_links = true;
  const a = buildControlArtifacts(p, loadPilot(), inactiveCtx());
  const d = a.files['control/patches/swim-lessons-directory-new-jersey.diff'];
  assert.match(d, /la-fitness-howell\/\?utm_source=waterwisekids&amp;utm_medium=referral&amp;utm_campaign=cmp_91a15f49d66bdeef&amp;utm_content=plc_d6a6673732411e04/);
});

test('control SQL: idempotent, tenant-guarded, never touches sponsored rows', async () => {
  const sql = artifacts().files['control/d1-control-upsert.sql'];
  assert.doesNotMatch(sql, /\bDELETE\s+FROM\b|\bDROP\s/);
  const db = migratedD1(migrationFiles());
  await loadManifestD1(db, pilotManifest(loadManifest()), { at: '2026-11-02T05:00:00.000Z', actor: 'pilot-release' });
  const sponsored = () => JSON.stringify(db.db.prepare("SELECT * FROM placements WHERE kind = 'sponsored_card' ORDER BY placement_id").all()) + JSON.stringify(db.db.prepare("SELECT * FROM campaigns WHERE kind = 'sponsored_pilot' ORDER BY campaign_id").all());
  const before = sponsored();
  for (const stmt of artifacts().files['control/d1-control-preflight.sql'].split(/;\n/)) {
    const body = stmt.split('\n').filter((l) => !l.startsWith('--')).join('\n').trim();
    if (body) assert.deepEqual(db.db.prepare(body).all(), [], body.slice(0, 60));
  }
  db.db.exec(sql);
  const snap = () => JSON.stringify(['campaigns', 'placements', 'placement_pages', 'placement_destinations', 'audit_log'].map((t) => db.db.prepare(`SELECT * FROM ${t}`).all()));
  const once = snap();
  db.db.exec(sql);
  assert.equal(snap(), once, 'second apply is a no-op');
  assert.equal(sponsored(), before, 'sponsored rows unchanged');
  const ctl = db.db.prepare("SELECT campaign_id, tenant_id, disclosure_label, price_cents, starts_on, ends_on FROM campaigns WHERE kind = 'organic_baseline' ORDER BY campaign_id").all();
  assert.deepEqual(ctl.map((c) => ({ ...c })), [
    { campaign_id: 'cmp_8f06c46a4a1e41f2', tenant_id: 'ten_b234a48144f47f06', disclosure_label: null, price_cents: 0, starts_on: '2026-11-02', ends_on: '2026-12-31' },
    { campaign_id: 'cmp_91a15f49d66bdeef', tenant_id: 'ten_9d294d23e0e9841e', disclosure_label: null, price_cents: 0, starts_on: '2026-11-02', ends_on: '2026-12-31' }]);
  assert.equal(db.db.prepare("SELECT COUNT(*) AS n FROM placements WHERE kind = 'organic_listing' AND link_rel IS NULL").get().n, 4);
  db.close();
});

test('packet: controls are opt-in; without them the packet is byte-identical', () => {
  const plain = buildPacket(loadPilot(), realCtx());
  const withC = buildPacket(loadPilot(), realCtx(), { controls: loadPlan() });
  assert.equal(withC.ok, true, JSON.stringify(withC.errors));
  for (const [k, v] of Object.entries(plain.files)) if (k !== 'summary.json') assert.equal(withC.files[k], v, k);
  assert.equal(Object.keys(withC.files).filter((k) => k.startsWith('control/')).length, 3);
  assert.ok(JSON.parse(withC.files['control/plan.json']).files.every((f) => f.action === 'unchanged'));
  assert.equal(withC.summary.controls.listings, 4);
  assert.deepEqual(buildPacket(loadPilot(), realCtx(), { controls: loadPlan() }).files, withC.files, 'deterministic');
  assert.equal(plain.summary.controls, undefined);
  void CONTROL_ASSET_SOURCE;
});
