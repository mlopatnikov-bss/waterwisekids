# Visual Design Report — 2026-08-25

**Method:** headless Chromium screenshots served over HTTP (`file://` loads no CSS),
23 template representatives × 1440/390, plus four targeted sitewide probes.
Baseline `live` @ `d8894d3`. Shipped as `3459645`.

**3 defect classes found and fixed. All verified live.**

Font note: `fonts-noto-color-emoji` was installed into the render sandbox before
shooting, so emoji icons render as glyphs rather than tofu — without it every
icon reads as broken and the whole pass produces false positives.

---

## Pre-screen — clean, and that mattered

A DOM probe ran first across 23 templates × 2 viewports looking for broken
images, sibling-card overlap, text clipped by its own box, invisible text,
unlabelled links and off-canvas boxes. **Every count was zero.** The three
defects below are all *geometry* problems that no presence-check or
computed-style sweep would surface — they only exist as pixels.

The two probe hits that did fire were both known-intentional and left alone:
the 10px labels are the mobile bottom nav and the home category strip, and the
"off-canvas" boxes are horizontal scroll strips (`.mobile-cat-item`,
`.cat-btn`) plus the `.comparison-table` scroll wrapper. `scrollWidth ==
clientWidth` on all 46 renders, so nothing actually escapes the viewport.

---

## 1. Three article pages rendered with no gutter at all

`/swimmers-hub/breaststroke-`, `butterfly-` and `backstroke-complete-guide.html`
put `.main-layout` on the page **without the `.container` wrapper**. The grid
therefore took the full viewport width and the article ran edge to edge.

| @1440 | H1 left | body copy | sidebar right | grid columns |
|---|---|---|---|---|
| freestyle (correct) | 164 | 164–864 | 1276 | `752px 320px` |
| **breaststroke** | **0** | **0–700** | **1440** | `1080px 320px` |
| **backstroke** | **0** | 0–700 | **1440** | `1080px 320px` |
| **butterfly** | 160 | 160–860 | **1440** | `1080px 320px` |

The first character of the headline sat flush against the browser chrome and
the sidebar card touched the right edge. Body measure stretched to 1080px.

**409 of the 412 `.main-layout` pages already had the wrapper** — these three
were the drift, and their fourth sibling (`freestyle`) was correct, which is
what pinned down the intended shape.

Each needed a different insertion point: breaststroke's `.main-layout` is a
direct `<body>` child, butterfly's *is* the `<main>` element, and backstroke's
is nested two levels inside `<main class="article-main">`. There was no single
edit that covered all three.

**After:** all four measure identically to the sitewide convention at 1440,
1280, 390 and 320 — `.main-layout` at `[164, 1276]`, sidebar at `[956, 1276]`,
zero overflow.

---

## 2. Every paired primary/secondary button was 4px out

Two button families, one root cause: **the filled variant declares no border
while the outline variant declares one, on identical padding.** With auto
height, the border is simply added on top.

```
.btn              padding: 12px 22px;   border: none;          -> 42px
.btn-outline      padding: 12px 22px;   border: 1.5px solid;   -> 45px
.button           padding: .65rem 1.4rem; (no border)          -> 45.1px
.button-secondary padding: .65rem 1.4rem; border: 2px solid;   -> 49.1px
```

So the outline button rendered **4px taller and 4px wider** than the filled
button sitting immediately beside it, tops misaligned by 2px. Visible on the
homepage hero pair, the `/find-swim-lessons` hero pair, and the **127 pages**
that pair `.button` with `.button-secondary`.

The same asymmetry existed in two standalone sheets — `printable-poster.css`
(`.btn-print` no border vs `.btn-back` 2px, in the same `.btn-row` flex) and
`special-needs.css`. This is the standing *standalone-stylesheet-drift* class:
a `main.css` shape has to be checked against both printable sheets or it only
holds for 89% of the site.

Worth noting this exact button pair had been patched twice before for
**contrast** (8/22 and 8/24) — the 8/24 fix edited the very `border:` line that
causes the drift. Nobody had measured the geometry.

**Fix:** a matching transparent border on each filled variant so the box models
agree. `background-clip` is `border-box` by default, so the fills look
unchanged.

**Verified:** re-rendered **all 741 pages** at 1440 — **20 drifting button rows → 0.**

---

## 3. A bare `nav {}` rule was silently running the breadcrumb bar

`main.css` line 537 carries a bare element selector written for the header:

```css
nav { display: flex; align-items: center; justify-content: space-between;
      height: 72px; gap: var(--spacing-lg); }
```

`<nav class="page-breadcrumb">` is also a `nav`, so it inherited all of it.
That **voided two authored declarations without any error**:

- `.page-breadcrumb`'s own `padding: 10px 24px` — dead, because the forced
  `height: 72px` plus `align-items: center` governed instead.
- `.breadcrumb-inner`'s `max-width: 1100px; margin: 0 auto` — dead, because as
  a *flex item* the inner div shrink-wraps to its text, so the auto margins
  **centred the trail** rather than constraining a full-width container.

Two independent dead declarations explained by one leak is what confirmed this
was unintended rather than a design choice.

Rendered result: a breadcrumb bar **as tall as the site header**, whose trail
slid horizontally depending purely on how long the crumb text was —

| page | first crumb x | H1 x |
|---|---|---|
| `/about.html` | 670 | 320 |
| `/articles.html` | 614 | 320 |
| `/beginner-swim-lessons-philadelphia.html` | 627 | 320 |
| `/swim-lessons/directory/california.html` | 538 | 320 |
| `/swim-lessons/directory/indiana.html` | 545 | 320 |

It never lined up with the H1 beneath it, and it moved as you navigated.

**Fix:** re-declared `display: block; height: auto` on `.page-breadcrumb`,
restoring both authored intents.

**Verified across all 67 affected pages** — every measurement collapses to a
single bucket:

| | before | after |
|---|---|---|
| bar height @1440 | 72px | **43px** (= 10+10 padding + 16 line + 1 border) |
| first crumb x @1440 | 538 – 670, scattered | **170 on all 67** |
| first crumb x @390 | scattered | **20 on all 67** |
| header nav height | 72px | **72px — unchanged** |

---

## Regression control

A 46-image before/after pixel diff across 23 templates × 2 viewports.
**15 of 46 changed, and every changed region traces to one of the three fixes:**

- `about / article / contact / edu-hub / swimmers-hub` — diff bbox starts at
  y≈87, i.e. immediately below the header: the breadcrumb bar shrinking and
  everything below shifting up.
- `dir-hub` — bbox `(196,536)-(600,588)`, exactly the hero button pair.
- `poster`, `plain-main` — bbox on the `.btn-row` / CTA buttons.

No unexplained deltas. Zero horizontal overflow, zero errors and zero sub-10px
text on the post-fix sweep of all 67 breadcrumb pages at both viewports.

---

## Observed, not changed

- **Breadcrumb vs content column still differ by ~24–150px on some templates.**
  `.breadcrumb-inner` is authored at `max-width: 1100px` (→ x=170 at 1440) while
  the directory pages use an 800px content column (→ x=320). The jitter is gone
  and the breadcrumb is now consistently left-aligned, but the two widths were
  never reconciled. Deciding the intended measure is a design call, not a bug
  fix — flagging rather than guessing.
- **`/swim-lessons/jersey-shore.html`** and its 12 siblings use a plain
  `.breadcrumb` div, not `.page-breadcrumb`, so they were unaffected by fix 3.
  Their breadcrumb sits at x=164 against content at x=314 — same visual
  question as above, different markup variant.
- **Homepage stat bar reads `411 Free Safety Guides` / `400+ Schools Listed`.**
  Not verified against source-of-truth counts this run; that belongs to the
  content audit, not the visual pass.

---

**Files changed:** `assets/css/main.css`, `assets/css/printable-poster.css`,
`assets/css/special-needs.css`, 3 swimmers-hub HTML files, + 645 files
cache-busted to `?v=20260825b` (only the three changed sheets bumped).

**Deploy:** pushed to `live` as `3459645`; rebased onto `d8894d3` which landed
mid-run. Confirmed live: `main.css?v=20260825b` returns 200 with all three QA
comments present, breaststroke serves the `.container` wrapper, `/about/`
serves the new cache-bust.
