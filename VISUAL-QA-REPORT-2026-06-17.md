# Visual Design QA Report — 2026-06-17

Automated daily visual audit. Screenshotted a representative page from each template type at desktop width (1366px).

## Pages reviewed (13 templates)
Homepage · Education article · Education hub · Swim-lessons hub · State directory page (NJ) · BSS profile · Swimmer's Hub guide · Aquatic Jobs · About · Scholarships · Contact · 404 · Local landing page (Ambler PA)

## Issues found & fixed

### 1. [REGRESSION] Unstyled "rules-grid" component on pool-safety-rules.html — FIXED
- **Symptom:** The "10 Essential Pool Safety Rules" numbered list rendered as bare digits ("1", "2", "3"…) stacked above unformatted title/text — no cards, no hierarchy. Looked broken.
- **Cause:** The page uses a custom `.rules-grid / .rule-card / .rule-number / .rule-title / .rule-text` component, but those classes were defined nowhere in main.css or article.css (only in the unrelated printable-poster.css). The styles were lost during a prior inline-CSS strip, orphaning the component.
- **Fix:** Added the component CSS to `assets/css/article.css`, matching the site's design tokens (gray-50 card bg, blue-600 circular number badge, gray-200 border, hover lift, 2-col responsive grid → 1-col on mobile). Bumped the page's article.css cache-bust to `?v=20260617`.
- **Before:** flat digit-then-text list. **After:** numbered card grid consistent with site style. Verified live.
- Scope: only this one page uses the component.

### 2. [CONSISTENCY] Homepage guide count mismatch — FIXED
- **Symptom:** Hero stat said "247 Free Safety Guides" while the featured section link said "View All 291 Guides" — two different numbers on one page, both stale.
- **Actual count:** 292 education guides (excluding index + printables; no redirect stubs).
- **Fix:** Aligned both to 292. Verified live.

## Known open issue (not a CSS/visual fix)
- **Aquatic Jobs board** still shows "Unable to load jobs" — the Apps Script backend (503) remains down. Tracked separately; needs Michael. The error-state UI itself renders correctly (graceful degradation).

## Clean — no issues
Homepage hero/cards/icons, education hub (chips/search), swim-lessons hub, NJ directory (search box, results), BSS profile, Swimmer's Hub guide (TOC, callouts, stat box), About, Scholarships, Contact (form), 404 — all correct on alignment, color, typography, icons, and spacing.

## Note
Mobile-width capture did not drop below the responsive breakpoint this run (viewport stayed desktop); mobile responsive QA is owned by the separate mobile-consistency agent.

Deploy: commit a7a70da pushed to `live`.
