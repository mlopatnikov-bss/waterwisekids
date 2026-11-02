// End-to-end, zero dependency: the REAL Phase 2 client (proposal/component/wwk-sponsored.js,
// run in the Phase 2 vm harness) -> collector Worker -> D1 -> portal Worker, with two
// Access identities proving own-tenant 200 and cross-tenant 404.
// The same flow runs in real workerd + Chromium in scripts/e2e-workerd.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildProposal } from '../../proposal/src/build.mjs';
import { makeEnv, cardFromHtml } from '../../proposal/test/harness.mjs';
import { handleCollector } from '../src/collector/worker.mjs';
import { seeded, collectorEnv, IDENTITIES } from './support.mjs';
import { get, T } from './portal-support.mjs';
import { TenantScope } from '../src/shared/scope.mjs';

const E2E_NOW = Date.parse('2026-11-02T15:30:00.000Z');
const DAY = '2026-11-02';
const REPORT = { REPORT_AS_OF: '2026-11-03T14:00:00.000Z' };
const proposal = buildProposal();
const pageFor = (path) => proposal.pages.find((p) => p.page_path === path);

/** One simulated page view: card on screen >1s, then a click on the first sponsored link, then pagehide. */
function pageView(cardHtml, startMs) {
  const card = cardFromHtml(cardHtml);
  const env = makeEnv({ cards: [card], collector: 'https://collector.wwk-staging.invalid/v1/collect', startMs, hostname: 'www.waterwisekids.com', referrer: 'https://www.google.com/' });
  env.run(); env.advance(0);
  env.intersect(card, 1); env.advance(1200);
  const ev = env.fire(card.anchors[0], 'click');
  env.pagehide(); env.advance(100);
  assert.equal(ev.defaultPrevented, false, 'the client never blocks navigation');
  assert.deepEqual(env.forbidden, []);
  return [...env.beacons.map((b) => b.body), ...env.fetches.map((f) => f.init.body)];
}

async function deliver(db, bodies, at) {
  const out = [];
  for (const body of bodies) {
    const res = await handleCollector(new Request('https://collector.wwk-staging.invalid/v1/collect', { method: 'POST', body, headers: { Origin: 'https://www.waterwisekids.com', 'Content-Type': 'text/plain;charset=UTF-8' } }), collectorEnv(db), {}, { now: () => at, log() {} });
    out.push({ status: res.status, json: await res.json(), acao: res.headers.get('access-control-allow-origin') });
  }
  return out;
}

test('Phase 2 client -> collector Worker -> D1 -> portal Worker: exact counts; owner 200 / partner 404 and vice versa', async () => {
  const s = await seeded();
  const nwpCard = pageFor('/swim-lessons/northwest-philadelphia.html').card_html;
  const manCard = pageFor('/swim-lessons/directory/new-york.html').card_html;
  const nwpBodies = [...pageView(nwpCard, E2E_NOW), ...pageView(nwpCard, E2E_NOW + 5000)];
  const manBodies = pageView(manCard, E2E_NOW + 9000);
  const results = [...await deliver(s.db, nwpBodies, E2E_NOW + 20_000), ...await deliver(s.db, manBodies, E2E_NOW + 20_000)];
  for (const r of results) { assert.equal(r.status, 202); assert.equal(r.json.rejected, 0); assert.equal(r.acao, 'https://www.waterwisekids.com'); }
  const accepted = results.reduce((n, r) => n + r.json.accepted, 0);
  assert.equal(accepted, 2 * 4 + 4, 'per page view: eligible_view, viewable_impression, sponsored_click, outbound_click');

  // Replaying every beacon (network retry) changes nothing.
  const replay = await deliver(s.db, [...nwpBodies, ...manBodies], E2E_NOW + 30_000);
  assert.equal(replay.reduce((n, r) => n + r.json.accepted, 0), 0);

  const nwp = await new TenantScope(s.db, T['northwest-philadelphia'], 'x').totals(DAY, DAY);
  assert.deepEqual(nwp.sponsored_card, { eligible_view: 2, viewable_impression: 2, sponsored_click: 2, outbound_click: 2 });
  const man = await new TenantScope(s.db, T.manhattan, 'x').totals(DAY, DAY);
  assert.deepEqual(man.sponsored_card, { eligible_view: 1, viewable_impression: 1, sponsored_click: 1, outbound_click: 1 });

  const ownerPage = await get(s.db, `/t/${T['northwest-philadelphia']}/?from=${DAY}&to=${DAY}`, { email: IDENTITIES.owner, env: REPORT });
  assert.equal(ownerPage.status, 200);
  assert.match(ownerPage.body, /data-metric="eligible_view" data-value="2"/);
  assert.match(ownerPage.body, /data-metric="sponsored_click" data-value="2"/);
  assert.equal((await get(s.db, `/t/${T.manhattan}/?from=${DAY}&to=${DAY}`, { email: IDENTITIES.owner, env: REPORT })).status, 404, 'owner -> Manhattan: 404');

  const partnerPage = await get(s.db, `/t/${T.manhattan}/?from=${DAY}&to=${DAY}`, { email: IDENTITIES.partner, env: REPORT });
  assert.equal(partnerPage.status, 200);
  assert.match(partnerPage.body, /data-metric="eligible_view" data-value="1"/);
  assert.equal((await get(s.db, `/t/${T['northwest-philadelphia']}/?from=${DAY}&to=${DAY}`, { email: IDENTITIES.partner, env: REPORT })).status, 404, 'partner -> NWP: 404');
  assert.equal((await get(s.db, `/t/${T['northwest-philadelphia']}/`, { env: REPORT })).status, 403, 'no Access context: 403');
});

test('the client stays non-blocking when the collector refuses or fails', async () => {
  const s = await seeded();
  const card = pageFor('/swim-lessons/howell-nj.html').card_html;
  const bodies = pageView(card, E2E_NOW);
  const refused = await handleCollector(new Request('https://c.invalid/v1/collect', { method: 'POST', body: bodies[0], headers: { Origin: 'https://evil.example.com', 'Content-Type': 'text/plain' } }), collectorEnv(s.db), {}, { log() {} });
  assert.equal(refused.status, 403);
  const down = await handleCollector(new Request('https://c.invalid/v1/collect', { method: 'POST', body: bodies[0], headers: { Origin: 'https://www.waterwisekids.com', 'Content-Type': 'text/plain' } }), collectorEnv({ prepare: s.db.prepare.bind(s.db), batch: async () => { throw new Error('down'); } }), {}, { now: () => E2E_NOW, log() {} });
  assert.equal(down.status, 503);
  // Navigation safety was already asserted per page view (defaultPrevented false); the client never reads the response.
});
