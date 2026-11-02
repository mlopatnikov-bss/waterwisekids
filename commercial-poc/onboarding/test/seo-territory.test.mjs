// Territory SEO package: the real repository satisfies the territory map, the consolidation is fully
// applied (a re-run is a no-op), protected pilot surfaces are untouched, and the audit catches the
// failure modes it exists for (fixture repository under os.tmpdir()).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import * as H from '../seo/src/html.mjs';
import { audit, DEFAULT_MAP, faqToggleLevels, loadMap, runAudit } from '../seo/src/audit.mjs';
import { planConsolidation } from '../seo/src/consolidate.mjs';
import { loadSite, parseSitemap } from '../seo/src/site.mjs';
import { DEFAULT_REPO_ROOT } from '../src/repo.mjs';
import { validateDefinition } from '../src/validate.mjs';
import { buildPacket } from '../src/packet.mjs';
import { loadManhattan, loadManifest, loadPilot, realRepo } from './support.mjs';

const O = 'https://www.waterwisekids.com';
const sha = (s) => createHash('sha256').update(s).digest('hex');
let cached = null;
const real = () => (cached ??= runAudit({ repoRoot: DEFAULT_REPO_ROOT, mapPath: DEFAULT_MAP }));
const read = (rel) => readFileSync(join(DEFAULT_REPO_ROOT, rel), 'utf8');
const map = loadMap(DEFAULT_MAP);
const consolidated = map.territories.flatMap((t) => t.intents.flatMap((i) => i.consolidate.map((c) => [c.page, i.primary])));
const primaries = map.territories.flatMap((t) => t.intents.map((i) => i.primary));

test('real repo: the territory audit reports zero errors', () => {
  const r = real();
  assert.deepEqual(r.findings.filter((f) => f.level === 'error'), []);
});

test('real repo: consolidation is fully applied (planner is a no-op)', () => {
  const plan = planConsolidation({ repoRoot: DEFAULT_REPO_ROOT, mapPath: DEFAULT_MAP });
  assert.deepEqual(plan.changes.map((c) => c.file), []);
});

test('real repo: one indexable primary per intent; every consolidated URL canonicalizes to it and leaves the sitemap', () => {
  const sitemap = new Set(parseSitemap(read('sitemap.xml')));
  assert.equal(consolidated.length, 11);
  for (const [page, primary] of consolidated) {
    const html = read(page.slice(1));
    assert.deepEqual(H.canonicals(html), [`${O}${primary}`], page);
    assert.equal(H.robots(html).noindex, false, `${page}: canonical only, never noindex`);
    assert.equal(sitemap.has(`${O}${page}`), false, page);
    assert.ok(html.includes(`class="wwk-primary-guide-note"`) && html.includes(`href="${primary}"`), `${page} shows a visible link to ${primary}`);
  }
  for (const p of primaries) {
    const html = read(p.slice(1));
    assert.deepEqual(H.canonicals(html), [`${O}${p}`], p);
    assert.ok(sitemap.has(`${O}${p}`), p);
  }
  assert.equal(new Set(primaries).size, primaries.length, 'no page is primary for two intents');
});

test('real repo: no public page links to a consolidated URL', () => {
  const site = real().site;
  const bad = [];
  for (const [file, page] of site.pages) for (const l of page.outLinks) if (consolidated.some(([c]) => c === l.path)) bad.push(`${file} -> ${l.path}`);
  assert.deepEqual(bad, []);
});

test('real repo: on every territory page (primary, consolidated, age/stage intent) FAQ toggle selectors match the FAQ heading level', () => {
  const pages = [...new Set([...primaries, ...consolidated.map(([c]) => c)])].sort();
  assert.equal(pages.length, 25, '14 primaries (incl. Manhattan) + 11 consolidated pages');
  const withToggle = [];
  for (const p of pages) {
    const { headings, selectors } = faqToggleLevels(read(p.slice(1)));
    assert.ok(headings.length <= 1, `${p}: mixed FAQ heading levels ${headings}`);
    for (const s of selectors) assert.deepEqual([s], headings, `${p}: script selects .faq-item ${s} but FAQ headings are ${headings.join(', ') || 'none'}`);
    if (selectors.length) withToggle.push(p);
  }
  // The pages that carry an inline FAQ toggle today; a template change that adds or drops one should be reviewed here.
  assert.deepEqual(withToggle, ['/swim-lessons/brick-nj.html', '/swim-lessons/cheltenham-pa.html', '/swim-lessons/howell-nj.html', '/swim-lessons/manhattan-ny.html']);
});

test('real repo: no redirect file was introduced and robots.txt still allows crawling with the sitemap', () => {
  assert.equal(existsSync(join(DEFAULT_REPO_ROOT, '_redirects')), false);
  const robots = read('robots.txt');
  assert.match(robots, /^User-agent: \*\nAllow: \/\n/);
  assert.match(robots, /Sitemap: https:\/\/www\.waterwisekids\.com\/sitemap\.xml/);
});

test('protected pilot surfaces: the NY directory is byte-identical and live cards are only on their approved pages', () => {
  assert.equal(sha(read('swim-lessons/directory/new-york.html')), 'cfe4515bb42aac5af13c69ca35b48a82cd2155a0dde9f5e2910536e9abdbd3a3');
  const approved = new Set([...loadPilot().tenants.flatMap((t) => t.placements.map((p) => p.page_path)), ...loadManhattan().tenants.flatMap((t) => t.placements.map((p) => p.page_path))]);
  const site = real().site;
  const withCards = [...site.pages.values()].filter((p) => H.sponsoredBlocks(p.html).length).map((p) => p.path).sort();
  assert.deepEqual(withCards, [...approved].sort());
});

test('PA/NJ pilot guides: substantial local editorial upgrades preserve every sponsored card byte', () => {
  const guides = {
    'swim-lessons/cheltenham-pa.html': 'b07d5a4d6a3b2cde8ce3ebf779bae2b71e6053d674451c144a33e02190aea3a4',
    'swim-lessons/howell-nj.html': '05966e8d88881929d2323a5e213b93ee3a665e2e6d3373a1c8f3a238f9625618',
    'swim-lessons/brick-nj.html': '1015a702ba78498164ac007d5285c70fbf3ac6bc91eba0f36ca3252ad7f4802b',
    'swim-lessons-toms-river-nj.html': '8801177e52dd92c1ea573ac9bc8ff43e2b59d45e5e6eb3e07491a93ac8abd6a9',
  };
  for (const [file, cardHash] of Object.entries(guides)) {
    const html = read(file);
    const editorial = H.mainText(html);
    assert.ok(H.wordCount(editorial) >= 1000, `${file}: substantial editorial content, sponsored card excluded`);
    assert.match(H.visibleText(html), /Reviewed November 2, 2026\./, `${file}: visible review date`);
    assert.match(html, /"dateModified": "2026-11-02"/, `${file}: machine-readable review date`);
    assert.ok(H.links(H.withoutSponsored(html)).filter((l) => /^https:\/\//.test(l.href)).length >= 3, `${file}: visible editorial sources`);
    assert.equal((html.match(/<main\b/g) || []).length, 1, `${file}: one main landmark`);
    assert.equal((html.match(/<\/main>/g) || []).length, 1, `${file}: balanced main landmark`);
    const cards = H.sponsoredBlocks(html);
    assert.equal(cards.length, 1, `${file}: one approved card`);
    assert.equal(sha(cards[0]), cardHash, `${file}: sponsored card bytes unchanged`);
  }
});

test('Manhattan hub: editorial, verified, schema matches what is visible, one separately attributed card, held venue not named', () => {
  const html = read('swim-lessons/manhattan-ny.html');
  const text = H.visibleText(html); // excludes the sponsored card
  assert.ok(H.wordCount(H.mainText(html)) >= map.policy.hub_min_editorial_words, 'editorial words, card excluded');
  const cards = H.sponsoredBlocks(html);
  assert.equal(cards.length, 1);
  assert.match(cards[0], /data-wwk-placement="plc_e487fb00e271338e"/);
  assert.doesNotMatch(html, /plc_10e8497ef216c69d/, 'the statewide placement is not reused');
  assert.doesNotMatch(H.withoutSponsored(html), /utm_|ten_52bf92991a0305d0/, 'tracking only inside the card');
  assert.doesNotMatch(html, /East Village|east-village|710 E 11th|720 E 11th/);
  assert.doesNotMatch(text, /\$\s?\d/, 'no prices');
  assert.doesNotMatch(text, /\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/, 'no phone numbers');
  const snap = JSON.parse(read('commercial-poc/seed/sources/official-operator-snapshot-2026-11-02.json')).territories.find((t) => t.territory_key === 'manhattan');
  const listed = snap.locations.filter((l) => l.listed_on_territory_page && !l.no_classes_notice && !l.address_conflict);
  for (const l of listed) { assert.ok(text.includes(l.address), l.venue); assert.ok(html.includes(`href="${l.location_url}"`), l.venue); }
  for (const l of H.links(H.withoutSponsored(html)).filter((x) => /britishswimschool\.com/.test(x.href))) assert.doesNotMatch(l.rel, /sponsored/, 'editorial venue links (outside the card) are not sponsored links');
  for (const l of H.links(`<body>${cards[0]}`)) { assert.equal(l.rel, 'sponsored noopener'); assert.match(l.href, /utm_content=plc_e487fb00e271338e/); }
  const faq = H.faqSchema(html);
  assert.equal(faq.length, 5);
  for (const qa of faq) { assert.ok(H.norm(text).includes(H.norm(qa.question))); assert.ok(H.norm(text).includes(H.norm(qa.answer))); }
  const types = H.schemaNodes(html).flatMap(H.typesOf).sort();
  assert.deepEqual(types, ['BreadcrumbList', 'FAQPage', 'WebPage']);
  // Regression (Codex review): the FAQ toggle script must target the heading level the FAQ items actually use.
  const faqHeadings = [...html.matchAll(/<div class="faq-item[^"]*">\s*<(h[1-6])\b/g)].map((m) => m[1]);
  assert.equal(faqHeadings.length, 5);
  assert.equal(new Set(faqHeadings).size, 1, 'every FAQ item uses the same heading level');
  const selectors = [...html.matchAll(/querySelectorAll\('\.faq-item (h[1-6])'\)/g)].map((m) => m[1]);
  assert.ok(selectors.length >= 1, 'FAQ toggle script present');
  for (const s of selectors) assert.equal(s, faqHeadings[0], `FAQ toggle selects .faq-item ${s} but the FAQ headings are ${faqHeadings[0]}`);
  // Regression (Codex review): exactly one <main>, and <section> tags inside it are balanced and never close early.
  assert.equal((html.match(/<main\b/g) || []).length, 1); assert.equal((html.match(/<\/main>/g) || []).length, 1);
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  let depth = 0;
  for (const m of main.matchAll(/<(\/?)section\b/g)) { depth += m[1] ? -1 : 1; assert.ok(depth >= 0, 'unmatched </section> inside <main>'); }
  assert.equal(depth, 0, 'every <section> inside <main> is closed');
  let docDepth = 0;
  for (const m of html.matchAll(/<(\/?)section\b/g)) { docDepth += m[1] ? -1 : 1; assert.ok(docDepth >= 0, 'unmatched </section> in the document'); }
  assert.equal(docDepth, 0);
});

test('Manhattan hub card: the committed definition activates it with every gate recorded and both pages already matching', () => {
  const def = loadManhattan();
  const ctx = { repo: realRepo(), existingManifest: loadManifest(), others: [loadPilot()] };
  const v = validateDefinition(def, ctx);
  assert.equal(v.ok, true, JSON.stringify(v.errors));
  const hub = map.territories.find((t) => t.territory_key === 'manhattan-ny').intents[0];
  assert.equal(hub.sponsored_card, 'approved');
  assert.equal(def.tenants[0].placements.find((p) => p.page_path === hub.primary).placement_id, hub.sponsored_placement.placement_id);
  const p = buildPacket(def, ctx);
  assert.deepEqual(JSON.parse(p.files['patch-plan.json']).map((x) => [x.page_path, x.action]), [['/swim-lessons/directory/new-york.html', 'unchanged'], ['/swim-lessons/manhattan-ny.html', 'unchanged']]);
  const summary = JSON.parse(p.files['summary.json']);
  assert.deepEqual(summary.pending_gates, []);
  assert.deepEqual([summary.network_actions, summary.deploy_actions, summary.database_actions], [0, 0, 0]);
});

// ---------- hermetic fixture: the audit must catch each failure it guards against ----------
function fixtureRepo(files) {
  const root = mkdtempSync(join(tmpdir(), 'wwk-seo-'));
  for (const [rel, text] of Object.entries(files)) { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), text); }
  return root;
}
const doc = ({ path, canonical = path, body, head = '' }) => `<!doctype html><html><head><title>${path}</title><meta name="description" content="d"><link rel="canonical" href="${O}${canonical}">${head}</head><body><main><h1>Testville ${path}</h1>${body}</main></body></html>`;
const filler = '<p>' + 'Testville families compare lesson formats, pool temperature and class size before they enroll a beginner. '.repeat(30) + '</p>';

test('fixture: audit reports canonical, sitemap, link, schema, sponsored and fact violations', () => {
  const faq = '<script type="application/ld+json">{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Hidden question?","acceptedAnswer":{"@type":"Answer","text":"Not on the page."}}]}</script>';
  const biz = '<script type="application/ld+json">{"@type":"LocalBusiness","name":"X"}</script>';
  const root = fixtureRepo({
    'sources.json': '{"address":"10 Main Street Testville"}',
    'sitemap.xml': `<urlset><url><loc>${O}/main.html</loc></url><url><loc>${O}/old.html</loc></url></urlset>`,
    'main.html': doc({ path: '/main.html', head: faq + biz, body: `${filler}<a href="/old.html">old</a><a href="https://example.com/?utm_medium=sponsored_pilot">tagged</a><div class="faq-item"><h3>Q?</h3></div><script>document.querySelectorAll('.faq-item h4')</script>` }),
    'old.html': doc({ path: '/old.html', body: `${filler}<p>no link back</p>` }),
    'hub.html': doc({ path: '/hub.html', body: '<p>Testville pool at 99 Fake Street Testville costs $40.</p>' }),
  });
  try {
    const m = { site_origin: O, policy: { ...map.policy, verified_fact_sources: ['sources.json'] }, territories: [
      { territory_key: 't', label: 'Testville', place_names: ['Testville'], intents: [{ intent: 'general', primary: '/main.html', consolidate: [{ page: '/old.html', reason: 'dup' }] }], required_inbound: ['/hub.html'] },
      { territory_key: 'h', label: 'Testville hub', place_names: ['Testville'], intents: [{ intent: 'hub', primary: '/hub.html', consolidate: [], hub: true }] },
    ] };
    const r = audit(m, loadSite(root));
    const codes = new Set(r.findings.filter((f) => f.level === 'error').map((f) => f.code));
    for (const c of ['not_canonicalized', 'consolidated_in_sitemap', 'no_visible_link_to_primary', 'link_to_consolidated', 'faq_question_not_visible', 'forbidden_schema_type',
      'sponsored_utm_outside_card', 'faq_toggle_selector_mismatch', 'primary_underlinked', 'required_link_missing', 'hub_thin', 'unverified_address', 'price_claim', 'hub_missing_directory_link', 'hub_missing_review_note', 'primary_not_in_sitemap']) assert.ok(codes.has(c), `expected ${c}; got ${[...codes].join(', ')}`);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
