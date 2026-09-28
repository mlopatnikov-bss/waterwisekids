# Visual Design Report — 2026-08-28

**Method:** headless Chromium (aarch64), served over HTTP from a clean `/tmp` clone of
`origin/live`. Emoji font installed before any capture. 747 HTML files partitioned on the
four-part equivalence key *(stylesheet set × header markup hash × footer markup hash ×
inline `<style>` hash × body class)* → **75 classes → 79 representatives**, rendered at
**1280px and 390px** (158 page-renders, 0 errors), plus a focused 93-page pass over the
printable cohort.

**Probes run this session — five new axes, none of which any prior run had measured:**

| axis | what it measured | result |
|---|---|---|
| **Typography census** | computed `font-family` / `size` / `weight` / `line-height` on 9,153 elements | **2 defects** |
| **Colour palette census** | every computed `color` / `background` / `border` on 41,715 elements, clustered for near-duplicates | 1 hygiene note |
| **Left-edge alignment** | block children of the main container vs. the modal left edge, 110 pages | clean |
| **Icon / emoji rendering** | 2,712 glyph-bearing leaf nodes, width-to-font-size ratio | clean |
| **Vertical spacing rhythm** | sibling gaps, plus gap variance for each `(prev,next)` pair type across pages | clean |

Baseline: `live` @ `58955c7`. Shipped as `966dbf0`. **3 defects fixed, 102 page-instances.
Deploy verified live.**

---

## The theme: a role rendered three ways, and nobody looked at the last 500 bytes

All three defects are the same underlying failure — **a component with more than one
markup variant, where only the dominant variant was ever styled.** Every previous audit
sampled by *page*, which is why they never fired: each variant is a minority of a cohort
that otherwise passes.

Grouping by *role* instead of by page is what surfaced them.

---

## Fixed #1 — 16 printables rendered a second "Related Articles" block **below the footer**

The census of unclassed `<h2>` elements on printable pages returned four distinct sizes
for one role:

| parent markup | rendered h2 | instances | text |
|---|---|---|---|
| `section.related-articles` | **20.8px** | 85 | "Keep Reading" |
| `section.screen-only` | 20.8px | 16 | "Related Reading" |
| bare `<section>` | **19.2px** | 16 | "Related Articles" |
| bare `<div>` | **17.6px** | 15 | "Related Water Safety Guides" |

The 19.2px variant turned out not to be a styling problem at all. Those 16 pages place the
entire section **after `</footer>`**:

```html
  </footer>
  <script src="/assets/js/main.js?v=…"></script>

<section style="max-width:800px;margin:2rem auto;padding:0 1rem;">
  <h2 style="font-size:1.2rem;…">Related Articles</h2>
```

Measured geometry on `rip-current-safety-checklist-printable.html` (footer bottom = 3820px):

| element | top | below footer? |
|---|---|---|
| `section.screen-only` — "Related Reading" | 2998 | no |
| `section.related-articles` — "Keep Reading" | 3318 | no |
| `footer` | 3545 | — |
| **bare `section` — "Related Articles"** | **3852** | **yes** |

So the reader scrolled past three related-links blocks, hit the dark site footer with the
copyright line, and then found a fourth block of links — unstyled, no card background,
smaller heading — hanging underneath it. The page visibly ended twice.

Every one of the 16 already carried 1–3 properly-styled related blocks above the footer,
so the orphan was structurally redundant, but it held **19 links that appeared nowhere
else on those pages**. Deleting it outright would have thrown those away.

**Fix:** for each page, merge the orphan's unique links into that page's canonical
related `<ul>` (all 16 share the same `list-style:none;display:grid` shape, so the
`<li><a>` form is identical), then delete the orphan section.

| page | unique links merged |
|---|---|
| vacation-water-safety-checklist | 5 |
| pool-party-host-safety-checklist | 3 |
| open-water-safety-checklist / vet-swim-instructor / water-safety-month-action-plan | 2 each |
| cold-water-safety / kiddie-pool / rip-current / summer-camp / water-park-splash-pad | 1 each |
| fall-swim-schedule-planner, first-month-swim-lessons, fishing, hot-tub-spa, swim-bag, swim-lesson-quality | 0 (fully duplicate) |

**19 links preserved, 16 orphan sections removed.** Re-render: content below the footer
**16 pages → 0**.

## Fixed #2 — the same related heading at 1.1rem on 15 pages

The bare-`<div>` variant (17.6px) is a legitimate in-page component — a grid of related
cards, correctly positioned above the footer. Its only problem was the heading size.

On `summer-safety-checklist-printable.html` the two blocks sit adjacent:

```
"Related Water Safety Guides"   17.6px   ← card grid
"Keep Reading"                  20.8px   ← canonical list
```

Two headings for the same role, 18% apart, stacked one above the other.

**Fix:** normalised the 15 remaining `font-size:1.1rem` instances to the canonical
`1.3rem`. Residual check: **0** `1.1rem` related headings left sitewide.

After both fixes, the related-heading role renders at exactly **one** size — 20.8px —
across the whole sample.

## Fixed #3 — every `<button>` on the site rendered in Arial

The `font-family` census returned **two** families in main content where there should be
one:

```
9,027 rows   Inter
  126 rows   Arial      ← all of them <button>
```

No browser inherits `font-family` into form controls; they fall back to the OS UI font.
`main.css` gives `font-family: inherit` to `input`, `textarea` and `select` — but never
to `button`. A handful of button classes picked it up ad hoc in `article.css` and
`education-hub.css`. The ones that did not:

| control | pages | visible? |
|---|---|---|
| `.print-btn` "Print or Save as PDF" | **86** | yes — the *only* CTA on every printable |
| `.form-submit` "Send Message" | 1 | yes — the contact form's submit |
| `.hamburger` | 734 | no (contains only `<span>` bars) |

This is the same defect class as the font-**size** inherit fix shipped in `404b56b`.
That commit fixed one property and left the neighbouring one — the "partial leak survives
in one property" pattern.

**Fix:** a proper form-control reset in `main.css`, **mirrored into both standalone
printable sheets** (`printable-checklist.css`, `printable-poster.css`), which never load
`main.css` and would otherwise have kept the Arial buttons:

```css
button, input, select, textarea, optgroup { font-family: inherit; }
```

Full re-render across all 79 representatives at both widths: **Arial 126 → 0.**

---

## Not fixed — reported

**Two neutral colour ramps are in use sitewide.** The colour census found 62 near-duplicate
pairs (max channel delta ≤ 12). They are not random: the site runs Tailwind's `gray-*` scale
and its `slate-*` scale simultaneously for the same roles.

| role | gray | slate | Δ |
|---|---|---|---|
| body text | `rgb(55,65,81)` ×792 | `rgb(51,65,85)` ×335 | 4 |
| headings | `rgb(17,24,39)` ×697 | `rgb(15,23,42)` ×192 | 3 |
| muted text | `rgb(75,85,99)` ×574 | `rgb(71,85,105)` ×432 | 6 |
| subtle bg | `rgb(249,250,251)` ×189 | `rgb(248,250,252)` ×128 | 9 |

Individually invisible; collectively it means `:root` declares a `--gray-*` palette that
roughly half the CSS ignores. Also: `special-needs.css` uses `#114c76` on two lines where
its other ~15 rules for the same role use `#0d4d77`.

Not shipped because consolidating a neutral ramp touches every stylesheet and needs a
human decision on which scale wins — not a change to make unattended. Flagging it as the
next colour-hygiene project.

**8 heading-size "inversions" on printables are convention, not defects.** The probe flags
`.cl-section-title` (16px) sitting below FAQ `h3`s (18.4px), and `h1 == h2` at 390px on six
card printables. Both come from the printable card being deliberately compact to fit a
sheet of paper. Changing that typography to satisfy a document-outline heuristic would
damage the print layout, which is the entire purpose of those pages. Left alone.

---

## Verification

| check | before | after |
|---|---|---|
| content rendered below `</footer>` | 16 pages | **0** |
| distinct related-heading sizes | 4 (17.6 / 19.2 / 20.8 / 22.4px) | **1 (20.8px)** |
| non-Inter rows in main content | 126 | **0** |
| document horizontal overflow (1280 + 390px) | 0 | 0 |
| sibling overlap / negative gaps | 0 | 0 |
| render errors across 158 page-renders | 0 | 0 |

Cache-bust bumped to `20260828b`. This also repaired pre-existing version drift — 734 pages
were on `20260828a`, 415 on `20260827b`, 23 on `20260822a`. All 1,176 stylesheet references
are now on one value; collision-checked against git history before use.

Live confirmation after deploy: `main.css?v=20260828b` and `printable-checklist.css?v=20260828b`
both serve the new reset, and both spot-checked printables return **0 bytes** of content after
`</footer>`.

Shipped as `966dbf0` on `live`.
