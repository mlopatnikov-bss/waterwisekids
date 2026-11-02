import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../src/db.mjs';
import { loadManifest as loadIntoDb, buildRegistry } from '../src/registry.mjs';
import { validateEvent, checkShape } from '../src/events.mjs';
import { loadManifest, validEvent, tenantByKey } from './helpers.mjs';

const manifest = loadManifest();
const db = openDb(':memory:');
loadIntoDb(db, manifest, { at: '2026-11-02T14:00:00.000Z' });
const registry = buildRegistry(db);
const RECEIVED = Date.parse('2026-10-20T15:01:00.000Z');
const check = (payload) => validateEvent(payload, registry, { receivedAtMs: RECEIVED });

test('events: a well-formed event for each type is accepted', () => {
  for (const type of ['eligible_view', 'viewable_impression', 'sponsored_click', 'outbound_click']) {
    const r = check(validEvent(manifest, 'jersey-shore', {}, { type }));
    assert.equal(r.ok, true, `${type}: ${r.reason}`);
  }
});

test('events: stored form drops seconds and keeps no host, query, or raw timestamp', () => {
  const r = check(validEvent(manifest, 'manhattan', { occurred_at: '2026-10-20T14:59:47.123Z' }));
  assert.equal(r.ok, true);
  assert.equal(r.event.occurred_minute, '2026-10-20T14:59:00Z');
  assert.ok(!('site_host' in r.event));
  assert.equal(r.event.local_date, '2026-10-20');
});

const PII_CASES = [
  ['email field', { email: 'mom@example.com' }, 'pii_field'],
  ['phone field', { phone: '732-555-0100' }, 'pii_field'],
  ['ip field', { ip: '203.0.113.9' }, 'pii_field'],
  ['user agent field', { user_agent: 'Mozilla/5.0' }, 'pii_field'],
  ['child name field', { child_name: 'Sam' }, 'pii_field'],
  ['student field', { student: 'x' }, 'pii_field'],
  ['fingerprint field', { fingerprint: 'abc' }, 'pii_field'],
  ['device id field', { device_id: 'abc' }, 'pii_field'],
  ['zip field', { zip: '07731' }, 'pii_field'],
  ['email in page_path', { page_path: '/swim-lessons/jane@example.com' }, 'pii_value'],
  ['phone in page_path', { page_path: '/call-732-555-0100' }, 'pii_value'],
  ['ipv4 in site_host', { site_host: '198.51.100.7' }, 'pii_value'],
  ['ipv6 in site_host', { site_host: '2001:db8:85a3:0:0:8a2e:370:7334' }, 'pii_value'],
  ['long digit run', { page_path: '/x/4111111111111111' }, 'pii_value'],
  ['email nested in viewability', { type: 'viewable_impression', viewability: { visible_ratio: 0.9, visible_ms: 1200, note: 'a@b.co' } }, 'pii_value'],
  ['query string', { page_path: '/swim-lessons/howell-nj.html?utm_source=x' }, 'page_path_query_or_fragment'],
  ['fragment', { page_path: '/swim-lessons/howell-nj.html#top' }, 'page_path_query_or_fragment'],
];
for (const [name, patch, reason] of PII_CASES) {
  test(`privacy: rejects ${name} -> ${reason}`, () => {
    const r = check({ ...validEvent(manifest, 'jersey-shore'), ...patch });
    assert.equal(r.ok, false);
    assert.equal(r.reason, reason);
  });
}

const MALFORMED = [
  ['non-object', 'hello', 'not_an_object'],
  ['array', [], 'not_an_object'],
  ['null', null, 'not_an_object'],
  ['unknown field', { extra: 1 }, 'unknown_field'],
  ['__proto__ key', JSON.parse('{"__proto__": {"x": 1}}'), 'forbidden_key'],
  ['wrong schema version', { v: 2 }, 'unsupported_schema_version'],
  ['bad event id', { event_id: 'abc' }, 'invalid_event_id'],
  ['bad type', { type: 'purchase' }, 'invalid_event_type'],
  ['non-UTC timestamp', { occurred_at: '2026-10-20T10:00:00-05:00' }, 'invalid_timestamp'],
  ['uppercase path', { page_path: '/Swim-Lessons/X.html' }, 'invalid_page_path'],
  ['path traversal', { page_path: '/a/../b' }, 'invalid_page_path'],
  ['bad tenant id', { tenant_id: 'ten_xyz' }, 'invalid_id'],
  ['display name as tenant', { tenant_id: 'British Swim School of Manhattan' }, 'invalid_id'],
  ['bad referrer category', { referrer_category: 'google.com' }, 'invalid_referrer_category'],
  ['bad device class', { device_class: 'iPhone 15' }, 'invalid_device_class'],
  ['viewability on view', { viewability: { visible_ratio: 1, visible_ms: 2000 } }, 'unexpected_viewability'],
  ['destination on view', { destination_id: 'dst_0000000000000000' }, 'unexpected_destination'],
];
for (const [name, patch, reason] of MALFORMED) {
  test(`schema: rejects ${name} -> ${reason}`, () => {
    const base = validEvent(manifest, 'jersey-shore');
    const payload = patch !== null && typeof patch === 'object' && !Array.isArray(patch) && Object.getPrototypeOf(patch) === Object.prototype
      ? Object.assign(Object.create(null), base, patch) : patch;
    const r = check(payload && typeof payload === 'object' && !Array.isArray(payload) ? { ...payload } : payload);
    assert.equal(r.ok, false);
    assert.equal(r.reason, reason);
  });
}

test('schema: missing required field', () => {
  const p = validEvent(manifest, 'jersey-shore');
  delete p.page_view_id;
  assert.equal(check(p).reason, 'missing_field');
});

test('schema: viewability below IAB threshold is rejected', () => {
  assert.equal(check(validEvent(manifest, 'jersey-shore', { viewability: { visible_ratio: 0.3, visible_ms: 1500 } }, { type: 'viewable_impression' })).reason, 'below_viewability_threshold');
  assert.equal(check(validEvent(manifest, 'jersey-shore', { viewability: { visible_ratio: 0.9, visible_ms: 400 } }, { type: 'viewable_impression' })).reason, 'below_viewability_threshold');
  assert.equal(check(validEvent(manifest, 'jersey-shore', { type: 'viewable_impression' })).reason, 'missing_viewability');
});

test('registry: rejects unknown tenants, campaigns, placements, hosts and destinations', () => {
  const zero = (p) => `${p}_0000000000000000`;
  assert.equal(check(validEvent(manifest, 'manhattan', { tenant_id: zero('ten') })).reason, 'unknown_tenant');
  assert.equal(check(validEvent(manifest, 'manhattan', { campaign_id: zero('cmp') })).reason, 'unknown_campaign');
  assert.equal(check(validEvent(manifest, 'manhattan', { placement_id: zero('plc') })).reason, 'unknown_placement');
  assert.equal(check(validEvent(manifest, 'manhattan', { school_id: zero('sch') })).reason, 'unknown_school');
  assert.equal(check(validEvent(manifest, 'manhattan', { site_host: 'waterwisekids.com.evil.example' })).reason, 'host_not_allowed');
  assert.equal(check(validEvent(manifest, 'manhattan', { destination_id: zero('dst') }, { type: 'outbound_click' })).reason, 'unknown_destination');
  assert.equal(check(validEvent(manifest, 'manhattan', { page_path: '/swim-lessons/howell-nj.html' })).reason, 'page_not_allowed_for_placement');
});

test('registry: rejects every cross-tenant reference', () => {
  const js = tenantByKey(manifest, 'jersey-shore');
  const man = tenantByKey(manifest, 'manhattan');
  const jsCampaign = manifest.campaigns.find((c) => c.tenant_id === js.tenant_id && c.kind === 'sponsored_pilot');
  const jsPlacement = manifest.placements.find((p) => p.tenant_id === js.tenant_id && p.kind === 'sponsored_card');
  const jsSchool = manifest.schools.find((s) => s.tenant_id === js.tenant_id);
  const jsDest = manifest.destinations.find((d) => d.tenant_id === js.tenant_id);
  const jsLoc = manifest.locations.find((l) => l.tenant_id === js.tenant_id && l.status === 'eligible_fixture');
  assert.equal(check(validEvent(manifest, 'manhattan', { school_id: jsSchool.school_id })).reason, 'cross_tenant_reference');
  assert.equal(check(validEvent(manifest, 'manhattan', { campaign_id: jsCampaign.campaign_id })).reason, 'cross_tenant_reference');
  assert.equal(check(validEvent(manifest, 'manhattan', { placement_id: jsPlacement.placement_id })).reason, 'cross_tenant_reference');
  assert.equal(check(validEvent(manifest, 'manhattan', { destination_id: jsDest.destination_id }, { type: 'outbound_click' })).reason, 'cross_tenant_reference');
  assert.equal(check(validEvent(manifest, 'manhattan', { location_id: jsLoc.location_id })).reason, 'location_mismatch');
  assert.equal(man.tenant_id === js.tenant_id, false);
});

test('registry: sponsored_click is impossible on an ordinary listing; outbound must be an allowed destination', () => {
  const js = tenantByKey(manifest, 'jersey-shore');
  const org = manifest.placements.find((p) => p.tenant_id === js.tenant_id && p.kind === 'organic_listing');
  const camp = manifest.campaigns.find((c) => c.campaign_id === org.campaign_id);
  const page = manifest.placement_pages.find((pp) => pp.placement_id === org.placement_id).page_path;
  const r = check(validEvent(manifest, 'jersey-shore', { placement_id: org.placement_id, campaign_id: camp.campaign_id, page_path: page, type: 'sponsored_click' }));
  assert.equal(r.reason, 'sponsored_click_on_organic_listing');
  const otherDest = manifest.destinations.find((d) => d.tenant_id === js.tenant_id && !manifest.placement_destinations.some((pd) => pd.placement_id === org.placement_id && pd.destination_id === d.destination_id));
  const r2 = check(validEvent(manifest, 'jersey-shore', { placement_id: org.placement_id, campaign_id: camp.campaign_id, page_path: page, destination_id: otherDest.destination_id }, { type: 'outbound_click' }));
  assert.equal(r2.reason, 'destination_not_allowed_for_placement');
});

test('time: rejects future, too-late and out-of-campaign events', () => {
  assert.equal(check(validEvent(manifest, 'jersey-shore', { occurred_at: '2026-10-20T15:30:00.000Z' })).reason, 'timestamp_in_future');
  assert.equal(check(validEvent(manifest, 'jersey-shore', { occurred_at: '2026-10-16T15:00:00.000Z' })).reason, 'timestamp_too_old');
  const early = validateEvent(validEvent(manifest, 'jersey-shore', { occurred_at: '2026-08-20T15:00:00.000Z' }), registry, { receivedAtMs: Date.parse('2026-08-20T15:01:00.000Z') });
  assert.equal(early.reason, 'outside_campaign_window');
});

test('shape check never echoes values in its result', () => {
  const r = checkShape({ email: 'secret@example.com' });
  assert.equal(JSON.stringify(r).includes('secret'), false);
});
