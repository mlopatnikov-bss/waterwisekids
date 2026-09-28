# CSS Regression Check — 2026-09-05

**Base:** `live` @ `a4f053b33` (full clone, 1511 commits, verified == `origin/live`)
**Shipped:** `a40b5171` → `live`
**Method:** headless Chromium render (not grep), 24 template representatives × 5 viewports
(1280/1024/900/390/320) + a 71-page stratified sample × 5 viewports (1150/900/769/390/320),
plus a rail-parity pass at 7 widths and a drawer-open pass at 390px. 0 render errors across
all 811 page-renders.

---

## Fixed and deployed

### 1. `adult-swimming-lessons.html` — rogue inline breadcrumb, 1 of 415

415 pages carry an inline-styled breadcrumb bar. 414 use one shape; this page used another
on **every** property:

| | convention (414) | outlier (1) |
|---|---|---|
| bar background | `#f8fafc` | `white` |
| bar padding | `10px 24px` | `12px 20px` |
| bar font-size | `0.85rem` | *(none)* |
| inner max-width | `1100px` | `1200px` |
| inner font-size | *(inherit)* | `13px` |
| link colour | `#0369a1` | `#114c76` |
| separator | `<span style="color:#9ca3af;margin:0 6px">` | bare `&rsaquo;` |

This was not cosmetic. `m-app.css` targets that bar by **literal attribute substring** —
`[style*="padding: 10px 24px"][style*="0.85rem"]` — so the outlier matched neither the 11px
mobile text floor nor the `min-width:44px !important` breadcrumb rule. Rendered at 390px and
320px, the "Home" crumb measured **38×44px**, failing the 44px house standard on its short axis.

**After:** 44×44. Computed style of the bar, inner wrapper and link is now byte-identical to the
414-page convention at both 1280px and 390px (verified against two independent convention pages).

### 2. `swimmers-hub/butterfly-complete-guide.html` — off-palette inline CTA

The only Material-blue declarations anywhere in the corpus:

| colour | corpus usage | replaced with | corpus usage |
|---|---|---|---|
| `#1976d2` (border + link) | 2 uses, 1 file | `#0077b6` / `#0369a1` | 571 / 5138 |
| `#0d47a1` (text) | 2 uses, 1 file | `#0c4a6e` | 1055 |

The CTA link measured **4.03:1** on its `#e3f2fd` background — under WCAG AA 4.5:1 for normal
text. Now **5.19:1**. Sibling stroke guides (backstroke, breaststroke) already use `#0077b6`
for the same component. Zero geometry delta — colour-only.

**Regression guard:** overflow 0, sub-11px count unchanged, desktop tap counts unchanged
(18→18 and 30→30) at 1280/769/390/320.

---

## Clean — tripwires that held

| check | expected | measured |
|---|---|---|
| header markup variants | 6 (+1 stub bucket) | **6 + NONE** ✓ |
| footer markup variants | 2 (+1 stub bucket) | **2 + NONE** ✓ |
| distinct Google Fonts URLs | 1 | **1** (746 uses) ✓ |
| viewport overflow, all 5 widths | 0 | **0 / 355 renders** ✓ |
| header rail == footer rail | equal | **1 bucket at all 7 widths** ✓ |
| open drawer inset == footer inset | equal | **71/71 identical** ✓ |
| header/footer computed box | 1 bucket per width | **1** ✓ |
| footer link signature | 1 bucket per width | **1** ✓ |
| root font-size scaling | 16 / 16 / 14 | **16 / 16 / 14** ✓ |
| body font-family | Inter everywhere | **Inter** ✓ |
| rogue inline CSS in header/footer | 3 known shapes | **3** ✓ |
| sub-11px text in chrome | 0 | **0** ✓ |
| sub-44px nav/footer tap targets | 0 | **0** ✓ |

Rail measurements (nav logo ‖ footer title ‖ footer bottom, left/right inset), identical on all
24 templates: 84px @1280 · 24px @1150/1024/900/769 · 20px @390/320.

Drawer, 71/71 pages: inset (20, 20) == footer inset (20, 20), min link height 49px, 15px labels.

---

## Confirmed *not* bugs — do not "fix" next run

- **Nav link colour splits into 2 buckets at ≥900px.** `main.js` adds `.active` by pathname;
  pages with a matching nav entry show `#075985`. Working as designed.
- **Header `border-bottom-color` drifts on 2 pages at ≤390px.** `border-bottom-width` is `0px`
  there, so it is unrenderable.
- **10px text on `.mobile-bottom-nav` and `.mobile-category-bar` labels** (350 instances).
  Deliberate — 11px reflows those fixed 5-across strips. Documented at `m-app.css:1060`.
- **`body` background splits 4 ways at desktop.** Printable checklists `#f9fafb`, printable
  poster `#f0f4f8`, `special-needs-swimming` `#f4f8fb`. Separate template families.
- **24.0px `.wwk-navlist` link cluster** (~155 shapes at 390/320). Known AAA (2.5.8) backlog,
  standing floor, not a regression.
- **Printable footers use a bare `<div>` with no `.container` and no inline `text-align`.**
  Both printable sheets set `footer { text-align:center }` and mirror `.container` on
  `footer > div`. Verified equal rails.

---

## Flagged, not changed

**Two coexisting shapes for the breadcrumb bar's font-size.** 403 pages use `font-size: 0.85rem`;
23 (the newer lead-magnet pairs) use `font-size: max(11px, 0.85rem)`. The `max()` guard is a
no-op at every root the site actually serves (16/15/14px → 13.6/12.75/11.9px, all above 11px),
and both strings still contain the `0.85rem` substring the `m-app.css` attribute selector keys
on, so **neither renders differently and neither breaks the floor rule**. Harmonising is pure
churn; left alone deliberately. If a future pass drops the root below ~12.9px, the 403 become
the ones at risk — not the 23.

**`swimmers-hub/butterfly-complete-guide.html` has five further 1-off inline shapes** beyond the
colour fix (list margins in `px` where the corpus uses `rem`, callout `border-radius:4px` vs
`8px`, heading `font-size:14px` vs `1.05rem`). The page appears to have been authored outside
the house template. None of them fail a floor, a contrast ratio, or an overflow check, so they
are a design-consistency call rather than a regression — leaving to Michael.

---

## Housekeeping

`/tmp/wwk-clone` (112 MB) is owned by `nobody` from an earlier session and cannot be removed by
this session's user — the standard `rm -rf /tmp/wwk-*` cleanup step silently no-ops on it. It
also blocked the first clone attempt this run. Worth a manual `sudo rm -rf /tmp/wwk-clone` on the
Mac Mini, or the daily job keeps re-auditing a directory it cannot refresh.
