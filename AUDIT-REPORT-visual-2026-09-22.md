# Visual Design Audit — 2026-09-22 (PM)

**Corpus:** real GitHub `live`, baseline `3d16fc0`, 803 HTML − 24 redirect stubs = **779 QA pages**
**Shipped:** `cba262f` — 56 files, colour values only. No geometry, no markup, no new colour values.

---

## The finding: white text on a flat `#0284c7` is 4.10:1

`#0284c7` (sky-600) was swept out of the corpus as a **text** colour weeks ago. Nobody had
measured it as a **background**. White on it is **4.10:1** — under the AA floor of 4.5 — and it
was painting live controls on **55 pages**.

| Control | Where | Before | After |
|---|---|---|---|
| `.form-actions .submit` — "Submit Review" | **52 directory state pages** (the money product) | 4.10 | **5.93** |
| `.btn-submit`, `.btn-copy-code`, `.job-pay-icon` | aquatic-jobs | 4.10 | **5.93** |
| `.pbsc-btn` background **and** border | pool-barrier-self-check | 4.10 | **5.93** |
| `.popular-links a:hover` | 404 | 4.10 | **5.93** |
| `.fwsp-add:hover` (hover darkened the bg, not the text) | family-water-safety-plan | 4.47 | **5.70** |

**The fix target was already inside every failing file.** Each of these rest states had a hover
at `#075985` or `#0369a1` — the button was *lighter than its own hover*. So the convergence
value needed no design judgement: `#0369a1` is `--blue-700`, exactly what `main.css .btn-primary`
already uses. `.pbsc-btn:hover` moved to `#075985` so the button keeps hover feedback, matching
the `.btn-primary` / `.btn-primary:hover` pair.

**Edge-verified** at 5.93 on five sampled controls (fresh no-store fetch, computed styles).

## This axis was found — and abandoned — a month ago

The `#0284c7` left in the corpus after the fix includes six occurrences **inside CSS comments**,
written by earlier audits of this same task: *"2026-08-22 visual QA: white on blue-600 #0284c7 =
4.10:1, under AA 4.5"*. Three pages were fixed individually back then; the other 55 were never
swept. A fix comment that states a ratio is a census instruction, not a receipt.

## Everything else measured clean at 779/779

`main.js` 779/779 · cache-bust 100% uniform across all 13 assets, zero unkeyed refs · footers 1,
nav 1, headers 2 · **0 broken local asset references** · **0 of 1,957 images without alt text** ·
the omission-axis probe from this morning's run: **0 hits** · `color:#9ca3af` **0 corpus-wide**
(yesterday's 889-page separator convergence held, and the publish template did not re-emit it
this afternoon) · rendered sweep of 12 pages across every template family: 12/12 conformant.

Page-local failing rules dropped **66 → 8**, and every remaining one is a documented false
positive (semi-transparent badges over dark panels, decorative pseudo-element dots, printable
fill-in-the-blank rules).

---

## Two design calls left for you

**1. Gold review stars — `.stars { color:#fbbf24 }` at 1.67:1** on the two British Swim School
pages. `#b45309` clears AA but turns the gold to burnt orange. Unchanged since 09-21; it is a
brand decision, not a bug fix.

**2. Two breadcrumb components disagree on link colour.** In `main.css`, `.breadcrumb a` is blue
(`--blue-700`) and looks like a link. `.page-breadcrumb a` is `--gray-500` on **68 pages** — the
same grey as its own separator, so the link, the separator and the current page are three shades
of grey, and the only link affordance is hover. I checked the history before touching it: that
block was *authored* grey on 09-18 as a deliberately muted bar, so it is not drift and I left it
alone. It passes AA. Purely an affordance question.

## One thing worth fixing on your machine

The Chrome profile carries roughly a 55% page zoom, so `innerWidth` stays pinned at 1700 no
matter how the window is resized — the mobile stylesheet never injects, and no rendered check at
390px is possible from this browser. Resetting Chrome's zoom to 100% would let these audits
verify mobile directly instead of installing a separate browser each run. The 390px axis was left
to its own daily task this run.
