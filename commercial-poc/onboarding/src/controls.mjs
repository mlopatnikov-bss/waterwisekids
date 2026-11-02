// Fair-comparison controls: ordinary WWK directory listings measured with the same
// event definitions as the sponsored card (schema "wwk.control-plan", v1).
//
// Fairness rules enforced here:
//  - the ordinary listing is measured, never changed: the row patch adds data-wwk-*
//    attributes only (same text, same order, same href, no label, no rel="sponsored");
//  - the control window is concurrent with the sponsored campaign and can never start
//    before the plan was prepared, so no historical baseline is invented;
//  - every featured sponsored location has exactly one ordinary-listing control;
//  - a control page must not carry this tenant's sponsored card (no contamination).
import { createHash } from 'node:crypto';
import { stableId } from '../../src/ids.mjs';
import { createEditDiff, createNewFileDiff } from '../../proposal/src/udiff.mjs';
import { checkShape } from './schema.mjs';
import { sourceFileFor } from './repo.mjs';
import { SITE_ORIGIN, validateDefinition } from './validate.mjs';

export const CONTROL_SCHEMA_NAME = 'wwk.control-plan';
export const CONTROL_ASSET_SOURCE = 'commercial-poc/onboarding/assets/wwk-ordinary-listing.js';
export const CONTROL_ASSET_PUBLIC = 'assets/js/wwk-ordinary-listing.js';
const GEN = 'commercial-poc/onboarding (controls v1)';

const KEY = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = (p) => new RegExp(`^${p}_[a-f0-9]{16}$`);
const s = (o = {}) => ({ t: 'str', ...o });
const obj = (fields) => ({ t: 'obj', fields, optional: new Set() });
const arr = (of, o = {}) => ({ t: 'arr', of, ...o });
const nullable = (of) => ({ t: 'nullable', of });
const GATES = ['editorial_review', 'preview_qa', 'activation'];

export const CONTROL_SCHEMA = obj({
  schema: s({ enum: [CONTROL_SCHEMA_NAME] }),
  schema_version: { t: 'int', min: 1, max: 1 },
  definition_key: s({ re: KEY }),
  prepared_on: s({ re: DATE, date: true }),
  client: obj({ asset_version: s({ re: /^[a-z0-9]{2,12}$/ }) }),
  tag_ordinary_links: { t: 'bool' },
  tenants: arr(obj({
    tenant_key: s({ re: KEY }),
    campaign: obj({ campaign_key: s({ re: KEY }), campaign_id: s({ re: ID('cmp') }), starts_on: s({ re: DATE, date: true }), ends_on: s({ re: DATE, date: true }) }),
    listings: arr(obj({ location_key: s({ re: KEY }), placement_id: s({ re: ID('plc') }), page_path: s({ min: 2, max: 200 }), row_id: s({ re: /^[a-z0-9][a-z0-9-]{2,120}$/ }) }), { min: 1, max: 25 }),
  }), { min: 1, max: 6 }),
  approvals: arr(obj({ gate: s({ enum: GATES }), status: s({ enum: ['pending', 'recorded'] }), recorded_on: nullable(s({ re: DATE, date: true })), evidence_ref: nullable(s({ min: 1, max: 200, re: /^[A-Za-z0-9_./#-]+$/ })) }), { min: GATES.length, max: GATES.length }),
});

function shape(plan) {
  // checkShape has no boolean type; handle it here and reuse the rest.
  const out = [];
  const walk = (v, spec, path) => {
    if (spec.t === 'bool') { if (typeof v !== 'boolean') out.push({ code: 'invalid_type', path, detail: 'expected boolean' }); return; }
    if (spec.t === 'obj') {
      if (!v || typeof v !== 'object' || Array.isArray(v)) { out.push({ code: 'invalid_type', path, detail: 'expected object' }); return; }
      for (const k of Object.keys(v)) if (!(k in spec.fields)) out.push({ code: 'unknown_field', path: `${path}.${k}`, detail: 'field is not part of control-plan v1' });
      for (const [k, sub] of Object.entries(spec.fields)) { if (!(k in v)) out.push({ code: 'missing_field', path: `${path}.${k}`, detail: 'required' }); else walk(v[k], sub, `${path}.${k}`); }
      return;
    }
    if (spec.t === 'arr') {
      if (!Array.isArray(v)) { out.push({ code: 'invalid_type', path, detail: 'expected array' }); return; }
      if (v.length < (spec.min ?? 0)) out.push({ code: 'too_few', path, detail: `at least ${spec.min}` });
      if (spec.max !== undefined && v.length > spec.max) out.push({ code: 'too_many', path, detail: `at most ${spec.max}` });
      v.forEach((x, i) => walk(x, spec.of, `${path}[${i}]`));
      return;
    }
    out.push(...checkShape(v, spec, path));
  };
  walk(plan, CONTROL_SCHEMA, '$');
  return out;
}

const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sha = (x) => createHash('sha256').update(x).digest('hex');
const q = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

/** Locate one directory row (a single line starting the school-card) and its official link. */
function findRow(lines, rowId) {
  const open = `<div class="school-card" id="${rowId}"`;
  const hits = lines.map((l, i) => (l.includes(open) ? i : -1)).filter((i) => i >= 0);
  return { hits, index: hits.length === 1 ? hits[0] : -1, open };
}

/**
 * Validate a control plan against its sponsor definition and the repo.
 * @returns { ok, errors, warnings, resolved } — resolved listings carry IDs, URLs and row data.
 */
export function validateControlPlan(plan, def, ctx) {
  const errors = []; const warnings = [];
  const err = (code, path, detail) => errors.push({ code, path, detail });
  for (const e of shape(plan)) errors.push(e);
  if (errors.length) return { ok: false, errors, warnings, resolved: [] };

  const dv = validateDefinition(def, ctx);
  if (!dv.ok) return { ok: false, errors: dv.errors.map((e) => ({ ...e, code: `definition_${e.code}` })), warnings, resolved: [] };
  if (plan.definition_key !== def.definition_key) err('definition_mismatch', '$.definition_key', `plan is for ${plan.definition_key}, definition is ${def.definition_key}`);
  if (plan.prepared_on < def.prepared_on) err('invalid_value', '$.prepared_on', 'plan prepared before its definition');
  const asOf = ctx.asOf || plan.prepared_on;
  for (const g of GATES) if (plan.approvals.filter((a) => a.gate === g).length !== 1) err('duplicate_key', '$.approvals', `gate ${g} must appear once`);
  plan.approvals.forEach((a, i) => {
    if (a.status === 'recorded' && (!a.recorded_on || !a.evidence_ref || !ctx.repo.read(a.evidence_ref))) err('approval_incomplete', `$.approvals[${i}]`, 'recorded gates need a date and an existing evidence file');
    if (a.status === 'pending' && (a.recorded_on || a.evidence_ref)) err('approval_incomplete', `$.approvals[${i}]`, 'pending gates carry no date or evidence');
  });

  const tenants = new Map(def.tenants.map((t) => [t.tenant_key, t]));
  const seenTenants = new Set(); const seenPlacements = new Set(); const seenRows = new Set();
  const resolved = [];
  plan.tenants.forEach((ct, ti) => {
    const tp = `$.tenants[${ti}]`;
    const t = tenants.get(ct.tenant_key);
    if (!t) { err('ownership_conflict', `${tp}.tenant_key`, `${ct.tenant_key} is not a tenant of ${def.definition_key}`); return; }
    if (seenTenants.has(ct.tenant_key)) err('duplicate_key', `${tp}.tenant_key`, ct.tenant_key);
    seenTenants.add(ct.tenant_key);
    const terr = t.school.territory_url;
    const c = ct.campaign;
    const expectedCmp = stableId('cmp', `${terr}#${c.campaign_key}`);
    if (c.campaign_id !== expectedCmp) err('id_mismatch', `${tp}.campaign.campaign_id`, `expected ${expectedCmp}`);
    if (c.campaign_key === t.campaign.campaign_key) err('invalid_value', `${tp}.campaign.campaign_key`, 'control campaign must differ from the sponsored campaign');
    // No invented history: the control window starts no earlier than the plan, and runs alongside the sponsored campaign.
    if (c.starts_on < plan.prepared_on) err('backdated_control', `${tp}.campaign.starts_on`, `starts ${c.starts_on}, before the plan was prepared (${plan.prepared_on}); historical baselines cannot be created`);
    if (c.starts_on < t.campaign.starts_on) err('backdated_control', `${tp}.campaign.starts_on`, 'a control may not start before the sponsored campaign in this release');
    if (c.ends_on !== t.campaign.ends_on) err('window_mismatch', `${tp}.campaign.ends_on`, `must equal the sponsored campaign end (${t.campaign.ends_on}) so both are measured over the same days`);
    if (c.ends_on < c.starts_on) err('invalid_value', `${tp}.campaign.ends_on`, 'ends before it starts');
    if (c.starts_on < asOf) warnings.push({ code: 'control_start_passed', path: `${tp}.campaign.starts_on`, detail: `starts_on is before ${asOf}; set it to the real go-live date before activation` });

    const locs = new Map(t.locations.map((l) => [l.location_key, l]));
    const featured = new Set(t.placements.flatMap((p) => p.location_keys));
    const covered = new Set();
    const cardPages = new Set(t.placements.map((p) => p.page_path));
    ct.listings.forEach((L, li) => {
      const lp = `${tp}.listings[${li}]`;
      const loc = locs.get(L.location_key);
      if (!loc) { err(def.tenants.some((x) => x.locations.some((y) => y.location_key === L.location_key)) ? 'ownership_conflict' : 'unknown_location', `${lp}.location_key`, `${L.location_key} is not a location of ${t.tenant_key}`); return; }
      if (covered.has(L.location_key)) err('duplicate_key', `${lp}.location_key`, 'one ordinary-listing control per location');
      covered.add(L.location_key);
      const expectedPlc = stableId('plc', `${terr}#organic:${loc.official_url}`);
      if (L.placement_id !== expectedPlc) err('id_mismatch', `${lp}.placement_id`, `expected ${expectedPlc}`);
      if (seenPlacements.has(L.placement_id)) err('duplicate_key', `${lp}.placement_id`, L.placement_id);
      seenPlacements.add(L.placement_id);
      if (seenRows.has(`${L.page_path}#${L.row_id}`)) err('duplicate_key', `${lp}.row_id`, L.row_id);
      seenRows.add(`${L.page_path}#${L.row_id}`);
      if (cardPages.has(L.page_path)) err('control_contaminated', `${lp}.page_path`, 'this page carries the tenant\'s sponsored card');
      const src = sourceFileFor(L.page_path);
      if (src.error) { err('unsafe_path', `${lp}.page_path`, L.page_path); return; }
      const html = ctx.repo.read(src.file);
      if (html === null) { err('page_not_found', `${lp}.page_path`, src.file); return; }
      if (/data-wwk-sponsored-card/.test(html)) err('control_contaminated', `${lp}.page_path`, 'control page carries a sponsored card');
      const canonical = /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i.exec(html)?.[1];
      if (canonical !== `${SITE_ORIGIN}${L.page_path}`) err('canonical_mismatch', `${lp}.page_path`, `canonical is ${canonical ?? 'missing'}`);
      const lines = html.split('\n');
      const row = findRow(lines, L.row_id);
      if (row.index < 0) { err('control_row_mismatch', `${lp}.row_id`, `row must occur exactly once (found ${row.hits.length})`); return; }
      const line = lines[row.index];
      const rowHtml = line.slice(line.indexOf(row.open)).split('<div class="school-card" ')[1] ?? '';
      const anchors = [...`<div class="school-card" ${rowHtml}`.matchAll(/<a\b[^>]*>/g)].map((m) => {
        const href = /\bhref="(https:\/\/[^"]+)"/.exec(m[0])?.[1] ?? null;
        const classes = /\bclass="([^"]*)"/.exec(m[0])?.[1]?.split(/\s+/) ?? [];
        return { html: m[0], href, isVisit: classes.includes('visit-site-btn') };
      }).filter((a) => a.href && a.isVisit);
      if (anchors.length !== 1) { err('control_row_mismatch', `${lp}.row_id`, `row needs exactly one official "Visit Website" link (found ${anchors.length})`); return; }
      if (anchors[0].href !== loc.official_url) err('control_row_mismatch', `${lp}.row_id`, `row links ${anchors[0].href}, not the official location page ${loc.official_url}`);
      const name = /<h3 class="school-name">([^<]+)<\/h3>/.exec(rowHtml)?.[1] ?? null;
      if (!name) err('control_row_mismatch', `${lp}.row_id`, 'row has no school name');
      const dest = t.destinations.find((d) => d.location_key === L.location_key);
      resolved.push({ tenant: t, control: ct, listing: L, location: loc, destination_id: dest.destination_id, source_file: src.file, row_index: row.index, row_open: row.open, anchor: anchors[0].html, row_name: name });
    });
    for (const k of featured) if (!covered.has(k)) err('missing_control', `${tp}.listings`, `featured location ${k} has no ordinary-listing control`);
  });
  for (const t of def.tenants) if (!seenTenants.has(t.tenant_key)) warnings.push({ code: 'tenant_without_control', path: '$.tenants', detail: t.tenant_key });
  return { ok: errors.length === 0, errors, warnings, resolved };
}

/** Row-level attribute patch: one line in, one line out, nothing but data-wwk-* added. */
function patchRow(line, r, plan) {
  const t = r.tenant;
  const attrs = ` data-wwk-ordinary-listing="" data-wwk-tenant="${t.tenant_id}" data-wwk-school="${t.school.school_id}" data-wwk-campaign="${r.control.campaign.campaign_id}" data-wwk-placement="${r.listing.placement_id}" data-wwk-location="${r.location.location_id}" data-wwk-page-path="${esc(r.listing.page_path)}"`;
  let out = line.replace(r.row_open, `${r.row_open}${attrs}`);
  let anchor = r.anchor.replace('<a ', `<a data-wwk-destination="${r.destination_id}" data-wwk-location="${r.location.location_id}" `);
  if (plan.tag_ordinary_links) {
    const u = new URL(r.location.official_url);
    for (const [k, v] of Object.entries({ utm_source: 'waterwisekids', utm_medium: 'referral', utm_campaign: r.control.campaign.campaign_id, utm_content: r.listing.placement_id })) u.searchParams.set(k, v);
    anchor = anchor.replace(`href="${r.location.official_url}"`, `href="${esc(u.toString())}"`);
  }
  out = out.replace(r.anchor, anchor);
  return out;
}

export function scriptTag(plan, def) {
  return `<script src="/${CONTROL_ASSET_PUBLIC}?v=${esc(plan.client.asset_version)}" data-wwk-collector="${esc(def.site.collector_url)}" defer></script>`;
}

/** Packet artifacts for the control plan. Pure and deterministic. */
export function buildControlArtifacts(plan, def, ctx) {
  const v = validateControlPlan(plan, def, ctx);
  if (!v.ok) return { ok: false, errors: v.errors, warnings: v.warnings, files: {} };
  const files = {};
  const byFile = new Map();
  for (const r of v.resolved) { if (!byFile.has(r.source_file)) byFile.set(r.source_file, []); byFile.get(r.source_file).push(r); }
  const plans = [];
  for (const [file, rows] of [...byFile.entries()].sort()) {
    const text = ctx.repo.read(file);
    const lines = text.split('\n');
    const tag = scriptTag(plan, def);
    const already = rows.every((r) => lines[r.row_index].includes(`data-wwk-placement="${r.listing.placement_id}"`)) && text.includes(tag);
    if (already) { plans.push({ source_file: file, action: 'unchanged', placements: rows.map((r) => r.listing.placement_id) }); continue; }
    const changes = rows.map((r) => ({ start: r.row_index, deleteCount: 1, lines: [patchRow(lines[r.row_index], r, plan)] }));
    if (!text.includes(tag)) {
      const bodyLine = lines.findIndex((l) => l.includes('</body>'));
      if (bodyLine < 0) return { ok: false, errors: [{ code: 'control_row_mismatch', path: file, detail: 'no </body> to place the client before' }], warnings: v.warnings, files: {} };
      if (changes.some((c) => c.start === bodyLine)) return { ok: false, errors: [{ code: 'control_row_mismatch', path: file, detail: 'row shares the </body> line' }], warnings: v.warnings, files: {} };
      changes.push({ start: bodyLine, deleteCount: 0, lines: [tag] });
    }
    const { diff, proposed } = createEditDiff(file, text, changes);
    const slug = file.replace(/[^a-z0-9]+/g, '-').replace(/-html$/, '');
    files[`control/patches/${slug}.diff`] = diff;
    // Rollback: reverse of the forward edit, computed against the patched text.
    const pl = proposed.split('\n');
    const back = rows.map((r) => ({ start: r.row_index, deleteCount: 1, lines: [lines[r.row_index]] }));
    const tagAt = pl.findIndex((l) => l === tag);
    if (!text.includes(tag) && tagAt >= 0) back.push({ start: tagAt, deleteCount: 1, lines: [] });
    files[`control/rollback/remove-${slug}.diff`] = createEditDiff(file, proposed, back).diff;
    plans.push({ source_file: file, action: 'patch', placements: rows.map((r) => r.listing.placement_id), patch: `control/patches/${slug}.diff`, removal_patch: `control/rollback/remove-${slug}.diff`, file_sha256_before: sha(text), file_sha256_after: sha(proposed) });
  }
  const asset = ctx.assetSource ?? ctx.repo.read(CONTROL_ASSET_SOURCE);
  if (!asset) return { ok: false, errors: [{ code: 'source_missing', path: CONTROL_ASSET_SOURCE, detail: 'ordinary-listing client not found' }], warnings: v.warnings, files: {} };
  const live = ctx.repo.read(CONTROL_ASSET_PUBLIC);
  if (live === null) files['control/patches/new-asset-wwk-ordinary-listing.diff'] = createNewFileDiff(CONTROL_ASSET_PUBLIC, asset);
  else if (live !== asset) return { ok: false, errors: [{ code: 'asset_conflict', path: CONTROL_ASSET_PUBLIC, detail: 'a different public asset already exists at this path' }], warnings: v.warnings, files: {} };
  files['control/plan.json'] = `${JSON.stringify({ generator: GEN, definition_key: def.definition_key, tag_ordinary_links: plan.tag_ordinary_links, asset_sha256: sha(asset), files: plans,
    listings: v.resolved.map((r) => ({ tenant_id: r.tenant.tenant_id, campaign_id: r.control.campaign.campaign_id, placement_id: r.listing.placement_id, location_id: r.location.location_id, destination_id: r.destination_id, page_path: r.listing.page_path, row_id: r.listing.row_id, starts_on: r.control.campaign.starts_on, ends_on: r.control.campaign.ends_on })),
    pending_gates: plan.approvals.filter((a) => a.status !== 'recorded').map((a) => a.gate) }, null, 2)}\n`;
  files['control/d1-control-upsert.sql'] = controlSql(plan, def, v.resolved);
  files['control/d1-control-preflight.sql'] = controlPreflight(v.resolved);
  return { ok: true, errors: [], warnings: v.warnings, files };
}

function controlSql(plan, def, rows) {
  const L = [`-- WWK ordinary-listing CONTROL upsert. GENERATED by ${GEN}; do not edit.`,
    '-- Apply only after d1-upsert.sql (sponsored rows) and d1-control-preflight.sql returns zero rows. Gate: activation.',
    '-- Idempotent; no DELETE; rows owned by another tenant are never overwritten. Ordinary listings are measured, never sold:',
    "-- campaign kind organic_baseline (no disclosure label, $0), placement kind organic_listing (no rel=\"sponsored\").",
    '-- The control window starts on its go-live date; there is no backfill and no historical baseline.'];
  const seen = new Set();
  for (const r of rows) {
    const t = r.tenant; const c = r.control.campaign;
    if (!seen.has(c.campaign_id)) {
      seen.add(c.campaign_id);
      L.push('', `-- Tenant ${t.tenant_key}`,
        `INSERT INTO campaigns (campaign_id, tenant_id, school_id, kind, display_name, disclosure_label, price_cents, starts_on, ends_on) VALUES (${[c.campaign_id, t.tenant_id, t.school.school_id, 'organic_baseline', 'Ordinary directory listing (measurement only, not sold)', null, 0, c.starts_on, c.ends_on].map(q).join(', ')})\n  ON CONFLICT (campaign_id) DO UPDATE SET display_name = excluded.display_name, starts_on = excluded.starts_on, ends_on = excluded.ends_on WHERE campaigns.tenant_id = excluded.tenant_id AND campaigns.kind = 'organic_baseline';`);
    }
    const p = r.listing;
    L.push(`INSERT INTO placements (placement_id, tenant_id, campaign_id, kind, display_name, featured_location_id, link_rel, inventory_status) VALUES (${[p.placement_id, t.tenant_id, c.campaign_id, 'organic_listing', `Ordinary listing: ${r.row_name}`, r.location.location_id, null, 'fixture_candidate'].map(q).join(', ')})\n  ON CONFLICT (placement_id) DO UPDATE SET campaign_id = excluded.campaign_id, display_name = excluded.display_name, featured_location_id = excluded.featured_location_id WHERE placements.tenant_id = excluded.tenant_id AND placements.kind = 'organic_listing';`,
      `INSERT INTO placement_pages (placement_id, tenant_id, page_path, canonical_url, source_file) VALUES (${[p.placement_id, t.tenant_id, p.page_path, `${SITE_ORIGIN}${p.page_path}`, r.source_file].map(q).join(', ')})\n  ON CONFLICT (placement_id, page_path) DO UPDATE SET canonical_url = excluded.canonical_url, source_file = excluded.source_file WHERE placement_pages.tenant_id = excluded.tenant_id;`,
      `INSERT INTO placement_destinations (placement_id, destination_id, tenant_id) VALUES (${[p.placement_id, r.destination_id, t.tenant_id].map(q).join(', ')}) ON CONFLICT (placement_id, destination_id) DO NOTHING;`);
  }
  const detail = JSON.stringify({ definition_key: def.definition_key, controls: rows.map((r) => r.listing.placement_id).sort() });
  L.push('', `INSERT INTO audit_log (at, actor, action, tenant_id, detail_json) SELECT ${q(`${plan.prepared_on}T00:00:00.000Z`)}, 'sponsor-onboarding', 'sponsor.controls.apply', NULL, ${q(detail)}\n  WHERE NOT EXISTS (SELECT 1 FROM audit_log WHERE action = 'sponsor.controls.apply' AND detail_json = ${q(detail)});`, '');
  return L.join('\n');
}

function controlPreflight(rows) {
  const pids = rows.map((r) => q(r.listing.placement_id)).join(', ');
  return [`-- WWK ordinary-listing CONTROL preflight (read-only). Every query must return ZERO rows.`,
    '-- 1. Control IDs owned by another tenant, or already used as a sponsored placement/campaign.',
    rows.map((r) => `SELECT 'placement' AS kind, placement_id AS id FROM placements WHERE placement_id = ${q(r.listing.placement_id)} AND (tenant_id <> ${q(r.tenant.tenant_id)} OR kind <> 'organic_listing')\nUNION ALL SELECT 'campaign', campaign_id FROM campaigns WHERE campaign_id = ${q(r.control.campaign.campaign_id)} AND (tenant_id <> ${q(r.tenant.tenant_id)} OR kind <> 'organic_baseline')`).join('\nUNION ALL\n') + ';',
    '-- 2. Sponsored rows the controls depend on must already exist (apply d1-upsert.sql first).',
    rows.map((r) => `SELECT 'missing_destination' AS problem, ${q(r.destination_id)} AS id WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE destination_id = ${q(r.destination_id)} AND tenant_id = ${q(r.tenant.tenant_id)})`).join('\nUNION ALL\n') + ';',
    '-- 3. Another placement already measured on the same control rows.',
    `SELECT pp.placement_id, pp.page_path FROM placement_pages pp JOIN placements p ON p.placement_id = pp.placement_id WHERE p.kind = 'organic_listing' AND pp.page_path IN (${[...new Set(rows.map((r) => q(r.listing.page_path)))].join(', ')}) AND p.featured_location_id IN (${rows.map((r) => q(r.location.location_id)).join(', ')}) AND pp.placement_id NOT IN (${pids});`, ''].join('\n');
}
