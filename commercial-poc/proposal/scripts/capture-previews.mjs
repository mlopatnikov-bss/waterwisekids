#!/usr/bin/env node
// Render evidence for the proposal: desktop/mobile card screenshots for all eight
// pages, no-JS rendering, keyboard focus walk, and real-browser navigation checks
// with the collector healthy, failing and hanging. Requires Playwright + Chromium in
// the environment (NOT a project dependency). All third-party hosts are blocked;
// britishswimschool.com navigations are answered by a local stub, never the network.
// Usage: node proposal/scripts/capture-previews.mjs [--out proposal/evidence/previews]
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createPreviewServer } from './preview-server.mjs';
import { PROPOSAL_ROOT } from '../src/build.mjs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { console.error('Playwright not available; previews skipped (not a project dependency).'); process.exit(4); }
const oi = process.argv.indexOf('--out');
const out = resolve(oi >= 0 ? process.argv[oi + 1] : join(PROPOSAL_ROOT, 'evidence/previews'));
mkdirSync(out, { recursive: true });

const preview = createPreviewServer();
const base = await preview.listen(0);
const pages = preview.built.pages;
const browser = await chromium.launch();
const report = { base_is_loopback: base.startsWith('http://localhost:'), screenshots: [], nojs: [], keyboard: null, navigation: [], events: null };

async function newContext(opts = {}) {
  const ctx = await browser.newContext({ deviceScaleFactor: 1, ...opts });
  await ctx.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.hostname === 'localhost') return route.continue();
    if (u.hostname === 'britishswimschool.com') {
      return route.fulfill({ status: 200, contentType: 'text/html', body: `<!doctype html><title>stub destination</title><h1 id="stub">Stub for ${u.pathname}</h1><p id="q">${u.search.replace(/[<>&]/g, '')}</p>` });
    }
    return route.abort('blockedbyclient');                // GTM, fonts, images on third-party hosts: never contacted
  });
  return ctx;
}
// Absolute page coordinates (boundingBox() is viewport-relative; fullPage clips are page-relative).
const absBox = (locator) => locator.evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height }; });
const slug = (p) => p.replace(/^\//, '').replace(/\.html$/, '').replace(/[^a-z0-9]+/g, '-');

// 1. Card screenshots, desktop + mobile, with viewability given time to fire.
for (const [vpName, viewport] of [['desktop', { width: 1280, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await newContext({ viewport, isMobile: vpName === 'mobile', hasTouch: vpName === 'mobile' });
  for (const p of pages) {
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/ERR_BLOCKED_BY_CLIENT|Failed to load resource/.test(m.text())) consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
    await page.goto(`${base}${p.page_path}`, { waitUntil: 'load' });
    const card = page.locator('[data-wwk-sponsored-card]');
    await card.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -120));
    await page.waitForTimeout(1400);
    const box = await absBox(card);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const file = `${String(pages.indexOf(p) + 1).padStart(2, '0')}-${slug(p.page_path)}-${vpName}.png`;
    const clip = { x: 0, y: Math.max(0, box.y - 140), width: viewport.width, height: Math.min(box.height + 300, 1600) };
    await page.screenshot({ path: join(out, file), clip, fullPage: true });
    const style = await card.evaluate((el) => { const s = getComputedStyle(el); return { display: s.display, visibility: s.visibility, background: s.backgroundColor, border: s.borderTopStyle }; });
    // Rendered-DOM checks on the proposed page (P2-R2): one card, one label, no Featured School block,
    // and BSS links outside the card only where the NY directory already listed them organically.
    const dom = await page.evaluate(() => ({
      sponsored_cards: document.querySelectorAll('[data-wwk-sponsored-card]').length,
      sponsored_labels: document.querySelectorAll('.wwk-sponsored__label').length,
      featured_school_blocks: document.querySelectorAll('.featured-school, .featured-badge').length,
      bss_links_outside_card: [...document.querySelectorAll('a[href*="britishswimschool.com"]')].filter((a) => !a.closest('[data-wwk-sponsored-card]')).length,
      bss_links_outside_card_sponsored: [...document.querySelectorAll('a[href*="britishswimschool.com"]')].filter((a) => !a.closest('[data-wwk-sponsored-card]') && /sponsored|utm_/.test(a.rel + a.href)).length,
      stars_outside_card_visible: (() => { const c = document.querySelector('[data-wwk-sponsored-card]'); const clone = document.body.cloneNode(true); clone.querySelectorAll('[data-wwk-sponsored-card], script, style, .review-modal, .star-rating').forEach((n) => n.remove()); void c; return (clone.textContent.match(/[★☆]/g) || []).length; })(),
    }));
    report.screenshots.push({ file, page_path: p.page_path, viewport: `${viewport.width}x${viewport.height}`, card_box: box, horizontal_overflow_px: overflow, console_errors: consoleErrors, card_style: style, dom });
    await page.close();
  }
  await ctx.close();
}

// Events sent while the 16 screenshot page views ran (scroll + 1.4 s dwell, no clicks).
{
  const log = await (await fetch(`${base}/__collector/log`)).json();
  const byType = {}; for (const r of log) byType[r.event.type] = (byType[r.event.type] || 0) + 1;
  report.screenshot_phase_events = { received: log.length, all_valid: log.every((r) => r.valid), invalid: log.filter((r) => !r.valid).map((r) => r.reason), by_type: byType,
    page_views: new Set(log.map((r) => r.event.page_view_id)).size };
}
// 2. No-JS: card visible, links are plain hrefs, nothing sent.
await fetch(`${base}/__collector/reset`, { method: 'POST' });
for (const p of [pages[4], pages[7]]) {
  const ctx = await newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(`${base}${p.page_path}`);
  const card = page.locator('[data-wwk-sponsored-card]');
  await card.scrollIntoViewIfNeeded();
  const box = await absBox(card);
  const file = `nojs-${slug(p.page_path)}-desktop.png`;
  await page.screenshot({ path: join(out, file), clip: { x: 0, y: Math.max(0, box.y - 140), width: 1280, height: Math.min(box.height + 300, 1600) }, fullPage: true });
  const info = await card.evaluate((el) => ({ visible: el.offsetHeight > 0, label: el.querySelector('.wwk-sponsored__label').textContent, links: [...el.querySelectorAll('a')].map((a) => ({ href: a.getAttribute('href'), rel: a.getAttribute('rel') })) }));
  const first = page.locator('[data-wwk-sponsored-card] a').first();
  await Promise.all([page.waitForURL(/britishswimschool\.com/), first.click()]);
  report.nojs.push({ file, page_path: p.page_path, ...info, navigated_to: page.url() });
  await ctx.close();
}
report.nojs_events_received = (await (await fetch(`${base}/__collector/log`)).json()).length;

// 3. Keyboard: tab into the card; focus ring visible; Enter follows the link.
{
  const ctx = await newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const p = pages[4];
  await page.goto(`${base}${p.page_path}`);
  await page.focus('body');
  const stops = [];
  for (let k = 0; k < 120 && stops.length < 2; k += 1) {
    await page.keyboard.press('Tab');
    const s = await page.evaluate(() => { const el = document.activeElement; const inCard = !!el.closest('[data-wwk-sponsored-card]'); const cs = getComputedStyle(el); return { inCard, tag: el.tagName, text: el.textContent.trim().slice(0, 80), href: el.getAttribute('href'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` }; });
    if (s.inCard) stops.push(s);
  }
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  const box = await absBox(page.locator('[data-wwk-sponsored-card]'));
  await page.screenshot({ path: join(out, 'keyboard-focus-howell-desktop.png'), clip: { x: 0, y: Math.max(0, box.y - 60), width: 1280, height: box.height + 120 }, fullPage: true });
  const t0 = Date.now();
  await Promise.all([page.waitForURL(/britishswimschool\.com/), page.keyboard.press('Enter')]);
  report.keyboard = { page_path: p.page_path, card_focus_stops: stops, enter_navigated_to: page.url(), enter_to_navigation_ms: Date.now() - t0 };
  await ctx.close();
}

// 4. Navigation with collector healthy / failing / hanging. Click must navigate regardless.
for (const mode of ['healthy', 'abort', 'hang', 'http500']) {
  const ctx = await newContext({ viewport: { width: 1280, height: 900 } });
  const hung = [];
  if (mode !== 'healthy') {
    await ctx.route('**/__collector', (route) => {
      if (mode === 'abort') return route.abort('failed');
      if (mode === 'http500') return route.fulfill({ status: 500, body: 'boom' });
      hung.push(route); return undefined;                   // never answered
    });
  }
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${base}${pages[7].page_path}`);
  const card = page.locator('[data-wwk-sponsored-card]');
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  const link = card.locator('a').first();
  const expected = await link.getAttribute('href');
  const t0 = Date.now();
  await Promise.all([page.waitForURL(/britishswimschool\.com/, { timeout: 5000 }), link.click()]);
  report.navigation.push({ collector: mode, expected_href: expected, landed_on: page.url(), exact_href: page.url() === expected, click_to_navigation_ms: Date.now() - t0, page_errors: errors });
  await ctx.close();
}

// 5. Everything the healthy runs sent, validated by the Phase 1 schema.
const log = await (await fetch(`${base}/__collector/log`)).json();
const byType = {};
for (const r of log) byType[r.event.type] = (byType[r.event.type] || 0) + 1;
report.events = { received: log.length, all_valid: log.every((r) => r.valid), invalid: log.filter((r) => !r.valid).map((r) => r.reason), by_type: byType,
  content_types: [...new Set(log.map((r) => r.content_type))], cookie_header_seen: log.some((r) => r.cookie_header_present),
  keys_seen: [...new Set(log.flatMap((r) => Object.keys(r.event)))].sort(), sample: log.slice(0, 4).map((r) => r.event) };

await browser.close();
await preview.close();
writeFileSync(join(out, 'preview-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ out, screenshots: report.screenshots.length, overflow_zero: report.screenshots.every((s) => s.horizontal_overflow_px <= 0), console_errors: report.screenshots.flatMap((s) => s.console_errors), nojs: report.nojs.map((n) => [n.page_path, n.visible, n.navigated_to.slice(0, 60)]), nojs_events_received: report.nojs_events_received, keyboard: { stops: report.keyboard.card_focus_stops.length, nav: report.keyboard.enter_to_navigation_ms }, navigation: report.navigation.map((n) => [n.collector, n.exact_href, n.click_to_navigation_ms]), events: { received: report.events.received, all_valid: report.events.all_valid, by_type: report.events.by_type }, screenshot_phase_events: report.screenshot_phase_events }, null, 2));
