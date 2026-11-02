// Pure, dependency-free HTML helpers for the territory SEO audit. Every function takes a
// string and returns data; nothing here reads files, executes page scripts or opens a network
// connection. The parsing is deliberately simple (regex over WWK's own templates) and the
// tests in onboarding/test/seo-html.test.mjs pin the cases the audit relies on.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', hellip: '…', middot: '·' };

export function decodeEntities(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') { const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
    return Object.hasOwn(ENTITIES, e.toLowerCase()) ? ENTITIES[e.toLowerCase()] : m;
  });
}

/** Normalised comparison form: entities decoded, curly quotes/dashes folded, whitespace collapsed, lower case. */
export function norm(s) {
  return decodeEntities(s).replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i')) || tag.match(new RegExp(`\\s${name}\\s*=\\s*'([^']*)'`, 'i')); return m ? decodeEntities(m[1]) : null; };
export { attr as getAttr };

export const headOf = (html) => { const i = html.search(/<\/head>/i); return i < 0 ? html : html.slice(0, i); };
export const bodyOf = (html) => { const i = html.search(/<body[\s>]/i); return i < 0 ? html : html.slice(i); };

export function title(html) { const m = headOf(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i); return m ? decodeEntities(m[1]).replace(/\s+/g, ' ').trim() : null; }

export function metaContent(html, key) {
  for (const m of headOf(html).matchAll(/<meta\b[^>]*>/gi)) {
    const t = m[0];
    if ((attr(t, 'name') || attr(t, 'property') || '').toLowerCase() === key.toLowerCase()) return attr(t, 'content');
  }
  return null;
}

/** All rel=canonical hrefs in the head (more than one is an error the audit reports). */
export function canonicals(html) {
  return [...headOf(html).matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).filter((t) => /(^|\s)canonical(\s|$)/i.test(attr(t, 'rel') || '')).map((t) => attr(t, 'href'));
}

export function robots(html) {
  const v = [metaContent(html, 'robots'), metaContent(html, 'googlebot')].filter(Boolean).join(',').toLowerCase();
  return { raw: v, noindex: /(^|[\s,])noindex([\s,]|$)/.test(v) || /(^|[\s,])none([\s,]|$)/.test(v), nofollow: /(^|[\s,])nofollow([\s,]|$)/.test(v) };
}

export function headings(html, level) {
  return [...bodyOf(html).matchAll(new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'gi'))].map((m) => decodeEntities(m[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim());
}

/** Parsed JSON-LD blocks: [{ ok, data, error, raw }]. */
export function jsonLd(html) {
  return [...html.matchAll(/<script\b[^>]*type\s*=\s*"application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => {
    try { return { ok: true, data: JSON.parse(m[1]), raw: m[1] }; } catch (e) { return { ok: false, error: e.message, raw: m[1] }; }
  });
}

/** Flattened schema nodes (top-level objects, arrays and @graph members). */
export function schemaNodes(html) {
  const out = [];
  const add = (n) => { if (Array.isArray(n)) n.forEach(add); else if (n && typeof n === 'object') { if (Array.isArray(n['@graph'])) n['@graph'].forEach(add); else out.push(n); } };
  for (const b of jsonLd(html)) if (b.ok) add(b.data);
  return out;
}

export const typesOf = (node) => [].concat(node['@type'] || []).map(String);

// Sponsored cards are bracketed by the onboarding renderer's marker comment and the tracking script.
const CARD_RE = /<!-- WWK sponsored placement [\s\S]*?<aside class="wwk-sponsored"[\s\S]*?<\/aside>(\s*<script[^>]*wwk-sponsored\.js[^>]*><\/script>)?/g;
export function sponsoredBlocks(html) { return [...html.matchAll(CARD_RE)].map((m) => m[0]); }
export const withoutSponsored = (html) => html.replace(CARD_RE, ' ');

/**
 * Text a visitor can read in the page body: scripts, styles, comments, dialogs, header, footer,
 * nav and (by default) sponsored cards removed. This is what FAQ schema must match and what
 * counts as editorial words.
 */
export function visibleText(html, { keepSponsored = false } = {}) {
  let b = bodyOf(keepSponsored ? html : withoutSponsored(html));
  b = b.replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|template|dialog|svg)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(header|footer|nav)\b[\s\S]*?<\/\1>/gi, ' ');
  return decodeEntities(b.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/** Main editorial text: the <main> element when present, otherwise the visible body. */
export function mainText(html) {
  const m = withoutSponsored(html).match(/<main\b[\s\S]*?<\/main>/i);
  return m ? visibleText(`<body>${m[0]}</body>`) : visibleText(html);
}

export const wordCount = (text) => (text ? text.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length : 0);

/** Every <a href> in the body: { href, rel, text, index }. */
export function links(html) {
  const body = bodyOf(html); const offset = html.length - body.length;
  return [...body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({
    href: attr(` ${m[1]}`, 'href'), rel: (attr(` ${m[1]}`, 'rel') || '').toLowerCase(), text: decodeEntities(m[2].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim(), index: offset + m.index,
  })).filter((l) => l.href !== null);
}

export const SITE_ORIGIN = 'https://www.waterwisekids.com';

/** Internal page path for an href (relative to the page at fromPath), or null for external/non-page links. */
export function internalPath(href, fromPath = '/') {
  if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) return null;
  let u;
  try { u = new URL(href, `${SITE_ORIGIN}${fromPath}`); } catch { return null; }
  if (!/^(www\.)?waterwisekids\.com$/i.test(u.hostname)) return null;
  return decodeURIComponent(u.pathname);
}

/** FAQPage question/answer pairs from JSON-LD. */
export function faqSchema(html) {
  const out = [];
  for (const n of schemaNodes(html)) {
    if (!typesOf(n).includes('FAQPage')) continue;
    for (const q of [].concat(n.mainEntity || [])) {
      const a = [].concat(q && q.acceptedAnswer || [])[0];
      out.push({ question: q && q.name ? String(q.name) : '', answer: a && a.text ? String(a.text).replace(/<[^>]+>/g, ' ') : '' });
    }
  }
  return out;
}
