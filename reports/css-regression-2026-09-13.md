# CSS regression check — 2026-09-13

Fresh clone of `origin/live` @ `d575c4887` → shipped **`9be99f510`**.
778 html − 23 stubs = **755 live pages**. Sample rendered: **122 pages**
(102-page delta since the 09-10 CSS baseline `83b3d9ae8` + a 22-page
per-template control set covering all 12 stylesheet families), at
**1280 / 834 / 390**. **366 page-renders, 0 render errors.**

## What bounded the sweep

`git diff 83b3d9ae8..HEAD -- '*.css' '*.js'` is **empty — zero bytes of CSS/JS
changed since the 09-10 baseline.** All 102 changed files are HTML, and none of
them added a rule touching shared chrome. That bounds how much screen regression
was possible and is why the sweep is a delta + control set rather than 755 pages.
Compute this first every run.

## Result: one real defect, shipped

**46 odd-one-out `.related-card-link` spans across 26 printable pages.**

Each of those pages shipped the component in two shapes — some spans bare, the
rest carrying `style="color:#64748b;font-size:0.82rem"`. The bare ones fell
through to `printable-checklist.css`'s `.related-card-link { color:#0e7490;
font-size:0.85rem }`, so one to three "Read Article →" links per page rendered
**teal at 11.9px** next to siblings in the same grid rendering **slate-grey at
11.48px**. Visible colour *and* size divergence inside one component.

All 167 spans on those 26 pages converged to the current house shape
`color:#64748b;font-size:max(11px,0.82rem)`. Computed output for the
already-correct spans is unchanged. Re-rendered 26/26 at 390 and 1280:
**1 style bucket per page, 174 links, 11px floor passes.** HTML-only, no asset
change, so no cache-bust bump. Verified live on two **leaf** pages
(`age: 0`, `last-modified` 14:40:31Z, single shape in the served HTML).

### Why every previous sweep called this clean

Neither shape violates a threshold — 11.48px and 11.9px both clear the 11px
floor, both colours clear AA. A floor probe reduces each element to pass/fail
against a constant, and that projection throws away exactly the information this
defect lives in. It was only visible to a **grouped-variance** pass that asserts
*one computed-style bucket per component*, which is the axis this run added.
Same lesson as the 09-10 `.sources` 16-vs-44px gap.

**It was also 25× bigger than the sample showed.** The 122-page sample contained
one affected page; enumerating the class across all 755 found 26. Find the class
on the sample, then enumerate on the corpus — never report the sample's count.

## Axes measured clean

| Axis | Result |
|---|---|
| header / footer / body / html / logo / footer-link computed styles | **1 bucket per stylesheet family**, all 12 families, all 3 viewports |
| header markup variants | **5** (unchanged tripwire) |
| footer markup variants | **2** (unchanged tripwire) |
| horizontal overflow | 0 / 122 at all 3 viewports |
| chrome text < 11px | 0 / 122 |
| rogue inline `<style>` rules touching shared chrome outside `@media print` | **0 / 122** |
| footer rail | 20px @390, 24px @834, 84px @1280 — uniform 122/122 |
| cache-bust key uniformity | 13 assets, **exactly 1 key each**; 0 assets referenced without `?v=` |
| cache-bust key vs file change date | 13/13 `ok`, no stale keys |
| render errors | 0 / 366 |

## False positives triaged (do not "fix" these)

- **`.nav-links` / `header .container` / `.mobile-bottom-nav` colour buckets** —
  the `.active` nav artifact. Every page ships the identical vocabulary: 7×
  `rgb(55,65,81)` + 1× `rgb(7,89,133)` in the header. Pages whose nav has no
  matching item (e.g. `special-needs-swimming.html`) show 8× grey and no active
  link. Correct.
- **`.sidebar-box` 5 buckets** — deliberate semantic theming (56 pages blue
  "key facts" gradient, 46 grey, 7 amber, 2 orange warning) plus the separate
  `.cta-box` class. Design intent.
- **`.cl-item` 18-vs-3 dark red** — deliberate critical-item highlight.
- **`.pillar-card-link` 4 colours**, **`.hero-actions` primary-vs-secondary
  button pair**, **`.cat-btn` / `.mobile-cat-item` active state** — all design.
- **`.screen-cta-card` 2 buckets on printables** — two distinct cards by design
  (light "More Related Guides" panel + dark CTA). Pages with only one card show
  one bucket.
- **Footer rail reads 0 at 1280** — known probe artifact; at desktop `<footer>`
  is full-width and the rail lives on the inner container. The inner-rail figure
  is the real measurement.

## Probe fixes this run (the probe was wrong three times before it was right)

The variance pass failed its own true-positive canary twice. Canary-gate
everything; a first-draft consistency probe reports clean because it is blind.

1. **`.mobile-bottom-nav`'s 10px labels are house-deliberate** and must be
   exempted, or the chrome-text floor reports 5 phantom fails on every mobile page.
2. **A bare class name is not a component identity.** `.container` in `<header>`
   is not `.container` in `<footer>`; without region-scoping the key, the clean
   control page reports multi-bucket drift against itself. Scope the component
   key by nearest region (header / footer / bottomnav / articlebody / main).
3. **`.wwk-navlist` is a runtime *shape tag***, not a component. `main.js`
   applies it to any single-anchor `<ul>` (gated ≤768), so it deliberately spans
   heterogeneous furniture and must be stripped from the class signature — it was
   the last false positive standing on the true-negative page.

Canary gate used: a true-negative page (real, untouched) and a true-positive copy
with one injected sibling divergence plus one injected chrome rule. Gate is
**TN multi-bucket == 0 AND TP catches both injections**, at both viewports.

## Still open (unchanged, needs Michael)

- **tablet-band tap floor 633/755 @834** — pre-existing, remedy written, needs a
  3-file + sitewide cache-bust run.
- **122 pages `.content-grid` 30px off-rail @desktop** — typography call.
- **`special-needs.css` sets `html, body { color:#13304a }`**, which inherits into
  shared chrome containers. **No visible effect today** — every chrome text
  element on that page re-asserts its own colour and measured identical to the
  controls at both viewports. Latent only; flagged rather than fixed because the
  file is outside this delta and the edit has no visible upside.
- `.cta-button` still prints on 334 pages (editorial call).
