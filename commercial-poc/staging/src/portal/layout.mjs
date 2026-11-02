// Staging adaptation of the accepted Phase 1 portal views (src/portal/views.mjs).
// The Phase 1 renderer is used unchanged; four fixed, Phase 1-specific fragments are
// swapped for their staging equivalents. Each fragment must occur exactly once, or the
// page is refused (fail closed), so a future views change cannot silently ship a demo
// sign-out form or the "local proof of concept" banner to staging.
export const LAYOUT_SWAPS = Object.freeze([
  ['· WWK Sponsor Portal (POC)</title>', '· WWK Sponsor Portal (staging)</title>'],
  ['<span class="env-pill">Local POC · demo sign-in</span>', '<span class="env-pill">Staging · Cloudflare Access</span>'],
  ['<form method="post" action="/demo/logout" class="signout"><button type="submit" class="btn btn-quiet">Sign out</button></form>',
    '<a class="btn btn-quiet signout" href="/cdn-cgi/access/logout">Sign out</a>'],
  ['<strong>Synthetic fixture data.</strong> This is a local proof of concept. Numbers are generated for testing and do not describe real traffic, leads or enrollments.',
    '<strong>Staging.</strong> Private pre-release environment. Until the pilot starts, numbers are synthetic fixtures or test traffic and do not describe real families, leads or enrollments.'],
]);

export class LayoutAdaptationError extends Error {}

export function adaptPage(page, { isAdmin = false, mode = 'staging' } = {}) {
  let body = page.body;
  for (const [from, to] of LAYOUT_SWAPS) {
    const n = body.split(from).length - 1;
    if (n !== 1) throw new LayoutAdaptationError(`layout fragment matched ${n} times`);
    body = body.replace(from, () => to);
  }
  if (mode === 'pilot') {
    const swaps = [
      ['· WWK Sponsor Portal (staging)</title>', '· WWK Sponsor Portal</title>'],
      ['<span class="env-pill">Staging · Cloudflare Access</span>', '<span class="env-pill">Pilot · Cloudflare Access</span>'],
      ['<strong>Staging.</strong> Private pre-release environment. Until the pilot starts, numbers are synthetic fixtures or test traffic and do not describe real families, leads or enrollments.',
        '<strong>Live pilot.</strong> Metrics begin November 2, 2026. Leads and enrollments are school-reported from Jackrabbit registration-source totals and are not observed by WaterWiseKids.'],
    ];
    for (const [from, to] of swaps) {
      const n = body.split(from).length - 1;
      if (n !== 1) throw new LayoutAdaptationError(`pilot layout fragment matched ${n} times`);
      body = body.replace(from, () => to);
    }
    body = body.replaceAll('Eligible (fixture)', 'Active pilot location');
  }
  if (isAdmin) {
    const envLabel = mode === 'pilot' ? 'Pilot' : 'Staging';
    const swaps = [
      [`<span class="env-pill">${envLabel} · Cloudflare Access</span>`, `<span class="env-pill">${envLabel} · Administrator</span>`],
      ['<nav class="tenant-nav" aria-label="Your schools">', '<nav class="tenant-nav" aria-label="All sponsor accounts">'],
    ];
    for (const [from, to] of swaps) {
      const n = body.split(from).length - 1;
      if (n !== 1) throw new LayoutAdaptationError(`admin layout fragment matched ${n} times`);
      body = body.replace(from, () => to);
    }
  }
  if (/\/demo\/(login|logout)|demo sign-in/i.test(body)) throw new LayoutAdaptationError('demo affordance left in portal page');
  if (mode === 'pilot' && /synthetic|fixture data|Eligible \(fixture\)/i.test(body)) throw new LayoutAdaptationError('fixture wording left in pilot page');
  return { status: page.status, body };
}
