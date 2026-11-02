import { dirname, resolve, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

export const STAGING_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const POC_ROOT = resolve(STAGING_ROOT, '..');
export const REPO_ROOT = resolve(POC_ROOT, '..');
export const MANIFEST_PATH = join(POC_ROOT, 'seed/pilot-manifest.json');
export const STATE_MARKER = '.wwk-staging-local-state';
/** The ONLY directory local scripts write to (teardown removes only this). Default: staging/.data */
export function stateDir(env = process.env) {
  const d = env.WWK_STAGING_STATE_DIR ? resolve(env.WWK_STAGING_STATE_DIR) : join(STAGING_ROOT, '.data');
  return d;
}
export const isInside = (parent, child) => { const r = relative(parent, child); return r !== '' && !r.startsWith('..') && !isAbsolute(r); };
