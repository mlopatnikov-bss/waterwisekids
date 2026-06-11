# Visual Design QA Report — 2026-06-11

Daily automated visual audit of waterwisekids.com (desktop 1200px, Chrome).

## Pages audited

Homepage, /education/ hub, 2 article pages, /swim-lessons/ directory, British Swim School program page (NW Philadelphia), /aquatic-jobs/, /swimmers-hub/, /scholarships/.

## Fixed and deployed (commit 3e42e09 on `live`)

**Duplicated intro paragraph on 16 education articles.** The styled lede (`.article-excerpt`) was a verbatim copy of the first body paragraph — in 13 cases truncated mid-word at 300 chars (e.g. "…the leading cause of unintentional i..."), shown directly above the full version of itself.

- Before: H1 → truncated excerpt "…unintentional i..." → identical full paragraph → Quick Answer
- After: H1 → single full intro paragraph → Quick Answer

Fix rule (no content lost): exact duplicate → removed redundant body copy, kept styled lede (3 files: measuring-swimming-progress, perpetual-vs-session-swim-lessons, distance-vs-skill-based-swim-progress); truncated duplicate → removed broken excerpt, kept full paragraph (13 files incl. backyard-pool-fence-requirements, swim-lesson-frequency-guide, parent-cpr-water-rescue-basics, private-vs-group-swim-lessons…). Verified live on both fix modes after deploy.

## Flagged — needs Michael's attention (not auto-fixed)

1. **Aquatic Jobs board shows "Unable to load jobs."** The backend Google Apps Script endpoint (`script.google.com/macros/s/AKfycbxccVXUow…/exec`) returned 503 in testing. Caveat: tested through Chrome MCP, which is known to block some requests (GA hits also showed 503 here) — please open /aquatic-jobs/ in a regular browser tab to confirm. If it fails there too, the Apps Script deployment likely needs redeploying from your Google account. Not fixable in site CSS/HTML.

2. **/swim-lessons/ copy vs. behavior mismatch.** Page says "Select your state to see swim schools…" but all 50 state names are intentionally inactive spans (`.related-area-inactive`) — nothing is clickable. Suggest either softening the copy or linking states once state pages exist. Left as-is (design decision, not a regression).

## Checked clean

Homepage (hero, stats bar, cards, state grid, newsletter CTA), education hub (search, filter chips, card grid — no duplicate card images among 227), article template (TOC sidebar, Quick Answer, CTA box), swim-lessons directory, BSS program page, Swimmer's Hub stroke cards, Scholarships page, unified nav/footer on all pages. No alignment, color, typography, or icon issues found.
