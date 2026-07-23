# Mobile Consistency Report — 2026-07-23

**Scope:** All 670 HTML pages on the `live` branch (fresh clone).
**Result:** PASS — no mobile issues found, no fixes required.

## Checks performed

| Check | Result |
|---|---|
| Responsive viewport meta present | 670/670 pages ✓ |
| Zoom NOT disabled (no `user-scalable=no` / `maximum-scale=1`) | 0 offenders ✓ |
| Global `img { max-width: 100%; height: auto }` | assets/css/main.css line 191 ✓ |
| Hamburger present on every page with `.nav-links` (excl. redirect stubs) | 0 offenders ✓ |
| Hamburger JS wiring (`mobile-open` toggle + outside-click close) | assets/js/main.js lines 23–50 ✓ |
| JS/CSS class match (`nav.mobile-open .nav-links`) | main.css line 1542 ✓ |
| Mobile nav media queries (@media max-width:768px / 480px) | Present, correct (main.css 965, 1486, 1569) ✓ |
| Touch target >= 44px (`.hamburger { min-height:44px; min-width:44px }`) | main.css lines 640-641 ✓ |
| Horizontal overflow: genuine fixed `width:` >=500px (excl. max-/min-width) | 0 offenders ✓ |
| Large `1100px` etc. values | all `max-width` (433 instances, responsive), not fixed `width` ✓ |
| Fixed `min-width` >=400px on elements | 0 (only `@media (min-width:768px)` breakpoints) ✓ |
| `<img width="600">` explicit dims | paired with `height` + governed by global img rule -> good CLS, scales down ✓ |
| Tables wrapped or `width:100%` (no mobile overflow) | printable worksheets use `.pl-table{width:100%}` with % columns ✓ |

## Notes
- Site grew 660 -> 670 HTML files since 2026-07-19. New pages carry correct mobile scaffolding (viewport, hamburger, cache-busted CSS).
- 13 root-level pages flagged as "missing hamburger" are all noindex `<meta http-equiv="refresh">` redirect stubs (about.html, articles.html, how-to-*.html, beginner-swim-lessons-*.html) - no nav needed by design; not content pages.
- Printable worksheets (practice-log, comparison, goal-setting, life-jacket sizing) use `table{width:100%}` with percentage column widths; multi-column tables shrink to fit, no page-level horizontal overflow.
- No bare fixed-width elements >=500px anywhere in inline styles; every large px value resolves to `max-width` (safe).

**No changes pushed to page content** - nothing to fix. Report committed for the record.
