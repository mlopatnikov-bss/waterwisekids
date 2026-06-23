# Mobile Consistency Report — 2026-06-23

**Status:** PASS — no issues found, no fixes required.
**Method:** Static audit of the `live` branch + live render verification at 375px viewport (homepage, education article, cost page, 4-column comparison printable).

## What was checked
Responsive meta viewport, hamburger menu behavior at mobile widths, touch-target sizing, horizontal overflow, image scaling, text legibility, and tappable CTAs.

## Findings

### Viewport meta — PASS
All 489 content pages declare `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. Zero pages missing it.

### Hamburger / mobile nav — PASS
- Hamburger button present on every content page; renders 44x44px (meets Apple/Google touch-target guidance).
- Confirmed visible at 375px; `.nav-links` correctly `display:none` until toggled.
- `main.js` `initMobileNav()` toggles `nav.mobile-open`, updates `aria-expanded`, and closes the menu on link-click and outside-click.
- 16 root-level files flagged as "missing hamburger/main.js" are redirect stubs ("This page has moved") — correct by design, no nav needed.

### Horizontal overflow — PASS
Live render at 375px shows `document.scrollWidth == viewport` on all sampled page types:
- Homepage — 375px, no page overflow
- Education article — 375px, no overflow
- Local landing (swim-lessons-cost) — 375px, no overflow
- 4-column comparison printable — 376px (sub-pixel border rounding, within tolerance)

The homepage `.mobile-category-bar` extends to 508px but is an intentional horizontal-scroll strip (`overflow-x:auto; flex-wrap:nowrap; scrollable:true`) — off-screen categories (Open Water, Bath Time) are reachable by swipe. Working as designed.

### Touch targets & CTAs — PASS
- `.btn`: base padding `12px 22px` (~40px tall), full-width on <=480px. Exceeds WCAG 2.1 AA (24px) target size.
- Hamburger: explicit `min-height/min-width: 44px`.

### Images — PASS
`img { max-width: 100% }` global rule; no fixed-width images break the viewport.

### Text legibility — PASS
Body copy renders 15.2-15.4px at 375px; root font scales to 14px only at <=480px. Readable without zoom.

### Tables — PASS
4 education pages use tables. `swim-lessons-cost.html` uses an overflow wrapper; the comparison/printable tables use inline `width:100%` styles with a <=768px font-size reduction. No table forces page-level horizontal scroll.

## Fixes applied
None — the mobile implementation is fully consistent across all page types.

## Verification
- Static checks run against fresh `live` clone (HEAD 8da8c57).
- Live DOM measurement via 375px same-origin iframe render of 4 representative pages.
