#!/usr/bin/env node
// Isolated local preview of the proposed pages. Serves the PROPOSED page text built
// in memory (source + diff), WWK static assets read-only from the repo, the proposal
// component files, and a mock collector that validates beacons with the Phase 1 schema.
// Preview-only transforms (never in the diffs): a "proposal preview" ribbon and a
// loopback data-wwk-collector so the client is active locally.
// Usage: node proposal/scripts/preview-server.mjs [--port 4320]   (binds 127.0.0.1 only)
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, realpathSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildProposal, REPO_ROOT, PROPOSAL_ROOT } from '../src/build.mjs';
import { openDb } from '../../src/db.mjs';
import { loadManifest as loadIntoDb, buildRegistry } from '../../src/registry.mjs';
import { validateEvent } from '../../src/events.mjs';

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const RIBBON = '<div style="position:sticky;top:0;z-index:99999;background:#7c2d12;color:#fff;font:600 13px/1.4 system-ui,sans-serif;padding:6px 12px;text-align:center">PROPOSAL PREVIEW (local only, not live) &middot; Phase 2 sponsored-card proposal p2r2</div>';

export function createPreviewServer({ withRibbon = true } = {}) {
  const b = buildProposal();
  const db = openDb(':memory:');
  loadIntoDb(db, b.manifest, { at: new Date().toISOString() });
  const registry = buildRegistry(db);
  // Preview only: pages are served as http://localhost:<port>, so allow that host here. The live
  // allowlist stays www.waterwisekids.com. (An IP-address host such as 127.0.0.1 is refused by the
  // Phase 1 collector as a PII-shaped value, which is why the preview uses the name "localhost".)
  registry.allowedSiteHosts.add('localhost');
  const received = [];
  const realRepo = realpathSync(REPO_ROOT);
  let collectorUrl = '';

  const pages = new Map(b.pages.map((p) => [p.page_path, p]));
  const transform = (html) => {
    let out = html.replace(/<script src="\/assets\/js\/wwk-sponsored\.js\?v=([a-z0-9]+)" defer><\/script>/, `<script src="/assets/js/wwk-sponsored.js?v=$1" defer data-wwk-collector="${collectorUrl}"></script>`);
    if (withRibbon) out = out.replace(/<body([^>]*)>/, `<body$1>${RIBBON}`);
    return out;
  };

  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const send = (status, body, type = 'text/plain; charset=utf-8', extra = {}) => { res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', ...extra }); res.end(body); };
    if (url.pathname === '/__collector' && req.method === 'POST') {
      let body = '';
      req.on('data', (c) => { body += c; if (body.length > 60000) req.destroy(); });
      req.on('end', () => {
        let events = [];
        try { const j = JSON.parse(body); events = Array.isArray(j.events) ? j.events : [j]; } catch { /* malformed */ }
        for (const e of events) {
          const v = validateEvent(e, registry, { receivedAtMs: Date.now() });
          received.push({ at: new Date().toISOString(), content_type: req.headers['content-type'] || null, cookie_header_present: Boolean(req.headers.cookie), event: e, valid: v.ok, reason: v.ok ? null : v.reason });
        }
        send(204, '', 'text/plain', { 'Access-Control-Allow-Origin': '*' });
      });
      return;
    }
    if (url.pathname === '/__collector/log') return send(200, JSON.stringify(received, null, 2), 'application/json');
    if (url.pathname === '/__collector/reset' && req.method === 'POST') { received.length = 0; return send(204, ''); }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, 'method not allowed');
    if (url.pathname === '/' || url.pathname === '/__preview/') {
      const list = b.pages.map((p) => `<li><a href="${p.page_path}">${p.page_path}</a> (${p.tenant_key}, ${p.variant})</li>`).join('');
      return send(200, `<!doctype html><meta charset="utf-8"><title>WWK Phase 2 proposal preview</title><h1>WWK Phase 2 proposal preview (local only)</h1><ul>${list}</ul><p><a href="/__source${b.pages[0].page_path}">View an unmodified source page</a></p>`, TYPES['.html']);
    }
    if (pages.has(url.pathname)) return send(200, transform(pages.get(url.pathname)._proposed), TYPES['.html']);
    if (url.pathname.startsWith('/__source/') && pages.has(url.pathname.slice(9))) return send(200, pages.get(url.pathname.slice(9))._source, TYPES['.html']);
    if (url.pathname === '/assets/css/wwk-sponsored.css') return send(200, readFileSync(join(PROPOSAL_ROOT, 'component/wwk-sponsored.css')), TYPES['.css']);
    if (url.pathname === '/assets/js/wwk-sponsored.js') return send(200, readFileSync(join(PROPOSAL_ROOT, 'component/wwk-sponsored.js')), TYPES['.js']);
    // Read-only static files from the public repo (no dotfiles, no commercial-poc, no traversal).
    let rel;
    try { rel = decodeURIComponent(url.pathname); } catch { return send(400, 'bad path'); }
    if (rel.split('/').some((seg) => seg.startsWith('.') ) || rel.startsWith('/commercial-poc')) return send(404, 'not found');
    const abs = resolve(REPO_ROOT, `.${rel}`);
    if (!abs.startsWith(realRepo + sep) || !existsSync(abs) || !statSync(abs).isFile()) return send(404, 'not found');
    const type = TYPES[extname(abs)] || 'application/octet-stream';
    return send(200, readFileSync(abs), type);
  });
  return {
    server, built: b, received,
    listen(port = 0) {
      return new Promise((r) => server.listen(port, '127.0.0.1', () => { const p = server.address().port; collectorUrl = `http://localhost:${p}/__collector`; r(`http://localhost:${p}`); }));
    },
    close() { db.close(); return new Promise((r) => server.close(r)); },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--port');
  const port = i >= 0 ? Number(process.argv[i + 1]) : 4320;
  const p = createPreviewServer();
  p.listen(port).then((base) => console.log(`Proposal preview (local only): ${base}/__preview/`));
}
