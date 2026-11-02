#!/usr/bin/env node
// WWK sponsor onboarding CLI. Offline only: it reads the definition and repository files
// and prints (or, with --write, saves) an activation packet. It never deploys, never
// touches Cloudflare/D1/DNS/Search Console, never sends anything and never deletes files.
//
//   node onboarding/cli.mjs validate <definition.json>
//   node onboarding/cli.mjs ids      <definition.json>
//   node onboarding/cli.mjs plan     <definition.json>                (dry-run; default)
//   node onboarding/cli.mjs packet   <definition.json> [--out DIR] [--write]
// Options: --as-of YYYY-MM-DD  --deactivate-on YYYY-MM-DD  --repo-root DIR  --registry-dir DIR  --no-manifest
//          --controls <plan.controls.json>  (adds ordinary-listing control artifacts under control/)
//   node onboarding/cli.mjs import-plan <definition.json> --export <totals.json> --map <location-map.json> [--write --out DIR]
//          Aggregate conversion import dry-run. --write requires an --out OUTSIDE the repository.
//   node onboarding/cli.mjs conversion-feed <definition.json> --events <pa instant.json> --events <nj instant.json>
//          --map <location-map.json> --to YYYY-MM-DD --exported-on YYYY-MM-DD [--from YYYY-MM-DD] [--granularity week|day] [--write --out DIR]
//          BSS Messenger instant streams -> per-tenant aggregate exports, one mutually exclusive basis per lead/enrollment
//          (sponsored UTM wins). Prints aggregates only; never PII.
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkShape } from './src/schema.mjs';
import { createRepo, DEFAULT_REPO_ROOT, isInside, ONBOARDING_ROOT, POC_ROOT } from './src/repo.mjs';
import { expectedIds, validateDefinition } from './src/validate.mjs';
import { buildPacket } from './src/packet.mjs';
import { importPreflight, importSql, importSummary, planImport } from './src/conversion-import.mjs';
import { buildConversionFeed } from './src/conversion-feed.mjs';

export const DEFAULT_OUT_ROOT = join(ONBOARDING_ROOT, 'out');
const COMMANDS = new Set(['validate', 'ids', 'plan', 'packet', 'import-plan', 'conversion-feed']);
const VALUE_FLAGS = new Set(['--out', '--as-of', '--deactivate-on', '--repo-root', '--registry-dir', '--controls', '--export', '--map', '--to', '--from', '--exported-on', '--granularity']);
const BOOL_FLAGS = new Set(['--write', '--no-manifest']);

export class UsageError extends Error {}

export function parseArgs(argv) {
  const [command, file, ...rest] = argv;
  if (!COMMANDS.has(command)) throw new UsageError(`command must be one of: ${[...COMMANDS].join(', ')}`);
  if (!file || file.startsWith('--')) throw new UsageError('definition file required');
  const opts = { command, file };
  for (let i = 0; i < rest.length; i += 1) {
    const a = rest[i];
    if (BOOL_FLAGS.has(a)) { opts[a.slice(2)] = true; continue; }
    if (a === '--events') { const v = rest[i + 1]; if (!v || v.startsWith('--')) throw new UsageError('--events needs a value'); (opts.events ||= []).push(v); i += 1; continue; }
    if (VALUE_FLAGS.has(a)) { const v = rest[i + 1]; if (!v || v.startsWith('--')) throw new UsageError(`${a} needs a value`); opts[a.slice(2)] = v; i += 1; continue; }
    throw new UsageError(`unknown option ${a}`);
  }
  for (const k of ['as-of', 'deactivate-on', 'to', 'from', 'exported-on']) if (opts[k] && !/^\d{4}-\d{2}-\d{2}$/.test(opts[k])) throw new UsageError(`--${k} must be YYYY-MM-DD`);
  if (opts.write && !['packet', 'import-plan', 'conversion-feed'].includes(command)) throw new UsageError('--write is only valid with packet, import-plan or conversion-feed');
  if (opts.events && command !== 'conversion-feed') throw new UsageError('--events is only valid with conversion-feed');
  if (command === 'conversion-feed') {
    if (!opts.events || opts.events.length !== 2 || resolve(opts.events[0]) === resolve(opts.events[1])) throw new UsageError('conversion-feed needs exactly two distinct --events files (PA and NJ instant.json)');
    if (!opts.map || !opts.to || !opts['exported-on']) throw new UsageError('conversion-feed needs --map, --to and --exported-on');
    if (opts.write && !opts.out) throw new UsageError('conversion-feed --write needs an explicit --out outside the repository');
  }
  if (command === 'import-plan' && (!opts.export || !opts.map)) throw new UsageError('import-plan needs --export and --map');
  if (command === 'import-plan' && opts.write && !opts.out) throw new UsageError('import-plan --write needs an explicit --out outside the repository');
  return opts;
}

/** Output directory must be under onboarding/out/ or entirely outside the repository. */
export function safeOutDir(out, repoRoot) {
  const abs = resolve(out);
  if (abs === DEFAULT_OUT_ROOT || isInside(DEFAULT_OUT_ROOT, abs)) return abs;
  if (abs === repoRoot || isInside(repoRoot, abs)) throw new UsageError(`--out inside the repository must be under ${DEFAULT_OUT_ROOT}`);
  return abs;
}

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch (e) { throw new UsageError(`cannot read JSON ${path}: ${e.message}`); }
}

export function loadContext(opts, def) {
  const repo = createRepo(opts['repo-root'] || DEFAULT_REPO_ROOT);
  const manifestPath = join(POC_ROOT, 'seed/pilot-manifest.json');
  const existingManifest = opts['no-manifest'] || !existsSync(manifestPath) ? null : readJson(manifestPath);
  const regDir = resolve(opts['registry-dir'] || join(ONBOARDING_ROOT, 'definitions'));
  const others = existsSync(regDir) ? readdirSync(regDir).filter((f) => f.endsWith('.sponsor.json') && !f.startsWith('template'))
    .sort().map((f) => readJson(join(regDir, f))).filter((o) => o && o.definition_key !== def.definition_key) : [];
  return { repo, existingManifest, others, asOf: opts['as-of'] || null };
}

/** Writes only changed files (atomic rename); never deletes. Returns per-file outcome. */
export function writePacket(files, outDir) {
  const result = {};
  for (const rel of Object.keys(files).sort()) {
    const target = join(outDir, rel);
    if (!isInside(outDir, target)) throw new Error(`refusing path outside packet: ${rel}`);
    const prev = existsSync(target) ? readFileSync(target, 'utf8') : null;
    if (prev === files[rel]) { result[rel] = 'unchanged'; continue; }
    mkdirSync(dirname(target), { recursive: true });
    const tmp = `${target}.tmp-${process.pid}`;
    writeFileSync(tmp, files[rel]);
    renameSync(tmp, target);
    result[rel] = prev === null ? 'created' : 'updated';
  }
  return result;
}

export function run(argv, { stdout = (s) => process.stdout.write(s) } = {}) {
  let opts;
  try { opts = parseArgs(argv); } catch (e) { stdout(`${JSON.stringify({ ok: false, usage_error: e.message })}\n`); return 2; }
  try {
    const def = readJson(resolve(opts.file));
    const ctx = loadContext(opts, def);
    if (opts.command === 'ids') {
      const shape = checkShape(def);
      if (shape.length) { stdout(`${JSON.stringify({ ok: false, errors: shape }, null, 2)}\n`); return 1; }
      stdout(`${JSON.stringify(expectedIds(def).map((x) => ({ path: x.path, expected: x.expected, given: x.given, matches: x.given === null || x.given === x.expected })), null, 2)}\n`);
      return 0;
    }
    if (opts.command === 'import-plan') {
      const plan = planImport(def, readJson(resolve(opts.export)), readJson(resolve(opts.map)));
      if (!plan.ok) { stdout(`${JSON.stringify({ ok: false, errors: plan.errors, warnings: plan.warnings }, null, 2)}\n`); return 1; }
      const summary = { ...importSummary(plan), warnings: plan.warnings };
      if (!opts.write) { stdout(`${JSON.stringify({ ok: true, mode: 'dry-run', note: 'Nothing was written or applied.', summary }, null, 2)}\n`); return 0; }
      const outDir = resolve(opts.out);
      if (outDir === ctx.repo.root || isInside(ctx.repo.root, outDir)) throw new UsageError('import output holds real school totals and must be written outside the repository (commercial-poc/ is publicly served)');
      const written = writePacket({ 'import/batch.json': `${JSON.stringify(plan.batch, null, 2)}\n`, 'import/d1-import.sql': importSql(plan), 'import/d1-import-preflight.sql': importPreflight(plan), 'import/summary.json': `${JSON.stringify(summary, null, 2)}\n` }, outDir);
      stdout(`${JSON.stringify({ ok: true, mode: 'write', out_dir: outDir, written, summary }, null, 2)}\n`);
      return 0;
    }
    if (opts.command === 'conversion-feed') {
      // Event files hold family-level PII: they must live outside the repo, are read only here, and
      // nothing from them except aggregate counts is ever printed or written.
      for (const f of [...opts.events, opts.map]) { const a = resolve(f); if (a === ctx.repo.root || isInside(ctx.repo.root, a)) throw new UsageError('event and map files must be outside the repository (commercial-poc/ is publicly served)'); }
      const readQuiet = (f) => { try { return JSON.parse(readFileSync(resolve(f), 'utf8')); } catch { throw new UsageError('an input file is missing or is not valid JSON'); } };
      const feed = buildConversionFeed(def, opts.events.map(readQuiet), readQuiet(opts.map), { from: opts.from || null, to: opts.to, exportedOn: opts['exported-on'], granularity: opts.granularity || 'week' });
      if (!feed.ok) { stdout(`${JSON.stringify({ ok: false, errors: feed.errors, warning_counts: feed.warnings }, null, 2)}\n`); return 1; }
      const map = readQuiet(opts.map);
      const checks = {};
      for (const [tk, ex] of Object.entries(feed.exports)) { const p = planImport(def, ex, map); checks[tk] = p.ok ? { import_compatible: true, import_id: p.batch.import_id, rows: p.batch.rows.length } : { import_compatible: false, errors: p.errors.map((e) => e.code) }; }
      if (Object.values(checks).some((c) => !c.import_compatible)) { stdout(`${JSON.stringify({ ok: false, import_checks: checks, warning_counts: feed.warnings }, null, 2)}\n`); return 1; }
      const summary = { schema: 'wwk.conversion-feed-summary', totals_by_tenant: feed.totals, import_checks: checks, warning_counts: feed.warnings, note: 'Aggregate counts only. Each lead and enrollment has exactly one basis (sponsored UTM wins over self-report), so bases never overlap.', network_actions: 0, database_actions: 0 };
      if (!opts.write) { stdout(`${JSON.stringify({ ok: true, mode: 'dry-run', note: 'Nothing was written.', summary }, null, 2)}\n`); return 0; }
      const outDir = resolve(opts.out);
      if (outDir === ctx.repo.root || isInside(ctx.repo.root, outDir)) throw new UsageError('feed output holds real school totals and must be written outside the repository (commercial-poc/ is publicly served)');
      const files = { 'feed/summary.json': `${JSON.stringify(summary, null, 2)}\n` };
      for (const [tk, ex] of Object.entries(feed.exports)) files[`feed/${tk}.aggregate-conversions.json`] = `${JSON.stringify(ex, null, 2)}\n`;
      stdout(`${JSON.stringify({ ok: true, mode: 'write', out_dir: outDir, written: writePacket(files, outDir), summary }, null, 2)}\n`);
      return 0;
    }
    if (opts.command === 'validate') {
      const r = validateDefinition(def, ctx);
      stdout(`${JSON.stringify(r, null, 2)}\n`);
      return r.ok ? 0 : 1;
    }
    const controls = opts.controls ? readJson(resolve(opts.controls)) : null;
    const p = buildPacket(def, ctx, { deactivateOn: opts['deactivate-on'] || null, controls });
    if (!p.ok) { stdout(`${JSON.stringify({ ok: false, errors: p.errors, warnings: p.warnings }, null, 2)}\n`); return 1; }
    if (opts.command === 'packet' && opts.write) {
      const outDir = safeOutDir(opts.out || join(DEFAULT_OUT_ROOT, p.summary.definition_key), ctx.repo.root);
      const written = writePacket(p.files, outDir);
      stdout(`${JSON.stringify({ ok: true, mode: 'write', out_dir: outDir, written, summary: p.summary }, null, 2)}\n`);
      return 0;
    }
    stdout(`${JSON.stringify({ ok: true, mode: 'dry-run', note: 'Nothing was written. Use: packet <def> --write [--out DIR]', summary: p.summary }, null, 2)}\n`);
    return 0;
  } catch (e) {
    stdout(`${JSON.stringify({ ok: false, [e instanceof UsageError ? 'usage_error' : 'error']: e.message })}\n`);
    return e instanceof UsageError ? 2 : 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = run(process.argv.slice(2));
