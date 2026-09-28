# CSS Regression Check — 2026-09-02

**Verdict: no CSS regressions. Nothing pushed to `live`.**

Audited commit `27bcac8` on a fresh clone of `origin/live` (not the mount).
Method: headless-Chromium **render** sweep over HTTP, not grep.

---

## Scope — what was actually measured

- **734 non-stub pages** partitioned on the 4-part key (stylesheet set, normalized
  header hash, normalized footer hash, inline `<style>` hash) → **69 classes → 73 reps**.
  23 `meta refresh` stubs excluded; every rep asserted `finalUrl == requestedUrl`.
- **292 probes** = 73 reps × **4 viewports** (1280 desktop, **1000 tablet band**, 390, 320).
  **0 errors, 0 non-200.**
- Per probe: computed styles (23 properties) for `header` / `nav` / `.nav-logo` /
  first nav link / `footer` / first footer link; bounding rects; min tap target among
  *visible* links; any header/footer text under 11px; horizontal overflow; root font-size;
  body font/colour; every inline `style` attribute inside the chrome.
- Plus a **state pass** (hover + focus, transitions killed, `activeElement` asserted) on
  8 pages × 2 viewports, and a **geometry pass** on all 73 reps × 2 viewports.

## Tripwires — all green

| Check | Baseline | Today |
|---|---|---|
| Header markup variants | 6 | **6** ✅ |
| Footer markup variants | 2 | **2** ✅ |
| Horizontal overflow (any viewport) | 0 | **0** ✅ |
| Header/footer text < 11px | 0 | **0** ✅ |
| Tap targets < 44px at 320/390px | 0 | **0 / 73** ✅ |
| Nav link count | 1 mobile / 9 desktop | uniform ✅ |
| Footer link count | 3 mobile / 12 desktop | uniform ✅ |
| Body font-family | 1 bucket | **1 bucket** ✅ |
| Root font-size (16/15/14 scale) | 1 bucket per viewport | **1 bucket** ✅ |
| Hover + focus states, nav & footer | consistent | **consistent** ✅ |
| CSS cache-bust keys ≥ file commit date | all | **all 13 sheets + main.js** ✅ |

`m-app.css` chain also intact: `main.js` (commit 2026-09-01) carries `m-app.css?v=20260901a`,
and `m-app.css` last changed in the same commit `40e4fe87`.

## Divergences examined and cleared

**1. Nav padding splits 40 / 33 — geometrically compensated, not a defect.**
One template family gives `nav` `padding-left: 24px` (20px mobile) with the box starting
at x=60 (0 mobile); the other gives `padding-left: 0` with the box starting at x=84 (20).
Both resolve the nav **content** box to x=84 desktop / x=20 mobile, and `firstLink` and
`lastLink` rects are byte-identical across all 73 reps at both viewports. No visible drift.

**2. Footer centring achieved two ways — same result.**
648 pages centre via inline `class="container" style="text-align:center"`; the 92 printables
centre via `footer { text-align:center }` in their standalone sheet. Both compute to centred;
footer link rects identical across all reps.

**3. Body/header colour outliers on 2 pages — previously adjudicated, still invisible.**
`/special-needs-swimming.html` (`#13304a`) and `/education/pool-safety-rules-printable.html`
(`#1b2a4a`) differ from the sitewide `#1f2937`. Confirmed invisible in the chrome: every
header and footer text element sets its own colour, and the header's `border-bottom-width`
is `0px` at the breakpoint where `border-bottom-color` falls back to `currentColor`.

**4. `display:none !important` on `header`/`footer`/`.hamburger` in 3 pages' inline `<style>`
— all inside `@media print`.** Screen render of `/tools/family-water-safety-plan.html`
(a sweep rep) shows normal chrome.

## Two non-shipping observations

- **Dead rule.** `assets/css/article.css` ~line 488 sets `.footer-links { flex-direction:
  column; gap:.75rem; align-items:center }` inside `@media (max-width:768px)`, but
  `m-app.css:882` sets `footer .footer-links { display:none !important }` at that same
  breakpoint. The rule can never apply. Harmless; not worth an article.css cache-bust bump.
- **`special-needs.css` sets `html, body { background:#f4f8fb }` globally**, but at ≤768px
  `m-app.css` repaints `body` white while `html` stays tinted. Desktop keeps the intended
  tint; mobile loses it and can show a blue-grey band on overscroll. Cosmetic and confined
  to one page; changing it is a design call, so it is reported rather than shipped.

## What was NOT checked

Print-media emulation, the open mobile drawer (`m-app` hamburger click), WCAG contrast
ratios, and desktop tap-target sizing (footer legal links are 15px tall at ≥769px — uniform
across all 73 reps, i.e. a sitewide convention, not a regression).
