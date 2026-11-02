import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rollupRange, reconcile } from '../src/rollup.mjs';
import { purgeRawEvents } from '../src/collector.mjs';
import { openDb } from '../src/db.mjs';
import { seedAll } from '../src/pipeline.mjs';
import { TenantScope } from '../src/scope.mjs';
import { seeded, loadManifest, AS_OF } from './helpers.mjs';

const METRICS = ['eligible_view', 'viewable_impression', 'sponsored_click', 'outbound_click'];

test('reconciliation: accepted events equal the generator\'s independent expected totals, per tenant and metric', () => {
  const { db, manifest, synth } = seeded();
  for (const t of manifest.tenants) {
    const got = Object.fromEntries(db.prepare('SELECT event_type, COUNT(*) AS n FROM events WHERE tenant_id = ? GROUP BY event_type').all(t.tenant_id).map((r) => [r.event_type, Number(r.n)]));
    for (const m of METRICS) assert.equal(got[m] || 0, synth.expected.byTenant[t.tenant_id][m], `${t.tenant_key} ${m}`);
  }
});

test('reconciliation: daily rollups equal expected totals for every tenant-day-metric', () => {
  const { db, manifest, synth } = seeded();
  let cells = 0;
  for (const t of manifest.tenants) {
    const rows = db.prepare('SELECT metric_date, metric, SUM(value) AS v FROM daily_metrics WHERE tenant_id = ? GROUP BY metric_date, metric').all(t.tenant_id);
    const got = {};
    for (const r of rows) (got[r.metric_date] ||= {})[r.metric] = Number(r.v);
    const exp = synth.expected.byTenantDay[t.tenant_id];
    assert.deepEqual(Object.keys(got).sort(), Object.keys(exp).sort(), `${t.tenant_key} day set`);
    for (const [day, m] of Object.entries(exp)) for (const k of METRICS) { assert.equal(got[day][k] || 0, m[k], `${t.tenant_key} ${day} ${k}`); cells += 1; }
    assert.equal(reconcile(db, { tenantId: t.tenant_id, from: '2000-01-01', to: '2999-12-31' }).ok, true);
  }
  assert.ok(cells > 1000);
});

test('reconciliation: duplicates and invalid payloads never inflate totals', () => {
  const { synth, ingest } = seeded();
  const expectedUnique = Object.values(synth.expected.byTenant).reduce((a, m) => a + METRICS.reduce((s, k) => s + m[k], 0), 0);
  const expectedDupes = synth.expected.duplicates.duplicate_event_id + synth.expected.duplicates.duplicate_semantic;
  const expectedRejected = Object.values(synth.expected.rejected).reduce((a, b) => a + b, 0);
  assert.equal(ingest.accepted, expectedUnique);
  assert.equal(ingest.duplicates, expectedDupes);
  assert.equal(ingest.rejected, expectedRejected);
  assert.equal(ingest.deliveries, expectedUnique + expectedDupes + expectedRejected);
  assert.ok(expectedDupes > 100 && expectedRejected > 50, 'fixture exercises noise');
});

test('reconciliation: rejection reasons recorded match what was injected', () => {
  const { db, synth } = seeded();
  const got = Object.fromEntries(db.prepare("SELECT reason_code, SUM(count) AS n FROM ingest_outcomes WHERE outcome='rejected' GROUP BY reason_code").all().map((r) => [r.reason_code, Number(r.n)]));
  assert.deepEqual(got, synth.expected.rejected);
});

test('reconciliation: portal read model totals equal rollups for the full window', () => {
  const { db, manifest, synth } = seeded();
  for (const t of manifest.tenants) {
    const s = new TenantScope(db, t.tenant_id, 'test');
    const tot = s.totals('2026-08-01', '2026-11-05');
    for (const m of METRICS) assert.equal((tot.sponsored_card[m] || 0) + (tot.organic_listing[m] || 0), synth.expected.byTenant[t.tenant_id][m]);
  }
});

test('rollup: recomputing a range is idempotent', () => {
  const { db, manifest } = seeded();
  const t = manifest.tenants[0];
  const before = db.prepare('SELECT SUM(value) AS v, COUNT(*) AS n FROM daily_metrics WHERE tenant_id = ?').get(t.tenant_id);
  rollupRange(db, { from: '2026-08-01', to: '2026-11-05', tenantId: t.tenant_id, computedAt: AS_OF });
  rollupRange(db, { from: '2026-08-01', to: '2026-11-05', tenantId: t.tenant_id, computedAt: AS_OF });
  const after = db.prepare('SELECT SUM(value) AS v, COUNT(*) AS n FROM daily_metrics WHERE tenant_id = ?').get(t.tenant_id);
  assert.deepEqual(after, before);
});

test('seed: the full pipeline is deterministic for a fixed seed', () => {
  const a = seeded();
  const db2 = openDb(':memory:');
  const b = seedAll(db2, loadManifest(), { asOf: AS_OF });
  assert.deepEqual(b.synth.expected, a.synth.expected);
  const sig = (db) => db.prepare('SELECT tenant_id, metric, SUM(value) AS v FROM daily_metrics GROUP BY tenant_id, metric ORDER BY tenant_id, metric').all().map((r) => ({ ...r }));
  assert.deepEqual(sig(db2), sig(a.db));
});

test('retention: purging raw events keeps finalized daily rollups', () => {
  const db2 = openDb(':memory:');
  seedAll(db2, loadManifest(), { asOf: AS_OF });
  const before = Number(db2.prepare("SELECT SUM(value) AS v FROM daily_metrics WHERE metric_date < '2026-09-01'").get().v);
  const purged = purgeRawEvents(db2, { olderThanLocalDate: '2026-09-01' });
  assert.ok(purged > 0);
  assert.equal(Number(db2.prepare("SELECT COUNT(*) AS n FROM events WHERE local_date < '2026-09-01'").get().n), 0);
  assert.equal(Number(db2.prepare("SELECT SUM(value) AS v FROM daily_metrics WHERE metric_date < '2026-09-01'").get().v), before);
});
