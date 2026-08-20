# CSS Regression Report — 2026-08-20

**Method:** headless Chromium render sweep, not grep. 23 template representatives
(one per stylesheet-fingerprint group, 13 groups + extra coverage of the largest)
× 1280 / 390 / 320px, capturing computed styles + `getBoundingClientRect` for
header, nav, logo, nav links, footer, footer links, `.footer-content`,
`.footer-bottom`, `.footer-links`, and the footer container.

Baseline clone: `live` @ `1c19bc8`. Fix commit: `5de6142`. **Deployed and verified live.**

**Coverage note:** 13 of the 731 HTML files load no stylesheet at all. All 13 were
confirmed to be `<meta http-equiv="refresh">` redirect stubs — correctly excluded,
not a defect.

---

## Fixed and deployed (3)

All three are the same defect class: **an unscoped page-level rule in a
page-specific stylesheet leaking into the shared nav/footer**, because those
sheets load *after* `main.css`. None is greppable — the bad number is never
written down; it emerges at runtime from the cascade.

### 1. `special-needs.css` — shared chrome sat 20px left of every other page (HIGH)

`special-needs.css` defines `.container { max-width: 1200px }` for its own page
body. The **2026-08-18 sweep caught this file stripping `.container`'s padding and
restored the padding — but not the `max-width`.** The wider container was still
winning on the shared header and footer.

| measurement @1280px | special-needs | all 730 other pages |
|---|---|---|
| nav container left edge | **64px** | 84px |
| footer container width | **1200px** | 1160px |
| footer `.footer-bottom` left | **64px** | 84px |

Visible symptom: logo, all nav links, and the entire footer shifted 20px left.

**Fix:** added `max-width: 1160px` to the existing `header .container, footer .container`
re-assert block.

### 2. `special-needs.css` — bare `p` selector retimed the shared footer (MEDIUM)

`special-needs.css` line 96 has a bare `p { … line-height: 1.8 }`. That ties
`main.css`'s `p { line-height: 1.7 }` on specificity (0,0,1) and loads later, so it
also won inside the **shared footer**. Footer paragraphs rendered at 31.68px
line-height instead of 29.92px; the whole footer ran 297px tall vs 291px sitewide
(296 vs 294 at 390px, 340 vs 336 at 320px).

**Fix:** scoped `header p, footer p { line-height: 1.7 }` re-assert. The page body
keeps its 1.8.

### 3. `printable-checklist.css` — shared chrome ~6% tighter than everywhere else (MEDIUM)

This standalone sheet sets `body { line-height: 1.5 }` for the dense checklist
layout. `main.css` and `printable-poster.css` both use 1.6. The shared nav and
footer inherited 1.5, so **identical markup rendered tighter on 76 checklist
printables than on the 655 other pages — and than on the 2 poster printables built
from the same shared footer.**

| element | checklist printables | poster printables + all others |
|---|---|---|
| footer line-height | **24px** | 25.6px |
| nav links | **21.6px** | 23.04px |
| `.footer-bottom` | **19.2px** | 20.48px |
| logo | **26.4px** | 28.16px |

**Fix:** scoped `header, footer { line-height: 1.6 }` re-assert — same shape as the
2026-08-19 gutter fix and the root-font-size mirror already in that file. The
checklist body keeps its 1.5.

### Verification

Re-rendered the full 23 × 3 matrix and diffed against the pre-fix capture:

- **58 computed-style deltas, every one landing exactly on the majority signature.**
  `navContainer._x` 64 → 84. `container._w` 1200 → 1160. `footer._h` 297 → 291
  (and 296 → 294, 340 → 336). Footer `p` line-height 31.68 → 29.92. Checklist
  footer 24px → 25.6px, nav links 21.6 → 23.04.
- **0 unintended deltas** across the other 21 templates at all three viewports.
- Post-fix safety counters at all three viewports: horizontal overflow **0**,
  header/footer text under 11px **0**, visible tap targets under 44px **0**,
  header/footer contrast under 4.5:1 **0**.
- Live re-render after deploy: `special-needs-swimming.html` now reports
  `navX=84, footerH=292, footerLH=25.6px, overflow=0` — **identical to `index.html`**.

Cache-bust: only the two changed sheets bumped, to `?v=20260820a` (79 pages).
`main.css`'s 1,787 references were deliberately left on `20260819c` — it did not change.

---

## Clean this run

- **Nav and header geometry is byte-identical on all 23 templates** at all three
  viewports: header 73/72/72px tall, nav 72px, logo top 22/14/14px, 9 nav links,
  11 footer links. No structural drift.
- Font family resolves to Inter on 100% of templates — no serif fallback anywhere
  (cf. the `html{font-family:inherit}` bug).
- Root font-size scaling (16 → 15 → 14px) mirrors correctly in both standalone
  printable sheets. The 2026-08-18 fix is holding.
- Footer tap targets: the 2026-08-18 `min-height:44px` fix on `.footer-bottom`
  inline links is holding at every viewport.
- Inline `style` attributes were inventoried across all 23 templates. All are
  page-content decoration (`.tldr-box`, `.related-card`, `.stat-box`, hero
  gradients). **None override `main.css` on nav or footer.**

## Flagged, not changed

- **Printable footers are 269/274/294px tall vs 291/294/336px on `main.css`
  pages.** This is the printables' own footer variant — `footer > div
  { max-width: 1100px }` plus `text-align: center`, applied identically in both
  printable sheets. Before this run the two printables disagreed with each other
  (262 vs 269); they now agree exactly. The remaining gap from `main.css` pages is
  a deliberate design choice, not drift.
- **`special-needs.css` sets a page palette** — body `#13304a` on `#f4f8fb` vs the
  sitewide `#1f2937` on `#ffffff`. It shows up as an inherited `color` on the
  `<header>` element, but every header and footer text node sets its own color, so
  **nothing visibly inherits it.** Changing a whole page's palette is a design
  decision, not a regression fix — flagged for Michael.
- **`printable-*.css` set `footer .footer-bottom { display: block }`**, overriding
  `main.css`'s `display: flex; gap: 16px`. Applied consistently in both printable
  sheets and authored deliberately. Not touched.

## Confirmed non-bugs (do not "fix" next run)

- `.footer-links` computes `flex-direction: column, gap 10.5px` on the ~407
  `article.css` pages vs `row, gap 21px` elsewhere at ≤768px. **`m-app.css` sets
  `.footer-links { display: none }` at that breakpoint** — measured `_vis: false`,
  height 0. Entirely invisible. Bucketing computed styles without a visibility
  filter flags this every run.
- Blue `.active` nav link on `/education/`, `/swimmers-hub/` and `/swim-lessons/`
  pages is `main.js` matching by pathname. Working as designed.
- Google Fonts stylesheets report `BLOCKED` in the capture — that is the harness's
  own route-abort (required, or `networkidle` hangs), not a site defect.

---

## Method note for the next run

Two harness bugs worth avoiding:

1. **Exclude the logo when sampling "the first nav link."** The logo is the first
   `<a>` inside `<header nav>`, so a naive `nav a` selector silently measures the
   logo on every page and reports a clean 1-signature bucket for nav links.
2. **Filter to elements visible at that breakpoint before bucketing.** Without it,
   `display:none` regions (the desktop `.footer-links` on mobile) generate
   permanent false positives.
