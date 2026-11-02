import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { STAGING_ROOT } from './paths.mjs';
export const MIGRATIONS_DIR = join(STAGING_ROOT, 'migrations');
export const migrationFiles = () => readdirSync(MIGRATIONS_DIR).filter((f) => /^\d{4}_[a-z0-9_]+\.sql$/.test(f)).sort().map((f) => join(MIGRATIONS_DIR, f));
