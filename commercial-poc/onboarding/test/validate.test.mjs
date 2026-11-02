import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { stableId } from '../../src/ids.mjs';
import { validateDefinition } from '../src/validate.mjs';
import { DEFINITION_SCHEMA } from '../src/schema.mjs';
import { ONBOARDING_ROOT } from '../src/repo.mjs';
import { clone, codes, loadPilot, realCtx, stubCtx, stubDef, stubFiles, stubPage, TEMPLATE_PATH } from './support.mjs';

const ok = (def, ctx = stubCtx()) => { const r = validateDefinition(def, ctx); assert.deepEqual(r.errors, []); return r; };
const fails = (def, code, ctx = stubCtx()) => {
  const r = validateDefinition(def, ctx);
  assert.equal(r.ok, false, `expected ${code}`);
  assert.ok(codes(r).includes(code), `expected ${code}, got ${JSON.stringify(r.errors)}`);
  return r;
};
const mut = (fn) => { const d = stubDef(); fn(d, d.tenants[0]); return d; };

test('baseline: pilot definition and synthetic stub both validate', () => {
  ok(loadPilot(), realCtx());
  ok(stubDef());
});

test('template is complete but refused until every placeholder is filled', () => {
  const t = JSON.parse(readFileSync(TEMPLATE_PATH, 'utf8'));
  const r = validateDefinition(t, stubCtx());
  assert.ok(codes(r).every((c) => c === 'template_placeholder'), JSON.stringify(r.errors));
  assert.ok(r.errors.length >= 5);
});

test('strict shape: unknown fields, missing fields, wrong version', () => {
  fails(mut((d) => { d.extra = 1; }), 'unknown_field');
  fails(mut((d, t) => { t.campaign.budget = 5; }), 'unknown_field');
  fails(mut((d, t) => { delete t.campaign.disclosure_text; }), 'missing_field');
  fails(mut((d) => { d.schema_version = 2; }), 'invalid_value');
  fails(mut((d) => { d.prepared_on = '2026-02-30'; }), 'invalid_value');
  fails(mut((d) => { d.site.collector_url = 'https://evil.example/collect'; }), 'invalid_value');
});

test('duplicates are rejected', () => {
  fails(mut((d, t) => { t.placements.push({ ...clone(t.placements[0]) }); }), 'duplicate_key');
  fails(mut((d) => { d.destination_hosts.push(d.destination_hosts[0]); }), 'duplicate_key');
  fails(mut((d) => { d.markets.push(clone(d.markets[0])); }), 'duplicate_key');
  fails(mut((d) => { d.portal.users.push(clone(d.portal.users[0])); }), 'duplicate_key');
});

test('bad hosts and URLs are rejected', () => {
  for (const h of ['localhost', '127.0.0.1', 'www.waterwisekids.com', 'not a host']) fails(mut((d) => { d.destination_hosts = [h]; }), 'bad_host');
  fails(mut((d, t) => { t.locations[0].official_url = t.locations[0].official_url.replace('https:', 'http:'); }), 'bad_url');
  fails(mut((d, t) => { t.school.territory_url += '?ref=x'; }), 'bad_url');
  fails(mut((d, t) => { const u = new URL(t.school.territory_url); u.username = 'user'; u.password = 'pw'; t.school.territory_url = u.href; }), 'bad_url');
  fails(mut((d, t) => { t.school.territory_url = 'https://other-host.com/testville/'; }), 'host_not_allowed');
});

test('PII-shaped values and analytics keys are rejected', () => {
  fails(mut((d) => { d.portal.users[0].display_label = 'Owner jane.doe@example.com'; }), 'pii_value');
  fails(mut((d) => { d.portal.users[0].display_label = 'Owner 732-555-0100'; }), 'pii_value');
  fails(mut((d) => { d.portal.users[0].invite_ref = 'owner-parent-contact'; }), 'pii_value');
  fails(mut((d, t) => { t.campaign.display_name = 'Pilot 10.0.0.1'; }), 'pii_value');
});

test('stable IDs must match natural keys', () => {
  fails(mut((d, t) => { t.placements[0].placement_id = stableId('plc', 'something-else'); }), 'id_mismatch');
  fails(mut((d, t) => { t.tenant_id = 'ten_0123456789abcdef'; }), 'id_mismatch');
});

test('missing or weakened disclosure is rejected; paid value needs a migration', () => {
  fails(mut((d, t) => { t.campaign.disclosure_label = 'Featured'; }), 'missing_disclosure');
  fails(mut((d, t) => { t.campaign.disclosure_text = 'No-fee pilot placement.'; }), 'missing_disclosure');
  fails(mut((d, t) => { t.campaign.disclosure_text = 'Sponsorship does not change directory order or editorial content.'; }), 'missing_disclosure');
  fails(mut((d, t) => { t.campaign.price_cents = 50000; }), 'campaign_value_requires_schema_migration');
  fails(mut((d, t) => { t.campaign.ends_on = '2026-12-01'; }), 'invalid_value');
});

test('unsafe paths are rejected', () => {
  for (const p of ['/../etc/passwd.html', '/commercial-poc/onboarding/x.html', '/assets/js/x.html', '/Swim/Upper.html', '/a//b.html', '/x.php']) {
    fails(mut((d, t) => { t.placements[0].page_path = p; d.page_inventory[0].page_path = p; }), 'unsafe_path');
  }
  fails(mut((d, t) => { t.locations[0].facts[0].source_ref = '../../outside.json'; }), 'unsafe_path');
  fails(mut((d, t) => { t.placements[0].page_path = '/swim-lessons/missing.html'; d.page_inventory[0].page_path = '/swim-lessons/missing.html'; }), 'page_not_found');
});

test('thin, irrelevant and new pages are rejected (no page generator)', () => {
  fails(stubDef(), 'thin_content', stubCtx(stubFiles({ 'swim-lessons/testville-nj.html': stubPage({ words: 60 }) })));
  fails(stubDef(), 'irrelevant_page', stubCtx(stubFiles({ 'swim-lessons/testville-nj.html': stubPage({ words: 600, place: 'Elsewhere' }).replace(/Testville/g, 'Elsewhere') })));
  fails(mut((d) => { d.page_inventory[0].page_status = 'proposed_new'; }), 'new_page_not_supported');
  fails(mut((d, t) => { t.placements[0].market_key = 'nj-other'; }), 'market_mismatch');
});

test('a sponsor card cannot count toward page quality', () => {
  const card = `<aside class="wwk-sponsored">${'Testville sponsor words '.repeat(200)}</aside>`;
  fails(stubDef(), 'thin_content', stubCtx(stubFiles({ 'swim-lessons/testville-nj.html': stubPage({ words: 60, extra: card }) })));
});

test('cited facts must match the official snapshot', () => {
  fails(mut((d, t) => { t.locations[0].address_display = '99 Other Rd, Testville, NJ 08000'; }), 'uncited_fact');
  fails(mut((d, t) => { const l = t.locations[0]; l.address_display = '99 Other Rd, Testville, NJ 08000'; l.facts[0].value = l.address_display; }), 'fact_mismatch');
  fails(mut((d, t) => { t.locations[0].display_name = 'Renamed Pool'; }), 'fact_mismatch');
  const files = stubFiles();
  const snap = JSON.parse(files['commercial-poc/seed/sources/test-snapshot.json']);
  snap.territories[0].locations[0].no_classes_notice = true;
  fails(stubDef(), 'location_not_offering', stubCtx({ ...files, 'commercial-poc/seed/sources/test-snapshot.json': JSON.stringify(snap) }));
  fails(stubDef(), 'stale_fact', stubCtx(stubFiles(), { asOf: '2027-06-01' }));
});

test('ownership and tenant isolation', () => {
  // Location page outside the school's territory.
  fails(mut((d, t) => { const u = `https://example-swim.com/other-territory/location/x/`; t.locations[0].official_url = u; }), 'ownership_conflict');
  // Placement on a page already carrying another sponsor's card.
  fails(stubDef(), 'ownership_conflict', stubCtx(stubFiles({ 'swim-lessons/testville-nj.html': stubPage({ words: 600, extra: '<!-- WWK sponsored placement plc_0123456789abcdef (Sponsored pilot) -->' }) })));
  // Portal membership for a tenant outside this definition.
  fails(mut((d) => { d.portal.users[0].memberships.push({ tenant_key: 'jersey-shore', role: 'owner' }); }), 'ownership_conflict');
  // Another definition already claims the page for a different tenant.
  const rival = mut((d, t) => { d.definition_key = 'rival-2027'; t.tenant_key = 'rival'; t.tenant_id = 'ten_aaaaaaaaaaaaaaaa'; t.placements[0].placement_id = 'plc_aaaaaaaaaaaaaaaa'; });
  fails(stubDef(), 'ownership_conflict', stubCtx(stubFiles(), { others: [rival] }));
});

test('pilot: cross-tenant location reference and live-page takeover are refused', () => {
  const d = loadPilot();
  const js = d.tenants.find((t) => t.tenant_key === 'jersey-shore');
  js.placements[1].location_keys = ['la-fitness-cheltenham'];
  fails(d, 'ownership_conflict', realCtx());
  // A new sponsor claiming the live Howell page collides with the existing manifest and the live card.
  const s = mut((x, t) => { t.placements[0].page_path = '/swim-lessons/howell-nj.html'; x.page_inventory[0].page_path = '/swim-lessons/howell-nj.html'; });
  const r = fails(s, 'ownership_conflict', realCtx());
  assert.ok(r.errors.some((e) => /plc_bb4b763cf97d56ee/.test(e.detail)));
});

test('recorded approvals need existing evidence; pending ones carry none', () => {
  fails(mut((d) => { d.approvals[0] = { gate: 'sponsor_terms', status: 'recorded', recorded_on: null, evidence_ref: null }; }), 'approval_incomplete');
  fails(mut((d) => { d.approvals[0] = { gate: 'sponsor_terms', status: 'recorded', recorded_on: '2026-11-02', evidence_ref: 'commercial-poc/nope.md' }; }), 'evidence_missing');
  fails(mut((d) => { d.approvals[1].gate = 'sponsor_terms'; }), 'duplicate_key');
});

test('SCHEMA.md documents every field of the schema', () => {
  const doc = readFileSync(join(ONBOARDING_ROOT, 'SCHEMA.md'), 'utf8');
  const names = new Set();
  const walk = (s) => { if (s.t === 'obj') for (const [k, v] of Object.entries(s.fields)) { names.add(k); walk(v); } else if (s.t === 'arr' || s.t === 'nullable') walk(s.of); };
  walk(DEFINITION_SCHEMA);
  for (const n of names) assert.ok(doc.includes(`\`${n}\``), `SCHEMA.md missing ${n}`);
});
