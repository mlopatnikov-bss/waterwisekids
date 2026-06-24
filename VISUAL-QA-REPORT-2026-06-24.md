# Visual QA Report — 2026-06-24

Daily visual design audit of waterwisekids.com. Representative pages from each template type were screenshotted (desktop window + mobile breakpoint at 606px) and inspected for alignment, color, typography, broken icons, spacing, and visual regressions.

## Pages reviewed
- Homepage (`/`) — hero, category icon row, stats bar, "What We Offer" cards
- Education index (`/education/`) — hero, filter chips, featured guide cards/banners
- Article — parent guide (`/education/water-safety-for-kids.html`)
- Article — printable/checklist style (`/education/bathtub-safety-checklist.html`)
- Aquatic Jobs board (`/aquatic-jobs/`) — search, filters, "Post a Job"
- Swim Lessons landing (`/swim-lessons/`) — state directory grid

## Issue found & fixed

### Mobile: article `.stat-box` text was dark-on-blue (illegible) — FIXED
**Severity:** High (legibility) · **Scope:** 193 article pages with a stat box · **Surface:** mobile only (≤768px)

**Symptom:** On the article stat callout (e.g. the "88%" box), the big number and its caption rendered in dark blue on the box's medium-blue gradient background, making both nearly invisible on phones. Measured computed colors: number `#075985`, label `#0284c7` (the label was the *same* color as the background).

**Root cause:** `assets/js/main.js` dynamically injects `assets/css/m-app.css` on screens ≤768px. That file styled the homepage's light stat *pills* with `.stat-number { color:#075985 !important }` and `.stat-label { color:#0284c7 !important }` — but the selectors were **unscoped**, so the `!important` dark colors also overrode the article `.stat-box` children, which were supposed to inherit white from their blue container. Desktop was unaffected because m-app.css only loads on mobile.

**Fix:** Scoped the two mobile rules to the components they were meant for — `.stat-item` (homepage pills) and `.stat-card` (scholarships page) — so they no longer bleed onto the article `.stat-box`. The stat box children now correctly inherit white on the blue gradient.

```css
/* before */               /* after */
.stat-number  { ... }      .stat-item .stat-number, .stat-card .stat-number { ... }
.stat-label   { ... }      .stat-item .stat-label,  .stat-card .stat-label  { ... }
```

**Before:** `#075985` number / `#0284c7` label on a `#0284c7→#0369a1` gradient — invisible.
**After:** `#ffffff` number / white label on the blue gradient — high contrast, legible. Homepage pills and scholarship stat cards keep their existing blue-on-light styling.

**Deploy:** committed to `live` (HEAD `6307b64`). Cache-busted `main.js` (585 pages) and the injected `m-app.css` to `?v=20260626`. Verified at source via GitHub raw: scoped selectors present, zero unscoped `.stat-number`/`.stat-label` rules remain.

## Clean (no action needed)
- Homepage, education index, jobs board, swim-lessons landing, and both article styles: alignment, typography, icons, spacing, and color all rendered correctly on desktop and mobile.

## Notes for next run
- **Don't pre-fetch a new `?v=` URL before GitHub Pages finishes building.** Doing so caches the *old* file under that version key in Cloudflare (4h TTL). Verify origin propagation with a throwaway random query param first; only then touch the real version key. (This run bumped through v=20260624→25→26 to recover from one poisoned key.)
- Homepage still hard-codes "331 Free Safety Guides" (stat bar) — count-drift vs the rendered `/education/` card count is owned by the growth/content loop, not this visual pass; flagged for awareness only.
