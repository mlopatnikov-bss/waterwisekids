// Deterministic three-tenant staging seed, exact reconciliation with Phase 1, idempotent SQL.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seeded, phase1Seeded, tableHashes, phase1TableHashes, freshD1, loadManifest, AS_OF } from './support.mjs';
import { RECONCILED_TABLES, dumpSql, TABLES } from '../scripts/lib/sql-dump.mjs';
import { reconcile } from '../src/shared/rollup.mjs';
import { TenantScope } from '../src/shared/scope.mjs';
import { expectedConversionTotals } from '../../src/synthetic.mjs';
import { buildSeedSql } from '../scripts/build-seed.mjs';
import { ADMIN_USER_ID } from '../scripts/lib/seed-pipeline.mjs';

const METRICS = ['eligible_view', 'viewable_impression', 'sponsored_click', 'outbound_click'];

test('ingest outcomes equal the Phase 1 accepted run and the generator (41,669 deliveries in 25-event requests)', async () => {
  const s = await seeded(); const p = await phase1Seeded();
  assert.equal(s.ingest.deliveries, 41669);
  assert.equal(s.ingest.requests, Math.ceil(41669 / 25));
  assert.deepEqual([s.ingest.accepted, s.ingest.duplicates, s.ingest.rejected], [p.ingest.accepted, p.ingest.duplicates, p.ingest.rejected]);
  assert.deepEqual([s.ingest.accepted, s.ingest.duplicates, s.ingest.rejected], [40550, 963, 156]);
  const rejected = Object.fromEntries(Object.entries(s.ingest.reasons).filter(([k]) => !k.startsWith('duplicate_')));
  assert.deepEqual(rejected, s.synth.expected.rejected);
  assert.equal(s.ingest.reasons.duplicate_event_id + s.ingest.reasons.duplicate_semantic, 963);
  assert.deepEqual(s.conv, p.conv);
});

test('per-tenant totals: generator expected = accepted events = daily rollups = portal read model, for all three tenants', async () => {
  const s = await seeded();
  for (const t of s.manifest.tenants) {
    const rec = await reconcile(s.db, { tenantId: t.tenant_id, from: '2000-01-01', to: '2999-12-31' });
    assert.ok(rec.ok, t.tenant_key);
    const scope = new TenantScope(s.db, t.tenant_id, 'test');
    const totals = await scope.totals('2026-08-04', '2026-11-01');
    for (const m of METRICS) {
      const expected = s.synth.expected.byTenant[t.tenant_id][m];
      assert.equal(rec.events[m], expected, `${t.tenant_key} ${m} events`);
      assert.equal(rec.daily_metrics[m], expected, `${t.tenant_key} ${m} rollups`);
      assert.equal((totals.sponsored_card[m] || 0) + (totals.organic_listing[m] || 0), expected, `${t.tenant_key} ${m} portal`);
    }
  }
  const known = { ten_b234a48144f47f06: [8166, 4623, 153, 172], ten_9d294d23e0e9841e: [11906, 6962, 247, 265], ten_52bf92991a0305d0: [5122, 2773, 75, 86] };
  for (const [tid, v] of Object.entries(known)) assert.deepEqual(METRICS.map((m) => s.synth.expected.byTenant[tid][m]), v, 'matches the accepted Phase 1 VERIFICATION table');
});

test('stored data is byte-identical to the accepted Phase 1 pipeline (per-table SHA-256), including quality runs', async () => {
  const s = await seeded(); const p = await phase1Seeded();
  const tables = [...RECONCILED_TABLES, 'data_quality_runs', 'tenants', 'schools', 'locations', 'campaigns', 'placements', 'placement_pages', 'destinations', 'placement_destinations', 'tenant_memberships'];
  const a = await tableHashes(s.db, tables); const b = phase1TableHashes(p.db, tables);
  for (const t of tables) assert.deepEqual(a[t], b[t], t);
  assert.equal(a.events.rows, 40550);
});

test('reported conversions equal the expected supersede/replay totals', async () => {
  const s = await seeded();
  const exp = expectedConversionTotals(s.synth.conversionBatches);
  for (const t of s.manifest.tenants) {
    const got = await new TenantScope(s.db, t.tenant_id, 'test').conversionTotals('2000-01-01', '2999-12-31');
    assert.deepEqual(got, exp[t.tenant_id] || {}, t.tenant_key);
  }
});

test('staging users carry opaque IDs, non-demo labels and no personal data', async () => {
  const s = await seeded();
  const users = (await s.db.prepare('SELECT * FROM users ORDER BY user_id').all()).results;
  assert.deepEqual(users.map((u) => u.user_id), [...s.manifest.users.map((u) => u.user_id), ADMIN_USER_ID].sort());
  for (const u of users) {
    assert.equal(u.is_demo, 0);
    assert.match(u.auth_subject, /^sub_[0-9a-f]{64}$/);
    assert.doesNotMatch(JSON.stringify(Object.values(u)), /@|demo/i);
  }
  assert.deepEqual((await s.db.prepare('SELECT user_id, role FROM operator_roles').all()).results, [{ user_id: ADMIN_USER_ID, role: 'admin' }]);
});

test('seed SQL is deterministic and idempotent: applying it twice gives the same database as the pipeline', async () => {
  const one = await buildSeedSql(); const two = await buildSeedSql();
  assert.equal(one.sql, two.sql, 'two builds are byte-identical');
  assert.doesNotMatch(one.sql, /\b(BEGIN|COMMIT|ROLLBACK)\b/);
  const db = freshD1();
  db.db.exec(one.sql);
  const h1 = await tableHashes(db);
  db.db.exec(one.sql);
  const h2 = await tableHashes(db);
  assert.deepEqual(h2, h1, 'second application changes nothing');
  const pipeline = freshD1();
  const { seedStaging } = await import('../scripts/lib/seed-pipeline.mjs');
  await seedStaging(pipeline, loadManifest(), { asOf: AS_OF });
  assert.deepEqual(h1, await tableHashes(pipeline));
  assert.equal(one.summary.tables.events.rows, 40550);
  assert.equal(TABLES.length, 19);
  assert.doesNotMatch(one.sql, /@[a-z0-9-]+\.[a-z]{2,}/i, 'no email-like value in the seed');
});
