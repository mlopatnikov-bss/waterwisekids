#!/usr/bin/env node
// Builds seed/pilot-manifest.json and docs/SOURCE-CONFLICTS.md from repository
// sources (read-only) and the recorded official-operator snapshot.
// Usage: node scripts/build-manifest.mjs [--repo-root <path>] [--check]
//   --check  exit non-zero if the committed manifest differs (ignoring generated_at)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest, conflictsMarkdown } from '../src/manifest.mjs';

const pocRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const argVal = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : undefined; };
const repoRoot = resolve(argVal('--repo-root') || join(pocRoot, '..'));
const check = args.includes('--check');

const config = JSON.parse(readFileSync(join(pocRoot, 'seed/pilot-tenants.json'), 'utf8'));
const snapshot = JSON.parse(readFileSync(join(pocRoot, config.official_snapshot), 'utf8'));
const manifestPath = join(pocRoot, 'seed/pilot-manifest.json');

const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null;
const manifest = buildManifest({ repoRoot, pocRoot, config, snapshot, generatedAt: new Date().toISOString() });

const strip = (m) => JSON.stringify({ ...m, generated_at: null });
if (check) {
  if (!previous || strip(previous) !== strip(manifest)) {
    console.error('pilot-manifest.json is stale relative to current sources. Re-run without --check.');
    process.exit(1);
  }
  console.log('pilot-manifest.json matches current sources.');
  process.exit(0);
}
if (previous && strip(previous) === strip(manifest)) manifest.generated_at = previous.generated_at;

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(join(pocRoot, 'docs/SOURCE-CONFLICTS.md'), conflictsMarkdown(manifest));
const by = (k) => manifest.locations.filter((l) => l.status === k).length;
console.log(JSON.stringify({
  repo_root: repoRoot,
  tenants: manifest.tenants.length,
  locations: manifest.locations.length,
  eligible_fixture: by('eligible_fixture'),
  needs_owner_confirmation: by('needs_owner_confirmation'),
  needs_address_confirmation: by('needs_address_confirmation'),
  placements: manifest.placements.length,
  skipped_placements: manifest.skipped_placements.length,
  conflicts: manifest.conflicts.length,
}, null, 2));
