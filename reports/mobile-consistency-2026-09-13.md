# Mobile consistency check — 2026-09-13

Clone: fresh `origin/live` @ `d575c4887` (778 tracked html − 23 meta-refresh stubs = **755 live pages**).
Harness: Playwright/Chromium, served over HTTP (ThreadingTCPServer), `is_mobile=False, has_touch=True`,
Google Fonts fulfilled empty, transitions killed via `addStyleTag`. **0 render errors** on every pass.

## Scope decision

The mobile/responsive axes were measured clean on 09-09 (viewport, main.js coverage, hamburger
binding, iOS focus-zoom cascade — 755/755) and 09-10 (CSS regression, all screen axes 751/751).
Re-running those wholesale is churn, so this run measured the **delta** instead:

- `83b3d9ae8..HEAD` = 9 commits, **4 html added + 98 modified = 102 live pages**.
- **`assets/**/*.css` and `assets/**/*.js` delta: ZERO bytes.** The shared stylesheets and
  `main.js` / `m-app.js` are byte-identical to the 09-10 clean baseline, which bounds the possible
  regression to per-page markup.

A 40-page random sample of *non-delta* pages was run at the same viewports as a control.

## Delta result — CLEAN

| Axis | 390×844 | 320×568 | House value |
|---|---|---|---|
| Horizontal overflow | 0 / 102 | 0 / 102 | 0 |
| Tap targets under floor | 0 / 102 | 0 / 102 | AA 24px |
| Chrome text under floor | 0 / 102 | 0 / 102 | 11px |
| Footer rail | 20px on 102 / 102 | 20px on 102 / 102 | 20px |
| Leftmost visible text | 20px on 102 / 102 | 17px on 101, 16px on 1 | ≥ rail |
| Text-entry inputs under 16px | 0 / 102 | 0 / 102 | 16px (iOS zoom) |
| `.hamburger` present | 1 on 102 / 102 | 1 on 102 / 102 | exactly 1 |

Control sample (40 non-delta pages, 390px): identical — 0 on every axis, rail 20/40.
Viewport meta, main.js coverage and hamburger binding were not re-derived (closed 09-09, and the
JS/CSS delta is zero); `.hamburger` presence was confirmed incidentally at 1 per page on all 755.

**Nothing was pushed. No defect in the delta.**

## New finding — the tablet band has no tap-target floor (corpus-wide, pre-existing)

Measured at **834×1112 across all 755 live pages**: **633 / 755 pages carry at least one
interactive target under 24px.** Overflow 0/755, chrome text floor 0/755 at the same width.

Mechanism, not a regression:

- The AA 24px floor for standalone list links is applied by `m-app.js:219`, which adds
  `.wwk-navlist` to a `ul` only when *every* `li` holds a single anchor and no other text — a
  structural test that cannot be written in CSS, which is why it runs at runtime.
- `m-app.js` / `m-app.css` are injected by `main.js` only at `innerWidth <= 768`. Above 768 the
  tagging never runs, so `.wwk-navlist > li > a { min-height: 24px }` never applies and the links
  fall back to their natural 16–19px line box.

Offender census at 834 (142 pages sampled for ancestor signatures) — one shape, many containers:

| elements | pages | height | signature |
|---|---|---|---|
| 341 | 71 | 19px | `section.related-articles > ul > li > a` |
| 97 | 14 | 16px | `div.sidebar-toc > ul > li > a` |
| 86 | 2 | 19px | `div.container > ul > li > a` |
| 51 | 1 | 19px | `div.article-body > ul > li > a` |
| 24 | 8 | 19px | `article.article > ul > li > a` |
| 24 | 8 | 16px | `div.sidebar-card > ul.note-list > li > a` |
| …8 more signatures | | 16–19px | all `ul > li > a` |

Every hit is the same `ul > li > a` standalone-link shape. The container class is *not* stable
(14 signatures over 142 pages), so a class-selector restatement in `main.css` would be a partial
fix that reports clean while missing the long tail.

### Proposed remedy (not applied — wants a dedicated run)

1. Move the `.wwk-navlist` structural tagging out of `m-app.js` into `main.js` so it runs at all
   widths (the class is additive; below 768 `m-app.js` already applies it, so a double-add is inert).
2. Carry `.wwk-navlist > li > a { display:inline-flex; align-items:center; min-height:24px;
   min-width:24px }` in `main.css` **unscoped by media query** — `m-app.css`'s `!important` copy
   still wins at ≤768. Keep `min-width` as well: a 3-character `FAQ` row in `.sidebar-toc`
   previously falsified the "these anchors are always wide enough" assumption.
3. Verify at 769 / 834 / 1024 / 1149 / 1280 **and re-verify 390 + 320 for regression**, then bump
   the cache-bust key on every page referencing `main.js` and `main.css` (~700 pages) — the chain
   breaks at the outer asset, so `main.js` must be bumped along with `main.css`.

Deferred out of this run because it is (a) pre-existing and outside the delta, (b) a 3-file change
plus a sitewide cache-bust that needs the full post-publish gate and leaf-page edge verification,
and (c) a partial fix here would be worse than none.

## Probe artifacts corrected during this run (not corpus defects)

1. **Bottom-nav 10px labels read as 102/102 text-floor failures.** The class is
   `.mobile-bottom-nav`, not `.bottom-nav`. The 10px is deliberate and documented at
   `assets/css/m-app.css:1116` (5-across strip reflows at 11px). With the right exclusion the
   axis is 0.
2. **Prose links read as tap failures on 8 pages.** The inline exemption must be keyed on the
   nearest **non-inline ancestor's** text, not the immediate parent: `<strong><a>Back float</a>:</strong>`
   has a parent 1 character longer than the link, but its block container (`li`) is 96 characters.
   The exemption must also accept `display:inline-block`, which `/about/` uses in running prose.
3. **91 "inputs under 16px" at 834 are all `radio` / `checkbox`.** iOS zooms on focusing
   text-entry fields only. Text-entry inputs under 16px: **0 / 755**.
4. **Footer rail reads 0 on all 755 at 834** — above 768 the `<footer>` is full-width and the rail
   lives on an inner container. Expected; the 20px @390 reading is the canary.

Every axis was gated on a synthetic canary pair before and after the exemption fix: a true-positive
page (500px overflow block, 16px nav anchor, 9px footer span, 0px rail, 12px input) fired on all
five axes; a true-negative page (20px rail, 44px targets, 14px footer text, 16px input, prose link
in running text) fired on none.
