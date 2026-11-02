import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../src/db.mjs';
import { loadManifest as loadIntoDb } from '../src/registry.mjs';
import { importConversions, ImportError } from '../src/conversions.mjs';
import { expectedConversionTotals } from '../src/synthetic.mjs';
import { runQuality, healthSummary } from '../src/quality.mjs';
import { TenantScope } from '../src/scope.mjs';
import { seeded, loadManifest, tenantByKey, AS_OF } from './helpers.mjs';

const manifest = loadManifest();
function fresh() { const db = openDb(':memory:'); loadIntoDb(db, manifest, { at: AS_OF }); return db; }
const scopeFor = (db, key) => new TenantScope(db, tenantByKey(manifest, key).tenant_id, 'usr_test');
const batch = (o = {}) => ({ import_id: crypto.randomUUID(), method: 'manual_entry', source_label: 'Owner tally', confidence: 'low',
  rows: [{ conversion_date: '2026-10-11', conversion_type: 'enrollment', location_id: null, attribution_basis: 'self_reported_wwk_mention', count: 2 }], ...o });

test('conversions: seeded totals follow supersede-and-replay semantics exactly', () => {
  const { db, synth } = seeded();
  const exp = expectedConversionTotals(synth.conversionBatches);
  for (const t of manifest.tenants) {
    const got = Object.fromEntries(db.prepare('SELECT conversion_type, SUM(count) AS n FROM conversion_records WHERE tenant_id = ? GROUP BY conversion_type').all(t.tenant_id).map((r) => [r.conversion_type, Number(r.n)]));
    assert.deepEqual(got, exp[t.tenant_id] || {}, t.tenant_key);
  }
  assert.equal(exp[tenantByKey(manifest, 'manhattan').tenant_id], undefined, 'Manhattan has no reported conversions (empty state)');
});

test('conversions: replaying an import is a no-op; a newer import supersedes instead of summing', () => {
  const db = fresh(); const s = scopeFor(db, 'jersey-shore');
  const b = batch();
  assert.equal(importConversions(db, s, b).status, 'imported');
  assert.equal(importConversions(db, s, b).status, 'duplicate_import');
  const r = importConversions(db, s, batch({ rows: [{ ...b.rows[0], count: 5 }] }));
  assert.equal(r.superseded, 1);
  assert.equal(Number(db.prepare('SELECT SUM(count) AS n FROM conversion_records').get().n), 5);
});

test('conversions: tenant comes from the scope; payload tenant_id and foreign locations are refused', () => {
  const db = fresh(); const s = scopeFor(db, 'jersey-shore');
  assert.throws(() => importConversions(db, s, { ...batch(), tenant_id: tenantByKey(manifest, 'manhattan').tenant_id }), (e) => e instanceof ImportError && e.code === 'tenant_id_not_accepted');
  const manLoc = manifest.locations.find((l) => l.tenant_id === tenantByKey(manifest, 'manhattan').tenant_id);
  assert.throws(() => importConversions(db, s, batch({ rows: [{ ...batch().rows[0], location_id: manLoc.location_id }] })), (e) => e.code === 'location_not_in_tenant');
  const b = batch(); importConversions(db, s, b);
  assert.throws(() => importConversions(db, scopeFor(db, 'manhattan'), b), (e) => e.code === 'import_id_conflict');
});

test('conversions: personal data and free text are refused', () => {
  const db = fresh(); const s = scopeFor(db, 'jersey-shore');
  const bad = [
    [{ source_label: 'Call from 732-555-0100' }, 'invalid_source_label'],
    [{ source_label: 'jane@example.com' }, 'invalid_source_label'],
    [{ rows: [{ ...batch().rows[0], family_name: 'Smith' }] }, 'unknown_row_field'],
    [{ rows: [{ ...batch().rows[0], notes: 'child Sam, age 4' }] }, 'unknown_row_field'],
    [{ rows: [{ ...batch().rows[0], count: -1 }] }, 'invalid_count'],
    [{ rows: [{ ...batch().rows[0], conversion_date: '2026-02-30' }] }, 'invalid_conversion_date'],
    [{ confidence: 'certain' }, 'invalid_confidence'],
    [{ rows: [batch().rows[0], batch().rows[0]] }, 'duplicate_row_in_batch'],
  ];
  for (const [patch, code] of bad) assert.throws(() => importConversions(db, s, batch(patch)), (e) => e.code === code, code);
  assert.equal(Number(db.prepare('SELECT COUNT(*) AS n FROM conversion_records').get().n), 0);
});

test('quality: Manhattan is stale (critical) with missing days; Jersey Shore flags its outage day; NW Philadelphia is clean', () => {
  const { quality, manifest: m } = seeded();
  const q = (key) => quality[tenantByKey(m, key).tenant_id];
  const check = (key, name) => q(key).checks.find((c) => c.check === name);
  assert.equal(q('manhattan').status, 'critical');
  assert.equal(check('manhattan', 'freshness').severity, 'critical');
  assert.deepEqual(check('manhattan', 'completeness').missing_days, ['2026-10-30', '2026-10-31', '2026-11-01']);
  assert.equal(check('manhattan', 'conversion_imports').severity, 'info');
  assert.equal(q('jersey-shore').status, 'warn');
  assert.deepEqual(check('jersey-shore', 'completeness').missing_days, ['2026-10-12']);
  assert.ok(check('jersey-shore', 'anomalies').flags.some((f) => f.date === '2026-10-12'));
  assert.equal(check('northwest-philadelphia', 'freshness').severity, 'ok');
  assert.equal(check('northwest-philadelphia', 'completeness').severity, 'ok');
  assert.equal(check('northwest-philadelphia', 'anomalies').severity, 'ok');
  assert.equal(q('northwest-philadelphia').status, 'info', 'only the pending-location note');
  for (const key of ['manhattan', 'jersey-shore', 'northwest-philadelphia']) assert.equal(check(key, 'rollup_reconciliation').value, true);
});

test('quality: freshness degrades as the report time moves forward', () => {
  const { db, manifest: m } = seeded();
  const t = tenantByKey(m, 'northwest-philadelphia');
  const later = runQuality(db, { tenantId: t.tenant_id, asOf: '2026-11-05T14:00:00.000Z', from: '2026-10-06', to: '2026-11-04', record: false });
  assert.equal(later.checks.find((c) => c.check === 'freshness').severity, 'critical');
});

test('health summary: machine-readable, versioned, worst-status rollup', () => {
  const { db } = seeded();
  const h = healthSummary(db, { asOf: AS_OF, from: '2026-10-05', to: '2026-11-01' });
  assert.equal(h.schema, 'wwk-poc-health/v1');
  assert.equal(h.status, 'critical');
  assert.equal(h.tenants.length, 3);
  for (const t of h.tenants) assert.ok(t.checks.freshness && t.checks.completeness && t.checks.rollup_reconciliation);
  assert.equal(JSON.stringify(h).includes('British Swim School'), false, 'summary carries ids, not names');
});
