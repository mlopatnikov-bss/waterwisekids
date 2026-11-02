import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { migratedD1 } from '../../staging/scripts/lib/d1-sqlite.mjs';
import { migrationFiles } from '../../staging/scripts/lib/migrations.mjs';
import { loadManifestD1, importConversionsD1 } from '../../staging/scripts/lib/seed-pipeline.mjs';
import { pilotManifest } from '../../staging/scripts/build-pilot-seed.mjs';
import { planImport, importSql, importPreflight, importSummary, importIdFor } from '../src/conversion-import.mjs';
import { ONBOARDING_ROOT } from '../src/repo.mjs';
import { run } from '../cli.mjs';
import { clone, loadManifest, loadPilot, PILOT_PATH } from './support.mjs';

const ex = () => JSON.parse(readFileSync(join(ONBOARDING_ROOT, 'examples/aggregate-conversions.example.json'), 'utf8'));
const map = () => JSON.parse(readFileSync(join(ONBOARDING_ROOT, 'examples/location-map.example.json'), 'utf8'));
const codes = (r) => r.errors.map((e) => e.code);
const fails = (e, code, m = map()) => { const r = planImport(loadPilot(), e, m); assert.equal(r.ok, false); assert.ok(codes(r).includes(code), `expected ${code}, got ${JSON.stringify(r.errors)}`); };
const mut = (fn) => { const e = ex(); fn(e); return e; };

async function pilotDb() {
  const db = migratedD1(migrationFiles());
  await loadManifestD1(db, pilotManifest(loadManifest()), { at: '2026-11-02T05:00:00.000Z', actor: 'pilot-release' });
  return db;
}
const records = (db) => db.db.prepare('SELECT tenant_id, conversion_date, conversion_type, location_key, attribution_basis, method, count, import_id FROM conversion_records ORDER BY conversion_date, conversion_type, location_key, attribution_basis').all().map((r) => ({ ...r }));

test('example export plans into a Phase 1-valid aggregate batch', () => {
  const r = planImport(loadPilot(), ex(), map());
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.equal(r.tenant.tenant_key, 'jersey-shore');
  assert.equal(r.batch.method, 'booking_system_export');
  assert.match(r.batch.import_id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(r.batch.import_id, planImport(loadPilot(), ex(), map()).batch.import_id, 'deterministic');
  const s = importSummary(r);
  assert.deepEqual(s.totals_by_basis, { self_reported_any_source: { enrollment: 7 }, self_reported_wwk_mention: { assessment_start: 2, enrollment: 1 } });
  assert.doesNotMatch(JSON.stringify(s), /EXAMPLE-/, 'summary is aggregate-only (no per-row location codes)');
});

test('privacy: personal fields and contact-shaped values are refused', () => {
  fails(mut((e) => { e.rows[0].student_name = 'x'; }), 'pii_field');
  fails(mut((e) => { e.rows[0].parent_email = 'x'; }), 'pii_field');
  fails(mut((e) => { e.rows[0].notes = 'x'; }), 'pii_field');
  fails(mut((e) => { e.rows[0].region = 'x'; }), 'unknown_field');
  fails(mut((e) => { e.family_phone = 'x'; }), 'pii_field');
  fails(mut((e) => { e.basis_definitions.self_reported_wwk_mention = 'call 732-555-0100 for list'; }), 'pii_value');
  fails(mut((e) => { e.rows[0].location_ref = 'HOW1234567'; }), 'pii_value');
  fails(mut((e) => { e.rows[0].count = 2.5; }), 'invalid_type');
  fails(mut((e) => { e.rows[0].count = -1; }), 'invalid_value');
});

test('tenant isolation: a code mapped to another tenant is refused, not dropped', () => {
  fails(mut((e) => { e.rows[0].location_ref = 'EXAMPLE-CHEL'; }), 'location_not_in_tenant');
  fails(mut((e) => { e.rows[0].location_ref = 'EXAMPLE-NOPE'; }), 'unmapped_location');
  const m = map(); m.entries[1].tenant_key = 'northwest-philadelphia';
  fails(ex(), 'unknown_location', m);
  fails(mut((e) => { e.tenant_key = 'manhattan'; }), 'unknown_tenant');
  const m2 = map(); m2.definition_key = 'other';
  fails(ex(), 'definition_mismatch', m2);
});

test('periods: aligned to granularity, inside the campaign, not in the future', () => {
  fails(mut((e) => { e.rows[0].date = '2026-11-07'; }), 'granularity_mismatch');
  fails(mut((e) => { e.period.from = '2026-10-26'; }), 'before_campaign');
  fails(mut((e) => { e.rows[0].date = '2026-11-22'; }), 'outside_period');
  fails(mut((e) => { e.exported_on = '2026-11-10'; }), 'invalid_value');
  fails(mut((e) => { e.rows.push(clone(e.rows[0])); }), 'duplicate_row');
  fails(mut((e) => { delete e.basis_definitions.self_reported_any_source; }), 'missing_basis_definition');
  const util = mut((e) => { e.rows[0].attribution_basis = 'utm_matched_in_sponsor_system'; e.basis_definitions.utm_matched_in_sponsor_system = 'EXAMPLE: stored utm_source equals waterwisekids'; });
  const r = planImport(loadPilot(), util, map());
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.ok(r.warnings.some((w) => w.code === 'utm_basis_unverified'));
});

test('import SQL matches the staging D1 importer, is replay-safe and latest-export-wins', async () => {
  const plan = planImport(loadPilot(), ex(), map());
  const a = await pilotDb();
  for (const stmt of importPreflight(plan).split('\n').filter((l) => l.startsWith('SELECT'))) assert.deepEqual(a.db.prepare(stmt).all(), []);
  a.db.exec(importSql(plan));
  const b = await pilotDb();
  await importConversionsD1(b, { tenantId: plan.tenant.tenant_id, actorId: 'wwk-operator-import' }, plan.batch, { receivedAt: plan.receivedAt });
  assert.deepEqual(records(a), records(b), 'same rows as the accepted D1 import path');
  a.db.exec(importSql(plan));
  assert.deepEqual(records(a), records(b), 'replay is a no-op');
  assert.equal(a.db.prepare('SELECT COUNT(*) AS n FROM conversion_imports').get().n, 1);
  assert.equal(a.db.prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action = 'conversions.import'").get().n, 1);
  // A corrected, newer export replaces the value; re-applying the older one afterwards does not bring it back.
  const newer = ex(); newer.exported_on = '2026-11-17'; newer.rows[3].count = 5;
  const p2 = planImport(loadPilot(), newer, map());
  a.db.exec(importSql(p2));
  const brick = () => a.db.prepare("SELECT count FROM conversion_records WHERE conversion_date = '2026-11-15' AND attribution_basis = 'self_reported_any_source'").get().count;
  assert.equal(brick(), 5);
  a.db.exec(importSql(plan));
  assert.equal(brick(), 5, 'older export applied later never overwrites newer');
  assert.equal(a.db.prepare("SELECT SUM(count) AS n FROM conversion_records WHERE attribution_basis = 'self_reported_any_source'").get().n, 8, 'values replaced, never summed');
  assert.notEqual(importIdFor('ten_b234a48144f47f06', ex()), plan.batch.import_id, 'import id is tenant-bound');
  a.close(); b.close();
});

test('CLI import-plan: dry-run by default; real totals may only be written outside the repo', () => {
  const out = []; const say = (s) => out.push(s);
  const args = ['import-plan', PILOT_PATH, '--export', join(ONBOARDING_ROOT, 'examples/aggregate-conversions.example.json'), '--map', join(ONBOARDING_ROOT, 'examples/location-map.example.json')];
  assert.equal(run(args, { stdout: say }), 0);
  assert.equal(JSON.parse(out.at(-1)).mode, 'dry-run');
  assert.equal(run(['import-plan', PILOT_PATH, '--export', 'x.json'], { stdout: say }), 2);
  assert.equal(run([...args, '--write'], { stdout: say }), 2, '--write needs --out');
  assert.equal(run([...args, '--write', '--out', join(ONBOARDING_ROOT, 'out', 'imp')], { stdout: say }), 2, 'inside the repo is refused');
  const dir = mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'wwk-import-test-'));
  assert.equal(run([...args, '--write', '--out', dir], { stdout: say }), 0);
  assert.deepEqual(readdirSync(join(dir, 'import')).sort(), ['batch.json', 'd1-import-preflight.sql', 'd1-import.sql', 'summary.json']);
});
