# Mobile Consistency Report — 2026-08-21

Method: headless Chromium render sweep (not a CSS grep) over 41 pages sampled to
cover every distinct stylesheet combination in the tree, at **320px, 390px and
768px**, mobile UA + touch emulation, served over HTTP (not `file://`).

## Clean

| Check | Result |
|---|---|
| Responsive viewport meta | 41/41 present, all `width=device-width` |
| Horizontal overflow (`documentElement.scrollWidth` vs nominal) | 0 pages @320 / @390 / @768 |
| Image overflow / scaling | 0 pages |
| Hamburger menu (clicked, asserted nav-link count rises) | 41/41 working |
| Text below the 11px floor | none outside the documented carve-out |

## Fixed this run

### Table-of-contents links below the 44px house standard — ~297 pages

TOC links rendered at **24–38.2px** across **three** markup variants, none
reaching the 44px standard this same stylesheet applies to every other
standalone navigational link:

| Variant | Instances | Pages | Measured @390px |
|---|---|---|---|
| `<a class="toc-item">` | 1,735 | 233 | 38.2px |
| `<div class="toc-list"><a>` — **no class on the anchor** | 628 | 64 | 24.0px |
| `<div class="toc-item"><a>` | 402 | — | inner `a` 36px |

Root cause is a rule collision, not a missing rule. Round 3 correctly set
`.toc-item { min-height: 44px }`. Round 4 then added `a.toc-item
{ min-height: 36px }` — specificity (0,1,1) beats (0,1,0), so the narrower,
later rule **silently regressed the earlier 44px decision to 36px**. Round 5's
`.toc-list a { min-height: 24px }`, equal specificity and later still, knocked
the in-list case down again. The stylesheet ended up holding three contradictory
decisions about one element, and the second variant — a bare `<a>` with no class
at all, 64 pages — was never reached by any of them.

Fixed with one rule appended last in the `@media (max-width: 768px)` block,
covering all three variants so no earlier round can win on order. Verified by
re-render: **min height 44px, 0 links under 44, 0 overflow at both 320px and
390px.**

## Confirmed false positives — do not "fix"

- **10px labels in `.mobile-bottom-nav` and `.mobile-cat-item`** — documented
  carve-out, stated in `m-app.css` itself. 181 + 31 instances.
- **`label.fwsp-check` checkboxes on `/tools/family-water-safety-plan.html`** —
  the `input` measures 24×24 and 13.33px, but the clickable surface is the
  wrapping `<label>`, which measures **51–65.6px**. The sub-16px font is on a
  checkbox, which does not trigger iOS zoom. 18 instances, all clean.
- **Breadcrumb links measuring 44 × ~29-40** — 44px tall; the sub-44 dimension is
  inline text width, which the tap-target rule does not govern.
- **Inline citation links** (CDC, AAP, Red Cross) at 15–16px inside `.tldr-box`,
  `.stat-box` and `.article-body` — `display: inline` inside a sentence, exempt
  under WCAG 2.5.8. They evade a naive `closest('p,li')` filter only because
  their parent is a `div`.

## Noted, not changed

`m-app.css` rounds 3–4 target a **44px house standard**; round 5 (lead-magnet
direct links, sidebar/related nav lists, ~139 pages) deliberately reasons to the
**WCAG 2.5.8 AA 24px minimum** instead. Those pass the standard their author
chose, so they were left alone — but the stylesheet now applies two different
tap-target standards to comparable elements. Worth a deliberate decision rather
than a drive-by change.
