# Mobile consistency check — 2026-09-19

**Baseline:** `c5db54b` (2026-09-18 mobile closure) · **Start of run:** `fa95c21` · **Pushed:** `7057da0`
**Corpus:** 793 HTML − 23 redirect stubs = **770 live pages** at start; **772** after the concurrent
`cc57b3e` lead-magnet push landed mid-run.

**Verdict: one hard functional break, one sub-floor badge. Both fixed and verified live.**

---

## 1. The defect — two net-new pages shipped without `main.js`

`/education/infant-swim-resource.html` and `/education/autism-speaks-water-safety.html`
(published this morning in `92364a6`) carry the **identical CSS `<link>` set** as their
440-page family and are missing exactly one line before `</body>`:

```html
<script src="/assets/js/main.js?v=20260918b"></script>
```

**774 of 774** other pages carry it, with a single uniform cache-bust key.

`main.js` is not decoration. It is the entire mobile layer:

| `main.js` line | What it does | Consequence of its absence |
|---|---|---|
| `:25` | `document.querySelector('.hamburger')` + click wiring | the burger is **inert** |
| `:628` | injects `/assets/css/m-app.css?v=20260918a` | **the whole mobile stylesheet never loads** |
| `:592` | `initNavlistShapeTagging()` | AA 24px tap floor never applied |

Both pages still render a `.hamburger` at 44×44, so the break is invisible to any
markup-presence check — it only shows when you click it.

### Measured, live, before the fix (390px and 320px)

| axis | the 2 pages | every sibling |
|---|---|---|
| body rail | **12px** | 20px |
| footer rail | **12px** | 20px |
| links under AA 24px | **9** (`77×20`, `94×20`, `79×20`, `62×20`, …) | 0 |
| `m-app.css` loaded | **false** | true |
| `.mobile-bottom-nav` present | **no** | yes |
| hamburger click | `aria-expanded` **false → false**, `.nav-links` stays `display:none`, `0×0` | `false → true`, drawer `x=20, 350×409` |

That last row is the whole finding: **on those two pages a phone user could not open the
navigation at all.**

### Why no probe caught it before
It is not a CSS regression (CSS/JS byte delta since `c5db54b` is **zero** — all 41 changed
files were HTML, images and the sitemap). It is not a markup-presence defect either: the
hamburger element is there. It is an **asset-reference omission**, and the only axis that
sees it is "does the page load the script that owns the component" — the same `<link>`-set
question [[css_regression_2026_09_16b_denominator_caught_same_day]] established for
stylesheets, now needed for `<script>` too.

### Fix
One line restored on each page. No shared asset touched, so **no cache-bust churn** —
the 09-18 lesson that bumping `m-app.css?v=` requires moving `main.js?v=` on 772 pages
did not have to be paid here.

**Post-fix, verified live and cache-busted:** rail 20/20 at 390 **and** 320, footer 20,
taps 0, `m-app.css` injecting, bottom nav present, hamburger `false → true` with the
drawer at `x=20, 350×409` — byte-identical geometry to the 13 house pages sampled.

### Is the emitter broken?
**No — not permanently.** The `cc57b3e` batch that landed mid-run published 2 more net-new
education pages and **both emit `main.js` correctly**. Corpus audit after the fix:
**0 of 772 live pages missing `main.js`.** This was a one-morning omission, not a standing
generator regression like the `#0284c7` breadcrumb was. Worth a pre-publish assert
regardless — see *For Michael*.

---

## 2. `.pbsc-badge` at 10.92px — a third badge the 11px floor never reached

`/tools/pool-barrier-self-check.html` declares `font-size:.78rem` in its own `<style>`.
Against the 14px mobile root that computes to **10.92px**, under the house 11px floor.

This is a known, already-solved shape. `m-app.css:1496` floors exactly this:

```css
/* ---- Sub-11px text floor: badges the 2026-08-16 sweep did not reach ---- */
.tool-badge,
.package-badge { font-size: 11px !important; }
```

`.tool-badge` is the same component down to the declaration — inline-block, uppercase,
letter-spaced, pill, sub-rem font-size in a page-local `<style>`. `.pbsc-badge` is simply
not in that list. `m-app.css:1989` already uses the right idiom elsewhere: `max(11px, 0.78rem)`.

**Fixed in place** as `font-size:max(11px,.78rem)` rather than by adding a selector to
`m-app.css` — a shared-sheet edit would have cost a 772-page cache-bust for a 0.08px miss
on one decorative badge. The `max()` form floors mobile and leaves desktop at 12.48px
unchanged. ⚠️ The `m-app.css` badge list is still short by one class; fold `.pbsc-badge`
into it opportunistically on the next commit that touches `m-app.css` anyway.

---

## 3. Everything else — clean

Rendered on **122 pages @390** (4 net-new + all 34 modified since baseline + ≥4 per
stylesheet family across all **12** families + 60 random) and **41 @320**:

| axis | result |
|---|---|
| document overflow | **0** |
| element overflow (scroller-aware) | **0** |
| tap targets < AA 24px | **0** (outside the defect pages) |
| text < 10.95px | **0** (after exemptions, below) |
| text-entry inputs < 16px | **0** |
| image overflow / aspect / broken | **0** |
| rail | **20px on every page, both widths** |
| footer rail | **20px** |
| `null` rail buckets | **0** — the 09-15 blind spot stayed closed |

Rail roots enumerated: `MAIN.article 69`, `SECTION.page-hero 12`, `ARTICLE.article 12`,
`DIV.print-toolbar 11`, `MAIN.wwk-local-content 10`, `DIV. 3`, `SECTION.hero 2`,
`DIV.container 1`, `MAIN. 1`, `DIV.screen-wrapper 1`.

Static at 770/770: viewport **1 variant** (`width=device-width, initial-scale=1.0`),
**0** zoom-blocked, `.hamburger` ×1 on every page, **0** pages with a form control lacking
a sheet that declares the 16px iOS guard.

Hero class token census unchanged — `page-hero 193`, `hero 7`, `tools-hero 1`,
`fwsp-hero 1`, `pbsc-hero 1`, `page-hero--edu/--hub 1` each. The 09-18 bare-`.hero`
stacked-gutter fix is intact at `m-app.css:996` with its exclusion rationale still
written into the comment. **No 11th stacked gutter.**

### Recurrences from 09-19 that did *not* recur
- **Breadcrumb `#0284c7`:** down to **1 file**, and that one is `/tools/pool-barrier-self-check.html`'s
  own `.pbsc-hero` gradient + `.pbsc-btn` accent — a deliberate tool palette, not a breadcrumb.
  **0 breadcrumb instances** against 577 house `#0369a1` files. Closed.
- **White-on-light `.stat-box`:** both net-new pages emit `color:#1e293b` inline alongside
  the light `background`. The `fa95c21`/`f43563a` fix held through the next publish.

### Edge freshness — closed
All five live assets hash-identical to `HEAD` before the push, `age: 0`:
`main.css f32ba0a4`, `m-app.css 370704a2`, `article.css a0b47cd8`, `main.js 8c5a0959`,
`m-app.js a4d44c28`. Deploy lag measured at ~3 min.

---

## Probe artifacts found this run — three, two of them new

1. ⭐ **NEW — the bottom-nav text-floor exemption must be ANCESTOR-scoped, not own-class.**
   The 10px labels are unclassed `<span>` children of `a` inside `nav.mobile-bottom-nav`,
   so an exemption keyed on `el.className` matches nothing and reports **5 false positives
   on every page that loads `m-app.css`** — and **0 on the two broken pages**, which is
   itself a tell worth reading rather than dismissing. Use `el.closest('.mobile-bottom-nav')`.
2. ⭐ **NEW — there is a SECOND deliberate 10px label component.** `/index.html` renders
   `.mobile-category-bar > .mobile-cat-item > span` at 10px, the same icon-caption idiom as
   the bottom nav. `m-app.css:1489` lists `.mobile-cat-item span` **beside**
   `.mobile-bottom-nav a span` in its contrast rule, which is the proof they are one
   component family and both deliberate. Exempt both by ancestor. Same shape as
   [[same_furniture_ships_under_two_class_names]] and the hero-class-list misses — an
   exemption list that names one member of a family rots the moment a second member ships.
3. ⭐ **NEW — an offscreen iframe never fires lazy-load.** A `position:fixed;left:-9999px`
   iframe gives every `loading="lazy"` image below the fold `naturalWidth === 0`, so
   `/education/index.html` reported **4 broken card images** including the two published
   that morning — the most plausible-looking false positive of the run. All four fetch
   **200** with real bytes. Filter `loading="lazy"` **and** `rect.top > viewportHeight`,
   or scroll the iframe before reading images.
4. **Rail root must not stop at `BODY`.** Pages with no `<main>` (printables,
   `/education/index.html`) landed on `BODY` and reported `rail: 0`. Descend into the first
   non-chrome child; when several siblings are candidates take the **minimum non-zero**
   `x + paddingLeft` across them. Extends [[rail_probe_needs_x_plus_padding_not_box_x]]
   and the 09-18 card-discriminator note.

**Concurrency:** `cc57b3e` was pushed by another session mid-run. Handled per the 09-19
rule — `git fetch`, confirm **zero** file overlap, `stash → reset --hard origin/live →
stash pop`, re-audit the corpus on the merged tree, then commit. No rebase, no force.

---

## For Michael

- ⭐ **Add a pre-publish assert that every emitted page carries `<script src="/assets/js/main.js">`.**
  Today's omission cost two pages their entire mobile navigation and was invisible to the
  markup-presence checks, the CSS-delta check and both variance probes. One `grep -L` in
  the publish step catches this class permanently.
- **21px rem-drift rail on 3 pages** — `privacy/`, `terms/`, `jobs/post.html`. Page-local
  `.content{padding:3rem 1.5rem}` against a 14px mobile root. Fix is `1.5rem` → `20px` in
  three sheets. **Deferred a fifth time.**
- `.pbsc-badge` should join `.tool-badge, .package-badge` in the `m-app.css:1496` floor list
  next time that sheet is edited for another reason.
- The mount's working tree is still stranded at `0e211752b` (09-16) with ~335 modified
  files, and the dangling `/tmp/wwk-wt` worktree is registered but absent — **ninth**
  confirmation. Skip-guard used during cleanup.

---

*Method: Chrome tool driving a same-origin hidden `<iframe>` at 390/320 against production,
settle 1250 ms, `?nc=` cache-buster on every `src`. Probe work chunked at 10 pages and run
as a detached promise polled from a later call — the CDP eval cap is ~45 s but the work
survives the timeout. Playwright not attempted; permanently unusable in this sandbox.
Scratch at `/tmp/mob919/`, removed.*
