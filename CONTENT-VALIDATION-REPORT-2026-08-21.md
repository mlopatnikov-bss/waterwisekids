# New Content Validation Report — 2026-08-21

**Scope:** files changed on `live` in the last 24 hours.
**Method:** fresh clone of `live` (not the workspace mount) + headless Chromium render at 320/768/1280px + print-media PDF assertion.
**Deployed:** commit `bc8dbeb` → `live`, verified 200 on all 5 affected URLs.

---

## 1. What changed in the last 24 hours

| Type | Count |
|---|---|
| Genuinely **new** pages | 2 |
| Education articles **modified** (sitewide sweeps) | 485 |
| All HTML touched | 722 |

New pages:

- `education/multi-child-swim-lesson-cost-worksheet.html` (article/landing)
- `education/multi-child-swim-lesson-cost-worksheet-printable.html` (printable)

The 485 modified articles came from three bulk commits — an og:image dimension sweep (510 pages), an AEO pass on 3 directory pages, and the swim-instructor-ratio de-cannibalization. These were swept for regressions, not treated as new content.

---

## 2. Structural template compliance — PASS

All 17 required/banned checks run against **405 education articles** (80 printables correctly excluded — they use a different template and standalone stylesheet).

**404 pass. 0 real failures.**

One reported failure is a known false positive:

- `education/index.html` — hub listing page, not an article. Correctly has no `article-body`, `tldr-box`, or `sidebar`. **Do not "fix."**

Both new pages pass every check, including `main-layout`, `<main class="article">`, `article-meta-item`, `tldr-box`, FAQPage schema, sidebar, GTM, and both stylesheets. No banned patterns present.

---

## 3. Regression sweep across all 722 changed pages — PASS

- **JSON-LD validity:** 0 parse failures.
- **Duplicate meta tags:** 0. The og:image dimension sweep did not double-insert on any of the 510 pages.
- **Dimensions match reality:** declared `1200×630` matches the actual `waterwisekids-og.png`.
- **Orphaned dimension tags:** 0 pages carry `og:image:width` without an `og:image`.

---

## 4. New-page deep checks — PASS

| Check | Article | Printable |
|---|---|---|
| Canonical | self ✓ | self ✓ |
| robots | index ✓ | `noindex` ✓ |
| Sitemap entry | present ✓ | correctly absent ✓ |
| Nav / footer | ✓ | ✓ |
| Image alt text | 2/2 ✓ | 2/2 ✓ |
| Broken internal links | 0 | 0 |
| Schema image resolves on disk | ✓ | ✓ |
| Schema types | Article, BreadcrumbList, FAQPage | Article, BreadcrumbList |

**FAQ schema fidelity:** all 6 Q&A pairs verified — every question appears in visible page text and every answer's content words are ≥85% present on the page. No paraphrase drift.

**Print output:** printable renders to **3 pages** with no screen chrome leaking into print. Nav, print toolbar, and footer are all correctly suppressed by `@media print`.

**Render:** no horizontal overflow at 320/768/1280px on either page. No sub-24px block-level tap targets.

---

## 5. Defects found and fixed

### 5.1 Link starvation on the new lead magnet — FIXED

The new worksheet launched with only **one** real inbound link (the auto-generated education index listing). Notably, `education/sibling-discount-swim-lessons.html` — the single most topically aligned page on the site — did not link to it at all, nor did either dedicated cost page.

Added contextual **prose** links (not related-cards, which inflate anchor counts without passing meaningful context) from:

- `education/sibling-discount-swim-lessons.html`
- `education/swim-lessons-cost.html`
- `education/swim-lesson-family-budget-guide.html`

Inbound links: **2 → 5**.

### 5.2 Sibling-discount percentage stated three different ways — FIXED

The site asserted three conflicting ranges for the same fact, including a page that **contradicted its own meta description**:

| Page | Claimed | Status |
|---|---|---|
| `sibling-discount-swim-lessons.html` — body (×3) | 10%–20% | canonical, kept |
| `sibling-discount-swim-lessons.html` — meta description | 5–20% | **fixed → 10–20%** |
| `swim-lessons-cost.html` | 10–20% | already consistent |
| `swim-lesson-family-budget-guide.html` (prose + FAQ schema ×2) | 5–15% | **fixed → 10–20%** |
| `swim-lesson-scholarships-free-programs.html` (prose + FAQ schema) | 5–15% | **fixed → 10–20%** |

The pillar page's body figure was treated as canonical (stated three times, with supporting worked examples). Prose and FAQ schema were changed **together** on every page so schema answers still match visible text — re-verified after edit.

Residual conflicting claims sitewide: **0**.

### 5.3 Sitemap

`lastmod` bumped to `2026-08-21` for exactly the 4 edited pages. No blanket bump.

---

## 6. Investigated and dismissed — do not "fix"

**Mobile bottom-nav labels render at 10px** (below the 11px floor) on every page at ≤768px. This is **intentional**, not a defect — `m-app.css` carries an explicit documented exception: `/* Compact strips: 10px floor (11px reflows the row) */`. Raising it would break the 5-item nav row. Sitewide condition, not introduced by today's content.

**Harness note:** an initial render pass loaded pages over `file://`, where root-absolute `/assets/css/...` paths silently fail to resolve. That produced a convincing false positive — a 4-page PDF with the full site nav on page 1 and the footer occupying page 4, exactly matching the known "printables leak screen sections into print" defect class. Re-running over a local HTTP server showed the real output is a clean 3 pages. **Any future render audit must serve over HTTP; `file://` renders unstyled and every layout assertion made against it is invalid.**

---

## 7. Post-fix verification

Re-ran after edits: JSON-LD valid on all 4 edited pages, 0 nested anchors, 0 broken links, 0 invisible links (link color vs. resolved ancestor background), FAQ answers still match visible text, structural checks still pass, no overflow at 320px or 1280px.

Live confirmed via `curl -L`: all 5 URLs return 200, the three new prose links are present in served HTML, and 0 pages still serve the stale "5 to 15 percent" claim.
