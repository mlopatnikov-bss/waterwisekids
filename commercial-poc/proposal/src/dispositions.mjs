// Release blockers, source conflicts and Phase 3 prerequisites recorded for review.
// RB-1..RB-3 are resolved by the P2-R2 diffs; source conflicts and Phase 3 prerequisites stay visible.
export const RELEASE_BLOCKERS = [
  { id: 'RB-1', status: 'resolved by proposal (P2-R2)', pages: '6 local guide pages (all except Toms River and New York)',
    issue: 'Each page contained an unlabeled `<section class="featured-school">` promoting the same British Swim School tenant ("Featured School" badge, ★★★★★, "4.9/5 (218 reviews)" or "4.8/5 (186 reviews)", "proven", "certified by American Red Cross", "Free trial lesson"), none of it sourced. A labeled card next to it would blur the sponsored/editorial line.',
    disposition: 'Resolved: each diff deletes the whole Featured School block (badge, stars, rating/review count, claims and its CTA) and puts the labeled sponsored-pilot card in exactly that position. The duplicate BSS CTA banners, BSS-naming intros, the Cheltenham FAQ (visible and JSON-LD) and the NWP social descriptions are neutralized in the same diffs (see the per-page audit). Tests over the fully patched pages prove no `.featured-school`, stars, rating/review counts, free-trial/consultation offers or BSS links remain outside the card.' },
  { id: 'RB-2', status: 'resolved by proposal (P2-R2)', pages: 'All 8',
    issue: 'The earlier disclosure ("Sponsored placement in a WaterWiseKids pilot") did not state the commercial relationship.',
    disposition: 'Resolved with the Codex-specified text on every card, for all three tenants: "No-fee pilot placement. WaterWiseKids may offer paid sponsored placements in the future. Sponsorship does not change directory order or editorial content." No price is published. Note for the release reviewer: PLAN.md says two pilot tenants are the operator\'s own schools; this text states the commercial relationship as Codex directed and does not separately state ownership.' },
  { id: 'RB-3', status: 'resolved by proposal (P2-R2)', pages: '`/swim-lessons-toms-river-nj.html`',
    issue: 'The page linked britishswimschool.com/jersey-shore/ and the Toms River location page from an unlabeled "Next step" box and a "School website" sidebar card (no rel="sponsored", no UTMs), and the hero text pointed readers to those links.',
    disposition: 'Resolved: the diff removes the hero sentence, the BSS clause and "Visit Jersey Shore" button in the Next step box (keeping the internal "Jersey Shore lesson pages" link), the whole "School website" sidebar card, and the sidebar line sending readers to "the school website directly". The labeled card below the Next step box is the only BSS link on the patched page.' },
  { id: 'C01/C02', status: 'open source conflict (held)', pages: 'NWP pages', issue: 'LA Fitness - Andorra: on the official territory page, absent from WWK directory data, official page says "no classes available".', disposition: 'Held. Not named, shown or linked in any card. Territory cards say "Pool locations featured in this pilot", which is accurate without implying Cheltenham is the only location.' },
  { id: 'C03', status: 'open source conflict', pages: '`/swim-lessons/cheltenham-pa.html`, NWP territory cards', issue: 'Cheltenham locality differs between sources (Philadelphia vs Cheltenham).', disposition: 'Card shows the manifest address (official territory-page text, "…Philadelphia, PA 19150") on a page titled Cheltenham. Not resolved; owner to confirm preferred locality.' },
  { id: 'C04', status: 'open source conflict', pages: '4 WWK pages (not in this inventory)', issue: 'Existing WWK pages link the non-`/location/` Cheltenham URL variant.', disposition: 'Not changed. Cards use only the official listed `/location/` URL.' },
  { id: 'C05/C06', status: 'open source conflict (held)', pages: 'Jersey Shore pages', issue: 'Boys & Girls Club - Asbury Park: same pattern as Andorra.', disposition: 'Held. Not named, shown or linked. No card on `/swim-lessons/asbury-park-nj.html` (not in the brief inventory).' },
  { id: 'C07', status: 'open source conflict', pages: '`/swim-lessons/howell-nj.html`, Jersey Shore territory card', issue: 'Official pages render the Howell ZIP as "7731".', disposition: 'Card uses the manifest address with ZIP 07731.' },
  { id: 'C08/C09', status: 'open source conflict (held)', pages: '`/swim-lessons/directory/new-york.html`', issue: 'East Village: missing from directory pool list; official page shows 710 and 720 E 11th St.', disposition: 'Held. Not named, shown or linked; the Manhattan card lists the 7 eligible venues and says "featured in this pilot".' },
  { id: 'C10', status: 'open source conflict', pages: '`/swim-lessons/directory/new-york.html`', issue: 'No Manhattan city page exists; the NY state directory is the only Manhattan surface.', disposition: 'Territory-level card placed in the directory page\'s "Cities We Cover" section after the "inclusion is not a ranking" disclaimer, outside `#schoolsList`. No new page created.' },
];

export const PHASE3_PREREQUISITES = [
  { id: 'P3-1', item: 'Collector endpoint', detail: 'No collector exists yet (hosting is a Phase 3 decision). The script tag in every diff carries no `data-wwk-collector`, so the client is inert (no observers, listeners or requests) until a reviewed HTTPS endpoint is set. Cards and links work regardless. The collector must set no cookies and must not log Referer or IP.' },
  { id: 'P3-2', item: 'Real campaign dates', detail: 'Manifest campaign windows are fixtures (sponsored window ends 2026-11-30); the collector rejects events outside them. Real pilot dates, inventory status promoted from `fixture_candidate`, and a re-verified official snapshot are needed before release.' },
  { id: 'P3-3', item: 'Cross-browser and device QA', detail: 'Evidence covers a Node vm harness and Playwright Chromium only. Safari/iOS, Firefox, Chrome and Edge on real devices, plus a screen-reader pass, are still required.' },
  { id: 'P3-4', item: 'Release decision', detail: 'Applying any diff is a separately reviewed release action. The GA4 classifier in assets/js/main.js targets `.featured-school`; once the block is removed those clicks are no longer classified there, and sponsored clicks are measured by the card instead. Confirm before release.' },
];

export function pageDisposition(page) {
  const ids = page.conflicts.map((c) => c.id);
  const parts = [];
  if (ids.includes('C01') || ids.includes('C05') || ids.includes('C08')) parts.push(`held location(s) ${page.held_locations_not_shown.map((h) => h.display_name).join(', ')} are not shown or linked`);
  if (ids.includes('C03') && page.destinations.some((d) => d.official_url.includes('la-fitness-cheltenham'))) parts.push('C03 Cheltenham locality conflict unresolved; manifest address shown');
  if (ids.includes('C04') && page.destinations.some((d) => d.official_url.includes('la-fitness-cheltenham'))) parts.push('C04: only the official `/location/` URL is used');
  if (ids.includes('C07') && page.destinations.some((d) => d.official_url.includes('la-fitness-howell'))) parts.push('C07: ZIP shown as 07731');
  if (ids.includes('C10')) parts.push('C10: territory-level card on the existing NY directory page; no Manhattan page created');
  if (page.page_path === '/swim-lessons-toms-river-nj.html') parts.push('RB-3 resolved: unlabeled BSS hero sentence, Next-step button and School-website sidebar card removed');
  else if (!page.page_path.includes('/directory/')) parts.push('RB-1 resolved: Featured School block replaced by the card; other BSS promotion neutralized');
  else parts.push('organic directory listing and order unchanged');
  parts.push('RB-2 resolved (no-fee pilot disclosure); P3-1..P3-4 apply');
  return parts.join('; ') + '.';
}
