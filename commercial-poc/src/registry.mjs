// Loads the seed manifest into storage and builds the in-memory allowlist registry
// the collector validates against.
import { tx, audit } from './db.mjs';

export function loadManifest(db, manifest, { actor = 'seed', at = new Date().toISOString() } = {}) {
  tx(db, () => {
    const ins = (sql, rows, map) => { const st = db.prepare(sql); for (const r of rows) st.run(...map(r)); };
    ins('INSERT OR REPLACE INTO tenants (tenant_id, display_name, timezone, pilot_status, pilot_price_cents, created_at) VALUES (?,?,?,?,?,?)',
      manifest.tenants, (t) => [t.tenant_id, t.display_name, t.timezone, t.pilot_status, t.pilot_price_cents, at]);
    ins('INSERT OR REPLACE INTO users (user_id, display_label, auth_subject, is_demo) VALUES (?,?,?,?)',
      manifest.users, (u) => [u.user_id, u.display_label, null, u.is_demo]);
    ins('INSERT OR REPLACE INTO tenant_memberships (tenant_id, user_id, role) VALUES (?,?,?)',
      manifest.memberships, (m) => [m.tenant_id, m.user_id, m.role]);
    ins('INSERT OR REPLACE INTO schools (school_id, tenant_id, display_name, official_url, sources_json) VALUES (?,?,?,?,?)',
      manifest.schools, (s) => [s.school_id, s.tenant_id, s.display_name, s.official_url, JSON.stringify(s.sources)]);
    ins('INSERT OR REPLACE INTO locations (location_id, tenant_id, school_id, display_name, address_display, official_url, status, status_reason, verified_on, sources_json) VALUES (?,?,?,?,?,?,?,?,?,?)',
      manifest.locations, (l) => [l.location_id, l.tenant_id, l.school_id, l.display_name, l.address_display, l.official_url, l.status, l.status_reason, l.verified_on, JSON.stringify(l.sources)]);
    ins('INSERT OR REPLACE INTO campaigns (campaign_id, tenant_id, school_id, kind, display_name, disclosure_label, price_cents, starts_on, ends_on) VALUES (?,?,?,?,?,?,?,?,?)',
      manifest.campaigns, (c) => [c.campaign_id, c.tenant_id, c.school_id, c.kind, c.display_name, c.disclosure_label, c.price_cents, c.starts_on, c.ends_on]);
    ins('INSERT OR REPLACE INTO destinations (destination_id, tenant_id, location_id, display_name, url, host) VALUES (?,?,?,?,?,?)',
      manifest.destinations, (d) => [d.destination_id, d.tenant_id, d.location_id, d.display_name, d.url, d.host]);
    ins('INSERT OR REPLACE INTO placements (placement_id, tenant_id, campaign_id, kind, display_name, featured_location_id, link_rel, inventory_status) VALUES (?,?,?,?,?,?,?,?)',
      manifest.placements, (p) => [p.placement_id, p.tenant_id, p.campaign_id, p.kind, p.display_name, p.featured_location_id, p.link_rel, p.inventory_status]);
    ins('INSERT OR REPLACE INTO placement_pages (placement_id, tenant_id, page_path, canonical_url, source_file) VALUES (?,?,?,?,?)',
      manifest.placement_pages, (pp) => [pp.placement_id, pp.tenant_id, pp.page_path, pp.canonical_url, pp.source_file]);
    ins('INSERT OR REPLACE INTO placement_destinations (placement_id, destination_id, tenant_id) VALUES (?,?,?)',
      manifest.placement_destinations, (pd) => [pd.placement_id, pd.destination_id, pd.tenant_id]);
    audit(db, { actor, action: 'manifest.load', at, detail: { manifest_version: manifest.manifest_version, generated_at: manifest.generated_at, tenants: manifest.tenants.length } });
  });
  db.prepare("INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('allowed_site_hosts', ?)").run(JSON.stringify(manifest.allowed_site_hosts));
  db.prepare("INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('allowed_destination_hosts', ?)").run(JSON.stringify(manifest.allowed_destination_hosts));
}

export function buildRegistry(db) {
  const meta = (k) => JSON.parse(db.prepare('SELECT value FROM schema_meta WHERE key = ?').get(k)?.value || '[]');
  const reg = {
    allowedSiteHosts: new Set(meta('allowed_site_hosts')),
    allowedDestinationHosts: new Set(meta('allowed_destination_hosts')),
    tenants: new Map(), schools: new Map(), campaigns: new Map(), placements: new Map(), destinations: new Map(), locations: new Map(),
  };
  for (const t of db.prepare('SELECT tenant_id, timezone FROM tenants').all()) reg.tenants.set(t.tenant_id, { ...t });
  for (const s of db.prepare('SELECT school_id, tenant_id FROM schools').all()) reg.schools.set(s.school_id, { ...s });
  for (const c of db.prepare('SELECT campaign_id, tenant_id, school_id, kind, starts_on, ends_on FROM campaigns').all()) reg.campaigns.set(c.campaign_id, { ...c });
  for (const l of db.prepare('SELECT location_id, tenant_id, status FROM locations').all()) reg.locations.set(l.location_id, { ...l });
  for (const d of db.prepare('SELECT destination_id, tenant_id, location_id, host FROM destinations').all()) reg.destinations.set(d.destination_id, { ...d });
  for (const p of db.prepare('SELECT placement_id, tenant_id, campaign_id, kind, featured_location_id FROM placements').all()) {
    reg.placements.set(p.placement_id, { ...p, pages: new Set(), destinations: new Set() });
  }
  for (const pp of db.prepare('SELECT placement_id, page_path FROM placement_pages').all()) reg.placements.get(pp.placement_id).pages.add(pp.page_path);
  for (const pd of db.prepare('SELECT placement_id, destination_id FROM placement_destinations').all()) reg.placements.get(pd.placement_id).destinations.add(pd.destination_id);
  return reg;
}
