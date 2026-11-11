# Territory SEO: rollout and measurement packet

Territories: Cheltenham PA; Howell, Brick and Toms River NJ; Manhattan NY. Prepared 2026-11-02. Status: **implemented in the worktree; nothing is deployed.** Every step below that touches production, Search Console, analytics or anyone outside WWK requires a separately reviewed release decision. Facts come from the repository, plus the Search Console baseline supplied as verified on 2026-11-02 (§2). Anything else that needs live data is marked **verify**.

## 1. What changed

| Town | Primary for "swim lessons / kids swim lessons in <town>" | Consolidated into it (rel=canonical, removed from the sitemap, links repointed, visible note) | Kept for a different intent |
|---|---|---|---|
| Cheltenham | `/swim-lessons/cheltenham-pa.html` (sponsored card) | `/swim-lessons-cheltenham-pa.html`, `/kids-swim-lessons-cheltenham-pa.html`, `/kids-swim-lessons-cheltenham-township-pa.html` | toddler, beginner |
| Howell | `/swim-lessons/howell-nj.html` (card) | `/swim-lessons-howell-nj.html`, `/kids-swim-lessons-howell-nj.html` | toddler, beginner |
| Brick | `/swim-lessons/brick-nj.html` (card) | `/swim-lessons-brick-nj.html`, `/kids-swim-lessons-brick-nj.html`, `/kids-swim-lessons-brick-township-nj.html`; toddler and beginner township duplicates go to the Brick toddler and beginner pages | toddler, beginner, beach families |
| Toms River | `/swim-lessons-toms-river-nj.html` (card) | `/kids-swim-lessons-toms-river-nj.html` | toddler, beginner |
| Manhattan | **new** `/swim-lessons/manhattan-ny.html` (editorial guide; owner-approved Sponsored pilot card `plc_e487fb00e271338e` since 2026-11-02) | none | `/swim-lessons/directory/new-york.html` (state directory and statewide card `plc_10e8497ef216c69d`; unchanged) |

Primary pages now have 12–19 internal links each (before: 1–2) and link to their age/stage pages. The `/swim-lessons/` hub, the Find Lessons page, the state directories and the related-page lists now point at the primaries.

Accuracy fixes on primaries (visible text and FAQ schema changed together):
- Replaced unsourced or conflicting age claims ("ready around age 4", "as young as 6 months … structured lessons around age 2–3", "many area programs welcome infants from 6 months") with the AAP statement the site already uses elsewhere.
- Restated the 88% figure as the 2009 study's association, which the researchers called imprecise.
- Howell: replaced unverified claims about local schools ("certified instructors", "heated pools", "from 6-month-old infants") with neutral guidance and a questions-to-ask checklist.

Totals: 44 public files (43 modified, 1 added), 64 internal links repointed, 19 redundant list items removed, 11 sitemap URLs removed and 1 added. Live sponsored cards, tracking, portal and reporting code are untouched. The New York directory's sponsored card remains byte-identical; unrelated editorial safety copy may change under its own reviewed release.

## 2. Pre-release go/no-go (Search Console, read-only)

**Recorded 2026-11-02: GO.** Baseline Aug 1 – Oct 31, 2026: site 944 clicks, 121K impressions, 0.8% CTR, average position 12.9. Brick 0 clicks / 5 impressions / position 24.4; Cheltenham 0 / 2 / 17; Howell 0 / 3 / 9; Toms River 0 / 11 / 10.5. Manhattan has no pre-release URL (baseline zero / not applicable). These are filtered page-URL totals, so they are partial (see `evidence/search-console-baseline-2026-08-01_2026-10-31.md`). No town page earned a click, so the consolidation cannot cost measurable clicks. The steps below stay as the procedure for future territories.

Search Console data is not in the repository, so these checks are **verify** items. An operator runs them in the Search Console UI; nothing is automated here.

1. **Performance → Pages**, last 3 months, filtered to each consolidated URL and its primary. Record clicks, impressions and top queries in a dated note under `seo/evidence/` (aggregates only).
2. **Decision rule:**
   - If a consolidated URL has **more clicks than its primary**, still consolidate (it is the same intent). Flag that town for daily monitoring in week 1, and release at the start of a reporting week.
   - If a consolidated URL ranks for a query the primary does not cover (for example "Brick Township" variants), make sure the primary's copy covers that wording before release. The Brick and Cheltenham primaries already mention the townships.
   - **No-go:** a consolidated URL earns most of the town's clicks *and* the sponsor or owner objects to changing URLs inside the 60-day pilot window. Fall back to option C in `../CONTENT-WORKLIST.md` (no change until the pilot ends).
3. **URL Inspection** on each primary and on the new Manhattan guide: "URL is on Google" or "can be indexed", and the user-declared canonical equals the URL.
4. **Verify the live host behaviour** with a HEAD request after release. Check whether Pages answers `/x.html` with 200 or with a 308 to `/x`. If it redirects, all canonicals site-wide (not only these) point at a redirecting URL. That would be a separate, site-wide fix outside this package.

## 3. Release steps (after review)

1. Publish through the normal reviewed process: PR → review → merge. The directory preservation and mobile guards run in the pre-push hook. Do not bypass them.
2. Search Console: resubmit `sitemap.xml`. Request indexing for the four primaries and `/swim-lessons/manhattan-ny.html`. **Do not** use the Removals tool on consolidated URLs; let the canonicals work.
3. Record the release date in the pilot log as an **annotation**: "Territory SEO consolidation live on YYYY-MM-DD".

## 4. Measurement

### Search (WWK search visibility, labeled as such per PLAN.md)

| Metric (Search Console) | Unit | Baseline | Checkpoints | Healthy direction |
|---|---|---|---|---|
| Clicks and impressions, primary + its consolidated URLs combined | per town | Aug 1 – Oct 31, 2026 (3 months): Brick 0 / 5, Cheltenham 0 / 2, Howell 0 / 3, Toms River 0 / 11 | day 14, 28, 56, then the 3 months after release | more impressions than the baseline; first clicks. Report absolute counts; percentages are meaningless at this volume |
| Average position, same filter | per town | Brick 24.4, Cheltenham 17, Howell 9, Toms River 10.5 | day 28, 56 | lower (better); expect noise at single-digit impressions |
| Site-wide context (not attributable to this change) | site | 944 clicks, 121K impressions, 0.8% CTR, position 12.9 | monthly | context only |
| Share of the town's impressions on the primary | % | same | same | rising toward >80% |
| Indexed: Google-selected canonical = primary for each consolidated URL | count of 11 | 0 | day 14, 28 | 11 of 11 by day 56 |
| Manhattan guide impressions and clicks (`/swim-lessons/manhattan-ny.html`) | per week | none; no pre-release URL. Measurement starts at launch | weekly | non-zero impressions by day 28; then trend |

Read week-to-week changes as noise below about ±20% at these volumes. Do not attribute ranking changes to sponsorship; the plan forbids selling or implying organic ranking.

### Sponsor metrics (portal, unchanged definitions)

- Consolidation sends more organic visitors to the card pages, so **eligible views will rise from the release date for reasons unrelated to the card.** Compare sponsored CTR (clicks ÷ viewable impressions) and outbound clicks per 100 eligible views before and after release, never raw view totals.
- Split the 60-day pilot readout at the release annotation: before vs after. Report it as correlation, not attribution.
- Manhattan has two cards, reported separately in the portal's placement table: the NY directory card `plc_10e8497ef216c69d` and the guide card `plc_e487fb00e271338e` (separate `utm_content` in the sponsor's analytics). Tenant totals are their sum. Report the guide card from launch only: it has no pre-launch history, no ordinary-listing control and no lift claim (`../MEASUREMENT.md` §4). Clicks from the guide's editorial venue table go to the operator untagged, by design. To publish the guide card, apply the D1 upsert **before** the page publish (`commercial-poc/staging/evidence/manhattan-guide-placement-2026-11-02.md`).
- Low-traffic rule (PLAN.md pilot gate): at these search volumes, extend the observation window rather than drawing conclusions from 60 days.

### AI-search visibility (manual sample, no scraping)

Once a month, a person asks a fixed prompt set in the main assistants and in Google's AI results, then logs whether a WWK URL is cited and which one. Examples: "kids swim lessons in Howell NJ", "toddler swim lessons Brick Township", "how to choose swim lessons in Manhattan", "what age should my child start swim lessons" with each town name. Keep the log as dated aggregates in `seo/evidence/`. It is a sample, not a metric, and must never be presented to sponsors as a ranking.

What makes these pages citable is already in place and enforced by the audit: answer-first headings, a Quick Answer box with primary sources (AAP, CDC, the 2009 study), a visible "reviewed" date on the hub, and FAQ schema that matches the visible text exactly.

## 5. Legitimate off-site outreach (requires owner approval; nothing has been sent)

Principles: earn links by being useful. Never buy or trade links. Never require a sponsor to link to WWK. Any paid or sponsored mention uses `rel="sponsored"`. Disclose the pilot relationship whenever a sponsor is involved.

| Who (category) | Asset to offer | Ask |
|---|---|---|
| The pilot operators' own location pages | the town primary or the Manhattan guide | an optional "Water safety reading for parents" link. Disclose the WWK pilot relationship; the link is optional and never a condition of the pilot |
| Parent groups, PTA or parent newsletters, library family pages in each town | the town primary and the questions-to-ask checklist | include it in a "summer or winter swim readiness" resource list |
| Pediatric practices and parenting resource pages (Manhattan) | the hub's age guidance and the "pools inside other buildings" checklist | add it as a parent handout link |
| Local community calendars | water-safety printables from `/tools/` | list them as a free family resource |
| WWK's own social channels and Facebook group | each primary and the hub | one post per territory. Use UTMs like `utm_source=wwk_social`; never use sponsored UTMs |

Track each outreach as one row in a dated, PII-free log: date, category, URL offered, outcome. Store contacts outside the repository.

## 6. Optional later step: redirects

Only if a live check confirms that `_redirects` is honoured on this Pages project (Functions not compiled, or excluded with `_routes.json`): a reviewed `_redirects` file could 301 the 11 consolidated URLs to their primaries after Google has adopted the canonicals (about day 56). Until that check, ship nothing. A wrong assumption here would silently do nothing, or would break if Functions are later enabled.

## 7. Rollback

- **Full:** revert the commit. Canonicals, sitemap entries, links and the guide all return to their previous state; sponsored cards are unaffected.
- **Partial (one town):** in `territory-map.json`, remove that town's `consolidate` entries. Restore the old pages' self-canonical, og:url and sitemap entries from git. Revert the link rewrites from the commit diff. Run `audit` until it is clean.
- **Manhattan guide card only:** apply `rollback/remove-man-guide-manhattan.diff` from the Manhattan packet (`commercial-poc/staging/ROLLBACK.md` step 1b). The statewide card and the guide's editorial content stay.
- **Manhattan guide:** remove the card first (above), then remove the page, its sitemap entry, and the three inbound links (`/swim-lessons/index.html`, `/find-swim-lessons.html`, `/find-a-pool/new-york.html`). Nothing else depends on it.
