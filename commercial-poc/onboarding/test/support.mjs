import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { stableId } from '../../src/ids.mjs';
import { createRepo, ONBOARDING_ROOT, POC_ROOT } from '../src/repo.mjs';

export const PILOT_PATH = join(ONBOARDING_ROOT, 'definitions/bss-pilot-2026.sponsor.json');
export const TEMPLATE_PATH = join(ONBOARDING_ROOT, 'definitions/template.sponsor.json');
export const loadPilot = () => JSON.parse(readFileSync(PILOT_PATH, 'utf8'));
export const loadManifest = () => JSON.parse(readFileSync(join(POC_ROOT, 'seed/pilot-manifest.json'), 'utf8'));
export const clone = (x) => JSON.parse(JSON.stringify(x));

let shared = null;
/** One real-repo reader per test process (it caches file reads). */
export const realRepo = () => (shared ??= createRepo());
export const realCtx = () => ({ repo: realRepo(), existingManifest: loadManifest(), others: [] });

// ---------- hermetic stub repo + synthetic sponsor (no real school, no real person) ----------
export const STUB_HOST = 'example-swim.com';
const TERR = `https://${STUB_HOST}/testville/`;
const LOC = `${TERR}location/testville-pool/`;
const SNAP = 'commercial-poc/seed/sources/test-snapshot.json';
const ADDRESS = '10 Main Street, Testville, NJ 08000';
export const ANCHOR = '<section id="local-guide-end"></section>';

const paragraph = 'Testville families can compare lesson formats, pool temperatures and class sizes before they enroll a beginner swimmer in a local program.';
export function stubPage({ words = 60, place = 'Testville', anchor = true, extra = '' } = {}) {
  const body = Array.from({ length: Math.ceil(words / 20) }, () => `<p>${paragraph.replace(/Testville/g, place)}</p>`).join('\n');
  return ['<!doctype html>', '<html><head><title>Swim Lessons in Testville | WaterWiseKids</title>',
    '<link rel="canonical" href="https://www.waterwisekids.com/swim-lessons/testville-nj.html">', '</head><body>', '<h1>Swim Lessons in Testville</h1>', body,
    ...(anchor ? [ANCHOR] : []), extra, '</body></html>', ''].join('\n');
}

export function stubRepo(files) {
  const map = new Map(Object.entries(files));
  return {
    root: '/nonexistent-stub-repo',
    read: (rel) => (map.has(rel) ? map.get(rel) : null),
    safeResolve: (rel) => (rel.includes('..') ? null : { abs: rel, exists: map.has(rel) }),
    listHtml: () => [...map.keys()].filter((k) => k.endsWith('.html')).sort(),
  };
}

export function stubFiles(overrides = {}) {
  return {
    'swim-lessons/testville-nj.html': stubPage({ words: 600 }),
    'sitemap.xml': '<urlset><url><loc>https://www.waterwisekids.com/swim-lessons/testville-nj.html</loc></url></urlset>',
    [SNAP]: JSON.stringify({ observed_on: '2026-11-01', territories: [{ territory_key: 'testville', territory_url: TERR, school_name: 'Example Swim Testville',
      locations: [{ venue: 'Testville Pool', address: ADDRESS, location_url: LOC, listed_on_territory_page: true, no_classes_notice: false }] }] }),
    ...overrides,
  };
}

export function stubDef() {
  const key = 'example-testville-2027';
  const d = {
    schema: 'wwk.sponsor-definition', schema_version: 1, definition_key: key, prepared_on: '2026-11-02',
    site: { host: 'www.waterwisekids.com', collector_url: 'https://events.waterwisekids.com/v1/collect', component_version: 'p2r2' },
    destination_hosts: [STUB_HOST],
    markets: [{ market_key: 'nj-testville', state: 'NJ', label: 'Testville', place_names: ['Testville'] }],
    page_inventory: [{ page_path: '/swim-lessons/testville-nj.html', market_key: 'nj-testville', page_status: 'existing' }],
    tenants: [{
      tenant_key: 'testville', tenant_id: stableId('ten', TERR), display_name: 'Example Swim Testville', timezone: 'America/New_York',
      school: { school_id: stableId('sch', TERR), display_name: 'Example Swim Testville', territory_url: TERR },
      locations: [{ location_key: 'testville-pool', location_id: stableId('loc', LOC), display_name: 'Testville Pool', market_key: 'nj-testville', official_url: LOC, address_display: ADDRESS,
        facts: [
          { fact_key: 'address', value: ADDRESS, source: 'official_snapshot', source_ref: SNAP, source_url: LOC, observed_on: '2026-11-01' },
          { fact_key: 'location_page', value: LOC, source: 'official_snapshot', source_ref: SNAP, source_url: LOC, observed_on: '2026-11-01' }] }],
      destinations: [{ destination_id: stableId('dst', TERR), kind: 'territory', location_key: null }, { destination_id: stableId('dst', LOC), kind: 'location', location_key: 'testville-pool' }],
      campaign: { campaign_key: 'sponsored-pilot-2027', campaign_id: stableId('cmp', `${TERR}#sponsored-pilot-2027`), kind: 'sponsored_pilot', display_name: 'Sponsored pilot', disclosure_label: 'Sponsored pilot',
        disclosure_text: 'No-fee pilot placement. Sponsorship does not change directory order or editorial content.', starts_on: '2027-01-04', ends_on: '2027-03-31', price_cents: 0, currency: 'USD' },
      placements: [{ slot_key: 'tv-guide-testville', placement_id: stableId('plc', `${TERR}#tv-guide-testville`), page_path: '/swim-lessons/testville-nj.html', market_key: 'nj-testville',
        variant: 'featured_location', location_keys: ['testville-pool'], indent: 0, anchor: { type: 'insert_after', text: ANCHOR } }],
    }],
    portal: { users: [{ invite_ref: 'testville-owner', display_label: 'Sponsor owner (Example Swim Testville)', memberships: [{ tenant_key: 'testville', role: 'owner' }] }] },
    approvals: ['sponsor_terms', 'source_verification', 'editorial_review', 'preview_qa', 'portal_access', 'activation'].map((gate) => ({ gate, status: 'pending', recorded_on: null, evidence_ref: null })),
  };
  return d;
}

export const stubCtx = (files = stubFiles(), extra = {}) => ({ repo: stubRepo(files), existingManifest: loadManifest(), others: [], ...extra });
export const codes = (r) => r.errors.map((e) => e.code);
