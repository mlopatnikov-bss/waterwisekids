// Local POC configuration. The fixed report time keeps fixture output reproducible;
// override with POC_AS_OF to see freshness change.
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const POC_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const MANIFEST_PATH = join(POC_ROOT, 'seed/pilot-manifest.json');
export const DEFAULT_DB_PATH = join(POC_ROOT, '.data/poc.sqlite');
export const AS_OF = process.env.POC_AS_OF || '2026-11-02T14:00:00.000Z';
export const SYNTH_FROM = '2026-08-04';
export const SYNTH_TO = '2026-11-01';
export const SYNTH_SEED = 20261102;
export const DEFAULT_RANGE_DAYS = 28;
// Deliveries per SQLite transaction for the LOCAL SYNTHETIC SEED only. Each delivery is
// still validated and deduplicated individually; this only sets how often the seed
// commits to disk. Unrelated to the HTTP collector's 25-event request cap.
export const DEFAULT_SEED_TX_BATCH = 5000;
export const MAX_SEED_TX_BATCH = 100_000_000;
/** Strict parser for a seed transaction batch: 'all' -> Infinity, or a positive decimal integer. */
export function parseSeedTxBatch(raw) {
  if (raw === 'all') return Infinity;
  if (typeof raw !== 'string' || !/^[1-9][0-9]*$/.test(raw) || Number(raw) > MAX_SEED_TX_BATCH) {
    throw new RangeError(`tx batch must be "all" or an integer from 1 to ${MAX_SEED_TX_BATCH}, got ${JSON.stringify(raw)}`);
  }
  return Number(raw);
}
// Library default (tests, seedAll). An invalid env value becomes NaN so seedAll refuses it
// before writing; scripts/seed.mjs validates the env value itself and exits with an error.
export const SEED_TX_BATCH = (() => {
  const raw = process.env.POC_SEED_TX_BATCH;
  if (raw === undefined) return DEFAULT_SEED_TX_BATCH;
  try { return parseSeedTxBatch(raw); } catch { return Number.NaN; }
})();
export const MAX_RANGE_DAYS = 120;
export const PORTAL_PORT = Number(process.env.POC_PORTAL_PORT || 4310);
export const COLLECTOR_PORT = Number(process.env.POC_COLLECTOR_PORT || 4311);
export const LOOPBACK = '127.0.0.1';
