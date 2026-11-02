#!/usr/bin/env node
// Builds the Phase 2 proposal artefacts under commercial-poc/proposal/ ONLY.
// Usage: node proposal/scripts/build-proposal.mjs [--check]
//   --check  rebuild in memory and fail if any committed artefact is stale; writes nothing.
// Never writes to a public WWK file.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { buildProposal, PROPOSAL_ROOT, REPO_ROOT } from '../src/build.mjs';
import { treeFingerprint } from '../src/snapshot.mjs';
import { inventoryJson, inventoryMarkdown, diffName } from '../src/report.mjs';
import { RELEASE_BLOCKERS, PHASE3_PREREQUISITES, pageDisposition } from '../src/dispositions.mjs';

const check = process.argv.includes('--check');
const extra = process.argv.slice(2).filter((a) => a !== '--check');
if (extra.length) { console.error(`unknown arguments: ${extra.join(' ')}`); process.exit(2); }

const b = buildProposal();
for (const p of b.pages) p.disposition = pageDisposition(p);
const tree = treeFingerprint(REPO_ROOT);
const snapshot = { file_count: tree.file_count, aggregate_sha256: tree.aggregate_sha256 };

const outputs = new Map();
const put = (rel, text) => {
  const abs = resolve(PROPOSAL_ROOT, rel);
  if (relative(PROPOSAL_ROOT, abs).startsWith('..')) throw new Error(`refusing to write outside proposal/: ${abs}`);
  outputs.set(abs, text);
};
put('diffs/00-new-assets.diff', b.assets.map((a) => a.diff).join(''));
b.pages.forEach((p, i) => put(`diffs/${diffName(i, p.page_path)}`, p.diff));
put('inventory.json', JSON.stringify(inventoryJson(b, { snapshot, releaseBlockers: RELEASE_BLOCKERS, phase3: PHASE3_PREREQUISITES }), null, 2) + '\n');
put('INVENTORY.md', inventoryMarkdown(b, { snapshot, releaseBlockers: RELEASE_BLOCKERS, phase3: PHASE3_PREREQUISITES }) + '\n');
put('source-snapshot.json', JSON.stringify({
  about: 'Read-only fingerprint of the public WWK source (everything outside commercial-poc/, .git, node_modules, .next, .DS_Store, ._*) at proposal build time. Tests recompute it to prove no public file changed.',
  ...snapshot, target_pages: Object.fromEntries(b.pages.map((p) => [p.source_file, p.source_sha256])),
  absent_asset_paths: b.assets.map((a) => a.path),
}, null, 2) + '\n');

if (check) {
  const stale = [];
  for (const [abs, text] of outputs) if (!existsSync(abs) || readFileSync(abs, 'utf8') !== text) stale.push(relative(PROPOSAL_ROOT, abs));
  if (stale.length) { console.error(`stale proposal artefacts: ${stale.join(', ')}`); process.exit(1); }
  console.log(JSON.stringify({ check: 'ok', artefacts: outputs.size, pages: b.pages.length, source_tree: snapshot }, null, 2));
} else {
  for (const [abs, text] of outputs) { mkdirSync(join(abs, '..'), { recursive: true }); writeFileSync(abs, text); }
  console.log(JSON.stringify({ written: [...outputs.keys()].map((k) => relative(PROPOSAL_ROOT, k)), pages: b.pages.length, source_tree: snapshot }, null, 2));
}
