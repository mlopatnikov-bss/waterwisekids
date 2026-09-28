# CSS Regression Report — 2026-09-07

**Method:** headless Chromium render sweep of a fresh clone of `live` (`d47d6ee`), served over HTTP.
**Sample:** 744 real pages (23 meta-refresh stubs excluded) → 69 equivalence classes on the 4-part key
(stylesheet set with `?v=` stripped, normalized header hash, normalized footer hash, inline `<style>` hash)
→ **73 representatives**. Header/footer markup variant coverage asserted: **0 uncovered**.
**Viewports:** 1440 / 1280 / 1150 / 900 / 390 / 320 px. **438 resting probes + 292 rail probes + 146 state probes, 0 errors, 0 non-200, 0 redirect leaks.**

---

## Result

| Axis | Result |
|---|---|
| Header markup variants | **6 → 5** (one fixed, below) |
| Footer markup variants | **2** — baseline held |
| Header / nav / logo / navLink computed-style buckets | 1 bucket each (after accounting for the 2 known page-sheet families) |
| Footer / footerLink computed-style buckets | **1 bucket, all 6 viewports** |
| Chrome content rail (logo x vs footer rail) | **73/73 equal** — 84@1280+1440, 24@900+1150, 20@390+320 |
| Horizontal overflow | **0 pages, all 6 viewports** |
| Chrome font family | **Inter, 100% of 2,953 chrome nodes** — no bare `monospace`, no undeclared stack |
| Chrome text under 11px | **0** |
| Non-inline chrome tap targets < 24px | **0** |
| Hover states (nav link / footer link / logo) | **1 bucket each across all 73** |
| Focus ring | **1 bucket**, `activeElement` asserted on all 73 |
| Mobile drawer (hamburger clicked) | opens on 73/73; x=36, width=350, min link height 49px, 8 links — identical |
| Rogue inline `style=` on chrome elements | **0 across all 744 pages** |
| Page-level `<style>` rules touching shared chrome | **3 pages, all inside `@media print`** — verified, none affect screen |

---

## Fixed and shipped — `86021a2`

**`/404.html` was the only page of 744 with the `.hamburger` button before `.nav-links`.**
Every other page in the corpus emits `logo → <ul class="nav-links"> → <button class="hamburger">`;
404 emitted `logo → button → <ul>`.

- **Impact today:** none visible. No CSS uses a sibling or positional selector on those two
  (`grep` for `~`/`+`/`:nth-child`/`:last-child` on `.nav-links`/`.hamburger` returns nothing),
  and both `main.js` and `m-app.js` bind by `querySelector`, which is order-independent.
- **Why fix it anyway:** it is a latent trap. The first rule keyed on sibling order — a
  `.nav-links + .hamburger`, a `nav > *:last-child`, a flex `order:` — silently breaks on the
  one page GitHub Pages serves for every 404 on the domain. 404 is the highest-traffic page
  nobody tests.
- **Fix:** moved the button after `</ul>` and matched the house whitespace, so `/404.html`'s
  header block is now **byte-identical to `/index.html`'s**. Header markup variants: **6 → 5**.
- **Verified after the fix:** `/404.html` vs `/` at 1440/1280/900/390/320 — header, nav, logo and
  hamburger rects, tab order, link count, drawer geometry, `aria-expanded` and overflow are
  **identical at every viewport. Zero unintended deltas.**

The one remaining singleton header variant is `/education/pool-safety-rules-printable.html`
(`<header><nav>` with no `.container` wrapper) — correct for the poster sheet, which rails the
nav itself via `header nav { max-width:1160px; margin:0 auto; padding:0 24px }`.

---

## Investigated, judged NOT defects

**1. Two pages inherit a different `color` on `<header>` / `<nav>`.**
`/special-needs-swimming.html` → `#13304a` (from `special-needs.css`'s `html, body`),
`/education/pool-safety-rules-printable.html` → `#1b2a4a` (`--poster-navy`).
Both are **invisible**: every visible chrome descendant re-asserts its own colour, and the
`.nav-logo`, `.nav-links a`, `.footer-*` and hover buckets are all uniform across the full 73.
`#13304a` / `#f4f8fb` is also an established second ramp (used throughout `/advertise.html`),
so recolouring it would be the false fix this checker made once before. Left alone.

**2. `73/73` footer legal links measure 15px tall at desktop.**
Markup is `<p>© 2026 WaterWiseKids. All rights reserved. | <a>Privacy Policy</a> | <a>Terms of Service</a></p>`.
Parent text ≫ link text, so these fall under WCAG 2.5.8's **inline exception**. Mobile is already
handled (`m-app` gives them a 24px floor where `.footer-links` is hidden and they become the only
footer nav). Adding a height to inline links inside a paragraph would break the line box. No change.

**3. `73/73` "header rail 0 vs footer rail 20" at mobile.**
Probe artefact, not a defect — measuring `header.x + paddingLeft` reads the full-bleed `<header>`,
not the `.container`/`nav` that actually carries the rail. Re-measured with the correct metric
(logo left edge vs footer content rail): **73/73 equal at every viewport.**

**4. Two hover buckets on nav and footer links at 1280.**
Transition jitter. `addInitScript` fired before `documentElement` existed, so the transition kill
never applied and the probe sampled mid-animation. Re-run with `addStyleTag` after `load` plus a
`transitionDuration === '0s'` canary (73/73 confirmed): **1 bucket each**, hover resolves to the
declared `#f3f4f6`/`#075985`, `#fff`, `#0369a1`.

**5. `main` text starting at 17.2px on 33 pages at 320.**
The leftmost text was the fixed mobile bottom-nav's 10px "Home" label (printables have no `<main>`,
so the probe fell back to `<body>`), not article content. The 10px bottom-nav labels are deliberate.

**6. Two printables carry a redundant page-level `@media print` block** duplicating rules already
in `printable-checklist.css`. Redundant, not contradictory — screen rendering unaffected. Noted only.

---

## For Michael — observation, no action taken

`/special-needs-swimming.html` is the only page on the site with a `#f4f8fb` page background
(everything else is `#fff` or `#f9fafb`) and `#13304a` body text instead of `#1f2937`. It comes
from `special-needs.css` overriding `html, body` after `main.css`. It reads as a deliberate bespoke
palette for that landing page rather than drift — but if it *wasn't* intentional, say so and it's a
two-line change.

---

## Baseline for the next run

- pages **744**, stubs **23**, classes **69**, reps **73**, stylesheet groups **12**
- header markup variants **5** (was 6), footer **2**
- chrome rail 84 @1280/1440 · 24 @900/1150 · 20 @390/320 — 73/73 equal
- overflow 0, chrome font 100% Inter, chrome text <11px = 0, non-inline chrome taps <24px = 0
- hover/focus/drawer: 1 bucket each

Shipped: `86021a2` on `live` — push confirmed by re-fetching `origin/live` and asserting
`origin/live == HEAD`. **Live HTTP verification was not possible this run:** `web_fetch` refused
the URL under its provenance rule and the browser pane needed an interactive site approval that a
scheduled run can't obtain. The source is confirmed on the deploy branch; the rendered page was not
re-fetched from the CDN. Worth a manual glance at https://www.waterwisekids.com/404.html on a phone.
