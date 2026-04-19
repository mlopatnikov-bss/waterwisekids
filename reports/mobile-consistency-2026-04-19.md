# Mobile Consistency Check — 2026-04-19

## Summary
**Status: PASS (1 fix deployed — 3 files)**

411 pages audited. 3 education articles had a broken mobile hamburger menu (non-functional `nav-toggle` class). Fixed and deployed to `live`.

---

## Pages Audited

- **Total HTML pages:** 411 (up from 284 on 2026-04-08 — 129 new pages added)
- **Pages using main.css:** 391
- **Pages using styles.css (legacy):** 0 (all legacy pages now migrated)

---

## Checks Performed

| Check | Result |
|-------|--------|
| Viewport meta tag present | ✅ All 411 pages pass |
| Hamburger button class correct | ❌ 3 pages — FIXED |
| nav-links present | ✅ All main.css pages pass |
| main.js loaded (hamburger JS) | ✅ All main.css pages pass |
| Horizontal overflow inline styles | ✅ None found (max-width containers are safe) |
| overflow-x: auto on tables | ✅ 4 pages use scroll wrapper (correct pattern) |
| Touch targets ≥ 44px | ✅ .hamburger min-height/min-width: 44px in CSS |
| Images scale correctly | ✅ global `img { max-width: 100%; }` in main.css |
| Footer present | ✅ All sampled pages pass |
| Mobile bottom nav (m-app.js) | ✅ Loads on ≤768px via main.js |

---

## Issue Found & Fixed

### Bug: `nav-toggle` class on 3 education articles — mobile menu non-functional

**Pages affected:**
- `education/swimming-after-eating-myth.html`
- `education/kayak-canoe-safety-kids.html`
- `education/pool-floaties-dangers.html`

**Root cause:** These pages used `class="nav-toggle"` on the hamburger `<button>` element. While `main.css` styles both `.nav-toggle` and `.hamburger` identically (visual appearance was correct), `main.js` only registers a click listener on `.hamburger`. Result: the button rendered visually but tapping it on mobile did nothing — the nav menu never opened.

**Fix applied:**
- Changed `class="nav-toggle"` → `class="hamburger"`
- Changed `aria-label="Toggle navigation"` → `aria-label="Toggle menu"`
- Added `aria-expanded="false"` attribute
- Changed button content from `&#9776;` (unicode character) → `<span></span><span></span><span></span>` (CSS-styled bars)

**Commit:** `[mobile] Fix: nav-toggle → hamburger in 3 education articles (mobile menu was non-functional)`
**Deployed:** Pushed to `live` branch — 2026-04-19

---

## New Pages Spot-Checked

129 new pages were added since the last report (2026-04-08). Sample checks on:

| Page | Viewport | Hamburger | nav-links | main.css | main.js | Footer |
|------|----------|-----------|-----------|----------|---------|--------|
| swim-lessons-howell-nj.html | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| swim-lessons-jersey-shore.html | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| swim-lessons-philadelphia.html | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| swim-lessons/directory/alabama.html | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| swim-lessons/directory/california.html | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| swim-lessons/directory/index.html | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| swim-lessons/ambler-pa.html | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| swim-lessons/brick-nj.html | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

All new pages use correct `.hamburger` class with `<span>` children — consistent with standard template.

---

## Items Not Fixed (known, tracked)

1. **Nav button order in 3 fixed pages:** Button appears *before* `ul.nav-links` in DOM (logo → button → ul), while the standard template has it *after* (logo → ul → button). This is a cosmetic/consistency issue only — CSS uses descendant selectors, JS uses `querySelector`, neither cares about sibling order. Not changed to minimize diff.

---

*Report generated automatically by mobile-consistency-checker scheduled task.*
