# Mobile consistency report — 2026-08-29

**Method:** headless Chromium render sweep of a fresh clone of `origin/live` served over HTTP.
749 pages parsed statically; 75 render representatives (one per 4-part markup key: header hash,
footer hash, stylesheet set, inline `<style>` hash) rendered at **320 / 375 / 414 / 769 / 900 /
1149 / 1200 / 1440px**; the **full 749-page corpus** rendered at 375 and 800px for overflow and
image scaling. Every sweep asserted `errors == 0`.

**Result:** five defect classes found, all fixed and live. Deployed as `eca0a5e` + `0a95b31`.

---

## The finding: everything m-app.css floors on phones un-floors at 769px

`m-app.css` is injected by `main.js` only at `≤768px`. Five control classes are floored to the
44px house standard there, and every one of them snapped back below the **WCAG 2.5.8 (AA) 24×24
minimum** the moment the viewport hit 769px — a band that is entirely touch devices (iPad portrait
768–834, iPad Pro 11" 834, iPad landscape 1024). This is the same class of defect as the
2026-08-28 checkbox/radio finding, which is why the fix went into the media block that finding
created.

| class | ≤768px | 769–1149px (before) | scope |
|---|---|---|---|
| `footer .footer-links a` | 44px | **23px** | 74/74 non-stub reps — sitewide |
| `.article-card a` ("Read Guide →") | 44px | **23px** | homepage card grid |
| `a.toc-item` / `.toc-item a` | 44px | **20px** | table-of-contents rows |
| text `input` / `select` / `textarea` | 16px | **15.2 / 14.4px** | 18 reps — iPadOS focus-zoom |
| `.state-link` | 44px | **22px** | directory hub, at *every* width ≥769 |

None of these is a link inside a sentence, so the WCAG 2.5.8 inline exception does not apply.

### Fix 1 — main.css tablet-band block

Added to the existing `@media (min-width: 769px) and (max-width: 1149px)` block: a 24px
`min-height` floor with `inline-flex` centering for the three link classes, and a 16px
`font-size` floor for text-entry controls.

The font-size rule **needs `!important`** and this is not defensive padding — the first version
of the rule measured **15.2px unchanged**. Every one of those controls is sized by a page-level
`<style>` block (`.form-group input` on /contact/, `.job-search-bar input` on /aquatic-jobs/),
which sits later in the cascade than any external stylesheet. `m-app.css` flags the identical
mobile rule for the identical reason.

### Fix 2 — the printable stylesheets needed the same rule mirrored

After the main.css fix landed and verified, **33 of the 74 reps still measured 23px**. All 33
were printable landing pages, which load *only* `printable-checklist.css` (32) or
`printable-poster.css` (1) — no main.css, no m-app.css. The band block was mirrored into both
sheets, scoped `@media screen and (...)` so it stays out of the print stylesheet. The same
mirror also carried the 16px input floor, which cleared the last lead-capture field.

This is the recurring standalone-stylesheet drift: **a sitewide CSS fix is not sitewide until
both printable sheets carry it.**

### Fix 3 — `.state-link` was a page-level divergence, not a band issue

`/swim-lessons/directory/` declared `.state-link` with no padding, so its 51 state chips rendered
as bare 22px text links at **every** width ≥769px, desktop included. The identical state grid on
`/swim-lessons/` pads its chips to 45px. Fixed on the page itself (flex centering, `min-height:
44px`, `padding: 6px 8px`) so it matches its own mobile rendering and its sibling page at all
widths — not band-scoped, because this was never a breakpoint problem.

### Cache-bust

`main.css`, `printable-checklist.css`, `printable-poster.css`: `?v=20260829a` → `?v=20260829c`,
**732 refs across 732 files**, zero residual `20260829a` asserted. `c` chosen because `a` and `b`
were both already spent today. Version bumped *after* local verification. A second commit caught
2 pages added to `live` mid-run (`sick-day-swim-lesson-decision-guide{,-printable}.html`) that
would otherwise have shipped pointing at the stale key.

`sitemap.xml` `lastmod` and JSON-LD `dateModified` deliberately untouched — a CSS target-size
change alters no body text.

### Verified on production

At 900px on live: footer links 24px, `.article-card a` 24px, state chips 44px, `/contact/` inputs
16px, printable footer links 24px. At 375px all five unchanged at their 44px mobile values.

---

## Checked and clean

- **Viewport meta** — 749/749 pages carry `width=device-width, initial-scale=1.0`. Zero
  `user-scalable=no`, zero `maximum-scale`.
- **Horizontal overflow, full corpus** — 749/749 clean at 375px and at 800px.
- **Image scaling** — 0 images wider than the viewport across the full corpus at either width.
- **Hamburger menu** — 75/75 reps at 320/375/414px: toggle found, clicked, drawer opened with
  measurable height, visible, opacity > 0.1. Zero failures. Correctly absent at 769px+.
- **iOS focus zoom** — now 0 controls under 16px at every width tested, mobile and tablet band.
- **Header / footer markup variants** — 7 non-empty header and 2 non-empty footer variants,
  matching the recorded tripwire exactly. (Raw hashes read 13 and 5; the extra buckets are
  path-depth `../` prefixes and `active` classes. Normalise before comparing, and drop the
  empty-string bucket from the 17 redirect stubs.)
- **Root font size** — 14px at ≤768, 16px at 769+. Any `rem` threshold grepped against a 16px
  root will misreport on mobile.
- **Text floor** — one 10px `SPAN` sitewide (the bottom-nav label, held at 10px on purpose);
  printable cards carry 10.2–10.9px brand/tag text and are print-first by convention.

## Probe traps hit this run — worth remembering

- **Rendering a redirect stub measures the *target* page mid-load.** `about.html` and `teens.html`
  are `meta http-equiv="refresh"` stubs; Playwright follows the refresh and evaluates on the
  destination *before* `main.js` has injected `m-app.css`. That produced two phantom defects —
  20px footer links and a 385px scrollWidth on `/teens/` — neither of which reproduces once the
  page settles. **Exclude the 23 stubs from render sweeps**, or the sweep invents work.
- **`/teens/` `.salary-table` extends 9px past 375px but is not a defect** — it sits inside
  `<div style="overflow-x:auto">` and scrolls in its own box; document `scrollWidth` is 375.

## Known non-defects (do not re-report)

- Inline prose links measuring 14–20px tall whose parent is a bare `<div>` (`.tldr-box`,
  `.stat-label`, `.article-body` text). ~100 per page-set at 769px+. These are links in a
  sentence — WCAG 2.5.8 inline exception. The `display:inline` + parent-tag whitelist filter
  must include the case where the text node's parent is a `DIV` with no `<p>` wrapper, or the
  sweep reports ~100 false positives per width.
- `.offer-card p a` at 19px on `/about/`: `display:inline-block` prose links inside a sentence.
  Exempt, but the `inline-block` display defeats a naive `display === 'inline'` filter.
- Breadcrumb links at 16–17px inline in the tablet band. Constrained by the line-height of the
  non-target `/` separators; the 36px mobile treatment is deliberate.
- `<label>` elements above their inputs at ~21px.

## Open, needs Michael

- **Above 1149px the target-size floor still does not apply.** `.article-card a` (23px),
  `.toc-item` (20px) and `footer .footer-links a` (23px) revert to their bare line boxes at
  1150px+. That is the site's standing convention — mouse territory — but WCAG 2.5.8 is not
  viewport-conditional, and large touch laptops and iPad Pro 12.9" landscape (1366px) sit outside
  the band. Widening the band, or switching the floor to `@media (pointer: coarse)`, is a
  judgement call, not a defect. **This is the second run to raise it** (first: 2026-08-28, on
  checkboxes and radios).
