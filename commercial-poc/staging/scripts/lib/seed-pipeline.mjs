// Staging seed pipeline (Node). Same fixture as Phase 1 (manifest + deterministic synthetic
// dataset, seed 20261102, report time 2026-11-02T14:00Z), but every write goes through the
// STAGING D1 code paths: manifest load, the collector's ingestDeliveries() in 25-event
// requests, the conversion import, and the tenant-scoped quality run.
import { generateSynthetic } from '../../../src/synthetic.mjs';
import { validateImport, ImportError } from '../../../src/conversions.mjs';
import { addDays, localDate } from '../../../src/time.mjs';
import { loadRegistry } from '../../src/shared/registry.mjs';
import { ingestDeliveries } from '../../src/shared/ingest.mjs';
import { runQuality } from '../../src/shared/quality.mjs';

export const AS_OF = '2026-11-02T14:00:00.000Z';
export const SYNTH = Object.freeze({ seed: 20261102, from: '2026-08-04', to: '2026-11-01' });
export const DEFAULT_RANGE_DAYS = 28;
export const HTTP_BATCH = 25;
export const ADMIN_USER_ID = 'usr_5ea9892a9f11c6dc';

/** Staging users: same opaque IDs and memberships as the manifest, non-demo labels, no subject yet. */
export const STAGING_USER_LABELS = Object.freeze({
  'demo-owner-nwp-js': 'Pilot owner (NW Philadelphia + Jersey Shore)',
  'demo-partner-manhattan': 'Pilot partner (Manhattan)',
  'demo-no-access': 'Staging test account (no school linked)',
});

export async function loadManifestD1(db, manifest, { at, actor = 'staging-seed' }) {
  const s = (sql, ...p) => db.prepare(sql).bind(...p);
  const st = [];
  for (const t of manifest.tenants) st.push(s('INSERT OR REPLACE INTO tenants (tenant_id, display_name, timezone, pilot_status, pilot_price_cents, created_at) VALUES (?,?,?,?,?,?)', t.tenant_id, t.display_name, t.timezone, t.pilot_status, t.pilot_price_cents, at));
  for (const u of manifest.users) {
    const label = STAGING_USER_LABELS[u.user_key];
    if (!label) throw new Error(`no staging label for ${u.user_key}`);
    st.push(s('INSERT OR REPLACE INTO users (user_id, display_label, auth_subject, is_demo) VALUES (?,?,NULL,0)', u.user_id, label));
  }
  st.push(s('INSERT OR REPLACE INTO users (user_id, display_label, auth_subject, is_demo) VALUES (?,?,NULL,0)', ADMIN_USER_ID, 'WaterWiseKids administrator'));
  st.push(s("INSERT OR REPLACE INTO operator_roles (user_id, role, granted_at, granted_by) VALUES (?, 'admin', ?, ?)", ADMIN_USER_ID, at, actor));
  for (const m of manifest.memberships) st.push(s('INSERT OR REPLACE INTO tenant_memberships (tenant_id, user_id, role) VALUES (?,?,?)', m.tenant_id, m.user_id, m.role));
  for (const x of manifest.schools) st.push(s('INSERT OR REPLACE INTO schools (school_id, tenant_id, display_name, official_url, sources_json) VALUES (?,?,?,?,?)', x.school_id, x.tenant_id, x.display_name, x.official_url, JSON.stringify(x.sources)));
  // Preserve held locations for operator review. An intentionally withheld URL
  // is stored as an empty string and never becomes a destination or placement.
  for (const l of manifest.locations) st.push(s('INSERT OR REPLACE INTO locations (location_id, tenant_id, school_id, display_name, address_display, official_url, status, status_reason, verified_on, sources_json) VALUES (?,?,?,?,?,?,?,?,?,?)', l.location_id, l.tenant_id, l.school_id, l.display_name, l.address_display, l.official_url ?? '', l.status, l.status_reason, l.verified_on, JSON.stringify(l.sources)));
  for (const c of manifest.campaigns) st.push(s('INSERT OR REPLACE INTO campaigns (campaign_id, tenant_id, school_id, kind, display_name, disclosure_label, price_cents, starts_on, ends_on) VALUES (?,?,?,?,?,?,?,?,?)', c.campaign_id, c.tenant_id, c.school_id, c.kind, c.display_name, c.disclosure_label, c.price_cents, c.starts_on, c.ends_on));
  for (const d of manifest.destinations) st.push(s('INSERT OR REPLACE INTO destinations (destination_id, tenant_id, location_id, display_name, url, host) VALUES (?,?,?,?,?,?)', d.destination_id, d.tenant_id, d.location_id, d.display_name, d.url, d.host));
  for (const p of manifest.placements) st.push(s('INSERT OR REPLACE INTO placements (placement_id, tenant_id, campaign_id, kind, display_name, featured_location_id, link_rel, inventory_status) VALUES (?,?,?,?,?,?,?,?)', p.placement_id, p.tenant_id, p.campaign_id, p.kind, p.display_name, p.featured_location_id, p.link_rel, p.inventory_status));
  for (const pp of manifest.placement_pages) st.push(s('INSERT OR REPLACE INTO placement_pages (placement_id, tenant_id, page_path, canonical_url, source_file) VALUES (?,?,?,?,?)', pp.placement_id, pp.tenant_id, pp.page_path, pp.canonical_url, pp.source_file));
  for (const pd of manifest.placement_destinations) st.push(s('INSERT OR REPLACE INTO placement_destinations (placement_id, destination_id, tenant_id) VALUES (?,?,?)', pd.placement_id, pd.destination_id, pd.tenant_id));
  st.push(s("INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('allowed_site_hosts', ?)", JSON.stringify(manifest.allowed_site_hosts)));
  st.push(s("INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('allowed_destination_hosts', ?)", JSON.stringify(manifest.allowed_destination_hosts)));
  st.push(s('INSERT INTO audit_log (at, actor, action, tenant_id, detail_json) VALUES (?,?,?,?,?)', at, actor, 'manifest.load', null,
    JSON.stringify({ manifest_version: manifest.manifest_version, generated_at: manifest.generated_at, tenants: manifest.tenants.length })));
  await db.batch(st);
}

/** Phase 1 import semantics on D1: same validation, replay is a no-op, latest import supersedes. */
export async function importConversionsD1(db, { tenantId, actorId }, batch, { receivedAt }) {
  const locs = (await db.prepare('SELECT location_id FROM locations WHERE tenant_id = ?').bind(tenantId).all()).results;
  const rows = validateImport(batch, { tenantLocations: new Set(locs.map((r) => r.location_id)) });
  const existing = await db.prepare('SELECT tenant_id FROM conversion_imports WHERE import_id = ?').bind(batch.import_id).first();
  if (existing) {
    if (existing.tenant_id !== tenantId) throw new ImportError('import_id_conflict');
    return { status: 'duplicate_import', rows: 0 };
  }
  let superseded = 0;
  for (const r of rows) {
    const hit = await db.prepare('SELECT 1 AS x FROM conversion_records WHERE tenant_id=? AND conversion_date=? AND conversion_type=? AND location_key=? AND attribution_basis=? AND method=?')
      .bind(tenantId, r.conversion_date, r.conversion_type, r.location_key, r.attribution_basis, batch.method).first();
    if (hit) superseded += 1;
  }
  const st = [db.prepare('INSERT INTO conversion_imports (import_id, tenant_id, imported_by, method, source_label, confidence, received_at, row_count) VALUES (?,?,?,?,?,?,?,?)')
    .bind(batch.import_id, tenantId, actorId, batch.method, batch.source_label, batch.confidence, receivedAt, rows.length)];
  for (const r of rows) {
    st.push(db.prepare(`INSERT INTO conversion_records (tenant_id, conversion_date, conversion_type, location_key, attribution_basis, method, count, estimated_value_cents, import_id, confidence, source_label)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT (tenant_id, conversion_date, conversion_type, location_key, attribution_basis, method)
      DO UPDATE SET count = excluded.count, estimated_value_cents = excluded.estimated_value_cents, import_id = excluded.import_id,
                    confidence = excluded.confidence, source_label = excluded.source_label`)
      .bind(tenantId, r.conversion_date, r.conversion_type, r.location_key, r.attribution_basis, batch.method, r.count, r.estimated_value_cents, batch.import_id, batch.confidence, batch.source_label));
  }
  st.push(db.prepare('INSERT INTO audit_log (at, actor, action, tenant_id, detail_json) VALUES (?,?,?,?,?)')
    .bind(receivedAt, actorId, 'conversions.import', tenantId, JSON.stringify({ import_id: batch.import_id, rows: rows.length, superseded, method: batch.method })));
  await db.batch(st);
  return { status: 'imported', rows: rows.length, superseded };
}

export async function seedStaging(db, manifest, { asOf = AS_OF } = {}) {
  await loadManifestD1(db, manifest, { at: asOf });
  const registry = await loadRegistry(db);
  const synth = generateSynthetic(manifest, SYNTH);
  const ingest = { deliveries: synth.deliveries.length, requests: 0, accepted: 0, duplicates: 0, rejected: 0, reasons: {} };
  for (let i = 0; i < synth.deliveries.length; i += HTTP_BATCH) {
    const r = await ingestDeliveries(db, registry, synth.deliveries.slice(i, i + HTTP_BATCH), { computedAt: asOf });
    ingest.requests += 1; ingest.accepted += r.accepted; ingest.duplicates += r.duplicates; ingest.rejected += r.rejected;
    for (const [k, v] of Object.entries(r.reasons)) ingest.reasons[k] = (ingest.reasons[k] || 0) + v;
  }
  const conv = { imported: 0, duplicate_import: 0, superseded: 0 };
  for (const b of [...synth.conversionBatches].sort((a, c) => (a.receivedAt < c.receivedAt ? -1 : a.receivedAt > c.receivedAt ? 1 : 0))) {
    const owner = manifest.memberships.find((m) => m.tenant_id === b.tenant_id && m.role === 'owner');
    const r = await importConversionsD1(db, { tenantId: b.tenant_id, actorId: owner.user_id }, b.batch, { receivedAt: b.receivedAt });
    if (r.status === 'imported') { conv.imported += 1; conv.superseded += r.superseded; } else conv.duplicate_import += 1;
  }
  const quality = {};
  for (const t of manifest.tenants) {
    const end = addDays(localDate(Date.parse(asOf), t.timezone), -1);
    quality[t.tenant_id] = await runQuality(db, { tenantId: t.tenant_id, asOf, from: addDays(end, -(DEFAULT_RANGE_DAYS - 1)), to: end, record: true });
  }
  return { synth, ingest, conv, quality };
}
