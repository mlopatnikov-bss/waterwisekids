# Phase 2 proposal: sponsored card, tracking client, UTM contract and inventory

Status: **P2-R2 proposal for Codex review; not applied.** Exact per-page detail, including the promotional audit, is in `INVENTORY.md`; evidence is in `EVIDENCE.md`.

**What changed in P2-R2.** On the six pages with an unlabeled `.featured-school` block, the diff now deletes that whole block (badge, stars, rating and review count, claims, CTA) and puts the labeled card in its place. Every other BSS-promotional item on the eight pages was audited; promotional ones are neutralized in the same diffs and editorial or organic ones are kept and listed. The disclosure now states the commercial relationship. RB-1, RB-2 and RB-3 are resolved by the proposal.

## 1. Sponsored-card component

**Markup.** Static HTML, one block per page. On six pages it replaces the old Featured School section; on Toms River and New York it is inserted. The block has five parts, in this order:
1. An HTML comment naming the placement.
2. `<link rel="stylesheet" href="/assets/css/wwk-sponsored.css?v=p2r2">`.
3. The card itself: `<aside class="wwk-sponsored" data-wwk-sponsored-card …>`. It contains:
   - the visible label **"Sponsored pilot"** (a `<p>` and the first visible text),
   - the school name as a heading (`h2` on local guide pages, `h3` inside the New York directory section),
   - factual location copy and the instruction "Check current schedules, pricing and enrollment directly with the school.",
   - a list of plain links,
   - a disclosure line, identical for all three tenants: "No-fee pilot placement. WaterWiseKids may offer paid sponsored placements in the future. Sponsorship does not change directory order or editorial content." No price is published.
4. `<script src="/assets/js/wwk-sponsored.js?v=p2r2" defer></script>`.

**Links.** Every link is an ordinary `<a href>` to an official britishswimschool.com URL from the manifest, with static campaign UTMs (§3) and `rel="sponsored noopener"`. They open in the same tab, with no `target`, no `onclick` and no wrapper or redirect.

**Accessibility and no-JS.**
- The `<aside>` is `aria-labelledby` its label and heading.
- Links have 44 px tap height and a visible 3 px focus ring.
- Nothing is hidden or JS-dependent: with JavaScript off, the card renders identically and the links navigate (see `evidence/previews/nojs-*`).

**Distinct from organic content.**
- Neutral slate panel with an outlined pill label.
- No stars, ratings, badges, images or school-card classes.
- CSS is scoped under `.wwk-sponsored` with two-class selectors, so page templates cannot restyle it into something that looks organic.
- The card is never placed inside a directory list. On the New York page it sits after the existing "inclusion is not a ranking" disclaimer and outside `#schoolsList`; a test proves the 39 directory cards keep their order.

**Data attributes.** All are manifest IDs: `data-wwk-tenant`, `-school`, `-campaign`, `-placement`, optional `-location` (featured location), and `-page-path` (canonical path). Each link carries `data-wwk-destination` and, for location pages, `data-wwk-location`.

**Why the stylesheet is inside the block.** Edits are limited to the audited items. On these pages `</head>` and `</body>` share long single lines with other markup, so moving the stylesheet there would mean editing an unrelated line. `<link rel="stylesheet">` is valid in `<body>`. Moving it to `<head>` is an optional Phase 3 refinement.

## 2. Tracking client (`component/wwk-sponsored.js`)

**Progressive enhancement.**
- One small IIFE with no dependencies.
- It is **inert unless its script tag carries `data-wwk-collector`** with an `https:` URL (`http://localhost` / `127.0.0.1` is accepted for local preview only). The diffs deliberately omit that attribute: until Phase 3 sets a reviewed endpoint, the script creates no observers, listeners or requests.
- Including the script twice on a page is harmless.

**Events** (schema v1, `docs/EVENT-SCHEMA.md`), each at most once per card per page view:

| Event | When |
|---|---|
| `eligible_view` | The card was on the page when the client initialised. |
| `viewable_impression` | `IntersectionObserver` reports ≥ 50% of the card visible for ≥ 1,000 continuous ms while the tab is visible. A dip below 50% or a hidden tab restarts the clock. Sends `viewability {visible_ratio, visible_ms}`. Without `IntersectionObserver`, no viewable impression is ever guessed. |
| `sponsored_click` | First activation of any sponsored link in the card (click, or middle-button auxclick). |
| `outbound_click` | One per destination per page view. Carries `destination_id`, plus `location_id` for location pages. |

**IDs and fields.**
- Tenant, school, campaign, placement, location and destination IDs come only from the card's data attributes; the page path comes from `data-wwk-page-path`.
- `site_host` is `location.hostname`, the only part of the URL the client reads.

**Privacy.**
- One random UUID v4 `page_view_id` per page load, held in memory only.
- Referrer is reduced to `direct|internal|search|social|email|other|unknown` from the referrer *host*. Device is reduced to `mobile|tablet|desktop|unknown` via `matchMedia`, never the user agent.
- No cookies, no local, session or IndexedDB storage, no URL path, query or hash, no user agent, no fingerprinting, no personal data.

**Transport.**
- Events are queued, sent in batches of at most 25 as `text/plain` JSON (no CORS preflight), and flushed immediately on clicks and on `pagehide` / hidden visibility.
- `navigator.sendBeacon` is used when available and accepted. Otherwise the client falls back to `fetch(…, {keepalive: true, credentials: 'omit', referrerPolicy: 'no-referrer', mode: 'cors'})`, whose promise is never awaited and has its rejection swallowed.
- Every transport and observer call is wrapped in `try/catch`.

**Navigation safety.**
- The click listener only observes. It never cancels the default action, never stops propagation, never rewrites `href` and never opens windows.
- The browser follows the link exactly as it would without the script.
- Real-Chromium checks with the collector healthy, aborting, returning 500 and hanging all landed on the exact `href` in 57–66 ms (local stub destination).

**Interplay with existing site analytics.** The pages already load GTM and `main.js`, whose GA4 click classifier targets `.school-card, .school-listing, .featured-school` (`assets/js/main.js` line 697). The proposal removes the six `.featured-school` blocks, so those GA4 classifications stop on these pages; the sponsored card uses none of those classes and adds no GA4 events of its own (P3-4). GA4 enhanced measurement, if enabled in GTM, may still record outbound clicks as it does for any external link. That is existing site behaviour, noted for the release decision.

## 3. UTM contract (official BSS destinations only)

| Key | Value | Why |
|---|---|---|
| `utm_source` | `waterwisekids` | Lets the sponsor's own analytics attribute visits to WWK. |
| `utm_medium` | `sponsored_pilot` | Separates pilot placements from organic referrals. |
| `utm_campaign` | campaign ID, e.g. `cmp_88f0a7279a2972e2` | Campaign-level, opaque, stable; matches the portal. |
| `utm_content` | placement ID, e.g. `plc_bb4b763cf97d56ee` | Identifies the card slot (page), not a person. |

- Exactly these four keys, in this order, written into the static `href` at build time. Values must match `^[a-z0-9_]{1,64}$`.
- Never included: page-view, event, person, session, timestamp, referrer or page-URL values.
- Official URLs must not already contain a query or fragment.

Example (Howell location card):
`https://britishswimschool.com/jersey-shore/location/la-fitness-howell/?utm_source=waterwisekids&utm_medium=sponsored_pilot&utm_campaign=cmp_88f0a7279a2972e2&utm_content=plc_bb4b763cf97d56ee`

Example (Manhattan territory link):
`https://britishswimschool.com/manhattan/?utm_source=waterwisekids&utm_medium=sponsored_pilot&utm_campaign=cmp_c7fea2983961d658&utm_content=plc_10e8497ef216c69d`

## 4. Inventory (8 pages)

| Page | Card | Position | Other promotional items neutralized |
|---|---|---|---|
| `/swim-lessons/northwest-philadelphia.html` | NWP territory card: Cheltenham + website | **replaces** the Featured School section | OG and Twitter descriptions ("Book lessons at British Swim School."); final CTA ("Thousands … trust British Swim School … free trial", "Book Your Free Trial") |
| `/swim-lessons/cheltenham-pa.html` | NWP Cheltenham location card | **replaces** the Featured School section | both intro paragraphs; four FAQ answers, visible and JSON-LD kept identical (BSS as the provider, "$120-$250" and free consultations, BSS heated pools, "Top-rated options"); final CTA |
| `/swim-lessons/philadelphia.html` | NWP territory card | **replaces** the Featured School section | none needed (final CTA already neutral) |
| `/swim-lessons/jersey-shore.html` | JS territory card: Brick, Toms River, Howell + website | **replaces** the Featured School section | intro paragraph naming BSS |
| `/swim-lessons/howell-nj.html` | JS Howell location card | **replaces** the Featured School section | final CTA ("Schedule your free consultation and trial lesson", "Book Your Free Trial") |
| `/swim-lessons/brick-nj.html` | JS Brick location card | **replaces** the Featured School section | final CTA (same) |
| `/swim-lessons-toms-river-nj.html` | JS Toms River location card | inserted after the "Next step" box, before the Back link and FAQ | hero sentence pointing to BSS links; Next-step BSS clause and "Visit Jersey Shore" button; the whole "School website" sidebar card; sidebar "visit the school website directly" |
| `/swim-lessons/directory/new-york.html` | Manhattan territory card: 7 eligible venues + website | inserted after the "inclusion is not a ranking" disclaimer, outside `#schoolsList` | none: every BSS mention is the organic directory listing or editorial FAQ, kept byte-for-byte |

Neutralized CTAs reuse wording and targets the site already uses: "Compare swim schools near … and ask each one about current schedules, class sizes and enrollment." with the existing "Find Classes Near You" link to `/swim-schools.html`. Neutralized FAQ answers reuse the Toms River guide's existing no-price-range and year-round wording. Headings are kept.

Exact line numbers, expected source text, IDs, destinations, copy, the per-item audit and diff files are in `INVENTORY.md`.

**Copy rules.**
- Copy comes only from manifest facts: school name, venue names, and addresses from the official snapshot.
- No ratings, reviews, prices, offers, availability or outcome claims (tests ban them in the card and, on the seven local pages, anywhere outside it).
- Pilot price ($0) is not published; the disclosure says "No-fee pilot placement".
- Held locations (Andorra, Asbury Park, East Village) are never named, shown or linked by the proposal. Brick's existing related-resources link to WWK's own Asbury Park city guide is editorial navigation and is kept (audit BRK-K1).

## 5. Promotional audit and release blockers

**Audit method.** Every line of the eight pages that mentions British Swim School, britishswimschool.com, `/british-swim-school/`, stars, ratings, reviews, trials, consultations or "top-rated"/"proven"/"trusted" wording was reviewed and classified:
- **promotional** (unlabeled sponsor promotion, offer or unsupported claim): changed in the diff;
- **editorial / editorial_navigation** (generic guidance or internal WWK links, no school promoted): kept;
- **organic_directory** (the NY directory's ordinary listings): kept byte-for-byte.

Each edit in `inventory.config.json` names the exact source text it expects, so the build refuses to run if the page drifts. Totals: 28 promotional edits (6 of them are the Featured School blocks replaced by the card), 2 card insertions (Toms River, New York) and 23 kept items. The full list is in `INVENTORY.md`.

**One flagged editorial item.** The Howell intro says "expert, safety-first instruction is available in heated pools … certified instructors" without naming a school. It is generic editorial wording, not a sponsor claim, so it is kept but flagged for editorial review (HOW-K1).

**Release blockers.**
- **RB-1 resolved:** the Featured School blocks are replaced by the card, not left beside it.
- **RB-2 resolved:** the Codex-specified disclosure states the no-fee pilot and possible future paid placements. Note for release review: it does not separately state the operator's ownership of two tenants.
- **RB-3 resolved:** Toms River's unlabeled BSS links and pointers are removed; the card is the only BSS link on the page.
- **C01–C10:** source conflicts carried forward unchanged from Phase 1 and still open.
- **P3-1 to P3-4** (collector, real campaign dates, cross-browser QA, release decision) remain open; see §7.

## 6. Limitations

1. **Browser coverage.** The client was exercised in a Node `vm` harness (fake DOM, timers, observer and transports, with guards that record any forbidden API access) and in real Chromium via Playwright in a cloud sandbox. It was not tested in Safari or iOS WebKit, Firefox, or the operator Mac.
2. **Preview environment.** Previews used sandbox copies of the 8 pages and 9 local assets, SHA-256-identical to the worktree. Third-party hosts (GTM, Google Fonts, external images) were blocked, so typography falls back to system fonts. britishswimschool.com was answered by a local stub; no real BSS URL with UTMs was requested, to avoid polluting the sponsor's analytics.
3. **`sendBeacon` credentials and Referer.** `sendBeacon` sends credentials for the collector origin, and the page's default referrer policy sends the origin as `Referer`. The Phase 3 collector must set no cookies and must not log `Referer`. The `fetch` fallback already omits both.
4. **Undercounting is possible.** Users with JavaScript off, or browsers without `IntersectionObserver`, produce no events or no viewable impressions. Nothing is estimated.
5. **IP-address hosts are rejected.** In preview, a page served from `127.0.0.1` produced events the Phase 1 collector rejected as `pii_value`, because an IPv4-shaped `site_host` looks like an IP address. The preview therefore uses `localhost`. Staging hosts must be named, allowlisted hosts.
6. **Diffs are pinned to source text.** Every edit names the exact text it expects, and the diffs are strict. Any upstream edit to one of the eight pages makes the build, `--check` and the tests fail until the proposal is regenerated and re-reviewed.
7. **Fixture campaign dates.** The manifest's campaign dates are fixtures (sponsored window ends 2026-11-30), so the collector rejects events outside them. Real pilot dates must be set before release.
8. **Stylesheet placement.** The `<link rel="stylesheet">` sits inside `<body>` (see §1).

## 7. Phase 3 prerequisites

1. Owner decisions on held locations C01/C05/C08 and the C03 locality. Editorial sign-off on the neutralized copy (CTAs, Cheltenham FAQ, intros) and on the flagged Howell intro (HOW-K1).
2. A reviewed collector deployment covering:
   - hosting decision and HTTPS endpoint,
   - CORS allowing only `https://www.waterwisekids.com` and accepting `text/plain`,
   - no cookies; no IP, user-agent or `Referer` logging at the platform layer,
   - edge rate limiting and WAF,
   - health monitoring.

   After that review, add `data-wwk-collector="https://…"` to the script tag in each page block. That is a one-attribute, reviewed change.
3. A production manifest: real campaign dates, inventory status promoted from `fixture_candidate`, and the official snapshot re-verified close to release.
4. Private staging deployment of `00-new-assets.diff` plus the eight page diffs, then:
   - cross-browser QA (Safari/iOS, Firefox, Chrome, Edge),
   - an accessibility review with a screen reader,
   - a GTM/GA4 interplay check, including the `.featured-school` classifier that no longer matches (P3-4).
5. Sponsor consent for UTM tagging and to the disclosure wording, including for the Manhattan pilot partner.
6. A separately reviewed release decision. Only then may diffs be applied, and only from a clean regeneration against the then-current source.
