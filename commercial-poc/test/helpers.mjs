import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { openDb } from '../src/db.mjs';
import { seedAll } from '../src/pipeline.mjs';
import { MANIFEST_PATH, POC_ROOT } from '../src/config.mjs';

export const REPO_ROOT = resolve(process.env.WWK_REPO_ROOT || resolve(POC_ROOT, '..'));
export const AS_OF = '2026-11-02T14:00:00.000Z';

export function loadManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}

export function tenantByKey(manifest, key) {
  return manifest.tenants.find((t) => t.tenant_key === key);
}

let cached = null;
/** Seeded in-memory database (fresh per test file process). */
export function seeded() {
  if (!cached) {
    const manifest = loadManifest();
    const db = openDb(':memory:');
    const result = seedAll(db, manifest, { asOf: AS_OF });
    cached = { db, manifest, ...result };
  }
  return cached;
}

/** Start an http server on an ephemeral loopback port. */
export async function listen(handler) {
  const server = createServer(handler);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  return { server, base: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) };
}

/** Sign in through the real demo login form and return the session cookie. */
export async function demoLogin(base, userId) {
  const res = await fetch(`${base}/demo/login`, {
    method: 'POST', redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: base },
    body: `user_id=${encodeURIComponent(userId)}`,
  });
  const cookie = (res.headers.get('set-cookie') || '').split(';')[0];
  return { status: res.status, cookie };
}

export function demoUser(manifest, key) {
  return manifest.users.find((u) => u.user_key === key);
}

/** A valid eligible_view payload for a tenant's first sponsored placement. */
export function validEvent(manifest, tenantKey, overrides = {}, { type = 'eligible_view', occurredAt = '2026-10-20T15:00:00.000Z' } = {}) {
  const t = tenantByKey(manifest, tenantKey);
  const p = manifest.placements.find((x) => x.tenant_id === t.tenant_id && x.kind === 'sponsored_card');
  const camp = manifest.campaigns.find((c) => c.campaign_id === p.campaign_id);
  const page = manifest.placement_pages.find((pp) => pp.placement_id === p.placement_id).page_path;
  const base = {
    v: 1, event_id: crypto.randomUUID(), type, occurred_at: occurredAt, site_host: 'www.waterwisekids.com', page_path: page,
    tenant_id: t.tenant_id, school_id: camp.school_id, campaign_id: camp.campaign_id, placement_id: p.placement_id,
    page_view_id: crypto.randomUUID(), referrer_category: 'search', device_class: 'mobile',
  };
  if (type === 'viewable_impression') base.viewability = { visible_ratio: 0.8, visible_ms: 1500 };
  if (type === 'outbound_click') {
    base.destination_id = manifest.placement_destinations.find((pd) => pd.placement_id === p.placement_id).destination_id;
  }
  return { ...base, ...overrides };
}
