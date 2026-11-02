#!/usr/bin/env node
// Creates a fresh local database from the manifest and synthetic fixtures.
// Usage: node scripts/seed.mjs [--db <path.sqlite>] [--tx-batch <n|all>] [--allow-outside]
//
// Order of operations (R3): 1) parse and validate every argument, the env batch
// (POC_SEED_TX_BATCH), the target path and any existing files; 2) read the manifest;
// 3) only then delete the previous synthetic database and its sidecars and seed.
// Any failure in 1-2 exits with code 2 and leaves every file untouched.
import { readFileSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';
import { MANIFEST_PATH, DEFAULT_DB_PATH, AS_OF } from '../src/config.mjs';
import { parseSeedArgs, SeedArgError, SEED_USAGE, SIDECARS } from '../src/seed-args.mjs';

let opts;
try {
  opts = parseSeedArgs(process.argv.slice(2), process.env, { cwd: process.cwd(), dataDir: dirname(DEFAULT_DB_PATH), defaultDbPath: DEFAULT_DB_PATH });
} catch (err) {
  if (!(err instanceof SeedArgError)) throw err;
  console.error(`seed: ${err.message}\n${SEED_USAGE}`);
  process.exit(2);
}
if (opts.help) { console.log(SEED_USAGE); process.exit(0); }

let manifest;
try { manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')); } catch (err) {
  console.error(`seed: cannot read ${MANIFEST_PATH}: ${err.message}`);
  process.exit(2);
}

// Validation complete. Load the database modules only now (no file is touched before this point).
const { openDb } = await import('../src/db.mjs');
const { seedAll } = await import('../src/pipeline.mjs');
const { reconcile } = await import('../src/rollup.mjs');

for (const p of [opts.dbPath, ...SIDECARS.map((s) => opts.dbPath + s)]) rmSync(p, { force: true });
const db = openDb(opts.dbPath);
const t0 = Date.now();
const r = seedAll(db, manifest, { asOf: AS_OF, txBatchSize: opts.txBatchSize });
const elapsedMs = Date.now() - t0;
const out = { db: opts.dbPath, as_of: AS_OF, tx_batch_source: opts.txBatchSource, replaced_files: opts.existing, seed_elapsed_ms_this_run: elapsedMs, ingest: r.ingest, conversions: r.conv, tenants: {} };
for (const t of manifest.tenants) {
  out.tenants[t.tenant_key] = {
    tenant_id: t.tenant_id,
    expected: r.synth.expected.byTenant[t.tenant_id],
    reconciliation_ok: reconcile(db, { tenantId: t.tenant_id, from: '2000-01-01', to: '2999-12-31' }).ok,
    quality_status: r.quality[t.tenant_id].status,
  };
}
db.close();
console.log(JSON.stringify(out, null, 2));
