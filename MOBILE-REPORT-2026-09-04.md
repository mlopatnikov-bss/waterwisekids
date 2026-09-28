# Mobile Consistency Check — 2026-09-04

**Base:** `origin/live` @ `6b3f23c30` · **Shipped:** `1c9f302a4`
**Method:** headless Chromium render sweep (arm64 shell, `TMPDIR=/tmp`, Google Fonts
route-aborted, `ulimit -n 65536`), served over http via `ThreadingTCPServer`.
**Coverage:** 142-page stratified sample × 3 viewports (320 / 375 / 768) = 426 renders,
**0 load errors, canary fired on every batch.**

Sample key: normalized header hash × footer hash × template family (9 buckets, ≤10 each)
+ 60 random + all 18 pages carrying a sub-11px inline `font-size` + 6 named exemplars.
Corpus: 761 HTML files, 738 non-stub (23 meta-refresh stubs excluded).

---

## Shipped (1 fix)

**`education/swim-lessons-cost.html` — "View Scholarships →" sidebar CTA**
Rendered **20.1px** tall at 320/375 and 21.6px at 768 — the only interactive control
sitewide below the WCAG 2.2 **AA 24×24 minimum** (everything else clusters at exactly
24.0px or 44px+, which is the deliberate floor).

Already inline-styled `display:inline-flex; align-items:center`, so `min-height:44px`
fixed it in the one file — **no `m-app.css` change, no `main.js` key bump, no
multi-file diff.** Re-rendered: 44.0px at all three widths, no overflow introduced.

---

## Clean — with the probe that proved it

| Check | Result |
|---|---|
| Viewport meta | **761/761**, one variant `width=device-width, initial-scale=1.0` |
| `user-scalable=no` / `maximum-scale=1` | **0** |
| Horizontal overflow @ 320/375/768 | **0 / 426 renders** (measured against *intended* device width, never `innerWidth`) |
| Image overflow past viewport | **0** |
| Form inputs < 16px (iOS focus zoom) | **0** |
| Hamburger present + toggles | **142/142** at every width; `aria-expanded` flips |
| `aria-controls` on hamburger | **142/142 present** — the old sitewide gap is closed |
| m-app.js booted (`.mobile-bottom-nav` in DOM, 0 in HTML) | **142/142** |
| Root font-size | 14px ≤375, 15px @768 — as expected |
| Unwrapped `minmax(≥200px, …)` | **0** real (160 occurrences; the one regex hit at `m-app.css:1247` is prose inside a comment) |
| Header / footer markup variants | **6 / 2** — matches the tripwire, no drift |

## Investigated and dismissed — do NOT re-report

- **29 "sub-24px tap targets" at 375px (51 at 320, 93 at 768).** Every one is an
  **inline citation link inside body copy** — `.tldr-box > a`, `.stat-box > a`,
  `.stat-label > a`, `.article-body > div > a`, `.offer-card > p > a`. WCAG 2.2 exempts
  inline targets. They surfaced only because the probe's exemption filter tests the
  parent's *tagName*; these sit in a `div`, not a `<p>`. **Widen the exemption to
  `display:inline`-in-flow-content, not a parent-tag allowlist.**
- **1 text shape below 11px, on all 142 pages:** `.mobile-bottom-nav span` and
  `.mobile-category-bar span` at 10px. Deliberate — 11px reflows those fixed 5-across
  nowrap rows.
- **The 24.0px cluster** (`→ Printable …` cross-links, TOC links, checklist cards) is a
  deliberate AA floor, not a near-miss. Not short.
- **Drawer 20px wider than the footer rail on ~30% of pages.** Pre-existing and
  documented: the split is by header markup — `header > div.container > nav` aligns
  exactly (0/0), while `header.screen-header > nav` and bare `header > nav` have no
  `.container` wrapper and go full-bleed. Symmetric on both sides, so not lopsided.
  Consistency item for a run that already touches every page, not a regression.

## Noted, out of scope

`index.html` says "View All **421** Guides"; the last recorded truth was 420 (2026-09-02).
Worth confirming against `sitemap /education/ − 1` on the next content run.
