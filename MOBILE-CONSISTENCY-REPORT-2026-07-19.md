# Mobile Consistency Report — 2026-07-19

**Scope:** All 660 HTML pages on the `live` branch (fresh clone).
**Result:** PASS — no mobile issues found, no fixes required.

## Checks performed

| Check | Result |
|---|---|
| Responsive viewport meta present | 660/660 pages ✓ |
| Zoom NOT disabled (no `user-scalable=no` / `maximum-scale=1`) | 0 offenders ✓ |
| Global `img { max-width: 100%; height: auto }` | assets/css/main.css line 191 ✓ |
| Hamburger present on every page with `.nav-links` (excl. redirect stubs) | 0 offenders ✓ |
| Hamburger JS wiring (`mobile-open` toggle + outside-click close) | assets/js/main.js lines 23–50 ✓ |
| Mobile nav media queries (@media max-width:768px / 480px) | Present, correct (main.css 965, 1486, 1569) ✓ |
| Touch target ≥ 44px (`.hamburger { min-height:44px; min-width:44px }`) | main.css lines 640–641 ✓ |
| Horizontal overflow: genuine fixed `width:` ≥480px (excl. max-/min-width) | 0 offenders ✓ |
| Large `1100px` etc. values | all `max-width` (responsive), not fixed `width` ✓ |
| Inline `<svg width="…">` large fixed, no max-width | 0 offenders ✓ |
| Tables wrapped or `width:100%` (no mobile overflow) | 8 table pages; 4 overflow-wrapped, 4 printables use `table{width:100%}` ✓ |
| Tiny body text | only 11px badges/pills (e.g. "POPULAR" chip) — decorative, readable ✓ |
| New beginner-swim-lessons landing pages | viewport + cache-busted CSS (`?v=20260718b`) + hamburger verified ✓ |
| Real content pages linking bare (non-cache-busted) main.css | 0 ✓ |

## Notes
- Site grew 657 → 660 HTML files since 2026-07-18. New indexable beginner landing pages (e.g. abington-pa) carry correct mobile scaffolding.
- 62 pages lack `main.css?v=`: 12 are noindex meta-refresh redirect stubs, ~35 are printables with their own cache-busted `printable-checklist.css`, remainder are JS-redirect stubs — none are real content pages missing responsive CSS.
- Printable worksheets (comparison, practice-log, goal-setting, life-jacket) use `table{width:100%}`; multi-column tables shrink to fit, no page-level horizontal overflow. life-jacket carries its own `@media (max-width:560px)` breakpoint.

**No changes pushed to page content** — nothing to fix. Report committed for the record.
