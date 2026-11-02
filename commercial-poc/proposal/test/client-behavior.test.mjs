// Tracking client: viewability, once-per-page-view semantics, click handling and failure isolation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildProposal } from '../src/build.mjs';
import { makeEnv, cardFromHtml } from './harness.mjs';

const built = buildProposal();
const card = (i = 4) => cardFromHtml(built.pages[i].card_html);
const types = (env) => env.sent().map((e) => e.type);
const count = (env, t) => types(env).filter((x) => x === t).length;
function started(opts = {}) { const c = card(opts.page ?? 4); const env = makeEnv({ cards: [c], ...opts }); env.run(); env.advance(0); return { env, c }; }

test('eligible view: exactly one per card per page view', () => {
  const { env, c } = started();
  env.advance(10000); env.intersect(c, 0); env.pagehide();
  assert.equal(count(env, 'eligible_view'), 1);
});

test('viewability: requires >= 50% visible', () => {
  const { env, c } = started();
  env.intersect(c, 0.49); env.advance(60000);
  assert.equal(count(env, 'viewable_impression'), 0);
  env.intersect(c, 0.5); env.advance(1000);
  assert.equal(count(env, 'viewable_impression'), 1);
});

test('viewability: requires 1 continuous second; interruptions restart the clock', () => {
  const { env, c } = started();
  env.intersect(c, 0.9); env.advance(999); env.intersect(c, 0.2);
  env.advance(5000);
  assert.equal(count(env, 'viewable_impression'), 0, '999 ms is not enough');
  env.intersect(c, 0.9); env.advance(600); env.intersect(c, 0.4); env.intersect(c, 0.9); env.advance(600);
  assert.equal(count(env, 'viewable_impression'), 0, 'dip below 50% restarts the clock');
  env.advance(400);
  assert.equal(count(env, 'viewable_impression'), 1);
  const e = env.sent().find((x) => x.type === 'viewable_impression');
  assert.ok(e.viewability.visible_ms >= 1000);
  assert.ok(e.viewability.visible_ratio >= 0.5 && e.viewability.visible_ratio <= 1);
});

test('viewability: once per page view, and the observer is released after firing', () => {
  const { env, c } = started();
  env.intersect(c, 1); env.advance(1500);
  for (let k = 0; k < 5; k += 1) { env.intersect(c, 0); env.intersect(c, 1); env.advance(2000); }
  assert.equal(count(env, 'viewable_impression'), 1);
  assert.equal(env.observers[0].disconnected, true);
});

test('viewability: a hidden tab pauses the clock', () => {
  const { env, c } = started();
  env.intersect(c, 1); env.advance(500); env.setVisibility('hidden'); env.advance(5000);
  assert.equal(count(env, 'viewable_impression'), 0);
  env.setVisibility('visible'); env.advance(999);
  assert.equal(count(env, 'viewable_impression'), 0);
  env.advance(1);
  assert.equal(count(env, 'viewable_impression'), 1);
});

test('viewability: no IntersectionObserver means no viewable impression is ever guessed', () => {
  const { env } = started({ io: false });
  env.advance(60000);
  assert.deepEqual(types(env), ['eligible_view']);
});

test('clicks: one sponsored click per page view, one outbound per destination, never cancels navigation', () => {
  const { env, c } = started({ page: 7 });
  const evs = [];
  for (const a of c.anchors) { evs.push(env.fire(a, 'click')); evs.push(env.fire(a.span, 'click')); }
  evs.push(env.fire(c.anchors[0], 'auxclick', 1));
  evs.push(env.fire(c.anchors[0], 'auxclick', 2));
  for (const ev of evs) { assert.deepEqual(ev.calls, []); assert.equal(ev.defaultPrevented, false); }
  assert.equal(count(env, 'sponsored_click'), 1);
  const outs = env.sent().filter((e) => e.type === 'outbound_click');
  assert.equal(outs.length, c.anchors.length);
  assert.deepEqual(new Set(outs.map((o) => o.destination_id)), new Set(c.anchors.map((a) => a.getAttribute('data-wwk-destination'))));
  for (const o of outs) {
    const a = c.anchors.find((x) => x.getAttribute('data-wwk-destination') === o.destination_id);
    assert.equal(o.location_id ?? null, a.getAttribute('data-wwk-location'));
  }
});

test('clicks: click events are sent immediately (before the browser leaves the page)', () => {
  const { env, c } = started();
  const before = env.beacons.length;
  env.fire(c.anchors[0], 'click');
  assert.ok(env.beacons.length > before, 'flushed synchronously in the click handler, no timer needed');
  const clickTypes = env.beacons.slice(before).flatMap((b) => { const j = JSON.parse(b.body); return (j.events || [j]).map((e) => e.type); });
  assert.deepEqual(clickTypes.sort(), ['outbound_click', 'sponsored_click']);
});

test('clicks outside a sponsored link (card body, right button) are ignored', () => {
  const { env, c } = started();
  env.fire(c.card, 'click');
  env.fire(c.anchors[0], 'auxclick', 2);
  assert.equal(count(env, 'sponsored_click'), 0);
});

const FAILURES = [
  { beacon: 'throw', fetchMode: 'ok' }, { beacon: 'false', fetchMode: 'ok' }, { beacon: 'none', fetchMode: 'ok' },
  { beacon: 'throw', fetchMode: 'reject' }, { beacon: 'false', fetchMode: 'throw' }, { beacon: 'none', fetchMode: 'none' },
  { beacon: 'throw', fetchMode: 'none' },
];
for (const f of FAILURES) {
  test(`transport failure swallowed (beacon=${f.beacon}, fetch=${f.fetchMode}); links still work`, async () => {
    const unhandled = [];
    const onUnhandled = (r) => unhandled.push(r);
    process.on('unhandledRejection', onUnhandled);
    try {
      const c = card(7);
      const env = makeEnv({ cards: [c], ...f });
      assert.doesNotThrow(() => { env.run(); env.advance(0); env.intersect(c, 1); env.advance(1500); });
      for (const a of c.anchors) {
        let ev;
        assert.doesNotThrow(() => { ev = env.fire(a, 'click'); });
        assert.deepEqual(ev.calls, []);
        assert.equal(ev.defaultPrevented, false);
        assert.match(a.getAttribute('href'), /^https:\/\/britishswimschool\.com\//, 'href untouched');
      }
      assert.doesNotThrow(() => env.pagehide());
      await new Promise((r) => setImmediate(r));
      assert.deepEqual(unhandled, []);
      if (f.beacon !== 'ok' && f.fetchMode !== 'none') {
        assert.ok(env.fetches.length > 0, 'falls back to fetch');
        for (const x of env.fetches) {
          assert.equal(x.init.keepalive, true);
          assert.equal(x.init.credentials, 'omit');
          assert.equal(x.init.referrerPolicy, 'no-referrer');
          assert.equal(x.init.method, 'POST');
        }
      }
    } finally { process.off('unhandledRejection', onUnhandled); }
  });
}

test('batching: many cards produce batches of at most 25 events (collector request cap)', () => {
  const cards = Array.from({ length: 30 }, () => card(4));
  const env = makeEnv({ cards });
  env.run(); env.advance(0);
  assert.ok(env.beacons.length >= 2);
  for (const b of env.beacons) { const j = JSON.parse(b.body); const n = Array.isArray(j.events) ? j.events.length : 1; assert.ok(n <= 25); }
});

test('the script is idempotent when included more than once on a page', () => {
  const c = card(4);
  const env = makeEnv({ cards: [c] });
  env.run(); env.run(); env.advance(0);
  assert.equal(count(env, 'eligible_view'), 1);
  assert.equal(env.observers.length, 1);
});

test('initialises after DOMContentLoaded when loaded while the document is still parsing', () => {
  const c = card(4);
  const env = makeEnv({ cards: [c], readyState: 'loading' });
  env.run(); env.advance(0);
  assert.equal(env.sent().length, 0);
  for (const fn of env.docListeners.DOMContentLoaded) fn();
  env.advance(0);
  assert.equal(count(env, 'eligible_view'), 1);
});
