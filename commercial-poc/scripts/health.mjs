#!/usr/bin/env node
// Prints the machine-readable health summary (operator use; never served by the portal).
// Usage: node scripts/health.mjs [--db <path>] [--from YYYY-MM-DD --to YYYY-MM-DD]
// Exit code: 0 ok/info, 1 warn, 2 critical.
import { resolve } from 'node:path';
import { openDb } from '../src/db.mjs';
import { healthSummary } from '../src/quality.mjs';
import { DEFAULT_DB_PATH, AS_OF, DEFAULT_RANGE_DAYS } from '../src/config.mjs';
import { addDays, localDate } from '../src/time.mjs';

const args = process.argv.slice(2);
const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
const db = openDb(resolve(val('--db') || DEFAULT_DB_PATH));
const to = val('--to') || addDays(localDate(Date.parse(AS_OF), 'America/New_York'), -1);
const from = val('--from') || addDays(to, -(DEFAULT_RANGE_DAYS - 1));
const summary = healthSummary(db, { asOf: AS_OF, from, to });
console.log(JSON.stringify(summary, null, 2));
db.close();
process.exitCode = { ok: 0, info: 0, warn: 1, critical: 2 }[summary.status];
