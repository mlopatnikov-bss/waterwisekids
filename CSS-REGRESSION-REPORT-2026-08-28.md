# CSS Regression Report — 2026-08-28

**Method:** fresh clone of `live` (`a9eee87`), headless Chromium, served over HTTP.
Sample rebuilt from scratch this run: **67 equivalence classes → 71 representative
templates**, swept at **1280 / 390 / 320px** (213 probes), plus a **769–1280px band
sweep** at 8 widths. Computed styles, `getBoundingClientRect`, tap targets, sub-11px
chrome text, overflow, root-font scaling, rogue inline CSS, and a **hover/focus state
pass** on 6 chrome selectors.

**Result: 2 real regressions found and fixed.** Both lived in the tablet band, which
no prior sweep had ever rendered.

Deployed as `d6f7991`, **verified live** at 800/1024/1100/1126/1280px.

---

## Why this run found something six clean runs did not

The daily sweep has always rendered at 1280 / 390 / 320. Both defects below exist
**only between 769px and 1149px** — a band the harness never visited. `main.css` has
carried a dedicated media block for that band since 2026-08-27; nothing had ever
checked whether the rest of the site agreed with it.

Two method changes made the difference:

1. **The sample partition was rebuilt.** Previous runs grouped pages by their
   `<link rel=stylesheet>` href tuple *including* the `?v=` cache-bust query, which
   split cohorts arbitrarily. Regrouping on the true equivalence key —
   `(stylesheet set, header markup hash, footer markup hash, inline <style> hash)` —
   gave **67 classes / 71 reps**, up from 37, with every header and footer markup
   variant covered by construction.
2. **A band sweep was added** at 769 / 800 / 900 / 1024 / 1100 / 1125 / 1126 / 1280.

---

## Fixed #1 — all 87 printables scrolled the whole document sideways on every tablet

`main.css` carries this, and has since the 2026-08-27 mobile-consistency sweep:

```css
@media (min-width: 769px) and (max-width: 1125px) {
  header nav      { height: auto; min-height: 72px; flex-wrap: wrap; }
  .nav-links      { flex-wrap: wrap; justify-content: center; row-gap: 2px; }
  .nav-links > li > a { padding: 8px 6px; font-size: 0.82rem; }
}
```

It exists because the nav is a single non-wrapping flex row that needs ~1126px of
track, while the hamburger only takes over at ≤768px.

**Neither `printable-checklist.css` nor `printable-poster.css` mirrored it.** Those
two sheets are standalone — they never load `main.css` — and both hard-code
`nav { height: 72px }` with the default `flex-wrap: nowrap` and roomier
`padding: 8px 14px` / `font-size: 0.9rem` links. `.nav-logo` is `flex-shrink: 0` and
every link is `white-space: nowrap`, so the row could neither wrap nor shrink. It
pushed the **document** wide:

| viewport | 769 | 800 | 900 | 1024 | 1100 | 1125 |
|---|---|---|---|---|---|---|
| **printables — document overflow** | **341px** | **310px** | **210px** | **86px** | **10px** | 0 |
| `main.css` pages — document overflow | 0 | 0 | 0 | 0 | 0 | 0 |

That is a real horizontal scrollbar on the page body, not a contained nav overflow.
iPad landscape (1024px) scrolled 86px sideways; iPad portrait (810px) and iPad Pro 11"
(834px) scrolled ~200–300px. 87 pages affected.

**Fix:** mirror the band block into both sheets, chrome-scoped only, using each
sheet's own selector convention (`.screen-header nav` for the checklist sheet,
`header nav` for the poster sheet). The printable body layouts are untouched.

**After:** document overflow **0 at every width in the band**, and the printable nav
now matches `main.css` exactly from 800px up — `hdrH 73`, `flex-wrap: wrap`,
`padding: 8px 6px`, `font-size: 13.12px`.

This is [[standalone_stylesheet_drift]] again, now confirmed to apply to **media
blocks**, not just declarations: a mirror built by copying visible rules drops an
entire breakpoint silently, because nothing renders differently until you resize into it.

---

## Fixed #2 — the band's upper bound was 24px too low

At **1126–1149px**, `main.css` pages fell out of the band and reverted to
`flex-wrap: nowrap` with `padding: 8px 14px`, while the row still needed 1126px:

| viewport | 1125 | 1126 | 1130 | 1140 | 1145 | 1150 |
|---|---|---|---|---|---|---|
| nav content overflow | 0 | **24px** | **24px** | **24px** | **24px** | 0 |
| nav right edge | 1101 | 1102 | 1106 | 1116 | 1121 | 1126 |
| last link right edge | 1101 | **1126** | **1126** | **1126** | **1126** | 1126 |

`body { overflow-x: hidden }` swallowed the document scrollbar, so this never showed
up as an overflow signal — but the last nav links (`About`, `Contact`) overhung the
nav's own 24px right gutter and ran flush to the viewport edge. Cosmetic, not
functional: nothing was clipped or unreachable, which is exactly why it survived.

**Fix:** bound raised `1125px → 1149px` in `main.css`, and the mirrors in #1 were
written against the corrected bound. At 1126px the tightened one-row layout fits with
the gutter intact, so no wrap actually occurs — the change only tidies the band edge.

Both stale `1125px` references in the surrounding comment block were updated in the
same commit, so a future grep-verify cannot quote a value the code no longer uses.

---

## Regression check

| check | result |
|---|---|
| Band re-sweep, 3 sheet families × 7 widths (769→1126) | **0 overflow, 0 nav overflow** |
| Full 213-probe re-sweep at 1280 / 390 / 320 — resting styles, all regions | **0 deltas** |
| Same re-sweep — hover / focus states, 6 selectors | **0 deltas** |
| Same re-sweep — tap targets, sub-11px text, overflow, root font size | **0 deltas** |
| Live verification after Pages build, 3 pages × 5 widths | **15/15 OK** |

Cache-bust: `main.css` `20260827b → 20260828a` (647 refs),
`printable-checklist.css` `20260825e → 20260828a` (86 refs),
`printable-poster.css` `20260826b → 20260828a` (1 ref). 734 files touched,
**0 residual old versions, 0 unversioned refs.**

---

## Clean

- **Markup tripwire holds exactly at baseline:** 734 pages carrying chrome,
  **7 header variants** (517 / 86 / 67 / 61 / 1 `404.html` / 1 `pool-safety-rules-printable` /
  1 `index.html`), **2 footer variants** (647 / 87), **hamburger present on 734/734**.
  No new variant.
- **State pass clean.** Canary-gated: on desktop, `.nav-logo`, `.footer-links a`,
  `.footer-contact a` and `.footer-bottom a` all changed on hover on **71/71** pages,
  so the probe demonstrably fired — and every state bucketed to a **single** signature.
  Yesterday's `advertise.css` `footer a:hover` leak is confirmed gone.
- **Page stylesheets no longer reach into shared chrome.** Grepping all 9 page sheets
  for bare element selectors returns exactly one hit: `special-needs.css`
  `html, body { color: #13304a }` — the documented invisible inherit.
- **Overflow 0** on all 213 probes. **Sub-11px chrome text: 0.** **Root font-size
  uniform** (16 / 14 / 14px across all 71). **Mobile tap targets: 0 under 44px.**
- Rogue inline style attributes in chrome: only the two documented ones — the 28px
  logo `<img>` (142) and the printable footer's `text-align: center` wrapper (38).

## Confirmed NOT bugs — do not "fix" these next run

- **`headerNav` at `[60, 1160, 72]` vs `[84, 1112, 72]`** on the 38 pages that omit the
  `<header><div class="container">` wrapper. `main.css` compensates with
  `header > nav { max-width: 1160px; padding: 0 24px }`. Rendered content box is
  **identical**: 84→1196 desktop, 16→374 mobile, 16→304 narrow.
- **`.hamburger` padding `8px` vs `0px`** on the 33 printable reps. Measured at desktop,
  where the element is `display: none`. On mobile both compute to the same 44×44 box —
  the printable sheets supply `min-height`/`min-width: 44px` and centre the content.
- **`.hamburger span` `display: inline` vs `block`** on 32 printable reps. Same story:
  desktop-only, on a `display: none` parent. At mobile the parent becomes a flex
  container and blockifies the spans, so both render identical bars.
- **`.footer-bottom` `align-items` / `gap` / `justify-content`.** `main.css` sets them at
  `.footer-bottom` then overrides `display: flex → block` at `footer .footer-bottom`.
  The flex properties are inert; the printable sheets ship only the `block` version.
- **`article.css` `.footer-links { flex-direction: column }`** inside `@media (max-width: 768px)`.
  `m-app.css` hides `.footer-links` with `display: none !important` at the **same**
  breakpoint, so it paints nothing. Measured `display: none` on **71/71** at mobile.
  Latent, not live — flag it if that `!important` ever moves.
- **`.nav-links a` blue/grey split (41 vs 30 pages).** `main.js` adds `.active` by pathname.
- **`header` / `nav` `color` outliers** on `special-needs-swimming.html` (`#13304a`) and
  `pool-safety-rules-printable.html` (`#1b2a4a`) — inherited, consumed by nothing.
  Verified 2026-08-26 and unchanged.
- **13 pages with no `<header>`/`<footer>`** (`about.html`, `articles.html`,
  `how-to-*.html`, `beginner-swim-lessons-*.html`) — ~3KB redirect stubs, by design.
- **Desktop `.nav-logo` at 162×28.** Below 44px but above the WCAG 2.5.8 AA floor of
  24×24, and desktop is not a touch context. Mobile is 0-under-44.
