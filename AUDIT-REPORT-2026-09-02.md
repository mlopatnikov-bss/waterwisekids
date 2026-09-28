# Site Audit — 2026-09-02

**Scope:** fresh clone of `origin/live` @ `e56ed35f` · 757 HTML files (734 real pages + 23 redirect stubs)
**Result:** no defects found, nothing committed. Two known items remain open (both need Michael). Two probe capabilities were unavailable — see *Not checked*.

## Health summary

| Check | Volume measured | Result |
|---|---|---|
| Internal links | 29,545 resolvable hrefs (37,808 anchors) | **0 broken** |
| CSS / JS / image asset refs | 4,752 link+script refs, 1,853 `<img>` | **0 missing files** |
| Image alt attributes | 1,853 images | **0 missing** |
| JSON-LD parse | 2,164 blocks | **0 malformed, 0 missing `@type`** |
| JSON-LD hosts | all blocks | **0 non-www / non-https** |
| JSON-LD dates | all blocks | **0 future, 0 malformed ISO** |
| JSON-LD `image` targets | all blocks | **0 pointing at missing files** |
| Canonical tags | 757 pages | **0 missing, 0 duplicated, 0 → 404** |
| Meta descriptions | 757 pages | **0 missing** |
| Metas stranded in `<body>` | 757 pages | **0** (head-breaking quote defect absent) |
| Sitemap → page | 644 URLs | **0 dead entries**, 0 odd host/scheme |
| Page → sitemap | 734 real pages | **0 genuinely absent** (23 absences are canonicalised refresh stubs — correct) |
| Duplicate `<title>` | 13 groups | all 13 are stub↔target pairs — expected |
| Heading structure | 734 pages | 0 missing `<h1>`, 0 multiple `<h1>`, 0 empty headings |
| Content stranded after `<footer>` | 734 pages | **0** |
| Duplicate element IDs | 757 pages | **0** |
| Cache-bust keys | 14 assets, 1,978 refs | **all current**; one key value per asset (no collision); `main.js`→`m-app.css` chain intact |
| Assets referenced without `?v=` | all HTML | **0** |
| Oversized files | full tree | 0 images >300 KB; 1 HTML >200 KB (see below) |
| robots.txt / 404.html | — | valid; 404 is noindexed |

## Open items (unchanged — need Michael, not auto-fixable)

1. **Sitemap `lastmod` contradicts schema `dateModified` — 350 URLs** (was 356). Sitemap carries a uniform `2026-08-29` blanket bump while `dateModified` holds the real last-content-change date (e.g. `benefits-of-swimming-for-kids.html`: lastmod 08-29 vs dateModified 08-14). 311 of the 350 are under `/education/`. Not auto-fixed: blanket-bumping `lastmod` is explicitly the wrong move, and the correct value must come from the last body-text diff.
2. **52 directory state pages still carry no `dateModified`** (`/swim-lessons/directory/*.html`, all in the sitemap). Pipeline item #141 — still open. A wider related class: 186 sitemap URLs lack `dateModified`, but the other 134 are `WebPage`-typed city landing pages (`beginner-swim-lessons-*`, `/swim-lessons/*`) where the property is optional and low-value; recommend scoping any fix to the 52 directory pages only.

## Watch (no action)

- `education/index.html` is 337.9 KB — the largest page on the site by 1.3×. Expected for a 418-guide hub, but it is the one real page-weight outlier. Repo payload total 40 MB.

## Not checked this run — capability gaps

A clean table above covers **static markup only**. These were attempted and failed:

- **Rendered-DOM audit unavailable.** The Playwright browser CDN is now blocked by the sandbox egress proxy — `cdn.playwright.dev` and the Microsoft mirror both return HTTP 400 with body `GatewayExceptionResponse`, for both revision 1134 and 1234. No system Chromium and no apt package either. So nothing render-dependent was measured: CSS regressions, layout and mobile breakpoints, contrast, tap targets, JS-injected content (`m-app.css`), widget behaviour, or the directory search.
- **Live production verification unavailable.** `web_fetch` refused `https://www.waterwisekids.com/` and `/sitemap.xml` as out-of-provenance, so this run could not confirm that production actually serves the committed cache keys, nor check real HTTP status codes (soft-404s returning 200 cannot be detected statically).
- **External link liveness not probed** — the site's WAF makes 403/404 responses carry no information, a known dead end.
