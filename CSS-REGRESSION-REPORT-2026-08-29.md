# CSS Regression Report — 2026-08-29

**Scope:** 749 HTML pages, 69 stylesheet/markup equivalence classes, 73 template
representatives × 3 viewports (1280 / 390 / 320) + a 16-width band pass
(320 → 1920) + an open-drawer mobile pass.
**Clone:** fresh `live` @ `f387109`. **Shipped:** `025ba40`, live-verified.

---

## 1. Regression found and fixed — desktop nav row 16px too wide for its own rail

**Every page on the site, at every viewport width ≥ 1150px, permanently.**

The header nav is a single non-wrapping flex row. It needs:

```
180px (.nav-logo)  +  16px (nav gap)  +  932px (.nav-links)  =  1128px
```

…inside a content box that is a constant **1112px** — `.container` and
`header > nav` are both `max-width: 1160px` with a 24px gutter. `.nav-links` is
`flex-shrink: 1`, but every link is `white-space: nowrap`, so it cannot actually
shrink. The UL overhung the nav's right edge by exactly the 16px gap.

Measured — last nav link's right edge vs. the page content column's right edge:

| viewport | last link right | page content right | overhang |
|---|---|---|---|
| 1150px | 1152 | 1126 | **26px** |
| 1280px | 1212 | 1196 | **16px** |
| 1440px | 1292 | 1276 | **16px** |
| 1920px | 1532 | 1516 | **16px** |

It does not decay with width: `.container` caps at 1160px, so the nav's content
box stays 1112px forever. Visible consequence: **"Contact" sat 16px past the
right edge of the article column below it** — the header rail never lined up
with the page grid. Present on **both** header markup variants (644 `.container`-
wrapped pages and the 88 that omit the wrapper).

### Why eight prior sweeps missed it

`body { overflow-x: hidden }`, and the row still fits inside the *window* — so
document `scrollWidth` reads clean at every desktop width. The 2026-08-27/28
tablet-band work measured exactly that signal and wrote the conclusion into
`main.css`: *"vw >= 1150 -> no overflow."* True of the document; false of the nav.

Worse, the 2026-08-28 report filed the two header variants under **"Confirmed NOT
bugs — do not fix these next run"**, on the reasoning that the rendered content
box is *"identical: 84→1196 desktop."* That compared where the nav content
**starts**. It never asked whether the content **fits**. The 1112px variant is
16px short of its own contents; the 1160px variant is not.

Caught this run by adding two probes: `nav.scrollWidth - nav.clientWidth`, and
the last link's right edge measured against the nav's own **content box** rather
than against the window.

### Fix

```css
/* main.css + both printable sheets */
.nav-links > li > a { padding: 8px 12px; }   /* was 14px: 2px × 8 links = 16px */

/* main.css, scoped */
@media (min-width: 1150px) { header nav { column-gap: 0; } }
```

`justify-content: space-between` already separates the logo from the links at
desktop, so the 16px `gap` is redundant there and only ever bites when there is
no free space — which is precisely this case. Zeroing it alone yields an exact
1112px fit with **zero slack**, so the padding trim is what supplies the 16px of
headroom. Row now lands at **1096px, 16px inside the rail.**

Scoped to `min-width: 1150px` so the 769–1149px band rules and the ≤768px drawer
(where the gap *does* separate logo from hamburger, and a wrapped drawer relies
on `row-gap`) are untouched. Descendant selector `header nav`, not `header > nav`
— the dominant variant nests as `header > div.container > nav` and the child
combinator silently matches nothing there.

Padding mirrored into `printable-checklist.css` and `printable-poster.css`. Those
pages were **not** overhanging (printable `nav` ships no flex `gap`, so their row
was an exact 1112px fit) but they sat at **zero slack** — one font-metric change
from the same defect. Both now carry 16px of headroom and the same number.

---

## 2. Verification

| check | result |
|---|---|
| Full 219-probe re-sweep (73 reps × 3 vp), before vs. after | **only the 2 intended declarations changed** |
| `navOverflow` on the 34 affected reps | **16px → 0** |
| `navRightMax` on 40 reps | **1212 → 1196** (flush with page content) |
| Band pass, 10 reps × 16 widths (320 → 1920) | **0 overhang, 0 doc overflow, 0 nav overflow, 0 window overflow** |
| Open-drawer mobile pass, 73 reps | 1 bucket (`12px 0px` / `min-height:44px`), **canary 73/73 `aria-expanded` flipped** |
| Open-drawer re-check post-fix, 8 reps | **unchanged**, canary 8/8 |
| Sub-44px visible chrome tap targets @ 390 / 320 | **0** |
| Sub-11px chrome text, all viewports | **0** |
| Live render after Pages build, 6 URLs × 3 widths | **18/18 overhang 0** |

Cache-bust `20260828d → 20260829a` on the three changed sheets: `main.css` (644
refs), `printable-checklist.css` (87), `printable-poster.css` (1). 732 files
touched, **0 residual old versions** on those three. The 443 remaining
`?v=20260828d` refs are the nine page-specific sheets, correctly left alone.

---

## 3. Harness defect found and fixed — `html5lib` silently halved the sample

The sample partition groups pages on a four-part key: stylesheet set, header
markup hash, footer markup hash, **inline `<style>` hash**. Built with `html5lib`,
it produced **17 classes / 22 reps**. Yesterday's run produced 67 classes / 71 reps.

Cause: **`html5lib` returns empty text for `<style>` elements**, exactly as it
already does for `<script>`. `index.html` carries a 15,871-character inline
`<style>` block; `html5lib` reports its text length as **0**. The style component
of the key was therefore a constant, collapsing 56 distinct inline-style
signatures into one and dropping ~75% of the sample — with no error and no
warning. The sweep would have reported "clean" over a quarter of the coverage.

Fixed by extracting `<style>` bodies from source with a regex rather than from
the parse tree. Restored: **69 classes → 73 reps**, header and footer markup
variants covered by construction (7/7 and 2/2 asserted).

**Markup tripwire holds at baseline:** 732 pages carrying chrome, **7 header
variants** (513 / 87 / 68 / 61 / 1 / 1 / 1), **2 footer variants** (644 / 88),
**hamburger on 732/732**. 17 chrome-less redirect stubs (was 13 — page count rose
747 → 749).

---

## 4. Clean / confirmed not bugs — do not "fix" these next run

- **Open drawer is uniform across all 73 reps.** One bucket: `padding: 12px 0`,
  `min-height: 44px`, measured height 49px, 0 overflow. The *closed*-state
  probe shows main.css pages at `8px 14px` / `min-height: 0` vs. printables at
  `11.9px 0` / `44px` — that is a probe artifact, not drift: main.css gates its
  drawer sizing on `nav.mobile-open`, printables apply theirs unconditionally.
  **Always click the hamburger before reading mobile nav-link geometry.**
- **`header` / `footer` `margin: 0 -16px` on `pool-safety-rules-printable.html`.**
  Documented and deliberate in `printable-poster.css` — cancels
  `body { padding: 0 16px }` so the shared chrome is full-bleed. 0 overhang.
- **`article.css` `.footer-links { flex-direction: column }`** on 8 education
  reps at ≤768px. Measured `display: none` on all 73 — `m-app.css` hides it with
  `!important` at the same breakpoint. Latent, not live.
- **`.nav-links a` blue/grey split** (42 vs 31 reps) — `main.js` adds `.active`
  by pathname.
- **`.hamburger` padding 8px vs 0px, `.hamburger span` `inline` vs `block`,
  `.footer-bottom` flex properties** on the printable reps — all measured at
  desktop on a `display: none` parent, or overridden to `block` downstream.
- **`header` / `nav` `color`** on `special-needs-swimming.html` (`#13304a`) and
  `pool-safety-rules-printable.html` (`#1b2a4a`) — inherited, consumed by nothing.
- **Desktop `.nav-logo` 162×28** — above the WCAG 2.5.8 AA 24×24 floor; desktop
  is not a touch context. Mobile is 0-under-44.

---

## 5. Watch list for the next run

- **24px nav-vs-content misalignment in the 1150–1160px sliver.** At exactly
  1150px the nav rail is 1126px wide while the page body container is 1102px —
  `main.css`'s `@media` `.container` padding step and the nav's `max-width: 1160`
  disagree across a 10px-wide band. Pre-existing and **improved** by this run
  (50px → 24px). Narrow enough to defer; measure the exact bounds before touching
  it, and re-check that the fix does not reopen §1.
- **`about.html` is a redirect stub that renders as its destination.** It was
  classed into the sample by its 2,879-byte stub markup but Playwright followed
  the redirect and measured `/about/` instead. 1 of 73 reps. Harmless here, but
  the rep silently measures a different page than the one it was classed by —
  either resolve stubs before sampling or exclude them.

---

*Workspace cleanup completed per skill requirements.*
