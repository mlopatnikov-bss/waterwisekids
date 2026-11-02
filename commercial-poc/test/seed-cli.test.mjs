// R3: scripts/seed.mjs must finish ALL argument, env and target validation before it
// deletes, creates or opens any file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { openDb } from '../src/db.mjs';
import { parseSeedArgs, SeedArgError, isStrictlyInside } from '../src/seed-args.mjs';
import { POC_ROOT, DEFAULT_DB_PATH } from '../src/config.mjs';

const SEED = join(POC_ROOT, 'scripts/seed.mjs');
const DATA_DIR = dirname(DEFAULT_DB_PATH);
const CLEAN_ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== 'POC_SEED_TX_BATCH'));
const run = (args, env = {}) => spawnSync(process.execPath, [SEED, ...args], { cwd: POC_ROOT, env: { ...CLEAN_ENV, ...env }, encoding: 'utf8', timeout: 60000 });
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const snap = (paths) => paths.map((p) => (existsSync(p) ? { p, sha: sha(p), mtimeMs: statSync(p).mtimeMs, size: statSync(p).size } : { p, missing: true }));

/** A temporary directory holding a real SQLite marker database plus a marker journal. */
function markerDir() {
  const dir = mkdtempSync(join(tmpdir(), 'wwk-poc-seed-cli-'));
  const db = join(dir, 'marker.sqlite');
  const m = openDb(db);
  m.exec("CREATE TABLE r3_marker (v TEXT); INSERT INTO r3_marker VALUES ('do-not-delete');");
  m.close();
  writeFileSync(`${db}-journal`, 'r3 marker journal bytes');
  return { dir, db, journal: `${db}-journal`, files: () => readdirSync(dir).sort() };
}
const parse = (argv, env = {}) => parseSeedArgs(argv, env, { cwd: POC_ROOT, dataDir: DATA_DIR, defaultDbPath: DEFAULT_DB_PATH });

test('seed CLI: invalid or missing arguments exit 2 and leave a pre-existing database and journal byte-for-byte unchanged', () => {
  const mk = markerDir();
  try {
    const before = snap([mk.db, mk.journal]);
    const filesBefore = mk.files();
    const cases = [
      [['--db', mk.db, '--allow-outside', '--tx-batch', '0'], {}, /--tx-batch: tx batch must be/],
      [['--db', mk.db, '--allow-outside', '--tx-batch', '-5'], {}, /--tx-batch requires a value|--tx-batch: tx batch must be/],
      [['--db', mk.db, '--allow-outside', '--tx-batch', '1.5'], {}, /--tx-batch: tx batch must be/],
      [['--db', mk.db, '--allow-outside', '--tx-batch', 'abc'], {}, /--tx-batch: tx batch must be/],
      [['--db', mk.db, '--allow-outside', '--tx-batch', '1e3'], {}, /--tx-batch: tx batch must be/],
      [['--db', mk.db, '--allow-outside', '--tx-batch'], {}, /--tx-batch requires a value/],
      [['--db', mk.db, '--tx-batch', '--allow-outside'], {}, /--tx-batch requires a value/],
      [['--db', mk.db, '--allow-outside', '--tx-batch', ''], {}, /--tx-batch requires a value/],
      [['--db', mk.db, '--allow-outside'], { POC_SEED_TX_BATCH: '0' }, /POC_SEED_TX_BATCH: tx batch must be/],
      [['--db', mk.db, '--allow-outside'], { POC_SEED_TX_BATCH: 'abc' }, /POC_SEED_TX_BATCH: tx batch must be/],
      [['--db', mk.db, '--allow-outside'], { POC_SEED_TX_BATCH: '' }, /POC_SEED_TX_BATCH: tx batch must be/],
      [['--db', mk.db, '--allow-outside', '--force'], {}, /unknown option --force/],
      [['--db', mk.db, '--allow-outside', 'extra'], {}, /unexpected argument/],
      [['--db', mk.db, '--allow-outside', '--allow-outside'], {}, /given more than once/],
      [['--db', mk.db, '--db', mk.db, '--allow-outside'], {}, /given more than once/],
      [[`--db=${mk.db}`, '--allow-outside'], {}, /not "--db=/],
      [['--allow-outside', '--db'], {}, /--db requires a value/],
      [['--db', mk.db], {}, /refusing --db outside/],
    ];
    for (const [args, env, re] of cases) {
      const r = run(args, env);
      assert.equal(r.status, 2, `${JSON.stringify(args)} ${JSON.stringify(env)} -> ${r.status} ${r.stderr}`);
      assert.match(r.stderr, re, JSON.stringify(args));
      assert.deepEqual(snap([mk.db, mk.journal]), before, `files changed after ${JSON.stringify(args)}`);
      assert.deepEqual(mk.files(), filesBefore, `files added/removed after ${JSON.stringify(args)}`);
    }
  } finally { rmSync(mk.dir, { recursive: true, force: true }); }
});

test('seed CLI: an invalid batch leaves the default in-scope database and journal untouched', () => {
  const paths = [DEFAULT_DB_PATH, ...['-journal', '-wal', '-shm'].map((s) => DEFAULT_DB_PATH + s)];
  const before = snap(paths);
  for (const [args, env] of [[['--tx-batch', '0'], {}], [['--tx-batch'], {}], [[], { POC_SEED_TX_BATCH: 'x' }], [['--unknown'], {}]]) {
    const r = run(args, env);
    assert.equal(r.status, 2, `${JSON.stringify(args)} ${r.stderr}`);
    assert.deepEqual(snap(paths), before);
  }
});

test('seed CLI: sibling-prefix and escaping paths are refused unless --allow-outside is explicit, and nothing is created', () => {
  const targets = [
    `${POC_ROOT}-r3-sibling-${process.pid}/poc.sqlite`,                        // sibling of commercial-poc sharing its prefix
    `${DATA_DIR}-r3-sibling-${process.pid}/poc.sqlite`,                        // sibling of .data sharing its prefix
    join(POC_ROOT, `r3-not-data-${process.pid}.sqlite`),                       // inside commercial-poc but outside .data
    join(DATA_DIR, '..', 'src', `r3-escape-${process.pid}.sqlite`),            // .. escape
    join(tmpdir(), `r3-outside-${process.pid}`, 'poc.sqlite'),
  ];
  for (const t of targets) {
    const r = run(['--db', t, '--tx-batch', '5000']);
    assert.equal(r.status, 2, `${t}: ${r.stderr}`);
    assert.match(r.stderr, /refusing --db outside/);
    assert.equal(existsSync(t), false, t);
    assert.equal(existsSync(dirname(t)) && dirname(t).includes('r3-'), false, `${dirname(t)} must not be created`);
  }
  // Pure check: the prefix-sharing sibling would have passed the old startsWith() test.
  assert.equal(`${POC_ROOT}-evil/x.sqlite`.startsWith(POC_ROOT), true);
  assert.equal(isStrictlyInside(DATA_DIR, `${DATA_DIR}-evil/x.sqlite`), false);
  assert.equal(isStrictlyInside(DATA_DIR, join(DATA_DIR, 'poc.sqlite')), true);
  assert.equal(isStrictlyInside(DATA_DIR, DATA_DIR), false);
  // With the explicit flag the same sibling path is accepted by the parser (no file is touched by parsing).
  assert.equal(parse(['--db', `${POC_ROOT}-r3-sibling/poc.sqlite`, '--allow-outside']).allowOutside, true);
});

test('seed CLI: non-SQLite files, directories and non-.sqlite names are never replaced', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wwk-poc-seed-cli-'));
  try {
    const text = join(dir, 'notes.sqlite'); writeFileSync(text, 'not a database');
    const asDir = join(dir, 'folder.sqlite'); mkdirSync(asDir);
    const wrongExt = join(dir, 'data.db'); writeFileSync(wrongExt, 'x');
    const before = snap([text, wrongExt]);
    assert.match(run(['--db', text, '--allow-outside']).stderr, /not a SQLite database/);
    assert.match(run(['--db', asDir, '--allow-outside']).stderr, /not a regular file/);
    assert.match(run(['--db', wrongExt, '--allow-outside']).stderr, /must name a \*\.sqlite file/);
    assert.deepEqual(snap([text, wrongExt]), before);
    assert.equal(statSync(asDir).isDirectory(), true);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('seed args: symlinks inside the data directory cannot escape it', () => {
  const root = mkdtempSync(join(tmpdir(), 'wwk-poc-seed-cli-'));
  try {
    const dataDir = join(root, '.data'); mkdirSync(dataDir);
    const outside = join(root, 'outside'); mkdirSync(outside);
    symlinkSync(outside, join(dataDir, 'link'));
    const opts = { cwd: root, dataDir, defaultDbPath: join(dataDir, 'poc.sqlite') };
    assert.throws(() => parseSeedArgs(['--db', join(dataDir, 'link', 'poc.sqlite')], {}, opts), (e) => e instanceof SeedArgError && /refusing --db outside/.test(e.message));
    assert.equal(parseSeedArgs([], {}, opts).dbPath, join(dataDir, 'poc.sqlite'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('seed args: batch precedence and the default in-scope target', () => {
  const d = parse([]);
  assert.deepEqual({ db: d.dbPath, n: d.txBatchSize, src: d.txBatchSource, out: d.allowOutside }, { db: DEFAULT_DB_PATH, n: 5000, src: 'default', out: false });
  assert.equal(parse([], { POC_SEED_TX_BATCH: '250' }).txBatchSize, 250);
  assert.equal(parse([], { POC_SEED_TX_BATCH: '250' }).txBatchSource, 'env');
  const c = parse(['--tx-batch', 'all'], { POC_SEED_TX_BATCH: 'bogus' });
  assert.deepEqual([c.txBatchSize, c.txBatchSource], [Infinity, 'cli'], 'CLI overrides (and bypasses) the env value');
  assert.equal(parse(['--db', '.data/other.sqlite']).dbPath, join(DATA_DIR, 'other.sqlite'));
  assert.throws(() => parse(['--tx-batch', '100000001']), SeedArgError);
});

test('seed CLI: a valid run still replaces the previous synthetic database and removes its journal', () => {
  const mk = markerDir();
  try {
    const r = run(['--db', mk.db, '--allow-outside', '--tx-batch', 'all']);
    assert.equal(r.status, 0, r.stderr);
    const out = JSON.parse(r.stdout);
    assert.deepEqual(out.replaced_files.sort(), [mk.db, mk.journal].sort());
    assert.equal(out.tx_batch_source, 'cli');
    assert.equal(out.ingest.transactions, 1);
    for (const t of Object.values(out.tenants)) assert.equal(t.reconciliation_ok, true);
    assert.equal(existsSync(mk.journal), false);
    const db = openDb(mk.db);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name = 'r3_marker'").get().n, 0);
    assert.equal(Number(db.prepare('SELECT COUNT(*) AS n FROM tenants').get().n), 3);
    db.close();
  } finally { rmSync(mk.dir, { recursive: true, force: true }); }
});
