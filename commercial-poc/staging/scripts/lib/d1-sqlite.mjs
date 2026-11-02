// Node-only D1 adapter over the built-in node:sqlite, used by the zero-dependency test
// suite and by the seed builder. It implements the subset of the D1 binding API the
// Workers use (prepare/bind/first/all/run/batch/exec) with D1's semantics:
//   - every call is async;
//   - batch() runs its statements in order inside ONE transaction and rolls back on error;
//   - binding `undefined` is an error; rows are plain objects.
// Real D1 behaviour is exercised separately with Wrangler/workerd (scripts/e2e-workerd.mjs).
import { readFileSync } from 'node:fs';

const originalEmit = process.emitWarning;
process.emitWarning = function patchedEmitWarning(warning, ...rest) {
  const text = typeof warning === 'string' ? warning : warning?.message;
  if (typeof text === 'string' && text.includes('SQLite is an experimental feature')) return;
  return originalEmit.call(process, warning, ...rest);
};
const { DatabaseSync } = await import('node:sqlite');

const norm = (v) => {
  if (v === undefined) throw new TypeError('D1_TYPE_ERROR: Type undefined is not supported');
  if (typeof v === 'boolean') return v ? 1 : 0;
  return v;
};
const plain = (row) => (row ? { ...row } : row);

class Statement {
  constructor(adapter, sql, params = []) { this.adapter = adapter; this.sql = sql; this.params = params; }
  bind(...values) { return new Statement(this.adapter, this.sql, values.map(norm)); }
  #prepared() { this.adapter.calls += 1; return this.adapter.db.prepare(this.sql); }
  #allSync() {
    const st = this.#prepared();
    const isRead = /^\s*(SELECT|WITH|PRAGMA)\b/i.test(this.sql) || /\bRETURNING\b/i.test(this.sql);
    if (isRead) {
      const results = st.all(...this.params).map(plain);
      return { success: true, results, meta: { changes: /^\s*(SELECT|WITH|PRAGMA)\b/i.test(this.sql) ? 0 : results.length, last_row_id: 0 } };
    }
    const r = st.run(...this.params);
    return { success: true, results: [], meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
  }
  async all() { return this.#allSync(); }
  async run() { return this.#allSync(); }
  async first(column) {
    const r = this.#allSync().results[0];
    if (r === undefined) return null;
    return column ? r[column] : r;
  }
  _runInBatch() { return this.#allSync(); }
}

export class D1Sqlite {
  constructor(path = ':memory:') {
    this.db = new DatabaseSync(path);
    this.db.exec('PRAGMA foreign_keys = ON;');
    this.calls = 0;
  }
  prepare(sql) { return new Statement(this, sql); }
  async batch(statements) {
    if (!Array.isArray(statements)) throw new TypeError('batch() expects an array');
    this.db.exec('BEGIN');
    try {
      const out = statements.map((s) => s._runInBatch());
      this.db.exec('COMMIT');
      return out;
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }
  async exec(sql) { this.calls += 1; this.db.exec(sql); return { count: 1, duration: 0 }; }
  close() { this.db.close(); }
}

/** Fresh in-memory D1 adapter with the staging migrations applied in order. */
export function migratedD1(migrationFiles) {
  const d1 = new D1Sqlite(':memory:');
  for (const f of migrationFiles) d1.db.exec(readFileSync(f, 'utf8'));
  return d1;
}
