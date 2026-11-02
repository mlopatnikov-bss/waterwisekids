#!/usr/bin/env node
// Render evidence: desktop and mobile screenshots of every portal state plus a
// keyboard-focus walk. Requires Playwright + Chromium to be available in the
// environment (it is NOT a project dependency; nothing is installed by this script).
// Usage: node scripts/capture-screenshots.mjs [--out evidence/screenshots]
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { openDb } from '../src/db.mjs';
import { seedAll } from '../src/pipeline.mjs';
import { loadManifest as loadIntoDb } from '../src/registry.mjs';
import { createAuth } from '../src/portal/auth.mjs';
import { createPortalHandler } from '../src/portal/server.mjs';
import { POC_ROOT, AS_OF } from '../src/config.mjs';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch {
  console.error('Playwright is not available in this environment; screenshots skipped. (It is intentionally not a project dependency.)');
  process.exit(4);
}
const args = process.argv.slice(2);
const oi = args.indexOf('--out');
const outDir = resolve(oi >= 0 ? args[oi + 1] : join(POC_ROOT, 'evidence/screenshots'));
mkdirSync(outDir, { recursive: true });

const manifest = JSON.parse(readFileSync(join(POC_ROOT, 'seed/pilot-manifest.json'), 'utf8'));
const T = Object.fromEntries(manifest.tenants.map((t) => [t.tenant_key, t]));
const U = Object.fromEntries(manifest.users.map((u) => [u.user_key, u]));

async function start(db) {
  const server = createServer(createPortalHandler({ db, auth: createAuth({ mode: 'demo', db }), asOf: AS_OF, log: () => {} }));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}
const db = openDb(':memory:');
seedAll(db, manifest, { asOf: AS_OF });
const main = await start(db);
const broken = openDb(':memory:');
loadIntoDb(broken, manifest, { at: AS_OF });
broken.exec('DROP TABLE daily_metrics');
const brokenSrv = await start(broken);

const browser = await chromium.launch();
const shots = [];
async function capture({ name, base = main.base, user, path, viewport }) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  await page.goto(`${base}/demo/login`);
  if (user) {
    await page.click(`button:has-text("${U[user].display_label}")`);
    await page.waitForLoadState('load');
  }
  let status = null;
  if (path) { const r = await page.goto(`${base}${path}`); status = r.status(); }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const file = `${name}.png`;
  await page.screenshot({ path: join(outDir, file), fullPage: true });
  shots.push({ file, url_path: path || '/demo/login', viewport: `${viewport.width}x${viewport.height}`, http_status: status, horizontal_overflow_px: overflow, console_errors: consoleErrors });
  await ctx.close();
}
const D = { width: 1280, height: 900 }; const M = { width: 390, height: 844 };
await capture({ name: '01-login-desktop', viewport: D });
await capture({ name: '02-login-mobile', viewport: M });
await capture({ name: '03-nwp-overview-desktop', user: 'demo-owner-nwp-js', path: `/t/${T['northwest-philadelphia'].tenant_id}/`, viewport: D });
await capture({ name: '04-nwp-overview-mobile', user: 'demo-owner-nwp-js', path: `/t/${T['northwest-philadelphia'].tenant_id}/`, viewport: M });
await capture({ name: '05-jersey-shore-warning-desktop', user: 'demo-owner-nwp-js', path: `/t/${T['jersey-shore'].tenant_id}/`, viewport: D });
await capture({ name: '06-jersey-shore-warning-mobile', user: 'demo-owner-nwp-js', path: `/t/${T['jersey-shore'].tenant_id}/`, viewport: M });
await capture({ name: '07-manhattan-stale-desktop', user: 'demo-partner-manhattan', path: `/t/${T.manhattan.tenant_id}/`, viewport: D });
await capture({ name: '08-manhattan-stale-mobile', user: 'demo-partner-manhattan', path: `/t/${T.manhattan.tenant_id}/`, viewport: M });
await capture({ name: '09-empty-range-desktop', user: 'demo-owner-nwp-js', path: `/t/${T['northwest-philadelphia'].tenant_id}/?from=2026-01-01&to=2026-01-31`, viewport: D });
await capture({ name: '10-cross-tenant-404-desktop', user: 'demo-owner-nwp-js', path: `/t/${T.manhattan.tenant_id}/`, viewport: D });
await capture({ name: '11-no-access-mobile', user: 'demo-no-access', path: '/', viewport: M });
await capture({ name: '12-error-state-desktop', base: brokenSrv.base, user: 'demo-partner-manhattan', path: `/t/${T.manhattan.tenant_id}/`, viewport: D });

// Keyboard walk: first focus stops and whether a visible focus indicator is drawn.
const ctx = await browser.newContext({ viewport: D });
const page = await ctx.newPage();
await page.goto(`${main.base}/demo/login`);
await page.click(`button:has-text("${U['demo-owner-nwp-js'].display_label}")`);
await page.goto(`${main.base}/t/${T['northwest-philadelphia'].tenant_id}/`);
const stops = [];
for (let i = 0; i < 16; i += 1) {
  await page.keyboard.press('Tab');
  stops.push(await page.evaluate(() => {
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    return { tag: el.tagName.toLowerCase(), text: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 60), outline: `${cs.outlineStyle} ${cs.outlineWidth}` };
  }));
}
await page.keyboard.press('Shift+Tab');
await page.goto(`${main.base}/t/${T['northwest-philadelphia'].tenant_id}/`);
await page.keyboard.press('Tab');
await page.keyboard.press('Enter');
const afterSkip = await page.evaluate(() => document.activeElement.id || document.activeElement.tagName.toLowerCase());
await page.screenshot({ path: join(outDir, '13-keyboard-skip-link-desktop.png') });
await ctx.close();

await browser.close();
main.server.close(); brokenSrv.server.close();
const report = { as_of: AS_OF, screenshots: shots, keyboard: { first_16_tab_stops: stops, skip_link_moves_focus_to: afterSkip } };
writeFileSync(join(outDir, 'render-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ out: outDir, screenshots: shots.length, all_overflow_zero: shots.every((s) => s.horizontal_overflow_px <= 0), console_errors: shots.flatMap((s) => s.console_errors).length, skip_link_moves_focus_to: afterSkip }, null, 2));
