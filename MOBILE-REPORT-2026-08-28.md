# Mobile Consistency Report — 2026-08-28

**Method:** headless Chromium render sweep (not grep). 72 representative pages selected by the
four-part equivalence key (stylesheet set, header hash, footer hash, inline `<style>` hash) over
747 HTML files — 68 classes, one rep each plus a second rep from any class ≥50 pages.
Viewports: **320, 375 (mobile emulation, iOS UA), 769, 800** + a full-corpus 747-page overflow
sweep at 800px. Every sweep canary-gated: an injected `viewport+300px` div had to trip the
overflow probe before any page was trusted (`window.innerWidth` expands under mobile emulation,
so the probe compares against the *intended* device width, never `innerWidth`).

**Result: 2 defect classes found, both fixed, deployed, and verified against production.**
Commit `6f76f2c` on `live`.

---

## Fixed

### 1. Tablet-band horizontal overflow — 4 article pages (769–870px)

`article.css .main-layout` and `main.css .content-grid` both declared
`grid-template-columns: 1fr 320px`. A bare `1fr` track keeps the grid item's *automatic minimum
size* (= min-content), so it cannot shrink. On pages whose article column contains wide
unbreakable content, the two tracks summed wider than the container and pushed the page sideways
in the band where the two-column layout is still active but the viewport is narrow.

Worked example — `education/beach-flag-color-card.html` at 769px: container inner width 721px,
but the computed tracks were `463px 320px` + 40px gap = 823px. The 463px floor is the
min-content width of `.flag-table` (`tbody th { white-space: nowrap }`). The page *already had* a
`.flag-scroll { overflow-x: auto }` wrapper — it could never engage, because the grid track above
it refused to get narrower than the table.

| Page | Excess at 800px |
|---|---|
| `education/swim-lessons-cost.html` | 89px |
| `education/drowning-statistics-facts.html` | 56px |
| `education/teaching-kids-to-climb-out-pool.html` | 52px |
| `education/beach-flag-color-card.html` | 47px |

**Fix:** `grid-template-columns: minmax(0, 1fr) 320px` in both stylesheets. The track can now
shrink, and `.flag-scroll` does its job — the table scrolls inside its wrapper
(measured post-fix: table 463px inside a 392px scrollable wrapper) instead of scrolling the page.

**Verified** at 769 / 800 / 860 / 900 / 1024 / 1280 / 1440px: zero overflow, on the local build
and again against `https://www.waterwisekids.com`. Full 72-rep re-sweep at 769px produced exactly
one delta versus baseline — the overflow going away. No regressions.

### 2. Checkbox and radio targets below WCAG 2.5.8 AA above the mobile breakpoint

`m-app.css` sizes bare checkboxes and radios to 24×24, but **m-app.css is only injected by
`main.js` at ≤768px**. Above that the controls fell back to the UA default: **13×13** on
`/swim-schools/add.html` and **17×17** on `/tools/family-water-safety-plan.html`. Every device in
the 769–1149px band is a touch device (iPad portrait 768–834, iPad landscape 1024), and WCAG
2.5.8 is not viewport-conditional, so the floor had to be restated outside m-app.css.

**Fix:** `input[type="checkbox"], input[type="radio"] { min-width: 24px; min-height: 24px }`
added to the existing `@media (min-width: 769px) and (max-width: 1149px)` block in `main.css`.
Sizing the control rather than padding the row keeps the checkbox lists from reflowing.

**Verified:** 24×24 at 375 / 769 / 900 / 1149px locally and at 900px on production. Reverts to
UA default above 1149px by design — that is mouse territory, outside the touch band.

### Cache-bust
All stylesheet references `?v=20260828b` → `?v=20260828d` — **1172 refs across 730 files**,
asserted zero residual `20260828b`. Version bumped *after* verification, so the key is not
poisoned by a pre-fix fetch. `main.js` left at `20260828c` (unchanged file). Sitemap `lastmod`
deliberately untouched: a cache-bust query string is not a content change.

---

## Checked and clean

- **Viewport meta** — `width=device-width, initial-scale=1.0` on 72/72 reps. No `user-scalable=no`,
  no `maximum-scale`.
- **Horizontal overflow at 320 and 375px** — 0 pages. The `minmax(min(280px, 100%), 1fr)` grid
  convention is holding; no new page has regressed to a bare `minmax(280px, 1fr)`.
- **Full-corpus overflow at 800px** — all 747 pages scanned, only the 4 above.
- **Hamburger menu** — 72/72 reps at 375px: toggle found, clicked, `.nav-links` drawer opened with
  measurable height, visible, opacity > 0.1. Zero failures. Correctly hidden at 769px+ where the
  desktop nav takes over.
- **Image scaling** — 0 images exceeding the viewport at 320, 375, or 769px.
- **iOS focus zoom** — 0 text inputs, selects, or textareas below 16px at any mobile width.
- **Text floor** — one 10px `SPAN` sitewide, the bottom-nav / category-strip label held at 10px on
  purpose (11px reflows the fixed 5-across row). Printable cards carry 10.2–10.9px brand and tag
  text; printables are print-first and excluded by convention.
- **Root font size** — 14px at ≤768 (mobile), 16px at 769+. Expected; any rem threshold grepped
  against a 16px root will misreport on mobile.

## Known non-defects (do not re-report)

- Multi-line prose links measuring ~42px tall: a wrapped inline link, WCAG-exempt.
- `<label>` elements sitting above their inputs at ~21px.
- Checkbox/radio font-size at 13.3px — does not trigger iOS focus zoom.
- Breadcrumb links at 36px — deliberate; 44px visibly thickens the bar on every article page and
  36px clears the WCAG 2.2 AA 24×24 minimum.
- **Header/footer markup variant counts now read 8 and 3, up from the recorded tripwire of 7 and
  2.** Not a regression: the extra bucket in each is the *empty-string* hash from the 17 redirect
  stubs, which carry no `<header>` or `<footer>` at all. All 17 have a viewport meta and a
  meta-refresh. Real variants are still 7 and 2. Future sweeps should exclude the empty bucket
  before comparing against the tripwire.

## Open, needs Michael

- Above **1149px** the checkbox/radio floor is not applied. That is deliberate (mouse input), but
  large touch laptops and iPad Pro 12.9" landscape (1366px) fall outside it. Widening the band or
  switching to `@media (pointer: coarse)` is a judgement call, not a defect.
