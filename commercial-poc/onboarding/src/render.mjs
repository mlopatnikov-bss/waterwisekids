// Deterministic sponsored-card HTML. The markup is byte-compatible with the cards that
// are live on the pilot pages (tests compare against the real files), and with
// the client component in assets/js/wwk-sponsored.js (data-wwk-* attributes).
import { MAX_PLACEMENT_LOCATIONS } from './schema.mjs';

export { MAX_PLACEMENT_LOCATIONS };
export const UTM_SOURCE = 'waterwisekids';
export const UTM_MEDIUM = { sponsored_pilot: 'sponsored_pilot' };
export const LINK_REL = 'sponsored noopener';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Official URL + campaign-level UTM tags only (no person, session or page-view values). */
export function utmUrl(officialUrl, campaign, placementId) {
  const u = new URL(officialUrl);
  if (u.search || u.hash) throw new Error(`official URL must not carry query/fragment: ${officialUrl}`);
  const params = { utm_source: UTM_SOURCE, utm_medium: UTM_MEDIUM[campaign.kind], utm_campaign: campaign.campaign_id, utm_content: placementId };
  for (const [k, v] of Object.entries(params)) {
    if (!/^[a-z0-9_]{1,64}$/.test(v || '')) throw new Error(`invalid UTM value for ${k}`);
    u.searchParams.set(k, v);
  }
  return { url: u.toString(), params };
}

/** Destinations of one placement, in card order: location pages first, territory last. */
export function placementDestinations(tenant, placement) {
  const byLoc = new Map(tenant.destinations.filter((d) => d.kind === 'location').map((d) => [d.location_key, d]));
  const terr = tenant.destinations.find((d) => d.kind === 'territory');
  const locs = new Map(tenant.locations.map((l) => [l.location_key, l]));
  const out = placement.location_keys.map((k) => {
    const l = locs.get(k); const d = byLoc.get(k);
    return { destination_id: d.destination_id, location_id: l.location_id, location_key: k, kind: 'location', official_url: l.official_url, label: l.display_name, address: l.address_display };
  });
  out.push({ destination_id: terr.destination_id, location_id: null, location_key: null, kind: 'territory', official_url: tenant.school.territory_url, label: tenant.school.display_name, address: null });
  return out.map((d) => ({ ...d, host: new URL(d.official_url).hostname, ...(({ url, params }) => ({ tagged_url: url, utm: params }))(utmUrl(d.official_url, tenant.campaign, placement.placement_id)) }));
}

/** Card block as an array of lines (comment, stylesheet, aside, script). */
export function renderCardLines(def, tenant, placement) {
  const c = tenant.campaign; const p = placement; const id = p.placement_id;
  if (!Array.isArray(p.location_keys) || p.location_keys.length < 1 || p.location_keys.length > MAX_PLACEMENT_LOCATIONS) throw new Error(`a card lists 1 to ${MAX_PLACEMENT_LOCATIONS} locations (got ${p.location_keys?.length})`);
  const pad = ' '.repeat(p.indent); const in1 = `${pad}  `; const in2 = `${pad}    `;
  const dests = placementDestinations(tenant, p);
  const terr = dests[dests.length - 1];
  const locDests = dests.slice(0, -1);
  const featured = p.variant === 'featured_location' ? locDests[0] : null;
  const a = (d, inner, withLoc) => `<a href="${esc(d.tagged_url)}" rel="${LINK_REL}" data-wwk-destination="${d.destination_id}"${withLoc ? ` data-wwk-location="${d.location_id}"` : ''}>${inner}</a>`;
  const host = (h) => `<span class="wwk-sponsored__host"> (${esc(h)})</span>`;
  const v = esc(def.site.component_version);
  const lines = [
    `${pad}<!-- WWK sponsored placement ${id} (${esc(c.disclosure_label)}) -->`,
    `${pad}<link rel="stylesheet" href="/assets/css/wwk-sponsored.css?v=${v}">`,
    `${pad}<aside class="wwk-sponsored" aria-labelledby="wwk-sp-${id}-label wwk-sp-${id}-title" data-wwk-sponsored-card="" data-wwk-tenant="${tenant.tenant_id}" data-wwk-school="${tenant.school.school_id}" data-wwk-campaign="${c.campaign_id}" data-wwk-placement="${id}"${featured ? ` data-wwk-location="${featured.location_id}"` : ''} data-wwk-page-path="${esc(p.page_path)}">`,
    `${in1}<p class="wwk-sponsored__label" id="wwk-sp-${id}-label">${esc(c.disclosure_label)}</p>`,
    `${in1}<h2 class="wwk-sponsored__title" id="wwk-sp-${id}-title">${esc(tenant.school.display_name)}</h2>`,
  ];
  if (featured) {
    lines.push(`${in1}<p class="wwk-sponsored__text">Pool location: ${esc(featured.label)}, ${esc(featured.address)}. Check current schedules, pricing and enrollment directly with the school.</p>`,
      `${in1}<ul class="wwk-sponsored__links">`,
      `${in2}<li>${a(featured, `${esc(featured.label)} location page${host(featured.host)}`, true)}</li>`);
  } else {
    lines.push(`${in1}<p class="wwk-sponsored__text">Pool locations featured in this pilot (${esc(terr.host)}):</p>`, `${in1}<ul class="wwk-sponsored__venues">`);
    for (const d of locDests) lines.push(`${in2}<li>${a(d, esc(d.label), true)} <span class="wwk-sponsored__address">${esc(d.address)}</span></li>`);
    lines.push(`${in1}</ul>`, `${in1}<p class="wwk-sponsored__text">Check current schedules, pricing and enrollment directly with the school.</p>`, `${in1}<ul class="wwk-sponsored__links">`);
  }
  lines.push(`${in2}<li>${a(terr, `${esc(terr.label)} website${host(terr.host)}`, false)}</li>`,
    `${in1}</ul>`,
    `${in1}<p class="wwk-sponsored__disclosure">${esc(c.disclosure_text)}</p>`,
    `${pad}</aside>`,
    `${pad}<script src="/assets/js/wwk-sponsored.js?v=${v}" data-wwk-collector="${esc(def.site.collector_url)}" defer></script>`);
  return lines;
}

/** Locate an existing card block for this placement: { start, end } line indexes (end exclusive) or null. */
export function findCardBlock(lines, placementId) {
  const start = lines.findIndex((l) => l.trimStart().startsWith(`<!-- WWK sponsored placement ${placementId} `));
  if (start < 0) return null;
  for (let i = start; i < Math.min(lines.length, start + 40); i += 1) if (lines[i].includes('/assets/js/wwk-sponsored.js')) return { start, end: i + 1 };
  return { start, end: -1 };
}
