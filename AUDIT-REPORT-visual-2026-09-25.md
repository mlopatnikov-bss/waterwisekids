# Visual QA — 2026-09-25

**Result: 1 issue fixed and pushed to `live` (`53728a7`), deployed and verified.**

Baseline `cc2189c` (09-24 visual run) → HEAD `8d3987f`: 5 commits. CSS changes: only the 09-24 mobile-consistency 44px touch-target rules. New pages: `education/parent-and-me-swim-class-card` (+ printable).

## Fixed: `/gear/` "What are the best goggles for kids?" section (added this morning in `8d3987f`)
- **Before:** the new section picked up the global `*{margin:0;padding:0}` reset. The H2 sat flush on the paragraph and was black at 36px, while the other gear headings are navy (#075985) at 1.8rem. The "5-second fit test" H3 sat flush on its list. The `<ol>` had no padding, so the 1/2/3 numbers hung outside the content column. There was also a ~200px gap before "Shop by Category".
- **After:** scoped rules in `gear.css` (`.gear-page .best-goggles …`). The H2 now matches the page's other section headings, the H3 has 2rem/0.75rem spacing, the list is indented 1.5rem with brand-blue markers, and the section padding is tightened (with a mobile variant). `gear.css` cache-busted to `v=20260925v` on `/gear/index.html`. I previewed it in the browser before pushing, then checked the live CSS after deploy.

## Automated sweep, 1280px (25 pages, cache-busted same-origin iframes)
Home, new Parent & Me card + printable, education hub, swimmers hub, kids-swim-lessons, swim-lessons hub, 3 AEO directory pages changed in this window (MS/ND/WV), a local page, gear, 2 education articles, BSS Jersey Shore, about, aquatic-jobs, jobs, swim-schools, scholarships, tools, for-swim-schools, contact, 2 legacy root pages.
- Contrast failures: **0** · horizontal overflow: 0 · broken images: 0 · main.js loaded 25/25 · exactly one H1 25/25

## Mobile check, 390px (this run used 390px iframes, which get around the Chrome zoom lock)
09-24 touch-target changes: `.cat-btn` (education/swimmers hubs), `.wwk-city-link`, and jobs `.filter-pills .pill` are all 44px tall with text centred (≤1px offset). No overflow at 390px on the pages tested. `.state-chip` did not render on /swim-schools/ at load, so I couldn't measure it.

## Screenshots reviewed
Home hero and stats band, Mississippi directory, Parent & Me article and printable, /gear/ before and after. No broken icons or emoji and no alignment regressions apart from the gear section above.

## Still waiting on your design call (no change)
Gold `.stars` on the 2 BSS pages, and grey `.page-breadcrumb a` link affordance.

## Note
The local project folder's `live` branch has diverged from `origin/live` (273 ahead / 38 behind). This run worked from a fresh clone, as earlier runs did, and did not touch the local checkout.
