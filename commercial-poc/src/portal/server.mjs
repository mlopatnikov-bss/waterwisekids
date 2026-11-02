// Portal HTTP handler (server-rendered, no client JS).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { POC_ROOT, DEFAULT_RANGE_DAYS, MAX_RANGE_DAYS } from '../config.mjs';
import { scopeForSession, membershipsFor } from '../scope.mjs';
import { runQuality } from '../quality.mjs';
import { addDays, daysBetweenInclusive, isValidDate, localDate } from '../time.mjs';
import { loginPage, noAccessPage, notFoundPage, errorPage, overviewPage } from './views.mjs';

const CSS = readFileSync(join(POC_ROOT, 'src/portal/portal.css'), 'utf8');

export const SECURITY_HEADERS = Object.freeze({
  'Content-Security-Policy': "default-src 'none'; style-src 'self'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'same-origin',
  'Cache-Control': 'no-store',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
});

function send(res, status, body, type = 'text/html; charset=utf-8', extra = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': type, ...extra });
  res.end(body);
}
const redirect = (res, to, extra = {}) => send(res, 303, '', 'text/plain; charset=utf-8', { Location: to, ...extra });

function sameOrigin(req) {
  const host = req.headers.host;
  const origin = req.headers.origin;
  if (origin && origin !== 'null') return origin === `http://${host}`;
  return req.headers['sec-fetch-site'] === 'same-origin';
}

function readForm(req, limit = 1024) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('form_too_large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(new URLSearchParams(Buffer.concat(chunks).toString('utf8'))));
    req.on('error', reject);
  });
}

export function resolveRange(query, { asOf, timezone }) {
  const end = addDays(localDate(Date.parse(asOf), timezone), -1);
  const def = { from: addDays(end, -(DEFAULT_RANGE_DAYS - 1)), to: end, adjusted: false };
  const f = query.get('from'); const t = query.get('to');
  if (f === null && t === null) return def;
  if (!isValidDate(f) || !isValidDate(t) || f > t) return { ...def, adjusted: true };
  let from = f; let to = t;
  if (to > end) to = end;
  if (from > to) return { ...def, adjusted: true };
  if (daysBetweenInclusive(from, to) > MAX_RANGE_DAYS) from = addDays(to, -(MAX_RANGE_DAYS - 1));
  return { from, to, adjusted: from !== f || to !== t };
}

export function createPortalHandler({ db, auth, asOf, log = (msg) => console.error(msg) }) {
  return async function handle(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let session = null; let memberships = [];
    try {
      if (req.method === 'GET' && url.pathname === '/assets/portal.css') return send(res, 200, CSS, 'text/css; charset=utf-8', { 'Cache-Control': 'no-cache' });
      if (req.method === 'GET' && url.pathname === '/healthz') return send(res, 200, JSON.stringify({ ok: true }), 'application/json');

      if (url.pathname === '/demo/login') {
        if (req.method === 'GET') { const p = loginPage({ users: auth.demoUsers() }); return send(res, p.status, p.body); }
        if (req.method === 'POST') {
          if (!sameOrigin(req)) return send(res, 403, 'Cross-site form submission refused.', 'text/plain; charset=utf-8');
          const form = await readForm(req);
          const token = auth.login(form.get('user_id') || '');
          if (!token) { const p = loginPage({ users: auth.demoUsers(), error: 'Unknown demo user.' }); return send(res, 400, p.body); }
          return redirect(res, '/', { 'Set-Cookie': auth.cookieHeader(token) });
        }
        return send(res, 405, 'Method not allowed', 'text/plain; charset=utf-8', { Allow: 'GET, POST' });
      }
      if (url.pathname === '/demo/logout') {
        if (req.method !== 'POST') return send(res, 405, 'Method not allowed', 'text/plain; charset=utf-8', { Allow: 'POST' });
        if (!sameOrigin(req)) return send(res, 403, 'Cross-site form submission refused.', 'text/plain; charset=utf-8');
        return redirect(res, '/demo/login', { 'Set-Cookie': auth.clearCookieHeader() });
      }

      session = auth.resolve(req);
      if (!session) return redirect(res, '/demo/login');
      memberships = membershipsFor(db, session.userId);
      if (req.method !== 'GET') return send(res, 405, 'Method not allowed', 'text/plain; charset=utf-8', { Allow: 'GET' });

      if (url.pathname === '/') {
        if (!memberships.length) { const p = noAccessPage({ session }); return send(res, p.status, p.body); }
        return redirect(res, `/t/${memberships[0].tenant_id}/`);
      }

      const m = url.pathname.match(/^\/t\/(ten_[a-f0-9]{16})\/(quality\.json)?$/);
      const scope = m ? scopeForSession(db, session, m[1]) : null;
      if (!scope) { const p = notFoundPage({ session, memberships }); return send(res, p.status, p.body); }

      const tenant = scope.tenant();
      const extent = scope.dataExtent();
      const { from, to } = resolveRange(url.searchParams, { asOf, timezone: tenant.timezone });
      const quality = runQuality(db, { tenantId: scope.tenantId, asOf, from, to, record: false });
      if (m[2] === 'quality.json') return send(res, 200, JSON.stringify(quality, null, 2), 'application/json; charset=utf-8');

      const page = overviewPage({
        session, memberships, tenant, from, to, asOf, extent,
        totals: scope.totals(from, to), conv: scope.conversionTotals(from, to), daily: scope.daily(from, to),
        placements: scope.byPlacement(from, to), locations: scope.byLocation(from, to), destinations: scope.byDestination(from, to),
        conversions: scope.conversions(from, to), quality, comparison: scope.baselineComparison(), campaigns: scope.campaigns(),
      });
      return send(res, page.status, page.body);
    } catch (err) {
      const ref = randomBytes(6).toString('hex');
      log(`[portal] error ref=${ref} ${err && err.stack ? err.stack.split('\n')[0] : err}`);
      if (res.headersSent) return res.end();
      const p = errorPage({ session, memberships, ref });
      return send(res, p.status, p.body);
    }
  };
}
