#!/usr/bin/env node
// Real local-runtime flow: accepted Phase 2 client fixture -> public workerd
// collector -> persisted local D1 -> Access-simulated portal workerd.
import assert from 'node:assert/strict';
import { buildProposal } from '../../proposal/src/build.mjs';
import { makeEnv, cardFromHtml } from '../../proposal/test/harness.mjs';
import { paths, setup, wranglerSpawn } from './lib/wrangler-local.mjs';
import { migrate, seed, devArgs } from './local.mjs';

const DAY = '2026-11-02';
const REPORT_AS_OF = '2026-11-03T14:00:00.000Z';
const TENANTS = {
  owner: 'ten_b234a48144f47f06',
  partner: 'ten_52bf92991a0305d0',
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function start(worker, { as = 'none', port, vars = {} }, p) {
  const child = wranglerSpawn(devArgs(worker, { as, port, inspectorPort: port + 1000, vars }, p), p);
  const deadline = Date.now() + 30_000;
  while (!/Ready on http:\/\/127\.0\.0\.1:/.test(child.output())) {
    if (child.exitCode !== null) throw new Error(`${worker} exited before ready:\n${child.output().slice(-4000)}`);
    if (Date.now() > deadline) throw new Error(`${worker} did not become ready:\n${child.output().slice(-4000)}`);
    await wait(100);
  }
  return child;
}

async function stop(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGINT');
  const deadline = Date.now() + 10_000;
  while (child.exitCode === null && Date.now() < deadline) await wait(50);
  if (child.exitCode === null) child.kill('SIGTERM');
}

function pageBodies(cardHtml, startMs) {
  const card = cardFromHtml(cardHtml);
  const env = makeEnv({ cards: [card], collector: 'http://127.0.0.1/collect', startMs, hostname: 'www.waterwisekids.com', referrer: 'https://www.google.com/' });
  env.run(); env.advance(0); env.intersect(card, 1); env.advance(1200);
  const click = env.fire(card.anchors[0], 'click');
  env.pagehide(); env.advance(100);
  assert.equal(click.defaultPrevented, false);
  assert.deepEqual(env.forbidden, []);
  return [...env.beacons.map((b) => b.body), ...env.fetches.map((f) => f.init.body)];
}

async function collect(port, bodies) {
  const results = [];
  for (const body of bodies) {
    const response = await fetch(`http://127.0.0.1:${port}/v1/collect`, {
      method: 'POST', body, headers: { Origin: 'https://www.waterwisekids.com', 'Content-Type': 'text/plain;charset=UTF-8' },
    });
    results.push({ status: response.status, cors: response.headers.get('access-control-allow-origin'), body: await response.json() });
  }
  return results;
}

async function portalCase(p, as, port, own, foreign, expectedValue, { crossStatus = 404, admin = false } = {}) {
  const child = await start('portal', { as, port, vars: { REPORT_AS_OF } }, p);
  try {
    const ownResponse = await fetch(`http://127.0.0.1:${port}/t/${own}/?from=${DAY}&to=${DAY}`);
    const ownHtml = await ownResponse.text();
    const crossResponse = await fetch(`http://127.0.0.1:${port}/t/${foreign}/?from=${DAY}&to=${DAY}`);
    const crossHtml = await crossResponse.text();
    assert.equal(ownResponse.status, 200);
    assert.match(ownHtml, new RegExp(`data-metric="eligible_view" data-value="${expectedValue}"`));
    assert.equal(crossResponse.status, crossStatus);
    if (crossStatus === 404) assert.doesNotMatch(crossHtml, new RegExp(own === TENANTS.owner ? 'Manhattan' : 'Northwest Philadelphia', 'i'));
    if (admin) {
      assert.match(ownHtml, /Staging · Administrator/);
      assert.match(ownHtml, /aria-label="All sponsor accounts"/);
      assert.match(crossHtml, /data-metric="eligible_view" data-value="1"/);
    }
    assert.match(ownResponse.headers.get('content-security-policy') || '', /default-src 'none'/);
    assert.equal(ownResponse.headers.get('set-cookie'), null);
    return { own: ownResponse.status, cross: crossResponse.status, csp: true, no_cookie: true, admin_switcher: admin };
  } finally {
    await stop(child);
  }
}

async function main() {
  const p = setup(paths());
  migrate(p);
  const seeded = await seed(p);
  const proposal = buildProposal();
  const nwp = proposal.pages.find((page) => page.page_path === '/swim-lessons/northwest-philadelphia.html');
  const manhattan = proposal.pages.find((page) => page.page_path === '/swim-lessons/directory/new-york.html');
  const now = Date.parse('2026-11-02T15:30:00.000Z');
  const nwpBodies = pageBodies(nwp.card_html, now);
  const manhattanBodies = pageBodies(manhattan.card_html, now + 5000);

  const collectorPort = 8897;
  const collector = await start('collector', { port: collectorPort }, p);
  let delivered;
  try {
    delivered = [...await collect(collectorPort, nwpBodies), ...await collect(collectorPort, manhattanBodies)];
    for (const item of delivered) {
      assert.equal(item.status, 202);
      assert.equal(item.cors, 'https://www.waterwisekids.com');
      assert.equal(item.body.rejected, 0);
    }
    assert.equal(delivered.reduce((sum, item) => sum + item.body.accepted, 0), 8);
    const replay = await collect(collectorPort, [...nwpBodies, ...manhattanBodies]);
    assert.equal(replay.reduce((sum, item) => sum + item.body.accepted, 0), 0);
  } finally {
    await stop(collector);
  }

  const owner = await portalCase(p, 'owner', 8898, TENANTS.owner, TENANTS.partner, 1);
  const partner = await portalCase(p, 'partner', 8899, TENANTS.partner, TENANTS.owner, 1);
  const admin = await portalCase(p, 'admin', 8902, TENANTS.owner, TENANTS.partner, 1, { crossStatus: 200, admin: true });
  const noAccessWorker = await start('portal', { as: 'none', port: 8900, vars: { REPORT_AS_OF } }, p);
  let noAccess;
  try { noAccess = await fetch('http://127.0.0.1:8900/'); assert.equal(noAccess.status, 403); } finally { await stop(noAccessWorker); }
  const wrongAudWorker = await start('portal', { as: 'wrong-aud', port: 8901, vars: { REPORT_AS_OF } }, p);
  let wrongAud;
  try { wrongAud = await fetch(`http://127.0.0.1:8901/t/${TENANTS.owner}/`); assert.equal(wrongAud.status, 403); } finally { await stop(wrongAudWorker); }

  console.log(JSON.stringify({
    ok: true,
    runtime: 'wrangler-local-workerd',
    seeded: seeded.summary.ingest,
    client_events_accepted: 8,
    replay_events_accepted: 0,
    owner,
    partner,
    admin,
    missing_access: noAccess.status,
    wrong_audience: wrongAud.status,
  }, null, 2));
}

main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
