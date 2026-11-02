// Imported / self-reported conversions. Aggregate daily counts only: no names,
// contact details, child or family data, notes, or free-form text beyond a short
// validated source label. The tenant comes from the authenticated scope, never
// from the payload.
import { UUID_V4_RE } from './ids.mjs';
import { isValidDate } from './time.mjs';
import { tx, audit } from './db.mjs';

export const CONVERSION_TYPES = Object.freeze(['assessment_start', 'call', 'qualified_lead', 'enrollment']);
export const IMPORT_METHODS = Object.freeze(['manual_entry', 'csv_upload', 'booking_system_export', 'crm_export', 'call_tracking_export']);
export const CONFIDENCE = Object.freeze(['high', 'medium', 'low']);
export const ATTRIBUTION_BASES = Object.freeze(['self_reported_wwk_mention', 'utm_matched_in_sponsor_system', 'self_reported_any_source']);
const SOURCE_LABEL_RE = /^[A-Za-z0-9 ()\-_.,/]{1,60}$/;
const PII_RE = /([^\s@]+@[^\s@]+\.[^\s@]+)|(\d{3}[\s.-]\d{3}[\s.-]\d{4})|(\d{7,})/;
const BATCH_KEYS = new Set(['import_id', 'method', 'source_label', 'confidence', 'rows']);
const ROW_KEYS = new Set(['conversion_date', 'conversion_type', 'location_id', 'attribution_basis', 'count', 'estimated_value_cents']);
export const MAX_ROWS = 500;

export class ImportError extends Error {
  constructor(code, detail) { super(`${code}${detail ? `: ${detail}` : ''}`); this.code = code; }
}

export function validateImport(batch, { tenantLocations }) {
  if (!batch || typeof batch !== 'object' || Array.isArray(batch)) throw new ImportError('not_an_object');
  for (const k of Object.keys(batch)) if (!BATCH_KEYS.has(k)) throw new ImportError(k === 'tenant_id' ? 'tenant_id_not_accepted' : 'unknown_field', k);
  if (typeof batch.import_id !== 'string' || !UUID_V4_RE.test(batch.import_id)) throw new ImportError('invalid_import_id');
  if (!IMPORT_METHODS.includes(batch.method)) throw new ImportError('invalid_method');
  if (!CONFIDENCE.includes(batch.confidence)) throw new ImportError('invalid_confidence');
  if (typeof batch.source_label !== 'string' || !SOURCE_LABEL_RE.test(batch.source_label) || PII_RE.test(batch.source_label)) throw new ImportError('invalid_source_label');
  if (!Array.isArray(batch.rows) || batch.rows.length === 0 || batch.rows.length > MAX_ROWS) throw new ImportError('invalid_rows');
  const seen = new Set();
  return batch.rows.map((row, i) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new ImportError('invalid_row', String(i));
    for (const k of Object.keys(row)) if (!ROW_KEYS.has(k)) throw new ImportError('unknown_row_field', `${i}.${k}`);
    if (!isValidDate(row.conversion_date)) throw new ImportError('invalid_conversion_date', String(i));
    if (!CONVERSION_TYPES.includes(row.conversion_type)) throw new ImportError('invalid_conversion_type', String(i));
    if (!ATTRIBUTION_BASES.includes(row.attribution_basis)) throw new ImportError('invalid_attribution_basis', String(i));
    if (!Number.isInteger(row.count) || row.count < 0 || row.count > 10000) throw new ImportError('invalid_count', String(i));
    const loc = row.location_id ?? null;
    if (loc !== null && !tenantLocations.has(loc)) throw new ImportError('location_not_in_tenant', String(i));
    const ev = row.estimated_value_cents ?? null;
    if (ev !== null && (!Number.isInteger(ev) || ev < 0 || ev > 100_000_000)) throw new ImportError('invalid_estimated_value', String(i));
    const key = [row.conversion_date, row.conversion_type, loc ?? '_none', row.attribution_basis].join('|');
    if (seen.has(key)) throw new ImportError('duplicate_row_in_batch', String(i));
    seen.add(key);
    return { conversion_date: row.conversion_date, conversion_type: row.conversion_type, location_key: loc ?? '_none', attribution_basis: row.attribution_basis, count: row.count, estimated_value_cents: ev };
  });
}

/**
 * @param scope TenantScope proving the actor's membership.
 * Re-sending the same import_id is a no-op. A newer import for the same
 * (date, type, location, basis, method) supersedes the older value: latest wins, never summed.
 */
export function importConversions(db, scope, batch, { receivedAt = new Date().toISOString() } = {}) {
  const tenantLocations = new Set(db.prepare('SELECT location_id FROM locations WHERE tenant_id = ?').all(scope.tenantId).map((r) => r.location_id));
  const rows = validateImport(batch, { tenantLocations });
  return tx(db, () => {
    const existing = db.prepare('SELECT tenant_id FROM conversion_imports WHERE import_id = ?').get(batch.import_id);
    if (existing) {
      if (existing.tenant_id !== scope.tenantId) throw new ImportError('import_id_conflict');
      return { status: 'duplicate_import', rows: 0 };
    }
    db.prepare('INSERT INTO conversion_imports (import_id, tenant_id, imported_by, method, source_label, confidence, received_at, row_count) VALUES (?,?,?,?,?,?,?,?)')
      .run(batch.import_id, scope.tenantId, scope.actorId, batch.method, batch.source_label, batch.confidence, receivedAt, rows.length);
    const up = db.prepare(`INSERT INTO conversion_records (tenant_id, conversion_date, conversion_type, location_key, attribution_basis, method, count, estimated_value_cents, import_id, confidence, source_label)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT (tenant_id, conversion_date, conversion_type, location_key, attribution_basis, method)
      DO UPDATE SET count = excluded.count, estimated_value_cents = excluded.estimated_value_cents, import_id = excluded.import_id,
                    confidence = excluded.confidence, source_label = excluded.source_label`);
    let superseded = 0;
    const exists = db.prepare('SELECT 1 FROM conversion_records WHERE tenant_id=? AND conversion_date=? AND conversion_type=? AND location_key=? AND attribution_basis=? AND method=?');
    for (const r of rows) {
      if (exists.get(scope.tenantId, r.conversion_date, r.conversion_type, r.location_key, r.attribution_basis, batch.method)) superseded += 1;
      up.run(scope.tenantId, r.conversion_date, r.conversion_type, r.location_key, r.attribution_basis, batch.method, r.count, r.estimated_value_cents, batch.import_id, batch.confidence, batch.source_label);
    }
    audit(db, { actor: scope.actorId, action: 'conversions.import', tenantId: scope.tenantId, at: receivedAt, detail: { import_id: batch.import_id, rows: rows.length, superseded, method: batch.method } });
    return { status: 'imported', rows: rows.length, superseded };
  });
}
