# Mobile Consistency Report — 2026-06-19

Automated daily mobile check across waterwisekids.com (live branch). **Result: PASS — no issues, no fixes required.**

## Scope
- 577 HTML files scanned (564 real pages + redirect stubs)
- Checks: viewport meta, hamburger nav, touch targets, horizontal overflow, image scaling, table responsiveness, mobile menu wiring

## Findings

**Viewport meta** — 577/577 pages carry the standard `width=device-width, initial-scale=1.0`. No missing or non-standard viewport tags.

**Hamburger / mobile nav** — 564/564 real pages include `<button class="hamburger">` with `aria-expanded`. Pages without a toggle are all redirect stubs ("This page has moved"), which correctly need no nav. `main.js` wires the toggle: click → `nav.mobile-open` class, updates `aria-expanded`, closes on link-click and outside-click. Every real page loads the versioned `main.js`.

**Touch targets** — `.hamburger` is `min-height:44px / min-width:44px` in both `main.css` and the standalone `printable-checklist.css`. Mobile nav links expand to full-width 44px blocks. Meets the 44px tap-target guideline.

**Image scaling** — Global `img { max-width:100%; height:auto }` in `main.css` covers all 315 images that carry fixed `width`/`height` attributes; they scale down responsively.

**Horizontal overflow** — `body { overflow-x:hidden }` guard present. No `100vw` usage, no CSS rules with `min-width > 480px` outside media queries. Inline fixed widths are all `max-width:` containers (1100/1200px centered, mobile-safe). Bare widths flagged are percentage-width fill-in lines on printable checklists with small `min-width` floors (<=120px) — fit within a 320px viewport.

**Tables** — 5 tables total. 4 (salary, comparison, pricing) wrapped in `overflow-x:auto; -webkit-overflow-scrolling:touch`. The 5th (`cw-table`, swim-school comparison worksheet) is `width:100%` with no min-width and font shrinks to 0.68rem at <=768px, so it fits-to-screen rather than overflowing.

**Media queries** — Comprehensive breakpoints in `main.css`: 1024, 900, 768, 600, 480, plus print.

## Action taken
None required. Site is mobile-consistent. No code pushed beyond this report.
