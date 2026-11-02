// Aggregate enrollment/lead import contract ("wwk.aggregate-conversions" v1) and its
// offline dry-run pipeline. Built for school-side totals such as Jackrabbit reports
// assembled by an operator or by Alfie automation. Jackrabbit has no API we can rely
// on, so nothing here connects to it: the operator supplies a totals file.
//
// Privacy: counts only. Unknown columns are refused (personal-looking ones as
// pii_field), every string is scanned for contact-shaped values, and no row can carry
// a name, contact, child, note or raw form field. The location map that translates a
// school system's location codes into WWK location IDs is operator-local and is never
// committed (commercial-poc/ is publicly served).
//
// Output is the Phase 1 import batch (validated by src/conversions.mjs, unchanged)
// plus D1 SQL with the same semantics: replaying an import is a no-op and the newest
// export for a (date, type, location, basis, method) key wins; values are never summed.
import { createHash } from 'node:crypto';
import { validateImport, ImportError } from '../../src/conversions.mjs';
import { checkShape } from './schema.mjs';
import { canonical } from './packet.mjs';

export const EXPORT_SCHEMA = 'wwk.aggregate-conversions';
export const MAP_SCHEMA = 'wwk.location-map';
export const IMPORT_METHOD = 'booking_system_export';
export const IMPORT_ACTOR = 'wwk-operator-import';
const KEY = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const REF = /^[A-Z0-9][A-Z0-9_-]{1,23}$/;
const BASIS_TEXT = /^[A-Za-z0-9 :=_.,()/'-]{3,100}$/;
const PII_FIELD = /(name|e-?mail|phone|tel|mobile|address|street|zip|postal|child|kid|student|swimmer|family|parent|guardian|contact|dob|birth|age|gender|note|comment|memo|first|last|account|family_id|student_id|ip|user_?agent)/i;
const PII_VALUE = [['email', /[^\s@]+@[^\s@]+\.[^\s@]+/], ['phone', /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/], ['long_digit_run', /\d{7,}/]];
const BASES = ['self_reported_wwk_mention', 'utm_matched_in_sponsor_system', 'self_reported_any_source'];
const TYPES = ['assessment_start', 'call', 'qualified_lead', 'enrollment'];

const s = (o = {}) => ({ t: 'str', ...o });
const obj = (fields) => ({ t: 'obj', fields, optional: new Set() });
const arr = (of, o = {}) => ({ t: 'arr', of, ...o });
const date = () => s({ re: DATE, date: true });

export const EXPORT_SPEC = obj({
  schema: s({ enum: [EXPORT_SCHEMA] }), schema_version: { t: 'int', min: 1, max: 1 },
  tenant_key: s({ re: KEY }),
  source_system: s({ enum: ['jackrabbit', 'other_booking_system', 'manual_count'] }),
  extraction: s({ enum: ['alfie_automation', 'manual_report'] }),
  exported_on: date(),
  granularity: s({ enum: ['day', 'week', 'month'] }),
  period: obj({ from: date(), to: date() }),
  confidence: s({ enum: ['high', 'medium', 'low'] }),
  basis_definitions: { t: 'basis' },
  rows: arr(obj({ date: date(), location_ref: s({ re: REF }), conversion_type: s({ enum: TYPES }), attribution_basis: s({ enum: BASES }), count: { t: 'int', min: 0, max: 10000 } }), { min: 1, max: 500 }),
});
export const MAP_SPEC = obj({
  schema: s({ enum: [MAP_SCHEMA] }), schema_version: { t: 'int', min: 1, max: 1 },
  definition_key: s({ re: KEY }),
  source_system: s({ enum: ['jackrabbit', 'other_booking_system', 'manual_count'] }),
  entries: arr(obj({ external_ref: s({ re: REF }), tenant_key: s({ re: KEY }), location_key: s({ re: KEY }) }), { min: 1, max: 50 }),
});

const err = (out, code, path, detail) => out.push({ code, path, detail });

function walk(v, spec, path, out) {
  if (spec.t === 'basis') {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return err(out, 'invalid_type', path, 'expected object');
    for (const [k, txt] of Object.entries(v)) {
      if (!BASES.includes(k)) err(out, 'unknown_field', `${path}.${k}`, 'not an attribution basis');
      else if (typeof txt !== 'string' || !BASIS_TEXT.test(txt)) err(out, 'invalid_value', `${path}.${k}`, 'short plain description of how the school system computes this basis');
    }
    return;
  }
  if (spec.t === 'obj') {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return err(out, 'invalid_type', path, 'expected object');
    for (const k of Object.keys(v)) if (!(k in spec.fields)) err(out, PII_FIELD.test(k) ? 'pii_field' : 'unknown_field', `${path}.${k}`, PII_FIELD.test(k) ? 'personal-looking field refused; send counts only' : 'not part of the contract');
    for (const [k, sub] of Object.entries(spec.fields)) { if (!(k in v)) err(out, 'missing_field', `${path}.${k}`, 'required'); else walk(v[k], sub, `${path}.${k}`, out); }
    return;
  }
  if (spec.t === 'arr') {
    if (!Array.isArray(v)) return err(out, 'invalid_type', path, 'expected array');
    if (v.length < spec.min) err(out, 'too_few', path, `at least ${spec.min}`);
    if (v.length > spec.max) err(out, 'too_many', path, `at most ${spec.max} rows per file; use week or month granularity or split the period`);
    v.forEach((x, i) => walk(x, spec.of, `${path}[${i}]`, out));
    return;
  }
  out.push(...checkShape(v, spec, path));
}

function scanPii(v, path, out) {
  if (typeof v === 'string') { for (const [kind, re] of PII_VALUE) if (re.test(v)) { err(out, 'pii_value', path, `${kind}-shaped value`); break; } return; }
  if (Array.isArray(v)) v.forEach((x, i) => scanPii(x, `${path}[${i}]`, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) scanPii(x, `${path}.${k}`, out);
}

const dayOfWeek = (d) => new Date(`${d}T00:00:00Z`).getUTCDay(); // 0 = Sunday
const lastOfMonth = (d) => { const x = new Date(`${d}T00:00:00Z`); return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).toISOString().slice(0, 10) === d; };
const firstOfMonth = (d) => d.endsWith('-01');

/** Deterministic UUIDv4-shaped id from content (so re-sending the same file is a no-op). */
export function importIdFor(tenantId, exportFile) {
  const h = createHash('sha256').update(`wwk-import:v1:${tenantId}:${JSON.stringify(canonical(exportFile))}`).digest();
  h[6] = (h[6] & 0x0f) | 0x40; h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.subarray(0, 16).toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20, 32)}`;
}

/**
 * Validate an export + location map for ONE tenant of a sponsor definition.
 * Returns { ok, errors, warnings, batch, tenant, receivedAt }.
 */
export function planImport(def, exportFile, map) {
  const errors = []; const warnings = [];
  walk(exportFile, EXPORT_SPEC, '$export', errors);
  walk(map, MAP_SPEC, '$map', errors);
  if (errors.length) return { ok: false, errors, warnings };
  scanPii(exportFile, '$export', errors);
  scanPii(map, '$map', errors);
  if (map.definition_key !== def.definition_key) err(errors, 'definition_mismatch', '$map.definition_key', `map is for ${map.definition_key}`);
  if (map.source_system !== exportFile.source_system) err(errors, 'invalid_value', '$map.source_system', 'map and export come from different systems');
  const tenant = def.tenants.find((t) => t.tenant_key === exportFile.tenant_key);
  if (!tenant) { err(errors, 'unknown_tenant', '$export.tenant_key', exportFile.tenant_key); return { ok: false, errors, warnings }; }

  // Location map: unique refs; each ref resolves to a location of the tenant it names.
  const refs = new Map();
  map.entries.forEach((e, i) => {
    if (refs.has(e.external_ref)) err(errors, 'duplicate_key', `$map.entries[${i}].external_ref`, e.external_ref);
    const t = def.tenants.find((x) => x.tenant_key === e.tenant_key);
    const loc = t?.locations.find((l) => l.location_key === e.location_key);
    if (!t || !loc) err(errors, 'unknown_location', `$map.entries[${i}]`, `${e.tenant_key}/${e.location_key} is not in ${def.definition_key}`);
    refs.set(e.external_ref, { ...e, location_id: loc?.location_id });
  });

  const { from, to } = exportFile.period;
  const g = exportFile.granularity;
  const camp = tenant.campaign;
  if (to < from) err(errors, 'invalid_value', '$export.period', 'period ends before it starts');
  if (to > exportFile.exported_on) err(errors, 'invalid_value', '$export.period.to', 'period ends after the export date');
  if (from < camp.starts_on) err(errors, 'before_campaign', '$export.period.from', `period starts before the sponsored campaign (${camp.starts_on}); historical totals are not imported in this release`);
  if (g === 'week' && (dayOfWeek(from) !== 1 || dayOfWeek(to) !== 0)) err(errors, 'granularity_mismatch', '$export.period', 'weekly periods run Monday..Sunday');
  if (g === 'month' && (!firstOfMonth(from) || !lastOfMonth(to))) err(errors, 'granularity_mismatch', '$export.period', 'monthly periods run from the 1st to the last day of a month');

  const used = new Set(exportFile.rows.map((r) => r.attribution_basis));
  for (const b of used) if (!exportFile.basis_definitions[b]) err(errors, 'missing_basis_definition', '$export.basis_definitions', `${b} is used but not defined; state how the school system computes it`);
  if (used.has('utm_matched_in_sponsor_system')) warnings.push({ code: 'utm_basis_unverified', path: '$export', detail: 'confirm the school system really stores the WWK UTM tags before reporting this basis' });

  const seen = new Set();
  exportFile.rows.forEach((r, i) => {
    const rp = `$export.rows[${i}]`;
    if (r.date < from || r.date > to) err(errors, 'outside_period', `${rp}.date`, r.date);
    if (g === 'week' && dayOfWeek(r.date) !== 0) err(errors, 'granularity_mismatch', `${rp}.date`, 'weekly rows are dated on the Sunday that ends the week');
    if (g === 'month' && !lastOfMonth(r.date)) err(errors, 'granularity_mismatch', `${rp}.date`, 'monthly rows are dated on the last day of the month');
    const ref = refs.get(r.location_ref);
    if (!ref) err(errors, 'unmapped_location', `${rp}.location_ref`, `${r.location_ref} is not in the location map`);
    else if (ref.tenant_key !== tenant.tenant_key) err(errors, 'location_not_in_tenant', `${rp}.location_ref`, `${r.location_ref} belongs to ${ref.tenant_key}; split the export per tenant`);
    const k = [r.date, r.location_ref, r.conversion_type, r.attribution_basis].join('|');
    if (seen.has(k)) err(errors, 'duplicate_row', rp, k);
    seen.add(k);
  });
  if (errors.length) return { ok: false, errors, warnings };

  const batch = {
    import_id: importIdFor(tenant.tenant_id, exportFile),
    method: IMPORT_METHOD,
    source_label: `${exportFile.source_system === 'jackrabbit' ? 'Jackrabbit' : 'School system'} ${g} totals (${exportFile.extraction === 'alfie_automation' ? 'Alfie' : 'manual'})`,
    confidence: exportFile.confidence,
    rows: [...exportFile.rows].sort((a, b) => (a.date + a.location_ref + a.conversion_type + a.attribution_basis < b.date + b.location_ref + b.conversion_type + b.attribution_basis ? -1 : 1))
      .map((r) => ({ conversion_date: r.date, conversion_type: r.conversion_type, location_id: refs.get(r.location_ref).location_id, attribution_basis: r.attribution_basis, count: r.count, estimated_value_cents: null })),
  };
  try {
    validateImport(batch, { tenantLocations: new Set(tenant.locations.map((l) => l.location_id)) }); // Phase 1 rules, unchanged
  } catch (e) {
    if (e instanceof ImportError) { err(errors, `phase1_${e.code}`, '$batch', e.message); return { ok: false, errors, warnings }; }
    throw e;
  }
  return { ok: true, errors, warnings, batch, tenant, receivedAt: `${exportFile.exported_on}T00:00:00.000Z`, basisDefinitions: exportFile.basis_definitions };
}

const q = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

/** D1 SQL with Phase 1 import semantics, safe to replay and safe to apply out of order. */
export function importSql(plan) {
  const { batch, tenant, receivedAt } = plan;
  const id = batch.import_id; const tid = tenant.tenant_id;
  const L = [`-- WWK aggregate conversion import. GENERATED by commercial-poc/onboarding (import v1). Gate: human review of totals.`,
    `-- Tenant ${tenant.tenant_key} (${tid}); import ${id}; ${batch.rows.length} aggregate rows; export date ${receivedAt.slice(0, 10)}.`,
    '-- Counts only: no names, contacts, child data or raw form fields. Replaying this file is a no-op.',
    '-- Newest export wins per (date, type, location, basis, method); an older export applied later never overwrites a newer one.',
    `INSERT INTO conversion_imports (import_id, tenant_id, imported_by, method, source_label, confidence, received_at, row_count) VALUES (${[id, tid, IMPORT_ACTOR, batch.method, batch.source_label, batch.confidence, receivedAt, batch.rows.length].map(q).join(', ')})\n  ON CONFLICT (import_id) DO NOTHING;`];
  for (const r of batch.rows) {
    L.push(`INSERT INTO conversion_records (tenant_id, conversion_date, conversion_type, location_key, attribution_basis, method, count, estimated_value_cents, import_id, confidence, source_label)
  SELECT ${[tid, r.conversion_date, r.conversion_type, r.location_id ?? '_none', r.attribution_basis, batch.method, r.count, null, id, batch.confidence, batch.source_label].map(q).join(', ')}
  WHERE EXISTS (SELECT 1 FROM conversion_imports WHERE import_id = ${q(id)} AND tenant_id = ${q(tid)})
  ON CONFLICT (tenant_id, conversion_date, conversion_type, location_key, attribution_basis, method) DO UPDATE SET count = excluded.count, estimated_value_cents = excluded.estimated_value_cents,
    import_id = excluded.import_id, confidence = excluded.confidence, source_label = excluded.source_label
  WHERE (SELECT received_at FROM conversion_imports WHERE import_id = conversion_records.import_id) <= ${q(receivedAt)};`);
  }
  const detail = JSON.stringify({ import_id: id, rows: batch.rows.length, method: batch.method });
  L.push(`INSERT INTO audit_log (at, actor, action, tenant_id, detail_json) SELECT ${q(receivedAt)}, ${q(IMPORT_ACTOR)}, 'conversions.import', ${q(tid)}, ${q(detail)}\n  WHERE NOT EXISTS (SELECT 1 FROM audit_log WHERE action = 'conversions.import' AND tenant_id = ${q(tid)} AND detail_json = ${q(detail)});`, '');
  return L.join('\n');
}

export function importPreflight(plan) {
  const { batch, tenant } = plan;
  const locs = [...new Set(batch.rows.map((r) => r.location_id).filter(Boolean))];
  return ['-- WWK aggregate import PREFLIGHT (read-only). Every query must return ZERO rows.',
    `SELECT 'missing_tenant' AS problem WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_id = ${q(tenant.tenant_id)});`,
    ...locs.map((l) => `SELECT 'missing_location' AS problem, ${q(l)} AS id WHERE NOT EXISTS (SELECT 1 FROM locations WHERE location_id = ${q(l)} AND tenant_id = ${q(tenant.tenant_id)});`),
    `SELECT 'import_id_owned_by_other_tenant' AS problem FROM conversion_imports WHERE import_id = ${q(batch.import_id)} AND tenant_id <> ${q(tenant.tenant_id)};`, ''].join('\n');
}

/** Aggregate-only summary: totals per basis and type, never per row. */
export function importSummary(plan) {
  const totals = {};
  for (const r of plan.batch.rows) {
    totals[r.attribution_basis] ??= {};
    totals[r.attribution_basis][r.conversion_type] = (totals[r.attribution_basis][r.conversion_type] || 0) + r.count;
  }
  return { schema: 'wwk.aggregate-import-plan', tenant_id: plan.tenant.tenant_id, tenant_key: plan.tenant.tenant_key, import_id: plan.batch.import_id, method: plan.batch.method,
    source_label: plan.batch.source_label, confidence: plan.batch.confidence, received_at: plan.receivedAt, rows: plan.batch.rows.length,
    totals_by_basis: canonical(totals), basis_definitions: canonical(plan.basisDefinitions), note: 'Bases are reported separately and never added together.',
    network_actions: 0, database_actions: 0 };
}
