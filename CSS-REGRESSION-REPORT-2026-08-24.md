# CSS Regression Report — 2026-08-24

**Method:** headless Chromium render sweep served over HTTP — not grep. Three passes:

1. **Static computed-style sweep** — 23 template representatives (one per
   stylesheet-fingerprint group, 16 groups + extra coverage of the five largest)
   × 1280 / 390 / 320px, capturing computed styles + `getBoundingClientRect` for
   `html`, `body`, `header`, `nav`, `.nav-logo`, the first *visible* non-logo nav
   link, `.nav-links`, the nav container, `footer`, `.footer-content`,
   `.footer-links`, `.footer-bottom`, the footer container and the first footer
   link — plus tap-target sizes, sub-11px chrome text and horizontal overflow.
2. **Every page carrying a `<style>` block** (142 files) at 1280 / 390 — the leak
   surface for page-scoped CSS overriding shared chrome.
3. **Interactive + state pass** — hamburger clicked open on 8 contained-nav and
   8 bare-nav pages at 390 and 320, and `:rest` / `:hover` / `:focus-visible`
   computed styles captured for the logo, nav link, footer link and hamburger on
   all 23 representatives at both 1280 and 390.

Baseline: `live` @ `56aaa664`. **1 defect class fixed (83 pages).**

---

## Inventory

739 HTML files, **16 stylesheet-fingerprint groups** (up from 13 / 735 on 8/22 —
three new single-page hub sheets, no new drift). The 13 files carrying no
stylesheet are all `<meta http-equiv="refresh">` redirect stubs, verified
individually and correctly excluded.

Header markup splits 580 contained (`<header><div class="container"><nav>`) /
146 bare (`<header><nav>`) / 13 stubs.

---

## Fixed and deployed — the logo was inert on hover across all 83 printables

`main.css` ships `.nav-logo:hover { color: var(--blue-700) }` (#075985 → #0369a1).
**Neither standalone printable sheet ever mirrored it.** Printables load no
`main.css`, so on all 82 checklist printables and the 1 poster the wordmark
simply did not respond to hover, while all 656 other pages darkened.

| `.nav-logo` @1280 | 656 main.css pages | 83 printables (before) | after |
|---|---|---|---|
| rest | `rgb(7,89,133)` | `rgb(7,89,133)` | `rgb(7,89,133)` |
| **hover** | `rgb(3,105,161)` | **`rgb(7,89,133)` — no change** | `rgb(3,105,161)` |

This is only visible in a **state** pass. Every previous sweep captured resting
computed styles, where the two sheets agree exactly — which is why this survived
six prior clean reports.

Same commit, same root cause: `.hamburger` carries `color: var(--gray-700)` in
`main.css` but **no `color` at all** in either printable sheet, so the button
computed `rgb(0,0,0)` there. Currently masked — `.hamburger span` sets its bar
colour explicitly — but `outline-color` and every future `currentColor`
reference inside that button resolved to black. Declared explicitly in both
sheets.

Another instance of the standing *standalone-stylesheet-drift* class: a fix or
rule added to `main.css` has to be mirrored into **both** printable sheets or it
silently applies to 89% of the site only.

**Files changed:** `assets/css/printable-checklist.css`,
`assets/css/printable-poster.css`, + 83 HTML files cache-busted to
`?v=20260824a` (only the two changed sheets bumped).

**Verification:** post-fix re-render collapses `logo_hover` from 2 buckets to
**1 bucket / 23 templates**, and `.hamburger` colour from 2 buckets to 1.
Full 23 × 3-viewport sweep re-run diffed against the pre-fix capture:
**0 changed keys — zero unintended deltas.**

---

## Clean — measured, not assumed

- **Open mobile drawer geometry.** The 8/22 bare-nav fix holds. Contained and
  bare nav now produce byte-identical panels: `x=16 w=358` @390 and `x=16 w=288`
  @320 on all 16 sampled pages, both classes. No open-state overflow.
- **Tap targets.** 0 nav or footer controls under 44×44px at 390 or 320, in
  either the closed or the open drawer state. Hamburger is 44×44 on all 23.
- **Text floor.** 0 elements under 11px anywhere in header or footer, any viewport.
- **Root font scaling.** 16px @1280, 14px @390, 14px @320 — uniform across all
  23 templates including printables. The 8/18 printable-scaling fix holds.
- **Overflow.** `scrollWidth - clientWidth == 0` on every template at every
  viewport, closed and open.
- **Body font.** `Inter, system-ui, -apple-system, sans-serif` on 23/23.
- **Rogue inline CSS.** 2,095 `style=` attributes inside header/nav/footer, all
  three distinct values, all benign icon sizing (`width:28px;height:28px;
  vertical-align:middle`) or `text-align:center`. None touch colour, font or
  spacing.
- **Page `<style>` blocks vs shared chrome.** Only 3 selectors sitewide reach
  `header`/`footer`/`.container`, and all 3 are either `@media print`
  (`tools/family-water-safety-plan.html`) or descendant-scoped
  (`.fwsp-hero .container`). Yesterday's `p, li` → `main p, main li` scoping on
  the two `british-swim-school/` pages is confirmed holding — both sit in the
  majority bucket for every chrome region.
- **Focus indicators.** `1px auto rgb(16,16,16)` on logo, nav link, footer link
  and hamburger — identical on 23/23 at the breakpoint where each is focusable.

---

## Watch — flagged, not changed

**`special-needs-swimming.html`** is the one page whose page-scoped sheet
declares a **bare `html, body` rule**:

```css
html, body { color: #13304a; background: #f4f8fb; }
```

against the sitewide `body { color: var(--gray-800); background: var(--white) }`.
Same specificity, later source order wins. Two consequences, both currently
cosmetic:

- `color` leaks into `header`, `nav` and their containers (computed
  `rgb(19,48,74)` vs `rgb(31,41,55)` sitewide). **No visible text is affected** —
  every chrome text node carries an explicit colour, verified element-by-element
  at 1280 and 390. It is a latent trap, not a live defect: the first unclassed
  text node added to the header or footer renders off-brand on this page only.
- At ≤768px `m-app.css` repaints `body` white but `html` keeps `#f4f8fb`, so the
  page is the only one on the site with mismatched `html`/`body` backgrounds.

Not changed because scoping the rule would alter the page's intended tint —
that's a design call, not a regression fix.

---

## Method note — two false-positive classes retired this run

- **Transition-in-flight faked a colour inconsistency.** The 142-page pass with
  a 180 ms settle reported footer links splitting `rgb(3,105,161)` vs
  `rgb(4,105,161)`, and hover splitting three ways between `#bae6fd` and `#fff`.
  No such value exists anywhere in the CSS — `grep -ri 0469a1` returns zero
  files. Every off value lies **between** the rest colour and the hover target:
  the probe was sampling mid-transition. Re-probed at 700 ms, all collapse to one
  bucket, and the same pages flip in *both* directions between two runs.
  **Any colour probe on an element with a `transition` must out-wait the
  transition, and a one-unit channel delta is jitter until proven otherwise.**
- **`isFocused: false` is not "no focus ring."** `element.focus()` silently
  no-ops on a `display:none` element, so probing the hamburger at 1280 returns
  the resting style and looks like a missing focus indicator. Assert
  `document.activeElement === el` and `el.matches(':focus-visible')` before
  reading, and probe each control at the viewport where it is actually rendered.
