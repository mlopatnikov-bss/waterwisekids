// Server-rendered portal views. No client-side JavaScript is required.
import { html, trusted, fmtInt, fmtPct } from './html.mjs';
import { addDays } from '../time.mjs';

const BADGE = {
  observed: { text: 'Observed', title: 'Measured directly by WaterWiseKids on WWK pages.' },
  reported: { text: 'Reported', title: 'Imported or self-reported by the school. Not observed by WaterWiseKids.' },
  derived: { text: 'Derived', title: 'Calculated from other figures on this page.' },
};
export function badge(kind, extra = '') {
  const b = BADGE[kind];
  return html`<span class="badge badge-${kind}" title="${b.title}"><span class="badge-dot" aria-hidden="true"></span>${b.text}${extra ? html`<span class="badge-extra"> · ${extra}</span>` : ''}</span>`;
}

const SEVERITY = { ok: 'OK', info: 'Note', warn: 'Warning', critical: 'Critical' };
const LOCATION_STATUS = {
  eligible_fixture: 'Eligible (fixture)',
  needs_owner_confirmation: 'Needs owner confirmation',
  needs_address_confirmation: 'Needs address confirmation',
};
const CONVERSION_LABEL = { assessment_start: 'Assessment starts', call: 'Calls', qualified_lead: 'Qualified leads', enrollment: 'Enrollments' };
const METHOD_LABEL = { manual_entry: 'Manual entry', csv_upload: 'CSV upload', booking_system_export: 'Booking-system export', crm_export: 'CRM export', call_tracking_export: 'Call-tracking export' };
const BASIS_LABEL = {
  self_reported_wwk_mention: 'Family said they found the school on WaterWiseKids',
  utm_matched_in_sponsor_system: 'Matched to a WWK campaign link in the school’s own system',
  self_reported_any_source: 'All sources (not WWK-specific)',
};

function fmtDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
function fmtStamp(iso, tz = 'America/New_York') {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
}

export function layout({ title, session, memberships = [], currentTenantId = null, body, status = 200 }) {
  return {
    status,
    body: `<!doctype html>${html`<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title} · WWK Sponsor Portal (POC)</title>
<link rel="stylesheet" href="/assets/portal.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
<header class="topbar">
  <div class="topbar-inner">
    <a class="brand" href="/"><span class="brand-mark" aria-hidden="true"></span><span>WaterWiseKids</span><span class="brand-sub">Sponsor portal</span></a>
    <span class="env-pill">Local POC · demo sign-in</span>
    ${session ? html`<nav class="tenant-nav" aria-label="Your schools">
      ${memberships.length > 1 ? html`<ul>${memberships.map((m) => html`<li><a href="/t/${m.tenant_id}/" ${m.tenant_id === currentTenantId ? trusted('aria-current="page"') : ''}>${m.display_name}</a></li>`)}</ul>` : ''}
      <form method="post" action="/demo/logout" class="signout"><button type="submit" class="btn btn-quiet">Sign out</button></form>
    </nav>` : ''}
  </div>
</header>
<div class="fixture-banner" role="note"><strong>Synthetic fixture data.</strong> This is a local proof of concept. Numbers are generated for testing and do not describe real traffic, leads or enrollments.</div>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="footer"><div class="wrap">WaterWiseKids sponsored placements are labeled <strong>Sponsored</strong> and never change ordinary directory order. Pilot placements are valued at $0.${session ? html` Signed in as ${session.label}.` : ''}</div></footer>
</body>
</html>`}`,
  };
}

export function loginPage({ users, error }) {
  return layout({
    title: 'Demo sign-in',
    body: html`<div class="wrap narrow">
  <h1>Demo sign-in</h1>
  <div class="callout callout-warn" role="note">
    <p><strong>This is not real authentication.</strong> Demo mode runs only on this computer (loopback) so reviewers can test tenant isolation. Picking a user below signs you in as that fixture user. Production sign-in will use a managed identity provider; this POC stores no passwords.</p>
  </div>
  ${error ? html`<p class="form-error" role="alert">${error}</p>` : ''}
  <ul class="user-list">
    ${users.map((u) => html`<li><form method="post" action="/demo/login"><input type="hidden" name="user_id" value="${u.user_id}"><button type="submit" class="btn btn-block">${u.display_label}</button></form></li>`)}
  </ul>
</div>`,
  });
}

export function noAccessPage({ session }) {
  return layout({
    title: 'No school linked', session,
    body: html`<div class="wrap narrow"><h1>No school is linked to this account</h1>
  <div class="empty-state"><p>Your sign-in worked, but this account is not a member of any sponsor account yet, so there is nothing to show.</p><p>Ask a WaterWiseKids operator to add your account to your school.</p></div></div>`,
  });
}

export function notFoundPage({ session, memberships }) {
  return layout({
    title: 'Not found', session, memberships, status: 404,
    body: html`<div class="wrap narrow"><h1>Page not found</h1>
  <div class="empty-state"><p>This page does not exist, or it belongs to an account you can't access.</p><p><a href="/">Go to your dashboard</a></p></div></div>`,
  });
}

export function errorPage({ session, memberships, ref }) {
  return layout({
    title: 'Something went wrong', session, memberships, status: 500,
    body: html`<div class="wrap narrow"><h1>Something went wrong</h1>
  <div class="callout callout-critical" role="alert"><p>We couldn't load this dashboard. No data was changed. Try again in a moment.</p><p class="muted">Reference: <code>${ref}</code></p></div></div>`,
  });
}

function rangeForm({ tenantId, from, to, campaignStart, lastDate }) {
  const end = lastDate || to;
  const presets = [
    ['Last 7 days', addDays(end, -6), end],
    ['Last 28 days', addDays(end, -27), end],
    ['Since campaign start', campaignStart, end],
    ['Last 90 days', addDays(end, -89), end],
  ];
  return html`<form class="range-form" method="get" action="/t/${tenantId}/" aria-label="Date range">
  <div class="field"><label for="from">From</label><input id="from" name="from" type="date" value="${from}" required></div>
  <div class="field"><label for="to">To</label><input id="to" name="to" type="date" value="${to}" required></div>
  <button type="submit" class="btn">Apply</button>
  <ul class="presets" aria-label="Quick ranges">${presets.map(([label, a, b]) => html`<li><a href="/t/${tenantId}/?from=${a}&amp;to=${b}" ${a === from && b === to ? trusted('aria-current="true"') : ''}>${label}</a></li>`)}</ul>
</form>`;
}

function qualityPanel(q) {
  if (!q) return html`<section class="callout callout-info" aria-labelledby="dq-h"><h2 id="dq-h">Data status</h2><p>No data-quality run is available yet.</p></section>`;
  const issues = q.checks.filter((c) => c.severity !== 'ok');
  const cls = { ok: 'ok', info: 'info', warn: 'warn', critical: 'critical' }[q.status];
  return html`<section class="callout callout-${cls}" aria-labelledby="dq-h">
  <h2 id="dq-h">Data status: <span class="sev sev-${q.status}">${SEVERITY[q.status]}</span></h2>
  <p class="muted">Checked ${fmtStamp(q.as_of)} for ${fmtDate(q.range_start)} – ${fmtDate(q.range_end)}.</p>
  ${issues.length ? html`<ul class="dq-list">${issues.map((c) => html`<li><span class="sev sev-${c.severity}">${SEVERITY[c.severity]}</span> ${c.message}</li>`)}</ul>` : html`<p>All data checks passed.</p>`}
</section>`;
}

function kpi({ label, value, metric, kind, extra, note }) {
  return html`<div class="kpi">
  <div class="kpi-top"><span class="kpi-label">${label}</span>${badge(kind, extra)}</div>
  <div class="kpi-value" data-metric="${metric}" data-value="${value === null ? '' : value}">${typeof value === 'string' ? value : fmtInt(value)}</div>
  ${note ? html`<div class="kpi-note">${note}</div>` : ''}
</div>`;
}

function funnel(steps) {
  const top = steps[0].value || 0;
  return html`<ol class="funnel">${steps.map((s, i) => {
    const prev = i > 0 ? steps[i - 1] : null;
    const width = top && s.value !== null ? Math.max(1.5, (s.value / top) * 100) : 0;
    const divider = s.divider ? html`<li class="funnel-divider" aria-hidden="true"><span>Below: reported by the school, not observed by WWK. A click is not a lead.</span></li>` : '';
    return html`${divider}<li class="funnel-step funnel-${s.kind}">
      <div class="funnel-head"><span class="funnel-label">${s.label}</span>${badge(s.kind, s.extra)}</div>
      <div class="funnel-bar-row">${trusted(`<svg class="funnel-bar" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false"><rect class="funnel-track" width="100" height="10"/><rect class="funnel-fill" width="${width.toFixed(2)}" height="10"/></svg>`)}<span class="funnel-value" data-funnel="${s.metric}">${s.value === null ? 'Not reported' : fmtInt(s.value)}</span></div>
      ${prev && s.value !== null && prev.value ? html`<div class="funnel-rate">${s.rateLabel || 'Of previous step'}: ${fmtPct(s.value, prev.value)}</div>` : ''}
    </li>`;
  })}</ol>`;
}

function lineChart({ id, title, desc, days, series, height = 200 }) {
  const w = 720; const h = height; const padL = 44; const padR = 12; const padT = 12; const padB = 28;
  const max = Math.max(1, ...days.flatMap((d) => series.map((s) => d[s.key])));
  const niceMax = niceCeil(max);
  const x = (i) => padL + (days.length <= 1 ? 0 : (i * (w - padL - padR)) / (days.length - 1));
  const y = (v) => padT + (h - padT - padB) * (1 - v / niceMax);
  const ticks = [0, niceMax / 2, niceMax];
  const gaps = days.map((d, i) => (!d.has_data ? i : null)).filter((i) => i !== null);
  const step = days.length > 1 ? (w - padL - padR) / (days.length - 1) : 10;
  const labelEvery = Math.max(1, Math.ceil(days.length / 6));
  let svg = `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-t ${id}-d" preserveAspectRatio="none">`;
  svg += `<title id="${id}-t">${escapeAttr(title)}</title><desc id="${id}-d">${escapeAttr(desc)}</desc>`;
  for (const t of ticks) svg += `<line class="grid" x1="${padL}" x2="${w - padR}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/><text class="axis" x="${padL - 6}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end">${fmtInt(t)}</text>`;
  for (const i of gaps) svg += `<rect class="gap" x="${(x(i) - step / 2).toFixed(1)}" y="${padT}" width="${step.toFixed(1)}" height="${h - padT - padB}"/>`;
  days.forEach((d, i) => { if (i % labelEvery === 0 || i === days.length - 1) svg += `<text class="axis" x="${x(i).toFixed(1)}" y="${h - 8}" text-anchor="middle">${d.date.slice(5)}</text>`; });
  series.forEach((s, si) => {
    let dPath = ''; let pen = false;
    days.forEach((d, i) => {
      if (!d.has_data) { pen = false; return; }
      dPath += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[s.key]).toFixed(1)}`; pen = true;
    });
    svg += `<path class="line line-${si}" d="${dPath}"/>`;
  });
  svg += '</svg>';
  const legend = html`<ul class="legend">${series.map((s, si) => html`<li><span class="swatch swatch-${si}" aria-hidden="true"></span>${s.label}</li>`)}${gaps.length ? html`<li><span class="swatch swatch-gap" aria-hidden="true"></span>No data received</li>` : ''}</ul>`;
  return html`<figure class="chart-figure">${trusted(svg)}${legend}</figure>`;
}
function escapeAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function niceCeil(v) { const p = 10 ** Math.floor(Math.log10(v)); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }

function table({ caption, head, rows, empty, cls = '' }) {
  if (!rows.length) return html`<div class="empty-state"><p>${empty}</p></div>`;
  return html`<div class="table-scroll" role="region" aria-label="${caption}" tabindex="0"><table class="data ${cls}">
  <caption>${caption}</caption>
  <thead><tr>${head.map((hd, i) => html`<th scope="col" class="${i > 0 && hd.num !== false ? 'num' : ''}">${hd.label ?? hd}</th>`)}</tr></thead>
  <tbody>${rows.map((r) => html`<tr>${r.map((c, i) => (i === 0 ? html`<th scope="row">${c}</th>` : html`<td class="${head[i].num === false ? '' : 'num'}">${c}</td>`))}</tr>`)}</tbody>
</table></div>`;
}

export function overviewPage(d) {
  const { session, memberships, tenant, from, to, asOf, extent, totals, conv, daily, placements, locations, destinations, conversions, quality, comparison, campaigns } = d;
  const sp = totals.sponsored_card; const og = totals.organic_listing;
  const sponsoredCampaign = campaigns.find((c) => c.kind === 'sponsored_pilot');
  const hasObserved = (sp.eligible_view || 0) + (og.eligible_view || 0) > 0;
  const reportedLeads = (conv.qualified_lead || 0) + (conv.assessment_start || 0);
  const hasReported = Object.keys(conv).length > 0;

  const kpis = html`<div class="kpi-grid">
    ${kpi({ label: 'Eligible views', value: sp.eligible_view || 0, metric: 'eligible_view', kind: 'observed', note: 'Page loads where your sponsored card was on the page.' })}
    ${kpi({ label: 'Viewable impressions', value: sp.viewable_impression || 0, metric: 'viewable_impression', kind: 'observed', note: 'At least 50% of the card on screen for 1 second.' })}
    ${kpi({ label: 'Sponsored-card clicks', value: sp.sponsored_click || 0, metric: 'sponsored_click', kind: 'observed', note: 'Clicks on your sponsored card.' })}
    ${kpi({ label: 'Clicks to your official site', value: (sp.outbound_click || 0) + (og.outbound_click || 0), metric: 'outbound_click', kind: 'observed', note: `${fmtInt(sp.outbound_click || 0)} from sponsored cards · ${fmtInt(og.outbound_click || 0)} from your ordinary listing.` })}
    ${kpi({ label: 'Viewability rate', value: fmtPct(sp.viewable_impression || 0, sp.eligible_view || 0), metric: 'viewability_rate', kind: 'derived', note: 'Viewable impressions ÷ eligible views.' })}
    ${kpi({ label: 'Sponsored-card CTR', value: fmtPct(sp.sponsored_click || 0, sp.viewable_impression || 0, 2), metric: 'sponsored_ctr', kind: 'derived', note: 'Sponsored-card clicks ÷ viewable impressions.' })}
    ${kpi({ label: 'Reported leads', value: hasReported ? reportedLeads : 'Not reported', metric: 'reported_leads', kind: 'reported', note: hasReported ? 'Qualified leads + assessment starts reported by your school.' : 'No lead data imported yet.' })}
    ${kpi({ label: 'Reported enrollments', value: hasReported ? (conv.enrollment || 0) : 'Not reported', metric: 'reported_enrollments', kind: 'reported', note: hasReported ? 'Enrollments reported by your school.' : 'No enrollment data imported yet.' })}
  </div>`;

  const steps = [
    { label: 'Eligible views', value: sp.eligible_view || 0, metric: 'eligible_view', kind: 'observed' },
    { label: 'Viewable impressions', value: sp.viewable_impression || 0, metric: 'viewable_impression', kind: 'observed', rateLabel: 'Viewability' },
    { label: 'Sponsored-card clicks', value: sp.sponsored_click || 0, metric: 'sponsored_click', kind: 'observed', rateLabel: 'Click-through' },
    { label: 'Clicks to official site (from sponsored cards)', value: sp.outbound_click || 0, metric: 'outbound_click_sponsored', kind: 'observed', rateLabel: 'Continued to your site' },
    { label: 'Reported leads', value: hasReported ? reportedLeads : null, metric: 'reported_leads', kind: 'reported', divider: true, rateLabel: 'Ratio to clicks (not a conversion rate)' },
    { label: 'Reported enrollments', value: hasReported ? (conv.enrollment || 0) : null, metric: 'reported_enrollments', kind: 'reported', rateLabel: 'Of reported leads' },
  ];

  const missingDays = daily.filter((x) => !x.has_data && sponsoredCampaign && x.date >= sponsoredCampaign.starts_on).length;
  const trend = html`<section class="card" aria-labelledby="trend-h">
  <div class="card-head"><h2 id="trend-h">Daily trend</h2>${badge('observed')}</div>
  <p class="muted">Sponsored cards only, ${fmtDate(from)} – ${fmtDate(to)}.${missingDays ? ` ${missingDays} day(s) in this range have no data received and are shaded.` : ''}</p>
  ${lineChart({ id: 'chart-imp', title: 'Viewable impressions per day', desc: `Daily viewable impressions of sponsored cards from ${from} to ${to}. A table with the same data follows.`, days: daily, series: [{ key: 'viewable_impression', label: 'Viewable impressions' }] })}
  ${lineChart({ id: 'chart-clk', title: 'Clicks per day', desc: `Daily sponsored-card clicks and clicks to the official site from ${from} to ${to}. A table with the same data follows.`, days: daily, height: 160, series: [{ key: 'sponsored_click', label: 'Sponsored-card clicks' }, { key: 'outbound_click', label: 'Clicks to official site' }] })}
  <details class="details"><summary>Show daily numbers as a table</summary>
  ${table({ caption: 'Daily sponsored-card metrics', head: ['Date', 'Eligible views', 'Viewable impressions', 'Sponsored clicks', 'Clicks to site'],
    rows: daily.map((x) => [fmtDate(x.date), x.has_data ? fmtInt(x.eligible_view) : 'No data', x.has_data ? fmtInt(x.viewable_impression) : '—', x.has_data ? fmtInt(x.sponsored_click) : '—', x.has_data ? fmtInt(x.outbound_click) : '—']), empty: 'No days in range.' })}
  </details>
</section>`;

  const sCtr = fmtPct(sp.outbound_click || 0, sp.viewable_impression || 0, 2);
  const oCtr = fmtPct(og.outbound_click || 0, og.viewable_impression || 0, 2);
  let periodBlock = '';
  if (comparison) {
    const b = comparison.baseline; const s = comparison.sponsored;
    const bRate = b.days ? b.outbound / b.days : null; const sRate = s.days ? s.outbound / s.days : null;
    const change = bRate && sRate !== null ? ((sRate - bRate) / bRate) * 100 : null;
    periodBlock = table({ caption: 'Clicks to your official site per day with data, before vs during the sponsored pilot (all dates, not the selected range)',
      head: ['Period', 'Dates', { label: 'Days with data' }, { label: 'Clicks to site' }, { label: 'Per day' }],
      rows: [
        ['Baseline (ordinary listing only)', `${fmtDate(b.from)} – ${fmtDate(b.to)}`, fmtInt(b.days), fmtInt(b.outbound), bRate === null ? '—' : bRate.toFixed(2)],
        ['Sponsored pilot (listing + sponsored cards)', `${fmtDate(s.from)} – ${fmtDate(s.to)}`, fmtInt(s.days), fmtInt(s.outbound), sRate === null ? '—' : sRate.toFixed(2)],
        ['Change in clicks to site per day', '', '', '', change === null ? '—' : `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`],
      ], empty: 'Not enough data for a before/after comparison.' });
  }
  const compare = html`<section class="card" aria-labelledby="cmp-h">
  <div class="card-head"><h2 id="cmp-h">Sponsored card vs your ordinary listing</h2>${badge('derived')}</div>
  ${table({ caption: `Click-through to your official site, ${fmtDate(from)} – ${fmtDate(to)}`, head: ['Placement type', 'Viewable impressions', 'Clicks to site', 'Click-through'],
    rows: [['Sponsored card', fmtInt(sp.viewable_impression || 0), fmtInt(sp.outbound_click || 0), sCtr], ['Ordinary directory listing', fmtInt(og.viewable_impression || 0), fmtInt(og.outbound_click || 0), oCtr]], empty: '' })}
  ${periodBlock}
  <p class="caveat"><strong>Correlation, not attribution.</strong> These comparisons show what happened alongside the pilot. Seasonality, your other marketing and page differences also affect the numbers.</p>
</section>`;

  const placementTable = html`<section class="card" aria-labelledby="pl-h">
  <div class="card-head"><h2 id="pl-h">Placements and pages</h2>${badge('observed')}</div>
  ${table({ caption: `Performance by placement and WWK page, ${fmtDate(from)} – ${fmtDate(to)}`,
    head: [{ label: 'WWK page', num: false }, { label: 'Type', num: false }, 'Eligible views', 'Viewable impr.', 'Card clicks', 'Clicks to site', 'Click-through'],
    rows: placements.map((p) => [html`<code>${p.page_path}</code>${p.kind === 'organic_listing' ? html`<span class="sub">${p.display_name.replace(/^Ordinary listing: /, '')}</span>` : ''}`, p.kind === 'sponsored_card' ? html`<span class="tag tag-sponsored">Sponsored pilot</span>` : html`<span class="tag">Ordinary listing</span>`,
      fmtInt(p.eligible_view), fmtInt(p.viewable_impression), p.kind === 'sponsored_card' ? fmtInt(p.sponsored_click) : html`<span class="muted">n/a</span>`, fmtInt(p.outbound_click),
      fmtPct(p.kind === 'sponsored_card' ? p.sponsored_click : p.outbound_click, p.viewable_impression, 2)]),
    empty: 'No placements are configured for this account.' })}
</section>`;

  const locTable = html`<section class="card" aria-labelledby="loc-h">
  <div class="card-head"><h2 id="loc-h">Locations</h2>${badge('observed')}</div>
  ${table({ caption: `Performance by pool location, ${fmtDate(from)} – ${fmtDate(to)}`,
    head: [{ label: 'Location', num: false }, { label: 'Status', num: false }, 'Featured impr.', 'Featured clicks', 'Site clicks (sponsored)', 'Site clicks (listing)'],
    rows: locations.map((l) => [html`${l.display_name}${l.address_display ? html`<span class="sub">${l.address_display}</span>` : html`<span class="sub">Address withheld until confirmed</span>`}`,
      html`<span class="status status-${l.status}">${LOCATION_STATUS[l.status]}</span>${l.status !== 'eligible_fixture' ? html`<span class="sub">${l.status_reason}</span>` : ''}`,
      fmtInt(l.featured_viewable_impression), fmtInt(l.featured_sponsored_click), fmtInt(l.outbound_sponsored), fmtInt(l.outbound_organic)]),
    empty: 'No locations on file.' })}
  <p class="muted">Locations that need confirmation are never featured or linked. Status comes from your official site as checked on the date shown in the manifest, not from WaterWiseKids.</p>
</section>`;

  const destTable = html`<section class="card" aria-labelledby="dst-h">
  <div class="card-head"><h2 id="dst-h">Destinations</h2>${badge('observed')}</div>
  ${table({ caption: `Clicks to each official page, ${fmtDate(from)} – ${fmtDate(to)}`,
    head: [{ label: 'Official page', num: false }, 'From sponsored cards', 'From ordinary listing', 'Total'],
    rows: destinations.map((x) => [html`${x.display_name}<span class="sub"><code>${x.url}</code></span>`, fmtInt(x.sponsored_card), fmtInt(x.organic_listing), fmtInt(x.sponsored_card + x.organic_listing)]),
    empty: 'No destinations configured.' })}
</section>`;

  const convSection = html`<section class="card" aria-labelledby="cv-h">
  <div class="card-head"><h2 id="cv-h">Reported leads and enrollments</h2>${badge('reported')}</div>
  ${conversions.length ? table({ caption: `Reported by your school, ${fmtDate(from)} – ${fmtDate(to)}`,
    head: [{ label: 'Type', num: false }, 'Count', { label: 'Source', num: false }, { label: 'How it was linked to WWK', num: false }, { label: 'Confidence', num: false }, 'Est. value'],
    rows: conversions.map((c) => [CONVERSION_LABEL[c.conversion_type], fmtInt(c.count), html`${c.source_label}<span class="sub">${METHOD_LABEL[c.method]}</span>`, BASIS_LABEL[c.attribution_basis],
      html`<span class="conf conf-${c.confidence}">${c.confidence[0].toUpperCase()}${c.confidence.slice(1)}</span>`,
      c.valued_rows ? `$${fmtInt((c.estimated_value_cents || 0) / 100)}` : html`<span class="muted">Not reported</span>`]), empty: '' })
    : html`<div class="empty-state"><p><strong>No reported conversions for this range.</strong></p><p>WaterWiseKids can't see what happens on your site after a click. To show leads and enrollments here, send a weekly count from your booking system, CRM or call log. Only counts are accepted, never names or contact details.</p></div>`}
  <p class="caveat">Reported figures come from your school, not from WaterWiseKids, and are shown with their source and confidence. They are not proof that a click caused an enrollment.</p>
</section>`;

  const defs = html`<section class="card" aria-labelledby="def-h">
  <h2 id="def-h">Definitions</h2>
  <dl class="defs">
    <dt>${badge('observed')}</dt><dd>Measured directly by WaterWiseKids on WWK pages. No personal data, IP address or device fingerprint is collected.</dd>
    <dt>${badge('reported')}</dt><dd>Sent by your school (imported or self-reported). Always shown with its source and confidence.</dd>
    <dt>${badge('derived')}</dt><dd>Calculated from figures on this page.</dd>
    <dt>Eligible view</dt><dd>A WWK page load where your sponsored card was placed on the page.</dd>
    <dt>Viewable impression</dt><dd>At least half the card was on screen for at least one continuous second (industry display standard). Counted once per page view.</dd>
    <dt>Sponsored-card click</dt><dd>A click on your sponsored card. Counted once per page view.</dd>
    <dt>Click to official site</dt><dd>A click that leaves WWK for an official page of your school listed on this dashboard. Links carry campaign tags so your own analytics can see them.</dd>
    <dt>Reported lead</dt><dd>Qualified leads plus assessment starts, as defined and reported by your school. Calls are listed separately and not added in, to avoid double counting.</dd>
    <dt>Ordinary listing</dt><dd>Your normal WWK directory entry. Its order is editorial and is never sold; it is measured only to give a fair comparison.</dd>
    <dt>Days</dt><dd>All dates are in ${tenant.timezone.replace('_', ' ')} time.</dd>
  </dl>
</section>`;

  const body = html`<div class="wrap">
  <div class="page-head">
    <div>
      <p class="eyebrow">Sponsor dashboard</p>
      <h1>${tenant.display_name}</h1>
      <p class="lede"><span class="tag tag-sponsored">Sponsored pilot</span> No-cost pilot · every placement is labeled “Sponsored pilot” · ordinary directory order is never sold.</p>
    </div>
    ${rangeForm({ tenantId: tenant.tenant_id, from, to, campaignStart: sponsoredCampaign ? sponsoredCampaign.starts_on : from, lastDate: extent?.last_date })}
  </div>
  <p class="freshness">Showing ${fmtDate(from)} – ${fmtDate(to)}. Latest observed data: ${extent?.last_event_at ? fmtStamp(extent.last_event_at, tenant.timezone) : 'none yet'}. Report time: ${fmtStamp(asOf, tenant.timezone)}.</p>
  ${qualityPanel(quality)}
  ${hasObserved ? html`
  <section aria-labelledby="kpi-h"><h2 id="kpi-h" class="visually-hidden">Key figures</h2>${kpis}</section>
  <section class="card" aria-labelledby="fun-h">
    <div class="card-head"><h2 id="fun-h">Visibility funnel</h2></div>
    <p class="muted">Sponsored cards, ${fmtDate(from)} – ${fmtDate(to)}.</p>
    ${funnel(steps)}
  </section>
  ${trend}
  ${compare}
  ${placementTable}
  ${locTable}
  ${destTable}
  ${convSection}` : html`
  <div class="empty-state big" role="status"><h2>No observed data in this date range</h2><p>Nothing was recorded for your placements between ${fmtDate(from)} and ${fmtDate(to)}. Data for this account runs from ${fmtDate(extent?.first_date)} to ${fmtDate(extent?.last_date)}.</p><p><a href="/t/${tenant.tenant_id}/">Show the most recent 28 days</a></p></div>
  ${locTable}
  ${convSection}`}
  ${defs}
</div>`;
  return layout({ title: tenant.display_name, session, memberships, currentTenantId: tenant.tenant_id, body });
}
