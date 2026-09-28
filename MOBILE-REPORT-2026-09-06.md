# Mobile consistency check — 2026-09-06

Rendered (not grepped) with headless Chromium at **320 / 390 / 768 px** across all
**742 non-stub pages** of a fresh `origin/live` clone. Deployed as `3673eda` +
`21ebbbf` on `live`.

## Result

| Check | Before | After |
|---|---|---|
| Viewport meta present, no zoom blocking | 742/742 | 742/742 |
| Horizontal overflow | 0 | 0 |
| Images wider than the viewport | 0 | 0 |
| Tap targets under WCAG 2.5.8 (24×24) | 0 | 0 |
| Form controls under 16px (iOS focus zoom) | 0 | 0 |
| Text under the 11px site floor | 0 | 0 |
| Hamburger opens / closes, drawer on the rail | 29/29 reps | 29/29 reps |
| **Leftmost text on the 20px chrome rail** | **721/742** | **742/742** |
| JS page errors / render errors | 0 | 0 |

The only open defect class was the **left rail**: 21 pages put their leftmost
visible text somewhere other than the 20px gutter used by the nav logo above it
and the footer below it.

## Fixed

**1 — 18 checklist printables sat at 14px or 16px.**
The bottom "Related Water Safety Guides" band carries its gutter in a **style
attribute**, which outranks any stylesheet rule — so the 2026-09-01 pass that
moved `.print-toolbar` / `.checklist-page` / `.screen-cta` onto the 20px mobile
rail could not reach it. On 14 pages the attribute reads `padding:0 1rem`, and
`1rem` is **14px** there because the sheet drops the root to 14px at ≤480px; on
4 more, `.screen-cta` carries an inline `padding:20px 16px`. The other 77
checklist printables put the same band at 20px, so this is drift, not design.
Corrected with attribute selectors inside the sheet's existing `≤768px` block —
an 18-file HTML diff stays out of the deploy and desktop is untouched.

**2 — 1 poster printable sat at 16px.**
`printable-poster.css` aligned `header nav` to the 20px rail on 2026-08-30, but
`body`'s own gutter never moved, so the h1 and every paragraph rendered 4px
inboard of the logo and the footer. Moved `body` to 20px at ≤768px and carried
the header/footer negative margin with it, so the chrome stays full-bleed.

**3 — 3 education articles rendered text at x=0, flush against the screen edge.**
`.related` (and on two of them the `#sources` + `.related-articles` run as well)
was emitted **after the layout wrapper closed**, as a direct child of `<body>` —
full-bleed, no gutter, and at desktop no max-width either. 311 of the 314 pages
that have a `.related` block nest it inside `.article-body`; these 3 did not.
Moved as balanced raw-string runs, asserting an identical sorted word list and
identical `<a>`, `<img>`, `<div>` and `<section>` counts, then re-parsed with
lxml (0 errors).

- `education/family-swim-time-guide.html`
- `education/free-water-safety-resources.html`
- `education/water-safety-activities-schools.html`

**4 — a page published mid-run arrived with a stale cache-bust key.**
`education/swim-school-pool-tour-checklist-printable.html` landed during the
sweep still pointing at `printable-checklist.css?v=20260906a`, which this run had
already moved to `...b` — the fix would have been inert on it. Bumped, then
rendered clean at all three widths.

Cache-bust moved to `20260906b` on both printable stylesheets (97 pages). **No
sitemap `lastmod` or `dateModified` bump**: the CSS-reached pages have unchanged
HTML, and the 3 article edits are pure reorders with an identical word list.

## Verified clean, deliberately not "fixed"

- **3,710 instances of 10px text** — `.mobile-bottom-nav a` and `.mobile-cat-item`
  are pinned by an explicit `m-app.css` rule; 11px reflows those fixed 5-across
  rows. Deliberate.
- **Checkbox and radio inputs report 13.3px.** They do not trigger iOS focus zoom.
- **Inline citation links inside body copy** (`display:inline`, or
  `inline-block`/`inline-flex` with no padding). WCAG 2.2 exempts inline targets;
  a probe that flags them reports ~30–90 false positives per sweep.
- **The 24.0px tap-target cluster** is an AA floor, not a near-miss.
- **`aquatic-jobs/index.html` `main` box-x = 0** is a probe artifact, not a rail
  defect — its `main` has no padding of its own and the content sits at 20px via
  an inner container. Box-x is not a rail proxy for `main`.

## Probe notes for next run

- Every sub-check was canary-gated against a synthetic page carrying each defect
  before the corpus ran. `is_mobile=True` in the Playwright context **hides
  horizontal overflow** — the mobile viewport rescales to fit content, so
  `scrollWidth > innerWidth` never fires. Use `is_mobile=False, has_touch=True`.
- The rail probe must take the **leftmost visible text node**, not
  `main.x + paddingLeft`. The narrow selector used first (`main p, .article-body p`)
  matched nothing on the 96 printables and would have missed all 19 of them.
- Markup-variant tripwire held: **6 header variants, 2 footer variants**.
