// Read-only access to the WWK repository checkout. Nothing here writes, spawns or
// opens a network connection. Every path is resolved and checked to stay inside the
// repository root (symlinks included) before it is read.
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ONBOARDING_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const POC_ROOT = resolve(ONBOARDING_ROOT, '..');
export const DEFAULT_REPO_ROOT = resolve(POC_ROOT, '..');

// Site pages may never be patched under these prefixes.
export const DENIED_PREFIXES = Object.freeze(['commercial-poc/', 'node_modules/', '.git/', '.next/', 'functions/', 'assets/', 'docs/', 'tools/']);
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'commercial-poc']);

export const isInside = (parent, child) => { const r = relative(parent, child); return r !== '' && !r.startsWith('..') && !isAbsolute(r); };

/** Page path ("/a/b.html") -> repo-relative source file, or an error code. */
export function sourceFileFor(pagePath) {
  if (typeof pagePath !== 'string' || !/^\/[a-z0-9][a-z0-9\-_/]*\.html$/.test(pagePath)) return { error: 'unsafe_path' };
  if (pagePath.includes('//') || pagePath.split('/').some((s) => s === '.' || s === '..')) return { error: 'unsafe_path' };
  const rel = pagePath.slice(1);
  if (DENIED_PREFIXES.some((p) => rel.startsWith(p))) return { error: 'unsafe_path' };
  return { file: rel };
}

export function createRepo(root = DEFAULT_REPO_ROOT) {
  const repoRoot = resolve(root);
  const realRoot = realpathSync(repoRoot);
  const cache = new Map();
  let htmlIndex = null;

  function safeResolve(rel) {
    if (typeof rel !== 'string' || rel.length === 0 || isAbsolute(rel) || rel.includes('\0')) return null;
    const abs = resolve(repoRoot, rel);
    if (!isInside(repoRoot, abs)) return null;
    if (!existsSync(abs)) return { abs, exists: false };
    const real = realpathSync(abs);
    if (!isInside(realRoot, real)) return null; // symlink escape
    return { abs, exists: statSync(real).isFile() };
  }

  function read(rel) {
    if (cache.has(rel)) return cache.get(rel);
    const r = safeResolve(rel);
    const text = r && r.exists ? readFileSync(r.abs, 'utf8') : null;
    cache.set(rel, text);
    return text;
  }

  /** All public HTML files (repo-relative, sorted), excluding tooling directories. */
  function listHtml() {
    if (htmlIndex) return htmlIndex;
    const out = [];
    const walk = (dir) => {
      for (const ent of readdirSync(dir, { withFileTypes: true })) {
        if (ent.name.startsWith('.') || SKIP_DIRS.has(ent.name)) continue;
        const p = join(dir, ent.name);
        if (ent.isDirectory()) walk(p);
        else if (ent.isFile() && ent.name.endsWith('.html')) out.push(relative(repoRoot, p).split(sep).join('/'));
      }
    };
    walk(repoRoot);
    htmlIndex = out.sort();
    return htmlIndex;
  }

  return { root: repoRoot, safeResolve, read, listHtml };
}

/** Visible text of an HTML document (scripts, styles and tags removed). */
export function visibleText(html) {
  return html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ').trim();
}

/** Visible text with any WWK sponsored card removed (so the card cannot count toward page quality). */
export function editorialText(html) {
  return visibleText(html.replace(/<aside class="wwk-sponsored"[\s\S]*?<\/aside>/g, ' '));
}

export const wordCount = (text) => (text ? text.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length : 0);
