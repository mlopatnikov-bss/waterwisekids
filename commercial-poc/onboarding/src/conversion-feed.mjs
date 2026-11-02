// Privacy-safe adapter: BSS Messenger "instant" event streams -> per-tenant
// wwk.aggregate-conversions v1 exports (input to `import-plan`).
//
// Input: data/growth/instant.json and data/growth/nj/instant.json from BSS Messenger
// (src/instant.js), passed explicitly by the operator. Shape, per event:
//   lead:          { kind:'lead', ts, messageId, email, phone, loc, pool, heard, utmSource, utmMedium, ... }
//   registration:  { kind:'registration', ts, messageId, emails[], phones[], pools[], ... }
// The files contain family-level PII. This module keeps emails/phones only in memory
// as match keys, never returns or logs them, and returns only aggregate counts.
//
// Attribution (documented assumptions, see MEASUREMENT.md §2b). INVARIANT: every lead and
// every enrollment carries EXACTLY ONE, mutually exclusive basis, so summing rows across
// attribution_basis never double-counts:
//  - utm_matched_in_sponsor_system (authoritative): lead utmSource = "waterwisekids" AND
//    utmMedium = "sponsored_pilot" (case-insensitive). If present it wins, even when the
//    family also answered "WaterWiseKids" (counted only as the lead_both_signals_utm_wins warning).
//    waterwisekids with any other medium is a warning only (lead_waterwisekids_other_medium).
//  - self_reported_wwk_mention: ONLY when that exact UTM basis is absent, lead "How did you
//    hear about us?" = WaterWiseKids.
//  - enrollment: a Jackrabbit web registration whose normalized email or phone matches an
//    attributed lead with lead.ts <= registration.ts <= lead.ts + 90 days; the MOST RECENT
//    such lead is chosen and its single basis is inherited. Registrations are counted once per
//    (chosen lead, location, local day) to avoid inflating counts from repeated emails.
//  - location: lead loc code via the operator-local location map, else the friendly pool
//    name matched to the definition's location names; registrations use their pools.
//    A registration naming more than one pilot location is ambiguous and skipped.
//  - every active location x bucket x type x basis gets a row, so a live 0 is explicit.
import { localDate, addDays } from '../../src/time.mjs';

export const WINDOW_DAYS = 90;
export const TYPES = Object.freeze(['qualified_lead', 'enrollment']);
export const BASES = Object.freeze(['utm_matched_in_sponsor_system', 'self_reported_wwk_mention']);
// Each fits the import contract's basis text rule (<= 100 chars, plain characters).
export const BASIS_DEFINITIONS = Object.freeze({
  utm_matched_in_sponsor_system: 'Lead UTM waterwisekids/sponsored_pilot, enrollment = later web registration, same email/phone, 90d',
  self_reported_wwk_mention: 'Heard = WaterWiseKids and no sponsored UTM, enrollment = later registration, same email/phone, 90d',
});
const TZ = 'America/New_York';
const DAY_MS = 86_400_000;
const WWK = /^\s*water\s*wise\s*kids(\.com)?\s*$/i;

const normEmail = (e) => { const s = String(e || '').trim().toLowerCase().replace(/^.*<([^>]+)>.*$/, '$1'); return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(s) ? s : ''; };
const normPhone = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length >= 10 ? d.slice(-10) : ''; };
const normPool = (s) => String(s || '').toLowerCase().replace(/\(closed\)/g, '').replace(/la\s*fitness/g, '').replace(/[^a-z]/g, '');
const dow = (d) => new Date(`${d}T00:00:00Z`).getUTCDay();

/** Location resolver: code (from the operator-local map) or friendly pool name -> { tenant, location }. */
function resolver(def, map) {
  const byKey = new Map();
  for (const t of def.tenants) for (const l of t.locations) byKey.set(l.location_key, { tenant: t, location: l });
  const byCode = new Map(); const refOf = new Map();
  for (const e of map.entries) {
    const hit = byKey.get(e.location_key);
    if (hit && hit.tenant.tenant_key === e.tenant_key) { byCode.set(e.external_ref.toUpperCase(), hit); refOf.set(e.location_key, e.external_ref); }
  }
  const byName = new Map();
  for (const hit of byKey.values()) byName.set(normPool(hit.location.display_name), hit);
  return {
    refOf,
    code: (c) => (c ? byCode.get(String(c).toUpperCase()) || null : null),
    name: (n) => (n ? byName.get(normPool(n)) || byCode.get(String(n).toUpperCase()) || null : null),
  };
}

/** The single, mutually exclusive basis of a lead, or null. Authoritative UTM wins over self-report. */
export function leadBasis(e, w = () => {}) {
  const src = String(e.utmSource || '').trim().toLowerCase(); const med = String(e.utmMedium || '').trim().toLowerCase();
  const heardWwk = WWK.test(String(e.heard || ''));
  if (src === 'waterwisekids' && med === 'sponsored_pilot') { if (heardWwk) w('lead_both_signals_utm_wins'); return 'utm_matched_in_sponsor_system'; }
  if (src === 'waterwisekids') w('lead_waterwisekids_other_medium');
  return heardWwk ? 'self_reported_wwk_mention' : null;
}

function bucketOf(date, granularity) {
  if (granularity === 'day') return date;
  const k = dow(date); return addDays(date, k === 0 ? 0 : 7 - k); // week ends Sunday
}

/**
 * @param def        sponsor definition
 * @param streams    array of parsed instant files ({ events: [...] })
 * @param map        wwk.location-map (operator-local; carries the real location codes)
 * @param opts       { from?, to, exportedOn, granularity: 'week'|'day' }
 * @returns { ok, errors, exports: { [tenant_key]: exportFile }, warnings: { code: count }, totals }
 */
export function buildConversionFeed(def, streams, map, { from = null, to, exportedOn, granularity = 'week' } = {}) {
  const errors = []; const warn = {};
  const w = (k, n = 1) => { warn[k] = (warn[k] || 0) + n; };
  const isDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
  if (!['week', 'day'].includes(granularity)) errors.push({ code: 'invalid_granularity', detail: 'week or day (month cannot align with the 2026-11-02 campaign start)' });
  if (!isDate(to) || !isDate(exportedOn)) errors.push({ code: 'invalid_date', detail: '--to and --exported-on are required YYYY-MM-DD dates' });
  if (!map || map.schema !== 'wwk.location-map' || map.definition_key !== def.definition_key) errors.push({ code: 'invalid_map', detail: 'location map must be wwk.location-map for this definition' });
  if (!Array.isArray(streams) || streams.length === 0 || streams.some((s) => !s || !Array.isArray(s.events))) errors.push({ code: 'invalid_events', detail: 'each events file must be an object with an events array' });
  if (errors.length) return { ok: false, errors, exports: {}, warnings: warn };
  const R = resolver(def, map);

  // 1. Dedupe by kind + messageId across all files; drop records that cannot be placed in time.
  const seen = new Set(); const leads = []; const regs = [];
  for (const s of streams) for (const e of s.events) {
    if (!e || typeof e !== 'object') { w('skipped_not_an_object'); continue; }
    if (e.kind !== 'lead' && e.kind !== 'registration') { w('skipped_other_kind'); continue; }
    if (!e.messageId) { w(`${e.kind}_missing_message_id`); continue; }
    const k = `${e.kind}\u0000${e.messageId}`;
    if (seen.has(k)) { w(`${e.kind}_duplicate_message_id`); continue; }
    seen.add(k);
    const ts = typeof e.ts === 'number' ? e.ts : Date.parse(e.ts || '');
    if (!Number.isFinite(ts)) { w(`${e.kind}_invalid_timestamp`); continue; }
    if (e.kind === 'lead') leads.push({ e, ts }); else regs.push({ e, ts });
  }

  // 2. Leads: exactly one basis (UTM wins), location, match keys (kept in memory only).
  const attributed = []; // { ts, mid, basis, hit|null, emails:Set, phones:Set }
  for (const { e, ts } of leads) {
    const basis = leadBasis(e, w);
    if (!basis) { w('lead_not_wwk'); continue; }
    const hit = R.code(e.loc) || R.name(e.pool);
    if (!hit) w(e.loc || e.pool ? 'lead_location_unmapped' : 'lead_location_missing');
    const email = normEmail(e.email); const phone = normPhone(e.phone);
    if (!email && !phone) w('lead_no_match_key');
    attributed.push({ ts, mid: String(e.messageId), basis, hit, emails: new Set(email ? [email] : []), phones: new Set(phone ? [phone] : []) });
  }

  // 3. Registrations -> enrollment, inheriting the most recent prior attributed lead within 90 days.
  const enrollKeys = new Set(); const enrollments = []; // { ts, basis (inherited), hit }
  for (const { e, ts } of regs.sort((a, b) => a.ts - b.ts)) {
    const hits = [...new Map((Array.isArray(e.pools) ? e.pools : []).map((p) => R.name(p)).filter(Boolean).map((h) => [h.location.location_key, h])).values()];
    const emails = new Set((Array.isArray(e.emails) ? e.emails : []).map(normEmail).filter(Boolean));
    const phones = new Set((Array.isArray(e.phones) ? e.phones : []).map(normPhone).filter(Boolean));
    const cands = attributed.filter((l) => l.ts <= ts && ts - l.ts <= WINDOW_DAYS * DAY_MS && ([...l.emails].some((x) => emails.has(x)) || [...l.phones].some((x) => phones.has(x))));
    if (!cands.length) {
      const late = attributed.some((l) => ([...l.emails].some((x) => emails.has(x)) || [...l.phones].some((x) => phones.has(x))));
      w(late ? 'registration_match_outside_window' : 'registration_not_attributed');
      continue;
    }
    if (hits.length === 0) { w('registration_location_unmapped'); continue; }
    if (hits.length > 1) { w('registration_location_ambiguous'); continue; }
    // Most recent prior lead wins; equal timestamps break on message id (in memory only) so order never matters.
    const lead = cands.reduce((a, b) => (b.ts > a.ts || (b.ts === a.ts && b.mid > a.mid) ? b : a));
    const day = localDate(ts, TZ);
    const key = `${lead.mid}|${hits[0].location.location_key}|${day}`;
    if (enrollKeys.has(key)) { w('registration_same_day_repeat'); continue; }
    enrollKeys.add(key);
    enrollments.push({ ts, basis: lead.basis, hit: hits[0] });
  }

  // 4. Per-tenant exports with explicit zero rows for every active location x bucket x type x basis.
  const exportsOut = {}; const totals = {};
  for (const t of def.tenants) {
    const start = from || t.campaign.starts_on;
    const end = to < t.campaign.ends_on ? to : t.campaign.ends_on;
    if (end < start) { w(`tenant_${t.tenant_key}_no_days_in_period`); continue; }
    if (granularity === 'week' && (dow(start) !== 1 || dow(end) !== 0)) {
      errors.push({ code: 'granularity_mismatch', detail: `${t.tenant_key}: weekly periods run Monday..Sunday (got ${start}..${end})` });
      continue;
    }
    const locs = t.locations.filter((l) => R.refOf.has(l.location_key));
    for (const l of t.locations) if (!R.refOf.has(l.location_key)) w(`location_not_in_map_${l.location_key}`);
    const buckets = [];
    for (let d = start; d <= end; d = addDays(d, 1)) { const b = bucketOf(d, granularity); if (!buckets.includes(b)) buckets.push(b); }
    const counts = new Map();
    const bump = (hit, ts, type, basis) => {
      if (hit.tenant.tenant_key !== t.tenant_key) return;
      const day = localDate(ts, TZ);
      if (day < start || day > end) { w(`${type}_outside_period`); return; }
      const k = `${bucketOf(day, granularity)}|${hit.location.location_key}|${type}|${basis}`; counts.set(k, (counts.get(k) || 0) + 1);
    };
    for (const l of attributed) if (l.hit) bump(l.hit, l.ts, 'qualified_lead', l.basis);
    for (const x of enrollments) bump(x.hit, x.ts, 'enrollment', x.basis);
    const rows = [];
    for (const b of buckets) for (const l of locs) for (const type of TYPES) for (const basis of BASES) {
      rows.push({ date: b, location_ref: R.refOf.get(l.location_key), conversion_type: type, attribution_basis: basis, count: counts.get(`${b}|${l.location_key}|${type}|${basis}`) || 0 });
    }
    if (rows.length > 500) { errors.push({ code: 'too_many_rows', detail: `${t.tenant_key}: ${rows.length} rows; use --granularity week or a shorter period` }); continue; }
    if (!rows.length) continue;
    exportsOut[t.tenant_key] = {
      schema: 'wwk.aggregate-conversions', schema_version: 1, tenant_key: t.tenant_key,
      source_system: 'jackrabbit', extraction: 'bss_messenger_instant', exported_on: exportedOn, granularity,
      period: { from: start, to: end }, confidence: 'medium', basis_definitions: { ...BASIS_DEFINITIONS }, rows,
    };
    const tot = {};
    for (const r of rows) { const b = (tot[r.attribution_basis] ??= {}); b[r.conversion_type] = (b[r.conversion_type] || 0) + r.count; }
    totals[t.tenant_key] = tot;
  }
  return { ok: errors.length === 0, errors, exports: errors.length ? {} : exportsOut, warnings: Object.fromEntries(Object.entries(warn).sort()), totals: errors.length ? {} : totals };
}
