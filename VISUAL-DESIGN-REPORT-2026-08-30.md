# Visual Design Audit — 2026-08-30

**Method:** headless Chromium render sweep (not grep). 751 HTML files partitioned into
**17 template-variant classes** by a 4-part key (stylesheet set + normalized header hash +
footer hash + body class), minus the 23 meta-refresh redirect stubs. Every class contributed
at least one representative — **22 representatives** total — served over HTTP from a fresh
clone of `origin/live`, rendered at **1440 / 1280 / 1150 / 1000 / 820 / 375** px, plus a
targeted band sweep at **375 / 480 / 600 / 700 / 768 / 769 / 900 / 1150 / 1440**.

Footer markup variants: **2** — within the standing tripwire. Header variants collapsed to 4
under this run's stricter normalization (attribute + text-node blanking), which is a hashing
difference, not a markup change.

**Result: 1 defect class found, fixed sitewide and pushed** (`d38dcbe` on `live`), plus one
adjacent single-page leak fixed in the same commit. **Live re-render after deploy: 0 problems.**

---

## What was fixed

### 1. The body content rail drifted off the chrome rail on every phone

**29 files** · `local-pages.css`, `gear.css`, `advertise.css`, and 7 inline `<style>` blocks

The shared header and footer gutters were converted to **literal pixels** by earlier passes
(`header .container{padding:0 24px}`, `header > nav{padding:0 20px}`, the 2026-08-30
`[css-regression] Align header and footer gutters sitewide` commit). But **every top-level
content rail on the site still expressed its side padding in `rem`** — and `main.css` drops
the root font-size to **15px at ≤768** and **14px at ≤480**.

So the chrome held a rock-steady rail while the body column underneath it silently shrank its
own gutter. Measured on `swim-lessons/ambler-pa.html`:

| viewport | root font-size | body rail | chrome rail | drift |
|---|---|---|---|---|
| 375px | 14px | **14px** | 20px | **−6px** |
| 480px | 14px | **14px** | 20px | **−6px** |
| 600px | 15px | **15px** | 20px | **−5px** |
| 768px | 15px | **22.5px** | 20px | **+2.5px** |
| 820px (gear) | 16px | **32px** | 24px | **+8px** |

Two things worth naming about why this survived previous passes:

- **It is invisible to a CSS grep.** `padding: 0.75rem 1rem 3rem` looks like a 16px gutter in
  the file and *is* 16px at desktop. Only rendering at a viewport where the root font-size has
  already shrunk exposes it. Grepping at an assumed 16px root lies.
- **The desktop half is hidden by centring.** At ≥1248px these rails sit inside a bound
  `max-width`, so the wrong padding just narrows a centred box and produces no ragged edge.
  The defect is only visible where the rail is full-bleed — mobile, and for `gear.css` the
  **769–1100px tablet band**, which a desktop-plus-mobile sweep would have skipped entirely.

Visually, on a phone this read as the logo and nav sitting on one vertical line, the article
body and cards bulging 6px past it on both sides, and the footer snapping back to the nav's
line — a three-step ragged left edge down the full length of every affected page.

**Fixed** by replacing the `rem` side values with the literal canonical px in every content
rail. Vertical padding stays in `rem` — that is intentional and scales correctly.

| file | before | after |
|---|---|---|
| `local-pages.css` `.wwk-local-content` | `1rem 1.5rem 4rem` | `1rem 24px 4rem` + new `@media (max-width:768px)` → 20px |
| `local-pages.css` @640 | `0.75rem 1rem 3rem` | `0.75rem 20px 3rem` |
| `gear.css` `main.wwk-local-content` | `3rem 2rem` / `2rem 1rem` | `3rem 24px` / `2rem 20px` |
| `advertise.css` `main` | `3rem 2rem` / `2rem 1rem` | `3rem 24px` / `2rem 20px` |
| `swim-lessons/index.html` (inline) | `2.5rem 1.5rem 3rem` / `2rem 1rem` | `2.5rem 24px 3rem` / `2rem 20px` |
| `404.html` (inline) | `4rem 1.5rem` / `2rem 1rem` | `4rem 24px` / `2rem 20px` |
| `about/index.html` (inline) | `3rem 1.5rem` / `2rem 1rem` | `3rem 24px` / `2rem 20px` |
| `contact/index.html` (inline) | `3rem 1.5rem` / `2rem 1rem` | `3rem 24px` / `2rem 20px` |
| `scholarships/index.html` (inline) | `2.5rem 1.5rem 3rem` / `2rem 1rem` | `2.5rem 24px 3rem` / `2rem 20px` |
| `british-swim-school/*.html` (inline) | `2rem`, **no media query at all** | `2rem 24px` + new `@media (max-width:768px)` → 20px |

Two coverage gaps found while fixing:

- `local-pages.css` had only a **640px** mobile block, so the **641–768px** band kept the
  desktop `1.5rem` (= 22.5px at that root size) and ran 2.5px *narrower* than the chrome.
  A 768px block now closes it.
- The two `british-swim-school` pages carry **no `@media` rule whatsoever**. They were served
  the desktop `2rem` at every width — 28px at 375px, an 8px overhang. Both got a mobile block.

### 2. Two pages capped their body rail 40px wider than the shared chrome

`british-swim-school/jersey-shore.html`, `british-swim-school/northwest-philadelphia.html`

Both inline `main { max-width: 1200px }` while the shared `header .container` / `footer .container`
cap at **1160px**. At ≥1248px the page's own content therefore **outdented its own nav and
footer by 20px per side** — content sticking out past the chrome, the more conspicuous
direction of misalignment.

- **Before:** `main { max-width: 1200px }` — content rail at 144px, chrome rail at 164px @1440
- **After:** `main { max-width: 1160px }` — both at **164px**, Δ=0
- This is the same shape as the `special-needs.css` leak fixed on 2026-08-20. That one is
  *deliberately* left divergent (its own comment records that the page body keeps the reset it
  was written against, with the chrome re-pinned separately) — **not re-touched here.**

---

## Checked and clean

| axis | result |
|---|---|
| Horizontal overflow | **0** offenders, 22 reps × 6 bands |
| Overlapping siblings in main flow | **0** |
| Header ↔ footer rail agreement | **0** mismatches, all bands — the 2026-08-30 gutter commit holds |
| Broken images / icons | **0 real.** 330 srcs initially flagged `naturalWidth==0`; every one exists on disk and carries `loading="lazy"` at 5,000–47,000px down the page — a scroll-probe artefact, not a defect. Verified against the filesystem before reporting. |
| Page / JS errors | **0** across the whole sweep |
| Colour contrast | not re-swept; 2026-08-29 pass fixed 5 classes and this run found no new gradient stacks |

**Probe honesty note:** the emoji/tofu detector fired 1,091 times but every hit resolved to a
normal glyph falling back through `Inter` — it cannot distinguish a rendered emoji from a
`.notdef` box, so those results are **discarded as uninformative**, not reported as clean.

---

## Deploy

- Commit `d38dcbe` on `live` (rebased onto `ead221c` after an intervening push).
- Cache-bust: `local-pages.css` (17 refs), `gear.css` (1), `advertise.css` (1) → **`?v=20260830v`**.
  Asserted 19/19 references rewritten and zero stale tokens remaining.
- `advertise.css` turned out to be linked by **1** page, not 3 — the two hub pages only mention
  it in a comment. Corrected mid-run.

**Post-deploy live verification** (`https://www.waterwisekids.com`, rendered, not curled):
11 pages × 4 bands (375 / 768 / 1150 / 1440) — every full-bleed rail Δ=0 against its own
footer, 0 horizontal overflow, **0 problems**.

---

## Notes for next run

- The remaining non-zero deltas at 1150/1440 are **`max-width` differences**, not gutter bugs:
  article rails cap at 860/900/960/1100 against the chrome's 1160, centred. Legitimate reading-
  column design. Do not "fix" these.
- Every content rail on the site is now on literal-px side gutters. A future page that ships a
  `rem` side gutter on its top-level wrapper will re-introduce this class silently — the tripwire
  is: render at 375px and assert `main` padding-left equals the footer's rail, not that the CSS
  says `1rem`.
