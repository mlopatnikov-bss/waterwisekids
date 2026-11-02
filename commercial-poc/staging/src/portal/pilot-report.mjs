// Live-pilot reporting rules, applied ONLY when PORTAL_ENV = "pilot". The accepted
// Phase 1 renderer and read model stay unchanged (staging/local parity tests still hold);
// this module adjusts its inputs and replaces two fixed sections of its output.
//
//  1. No invented baseline: the before/during block appears only if an ordinary-listing
//     campaign genuinely started BEFORE the sponsored campaign and has data in that
//     pre-period. In the live pilot it never does, so the block is suppressed.
//  2. Fair comparison: sponsored and ordinary figures are compared only over the days
//     BOTH were measured (selected range ∩ sponsored window ∩ control window), only for
//     LOCATION-PAIRED placements (a featured sponsored card and an ordinary listing for the
//     same location; regional cards with no featured location are excluded), with the same
//     metric definitions. No lift percentage is shown.
//  3. Attribution basis: the headline leads/enrollments use exactly ONE WWK-linked basis
//     (UTM-matched if any rows exist, else family-reported WWK mention). "All sources"
//     totals are context only. Bases are never added together.
import { html, fmtInt, fmtPct } from '../../../src/portal/html.mjs';
import { badge } from '../../../src/portal/views.mjs';
import { LayoutAdaptationError } from './layout.mjs';

export const HEADLINE_BASES = Object.freeze(['utm_matched_in_sponsor_system', 'self_reported_wwk_mention']);
export const BASIS_LABEL = Object.freeze({
  utm_matched_in_sponsor_system: 'Matched to a WWK campaign link in the school’s own system',
  self_reported_wwk_mention: 'Family said they found the school on WaterWiseKids',
  self_reported_any_source: 'All sources (not WWK-specific; context only)',
});
const TYPE_ORDER = [['assessment_start', 'Assessment starts'], ['qualified_lead', 'Qualified leads'], ['call', 'Calls'], ['enrollment', 'Enrollments']];
const max = (...d) => d.filter(Boolean).sort().at(-1);
const min = (...d) => d.filter(Boolean).sort()[0];

/** Pure: decide comparison window, baseline eligibility and headline basis. */
export function pilotPlan({ campaigns, from, to, comparison, byBasis }) {
  const sponsored = campaigns.find((c) => c.kind === 'sponsored_pilot') || null;
  const control = campaigns.find((c) => c.kind === 'organic_baseline') || null;
  const genuineBaseline = Boolean(sponsored && control && control.starts_on < sponsored.starts_on && comparison && comparison.baseline && comparison.baseline.days > 0);
  let overlap = null;
  if (sponsored && control) {
    const oFrom = max(from, sponsored.starts_on, control.starts_on); const oTo = min(to, sponsored.ends_on, control.ends_on);
    if (oFrom <= oTo) overlap = { from: oFrom, to: oTo };
  }
  const headlineBasis = HEADLINE_BASES.find((b) => byBasis[b] && Object.keys(byBasis[b]).length) || null;
  return { sponsored, control, overlap, comparison: genuineBaseline ? comparison : null, headlineBasis, headlineConv: headlineBasis ? { ...byBasis[headlineBasis] } : {} };
}

function table({ caption, head, rows }) {
  return html`<div class="table-scroll" role="region" aria-label="${caption}" tabindex="0"><table class="data">
  <caption>${caption}</caption>
  <thead><tr>${head.map((h, i) => html`<th scope="col" class="${i > 0 ? 'num' : ''}">${h}</th>`)}</tr></thead>
  <tbody>${rows.map((r) => html`<tr>${r.map((c, i) => (i === 0 ? html`<th scope="row">${c}</th>` : html`<td class="num">${c}</td>`))}</tr>`)}</tbody>
</table></div>`;
}
const date = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export function comparisonSection({ plan, overlapTotals, pairedLocations = [] }) {
  const head = html`<div class="card-head"><h2 id="cmp-h">Sponsored card vs your ordinary listing</h2>${badge('derived')}</div>`;
  let body;
  if (!plan.control) {
    body = html`<div class="empty-state"><p><strong>Your ordinary directory listing is not measured yet.</strong></p><p>Until it is, there is no fair comparison, so none is shown. Sponsored-card figures above are not compared with anything.</p></div>`;
  } else if (!pairedLocations.length) {
    body = html`<div class="empty-state"><p><strong>No location has both a featured sponsored card and a measured ordinary listing.</strong></p><p>A fair comparison needs the same location on both sides, so none is shown.</p></div>`;
  } else if (!plan.overlap) {
    body = html`<div class="empty-state"><p><strong>No days in this range were measured for both placements.</strong></p><p>Ordinary-listing measurement runs ${date(plan.control.starts_on)} – ${date(plan.control.ends_on)}. Choose dates inside that window to compare.</p></div>`;
  } else {
    const sp = overlapTotals.sponsored_card; const og = overlapTotals.organic_listing;
    body = html`${table({ caption: `Same locations and same days for both, ${date(plan.overlap.from)} – ${date(plan.overlap.to)}`,
      head: ['Placement', 'Eligible views', 'Viewable impressions', 'Clicks to official site', 'Clicks per viewable impression'],
      rows: [['Sponsored card', fmtInt(sp.eligible_view || 0), fmtInt(sp.viewable_impression || 0), fmtInt(sp.outbound_click || 0), fmtPct(sp.outbound_click || 0, sp.viewable_impression || 0, 2)],
        ['Ordinary directory listing', fmtInt(og.eligible_view || 0), fmtInt(og.viewable_impression || 0), fmtInt(og.outbound_click || 0), fmtPct(og.outbound_click || 0, og.viewable_impression || 0, 2)]] })}
    <p class="muted" data-pilot-paired-locations="${pairedLocations.map((l) => l.location_id).join(' ')}">Paired locations: ${pairedLocations.map((l) => l.display_name).join(', ')}. Only the sponsored card that features each of these locations and that location’s ordinary listing are counted here. Regional sponsored cards that list several locations are excluded from this comparison (they are included in the figures above).</p>`;
  }
  return html`<section class="card" aria-labelledby="cmp-h">
  ${head}
  ${body}
  <p class="caveat"><strong>Side by side, not a controlled test.</strong> Both placements are measured with the same definitions over the same days, but they sit on different pages (local guide pages vs the state directory) and reach different visitors. No historical baseline exists for this pilot, and no lift is claimed.</p>
</section>`;
}

export function attributionSection({ plan, byBasis }) {
  const bases = Object.keys(BASIS_LABEL).filter((b) => byBasis[b]);
  const rows = bases.map((b) => [html`${BASIS_LABEL[b]}${b === plan.headlineBasis ? html`<span class="sub">Used for the headline figures</span>` : ''}`,
    ...TYPE_ORDER.map(([t]) => (byBasis[b][t] === undefined ? '—' : fmtInt(byBasis[b][t])))]);
  return html`<section class="card" aria-labelledby="ab-h">
  <div class="card-head"><h2 id="ab-h">Attribution basis</h2>${badge('reported')}</div>
  ${bases.length ? table({ caption: 'Reported totals by how each was linked to WWK (each row is a separate measure)', head: ['Basis', ...TYPE_ORDER.map(([, l]) => l)], rows })
    : html`<div class="empty-state"><p>No school-reported totals for this range yet.</p></div>`}
  <p class="caveat">Rows are never added together: the same family can appear in more than one row. “All sources” counts every new enrollment at your locations and is shown for context only. Reported figures come from your school’s own records and are not proof that a WWK visit caused an enrollment.</p>
</section>`;
}

function headlineNote(plan) {
  return plan.headlineBasis
    ? html`<p class="muted" data-pilot-headline-basis="${plan.headlineBasis}">Headline leads and enrollments use one basis only: ${BASIS_LABEL[plan.headlineBasis]}. Other bases are listed under Attribution basis.</p>`
    : html`<p class="muted" data-pilot-headline-basis="none">No WWK-linked leads or enrollments have been reported for this range, so the headline shows “Not reported”. Any all-source totals are listed under Attribution basis.</p>`;
}

function spliceOnce(body, start, end, replacement, label) {
  const i = body.indexOf(start);
  if (i < 0 || body.indexOf(start, i + 1) >= 0) throw new LayoutAdaptationError(`pilot section ${label} matched ${i < 0 ? 0 : 'more than one'} times`);
  const j = body.indexOf(end, i);
  if (j < 0) throw new LayoutAdaptationError(`pilot section ${label} has no end`);
  return body.slice(0, i) + replacement + body.slice(j + end.length);
}

/** Replace the Phase 1 comparison section and add the attribution section. Fail closed. */
export function applyPilotSections(body, { plan, overlapTotals, pairedLocations, byBasis }) {
  if (!body.includes('<section aria-labelledby="kpi-h">')) {
    // Empty-range layout has no KPIs or comparison; add only the attribution section.
    return insertAfterSection(body, 'cv-h', attributionSection({ plan, byBasis }).toString());
  }
  let out = spliceOnce(body, '<section class="card" aria-labelledby="cmp-h">', '</section>', comparisonSection({ plan, overlapTotals, pairedLocations }).toString(), 'cmp');
  // KPI notes describe the single headline basis, not "no data", when only all-source totals exist.
  out = out.replace('No lead data imported yet.', 'No WWK-linked leads reported.').replace('No enrollment data imported yet.', 'No WWK-linked enrollments reported.');
  out = insertAfterSection(out, 'kpi-h', headlineNote(plan).toString());
  out = insertAfterSection(out, 'cv-h', attributionSection({ plan, byBasis }).toString());
  return out;
}

function insertAfterSection(body, labelId, extra) {
  const marker = body.includes(`<section class="card" aria-labelledby="${labelId}">`) ? `<section class="card" aria-labelledby="${labelId}">` : `<section aria-labelledby="${labelId}">`;
  const i = body.indexOf(marker);
  if (i < 0 || body.indexOf(marker, i + 1) >= 0) throw new LayoutAdaptationError(`pilot anchor ${labelId} not unique`);
  const j = body.indexOf('</section>', i);
  if (j < 0) throw new LayoutAdaptationError(`pilot anchor ${labelId} has no end`);
  const at = j + '</section>'.length;
  return body.slice(0, at) + extra + body.slice(at);
}
