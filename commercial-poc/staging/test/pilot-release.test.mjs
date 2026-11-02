import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pilotManifest, buildPilotSeedSql, PILOT_START } from '../scripts/build-pilot-seed.mjs';
import { MANIFEST_PATH } from '../scripts/lib/paths.mjs';
import { adaptPage } from '../src/portal/layout.mjs';

test('pilot manifest contains only approved locations and sponsored placements (NW Philadelphia, Jersey Shore, Manhattan)', () => {
  const p = pilotManifest(JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')));
  assert.deepEqual(p.locations.map((x) => x.display_name).sort(), ['BMCC (Borough of Manhattan Community College)', 'John Jay College', 'LA Fitness - Brick', 'LA Fitness - Cheltenham', 'LA Fitness - Howell', 'LA Fitness - Toms River',
    'Liberty Terrace', "St. Bart's Church", 'The Continental', 'Upper East Side - Dwight School', 'Wall Street']);
  assert.deepEqual(p.tenants.map((x) => x.display_name).sort(), ['British Swim School of Jersey Shore', 'British Swim School of Manhattan', 'British Swim School of Northwest Philadelphia']);
  assert.equal(p.campaigns.length, 3);
  assert.equal(p.placements.length, 8);
  assert.ok(p.campaigns.every((x) => x.starts_on === PILOT_START && x.display_name === 'Sponsored pilot' && x.kind === 'sponsored_pilot' && x.price_cents === 0));
  assert.equal(p.users.length, 0);
  assert.equal(p.memberships.length, 0);
  // Held locations (Andorra, Asbury Park, East Village), fixture-only campaigns and synthetic data never enter the live seed.
  assert.doesNotMatch(JSON.stringify(p), /Andorra|Asbury Park|East Village|organic_baseline|synthetic/i);
});

test('pilot seed has metadata but no fabricated activity', async () => {
  const { summary, sql } = await buildPilotSeedSql();
  for (const table of ['events', 'daily_metrics', 'conversion_imports', 'conversion_records']) assert.equal(summary.tables[table].rows, 0, table);
  assert.match(sql, /No synthetic events, metrics, leads, enrollments or personal information/);
});

test('pilot portal clearly identifies live reporting and removes fixture wording', () => {
  const source = { status: 200, body: '<title>X · WWK Sponsor Portal (POC)</title><span class="env-pill">Local POC · demo sign-in</span><form method="post" action="/demo/logout" class="signout"><button type="submit" class="btn btn-quiet">Sign out</button></form><strong>Synthetic fixture data.</strong> This is a local proof of concept. Numbers are generated for testing and do not describe real traffic, leads or enrollments. Eligible (fixture)<nav class="tenant-nav" aria-label="Your schools">' };
  const page = adaptPage(source, { mode: 'pilot', isAdmin: true });
  assert.match(page.body, /Live pilot|Pilot · Administrator|Active pilot location|Jackrabbit/);
  assert.doesNotMatch(page.body, /synthetic|fixture data|Eligible \(fixture\)|demo sign-in/i);
});
