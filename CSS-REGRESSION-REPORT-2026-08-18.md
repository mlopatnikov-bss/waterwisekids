# CSS Regression Report — 2026-08-18

**Method:** real headless-Chromium render sweep, not a CSS grep.
22 template types × 3 viewports (1280 / 390 / 320px) = **66 computed-style probes**,
comparing nav, header, logo, nav links, footer, footer links, H1, tap-target sizes,
sub-11px text and horizontal overflow across every page type.

**Result: 5 regressions found, all fixed, pushed and verified live.**
Commit `8db9253` → `live`. Cache-bust `20260818b`.

---

## Why grep could not have found these

Four of the five defects are the **absence** of a rule, or a rule whose harm only
appears once the cascade resolves. There is no string to search for:

| # | Defect | What a static audit sees |
|---|--------|--------------------------|
| 1 | `font-family: inherit` on `html` | a valid, ordinary declaration |
| 2 | `* { padding: 0 }` stripping `.container` | a normal CSS reset |
| 3 | Footer links 14px tall | no height rule exists to grep |
| 4 | 3-column grid overflowing | a valid `grid-template-columns` |
| 5 | Missing root font-size scaling | nothing — the rule simply isn't there |

---

## REG-1 — `special-needs-swimming.html` rendered entirely in Times New Roman (HIGH)

`special-needs.css` loads **after** `main.css` and contained:

```css
html, body { font-family: inherit; }
```

`inherit` on the **root** element has nothing to inherit from, so it resolves to the
browser default — serif. `body` then inherited that, overriding `main.css`'s
`body { font-family: 'Inter', … }`. The whole page — nav, headings, body copy and
footer — rendered in Times New Roman. Almost certainly an artifact of an earlier
inline-CSS strip that replaced a real font stack with `inherit`.

The 11 other `font-family: inherit` declarations in the file are on descendants
(`h1`, `p`, `td`, buttons) and are correct — they now inherit Inter, so the single
root fix corrects the entire page.

**Fix:** restored the canonical `'Inter', system-ui, -apple-system, sans-serif`.

## REG-2 — same file: shared nav/footer 24px wider than every other page (MEDIUM)

The `* { margin: 0; padding: 0 }` reset at the top of `special-needs.css` also loads
after `main.css` and wipes `.container`'s horizontal padding. Rendered nav width was
**1160px at left 60** vs **1112px at left 84** on all 710 other pages.

**Fix:** re-asserted the canonical padding for `header .container` / `footer .container`
only. The page body keeps the reset it was authored against.

## REG-3 — Footer legal + contact links were 14px tap targets on mobile, sitewide (HIGH)

`m-app.css` hides the main footer nav on mobile (`footer .footer-links { display: none }`),
so the **only** tappable footer links on a phone are the contact email and the two legal
links in `.footer-bottom`. All three are plain inline `<a>` inside a `<p>`, so their box
height is just the line box — measured at **14px on all 22 templates** (12px on
special-needs). Apple HIG minimum is 44px.

The 2026-08-15 and 2026-08-16 tap-target sweeps fixed the `.footer-bottom` *font size*
(11px floor) but never its *height* — and no grep could catch it, because the failure is
that no height rule exists.

**Fix:** `inline-block` + `min-height: 44px` on `footer .footer-bottom p a` and
`footer .footer-contact a`, mobile only. Verified this cannot introduce horizontal
overflow (centred paragraph, box only grows vertically) at both 390px and 320px.

**Before: 44 of 44 mobile/narrow probes under 44px → After: 0.**

## REG-4 — `/scholarships/` overflowed the viewport by 31px at 320px (MEDIUM)

Inline `.stats-row { grid-template-columns: repeat(3, 1fr) }` with `1.25rem` card padding
cannot fit three tracks at 320px. The `.stat-card` for "308 Partner swim schools" rendered
to `right: 351px` in a 320px viewport.

**Fix:** `repeat(auto-fit, minmax(min(140px, 100%), 1fr))` — the established pattern from
the 2026-08-16 mobile pass.

## REG-5 — Printable pages ran ~14% larger than identical markup elsewhere (MEDIUM)

Printables load **no `main.css`** — only `printable-checklist.css` / `printable-poster.css`
plus the JS-injected `m-app.css`. `main.css` scales the root font-size on mobile
(16px → 15px ≤768 → 14px ≤480); neither printable sheet ever mirrored it. Every `rem`-based
rule in `m-app.css` therefore resolved against a **16px root on printables and a 14px root
everywhere else**:

| Element (390px) | Printables | Rest of site |
|---|---|---|
| nav logo | 15.2px | 13.3px |
| nav links | 14.4px | 12.6px |
| footer links | 14.4px | 12.6px |

Each sheet is internally self-consistent, so no single-file audit could see it.

**Fix:** added the matching `@media` root rules to both sheets, and normalized
`printable-checklist.css`'s font stack from `'Inter', sans-serif` to the canonical stack.
Form controls unaffected — `m-app.css` pins inputs/selects/textarea to an explicit
`16px !important` (the iOS-zoom guard), which the root change cannot touch.

---

## Checked and deliberately NOT changed

- **Blue nav link on `/education/` pages.** Not a regression. `main.js` adds `.active` to the
  nav link matching the current section; confirmed working on `/education/` and
  `/swimmers-hub/`. `/teens/` shows none because Teens has no nav entry — expected.
- **13 pages with no stylesheet.** All redirect stubs — known false positive.
- **Inline `<style>` blocks touching `header`/`footer`.** Only one, inside `@media print`
  on `/tools/family-water-safety-plan.html`. Correct.
- **Printable nav/footer class orphans.** Zero — printables define their own class names.
- **`header` border-bottom-color drift** on 2 pages. `border-bottom-width` is `0px`
  everywhere, so it renders identically. Cosmetic no-op.
- **Nav & footer markup.** Byte-identical across all 714 real pages — no structural drift.

---

## Verification (re-render after fixes, then again against live)

| Check | Before | After |
|---|---|---|
| Horizontal overflow | 1 page (31px) | **0** |
| Sub-44px footer tap targets (mobile) | 44 / 44 probes | **0** |
| Logo computed-style variants | 4 | **1** |
| Footer computed-style variants | 3 | **1** |
| Footer-link variants | 2 | **1** |
| Unintended desktop deltas | — | **0** |

Live render confirms Inter on every template, uniform 17.6px/13.3px logo sizing,
44px footer tap targets at 320px, and zero overflow.

---

## Note for Michael

`main.js` had already shipped today at `?v=20260818`, so Cloudflare was holding
`m-app.css?v=20260818` with the pre-fix contents. This push uses **`20260818b`** — reusing
today's string would have served the stale file and made the fix look like it had failed.
