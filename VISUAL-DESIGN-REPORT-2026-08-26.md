# Visual Design Report — 2026-08-26

**Method:** headless Chromium screenshot + geometry sweep served over HTTP (never
`file://`). 24 template representatives — one per stylesheet-fingerprint group
(13 groups) plus extra coverage of the four largest — rendered at
1280 / 768 / 390 / 320px, with full-page captures at 1280 and 390. Probes:
document overflow, offscreen elements resolved against their nearest scroll
ancestor, broken/zero-box images, sub-11px text in `main`, flex/grid track
consistency, section rhythm, and **rendered-pixel WCAG contrast** with the
background resolved by walking ancestors until an opaque colour is found.

Baseline: `live` @ `a4e65b1`. Shipped as `2ed5261`.
**2 defect classes fixed — 1 component × all pages, 91 controls × 78 pages.**

---

## Fixed #1 — the mobile bottom nav used two different layout algorithms

`.mobile-bottom-nav` is fixed to the bottom of **every page on the site** at
≤768px. It laid its five items out with `justify-content: space-around` and
intrinsic widths, so each icon's centre depended on the pixel width of its own
label. The icons did not sit on an even rhythm:

| viewport | icon-centre gaps | spread |
|---|---|---|
| 320px | 64 / 64 / 64 / 64 | **0px** |
| 375px | 74.5 / 80 / 76 / 71.5 | 8.5px |
| 390px | 77.5 / 84 / 79.5 / 73 | **11px** |
| 414px | 82.5 / 88 / 83.5 / 77 | 11px |
| 768px | 154.5 / 160 / 154.5 / 149 | **11px** |

320px was the *only* clean width — because the equal-column form
(`space-between` + `flex: 1 1 0`) already existed in `m-app.css`, but scoped to
`@media (max-width: 360px)`, where it had been added on 8/16 purely to cure a
320px overflow. The correct layout was in the codebase the whole time; it had
simply never been promoted to the rest of the mobile range, so **every phone
wider than 360px got the ragged version.**

Promoted to the main `@media (max-width: 768px)` block.

**After:** spread is 0px at 320/375/390/600 and 1px at 414/768 (sub-pixel
rounding of a 1/5 track). Verified alongside: `docOverflow == 0` and all five
tap targets ≥ 44×44px at every width — the two properties the 360px block was
originally protecting.

**Files:** `assets/css/m-app.css`, `assets/js/main.js` (cache token
`m-app.css?v=20260825e → 20260826a`), 730 HTML files (`main.js?v=20260825d →
20260826c` — main.js changed, so its own token had to move or browsers would
serve the cached copy and never request the new stylesheet URL).

---

## Fixed #2 — 91 filled controls below WCAG AA, all in inline `style=` attributes

Every one is white text on a coloured fill, and every one is functional UI — a
submit button, a lead-magnet CTA, or a job-listing badge. All were invisible to
previous audits because the colour lives in an inline `style` attribute, not in
any stylesheet, so `grep`-ing the CSS returns nothing.

| fill | fg | ratio | needed | count | files | → new fill | after |
|---|---|---|---|---|---|---|---|
| `#0284c7` blue-600 | white | 4.10:1 | 4.5 | 76 | 68 | `#0369a1` blue-700 | 5.19:1 |
| `#f59e0b` amber-500 | white | **2.15:1** | 4.5 | 7 | 7 | `#b45309` amber-700 | 5.02:1 |
| `#4ecdc4` teal | white | **1.93:1** | 4.5 | 5 | 1 | `#0f766e` teal-700 | 5.47:1 |
| `#ff6b35` orange | white | 2.84:1 | 4.5 | 1 | 1 | `#c2410c` orange-700 | 5.18:1 |
| `#f97316` orange-500 | white | 2.80:1 | 4.5 | 1 | 1 | `#c2410c` orange-700 | 5.18:1 |
| `#ff6b6b` coral | white | 2.78:1 | 4.5 | 1 | 1 | `#b91c1c` red-700 | 6.47:1 |

The `#4ecdc4` "✨ New" and `#ff6b6b` "🔥 Hot" job badges are the worst on the
site — 11px white on mint at 1.93:1 is close to unreadable.

Every replacement is the **-700 tier of the same hue**, which is the remediation
already established on this site: `local-pages.css:91` records the identical
blue-600 → blue-700 swap on 8/22, and `main.css` calls blue-700 "the site's
canonical button blue." No hue changes, no design decisions taken.

The rewrite only touched a `background`/`background-color` hex inside a `style`
attribute that **also** declared `color: white|#fff|#ffffff` on the same element —
so borders, gradients, `.button-secondary` outlines and the `.stars` amber text
were all left alone.

**Verification:** a static pass recomputing every inline fg/bg pair sitewide
(with the correct large-text threshold: ≥24px, or ≥18.66px at weight ≥700)
returns **0 residual failures**, and a re-render of 33 pages × 4 viewports
returns **0 AA failures, 0 overflow, 0 sub-10px text**.

---

## Clean — measured, not assumed

- **Document overflow.** `scrollWidth - clientWidth == 0` on all 24 templates at
  all four viewports.
- **Images.** 0 broken (`naturalWidth == 0`) and 0 zero-box images anywhere.
- **Section rhythm.** Inter-section gaps are uniform per template; `/gear/`'s
  64px gaps are consistent, not a defect.
- **Homepage, directory hub, teens hub at 1280.** Card grids are equal-width and
  equal-height within every row, gaps uniform, state-chip grid aligned.

---

## Two false-positive classes, confirmed not defects

- **Tofu boxes are the sandbox, not the site.** `/gear/` rendered all six
  category icons and three column headings as `□`. The HTML contains real
  emoji (`👶 👓 🛡 🏊 🌊 🚨 🎒`) and `fc-list | grep -c emoji` returned **0** —
  the render box had no emoji font at all. Installed Noto Color Emoji and the
  icons render correctly. This is the standing *missing-emoji-font* class; it
  will fake a "broken icons" finding on every page that uses emoji as an icon
  until the font is installed, so **install it before screenshotting.**
- **Offscreen elements are inside real scrollers.** 93 category chips on
  `/education/`, and wide tables on 5 other pages, sit past the viewport edge.
  Every one resolves to an ancestor with `overflow-x: auto` **and**
  `scrollWidth > clientWidth` — intentional horizontal scrollers. Confirmed by
  `docOverflow == 0`. Resolving each offscreen element against its nearest
  scroll ancestor is what separates this from a real clip.
- **10px bottom-nav / category labels** are the documented intentional floor
  (`m-app.css:1411`), not a text-size defect.

---

## Method notes for the next run

- **A backgrounded HTTP server does not survive between bash calls.** The first
  full sweep returned 100 results and every finding was empty — because the
  server had died and all but the first page 404'd into
  `ERR_CONNECTION_REFUSED`. `errors == 0` is the canary: assert it before
  trusting a clean report. Serve from a daemon thread **inside** the sweep
  process.
- **`/tmp/pw-browsers` was deleted mid-run by a concurrent session** (disk went
  7.3G → 6.4G between two calls). Re-running `playwright install chromium` is
  cheap; assuming the browser is still there is not.
- **"Trailing dead space" measured from the last *element* child is wrong.**
  It flagged `div.tldr-box` at +132px on three pages; the box holds a `<strong>`
  followed by a long text node, so the "dead space" was the running prose.
  Measure against the last child **node**, or use `Range.getBoundingClientRect`.

---

**Commit:** `2ed5261` · **Files:** 732 changed · **Live-verified:**
`m-app.css` serves `space-between` + `flex: 1 1 0`; `jobs.html` serves
`#0f766e` / `#b91c1c` badges.
