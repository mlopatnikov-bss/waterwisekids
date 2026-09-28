# Mobile Consistency Report — 2026-08-27

**Method:** headless Chromium render sweep (not grep). 32 pages covering all 20
distinct markup variants of the 745-page corpus, at 375×812 with an iOS UA.
Plus a 6-width overflow probe (320/360/375/390/414/430) on five key templates
and a tablet-band probe (769–1440px).

**Audited against the live branch clone** (`404b56b`), not the mount, which was
7 days stale at `2476831c`.

**Probe integrity:** every page carried a canary — a deliberately broken 10×10px
/ 6px-font link injected at measurement time. 32/32 pages confirmed the tap and
text probes actually fire, so a clean result means measured-clean, not
never-measured. 0 page load errors, `innerWidth` verified 375 on all 32 (no
mobile-emulation inflation).

**Shipped:** `ad4f5394` → `live`, verified on waterwisekids.com.

---

## Result

| Check | Before | After |
|---|---|---|
| Horizontal overflow, 320–430px | 0 pages | 0 pages |
| Horizontal overflow, **769–1125px** | **every page** | **0** |
| Images wider than viewport | 0 | 0 |
| Inputs <16px (iOS zoom trigger) | 0 | 0 |
| Rendered text <12px | 1628 | 1341 |
| Tap targets <44px | 83 | 67 |
| Hamburger drawer opens | 32/32 | 32/32 |
| Viewport meta present, no `user-scalable=no` | 745/745 | 745/745 |

Residual counts are the documented-intentional set, itemised below.

---

## 1. The mobile text floor has been silently 12.5% short — root cause found

`main.css` sets `html { font-size: 15px }` at ≤768px and `14px` at ≤480px.
Every `rem` font-size in `m-app.css` was authored against the 16px default root.
So on a phone each one renders 6.25–12.5% smaller than the value written.

Nine declarations clear 12px on paper and fall under it on a real device:

| Selector | @16px root | @14px root |
|---|---|---|
| `.hero p` | 13.60px | **11.90px** |
| `.page-hero .hero-sub` | 12.80px | **11.20px** |
| `.page-hero .lead` | 12.80px | **11.20px** |
| `.section-header p` | 12.96px | **11.34px** |
| `.article-card-excerpt` | 12.96px | **11.34px** |
| `.search-pill-title` | 12.96px | **11.34px** |
| `.newsletter … p` | 12.00px | **10.50px** |
| `.cat-btn` | 12.00px | **10.50px** |
| `.newsletter … submit` | 12.96px | **11.34px** |

`.article-card-excerpt` alone is **353 card descriptions on `/education/`** — the
site's largest index page — rendering at 11.3px.

**Why it survived every previous audit:** the trap was already documented twice,
for the printable worksheets' own `html { font-size: 14px }` breakpoint and for
`.myth-label` in article.css (Text Floor Round 4). Both times it was treated as
a printable-scoped quirk. It was never swept against `m-app.css` itself, because
a grep for "font-size below the floor" evaluated at a 16px root shows all nine of
these as *passing*. Only rendered measurement at 375px exposes them.

**Fixed** with `max(Npx, <the rule's own rem value>)` — 12px for prose, 11px for
controls, matching the existing house floor for non-prose labels. Deliberately
*not* `max(Npx, 1em)`, which resolves against the inherited parent size and would
inflate rather than floor.

## 2. Breadcrumb "Home" — 44px tall, 33–37px wide

Every breadcrumb pass to date (2026-08-16 and the four-variant pass) set
`min-height: 44px` and stopped there. `min-height` without `min-width` is a half
fix: the first crumb is always the word "Home", so the target has been failing
the 44px standard on its short axis this whole time, across **all four** markup
variants (`.page-breadcrumb`, `.wwk-breadcrumbs`, `nav[aria-label="Breadcrumb"]`,
and the classless inline-styled bar on 398 pages).

Added `min-width: 44px`. All four variants now measure **44 × 44**, confirmed by
direct re-measurement.

## 3. Tablet dead band — the whole site scrolled sideways at 769–1125px

The header nav is a non-wrapping flex row that needs **924px**, and the hamburger
that replaces it only takes over at `max-width: 768px`. That leaves a ~357px-wide
dead band where the row can neither fit nor wrap: `scrollWidth` measured a
constant **1126px on every page** from 769px up to 1125px, with the last two or
three nav items off the right edge.

This is not academic — iPad portrait is 810px, iPad Pro 11" is 834px, iPad
landscape and most Android tablets and small laptops are 1024–1112px.

**Why both existing sweeps miss it:** the mobile sweep probes ≤430px, the CSS
regression sweep probes ≥1280px. `scrollWidth` is clean at both ends and broken
only in between.

Fixed inside the band only: released `nav`'s hard `height: 72px` to a
`min-height`, allowed the row to wrap, and tightened link padding so 790–1125px
still renders on one line. Verified ≥1126px is byte-identical.

Two things worth recording from the fix:

- The first attempt used `header > nav` and silently matched nothing — the
  dominant markup variant nests the nav as `header > div.container > nav`. Only
  re-measuring `headerH` caught it. The child combinator main.css already uses at
  line 549 covers a different header variant.
- The obvious alternative — raising the hamburger breakpoint to 1126px — was
  rejected: `.hamburger` and every `nav.mobile-open .nav-links` drawer style live
  inside main.css's `max-width: 768px` block, and m-app.css's phone layout is
  gated at 768px too, so the toggle would appear in the band while the drawer it
  opens stayed unstyled. That's a template change, not a stylesheet change.

---

## Checked and deliberately not changed

- **`.related-articles ul li a` at 24px tall (486 pages).** The 2026-08-2x pass
  correctly ruled these non-exempt and deliberately chose 24px — the WCAG 2.2 AA
  minimum — over 44px, with the documented reason that 44px "visibly thickens the
  bar on every article page." That is a reasoned trade-off, not an oversight, and
  raising it unilaterally would reverse it. Same for `.toc-list a` and the
  inline-styled breadcrumb bar's own link height.
- **Residual 67 sub-44px tap targets** are inline links inside sentences —
  `.offer-card > p > a` and `.tldr-box > a`. WCAG 2.5.8 exempts targets in a
  block of text. (Probe note: these were `display: inline-block`, so the prose
  filter's `display === 'inline'` test missed them; classified manually.)
- **Residual 1341 sub-12px text** is the by-design set already documented in
  m-app.css: `.mobile-bottom-nav a` (9.92px), `.mobile-cat-item` (9.60px),
  `.article-card-category`, `.search-pill-sub`, `.stat-label`,
  `.footer-bottom`, `.state-link`, plus every printable-scoped selector. All 15
  inline-`<style>` small-font files are printables, excluded by convention.

## Open / carried forward

- `aquatic-jobs/index.html` — console error fetching the Google Apps Script jobs
  endpoint. Matches the known open jobs-API issue; CORS-blocked from localhost so
  this run adds no new information either way.
- Two pages (`swim-school-policy-fine-print-checklist*`) landed on `live` mid-run
  still referencing `main.js?v=20260826c`. Bumped in a follow-up commit — all 734
  pages now on `20260827a`. This is the third occurrence of new pages missing an
  in-flight cache-bust.
- **Probe timing caveat:** `.cat-btn` (95 JS-rendered filter buttons on
  `/education/`) did not appear in the pre-fix sweep but did in the post-fix one,
  at 11px. The CSS says `0.75rem` → 10.5px before the fix, so this is an
  improvement either way, but `networkidle` + 350ms is evidently not always
  enough for JS-injected controls. Future runs should wait on the element, not
  the clock.
