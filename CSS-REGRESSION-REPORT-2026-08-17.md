# CSS Regression Check — 2026-08-17

**Result: 4 regressions found and FIXED. Pushed to `live` (c41eebd), deploy verified on the live site.**

Method: headless Chromium render of 16 representative pages (one per template type)
at 1280px / 390px / 320px, comparing *computed* styles rather than grepping source.
48 renders + a 76-page sweep of every printable + live-site re-verification.

## Checks & results

| Check | Result |
|---|---|
| Nav computed style parity across 16 template types (desktop) | PASS — 1 variant: 73px, same bg/border/position/logo/link sizing |
| Footer computed style parity (desktop) | PASS — 1 variant: `#0c4a6e` bg, `#e0f2fe` text, 11 links |
| Nav/footer parity at 390px and 320px | PASS — 1 header variant, 1 footer variant |
| Mobile nav toggle 44px tap target | PASS — 44×44 on all 16 |
| Rogue inline CSS on header/nav/footer | PASS — only the canonical 28px logo sizing |
| Font consistency (Inter everywhere) | PASS |
| Page-level horizontal overflow @320px | **FAIL → FIXED** (3 printables) |
| TOC link colour consistency | **FAIL → FIXED** (1,734 anchors) |
| TOC tap target vs WCAG 2.5.8 AA | **FAIL → FIXED** |
| Flex title rows shrink below min-content | **FAIL → FIXED** |
| Stylesheet cache-bust uniformity | PASS after bump (one `v=` per push) |

## Regressions found & fixed

### 1. TOC links rendered as plain grey text on ~1,700 anchors (highest volume)

`article.css` styled TOC links with the descendant selector `.toc-item a`. The site
ships **two** TOC markup variants:

| Variant | Count | Matched by `.toc-item a`? | Rendered colour |
|---|---|---|---|
| `<div class="toc-item"><a>…</a></div>` | 402 | yes | `rgb(2,132,199)` link blue |
| `<a class="toc-item">…</a>` | **1,734** | **no** | `rgb(31,41,55)` body grey |

The dominant variant received no colour rule at all, so most tables of contents on
the site did not look like links. Invisible to source-grep audits — the class *is*
present and the CSS *does* define it; only a computed-style read exposes it.

**Fix:** `.toc-item a, a.toc-item` for both the base and `:hover` rules.

### 2. TOC rows below the WCAG 2.5.8 (AA) minimum target size

TOC links resolved to ~17.9px tall at 390px, under the 24px AA minimum.
**Fix:** 5px vertical padding on both variants at ≤768px → **27.9px**. Held to 24px+
rather than the 44px AAA figure deliberately: a 9-item TOC at 44px rows would add
~230px of scroll to every article on mobile.

### 3. Printable pages scrolled horizontally at 320px

`main.css` sets `overflow-wrap: break-word; word-wrap: break-word; overflow-x: hidden`
on `body`. **Printables are standalone and never load main.css**, so they had none of
these guards. The long underscore fill-in-the-blank runs (`.level-line`, signature
rules — 35 checklist pages contain 8+ character underscore runs) could not break,
forcing a 350px document into a 320px viewport.

**Fix:** mirrored all three guards into `printable-checklist.css` **and**
`printable-poster.css`.

### 4. Flex section titles could not shrink; wide table pushed the page

- `.cl-section-title` is `display:flex` whose children carry `white-space:nowrap`,
  with no `flex-wrap` and no `min-width:0` → 305px min-content inside a 230px box
  on the milestones sheet. **Fix:** `flex-wrap: wrap; min-width: 0`.
- The comparison worksheet's 4-column `.cw-table` scrolled the whole page.
  **Fix:** `.cl-section > table { display:block; overflow-x:auto }` at ≤600px, so
  wide tables scroll inside their own section. Container-level so it also catches
  the page-scoped tables other checklists define in local `<style>` blocks.

**Verified:** 76/76 printables clean at both 320px and 390px, then re-confirmed on
the live site after deploy.

## Investigated and deliberately NOT changed

**Mobile root font-size drift (printables 16px vs 14px sitewide).** Content pages ramp
`html { font-size }` 16→15→14px; the standalone printable stylesheets never do, so
shared chrome renders ~14% larger there (nav logo 15.2px vs 13.3px, drawer links
14.4px vs 12.6px). The chrome *rules* are already unified on identical rem values —
the root is the sole divergence.

I applied the matching ramp and measured the result: it introduced **270 instances of
sub-11px text** across the 76 printables (`.sm-date` 10.1px, `.cw-hint` 9.8px,
`.sig-label` 10.1px, and others) — breaking the 11px readability floor to fix a 1.9px
logo difference. **Reverted.** Pinning the printable chrome in px instead was also
rejected: it would break the rem parity established on 08-15 and create a fresh drift
vector. Recording the tradeoff here so it isn't re-litigated.

## Confirmed non-issues (do not "fix" these)

- **White mobile footer** (`#fff` bg, `#1f2937` text) vs the navy desktop footer —
  deliberate, documented in `m-app.css`, shipped 08-16.
- **10px bottom-nav and category-strip labels** — deliberate; 11px reflows the
  fixed 5-across row. All 87 sub-11px hits on content pages trace to these.
- **Desktop sub-44px tap targets** — 44px is a *touch* guideline; desktop is
  pointer-driven. Mobile is what matters and is now clean.
- **Inline prose links under 44px** — WCAG inline exception.

## Informational

`main.css` was last modified 08-16 (`d08589e`, the `minmax(min(220px,100%))` overflow
fix) but every page still requests `main.css?v=20260814b`. Live bytes are current
(both versions return an identical md5), so this only affects browsers holding a
pre-08-16 copy, and `max-age=14400` retires those within 4 hours. Not worth a 710-page
diff; noted so the pattern is caught if it recurs on a larger change.

`.level-line` (12 pages) is an orphaned class — no rule defines it in any stylesheet.
Harmless as authored (the `<strong>` and text render fine) but it is the same
orphaned-component pattern worth watching.
