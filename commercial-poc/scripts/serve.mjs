#!/usr/bin/env node
// Starts the local portal and collector on loopback only, in demo auth mode.
// Usage: node scripts/serve.mjs [--db <path>]
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { openDb } from '../src/db.mjs';
import { buildRegistry } from '../src/registry.mjs';
import { createAuth } from '../src/portal/auth.mjs';
import { createPortalHandler } from '../src/portal/server.mjs';
import { createCollectorHandler } from '../src/http-collector.mjs';
import { DEFAULT_DB_PATH, AS_OF, PORTAL_PORT, COLLECTOR_PORT, LOOPBACK } from '../src/config.mjs';

const args = process.argv.slice(2);
const i = args.indexOf('--db');
const dbPath = resolve(i >= 0 ? args[i + 1] : DEFAULT_DB_PATH);
const host = process.env.POC_HOST || LOOPBACK;
const authMode = process.env.POC_AUTH_MODE || 'demo';

if (!['127.0.0.1', '::1', 'localhost'].includes(host)) {
  console.error(`Refusing to bind ${host}: the POC runs on loopback only.`);
  process.exit(2);
}
// Validate the auth mode BEFORE touching any database file (openDb runs migrations).
if (authMode !== 'demo') {
  try { createAuth({ mode: authMode, db: null }); } catch (err) { console.error(err.message); process.exit(3); }
}
if (!existsSync(dbPath)) {
  console.error(`No database at ${dbPath}. Run: node scripts/seed.mjs`);
  process.exit(2);
}
const db = openDb(dbPath);
let auth;
try { auth = createAuth({ mode: authMode, db }); } catch (err) { console.error(err.message); process.exit(3); }
const portal = createServer(createPortalHandler({ db, auth, asOf: AS_OF }));
const collector = createServer(createCollectorHandler({ db, registry: buildRegistry(db), allowedOrigins: ['https://www.waterwisekids.com', `http://${host}:${PORTAL_PORT}`] }));
portal.listen(PORTAL_PORT, host, () => console.log(`Portal (DEMO AUTH, local only): http://${host}:${PORTAL_PORT}/`));
collector.listen(COLLECTOR_PORT, host, () => console.log(`Collector: http://${host}:${COLLECTOR_PORT}/v1/collect`));
const stop = () => { portal.close(); collector.close(); db.close(); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
