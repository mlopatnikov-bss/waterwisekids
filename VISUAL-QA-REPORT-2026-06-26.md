# Visual QA Report — 2026-06-26

Automated daily visual design audit of waterwisekids.com. Screenshots captured at desktop (1440px) across each template type; issues identified and fixed in HTML, pushed to `live`.

## Page types reviewed

| Template | Representative page | Result |
|---|---|---|
| Homepage | `/` | Clean — hero, stats bar (335 guides, consistent in both spots), What We Offer cards, featured guides, state grid, footer all correct |
| Education hub | `/education/` | Clean — teal gradient hero, breadcrumb, search, category chips, article-card grid all aligned |
| Article (TOC layout) | `/education/community-pool-swim-lessons-vs-swim-school.html` | Fixed — invisible callout text (see below) |
| Swimmer's Hub guide (full-width) | `/swimmers-hub/backstroke-complete-guide.html` | Clean after fix |
| 404 | (any bad path) | Clean — 404 mark, logo, nav links centered |

## Issue found & fixed

**White-on-light invisible `.stat-box` callouts — 75 instances across 75 pages.**

- **Symptom:** "Stat" / highlight callout boxes (e.g. the "88% reduction" drowning-risk box) rendered with body text nearly invisible — light/faded text on a cream or light-blue background. Only the one explicitly-colored word per box showed, appearing to "float."
- **Root cause:** `article.css` defines `.stat-box { color:#fff; background:<dark blue gradient> }` — correct for the dark-gradient variant. Many callouts override the background inline to a **light** color (`#fff7ed` cream, `#e0f2fe`/`#eff6ff`/`#f0f9ff` light blue) but did **not** override the text color, so they inherited white -> white-on-light = unreadable. Recurring generator pattern flagged in prior sessions ("light stat-box overrides need dark inline text color").
- **Fix:** Surgically prepended `color:#1e293b;` to every `.stat-box` inline style that has a `background` override but no `color` — matching the already-correct boxes on the site. Dark-gradient boxes (explicit inline `color:#fff`) and bare `.stat-box` elements (rely on dark-gradient CSS default) left untouched.
- **Scope:** 75 boxes / 75 files (article, swimmers-hub, local-landing pages).
- **Verification:** Re-fetched the article live post-deploy — the "88% reduction" box now shows full dark, readable text. 0 buggy instances remain, 0 corrupted elements, dark boxes intact (26 with `color:#fff`).

**Commit:** `[fix] Add dark text color to 75 light-background stat-box callouts (white-on-light invisibility bug)` -> `live` (33c261b)

## No other visual regressions

Nav, footer (dark blue, 8 links, email, copyright), hero color/contrast, card alignment, icons, and typography were consistent across all reviewed templates.
