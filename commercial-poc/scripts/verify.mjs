#!/usr/bin/env node
// One-command verification packet: static checks, manifest freshness, full test
// suite, fresh seed, reconciliation totals and health summary. Writes
// evidence/verification.json and evidence/test-output.txt. Local only.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { POC_ROOT, AS_OF } from '../src/config.mjs';
import { openDb } from '../src/db.mjs';
import { seedAll } from '../src/pipeline.mjs';
import { reconcile } from '../src/rollup.mjs';
import { healthSummary } from '../src/quality.mjs';
import { TenantScope } from '../src/scope.mjs';
import { expectedConversionTotals } from '../src/synthetic.mjs';

const evidence = join(POC_ROOT, 'evidence');
mkdirSync(evidence, { recursive: true });
const run = (args, extraEnv = {}) => {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, args, { cwd: POC_ROOT, encoding: 'utf8', env: { ...process.env, ...extraEnv }, maxBuffer: 64 * 1024 * 1024 });
  return { command: `node ${args.join(' ')}`, exit_code: r.status, ms: Date.now() - t0, stdout: r.stdout, stderr: r.stderr };
};

const out = { generated_for_as_of: AS_OF, node: process.version, platform: `${process.platform}-${process.arch}`, steps: {} };

const sc = run(['scripts/static-checks.mjs']);
out.steps.static_checks = { command: sc.command, exit_code: sc.exit_code, result: JSON.parse(sc.stdout || '{}') };

const mc = run(['scripts/build-manifest.mjs', '--check']);
out.steps.manifest_check = { command: mc.command, exit_code: mc.exit_code, output: (mc.stdout + mc.stderr).trim() };

const tests = readdirSync(join(POC_ROOT, 'test')).filter((f) => f.endsWith('.test.mjs')).map((f) => join('test', f));
const tt = run(['--test', '--test-reporter=spec', ...tests]);
writeFileSync(join(evidence, 'test-output.txt'), tt.stdout + (tt.stderr ? `\n--- stderr ---\n${tt.stderr}` : ''));
const tally = (k) => Number((tt.stdout.match(new RegExp(`ℹ ${k} (\\d+)`)) || [])[1] || NaN);
out.steps.tests = { command: tt.command, exit_code: tt.exit_code, ms: tt.ms, tests: tally('tests'), pass: tally('pass'), fail: tally('fail'), skipped: tally('skipped'), output_file: 'evidence/test-output.txt' };

const manifest = JSON.parse(readFileSync(join(POC_ROOT, 'seed/pilot-manifest.json'), 'utf8'));
const db = openDb(':memory:');
const seed = seedAll(db, manifest, { asOf: AS_OF });
const convExpected = expectedConversionTotals(seed.synth.conversionBatches);
out.reconciliation = { ingest: seed.ingest, injected: { duplicates: seed.synth.expected.duplicates, rejected_by_reason: seed.synth.expected.rejected }, tenants: {} };
for (const t of manifest.tenants) {
  const s = new TenantScope(db, t.tenant_id, 'verify');
  const tot = s.totals('2000-01-01', '2999-12-31');
  const portal = Object.fromEntries(['eligible_view', 'viewable_impression', 'sponsored_click', 'outbound_click'].map((m) => [m, (tot.sponsored_card[m] || 0) + (tot.organic_listing[m] || 0)]));
  const rec = reconcile(db, { tenantId: t.tenant_id, from: '2000-01-01', to: '2999-12-31' });
  const exp = seed.synth.expected.byTenant[t.tenant_id];
  out.reconciliation.tenants[t.tenant_key] = {
    tenant_id: t.tenant_id,
    generator_expected: exp,
    accepted_events: rec.events,
    daily_metrics: rec.daily_metrics,
    portal_read_model: portal,
    by_placement_kind: tot,
    reported_conversions: { expected: convExpected[t.tenant_id] || {}, stored: s.conversionTotals('2000-01-01', '2999-12-31') },
    exact_match: JSON.stringify(exp) === JSON.stringify({ eligible_view: rec.events.eligible_view || 0, viewable_impression: rec.events.viewable_impression || 0, sponsored_click: rec.events.sponsored_click || 0, outbound_click: rec.events.outbound_click || 0 })
      && rec.ok && JSON.stringify(portal) === JSON.stringify(exp),
  };
}
out.health = healthSummary(db, { asOf: AS_OF, from: '2026-10-05', to: '2026-11-01' });
writeFileSync(join(evidence, 'verification.json'), JSON.stringify(out, null, 2) + '\n');
const ok = sc.exit_code === 0 && mc.exit_code === 0 && tt.exit_code === 0 && Object.values(out.reconciliation.tenants).every((t) => t.exact_match);
console.log(JSON.stringify({ ok, static_checks: sc.exit_code, manifest_check: mc.exit_code, tests: out.steps.tests, reconciliation_exact: Object.fromEntries(Object.entries(out.reconciliation.tenants).map(([k, v]) => [k, v.exact_match])), health: out.health.status }, null, 2));
process.exitCode = ok ? 0 : 1;
