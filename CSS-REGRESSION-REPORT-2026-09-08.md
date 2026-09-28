# CSS Regression Report — 2026-09-08

**Method:** headless Chromium render sweep of a fresh clone of `live` (`e4a0df2`), served over
HTTP. 22 template representatives (one per stylesheet fingerprint, 12 groups) at
320 / 390 / 900 / 1100 / 1280 / 1440, plus a full-corpus pass over all **746 non-stub pages**
at 390 and 320. Transitions killed before bucketing (canary `transitionDuration == 0s`),
`isMobile:false, hasTouch:true` so horizontal overflow is measurable, Google Fonts fulfilled
with an empty body rather than aborted. Colours bucketed at desktop so `m-app.css`'s
`!important` block can't mask drift.

**Result: 2 defects found, both fixed and pushed (`d05a85a`).** Everything else clean.

---

## Fixed

### 1. `/about/` — `.what-we-offer` sat inside a double rail (mobile)

`<main>` on `/about/` supplies the page gutter itself (`padding: 3rem 24px`, `2rem 20px` under
768). `m-app.css` then adds `.what-we-offer, .featured-articles, .about-snippet { padding: 20px
!important }`. On `/about/` those stack: the "What We Offer" card row rendered at **x=40** while
every sibling `.section` card on the same page sat at x=20 and the footer rail is 20 — a 20px
step with no visual reason, since the section has no card treatment (square corners, no shadow,
white on white).

Fixed with a page-scoped child selector that cancels only the horizontal half:

```css
main > .what-we-offer { padding-left: 0 !important; padding-right: 0 !important; }
```

`(0,1,1)` out-specifies m-app's `(0,1,0) !important`. The shared m-app rule is **correct** for
the homepage, where `.featured-articles` / `.about-snippet` sit in an unpadded `<main>` and that
20px *is* the rail — so it was left alone. Desktop is untouched (the m-app rule is inside
`@media (max-width: 768px)`); verified unchanged at 900/1100/1280/1440.

### 2. Fifteen inline `padding:0 1rem` blocks nested inside a parent that already railed them

Twenty-nine elements sitewide carry an inline `style="max-width:…;margin:… auto;padding:0 1rem"`.
Measuring each one against its own page's footer rail split them cleanly in two:

| | parent padding | box x | text x | verdict |
|---|---|---|---|---|
| 14 blocks (checklist printables) | 0 | 0 | **20** | the inline padding *is* the rail — left alone |
| 15 blocks / 13 pages | 20–21px | 20/21 | **34–35** | nested gutter — removed |

The 15: `/education/pool-drain-safety.html`, `/education/vet-swim-instructor-safety-checklist.html`,
`/education/water-safety-during-pregnancy.html`, `/education/pool-safety-rules-printable.html`,
the 8 directory state pages (`new-mexico`, `north-dakota`, `rhode-island`, `south-dakota`,
`vermont`, `washington-dc`, `west-virginia`, `wyoming`), and 3 blocks on `/swim-lessons/`.

Their prose ran 14–16px inside its own sibling content at **every** viewport, not just mobile.
Removing the inline padding left each box's geometry identical (same x, same width) and moved
only the text onto the box edge.

**Before → after, all six viewports:** 80 deltas, every one of them the intended
`textX → boxX` move; **0 unintended deltas** across 6 control pages.

---

## Verified clean (no action)

| Check | Result |
|---|---|
| Header markup variants | **5** — matches baseline, no new divergent chrome |
| Footer markup variants | **2** — matches baseline |
| Horizontal overflow | 0 / 746 at 390 and 320 |
| Footer rail (leftmost visible text) | **20px on 746 / 746** |
| Nav/footer tap targets | 0 under the AA 24px house floor |
| Header/footer text size | 0 instances under 11px |
| Header background | `rgba(255,255,255,0.97)` on 746 / 746 |
| Footer background | `rgb(255,255,255)` on 746 / 746 |
| Body font-family | `Inter, system-ui, -apple-system, sans-serif` on 746 / 746 |
| Root font-size scaling | 16px ≥769, 14px ≤768 — uniform, printables included |
| Footer link styles | **1 bucket** across all 22 templates, rest *and* hover |
| Nav link styles | 1 vocabulary; the 5 buckets differ only in *which* link carries `.active` |
| m-app drawer (hamburger clicked) | `aria-expanded` false→true on all 22; identical geometry (x=20, w=350, min link height 49px) |
| Page `<style>` blocks touching shared chrome | 3 pages — all inside `@media print`, no screen leak |
| Console page errors | 0 |

### Ruled out as probe artefacts — do not "fix" next run

- **Printables' footer rail reads 0** if you measure `footer .container` — those pages have no
  `.container` in the footer. Measured by leftmost visible text, all three sit at 84/24/20 like
  everything else.
- **99 printables show main text at x=41** vs a 20px footer rail. That is the checklist card's
  own inner padding; the whole 97-page family renders identically, so the family is the spec.
- **Blue nav link on `/education/`, `/swimmers-hub/`, directory pages** is `main.js` adding
  `.active` by pathname — working as designed.
- **Nav `padding: 0 24px` on the 3 printables** is the printable sheets railing the nav directly,
  since those headers have no `.container`.

### Noted, not changed

- Nav and footer links have no house focus ring — they fall back to the UA default outline
  (`1px auto`). Uniform sitewide, so not a regression, but worth a deliberate decision.
- `/sessions` disk is at 100%. The render harness was built entirely under `/tmp` (`TMPDIR=/tmp`)
  to avoid Chromium crashing on a full user-data-dir.
