# Visual QA — 2026-09-24

**Result: CLEAN. Nothing fixed, nothing pushed.**

- Clone of `live` at HEAD `cc2189c`; baseline `3c26896` (09-23 visual run). 5 commits, 36 files, **0 CSS/JS files changed**.
- New pages: `education/how-to-teach-a-child-to-swim`, `education/winter-swim-lesson-routine-card` (+ printable).
- Every colour added in the diff is an existing house value (`#0369a1`, `#0c4a6e`, `#64748b`, `#fff7ed`, etc.).
- Rendered sweep at 1280px (cache-busted same-origin iframes) on 20 pages covering home, the new pages, the education hub, kids-swim-lessons, the directory hub and 3 changed state pages (VT/ME/NH), articles, a printable, about, aquatic-jobs, tools and find-swim-lessons:
  - per-element WCAG contrast failures: **0/20**
  - horizontal overflow: 0 · broken images: 0 · main.js loaded 20/20 · exactly one h1 20/20
- Screenshots of the new article, lead-magnet landing and printable: header, breadcrumb, TOC sidebar, Quick Answer box, CTA card and checklist all look right. No broken icons.

**Not measured:** 390px mobile. The Chrome profile's page zoom pins the viewport, so the separate mobile-consistency task covers this.

**Still waiting on your design call (no change):** gold `.stars` (#fbbf24, 1.67:1) on the 2 BSS pages, and grey `.page-breadcrumb a` link affordance.
