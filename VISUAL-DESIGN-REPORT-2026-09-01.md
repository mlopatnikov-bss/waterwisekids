# Visual Design Audit — 2026-09-01

**Method:** headless Chromium render sweep against a fresh clone of `origin/live`,
served over HTTP. 755 HTML files partitioned by the 4-part template key (stylesheet set +
normalized header hash + footer hash + body class) into **17 variant classes**, minus **17
meta-refresh stubs**. Representatives plus the money pages = **27–32 pages × up to 3
viewports** (1440 / 768 / 390).

Header markup variants: **7**. Footer variants: **2** — both exactly on the standing tripwire.

**Result: the whole standard battery came back clean, so the pass went after the one
documented blind spot — contrast against *actually painted* pixels — and found a real AA
failure there.** Fixed and deployed (`04050bc66` on `live`), live-confirmed.

---

## Standard battery — clean, before and after

| check | 27 pages × 3 viewports |
|---|---|
| horizontal overflow | **0** |
| heading rank inversions | **0** |
| broken / distorted images | **0** |
| zero-size SVG icons | **0** |
| font families | **1** (`Inter`, 13,353 nodes; 3 `monospace` are intentional code spans) |
| sub-11px text | 284 × 10px — the documented deliberate bottom-nav labels only |

The 2026-08-31 heading-hierarchy fix and the 09-01 breadcrumb rail fix both still hold.

---

## The defect: a gradient whose light end could not carry its own subtitle

`/tools/` builds its hero from an inline rule:

```css
.tools-hero{background:linear-gradient(135deg,#0369a1 0%,#0891b2 100%);color:#fff;}
.tools-hero p{font-size:1.08rem;color:#e0f2fe;}   /* 17.28px / 400 → needs 4.5:1 */
```

The subtitle passes at the blue end and fails across the rest of the ramp:

| gradient position | painted background | subtitle ratio | verdict |
|---|---|---|---|
| 0 % (`#0369a1`) | rgb(3,105,161) | 5.17 | pass |
| 25 % | rgb(4,115,165) | 4.57 | pass |
| 50 % | rgb(6,125,170) | **4.05** | **fail** |
| 75 % | rgb(7,135,174) | **3.60** | **fail** |
| 100 % (`#0891b2`) | rgb(8,145,178) | **3.21** | **fail** |

The paragraph sits in the failing half. A composited render measured it at **4.20:1**
against a 4.5 floor. The `h1` is large text and passes throughout.

**This is a known error the site had already diagnosed — and then not swept.**
`tools/family-water-safety-plan.html:130` carries the comment:

> `/* 2026-08-22 visual QA: white on #0891b2 = 3.68:1, on #0e7490 = 5.02:1. */`

That pass fixed cyan-600 on *its own page* and left the sibling `/tools/index.html`
untouched. `main.css` records the same lesson a third time for the teal ramp
("teal-600 is too light to carry body-size white text"). Three encounters with one
rule — *these ramps' `-600` stops cannot carry body-size light text* — and the shape
was never swept.

### Why every earlier pass missed it

- **The CSS declares no background colour behind the text.** `.tools-hero p` inherits a
  transparent background; the colour that actually fails is painted by an ancestor
  *gradient*. Any probe reading `background-color` sees `rgba(0,0,0,0)` and moves on.
- **Both endpoints look defensible in isolation.** Checking `#0369a1` gives 5.17:1.
  The failure only exists *between* the stops.
- **It is desktop-only.** `m-app.css` flattens `.tools-hero` to `#fff` below 769px and
  repaints the paragraph `#737373`, so a mobile-first check passes clean.
- **The rule is inline in `tools/index.html`**, invisible to a sweep of `assets/css/*.css`.

### The fix

Light stop cyan-600 `#0891b2` → cyan-700 `#0e7490` — the exact substitution the
2026-08-22 pass used, with its arithmetic already recorded in the sibling file.

| gradient position | subtitle | h1 |
|---|---|---|
| 0 % | 5.17 | 5.93 |
| 50 % | 4.95 | 5.68 |
| 100 % | **4.67** | 5.36 |

Every stop now clears 4.5:1 for the subtitle and 3.0:1 for the h1. The cyan identity is
preserved; mobile is untouched; desktop layout is byte-identical.

---

## Verification

| check | before | after |
|---|---|---|
| composited-contrast findings (6,289 analytic + 85 pixel-sampled) | **1** | **0** |
| horizontal overflow | 0 | **0** |
| heading rank inversions | 0 | **0** |
| broken / distorted images | 0 | **0** |
| zero-size SVG icons | 0 | **0** |
| font families | 1 | **1** |
| residual `#0891b2` painted behind text, sitewide | 1 | **0** |
| live re-fetch after deploy | — | **confirmed serving `#0e7490`** |

Deployed as `04050bc66`, rebased onto an internal-linking commit that landed mid-run;
both changes verified present after the rebase.

---

## The probe itself was wrong twice — worth recording

The first composited-contrast run reported **58 findings**. **57 were false positives**,
from two distinct mechanisms, and acting on any of them would have damaged healthy pages:

1. **The element rect contained a child graphic.** `.nav-logo` wraps a 24×24 `<img>`
   logo next to the wordmark. Sampling "the background inside the element's box" picked
   up the logo's own blue pixels and reported the brand wordmark at 1.35:1 — on all 27
   pages, both viewports. Actual value: 5.93:1 / 7.56:1 against white. **Fix: only
   measure leaf text holders**, elements with no element children.
2. **Pixel-sampling a case CSS already answers exactly.** `.package-badge`,
   `button.form-submit` and `.poster-title` came back as white-on-white (1.01–1.03:1).
   Their computed backgrounds are `#c2410c`, `#0369a1` and `#1b2a4a` — 5.18:1, 5.93:1
   and 14.22:1. **Fix: resolve the background analytically from CSS whenever the
   ancestor chain is opaque colour, and reserve pixel sampling for the case CSS cannot
   answer** — a gradient or image painted behind the text.

A third gap was in the probe's own filter: it **skipped translucent text** (`alpha < 0.95`),
which silently excluded every `.hero-sub` on the site — `rgba(255,255,255,0.9)`. Those were
re-measured by compositing the text over its background; all pass (4.75–8.00:1).

Both canary assertions earned their place this run: one caught a mobile threshold set too
high, the other refused a run in which the gradient path had gone under-covered.

## Noted, not changed

- **`article.css:1027-1028`** — `.article-body [style*="background:#0891b2"] a` — a link-colour
  override for an inline background that **matches 0 live pages**. Dead rule, harmless;
  flagged so a future pass does not read it as evidence that `#0891b2` is still in use.
- **10px `.mobile-bottom-nav` labels** (284 instances) remain a documented deliberate
  exception (`m-app.css`: "11px reflows the strip").
- **`/swim-schools.html` and `/adult-swimming-lessons.html`** still keep their dark gradient,
  centred, 64px-padded heroes on mobile while every other template flattens to the white
  app-style hero. Carried forward from 2026-08-31 — still a visible brand call for Michael,
  not shipped autonomously.
- **30+ near-duplicate text colours** sitewide. None fails contrast. Consolidation remains a
  multi-session refactor.

---

**Commit:** `04050bc66` on `live` — `[visual-qa] /tools/: raise hero gradient light stop cyan-600 -> cyan-700 for AA`
