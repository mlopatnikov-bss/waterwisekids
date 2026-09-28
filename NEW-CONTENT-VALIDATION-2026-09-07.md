# New Content Validation — 2026-09-07

**Scope:** files ADDED to `live` in the last 24 hours (`--diff-filter=A`).
Audited against a fresh clone, not the mount.

## Files in scope (2)

| File | Family | Verdict |
|---|---|---|
| `education/swim-school-pool-tour-checklist.html` | article | template PASS, **1 content defect fixed** |
| `education/swim-school-pool-tour-checklist-printable.html` | printable | family PASS, **2 defects fixed** |

11 other commits landed in the window, but they modified existing pages only
(the "modified in 24h" set is 700+ files and is not new content).

## Template compliance — landing page

All 17 structural checks pass, before and after the fix:

- present: `main-layout`, `<main class="article">`, `article-header`,
  `article-meta-item`, `article-body`, `article-excerpt`, styled breadcrumb,
  `main.css`, `article.css`, `GTM-5DN8B3QT`, `tldr-box`, `FAQPage`, `sidebar`
- banned patterns absent: `article-layout`, `article-main`, `</article>`,
  `<main class="main-layout">`

Also verified: 25 unique internal links all resolve · 2 images, 0 missing alt ·
0 inline SVG · nav + `footer-links` + `footer-bottom` present · 3 JSON-LD blocks
parse (Article, BreadcrumbList, FAQPage) · og/twitter title and description
identical · meta description 145 chars decoded · canonical correct · tag balance
clean · sitemap entry present with `lastmod` 2026-09-07 · visible date
(Sept 6) correctly mirrors `datePublished`, per corpus convention (360/368).

The printable fails the article checks **by design** — it is a separate template
family. It was audited against the 97-file printable corpus instead: `noindex`
(94/97 do), absent from sitemap (94/97 are), canonical, og, twitter, GTM,
BreadcrumbList, `window.print`, `@media print`, `print-toolbar`, `cl-header`,
`screen-header`, `screen-cta`, `related-articles` — all present.

## Defects found and fixed

### 1. AAP water-temperature misattribution surviving in visible prose (both files)

Yesterday's correction (commit `793303f1e`) rewrote this page's **FAQPage
JSON-LD** and added the correct source block, but did not touch the **visible
prose**. The rendered page therefore credited the American Academy of Pediatrics
with a five-row age-banded table it has never published —

> 86–92°F for 0–3 (90°F ideal), 86–90°F for 3–6, 84–88°F for 6–10,
> 82–86°F for 10–12, 78–82°F for teens

— while its own Authoritative Sources block, six paragraphs later, correctly
read *"water heated to 87–94°F for classes with children age 3 and younger."*
The page contradicted itself, and its two visible FAQ answers diverged from the
schema they mirror.

The AAP publishes a figure for **one** age band: 87–94°F, age 3 and younger.
There is no AAP figure for children over 3.

Fixed at 4 prose sites on the landing page (TL;DR, body section, FAQ A1, FAQ A6)
and 3 on the printable (table header, note, flag), using the wording already
sanctioned by yesterday's corrections on the other twelve pages: the AAP figure
is stated as the AAP's, and the older-age bands are re-attributed to common
industry practice. The printable's 0–3 row now carries the real AAP band
(87–94°F) rather than 86–92°F.

Post-fix: visible FAQ matches FAQPage JSON-LD canonically on all 6 questions.
Sitewide residual sweep on the claim shape (all 700+ HTML files, `<script>` and
`<style>` stripped): **0 remaining AAP-attributed temperature bands other than
87–94°F**. Seven regex hits were inspected individually and are all false
positives — WHO figures, residential-pool figures, lap-pool figures, and the
corrected sentences themselves.

### 2. Printable missing its source-attribution footer

The printed sheet ended with no `.cl-footer` — no source line and, more
importantly, no waterwisekids.com URL. 91 of 97 printables carry this block; it
is what makes a sheet that leaves the browser still point back to the site.
Added, matching the family markup exactly. `.cl-footer` is styled for both
screen and print in `assets/css/printable-checklist.css`.

### 3. Stale `dateModified` on the printable

`2026-09-06`, though the body text changed today. Bumped to `2026-09-07`.
The visible date was correctly left alone — it mirrors `datePublished`.

## Not defects (checked and dismissed)

- Printable absent from `sitemap.xml` — correct; only 3 of 97 printables are
  listed, and it is `noindex`.
- Landing page's visible date (Sept 6) trailing `dateModified` (Sept 7) — the
  bare-date shape mirrors `datePublished` in 360 of 368 corpus pages.
- Printable missing `cl-emergency` — 6 printables omit it; this is a
  facility-evaluation sheet, and the equivalent content is carried by its
  `wk-flag` bands.

## Shipped

Commit `d47d6eee3` pushed to `live`. Two files changed.

## Not verified this run

No browser render check — Playwright is not installed in this session and
installing it conflicts with the task's disk-cleanup mandate. The edits are text
substitutions inside existing block elements plus one block copied verbatim from
a sibling printable; tag balance and JSON-LD parsing were verified statically.
Worth a render pass on the printable's temperature table in the next visual-QA run.
