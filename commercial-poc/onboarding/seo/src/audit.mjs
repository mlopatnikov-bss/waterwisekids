// Territory SEO audit. Given the territory map and a site model, returns findings
// ({ level, code, page, detail }) plus a per-page fact table. It never writes anything.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as H from './html.mjs';
import { fileForPath, loadSite } from './site.mjs';

export const LEVELS = ['error', 'warn', 'info'];

export function loadMap(path) { return JSON.parse(readFileSync(path, 'utf8')); }

/** Street-address-shaped strings in text ("2116 1st Ave", "325 Park Avenue"). */
const STREET_RE = /\b\d{1,5}(?:-\d{1,4})?\s+(?:[A-Z0-9][\w.'’]*\s+){0,4}?(?:St|Street|Ave|Avenue|Pl|Place|Rd|Road|Blvd|Boulevard|Tpke|Turnpike|Hwy|Highway|Dr|Drive|Ln|Lane|Way|Pike|Plaza|Terrace)\b\.?/g;
export function streetAddresses(text) { return [...String(text).matchAll(STREET_RE)].map((m) => m[0].replace(/\.$/, '')); }

/** Every address string held in the verified sources named by the map policy. */
export function verifiedAddressCorpus(repo, sources) {
  let corpus = '';
  for (const rel of sources) {
    const text = repo.read(rel);
    if (text === null) throw new Error(`verified fact source missing: ${rel}`);
    corpus += `\n${text}`;
  }
  return H.norm(corpus.replace(/\\u2019/g, '’'));
}

const PRICE_RE = /\$\s?\d/;
const PHONE_RE = /\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/;

export function pageFacts(page, site) {
  const { html } = page;
  const canon = H.canonicals(html);
  const nodes = H.schemaNodes(html);
  const main = H.mainText(html);
  return {
    file: page.file,
    path: page.path,
    title: H.title(html),
    description: H.metaContent(html, 'description'),
    canonicals: canon,
    canonical: canon[0] || null,
    og_url: H.metaContent(html, 'og:url'),
    robots: H.robots(html),
    h1: H.headings(html, 1),
    editorial_words: H.wordCount(main),
    in_sitemap: site.sitemap.has(`${H.SITE_ORIGIN}${page.path}`),
    inbound: [...(site.inbound.get(page.file) || [])].sort(),
    jsonld_errors: H.jsonLd(html).filter((b) => !b.ok).map((b) => b.error),
    schema_types: [...new Set(nodes.flatMap(H.typesOf))].sort(),
    sponsored_cards: H.sponsoredBlocks(html).length,
  };
}

/**
 * Run the audit.
 * @param {object} map   territory map (territory-map.json)
 * @param {object} site  loadSite() result
 */
export function audit(map, site) {
  const findings = [];
  const add = (level, code, page, detail) => findings.push({ level, code, page, detail });
  const origin = map.site_origin;
  const policy = map.policy;
  const factsByPath = new Map();
  const factsFor = (path) => {
    if (factsByPath.has(path)) return factsByPath.get(path);
    const file = fileForPath(site.repo, path);
    const f = file && site.pages.get(file) ? pageFacts(site.pages.get(file), site) : null;
    factsByPath.set(path, f);
    return f;
  };
  const consolidated = new Map(); // path -> primary path
  const primaries = new Set();
  for (const t of map.territories) for (const i of t.intents) { primaries.add(i.primary); for (const c of i.consolidate) consolidated.set(c.page, i.primary); }
  const corpus = verifiedAddressCorpus(site.repo, policy.verified_fact_sources);

  // ---- per-page checks shared by every indexable territory page ----
  const checkIndexable = (path, t, role) => {
    const f = factsFor(path);
    if (!f) { add('error', 'page_missing', path, `${role} page does not exist`); return null; }
    const page = site.pages.get(f.file);
    if (f.canonicals.length !== 1) add('error', 'canonical_count', path, `expected exactly one rel=canonical, found ${f.canonicals.length}`);
    if (f.canonical !== `${origin}${path}`) add('error', 'primary_not_self_canonical', path, `canonical is ${f.canonical}`);
    if (f.robots.noindex) add('error', 'primary_noindex', path, `robots: ${f.robots.raw}`);
    if (!f.in_sitemap) add('error', 'primary_not_in_sitemap', path, 'indexable primary must be listed in sitemap.xml');
    if (f.og_url && f.og_url !== `${origin}${path}`) add('warn', 'og_url_mismatch', path, `og:url is ${f.og_url}`);
    if (f.h1.length !== 1) add('error', 'h1_count', path, `expected one <h1>, found ${f.h1.length}`);
    if (!f.title) add('error', 'title_missing', path, '');
    if (!f.description) add('error', 'description_missing', path, '');
    if (f.jsonld_errors.length) add('error', 'jsonld_parse', path, f.jsonld_errors.join('; '));
    if (f.editorial_words < policy.primary_min_editorial_words) add('error', 'thin_primary', path, `${f.editorial_words} editorial words (min ${policy.primary_min_editorial_words})`);
    const text = H.visibleText(page.html);
    if (!t.place_names.some((n) => text.toLowerCase().includes(n.toLowerCase()))) add('error', 'place_not_mentioned', path, t.place_names.join('/'));
    for (const ty of f.schema_types) if (policy.forbid_schema_types_on_territory_pages.includes(ty)) add('error', 'forbidden_schema_type', path, `${ty} schema asserts facts WWK has not verified for this page`);
    checkSchemaParity(page, path, origin, add);
    checkFaqToggle(page, path, add);
    checkSponsored(page, path, add);
    checkLinkTargets(page, path, site, origin, add, t.intents.some((i) => i.hub && i.primary === path) ? 'error' : 'warn');
    return f;
  };

  for (const t of map.territories) {
    for (const intent of t.intents) {
      const pf = checkIndexable(intent.primary, t, 'primary');
      if (!pf) continue;
      if (intent.hub) checkHub(site.pages.get(pf.file), intent.primary, pf, policy, corpus, add, intent);
      else {
        const min = intent === t.intents[0] ? policy.primary_min_inbound_internal_links : policy.intent_min_inbound_internal_links;
        if (pf.inbound.length < min) add('error', 'primary_underlinked', intent.primary, `${pf.inbound.length} internal pages link here (min ${min})`);
      }
      for (const c of intent.consolidate) {
        const cf = factsFor(c.page);
        if (!cf) { add('error', 'page_missing', c.page, 'consolidated page does not exist'); continue; }
        if (cf.canonicals.length !== 1) add('error', 'canonical_count', c.page, `found ${cf.canonicals.length}`);
        if (cf.canonical !== `${origin}${intent.primary}`) add('error', 'not_canonicalized', c.page, `canonical is ${cf.canonical}; expected ${origin}${intent.primary}`);
        if (cf.robots.noindex) add('error', 'noindex_with_canonical', c.page, 'noindex and a cross-page canonical send conflicting signals; use canonical only');
        if (cf.in_sitemap) add('error', 'consolidated_in_sitemap', c.page, 'non-canonical URL must not be listed in sitemap.xml');
        if (cf.og_url !== `${origin}${intent.primary}`) add('warn', 'og_url_mismatch', c.page, `og:url is ${cf.og_url}`);
        const page = site.pages.get(cf.file);
        if (!page.outLinks.some((l) => l.path === intent.primary)) add('error', 'no_visible_link_to_primary', c.page, 'visitors on the old URL need a visible link to the primary guide');
        if (cf.sponsored_cards) add('error', 'sponsored_on_consolidated', c.page, 'sponsored cards belong on the primary only');
        checkFaqToggle(page, c.page, add);
        checkSponsored(page, c.page, add);
      }
    }
    for (const req of t.required_inbound || []) {
      const general = t.intents[0].primary;
      const rf = fileForPath(site.repo, req);
      if (!rf) { add('error', 'required_linker_missing', req, `required to link to ${general}`); continue; }
      if (!site.pages.get(rf).outLinks.some((l) => l.path === general)) add('error', 'required_link_missing', req, `must link to ${general}`);
    }
    // The general primary links to each age/stage primary in the same town, and each links back.
    const [general, ...others] = t.intents.map((i) => i.primary);
    const gf = factsFor(general);
    if (gf) for (const o of others) {
      const of = factsFor(o);
      if (!site.pages.get(gf.file).outLinks.some((l) => l.path === o)) add('error', 'sibling_link_missing', general, `should link to ${o}`);
      if (of && !site.pages.get(of.file).outLinks.some((l) => l.path === general)) add('error', 'sibling_link_missing', o, `should link to ${general}`);
    }
    // Unique titles across the indexable pages of one territory.
    const seen = new Map();
    for (const p of [general, ...others]) { const f = factsFor(p); if (!f || !f.title) continue; const k = f.title.toLowerCase(); if (seen.has(k)) add('error', 'duplicate_title', p, `same title as ${seen.get(k)}`); else seen.set(k, p); }
  }

  // ---- site-wide: nobody links to a consolidated URL; sitemap hygiene ----
  for (const [path, primary] of consolidated) {
    const file = fileForPath(site.repo, path);
    if (!file) continue;
    const from = [...(site.inbound.get(file) || [])];
    for (const src of from) add('error', 'link_to_consolidated', `/${src}`, `links to ${path}; link to ${primary} instead`);
  }
  const territoryPaths = new Set([...primaries, ...consolidated.keys()]);
  let siteNonCanonical = 0;
  for (const url of site.sitemap) {
    if (!url.startsWith(origin)) { add('error', 'sitemap_foreign_url', url, ''); continue; }
    const path = new URL(url).pathname;
    const file = fileForPath(site.repo, path);
    if (!file) { add(territoryPaths.has(path) ? 'error' : 'warn', 'sitemap_missing_file', path, ''); continue; }
    const page = site.pages.get(file);
    if (!page) continue;
    const c = H.canonicals(page.html)[0];
    if (c && c !== url) {
      if (territoryPaths.has(path)) add('error', 'sitemap_non_canonical', path, `canonical is ${c}`); else siteNonCanonical += 1;
    }
  }
  if (siteNonCanonical) add('info', 'sitemap_non_canonical_elsewhere', '(site)', `${siteNonCanonical} sitemap URLs outside the territory map are not self-canonical (out of scope; reported only)`);

  const rank = (l) => LEVELS.indexOf(l);
  findings.sort((a, b) => rank(a.level) - rank(b.level) || a.code.localeCompare(b.code) || a.page.localeCompare(b.page));
  const table = [...factsByPath.values()].filter(Boolean).map((f) => ({ ...f, role: primaries.has(f.path) ? 'primary' : consolidated.has(f.path) ? `canonical -> ${consolidated.get(f.path)}` : 'related', inbound: f.inbound.length }));
  return { findings, table, counts: Object.fromEntries(LEVELS.map((l) => [l, findings.filter((f) => f.level === l).length])) };
}

/** FAQPage, BreadcrumbList and WebPage schema must describe what the visitor can see on this URL. */
export function checkSchemaParity(page, path, origin, add) {
  const visible = H.norm(H.visibleText(page.html));
  for (const qa of H.faqSchema(page.html)) {
    if (!qa.question || !visible.includes(H.norm(qa.question))) add('error', 'faq_question_not_visible', path, qa.question.slice(0, 90));
    else if (!qa.answer || !visible.includes(H.norm(qa.answer))) add('error', 'faq_answer_not_visible', path, qa.question.slice(0, 90));
  }
  for (const n of H.schemaNodes(page.html)) {
    const types = H.typesOf(n);
    if (types.includes('WebPage') && n.url && n.url !== `${origin}${path}`) add('error', 'webpage_url_mismatch', path, n.url);
    if (types.includes('BreadcrumbList')) {
      const items = [].concat(n.itemListElement || []);
      const last = items[items.length - 1];
      const item = last && (typeof last.item === 'string' ? last.item : last.item && last.item['@id']);
      if (item && item !== `${origin}${path}`) add('error', 'breadcrumb_last_item_mismatch', path, item);
    }
  }
}

/** FAQ heading levels used by `.faq-item` blocks and by inline `.faq-item hN` toggle selectors. */
export function faqToggleLevels(html) {
  return {
    headings: [...new Set([...html.matchAll(/<div class="faq-item[^"]*">\s*<(h[1-6])\b/g)].map((m) => m[1]))],
    selectors: [...new Set([...html.matchAll(/querySelectorAll\(\s*['"]\.faq-item (h[1-6])['"]\s*\)/g)].map((m) => m[1]))],
  };
}

/** An inline FAQ toggle must target the heading level the FAQ items actually use. */
export function checkFaqToggle(page, path, add) {
  const { headings, selectors } = faqToggleLevels(page.html);
  if (headings.length > 1) add('error', 'faq_heading_levels_mixed', path, headings.join(', '));
  for (const s of selectors) if (headings.length && !headings.includes(s)) add('error', 'faq_toggle_selector_mismatch', path, `script selects .faq-item ${s}; FAQ headings are ${headings.join(', ')}`);
}

/** Sponsored cards are labeled and every link in them is rel=sponsored; tagged links never appear outside a card. */
export function checkSponsored(page, path, add) {
  for (const block of H.sponsoredBlocks(page.html)) {
    if (!/class="wwk-sponsored__label"[^>]*>\s*Sponsored/.test(block)) add('error', 'sponsored_label_missing', path, '');
    for (const l of H.links(`<body>${block}`)) if (!/\bsponsored\b/.test(l.rel)) add('error', 'sponsored_link_rel', path, l.href);
  }
  for (const l of H.links(H.withoutSponsored(page.html))) if (/utm_medium=sponsored/i.test(l.href)) add('error', 'sponsored_utm_outside_card', path, l.href);
}

/** Internal links from a territory page should land on an existing, indexable, self-canonical URL. */
export function checkLinkTargets(page, path, site, origin, add, level) {
  const seen = new Set();
  for (const l of page.outLinks) {
    if (seen.has(l.path)) continue; seen.add(l.path);
    if (!l.target) { if (/\.html$/.test(l.path)) add(level, 'link_target_missing', path, l.path); continue; }
    const t = site.pages.get(l.target);
    const c = H.canonicals(t.html)[0];
    const self = l.path.endsWith('/') ? `${origin}${l.path}` : `${origin}/${l.target}`;
    if (c && c !== self && c !== `${origin}${l.path}`) add(level, 'link_to_non_canonical', path, `${l.path} declares canonical ${c}`);
    else if (H.robots(t.html).noindex) add(level, 'link_to_noindex', path, l.path);
  }
}

/** Hub pages: substantive, factual, directory-linked and not a sponsor page. */
export function checkHub(page, path, f, policy, corpus, add, intent = {}) {
  if (f.editorial_words < policy.hub_min_editorial_words) add('error', 'hub_thin', path, `${f.editorial_words} editorial words (min ${policy.hub_min_editorial_words})`);
  const text = H.visibleText(page.html);
  for (const a of streetAddresses(text)) if (!corpus.includes(H.norm(a))) add('error', 'unverified_address', path, a);
  if (PRICE_RE.test(text)) add('error', 'price_claim', path, 'hub pages quote no prices');
  if (PHONE_RE.test(text)) add('error', 'phone_number', path, 'hub pages list no phone numbers');
  if (f.sponsored_cards && intent.sponsored_card !== 'approved') add('error', 'hub_card_not_approved', path, 'no recorded approval covers a card on this hub; activate it through the onboarding gates, then set sponsored_card to "approved" in the map');
  if (!page.outLinks.some((l) => l.path === '/swim-lessons/directory/new-york.html')) add('error', 'hub_missing_directory_link', path, '');
  if (!/class="[^"]*\bwwk-reviewed\b/.test(page.html)) add('error', 'hub_missing_review_note', path, 'state when facts were checked and what is not covered');
}

export function runAudit({ repoRoot, mapPath }) {
  const map = loadMap(mapPath);
  const site = loadSite(repoRoot);
  return { map, site, ...audit(map, site) };
}

export const DEFAULT_MAP = join(import.meta.dirname, '..', 'territory-map.json');
