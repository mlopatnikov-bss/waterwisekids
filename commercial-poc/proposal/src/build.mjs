// Builds the Phase 2 proposal (inventory, card markup, diffs) IN MEMORY from:
//   - seed/pilot-manifest.json (IDs, destinations, held status, conflicts)
//   - proposal/inventory.config.json (the eight pages + the audited per-page edit plan)
//   - the current WWK source pages, read-only.
// Nothing here writes to the repository; scripts/build-proposal.mjs writes only under proposal/.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEditDiff, createNewFileDiff } from './udiff.mjs';
import { utmParams, taggedUrl } from './utm.mjs';

export const PROPOSAL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const POC_ROOT = resolve(PROPOSAL_ROOT, '..');
export const REPO_ROOT = resolve(POC_ROOT, '..');
export const REQUIRED_PAGES = Object.freeze([
  '/swim-lessons/northwest-philadelphia.html', '/swim-lessons/cheltenham-pa.html', '/swim-lessons/philadelphia.html',
  '/swim-lessons/jersey-shore.html', '/swim-lessons/howell-nj.html', '/swim-lessons/brick-nj.html',
  '/swim-lessons-toms-river-nj.html', '/swim-lessons/directory/new-york.html',
]);

export const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function loadInputs({ repoRoot = REPO_ROOT } = {}) {
  const manifest = JSON.parse(readFileSync(join(POC_ROOT, 'seed/pilot-manifest.json'), 'utf8'));
  const config = JSON.parse(readFileSync(join(PROPOSAL_ROOT, 'inventory.config.json'), 'utf8'));
  const component = {
    css: readFileSync(join(PROPOSAL_ROOT, 'component/wwk-sponsored.css'), 'utf8'),
    js: readFileSync(join(PROPOSAL_ROOT, 'component/wwk-sponsored.js'), 'utf8'),
  };
  return { manifest, config, component, repoRoot };
}

function fail(msg) { throw new Error(`proposal: ${msg}`); }

/** Resolve everything one page needs from the manifest, refusing anything held or cross-tenant. */
export function resolvePlacement(manifest, page) {
  const pp = manifest.placement_pages.filter((x) => x.page_path === page.page_path);
  const placements = pp.map((x) => manifest.placements.find((p) => p.placement_id === x.placement_id)).filter((p) => p && p.kind === 'sponsored_card');
  if (placements.length !== 1) fail(`${page.page_path}: expected exactly one sponsored placement in the manifest, found ${placements.length}`);
  const placement = placements[0];
  if (placement.slot_key !== page.slot_key) fail(`${page.page_path}: slot ${page.slot_key} != manifest ${placement.slot_key}`);
  if (placement.link_rel !== 'sponsored noopener') fail(`${page.page_path}: manifest link_rel is ${placement.link_rel}`);
  const tenant = manifest.tenants.find((t) => t.tenant_id === placement.tenant_id) || fail('unknown tenant');
  const campaign = manifest.campaigns.find((c) => c.campaign_id === placement.campaign_id) || fail('unknown campaign');
  if (campaign.tenant_id !== tenant.tenant_id || campaign.kind !== 'sponsored_pilot' || campaign.disclosure_label !== 'Sponsored pilot' || campaign.price_cents !== 0) fail(`${page.page_path}: campaign is not a $0 labeled sponsored pilot of this tenant`);
  const school = manifest.schools.find((s) => s.school_id === campaign.school_id && s.tenant_id === tenant.tenant_id) || fail('school/tenant mismatch');
  const pageRow = pp.find((x) => x.placement_id === placement.placement_id);
  const locById = new Map(manifest.locations.map((l) => [l.location_id, l]));
  const featured = placement.featured_location_id ? locById.get(placement.featured_location_id) : null;
  if (placement.featured_location_id && (!featured || featured.tenant_id !== tenant.tenant_id || featured.status !== 'eligible_fixture')) fail(`${page.page_path}: featured location is not an eligible location of this tenant`);
  const dests = manifest.placement_destinations.filter((d) => d.placement_id === placement.placement_id)
    .map((d) => manifest.destinations.find((x) => x.destination_id === d.destination_id));
  for (const d of dests) {
    if (!d || d.tenant_id !== tenant.tenant_id) fail(`${page.page_path}: destination not owned by tenant`);
    if (!manifest.allowed_destination_hosts.includes(new URL(d.url).hostname)) fail(`${page.page_path}: destination host not allowlisted`);
    if (d.location_id) {
      const l = locById.get(d.location_id);
      if (!l || l.tenant_id !== tenant.tenant_id || l.status !== 'eligible_fixture') fail(`${page.page_path}: destination points at a held/foreign location`);
    }
  }
  const territory = dests.find((d) => d.location_id === null) || fail(`${page.page_path}: no territory destination`);
  const locationDests = dests.filter((d) => d.location_id !== null).map((d) => ({ ...d, location: locById.get(d.location_id) }));
  const held = manifest.locations.filter((l) => l.tenant_id === tenant.tenant_id && l.status !== 'eligible_fixture');
  return { placement, tenant, campaign, school, pageRow, featured, territory, locationDests, held };
}

/** Card markup lines (no indentation). Plain HTML; works without JS or CSS. */
export function renderCard(config, r, page) {
  const utm = utmParams(config.utm, { campaignId: r.campaign.campaign_id, placementId: r.placement.placement_id });
  const href = (d) => taggedUrl(d.url, utm);
  const H = `h${page.heading_level}`;
  const id = `wwk-sp-${r.placement.placement_id}`;
  const host = (d) => new URL(d.url).hostname;
  const link = (d, text, locId, showHost = true) => `<a href="${esc(href(d))}" rel="sponsored noopener" data-wwk-destination="${d.destination_id}"${locId ? ` data-wwk-location="${locId}"` : ''}>${esc(text)}${showHost ? `<span class="wwk-sponsored__host"> (${esc(host(d))})</span>` : ''}</a>`;
  const attrs = [
    'class="wwk-sponsored"', `aria-labelledby="${id}-label ${id}-title"`, 'data-wwk-sponsored-card=""',
    `data-wwk-tenant="${r.tenant.tenant_id}"`, `data-wwk-school="${r.school.school_id}"`, `data-wwk-campaign="${r.campaign.campaign_id}"`,
    `data-wwk-placement="${r.placement.placement_id}"`, ...(r.featured ? [`data-wwk-location="${r.featured.location_id}"`] : []),
    `data-wwk-page-path="${esc(r.pageRow.page_path)}"`,
  ];
  const lines = [
    `<!-- WWK sponsored placement ${r.placement.placement_id} (${config.label}) -->`,
    `<link rel="stylesheet" href="${config.asset_paths.css}?v=${config.asset_version}">`,
    `<aside ${attrs.join(' ')}>`,
    `  <p class="wwk-sponsored__label" id="${id}-label">${esc(config.label)}</p>`,
    `  <${H} class="wwk-sponsored__title" id="${id}-title">${esc(r.school.display_name)}</${H}>`,
  ];
  let copy;
  if (r.featured) {
    const fd = r.locationDests.find((d) => d.location_id === r.featured.location_id) || fail('featured destination missing');
    copy = { variant: 'location', text: `Pool location: ${r.featured.display_name}, ${r.featured.address_display}.`, links: [
      { destination_id: fd.destination_id, text: `${r.featured.display_name} location page` },
      { destination_id: r.territory.destination_id, text: `${r.school.display_name} website` }] };
    lines.push(`  <p class="wwk-sponsored__text">${esc(copy.text)} ${esc(config.instruction)}</p>`);
    lines.push('  <ul class="wwk-sponsored__links">');
    lines.push(`    <li>${link(fd, copy.links[0].text, r.featured.location_id)}</li>`);
    lines.push(`    <li>${link(r.territory, copy.links[1].text)}</li>`);
    lines.push('  </ul>');
  } else {
    const showAddress = r.locationDests.length <= 3;
    copy = { variant: 'territory', text: `Pool locations featured in this pilot (${host(r.territory)}):`, venues: r.locationDests.map((d) => ({ destination_id: d.destination_id, text: d.location.display_name, address: showAddress ? d.location.address_display : null })),
      links: [{ destination_id: r.territory.destination_id, text: `${r.school.display_name} website` }] };
    lines.push(`  <p class="wwk-sponsored__text">${esc(copy.text)}</p>`);
    lines.push('  <ul class="wwk-sponsored__venues">');
    for (const v of copy.venues) {
      const d = r.locationDests.find((x) => x.destination_id === v.destination_id);
      lines.push(`    <li>${link(d, v.text, d.location_id, false)}${v.address ? ` <span class="wwk-sponsored__address">${esc(v.address)}</span>` : ''}</li>`);
    }
    lines.push('  </ul>');
    lines.push(`  <p class="wwk-sponsored__text">${esc(config.instruction)}</p>`);
    lines.push('  <ul class="wwk-sponsored__links">');
    lines.push(`    <li>${link(r.territory, copy.links[0].text)}</li>`);
    lines.push('  </ul>');
  }
  lines.push(`  <p class="wwk-sponsored__disclosure">${esc(config.disclosure)}</p>`);
  lines.push('</aside>');
  lines.push(`<script src="${config.asset_paths.js}?v=${config.asset_version}" defer></script>`);
  copy.label = config.label; copy.heading = r.school.display_name; copy.instruction = config.instruction; copy.disclosure = config.disclosure;
  return { lines, copy, utm, hrefs: Object.fromEntries([r.territory, ...r.locationDests].map((d) => [d.destination_id, href(d)])) };
}

function uniqueLine(lines, pred, what, pagePath) {
  const hits = [];
  lines.forEach((l, i) => { if (pred(l)) hits.push(i); });
  if (hits.length !== 1) fail(`${pagePath}: ${what} must match exactly one source line, matched ${hits.length}`);
  return hits[0];
}
const count = (hay, needle) => (needle === '' ? 0 : hay.split(needle).length - 1);
const OPS = new Set(['replace_line', 'replace_block', 'replace_text', 'insert_card']);

/**
 * Turn the audited edit plan for one page into strict line changes.
 * Every edit names the exact source text it expects; anything missing, duplicated or drifted is refused.
 * Returns { changes, edits, card } where card describes where the sponsored card lands.
 */
export function planEdits(lines, page, cardLines) {
  const P = page.page_path;
  const changes = []; const edits = []; let card = null;
  const textEdits = new Map(); // line index -> { text, ids }
  for (const e of page.edits) {
    if (!OPS.has(e.op)) fail(`${P}: unknown edit op ${e.op}`);
    if (!e.id || !e.classification || !e.finding || !e.action) fail(`${P}: edit ${e.id} lacks id/classification/finding/action`);
    const wantsCard = e.op === 'insert_card' || e.with_card === true;
    if (wantsCard && card) fail(`${P}: more than one card edit`);
    const indentOf = (i) => (lines[i].match(/^\s*/) || [''])[0];
    const cardAt = (i) => cardLines.map((l) => (l ? indentOf(i) + l : l));
    if (e.op === 'replace_line') {
      const i = uniqueLine(lines, (l) => l === e.line, `${e.id} line`, P);
      if (!Array.isArray(e.with_lines)) fail(`${P}: ${e.id} needs with_lines`);
      changes.push({ start: i, deleteCount: 1, lines: e.with_lines, id: e.id });
      edits.push({ ...e, source_lines: [i + 1, i + 1], removed_lines: [lines[i]], added_lines: e.with_lines });
    } else if (e.op === 'replace_block') {
      const i = uniqueLine(lines, (l) => l === e.from_line, `${e.id} from_line`, P);
      let j = i; while (j < lines.length && lines[j] !== e.to_line) j += 1;
      if (j >= lines.length) fail(`${P}: ${e.id} to_line not found after from_line`);
      if (j - i + 1 !== e.expect_lines) fail(`${P}: ${e.id} block is ${j - i + 1} lines, expected ${e.expect_lines}`);
      const add = e.with_card ? cardAt(i) : e.with_lines;
      if (!Array.isArray(add)) fail(`${P}: ${e.id} needs with_card or with_lines`);
      changes.push({ start: i, deleteCount: j - i + 1, lines: add, id: e.id });
      const { with_lines, ...meta } = e; void with_lines;
      edits.push({ ...meta, source_lines: [i + 1, j + 1], removed_lines: lines.slice(i, j + 1), added_lines: e.with_card ? ['(sponsored-pilot card, see card_html)'] : add });
      if (e.with_card) card = { edit_id: e.id, op: 'replace_block', source_from_line: i + 1, source_to_line: j + 1, replaced_lines: j - i + 1, lines: add.length, indent: indentOf(i).length, block: add };
    } else if (e.op === 'insert_card') {
      const before = e.before_line !== undefined;
      const i = uniqueLine(lines, (l) => l === (before ? e.before_line : e.after_line), `${e.id} anchor`, P);
      const at = before ? i : i + 1;
      const add = cardAt(i);
      changes.push({ start: at, deleteCount: 0, lines: add, id: e.id });
      edits.push({ ...e, source_lines: [i + 1, i + 1], removed_lines: [], added_lines: ['(sponsored-pilot card, see card_html)'] });
      card = { edit_id: e.id, op: 'insert', anchor_line: i + 1, anchor_match: before ? 'before_line' : 'after_line', inserted_before_source_line: at + 1, replaced_lines: 0, lines: add.length, indent: indentOf(i).length, block: add };
    } else {
      const i = uniqueLine(lines, (l) => l.includes(e.line_contains), `${e.id} line_contains`, P);
      const cur = textEdits.get(i) || { text: lines[i], ids: [] };
      if (count(cur.text, e.find) !== 1) fail(`${P}: ${e.id} find text must occur exactly once in source line ${i + 1}`);
      cur.text = cur.text.replace(e.find, () => e.replace); cur.ids.push(e.id);
      textEdits.set(i, cur);
      edits.push({ ...e, source_lines: [i + 1, i + 1], removed_text: e.find, added_text: e.replace });
    }
  }
  for (const [i, t] of textEdits) changes.push({ start: i, deleteCount: 1, lines: [t.text], id: t.ids.join('+') });
  if (!card) fail(`${P}: edit plan has no card edit`);
  const starts = changes.map((c) => c.start).sort((a, b) => a - b);
  if (new Set(starts).size !== starts.length) fail(`${P}: two edits touch the same source line; use replace_text on long shared lines`);
  return { changes, edits, card };
}

/** Repo-relative path for a page path (pages are served at their file path). */
export const sourceFileFor = (manifest, pagePath) => {
  const row = manifest.placement_pages.find((p) => p.page_path === pagePath);
  return row ? row.source_file : null;
};

export function buildProposal(inputs = loadInputs()) {
  const { manifest, config, component, repoRoot } = inputs;
  const pagesCfg = config.pages.map((p) => p.page_path);
  if (JSON.stringify([...pagesCfg].sort()) !== JSON.stringify([...REQUIRED_PAGES].sort())) fail('inventory must cover exactly the eight brief pages');
  const pages = [];
  for (const page of config.pages) {
    const r = resolvePlacement(manifest, page);
    const sourceFile = r.pageRow.source_file;
    const sourceText = readFileSync(join(repoRoot, sourceFile), 'utf8');
    const lines = sourceText.split('\n');
    const cardR = renderCard(config, r, page);
    const plan = planEdits(lines, page, cardR.lines);
    const { diff, proposed } = createEditDiff(sourceFile, sourceText, plan.changes);
    const proposedLines = proposed.split('\n');
    const cardStart = proposedLines.findIndex((_, k) => plan.card.block.every((l, x) => proposedLines[k + x] === l));
    if (cardStart < 0 || proposed.split(plan.card.block.join('\n')).length !== 2) fail(`${page.page_path}: card block must appear exactly once in the proposed page`);
    const kept = (page.audit_kept || []).map((k) => {
      const at = lines.map((l, x) => (l.includes(k.line_contains) ? x + 1 : 0)).filter(Boolean);
      if (!at.length) fail(`${page.page_path}: kept item ${k.id} not found in source`);
      if (count(proposed, k.line_contains) !== count(sourceText, k.line_contains)) fail(`${page.page_path}: kept item ${k.id} was changed by the edit plan`);
      return { ...k, source_lines: at };
    });
    const conflicts = manifest.conflicts.filter((c) => c.tenant_key === r.tenant.tenant_key);
    pages.push({
      page_path: page.page_path, source_file: sourceFile, source_sha256: sha256(sourceText), source_lines: lines.length,
      canonical_url: r.pageRow.canonical_url,
      card_position: { edit_id: plan.card.edit_id, op: plan.card.op, source_from_line: plan.card.source_from_line ?? null, source_to_line: plan.card.source_to_line ?? null,
        anchor_line: plan.card.anchor_line ?? null, inserted_before_source_line: plan.card.inserted_before_source_line ?? null,
        replaced_source_lines: plan.card.replaced_lines, card_lines: plan.card.lines, proposed_start_line: cardStart + 1, indent: plan.card.indent,
        container_note: page.page_path.includes('/directory/') ? 'Inside section#cities after the "inclusion is not a ranking" disclaimer; outside #schoolsList, so directory order and the JS-rendered list are untouched.'
          : page.page_path === '/swim-lessons-toms-river-nj.html' ? 'Inside the article column, after the existing "Next step" box and before the Back link / FAQ.'
            : 'Inside <main>, in exactly the position of the removed "Featured School" section.' },
      audit: { edits: plan.edits, kept, promotional_items_changed: plan.edits.filter((x) => x.classification === 'promotional').length },
      ids: { tenant_id: r.tenant.tenant_id, school_id: r.school.school_id, campaign_id: r.campaign.campaign_id, placement_id: r.placement.placement_id,
        location_id: r.featured ? r.featured.location_id : null, destination_ids: Object.keys(cardR.hrefs) },
      tenant_key: r.tenant.tenant_key, school_name: r.school.display_name, variant: cardR.copy.variant,
      destinations: Object.entries(cardR.hrefs).map(([id, url]) => {
        const d = manifest.destinations.find((x) => x.destination_id === id);
        return { destination_id: id, official_url: d.url, tagged_url: url, location_id: d.location_id, role: d.location_id ? (r.featured && d.location_id === r.featured.location_id ? 'primary' : 'venue') : (r.featured ? 'secondary' : 'primary') };
      }),
      copy: cardR.copy, utm: cardR.utm,
      held_locations_not_shown: r.held.map((l) => ({ location_id: l.location_id, display_name: l.display_name, status: l.status })),
      conflicts: conflicts.map((c) => ({ id: c.id, severity: c.severity, kind: c.kind, subject: c.subject })),
      card_html: plan.card.block.join('\n'), diff, proposed_sha256: sha256(proposed), _proposed: proposed, _source: sourceText,
    });
  }
  const assets = [
    { path: config.asset_repo_files.css, text: component.css },
    { path: config.asset_repo_files.js, text: component.js },
  ].map((a) => ({ ...a, sha256: sha256(a.text), exists_in_repo: existsSync(join(repoRoot, a.path)), diff: createNewFileDiff(a.path, a.text) }));
  for (const a of assets) if (a.exists_in_repo) fail(`${a.path} already exists in the repo; proposal would overwrite it`);
  return { config, manifest, pages, assets };
}
