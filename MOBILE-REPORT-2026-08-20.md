# Mobile Consistency Report — 2026-08-20

**Method:** headless Chromium render, not CSS grep. 68 template representatives
(covering all 152 structural clusters with ≥2 pages, plus the homepage, directory
hub, tools, jobs, statistics flagship and 404) plus all 79 printables, each at
320 / 390 / 768px with `is_mobile` + touch emulation. Desktop 1280px and print
media rendered as controls.

**Deployed:** `6099564` on `live`. `m-app.css` cache-bust `?v=20260820b → c`.

---

## Clean on arrival

| Check | Result |
|---|---|
| Responsive viewport meta | 68/68 present, all `width=device-width, initial-scale=1.0` |
| Hamburger menu | 68/68 — `aria-expanded` flips `false → true`, menu becomes visible, button 44×44 |
| Horizontal overflow | 0 pages at 320, 390, 768 |
| Image scaling | 0 images exceeding viewport |
| Form inputs (iOS focus-zoom) | 0 below 16px |

The 320px pass matters here: it is where `minmax()` tracks that cannot shrink
and unshrinkable flex strips fail while 390px looks fine. Nothing failed.

---

## Fixed — 195 sub-11px text instances across 22 printables

All from page-level inline `<style>` blocks using rem: `.72rem → 10.08px`,
`.78rem → 10.92px`, `.65rem → 9.1px`. The author's value clears 11px at a 16px
root and fails against the `html { font-size: 14px }` that
`printable-checklist.css` and `printable-poster.css` set at their own small
breakpoint. Same trap as the earlier `.72rem` round.

Worksheet tables were floored with `max(11px, <that table's own rem>)` rather
than a flat 11px — a flat value would have floored the failing cells correctly
but also shrunk cells already at 11.9px and erased the deliberate size step
between a header row and its body rows.

Affected: CPR quick card, spot-the-signs card, reach-throw-don't-go card,
water-watcher card, milestones checklist, practice log, goal-setting worksheet,
school-comparison worksheet, family pledge, reward chart, level-placement guide,
competency checklist, water-confidence challenge, fall schedule planner,
instructor-ratio table, multi-child supervision plan, and 6 others.

## Fixed — 3 tap-target classes below the WCAG 2.2 AA 24×24 minimum

| Target | Pages | Before | After |
|---|---|---|---|
| Inline-styled breadcrumb bar links | 398 | 35.1 × **14px** | 35.1 × **29px** |
| `.toc-list a` (sidebar table of contents) | 301 | 230 × **22.4px** | ≥24px |
| Sidebar / related-article nav lists | 135+ | 180 × **15px** | ≥24px |
| `.lead-magnet-direct-link` | 4 | 231 × **21.4px** | ≥24px |

The breadcrumb is the notable one: a **fourth** breadcrumb variant, and the only
one with no class to hook — a bare `<div style="padding: 10px 24px; font-size:
0.85rem">` wrapping bare `<a>` elements. Three earlier passes fixed the three
classed variants and this one read as clean because the selectors matched
nothing. Reached with an attribute selector so the fix stays out of a 398-file
HTML diff.

That rule deliberately carries **no `!important`**. A handful of these pages are
also matched by an earlier pass that lifted breadcrumb links to 44px *with*
`!important`; an important 24px would have overridden that downward and made an
already-passing target worse. Confirmed: those pages still measure 44px.

---

## Regression controls

| Control | Result |
|---|---|
| Sub-11px instances fixed | 195 |
| Still sub-11px after fix | 0 |
| Text **inflated** by the fix | 0 |
| Text **shrunk** by the fix | 0 |
| Horizontal overflow after fix | 0 at 320 / 390 / 768 |
| Desktop 1280px computed styles | byte-identical to baseline |
| Print PDF page counts | unchanged on all 6 card printables (2→2, 2→2, 2→2, 3→3, 3→3, 2→2) |

Two intermediate drafts were caught by these controls and rewritten:
a `max(11px, 1em)` floor inflated 267 elements to 14px (in a `font-size`
context `1em` resolves against the *parent*, so it raises rather than floors),
and a broad `.cl-section > p` rule shrank 16 already-passing paragraphs.

Every rule sits inside `@media (max-width: 768px)`. Print media resolves to
~816px CSS at Letter, so none of it reaches the PDF.

---

## Left alone on purpose

- **Inline prose citation links** (`CDC`, `American Academy of Pediatrics`,
  `U.S. Coast Guard`) at 15–19px tall — `display: inline` inside `<p>`/`<li>`
  body copy. WCAG 2.2 explicitly exempts inline targets. Lifting them would
  break the line rhythm of every article.
- **`.mobile-bottom-nav` labels at 10px** on all 68 pages — 11px reflows the
  fixed 5-across nowrap row.

---

## Note: a new page landed mid-run

`f9ec0fb` (Multi-Child Swim Lesson Cost Worksheet, printable + landing) was
pushed to `live` while this run was in progress. Rebased and re-scanned rather
than assuming — the generator has historically shipped new pages with the exact
defects being fixed. This one is clean: 0 sub-11px, 0 sub-24px targets, no
overflow. Its only sub-`.786rem` value (`0.68rem`) is inside `@media print`,
which never matches the mobile rules.
