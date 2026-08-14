# CSS Regression Check — 2026-08-14

**Result: 3 regressions found and FIXED. Pushed to `live` (dc2f8e1), deploy verified.**

## Scope
719 HTML pages scanned (up from 717 on 08-13). Every template type covered: homepage,
education article, education hub, state directory, topic hubs, printable checklists,
printable posters, local landing pages, About, Advertise, Aquatic Jobs, swim-schools hub,
statistics index, flagship annual report, 404, and redirect stubs.

## Checks & results

| Check | Result |
|---|---|
| Nav markup identical across templates | PASS — 706/706 content pages, same 9 links, 28px logo, container wrapper |
| Footer identical across templates | PASS — 706/706, same 11 links |
| Rogue inline `style=` on header/nav/footer | PASS — 0 across all 719 pages |
| main.css present + version uniform | PASS — 633 pages, all `?v=20260728b`, no drift |
| Analytics/GTM present | PASS — 0 pages missing |
| Component CSS attachment correct per page type | PASS — no cross-contamination |
| Font loading consistent | PASS (see note) |
| **Orphaned classes (used in HTML, undefined in CSS)** | **FAIL → FIXED** |
| **Component CSS cache-bust uniform** | **FAIL → FIXED** |
| **Inline styles defeating responsive media queries** | **FAIL → FIXED** |

## Regressions found & fixed

### 1. Orphaned `.info-line` — 12 unstyled elements on 2 printables (visual, user-facing)
`education/fall-swim-skill-retention-checklist-printable.html` and
`education/poolside-emergency-kit-checklist-printable.html` used `.info-grid` / `.info-line`
but shipped with **zero `<style>` blocks** and no matching rule in any stylesheet.

29 printables use this fill-in-the-blank pattern; 27 define the rules in a page-local
`<style>` block. These 2 were generated from a variant template that omitted it. Impact:
the dotted underline that makes the blanks writable was missing entirely — the defining
feature of a fill-in printable.

**Fix:** added the canonical local `<style>` block (byte-identical to the 27 working pages).

### 2. Inline `.info-grid` styles blocking the mobile breakpoint
The same 2 pages inline-styled the parent grid with `grid-template-columns:1fr 1fr`.
Inline styles outrank `@media` rules, so the fill-in lines stayed locked at 2 columns on
phones instead of collapsing to 1. 3 elements affected.

**Fix:** stripped the inline styles; the media query now applies.

*Note:* this pair is a textbook instance of the known trap — the inline style on the parent
masked the orphaned child class from class-level auditing. Detection required checking
**per element**, not per class.

### 3. Cache-bust drift on `printable-checklist.css`
`education/water-confidence-challenge-printable.html` referenced `?v=20260617` while the
other 71 printables were on `?v=20260722b` — a stale cache entry risk from a prior CSS edit.

**Fix:** unified to `?v=20260722b`. All 13 stylesheets now version-uniform sitewide.

## Verification
- Orphan scan re-run post-fix: **0 orphan classes, 0 instances** sitewide.
- Cache-bust scan post-fix: 72/72 printables on `?v=20260722b`.
- `git status` showed exactly 3 files as `M` (no accidental new files staged).
- Pushed `57d02e4..dc2f8e1` to `live`; confirmed live via `curl -L` on all 3 URLs.

## Notes (checked, not defects)
- 86 pages legitimately omit `main.css`: 72 printable checklists (`printable-checklist.css`),
  13 redirect stubs (no chrome by design), 1 printable poster (`printable-poster.css`).
- Printable pages load a lighter Inter subset (no italic/900). Intentional — those weights
  are unused in the printable stylesheets. Nav link set verified identical to `main.css` pages.
- `rel="stylesheet">` vs `rel="stylesheet" />` split (566/66) is cosmetic markup style only,
  no rendering difference. Not worth a 600-file diff.
