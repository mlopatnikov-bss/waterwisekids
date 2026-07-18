# Mobile Consistency Report — 2026-07-18

**Scope:** All 657 HTML pages on the `live` branch (fresh clone).
**Result:** PASS — no mobile issues found, no fixes required.

## Checks performed

| Check | Result |
|---|---|
| Responsive viewport meta present | 657/657 pages ✓ |
| Zoom NOT disabled (no `user-scalable=no` / `maximum-scale=1`) | 0 offenders ✓ |
| Global `img { max-width: 100%; height: auto }` (images scale) | Present in assets/css/main.css (line 189) ✓ |
| Hamburger menu present on pages with `.nav-links` | All content pages ✓ |
| Hamburger JS wiring (`mobile-open` toggle + outside-click close) | assets/js/main.js verified (lines 23–50) ✓ |
| Mobile nav dropdown CSS (@media max-width:768px) | Present, correct (main.css line 1529+) ✓ |
| Touch targets ≥ 44px (hamburger toggle) | `.hamburger { min-height:44px; min-width:44px }` (line 640) ✓ |
| Horizontal overflow: fixed pixel widths ≥480px in styles | 0 offenders ✓ |
| `<img width="…">` overflow risk | 365 matches, all governed by global `img{max-width:100%}` → scale, no overflow ✓ |
| iframes | 657 = GTM `ns.html` noscript beacon only (hidden 0×0), no overflow ✓ |
| Fixed-width tables | 0 ✓ |
| New pages since last run (31 beginner-swim-lessons landing pages) | Viewport + cache-busted CSS (`?v=20260718b`) + hamburger verified ✓ |

## Notes
- 4 pages flagged by the hamburger heuristic (beginner-swim-lessons: jersey-shore, jersey-shore-beaches, northwest-philadelphia, philadelphia) are **noindex meta-refresh redirect stubs** (`<meta http-equiv="refresh" content="0;url=/swim-lessons/">`). They bounce instantly to /swim-lessons/ and render no nav by design — not a mobile defect.
- Site count grew 653 → 657 since 2026-07-16; the new indexable beginner landing pages all carry correct mobile scaffolding.

**No changes pushed to page content** — nothing to fix. Report committed for the record.
