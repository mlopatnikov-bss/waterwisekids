# CSS Regression Check — 2026-08-15

**Result: 3 regressions found and FIXED. Pushed to `live` (157482c), deploy verified on the live site.**

## Scope

721 HTML pages scanned (up from 719 on 08-14) across every template type: homepage,
education article (399), top-level pages (148), printable checklists (73), printable
poster (1), state directory (52), section hubs (46), 404, and 13 legacy redirect stubs.
13 stylesheets compared rule-by-rule.

## Checks & results

| Check | Result |
|---|---|
| Nav markup identical across templates | PASS — 708/708 content pages, 1 variant, same 9 links |
| Footer markup identical across templates | PASS — 708/708, 1 variant, same 11 links |
| Mobile nav toggle present | PASS — 708/708, zero missing |
| Rogue inline `style=` on header/nav/footer | PASS — only the canonical 28px logo sizing |
| Stylesheet cache-bust version uniform | PASS — all 13 single-valued |
| Analytics/GTM present | PASS — 0 pages missing |
| Component CSS attachment per page type | PASS — no cross-contamination |
| Orphaned classes (per element) | PASS — 0 classes / 0 elements |
| Font loading consistent | PASS — Inter on all content pages |
| Local `<style>` blocks overriding nav/footer | PASS — 5 hits, all legitimate page-scoped |
| **Nav computed style parity: standalone stylesheets vs main.css** | **FAIL → FIXED** |
| **Footer color parity: standalone stylesheets vs main.css** | **FAIL → FIXED** |
| **iOS input auto-zoom fix coverage** | **FAIL → FIXED** |

## Root cause common to all three

Printable pages are **standalone** — they do not load `main.css`. Their chrome is
re-declared in `printable-checklist.css` and `printable-poster.css`. `printable-checklist.css`
received a parity pass in an earlier session; **`printable-poster.css` never did**, so it has
been drifting from the sitewide spec unnoticed. Every sitewide CSS fix since then — including
yesterday's iOS input fix — silently skipped it.

## Regressions found & fixed

### 1. Poster-page nav visibly off-spec (user-facing)

`printable-poster.css` rendered a materially different header from every other page:

| Property | Sitewide (main.css / checklist) | Poster (before) |
|---|---|---|
| nav height | 72px | **64px** |
| `.nav-logo` font-size | 1.1rem | **1rem** |
| `.nav-links` gap | 2px + 8px/14px link padding | **1.5rem, no padding** |
| `.nav-links a` font-size | 0.9rem | **0.85rem** |
| link hover | grey pill (`#f3f4f6`) + blue text | **colour change only, no pill** |
| mobile drawer offset | 72px | **64px** |
| mobile tap target | 44px min-height | **~38px** |

Navigating from any page to the poster page produced a visible 8px header jump and a
different link treatment. The mobile tap targets were also below the 44px accessibility
minimum.

**Fix:** all seven properties brought to the sitewide values.

### 2. Poster footer used an off-palette blue

`footer { background: #0c2a43; color: #cbd5e1; }` — neither value is in the brand palette.
Sitewide the footer is `--blue-900` = `#0c4a6e` with `#e0f2fe` text. `#0c2a43` is a
noticeably darker, desaturated navy and `#cbd5e1` is grey rather than pale blue, so the
footer read as a different brand on that page. Padding was also short by `1.5rem` on the
bottom.

**Fix:** `#0c4a6e` / `#e0f2fe` / `2.5rem 1.5rem 1.5rem`.

### 3. Yesterday's iOS zoom fix never reached the printable templates

The 08-14 fix added `font-size: 16px !important` for inputs under 768px — but placed it in
`main.css` only. `education/pool-safety-rules-printable.html` carries a live email-capture
input styled at `0.95rem`. Printables use the browser-default 16px root (no rem shrink),
so that computes to **15.2px — under the 16px threshold, so iOS Safari still zoomed on
focus** and the user had to pinch back out to finish the form.

**Fix:** the sitewide input rule mirrored verbatim into **both** `printable-poster.css` and
`printable-checklist.css`, with a comment explaining why the duplication is required. The
checklist copy is a no-op today (those pages have no inputs) but closes the gap for the
whole template family.

## Verification

- Nav/footer property diff re-run: **0 real divergences**. The two remaining textual diffs
  are false positives — `#0c4a6e` *is* the literal value of `var(--blue-900)` (standalone
  sheets can't reference main.css variables), and the missing `.footer-bottom` `text-align:
  center` is inherited from `text-align: center` on the `footer` element itself.
- Orphan-class scan post-fix: 0 classes / 0 elements.
- Brace balance verified on both edited stylesheets (101/101 and 82/82).
- `git status` showed exactly 76 files as `M`, zero `A` — no accidental new files staged.
- Cache-bust bumped to `v=20260815` on both stylesheets (74 pages).
- **Live verified:** poster page serves `?v=20260815`; the deployed CSS contains
  `height: 72px`, `#0c4a6e`/`#e0f2fe`, and the `16px !important` block. Homepage,
  a checklist page, an article, and a state directory page all return 200.

## Noted, not changed

- **13 legacy redirect stubs** have no nav/footer/font (2.6–3.8 KB meta-refresh pages).
  Expected — they are `noindex` + canonical, matching the 08-15 fix from the earlier session.
- **`m-app.css` is dead code.** It defines `.newsletter-section` and `.search-box` mobile
  overrides at `0.81rem`/`0.88rem` `!important`, which would *reintroduce* the iOS zoom bug —
  but zero pages reference it. Worth deleting on the next Mac Mini pass (the mount can't
  unlink); harmless while unreferenced.
- **Off-palette hex values** (~16 per stylesheet) are supporting slate/sky shades outside the
  core token set. Long-standing and consistent, not a regression. A palette-token
  consolidation would be a separate deliberate project.
- **22 of 74 printables** duplicate the `@media print` chrome-hiding rule locally when the
  shared stylesheet already provides it. Redundant, not conflicting.

## Cleanup

Workspace cleanup ran as the final step: npm cache, `~/.npm`, `~/.cache`, and `/tmp/wwk-*`
scratch files cleared.
