# SEO Optimizer — 2026-08-30

**Commit:** `b5680c37` pushed to `live` · base `64e4c262`
**Corpus:** 751 tracked HTML · 728 non-stub · 641 indexable · 87 noindex · 23 meta-refresh stubs

## Baseline presence checks — all zero (again)

Confirmed by canary (cardinality asserted, not assumed):

| Check | Result |
|---|---|
| Meta description present | 728 / 728 |
| Meta description length | min 71 · max 160 · avg 145.7 — 0 outside 70–160 |
| Duplicate meta descriptions across pages | 0 |
| Image `alt` attribute | 1826 / 1826 images · 0 missing · 0 empty · 0 over 125 chars · 0 filename-as-alt |
| JSON-LD blocks parse | 2123 / 2123 |
| Article required fields (headline/dates/image/author/publisher) | 0 missing |
| FAQ `mainEntity` name + acceptedAnswer.text | 0 missing |
| OG title/description/image/url/type · twitter:card · canonical · title | 0 missing |
| `og:url` vs canonical | 0 disagreements |
| JSON-LD non-www host drift | 0 |
| Schema/OG image URLs resolving to a real file | 0 broken |
| Metas leaked into `<body>` (broken-head canary) | 0 |

Per the standing note, presence checks are saturated — the run went to second-order
cross-signal comparisons, which is where everything below came from.

## Fixed (7 files, +7 / −6 lines)

### 1. Visible `Updated` date contradicted schema `dateModified` — 5 pages

Residual of the 2026-08-29 `dateModified` pass (`f387109f`): schema was corrected,
the visible `.article-meta-item` mirror was not. Direction of the fix was **not**
assumed — for each page I walked git history newest-first comparing extracted
`.article-body` text, and the schema value matched the true last content change on
all five, so the visible string was the stale side.

| Page | Visible was | Now | Body-diff confirms |
|---|---|---|---|
| `education/backyard-pool-requirements-swim-instructor.html` | Aug 21 | Aug 29 | `da0be271` 2026-08-29 |
| `education/backyard-pool-safety.html` | Aug 17 | Aug 29 | `da0be271` 2026-08-29 |
| `education/pool-opening-season-safety.html` | Aug 6 | Aug 29 | `da0be271` 2026-08-29 |
| `education/swim-lesson-levels-explained.html` | Apr 8 | Aug 25 | `58956380` 2026-08-25 |
| `education/realistic-swim-progress-timelines.html` | two contradicting Updated items | one (Aug 28) | `209ee002` 2026-08-28 |

`realistic-swim-progress-timelines` carried `April 13, 2026 · Updated June 23, 2026`
in the published-date item *and* `Updated August 28, 2026` in the next one — two
different "last updated" claims visible on the same page. Removed the older fragment.

### 2. Article `headline` ≠ `<h1>` — 1 indexable page

`statistics/state-of-drowning-prevention/index.html` — headline read
`The State of Drowning Prevention in America — 2026`, H1 reads
`…in America`. Synced headline → H1 via raw JSON-span edit with decoded comparison.

The raw probe flagged 87 pages; 86 are noindex printables where the mismatch is
house convention. Filtering noindex first left exactly one, and a 640:1 match
majority on indexable pages confirms it as drift, not design.

### 3. `404.html` missing `og:image:alt` — added.

## Verified after the edit

Per-file guards (all passed): every JSON-LD block reparses · no meta leaked into
body · title and canonical intact · at most one `Updated` item per page · visible
`Updated` string equals schema `dateModified` · headline equals H1.

Sitewide re-sweep of the same shapes across all 751 files afterwards:
`meta_in_body 0` · `dup_updated_item 0` · `visible_ne_schema 0` ·
`headline_ne_h1_indexable 0`.

## Investigated, deliberately not changed

- **`breadcrumb_missing` on 3 hub pages — false positive.** The probe walked only
  top-level JSON-LD nodes; `education/`, `aquatic-jobs/`, `swimmers-hub/` all carry
  `BreadcrumbList` nested under a `WebPage.breadcrumb` property. Probe corrected.
- **`alt` duplicated within a page — 641/641.** The logo carries
  `alt="WaterWiseKids"` in both header and footer. Universal cardinality = convention.
- **`og:locale` absent — 641/641.** Universal absence, defaults to `en_US`, no
  ranking or snippet effect. A 641-file diff for nothing.
- **`og:description` ≠ meta description.** Standing finding: deliberate
  social-share copy, not a stale mirror.
- **`"Updated for 2026"` on 3 pages** (`home-water-safety-framework`,
  `pool-drain-safety`, `water-safety-during-pregnancy`) — known legitimate phrasing.
- **Title over 65 chars — 4 pages**, all noindex printables (66–67 chars). No SERP,
  no CTR lever.
- **`The "4 C's of Progress"` title quotes** — straight quotes inside `<title>`
  element *text*, which is legal; not the attribute-breaking-head defect class.

## Noted for a future run (out of this job's scope)

- **Heading-level skips on 66 pages** (h1 → h3, h2 → h4). Accessibility and
  outline-parsing signal rather than meta/alt/schema/OG. Concentrated in
  `education/*-checklist*.html` and the two `british-swim-school/` region pages.
