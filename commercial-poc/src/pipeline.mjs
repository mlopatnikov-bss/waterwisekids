// End-to-end local seed: manifest -> synthetic deliveries -> collector -> conversion
// imports -> daily rollups -> data-quality runs. Used by scripts/seed.mjs and tests.
import { loadManifest, buildRegistry } from './registry.mjs';
import { ingestDeliveries } from './collector.mjs';
import { importConversions } from './conversions.mjs';
import { rollupRange } from './rollup.mjs';
import { runQuality } from './quality.mjs';
import { generateSynthetic } from './synthetic.mjs';
import { TenantScope } from './scope.mjs';
import { AS_OF, SYNTH_FROM, SYNTH_TO, SYNTH_SEED, DEFAULT_RANGE_DAYS, SEED_TX_BATCH } from './config.mjs';
import { addDays, localDate } from './time.mjs';

/**
 * @param txBatchSize deliveries per SQLite transaction (positive integer or Infinity).
 *   Every delivery keeps its own receipt time and passes the same per-event
 *   validation and dedupe as the HTTP collector; only the commit grouping changes.
 */
export function seedAll(db, manifest, { asOf = AS_OF, seed = SYNTH_SEED, from = SYNTH_FROM, to = SYNTH_TO, txBatchSize = SEED_TX_BATCH } = {}) {
  if (!(txBatchSize === Infinity || (Number.isInteger(txBatchSize) && txBatchSize >= 1))) {
    throw new RangeError(`txBatchSize must be a positive integer or Infinity, got ${txBatchSize}`);
  }
  loadManifest(db, manifest, { at: asOf });
  const registry = buildRegistry(db);
  const synth = generateSynthetic(manifest, { seed, from, to });

  const ingest = { accepted: 0, duplicates: 0, rejected: 0, deliveries: synth.deliveries.length, tx_batch_size: txBatchSize === Infinity ? 'all' : txBatchSize, transactions: 0 };
  const step = txBatchSize === Infinity ? Math.max(1, synth.deliveries.length) : txBatchSize;
  for (let i = 0; i < synth.deliveries.length; i += step) {
    const r = ingestDeliveries(db, registry, synth.deliveries.slice(i, i + step));
    ingest.accepted += r.accepted; ingest.duplicates += r.duplicates; ingest.rejected += r.rejected;
    ingest.transactions += 1;
  }

  const conv = { imported: 0, duplicate_import: 0, superseded: 0 };
  for (const b of [...synth.conversionBatches].sort((a, c) => (a.receivedAt < c.receivedAt ? -1 : a.receivedAt > c.receivedAt ? 1 : 0))) {
    const owner = manifest.memberships.find((m) => m.tenant_id === b.tenant_id && m.role === 'owner');
    const scope = new TenantScope(db, b.tenant_id, owner.user_id);
    const r = importConversions(db, scope, b.batch, { receivedAt: b.receivedAt });
    if (r.status === 'imported') { conv.imported += 1; conv.superseded += r.superseded; } else conv.duplicate_import += 1;
  }

  rollupRange(db, { from: addDays(from, -1), to: addDays(to, 1), computedAt: asOf, actor: 'seed' });

  const quality = {};
  for (const t of manifest.tenants) {
    const end = addDays(localDate(Date.parse(asOf), t.timezone), -1);
    quality[t.tenant_id] = runQuality(db, { tenantId: t.tenant_id, asOf, from: addDays(end, -(DEFAULT_RANGE_DAYS - 1)), to: end });
  }
  return { registry, synth, ingest, conv, quality };
}
