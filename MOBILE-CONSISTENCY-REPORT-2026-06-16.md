# Mobile Consistency Report — 2026-06-16

Daily automated mobile check across waterwisekids.com (`live` branch).

## Scope
- 541 HTML files scanned (incl. subdirectories)
- Static analysis of markup + assets/css/main.css, main.js

## Results — ALL PASS

| Check | Result |
|-------|--------|
| Viewport meta tag | 541/541 present; 0 pages block zoom (no user-scalable=no / maximum-scale) |
| Hamburger / mobile nav | Present on every real page; the 13 without it are redirect stubs (correct) |
| Hamburger tap target | .hamburger = min-height:44px; min-width:44px, shows at <=768px |
| Mobile nav toggle JS | main.js toggles nav.mobile-open; closes on link-click + outside-click |
| Mobile nav link targets | Full-width display:block rows w/ --spacing-lg padding |
| CTA buttons | .btn padding 12px 22px; width:100% on mobile — large tap target |
| Horizontal overflow | body/html overflow-x:hidden; 0 true fixed-width inline styles (all were max-width) |
| Responsive images | img { max-width:100% } global rule in main.css |
| Tables | 4/5 wrapped in overflow-x:auto scroll containers; printable worksheet uses width:100% |
| Text readability | No font-size below 12px anywhere in CSS |
| Breakpoints | @media at 1024 / 768 / 480 / 900 / 600 — full responsive coverage |

## Issues found / fixed
None. No changes required this run.

## Notes
- .nav-toggle legacy CSS rule coexists with .hamburger (actual element). Harmless.
- Printable comparison-worksheet table (cw-table) is width:100% with a mobile @media font-size step-down — will not overflow.
