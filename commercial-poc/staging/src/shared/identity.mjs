// Maps a Cloudflare Access identity to an opaque auth subject:
//   subject = "sub_" + hex(HMAC-SHA-256(IDENTITY_HMAC_KEY, "wwk-commercial-staging:identity:v1:" + normalized email))
// Only the subject is stored (users.auth_subject). The email is never written to D1,
// logs or responses, and the key lives only in a Worker secret (never committed).
export const IDENTITY_CONTEXT = 'wwk-commercial-staging:identity:v1:';
export const MIN_KEY_BYTES = 32;
const PLACEHOLDER = /replace|example|placeholder|changeme/i;

/** Lower-cased, trimmed email, or null if it is not a plausible single address. */
export function normalizeEmail(value) {
  if (typeof value !== 'string') return null;
  const e = value.trim().toLowerCase();
  if (e.length < 3 || e.length > 254 || /\s/.test(e)) return null;
  const at = e.indexOf('@');
  if (at < 1 || at !== e.lastIndexOf('@') || at === e.length - 1) return null;
  return e;
}

/** Decode the HMAC key secret: hex only (generate with `openssl rand -hex 32`). Returns bytes or null if unusable. */
export function decodeHmacKey(raw) {
  if (typeof raw !== 'string' || PLACEHOLDER.test(raw)) return null;
  const s = raw.trim();
  if (!/^[0-9a-f]+$/i.test(s) || s.length % 2 !== 0 || s.length < MIN_KEY_BYTES * 2) return null;
  const bytes = new Uint8Array(s.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  if (bytes.every((x) => x === bytes[0])) return null; // all-zero / constant keys refused
  return bytes;
}

const keyCache = new Map();
async function importKey(raw) {
  let k = keyCache.get(raw);
  if (!k) {
    const bytes = decodeHmacKey(raw);
    if (!bytes) throw new Error('identity_key_unusable');
    k = crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    keyCache.set(raw, k);
  }
  return k;
}

/** Opaque subject for an email, or null if the email is not usable. */
export async function authSubjectFor(rawKey, email) {
  const e = normalizeEmail(email);
  if (!e) return null;
  const sig = await crypto.subtle.sign('HMAC', await importKey(rawKey), new TextEncoder().encode(IDENTITY_CONTEXT + e));
  return `sub_${[...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}
export const AUTH_SUBJECT_RE = /^sub_[0-9a-f]{64}$/;
