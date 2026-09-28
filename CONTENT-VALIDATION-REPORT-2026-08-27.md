# New Content Validation Report — 2026-08-27

**Scope:** files touched on `live` in the last 24 hours
**Audited from:** fresh clone of `live` @ `4c59127` (2026-08-27 08:12 -0400) — not the mount
**Result:** PASS — 0 defects, 0 fixes required, nothing pushed

---

## What changed in the window

16 commits, 732 HTML files touched.

| Category | Count |
|---|---|
| Newly added HTML (`--diff-filter=A`) | 2 |
| Education articles modified | 497 |
| Education articles audited (printables excluded) | 410 |
| Printables skipped by design | 87 |
| Hub page excluded (`education/index.html`) | 1 |

**New pages:**

- `education/swim-lesson-annual-cost-worksheet.html` (landing)
- `education/swim-lesson-annual-cost-worksheet-printable.html` (printable)

The 497 modified articles came from automated passes (AEO batch 46, GSC vocabulary-gap closure, sitemap lastmod correction, USCG Level-label bridging). All 410 were re-validated for template regressions, not just the 2 new files.

---

## Structural template checks — 410/410 PASS

Required present: `main-layout`, `<main class="article">`, `article-header`, `article-meta-item`, `article-body`, `article-excerpt`, styled breadcrumb (`background: #f8fafc`), `main.css`, `article.css`, `GTM-5DN8B3QT`, `tldr-box`, `FAQPage`, `sidebar` — **0 misses**.

Banned absent: `article-layout`, `article-main`, `</article>`, `<main class="main-layout">` — **0 occurrences**.

**One filter false positive, correctly excluded:** `education/index.html` failed 10 checks. It is the education hub listing, not an article, and is not expected to carry article-template classes. No action.

---

## Extended checks — all clean

| Check | Files | Result |
|---|---|---|
| `Article`/`BlogPosting` JSON-LD | 410 | 0 missing |
| `BreadcrumbList` schema | 410 | 0 missing |
| OG tags (title/description/image/url) | 410 | 0 missing |
| `twitter:card` | 410 | 0 missing |
| `rel="canonical"` | 410 | 0 missing |
| `meta name="description"` | 410 | 0 missing |
| `<nav>` / `<footer>` present | 410 | 0 missing |
| Image `alt` attribute (every `<img>`, parsed) | 410 | 0 missing |
| Head integrity — 0 metas/links/titles leaked into `<body>` (html5lib) | 497 | 0 broken |
| FAQ schema question ↔ visible text sync | 410 | 0 orphans |
| Sitemap entry present | 410 | 0 missing |
| Cache-bust token uniformity | sitewide | uniform |

**Cache-bust tokens are perfectly uniform sitewide** — `main.css?v=20260825e` 646/646, `article.css?v=20260826d` 414/414, `printable-checklist.css?v=20260825e` 85/85, `printable-poster.css?v=20260826b` 1/1. The two new pages carry the current tokens; they did **not** miss the bump.

**Sitemap false positive:** the sweep flagged `education/index.html` as absent. It is present as `https://www.waterwisekids.com/education/` (directory form). No action.

---

## New-page deep dive

### `swim-lesson-annual-cost-worksheet.html`

- Title 71 ch · meta description 151 ch (decoded) · og:description 160 ch — both within limit
- Canonical and `og:url` match; no `robots` directive (indexable, correct)
- H1 present and distinct from the title
- 7 FAQ schema questions — **all 7 verified visible in rendered body text** (script/style stripped before extraction)
- 11 H2s
- 52 outbound links — **0 broken**
- **6 inbound linkers**: education hub, `swim-lesson-family-budget-guide`, `swim-school-annual-fees`, `swim-lessons-cost`, `swim-school-hidden-fees`, `multi-child-swim-lesson-cost-worksheet` — not launch-starved
- Live: **HTTP 200**

### `swim-lesson-annual-cost-worksheet-printable.html`

- `noindex` — correct for a printable
- Title 59 ch · meta = og description (153 ch), already identical — left identical per convention
- 37 outbound links — **0 broken**
- Live: **HTTP 200**

**Note on meta vs og:description divergence** on the landing page: this is the established sitewide convention, not a defect. Not synced.

---

## Probe validation

Every sweep was canary-gated before its result was trusted:

- Structural greps: fired correctly against an empty control file
- Image-alt parser: correctly flagged a synthetic `<img src="x">`
- Head-integrity probe: correctly detected a synthetic `<p>` injected into `<head>` pushing a `<meta>` into `<body>` (initial canary was too weak and was rewritten before the result was accepted)
- FAQ sync probe: correctly flagged a fabricated question as not-visible while passing all 7 real ones
- Broken-link resolver: correctly reported a non-existent path as missing
- Sitemap probe: correctly reported a bogus path as absent

Two zero-result sweeps were re-run with corrected canaries rather than accepted at face value.

---

## Actions taken

**None.** No template violations, no schema gaps, no broken links, no stale tokens, no head corruption. Nothing was pushed to `live`.

## Follow-ups

None arising from this run.
