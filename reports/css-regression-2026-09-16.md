# CSS regression check — 2026-09-16

**Tree:** fresh clone of `origin/live` @ `d48fda993` · **Baseline:** `c45b07a` (the 09-15 audited tree)
**Corpus:** 782 html − 23 stubs = **759 live pages** (was 757; +2 new)
**Result:** 3 regressions found, all 3 fixed and **pushed to `live` as `3b170ddd6`**

---

## The delta bounds the run

`git diff c45b07a..d48fda99` over `*.css` `*.js` is **empty** — 6 commits, 30 HTML
files, 2 of them new, plus `sitemap.xml`, `.gitignore` and one SVG. No stylesheet
and no script changed in the window.

That points the run the opposite way from 09-15. Every rendered axis was
enumerated at full corpus on 09-15b against these exact stylesheets, so
re-rendering 727 byte-identical pages buys nothing. The regression surface is
the 30 changed files, and it is HTML-side by construction.

## What was checked, and what held

| Axis | Base `c45b07a` | Now | |
|---|---|---|---|
| Stylesheet families | 12 | 12 | both new pages joined existing families |
| Header markup variants | 6 | 6 | house value, normalised hash |
| Footer markup variants | 2 | 2 | house value |
| `<style>` blocks touching chrome (non-print) | 0 real | 0 real | see FP note |
| Classes used but undefined in any loaded sheet | — | **0** | across all 30 changed files |
| Directory h2/h3 style vocabulary | 12 signatures | **11** | one variant eliminated by the fix |

**The two new pages are fully conformant.** `swim-lesson-financial-aid-tracker.html`
loads `article.css` + `main.css` at the current cache-bust keys, has `<main>` and
the hamburger, and its header/footer hash joined existing buckets (`c527f104` /
`bc01b59e`). The printable loads `printable-checklist.css?v=20260913c` — the same
key as all 103 siblings — carries `noindex` like 101 of 104, and has no `<main>`,
which is the printable convention. Neither page missed a cache-bust bump.

---

## Regression 1 — FL + TX FAQ heading off the house margin

The "de-duplicate the Florida + Texas state FAQ" commit removed one of two FAQ
blocks on each page. On both, **the copy that was kept is the non-house one.**

44 of the 46 state pages that carry a FAQ heading use
`margin:2rem 0 .5rem`. Florida and Texas were left on `margin:1rem 0 .5rem` — a
0.5rem-shorter gap above the section heading than every other state.

Worth noting how this hid: the *page-level* counts all looked fine. The style
vocabulary across the directory family was unchanged base→now (every signature
present now was present before), and the sibling-inconsistency pair count was
identical at 104→104. The drift was only visible after keying each page's FAQ
heading by **which** of the existing signatures it used.

**Fixed:** both aligned to `2rem`. The `1rem 0 .5rem` variant is now extinct
(2 → 0) and the house variant covers 46/46.

## Regression 2 — dangling `speakable` selector on FL + TX

Same commit, second-order effect. Both pages still declared

```json
"cssSelector": [".tldr-box", ".page-hero h1", ".faq-section h3"]
```

but the de-duplication removed the only `.faq-section` in their markup. Pages
carrying that selector with no matching element went **0 → 2** in this window;
the other 3 pages that use it still have the element.

**Fixed:** dropped the third entry. `.tldr-box` and `.page-hero h1` both still
resolve on both pages. Dangling count back to 0 corpus-wide.

## Regression 3 — Pennsylvania's town table overrides main.css inline

The new PA town table shipped **37 inline `style` attributes** re-implementing a
component `main.css` already owns:

| main.css rule | the inline override |
|---|---|
| `table { width:100%; border-collapse:collapse; margin:var(--spacing-xl) 0 }` | duplicated verbatim |
| `table th { background:var(--gray-100) }` → `#f3f4f6` | `background:#f1f5f9` |
| `table td { border-bottom:1px solid var(--gray-200) }` → `#e5e7eb` | `border:1px solid #e2e8f0` |
| `table th, table td { padding:var(--spacing-lg) }` → 16px | `padding:.55rem .7rem` |
| responsive: `table th, table td { padding:var(--spacing-sm) }` | **unreachable** — inline always wins |

Two separate problems. The colours are off the house ramp — `#f1f5f9`/`#e2e8f0`
are *slate*, while main.css's table tokens are *gray* (`#f3f4f6`/`#e5e7eb`) —
and the border went from the house bottom-rule to a full grid. More seriously,
an inline `padding` can never be beaten by a stylesheet rule, so the responsive
tightening at narrow widths was dead on this table.

Corpus census: exactly **1** page carried this pattern, 0 at base.

**Fixed:** all 37 attributes removed; `main.css` styles the table. The
`overflow-x:auto` wrapper is **kept** — main.css has no scroll wrapper, so that
one is doing real work and is not an override.

---

## False positive reproduced (do not re-report)

My "rogue `<style>` touching chrome" probe flagged **11 pages, identically at
base and now** — `index.html`, `about/`, `contact/`, `scholarships/`,
`swim-lessons/directory/`, the two BSS pages, and four others. Every single hit
is a **CSS comment**, not a rule:

```
/* nav, footer, and base styles come from main.css */
/* ── Header ────────────────────────── */
```

This is the documented trap (`inline_nav_css_probe_matches_comments_and_print_rules`)
and it is why the 09-15 run recorded 0 here. A chrome-CSS probe must strip
comments before matching. Real count: **0**.

## Not verified

- **No rendered sweep this run.** Chromium would not launch —
  `libXdamage.so.1` missing, `apt` locked, no root, and the `/sessions` disk was
  at **100%** on arrival (`pip` failed into it until `HOME` was redirected to
  `/tmp`). Every finding above is static. This is a smaller gap than usual
  because the CSS/JS delta was zero and 09-15b enumerated all three viewports at
  full corpus against these same stylesheets — but the 30 changed pages have not
  been rendered, so a layout effect that needs a browser to see would have been
  missed.
- **Edge freshness still unmeasured**, third run running. `web_fetch` has no
  provenance for the origin and no browser was available to approve one.

## Left for Michael

- `/sessions` was full on arrival and I cannot clear other sessions' data —
  only ~7MB of 9.3GB is visible to this session. The required cleanup ran, but
  the pressure is coming from elsewhere on the shared disk.
- The 104 pre-existing (tag, page) pairs in the directory family where one tag
  carries more than one style signature are **unchanged base→now** and are not a
  regression. The h2 split in particular is intent — `2rem` marks the FAQ
  section heading, `1rem` the in-body ones. The h3 split (`1.05rem` ×248 vs
  `1.1rem` ×53 vs `1.08rem` ×12 vs bare ×165) is less obviously deliberate and
  is a typography call if you want it converged.
