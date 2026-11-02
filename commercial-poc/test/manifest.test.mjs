import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildManifest } from '../src/manifest.mjs';
import { ENTITY_ID_RE } from '../src/ids.mjs';
import { POC_ROOT } from '../src/config.mjs';
import { REPO_ROOT, loadManifest, tenantByKey } from './helpers.mjs';

const config = JSON.parse(readFileSync(join(POC_ROOT, 'seed/pilot-tenants.json'), 'utf8'));
const snapshot = JSON.parse(readFileSync(join(POC_ROOT, config.official_snapshot), 'utf8'));
const build = () => buildManifest({ repoRoot: REPO_ROOT, pocRoot: POC_ROOT, config, snapshot, generatedAt: 'fixed', scanLinks: false });

test('manifest: builder is deterministic and IDs are opaque and stable', () => {
  const a = build(); const b = build();
  assert.deepEqual(a, b);
  for (const coll of ['tenants', 'schools', 'locations', 'destinations', 'campaigns', 'placements']) {
    for (const row of a[coll]) for (const [k, v] of Object.entries(row)) if (k.endsWith('_id') && v) assert.match(v, ENTITY_ID_RE, `${coll}.${k}`);
  }
  for (const t of a.tenants) assert.ok(!t.tenant_id.includes(t.tenant_key), 'tenant id must not embed a name');
});

test('manifest: committed seed/pilot-manifest.json matches current sources (except timestamps and link scan)', () => {
  const committed = loadManifest();
  const fresh = build();
  const strip = (m) => ({ ...m, generated_at: null, conflicts: m.conflicts.filter((c) => c.kind !== 'wwk_link_variant').map(({ id, ...rest }) => rest) });
  assert.deepEqual(strip(fresh), strip(committed));
});

test('manifest: covers exactly the three pilot tenants with $0 pilot pricing', () => {
  const m = loadManifest();
  assert.deepEqual(m.tenants.map((t) => t.tenant_key).sort(), ['jersey-shore', 'manhattan', 'northwest-philadelphia']);
  for (const t of m.tenants) assert.equal(t.pilot_price_cents, 0);
  for (const c of m.campaigns) assert.equal(c.price_cents, 0);
  for (const c of m.campaigns.filter((x) => x.kind === 'sponsored_pilot')) assert.equal(c.disclosure_label, 'Sponsored pilot');
  for (const c of m.campaigns.filter((x) => x.kind === 'organic_baseline')) assert.equal(c.disclosure_label, null);
});

test('manifest: locations with conflicting or no-class notices are held and never placed', () => {
  const m = loadManifest();
  const held = m.locations.filter((l) => l.status !== 'eligible_fixture').map((l) => l.display_name).sort();
  assert.deepEqual(held, ['Boys & Girls Club - Asbury Park', 'East Village', 'LA Fitness - Andorra']);
  const heldIds = new Set(m.locations.filter((l) => l.status !== 'eligible_fixture').map((l) => l.location_id));
  for (const p of m.placements) assert.ok(!heldIds.has(p.featured_location_id));
  for (const d of m.destinations) assert.ok(!heldIds.has(d.location_id));
  assert.equal(m.locations.find((l) => l.display_name === 'East Village').address_display, null);
  assert.deepEqual(m.skipped_placements.map((s) => s.slot_key).sort(), ['js-guide-asbury-park', 'nwp-guide-andorra']);
});

test('manifest: conflicts are reported, not resolved', () => {
  const m = loadManifest();
  const kinds = new Set(m.conflicts.map((c) => c.kind));
  for (const k of ['official_location_missing_from_wwk', 'official_no_classes_notice', 'official_address_conflict', 'address_text_differs', 'inventory_gap']) assert.ok(kinds.has(k), k);
  for (const c of m.conflicts) assert.equal(c.resolution, 'reported_not_resolved');
});

test('manifest: placement pages exist in the repo and sponsored links are rel=sponsored', () => {
  const m = loadManifest();
  for (const pp of m.placement_pages) {
    assert.ok(existsSync(join(REPO_ROOT, pp.source_file)), pp.source_file);
    assert.ok(!pp.page_path.includes('?') && !pp.page_path.includes('#'));
  }
  for (const p of m.placements.filter((x) => x.kind === 'sponsored_card')) assert.equal(p.link_rel, 'sponsored noopener');
  for (const d of m.destinations) assert.ok(m.allowed_destination_hosts.includes(d.host), d.url);
});

test('manifest: per-tenant placement shape', () => {
  const m = loadManifest();
  const count = (key, kind) => m.placements.filter((p) => p.tenant_id === tenantByKey(m, key).tenant_id && p.kind === kind).length;
  assert.equal(count('northwest-philadelphia', 'sponsored_card'), 3);
  assert.equal(count('jersey-shore', 'sponsored_card'), 4);
  assert.equal(count('manhattan', 'sponsored_card'), 1);
  assert.equal(count('northwest-philadelphia', 'organic_listing'), 1);
  assert.equal(count('jersey-shore', 'organic_listing'), 3);
  assert.equal(count('manhattan', 'organic_listing'), 1);
});

test('manifest: contains no phone numbers or email addresses', () => {
  const text = readFileSync(join(POC_ROOT, 'seed/pilot-manifest.json'), 'utf8');
  assert.doesNotMatch(text, /[^\s@"]+@[^\s@"]+\.[a-z]{2,}/i);
  assert.doesNotMatch(text, /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/);
});
