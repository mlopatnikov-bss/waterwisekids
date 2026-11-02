// Portal authentication adapters.
//
// DEMO MODE is a local test harness, not security: anyone at the keyboard can pick
// any fixture user. It exists so tenant isolation can be exercised end to end.
// It only runs bound to loopback, uses a random per-process signing key, and the
// tenant shown is always re-checked against tenant_memberships on every request.
// Neither a URL parameter nor a display name ever grants access.
//
// PRODUCTION MODE deliberately has no implementation in Phase 1. It must be a
// managed identity/access provider (verified signed assertion -> users.auth_subject).
// There is no password storage anywhere in this codebase.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'wwkpoc_demo_session';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const b64u = (buf) => Buffer.from(buf).toString('base64url');

export class ProductionAuthNotConfigured extends Error {
  constructor() {
    super('Production auth adapter is not configured. Phase 1 ships demo mode only; production requires a reviewed managed-identity adapter (Phase 3). Refusing to start.');
    this.code = 'production_auth_not_configured';
  }
}

export function createAuth({ mode, db, now = () => Date.now(), secret = randomBytes(32) }) {
  if (mode === 'production') throw new ProductionAuthNotConfigured();
  if (mode !== 'demo') throw new Error(`unknown auth mode: ${mode}`);
  if (process.env.NODE_ENV === 'production') throw new Error('Demo auth refuses to run with NODE_ENV=production.');

  const sign = (data) => createHmac('sha256', secret).update(data).digest();

  function issue(userId) {
    const body = b64u(JSON.stringify({ u: userId, iat: now(), exp: now() + SESSION_TTL_MS, n: b64u(randomBytes(8)) }));
    return `${body}.${b64u(sign(body))}`;
  }

  function verify(token) {
    if (typeof token !== 'string' || token.length > 512) return null;
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const expected = sign(body);
    const got = Buffer.from(sig, 'base64url');
    if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
    let claims;
    try { claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch { return null; }
    if (!claims || typeof claims.u !== 'string' || typeof claims.exp !== 'number' || claims.exp < now()) return null;
    return claims;
  }

  return {
    mode,
    demoUsers() {
      return db.prepare('SELECT user_id, display_label FROM users WHERE is_demo = 1 ORDER BY display_label').all();
    },
    /** Start a demo session for a fixture user id (must exist and be a demo user). */
    login(userId) {
      const u = db.prepare('SELECT user_id FROM users WHERE user_id = ? AND is_demo = 1').get(userId);
      return u ? issue(u.user_id) : null;
    },
    /** Resolve a request's session from its cookie. Returns null if absent/invalid. */
    resolve(req) {
      const token = parseCookies(req.headers.cookie || '')[SESSION_COOKIE];
      const claims = verify(token);
      if (!claims) return null;
      const u = db.prepare('SELECT user_id, display_label FROM users WHERE user_id = ?').get(claims.u);
      return u ? { userId: u.user_id, label: u.display_label, mode } : null;
    },
    cookieHeader(token) {
      return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_MS / 1000}`;
    },
    clearCookieHeader() {
      return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
    },
  };
}

export function parseCookies(header) {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (k && !(k in out)) out[k] = part.slice(i + 1).trim();
  }
  return out;
}
