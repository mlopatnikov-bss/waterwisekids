import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../src/db.mjs';
import { loadManifest as loadIntoDb } from '../src/registry.mjs';
import { runQuality } from '../src/quality.mjs';
import { createAuth } from '../src/portal/auth.mjs';
import { createPortalHandler } from '../src/portal/server.mjs';
import { seeded, loadManifest, tenantByKey, listen, demoLogin, demoUser, AS_OF } from './helpers.mjs';

const manifest = loadManifest();
const JS = tenantByKey(manifest, 'jersey-shore');
const DAY = '2026-10-20';
const sponsored = manifest.placements.find((p) => p.tenant_id === JS.tenant_id && p.kind === 'sponsored_card');
const organic = manifest.placements.find((p) => p.tenant_id === JS.tenant_id && p.kind === 'organic_listing');
const pageOf = (p) => manifest.placement_pages.find((pp) => pp.placement_id === p.placement_id).page_path;
const destOf = (p) => manifest.placement_destinations.find((pd) => pd.placement_id === p.placement_id).destination_id;

/** A database whose rollups are injected directly (bypassing the collector) to test the check itself. */
function injected(rows) {
  const db = openDb(':memory:');
  loadIntoDb(db, manifest, { at: AS_OF });
  const ins = db.prepare(`INSERT INTO daily_metrics (metric_date, tenant_id, campaign_id, placement_id, location_key, page_path, destination_key, metric, value, computed_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`);
  for (const [p, metric, value] of rows) {
    ins.run(DAY, JS.tenant_id, p.campaign_id, p.placement_id, '_none', pageOf(p), metric === 'outbound_click' ? destOf(p) : '_none', metric, value, AS_OF);
  }
  return db;
}
const funnel = (db) => runQuality(db, { tenantId: JS.tenant_id, asOf: AS_OF, from: DAY, to: DAY, record: false }).checks.find((c) => c.check === 'funnel_integrity');

test('funnel integrity: sponsored-card outbound clicks above sponsored-card clicks raise a warning', () => {
  const db = injected([
    [sponsored, 'eligible_view', 10], [sponsored, 'viewable_impression', 6], [sponsored, 'sponsored_click', 2], [sponsored, 'outbound_click', 3],
  ]);
  const f = funnel(db);
  assert.equal(f.severity, 'warn');
  assert.deepEqual(f.by_rule, { viewable_exceeds_eligible: 0, sponsored_click_exceeds_viewable: 0, sponsored_outbound_exceeds_sponsored_click: 1 });
  assert.equal(f.violations.length, 1);
  assert.deepEqual(f.violations[0], { rule: 'sponsored_outbound_exceeds_sponsored_click', date: DAY, placement_id: sponsored.placement_id, kind: 'sponsored_card',
    eligible_view: 10, viewable_impression: 6, sponsored_click: 2, outbound_click: 3 });
  assert.match(f.message, /1 with more sponsored-card clicks to the official site than sponsored-card clicks/);
});

test('funnel integrity: ordinary-listing outbound clicks are excluded from the sponsored comparison', () => {
  const db = injected([
    [organic, 'eligible_view', 10], [organic, 'viewable_impression', 6], [organic, 'outbound_click', 4],
    [sponsored, 'eligible_view', 10], [sponsored, 'viewable_impression', 6], [sponsored, 'sponsored_click', 2], [sponsored, 'outbound_click', 2],
  ]);
  const f = funnel(db);
  assert.equal(f.severity, 'ok', 'listing has 4 outbound with 0 card clicks; sponsored outbound == clicks is allowed');
  assert.equal(f.by_rule.sponsored_outbound_exceeds_sponsored_click, 0);
});

test('funnel integrity: the earlier two rules still fire, and each violation is attributed to its rule', () => {
  const db = injected([
    [sponsored, 'eligible_view', 5], [sponsored, 'viewable_impression', 6], [sponsored, 'sponsored_click', 7], [sponsored, 'outbound_click', 9],
  ]);
  const f = funnel(db);
  assert.equal(f.severity, 'warn');
  assert.equal(f.value, 1, 'one placement-day');
  assert.deepEqual(f.by_rule, { viewable_exceeds_eligible: 1, sponsored_click_exceeds_viewable: 1, sponsored_outbound_exceeds_sponsored_click: 1 });
});

test('funnel integrity: the injected violation is visible in the portal data-status panel', async () => {
  const db = injected([
    [sponsored, 'eligible_view', 10], [sponsored, 'viewable_impression', 6], [sponsored, 'sponsored_click', 2], [sponsored, 'outbound_click', 3],
  ]);
  const srv = await listen(createPortalHandler({ db, auth: createAuth({ mode: 'demo', db }), asOf: AS_OF, log: () => {} }));
  try {
    const { cookie } = await demoLogin(srv.base, demoUser(manifest, 'demo-owner-nwp-js').user_id);
    const body = await (await fetch(`${srv.base}/t/${JS.tenant_id}/?from=${DAY}&to=${DAY}`, { headers: { Cookie: cookie } })).text();
    assert.match(body, /<span class="sev sev-warn">Warning<\/span> 1 placement-day\(s\) fail funnel integrity: 1 with more sponsored-card clicks to the official site than sponsored-card clicks\./);
  } finally { await srv.close(); }
});

test('funnel integrity: the seeded fixture passes all three rules for every tenant', () => {
  const { quality, manifest: m } = seeded();
  for (const t of m.tenants) {
    const f = quality[t.tenant_id].checks.find((c) => c.check === 'funnel_integrity');
    assert.equal(f.severity, 'ok', t.tenant_key);
    assert.deepEqual(f.by_rule, { viewable_exceeds_eligible: 0, sponsored_click_exceeds_viewable: 0, sponsored_outbound_exceeds_sponsored_click: 0 });
  }
});
