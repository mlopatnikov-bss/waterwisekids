// Consolidation transforms. Pure string -> string functions plus a planner that applies them to
// the repository in memory and returns { file, before, after } changes. Only the CLI's --write
// touches disk. Every transform is idempotent: running the plan twice yields no further change.
import * as H from './html.mjs';
import { loadMap } from './audit.mjs';
import { fileForPath, loadSite } from './site.mjs';

const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Point rel=canonical and og:url at the primary URL. */
export function retargetHead(html, primaryUrl) {
  const head = H.headOf(html);
  let next = head.replace(/<link\b[^>]*>/gi, (tag) => (/(^|\s)canonical(\s|$)/i.test(H.getAttr(tag, 'rel') || '') ? tag.replace(/href\s*=\s*"[^"]*"/i, `href="${escAttr(primaryUrl)}"`) : tag));
  next = next.replace(/<meta\b[^>]*>/gi, (tag) => ((H.getAttr(tag, 'property') || '').toLowerCase() === 'og:url' ? tag.replace(/content\s*=\s*"[^"]*"/i, `content="${escAttr(primaryUrl)}"`) : tag));
  return next + html.slice(head.length);
}

export const NOTE_CLASS = 'wwk-primary-guide-note';
/** Visible pointer to the primary guide, right after the first </h1>. */
export function addPrimaryNote(html, primaryPath, primaryLabel) {
  if (html.includes(NOTE_CLASS)) return html;
  const i = html.search(/<\/h1>/i);
  if (i < 0) throw new Error('no </h1> to anchor the primary-guide note');
  const note = `\n<p class="${NOTE_CLASS}" style="margin:12px 0 0;padding:10px 14px;border-left:4px solid #0077b6;background:#f0f7ff;border-radius:6px;">WaterWiseKids now keeps one main page for this search: <a href="${escAttr(primaryPath)}">${escText(primaryLabel)}</a>.</p>`;
  return html.slice(0, i + 5) + note + html.slice(i + 5);
}

const SINGLE_LINK_LINE = /^\s*(?:<li\b[^>]*>\s*)?<a\b[^>]*>[\s\S]*?<\/a>\s*(?:<\/li>)?\s*$/i;
const BLOCK_OPEN = /<(ul|ol|div|section|nav|aside|p)\b/i;
const BLOCK_CLOSE = /<\/(ul|ol|div|section|nav|aside|p)>/i;
const singleTarget = (line, selfPath) => { if (!SINGLE_LINK_LINE.test(line) || (line.match(/<a\b/gi) || []).length !== 1) return null; const href = H.getAttr(line.match(/<a\b[^>]*>/i)[0], 'href'); return H.internalPath(href, selfPath); };

/**
 * Rewrite <a href> values that point at consolidated URLs to their primary, then tidy the result:
 * a rewritten list item that now duplicates another item in the same list, or links the page to
 * itself, is removed; an inline self-link is unwrapped to plain text. Pre-existing duplicates are
 * left alone. Returns { html, rewrites, removed }.
 */
export function rewriteLinks(html, selfPath, map) {
  let rewrites = 0;
  const marked = html.replace(/<a\b([^>]*)>/gi, (tag, attrs) => {
    const href = H.getAttr(` ${attrs}`, 'href');
    const p = H.internalPath(href, selfPath);
    if (!p || !map.has(p)) return tag;
    rewrites += 1;
    return `<a${attrs.replace(/href\s*=\s*"[^"]*"/i, `href="${escAttr(map.get(p))}" data-wwk-rewritten="1"`)}>`;
  });
  if (!rewrites) return { html, rewrites: 0, removed: 0 };
  const lines = marked.split('\n');
  const keep = lines.map(() => true);
  let removed = 0;
  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].includes('data-wwk-rewritten="1"')) continue;
    const target = singleTarget(lines[i], selfPath);
    if (target === selfPath) { keep[i] = false; removed += 1; continue; }
    if (target === null) continue;
    let s = i; while (s > 0 && !BLOCK_OPEN.test(lines[s]) && !BLOCK_CLOSE.test(lines[s - 1])) s -= 1;
    let e = i; while (e < lines.length - 1 && !BLOCK_CLOSE.test(lines[e]) && !BLOCK_OPEN.test(lines[e + 1])) e += 1;
    for (let j = s; j <= e; j += 1) if (j !== i && keep[j] && singleTarget(lines[j], selfPath) === target) { keep[i] = false; removed += 1; break; }
  }
  let out = lines.filter((_, i) => keep[i]).join('\n');
  // Inline self-links that survived (inside running text) become plain text.
  out = out.replace(/<a\b([^>]*data-wwk-rewritten="1"[^>]*)>([\s\S]*?)<\/a>/gi, (m, attrs, inner) => (H.internalPath(H.getAttr(` ${attrs}`, 'href'), selfPath) === selfPath ? inner : m));
  out = out.replace(/ data-wwk-rewritten="1"/g, '');
  return { html: out, rewrites, removed };
}

/** Remove <url> entries for the given absolute URLs. */
export function pruneSitemap(xml, urls) {
  let removed = 0;
  const next = xml.replace(/[ \t]*<url>\s*<loc>\s*([^<\s]+)\s*<\/loc>[\s\S]*?<\/url>[ \t]*\n?/g, (m, loc) => (urls.has(H.decodeEntities(loc)) ? (removed += 1, '') : m));
  return { xml: next, removed };
}

/** Add a <url> entry (before </urlset>) unless the URL is already listed. */
export function addSitemapUrl(xml, url, lastmod, priority = '0.7') {
  if (xml.includes(`<loc>${url}</loc>`)) return xml;
  const entry = `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
  const i = xml.lastIndexOf('</urlset>');
  if (i < 0) throw new Error('sitemap has no </urlset>');
  return xml.slice(0, i) + entry + xml.slice(i);
}

/** Pages the planner may rewrite links in: public HTML only (the repo reader already skips commercial-poc/). */
const NEVER_EDIT = new Set(['swim-lessons/directory/new-york.html']);

export function planConsolidation({ repoRoot, mapPath, lastmod = '2026-11-02' }) {
  const map = loadMap(mapPath);
  const site = loadSite(repoRoot);
  const origin = map.site_origin;
  const toPrimary = new Map();
  const labels = new Map();
  const addPrimaries = [];
  for (const t of map.territories) for (const i of t.intents) {
    const pf = fileForPath(site.repo, i.primary);
    if (i.consolidate.length && !i.note_label) throw new Error(`intent ${i.primary} needs a note_label`);
    labels.set(i.primary, i.note_label);
    if (pf) addPrimaries.push(i.primary);
    for (const c of i.consolidate) toPrimary.set(c.page, i.primary);
  }
  const changes = [];
  let linkRewrites = 0; let linesRemoved = 0;
  for (const file of site.files) {
    if (NEVER_EDIT.has(file)) continue;
    const page = site.pages.get(file);
    let html = page.html; const notes = [];
    if (toPrimary.has(page.path)) {
      const primary = toPrimary.get(page.path);
      const next = addPrimaryNote(retargetHead(html, `${origin}${primary}`), primary, labels.get(primary));
      if (next !== html) { notes.push(`canonical+og:url -> ${primary}, primary-guide note`); html = next; }
    }
    const r = rewriteLinks(html, page.path, toPrimary);
    if (r.rewrites) { notes.push(`${r.rewrites} link(s) -> primary${r.removed ? `, ${r.removed} redundant item(s) removed` : ''}`); html = r.html; linkRewrites += r.rewrites; linesRemoved += r.removed; }
    if (html !== page.html) changes.push({ file, before: page.html, after: html, notes });
  }
  let xml = site.sitemapXml;
  const pr = pruneSitemap(xml, new Set([...toPrimary.keys()].map((p) => `${origin}${p}`)));
  xml = pr.xml;
  for (const p of addPrimaries) xml = addSitemapUrl(xml, `${origin}${p}`, lastmod);
  if (xml !== site.sitemapXml) changes.push({ file: 'sitemap.xml', before: site.sitemapXml, after: xml, notes: [`${pr.removed} consolidated URL(s) removed`, 'missing primaries added'] });
  return { changes, linkRewrites, linesRemoved, sitemapRemoved: pr.removed };
}
