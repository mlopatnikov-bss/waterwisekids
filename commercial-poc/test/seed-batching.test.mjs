import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb } from '../src/db.mjs';
import { seedAll } from '../src/pipeline.mjs';
import { reconcile } from '../src/rollup.mjs';
import { ingestBatch, ingestDeliveries } from '../src/collector.mjs';
import { buildRegistry, loadManifest as loadIntoDb } from '../src/registry.mjs';
import { MAX_BATCH_EVENTS } from '../src/http-collector.mjs';
import { SEED_TX_BATCH } from '../src/config.mjs';
import { seeded, loadManifest, validEvent, AS_OF } from './helpers.mjs';

const METRICS = ['eligible_view', 'viewable_impression', 'sponsored_click', 'outbound_click'];

/** Content hash of every table the seed writes (computed_at/as_of are fixed by AS_OF). */
function signature(db) {
  const q = (sql) => JSON.stringify(db.prepare(sql).all().map((r) => ({ ...r })));
  const parts = {
    events: q('SELECT * FROM events ORDER BY event_id'),
    ingest_outcomes: q('SELECT * FROM ingest_outcomes ORDER BY received_date, tenant_key, outcome, reason_code'),
    daily_metrics: q('SELECT * FROM daily_metrics ORDER BY metric_date, tenant_id, campaign_id, placement_id, location_key, page_path, destination_key, metric'),
    conversion_records: q('SELECT * FROM conversion_records ORDER BY tenant_id, conversion_date, conversion_type, location_key, attribution_basis, method'),
    data_quality_runs: q('SELECT run_id, tenant_id, status, checks_json FROM data_quality_runs ORDER BY run_id'),
  };
  return Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, createHash('sha256').update(v).digest('hex')]));
}

test('seed batching: the HTTP request cap is unchanged at 25 events', () => {
  assert.equal(MAX_BATCH_EVENTS, 25);
});

test('seed batching: default seed uses ceil(deliveries / SEED_TX_BATCH) transactions, far fewer than 25-event commits', () => {
  const { ingest } = seeded();
  assert.equal(ingest.tx_batch_size, SEED_TX_BATCH);
  assert.equal(ingest.transactions, Math.ceil(ingest.deliveries / SEED_TX_BATCH));
  const old = Math.ceil(ingest.deliveries / 25);
  assert.ok(ingest.transactions * 100 < old, `${ingest.transactions} transactions vs ${old} at 25 per commit`);
});

test('seed batching: 25-per-transaction, default and single-transaction seeds produce byte-identical tables and exact totals', () => {
  const base = seeded();
  const baseSig = signature(base.db);
  for (const txBatchSize of [25, Infinity]) {
    const db = openDb(':memory:');
    const r = seedAll(db, loadManifest(), { asOf: AS_OF, txBatchSize });
    assert.equal(r.ingest.transactions, txBatchSize === Infinity ? 1 : Math.ceil(r.ingest.deliveries / 25));
    assert.deepEqual({ a: r.ingest.accepted, d: r.ingest.duplicates, x: r.ingest.rejected }, { a: base.ingest.accepted, d: base.ingest.duplicates, x: base.ingest.rejected });
    assert.deepEqual(signature(db), baseSig, `txBatchSize=${txBatchSize}`);
    for (const t of base.manifest.tenants) {
      const rec = reconcile(db, { tenantId: t.tenant_id, from: '2000-01-01', to: '2999-12-31' });
      assert.equal(rec.ok, true);
      for (const m of METRICS) assert.equal(rec.events[m] || 0, base.synth.expected.byTenant[t.tenant_id][m], `${t.tenant_key} ${m} @${txBatchSize}`);
    }
    db.close();
  }
});

test('seed batching: invalid batch sizes are refused before anything is written', () => {
  for (const bad of [0, -5, 1.5, Number.NaN, '100', null]) {
    const db = openDb(':memory:');
    assert.throws(() => seedAll(db, loadManifest(), { asOf: AS_OF, txBatchSize: bad }), RangeError, String(bad));
    assert.equal(Number(db.prepare('SELECT COUNT(*) AS n FROM tenants').get().n), 0);
    db.close();
  }
});

test('collector core: per-delivery receipt times and validation are identical whether batched or not', () => {
  const manifest = loadManifest();
  const mk = () => { const db = openDb(':memory:'); loadIntoDb(db, manifest, { at: AS_OF }); return db; };
  const a = mk(); const b = mk();
  const ra = buildRegistry(a); const rb = buildRegistry(b);
  const t1 = Date.parse('2026-10-20T15:01:00.000Z');
  const good = validEvent(manifest, 'jersey-shore');
  const deliveries = [
    { payload: good, receivedAtMs: t1 },
    { payload: { ...good }, receivedAtMs: t1 + 1000 },                                    // retry -> duplicate_event_id
    { payload: { ...good, event_id: crypto.randomUUID() }, receivedAtMs: t1 + 2000 },     // re-fire -> duplicate_semantic
    { payload: { ...validEvent(manifest, 'jersey-shore'), email: 'a@example.com' }, receivedAtMs: t1 },  // pii_field
    { payload: validEvent(manifest, 'jersey-shore'), receivedAtMs: t1 - 100 * 3600000 }, // received 100 h earlier -> future
  ];
  const one = ingestDeliveries(a, ra, deliveries);
  const many = deliveries.map((d) => ingestBatch(b, rb, [d.payload], { receivedAtMs: d.receivedAtMs }));
  assert.deepEqual(one.results, many.flatMap((m) => m.results));
  assert.deepEqual(one.results.map((r) => r.reason || r.status), ['accepted', 'duplicate_event_id', 'duplicate_semantic', 'pii_field', 'timestamp_in_future']);
  assert.deepEqual(signature(a), signature(b));
  assert.throws(() => ingestDeliveries(a, ra, [{ payload: good }]), TypeError);
});

test('seed batching: file-backed seed keeps full durability settings and persists exact totals after reopen', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wwk-poc-seed-'));
  const path = join(dir, 'poc.sqlite');
  try {
    const db = openDb(path);
    assert.equal(db.prepare('PRAGMA journal_mode').get().journal_mode, 'delete');
    assert.equal(Number(db.prepare('PRAGMA synchronous').get().synchronous), 2, 'synchronous=FULL (SQLite default) is not lowered');
    const r = seedAll(db, loadManifest(), { asOf: AS_OF });
    db.close();
    const again = openDb(path);
    for (const t of loadManifest().tenants) {
      const rec = reconcile(again, { tenantId: t.tenant_id, from: '2000-01-01', to: '2999-12-31' });
      assert.equal(rec.ok, true);
      for (const m of METRICS) assert.equal(rec.events[m] || 0, r.synth.expected.byTenant[t.tenant_id][m]);
    }
    assert.equal(Number(again.prepare('SELECT COUNT(*) AS n FROM events').get().n), r.ingest.accepted);
    again.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
