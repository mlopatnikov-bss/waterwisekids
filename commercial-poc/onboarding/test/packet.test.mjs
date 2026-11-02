import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pilotManifest } from '../../staging/scripts/build-pilot-seed.mjs';
import { migratedD1 } from '../../staging/scripts/lib/d1-sqlite.mjs';
import { migrationFiles } from '../../staging/scripts/lib/migrations.mjs';
import { loadManifestD1 } from '../../staging/scripts/lib/seed-pipeline.mjs';
import { applyFilePatch, parseUnifiedDiff } from '../../proposal/src/udiff.mjs';
import { buildPacket, canonical, definitionSha } from '../src/packet.mjs';
import { findCardBlock } from '../src/render.mjs';
import { ONBOARDING_ROOT } from '../src/repo.mjs';
import { run, safeOutDir, writePacket, DEFAULT_OUT_ROOT } from '../cli.mjs';
import { clone, loadManifest, loadPilot, PILOT_PATH, realCtx, realRepo, sliceFor, stubCtx, stubDef, stubFiles, tenantIdsOf } from './support.mjs';

const ENTITY_TABLES = ['tenants', 'schools', 'locations', 'campaigns', 'destinations', 'placements', 'placement_pages', 'placement_destinations'];
const live = pilotManifest(loadManifest());
// The live seed now holds every approved pilot definition (bss-pilot-2026 + bss-manhattan-pilot-2026).
// Each definition is compared with its own tenants' slice of that seed.
const livePilot = sliceFor(live, tenantIdsOf(loadPilot()));
const onlyTenants = (d, tids) => Object.fromEntries(Object.entries(d).map(([t, rows]) => [t, rows.filter((r) => tids.has(JSON.parse(r).tenant_id))]));
let pilotPacket = null;
const packet = () => (pilotPacket ??= buildPacket(loadPilot(), realCtx()));

test('pilot packet builds with every live placement unchanged', () => {
  const p = packet();
  assert.equal(p.ok, true, JSON.stringify(p.errors));
  assert.deepEqual(p.summary.patch_actions, { unchanged: 7 });
  assert.equal(p.summary.network_actions + p.summary.deploy_actions + p.summary.database_actions, 0);
  assert.deepEqual(p.summary.pending_gates, ['portal_access']);
  assert.equal(p.summary.activation_ready, false);
});

test('preservation: every active ID, page and destination pair from the live pilot manifest', () => {
  const d = loadPilot();
  const live = livePilot;
  const ids = (rows, k) => rows.map((r) => r[k]).sort();
  assert.deepEqual(d.tenants.map((t) => t.tenant_id).sort(), ids(live.tenants, 'tenant_id'));
  assert.deepEqual(d.tenants.map((t) => t.school.school_id).sort(), ids(live.schools, 'school_id'));
  assert.deepEqual(d.tenants.map((t) => t.campaign.campaign_id).sort(), ids(live.campaigns, 'campaign_id'));
  assert.deepEqual(d.tenants.flatMap((t) => t.locations.map((l) => l.location_id)).sort(), ids(live.locations, 'location_id'));
  assert.deepEqual(d.tenants.flatMap((t) => t.destinations.map((x) => x.destination_id)).sort(), ids(live.destinations, 'destination_id'));
  assert.deepEqual(d.tenants.flatMap((t) => t.placements.map((x) => `${x.placement_id} ${x.page_path} ${x.slot_key}`)).sort(),
    live.placements.map((x) => `${x.placement_id} ${live.placement_pages.find((pp) => pp.placement_id === x.placement_id).page_path} ${x.slot_key}`).sort());
  const pairs = JSON.parse(packet().files['destinations.json']).flatMap((x) => x.destinations.map((y) => `${x.placement_id}|${y.destination_id}`)).sort();
  assert.deepEqual(pairs, live.placement_destinations.map((x) => `${x.placement_id}|${x.destination_id}`).sort());
  for (const c of live.campaigns) assert.deepEqual([c.starts_on, c.ends_on], ['2026-11-02', '2026-12-31']);
});

test('preservation: rendered cards and tagged URLs are byte-identical to the live pages', () => {
  const p = packet();
  const dests = JSON.parse(p.files['destinations.json']);
  for (const plan of JSON.parse(p.files['patch-plan.json'])) {
    const text = realRepo().read(plan.source_file);
    const lines = text.split('\n');
    const b = findCardBlock(lines, plan.placement_id);
    assert.equal(`${lines.slice(b.start, b.end).join('\n')}\n`, p.files[`cards/${plan.slot_key}.html`], plan.page_path);
    const hrefs = [...lines.slice(b.start, b.end).join('\n').matchAll(/href="(https:\/\/britishswimschool[^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&')).sort();
    assert.deepEqual(hrefs, dests.find((x) => x.placement_id === plan.placement_id).destinations.map((x) => x.tagged_url).sort());
  }
});

function dump(db, tables = ENTITY_TABLES) {
  return Object.fromEntries(tables.map((t) => [t, db.db.prepare(`SELECT * FROM ${t}`).all().map((r) => JSON.stringify(r)).sort()]));
}

test('D1 upsert is a no-op on the live pilot database and idempotent from empty', async () => {
  const sql = packet().files['d1-upsert.sql'];
  const livedb = migratedD1(migrationFiles());
  await loadManifestD1(livedb, live, { at: '2026-11-02T05:00:00.000Z', actor: 'pilot-release' });
  const before = dump(livedb);
  livedb.db.exec(sql);
  assert.deepEqual(dump(livedb), before, 'upsert changed live pilot rows');
  for (const stmt of packet().files['d1-preflight.sql'].split(/;\n/).filter((s) => /^\s*(--[^\n]*\n)*\s*SELECT/m.test(s))) {
    const body = stmt.split('\n').filter((l) => !l.startsWith('--')).join('\n').trim();
    if (body) assert.deepEqual(livedb.db.prepare(body).all(), [], `preflight not clean: ${body.slice(0, 80)}`);
  }
  const fresh = migratedD1(migrationFiles());
  fresh.db.exec(sql);
  const once = dump(fresh, [...ENTITY_TABLES, 'audit_log']);
  fresh.db.exec(sql);
  assert.deepEqual(dump(fresh, [...ENTITY_TABLES, 'audit_log']), once, 'second apply changed rows');
  assert.equal(once.audit_log.length, 1);
  // Same rows as live except insert-only provenance columns.
  const strip = (d) => Object.fromEntries(Object.entries(d).map(([t, rows]) => [t, rows.map((r) => { const o = JSON.parse(r); delete o.created_at; delete o.sources_json; return JSON.stringify(o); }).sort()]));
  assert.deepEqual(strip(dump(fresh)), strip(onlyTenants(before, tenantIdsOf(loadPilot()))));
  fresh.db.exec(packet().files['portal-memberships.sql']);
  fresh.db.exec(packet().files['portal-memberships.sql']);
  const users = fresh.db.prepare('SELECT * FROM users').all();
  assert.equal(users.length, 1);
  assert.equal(users[0].auth_subject, null);
  assert.equal(fresh.db.prepare('SELECT COUNT(*) AS n FROM tenant_memberships').get().n, 2);
  for (const db of [livedb, fresh]) db.close();
});

test('upsert never overwrites a row owned by another tenant', () => {
  const db = migratedD1(migrationFiles());
  const sql = packet().files['d1-upsert.sql'];
  db.db.exec("INSERT INTO tenants VALUES ('ten_ffffffffffffffff','Other','America/New_York','pilot_fixture',0,'x');");
  db.db.exec("INSERT INTO schools VALUES ('sch_ffffffffffffffff','ten_ffffffffffffffff','Other','https://o/','[]');");
  db.db.exec("INSERT INTO campaigns VALUES ('cmp_88f0a7279a2972e2','ten_ffffffffffffffff','sch_ffffffffffffffff','sponsored_pilot','Hijack','Sponsored pilot',0,'2020-01-01','2020-01-02');");
  db.db.exec(sql);
  assert.deepEqual({ ...db.db.prepare("SELECT tenant_id, display_name FROM campaigns WHERE campaign_id = 'cmp_88f0a7279a2972e2'").get() }, { tenant_id: 'ten_ffffffffffffffff', display_name: 'Hijack' });
  db.close();
});

test('determinism: rebuilding, reordering keys and a fresh repo reader give identical bytes', async () => {
  const a = packet();
  const b = buildPacket(loadPilot(), realCtx());
  assert.deepEqual(b.files, a.files);
  const shuffled = JSON.parse(JSON.stringify(canonical(loadPilot())));
  assert.equal(definitionSha(shuffled), a.summary.definition_sha256);
  assert.deepEqual(buildPacket(shuffled, realCtx()).files, a.files);
  for (const v of Object.values(a.files)) assert.doesNotMatch(v, /generated_at|"now"|Date\.now/, 'packet must not embed wall-clock time');
});

test('completeness: every packet artifact is present and the summary hashes them', () => {
  const p = packet();
  for (const f of ['summary.json', 'ids.json', 'patch-plan.json', 'destinations.json', 'd1-upsert.sql', 'd1-preflight.sql', 'portal-memberships.sql', 'portal-access-checklist.md', 'content-worklist.json', 'content-worklist.md', 'rollback.md']) assert.ok(p.files[f], f);
  for (const t of loadPilot().tenants) for (const pl of t.placements) { assert.ok(p.files[`cards/${pl.slot_key}.html`]); assert.ok(p.files[`rollback/remove-${pl.slot_key}.diff`]); }
  assert.deepEqual(Object.keys(p.summary.files).sort(), Object.keys(p.files).filter((f) => f !== 'summary.json').sort());
  assert.equal(JSON.parse(p.files['ids.json']).length, 24);
  assert.doesNotMatch(Object.values(p.files).join('\n'), /[^\s@"]+@[^\s@"]+\.[a-z]{2,}/i, 'no email-shaped value in the packet');
  const deact = buildPacket(loadPilot(), realCtx(), { deactivateOn: '2026-12-15' });
  assert.match(deact.files['deactivate.sql'], /UPDATE campaigns SET ends_on = '2026-12-15' WHERE campaign_id = 'cmp_88f0a7279a2972e2' AND tenant_id = 'ten_9d294d23e0e9841e'/);
  assert.doesNotMatch(deact.files['deactivate.sql'], /\bDELETE\s+FROM\b|\bDROP\s/);
});

test('rollback patches remove exactly the card and reverse cleanly', () => {
  const p = packet();
  for (const plan of JSON.parse(p.files['patch-plan.json'])) {
    const text = realRepo().read(plan.source_file);
    const [fp] = parseUnifiedDiff(p.files[plan.removal_patch]);
    const removed = applyFilePatch(text, fp);
    assert.equal(removed.includes(plan.placement_id), false, plan.page_path);
    assert.equal(text.split('\n').length - removed.split('\n').length, plan.card_lines);
  }
});

test('new sponsor: insert patch, then re-plan on the patched page is unchanged', () => {
  const files = stubFiles();
  const first = buildPacket(stubDef(), stubCtx(files));
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  const [plan] = JSON.parse(first.files['patch-plan.json']);
  assert.equal(plan.action, 'insert');
  const patched = applyFilePatch(files[plan.source_file], parseUnifiedDiff(first.files[plan.patch])[0]);
  assert.equal(patched.split('WWK sponsored placement').length - 1, 1);
  const def2 = stubDef(); def2.tenants[0].placements[0].anchor = { type: 'existing_marker', text: null };
  const second = buildPacket(def2, stubCtx({ ...files, [plan.source_file]: patched }));
  assert.equal(JSON.parse(second.files['patch-plan.json'])[0].action, 'unchanged');
  assert.match(first.files['d1-upsert.sql'], /'needs_owner_confirmation'/, 'unapproved sponsor locations stay ineligible for counting');
});

test('CLI: dry-run by default, strict flags, bounded write location, idempotent writes', () => {
  const out = [];
  const say = (s) => out.push(s);
  const before = existsSync(DEFAULT_OUT_ROOT) ? readdirSync(DEFAULT_OUT_ROOT).length : 0;
  assert.equal(run(['plan', PILOT_PATH], { stdout: say }), 0);
  assert.equal(JSON.parse(out.at(-1)).mode, 'dry-run');
  assert.equal(existsSync(DEFAULT_OUT_ROOT) ? readdirSync(DEFAULT_OUT_ROOT).length : 0, before, 'dry-run wrote files');
  assert.equal(run(['plan', PILOT_PATH, '--deploy'], { stdout: say }), 2);
  assert.equal(run(['validate', PILOT_PATH, '--write'], { stdout: say }), 2);
  assert.equal(run(['explode', PILOT_PATH], { stdout: say }), 2);
  assert.throws(() => safeOutDir(join(ONBOARDING_ROOT, '..', '..', 'swim-lessons'), realRepo().root), /under/);
  assert.throws(() => safeOutDir(realRepo().root, realRepo().root), /under/);
  assert.equal(safeOutDir(join(DEFAULT_OUT_ROOT, 'x'), realRepo().root), join(DEFAULT_OUT_ROOT, 'x'));
  const dir = mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'wwk-onboarding-test-'));
  const files = packet().files;
  const w1 = writePacket(files, dir);
  assert.ok(Object.values(w1).every((x) => x === 'created'));
  const w2 = writePacket(files, dir);
  assert.ok(Object.values(w2).every((x) => x === 'unchanged'));
  assert.equal(readFileSync(join(dir, 'd1-upsert.sql'), 'utf8'), files['d1-upsert.sql']);
  assert.throws(() => writePacket({ '../escape.txt': 'x' }, dir), /outside/);
});

test('no network, process or deploy capability in onboarding code', () => {
  const src = ['cli.mjs', 'src/schema.mjs', 'src/validate.mjs', 'src/render.mjs', 'src/packet.mjs', 'src/repo.mjs'].map((f) => readFileSync(join(ONBOARDING_ROOT, f), 'utf8')).join('\n');
  assert.doesNotMatch(src, /node:(https?|net|tls|dgram|dns|child_process|worker_threads)|\bfetch\(|XMLHttpRequest|WebSocket|wrangler\s|unlinkSync|rmSync|rmdirSync/);
  void clone;
});
