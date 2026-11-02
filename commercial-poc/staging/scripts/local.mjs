#!/usr/bin/env node
// Local staging commands (Wrangler + local D1 only; never remote).
//   node scripts/local.mjs setup                  state dir, random local HMAC key, derived local configs
//   node scripts/local.mjs migrate                wrangler d1 migrations apply DB --local
//   node scripts/local.mjs seed                   build seed SQL, wrangler d1 execute --local --file, provision local identities
//   node scripts/local.mjs provision              provision local .test identities only
//   node scripts/local.mjs dev-collector [--port 8787]
//   node scripts/local.mjs dev-portal [--as owner|partner|no-school|stranger|wrong-aud|none] [--port 8788]
//   node scripts/local.mjs reconcile              local D1 vs the accepted Phase 1 pipeline (table hashes, totals)
//   node scripts/local.mjs dry-run                wrangler deploy --dry-run for both Workers (bundles only, no upload)
//   node scripts/local.mjs teardown               delete the staging-local state directory, nothing else
// State directory: staging/.data (or WWK_STAGING_STATE_DIR). Wrangler: staging/node_modules/.bin/wrangler or WRANGLER_BIN.
import { writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { paths, setup, teardown, writeLocalConfigs, wranglerSync, wranglerSpawn, wranglerModule, localHmacKey, readCommittedConfig, LOCAL_IDENTITIES } from './lib/wrangler-local.mjs';
import { MANIFEST_PATH, STAGING_ROOT } from './lib/paths.mjs';
import { authSubjectFor } from '../src/shared/identity.mjs';

const must = (r) => { if (r.status !== 0) { const e = new Error(`${r.cmd} failed (${r.status})\n${(r.stderr || r.stdout || '').slice(-2000)}`); throw e; } return r; };

export function migrate(p = paths()) {
  writeLocalConfigs(p);
  return must(wranglerSync(['d1', 'migrations', 'apply', 'DB', '--local', '--persist-to', p.persist, '-c', p.portalConfig], p));
}

export async function provisionSql(p = paths()) {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const key = localHmacKey(p);
  const lines = ['-- Local-only identity provisioning (reserved .test identities). Generated; contains opaque subjects only.'];
  for (const id of Object.values(LOCAL_IDENTITIES)) {
    if (!id.user_key && !id.user_id) continue;
    const userId = id.user_id || manifest.users.find((u) => u.user_key === id.user_key)?.user_id;
    if (!userId) throw new Error('local identity has no matching user');
    lines.push(`UPDATE users SET auth_subject = '${await authSubjectFor(key, id.email)}' WHERE user_id = '${userId}';`);
  }
  const f = join(p.seed, 'provision-local.sql');
  writeFileSync(f, `${lines.join('\n')}\n`);
  return f;
}

export async function provision(p = paths()) {
  const f = await provisionSql(p);
  return must(wranglerSync(['d1', 'execute', 'DB', '--local', '--persist-to', p.persist, '-c', p.portalConfig, '--file', f, '--yes'], p));
}

export async function seed(p = paths()) {
  const { buildSeedSql } = await import('./build-seed.mjs');
  const { sql, summary } = await buildSeedSql();
  const f = join(p.seed, 'staging-seed.sql');
  writeFileSync(f, sql);
  writeFileSync(join(p.seed, 'staging-seed.summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  const t0 = Date.now();
  must(wranglerSync(['d1', 'execute', 'DB', '--local', '--persist-to', p.persist, '-c', p.portalConfig, '--file', f, '--yes'], p));
  const ms = Date.now() - t0;
  await provision(p);
  return { summary, execute_ms: ms };
}

/** Open the local D1 through Wrangler's getPlatformProxy (local only), run fn(db), dispose. */
export async function withLocalD1(p, fn) {
  const { getPlatformProxy } = await wranglerModule();
  // Wrangler CLI's `--persist-to <dir>` stores v3 state under <dir>/v3,
  // while getPlatformProxy expects the exact v3 directory.
  const proxy = await getPlatformProxy({
    configPath: p.portalConfig,
    envFiles: [p.devVars],
    persist: { path: join(p.persist, 'v3') },
    remoteBindings: false,
  });
  try { return await fn(proxy.env.DB); } finally { await proxy.dispose(); }
}

export async function reconcileLocal(p = paths()) {
  const { tableSummary } = await import('./build-seed.mjs');
  const { RECONCILED_TABLES } = await import('./lib/sql-dump.mjs');
  const { reconcile } = await import('../src/shared/rollup.mjs');
  const support = await import('../test/support.mjs');
  const phase1 = await support.phase1Seeded();
  const tables = [...RECONCILED_TABLES, 'data_quality_runs'];
  const expected = support.phase1TableHashes(phase1.db, tables);
  return withLocalD1(p, async (db) => {
    const local = await tableSummary(db);
    const perTable = Object.fromEntries(tables.map((t) => [t, { local: local[t], phase1: expected[t], equal: local[t].sha256 === expected[t].sha256 && local[t].rows === expected[t].rows }]));
    const tenants = {};
    for (const t of phase1.manifest.tenants) {
      const r = await reconcile(db, { tenantId: t.tenant_id, from: '2000-01-01', to: '2999-12-31' });
      tenants[t.tenant_key] = { tenant_id: t.tenant_id, generator_expected: phase1.synth.expected.byTenant[t.tenant_id], events: r.events, daily_metrics: r.daily_metrics, reconciliation_ok: r.ok,
        equals_generator: ['eligible_view', 'viewable_impression', 'sponsored_click', 'outbound_click'].every((m) => r.events[m] === phase1.synth.expected.byTenant[t.tenant_id][m]) };
    }
    const subjects = (await db.prepare('SELECT COUNT(*) AS n FROM users WHERE auth_subject IS NOT NULL').first()).n;
    return { ok: Object.values(perTable).every((x) => x.equal) && Object.values(tenants).every((x) => x.reconciliation_ok && x.equals_generator), tables: perTable, tenants, provisioned_subjects: subjects };
  });
}

/** `wrangler deploy --dry-run` on deploy-shaped copies of the COMMITTED configs (only paths made absolute), so build output stays in <state>. */
export function dryRun(p = paths()) {
  writeLocalConfigs(p);
  const out = {};
  for (const w of ['collector', 'portal']) {
    const c = readCommittedConfig(w);
    delete c.$schema;
    c.main = join(STAGING_ROOT, 'src', w, 'entry.mjs');
    c.d1_databases = c.d1_databases.map((x) => ({ ...x, migrations_dir: join(STAGING_ROOT, 'migrations') }));
    const f = join(p.config, `${w}.deploy-shaped.json`);
    writeFileSync(f, `${JSON.stringify(c, null, 2)}\n`);
    const r = must(wranglerSync(['deploy', '--dry-run', '--outdir', join(p.dist, w), '-c', f], p));
    out[w] = { cmd: `wrangler deploy --dry-run --outdir <state>/dist/${w} -c <state>/config/${w}.deploy-shaped.json`, summary: (r.stdout + r.stderr).split('\n').filter((l) => /Total Upload|env\.|--dry-run: exiting|compat/i.test(l)).map((l) => l.trim()) };
  }
  return out;
}

export function devArgs(worker, { as = 'none', port, inspectorPort, vars = {} }, p = paths()) {
  const args = ['dev', '--local', '--persist-to', p.persist, '--port', String(port), '--ip', '127.0.0.1', '--inspector-port', String(inspectorPort), '--show-interactive-dev-session=false', '--env-file', p.devVars];
  if (worker === 'collector') args.push('-c', p.collectorConfig);
  else { args.push('-c', p.portalConfig); if (as !== 'none') args.push('-e', `as-${as}`); }
  for (const [k, v] of Object.entries(vars)) args.push('--var', `${k}:${v}`);
  return args;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const opt = (name, def) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : def; };
  const p = paths();
  const print = (x) => console.log(JSON.stringify(x, null, 2));
  switch (cmd) {
    case 'setup': setup(p); return print({ state_dir: p.dir, configs: [p.collectorConfig, p.portalConfig] });
    case 'migrate': setup(p); return print({ migrate: migrate(p).stdout.split('\n').slice(-6) });
    case 'seed': setup(p); { const r = await seed(p); return print({ seeded: r.summary.ingest, sql_sha256: r.summary.sql_sha256, execute_ms: r.execute_ms }); }
    case 'provision': setup(p); await provision(p); return print({ provisioned: Object.keys(LOCAL_IDENTITIES).filter((k) => LOCAL_IDENTITIES[k].user_key) });
    case 'reconcile': return print(await reconcileLocal(p));
    case 'dry-run': setup(p); return print(dryRun(p));
    case 'dev-collector':
    case 'dev-portal': {
      setup(p);
      const worker = cmd === 'dev-collector' ? 'collector' : 'portal';
      const port = Number(opt('port', worker === 'collector' ? 8787 : 8788));
      const child = wranglerSpawn(devArgs(worker, { as: opt('as', 'none'), port, inspectorPort: port + 1000 }, p));
      child.stdout.pipe(process.stdout); child.stderr.pipe(process.stderr);
      process.on('SIGINT', () => child.kill('SIGINT'));
      return new Promise((r) => child.on('exit', r));
    }
    case 'teardown': return print(teardown(p));
    default:
      console.error('usage: node scripts/local.mjs setup|migrate|seed|provision|dev-collector|dev-portal|reconcile|dry-run|teardown');
      process.exitCode = 2;
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(err.code === 'NO_WRANGLER' ? err.message : err.stack || err.message); process.exitCode = err.code === 'NO_WRANGLER' ? 3 : 1; });
}
