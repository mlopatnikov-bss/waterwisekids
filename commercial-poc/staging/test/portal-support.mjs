import { handlePortal } from '../src/portal/worker.mjs';
import { freshD1, loadManifest, provision, TEST_HMAC_KEY, accessCtx, portalEnv } from './support.mjs';
import { loadManifestD1 } from '../scripts/lib/seed-pipeline.mjs';

export const manifest = loadManifest();
export const T = Object.fromEntries(manifest.tenants.map((t) => [t.tenant_key, t.tenant_id]));
export const U = Object.fromEntries(manifest.users.map((u) => [u.user_key, u.user_id]));

/** Manifest + users + provisioned test identities, no events (fast, mutable per test). */
export async function accountsDb() {
  const db = freshD1();
  await loadManifestD1(db, manifest, { at: '2026-10-01T00:00:00.000Z' });
  await provision(db, manifest, TEST_HMAC_KEY);
  return db;
}

/**
 * GET a portal path. email: undefined = no ctx.access at all; null = Access context whose identity has no email.
 */
export async function get(db, path, { email, aud, env = {}, method = 'GET', headers = {}, ctx } = {}) {
  const logs = [];
  const c = ctx !== undefined ? ctx : email === undefined ? { waitUntil() {} } : accessCtx(email, aud);
  const res = await handlePortal(new Request(`https://portal.wwk-staging.invalid${path}`, { method, headers }), portalEnv(db, env), c, { log: (l) => logs.push(l) });
  return { res, status: res.status, body: await res.text(), logs };
}
