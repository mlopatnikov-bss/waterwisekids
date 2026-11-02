// Deterministic, idempotent SQL dump of the staging tables, for `wrangler d1 execute --file`.
// Children are deleted first and parents inserted first (D1 always enforces foreign keys).
// No BEGIN/COMMIT: D1 refuses explicit transactions in executed files.
export const TABLES = Object.freeze([
  ['schema_meta', ['key'], ['key', 'value']],
  ['tenants', ['tenant_id'], ['tenant_id', 'display_name', 'timezone', 'pilot_status', 'pilot_price_cents', 'created_at']],
  ['users', ['user_id'], ['user_id', 'display_label', 'auth_subject', 'is_demo']],
  ['operator_roles', ['user_id'], ['user_id', 'role', 'granted_at', 'granted_by']],
  ['tenant_memberships', ['tenant_id', 'user_id'], ['tenant_id', 'user_id', 'role']],
  ['schools', ['school_id'], ['school_id', 'tenant_id', 'display_name', 'official_url', 'sources_json']],
  ['locations', ['location_id'], ['location_id', 'tenant_id', 'school_id', 'display_name', 'address_display', 'official_url', 'status', 'status_reason', 'verified_on', 'sources_json']],
  ['campaigns', ['campaign_id'], ['campaign_id', 'tenant_id', 'school_id', 'kind', 'display_name', 'disclosure_label', 'price_cents', 'starts_on', 'ends_on']],
  ['destinations', ['destination_id'], ['destination_id', 'tenant_id', 'location_id', 'display_name', 'url', 'host']],
  ['placements', ['placement_id'], ['placement_id', 'tenant_id', 'campaign_id', 'kind', 'display_name', 'featured_location_id', 'link_rel', 'inventory_status']],
  ['placement_pages', ['placement_id', 'page_path'], ['placement_id', 'tenant_id', 'page_path', 'canonical_url', 'source_file']],
  ['placement_destinations', ['placement_id', 'destination_id'], ['placement_id', 'destination_id', 'tenant_id']],
  ['events', ['event_id'], ['event_id', 'schema_version', 'event_type', 'tenant_id', 'school_id', 'campaign_id', 'placement_id', 'location_id', 'destination_id', 'page_path', 'referrer_category', 'device_class', 'page_view_id', 'occurred_minute', 'local_date', 'received_date', 'dedupe_key']],
  ['ingest_outcomes', ['received_date', 'tenant_key', 'outcome', 'reason_code'], ['received_date', 'tenant_key', 'outcome', 'reason_code', 'count']],
  ['daily_metrics', ['metric_date', 'tenant_id', 'campaign_id', 'placement_id', 'location_key', 'page_path', 'destination_key', 'metric'], ['metric_date', 'tenant_id', 'campaign_id', 'placement_id', 'location_key', 'page_path', 'destination_key', 'metric', 'value', 'computed_at']],
  ['conversion_imports', ['import_id'], ['import_id', 'tenant_id', 'imported_by', 'method', 'source_label', 'confidence', 'received_at', 'row_count']],
  ['conversion_records', ['tenant_id', 'conversion_date', 'conversion_type', 'location_key', 'attribution_basis', 'method'], ['tenant_id', 'conversion_date', 'conversion_type', 'location_key', 'attribution_basis', 'method', 'count', 'estimated_value_cents', 'import_id', 'confidence', 'source_label']],
  ['data_quality_runs', ['run_id'], ['run_id', 'tenant_id', 'as_of', 'range_start', 'range_end', 'status', 'checks_json', 'created_at']],
  ['audit_log', ['audit_id'], ['audit_id', 'at', 'actor', 'action', 'tenant_id', 'detail_json']],
]);
// Tables whose rows the reconciliation compares byte-for-byte with Phase 1.
export const RECONCILED_TABLES = Object.freeze(['events', 'ingest_outcomes', 'daily_metrics', 'conversion_imports', 'conversion_records']);

const lit = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number' || typeof v === 'bigint') { if (!Number.isFinite(Number(v))) throw new Error('non-finite number'); return String(v); }
  if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
  throw new Error(`unsupported value type ${typeof v}`);
};

export async function columnsOf(db, table) {
  const entry = TABLES.find(([name]) => name === table);
  if (!entry) throw new Error(`unknown staging table: ${table}`);
  // Keep the canonical projection explicit. D1's binding API intentionally
  // returns no rows for PRAGMA table_info(), even though the Wrangler CLI does.
  // migration.test.mjs independently proves this list matches schema v1.
  return [...entry[2]];
}

export async function rowsOf(db, table, pk) {
  const cols = await columnsOf(db, table);
  const rows = (await db.prepare(`SELECT ${cols.join(', ')} FROM ${table} ORDER BY ${pk.join(', ')}`).all()).results;
  return { cols, rows };
}

export async function dumpSql(db, { rowsPerInsert = 50, header = [] } = {}) {
  const out = [...header.map((h) => `-- ${h}`), ''];
  for (const [t] of [...TABLES].reverse()) out.push(`DELETE FROM ${t};`);
  for (const [t, pk] of TABLES) {
    const { cols, rows } = await rowsOf(db, t, pk);
    for (let i = 0; i < rows.length; i += rowsPerInsert) {
      const chunk = rows.slice(i, i + rowsPerInsert).map((r) => `(${cols.map((c) => lit(r[c])).join(',')})`);
      out.push(`INSERT INTO ${t} (${cols.join(',')}) VALUES\n${chunk.join(',\n')};`);
    }
  }
  return `${out.join('\n')}\n`;
}
