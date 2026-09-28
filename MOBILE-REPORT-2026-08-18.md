# Mobile Consistency Report — 2026-08-18

**Scope:** all 727 HTML pages, headless Chromium render at 320 / 375 / 768px (mobile UA, touch, DPR 2).
**Result:** 4 real defects found and fixed, 2 content gaps fixed, shipped to `live` as `0ea039d`. Pages build `built`, verified live.

---

## The important finding: a horizontal-overflow blind spot

Three education article pages laid out **369–414px wide inside a 320px viewport**, and the standard overflow check could not see it.

`.main-layout` is a CSS grid. Grid items default to `min-width: auto`, which means an item refuses to shrink below its content's min-content width. Any single child with a wide min-content width — a data table, a bare URL, a `·`-joined string — widens the whole grid track. The mobile layout viewport then **stretches to match**, so `document.documentElement.scrollWidth === window.innerWidth` and the page reports zero overflow.

The defect is only visible when `scrollWidth` is compared against the **nominal device width**, not against `window.innerWidth`. My first pass used `innerWidth` and reported 0 overflow at 320px and 375px. It was wrong.

| Page | Culprit | min-content |
|---|---|---|
| `education/drowning-statistics-facts.html` | bare citation URL in the "Cite or link to this page" block | 374px |
| `education/swim-lessons-cost.html` | `table.pricing-table` | 369px |
| `education/teaching-kids-to-climb-out-pool.html` | `<span>` reading `Elbow·Elbow·Tummy·Knee` — U+00B7 is not a line-break opportunity, so it is one unbreakable token | 368px |

**Detection recipe for future runs:** render with `isMobile: true`, then flag when `document.documentElement.scrollWidth > NOMINAL_WIDTH` **or** `window.innerWidth > NOMINAL_WIDTH`. Comparing the two against each other hides the entire defect class.

## Fixes shipped

**`assets/css/m-app.css`** (mobile-only, ≤768px):

- `.main-layout > * { min-width: 0 }` — lets the grid track shrink to the container. Systemic guard, not a per-page patch.
- `overflow-wrap: break-word` on article body text — contains bare URLs without affecting normal prose (it only splits a word that cannot otherwise fit).
- `overflow-wrap: anywhere` on `.stat-box` spans — handles `·`-joined and similar unbreakable strings.
- Wide tables → `display: block; overflow-x: auto` — the table scrolls inside its own box instead of widening the page. Verified contained at 280px (320 viewport) and 335px (375 viewport).
- 44px `min-height` on `.toc-item` (285×28), `.visit-btn` (240×40), `.wwk-city-link` (95×35). These are standalone navigation and CTA links, so the WCAG 2.5.8 inline-link exception does not apply to them.

**`swimmers-hub/butterfly-complete-guide.html`** — inline `margin: 32px -24px -24px -24px` on the Related Articles block. A negative-margin full-bleed that assumed 24px of article padding; on mobile it overflowed 48px. Now `margin: 32px 0 0 0`. Only page on the site with an inline negative horizontal margin.

**Missing District of Columbia** — `aquatic-jobs/index.html` `#jobState` and `jobs/post.html` `#state` both listed 50 states and stopped at Wyoming. `jobs/index.html` already had DC, which is what made the gap visible. Added to both.

Cache-bust: `main.js` and `m-app.css` → `v=20260818c` across 716 pages.

## Verified healthy

- **No horizontal overflow** on any of the 727 pages at 320px after the fix (full re-scan, 0 flagged).
- **Hamburger menu** — 44×44, opens on tap, `aria-expanded` flips to `true`, body scroll locks. Correct on every page sampled.
- **State selects** — 52 options (51 + placeholder) on the directory, swim-schools, and jobs pages. The three fixed in the 8/17–8/18 truncation sweep have stayed fixed.
- **`m-app.css` injection** — confirmed loading on all 189 renders (it has no `<link>` tag; `main.js` injects it at ≤768px).
- **Root font-size** — 14px at 320/375, 15px at 768. No drift.
- **No JavaScript errors** on any page tested.
- **`select#stateFilter`** on the directory page is empty in the HTML but populated to 52 options by JS on load — working as designed, not an inert widget.

## Confirmed non-bugs — do not "fix" these

- **10px labels on `.mobile-bottom-nav` and `.mobile-cat-item`** — documented deliberate exception; raising them to 11px reflows the strip.
- **24×24 checkboxes** on `/swim-schools/add.html` and `/jobs/post.html` — that is the WCAG 2.5.8 AA floor, applied on purpose.
- **1,058 inline `<a>` elements under 44px tall** — links inside sentences, explicitly exempt under WCAG 2.5.8.
- **`.mobile-cat-item` extending past the viewport on the homepage** — that is the horizontally scrolling category strip. Page itself does not overflow.
- **White-on-white text reported on ~14 pages by a naive contrast check** — false positive. Those elements sit on gradient backgrounds, which do not appear in `backgroundColor`. A contrast checker must walk ancestors for `backgroundImage` and bail out, or it will flag every hero on the site.

## Open item for Michael

`aquatic-jobs/index.html` `#locationFilter` renders with a single option. It is populated from the Apps Script jobs API, which is still returning 403/CORS. Not a mobile defect — it resolves when the Apps Script deployment access is set back to "Anyone".
