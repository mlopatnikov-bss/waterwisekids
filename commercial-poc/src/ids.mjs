// Opaque, stable identifiers.
//
// Entity IDs are derived from a namespaced SHA-256 of a natural key (for example an
// official location URL) so that regenerating the manifest from the same sources
// yields the same IDs. They carry no display name and are never an authorization
// boundary on their own: every access check goes through tenant membership.
import { createHash, randomUUID } from 'node:crypto';

export const ENTITY_PREFIXES = Object.freeze(['ten', 'sch', 'loc', 'cmp', 'plc', 'dst', 'usr']);
export const ENTITY_ID_RE = /^(ten|sch|loc|cmp|plc|dst|usr)_[a-f0-9]{16}$/;
export const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function stableId(prefix, naturalKey) {
  if (!ENTITY_PREFIXES.includes(prefix)) throw new Error(`unknown id prefix: ${prefix}`);
  if (typeof naturalKey !== 'string' || naturalKey.length === 0) throw new Error('natural key required');
  const digest = createHash('sha256').update(`wwk-poc:v1:${prefix}:${naturalKey}`).digest('hex');
  return `${prefix}_${digest.slice(0, 16)}`;
}

export function isEntityId(value, prefix) {
  if (typeof value !== 'string' || !ENTITY_ID_RE.test(value)) return false;
  return prefix ? value.startsWith(`${prefix}_`) : true;
}

export function newUuid() {
  return randomUUID();
}

export function sha256Hex(text) {
  return createHash('sha256').update(text).digest('hex');
}
