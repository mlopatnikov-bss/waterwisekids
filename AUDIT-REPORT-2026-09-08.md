# SEO Audit — 2026-09-08

**Corpus:** 769 HTML files in the `live` clone · 23 redirect stubs · 98 printables · 746 distinct canonicals · 650 indexable (96 `noindex`).
**Shipped:** `d3fdeb34a` → `live`. 3 files, 18 insertions.

---

## Fixed

| # | Page | Defect | Fix |
|---|---|---|---|
| 1 | `tools/index.html` | Only hub on the site with **no primary page-type node** — carried `BreadcrumbList` + `FAQPage` and nothing else. `education/`, `swimmers-hub/` and `aquatic-jobs/` all carry a `CollectionPage`/`WebPage`. | Added `["CollectionPage","WebPage"]` with `name`/`description`/`url`/`isPartOf`, matching the sibling-hub pattern. |
| 2 | `education/survival-swim-skill-decoder.html` | Article `headline` stripped the typographic quotes the H1 carries: `What Roll to Back Float and…` vs `What “Roll to Back Float” and…`. Schema-vs-visible-prose drift. | Resynced `headline` to the H1 exactly. |
| 3 | `education/pool-fence-code-compliance-worksheet-printable.html` | Meta description 166 chars (decoded) — the corpus's only overflow. | Cut to 157, across **all three mirrors** (`description` / `og:description` / `twitter:description`). |

Post-fix re-probe: overflow 0, non-printable headline drift 0, missing page-type 1 (`index.html`, correct — homepage carries `Organization` + `WebSite`).

---

## Clean — the axes this task names

Every axis in the task brief probed and at zero, unchanged after the fixes:

| Axis | Result |
|---|---|
| Meta description missing / empty / duplicate | 0 / 0 / 0 groups |
| Meta description length (decoded) | min 71, max 160, mean 145.5, 59 distinct — no overflow |
| Canonical missing | 0 |
| `<img>` without `alt` / empty `alt` | 0 / 0 |
| Inline `<svg>` unlabelled | 0 |
| JSON-LD parse or `@context`/`@type` errors | 0 across 2,264 nodes |
| Pages with no JSON-LD | 0 |
| OG + Twitter keys (9 checked, non-stub) | 0 missing on each |
| `og:` ↔ `twitter:` mismatch | 0 |
| `og:url` ≠ canonical | 0 |
| Duplicate `<title>` | 0 |
| Head raw-attribute odd-quote | 0 |
| Article `headline` > 110 chars | 0 |
| Multiple H1 / no H1 | 0 / 0 — all 650 indexable pages have exactly one |

### Sitemap ↔ corpus reconciliation (new this run)

Exact, not approximate: **746 canonicals − 96 `noindex` = 650 = sitemap `<loc>` count.**
Indexable canonicals missing from sitemap: **0**. Sitemap URLs that aren't any page's canonical: **0**. `noindex` pages listed in sitemap: **0**.

### Anchor / link integrity (new this run, canary-gated)

Duplicate `id` in a document: 0 · anchor fragment → nonexistent `id`: 0 · `target="_blank"` without `rel="noopener"`: 0 · empty anchor text: 0.

All four verified live by injecting one synthetic instance of each into a scratch copy and confirming the probe caught all four — the zeros are real, not a dead filter.

---

## Investigated and deliberately **not** changed

**These are non-defects. Recording the reasoning so a later run doesn't re-litigate them.**

- **95 printables where Article `headline` ≠ H1.** The printable family sets `headline` to "Printable X" while the H1 is "X". All 95 are `noindex` — they generate no rich result, so the divergence has no SERP consequence. By design; leave alone.
- **4 pages with "no BreadcrumbList" — all false positives.** `index.html` is the homepage (correctly has none). `education/`, `swimmers-hub/` and `aquatic-jobs/` carry the `BreadcrumbList` **nested inside `WebPage.breadcrumb`**, which is the pattern Google documents. A probe that only reads top-level `@type` reports these as missing and would "fix" correct markup into a duplicate.
- **65 pages with an h2→h4 heading skip.** The h4s are **styling-coupled**, not semantic sloppiness: `article.css` targets `.checklist-preview h4`, `local-pages.css` targets `.faq-item h4` and `.school-info h4`, plus `special-needs.css` and `teens.css`. Retagging h4→h3 would silently restyle 65 pages. Not worth the regression risk for a weak signal.
- **359 pages where Article `description` ≠ meta description.** Mixed (≈200 match, 359 differ), and the same house convention already applies to `og:description` vs meta. Schema description reads as summary, meta description as SERP copy. Churning 359 files buys no ranking.
- **3 titles at 67–70 chars.** Left alone — title/meta rewrites are gated by the CTR freeze in the SERP/GSC directives, not by this task.
- **`schools-data.js` "missing" on 52 directory pages — probe bug, not a defect.** The `<script src="schools-data.js?v=…">` is page-relative; the file exists at `swim-lessons/directory/schools-data.js`. An asset-existence probe that resolves every href from the site root will manufacture this every time.

---

## Standing items still needing Michael

Unchanged from prior runs, none actionable from here:

- **Outreach is still the bottleneck** — nothing ships authority links until the staged batch is sent.
- **Sitemap not resubmitted in Search Console since April** — the file is internally perfect (see reconciliation above), but Google hasn't re-fetched it.
- **HTTP variants indexed** — needs the redirect toggle.
- **Sitemap `lastmod` contradicts schema `dateModified`** on 356 URLs.
- **122 pages: `.content-grid` sits 30px off-rail on desktop** — needs a design call.

---

## Read of the day

The four axes this task was written to patrol — meta, alt, schema, OG — are saturated; today's yield was one overflow and one quote-mark drift out of 769 pages. The finding with actual substance came from a **new** axis: `tools/` was the only hub missing a page-type node, which no meta/alt/schema-validity sweep would ever surface because its JSON-LD is *valid* — just incomplete. Worth noting that three of today's four apparent bulk defects (95 headlines, 4 breadcrumbs, 52 missing assets) were probe artifacts or by-design, and only survived to the report because each was checked individually rather than counted.
