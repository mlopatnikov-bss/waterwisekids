// wwk-commercial-portal-staging: the PRIVATE tenant portal Worker, protected by Cloudflare
// Worker Access. Server-rendered HTML and CSS from Worker code only (no client JavaScript,
// no Workers Static Assets, no cookies or sessions of its own, no passwords).
//
// Request order (tested):
//   1. configuration check (D1 binding, HMAC secret, Access audience) -> 503, nothing read
//   2. GET/HEAD only -> 405
//   3. ctx.access must exist and ctx.access.aud must equal ACCESS_AUD -> 403, nothing read
//   4. identity email -> HMAC-SHA-256 opaque subject -> users.auth_subject
//   5. operator role and memberships are re-read on EVERY request
//   6. tenant-scoped reads only (TenantScope binds tenant_id on every query)
// There is no operator-wide health route. Tenant data quality is tenant-scoped.
import { overviewPage, noAccessPage, notFoundPage, errorPage } from '../../../src/portal/views.mjs';
import { addDays, daysBetweenInclusive, isValidDate, localDate } from '../../../src/time.mjs';
import { PORTAL_CSS } from './portal-css.generated.mjs';
import { adaptPage } from './layout.mjs';
import { applyPilotSections, pilotPlan } from './pilot-report.mjs';
import { authSubjectFor, decodeHmacKey } from '../shared/identity.mjs';
import { membershipsFor, scopeForUser } from '../shared/scope.mjs';
import { runQuality } from '../shared/quality.mjs';
import { PORTAL_SECURITY_HEADERS, randomRef } from '../shared/http.mjs';
import { isD1 } from '../shared/d1.mjs';

export const DEFAULT_RANGE_DAYS = 28;
export const MAX_RANGE_DAYS = 120;
const AUD_RE = /^[A-Za-z0-9_-]{8,256}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

/** Configuration problems (codes only). An empty list means the Worker may serve. */
export function portalConfigProblems(env) {
  const p = [];
  if (!env || !isD1(env.DB)) p.push('missing_d1_binding');
  if (!env || !decodeHmacKey(env.IDENTITY_HMAC_KEY)) p.push('missing_or_weak_identity_hmac_key');
  if (!env || typeof env.ACCESS_AUD !== 'string' || !AUD_RE.test(env.ACCESS_AUD) || /^REPLACE/i.test(env.ACCESS_AUD)) p.push('missing_access_aud');
  if (!env || !['pilot', 'staging', 'local'].includes(env.PORTAL_ENV)) p.push('portal_env_must_be_pilot_staging_or_local');
  if (env && env.REPORT_AS_OF !== undefined && (env.PORTAL_ENV !== 'local' || !ISO_RE.test(env.REPORT_AS_OF))) p.push('report_as_of_only_allowed_locally');
  return p;
}

const textHeaders = { 'Content-Type': 'text/plain; charset=utf-8' };
function respond(request, status, body, type = 'text/html; charset=utf-8', extra = {}) {
  return new Response(request.method === 'HEAD' ? null : body, { status, headers: { ...PORTAL_SECURITY_HEADERS, 'Content-Type': type, ...extra } });
}
const page = (request, p, session = null, env = null) => respond(request, p.status, adaptPage(p, { isAdmin: session?.isAdmin === true, mode: env?.PORTAL_ENV }).body);

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

/** Resolve the Access identity to a stored user. Returns null on ANY doubt. Never reads tenant data. */
async function resolveUser(env, ctx) {
  const access = ctx && ctx.access;
  if (!access || typeof access !== 'object' || access.aud !== env.ACCESS_AUD || typeof access.getIdentity !== 'function') return { ok: false, reason: 'access_required' };
  let identity;
  try { identity = await access.getIdentity(); } catch { return { ok: false, reason: 'identity_unavailable' }; }
  const subject = await authSubjectFor(env.IDENTITY_HMAC_KEY, identity && identity.email);
  if (!subject) return { ok: false, reason: 'identity_without_email' };
  const user = await env.DB.prepare('SELECT user_id, display_label FROM users WHERE auth_subject = ?').bind(subject).first();
  return { ok: true, user };
}

export async function handlePortal(request, env, ctx, { now = () => Date.now(), log = (line) => console.error(JSON.stringify(line)) } = {}) {
  const problems = portalConfigProblems(env);
  if (problems.length) {
    log({ worker: 'portal', status: 503, error: 'misconfigured', problems });
    return respond(request, 503, 'The sponsor portal is not configured.', textHeaders['Content-Type']);
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') return respond(request, 405, 'Method not allowed', textHeaders['Content-Type'], { Allow: 'GET, HEAD' });

  let session = null; let memberships = [];
  try {
    const who = await resolveUser(env, ctx);
    if (!who.ok) {
      log({ worker: 'portal', status: 403, error: who.reason });
      return respond(request, 403, 'Access required. Sign in through Cloudflare Access.', textHeaders['Content-Type']);
    }
    const url = new URL(request.url);
    if (!who.user) {
      // Signed in through Access but not a portal user: same page as "no school linked".
      return page(request, { ...noAccessPage({ session: { label: 'an account with no school linked' } }), status: 403 }, null, env);
    }
    session = { userId: who.user.user_id, label: who.user.display_label, mode: 'access' };
    memberships = await membershipsFor(env.DB, session.userId);
    session.isAdmin = memberships.some((membership) => membership.role === 'admin');

    if (url.pathname === '/assets/portal.css') return respond(request, 200, PORTAL_CSS, 'text/css; charset=utf-8', { 'Cache-Control': 'no-store' });
    if (url.pathname === '/') {
      if (!memberships.length) return page(request, { ...noAccessPage({ session }), status: 403 }, session, env);
      return respond(request, 303, '', textHeaders['Content-Type'], { Location: `/t/${memberships[0].tenant_id}/` });
    }
    const m = url.pathname.match(/^\/t\/(ten_[a-f0-9]{16})\/(quality\.json)?$/);
    const scope = m ? await scopeForUser(env.DB, session.userId, m[1]) : null;
    if (!scope) return page(request, notFoundPage({ session, memberships }), session, env);

    const asOf = env.REPORT_AS_OF || new Date(now()).toISOString();
    const tenant = await scope.tenant();
    const extent = await scope.dataExtent();
    const { from, to } = resolveRange(url.searchParams, { asOf, timezone: tenant.timezone });
    const quality = await runQuality(env.DB, { tenantId: scope.tenantId, asOf, from, to, record: false });
    if (m[2] === 'quality.json') return respond(request, 200, JSON.stringify(quality, null, 2), 'application/json; charset=utf-8');

    const [totals, conv, daily, placements, locations, destinations, conversions, comparison, campaigns] = await Promise.all([
      scope.totals(from, to), scope.conversionTotals(from, to), scope.daily(from, to), scope.byPlacement(from, to), scope.byLocation(from, to),
      scope.byDestination(from, to), scope.conversions(from, to), scope.baselineComparison(), scope.campaigns(),
    ]);
    if (env.PORTAL_ENV === 'pilot') {
      // Live-pilot rules (staging/src/portal/pilot-report.mjs): no invented baseline, same-days comparison, one headline basis.
      const byBasis = await scope.conversionsByBasis(from, to);
      const plan = pilotPlan({ campaigns, from, to, comparison, byBasis });
      // Location-paired placements only (featured sponsored card ↔ ordinary listing of the same location), same days only.
      const pairedLocations = await scope.pairedLocations();
      const overlapTotals = plan.overlap ? await scope.pairedComparisonTotals(plan.overlap.from, plan.overlap.to) : null;
      const p = overviewPage({ session, memberships, tenant, from, to, asOf, extent, totals, conv: plan.headlineConv, daily, placements, locations, destinations, conversions, quality, comparison: plan.comparison, campaigns });
      return page(request, { ...p, body: applyPilotSections(p.body, { plan, overlapTotals, pairedLocations, byBasis }) }, session, env);
    }
    return page(request, overviewPage({ session, memberships, tenant, from, to, asOf, extent, totals, conv, daily, placements, locations, destinations, conversions, quality, comparison, campaigns }), session, env);
  } catch (err) {
    const ref = randomRef();
    log({ worker: 'portal', status: 500, error: 'internal', ref, error_name: err && err.name ? String(err.name).slice(0, 40) : 'Error' });
    try { return page(request, errorPage({ session, memberships, ref }), session, env); } catch { return respond(request, 500, `Something went wrong. Reference: ${ref}`, textHeaders['Content-Type']); }
  }
}

export default {
  fetch(request, env, ctx) { return handlePortal(request, env, ctx); },
};
