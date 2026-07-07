# Mobile Consistency Report — 2026-07-07

**Scope:** 635 HTML pages on `live` branch. Automated audit of responsive meta, hamburger nav, touch targets, horizontal overflow, image scaling, and table responsiveness.

## Result: PASS — no changes required

| Check | Result |
|---|---|
| Viewport meta present | 635 / 635 ✅ |
| `user-scalable=no` / `maximum-scale` (a11y blocker) | 0 pages ✅ |
| Bare fixed `width:NNNpx` overflow risks | 0 (all 1000+ large widths are `max-width`) ✅ |
| Global `overflow-x: hidden` guard | present (main.css:117) ✅ |
| Hamburger CSS (hidden desktop / shown ≤768px) + JS toggle | wired (main.css + main.js) ✅ |
| Tables responsive (`width:100%` / scroll wrapper) | all ✅ |
| Newest 8 education articles — viewport + hamburger + cache-busted CSS | consistent ✅ |

## Notes
- 13 pages with no hamburger are all **redirect stubs** (meta-refresh / JS redirect to canonical dir URLs) — correct, no nav needed.
- Structural observation (NOT a mobile defect, left unchanged): `swimmers-hub/backstroke-complete-guide.html` nests `<aside class="sidebar">` inside `.article-header` rather than as a grid rail. On mobile this is harmless — `.sidebar` reverts to `position: static` (article.css:420) and stacks cleanly. On desktop the TOC/CTA render full-width at the top of the article instead of as a right rail. Flagging for Michael in case the desktop layout is unintended; not touched to avoid risk.

Workspace self-cleaned per task spec.
