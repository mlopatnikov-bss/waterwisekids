// Read-only fingerprint of every public WWK file outside commercial-poc/.
import { readdirSync, readFileSync, lstatSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';

// Not part of the public site source: this package, git metadata, empty tool dirs and OS litter.
export const EXCLUDE_TOP = new Set(['commercial-poc', '.git', 'node_modules', '.next']);
export const EXCLUDE_NAME = (name) => name === '.DS_Store' || name.startsWith('._');

export function* walkPublic(root, dir = root) {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    const rel = relative(root, full);
    if (dir === root && EXCLUDE_TOP.has(name)) continue;
    if (EXCLUDE_NAME(name)) continue;
    const st = lstatSync(full);
    if (st.isDirectory()) yield* walkPublic(root, full);
    else if (st.isFile()) yield rel.split(sep).join('/');
  }
}

export function treeFingerprint(root) {
  const agg = createHash('sha256');
  let count = 0;
  const files = {};
  for (const rel of walkPublic(root)) {
    const h = createHash('sha256').update(readFileSync(join(root, rel))).digest('hex');
    agg.update(`${rel}\0${h}\n`);
    files[rel] = h;
    count += 1;
  }
  return { file_count: count, aggregate_sha256: agg.digest('hex'), files };
}
