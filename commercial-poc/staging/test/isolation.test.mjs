// Tenant isolation across identities, routes and the read model.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { get, T } from './portal-support.mjs';
import { seeded, IDENTITIES, STAGING_ROOT } from './support.mjs';
import { TenantScope } from '../src/shared/scope.mjs';

const ALL = Object.values(T);
const MATRIX = { admin: ALL, owner: [T['northwest-philadelphia'], T['jersey-shore']], partner: [T.manhattan], noTenant: [], stranger: [] };

test('identity x tenant matrix: 200 only for members, 404 otherwise (403 when not provisioned), for page and quality.json', async () => {
  const s = await seeded();
  for (const [who, allowed] of Object.entries(MATRIX)) {
    for (const tid of ALL) {
      for (const suffix of ['', 'quality.json']) {
        const r = await get(s.db, `/t/${tid}/${suffix}`, { email: IDENTITIES[who] });
        const expected = allowed.includes(tid) ? 200 : who === 'stranger' ? 403 : 404;
        assert.equal(r.status, expected, `${who} ${tid} ${suffix}`);
      }
    }
  }
});

test('a member page never contains another tenant’s IDs or names, apart from the member’s own tenant switcher', async () => {
  const s = await seeded();
  const ids = (tid) => {
    const m = s.manifest;
    return [tid, ...m.schools, ...m.locations, ...m.destinations, ...m.campaigns, ...m.placements].filter((x) => x === tid || x.tenant_id === tid)
      .map((x) => (typeof x === 'string' ? x : x.school_id || x.location_id || x.destination_id || x.campaign_id || x.placement_id));
  };
  const nameOf = (tid) => s.manifest.tenants.find((t) => t.tenant_id === tid).display_name;
  for (const [who, allowed] of Object.entries(MATRIX)) {
    for (const tid of allowed) {
      for (const suffix of ['', 'quality.json', '?from=2026-08-04&to=2026-11-01']) {
        const body = (await get(s.db, `/t/${tid}/${suffix}`, { email: IDENTITIES[who] })).body;
        for (const other of ALL.filter((x) => !allowed.includes(x))) {
          for (const id of ids(other)) assert.equal(body.includes(id), false, `${who} page for ${tid} leaks ${id}`);
          assert.equal(body.includes(nameOf(other)), false, `${who} leaks ${nameOf(other)}`);
        }
      }
    }
  }
});

test('every read-model method returns only the scope tenant’s rows', async () => {
  const s = await seeded();
  for (const tid of ALL) {
    const sc = new TenantScope(s.db, tid, 'x');
    const out = JSON.stringify(await Promise.all([sc.tenant(), sc.campaigns(), sc.locations(), sc.dataExtent(), sc.totals('2026-08-01', '2026-11-30'), sc.byPlacement('2026-08-01', '2026-11-30'),
      sc.byLocation('2026-08-01', '2026-11-30'), sc.byDestination('2026-08-01', '2026-11-30'), sc.conversions('2026-08-01', '2026-11-30'), sc.baselineComparison(), sc.latestQuality()]));
    for (const other of ALL.filter((x) => x !== tid)) assert.equal(out.includes(other), false);
  }
});

test('static: every SQL statement in TenantScope binds tenant_id as parameter 1, and only #all/#get touch D1', () => {
  const src = readFileSync(join(STAGING_ROOT, 'src/shared/scope.mjs'), 'utf8');
  const cls = src.slice(src.indexOf('export class TenantScope'), src.indexOf('function pivot'));
  const prepares = [...cls.matchAll(/this\.db\.prepare\(/g)];
  assert.equal(prepares.length, 2, 'only the two private helpers call prepare');
  assert.match(cls, /prepare\(sql\)\.bind\(this\.tenantId, \.\.\.params\)\.all\(\)/);
  assert.match(cls, /prepare\(sql\)\.bind\(this\.tenantId, \.\.\.params\)\.first\(\)/);
  const sqls = [...cls.matchAll(/this\.#(?:all|get)\(\s*[`']([\s\S]*?)[`']\s*[,)]/g)].map((m) => m[1]);
  assert.ok(sqls.length >= 15, `found ${sqls.length} statements`);
  for (const sql of sqls) assert.match(sql, /tenant_id = \?(1)?(\s|$|,|\))/, sql.slice(0, 80));
});
