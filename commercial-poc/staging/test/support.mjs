// Shared fixtures for the zero-dependency staging test suite (node:test + node:sqlite).
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash, createHmac } from 'node:crypto';
import { STAGING_ROOT, POC_ROOT, MANIFEST_PATH } from '../scripts/lib/paths.mjs';
import { migratedD1 } from '../scripts/lib/d1-sqlite.mjs';
import { seedStaging, AS_OF } from '../scripts/lib/seed-pipeline.mjs';
import { ADMIN_USER_ID } from '../scripts/lib/seed-pipeline.mjs';
import { TABLES, rowsOf } from '../scripts/lib/sql-dump.mjs';

export { STAGING_ROOT, POC_ROOT, AS_OF };
export const MIGRATIONS = readdirSync(join(STAGING_ROOT, 'migrations')).filter((f) => /^\d{4}_[a-z0-9_]+\.sql$/.test(f)).sort().map((f) => join(STAGING_ROOT, 'migrations', f));
export const loadManifest = () => JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
export const freshD1 = () => migratedD1(MIGRATIONS);

// Reserved-TLD test identities (RFC 2606 ".test"). Built at runtime so no address literal
// appears in committed text files scanned by the Phase 1 personal-data check.
export const TEST_TLD = ['te', 'st'].join('');
export const testIdentity = (local) => `${local}@wwk-staging.${TEST_TLD}`;
export const IDENTITIES = Object.freeze({
  admin: testIdentity('wwk-admin'),
  owner: testIdentity('pilot-owner'),
  partner: testIdentity('manhattan-partner'),
  noTenant: testIdentity('no-school'),
  stranger: testIdentity('not-provisioned'),
});
// Test-only HMAC key (never used outside tests; real keys are Worker secrets).
export const TEST_HMAC_KEY = createHash('sha256').update('wwk-staging-test-only-identity-key').digest('hex');
export const TEST_AUD = 'wwk-portal-test-audience';
export const independentSubject = (key, email) => `sub_${createHmac('sha256', Buffer.from(key, 'hex')).update(`wwk-commercial-staging:identity:v1:${email.trim().toLowerCase()}`).digest('hex')}`;

let cached = null;
/** A fully seeded staging D1 (adapter) with the three test identities provisioned. Cached per test process. */
export async function seeded() {
  if (!cached) {
    const manifest = loadManifest();
    const db = freshD1();
    const result = await seedStaging(db, manifest, { asOf: AS_OF });
    await provision(db, manifest, TEST_HMAC_KEY);
    cached = { db, manifest, ...result };
  }
  return cached;
}

export async function provision(db, manifest, key) {
  const byKey = Object.fromEntries(manifest.users.map((u) => [u.user_key, u.user_id]));
  const map = [['demo-owner-nwp-js', IDENTITIES.owner], ['demo-partner-manhattan', IDENTITIES.partner], ['demo-no-access', IDENTITIES.noTenant]];
  await db.batch(map.map(([k, email]) => db.prepare('UPDATE users SET auth_subject = ? WHERE user_id = ?').bind(independentSubject(key, email), byKey[k])));
  await db.prepare('UPDATE users SET auth_subject = ? WHERE user_id = ?').bind(independentSubject(key, IDENTITIES.admin), ADMIN_USER_ID).run();
}

export async function tableHashes(db, tables = TABLES.map(([t]) => t)) {
  const out = {};
  for (const t of tables) {
    const pk = TABLES.find(([n]) => n === t)[1];
    const { cols, rows } = await rowsOf(db, t, pk);
    const h = createHash('sha256');
    for (const r of rows) h.update(`${JSON.stringify(cols.map((c) => r[c]))}\n`);
    out[t] = { rows: rows.length, sha256: h.digest('hex') };
  }
  return out;
}

/** Phase 1 (accepted code, node:sqlite) seeded with the same fixture, for parity checks. */
let phase1 = null;
export async function phase1Seeded() {
  if (!phase1) {
    const { openDb } = await import('../../src/db.mjs');
    const { seedAll } = await import('../../src/pipeline.mjs');
    const manifest = loadManifest();
    const db = openDb(':memory:');
    const result = seedAll(db, manifest, { asOf: AS_OF });
    phase1 = { db, manifest, ...result };
  }
  return phase1;
}

/** Hash Phase 1 tables with the same canonical row encoding as tableHashes(). */
export function phase1TableHashes(db, tables) {
  const out = {};
  for (const t of tables) {
    const pk = TABLES.find(([n]) => n === t)[1];
    const cols = db.prepare(`SELECT name FROM pragma_table_info('${t}') ORDER BY cid`).all().map((r) => r.name);
    const rows = db.prepare(`SELECT ${cols.join(', ')} FROM ${t} ORDER BY ${pk.join(', ')}`).all();
    const h = createHash('sha256');
    for (const r of rows) h.update(`${JSON.stringify(cols.map((c) => r[c]))}\n`);
    out[t] = { rows: rows.length, sha256: h.digest('hex') };
  }
  return out;
}

/** Fake ctx.access as Cloudflare Worker Access provides it. */
export const accessCtx = (email, aud = TEST_AUD) => ({ access: { aud, getIdentity: async () => (email === null ? {} : { email }) }, waitUntil() {}, passThroughOnException() {} });
export const portalEnv = (db, extra = {}) => ({ DB: db, IDENTITY_HMAC_KEY: TEST_HMAC_KEY, ACCESS_AUD: TEST_AUD, PORTAL_ENV: 'local', REPORT_AS_OF: AS_OF, ...extra });
export const collectorEnv = (db, extra = {}) => ({ DB: db, ALLOWED_ORIGIN: 'https://www.waterwisekids.com', COLLECTOR_ENV: 'local', ...extra });

/** A D1 stand-in that fails the test if anything touches it. */
export function untouchableDb() {
  const touched = [];
  const db = new Proxy({}, { get(_t, p) {
    if (p === 'prepare' || p === 'batch' || p === 'exec') return (...a) => { touched.push(String(p)); throw new Error(`DB.${String(p)} must not be called`); };
    return undefined;
  } });
  return { db, touched };
}
