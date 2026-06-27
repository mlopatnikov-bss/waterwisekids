# Functionality Validation Report — 2026-06-27

Automated daily validator. Scope: internal links, forms, CTAs, JS, review system, search/filter.
Validated against a fresh clone of the `live` branch (commit 3abe46c).

## Summary: PASS (1 external backend issue, no repo code defects)

| Check | Result |
|---|---|
| Internal page links (610 HTML files) | PASS — 0 broken; 51 `${school.website}` hits are JS template literals (false positives) |
| Asset references (CSS/JS/img) | PASS — 0 missing |
| Forms (135 `<form>` tags) | PASS — all wired: 80 Formspree, 52 review-localStorage handler, 3 jobs (JS) |
| JS syntax (`node --check`) | PASS — main.js, mobile-app.js, m-app.js, schools-data.js, site-nav.js |
| Review system | PASS — `submitReview()` intact; localStorage key `swimSchoolReviews` consistent across 52 pages |
| Search/filter wiring | PASS — directory + jobs filters have live event handlers |
| Orphan content after `</html>` | PASS — 0 files |
| sitemap.xml | PASS — valid XML, 562 URLs |
| CTA destinations | PASS — all resolve to existing pages |

## Open issue (NOT a repo fix — requires Michael)

**Aquatic Jobs API returns HTTP 403 (Access Denied).**
Endpoint: `script.google.com/macros/s/AKfycbx.../exec`
- This is the Google Apps Script web-app deployment access setting, not a code defect. The deployment must be set to Execute as: Me / Who has access: Anyone.
- Impact: the jobs board cannot load or accept new postings until the access setting is corrected.
- Site does NOT break — loadJobs()/post handlers catch the failure and show "Unable to load jobs. Please try refreshing." Graceful degradation confirmed.
- Continuation of the previously logged jobs-API outage (was 503 on 2026-06-12, now 403).

## Actions taken
- No code changes required — all in-repo functionality passed.
- Reported jobs-API status for Michael to resolve in Apps Script.
