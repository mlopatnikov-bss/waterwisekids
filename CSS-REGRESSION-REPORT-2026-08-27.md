# CSS Regression Report — 2026-08-27

**Method:** fresh clone of `live` (`4c59127`), headless Chromium render sweep,
**37 representative templates × 3 viewports** (1280 / 390 / 320), served over HTTP.
Computed styles — not greps — for header, nav, logo, nav links, footer, footer links,
plus tap targets, sub-11px text, overflow, root-font scaling, and rogue inline CSS.
Added this run: an **open-drawer state pass** (hamburger actually clicked) and a
**hover/focus state pass** on nav links, logo, and footer links.

**Result: 1 real regression found and fixed. Everything else clean.**

Deployed as `ea9cb09`, built by Pages in 33s, **verified live**.

---

## Fixed

### `advertise.css` was underlining the shared site footer on hover

`advertise.css` carried two bare element-selector rules that reached out of the page
and into the **shared site footer**:

```css
footer a      { color: #bfdbfe; text-decoration: none; }
footer a:hover { text-decoration: underline; }
```

The **colour half was inert** — `main.css` styles footer links through class selectors
(`.footer-links a`, `.footer-contact a`, `footer .footer-bottom a`), all of which
out-specify a bare `footer a`. Measured resting colours on `/advertise/` are identical
to the control pages at every viewport.

The **hover half was not inert.** No other rule in the codebase declares
`text-decoration` on footer-link hover, so nothing overrode it. Result: **all 11 footer
links on `/advertise/` underlined on hover, while the byte-identical links on the other
741 pages did not** — at desktop *and* mobile.

This is the [[page_stylesheet_leaks_into_shared_chrome]] class, and a good illustration of
why that memory says *re-assert every property*: a partial leak hides inside a rule whose
other half is harmlessly overridden. Only the property nobody else declares survives.

**Fix:** both rules removed. `main.css` owns the shared chrome; a page stylesheet has no
business styling it. Removal (not re-assertion) is correct here because the shared
stylesheet already supplies both properties.

| footer link | page | hover before | hover after | control (`/about/`, `/index.html`, `/gear/`) |
|---|---|---|---|---|
| `.footer-links a` (×8) | /advertise/ | `underline` | **`none`** | `none` |
| `.footer-contact a` (×1) | /advertise/ | `underline` | **`none`** | `none` |
| `footer .footer-bottom a` (×2) | /advertise/ | `underline` | **`none`** | `none` |

Resting colour, size and position: **unchanged** — confirming the colour half was dead code.

**Regression check:**

- Per-anchor diff over every footer `<a>` on 4 pages × 2 viewports (88 anchors):
  **14 deltas, all on `/advertise/`, all the intended `underline → none`.**
- Full 37 × 3 resting re-sweep: **0 deltas out of 111 probes.**
- All 6 control-page probes **byte-identical** before/after.

Commit `ea9cb09`. Cache-bust `advertise.css` `20260824b` → `20260827a`.

**Live verification (comment-aware):**

```
$ curl -sL "https://waterwisekids.com/assets/css/advertise.css?v=20260827a"
bare `footer a` rule present in NON-COMMENT css: False
`footer a:hover` present in NON-COMMENT css:     False
marker comment present:                          True
$ curl -sL "https://waterwisekids.com/advertise/" | grep -o 'advertise.css?v=[0-9a-z]*'
advertise.css?v=20260827a
```

---

## Coverage gap closed: 2 header variants were never being sampled

The sample set is built by grouping pages on their `<link rel=stylesheet>` fingerprint.
Cross-checking that set against the **markup** tripwire showed two header variants with
**zero representatives**:

| header variant | pages | now represented by |
|---|---:|---|
| card-printable header | **66** | `/education/water-rescue-reach-throw-dont-go-card.html` |
| homepage header | **1** | `/index.html` |

The homepage — the single most important page on the site — was not in the sample.
Sample raised 35 → **37**. Both newly covered templates were then swept at all three
viewports:

- **`/index.html` is completely clean** — no outlier on any region at any viewport.
- The 66-page card printable shows only the documented `.container`-compensation
  signature (`max-width: 1160px` + side padding on `nav` instead of `max-width: none`).
  Rendered content box verified identical to the majority: **84→1196 at 1280px,
  16→374 at 390px, 16→304 at 320px.**

**Going forward the representative set should be validated against the markup hashes,
not just the stylesheet fingerprints** — two pages can load identical CSS and still ship
different chrome markup.

---

## Yesterday's verification command was giving a false negative

The 08-26 report shipped this check for the printable-poster footer fix:

```
curl -sL ".../printable-poster.css?v=20260826b" | grep -c 'margin: 40px -16px 0'
```

It returns **`1`**, which that report defined as *"the build still hasn't landed."*
It had landed. The fix's own explanatory comment quotes the old value verbatim:

```css
/* 2026-08-26 css-regression sweep: this carried `margin: 40px -16px 0`, giving the
   shared site footer a 40px gap ... */
footer { ...; margin: 0 -16px; }
```

so `grep` matched the comment, not a live rule. Re-checked with comments stripped:
the rule is `margin: 0 -16px` on live. **Yesterday's fix is deployed and correct.**

**Lesson:** when a fix is documented with an inline comment quoting the value it removed,
any `grep`-based verification of that value must strip comments first. Today's live check
above does exactly that.

---

## Checked and clean

| Check | Result (37 templates × 3 viewports = 111 probes) |
|---|---|
| Stylesheets failing to load | **0** |
| Root font-size scaling (16→14→14px) | uniform on all 37 |
| Body font family | uniform (`Inter, system-ui, …`) |
| Logo type/colour | **identical on all 37** |
| Nav-link type/colour/padding | **identical on all 37** |
| Footer-link type/colour | **identical on all 37** |
| Nav / footer link counts | **9 and 11 on all 111 probes** |
| Horizontal overflow | **0 on every page at every viewport** |
| Header/footer text under 11px | **none** |
| Tap targets (nav + footer, visible only) | **44px minimum everywhere** |
| Hamburger present, hidden at 1280, visible at 390/320 | 37/37 |
| Rogue inline `style=` in chrome | none beyond the known 28px logo `<img>` and the footer `.container` centring div |

### Open-drawer state pass (hamburger clicked, 37 × 2 viewports)

| Check | Result |
|---|---|
| Drawer visible after click | **37/37** at both 390 and 320 |
| Drawer geometry | **identical everywhere** — `x=16`, `w=358` (390) / `w=288` (320), `y=48`, `z=199`, white bg, shadow |
| Drawer overlays rather than pushes content | `mainTop` delta **0** on all 37 |
| Open-state horizontal overflow | **0** |
| Open-state tap targets | **no link under 44px high or 24px wide** |

### Hover / focus state pass (37 templates, desktop)

| Check | Result |
|---|---|
| `activeElement` assertion on every focus probe | **37/37 passed** |
| Logo rest / hover / focus | **1 variant each — uniform on all 37** |
| Nav-link hover | **1 variant — uniform on all 37** |
| Nav-link focus produces a visible change | **37/37** (no invisible focus states) |
| Footer-link rest / focus | **1 variant each — uniform on all 37** |
| Footer-link hover | 2 variants → **the bug fixed above** |

### Sitewide markup tripwire (all 745 pages, not just the sample)

Normalised + hashed every page's `<header>` and `<footer>` block:

- **header: 7 variants** (517 / 85 / 66 / 61 / 1 / 1 / 1) — matches baseline
- **footer: 2 variants** (646 / 86) — matches baseline
- **hamburger: 732 / 732** pages carrying chrome

Counts moved only by pages added since the last baseline (84→85, 65→66, 645→646, 730→732).
**No markup drift.**

### Page-stylesheet leak audit (all 9 page stylesheets)

Swept every non-shared stylesheet for selectors reaching into shared chrome
(`header`, `nav`, `footer`, `.nav-*`, `.footer-*`). Three hits, now fully accounted for:

| file | selector | verdict |
|---|---|---|
| `advertise.css` | `footer a`, `footer a:hover` | **the bug — removed** |
| `special-needs.css` | `footer .container`, `header p, footer p` | **deliberate** — documented 08-20 fixes that *restore* the sitewide value |
| `article.css` | `.footer-links { flex-direction: column }` | **inert** — see below |

---

## Confirmed NOT bugs — do not "fix" these next run

**`article.css` stacks `.footer-links` into a column (414 pages).** The rule sits inside
`@media (max-width: 768px)`, and `m-app.css` sets `footer .footer-links { display: none
!important }` at that same breakpoint. Verified by measurement: `.footer-links a` reports
`vis=false` at 390px on the article template *and* on every control page. Dead rule with
no rendered effect. Left in place rather than churned — but worth deleting opportunistically
if `article.css` is edited for another reason.

**Checklist printables' nav is `position: static` where the other 35 are `relative`
(85 pages).** `main.css` and `printable-poster.css` both ship `nav { position: relative }`;
`printable-checklist.css` does not, so the absolutely-positioned open drawer resolves its
containing block to `HEADER.screen-header` instead of `NAV.mobile-open`.

This *looks* like textbook un-mirrored [[standalone_stylesheet_drift]], and it was the
strongest candidate of the run — so it was tested by actually clicking the hamburger
rather than reasoning about the cascade. **The rendered geometry is identical**: `x=16`,
`w=358`/`288`, `y=48`, `z=199`, same background and shadow as the other 35 templates,
no overflow, no sub-44px tap target. `.screen-header` is itself positioned and its padding
box coincides with the nav's, so the two containing blocks resolve to the same rectangle.
Deliberately **not** "fixed": changing the containing block risks a real shift for zero
visible gain. Flagged here only because it is *latent* fragility — if `.screen-header`
ever loses `position` or gains top padding, 85 pages break at once.

**Body-colour leak into shared chrome** (`special-needs.css` `#13304a`,
`printable-poster.css` `#1b2a4a`). Re-confirmed this run: both set a bare
`html, body { color }` which `<header>`/`<footer>` inherit, so a naive computed-style diff
flags them. Every visible text element in the chrome carries its own colour rule; the
inherited value paints nothing. Same class as the zero-width `border-bottom-color` drift.

**Printables' nav lacking the `.container` wrapper.** `nav` reports `max-width: 1160px`
+ side padding instead of `max-width: none`. Rendered content box re-verified identical
this run (84→1196 / 16→374 / 16→304). Documented compensation for the 152 pages that omit
`<header><div class="container">`. Working as designed.

**Blue nav link on `/education/` pages.** `main.js` adds `.active` by pathname. The first
`.nav-links a` on those 8 templates is therefore already in its active state at rest, so
hovering it produces no further change. Working as designed.

**Footer `text-align`.** Printables set `text-align: center` on `<footer>` itself; the
other 34 templates leave the footer at `start` and centre via an inline
`style="text-align: center"` on the footer's `.container` div. Different mechanism,
identical rendering. All three printables agree with each other, so this is a printable
convention rather than drift between the two printable sheets.

---

## Deploy status

| | |
|---|---|
| Commit | `ea9cb09` on `origin/live` |
| Pages build | **built**, 33.0s, no errors |
| Live CSS | verified — rules gone, marker comment present |
| Live HTML | verified — references `?v=20260827a` |
| Cache-bust | `advertise.css` `20260824b` → `20260827a`, first fetched **after** the build completed |

No open items.
