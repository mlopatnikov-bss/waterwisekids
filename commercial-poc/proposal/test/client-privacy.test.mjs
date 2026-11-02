// Tracking client: privacy rules, schema conformance and end-to-end acceptance by the Phase 1 collector.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildProposal } from '../src/build.mjs';
import { makeEnv, cardFromHtml, CLIENT_SRC, T0 } from './harness.mjs';
import { openDb } from '../../src/db.mjs';
import { loadManifest as loadIntoDb, buildRegistry } from '../../src/registry.mjs';
import { ingestBatch } from '../../src/collector.mjs';
import { validateEvent } from '../../src/events.mjs';

const built = buildProposal();
const cardsFor = (i) => [cardFromHtml(built.pages[i].card_html)];
const UUID4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const ALLOWED_KEYS = new Set(['v', 'event_id', 'type', 'occurred_at', 'site_host', 'page_path', 'tenant_id', 'school_id', 'campaign_id', 'placement_id', 'page_view_id', 'referrer_category', 'device_class', 'location_id', 'destination_id', 'viewability']);

/** Drive one full page lifecycle and return the env. */
function lifecycle(i, extra = {}) {
  const cards = cardsFor(i);
  const env = makeEnv({ cards, ...extra });
  env.run();
  env.advance(0);
  env.intersect(cards[0], 0.8);
  env.advance(1200);
  for (const a of cards[0].anchors) env.fire(a.span, 'click');
  env.pagehide();
  return { env, cards };
}

test('client static scan: no storage, cookie, UA, URL path/query, navigation-cancelling or link-rewriting APIs in the source', () => {
  const code = CLIENT_SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const banned = [/document\.cookie/, /localStorage/, /sessionStorage/, /indexedDB/, /userAgent/, /navigator\.(platform|language|plugins|hardwareConcurrency|deviceMemory|vendor)/,
    /location\.(href|pathname|search|hash|assign|replace|reload|origin|port)/, /preventDefault/, /stopPropagation/, /stopImmediatePropagation/, /window\.open|\.open\(/,
    /\.href\s*=/, /setAttribute\(/, /innerHTML|outerHTML|insertAdjacentHTML/, /\beval\(/, /new Function/, /screen\./, /history\./, /document\.referrer\s*[^;]*\bfetch/];
  for (const re of banned) assert.doesNotMatch(code, re, re.toString());
  assert.match(code, /location\.hostname/, 'host is the only location field read');
});

test('harness self-check: the forbidden-API guards really detect violations', () => {
  const evil = `(function (w) {
    var d = w.document; void d.cookie; void w.location.pathname; void w.navigator.userAgent; void w.localStorage;
    var cards = d.querySelectorAll('[data-wwk-sponsored-card]');
    cards[0].addEventListener('click', function (e) { e.preventDefault(); });
  })(window);`;
  const c = cardFromHtml(built.pages[4].card_html);
  const env = makeEnv({ cards: [c] });
  env.runSource(evil);
  const ev = env.fire(c.anchors[0], 'click');
  assert.deepEqual(env.forbidden.sort(), ['document.cookie', 'location.pathname', 'navigator.userAgent', 'window.localStorage']);
  assert.deepEqual(ev.calls, ['preventDefault']);
});

test('client is completely inert without a valid collector URL (no observers, listeners or requests)', () => {
  for (const collector of [null, '', 'not a url', 'http://collect.example.org/v1/collect', 'javascript:alert(1)', 'ftp://x.example/']) {
    const cards = cardsFor(4);
    const env = makeEnv({ cards, collector });
    env.run(); env.advance(5000);
    assert.equal(env.observers.length, 0, String(collector));
    assert.equal(Object.keys(cards[0].card.listeners).length, 0);
    assert.equal(env.beacons.length + env.fetches.length, 0);
  }
  const local = makeEnv({ cards: cardsFor(4), collector: 'http://127.0.0.1:4320/__collector' });
  local.run(); local.advance(0);
  assert.equal(local.beacons.length, 1, 'loopback http allowed for local preview only');
});

test('privacy: a full lifecycle touches no forbidden API and sends only schema v1 fields', () => {
  for (let i = 0; i < built.pages.length; i += 1) {
    const { env } = lifecycle(i, { referrer: 'https://www.google.com/search?q=swim+lessons+near+me&uid=123' });
    assert.deepEqual(env.forbidden, [], built.pages[i].page_path);
    const events = env.sent();
    assert.ok(events.length >= 4);
    for (const e of events) {
      for (const k of Object.keys(e)) assert.ok(ALLOWED_KEYS.has(k), `unexpected key ${k}`);
      assert.equal(e.site_host, 'www.waterwisekids.com');
      assert.equal(e.page_path, built.pages[i].page_path, 'page path comes from the card, never from the URL');
      assert.equal(e.referrer_category, 'search');
      const json = JSON.stringify(e);
      for (const leak of ['google.com', 'swim+lessons', 'uid=123', 'utm_', 'britishswimschool.com', '?']) assert.equal(json.includes(leak), false, `${leak} leaked`);
    }
  }
});

test('privacy: one in-memory page-view id per page load, never in a URL, never persisted', () => {
  const a = lifecycle(7).env.sent();
  const b = lifecycle(7).env.sent();
  const ida = new Set(a.map((e) => e.page_view_id)); const idb = new Set(b.map((e) => e.page_view_id));
  assert.equal(ida.size, 1); assert.equal(idb.size, 1);
  const [pa] = ida; const [pb] = idb;
  assert.match(pa, UUID4);
  assert.notEqual(pa, pb, 'a new page load gets a new id');
  for (const p of built.pages) assert.equal(p.card_html.includes('page_view'), false);
  for (const e of a) assert.match(e.event_id, UUID4);
  assert.equal(new Set(a.map((e) => e.event_id)).size, a.length, 'event ids are unique');
});

test('privacy: referrer is reduced to a category and device to a coarse class', () => {
  const cat = (referrer) => { const env = makeEnv({ cards: cardsFor(0), referrer }); env.run(); env.advance(0); return env.sent()[0].referrer_category; };
  assert.equal(cat(''), 'direct');
  assert.equal(cat('https://www.waterwisekids.com/swim-lessons/'), 'internal');
  assert.equal(cat('https://www.bing.com/search?q=x'), 'search');
  assert.equal(cat('https://duckduckgo.com/'), 'search');
  assert.equal(cat('https://l.facebook.com/l.php?u=x'), 'social');
  assert.equal(cat('https://mail.google.com/mail/u/0/'), 'email');
  assert.equal(cat('https://news.example.org/story'), 'other');
  assert.equal(cat('::not a url::'), 'unknown');
  const dev = (media) => { const env = makeEnv({ cards: cardsFor(0), media }); env.run(); env.advance(0); return env.sent()[0].device_class; };
  assert.equal(dev({ mobile: true }), 'mobile');
  assert.equal(dev({ coarse: true, tablet: true }), 'tablet');
  assert.equal(dev({}), 'desktop');
});

test('schema: every event from every proposed card is accepted by the Phase 1 collector (allowlisted host, page, IDs, destinations)', () => {
  const db = openDb(':memory:');
  loadIntoDb(db, built.manifest, { at: new Date(T0).toISOString() });
  const registry = buildRegistry(db);
  const byType = {};
  for (let i = 0; i < built.pages.length; i += 1) {
    const { env } = lifecycle(i);
    const events = env.sent();
    for (const e of events) {
      const v = validateEvent(e, registry, { receivedAtMs: env.now() });
      assert.equal(v.ok, true, `${built.pages[i].page_path} ${e.type}: ${v.reason} (${v.field})`);
      byType[e.type] = (byType[e.type] || 0) + 1;
    }
    const r = ingestBatch(db, registry, events, { receivedAtMs: env.now() });
    assert.equal(r.rejected, 0);
    assert.equal(r.accepted, events.length);
  }
  assert.deepEqual(Object.keys(byType).sort(), ['eligible_view', 'outbound_click', 'sponsored_click', 'viewable_impression']);
  const totalDest = built.pages.reduce((s, p) => s + p.destinations.length, 0);
  assert.equal(byType.outbound_click, totalDest, 'one outbound per destination per page view');
  assert.equal(byType.sponsored_click, 8);
  db.close();
});

test('schema: a card from a non-allowlisted host is rejected by the collector (preview/staging hosts cannot pollute pilot data)', () => {
  const db = openDb(':memory:');
  loadIntoDb(db, built.manifest, { at: new Date(T0).toISOString() });
  const env = makeEnv({ cards: cardsFor(1), hostname: 'staging.example.org' });
  env.run(); env.advance(0);
  const v = validateEvent(env.sent()[0], buildRegistry(db), { receivedAtMs: env.now() });
  assert.equal(v.reason, 'host_not_allowed');
  db.close();
});

test('client refuses cards whose data attributes are not manifest-shaped IDs and paths', () => {
  const good = cardFromHtml(built.pages[4].card_html);
  const mutate = (k, v) => { const c = cardFromHtml(built.pages[4].card_html); c.card.attrs[k] = v; return c; };
  const bad = [mutate('data-wwk-tenant', 'British Swim School'), mutate('data-wwk-placement', 'plc_123'), mutate('data-wwk-page-path', '/x.html?email=a@b.co'), mutate('data-wwk-page-path', '/a/../b'), mutate('data-wwk-location', 'loc_nope')];
  const env = makeEnv({ cards: [good, ...bad] });
  env.run(); env.advance(0);
  const placements = new Set(env.sent().map((e) => e.placement_id));
  assert.deepEqual([...placements], [good.card.attrs['data-wwk-placement']]);
});
