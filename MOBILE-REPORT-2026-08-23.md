# Mobile Consistency Check — 2026-08-23

**Method:** headless Chromium render sweep of a 154-page stratified sample
(25 template buckets, ~18% of each) served over HTTP from a clone reset to
`origin/live`, at 320px and 390px, plus a 35-page pass at 768px.
Measured, not grepped.

**Result:** 1 real defect found (sitewide), fixed and shipped. Everything else clean.

## Clean

| Check | Result |
|---|---|
| `meta viewport` | 737/737 pages present, all `width=device-width, initial-scale=1.0` |
| Document horizontal overflow | 0 pages at 320 / 390 / 768px |
| Element overflow past nominal width | 0 |
| Text below 11px floor | 0 |
| Inputs below 16px (iOS zoom) | 0 |
| Broken / overflowing images | 0 |
| Clipped text in fixed-height boxes | 0 |
| Hamburger menu | 154/154 — `aria-expanded` flips, `nav.mobile-open` drawer renders, body scroll locks, 0 sub-44px links inside the open drawer |
| `m-app.css` injection | 154/154 pages |
| Interactive elements covered at true scroll-bottom | 0 |

## Defect found and fixed

### `main.css`'s bare `nav` rule was inflating the mobile bottom bar

`m-app.js` injects the bottom bar as a bare `<nav>` element, so it was matched by
two generic rules meant for the desktop header:

- `main.css:530` — `nav { height: 72px; gap: var(--spacing-lg) }`
- `main.css:1574` — `@media (max-width:768px) nav { flex-wrap: wrap }`

Measured consequences:

1. **Bar rendered 72px tall instead of its 60px content height.** `m-app.css`
   reserves the gutter beneath it with `body { padding-bottom: calc(68px + safe-area) }`
   — a constant written to match the bar. It under-reserved by 4px, so the last
   ~4px of the footer sat permanently underneath the fixed bar on **140 of 154
   sampled pages (91%)**. Footer clearance measured −3.5px to −4.5px.
2. **`flex-wrap: wrap` + a 16px row-gap** made a fixed-height bar capable of
   wrapping to a second row that the 72px height would then clip — latent, not
   yet triggered.
3. **`gap: var(--spacing-lg)`** added 16px of column gap to the 5-item strip,
   eating horizontal room at 320px.

**What isolated it:** the printable templates rendered the bar correctly at 60px.
They are the only templates that never load `main.css`. That divergence pointed
straight at the source rather than at `m-app.css`.

**Fix** (`m-app.css`, `.mobile-bottom-nav` only — class beats element, no
`!important` needed): `height: auto; flex-wrap: nowrap; gap: 0`.

**Verification after the fix**, 154 pages × 320/390px:

| | before | after |
|---|---|---|
| Bar height | 72px (140 pages) | 61px |
| Footer clearance | −4.5 … −3.5, 140 pages negative | +6.52 … +279, **0 negative** |
| Bar rows | wrap-capable | 1 on all 308 measurements |
| Document scrollWidth @320px | 320 | 320 (no regression) |
| Bar scrollWidth vs clientWidth | — | no overflow on any page |
| Covered at scroll-bottom | 0 | 0 |

Regression pass on 95 identical pages: **0 pages regressed** on overflow,
tap-target, text-floor, input-zoom, image, clipping or hamburger checks.

## Notes

- Cache-bust: `m-app.css` → `v20260823c`. Its `href` is written by `main.js`, so
  `main.js?v=` had to be bumped across all pages or the new sheet would never be
  requested. 726/726 pages now on `v20260823c` — including the 2 pages a sibling
  job published mid-run, which needed a second commit.
- Other stylesheets left at their existing `?v=` (only changed sheets get bumped).
- `/british-swim-school/` has no `index.html`. It is not linked from anywhere, so
  it is not a live 404 — noted, not changed.

## Confirmed false positives (do not "fix")

- **Bottom-nav / category-chip 10px labels** — documented carve-out in `m-app.css`.
- **`.related-articles ul li a` / sidebar nav lists at 24px** — deliberately set to
  exactly the WCAG 2.5.8 AA 24px floor by an earlier sweep, with rationale in the
  sheet. Not a defect.
- **Breadcrumb "Home" anchors at 44 × ~29-40** — 44px tall; the small dimension is
  inline text width, which target minimums don't govern. The largest breadcrumb
  variant has no class, so class-based exclusion filters miss it.
- **Inline citation links (CDC, AAP, NDPA) at 15–18px** — `display: inline` inside a
  sentence, exempt under WCAG 2.5.8.
- **~220 "tap spacing <12px" hits** — adjacent inline prose links; same inline
  exemption.

## Harness bugs caught this run (both would have produced false results)

- `nav[aria-label i]` is invalid CSS — `closest()` threw and **every page hard-errored**.
  Caught because the run reported 0 findings across 33 pages with 99 errors.
- `window.scrollTo(0, ...)` silently never reached the bottom because
  `html { scroll-behavior: smooth }` is set. The first "permanently covered"
  result (66 hits) was measured mid-scroll and was entirely spurious; forcing
  `scroll-behavior: auto` and looping until stable gave the true answer of 0.
