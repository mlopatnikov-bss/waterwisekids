# SEO Optimizer — 2026-09-02

**Base:** `44171df9` (origin/live) → **Pushed:** `2598293c`
**Scope:** 757 tracked HTML files, audited in a fresh clone of `origin/live`
(mount's local `live` was stale at `2476831c`, ~2 weeks behind — not audited).

---

## Baseline: the four named surfaces were already clean

| Check | Result |
|---|---|
| Missing meta description | **0** |
| Empty meta description | **0** |
| Duplicate meta description | **0** |
| Meta description in `<body>` (broken `<head>`) | **0** |
| Missing `<title>` / canonical | **0 / 0** |
| Images missing `alt` attribute | **0** |
| Images with empty `alt` | **0** |
| Low-value alt (`image`, `IMG_1234.jpg`, …) | **0** |
| Malformed JSON-LD | **0** |
| Pages with no JSON-LD | **0** |
| Missing `og:title` / `og:image` / `og:url` / `og:description` / `og:type` / `twitter:card` | **0** across all six |

FAQ schema ↔ visible parity: **2969 / 2969 questions visible**, 631 `FAQPage` nodes.
Schema/OG image URLs: **82 distinct, 0 broken.**

Per protocol, a clean baseline means going deeper. That's where the real work was.

---

## Fixed and shipped

### 1. `mainEntityOfPage` missing from 297 indexable Article nodes
386 of 546 `Article` nodes lacked `mainEntityOfPage` — a Google-recommended Article
property, and one **160 pages on the site already carried**, so this was drift from a
convention rather than a design choice. Added the canonical URL to all **297 indexable**
pages, matching the existing shape exactly.

The remaining **89 are `noindex`** — verified individually, not assumed. Zero indexable
Article nodes are now missing it.

This needed **two markup variants**: 267 pages use pretty-printed JSON-LD (newline before
`"author"`), 30 use single-line minified JSON-LD. The first pass silently skipped all 30 —
caught by making the skip list print rather than stay quiet.

### 2. 63 pages were sharing the generic logo card instead of their own illustration
`og:image` and `twitter:image` were pinned to the sitewide fallback
`waterwisekids-og.png` on 63 pages that **already had a page-specific card image**
declared in their own Article schema. Evidence this is drift, not convention: **473 pages
have `og:image` == the schema image; only 73 didn't**, and 70 of those were the generic
fallback. Repointed both mirrors to the specific card, after confirming each target file
exists on disk.

Practical effect: sharing those 63 pages on Facebook/LinkedIn/X showed a generic logo
instead of the article's illustration.

### 3. `og:site_name` added to 60 pages
697 pages had it, 60 didn't. Filled using the dominant form.

### 4. Stale schema `headline` on the Aqua-Tots page
`education/aqua-tots-nj-vs-local-swim-schools.html` had `<title>`, `<h1>`, `og:title` and
meta description all rewritten to *"Aqua-Tots Pricing and Fees…"* in an earlier CTR pass,
but the JSON-LD `headline` was left behind at the old *"Aqua-Tots in New Jersey vs. Local
Options: A Parent's Comparison"* — so structured data was handing Google a headline that
appears nowhere on the page. Now matches the H1.

---

## Rejected as false positives (not defects — do not re-report)

- **`BreadcrumbList` "nested under WebPage" on 3 hub pages.** `WebPage.breadcrumb` is the
  correct schema.org pattern. My probe flagged it; schema.org says it's right.
- **2 FAQ schema questions "not visible."** Both are the page **H1**, not orphans. The
  parity probe needs H1 in the visible corpus alongside h2/h3/h4, `p>strong`,
  `button.faq-question` and `summary`.
- **3 duplicate `<title>` pairs** (`jobs.html`/`jobs/index.html`, `teens.html`,
  `swim-schools.html`) — the known redirect-stub class, cross-canonical with working
  refresh. Zero real defects.
- **7 "missing" schema images.** They're Pexels hotlinks, not local files; my `exists()`
  check was simply wrong for external URLs.

---

## Left alone deliberately

- **3 pages where `og:image` is a Pexels URL with crop params and the schema image is the
  same photo uncropped** — functionally identical, not worth churn.
- **224 Pexels-hotlinked images** across the site remain a standing fragility: a presence
  check can't detect the day Pexels stops serving them. Unchanged from prior runs.
- **`og:description` differing from meta description** — that's sitewide convention, not
  drift. Not synced.

---

## Verification (run on the post-edit tree, all 757 files)

- Malformed JSON-LD after edits: **0**
- Duplicate `og:site_name` introduced: **0**
- Duplicate `mainEntityOfPage` introduced: **0**
- Any `<meta>` escaped into `<body>`: **0** (the head-breakage tripwire)
- `og:image` pointing at a nonexistent file: **0**
- FAQ nodes intact: **631 FAQPage / 2969 Question / 2969 Answer** — unchanged
- Aqua-Tots `headline` == `h1`: **true**

Diff was audited by line-kind before committing, which caught that the fix script's log
reported 499 `og:image` changes while the actual diff contained **63** — the other 436
were identity replacements on pages where both values were already the generic card.
The log was noisy; the diff was correct.
