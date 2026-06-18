# Mobile Consistency Report — 2026-06-18

Daily automated mobile check across waterwisekids.com (`live` branch).

## Scope
- 565 HTML files scanned (incl. subdirectories), parsed with BeautifulSoup (not regex)
- Static analysis of markup + assets/css/main.css, assets/js/main.js

## Results — ALL PASS

| Check | Result |
|-------|--------|
| Viewport meta tag | 0 real pages missing it; 0 pages block zoom (no user-scalable=no / maximum-scale=1) |
| Hamburger / mobile nav | Present on every real page; redirect stubs without it are correct |
| Hamburger tap target | `.hamburger` min-height:44px + min-width:44px, shown at <=768px |
| Mobile nav toggle JS | main.js toggles `nav.mobile-open`; closes on link-click + outside-click |
| Horizontal overflow | body `overflow-x:hidden`; 0 fixed-width inline styles >480px (all width values are max-width) |
| Responsive images | global `img { max-width:100% }` rule in main.css (line 187) |
| Tables | wrapped in `overflow-x:auto` scroll containers |
| Text readability | No body/content font below 12px |
| Breakpoints | @media at 1024 / 900 / 768 / 600 / 480 — full responsive coverage |

## Issues found / fixed
None. No changes required this run.

## Notes (non-issues, verified false positives)
- `how-to-choose-swim-lessons-for-kids.html` flagged as missing nav — it is a JS-redirect stub
  (`noindex`, canonical -> education/when-to-start-swim-lessons.html). Correctly has no nav. Not a defect.
- 27 inline `font-size:11px` instances on jobs.html, swim-schools.html, advertise.html are small
  bold uppercase status badges (e.g. "VERIFIED" pills, padding 4px 10px). Readable without zoom;
  intentional badge styling, not body text. Left unchanged.
