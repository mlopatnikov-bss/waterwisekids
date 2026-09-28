# CSS Regression Report — 2026-09-01

**Shipped:** `40e4fe8` on `live`. Live-verified after the Pages build.
**Sample:** 73 reps over 732 chrome-carrying pages (755 HTML − 23 `meta refresh`
stubs), 4-part partition key → 69 classes. Markup tripwire held at **7 header /
2 footer** variants, matching baseline. Render sweep, not grep: 73 reps × 11
widths (320–1440) resting, plus an open-drawer pass, a hover pass and a
content-rail pass. **0 load errors** across ~1,300 renders.

---

## 1. The find — the mobile breadcrumb design only reached 68 of 478 pages

`m-app.css:211` is the app-shell's breadcrumb treatment: white bar, 0.7rem text,
sitting on the 20px mobile rail. It is keyed on `.page-breadcrumb`.

**410 pages ship the identical bar as an unclassed `<div>` with the desktop
styling hardcoded inline** — `background:#f8fafc; border-bottom:1px solid
#e5e7eb; padding:10px 24px; font-size:0.85rem` — which no class selector can
reach. Measured at 390px, directly under the sticky header:

| | class variant (68 pages) | inline variant (410 pages) |
|---|---|---|
| side gutter | **20px** (site rail) | **24px** |
| background | **#fff** | **#f8fafc** grey band |
| font-size | **11px** | **11.9px** |
| text left vs chrome rail | **0px** | **+4px** |

So every phone user on 410 pages saw a grey band whose trail started 4px right of
the logo above it and the body copy below it, while 68 pages showed the intended
compact white bar. Not a 4px nit — two different breadcrumb designs live at once.

**Why no earlier sweep caught it.** The bar is a `<div>` with no class and no
`aria-label`, so it is invisible to every selector the design system uses, and
invisible to any grep for breadcrumb class names. It only shows up if you measure
the rendered rail. The 2026-08-31 pass *had already identified* this as the
site's fourth breadcrumb markup variant — but added it to exactly one rule (the
`min-width:44px` tap-target rule near the end of `m-app.css`) and not to the
container rule, so the links got fixed and the container never did. **Registering
a markup variant in one rule of a six-rule family is the failure mode.**

**Fixed** in `m-app.css` by adding `div[style*="padding: 10px 24px"]` alongside
`.page-breadcrumb`. `!important` in an author sheet outranks a non-important
inline declaration, so all three properties are corrected without editing 410
HTML files. The substring matches **exactly 410 divs sitewide and zero
non-breadcrumb elements** (verified by parse, not by eye). Deliberately *not*
qualified with `[style*="0.85rem"]` the way the 08-31 rule is — 5 of the 410
carry no `font-size` and that qualifier silently drops them.

### 1a. The fix's own first draft shipped the bar under the text floor

First render after the container fix: **9.8px**, not 11px. `0.7rem` against this
sheet's 14px mobile root is 9.8px; the class variant clears the floor only
because `.page-breadcrumb` is *also* named in the separate 11px floor rule at
`m-app.css:1118`. Adding a variant to the styling rule and not to the floor rule
ships it below the floor. Caught by re-rendering before pushing, not after.

## 2. Second find — the 08-30 printable fix moved the chrome and left the body

The 2026-08-30 pass moved `printable-checklist.css`'s **chrome** rail to the 20px
mobile value (`.screen-header nav`, `footer`). That sheet's own screen-only body
bands were never carried along:

- `.print-toolbar` — `padding: 0 24px`
- `.checklist-page` — `padding: 0 24px 60px`
- `.screen-cta` — `padding: 0 24px`

None has a `@media (max-width:768px)` override. Result on all **90 checklist
printables** at 390px: the "← Back to full guide" toolbar, the checklist card and
the CTA all sat 4px inboard of the nav logo above them and the footer below them.

main.css pages get this for free from `m-app.css`'s `.container{padding:0 20px
!important}`. Printables never load it, so **a chrome-rail change in a standalone
sheet has to carry that sheet's content bands with it.** Mirrored into the ≤768px
block.

## 3. Third find — `.hub-section`, 5 pages

Defined only in the per-page `<style>` of the 5 hub pages
(`beginner-swim-lessons`, `toddler-swim-lessons`, `kids-swim-lessons`,
`statistics`, `statistics/state-of-drowning-prevention`) as `padding: 40px 24px`,
with no mobile override anywhere. Every other full-bleed band on those pages
drops to 20px via `.container`; these stayed at 24px. Fixed in `m-app.css`
(injected after the page `<style>`, and `!important`, so it wins either way).

## 4. Verification

73 reps × 6 widths (320/390/768/769/1024/1280), before vs after:

| check | result |
|---|---|
| computed-style property changes on any chrome element | **0** at every width |
| horizontal geometry change | **only** printable `h1`, 33 reps, exactly −4px x / +8px w at 320/390/768 |
| any horizontal change at 769 / 1024 / 1280 | **0** |
| full-bleed band text vs chrome rail @390, delta=4px | **53 → 2** (the 2 left are `.tldr-box` card padding, correct) |
| full-bleed band distribution @1280 | **byte-identical before/after** |
| document overflow / chrome overhang | 0 / 0 |
| sub-44px visible chrome tap targets | 0 |
| sub-11px visible chrome text | 0 |
| open-drawer pass (hamburger clicked, 73/73) | link count rises on 73/73, panel `UL.nav-links` at x=20 w=350, **1 geometry bucket**, 0 overflow |
| hover pass — logo / footer link / footer-bottom link | 1 transition each across 73 reps |
| render errors | **0 / ~1,300** |
| live render post-build, 6 URLs × 2 widths | breadcrumb 20px/#fff/11px on both variants @390; unchanged 24px/grey @1280; toolbar 20px; header rail == footer rail; 0 overflow |

Cache-bust `20260901a` on `main.js` (738 refs — it is the outer asset that
injects `m-app.css`, so bumping `m-app.css` alone would have been inert) and
`printable-checklist.css` (90 refs). **0 residual old versions, 0 unversioned
references.** `main.css` unchanged, left at `20260830a`. Sitemap `lastmod`
deliberately untouched: the 738 HTML edits are cache-bust query strings only, not
payload.

## 5. Clean / confirmed not bugs — do not "fix" these next run

- **Header↔footer gutter is 0px on 73/73 at all 11 widths.** The 08-30 fix holds.
- **A leftmost-*element* inset probe fakes a 20px mobile gutter mismatch.** My
  first metric took the leftmost element with any `textContent`, which catches the
  padded `.container` box itself (x=0) in the header but the margin-centred one
  (x=20) in the footer. Measure the leftmost **leaf** text node or `<img>`, never
  an ancestor box, or 73/73 reps report a phantom 20px delta at ≤768px.
- **Desktop breadcrumb text sits 6px inboard of the chrome rail (90 vs 84).**
  Both variants. `.breadcrumb-inner` is `max-width:1100px` against chrome's
  1160px — deliberate per the 2026-08-25 comment, which aligned the trail to the
  **content column and the H1 below it**, not to the nav. Left alone.
- **`navLink` `min-height` splits 34/39 at 390px** — every one of those links is
  `display:none` at that width (the drawer replaces the row). Latent, not live.
  Check `_vis` before bucketing, or the drawer's real geometry is masked.
- **`navLink` shows no hover transition on 43 of 73 reps** — those are the pages
  where `main.js` has applied `.active`, so resting already equals hover. Correct.
- **`.page-hero` at 24px in the resting desktop bucket** — it has a mobile
  override to 20px and measured 0 delta at 390. Only bands with *no* mobile
  override were in scope.
- **Printable `body` line-height 1.5 vs 1.6, and `btn` padding 0 vs 8px** — the 33
  printable reps. Their sheets are standalone by design; these are page-body
  values, not shared chrome. Not touched.
- **`special-needs-swimming.html` and `education/pool-safety-rules-printable.html`**
  each carry a page-level `body{color}` that shows up in the `header`/`footer`
  computed colour. Inherited only; every chrome text node sets its own colour, so
  nothing renders differently. The latter's `header/footer {margin:0 -16px}` is
  the documented deliberate full-bleed cancel.

## 6. Open / watch

- **The two breadcrumb variants still differ by one background value at desktop**
  — inline `#f8fafc` vs class `var(--gray-50)` = `#f9fafb`. One step of grey,
  above the fold on 410 pages. Not fixed blind because it needs a call on which
  value is canonical.
- **`education/pool-safety-rules-printable.html` body rail is 16px vs a 20px
  chrome rail** (`.screen-wrapper` inherits `body{padding:0 16px}` while the nav
  re-adds 20px). One page, one sheet (`printable-poster.css`, 1 live reference).
  Same shape as §2; deferred only because the page's chrome deliberately uses
  `margin:0 -16px` and the fix needs both numbers moved together.
- **The `div[style*=…]` selector is now load-bearing in two places** in
  `m-app.css`. It is precise today (410/410, 0 collateral) but it is keyed on an
  inline string. If page generation ever changes that breadcrumb's inline
  `padding` value, both rules go silently inert. The durable fix is to give the
  bar a class in the generator; that was not done here because it would rewrite
  410 HTML files for a non-content change and muddy `lastmod` classification.
