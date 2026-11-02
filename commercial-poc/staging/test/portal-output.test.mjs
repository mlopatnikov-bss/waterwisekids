// Portal output on the fully seeded staging D1: accepted views, parity with Phase 1,
// security headers, states, and refusal when configuration is missing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { get, T, U } from './portal-support.mjs';
import { seeded, phase1Seeded, IDENTITIES, untouchableDb, portalEnv, AS_OF, TEST_HMAC_KEY } from './support.mjs';
import { handlePortal, resolveRange, portalConfigProblems } from '../src/portal/worker.mjs';
import { adaptPage, LAYOUT_SWAPS } from '../src/portal/layout.mjs';
import { PORTAL_SECURITY_HEADERS } from '../src/shared/http.mjs';
import { TenantScope as StagingScope, membershipsFor } from '../src/shared/scope.mjs';
import { runQuality as stagingQuality, THRESHOLDS } from '../src/shared/quality.mjs';
import { PORTAL_CSS } from '../src/portal/portal-css.generated.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { POC_ROOT } from './support.mjs';

const NWP = T['northwest-philadelphia']; const JS = T['jersey-shore']; const MAN = T.manhattan;
const plain = (x) => JSON.parse(JSON.stringify(x));

test('every TenantScope method and the quality run equal the accepted Phase 1 read model on the same data', async () => {
  const s = await seeded(); const p = await phase1Seeded();
  const { TenantScope: P1Scope } = await import('../../src/scope.mjs');
  const { runQuality: p1Quality, THRESHOLDS: P1T } = await import('../../src/quality.mjs');
  assert.deepEqual(THRESHOLDS, P1T);
  const ranges = [['2026-10-05', '2026-11-01'], ['2026-08-04', '2026-11-01'], ['2026-09-01', '2026-09-07'], ['2025-01-01', '2025-01-31']];
  for (const t of s.manifest.tenants) {
    const a = new StagingScope(s.db, t.tenant_id, 'x'); const b = new P1Scope(p.db, t.tenant_id, 'x');
    for (const m of ['tenant', 'campaigns', 'locations', 'dataExtent', 'baselineComparison', 'lastConversionImport']) assert.deepEqual(plain(await a[m]()), plain(b[m]()), `${t.tenant_key}.${m}`);
    for (const [from, to] of ranges) {
      for (const m of ['totals', 'daily', 'byPlacement', 'byLocation', 'byDestination', 'conversions', 'conversionTotals']) assert.deepEqual(plain(await a[m](from, to)), plain(b[m](from, to)), `${t.tenant_key}.${m} ${from}`);
      assert.deepEqual(plain(await stagingQuality(s.db, { tenantId: t.tenant_id, asOf: AS_OF, from, to })), plain(p1Quality(p.db, { tenantId: t.tenant_id, asOf: AS_OF, from, to, record: false })), `${t.tenant_key} quality ${from}`);
    }
  }
});

test('the rendered dashboard is the accepted Phase 1 view, byte-for-byte, apart from the four staging layout swaps', async () => {
  const s = await seeded(); const p = await phase1Seeded();
  const { TenantScope: P1Scope, membershipsFor: p1Members } = await import('../../src/scope.mjs');
  const { runQuality: p1Quality } = await import('../../src/quality.mjs');
  const { overviewPage } = await import('../../src/portal/views.mjs');
  for (const [tid, email, userKey] of [[NWP, IDENTITIES.owner, 'demo-owner-nwp-js'], [JS, IDENTITIES.owner, 'demo-owner-nwp-js'], [MAN, IDENTITIES.partner, 'demo-partner-manhattan']]) {
    for (const q of ['', '?from=2026-09-03&to=2026-11-01', '?from=2025-01-01&to=2025-01-31']) {
      const got = await get(s.db, `/t/${tid}/${q}`, { email });
      assert.equal(got.status, 200);
      const label = (await s.db.prepare('SELECT display_label FROM users WHERE user_id = ?').bind(U[userKey]).first()).display_label;
      const sc = new P1Scope(p.db, tid, U[userKey]);
      const tenant = sc.tenant();
      const { from, to } = resolveRange(new URLSearchParams(q), { asOf: AS_OF, timezone: tenant.timezone });
      const expected = adaptPage(overviewPage({ session: { label }, memberships: p1Members(p.db, U[userKey]), tenant, from, to, asOf: AS_OF, extent: sc.dataExtent(),
        totals: sc.totals(from, to), conv: sc.conversionTotals(from, to), daily: sc.daily(from, to), placements: sc.byPlacement(from, to), locations: sc.byLocation(from, to),
        destinations: sc.byDestination(from, to), conversions: sc.conversions(from, to), quality: p1Quality(p.db, { tenantId: tid, asOf: AS_OF, from, to, record: false }),
        comparison: sc.baselineComparison(), campaigns: sc.campaigns() })).body;
      assert.equal(got.body, expected, `${tid}${q}`);
    }
  }
});

test('dashboard content: KPIs, funnel, trend, tables, reported conversions, definitions, freshness and quality states', async () => {
  const s = await seeded();
  const nwp = (await get(s.db, `/t/${NWP}/`, { email: IDENTITIES.owner })).body;
  for (const needle of ['Eligible views', 'Viewable impressions', 'Sponsored-card clicks', 'Clicks to your official site', 'Viewability rate', 'Sponsored-card CTR', 'Reported leads', 'Reported enrollments',
    'Observed', 'Reported', 'Derived', 'Data status', 'Booking system export (synthetic)', 'medium', 'British Swim School of Jersey Shore', 'type="date"', 'Last 7 days', 'Since campaign start']) assert.ok(nwp.includes(needle), needle);
  assert.match(nwp, /<table/);
  const js = (await get(s.db, `/t/${JS}/`, { email: IDENTITIES.owner })).body;
  assert.match(js, /2026-10-12|Oct 12, 2026/, 'Jersey Shore outage day is flagged');
  assert.match(js, /Owner weekly tally \(synthetic\)/);
  const man = (await get(s.db, `/t/${MAN}/`, { email: IDENTITIES.partner })).body;
  assert.match(man, /Critical/); assert.match(man, /Not reported/);
  const empty = (await get(s.db, `/t/${MAN}/?from=2025-01-01&to=2025-01-31`, { email: IDENTITIES.partner })).body;
  assert.match(empty, /No observed data in this date range/);
  const qj = await get(s.db, `/t/${JS}/quality.json`, { email: IDENTITIES.owner });
  assert.equal(qj.status, 200); assert.equal(qj.res.headers.get('content-type'), 'application/json; charset=utf-8');
  const q = JSON.parse(qj.body);
  assert.equal(q.tenant_id, JS); assert.equal(q.status, 'warn');
  assert.equal((await get(s.db, `/t/${JS}/quality.json`, { email: IDENTITIES.partner })).status, 404, 'quality is tenant-scoped');
  for (const path of ['/health', '/healthz', '/v1/health', '/operator/health', '/admin', '/v1/collect']) assert.equal((await get(s.db, path, { email: IDENTITIES.owner })).status, 404, `${path}: no operator-wide or collector route`);
});

test('error state: a storage failure after authentication returns the 500 page with a reference and no details', async () => {
  const s = await seeded();
  let n = 0;
  const flaky = { prepare: (sql) => { n += 1; if (/FROM daily_metrics/.test(sql)) throw new Error('D1_ERROR: planted failure detail'); return s.db.prepare(sql); }, batch: (x) => s.db.batch(x) };
  const r = await get(flaky, `/t/${NWP}/`, { email: IDENTITIES.owner });
  assert.equal(r.status, 500);
  assert.match(r.body, /Something went wrong/); assert.match(r.body, /Reference: <code>[0-9a-f]{12}<\/code>/);
  assert.doesNotMatch(r.body + JSON.stringify(r.logs), /planted failure detail/);
  assert.ok(n > 0);
});

test('security headers on every response type (200, 303, 403, 404, 405, 500, 503, CSS, JSON); no script, no inline style', async () => {
  const s = await seeded();
  const responses = [
    await get(s.db, `/t/${NWP}/`, { email: IDENTITIES.owner }), await get(s.db, '/', { email: IDENTITIES.owner }), await get(s.db, '/', { email: IDENTITIES.noTenant }),
    await get(s.db, '/', {}), await get(s.db, `/t/${MAN}/`, { email: IDENTITIES.owner }), await get(s.db, '/', { email: IDENTITIES.owner, method: 'POST' }),
    await get(s.db, '/assets/portal.css', { email: IDENTITIES.owner }), await get(s.db, `/t/${NWP}/quality.json`, { email: IDENTITIES.owner }),
    await get(s.db, '/', { email: IDENTITIES.owner, env: { IDENTITY_HMAC_KEY: undefined } }),
  ];
  assert.deepEqual(responses.map((r) => r.status), [200, 303, 403, 403, 404, 405, 200, 200, 503]);
  for (const r of responses) for (const [k, v] of Object.entries(PORTAL_SECURITY_HEADERS)) assert.equal(r.res.headers.get(k), v, `${r.status} ${k}`);
  const { SECURITY_HEADERS: P1 } = await import('../../src/portal/server.mjs');
  for (const [k, v] of Object.entries(P1)) assert.equal(PORTAL_SECURITY_HEADERS[k], v, `Phase 1 header ${k} kept`);
  for (const r of responses.filter((x) => /text\/html/.test(x.res.headers.get('content-type')))) {
    assert.doesNotMatch(r.body, /<script|\son[a-z]+=|style="|javascript:/i);
  }
  assert.equal(responses[6].body, PORTAL_CSS);
  assert.equal(PORTAL_CSS, readFileSync(join(POC_ROOT, 'src/portal/portal.css'), 'utf8'), 'CSS is the accepted Phase 1 stylesheet, served from Worker code');
});

test('layout adapter fails closed when a Phase 1 fragment is missing or duplicated', () => {
  const page = { status: 200, body: LAYOUT_SWAPS.map(([a]) => a).join('\n') };
  assert.doesNotThrow(() => adaptPage(page));
  assert.throws(() => adaptPage({ status: 200, body: page.body.replace(LAYOUT_SWAPS[2][0], '') }), /matched 0 times/);
  assert.throws(() => adaptPage({ status: 200, body: page.body + LAYOUT_SWAPS[1][0] }), /matched 2 times/);
  assert.throws(() => adaptPage({ status: 200, body: `${page.body}<a href="/demo/login">x</a>` }), /demo affordance/);
});

test('production refusal: missing/weak bindings or secrets -> 503 before reading anything', async () => {
  const cases = [
    { DB: undefined }, { IDENTITY_HMAC_KEY: undefined }, { IDENTITY_HMAC_KEY: 'REPLACE_WITH_openssl_rand_hex_32' }, { IDENTITY_HMAC_KEY: 'ab'.repeat(16) },
    { ACCESS_AUD: undefined }, { ACCESS_AUD: 'REPLACE_WITH_ACCESS_APPLICATION_AUD' }, { ACCESS_AUD: 'x' },
    { PORTAL_ENV: undefined }, { PORTAL_ENV: 'production' }, { PORTAL_ENV: 'staging' /* REPORT_AS_OF still set */ }, { REPORT_AS_OF: 'yesterday' },
  ];
  for (const c of cases) {
    const { db, touched } = untouchableDb();
    const env = { ...portalEnv(db), ...c };
    assert.ok(portalConfigProblems(env).length > 0, JSON.stringify(c));
    const res = await handlePortal(new Request(`https://p.invalid/t/${NWP}/`), env, { access: { aud: env.ACCESS_AUD, getIdentity: async () => ({ email: IDENTITIES.owner }) } }, { log() {} });
    assert.equal(res.status, 503, JSON.stringify(c));
    assert.deepEqual(touched, []);
    assert.doesNotMatch(await res.text(), /HMAC|AUD|REPLACE|ten_/);
  }
  assert.deepEqual(portalConfigProblems({ DB: (await seeded()).db, IDENTITY_HMAC_KEY: TEST_HMAC_KEY, ACCESS_AUD: 'abcdefgh12345678', PORTAL_ENV: 'staging' }), [], 'a complete staging configuration passes');
});

test('memberships and scopes are read fresh from D1 on each call (no in-memory cache)', async () => {
  const s = await seeded();
  const before = (await membershipsFor(s.db, U['demo-owner-nwp-js'])).length;
  await s.db.prepare("INSERT INTO tenant_memberships (tenant_id, user_id, role) VALUES (?, ?, 'viewer')").bind(MAN, U['demo-owner-nwp-js']).run();
  assert.equal((await membershipsFor(s.db, U['demo-owner-nwp-js'])).length, before + 1);
  assert.equal((await get(s.db, `/t/${MAN}/`, { email: IDENTITIES.owner })).status, 200);
  await s.db.prepare('DELETE FROM tenant_memberships WHERE tenant_id = ? AND user_id = ?').bind(MAN, U['demo-owner-nwp-js']).run();
  assert.equal((await get(s.db, `/t/${MAN}/`, { email: IDENTITIES.owner })).status, 404);
});
