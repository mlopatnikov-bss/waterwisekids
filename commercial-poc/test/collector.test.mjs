import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../src/db.mjs';
import { loadManifest as loadIntoDb, buildRegistry } from '../src/registry.mjs';
import { ingestBatch } from '../src/collector.mjs';
import { createCollectorHandler, RateLimiter, MAX_BATCH_EVENTS } from '../src/http-collector.mjs';
import { loadManifest, validEvent, listen } from './helpers.mjs';

const manifest = loadManifest();
const RECEIVED = Date.parse('2026-10-20T15:01:00.000Z');
function fresh() {
  const db = openDb(':memory:');
  loadIntoDb(db, manifest, { at: '2026-11-02T14:00:00.000Z' });
  return { db, registry: buildRegistry(db) };
}
const count = (db, sql = 'SELECT COUNT(*) AS n FROM events', ...p) => Number(db.prepare(sql).get(...p).n);

test('idempotency: the same event_id is stored once', () => {
  const { db, registry } = fresh();
  const e = validEvent(manifest, 'jersey-shore');
  const a = ingestBatch(db, registry, [e], { receivedAtMs: RECEIVED });
  const b = ingestBatch(db, registry, [e, { ...e }], { receivedAtMs: RECEIVED });
  assert.equal(a.accepted, 1);
  assert.equal(b.accepted, 0); assert.equal(b.duplicates, 2);
  assert.equal(count(db), 1);
});

test('dedupe: a re-fired view for the same page view and placement counts once', () => {
  const { db, registry } = fresh();
  const e = validEvent(manifest, 'jersey-shore');
  ingestBatch(db, registry, [e, { ...e, event_id: crypto.randomUUID() }], { receivedAtMs: RECEIVED });
  assert.equal(count(db), 1);
  const o = db.prepare("SELECT outcome, count FROM ingest_outcomes WHERE outcome LIKE 'duplicate%'").all();
  assert.deepEqual(o.map((x) => [x.outcome, x.count]), [['duplicate_semantic', 1]]);
});

test('dedupe: different page views are counted separately', () => {
  const { db, registry } = fresh();
  ingestBatch(db, registry, [validEvent(manifest, 'jersey-shore'), validEvent(manifest, 'jersey-shore')], { receivedAtMs: RECEIVED });
  assert.equal(count(db), 2);
});

test('rejections are counted by reason only; no payload is stored anywhere', () => {
  const { db, registry } = fresh();
  const planted = 'leaky.parent@example.com';
  const r = ingestBatch(db, registry, [{ ...validEvent(manifest, 'manhattan'), contact: planted }, validEvent(manifest, 'manhattan', { page_path: `/x/${planted}` })], { receivedAtMs: RECEIVED });
  assert.equal(r.rejected, 2);
  assert.equal(count(db), 0);
  const dump = dumpAll(db);
  assert.equal(dump.includes(planted), false);
  assert.equal(dump.includes('leaky'), false);
});

test('tenant ownership: rejected events never land in any tenant', () => {
  const { db, registry } = fresh();
  const js = manifest.tenants.find((t) => t.tenant_key === 'jersey-shore');
  const jsPlacement = manifest.placements.find((p) => p.tenant_id === js.tenant_id);
  ingestBatch(db, registry, [validEvent(manifest, 'manhattan', { placement_id: jsPlacement.placement_id })], { receivedAtMs: RECEIVED });
  assert.equal(count(db), 0);
});

function dumpAll(db) {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((t) => t.name);
  return tables.map((t) => JSON.stringify(db.prepare(`SELECT * FROM ${t}`).all())).join('\n');
}

test('http: accepts a batch, never stores IP or user agent, never echoes payload', async () => {
  const { db, registry } = fresh();
  const srv = await listen(createCollectorHandler({ db, registry, now: () => RECEIVED }));
  try {
    const ua = 'Mozilla/5.0 (Macintosh; UniqueTestAgent/9.9)';
    const events = [validEvent(manifest, 'northwest-philadelphia'), validEvent(manifest, 'northwest-philadelphia', {}, { type: 'viewable_impression' })];
    const res = await fetch(`${srv.base}/v1/collect`, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': ua, 'X-Forwarded-For': '203.0.113.77', Origin: 'https://www.waterwisekids.com', Cookie: 'sid=abc' }, body: JSON.stringify({ events }) });
    assert.equal(res.status, 202);
    assert.equal(res.headers.get('access-control-allow-origin'), 'https://www.waterwisekids.com');
    const body = await res.json();
    assert.deepEqual(body, { accepted: 2, duplicates: 0, rejected: 0 });
    const dump = dumpAll(db);
    for (const needle of ['UniqueTestAgent', '203.0.113.77', '127.0.0.1', 'sid=abc', 'Mozilla']) assert.equal(dump.includes(needle), false, needle);
  } finally { await srv.close(); }
});

test('http: refuses foreign origins, query strings, wrong methods and media types, oversize bodies', async () => {
  const { db, registry } = fresh();
  const srv = await listen(createCollectorHandler({ db, registry, now: () => RECEIVED }));
  const post = (path, init = {}) => fetch(`${srv.base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(init.headers || {}) }, body: init.body ?? JSON.stringify(validEvent(manifest, 'manhattan')) });
  try {
    assert.equal((await post('/v1/collect', { headers: { Origin: 'https://evil.example' } })).status, 403);
    assert.equal((await post('/v1/collect?email=a@b.co')).status, 400);
    assert.equal((await fetch(`${srv.base}/v1/collect`)).status, 405);
    assert.equal((await post('/v1/collect', { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })).status, 415);
    assert.equal((await post('/v1/collect', { body: '{not json' })).status, 400);
    assert.equal((await post('/v1/collect', { body: JSON.stringify({ events: [] }) })).status, 400);
    const many = Array.from({ length: MAX_BATCH_EVENTS + 1 }, () => validEvent(manifest, 'manhattan'));
    assert.equal((await post('/v1/collect', { body: JSON.stringify({ events: many }) })).status, 413);
    assert.equal((await post('/v1/collect', { body: 'x'.repeat(200_000) })).status, 413);
    assert.equal((await post('/v1/collect', { body: JSON.stringify({ events: [validEvent(manifest, 'manhattan')], email: 'a@b.co' }) })).status, 400);
    assert.equal(count(db), 0);
  } finally { await srv.close(); }
});

test('http: rate limiting returns 429 without storing anything', async () => {
  const { db, registry } = fresh();
  let t = RECEIVED;
  const limiter = new RateLimiter({ limit: 3, windowMs: 60_000, now: () => t });
  const srv = await listen(createCollectorHandler({ db, registry, rateLimiter: limiter, now: () => RECEIVED }));
  try {
    const statuses = [];
    for (let i = 0; i < 5; i += 1) statuses.push((await fetch(`${srv.base}/v1/collect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(validEvent(manifest, 'manhattan')) })).status);
    assert.deepEqual(statuses, [202, 202, 202, 429, 429]);
    assert.equal(count(db), 3);
    t += 61_000;
    assert.equal(limiter.allow('k'), true);
    assert.equal(limiter.counts.size, 1, 'limiter keys are cleared each window');
  } finally { await srv.close(); }
});
