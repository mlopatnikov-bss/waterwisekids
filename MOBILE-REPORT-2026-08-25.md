# Mobile Consistency Report — 2026-08-25

**Scope:** 741 HTML pages (static pass) + 33-page template sample rendered headless
at 320 / 375 / 414px, portrait, `is_mobile` + touch, iPhone UA.
**Audited against:** fresh clone of `live` @ `a708cc4` (the mount was 5 days stale).
**Result:** 1 real defect found and fixed → `0428b02`, live and verified.

---

## Fixed — untappable nav drawer rows (sitewide, all 741 pages)

`main.css:583` sets `align-items: center` on `.nav-links` for the **horizontal
desktop** nav. The open mobile drawer flips to `flex-direction: column` but no
mobile rule re-asserted `align-items`, so the desktop value carried over and
shrink-wrapped every `<li>` to its own label width inside a 288px panel:

| Row | Width before | Width after (320px) |
|---|---|---|
| About | **42px** | 256px |
| Contact | 57px | 256px |
| Water Safety | 95px | 256px |
| For Swim Schools | 129px | 256px |

Only the text of each menu item was tappable — the remaining 160–246px of every
row was dead. "About" at 42px also sat under the 44px minimum target.

Fixed by re-asserting `align-items: stretch` plus `width: 100%` on `li`/`a` in
**all four** sheets that render the drawer — `m-app.css`, `main.css`,
`printable-checklist.css`, `printable-poster.css`. Verified by re-render:
min row width 42 → **256px** @320, **311px** @375; every row ≥44px tall.
Desktop nav re-checked at 1280px — still a single row, `align-items: center`
intact. Cache-bust bumped to `20260825e` across 728 pages + `main.js`.

---

## Harness defect found mid-run (worth recording)

The overflow detector **silently never fired**. Its scroll-container guard tested
the `overflow` shorthand with `/auto|scroll/`; the site sets `body { overflow-x:
hidden }`, whose computed shorthand is `"hidden auto"` — which contains "auto",
so *every element on every page* was treated as living inside a scroll container
and skipped. A 900px canary div injected at a 320px viewport went undetected.

Fixed by testing `overflowX` specifically for `auto|scroll` and excluding
`body`/`html` from the ancestor walk — `overflow-x: hidden` on body *clips*
rather than scrolls, so it masks overflow instead of legitimising it. The sweep
was then re-run from scratch with a canary assertion gating every batch.

**Any past run reporting "0 horizontal overflow" using the shorthand test proved
nothing.** This run's zero is real.

---

## Verified clean

| Check | Result |
|---|---|
| Horizontal overflow @320/375 | **0** across 66 page-viewports; `scrollWidth` never exceeded nominal (canary-gated) |
| `<meta name=viewport>` | 741/741 present, in `<head>`, `width=device-width` |
| `user-scalable=no` / `maximum-scale=1` | 0 — pinch-zoom never blocked |
| Unwrapped `minmax(≥200px)` | 0 — the `min(280px,100%)` fix is holding |
| Images overflowing viewport | 0 |
| Text inputs/selects <16px (iOS zoom) | 0 |
| Text <11px | 495 instances, **all** inside the documented `.mobile-bottom-nav` / `.mobile-cat-item` 10px carve-out |
| Hamburger present + opens | 99/99 renders; toggle 44×44; +8 links on click |
| Unsubstituted `__PLACEHOLDER__` | 0 |

## Confirmed false positives — do not "fix"

- **21 pages with tables lacking a scroll wrapper** — 6 rendered directly at
  320px, `scrollWidth` 320, zero offenders. Tables reflow.
- **13 printable pages with `font-size: 0.62–0.68rem`** — inside `@media print`;
  never applies on screen. Confirmed by render (0 sub-11px text outside the carve-out).
- **768 "fixed width ≥340px" hits** — a regex artefact: `width:\s*\d+px` matched
  inside `max-width:`. Corrected pattern finds **0**.
- **~50 sub-44px tap targets** — all `display: inline` citation links in prose
  (WCAG 2.5.8 exempt) or classless breadcrumb anchors measuring 36×**44**.
