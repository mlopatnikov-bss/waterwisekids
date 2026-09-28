# CSS / visual regression — 2026-09-16 (run B)

**Tree:** fresh clone of `origin/live`, arrived at `3b170ddd6` — **unchanged since run A pushed it this morning**.
**Pushed:** `e6ec173c0` (7 files, 76 insertions / 76 deletions).
**Browser:** none. Playwright is not installed in this session and the 09-16 AM
note records `chromium-headless-shell` dying on a missing `libXdamage.so.1`,
with `sudo` blocked and `apt` unable to lock its lists. Sideloading `.deb`s off
a mirror would mean executing untrusted binaries — not done. **No screenshots
were taken; this is the fourth consecutive run with no rendered or edge check.**

---

## Why this run did not repeat the morning battery

`origin/live` was byte-identical to run A's push, so the regression surface was
empty by construction and re-running the same sweep would have measured the same
tree twice. Per the 09-15b precedent the run was redirected to two things the
morning could not have covered: **verifying run A's own fixes at corpus scale**,
and **two axes that had only ever been measured inside a delta window**.

---

## Run A's fixes — verified, and one denominator was wrong

| Fix | Claim in run A | Verified now |
|---|---|---|
| FL/TX FAQ heading margin | 44 of 46 state pages on the house `2rem 0 .5rem` | ✅ **46/46**, zero outliers |
| Dangling speakable selector | dangling went 0 → 2, fixed | ✅ **0 dangling / 1,917 selectors corpus-wide** |
| PA inline town table | *"1 page corpus-wide, 0 at base"* | ❌ **wrong denominator — 15 pages / 315 attrs** |

The third is the finding of this run. "1 page corpus-wide" was the **delta
window's** denominator, not the corpus's. This is
`defect_class_inherits_the_audit_denominator` moving for the **tenth** time,
and the first time it has been caught inside a fix the same day it shipped.

## Classification before touching anything

A naive corpus sweep would have stripped all 315 attributes and broken four
pages. The 15 split three ways:

- **4 printables** (`fall-swim-schedule-planner`, `first-month-what-to-expect`,
  `goal-setting-worksheet`, `multi-child-supervision`) — load
  `printable-checklist.css`, **not** `main.css`, and are `noindex`. Their 65
  inline attrs are the *only* table styling they have. **Left alone** — stripping
  them deletes the tables' appearance outright.
- **4 PA local pages** (`ambler`, `glenside`, `flourtown`, `elkins-park`) — one
  attr each, `min-width:520px`, which forces the scroll inside the `overflow-x`
  wrapper. Load-bearing, same call run A made for PA's own wrapper. **Left alone.**
- **7 pages** that load `main.css` and inline-reimplement its table component.
  **Fixed.**

## What was removed on those 7

- **220 inline `padding` declarations** (`10px 12px` / `10px` / `.55rem .7rem`).
  This is the functional defect: `main.css`'s responsive
  `table th, table td { padding: var(--spacing-sm) }` at ≤768px **can never beat
  an inline value**, so the narrow-width step was dead on every one of these
  tables. They now take `--spacing-lg` (16px) at desktop and `--spacing-sm` (8px)
  below 769px.
- **16 exact duplicates** of `main.css` — `width:100%`, `border-collapse:collapse`.
- **189 off-house-ramp neutrals** → house gray ramp: `#cbd5e1`→`#d1d5db`,
  `#e2e8f0`→`#e5e7eb`, `#f8fafc`→`#f9fafb`, `#f1f5f9`→`#f3f4f6`.

**Kept deliberately:** `min-width`, `text-align` (main.css only sets `left`), the
`border`/`border-bottom` grid structure, the brand-blue accent backgrounds and
colours, `font-size`, `margin`.

**Canaries:** 0 style attributes emptied (no malformed tags); all 7 parse with
balanced table markup; 0 inline padding and 0 off-ramp slate remaining; the 4
printables and 4 PA locals byte-identical; 0 untracked files in the commit.

---

## New axis measured corpus-wide

**Speakable `cssSelector` resolution — CLOSED CLEAN.** 1,917 selectors across
782 pages, **0 dangling**. Run A's repair held and there were no others. Run A
could only see this inside its 30-file window.

**Neutral ramp split — quantified, left for Michael.** The slate ramp appears on
**589 of 782 pages, 3,652 occurrences** (slate-600 ×671, slate-50 ×636,
slate-200 ×589, slate-900 ×545 …). This is the standing
*two-neutral-ramps-in-use-sitewide* question, not a regression. **This run
normalised slate only where it sat inside a component `main.css` already owns**
(the 7 tables); the broader split is a design call and was not touched.

---

## Left for Michael

1. **The two-ramp question, now with a number.** 589/782 pages on slate vs a
   `main.css` that defines a `--gray-*` ramp. Either the gray tokens should
   become slate or the corpus should migrate — it is too wide to decide from a
   regression run.
2. **PA's table now differs from its siblings.** Run A stripped PA's borders
   entirely, so PA renders the house bottom-rule while the 7 pages fixed here
   keep their full-grid borders. Converting a full grid to a bottom-rule is a
   redesign, not a regression fix, so it was not repeated — but the two should
   agree.
3. **Four runs with no rendered verification.** Every finding since 09-15 is
   static-analysis only. Nothing here was seen.
