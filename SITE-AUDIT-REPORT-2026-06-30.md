# Site Audit Report — 2026-06-30

Automated daily site audit of waterwisekids.com (live branch).

## Health Summary

| Check | Result | Status |
|-------|--------|--------|
| HTML files scanned | 622 | — |
| Broken internal links | 0 | ✅ PASS |
| Missing local assets (CSS/JS/img) | 0 | ✅ PASS |
| Images missing `alt` attribute | 0 | ✅ PASS |
| Broken / empty JSON-LD schema | 0 | ✅ PASS |
| Sitemap entries | 571 (= 571 indexable pages) | ✅ PASS |
| Sitemap dead `<loc>` entries | 0 | ✅ PASS |
| noindex pages wrongly in sitemap | 0 | ✅ PASS |
| Homepage (root URL) in sitemap | Present | ✅ PASS |
| Sitemap lastmod freshness | 2026-06-30 | ✅ PASS |
| robots.txt + sitemap reference | Valid | ✅ PASS |
| Oversized images (>500KB) | 0 | ✅ PASS |
| Broken external links (verified) | 4 → **FIXED** | ✅ FIXED |

## External Links Checked
135 unique off-site URLs HEAD-checked. 36 returned 403/000 — verified as **bot-blockers / transient** (CPSC, NDPA, USLA, USCG, britishswimschool, AAP publications, BLS, ScienceDirect), not real outages.

## Fixes Applied (committed to live)
1. **CDC drowning** — `cdc.gov/drowning/index.html` (404) → `cdc.gov/drowning/about/index.html` (4 pages)
2. **AAP / HealthyChildren** — `.../safety-prevention/at-home/Pages/Water-Safety-And-Young-Children.aspx` (404) → `.../at-play/...` (stale variant on ~9 pages)
3. **Red Cross Open Water** — `.../water-safety/open-water-safety.html` (404) → `.../water-safety.html` (1 page)
4. **Red Cross Learn-to-Swim** — `.../swimming/swim-lessons/learn-to-swim` (410 Gone) → `.../take-a-class/swimming` (1 page)

Total: 15 files changed, 18 insertions / 18 deletions (pure URL swaps, no content change).

## Notes / Watch
- `education/index.html` is 312KB — expected (300+ article cards); not an issue.
- `uscgboating.org` returned `000` (connection failed) from the audit sandbox — inconclusive (likely transient/network-side), left unchanged pending re-verification.
