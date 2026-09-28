# Internal Linking Report — 2026-08-31

Commit `f9c1a5e` on `live`. Verified live via HTTPS after deploy.

## Scope decision

The link-*concentration* lever is measured-exhausted (see memory
`internal_link_lever_exhausted`, `all_onpage_levers_exhausted`): pushing more links
at `/statistics/` or the money pages is not correlated with rank. The only
legitimate remaining surface is **hygiene** — pages carrying almost no prose inbound
links at all. That is what this run did.

## Measurement

Fresh clone of `origin/live`, link graph built with the correct resolver
(bare-relative hrefs resolved against the source directory — matching on
`'/education/'` in the href fabricates orphans).

| prose inbound | pages before | pages after |
|---|---|---|
| 0 | 0 | 0 |
| **1** | **36** | **1** |
| 2 | 84 | 119 |

414 indexable `/education/` pages with an `.article-body`. Zero orphans before and after.

## What was linked (35 insertions)

Each insertion is an in-body `<a>` inside a `<p>` or `<li>` within `.article-body`
on a topically matched donor page. Anchor text describes the destination
(no "click here", no anchor/destination mismatch).

| donor | → target |
|---|---|
| swim-school-apps-progress-tracking | advocacy-affiliation-swim-school-test |
| home-swim-lessons-vs-swim-school | backyard-pool-requirements-swim-instructor |
| water-safety-family-camping | camping-water-safety-checklist |
| swim-school-superlative-claims | celebrity-swim-school-endorsements |
| water-safety-daycare-schools | daycare-school-water-safety-questions-checklist |
| fall-swim-skill-retention-checklist | end-of-summer-swim-skills-report-card |
| water-park-safety | floating-water-park-safety |
| pool-party-host-safety-checklist | fourth-of-july-water-safety |
| free-infant-swim-lessons-under-6-months | free-baby-swim-classes-funnel |
| drowning-statistics-facts | ice-safety-cold-weather-kids |
| bathtub-safety-checklist | infant-water-safety-checklist |
| lake-house-water-safety-checklist | jet-ski-pwc-safety-families |
| swimming-pool-fence-laws-by-state | new-pool-owner-water-safety-checklist |
| founder-owned-vs-franchise-swim-school | olympic-founder-swim-schools |
| backyard-pool-safety | pool-closing-safety-checklist |
| vacation-water-safety | pool-slide-safety |
| open-water-safety-checklist | pool-to-open-water-transition-kids |
| swim-goggles-for-kids | prescription-goggles-swimming-kids |
| what-eight-swim-lessons-can-accomplish | project-safe-austin-ymca-free-swim-lessons |
| water-safety-teens | quarry-swimming-dangers |
| natural-swimming-holes-safety | retention-pond-water-safety |
| swim-lessons-autism-sensory | story-based-swim-lessons |
| summer-camp-water-safety | summer-camp-water-safety-checklist |
| swim-school-amenities-decoded | swim-instructor-employment-model |
| free-reduced-swim-lessons-make-a-splash | swim-lessons-esa-529-fsa |
| spring-break-water-safety | swim-lessons-while-traveling |
| aqua-tots-nj-vs-local-swim-schools | swim-school-superlative-claims |
| why-swim-lessons-are-30-minutes | thirty-minute-swim-lesson-science |
| renting-home-with-pool-safety | vacation-rental-pool-safety-checklist |
| swim-lesson-parent-involvement | water-safety-during-pregnancy |
| lake-ocean-safety | water-safety-family-camping |
| water-safety-month-guide | water-safety-month-action-plan |
| grandparent-water-safety-checklist | water-safety-with-twins-multiples |
| water-slide-safety-kids | water-slide-safety-checklist |
| summer-water-safety-checklist | wave-pool-safety |

Four links wrap an existing phrase in the donor's prose
(`drowning-statistics-facts`, `vacation-water-safety`,
`what-eight-swim-lessons-can-accomplish`, `water-safety-teens`); the other 31 append
one sentence to a topically relevant existing paragraph.

Date mirrors synced on all 35 donors: JSON-LD `dateModified`, the visible
`Updated <date>` meta item, and `sitemap.xml` `<lastmod>` — all set to 2026-08-31,
so schema and sitemap agree for these URLs.

## Not done

- **`flow-pools-vs-traditional-pools`** stays at 1 prose inbound. No page outside its
  existing inbound (`swimtastic-safesplash-swimlabs-comparison`) contains a paragraph
  that mentions flow pools, so there was no honest place to put a link. Needs a
  sentence written into a related pool-types page first — flagged, not forced.
- `fall-swim-skill-retention-checklist` has no visible `Updated <date>` meta item
  (only the schema field). Pre-existing; left alone rather than adding markup outside
  this run's scope.

## Guards run (all clean)

- 0 broken hrefs across all 35 changed files, resolved properly (root-relative and
  bare-relative both handled).
- 0 nested `<a>` anywhere in the changed files.
- Every `application/ld+json` block still `json.loads()`; **no `<a href` inside any
  schema block** — the raw edit was scoped to the `.article-body` byte range, so no
  insertion could land in the FAQ schema mirror first.
- No `ld+json` inside `.article-body`.
- Per-target assertion: exactly one new `p a`/`li a` with the new href on each donor.
- Two insertions initially landed after a colon that introduced a list
  (`water-safety-daycare-schools`, `free-reduced-swim-lessons-make-a-splash`); both
  were reverted and re-placed in a paragraph that reads correctly.

## Worth Michael's attention

Three near-duplicate title pairs surfaced while picking donors — candidates for a
cannibalization check, not fixed here:

- `wave-pool-safety` and `wave-pool-safety-kids`
- `camping-water-safety-checklist` and `water-safety-family-camping`
- `thirty-minute-swim-lesson-science` and `why-swim-lessons-are-30-minutes`

Also still open from prior runs: Google has not downloaded `sitemap.xml` since April
(it saw 97 of 640 URLs) — the deploy token is read-only, so resubmission has to come
from Michael in Search Console.
