# Site Audit — waterwisekids.com — 2026-08-25

Audited a fresh `live` clone at `3459645` (741 HTML files, 636 sitemap URLs, 82 noindex).
Fixes shipped as **`e871060`** and verified against the live site.

## Health summary

| Check | Scope | Result | Status |
|---|---|---|---|
| Broken internal links | all `<a href>` on 741 pages | **0** | 🟢 |
| Dead external links | 299 distinct URLs, GET + redirects | **0** dead (114 WAF-403, known FP) | 🟢 |
| Canonical targets resolve | 741 canonicals | **0** dangling | 🟢 |
| Live HTTP status | 636 sitemap URLs | **636/636 → 200**, 0 redirects | 🟢 |
| Soft-404s (200 + error body) | 636 live pages | **0** | 🟢 |
| Thin pages (<4 KB served) | 636 live pages | **0** | 🟢 |
| Missing assets (css/js/img/icon) | all local refs | **0** | 🟢 |
| `<head>` integrity (unescaped-quote class) | html5lib parse | **0** metas or canonicals leaked to `<body>` | 🟢 |
| JSON-LD parse errors | all `ld+json` nodes | **0** | 🟢 |
| JSON-LD image URLs 404 | all image/logo refs | **0** | 🟢 |
| Duplicate JSON-LD `@type` per page | 741 pages | **0** | 🟢 |
| Missing / empty `alt` | all `<img>` | **0** | 🟢 |
| Missing `width`/`height` (CLS) | all `<img>` | **0** | 🟢 |
| Meta description missing / empty / >165ch | 741 pages | **0** | 🟢 |
| Unsubstituted `__PLACEHOLDER__` | raw source | **0** | 🟢 |
| Formspree endpoints malformed | all forms | **0** | 🟢 |
| Sitemap dead entries / noindex leakage | sitemap.xml | **0** | 🟢 |
| Oversized images (>400 KB) | all assets | **0** | 🟢 |
| Below-fold `loading="eager"` | 741 pages | **4 → fixed** | 🟡→🟢 |
| Unassociated form group labels | 741 pages | **3 → fixed** | 🟡→🟢 |

## Fixed and pushed (`e871060`)

**1. `education/index.html` — 4 below-fold cards were stealing LCP bandwidth**
Article cards at positions 203–206 of 353 carried `loading="eager" fetchpriority="high"` while the other 347 were `lazy`. `fetchpriority="high"` on an image ~200 cards deep actively competes with the real above-fold LCP element. Now `loading="lazy"`. Live: 0 eager, 0 fetchpriority.

**2. `aquatic-jobs/index.html` — "Pay Type" radio group had no accessible name**
The visible group label was a bare `<label>` with no `for` and no wrapped control, so screen readers announced each radio without the group name. Now `role="radiogroup"` + `aria-labelledby`.

**3. `swim-schools/add.html` — same defect on two checkbox groups**
"Age Groups Served" and "Programs & Services". Now `role="group"` + `aria-labelledby`. Individual checkboxes were already correctly labelled; only the group name was missing.

## Reviewed, not defects

- **55 raw "label without `for`" hits → 3 real.** 52 are directory-page rating widgets whose adjacent control carries its own `aria-label`/`placeholder`. Resolving the label↔control *pair* is what separates the two.
- **78 titles >70 chars.** All follow the intentional `Descriptive Title | WaterWiseKids` pattern; the 16-char brand suffix is what pushes them over. SERP truncates the suffix, which is the point. Not touched.
- **17 pages absent from sitemap / 13 missing `<h1>` / 5 orphans.** All the same class: ~3 KB redirect stubs (`articles.html`, `about.html`, `how-to-prevent-child-drowning.html`, …) that cross-canonical to their real destination. Every one has a working redirect mechanism and a canonical target that resolves — verified, 0 exceptions. Correctly excluded from the sitemap.
- **11 pages with JSON-LD in `<body>`.** Valid per Google; confirmed these are *not* duplicates of head nodes (0 duplicate `@type` sitewide).
- **`jobs/post.html` form with no `action`.** Submits via `addEventListener` at line 420 — my static check missed it. Separately, the jobs API remains a known open issue, out of scope here.
- **114 external 403/401s.** britishswimschool.com (38), cdc.gov (29), amazon.com (20) and others — WAF bot-blocking, not dead links. GET with a browser UA still returns 403 from the sandbox; the same URLs resolve in a real browser.

## Watch

- `education/index.html` is **337 KB** with 353 images and 393 links. All images now lazy and dimensioned, so runtime cost is contained — but the raw HTML payload is the largest on the site by ~10×. Worth considering pagination or a section-level split if it keeps growing.

## Notes on method

External-link checking used GET (not HEAD) with a browser User-Agent — HEAD produces phantom dead links on several of these hosts. Page structure was parsed with **html5lib** rather than regex so that a stray unescaped `"` in a meta tag would surface as content leaking into `<body>` instead of silently passing a presence check. `lastmod` was deliberately **not** bumped: the changes are loading/ARIA attributes, not content.
