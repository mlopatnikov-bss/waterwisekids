import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TenantScope, scopeForSession } from '../src/scope.mjs';
import { createAuth } from '../src/portal/auth.mjs';
import { createPortalHandler } from '../src/portal/server.mjs';
import { POC_ROOT } from '../src/config.mjs';
import { seeded, listen, demoLogin, demoUser, tenantByKey, AS_OF } from './helpers.mjs';

const { db, manifest } = seeded();
const T = Object.fromEntries(manifest.tenants.map((t) => [t.tenant_key, t]));
const owner = demoUser(manifest, 'demo-owner-nwp-js');
const partner = demoUser(manifest, 'demo-partner-manhattan');
const nobody = demoUser(manifest, 'demo-no-access');

function idsOf(tenantId) {
  const s = new Set([tenantId]);
  const keys = { schools: 'school_id', locations: 'location_id', destinations: 'destination_id', campaigns: 'campaign_id', placements: 'placement_id' };
  for (const [coll, key] of Object.entries(keys)) for (const r of manifest[coll]) if (r.tenant_id === tenantId) s.add(r[key]);
  return s;
}

test('isolation: every TenantScope read returns only its own tenant\'s ids and names', () => {
  for (const t of manifest.tenants) {
    const s = new TenantScope(db, t.tenant_id, 'test');
    const from = '2026-08-01'; const to = '2026-11-05';
    const out = JSON.stringify([s.tenant(), s.campaigns(), s.locations(), s.dataExtent(), s.totals(from, to), s.daily(from, to), s.byPlacement(from, to),
      s.byLocation(from, to), s.byDestination(from, to), s.conversions(from, to), s.conversionTotals(from, to), s.lastConversionImport(), s.baselineComparison(), s.latestQuality()]);
    for (const other of manifest.tenants.filter((x) => x.tenant_id !== t.tenant_id)) {
      for (const id of idsOf(other.tenant_id)) assert.equal(out.includes(id), false, `${t.tenant_key} leaked ${id} of ${other.tenant_key}`);
      assert.equal(out.includes(other.display_name), false, `${t.tenant_key} leaked ${other.display_name}`);
    }
    for (const id of [...idsOf(t.tenant_id)].filter((x) => x.startsWith('plc_'))) assert.ok(out.includes(id), 'own placements present');
  }
});

function stringLiterals(src) {
  const out = []; let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '`' || c === "'" || c === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== c) { if (src[j] === '\\') j += 1; j += 1; }
      out.push(src.slice(i + 1, j)); i = j + 1;
    } else if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i += 1; } else i += 1;
  }
  return out;
}

test('isolation: every SQL statement in the scoped read model binds tenant_id', () => {
  const src = readFileSync(join(POC_ROOT, 'src/scope.mjs'), 'utf8');
  const cls = src.slice(src.indexOf('export class TenantScope'), src.indexOf('function pivot'));
  const sqls = stringLiterals(cls).filter((s) => /\bSELECT\b/.test(s));
  assert.ok(sqls.length >= 12, `found ${sqls.length} statements`);
  for (const sql of sqls) assert.match(sql, /\btenant_id = \?(1(?!\d)|(?!\d))/, sql.slice(0, 80));
  assert.equal((cls.match(/this\.db\.prepare/g) || []).length, 2, 'only the two binding helpers touch the db');
});

test('isolation: scopes are only issued to members', () => {
  const sess = (u) => ({ userId: u.user_id });
  assert.ok(scopeForSession(db, sess(owner), T['northwest-philadelphia'].tenant_id));
  assert.ok(scopeForSession(db, sess(owner), T['jersey-shore'].tenant_id));
  assert.equal(scopeForSession(db, sess(owner), T.manhattan.tenant_id), null);
  assert.equal(scopeForSession(db, sess(partner), T['jersey-shore'].tenant_id), null);
  for (const t of manifest.tenants) assert.equal(scopeForSession(db, sess(nobody), t.tenant_id), null);
  assert.equal(scopeForSession(db, null, T.manhattan.tenant_id), null);
});

let srv; let auth;
before(async () => {
  auth = createAuth({ mode: 'demo', db });
  srv = await listen(createPortalHandler({ db, auth, asOf: AS_OF, log: () => {} }));
});
after(async () => { await srv.close(); });

const get = (path, cookie) => fetch(`${srv.base}${path}`, { redirect: 'manual', headers: cookie ? { Cookie: cookie } : {} });

test('http isolation: a two-tenant owner sees both of their schools and gets 404 for Manhattan', async () => {
  const { cookie } = await demoLogin(srv.base, owner.user_id);
  for (const key of ['northwest-philadelphia', 'jersey-shore']) {
    const r = await get(`/t/${T[key].tenant_id}/`, cookie);
    assert.equal(r.status, 200);
    const body = await r.text();
    assert.ok(body.includes(T[key].display_name));
    assert.equal(body.includes(T.manhattan.display_name), false);
    assert.equal(body.includes(T.manhattan.tenant_id), false);
  }
  for (const path of [`/t/${T.manhattan.tenant_id}/`, `/t/${T.manhattan.tenant_id}/quality.json`, `/t/${T.manhattan.tenant_id}/?tenant_id=${T.manhattan.tenant_id}`]) {
    const r = await get(path, cookie);
    assert.equal(r.status, 404, path);
    const body = await r.text();
    assert.equal(body.includes(T.manhattan.display_name), false);
  }
});

test('http isolation: the Manhattan partner cannot read either Mike tenant, by id, query or JSON', async () => {
  const { cookie } = await demoLogin(srv.base, partner.user_id);
  const home = await get('/', cookie);
  assert.equal(home.headers.get('location'), `/t/${T.manhattan.tenant_id}/`);
  for (const key of ['northwest-philadelphia', 'jersey-shore']) {
    assert.equal((await get(`/t/${T[key].tenant_id}/`, cookie)).status, 404);
    assert.equal((await get(`/t/${T[key].tenant_id}/quality.json`, cookie)).status, 404);
  }
  const own = await (await get(`/t/${T.manhattan.tenant_id}/?tenant=${T['jersey-shore'].tenant_id}`, cookie)).text();
  assert.equal(own.includes(T['jersey-shore'].display_name), false);
  const q = await (await get(`/t/${T.manhattan.tenant_id}/quality.json`, cookie)).json();
  assert.equal(q.tenant_id, T.manhattan.tenant_id);
});

test('http isolation: unknown, malformed and non-member tenant ids are indistinguishable (404)', async () => {
  const { cookie } = await demoLogin(srv.base, nobody.user_id);
  const home = await (await get('/', cookie)).text();
  assert.ok(home.includes('No school is linked to this account'));
  const bodies = [];
  for (const path of [`/t/${T.manhattan.tenant_id}/`, '/t/ten_0000000000000000/', `/t/${T.manhattan.tenant_id.toUpperCase()}/`, '/t/British%20Swim%20School%20of%20Manhattan/']) {
    const r = await get(path, cookie);
    assert.equal(r.status, 404, path);
    bodies.push((await r.text()).replace(/ten_[a-f0-9]{16}/g, ''));
  }
  assert.equal(new Set(bodies).size, 1, 'same response for every denied id');
});

test('http isolation: no session, forged, tampered and foreign-key cookies are all rejected', async () => {
  const path = `/t/${T['jersey-shore'].tenant_id}/`;
  assert.equal((await get(path)).headers.get('location'), '/demo/login');
  const { cookie } = await demoLogin(srv.base, partner.user_id);
  const [name, token] = cookie.split('=');
  const [body, sig] = token.split('.');
  const claims = JSON.parse(Buffer.from(body, 'base64url').toString());
  const forgedBody = Buffer.from(JSON.stringify({ ...claims, u: owner.user_id })).toString('base64url');
  assert.equal((await get(path, `${name}=${forgedBody}.${sig}`)).status, 303, 'payload swap with old signature');
  // Flip every bit of the first signature byte (deterministic; editing trailing base64
  // characters can leave the decoded bytes unchanged and made this check flaky in R1).
  const flipped = Buffer.from(sig, 'base64url'); flipped[0] ^= 0xff;
  assert.equal((await get(path, `${name}=${body}.${flipped.toString('base64url')}`)).status, 303, 'tampered signature');
  const otherAuth = createAuth({ mode: 'demo', db });
  assert.equal((await get(path, `${name}=${otherAuth.login(owner.user_id)}`)).status, 303, 'token from a different signing key');
  assert.equal((await get(path, `${name}=garbage`)).status, 303);
});

test('http isolation: revoking a membership takes effect on the next request', async () => {
  const { cookie } = await demoLogin(srv.base, owner.user_id);
  const path = `/t/${T['jersey-shore'].tenant_id}/`;
  assert.equal((await get(path, cookie)).status, 200);
  const row = db.prepare('SELECT * FROM tenant_memberships WHERE user_id = ? AND tenant_id = ?').get(owner.user_id, T['jersey-shore'].tenant_id);
  db.prepare('DELETE FROM tenant_memberships WHERE user_id = ? AND tenant_id = ?').run(owner.user_id, T['jersey-shore'].tenant_id);
  try {
    assert.equal((await get(path, cookie)).status, 404);
  } finally {
    db.prepare('INSERT INTO tenant_memberships (tenant_id, user_id, role) VALUES (?,?,?)').run(row.tenant_id, row.user_id, row.role);
  }
  assert.equal(tenantByKey(manifest, 'jersey-shore').tenant_id, row.tenant_id);
});
