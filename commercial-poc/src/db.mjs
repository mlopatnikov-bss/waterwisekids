// Local storage adapter: node:sqlite (built in to Node >= 22.13, no dependency).
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Silence only the one-line ExperimentalWarning for node:sqlite; all other warnings pass through.
const originalEmit = process.emitWarning;
process.emitWarning = function patchedEmitWarning(warning, ...rest) {
  const text = typeof warning === 'string' ? warning : warning?.message;
  if (typeof text === 'string' && text.includes('SQLite is an experimental feature')) return;
  return originalEmit.call(process, warning, ...rest);
};
const { DatabaseSync } = await import('node:sqlite');

const here = dirname(fileURLToPath(import.meta.url));
export const SCHEMA_VERSION = '1';

export function openDb(path = ':memory:') {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys = ON;');
  if (path !== ':memory:') {
    db.exec('PRAGMA journal_mode = DELETE;');
    db.exec('PRAGMA busy_timeout = 5000;');
  }
  migrate(db);
  return db;
}

export function migrate(db) {
  db.exec(readFileSync(join(here, 'schema.sql'), 'utf8'));
  db.prepare('INSERT OR REPLACE INTO schema_meta (key, value) VALUES (?, ?)').run('schema_version', SCHEMA_VERSION);
}

/** Run fn inside a transaction; rolls back on throw. */
export function tx(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function audit(db, { actor, action, tenantId = null, detail = {} , at = new Date().toISOString() }) {
  db.prepare('INSERT INTO audit_log (at, actor, action, tenant_id, detail_json) VALUES (?, ?, ?, ?, ?)')
    .run(at, actor, action, tenantId, JSON.stringify(detail));
}
