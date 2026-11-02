// Runs the proposed ordinary-listing client in a vm with a fake DOM and checks that its
// events are exactly the fair-comparison set, pass the accepted Phase 1 event
// validation for the generated control placements, and never alter the page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { webcrypto } from 'node:crypto';
import { validateEvent } from '../../src/events.mjs';
import { ONBOARDING_ROOT } from '../src/repo.mjs';
import { buildControlArtifacts } from '../src/controls.mjs';
import { loadManifest, loadPilot, realCtx } from './support.mjs';
import { migratedD1 } from '../../staging/scripts/lib/d1-sqlite.mjs';
import { migrationFiles } from '../../staging/scripts/lib/migrations.mjs';
import { loadManifestD1 } from '../../staging/scripts/lib/seed-pipeline.mjs';
import { pilotManifest } from '../../staging/scripts/build-pilot-seed.mjs';
import { loadRegistry } from '../../staging/src/shared/registry.mjs';

const SRC = readFileSync(join(ONBOARDING_ROOT, 'assets/wwk-ordinary-listing.js'), 'utf8');
const T0 = Date.parse('2026-11-04T15:00:00.000Z');

class El {
  constructor(tag, attrs = {}, parent = null) { this.tagName = tag.toUpperCase(); this.attrs = attrs; this.parent = parent; this.listeners = {}; if (parent) (parent.kids ||= []).push(this); }
  getAttribute(n) { return Object.prototype.hasOwnProperty.call(this.attrs, n) ? this.attrs[n] : null; }
  addEventListener(t, f) { (this.listeners[t] ||= []).push(f); }
  contains(el) { for (let e = el; e; e = e.parent) if (e === this) return true; return false; }
  closest(sel) { assert.equal(sel, 'a[data-wwk-destination]'); for (let e = this; e; e = e.parent) if (e.tagName === 'A' && e.getAttribute('data-wwk-destination') !== null) return e; return null; }
}

function env({ rowsHtml, collector = 'https://events.waterwisekids.com/v1/collect' }) {
  const rows = []; const anchors = [];
  for (const m of rowsHtml.matchAll(/<div class="school-card" ([^>]*)>([\s\S]*?)(?=<div class="school-card" |$)/g)) {
    const attrs = Object.fromEntries([...m[1].matchAll(/([a-z-]+)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
    const row = new El('div', attrs);
    for (const a of m[2].matchAll(/<a ([^>]*)>/g)) anchors.push(new El('a', Object.fromEntries([...a[1].matchAll(/([a-z-]+)="([^"]*)"/g)].map((x) => [x[1], x[2]])), row));
    rows.push(row);
  }
  let clock = 0; const timers = []; const sent = []; const observers = []; const forbidden = [];
  const document = {
    readyState: 'complete', referrer: 'https://www.google.com/', visibilityState: 'visible',
    currentScript: new El('script', collector ? { 'data-wwk-collector': collector } : {}),
    querySelectorAll(sel) { assert.equal(sel, '[data-wwk-ordinary-listing]'); return rows.filter((r) => r.getAttribute('data-wwk-ordinary-listing') !== null); },
    addEventListener() {},
    get cookie() { forbidden.push('cookie'); return ''; },
  };
  const window = {
    document, location: { hostname: 'www.waterwisekids.com', get href() { forbidden.push('location.href'); return ''; } }, URL, Uint8Array, JSON, Math, Object, Date: class extends Date { constructor(...a) { super(...(a.length ? a : [T0 + clock])); } },
    crypto: webcrypto, performance: { now: () => clock },
    navigator: { sendBeacon: (url, body) => { const b = JSON.parse(body); sent.push(...(b.events || [b])); return true; }, get userAgent() { forbidden.push('userAgent'); return ''; } },
    matchMedia: () => ({ matches: false }),
    setTimeout: (f, ms) => { timers.push({ f, at: clock + ms }); return timers.length; }, clearTimeout: (i) => { if (timers[i - 1]) timers[i - 1].f = null; },
    IntersectionObserver: class { constructor(cb) { this.cb = cb; observers.push(this); } observe(el) { this.el = el; } unobserve() {} disconnect() {} },
    addEventListener() {},
    get localStorage() { forbidden.push('localStorage'); return null; }, get sessionStorage() { forbidden.push('sessionStorage'); return null; },
  };
  const advance = (ms) => { clock += ms; for (const t of timers) if (t.f && t.at <= clock) { const f = t.f; t.f = null; f(); } };
  const flush = () => advance(0);
  vm.runInNewContext(SRC, { window });
  return { rows, anchors, sent, observers, forbidden, advance, flush,
    intersect: (row, ratio) => { for (const o of observers) if (o.el === row) o.cb([{ target: row, isIntersecting: ratio > 0, intersectionRatio: ratio }]); },
    click: (a) => { for (const f of a.parent.listeners.click || []) f({ type: 'click', target: a, button: 0 }); } };
}

function patchedRows() {
  const a = buildControlArtifacts(JSON.parse(readFileSync(join(ONBOARDING_ROOT, 'definitions/bss-pilot-2026.controls.json'), 'utf8')), loadPilot(), realCtx());
  const d = a.files['control/patches/swim-lessons-directory-new-jersey.diff'];
  if (d) return d.split('\n').filter((l) => l.startsWith('+<div class="school-card"')).map((l) => l.slice(1)).join('\n');
  return realCtx().repo.read('swim-lessons/directory/new-jersey.html').split('\n')
    .filter((l) => l.startsWith('<div class="school-card"') && l.includes('data-wwk-ordinary-listing')).join('\n');
}

/** The collector's own registry, loaded from a pilot D1 after the generated control SQL. */
async function controlRegistry() {
  const db = migratedD1(migrationFiles());
  await loadManifestD1(db, pilotManifest(loadManifest()), { at: '2026-11-02T05:00:00.000Z', actor: 'pilot-release' });
  const a = buildControlArtifacts(JSON.parse(readFileSync(join(ONBOARDING_ROOT, 'definitions/bss-pilot-2026.controls.json'), 'utf8')), loadPilot(), realCtx());
  db.db.exec(a.files['control/d1-control-upsert.sql']);
  const reg = await loadRegistry(db);
  db.close();
  return reg;
}

test('ordinary-listing client: eligible view, viewable impression, outbound click; never sponsored_click', () => {
  const e = env({ rowsHtml: patchedRows() });
  e.flush();
  assert.equal(e.sent.length, 3, 'one eligible view per listing');
  assert.ok(e.sent.every((x) => x.type === 'eligible_view'));
  const howell = e.rows.find((r) => r.attrs['data-wwk-placement'] === 'plc_d6a6673732411e04');
  e.intersect(howell, 0.6); e.advance(999);
  assert.equal(e.sent.filter((x) => x.type === 'viewable_impression').length, 0, 'not before 1 s');
  e.advance(1);
  const vi = e.sent.filter((x) => x.type === 'viewable_impression');
  assert.equal(vi.length, 1); assert.equal(vi[0].placement_id, 'plc_d6a6673732411e04');
  const link = e.anchors.find((a) => a.parent === howell && a.attrs['data-wwk-destination']);
  e.click(link); e.click(link);
  const oc = e.sent.filter((x) => x.type === 'outbound_click');
  assert.equal(oc.length, 1, 'one outbound click per destination per page view');
  assert.equal(oc[0].destination_id, 'dst_cd581fee5ef6a610');
  assert.equal(e.sent.filter((x) => x.type === 'sponsored_click').length, 0);
  assert.deepEqual(e.forbidden, []);
  const tel = e.anchors.find((a) => a.parent === howell && !a.attrs['data-wwk-destination']);
  e.click(tel);
  assert.equal(e.sent.filter((x) => x.type === 'outbound_click').length, 1, 'phone links are not counted');
});

test('every event the client sends passes the accepted Phase 1 collector validation for the control placements', async () => {
  const e = env({ rowsHtml: patchedRows() });
  e.flush();
  for (const r of e.rows) { e.intersect(r, 1); }
  e.advance(1000);
  for (const a of e.anchors.filter((x) => x.attrs['data-wwk-destination'])) e.click(a);
  const reg = await controlRegistry();
  assert.equal(e.sent.length, 9);
  for (const ev of e.sent) {
    const r = validateEvent(ev, reg, { receivedAtMs: T0 + 5000 });
    assert.equal(r.ok, true, `${ev.type}: ${JSON.stringify(r)}`);
  }
  assert.equal(new Set(e.sent.map((x) => x.page_view_id)).size, 1, 'one in-memory page-view id');
  for (const ev of e.sent) assert.deepEqual(Object.keys(ev).filter((k) => !['v', 'event_id', 'type', 'occurred_at', 'site_host', 'page_path', 'tenant_id', 'school_id', 'campaign_id', 'placement_id', 'page_view_id', 'referrer_category', 'device_class', 'location_id', 'destination_id', 'viewability'].includes(k)), []);
});

test('inert without a collector, and ignores rows with malformed IDs', () => {
  assert.equal(env({ rowsHtml: patchedRows(), collector: null }).sent.length, 0);
  assert.equal(env({ rowsHtml: patchedRows(), collector: 'http://evil.example/collect' }).sent.length, 0);
  const bad = patchedRows().replace('data-wwk-tenant="ten_9d294d23e0e9841e"', 'data-wwk-tenant="ten_bad"');
  const e = env({ rowsHtml: bad }); e.flush();
  assert.equal(e.sent.length, 2);
});
