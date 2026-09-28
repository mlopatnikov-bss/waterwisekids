# Site Audit — waterwisekids.com — 2026-09-05

Audited a fresh `/tmp` clone reset to `origin/live` (`656df20d2`). 763 HTML files; 647 indexable (93 noindex, 23 meta-refresh stubs).

## Health summary

| Check | Result | Status |
|---|---|---|
| Broken internal links | 0 / all resolved | PASS |
| Broken asset refs (CSS/JS/img) | 0 missing | PASS |
| HTML validation (lxml, all 647) | **2 errors → fixed → 0** | FIXED |
| Unbalanced tags sitewide | **1 → fixed → 0** | FIXED |
| JSON-LD parse failures | 0 of ~10.4k nodes | PASS |
| JSON-LD `url`/`@id` vs canonical | 0 contradictions | PASS |
| JSON-LD non-www hosts | 0 | PASS |
| Sitemap ↔ live parity | 647 / 647 exact, 0 stale, 0 missing | PASS |
| Sitemap `lastmod` present | 647 / 647 | PASS |
| Canonical present + correct host | 647 / 647 | PASS |
| Title / meta description / H1 | 647 / 647 each | PASS |
| og ↔ twitter mirror equality | 647 / 647 (title + description) | PASS |
| Duplicate `<title>` (indexable) | 0 | PASS |
| `<img>` missing alt | 0 of 1,669 | PASS |
| Inline `<svg>` unlabeled | 0 of 13 | PASS |
| `<img>` missing width/height (CLS) | 0 | PASS |
| Duplicate element IDs | 0 | PASS |
| Nested anchors / multiple H1 | 0 | PASS |
| Cache-bust keys stale | 0 of 15 assets | PASS |
| Font axis (one spec per family) | Inter: 1 spec × 647 pages | PASS |
| Files > 300 KB | 1 (`/education/index.html`, 341 KB) | WATCH |
| Duplicate H1 pairs | 12 | DEFERRED (known backlog) |

## Fixed and deployed — `227236bfa`

**1. `education/swimming-with-down-syndrome-kids.html` — unclosed `<strong>`**

The "bottom line" paragraph opened `<strong>` and never closed it, so the entire
670-character closing paragraph rendered bold. Corpus convention is bold lead-in
plus plain prose (69 pages) versus whole-paragraph bold (5), so the tag was closed
after the lead sentence. Longest bold run is now 197 chars.

**2. `education/swim-instructor-continuity-worksheet.html` — orphaned `.article-body` div**

`<div class="article-body">` was never closed; `</main>` fired with the div still
open. It was the only unbalanced file of 419 education articles (418 balanced).
Added the closing `</div>`. Post-fix DOM shape now matches healthy siblings —
`.article-body` inside `<main>`, `<aside class="sidebar">` outside it as a sibling.

Neither fix changed prose, so `dateModified` and sitemap `lastmod` were
deliberately left untouched.

**Live verification:** both URLs re-fetched from production after deploy — HTTP 200,
0 parse errors, all tags balanced, fixes present.

## Notes and carry-forward

- **`/education/index.html` is 341 KB** — 3.6× the next-largest page and the only
  file over 300 KB. It is the guide-listing hub, so the size is structural rather
  than a defect, but it is the site's clear performance outlier. Worth considering
  pagination or lazy card rendering.
- **Render-blocking stylesheets:** 442 pages load 3, 4 pages load 4. Not a
  regression; noted as the standing performance ceiling.
- **1,306 `<img>` tags without `loading`/`fetchpriority`** — nearly all are small
  inline icon/logo SVGs, many above the fold where lazy-loading would hurt. Not
  treated as a defect.
- **External links not probed.** The site's outbound targets sit behind WAFs that
  return 403/404 to automated clients, so a status-code sweep produces no reliable
  signal. 816 CDC, 688 HealthyChildren, 672 Red Cross links remain unverified by
  design.
- **12 duplicate-H1 pairs** remain on the deferred backlog (losers carry zero
  impressions).
- **Sitemap submission** is still the open infrastructure item — needs Michael.

## Probe integrity

Three sweeps were canary-gated before their results were trusted:

- The link resolver was proven to catch root-relative, bare-relative, missing-image
  and missing-CSS breaks while ignoring hrefs inside `<script>`.
- An initial regex meta sweep reported 123 missing canonicals and 98 og/twitter
  mismatches. All were false positives — the regex assumed `name`-before-`content`
  attribute order, and ~200 pages serialize `content` first. Re-run with a parser:
  every count is zero.
- The tag-balance sweep initially flagged 4 files; 3 were CSS comments containing
  `<main>` and `<h3>` inside `<style>` blocks. Stripping `<style>` as well as
  `<script>` left exactly 1 real defect.
