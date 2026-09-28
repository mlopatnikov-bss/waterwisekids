# Mobile consistency check — 2026-09-21

**Corpus:** fresh clone of real `origin/live` @ `7b2fb62` (rebased onto `346e82f` mid-run).
799 HTML − 24 redirect stubs = **775 live pages**.
**Baseline named:** `5db6346`, the 09-20 mobile closure.
**Pushed:** `4798967` — 7 files, HTML only.
**Scratch:** `/tmp/mob921/` (non-matching prefix, removed at the end).

---

## THE defect — an `overflow-x:auto` wrapper is inert without a `min-width`

`m-app.css:1744` turns `.article-body` / `.article-content` / `.pricing-table`
tables into block scrollers at ≤768px:

```css
display: block !important;
width: 100% !important;
max-width: 100% !important;
overflow-x: auto !important;
```

That rule does what it was written for in 2026-08-18 — it stops a wide table
widening the page. But it does **not** make the table readable. With
`display:block` + `width:100%`, the table's own content shrink-to-fits to the
same width, so nothing ever overflows the scroller and **nothing ever scrolls —
the columns just crush**. Document overflow reads 0 the whole time, which is
why every prior sweep called this clean.

At 390px on 7 pages that produced character-level word breaking in 4- and
5-column data tables: `Lev|el`, `Parent in wate|r?`, `Rat|io`, `Min|i 1`,
`Jun|ior 1`, `mon|ths`, `6:|1`. **Found by eye** in a rendered 390px view of the
day's net-new page, not by any probe.

### Why the PA local pages were fine all along

The 4 PA locals and `/swim-lessons/directory/` carry an inline
`min-width:520px` on the table — the [09-16 note](../) called it "load-bearing"
without recording *what* it bears. This is what: the min-width is the only
thing that pushes the table past its wrapper and turns the wrapper into a real
scroller. `/jobs/post.html` works for the same reason (415px table in a 304px
box). Everything else with a wide table was crushing.

### Fix — smallest value off the house ladder {520, 560, 620} giving 0 breaks

Verified in a 390px iframe against production; **document overflow stayed 0 at
every candidate width**, because the wrapper contains the table.

| page | cols | min-width | breaks before → after |
|---|---|---|---|
| `education/goldfish-swim-school-levels` (net-new) | 5 | 620 | 41 → **2** |
| `education/ymca-swim-level-names-decoded` | 5 | 620 | 26 → **0** |
| `education/swim-lessons-cost` (`.pricing-table`) | 4 | 620 | 11 → **0** |
| `education/swim-level-translator` (2 tables) | 5+4 | 620 | 20 → **0** |
| `education/sibling-discount-swim-lessons` | 5 | 520 | 9 → **0** |
| `education/swim-lesson-levels-explained` | 4 | 560 | 9 → **0** |
| `teens/index` (`.salary-table`) | 4 | 520 | 8 → **0** |

`swim-level-translator` had **no wrapper at all** — its two `.lvl-table`s sat
bare in `.article-body`, so m-app's block-scroller rule was the only thing
holding them, with `table-layout:fixed` guaranteeing the crush. Both are now
wrapped in the same inline-styled scroll div the other six use.

Controls unchanged: `/swim-lessons/glenside-pa.html` 520/299, `/jobs/post.html`
415/304, both 0 breaks before and after.

**No CSS or JS changed, so no cache-bust key moved and no sitewide commit.**

---

## Results — every other axis 0

**Static, 775/775:** viewport 1 variant (`width=device-width, initial-scale=1.0`),
0 zoom-blocked · `.hamburger` exactly once on every page · **`main.js` 0 missing**
· **0** pages with a form control lacking a sheet that declares the 16px
iOS-zoom guard (`main.css`, `printable-checklist.css`, `printable-poster.css`
all carry it; all 12 stylesheet families load one) · 12 stylesheet families,
unchanged.

**Rendered, 101 pages @390 + 30 @320** (net-new + ≥4 per family across all 12
families + 15 key templates + 60 random):

- document overflow **0** · element overflow **0**
- tap targets under AA 24px **0** · text under 10.95px **0**
- text-entry inputs under 16px **0** · broken/distorted/overflowing images **0**
- footer rail **20 on 131/131** · content rail **20**, `null` buckets **0**
- m-app layer, bottom nav and a 44×44 hamburger present on every page

**Hamburger clicked on 18 pages:** 18/18 `false/none → true/flex`, drawer
geometry `x=20 350×409` identical on all 18, **0 tap failures inside the open
drawer**.

**Net-new pages: 3, all conformant.** `goldfish-swim-school-levels` (this
morning) plus the two `electric-shock-drowning-risk-card` pages another task
pushed mid-run — rail 20, all axes 0, and the printable's own 4-column table
scrolls correctly at 459/308 with 0 breaks. **Fourth consecutive clean publish
batch**; the goldfish page's table defect was inherited from the template, not
introduced by the emitter.

**Edge freshness CLOSED.** All 5 asset sha256s matched HEAD exactly before the
push (`main.css`, `m-app.css`, `main.js`, `article.css`,
`printable-checklist.css`, `age:0`). Post-push verified live with
`cache:'no-store'`; deploy lag ~3 min.

**CSS/JS delta since baseline:** `m-app.css` 14 lines, all colour — the 09-21
contrast fix that carried `#a3a3a3 → #6b7280` from the label spans up to the
parent `.mobile-bottom-nav a` / `.mobile-cat-item`, so the
`stroke="currentColor"` icons stop failing at 2.52:1. `main.js` 2 lines, the
`m-app.css?v=` key `20260920a → 20260921a` — **correctly bumped**. No layout
change, so the 09-20 nested-gutter fix was untouched and still measures 20
everywhere.

---

## ⭐ Probe method — the settle rule was wrong, not just short

Two pages (`/articles.html`, `/swimmers-hub/`) reported `.cat-btn` at
**10.92px** against the 11px floor on the first pass. That is a **probe
artifact**, and the third sighting of this shape (09-16 at 400 ms, 09-19 at
1200 ms). This run used **1300 ms** and still caught two pages mid-injection.

`m-app.css:2203` already floors `.cat-btn` at `max(11px, 0.75rem)` = 11px; the
10.92 is `0.78rem × 14px`, the pre-injection `education-hub.css` /
`swimmers-hub.css` value. Re-read after injection: **11px**, confirmed by
enumerating the matching CSSOM rules on all three `.cat-btn` pages.

⇒ **a longer fixed wait is the wrong fix — the gate must be a positive
readiness signal.** Poll `document.styleSheets` until the `m-app.css` entry
exists *and* its `cssRules` are non-empty, then settle 400 ms. Re-running the
full 101-page sweep behind that gate returned **0 text-floor hits**. Retire the
"settle ≥400 ms / ≥1200 ms" rules; they are unbounded by construction, because
the injection races page weight, not the clock.

Second artifact worth keeping: `th { white-space: nowrap }` makes the goldfish
table **worse** (2 → 5 breaks) — the table stays at its 620 min-width and
`table-layout:auto` reallocates the surplus to the widest column, starving
`Age` so `months` starts breaking. Residual width problems in an auto-layout
table are an *allocation* problem; adding width or nowrap does not fix them.

---

## Left for Michael

- **The two residual breaks on `goldfish-swim-school-levels` are irreducible** —
  `Ratio` in the header and `Varies` in one cell still wrap onto two lines, and
  they still do at a 680px min-width. Legible, normal table wrapping, not the
  character-level crushing that was the defect. Fixing it means hand-sizing
  columns on one page. Left alone.
- **21px rem-drift rail on `privacy/`, `terms/`, `jobs/post.html` — deferred a
  SEVENTH time.** Page-local `.content{padding:3rem 1.5rem}` against a 14px
  mobile root. 1px off the 20px chrome rail.
- **The desktop/tablet half of the 09-20 stacked gutter** still stands on the
  same 122-page cohort (h1 48 vs a 24px rail @834, 108 vs 84 @1280) — same
  cohort as the standing `.content-grid` 30px typography call.
- ⭐ **`m-app.css:1744` deserves a comment recording what it does and does not
  do**, so the next run does not re-derive this. It prevents page-widening; it
  does not make a table readable. Any new page with a 4+ column data table
  needs an inline `min-width` or it will crush, silently, with every probe
  reading clean.
- **Mount dirty at session start — 348 uncommitted changes, HEAD still stranded
  at `0e211752b` (2026-08-20). Eighth consecutive day.** Never read as the
  corpus, never written.
- **Dangling `/tmp/wwk-wt` worktree — twenty-sixth confirmation.** Still needs
  one interactive `git worktree prune --force` in the mount's repo.
- **`origin/live` moved mid-run** (the lead-magnet push). Rebased, not forced —
  zero file overlap.
