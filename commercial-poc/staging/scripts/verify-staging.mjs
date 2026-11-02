#!/usr/bin/env node
// One-command Phase 3 verification. All Wrangler/D1 state is isolated under
// staging/.data/verify-<pid> and removed through the guarded teardown command.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { STAGING_ROOT } from './lib/paths.mjs';

const evidence = join(STAGING_ROOT, 'evidence');
mkdirSync(evidence, { recursive: true });
const state = join(STAGING_ROOT, '.data', `verify-${process.pid}`);
const baseEnv = { ...process.env, WWK_STAGING_STATE_DIR: state, WRANGLER_SEND_METRICS: 'false', CI: '1', NO_COLOR: '1' };

function run(args, { env = baseEnv } = {}) {
  const started = Date.now();
  const result = spawnSync(process.execPath, args, { cwd: STAGING_ROOT, env, encoding: 'utf8', maxBuffer: 256 << 20 });
  return { args, cmd: `node ${args.join(' ')}`, exit: result.status, ms: Date.now() - started, stdout: result.stdout, stderr: result.stderr };
}

function summary(step) {
  return { cmd: step.cmd, exit: step.exit, ms: step.ms };
}

const report = { generated_at: new Date().toISOString(), node: process.version, wrangler: null, steps: {}, ok: false };
let failed = false;
try {
  report.wrangler = JSON.parse(readFileSync(join(STAGING_ROOT, 'node_modules/wrangler/package.json'), 'utf8')).version;

  const staticChecks = run(['scripts/static-checks.mjs']);
  report.steps.static_checks = { ...summary(staticChecks), result: JSON.parse(staticChecks.stdout || '{}') };
  failed ||= staticChecks.exit !== 0;

  const testFiles = readdirSync(join(STAGING_ROOT, 'test')).filter((name) => name.endsWith('.test.mjs')).sort().map((name) => `test/${name}`);
  const tests = run(['--test', '--test-reporter=spec', ...testFiles]);
  writeFileSync(join(evidence, 'test-output.txt'), tests.stdout + (tests.stderr ? `\n--- stderr ---\n${tests.stderr}` : ''));
  const count = (name) => Number((tests.stdout.match(new RegExp(`ℹ ${name} (\\d+)`)) || [])[1] || 0);
  report.steps.tests = { ...summary(tests), tests: count('tests'), pass: count('pass'), fail: count('fail'), skipped: count('skipped') };
  failed ||= tests.exit !== 0;

  const setup = run(['scripts/local.mjs', 'setup']);
  const migrate = run(['scripts/local.mjs', 'migrate']);
  const seed = run(['scripts/local.mjs', 'seed']);
  const reconcile = run(['scripts/local.mjs', 'reconcile']);
  const dryRun = run(['scripts/local.mjs', 'dry-run']);
  for (const [name, step] of Object.entries({ setup, migrate, seed, reconcile, dry_run: dryRun })) {
    report.steps[name] = { ...summary(step), result: step.exit === 0 ? JSON.parse(step.stdout.slice(step.stdout.indexOf('{'))) : undefined, stderr: step.exit === 0 ? undefined : step.stderr.slice(-4000) };
    failed ||= step.exit !== 0;
  }

  const e2e = run(['scripts/e2e-workerd.mjs']);
  writeFileSync(join(evidence, 'e2e-output.txt'), e2e.stdout + (e2e.stderr ? `\n--- stderr ---\n${e2e.stderr}` : ''));
  report.steps.workerd_e2e = { ...summary(e2e), result: e2e.exit === 0 ? JSON.parse(e2e.stdout.slice(e2e.stdout.indexOf('{'))) : undefined, stderr: e2e.exit === 0 ? undefined : e2e.stderr.slice(-4000) };
  failed ||= e2e.exit !== 0;
  report.ok = !failed;
} catch (error) {
  report.error = error.stack || error.message;
  failed = true;
} finally {
  const teardown = run(['scripts/local.mjs', 'teardown']);
  report.steps.teardown = { ...summary(teardown), result: teardown.exit === 0 ? JSON.parse(teardown.stdout) : undefined, stderr: teardown.exit === 0 ? undefined : teardown.stderr.slice(-2000) };
  if (teardown.exit !== 0) { failed = true; report.ok = false; }
  writeFileSync(join(evidence, 'verification.json'), `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify({
  ok: report.ok && !failed,
  wrangler: report.wrangler,
  static_checks: report.steps.static_checks,
  tests: report.steps.tests,
  reconcile: report.steps.reconcile?.result?.ok,
  dry_run: report.steps.dry_run?.exit,
  workerd_e2e: report.steps.workerd_e2e?.result,
  evidence,
}, null, 2));
process.exitCode = report.ok && !failed ? 0 : 1;
