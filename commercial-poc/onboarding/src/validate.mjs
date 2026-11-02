// Semantic validation of a sponsor definition. Pure apart from read-only repo access.
// Any error blocks packet generation; warnings are reported in the summary.
import { stableId } from '../../src/ids.mjs';
import { APPROVAL_GATES, checkShape } from './schema.mjs';
import { editorialText, sourceFileFor, wordCount } from './repo.mjs';

export const MIN_EDITORIAL_WORDS = 400;
export const MAX_FACT_AGE_DAYS = 120;
export const MAX_CAMPAIGN_DAYS = 366;
export const SITE_ORIGIN = 'https://www.waterwisekids.com';
export const REQUIRED_DISCLOSURE_LABEL = 'Sponsored pilot'; // D1 CHECK on campaigns.disclosure_label
export const REQUIRED_DISCLOSURE_SENTENCE = 'Sponsorship does not change directory order or editorial content.';
const OWN_HOSTS = /(^|\.)waterwisekids\.com$/;
const HOST_RE = /^(?=.{4,100}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;
const ENTITY_RE = /^(ten|sch|loc|cmp|plc|dst|usr)_[a-f0-9]{16}$/;
const PII_VALUE_PATTERNS = [
  ['email', /[^\s@]+@[^\s@]+\.[^\s@]+/],
  ['phone', /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/],
  ['ipv4', /\b(?:\d{1,3}\.){3}\d{1,3}\b/],
  ['ipv6', /\b(?:[0-9a-f]{1,4}:){3,7}[0-9a-f]{1,4}\b/i],
  ['long_digit_run', /\d{9,}/],
];
// Keys that end up in analytics (UTM content/campaign natural keys, user IDs) must not name people or contact data.
const PII_KEY_WORDS = /(e-?mail|phone|\btel\b|ssn|dob|birth|child|student|parent|family|gmail|yahoo|outlook)/i;

const dayMs = 86_400_000;
const days = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / dayMs);

export function expectedIds(def) {
  const out = [];
  for (const t of def.tenants) {
    const terr = t.school.territory_url;
    out.push(['ten', `${terr}`, t.tenant_id, `tenants[${t.tenant_key}].tenant_id`]);
    out.push(['sch', `${terr}`, t.school.school_id, `tenants[${t.tenant_key}].school.school_id`]);
    out.push(['cmp', `${terr}#${t.campaign.campaign_key}`, t.campaign.campaign_id, `tenants[${t.tenant_key}].campaign.campaign_id`]);
    const locByKey = new Map(t.locations.map((l) => [l.location_key, l]));
    for (const l of t.locations) out.push(['loc', l.official_url, l.location_id, `tenants[${t.tenant_key}].locations[${l.location_key}].location_id`]);
    for (const d of t.destinations) {
      const target = d.kind === 'territory' ? terr : locByKey.get(d.location_key)?.official_url;
      if (target) out.push(['dst', target, d.destination_id, `tenants[${t.tenant_key}].destinations[${d.location_key ?? 'territory'}].destination_id`]);
    }
    for (const p of t.placements) out.push(['plc', `${terr}#${p.slot_key}`, p.placement_id, `tenants[${t.tenant_key}].placements[${p.slot_key}].placement_id`]);
  }
  for (const u of def.portal.users) out.push(['usr', `invite:${def.definition_key}:${u.invite_ref}`, null, `portal.users[${u.invite_ref}]`]);
  return out.map(([prefix, naturalKey, given, path]) => ({ prefix, natural_key: naturalKey, given, expected: stableId(prefix, naturalKey), path }));
}

function walkStrings(value, path, fn) {
  if (typeof value === 'string') fn(value, path);
  else if (Array.isArray(value)) value.forEach((v, i) => walkStrings(v, `${path}[${i}]`, fn));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walkStrings(v, `${path}.${k}`, fn);
}

function checkUrl(raw, hosts, path, err) {
  let u;
  try { u = new URL(raw); } catch { err('bad_url', path, 'not a URL'); return null; }
  if (u.protocol !== 'https:') err('bad_url', path, 'https only');
  if (u.username || u.password) err('bad_url', path, 'credentials not allowed');
  if (u.port) err('bad_url', path, 'explicit port not allowed');
  if (u.search || u.hash || raw.includes('?') || raw.includes('#')) err('bad_url', path, 'query/fragment not allowed (UTM is added by the packet)');
  if (u.href !== raw) err('bad_url', path, `not normalized; expected ${u.href}`);
  if (!u.pathname.endsWith('/')) err('bad_url', path, 'official page URLs end with "/"');
  if (!hosts.has(u.hostname)) err('host_not_allowed', path, `${u.hostname} is not in destination_hosts`);
  return u;
}

/**
 * @param def parsed definition
 * @param ctx { repo, existingManifest?, others?: definition[], asOf?: 'YYYY-MM-DD' }
 */
export function validateDefinition(def, ctx) {
  const errors = []; const warnings = [];
  const err = (code, path, detail) => errors.push({ code, path, detail });
  const warn = (code, path, detail) => warnings.push({ code, path, detail });

  // 1. Shape (closed objects). Semantic checks need a valid shape.
  for (const e of checkShape(def)) errors.push(e);
  if (errors.length) return { ok: false, errors: sortIssues(errors), warnings };

  // 2. Template placeholders and PII-shaped values anywhere in the definition.
  walkStrings(def, '$', (s, path) => {
    if (/TODO_|REPLACE_ME/.test(s)) err('template_placeholder', path, 'fill in the template value');
    if (ENTITY_RE.test(s)) return;
    for (const [kind, re] of PII_VALUE_PATTERNS) if (re.test(s)) { err('pii_value', path, `${kind}-shaped value`); break; }
  });
  const analyticKeys = [['definition_key', def.definition_key], ...def.portal.users.map((u, i) => [`portal.users[${i}].invite_ref`, u.invite_ref]),
    ...def.tenants.flatMap((t, i) => [[`tenants[${i}].campaign.campaign_key`, t.campaign.campaign_key], ...t.placements.map((p, j) => [`tenants[${i}].placements[${j}].slot_key`, p.slot_key])])];
  for (const [path, k] of analyticKeys) if (PII_KEY_WORDS.test(k)) err('pii_value', `$.${path}`, 'analytics key names contact or personal data');
  if (errors.some((e) => e.code === 'template_placeholder')) return { ok: false, errors: sortIssues(errors), warnings };

  // 3. Hosts.
  const hosts = new Set();
  def.destination_hosts.forEach((h, i) => {
    const path = `$.destination_hosts[${i}]`;
    if (hosts.has(h)) err('duplicate_key', path, h);
    hosts.add(h);
    if (!HOST_RE.test(h) || h === 'localhost' || /^\d+(\.\d+){3}$/.test(h)) err('bad_host', path, 'must be a public DNS hostname');
    if (OWN_HOSTS.test(h)) err('bad_host', path, 'WWK hosts cannot be sponsor destinations');
  });

  // 4. Uniqueness inside the definition.
  const uniq = (label, items) => {
    const seen = new Map();
    for (const [value, path] of items) {
      if (seen.has(value)) err('duplicate_key', path, `${label} ${value} also at ${seen.get(value)}`);
      else seen.set(value, path);
    }
  };
  const T = def.tenants;
  uniq('tenant_key', T.map((t, i) => [t.tenant_key, `$.tenants[${i}].tenant_key`]));
  uniq('market_key', def.markets.map((m, i) => [m.market_key, `$.markets[${i}].market_key`]));
  uniq('page_inventory page', def.page_inventory.map((p, i) => [p.page_path, `$.page_inventory[${i}].page_path`]));
  uniq('location_key', T.flatMap((t, i) => t.locations.map((l, j) => [l.location_key, `$.tenants[${i}].locations[${j}].location_key`])));
  uniq('location URL', T.flatMap((t, i) => t.locations.map((l, j) => [l.official_url, `$.tenants[${i}].locations[${j}].official_url`])));
  uniq('slot_key', T.flatMap((t, i) => t.placements.map((p, j) => [p.slot_key, `$.tenants[${i}].placements[${j}].slot_key`])));
  uniq('placement page', T.flatMap((t, i) => t.placements.map((p, j) => [p.page_path, `$.tenants[${i}].placements[${j}].page_path`])));
  uniq('territory', T.map((t, i) => [t.school.territory_url, `$.tenants[${i}].school.territory_url`]));
  uniq('invite_ref', def.portal.users.map((u, i) => [u.invite_ref, `$.portal.users[${i}].invite_ref`]));
  uniq('approval gate', def.approvals.map((a, i) => [a.gate, `$.approvals[${i}].gate`]));
  const allIds = T.flatMap((t, i) => [[t.tenant_id, `$.tenants[${i}].tenant_id`], [t.school.school_id, `$.tenants[${i}].school.school_id`], [t.campaign.campaign_id, `$.tenants[${i}].campaign.campaign_id`],
    ...t.locations.map((l, j) => [l.location_id, `$.tenants[${i}].locations[${j}].location_id`]),
    ...t.destinations.map((d, j) => [d.destination_id, `$.tenants[${i}].destinations[${j}].destination_id`]),
    ...t.placements.map((p, j) => [p.placement_id, `$.tenants[${i}].placements[${j}].placement_id`])]);
  uniq('id', allIds);

  // 5. Stable IDs must match their natural keys.
  for (const x of expectedIds(def)) if (x.given !== null && x.given !== x.expected) err('id_mismatch', `$.${x.path}`, `expected ${x.expected} from natural key ${x.natural_key}`);

  // 6. Dates and approvals.
  const asOf = ctx.asOf || def.prepared_on;
  const markets = new Map(def.markets.map((m) => [m.market_key, m]));
  for (const a of def.approvals) {
    const i = def.approvals.indexOf(a);
    if (a.status === 'recorded') {
      if (!a.recorded_on || !a.evidence_ref) err('approval_incomplete', `$.approvals[${i}]`, 'recorded approvals need recorded_on and evidence_ref');
      else if (!ctx.repo.read(a.evidence_ref)) err('evidence_missing', `$.approvals[${i}].evidence_ref`, `${a.evidence_ref} not found in repo`);
    } else if (a.recorded_on || a.evidence_ref) err('approval_incomplete', `$.approvals[${i}]`, 'pending approvals carry no date or evidence');
  }
  for (const g of APPROVAL_GATES) if (!def.approvals.some((a) => a.gate === g)) err('missing_field', '$.approvals', `gate ${g}`);

  // 7. Inventory: existing pages only. This tool never creates pages.
  const inventory = new Map(def.page_inventory.map((p) => [p.page_path, p]));
  def.page_inventory.forEach((p, i) => {
    if (!markets.has(p.market_key)) err('unknown_market', `$.page_inventory[${i}].market_key`, p.market_key);
    if (p.page_status !== 'existing') err('new_page_not_supported', `$.page_inventory[${i}]`, 'onboarding attaches cards to existing, substantive pages only; propose new pages through the content worklist and editorial review');
  });

  // 8. Per-tenant ownership, URLs, facts, destinations, campaign, placements.
  const snapshotCache = new Map();
  const loadJson = (rel) => {
    if (!snapshotCache.has(rel)) { const txt = ctx.repo.read(rel); let v = null; try { v = txt ? JSON.parse(txt) : null; } catch { v = null; } snapshotCache.set(rel, v); }
    return snapshotCache.get(rel);
  };
  const tenantOfLocation = new Map(T.flatMap((t) => t.locations.map((l) => [l.location_key, t.tenant_key])));
  const usedPages = new Set();

  T.forEach((t, ti) => {
    const tp = `$.tenants[${ti}]`;
    const terr = checkUrl(t.school.territory_url, hosts, `${tp}.school.territory_url`, err);
    if (t.school.display_name !== t.display_name) warn('name_mismatch', `${tp}.school.display_name`, 'tenant and school display names differ');
    const locs = new Map(t.locations.map((l) => [l.location_key, l]));

    t.locations.forEach((l, li) => {
      const lp = `${tp}.locations[${li}]`;
      const u = checkUrl(l.official_url, hosts, `${lp}.official_url`, err);
      if (u && terr && !(u.hostname === terr.hostname && u.pathname.startsWith(terr.pathname) && u.pathname !== terr.pathname)) err('ownership_conflict', `${lp}.official_url`, 'location page is not under this school\'s territory URL');
      if (!markets.has(l.market_key)) err('unknown_market', `${lp}.market_key`, l.market_key);
      const address = l.facts.filter((f) => f.fact_key === 'address');
      const page = l.facts.filter((f) => f.fact_key === 'location_page');
      if (!address.some((f) => f.value === l.address_display)) err('uncited_fact', `${lp}.address_display`, 'address_display must equal a cited address fact');
      if (!page.some((f) => f.value === l.official_url)) err('uncited_fact', `${lp}.official_url`, 'official_url must equal a cited location_page fact');
      l.facts.forEach((f, fi) => {
        const fp = `${lp}.facts[${fi}]`;
        if (f.source_url) checkUrl(f.source_url, hosts, `${fp}.source_url`, err);
        if (f.observed_on > def.prepared_on) err('invalid_value', `${fp}.observed_on`, 'observed after prepared_on');
        if (days(f.observed_on, asOf) > MAX_FACT_AGE_DAYS) err('stale_fact', `${fp}.observed_on`, `older than ${MAX_FACT_AGE_DAYS} days at ${asOf}; re-verify the source`);
        if (f.source === 'operator_written_confirmation') { warn('human_source_check', fp, 'written confirmation is held outside the repo; verify before activation'); return; }
        if (f.source_ref.split('/').some((s) => s === '..' || s === '.' || s === '') || !ctx.repo.safeResolve(f.source_ref)) { err('unsafe_path', `${fp}.source_ref`, f.source_ref); return; }
        if (f.source === 'official_snapshot') {
          const snap = loadJson(f.source_ref);
          if (!snap || !Array.isArray(snap.territories)) { err('source_missing', `${fp}.source_ref`, `${f.source_ref} is not a readable official snapshot`); return; }
          if (snap.observed_on !== f.observed_on) err('fact_mismatch', `${fp}.observed_on`, `snapshot observed_on is ${snap.observed_on}`);
          const territory = snap.territories.find((x) => x.territory_url === t.school.territory_url);
          const entry = territory?.locations?.find((x) => x.location_url === l.official_url);
          if (!territory) { err('fact_mismatch', fp, 'territory not in snapshot'); return; }
          if (territory.school_name !== t.school.display_name) err('fact_mismatch', `${tp}.school.display_name`, `snapshot names the school "${territory.school_name}"`);
          if (!entry) { err('fact_mismatch', fp, 'location not in snapshot for this territory'); return; }
          if (f.fact_key === 'address' && entry.address !== f.value) err('fact_mismatch', `${fp}.value`, `snapshot address is "${entry.address}"`);
          if (f.fact_key === 'location_page' && entry.location_url !== f.value) err('fact_mismatch', `${fp}.value`, 'snapshot URL differs');
          if (f.fact_key === 'venue_name' && entry.venue !== f.value) err('fact_mismatch', `${fp}.value`, `snapshot venue is "${entry.venue}"`);
          if (entry.venue !== l.display_name) err('fact_mismatch', `${lp}.display_name`, `snapshot venue is "${entry.venue}"`);
          if (entry.no_classes_notice) err('location_not_offering', lp, 'official page states no classes are available');
          if (entry.listed_on_territory_page === false) err('location_not_offering', lp, 'not listed on the official territory page');
        } else if (f.source === 'repo_directory_data') {
          const txt = ctx.repo.read(f.source_ref);
          if (!txt) err('source_missing', `${fp}.source_ref`, f.source_ref);
          else if (!txt.includes(f.value)) err('fact_mismatch', `${fp}.value`, `value not found in ${f.source_ref}`);
        }
      });
    });

    // Destinations: one territory, one per location, all owned by this tenant.
    const terrDests = t.destinations.filter((d) => d.kind === 'territory');
    if (terrDests.length !== 1) err('destination_invalid', `${tp}.destinations`, 'exactly one territory destination required');
    t.destinations.forEach((d, di) => {
      const dp = `${tp}.destinations[${di}]`;
      if (d.kind === 'territory' && d.location_key !== null) err('destination_invalid', dp, 'territory destination has no location_key');
      if (d.kind === 'location') {
        if (!d.location_key) err('destination_invalid', dp, 'location destination needs location_key');
        else if (!locs.has(d.location_key)) err(tenantOfLocation.has(d.location_key) ? 'ownership_conflict' : 'unknown_location', `${dp}.location_key`, d.location_key);
      }
    });
    for (const l of t.locations) if (t.destinations.filter((d) => d.location_key === l.location_key).length !== 1) err('destination_invalid', `${tp}.destinations`, `exactly one destination required for ${l.location_key}`);

    // Campaign: disclosure, value, dates.
    const c = t.campaign; const cp = `${tp}.campaign`;
    if (c.disclosure_label !== REQUIRED_DISCLOSURE_LABEL) err('missing_disclosure', `${cp}.disclosure_label`, `must be "${REQUIRED_DISCLOSURE_LABEL}" (visible label and D1 constraint)`);
    if (!c.disclosure_text.includes(REQUIRED_DISCLOSURE_SENTENCE)) err('missing_disclosure', `${cp}.disclosure_text`, `must include "${REQUIRED_DISCLOSURE_SENTENCE}"`);
    if (c.price_cents === 0 && !/no-fee/i.test(c.disclosure_text)) err('missing_disclosure', `${cp}.disclosure_text`, 'a $0 campaign must say it is a no-fee placement');
    if (c.price_cents !== 0) err('campaign_value_requires_schema_migration', `${cp}.price_cents`, 'D1 schema v2 enforces price_cents = 0; a paid campaign needs a reviewed migration first');
    if (c.ends_on < c.starts_on) err('invalid_value', `${cp}.ends_on`, 'ends before it starts');
    if (days(c.starts_on, c.ends_on) > MAX_CAMPAIGN_DAYS) err('invalid_value', `${cp}.ends_on`, `campaign longer than ${MAX_CAMPAIGN_DAYS} days`);
    if (c.ends_on < asOf) warn('campaign_ended', `${cp}.ends_on`, `ended before ${asOf}`);

    // Placements.
    t.placements.forEach((p, pi) => {
      const pp = `${tp}.placements[${pi}]`;
      usedPages.add(p.page_path);
      const inv = inventory.get(p.page_path);
      if (!inv) err('page_not_in_inventory', `${pp}.page_path`, p.page_path);
      else if (inv.market_key !== p.market_key) err('market_mismatch', `${pp}.market_key`, `inventory lists ${inv.market_key}`);
      const market = markets.get(p.market_key);
      if (!market) err('unknown_market', `${pp}.market_key`, p.market_key);
      for (const k of p.location_keys) if (!locs.has(k)) err(tenantOfLocation.has(k) ? 'ownership_conflict' : 'unknown_location', `${pp}.location_keys`, `${k} is not a location of ${t.tenant_key}`);
      if (new Set(p.location_keys).size !== p.location_keys.length) err('duplicate_key', `${pp}.location_keys`, 'repeated location');
      if (p.variant === 'featured_location') {
        if (p.location_keys.length !== 1) err('invalid_value', `${pp}.location_keys`, 'featured_location takes exactly one location');
        const l = locs.get(p.location_keys[0]);
        if (l && l.market_key !== p.market_key) err('market_mismatch', `${pp}.location_keys`, `featured location is in ${l.market_key}, page is ${p.market_key}`);
      }
      if (p.anchor.type === 'existing_marker' && p.anchor.text !== null) err('invalid_value', `${pp}.anchor.text`, 'existing_marker takes no text');
      if (p.anchor.type === 'insert_after' && !p.anchor.text) err('missing_field', `${pp}.anchor.text`, 'insert_after needs the exact anchor line');

      const src = sourceFileFor(p.page_path);
      if (src.error) { err('unsafe_path', `${pp}.page_path`, p.page_path); return; }
      const html = ctx.repo.read(src.file);
      if (html === null) { err('page_not_found', `${pp}.page_path`, `${src.file} does not exist in the repo`); return; }
      const body = editorialText(html);
      const words = wordCount(body);
      if (words < MIN_EDITORIAL_WORDS) err('thin_content', `${pp}.page_path`, `${words} editorial words; at least ${MIN_EDITORIAL_WORDS} required before a sponsored card is added`);
      if (market && !market.place_names.some((n) => body.toLowerCase().includes(n.toLowerCase()))) err('irrelevant_page', `${pp}.page_path`, `page never mentions ${market.place_names.join(' / ')}`);
      const canonical = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i.exec(html)?.[1] ?? /<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i.exec(html)?.[1];
      if (canonical !== `${SITE_ORIGIN}${p.page_path}`) warn('canonical_mismatch', `${pp}.page_path`, `canonical is ${canonical ?? 'missing'}`);
      const foreign = [...html.matchAll(/data-wwk-placement="(plc_[a-f0-9]{16})"|WWK sponsored placement (plc_[a-f0-9]{16})/g)].map((m) => m[1] || m[2]).filter((x) => x !== p.placement_id);
      if (foreign.length) err('ownership_conflict', `${pp}.page_path`, `page already carries another sponsored placement: ${[...new Set(foreign)].join(', ')}`);
      if (p.anchor.type === 'existing_marker' && !html.includes(`<!-- WWK sponsored placement ${p.placement_id} `)) err('anchor_not_found', `${pp}.anchor`, 'no existing card marker for this placement; use insert_after for a new card');
      if (p.anchor.type === 'insert_after' && p.anchor.text) {
        const n = html.split('\n').filter((line) => line.trim() === p.anchor.text).length;
        if (n !== 1) err('anchor_not_found', `${pp}.anchor.text`, `anchor line must occur exactly once (found ${n})`);
      }
    });
  });
  def.page_inventory.forEach((p, i) => { if (!usedPages.has(p.page_path)) warn('unused_inventory_page', `$.page_inventory[${i}]`, p.page_path); });

  // 9. Portal roles stay inside this definition's tenants.
  const tenantKeys = new Set(T.map((t) => t.tenant_key));
  def.portal.users.forEach((u, ui) => {
    uniq('membership tenant', u.memberships.map((m, mi) => [m.tenant_key, `$.portal.users[${ui}].memberships[${mi}].tenant_key`]));
    u.memberships.forEach((m, mi) => { if (!tenantKeys.has(m.tenant_key)) err('ownership_conflict', `$.portal.users[${ui}].memberships[${mi}].tenant_key`, `${m.tenant_key} is not a tenant of this definition`); });
  });
  for (const t of T) if (!def.portal.users.some((u) => u.memberships.some((m) => m.tenant_key === t.tenant_key && m.role === 'owner'))) warn('no_owner', `$.tenants[${T.indexOf(t)}]`, `${t.tenant_key} has no portal owner`);

  // 10. Ownership against the existing manifest and every other definition.
  checkCrossOwnership(def, ctx, err);

  return { ok: errors.length === 0, errors: sortIssues(errors), warnings: sortIssues(warnings) };
}

function claimsOf(source, label) {
  // Normalizes a manifest or a definition into ID/page/URL claims keyed to a tenant.
  const ids = new Map(); const pages = new Map(); const urls = new Map();
  if (source.tenants?.[0]?.school) {
    for (const t of source.tenants) {
      const tid = t.tenant_id;
      for (const x of [t.tenant_id, t.school.school_id, t.campaign.campaign_id, ...t.locations.map((l) => l.location_id), ...t.destinations.map((d) => d.destination_id), ...t.placements.map((p) => p.placement_id)]) ids.set(x, tid);
      for (const p of t.placements) pages.set(p.page_path, { tid, pid: p.placement_id });
      for (const l of t.locations) urls.set(l.official_url, tid);
    }
  } else {
    for (const k of ['tenants', 'schools', 'locations', 'campaigns', 'placements', 'destinations']) for (const r of source[k] || []) {
      const id = r.tenant_id && k === 'tenants' ? r.tenant_id : r.school_id && k === 'schools' ? r.school_id : r.location_id && k === 'locations' ? r.location_id : r.campaign_id && k === 'campaigns' ? r.campaign_id : r.placement_id && k === 'placements' ? r.placement_id : r.destination_id;
      ids.set(id, r.tenant_id);
    }
    const sponsored = new Set((source.placements || []).filter((p) => p.kind === 'sponsored_card').map((p) => p.placement_id));
    for (const pp of source.placement_pages || []) if (sponsored.has(pp.placement_id)) pages.set(pp.page_path, { tid: pp.tenant_id, pid: pp.placement_id });
    for (const l of source.locations || []) urls.set(l.official_url, l.tenant_id);
  }
  return { label, ids, pages, urls };
}

function checkCrossOwnership(def, ctx, err) {
  const others = [];
  if (ctx.existingManifest) others.push(claimsOf(ctx.existingManifest, 'seed/pilot-manifest.json'));
  for (const o of ctx.others || []) if (o.definition_key !== def.definition_key) others.push(claimsOf(o, `definition ${o.definition_key}`));
  const mine = claimsOf(def, 'this');
  for (const o of others) {
    for (const [id, tid] of mine.ids) if (o.ids.has(id) && o.ids.get(id) !== tid) err('ownership_conflict', '$', `${id} belongs to ${o.ids.get(id)} in ${o.label}`);
    for (const [page, c] of mine.pages) {
      const theirs = o.pages.get(page);
      if (theirs && (theirs.tid !== c.tid || theirs.pid !== c.pid)) err('ownership_conflict', '$', `${page} already carries ${theirs.pid} (${theirs.tid}) in ${o.label}`);
    }
    for (const [u, tid] of mine.urls) if (o.urls.has(u) && o.urls.get(u) !== tid) err('ownership_conflict', '$', `${u} belongs to ${o.urls.get(u)} in ${o.label}`);
  }
}

function sortIssues(list) {
  return [...list].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
}
