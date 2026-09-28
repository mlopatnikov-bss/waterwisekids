# Content Validation Report — 2026-09-03

**Scope:** HTML files touched on `live` in the last 24h. Audited on a fresh full clone (not the mount).
**Head:** `7b999be67` · **Result: PASS — no fixes required, nothing pushed.**

---

## 1. What actually changed

| | count |
|---|---|
| HTML files touched in 24h | 742 |
| …of which `education/` | 511 |
| **Genuinely new files** (`--diff-filter=A`) | **2** |

The other 509 education files were touched by sitewide sweeps (og/twitter mirror sync `d8f2b1958`, orphan-cluster links `f9f45afc8`, AEO batch 53), not authored. Treating "modified" as "new" would have inflated this run ~250×.

## 2. Structural template checks (17 greps: 13 required + 4 banned)

Run against all 511 education files.

- **417 / 417 standard articles: PASS all 17.** Zero banned patterns (`article-layout`, `article-main`, `</article>`, `<main class="main-layout">`) anywhere.
- 94 "failures" = **93 printables + `education/index.html`** — different template families, not defects (§3).

## 3. The 94 "failures" are separate template families — verified, not assumed

**Printables (93).** Self-contained print pages: inline `<style>`, `noindex`, self-canonical, GTM present. They legitimately have no `main.css` / `article.css` / `sidebar` / `article-body`. Failure profile is **uniform across all 93** (3 sub-variants, all explained):

| variant | n | why |
|---|---|---|
| checklist template | 92 | `printable-checklist.css?v=20260902a` — cache-bust key identical on all 92 |
| poster template | 1 | `pool-safety-rules-printable.html` → `printable-poster.css` |
| carry a breadcrumb block | 9 | newer generation; cosmetic |

**`education/index.html`.** Hub page (`hub-intro`, `category-filters`, BreadcrumbList + FAQPage). Correct for its type.

## 4. The 2 new files — deep validation

`education/swim-lesson-medical-information-form.html` (landing) and `…-printable.html`.

| check | landing | printable |
|---|---|---|
| Article/FAQPage/BreadcrumbList/Organization JSON-LD | ✅ 3 blocks, all parse | ✅ 2 blocks, all parse |
| single `<h1>` | ✅ | ✅ |
| og ↔ twitter title/description **equal** | ✅ | ✅ |
| meta description length | 151 | 145 |
| images with `alt` | 2/2 | 2/2 |
| nav / footer / breadcrumb | ✅ | ✅ |
| metas outside `<head>` (must be 0) | 0 | 0 |
| non-www host in JSON-LD / `http://` links | 0 / 0 | 0 / 0 |
| sitemap ↔ indexability consistent | in sitemap, indexable ✅ | absent + `noindex` ✅ |

**Contextual inbound links to the landing page: 6** (`swimming-with-adhd-kids`, `swimming-type-1-diabetes-kids`, `swimming-with-ear-tubes`, `swimming-asthma-kids`, `epilepsy-swimming-safety`, `swimming-with-a-cast-kids`, plus the hub) — well above the sitewide floor of 2. Correctly wired into the medical-condition cluster.

---

## 5. Flagged for Michael — do NOT "fix" by convention

3 of 93 printables are **indexable and in the sitemap**; the other 90 are `noindex` and excluded. Conforming them to the 90-page convention looked obvious. GSC (28d, page dimension) says it would have been a mistake:

| URL | position | impr | clicks |
|---|---|---|---|
| `pool-safety-rules-printable.html` | **9.6** | 39 | 0 |
| `pool-safety-rules.html` *(its landing page)* | **47.0** | 261 | 0 |
| `swim-lesson-readiness-printable.html` | 48.4 | 36 | 0 |
| `swim-lesson-readiness-checklist.html` | 19.0 | 2 | 0 |
| `summer-safety-checklist-printable.html` | — | 0 | 0 |

The **printable outranks its own landing page by 37 positions** on the pool-safety-rules pair. Deindexing it surrenders a page-1 slot to gain nothing. **No action taken.**

The real question is the zero-click column: 39 impressions at position 9.6 with 0 clicks is a snippet problem, not a ranking problem — and a printable's title/meta is a live CTR lever. Worth a dedicated pass; out of scope for a template validator.

## 6. Two false positives caught before they became edits

**a) "58 of 93 printables are missing `@media print`."** False. The print rules live in the shared `printable-checklist.css` / `printable-poster.css`, which every printable links. Grepping the HTML alone reports a 62% failure rate on a healthy family.

**b) "Header gutter diverges 4px/8px on mobile."** False, and it nearly became a CSS commit. Reading `main.css` only:

| viewport | `.container` (668 files) | `header > nav` (74 files) |
|---|---|---|
| desktop | 24px | 24px |
| ≤768px | 16px (`--spacing-lg`) | 20px |
| ≤480px | 12px (`--spacing-md`) | 20px |

The resolution is in **`m-app.css`**, which `main.js:525` injects at runtime on every page: `.container { padding: 0 20px !important }` and `header .container { padding: 0 20px !important }` at ≤768px. Effective mobile gutter is **20px for both header variants** — they match, and the explanatory comment at `main.css:1596` was accurate. A stylesheet that is never in the HTML cannot be found by grepping the HTML.

---

## 7. Cleanup

Workspace caches and `/tmp` scratch cleared per the standing requirement.
