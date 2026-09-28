# Visual design audit — 2026-09-18

**Baseline** `origin/live` @ `7c7ab3a` (yesterday's visual-QA push)
**HEAD at start** `513c909` · **Pushed** `e23bfee` (5 files, +9/−9)
**Corpus** 789 html − 23 redirect stubs = **766 live pages**, 12 stylesheet families
**Browser** available (Chrome tool + same-origin iframe); edge verified current before and after

---

## Summary

Eight commits landed since yesterday's baseline. `assets/css/*` and `assets/js/*`
were **untouched** — the entire visual delta is HTML-side inline style. Five
sibling-inconsistency defects were found and fixed; four false positives were
retired; two items are quantified below for Michael because they are corpus-scale
design calls rather than regressions.

---

## Fixed and verified live (`e23bfee`)

| # | Page(s) | Before | After | Denominator |
|---|---|---|---|---|
| 1 | `education/swim-vest-life-jacket`, `education/rip-currents-pull-you-under` | breadcrumb links `#0284c7` → rendered `rgb(2,132,199)` | `#0369a1` → rendered `rgb(3,105,161)` | 4 decls vs **939** house declarations |
| 2 | `education/rec-swim-to-swim-team-transition` | stat number `1.6rem` → **25.6px** | `2.5rem` → **40px** | 1 vs **15** siblings |
| 3 | `education/four-cs-of-progress-swim-curriculum` | gradient `135deg,#0c4a6e,#0077b6`; number `2.2rem`; caption `0.95rem/#e0f2fe` | house `135deg,#0077b6 0%,#023e8a 100%`; `2.5rem`; `1rem`/inherited | 1 vs **26** siblings |
| 4 | `education/private-equity-swim-school-ownership` | stat-box `padding:14px 18px` | `padding:16px 20px` | 1 vs **20** siblings |

**Finding 1 is the day's actual regression.** Both pages were published this
morning (`c2f5285`). Every other property of their breadcrumb block was already
byte-identical to the house shape — only the link colour drifted, to a lighter,
brighter blue that is visible beside any sibling article.

Residuals after the push, re-scanned at corpus denominator: `#0284c7` **0**,
off-house dark gradients **0** (27/27 now on the house gradient), `1.6rem`
gradient numbers **0**.

---

## Verified sound — today's other commits

- **`513c909` `font-family: Inter, sans-serif` → `inherit` on 65 declarations /
  55 files.** All 55 load `main.css`, whose `body` declares Inter, so `inherit`
  resolves identically. Confirmed by rendering: **265 form controls across 9
  pages, 0 non-Inter**. The 15 printables in the same commit were the
  *related-card* half, not the font half — checked separately because printables
  that never load `main.css` would have resolved `inherit` to a UA serif.
- **`513c909` printable related-card conversion (15 pages).** Moves them from the
  12-page blue-border shape onto the **104-page slate dominant**. Rendered and
  inspected: clean, no palette clash even on the one poster-family page
  (`pool-safety-rules-printable`).
- **`4decdfe` AEO Quick Answer boxes on Nebraska / Kentucky / Oklahoma.** The new
  `.tldr-box` blocks are property-set identical to the 26-page directory
  dominant; the `#quick-answer` ids they introduce all exist. Corpus-wide
  **dangling speakable `cssSelector`: 0**.

## Clean axes

Across a family-stratified 31-page sample covering all 12 stylesheet families:
**437 images — 0 broken, 0 distorted**, 0 zero-size SVGs, 0 replacement glyphs,
0 horizontal overflow at 1280. Family count held at 12.

---

## For Michael — corpus-scale calls, not shipped

**1. The breadcrumb bar is hand-rolled on 430 pages and lands 6px off the rail.**

| implementation | pages | breadcrumb text x @1280 | h1 x |
|---|---|---|---|
| `padding:10px 24px` + inline `max-width:1100px` | **408** (+22 with a font floor) | **90** | 84 |
| `padding:12px 0` + `<div class="container">` | **5** | **84** | 84 |

The 5-page minority is the *architecturally correct* one: it uses the shared
`.container`, so its breadcrumb tracks the h1 and the rest of the page. The
430-page majority re-implements the container inline and double-inserts a 24px
outer padding, landing the crumb 6px right of everything below it. Same shape as
yesterday's 860px finding, at 20× the denominator.

Converging 430 pages is a redesign, so it was not shipped. Recommended direction
is majority → `.container` (which closes the 6px and removes 430 hand-rolled
copies of a house component); the reverse would push 5 correct pages off the rail
to buy typographic uniformity.

**2. Unclassed orange callout, 10/10 split on margin.** 20 unclassed divs carry
`background:#fff7ed;border-left:4px solid #f97316;padding:14px 18px`, split
exactly 10 at `margin:22px 0` and 10 at `margin:20px 0`. No dominant, so no safe
unattended convergence. Note this is a **different component** from `.stat-box`
despite sharing the orange — it carries no class and no `color` declaration.

Still standing from prior runs: the 487-page inline `.tldr-box` override and the
two sitewide blues; `.content-grid` 30px off-rail on 122 pages; the slate/gray
neutral-ramp split; `div.sidebar-box` 8 variants / 71 pages.

---

## Method note

The residual check after fix #4 reported 20 surviving instances of the padding I
had just changed. That was **not** a failed fix — those 20 are a different,
unclassed component that shares the orange border. Re-scanning at corpus
denominator before believing a residual count is what separated the two; a
grep keyed on the colour alone would have reported the fix as broken and, worse,
a blind sweep would have restyled 20 elements of an unrelated component.

## Sandbox

`/sessions` at **100% (0 bytes free)** on arrival — third+ consecutive run; `/`
had 4.1G. Scratch at `/tmp/vda918` (deliberately outside the mandatory
`/tmp/wwk-*` cleanup glob), removed at end. All git writes in the clone; the
mount was never written to.

⚠️ `/tmp/wwk-wt` is **still** dangling in the mount's worktree list — sixth
consecutive confirmation across four days. Needs one interactive
`git worktree prune --force` from Michael.
