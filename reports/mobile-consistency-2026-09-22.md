# Mobile Consistency Check — 2026-09-22

**Corpus:** fresh clone of `origin/live` @ `f15723f`, rebased onto `ed1f919` (concurrent lead-magnet push, zero file overlap). 803 HTML − 24 redirect stubs = **779 live pages** (781 after `ed1f919`).
**Baseline:** `4798967` (09-21 mobile closure). CSS/JS delta since baseline: **none** — `m-app.css`, `main.css`, `main.js` untouched; the day's changes were HTML only (2 new CPR pages, 52 directory pages, 58 inline-colour fixes, link fixes).
**Pushed:** `39142d0` — 8 files, HTML only, no cache-bust key moved. Live-verified 8/8.

## Finding — the 09-21 "inert scroll wrapper" defect on 8 more pages

Same class fixed yesterday: an `overflow-x:auto` wrapper around a table with no `min-width` does nothing at ≤768. The table shrinks to fit, columns crush, and words break mid-word at 390px (`Haz|ard`, `Nat|ional`). Page overflow stays 0, so overflow checks miss it.

Yesterday found 7 pages by looking at them. Today every page with a table (59) was checked at 390. **8 still broken**, including today's new page `education/cpr-adults.html`, so new pages are still being published with this defect.

| page | cols | min-width | broken words at 390 |
|---|---|---|---|
| education/backyard-pool-fence-requirements | 3 | 520 | 6 → 0 |
| education/beach-flag-color-card (printable) | 3 | 620 | 19 → 1 |
| education/beach-warning-flags-explained | 3 | 520 | 2 → 0 |
| education/cpr-adults (**net-new today**) | 4 | 520 | 2 → 0 |
| education/lightning-pool-safety | 3 | 620 | 10 → 0 |
| education/swim-lesson-annual-cost-worksheet | 3 | 520 | 1 → 0 |
| education/swim-lesson-format-decision-worksheet | 4 | 620 | 7 → 0 |
| education/swimming-when-sick-kids | 2 | 520 | 3 → 0 |

Each value is the smallest on the house ladder {520, 560, 620} that removes the broken words. Page overflow stays 0 at 320/390/834/1280. The one word still breaking on beach-flag-color-card ("Dangerous") is a column-allocation leftover, like goldfish's 2 from yesterday. Left as is.

## All other checks clean
- **Static (779/779):** 1 viewport variant, 0 pages blocking zoom · `.hamburger` exactly ×1 · `main.js` on every page · 0 form pages missing the 16px input guard.
- **Rendered 111 pages @390 + 37 @320 + 2 net-new (`ed1f919`):** doc overflow 0 · element overflow 0 · text <11px 0 (bottom nav/category labels are 10px by design) · inputs <16px 0 · images broken/stretched 0 · footer rail 20 on all · m-app + bottom nav on all.
- **Hamburger clicked on 148 renders:** 148/148 `false→true`, 44×44, drawer `flex` at x=20 (350 wide @390, 280 @320).
- Readiness gate (poll for m-app.css rules) had 0 timeouts.

## Probe notes (not defects)
- h1 at x=41 on printables = card padding (by design); 404 h1 at 41 = centred text.
- 3 tap flags were probe artifacts or known backlog: two prose links wrapped in `<strong>` inside a sentence (exempt by markup), and the new watch-log page's standalone "Open the printable…" link at 320×17. That link belongs to the known standalone-block-anchor backlog and falls under the WCAG spacing exemption.
- En-dash ranges (`$65–$100+`, `88–92°F`) wrapping at the dash are normal line breaks, not defects.

## For Michael
1. **The table min-width fix belongs in `m-app.css`, not in each page.** This is the second day in a row that new pages shipped with the defect. Put a rule in the ≤768 block keyed on the scroll wrapper (e.g. `div[style*="overflow-x:auto"] > table { min-width: 520px }` plus the `.flag-scroll/.cost-scroll/.fmt-scroll/.wk-scroll` classes). New pages would get the fix automatically. It would also remove a trade-off in today's inline fix: at 834 (tablet) these 8 tables now scroll inside a 426px column, where before they fit without breaking words. This touches a shared stylesheet and needs a cache-bust, so it's your call.
2. 21px rail on `privacy/` and `jobs/post.html`: deferred again.
3. Desktop/tablet stacked gutter on the 122-page cohort: unchanged, still needs a decision.
