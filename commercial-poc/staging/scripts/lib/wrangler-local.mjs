// Local-only Wrangler plumbing. Every write goes to the staging-local state directory.
// - Committed configs (collector/ and portal/wrangler.jsonc) are read, never modified.
// - Derived local configs live in <state>/config/ with absolute paths, local vars and the
//   local Access identities (reserved .test addresses) that must never be deployed.
// - Spawned Wrangler processes get a scrubbed environment: no Cloudflare credentials, metrics
//   off, logs and config under <state>. Only --local commands are ever issued; remote bindings
//   are never configured.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { STAGING_ROOT, STATE_MARKER, stateDir, isInside } from './paths.mjs';
import { ADMIN_USER_ID } from './seed-pipeline.mjs';

export const LOCAL_AUD = 'wwk-portal-local-dev-audience';
export const LOCAL_TLD = ['te', 'st'].join('');
export const LOCAL_IDENTITIES = Object.freeze({
  admin: { user_id: ADMIN_USER_ID, email: `wwk-admin@wwk-staging.${LOCAL_TLD}` },
  owner: { user_key: 'demo-owner-nwp-js', email: `pilot-owner@wwk-staging.${LOCAL_TLD}` },
  partner: { user_key: 'demo-partner-manhattan', email: `manhattan-partner@wwk-staging.${LOCAL_TLD}` },
  'no-school': { user_key: 'demo-no-access', email: `no-school@wwk-staging.${LOCAL_TLD}` },
  stranger: { user_key: null, email: `not-provisioned@wwk-staging.${LOCAL_TLD}` },
});
export const CREDENTIAL_ENV = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_API_KEY', 'CLOUDFLARE_EMAIL', 'CLOUDFLARE_ACCOUNT_ID', 'CF_API_TOKEN', 'CF_API_KEY', 'CF_ACCOUNT_ID', 'CF_EMAIL'];

export function stripJsonc(text) {
  return text.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
}
export const readCommittedConfig = (worker) => JSON.parse(stripJsonc(readFileSync(join(STAGING_ROOT, worker, 'wrangler.jsonc'), 'utf8')));

export function paths(dir = stateDir()) {
  return {
    dir, marker: join(dir, STATE_MARKER), persist: join(dir, 'wrangler-state'), config: join(dir, 'config'), seed: join(dir, 'seed'),
    logs: join(dir, 'logs'), xdg: join(dir, 'xdg'), devVars: join(dir, 'dev.vars'), dist: join(dir, 'dist'),
    collectorConfig: join(dir, 'config', 'collector.local.json'), portalConfig: join(dir, 'config', 'portal.local.json'),
  };
}

/** The state dir must be staging/.data, or an explicit directory that already carries our marker (or is new). */
export function assertSafeStateDir(dir) {
  const def = join(STAGING_ROOT, '.data');
  if (resolve(dir) === def || isInside(def, resolve(dir))) return;
  if (existsSync(dir) && !existsSync(join(dir, STATE_MARKER))) throw new Error(`refusing to use ${dir}: not empty-new and not marked as a staging-local state directory`);
  if (['/', process.env.HOME || '/nonexistent', STAGING_ROOT, resolve(STAGING_ROOT, '..'), resolve(STAGING_ROOT, '../..')].map((x) => resolve(x)).includes(resolve(dir))) throw new Error(`refusing to use ${dir} as state`);
}

export function setup(p = paths()) {
  assertSafeStateDir(p.dir);
  for (const d of [p.dir, p.persist, p.config, p.seed, p.logs, p.xdg, p.dist]) mkdirSync(d, { recursive: true });
  writeFileSync(p.marker, 'WWK commercial staging-local state. Safe to delete with: node scripts/local.mjs teardown\n');
  if (!existsSync(p.devVars)) writeFileSync(p.devVars, `IDENTITY_HMAC_KEY=${randomBytes(32).toString('hex')}\n`, { mode: 0o600 });
  writeLocalConfigs(p);
  return p;
}

export function localHmacKey(p = paths()) {
  const m = readFileSync(p.devVars, 'utf8').match(/^IDENTITY_HMAC_KEY=([0-9a-f]{64,})$/m);
  if (!m) throw new Error('local dev.vars has no usable IDENTITY_HMAC_KEY; run setup');
  return m[1];
}

export function writeLocalConfigs(p = paths()) {
  const d1 = (c) => c.d1_databases.map((x) => ({ ...x, migrations_dir: join(STAGING_ROOT, 'migrations') }));
  const col = readCommittedConfig('collector');
  delete col.$schema;
  col.main = join(STAGING_ROOT, 'src/collector/entry.mjs');
  col.d1_databases = d1(col);
  col.vars = { ...col.vars, COLLECTOR_ENV: 'local' };
  delete col.observability;
  const por = readCommittedConfig('portal');
  delete por.$schema;
  por.main = join(STAGING_ROOT, 'src/portal/entry.mjs');
  por.d1_databases = d1(por);
  por.vars = { ...por.vars, PORTAL_ENV: 'local', ACCESS_AUD: LOCAL_AUD };
  delete por.observability;
  por.env = {};
  for (const [name, id] of Object.entries(LOCAL_IDENTITIES)) {
    por.env[`as-${name}`] = { access: { dev: { aud: LOCAL_AUD, identity: { email: id.email } } }, d1_databases: por.d1_databases, vars: por.vars, secrets: por.secrets };
  }
  por.env['as-wrong-aud'] = { access: { dev: { aud: 'some-other-access-application', identity: { email: LOCAL_IDENTITIES.owner.email } } }, d1_databases: por.d1_databases, vars: por.vars, secrets: por.secrets };
  for (const [f, c] of [[p.collectorConfig, col], [p.portalConfig, por]]) {
    for (const x of c.d1_databases) if (x.remote) throw new Error('remote bindings are never allowed locally');
    writeFileSync(f, `${JSON.stringify(c, null, 2)}\n`);
  }
}

export function wranglerBin() {
  const candidates = [process.env.WRANGLER_BIN, join(STAGING_ROOT, 'node_modules/.bin/wrangler')].filter(Boolean);
  const bin = candidates.find((c) => existsSync(c));
  if (!bin) throw Object.assign(new Error('Wrangler is not installed. Install the pinned devDependency (wrangler 4.151.1) through dev-external, or set WRANGLER_BIN.'), { code: 'NO_WRANGLER' });
  return bin;
}
/** Resolve the wrangler package (for getPlatformProxy) next to the binary in use. */
export async function wranglerModule() {
  const bin = wranglerBin();
  const req = createRequire(join(resolve(bin, '../..'), 'package.json'));
  return import(req.resolve('wrangler'));
}

export function scrubbedEnv(p = paths(), extra = {}) {
  const env = { ...process.env };
  for (const k of CREDENTIAL_ENV) delete env[k];
  return { ...env, WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: p.logs, XDG_CONFIG_HOME: p.xdg, CI: '1', NO_COLOR: '1', ...extra };
}

/** Only three local command shapes are ever run: `dev --local`, `d1 migrations apply|execute --local`, `deploy --dry-run`. */
export function guardArgs(args) {
  const ok = (args[0] === 'dev' && args.includes('--local'))
    || (args[0] === 'd1' && ['migrations', 'execute'].includes(args[1]) && args.includes('--local'))
    || (args[0] === 'deploy' && args.includes('--dry-run'))
    || (args.length === 1 && args[0] === '--version');
  if (!ok || args.includes('--remote') || args.some((a) => /^--(remote|preview)$/.test(a))) throw new Error(`refusing non-local wrangler command: ${args.join(' ')}`);
}

export function wranglerSync(args, p = paths(), { cwd = p.dir } = {}) {
  guardArgs(args);
  const r = spawnSync(wranglerBin(), args, { cwd, env: scrubbedEnv(p), encoding: 'utf8', maxBuffer: 256 << 20 });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, cmd: `wrangler ${args.join(' ')}` };
}

export function wranglerSpawn(args, p = paths(), { logFile } = {}) {
  guardArgs(args);
  const child = spawn(wranglerBin(), args, { cwd: p.dir, env: scrubbedEnv(p), stdio: ['ignore', 'pipe', 'pipe'], detached: false });
  const chunks = [];
  const sink = (d) => { chunks.push(String(d)); if (logFile) writeFileSync(logFile, chunks.join('')); };
  child.stdout.on('data', sink); child.stderr.on('data', sink);
  child.output = () => chunks.join('');
  return child;
}

export function teardown(p = paths()) {
  assertSafeStateDir(p.dir);
  if (!existsSync(p.dir)) return { removed: null };
  if (!existsSync(p.marker) && resolve(p.dir) !== join(STAGING_ROOT, '.data')) throw new Error(`${p.dir} is not marked as staging-local state; not removing`);
  rmSync(p.dir, { recursive: true, force: true });
  return { removed: p.dir };
}
