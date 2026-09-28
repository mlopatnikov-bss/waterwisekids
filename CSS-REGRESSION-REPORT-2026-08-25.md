# CSS Regression Report — 2026-08-25

**Method:** headless Chromium render sweep (not grep). Fresh `--depth 1 -b live` clone
at `670de86`, served over HTTP, 33 representative pages (one per
stylesheet-fingerprint × inline-`<style>` × section group, covering all 728 pages
that carry header/footer chrome) × 1280 / 390 / 320 px. Computed styles + bounding
rects captured for `header`, `nav`, `.nav-logo`, nav links, `footer`, footer links,
plus overflow, sub-11px text, tap targets, and rogue inline CSS.

**Shipped:** `8168b54` → `live`, verified byte-identical on the CDN.

---

## Regressions found and fixed

All four were the same underlying defect class: **the shared footer renders
differently on the 84 printable pages than on the 644 `main.css` pages**, because
printables load no `main.css` and their standalone sheets mirror its footer rules
approximately rather than exactly ([[standalone_stylesheet_drift]]).

### 1. Printable footer column was 12px narrower and 6px off-centre
`printable-checklist.css` / `printable-poster.css` styled the footer's inner
wrapper as `footer > div { max-width: 1100px; margin: 0 auto; }`. Every `main.css`
page wraps the *identical* footer markup in `.container`
(`max-width: 1160px; padding: 0 24px`).

| | before | after |
|---|---|---|
| desktop footer content box | printables `x=90 w=1100` vs site `x=84 w=1112` | `x=84 w=1112` everywhere |

Mirrored `.container` exactly, and zeroed the gutter below 768px where `footer`
already carries m-app's own 20px.

### 2. Mobile footer double-gutter on 644 pages
`m-app.css` (JS-injected on mobile) sets a general
`.container { padding-left/right: 20px !important }`. The mobile footer rule above
it already sets `footer { padding: 20px !important }`. On the 644 `.container`-wrapped
pages those **stacked**, insetting the footer column to 40px per side; the 84
printables — whose footer wrapper carries no `.container` class — sat at 20px.

Added `footer > .container { padding-left: 0 !important; padding-right: 0 !important }`.
Mobile footer content is now 20px inset and 350px wide on every template (was 40px /
310px on 644 pages), which also stops the copyright line wrapping differently by
template.

### 3. 16px of dead space under every footer
`footer .footer-bottom p` is the last node in the footer and inherited the generic
`p { margin-bottom: 1rem }`. Footer measured **292px** on `main.css` pages vs **275px**
on printables (whose sheets set no generic `p` margin). Zeroed it — unifies the two
*and* removes the gap rather than propagating it.

### 4. Footer logo 24×24 instead of 28×28 on 84 pages
Inline `style="width:24px;height:24px"` on the footer `<img>` in every printable,
against `28px` sitewide. Inline styles beat any stylesheet, so this had to be fixed
in the HTML. Corrected on all 84.

Cache-bust `v=20260825a` applied to all four sheets across 729 files.

---

## Verification

Re-rendered a **35-page sample spanning all 7 header markup variants** at all three
viewports. The footer is now pixel-identical on every template:

| viewport | footer height | inner wrapper (x, w) | title (x, w) | logo |
|---|---|---|---|---|
| 1280 | 276 | 60, 1160 | 84, 1112 | 28×28 |
| 390 | 280 | 20, 350 | 20, 350 | 28×28 |
| 320 | 301 | 20, 280 | 20, 280 | 28×28 |

Before the fix these split into two buckets at every viewport (292/275, 295/279,
317/299). Also asserted post-fix: **0** horizontal overflow, **0** header/footer text
under 11px, **0** nav/footer tap targets under 44px, and no unintended deltas outside
the footer.

---

## Checked and confirmed NOT bugs — do not "fix" these next run

- **`nav` outer box differs on 148 pages** (`x=60 w=1160` vs `x=84 w=1112`). These
  pages omit the `<header><div class="container">` wrapper; `main.css` compensates
  with a documented `header > nav { max-width: 1160px; padding: 0 var(--spacing-xl) }`
  rule. The rendered **content box is identical** at 1280/390/320 — the padding
  exactly absorbs the wider outer box. Working as designed.
- **`header` / `nav` `color` drift on 2 pages** — `special-needs-swimming.html`
  (`#13304a`) and `education/pool-safety-rules-printable.html` (`#1b2a4a`) set a
  page-level body colour that header/nav inherit. Invisible: the only properties
  that consume it are `border-*-color`, and every one of those borders has
  `border-width: 0`. All visible header/footer text sets its own colour (nav links,
  logo, footer links all resolve to a single bucket sitewide).
- **`footer { margin-top: 40px }` on the poster printable** — deliberate, compensates
  the poster's `body { padding: 0 16px }` with `margin: 40px -16px 0`.
- **`footer .footer-bottom { justify-content: space-between }` vs `normal`** — inert;
  `footer .footer-bottom` sets `display: block`, so `justify-content` never applies.
- **Bare `body { background: white }` in 3 page `<style>` blocks** — benign print
  setup, does not reach shared chrome. (My first-pass selector scan also reported
  bare `header`/`footer` rules on those pages; those were false positives from
  multi-line `@media print { header, footer { display: none } }` selectors.)

## Deliberate no-fix

The footer markup still has **2 variants** (644 pages use
`<div class="container" style="text-align: center;">`, 84 printables use a bare
`<div>`). Now that `footer > div` mirrors `.container` exactly, the two render
identically, and `.container` is undefined in the printable sheets — so adding the
class to 84 files would be inert churn. Left as-is. **The variant count is a useful
tripwire: header should stay at 7 variants and footer at 2. A change in either
number means new markup drift.**
