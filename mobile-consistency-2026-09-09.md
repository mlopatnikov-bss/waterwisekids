# Mobile consistency check — 2026-09-09

Audited the **clone** of `origin/live` @ `2fc29b433` (772 HTML files), not the mount
(mount is stranded at 08-20). Shipped one fix: `6486e1ea3`.

## Shipped

**3 page-level breakpoints were 1px off the house value** — `for-swim-schools/index.html` (x2),
`swim-lessons/index.html` (x1).

Every sitewide sheet opens its desktop band at `min-width: 769px` (main.css x4,
printable-checklist.css x4, printable-poster.css x4), because the phone band is
`max-width: 768px` **and** `main.js` injects `m-app.css` at `innerWidth <= 768`.
Three page-level `<style>` blocks opened at `min-width: 768px` instead, so at exactly
768 CSS px those pages applied the phone band, the injected m-app.css phone layer, and
their own desktop rules simultaneously:

| page | rule caught in the overlap |
|---|---|
| for-swim-schools/index.html | `.benefits` → 2-col grid |
| for-swim-schools/index.html | `.cta-buttons` → `flex-direction: row` |
| swim-lessons/index.html | `.featured-grid` → 2-col grid |

768px is a real device width (iPad portrait, many Android tablets, half-screen desktop),
so this was a live overlap band. Fixed by exact-string replace, count-asserted
(2 and 1), then verified `min-width: 768px` is now 0 corpus-wide.

## Axes measured clean this run

| axis | result |
|---|---|
| viewport meta content | **772/772** identical `width=device-width, initial-scale=1.0` — zero missing, zero `user-scalable=no` / `maximum-scale` (pinch-zoom never disabled) |
| `main.js` coverage (gates ALL mobile hardening) | **755/755** real pages. The other 17 are meta-refresh redirect stubs with 0 forms / 0 inputs — no mobile surface |
| hamburger binding | **755/755**. `main.js` binds the *first* `<nav>` via `querySelector('nav')`; on all 68 two-`<nav>` pages the primary nav is still first, so no page toggles `.mobile-open` on a breadcrumb nav. 0 pages missing `.hamburger`, 0 with duplicates |
| drawer CSS reachable in every stylesheet family | main.css, printable-checklist.css, printable-poster.css each define `.hamburger` + `nav.mobile-open .nav-links` independently. The 99 printables never load main.css and do **not** need it |
| printable header-scope match | checklist family scopes its hide rule `.screen-header .nav-links` and all 98 checklists nest the nav in `.screen-header`; the 1 poster scopes `header nav .nav-links` and uses a bare `<header>` — both self-consistent |
| iOS focus-zoom (input font-size < 16px) | pinned at `16px !important` in main.css (all 3 bands), m-app.css, and both printable sheets. Cascade order verified: m-app.css's pin at L1034 lands **after** its own 0.88rem/0.81rem rules at L670/L774, so it wins on the source-order tiebreak |
| page `<style>` blocks defeating the runtime-injected m-app.css | 198 in `<head>` (load *before* the injected link → m-app wins), 16 in `<body>` — **0** of the body blocks touch form/nav selectors. **0** inline `style=""` attributes use `!important` anywhere in the corpus |
| true fixed `width`/`min-width` > 320px | 4, all now intentional. (An initial count of 292 was a regex false positive: `\bwidth` matches inside `max-width`.) |
| new pages from `2fc29b433` | all 3 pass viewport / main.js / hamburger-binding / breakpoint |

## Not verifiable this run

- **No live render.** Browser-pane access to waterwisekids.com was declined (scheduled runs
  are non-interactive), and `playwright` is not installed. `/sessions` is at **100%** so
  `pip install` dies ENOSPC — worked out of `/tmp` (2.1G free) instead. Everything above is
  static/cascade analysis of the shipped bytes, which is sound for these axes but cannot
  confirm the CDN is *serving* them.
- The `m-app.css` loader gates on `innerWidth <= 768` **once, at load, with no resize
  listener**. A page first loaded in landscape (844px) and then rotated to portrait never
  gets the mobile layer. Narrow edge case, left alone — flagging rather than fixing.

## Recommendation for Michael

`min-width: 769px` is now provably the house desktop breakpoint (12 occurrences across the
3 sheets, 0 exceptions). Worth stating in the template standards doc so future page-level
`<style>` blocks don't re-drift.
