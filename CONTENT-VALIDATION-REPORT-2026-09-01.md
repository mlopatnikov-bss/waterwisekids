# Content Validation Report — 2026-09-01

**Scope:** HTML changed on `live` in the last 24 hours.
**Method:** fresh `--depth 60` clone of `live` (audited the clone, not the mount).
**HEAD:** `240aab1` 2026-09-01 08:08 — *[publish] Aqua-Tots page: widen scope from NJ-only to national pricing intent*

**Result: PASS — 0 defects. Nothing fixed, nothing pushed.**

---

## What changed

13 commits in the window; **738 HTML files** touched (507 under `/education/`). Most of the volume is sitewide passes (cache-bust re-bump, aria-labels on 54 pages, review text on 51 directory pages, mobile heading hierarchy on 22 templates), not new content.

**New pages created (2):**

| File | Type |
|---|---|
| `education/swim-school-credential-claims-decoder.html` | Lead-magnet landing (article template) |
| `education/swim-school-credential-claims-decoder-printable.html` | Printable checklist (printable template) |

---

## Structural template checks

Ran the full required/banned class battery over all 507 changed education pages.

- **415 PASS** — every required class present, zero banned patterns (`article-layout`, `article-main`, `</article>`, `<main class="main-layout">`) anywhere.
- **92 FAIL** — all four failure signatures were "everything missing", i.e. **not the article template at all**. Classified rather than assumed:
  - **91 printables** — verified by asset fingerprint, not filename: 90 load `printable-checklist.css`, 1 (`pool-safety-rules-printable.html`) loads `printable-poster.css`. A second legitimate printable variant, not a defect.
  - **1** — `education/index.html`, the education hub listing page (2,511 card refs), not an article.

The exclusion filter fired and surfaced its own outlier (the poster variant), so it is measuring something real.

**The new landing page passes all 13 required checks and trips zero banned patterns.**

---

## Secondary checks (all 738 changed files unless noted)

| Check | Result |
|---|---|
| Header chrome variants | **7** — matches the known tripwire, no drift |
| Footer chrome variants | **2** — matches the known tripwire |
| Body-level `<meta>` (broken `<head>`) | 0 |
| GTM-5DN8B3QT present | 738 / 738 |
| Canonical present + `https://www.` host | 738 / 738 |
| Soft-404 titles returning as live pages | 0 |
| `<img>` missing `alt` | 0 pages |
| Cache-bust token uniformity | `main.js?v=20260831c` on all 738; every CSS asset has exactly one token — no split-version drift |

⚠️ **Probe note:** a raw grep for `<link rel="canonical"` reported 123 pages missing it. False positive — 123 local pages serialize the attribute as `<link href="…" rel="canonical"/>` (bs4 reserialize artifact from a prior pass). Re-run with a parser: **0 truly missing**. Recorded so the next run doesn't re-report it.

---

## New-page deep checks

Both new pages:

- Article + BreadcrumbList + ImageObject + Organization ×2 + SpeakableSpecification JSON-LD, all parsing clean; landing page adds FAQPage (6 Q&A).
- Breadcrumb schema chain Home › Education › page, matching the visible styled bar on the landing page.
- 9 OG + 4 Twitter tags; `og:image` and all schema image URLs resolve to files that exist on disk.
- 2 images each, both with `alt`; 0 empty alts.
- `datePublished`/`dateModified` = 2026-08-31, agreeing with sitemap `lastmod`.
- Carry the current cache-bust tokens (published *after* the 16:19 a→c bump and did not miss it).

**FAQ schema ↔ visible parity:** ran across the new landing page and both AEO-touched pages (`weighted-practice-flip-turns-skills`, `swim-readiness-indicators-age-4`), matching all three visible shapes with emoji/ordinal/`Q:` normalization. **6/5/5 schema questions, 0 orphans on all three.** The AEO pass did not append orphan questions this time.

**Link starvation:** the new landing page has **5 inbound prose links** from `.article-body` (`swim-instructor-training-hours-compared`, `swim-instructor-certifications-decoded`, `swim-curriculum-credentials-decoded`, `asca-certification-explained`, `proprietary-vs-red-cross-wsi-curriculum`). It did not launch link-starved. The printable is linked from its own landing page, as intended.

---

## One inconsistency flagged, not fixed

**88 of 91 printables are absent from `sitemap.xml` — but 3 are in it:**

- `pool-safety-rules-printable.html`
- `summer-safety-checklist-printable.html`
- `swim-lesson-readiness-printable.html`

Exclusion is clearly the standing convention (96.7% of printables), and the new printable correctly follows it, so this is **not** a defect in today's content. The 3 look like legacy entries predating the convention.

**Deliberately not auto-fixed**, because both directions carry real cost and neither is a template question:

- Adding 88 thin printables to the sitemap would dilute a crawl budget that is already the bottleneck — Google has only seen 97 of 640 URLs, and the sitemap has not been re-downloaded since April.
- Removing 3 already-indexed URLs from the sitemap is a deliberate deindexing decision.

Michael's call.

---

## What was NOT checked

This run covered template structure, chrome, head integrity, schema validity/parity, links, and sitemap presence. It did **not** cover: rendered CSS regression (separate render sweep), external link health, meta-description pixel widths (the 06:09 SEO pass just handled these on 11 pages), `dateModified` drift against body-text diffs across the full corpus, or GSC-side performance.
