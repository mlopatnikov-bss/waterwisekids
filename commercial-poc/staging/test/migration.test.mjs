// D1 migration: Phase 1 schema unchanged, applies cleanly, idempotent, Wrangler naming.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { D1Sqlite } from '../scripts/lib/d1-sqlite.mjs';
import { TABLES } from '../scripts/lib/sql-dump.mjs';
import { MIGRATIONS, STAGING_ROOT, POC_ROOT, freshD1 } from './support.mjs';

const ddl = async (db) => (await db.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name").all()).results;

test('migrations are Wrangler-named and ordered', () => {
  const files = readdirSync(join(STAGING_ROOT, 'migrations'));
  assert.deepEqual(files, ['0001_initial.sql', '0002_operator_roles.sql']);
  assert.equal(MIGRATIONS.length, 2);
});

test('the D1 schema is the accepted Phase 1 schema: identical tables, columns, constraints and indexes', async () => {
  const phase1 = new D1Sqlite(':memory:');
  phase1.db.exec(readFileSync(join(POC_ROOT, 'src/schema.sql'), 'utf8'));
  const staging = freshD1();
  assert.deepEqual((await ddl(staging)).filter((row) => row.name !== 'operator_roles'), await ddl(phase1));
  assert.equal((await ddl(staging)).filter((row) => row.name === 'operator_roles').length, 1);
  assert.ok((await ddl(staging)).filter((r) => r.type === 'table').length >= 17);
});

test('the explicit D1 dump projections match migration column order', async () => {
  const db = freshD1();
  for (const [table, , expected] of TABLES) {
    const actual = (await db.prepare(`PRAGMA table_info("${table}")`).all()).results
      .sort((a, b) => a.cid - b.cid)
      .map((row) => row.name);
    assert.deepEqual(expected, actual, table);
  }
});

test('migration records schema_version 2, enforces foreign keys, and re-applying it is a no-op', async () => {
  const db = freshD1();
  assert.equal((await db.prepare("SELECT value FROM schema_meta WHERE key = 'schema_version'").first()).value, '2');
  const before = await ddl(db);
  for (const migration of MIGRATIONS) db.db.exec(readFileSync(migration, 'utf8'));
  assert.deepEqual(await ddl(db), before);
  await assert.rejects(db.prepare("INSERT INTO schools (school_id, tenant_id, display_name, official_url, sources_json) VALUES ('sch_x','ten_missing','x','https://x','[]')").run(), /FOREIGN KEY/);
});

test('operator admin is an explicit role with foreign-key enforcement', async () => {
  const db = freshD1();
  await assert.rejects(db.prepare("INSERT INTO operator_roles (user_id, role, granted_at, granted_by) VALUES ('usr_missing','admin','2026-11-02T00:00:00Z','test')").run(), /FOREIGN KEY/);
  await db.prepare("INSERT INTO users (user_id, display_label, auth_subject, is_demo) VALUES ('usr_test','test',NULL,0)").run();
  await assert.rejects(db.prepare("INSERT INTO operator_roles (user_id, role, granted_at, granted_by) VALUES ('usr_test','viewer','2026-11-02T00:00:00Z','test')").run(), /CHECK/);
  await db.prepare("INSERT INTO operator_roles (user_id, role, granted_at, granted_by) VALUES ('usr_test','admin','2026-11-02T00:00:00Z','test')").run();
  assert.equal((await db.prepare("SELECT role FROM operator_roles WHERE user_id='usr_test'").first()).role, 'admin');
});

test('migration SQL has no explicit transaction, PRAGMA or attach (D1 constraints)', () => {
  const sql = MIGRATIONS.map((path) => readFileSync(path, 'utf8')).join('\n').replace(/--.*$/gm, '');
  assert.doesNotMatch(sql, /\b(BEGIN|COMMIT|ROLLBACK|PRAGMA|ATTACH|VACUUM)\b/i);
});
