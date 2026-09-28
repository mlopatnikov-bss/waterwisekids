# CSS Regression Report — 2026-08-30

**Shipped:** `d112f95` on `live`. Live-verified after Pages build.
**Sample:** 68 rep classes over 728 chrome-carrying pages (751 HTML − 23 redirect
stubs), 4-part partition key. 7/7 header markup variants and 2/2 footer variants
covered by construction. Render sweep, not grep: 68 reps × 18 widths (320–1440),
**0 load errors** across ~1,900 renders.

---

## 1. The find — header and footer gutters disagreed sitewide

Every page put its footer content **24px further in than its header content** from
1159px down, and **4px further in** at ≤768px. 68/68 reps. It had been live long
enough to survive every prior sweep.

Mechanism — the two regions build the same gutter differently:

| | header | footer |
|---|---|---|
| region padding | `0` | `2.5rem 1.5rem 1.5rem` (24px sides) |
| inner wrapper | `.container { padding: 0 24px }` | `.container { padding: 0 24px }` |
| **content inset** | **24px** | **48px** |

**Why no earlier sweep caught it.** At ≥1208px the footer wrapper is still
narrower than its box, so `margin: 0 auto` centring silently absorbs the extra
24px and *both regions land at exactly 84px*. The bug is perfectly invisible at
the desktop width every audit defaults to. Below 1208px the wrapper goes
full-width, centring stops absorbing, and the mismatch becomes live on every
page at every remaining width.

This is the same stacking shape as the 2026-08-25 `footer > .container`
double-gutter fix — but that fix was written inside `@media (max-width: 768px)`,
so it only ever cancelled the mobile half. The ≥769px half was never touched.

**Fixed** by making the footer mirror the header exactly — all gutter on the
inner wrapper, none on the region:

- `main.css`, `printable-checklist.css`, `printable-poster.css`:
  `footer { padding: 2.5rem 1.5rem 1.5rem }` → `2.5rem 0 1.5rem`

## 2. Second half — the mobile gutter, and the variant the fix missed

At ≤768px the header was the outlier, not the footer. Measured at 390px:
**logo 16px, footer title 20px, body copy 20px.** The site gutter on mobile is
20px (m-app.css's general `.container` override is `20px !important`); the header
alone sat at 16px.

- `m-app.css` `header .container`, `printable-checklist.css` `.screen-header nav`,
  `printable-poster.css` `header nav`: 16px → 20px.

That fixed **63 of 68** reps. The remaining 5 are the **second header markup
variant** — `header > nav` with no `.container` wrapper — which the
`header .container` selector cannot reach. `main.css` already documents this exact
trap twice (lines 3007, 3144) for the tablet-band and column-gap rules; it caught
this run's fix too.

- `main.css` `@media (max-width:768px) header > nav`: `var(--spacing-lg)` (16px) → `20px`

**A chrome gutter change must touch both header selectors.** Verifying only the
dominant variant would have shipped 5 reps still 4px off.

## 3. Verification

| check | before | after |
|---|---|---|
| header↔footer gutter delta, 18 widths 320–1440 | −24px @ 769–1159, −4px @ ≤768 | **0px on 68/68 at every width** |
| chrome overhang past viewport | 0 | **0** |
| document scrollWidth overflow | 0 | **0** |
| open-drawer geometry (hamburger clicked) | 2 buckets | **1 bucket**, canary 68/68 |
| sub-44px mobile chrome tap targets | 0 | **0** |
| chrome text <11px | 0 | **0** |
| hover pass — logo / nav link / footer link / footer-bottom link | — | **1 transition each across 68 reps** |
| live render, 6 URLs × 4 widths, post-build | — | **24/24 clean** |

Cache-bust `20260830a` on the four changed sheets — `main.css` (645 refs),
`printable-checklist.css` (88), `printable-poster.css` (1), `m-app.css` (1,
JS-injected from `main.js`). 735 files touched, **0 residual old versions**, and
**0 unversioned references** to any of the four (a page missing the `?v=` would
have silently kept the old sheet).

## 4. Harness note — the markup tripwire needs normalized hashes

Raw `str(element)` hashing reported **13 header / 5 footer** variants against a
baseline of 7/2 — a tripwire trip that looks like a chrome regression. It is not.
Collapsing whitespace and `?v=` before hashing returns exactly **7 header / 2
footer**. The extra 6+3 buckets are minification reflow: identical markup, e.g.
`<a class="nav-logo" href="/">\n<img…` vs `<a class="nav-logo" href="/"><img…`.

**Normalize before hashing, or the tripwire cries wolf every time a page is
reflowed.** Same failure mode as `minified_reflow_fakes_prose_diff`.

Also: yesterday's watch item "`about.html` renders as its destination" is closed —
sampling now excludes all 23 `meta refresh` stubs up front rather than the 17 that
happened to lack chrome, so no rep measures a page other than the one it was
classed by. Confirmed: 0 reps where final URL ≠ requested URL.

## 5. Clean / confirmed not bugs — do not "fix" these next run

- **Colour splits at 5 values are transition jitter, not drift.** The resting
  sweep showed `.nav-links a` in 5 colours and `.nav-logo` in 3 (1px apart:
  `rgb(3,105,161)` / `(3,104,159)` / `(3,105,160)`). Re-probed with
  `transition:none !important` injected: **2 buckets and 1 bucket respectively**.
  Always kill transitions before bucketing colours.
- **`.nav-links a` 40/28 split** — `#075985` on `rgb(243,244,246)` vs `#374151`
  on transparent. `main.js` adds `.active` by pathname. Correct.
- **`header nav` `max-width:1160` (38 reps) vs `none` (30 reps)** — structural, by
  design. Two markup variants: one nests `header > .container > nav` (the
  `.container` carries the rail), the other puts the rail on the nav itself.
  Measured rail geometry is identical.
- **`header nav` `position: relative` (36) vs `static` (32)** at ≤768px — latent,
  not live. The drawer is `position:absolute; top:48px`; where nav is static the
  containing block resolves to `header` (`position:sticky`), which shares nav's
  top edge. Open-drawer geometry measures **identical in both**: one bucket,
  `top:48px`, link `min-height:44px`, height 49px, 0 overhang. Worth knowing it is
  a coincidence, not a guarantee — if `header` ever gains padding the 32 static
  pages drift.
- **`header`/`footer` `margin: 0 -16px` on `pool-safety-rules-printable.html`** —
  deliberate, cancels `body { padding: 0 16px }` for full-bleed chrome. Survives
  this run's change (footer content still lands at 24px, aligned).
- **`header`/`nav` inherited `color`** on `special-needs-swimming.html` (`#13304a`)
  and `pool-safety-rules-printable.html` (`#1b2a4a`) — consumed by nothing.
- **Desktop sub-44px "tap targets"** (nav logo 162×28, nav links ~111×39) — desktop
  is not a touch context and all clear WCAG 2.5.8's 24×24 floor. Mobile is 0-under-44.
- **`special-needs-swimming.html` `.container` is `max-width:1200px`/20px padding**
  vs the sitewide 1160/24. Page-scoped, and its chrome is unaffected — header and
  footer both align. Content column only; left as-is.

## 6. Watch list for the next run

- **`logoLeft − h1Left` is not an alignment probe.** Most h1s sit inside centred
  hero blocks, so it reports −217px/−187px offsets that are pure hero centring.
  Compare **header content vs footer content** (both chrome, both left-aligned),
  or a left-aligned body paragraph. Recorded because it burned ~20 minutes here.
- **1150–1160px nav-vs-content sliver** (carried from 2026-08-29): re-measured this
  run at 1145/1149/1150/1155/1160/1200 with the last-nav-link-vs-nav-content-box
  probe — **0 overflow at every width**, and the header/footer rails now agree at
  all of them. The residual is a `.container` max-width difference on individual
  page sheets, not chrome. Downgrading from "defer" to "closed unless it resurfaces".
- **`footer > .container` padding-0 reset still lives only in the ≤768px block** of
  m-app.css and both printable sheets. It is now correct *because* the footer's own
  side padding is gone, so the reset is redundant rather than load-bearing. If
  anyone restores side padding on `footer`, the ≥769px half breaks again silently.

---

*Workspace cleanup completed per skill requirements.*
