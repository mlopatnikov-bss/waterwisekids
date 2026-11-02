// Read-only view of the WWK site for the SEO audit: page index, link graph and sitemap.
// Uses the onboarding repository reader, so commercial-poc/, node_modules/ and dot-dirs are skipped
// and every path is checked to stay inside the repository.
import { createRepo } from '../../src/repo.mjs';
import * as H from './html.mjs';

export const pagePathOf = (file) => `/${file}`;

/** Resolve a site path ("/a/", "/a/b", "/a/b.html") to a repo file that exists, or null. */
export function fileForPath(repo, path) {
  if (typeof path !== 'string' || !path.startsWith('/')) return null;
  const rel = path.slice(1);
  const candidates = path.endsWith('/') ? [`${rel}index.html`] : [rel, `${rel}.html`, `${rel}/index.html`];
  for (const c of candidates) { const r = repo.safeResolve(c); if (r && r.exists && c.endsWith('.html')) return c; }
  return null;
}

export function parseSitemap(xml) {
  return [...String(xml || '').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => H.decodeEntities(m[1]));
}

/**
 * Build the site model once: per-page facts and the internal link graph.
 * @returns {{ repo, files, pages: Map<file, page>, inbound: Map<file, Set<file>>, sitemap: Set<url> }}
 */
export function loadSite(repoRoot) {
  const repo = createRepo(repoRoot);
  const files = repo.listHtml();
  const pages = new Map();
  const inbound = new Map();
  const resolveCache = new Map();
  const toFile = (p) => { if (!resolveCache.has(p)) resolveCache.set(p, fileForPath(repo, p)); return resolveCache.get(p); };
  for (const file of files) {
    const html = repo.read(file);
    const path = pagePathOf(file);
    const outLinks = [];
    for (const l of H.links(html)) {
      const p = H.internalPath(l.href, path);
      if (!p) continue;
      const target = toFile(p);
      outLinks.push({ ...l, path: p, target });
      if (target && target !== file) { if (!inbound.has(target)) inbound.set(target, new Set()); inbound.get(target).add(file); }
    }
    pages.set(file, { file, path, html, outLinks });
  }
  const sitemapXml = repo.read('sitemap.xml') || '';
  return { repo, files, pages, inbound, sitemapXml, sitemap: new Set(parseSitemap(sitemapXml)) };
}
