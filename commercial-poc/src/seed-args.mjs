// Argument parsing and target validation for scripts/seed.mjs.
//
// Everything here is read-only: it never creates, deletes or opens a database.
// seed.mjs calls parseSeedArgs() and only after it returns successfully removes the
// previous synthetic database and writes a new one.
import { closeSync, existsSync, lstatSync, openSync, readSync, realpathSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { DEFAULT_SEED_TX_BATCH, parseSeedTxBatch } from './config.mjs';

export const SEED_USAGE = 'Usage: node scripts/seed.mjs [--db <path.sqlite>] [--tx-batch <n|all>] [--allow-outside]\n'
  + '  --db             target database (default commercial-poc/.data/poc.sqlite). Must end in .sqlite and,\n'
  + '                   unless --allow-outside is given, resolve inside commercial-poc/.data/.\n'
  + '  --tx-batch       deliveries per SQLite transaction for this seed (default 5000). Overrides POC_SEED_TX_BATCH.\n'
  + '  --allow-outside  explicitly permit a --db path outside commercial-poc/.data/.';
export const SIDECARS = Object.freeze(['-journal', '-wal', '-shm']);
const SQLITE_HEADER = Buffer.from('SQLite format 3\u0000', 'latin1');
const VALUE_FLAGS = new Set(['--db', '--tx-batch']);
const BOOL_FLAGS = new Set(['--allow-outside', '--help']);

export class SeedArgError extends Error {
  constructor(message) { super(message); this.code = 'seed_arg_error'; }
}

/** Real path of p, resolving symlinks in every existing ancestor (p itself need not exist). */
export function realPathish(p) {
  const abs = resolve(p);
  const tail = [];
  let cur = abs;
  while (!existsSync(cur)) {
    const parent = dirname(cur);
    if (parent === cur) break;
    tail.unshift(basename(cur));
    cur = parent;
  }
  return join(realpathSync(cur), ...tail);
}

/** True only when child is strictly inside parent (no prefix-only matches, no '..'). */
export function isStrictlyInside(parent, child) {
  const rel = relative(parent, child);
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

function readHeader(path) {
  const fd = openSync(path, 'r');
  try {
    const buf = Buffer.alloc(SQLITE_HEADER.length);
    const n = readSync(fd, buf, 0, buf.length, 0);
    return buf.subarray(0, n);
  } finally { closeSync(fd); }
}

/**
 * @param argv process.argv.slice(2)
 * @param env  process.env (only POC_SEED_TX_BATCH is read)
 * @param opts { cwd, dataDir, defaultDbPath }
 * @returns {{ help: boolean, dbPath: string, txBatchSize: number, txBatchSource: 'cli'|'env'|'default', allowOutside: boolean, existing: string[] }}
 */
export function parseSeedArgs(argv, env, { cwd, dataDir, defaultDbPath }) {
  const seen = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const tok = argv[i];
    if (typeof tok !== 'string') throw new SeedArgError('invalid argument');
    if (tok.startsWith('--') && tok.includes('=')) throw new SeedArgError(`use "${tok.split('=')[0]} <value>", not "${tok}"`);
    if (VALUE_FLAGS.has(tok)) {
      if (seen.has(tok)) throw new SeedArgError(`${tok} given more than once`);
      const val = argv[i + 1];
      if (val === undefined || val === '' || val.startsWith('--')) throw new SeedArgError(`${tok} requires a value`);
      seen.set(tok, val);
      i += 1;
    } else if (BOOL_FLAGS.has(tok)) {
      if (seen.has(tok)) throw new SeedArgError(`${tok} given more than once`);
      seen.set(tok, true);
    } else {
      throw new SeedArgError(tok.startsWith('-') ? `unknown option ${tok}` : `unexpected argument ${JSON.stringify(tok)}`);
    }
  }
  const help = seen.has('--help');
  const allowOutside = seen.has('--allow-outside');

  let txBatchSize; let txBatchSource;
  try {
    if (seen.has('--tx-batch')) { txBatchSize = parseSeedTxBatch(seen.get('--tx-batch')); txBatchSource = 'cli'; }
    else if (Object.prototype.hasOwnProperty.call(env, 'POC_SEED_TX_BATCH')) { txBatchSize = parseSeedTxBatch(env.POC_SEED_TX_BATCH); txBatchSource = 'env'; }
    else { txBatchSize = DEFAULT_SEED_TX_BATCH; txBatchSource = 'default'; }
  } catch (err) {
    throw new SeedArgError(`${seen.has('--tx-batch') ? '--tx-batch' : 'POC_SEED_TX_BATCH'}: ${err.message}`);
  }

  const dbPath = resolve(cwd, seen.has('--db') ? seen.get('--db') : defaultDbPath);
  if (!dbPath.endsWith('.sqlite') || basename(dbPath) === '.sqlite') throw new SeedArgError(`--db must name a *.sqlite file: ${dbPath}`);
  if (!allowOutside && !isStrictlyInside(realPathish(dataDir), realPathish(dbPath))) {
    throw new SeedArgError(`refusing --db outside ${dataDir}${sep} (pass --allow-outside to override): ${dbPath}`);
  }

  // Anything that would be deleted must be a plain file, and the main file a SQLite database.
  const existing = [];
  for (const p of [dbPath, ...SIDECARS.map((s) => dbPath + s)]) {
    if (!existsSync(p)) continue;
    const st = lstatSync(p);
    if (!st.isFile()) throw new SeedArgError(`refusing to replace ${p}: not a regular file`);
    if (p === dbPath && st.size > 0 && !readHeader(p).equals(SQLITE_HEADER)) throw new SeedArgError(`refusing to replace ${p}: not a SQLite database`);
    existing.push(p);
  }
  return { help, dbPath, txBatchSize, txBatchSource, allowOutside, existing };
}
