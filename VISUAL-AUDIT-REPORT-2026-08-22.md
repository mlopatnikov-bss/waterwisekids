# Visual Design Audit — 2026-08-22

Method: fresh clone of `origin/live`, served over HTTP, rendered in headless
Chromium (Noto/DejaVu/Liberation fonts installed so emoji and icon glyphs
resolve — without them every emoji icon renders as tofu and fakes a
"broken icons" finding). 22 representative pages covering all 15 stylesheet
fingerprint groups, at 1280 / 390 / 320px. Contrast measured by resolving the
effective background through the ancestor chain and skipping any element whose
backdrop is a gradient or image (those cannot be judged from computed style);
the one gradient case was confirmed by sampling rendered pixels instead.

## P0 — Invisible button label on 126 pages

`.inline-cta .button-secondary` rendered its label in `#0369a1` on the
`.inline-cta` gradient (`#075985 → #0369a1`). Sampled background pixel behind
the label: `rgb(4,101,154)`. **Contrast 1.03:1 — the text was not visible at
all.**

`.inline-cta` declares its own dark background plus `color: var(--white)` and
then repaints `.kicker`, `h3` and `p` — but not `.button-secondary`, which
keeps `color: var(--blue-700)` from the bare class rule. Inherited white always
loses to a bare class selector. `.page-hero .button-secondary` received this
exact fix previously; `.inline-cta` never did.

Proof, by counting light pixels inside the button box (border ring cropped):

| | light glyph pixels |
|---|---|
| before | **0** of 10,716 |
| after | **1,068** of 10,716 |

Fixed in `main.css` alongside the existing `.page-hero` rule.

## P1 — 16 WCAG AA contrast failures (33 measurements across two viewports)

All now measure ≥ 4.5:1 (≥ 3:1 for large text). Sweep re-run after the fix
returns **0 failures**.

| Element | Page(s) | Was | Now |
|---|---|---|---|
| `.fwsp-note` `#94a3b8` on white | tools | 2.56 | `#475569` |
| `.price-highlight` `#f97316` on white | swim-schools/add | 2.80 | `#c2410c` |
| `.card-btn` white on `#f97316` | swim-lessons/ | 2.80 | bg `#c2410c` |
| `.breadcrumb span` `#888` on white | special-needs | 3.54 | `#595959` |
| `.cta-section .btn-primary` `#ea580c` | teens | 3.56 | `#c2410c` |
| `.pillar-card--butterfly .pillar-card-link` | swimmers-hub | 3.56 | `#c2410c` |
| `.fwsp-generate` white on `#0891b2` | tools | 3.68 | bg `#0e7490` |
| `.pillar-card--backstroke .pillar-card-link` | swimmers-hub | 3.74 | `#0f766e` |
| `.btn-secondary`, `.newsletter-form button` white on `--blue-600` | home | 4.10 | `--blue-700` |
| `.btn-primary` white on `--blue-600` | local town pages, teens | 4.10 | `--blue-700` |
| `.form-button` white on `--blue-600` | swim-schools/add | 4.10 | `--blue-700` |
| `.guide-link.alt` white on `#0284c7` | swim-lessons/ | 4.10 | `#0369a1` |
| `.visit-btn` white on `#0284c7` | scholarships | 4.10 | `#0369a1` |
| `section:not(.hero) .button` white on `#0284c7` | find-swim-lessons | 4.10 | `#0369a1` |
| `.coming-soon` `#64748b` on `#f1f5f9` | gear | 4.34 | `#475569` |
| `.related-area-inactive` `#6b7280` on `#f3f4f6` | local town pages | 4.39 | `#4b5563` |

This closes the open half of the brand-blue remediation: text had already moved
to `#0369a1`, but button *backgrounds* were still `#0284c7` (4.10:1) and the
orange CTAs were still `#f97316` (2.80:1).

## P1 — /teens/ hero stats block, mobile

The mobile chip-pill treatment in `m-app.css` only matches the homepage markup
(`.stats-bar > .stats-bar-inner > .stat-item`). /teens/ ships a second variant
(`.stats-bar > .stat > .stat-value + .stat-label`) with no `.stats-bar-inner`
and no `.stat-item`, so it picked up only the bare `background:#fff` and kept
its desktop grid. Its `rgba(255,255,255,0.1)` background is invisible once
`.hero` is flattened to white (which is deliberate site-wide).

Measured at 390px: **326px tall vs the homepage's 98px** — four full-width rows
of 25.2px values, no chip, no grouping. Now a 2×2 chip grid, **152px**, matching
the homepage treatment. No horizontal overflow at 320 or 390px.

Caught during verification: mirroring `.stat-item`'s `font-size: 0.62rem`
dropped the label to **8.68px** against the 14px mobile root, and — being the
more specific selector — silently beat the shared `11px` floor block. The rule
now declares no `font-size` at all so the floor wins. Re-render confirms zero
sub-11px text on /teens/ (the 10px `.mobile-cat-item` labels on the homepage are
the documented deliberate exception and are unchanged from baseline).

## P2 — Three CTA-alignment defects

Grid stretches sibling cards to equal height, but each card's CTA sat directly
after copy of varying length, so the CTAs floated at different heights with
ragged whitespace beneath.

| Grid | Page | CTA bottom spread |
|---|---|---|
| `.packages-grid .package-button` | /advertise/ | 42px → **0** |
| `.offer-cards .offer-card a` | / | 76px → **0** |
| `.stats-bar .stat-label` | /teens/ (desktop) | 46px → **0** |

Fixes are flex-column + `margin-top:auto` on the CTA (and
`justify-content:space-between` for the stat labels, so a value that wraps to
two lines — "Real Impact" — no longer drags its label below the other three).
`m-app.css` forces `.offer-card { display:block }` on mobile, where the cards
are single-column and none of this applies.

## Content defect — guide count understated 10×

/about/ advertised **"35 Free Water Safety Guides"** and "Today we have 35
in-depth education guides". The homepage said **348**. The real figure is
**405** indexable, non-printable pages under `/education/` (406 in the sitemap,
one of which is the hub itself). All four hardcoded spots reconciled to 405
against a single verifiable definition.

## Checked and deliberately not changed

- Emoji icons across gear / directory / teens cards. They render correctly with
  fonts installed; the tofu boxes seen in a first pass were a sandbox artifact,
  not a site defect.
- `.hero` flattening to white on mobile — documented deliberate behaviour.
- 10px `.mobile-cat-item` / `.mobile-bottom-nav` labels — documented deliberate
  exception; identical to baseline.
- Sub-40px inline prose links flagged by the tap-target probe — these are links
  inside paragraphs, not standalone controls.
- The 5-card and 6-card grids that wrap to an orphaned last row
  (/swim-schools.html, /teens/, /swim-schools/add.html) — natural wrap, no fix
  that does not hardcode a column count.

## Verification

- Contrast sweep, 22 pages × 2 viewports, after fixes: **0 failures**.
- Render sweep, 22 pages × 1280/390/320: **0 horizontal overflow**, 0 unexpected
  sub-11px text.
- Per-row CTA bottom spread on all three grids: **0px**.
- `.inline-cta` button label: 0 → 1,068 legible pixels.
- Cache-bust token unified to `?v=20260822a` across 1,158 references in 722
  files (stylesheet link count unchanged at 1,880) so the CSS changes actually
  reach returning visitors.
