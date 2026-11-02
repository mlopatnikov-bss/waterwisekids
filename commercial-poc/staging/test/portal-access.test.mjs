// Portal Worker: Cloudflare Access context, HMAC identity mapping, membership, revocation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accountsDb, get, T, U } from './portal-support.mjs';
import { IDENTITIES, TEST_HMAC_KEY, TEST_AUD, independentSubject, untouchableDb, portalEnv, testIdentity } from './support.mjs';
import { handlePortal } from '../src/portal/worker.mjs';
import { authSubjectFor, normalizeEmail, decodeHmacKey, AUTH_SUBJECT_RE } from '../src/shared/identity.mjs';
import { membershipsFor, scopeForUser } from '../src/shared/scope.mjs';
import { ADMIN_USER_ID } from '../scripts/lib/seed-pipeline.mjs';

const NWP = T['northwest-philadelphia']; const JS = T['jersey-shore']; const MAN = T.manhattan;

test('missing ctx.access is refused with 403 before ANY D1 read', async () => {
  const { db, touched } = untouchableDb();
  const env = portalEnv(db);
  for (const path of ['/', `/t/${NWP}/`, `/t/${NWP}/quality.json`, '/assets/portal.css', '/anything']) {
    for (const ctx of [undefined, {}, { access: null }, { access: undefined }]) {
      const res = await handlePortal(new Request(`https://p.invalid${path}`), env, ctx, { log() {} });
      assert.equal(res.status, 403, path);
      assert.doesNotMatch(await res.text(), /British Swim School|ten_/);
    }
  }
  assert.deepEqual(touched, []);
});

test('forged identity headers or cookies without a real ctx.access never grant access', async () => {
  const { db, touched } = untouchableDb();
  const headers = {
    'Cf-Access-Authenticated-User-Email': IDENTITIES.owner,
    'Cf-Access-Jwt-Assertion': 'eyJhbGciOiJSUzI1NiJ9.eyJlbWFpbCI6Im93bmVyIn0.forged',
    Cookie: 'CF_Authorization=eyJhbGciOiJSUzI1NiJ9.forged',
    'X-Forwarded-Email': IDENTITIES.owner,
  };
  const res = await handlePortal(new Request(`https://p.invalid/t/${NWP}/`, { headers }), portalEnv(db), { waitUntil() {} }, { log() {} });
  assert.equal(res.status, 403);
  assert.deepEqual(touched, []);
});

test('Access context from another application (aud mismatch) or without an email is refused before any read', async () => {
  const { db, touched } = untouchableDb();
  const cases = [
    { access: { aud: 'some-other-application-aud', getIdentity: async () => ({ email: IDENTITIES.owner }) } },
    { access: { aud: TEST_AUD, getIdentity: async () => ({}) } },
    { access: { aud: TEST_AUD, getIdentity: async () => ({ email: 'not-an-email' }) } },
    { access: { aud: TEST_AUD, getIdentity: async () => { throw new Error('identity endpoint down'); } } },
    { access: { aud: TEST_AUD } },
  ];
  for (const ctx of cases) {
    const res = await handlePortal(new Request(`https://p.invalid/t/${NWP}/`), portalEnv(db), ctx, { log() {} });
    assert.equal(res.status, 403);
  }
  assert.deepEqual(touched, [], 'service tokens and identities without email never reach D1');
});

test('identity mapping: HMAC-SHA-256 with the Worker secret; only the opaque subject is stored', async () => {
  const s = await authSubjectFor(TEST_HMAC_KEY, `  ${IDENTITIES.owner.toUpperCase()} `);
  assert.match(s, AUTH_SUBJECT_RE);
  assert.equal(s, independentSubject(TEST_HMAC_KEY, IDENTITIES.owner), 'matches an independent node:crypto HMAC');
  assert.equal(await authSubjectFor(TEST_HMAC_KEY, IDENTITIES.owner), s, 'case and whitespace normalized');
  const otherKey = 'ab'.repeat(32).replace(/^ab/, 'cd');
  assert.notEqual(await authSubjectFor(otherKey, IDENTITIES.owner), s, 'a different key gives a different subject');
  assert.equal(normalizeEmail('a b@x.y'), null); assert.equal(normalizeEmail('a@@x'), null); assert.equal(normalizeEmail(42), null);
  const db = await accountsDb();
  const users = JSON.stringify((await db.prepare('SELECT * FROM users').all()).results);
  assert.doesNotMatch(users, /@/, 'no email stored');
  assert.ok(users.includes(s));
});

test('HMAC key handling: hex >= 32 bytes only; placeholder, short, constant or non-hex keys are refused', () => {
  assert.ok(decodeHmacKey(TEST_HMAC_KEY));
  for (const bad of [undefined, '', 'short', '00'.repeat(32), 'aa'.repeat(31), 'REPLACE_WITH_openssl_rand_hex_32', 'z'.repeat(64), `${'ab'.repeat(32)}a`]) assert.equal(decodeHmacKey(bad), null, String(bad));
});

test('own tenant 200, foreign tenant 404 (same page as a non-existent tenant), no-membership 403', async () => {
  const db = await accountsDb();
  const own = await get(db, `/t/${NWP}/`, { email: IDENTITIES.owner });
  assert.equal(own.status, 200);
  assert.equal((await get(db, `/t/${JS}/`, { email: IDENTITIES.owner })).status, 200);
  const foreign = await get(db, `/t/${MAN}/`, { email: IDENTITIES.owner });
  const missing = await get(db, '/t/ten_0000000000000000/', { email: IDENTITIES.owner });
  assert.equal(foreign.status, 404); assert.equal(missing.status, 404);
  assert.equal(foreign.body, missing.body, 'foreign and non-existent tenants are indistinguishable');
  assert.equal((await get(db, `/t/${MAN}/`, { email: IDENTITIES.partner })).status, 200);
  assert.equal((await get(db, `/t/${NWP}/`, { email: IDENTITIES.partner })).status, 404);
  const none = await get(db, '/', { email: IDENTITIES.noTenant });
  assert.equal(none.status, 403); assert.match(none.body, /No school is linked/);
  assert.equal((await get(db, `/t/${NWP}/`, { email: IDENTITIES.noTenant })).status, 404);
  const stranger = await get(db, '/', { email: IDENTITIES.stranger });
  assert.equal(stranger.status, 403); assert.match(stranger.body, /No school is linked/);
  assert.equal((await get(db, `/t/${NWP}/`, { email: IDENTITIES.stranger })).status, 403);
  const root = await get(db, '/', { email: IDENTITIES.owner });
  assert.equal(root.status, 303); assert.match(root.res.headers.get('location'), /^\/t\/ten_[0-9a-f]{16}\/$/);
});

test('administrator can switch across every current and future account; school users remain scoped', async () => {
  const db = await accountsDb();
  for (const tenantId of [NWP, JS, MAN]) {
    assert.equal((await get(db, `/t/${tenantId}/`, { email: IDENTITIES.admin })).status, 200, tenantId);
    assert.equal((await get(db, `/t/${tenantId}/quality.json`, { email: IDENTITIES.admin })).status, 200, `${tenantId} quality`);
  }
  const page = (await get(db, `/t/${MAN}/`, { email: IDENTITIES.admin })).body;
  assert.match(page, /Staging · Administrator/);
  assert.match(page, /aria-label="All sponsor accounts"/);
  assert.match(page, /British Swim School of Northwest Philadelphia/);
  assert.match(page, /British Swim School of Jersey Shore/);
  assert.match(page, /British Swim School of Manhattan/);
  assert.equal((await get(db, `/t/${NWP}/`, { email: IDENTITIES.partner })).status, 404, 'ordinary partner stays scoped');

  const futureId = 'ten_aaaaaaaaaaaaaaaa';
  await db.prepare("INSERT INTO tenants (tenant_id, display_name, timezone, pilot_status, pilot_price_cents, created_at) VALUES (?, 'Future Sponsor Account', 'America/New_York', 'pilot_fixture', 0, '2026-11-02T00:00:00Z')").bind(futureId).run();
  const memberships = await membershipsFor(db, ADMIN_USER_ID);
  assert.ok(memberships.some((membership) => membership.tenant_id === futureId && membership.role === 'admin'));
  assert.ok(await scopeForUser(db, ADMIN_USER_ID, futureId));
  assert.equal(await scopeForUser(db, U['demo-partner-manhattan'], futureId), null);
});

test('administrator role is re-checked on every request and revocation is immediate', async () => {
  const db = await accountsDb();
  assert.equal((await get(db, `/t/${MAN}/`, { email: IDENTITIES.admin })).status, 200);
  await db.prepare('DELETE FROM operator_roles WHERE user_id = ?').bind(ADMIN_USER_ID).run();
  assert.equal((await get(db, `/t/${MAN}/`, { email: IDENTITIES.admin })).status, 404);
  assert.equal((await get(db, '/', { email: IDENTITIES.admin })).status, 403);
});

test('URLs, query parameters and display names never grant access', async () => {
  const db = await accountsDb();
  for (const path of [`/t/${MAN}/?tenant_id=${MAN}`, `/t/${MAN}/?as=${U['demo-partner-manhattan']}`, `/t/${NWP}/../${MAN}/`, '/t/British%20Swim%20School%20of%20Manhattan/', `/t/${MAN.toUpperCase()}/`]) {
    const r = await get(db, path, { email: IDENTITIES.owner });
    assert.ok(r.status === 404 || r.status === 200 && !r.body.includes(MAN), path);
    assert.doesNotMatch(r.body, /British Swim School of Manhattan/, path);
  }
  await db.prepare("UPDATE tenants SET display_name = 'British Swim School of Northwest Philadelphia' WHERE tenant_id = ?").bind(MAN).run();
  assert.equal((await get(db, `/t/${MAN}/`, { email: IDENTITIES.owner })).status, 404, 'a renamed tenant is still not yours');
});

test('membership is re-checked on every request: revocation and subject rotation take effect immediately', async () => {
  const db = await accountsDb();
  assert.equal((await get(db, `/t/${JS}/`, { email: IDENTITIES.owner })).status, 200);
  await db.prepare('DELETE FROM tenant_memberships WHERE user_id = ? AND tenant_id = ?').bind(U['demo-owner-nwp-js'], JS).run();
  assert.equal((await get(db, `/t/${JS}/`, { email: IDENTITIES.owner })).status, 404, 'revoked membership: next request is 404');
  const nav = (await get(db, `/t/${NWP}/`, { email: IDENTITIES.owner })).body;
  assert.doesNotMatch(nav, /British Swim School of Jersey Shore/, 'revoked tenant leaves the switcher');
  await db.prepare('UPDATE users SET auth_subject = NULL WHERE user_id = ?').bind(U['demo-owner-nwp-js']).run();
  assert.equal((await get(db, `/t/${NWP}/`, { email: IDENTITIES.owner })).status, 403, 'unprovisioned subject: no access at all');
  await db.prepare('UPDATE users SET auth_subject = ? WHERE user_id = ?').bind(independentSubject(TEST_HMAC_KEY, testIdentity('new-owner-login')), U['demo-owner-nwp-js']).run();
  assert.equal((await get(db, `/t/${NWP}/`, { email: IDENTITIES.owner })).status, 403, 'old identity no longer maps');
  assert.equal((await get(db, `/t/${NWP}/`, { email: testIdentity('new-owner-login') })).status, 200, 'new identity works');
  assert.equal((await get(db, `/t/${NWP}/`, { email: IDENTITIES.owner, env: { IDENTITY_HMAC_KEY: 'ef'.repeat(32).replace(/^ef/, '01') } })).status, 403, 'rotating the HMAC key invalidates every subject');
});

test('only GET/HEAD; no cookies or sessions are ever issued; Access sign-out link replaces the demo form', async () => {
  const db = await accountsDb();
  for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) assert.equal((await get(db, `/t/${NWP}/`, { email: IDENTITIES.owner, method })).status, 405);
  const head = await get(db, `/t/${NWP}/`, { email: IDENTITIES.owner, method: 'HEAD' });
  assert.equal(head.status, 200); assert.equal(head.body, '');
  const r = await get(db, `/t/${NWP}/`, { email: IDENTITIES.owner });
  assert.equal(r.res.headers.get('set-cookie'), null);
  assert.match(r.body, /href="\/cdn-cgi\/access\/logout"/);
  assert.doesNotMatch(r.body, /\/demo\/|demo sign-in|<form method="post"/i);
});

test('logs never contain the email, subject or HMAC key', async () => {
  const db = await accountsDb();
  const logs = [];
  for (const email of [IDENTITIES.owner, IDENTITIES.stranger, null]) logs.push(...(await get(db, '/t/ten_0000000000000000/', { email })).logs);
  logs.push(...(await get(db, '/', { email: IDENTITIES.owner, aud: 'wrong-audience-123' })).logs);
  const text = JSON.stringify(logs);
  assert.doesNotMatch(text, /@|sub_[0-9a-f]{8}/);
  assert.equal(text.includes(TEST_HMAC_KEY), false);
});
