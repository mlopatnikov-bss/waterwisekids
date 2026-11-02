// Public collector Worker: CORS, limits, schema/ownership/dedupe, privacy and refusal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadedDb, validEvent, destinationFor, collect, ORIGIN, NOW } from './collector-support.mjs';
import { STAGING_ROOT, untouchableDb } from './support.mjs';
import { TABLES } from '../scripts/lib/sql-dump.mjs';
import { handleCollector, MAX_BATCH_EVENTS, MAX_BODY_BYTES } from '../src/collector/worker.mjs';

const dumpAll = async (db) => {
  let s = '';
  for (const [t] of TABLES) s += JSON.stringify((await db.prepare(`SELECT * FROM ${t}`).all()).results);
  return s;
};
const count = async (db, sql, ...p) => Number((await db.prepare(sql).bind(...p).first()).n);

test('routes: only /v1/collect and /v1/health exist; health is minimal and never touches D1', async () => {
  const db = await loadedDb();
  for (const path of ['/', '/t/ten_b234a48144f47f06/', '/assets/portal.css', '/v1/collect/x', '/v1/healthz', '/admin']) {
    const r = await collect(db, undefined, { path, method: 'GET' });
    assert.equal(r.status, 404, path);
    assert.deepEqual(r.json, { error: 'not_found' });
  }
  const { db: un, touched } = untouchableDb();
  const h = await handleCollector(new Request('https://c.invalid/v1/health'), { DB: un, ALLOWED_ORIGIN: ORIGIN, COLLECTOR_ENV: 'local' }, {});
  assert.equal(h.status, 200);
  assert.deepEqual(await h.json(), { ok: true, schema_version: 1 });
  assert.deepEqual(touched, [], 'health never reads D1 (no counts, no tenant data)');
  assert.equal((await collect(db, {}, { path: '/v1/health', method: 'POST' })).status, 405);
});

test('CORS: exactly https://www.waterwisekids.com; no wildcard, no reflection, no credentials', async () => {
  const db = await loadedDb();
  const ok = await collect(db, validEvent());
  assert.equal(ok.status, 202);
  assert.equal(ok.res.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(ok.res.headers.get('vary'), 'Origin');
  assert.equal(ok.res.headers.get('access-control-allow-credentials'), null);
  for (const origin of ['https://evil.example.com', 'http://www.waterwisekids.com', 'https://waterwisekids.com', 'https://www.waterwisekids.com.evil.example', 'null', '*']) {
    const r = await collect(db, validEvent(), { origin });
    assert.equal(r.status, 403, origin);
    assert.equal(r.res.headers.get('access-control-allow-origin'), null, origin);
    const pre = await collect(db, undefined, { origin, method: 'OPTIONS', ctype: null });
    assert.equal(pre.status, 403); assert.equal(pre.res.headers.get('access-control-allow-origin'), null);
  }
  const noOrigin = await collect(db, validEvent(), { origin: null });
  assert.equal(noOrigin.status, 403, 'browsers always send Origin on POST; requests without it are refused');
  const pre = await collect(db, undefined, { method: 'OPTIONS', ctype: null });
  assert.equal(pre.status, 204);
  assert.equal(pre.res.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(pre.res.headers.get('access-control-allow-methods'), 'POST');
  assert.equal(await count(db, 'SELECT COUNT(*) AS n FROM events'), 1, 'refused origins stored nothing');
});

test('content types, query strings, malformed JSON and envelopes', async () => {
  const db = await loadedDb();
  assert.equal((await collect(db, validEvent(), { ctype: 'application/json' })).status, 202);
  assert.equal((await collect(db, validEvent(), { ctype: 'text/plain;charset=UTF-8' })).status, 202);
  for (const ctype of ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/html', null]) assert.equal((await collect(db, validEvent(), { ctype })).status, 415, String(ctype));
  assert.equal((await collect(db, validEvent(), { path: '/v1/collect?email=x' })).status, 400);
  assert.equal((await collect(db, '{not json')).status, 400);
  assert.equal((await collect(db, [])).status, 400);
  assert.equal((await collect(db, { events: [] })).status, 400);
  assert.equal((await collect(db, { events: [validEvent()], extra: 1 })).status, 400);
  assert.equal((await collect(db, validEvent(), { method: 'PUT' })).status, 405);
});

test('limits: 25 events per request, 2 KB per event, 51,200-byte body (declared or streamed)', async () => {
  const db = await loadedDb();
  assert.equal(MAX_BATCH_EVENTS, 25); assert.equal(MAX_BODY_BYTES, 51200);
  const ok = await collect(db, { events: Array.from({ length: 25 }, () => validEvent()) });
  assert.equal(ok.status, 202); assert.equal(ok.json.accepted, 25);
  assert.equal((await collect(db, { events: Array.from({ length: 26 }, () => validEvent()) })).status, 413);
  assert.equal((await collect(db, { ...validEvent(), page_path: `/${'a'.repeat(2100)}` })).status, 413);
  assert.equal((await collect(db, validEvent(), { headers: { 'Content-Length': String(MAX_BODY_BYTES + 1) } })).status, 413);
  const big = new TextEncoder().encode(' '.repeat(MAX_BODY_BYTES + 10));
  const stream = new ReadableStream({ start(c) { c.enqueue(big.slice(0, 30000)); c.enqueue(big.slice(30000)); c.close(); } });
  const res = await handleCollector(new Request('https://c.invalid/v1/collect', { method: 'POST', body: stream, duplex: 'half', headers: { Origin: ORIGIN, 'Content-Type': 'text/plain' } }), { DB: db, ALLOWED_ORIGIN: ORIGIN, COLLECTOR_ENV: 'local' }, {}, { now: () => NOW, log() {} });
  assert.equal(res.status, 413, 'streamed body without Content-Length is capped');
});

test('schema, ownership, allowlists, timing and viewability use the accepted Phase 1 validator', async () => {
  const db = await loadedDb();
  const base = validEvent('jersey-shore');
  const other = validEvent('manhattan');
  const cases = [
    [{ ...base, tenant_id: other.tenant_id }, 'cross_tenant_reference'],
    [{ ...base, placement_id: other.placement_id }, 'cross_tenant_reference'],
    [{ ...base, page_path: '/swim-lessons/philadelphia.html' }, 'page_not_allowed_for_placement'],
    [{ ...base, site_host: 'staging.example.com' }, 'host_not_allowed'],
    [{ ...base, type: 'outbound_click', destination_id: destinationFor(other) }, 'cross_tenant_reference'],
    [{ ...base, occurred_at: new Date(NOW + 10 * 60_000).toISOString() }, 'timestamp_in_future'],
    [{ ...base, occurred_at: new Date(NOW - 73 * 3600_000).toISOString() }, 'timestamp_too_old'],
    [{ ...base, type: 'viewable_impression', viewability: { visible_ratio: 0.4, visible_ms: 1500 } }, 'below_viewability_threshold'],
    [{ ...base, type: 'viewable_impression', viewability: { visible_ratio: 0.9, visible_ms: 500 } }, 'below_viewability_threshold'],
    [{ ...base, type: 'viewable_impression' }, 'missing_viewability'],
    [{ ...base, v: 2 }, 'unsupported_schema_version'],
  ];
  for (const [ev, reason] of cases) {
    const r = await collect(db, ev);
    assert.equal(r.status, 202);
    assert.deepEqual(r.json, { accepted: 0, duplicates: 0, rejected: 1 }, reason);
    assert.deepEqual(r.logs[0].reasons, { [reason]: 1 }, reason);
  }
  const okv = await collect(db, { ...base, type: 'viewable_impression', viewability: { visible_ratio: 0.5, visible_ms: 1000 } });
  assert.equal(okv.json.accepted, 1);
  const ob = await collect(db, { ...base, page_view_id: base.page_view_id, event_id: validEvent().event_id, type: 'outbound_click', destination_id: destinationFor(base), location_id: undefined });
  assert.equal(ob.json.accepted + ob.json.rejected, 1);
  assert.equal(await count(db, 'SELECT COUNT(*) AS n FROM events'), 1 + ob.json.accepted);
});

test('dedupe: event-ID retries and same-page-view repeats never inflate events or rollups, even inside one request', async () => {
  const db = await loadedDb();
  const e = validEvent();
  const again = { ...e };
  const sameView = { ...e, event_id: validEvent().event_id };
  const r = await collect(db, { events: [e, again, sameView] });
  assert.deepEqual(r.json, { accepted: 1, duplicates: 2, rejected: 0 });
  assert.deepEqual(r.logs[0].reasons, { duplicate_event_id: 1, duplicate_semantic: 1 });
  const r2 = await collect(db, again);
  assert.deepEqual(r2.json, { accepted: 0, duplicates: 1, rejected: 0 });
  assert.equal(await count(db, 'SELECT COUNT(*) AS n FROM events'), 1);
  assert.equal(await count(db, "SELECT SUM(value) AS n FROM daily_metrics WHERE metric = 'eligible_view'"), 1);
  const oc = Object.fromEntries((await db.prepare('SELECT outcome, SUM(count) AS n FROM ingest_outcomes GROUP BY outcome').all()).results.map((x) => [x.outcome, x.n]));
  assert.deepEqual(oc, { accepted: 1, duplicate_event_id: 2, duplicate_semantic: 1 });
});

test('rollups are rebuilt exactly in the same transaction as the inserts', async () => {
  const db = await loadedDb();
  const evs = Array.from({ length: 20 }, () => validEvent('manhattan'));
  await collect(db, { events: evs });
  await collect(db, { events: evs.slice(0, 5).map((x) => ({ ...x, type: 'viewable_impression', event_id: validEvent().event_id, viewability: { visible_ratio: 0.8, visible_ms: 1200 } })) });
  const raw = (await db.prepare('SELECT event_type, COUNT(*) AS n FROM events GROUP BY event_type ORDER BY event_type').all()).results;
  const rolled = (await db.prepare('SELECT metric AS event_type, SUM(value) AS n FROM daily_metrics GROUP BY metric ORDER BY metric').all()).results;
  assert.deepEqual(rolled, raw);
  assert.deepEqual(raw.map((x) => x.n), [20, 5]);
});

test('privacy: PII fields/values are rejected; no header, IP, cookie, referrer, UA, URL or payload value is stored, logged or echoed', async () => {
  const db = await loadedDb();
  const PLANT = { ua: 'PlantedAgent/9.9 (Planted)', ip: '198.51.100.77', cookie: 'plantedcookie=zz9', ref: 'https://planted-referrer.invalid/secret-path?q=1', fwd: '203.0.113.99' };
  const headers = { 'User-Agent': PLANT.ua, 'CF-Connecting-IP': PLANT.ip, 'X-Forwarded-For': PLANT.fwd, Cookie: PLANT.cookie, Referer: PLANT.ref, 'X-Real-IP': PLANT.ip };
  const piiCases = [
    { ...validEvent(), email: 'parent@example.com' },
    { ...validEvent(), phone: '555-0100' },
    { ...validEvent(), child_name: 'Planted Child' },
    { ...validEvent(), ip_address: PLANT.ip },
    { ...validEvent(), page_path: '/swim-lessons/northwest-philadelphia.html?email=parent@example.com' },
    { ...validEvent(), referrer_category: 'parent@example.com' },
    { ...validEvent(), device_class: '203.0.113.5' },
    { ...validEvent(), page_view_id: '15551234567890' },
  ];
  for (const ev of piiCases) {
    const r = await collect(db, ev, { headers });
    assert.equal(r.status, 202);
    assert.deepEqual(r.json, { accepted: 0, duplicates: 0, rejected: 1 });
    assert.doesNotMatch(r.text, /example\.com|Planted|198\.51|203\.0|555/);
  }
  const good = await collect(db, { events: [validEvent(), validEvent('jersey-shore')] }, { headers });
  assert.equal(good.json.accepted, 2);
  assert.equal(good.res.headers.get('set-cookie'), null);
  const all = await dumpAll(db);
  for (const v of [...Object.values(PLANT), 'parent@example.com', 'Planted Child', '555-0100', 'secret-path', 'collector.wwk-staging.invalid']) assert.equal(all.includes(v), false, v);
  const logs = JSON.stringify([...good.logs]);
  for (const v of Object.values(PLANT)) assert.equal(logs.includes(v), false);
  const reasons = (await db.prepare("SELECT reason_code, SUM(count) AS n FROM ingest_outcomes WHERE outcome = 'rejected' GROUP BY reason_code ORDER BY reason_code").all()).results.map((r) => r.reason_code);
  assert.deepEqual(reasons, ['pii_field', 'pii_value'], 'the PII value scan runs before the path check');
});

test('logs and responses carry only counts and reason codes', async () => {
  const db = await loadedDb();
  const r = await collect(db, { events: [validEvent(), { ...validEvent(), email: 'x@example.com' }] });
  assert.deepEqual(Object.keys(r.json).sort(), ['accepted', 'duplicates', 'rejected']);
  const line = r.logs[0];
  assert.deepEqual(Object.keys(line).sort(), ['accepted', 'duplicates', 'reasons', 'rejected', 'status', 'worker']);
  for (const k of Object.keys(line.reasons)) assert.match(k, /^[a-z_]+$/);
  assert.doesNotMatch(JSON.stringify(line), /example\.com|ten_|plc_|sch_|cmp_|[0-9a-f]{8}-[0-9a-f]{4}/);
});

test('storage failure: 503 with a generic code, nothing echoed, error name only in logs', async () => {
  const db = await loadedDb();
  const broken = { prepare: (...a) => db.prepare(...a), batch: async () => { throw new Error('D1_ERROR: disk full parent@example.com'); } };
  const r = await collect(broken, validEvent());
  assert.equal(r.status, 503);
  assert.deepEqual(r.json, { error: 'temporarily_unavailable' });
  assert.doesNotMatch(JSON.stringify(r.logs), /disk full|example\.com/);
});

test('production refusal: missing D1, missing/wrong/wildcard origin or environment -> 503 before any read', async () => {
  const variants = [
    {}, { ALLOWED_ORIGIN: undefined }, { ALLOWED_ORIGIN: '*' }, { ALLOWED_ORIGIN: 'https://evil.example.com' }, { ALLOWED_ORIGIN: 'https://www.waterwisekids.com/' },
    { COLLECTOR_ENV: undefined }, { COLLECTOR_ENV: 'production' },
  ];
  for (const v of variants) {
    const { db, touched } = untouchableDb();
    const env = { DB: { prepare: db.prepare, batch: db.batch }, ALLOWED_ORIGIN: ORIGIN, COLLECTOR_ENV: 'local', ...v };
    if (Object.keys(v).length === 0) delete env.DB;
    const logs = [];
    const res = await handleCollector(new Request('https://c.invalid/v1/collect', { method: 'POST', body: JSON.stringify(validEvent()), headers: { Origin: ORIGIN, 'Content-Type': 'text/plain' } }), env, {}, { log: (l) => logs.push(l) });
    assert.equal(res.status, 503, JSON.stringify(v));
    assert.deepEqual(touched, []);
    assert.equal(logs[0].error, 'misconfigured');
  }
});

test('collector source reads only Origin, Content-Type and Content-Length, and has no portal or IP code', () => {
  const src = readFileSync(join(STAGING_ROOT, 'src/collector/worker.mjs'), 'utf8').replace(/^\s*\/\/.*$/gm, '');
  const reads = [...src.matchAll(/headers\.get\(\s*'([^']+)'\s*\)/g)].map((m) => m[1].toLowerCase()).sort();
  assert.deepEqual([...new Set(reads)], ['content-length', 'content-type', 'origin']);
  assert.doesNotMatch(src, /cf-connecting-ip|x-forwarded-for|user-agent|referer|cookie|request\.cf\b|portal|ctx\.access/i);
  const all = ['ingest.mjs', 'registry.mjs', 'rollup.mjs', 'd1.mjs'].map((f) => readFileSync(join(STAGING_ROOT, 'src/shared', f), 'utf8')).join('\n');
  assert.doesNotMatch(all, /headers|request\.cf|console\./);
});
