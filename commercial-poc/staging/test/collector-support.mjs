import { randomUUID } from 'node:crypto';
import { freshD1, loadManifest, collectorEnv } from './support.mjs';
import { loadManifestD1 } from '../scripts/lib/seed-pipeline.mjs';
import { handleCollector } from '../src/collector/worker.mjs';

export const NOW = Date.parse('2026-10-20T15:00:00.000Z');
export const ORIGIN = 'https://www.waterwisekids.com';
export const manifest = loadManifest();
const tenantByKey = (k) => manifest.tenants.find((t) => t.tenant_key === k);

/** A manifest-loaded D1 with no events. */
export async function loadedDb() {
  const db = freshD1();
  await loadManifestD1(db, manifest, { at: '2026-10-01T00:00:00.000Z' });
  return db;
}

/** A valid event for a tenant's first sponsored placement (override any field). */
export function validEvent(key = 'northwest-philadelphia', over = {}) {
  const t = tenantByKey(key);
  const p = manifest.placements.find((x) => x.tenant_id === t.tenant_id && x.kind === 'sponsored_card');
  const c = manifest.campaigns.find((x) => x.campaign_id === p.campaign_id);
  const page = manifest.placement_pages.find((x) => x.placement_id === p.placement_id).page_path;
  const e = { v: 1, event_id: randomUUID(), type: 'eligible_view', occurred_at: new Date(NOW - 60_000).toISOString(), site_host: 'www.waterwisekids.com', page_path: page,
    tenant_id: t.tenant_id, school_id: c.school_id, campaign_id: c.campaign_id, placement_id: p.placement_id, page_view_id: randomUUID(), referrer_category: 'search', device_class: 'mobile' };
  if (p.featured_location_id) e.location_id = p.featured_location_id;
  return { ...e, ...over };
}
export const destinationFor = (e) => manifest.placement_destinations.find((d) => d.placement_id === e.placement_id).destination_id;

export async function collect(db, body, { origin = ORIGIN, ctype = 'text/plain', headers = {}, path = '/v1/collect', method = 'POST', env = {}, now = NOW } = {}) {
  const logs = [];
  const h = { ...(origin === null ? {} : { Origin: origin }), ...(ctype === null ? {} : { 'Content-Type': ctype }), ...headers };
  const init = { method, headers: h };
  if (body !== undefined && method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') init.body = typeof body === 'string' ? body : JSON.stringify(body);
  if (init.body !== undefined && ctype === null) init.body = new TextEncoder().encode(init.body); // no implicit Content-Type
  const res = await handleCollector(new Request(`https://collector.wwk-staging.invalid${path}`, init), collectorEnv(db, env), {}, { now: () => now, log: (l) => logs.push(l) });
  const text = await res.text();
  return { res, status: res.status, text, json: text ? JSON.parse(text) : null, logs };
}
