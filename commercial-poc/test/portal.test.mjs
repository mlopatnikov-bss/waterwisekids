import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { openDb } from '../src/db.mjs';
import { loadManifest as loadIntoDb } from '../src/registry.mjs';
import { TenantScope } from '../src/scope.mjs';
import { createAuth, ProductionAuthNotConfigured } from '../src/portal/auth.mjs';
import { createPortalHandler, SECURITY_HEADERS, resolveRange } from '../src/portal/server.mjs';
import { POC_ROOT } from '../src/config.mjs';
import { seeded, listen, demoLogin, demoUser, loadManifest, AS_OF } from './helpers.mjs';

const { db, manifest, synth } = seeded();
const T = Object.fromEntries(manifest.tenants.map((t) => [t.tenant_key, t]));
let srv; let ownerCookie; let partnerCookie;
before(async () => {
  srv = await listen(createPortalHandler({ db, auth: createAuth({ mode: 'demo', db }), asOf: AS_OF, log: () => {} }));
  ownerCookie = (await demoLogin(srv.base, demoUser(manifest, 'demo-owner-nwp-js').user_id)).cookie;
  partnerCookie = (await demoLogin(srv.base, demoUser(manifest, 'demo-partner-manhattan').user_id)).cookie;
});
after(async () => { await srv.close(); });
const page = async (path, cookie = ownerCookie) => { const r = await fetch(`${srv.base}${path}`, { headers: { Cookie: cookie }, redirect: 'manual' }); return { status: r.status, headers: r.headers, body: await r.text() }; };
const dataValues = (body) => Object.fromEntries([...body.matchAll(/data-metric="([a-z_]+)" data-value="([^"]*)"/g)].map((m) => [m[1], m[2]]));

test('portal: KPI values equal the scoped rollup totals for the default 28-day range', async () => {
  for (const [key, cookie] of [['northwest-philadelphia', ownerCookie], ['jersey-shore', ownerCookie], ['manhattan', partnerCookie]]) {
    const { status, body } = await page(`/t/${T[key].tenant_id}/`, cookie);
    assert.equal(status, 200);
    const s = new TenantScope(db, T[key].tenant_id, 'test');
    const tot = s.totals('2026-10-05', '2026-11-01');
    const v = dataValues(body);
    assert.equal(Number(v.eligible_view), tot.sponsored_card.eligible_view);
    assert.equal(Number(v.viewable_impression), tot.sponsored_card.viewable_impression);
    assert.equal(Number(v.sponsored_click), tot.sponsored_card.sponsored_click);
    assert.equal(Number(v.outbound_click), tot.sponsored_card.outbound_click + tot.organic_listing.outbound_click);
    assert.ok(body.includes('Showing Oct 5, 2026 – Nov 1, 2026'));
  }
});

test('portal: full-window figures reconcile with the synthetic generator', async () => {
  const t = T['northwest-philadelphia'];
  const { body } = await page(`/t/${t.tenant_id}/?from=2026-08-04&to=2026-11-01`);
  const v = dataValues(body);
  assert.equal(Number(v.outbound_click), synth.expected.byTenant[t.tenant_id].outbound_click);
  assert.equal(Number(v.sponsored_click), synth.expected.byTenant[t.tenant_id].sponsored_click);
});

test('portal: every metric carries an Observed, Reported or Derived badge', async () => {
  const { body } = await page(`/t/${T['jersey-shore'].tenant_id}/`);
  const kpis = body.split('class="kpi"').slice(1);
  assert.equal(kpis.length, 8);
  for (const k of kpis) assert.match(k, /badge badge-(observed|reported|derived)/);
  assert.ok(body.includes('Correlation, not attribution.'));
  assert.ok(body.includes('A click is not a lead.'));
  assert.ok(body.includes('Synthetic fixture data.'));
  assert.ok(body.includes('Sponsored pilot'));
});

test('portal: data-quality warnings are visible (stale Manhattan feed, Jersey Shore outage day, pending locations)', async () => {
  const man = (await page(`/t/${T.manhattan.tenant_id}/`, partnerCookie)).body;
  assert.match(man, /Data status: <span class="sev sev-critical">Critical/);
  assert.ok(man.includes('2026-10-30, 2026-10-31, 2026-11-01'));
  assert.ok(man.includes('No reported conversions for this range.'));
  assert.ok(man.includes('East Village'));
  const js = (await page(`/t/${T['jersey-shore'].tenant_id}/`)).body;
  assert.match(js, /Data status: <span class="sev sev-warn">Warning/);
  assert.ok(js.includes('2026-10-12'));
  assert.ok(js.includes('Needs owner confirmation'));
});

test('portal: empty state for a range with no data, and invalid ranges fall back to the default', async () => {
  const empty = (await page(`/t/${T['northwest-philadelphia'].tenant_id}/?from=2026-01-01&to=2026-01-31`)).body;
  assert.ok(empty.includes('No observed data in this date range'));
  const bad = await page(`/t/${T['northwest-philadelphia'].tenant_id}/?from=<script>&to=2026-99-99`);
  assert.equal(bad.status, 200);
  assert.ok(bad.body.includes('Showing Oct 6, 2026 – Nov 2, 2026'));
  assert.equal(bad.body.includes('<script>'), false);
  assert.deepEqual(resolveRange(new URLSearchParams('from=2026-01-01&to=2026-12-31'), { asOf: AS_OF, timezone: 'America/New_York' }), { from: '2026-07-06', to: '2026-11-02', adjusted: true });
});

test('portal: error state hides internals and returns 500 with a reference', async () => {
  const db2 = openDb(':memory:');
  loadIntoDb(db2, loadManifest(), { at: AS_OF });
  db2.exec('DROP TABLE daily_metrics');
  const s2 = await listen(createPortalHandler({ db: db2, auth: createAuth({ mode: 'demo', db: db2 }), asOf: AS_OF, log: () => {} }));
  try {
    const { cookie } = await demoLogin(s2.base, demoUser(manifest, 'demo-partner-manhattan').user_id);
    const r = await fetch(`${s2.base}/t/${T.manhattan.tenant_id}/`, { headers: { Cookie: cookie } });
    const body = await r.text();
    assert.equal(r.status, 500);
    assert.ok(body.includes('Something went wrong'));
    assert.match(body, /Reference: <code>[a-f0-9]{12}<\/code>/);
    assert.equal(/daily_metrics|no such table|at .*\.mjs/.test(body), false);
  } finally { await s2.close(); }
});

test('portal: data is HTML-escaped', async () => {
  const db2 = openDb(':memory:');
  loadIntoDb(db2, loadManifest(), { at: AS_OF });
  db2.prepare('UPDATE tenants SET display_name = ? WHERE tenant_id = ?').run('<script>alert(1)</script>"><img src=x onerror=alert(1)>', T.manhattan.tenant_id);
  const s2 = await listen(createPortalHandler({ db: db2, auth: createAuth({ mode: 'demo', db: db2 }), asOf: AS_OF, log: () => {} }));
  try {
    const { cookie } = await demoLogin(s2.base, demoUser(manifest, 'demo-partner-manhattan').user_id);
    const body = await (await fetch(`${s2.base}/t/${T.manhattan.tenant_id}/`, { headers: { Cookie: cookie } })).text();
    assert.equal(body.includes('<script>alert(1)'), false);
    assert.equal(body.includes('<img src=x'), false);
    assert.ok(body.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  } finally { await s2.close(); }
});

test('portal: security headers, no scripts, no inline styles, session cookie flags', async () => {
  const r = await page(`/t/${T['northwest-philadelphia'].tenant_id}/`);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) assert.equal(r.headers.get(k), v, k);
  assert.equal(/<script\b/i.test(r.body), false);
  assert.equal(/\sstyle="/i.test(r.body), false);
  assert.equal(/\son[a-z]+="/i.test(r.body), false);
  const login = await fetch(`${srv.base}/demo/login`, { method: 'POST', redirect: 'manual', headers: { Origin: srv.base, 'Content-Type': 'application/x-www-form-urlencoded' }, body: `user_id=${demoUser(manifest, 'demo-no-access').user_id}` });
  const sc = login.headers.get('set-cookie');
  assert.match(sc, /HttpOnly/); assert.match(sc, /SameSite=Strict/);
});

test('portal: cross-site login/logout posts are refused; unknown demo users are refused', async () => {
  const evil = await fetch(`${srv.base}/demo/login`, { method: 'POST', redirect: 'manual', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/x-www-form-urlencoded' }, body: `user_id=${demoUser(manifest, 'demo-owner-nwp-js').user_id}` });
  assert.equal(evil.status, 403);
  assert.equal(evil.headers.get('set-cookie'), null);
  const out = await fetch(`${srv.base}/demo/logout`, { method: 'POST', redirect: 'manual', headers: { Origin: 'https://evil.example' } });
  assert.equal(out.status, 403);
  const unknown = await fetch(`${srv.base}/demo/login`, { method: 'POST', redirect: 'manual', headers: { Origin: srv.base, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'user_id=usr_0000000000000000' });
  assert.equal(unknown.status, 400);
  assert.equal(unknown.headers.get('set-cookie'), null);
});

test('auth: production mode refuses to start; demo refuses NODE_ENV=production; server refuses non-loopback', () => {
  assert.throws(() => createAuth({ mode: 'production', db }), ProductionAuthNotConfigured);
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try { assert.throws(() => createAuth({ mode: 'demo', db }), /NODE_ENV=production/); } finally { process.env.NODE_ENV = prev; if (prev === undefined) delete process.env.NODE_ENV; }
  const r = spawnSync(process.execPath, [join(POC_ROOT, 'scripts/serve.mjs')], { env: { ...process.env, POC_HOST: '0.0.0.0' }, encoding: 'utf8', timeout: 10000 });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /loopback only/);
  // Production mode must refuse before opening (and so migrating) any database file.
  const probe = join(tmpdir(), `wwk-poc-never-created-${process.pid}.sqlite`);
  const p = spawnSync(process.execPath, [join(POC_ROOT, 'scripts/serve.mjs'), '--db', probe], { env: { ...process.env, POC_AUTH_MODE: 'production' }, encoding: 'utf8', timeout: 10000 });
  assert.equal(p.status, 3);
  assert.match(p.stderr, /Production auth adapter is not configured/);
  assert.equal(existsSync(probe), false);
});

test('accessibility: structure, labels, captions, landmarks and chart alternatives', async () => {
  const { body } = await page(`/t/${T['jersey-shore'].tenant_id}/`);
  assert.match(body, /<html lang="en">/);
  assert.match(body, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  assert.match(body, /<a class="skip-link" href="#main">/);
  assert.match(body, /<main id="main"/);
  assert.equal((body.match(/<h1[\s>]/g) || []).length, 1);
  assert.equal(/<h[3-6][\s>]/.test(body), false, 'no skipped heading levels');
  const tables = body.split('<table').slice(1);
  assert.ok(tables.length >= 6);
  for (const t of tables) { assert.match(t, /<caption>/); assert.match(t, /<th scope="col"/); }
  for (const m of body.matchAll(/<input id="([^"]+)"/g)) assert.ok(body.includes(`<label for="${m[1]}">`), m[1]);
  for (const m of body.matchAll(/<svg class="chart"[^>]*>/g)) { assert.match(m[0], /role="img"/); assert.match(m[0], /aria-labelledby=/); }
  assert.ok(body.includes('Show daily numbers as a table'));
  for (const m of body.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)) assert.ok(m[1].trim().length > 0);
  assert.ok(body.includes('aria-current="page"'));
});
