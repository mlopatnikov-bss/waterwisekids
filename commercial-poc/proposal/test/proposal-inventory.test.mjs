// Inventory, card markup and commercial/content rules.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildProposal, PROPOSAL_ROOT, REQUIRED_PAGES } from '../src/build.mjs';
import { UTM_KEYS } from '../src/utm.mjs';
import { RELEASE_BLOCKERS } from '../src/dispositions.mjs';

const b = buildProposal();
const m = b.manifest;
const inventory = JSON.parse(readFileSync(join(PROPOSAL_ROOT, 'inventory.json'), 'utf8'));
const inventoryMd = readFileSync(join(PROPOSAL_ROOT, 'INVENTORY.md'), 'utf8');
const anchorsOf = (html) => [...html.matchAll(/<a ([^>]*)>/g)].map((x) => Object.fromEntries([...x[1].matchAll(/([a-z-]+)="([^"]*)"/g)].map((y) => [y[1], y[2].replace(/&amp;/g, '&')])));
const visibleText = (html) => html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

test('inventory covers exactly the eight brief pages, in the committed inventory.json too', () => {
  assert.deepEqual(b.pages.map((p) => p.page_path).sort(), [...REQUIRED_PAGES].sort());
  assert.deepEqual(inventory.pages.map((p) => p.page_path).sort(), [...REQUIRED_PAGES].sort());
  assert.equal(inventory.status, 'PROPOSAL ONLY - not applied to any public file');
});

test('every proposed ID, page and destination exists in the manifest and is owned by the same tenant', () => {
  for (const p of b.pages) {
    const t = m.tenants.find((x) => x.tenant_id === p.ids.tenant_id);
    assert.ok(t, p.page_path);
    assert.ok(m.schools.find((s) => s.school_id === p.ids.school_id && s.tenant_id === t.tenant_id));
    const c = m.campaigns.find((x) => x.campaign_id === p.ids.campaign_id);
    assert.equal(c.tenant_id, t.tenant_id); assert.equal(c.kind, 'sponsored_pilot'); assert.equal(c.price_cents, 0); assert.equal(c.disclosure_label, 'Sponsored pilot');
    const pl = m.placements.find((x) => x.placement_id === p.ids.placement_id);
    assert.equal(pl.tenant_id, t.tenant_id); assert.equal(pl.kind, 'sponsored_card'); assert.equal(pl.campaign_id, c.campaign_id);
    assert.ok(m.placement_pages.find((x) => x.placement_id === pl.placement_id && x.page_path === p.page_path && x.tenant_id === t.tenant_id));
    assert.equal(p.ids.location_id, pl.featured_location_id);
    for (const a of anchorsOf(p.card_html)) {
      const d = m.destinations.find((x) => x.destination_id === a['data-wwk-destination']);
      assert.ok(d && d.tenant_id === t.tenant_id, a['data-wwk-destination']);
      assert.ok(m.placement_destinations.find((x) => x.placement_id === pl.placement_id && x.destination_id === d.destination_id), 'destination allowlisted for this placement');
      assert.equal(a['data-wwk-location'] ?? null, d.location_id);
      assert.ok(m.allowed_destination_hosts.includes(new URL(a.href).hostname));
    }
    const asideAttrs = Object.fromEntries([...p.card_html.match(/<aside ([^>]*)>/)[1].matchAll(/([a-z-]+)="([^"]*)"/g)].map((y) => [y[1], y[2]]));
    assert.equal(asideAttrs['data-wwk-tenant'], t.tenant_id); assert.equal(asideAttrs['data-wwk-school'], p.ids.school_id);
    assert.equal(asideAttrs['data-wwk-campaign'], c.campaign_id); assert.equal(asideAttrs['data-wwk-placement'], pl.placement_id);
    assert.equal(asideAttrs['data-wwk-page-path'], p.page_path); assert.equal(asideAttrs['data-wwk-location'] ?? null, pl.featured_location_id);
  }
});

test('every sponsored anchor is inside a labeled card and carries rel="sponsored noopener", an https official URL and exact UTMs', () => {
  let n = 0;
  for (const p of b.pages) {
    assert.match(p.card_html, /<p class="wwk-sponsored__label" id="[^"]+-label">Sponsored pilot<\/p>/);
    assert.ok(visibleText(p.card_html).startsWith('Sponsored pilot '), 'label is the first visible text');
    const labelledby = p.card_html.match(/aria-labelledby="([^"]+)"/)[1].split(' ');
    for (const id of labelledby) assert.match(p.card_html, new RegExp(`id="${id}"`));
    for (const a of anchorsOf(p.card_html)) {
      n += 1;
      assert.equal(a.rel, 'sponsored noopener');
      assert.equal(a.target, undefined, 'same-tab link; no target');
      assert.equal(a.onclick, undefined);
      const u = new URL(a.href);
      assert.equal(u.protocol, 'https:'); assert.equal(u.hostname, 'britishswimschool.com'); assert.equal(u.hash, '');
      assert.deepEqual([...u.searchParams.keys()], UTM_KEYS);
      assert.equal(u.searchParams.get('utm_source'), 'waterwisekids');
      assert.equal(u.searchParams.get('utm_medium'), 'sponsored_pilot');
      assert.equal(u.searchParams.get('utm_campaign'), p.ids.campaign_id);
      assert.equal(u.searchParams.get('utm_content'), p.ids.placement_id);
      u.search = '';
      assert.equal(u.toString(), m.destinations.find((d) => d.destination_id === a['data-wwk-destination']).url, 'path is the official listed URL');
      assert.doesNotMatch(a.href, /page_view|event_id|[0-9a-f]{8}-[0-9a-f]{4}-/, 'no person or page-view id in URLs');
    }
  }
  assert.equal(n, b.pages.reduce((s, p) => s + p.destinations.length, 0));
});

test('no held location is promoted, named or linked anywhere in the proposal', () => {
  const held = m.locations.filter((l) => l.status !== 'eligible_fixture');
  assert.deepEqual(held.map((l) => l.display_name).sort(), ['Boys & Girls Club - Asbury Park', 'East Village', 'LA Fitness - Andorra']);
  // Everything the proposal ADDS: cards, added (+) diff lines and the asset files. Unchanged context lines are pre-existing source.
  const added = (d) => d.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).join('\n');
  const everything = [...b.pages.map((p) => p.card_html + added(p.diff)), ...b.assets.map((a) => a.diff)].join('\n');
  for (const l of held) {
    assert.equal(everything.includes(l.location_id), false, l.location_id);
    assert.equal(everything.includes(new URL(l.official_url).pathname), false, l.official_url);
    for (const word of l.display_name.split(/[^A-Za-z]+/).filter((w) => w.length > 4 && !['Fitness', 'Club', 'Girls'].includes(w))) {
      assert.equal(everything.includes(word), false, `${word} (${l.display_name})`);
    }
  }
  for (const s of m.skipped_placements) assert.equal(b.pages.some((p) => p.page_path === s.page_path), false, s.page_path);
});

test('card copy makes no unsourced claims: no ratings, reviews, prices, guarantees or availability promises', () => {
  const banned = /★|☆|rating|review|\$|price is|free|guarantee|best|top[- ]rated|#1|number one|award|certified|trusted|proven|results|available now|spots|enroll today|limited/i;
  for (const p of b.pages) {
    const text = visibleText(p.card_html);
    assert.doesNotMatch(text.replace('Check current schedules, pricing and enrollment directly with the school.', ''), banned, p.page_path);
    assert.equal(p.card_html.includes('style='), false, 'no inline styles');
    assert.equal(p.card_html.includes('school-card'), false, 'not styled as a directory listing');
    assert.equal(p.card_html.includes('featured-school'), false, 'not styled as the existing Featured School block');
  }
});

test('works without JavaScript: plain absolute links, nothing hidden, no JS-only controls', () => {
  const css = readFileSync(join(PROPOSAL_ROOT, 'component/wwk-sponsored.css'), 'utf8');
  assert.doesNotMatch(css, /display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0[;\s]/);
  for (const p of b.pages) {
    assert.doesNotMatch(p.card_html, /\shidden[\s>=]|javascript:|href="#|<button|onclick|role="button"/);
    for (const a of anchorsOf(p.card_html)) assert.match(a.href, /^https:\/\//);
    assert.match(p.card_html, /<script src="\/assets\/js\/wwk-sponsored\.js\?v=p2r2" defer><\/script>/);
    assert.doesNotMatch(p.card_html, /data-wwk-collector/, 'tracking ships inert until Phase 3 sets a reviewed collector');
  }
});

test('INVENTORY.md keeps every release blocker and source conflict visible, and records copy, IDs and dispositions per page', () => {
  for (const rb of RELEASE_BLOCKERS) assert.ok(inventoryMd.includes(`| ${rb.id} |`), rb.id);
  for (const c of m.conflicts) assert.ok(inventoryMd.includes(c.id), c.id);
  for (const p of b.pages) {
    assert.ok(inventoryMd.includes(`\`${p.page_path}\``));
    for (const id of [p.ids.tenant_id, p.ids.school_id, p.ids.campaign_id, p.ids.placement_id]) assert.ok(inventoryMd.includes(id));
    for (const d of p.destinations) assert.ok(inventoryMd.includes(d.destination_id));
    assert.ok(inventoryMd.includes(p.source_sha256));
  }
  assert.match(inventoryMd, /RB-1 \| resolved by proposal[\s\S]*Featured School/);
  for (const id of ['P3-1', 'P3-2', 'P3-3', 'P3-4']) assert.ok(inventoryMd.includes(`| ${id} |`), id);
  for (const p of b.pages) for (const e of [...p.audit.edits, ...p.audit.kept]) assert.ok(inventoryMd.includes(`| ${e.id} |`), e.id);
});
