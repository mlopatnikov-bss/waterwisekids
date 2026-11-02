// Builds the collector's allowlist registry from D1 in ONE batch round trip. The
// shape is identical to Phase 1 buildRegistry() (src/registry.mjs), so the accepted
// Phase 1 validateEvent() runs unchanged against it.
export async function loadRegistry(db) {
  const q = (sql) => db.prepare(sql);
  const [hosts, dhosts, tenants, schools, campaigns, locations, destinations, placements, pages, pdests] = await db.batch([
    q("SELECT value FROM schema_meta WHERE key = 'allowed_site_hosts'"),
    q("SELECT value FROM schema_meta WHERE key = 'allowed_destination_hosts'"),
    q('SELECT tenant_id, timezone FROM tenants'),
    q('SELECT school_id, tenant_id FROM schools'),
    q('SELECT campaign_id, tenant_id, school_id, kind, starts_on, ends_on FROM campaigns'),
    q('SELECT location_id, tenant_id, status FROM locations'),
    q('SELECT destination_id, tenant_id, location_id, host FROM destinations'),
    q('SELECT placement_id, tenant_id, campaign_id, kind, featured_location_id FROM placements'),
    q('SELECT placement_id, page_path FROM placement_pages'),
    q('SELECT placement_id, destination_id FROM placement_destinations'),
  ]);
  const meta = (r) => JSON.parse(r.results[0]?.value || '[]');
  const reg = {
    allowedSiteHosts: new Set(meta(hosts)),
    allowedDestinationHosts: new Set(meta(dhosts)),
    tenants: new Map(), schools: new Map(), campaigns: new Map(), placements: new Map(), destinations: new Map(), locations: new Map(),
  };
  for (const t of tenants.results) reg.tenants.set(t.tenant_id, { ...t });
  for (const s of schools.results) reg.schools.set(s.school_id, { ...s });
  for (const c of campaigns.results) reg.campaigns.set(c.campaign_id, { ...c });
  for (const l of locations.results) reg.locations.set(l.location_id, { ...l });
  for (const d of destinations.results) reg.destinations.set(d.destination_id, { ...d });
  for (const p of placements.results) reg.placements.set(p.placement_id, { ...p, pages: new Set(), destinations: new Set() });
  for (const pp of pages.results) reg.placements.get(pp.placement_id)?.pages.add(pp.page_path);
  for (const pd of pdests.results) reg.placements.get(pd.placement_id)?.destinations.add(pd.destination_id);
  return reg;
}
