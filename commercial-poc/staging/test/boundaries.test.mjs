// Phase 3 may write only under commercial-poc/staging/. Prove all accepted
// Phase 1/2 POC files and the public WWK tree are byte-identical snapshots.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { POC_ROOT, REPO_ROOT } from '../scripts/lib/paths.mjs';
import { walkPublic } from '../../proposal/src/snapshot.mjs';

const sha = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

function* acceptedPocFiles(dir = POC_ROOT) {
  for (const name of readdirSync(dir).sort()) {
    if (dir === POC_ROOT && name === 'staging') continue;
    if (name === '.DS_Store' || name.startsWith('._') || name === '.data') continue;
    const path = join(dir, name);
    const stat = lstatSync(path);
    if (stat.isDirectory()) yield* acceptedPocFiles(path);
    else if (stat.isFile()) yield relative(POC_ROOT, path).split(sep).join('/');
  }
}

test('Phase 1 and accepted Phase 2 files outside staging are unchanged', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/protected-files.json', import.meta.url), 'utf8'));
  const actual = Object.fromEntries([...acceptedPocFiles()].map((rel) => [rel, sha(join(POC_ROOT, rel))]));
  assert.deepEqual(actual, fixture.files);
});

test('the public WWK source tree remains byte-identical to the Phase 2 snapshot', () => {
  const expected = JSON.parse(readFileSync(join(POC_ROOT, 'proposal/source-snapshot.json'), 'utf8'));
  // The Phase 3 coordination brief was intentionally added after the Phase 2
  // snapshot; it is project documentation, not public WWK source.
  const phase3Brief = 'docs/commercial-poc/CLAUDE-BRIEF-PHASE3.md';
  const aggregate = createHash('sha256');
  let count = 0;
  for (const rel of walkPublic(REPO_ROOT)) {
    if (rel === phase3Brief) continue;
    aggregate.update(`${rel}\0${sha(join(REPO_ROOT, rel))}\n`);
    count += 1;
  }
  assert.equal(count, expected.file_count);
  assert.equal(aggregate.digest('hex'), expected.aggregate_sha256);
});
