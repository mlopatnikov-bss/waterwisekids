# CSS Regression Report — 2026-08-21

**Method:** headless Chromium render sweep, not grep. 23 template representatives
(one per stylesheet-fingerprint group, 13 groups + extra coverage of the two
largest) × 1280 / 390 / 320px, capturing computed styles + `getBoundingClientRect`
for `header`, `nav`, `.nav-logo`, the first visible nav link, the nav container,
`footer`, `.footer-content`, `.footer-links`, `.footer-bottom`, the footer
container, `body` and `html`. Elements were filtered to `_vis: true` before
bucketing, per the 2026-08-20 method note.

Baseline clone: `live` @ `bc8dbeb`. Fix commit: `ffceb73`. **Deployed and verified live.**

Stylesheet fingerprint groups are unchanged from the last run — 13 groups, the
same 13 no-stylesheet files (all `<meta http-equiv="refresh">` redirect stubs,
correctly excluded).

---

## Harness bug found and fixed first

The 2026-08-20 method note said "exclude the logo when sampling the first nav
link." I implemented that as `!a.classList.contains('logo')` — **but the class is
`nav-logo`, not `logo`.** The exclusion matched nothing, so the harness silently
measured the logo on every page and labelled it `navlink`, while the separate
`logo` selector (`header .logo`) matched *nothing* on all 733 pages and was
dropped as a uniform `<missing>` bucket.

Net effect: nav links were never measured, and the logo was measured under the
wrong name. Both selectors were corrected (`header .nav-logo`, and
`header nav .nav-links a`) and the sweep re-run before any conclusion was drawn.
**Worth carrying forward: an exclusion filter that never fires looks exactly like
a clean result.** Assert that the excluded element is actually excluded.

---

## Fixed and deployed (1 defect class, 3 rules, 80 pages)

### Standalone printable stylesheets never mirrored `main.css`'s nav rules

The 79 checklist printables and 1 poster printable load **no `main.css`** — their
header markup is identical to the other 652 pages, but every nav rule has to be
restated in `printable-checklist.css` / `printable-poster.css`. Three rules were
never mirrored. All three are invisible to a grep, because the wrong value is
never written down anywhere; it is the *absence* of a declaration.

| | printables (80) | all 652 `main.css` pages |
|---|---|---|
| `.nav-logo` display / gap / align | `block` / `normal` / `normal` | `flex` / `8px` / `center` |
| `.nav-logo` letter-spacing | **`normal`** | `-0.5px` |
| `.nav-logo` box @1280 | **184.38 × 29** | 179.75 × 28.14 |
| `.nav-logo` width @390 & @320 | **145.56** | 139.06 |
| `.nav-links a` display | **`inline`** | `block` |
| nav-link row height @1280 | **32px** | 39.05px |
| `.nav-links` gap | `2px` | `1px` |

Two visible symptoms:

1. **The wordmark rendered with different tracking on 80 pages.** `letter-spacing:
   -0.5px` is set on `.nav-logo` in `main.css` and in neither printable sheet, so
   "WaterWiseKids" was 6.5px wider on every printable at mobile and 4.6px wider at
   desktop. The logo icon also sat on the inline `vertical-align:middle` attribute
   instead of flex centering.
2. **Nav links were inline, so their own vertical padding did nothing.** With
   `display:inline`, the `padding: 8px 14px` did not expand the line box — the row
   was 7px shorter than sitewide and the `border-radius: 6px` hover pill painted a
   different shape than on every other page.

**Fix:** added `display:flex; align-items:center; gap:8px; letter-spacing:-0.5px`
to `.nav-logo`, `display:block` to `.nav-links a`, and `gap:1px` to `.nav-links`
in both standalone sheets — mirroring `main.css` exactly. Same shape as the
2026-08-19 gutter fix and the 2026-08-20 line-height fix; this is the third
consecutive run to find drift in these two files.

### Verification

- **45 computed-style deltas, every one landing exactly on the majority
  signature.** `logo._w` 184.38 → 179.75 (desktop) and 145.56 → 139.06 (mobile),
  `logo._h` 29 → 28.14, `letterSpacing` normal → `-0.5px`, `navlink._h` 32 →
  39.05, `navlink.display` inline → block.
- **0 unintended deltas** across the other 20 templates at all three viewports.
- Post-fix `.nav-logo` and `.nav-links a` are now **identical on all 23 templates
  at 1280 / 390 / 320**. The only remaining split is the `.active` nav-link colour
  on `/education/` pages — `main.js` pathname matching, working as designed.
- Post-fix safety counters at all three viewports: horizontal overflow **0**,
  header/footer text under 11px **0**, mobile tap targets under 44px **0**.
- Print media re-checked on all three printables: `header`, `footer` and
  `.print-toolbar` all resolve to `display:none`, PDF page count unchanged at 3.
  A `display:none` element contributes no layout, so the header-only change cannot
  affect pagination.

Cache-bust: `?v=20260821a` on the two changed sheets across 80 pages.
`main.css`'s references were deliberately left alone — it did not change.

---

## Clean this run

- **Header, nav and footer geometry is identical across all 23 templates** at all
  three viewports within each of the two documented families. Header 73/72/72px,
  9 nav links, 11 footer links on every page.
- Logo markup is **byte-identical on all 720 real pages** — one variant, no drift.
  (The 13 with no `.nav-logo` are the redirect stubs.)
- Font family resolves to Inter on 100% of templates. No serif fallback.
- `body` and `html` computed typography (font-size, line-height, colour,
  background, root font-size scaling 16 → 15 → 14px) is uniform across every
  template and both standalone sheets. The 2026-08-18 root-size mirror is holding.
- The 2026-08-20 `special-needs.css` container and line-height fixes are holding —
  `special-needs-swimming.html` reports `navContainer._x = 84`, `footer._h = 291.3`,
  matching `index.html` exactly.
- **Inline `style` attributes on header/footer across all 23 templates: three, all
  benign** — the logo `<img>` sizing (28px header, 24px printable footer) and one
  `text-align:center` wrapper. **None override `main.css` on nav or footer.**
- **The mobile hamburger dropdown is consistent on every template** — clicked open
  at 390px and 320px on 5 representatives: `aria-expanded` flips to `true`,
  `position:absolute`, white background, `z-index:199`, `top:48px`, no content
  shift, no horizontal overflow. See the note below on why this looked broken.

## Flagged, not changed

- **`printable-checklist.css`'s mobile dropdown rules diverge from every other
  sheet, but are dead code.** The checklist sheet lays the open menu out *in flow*
  (no `position`, no background, no `z-index`), where `main.css`, `m-app.css` and
  `printable-poster.css` all make it an absolute white overlay. The static
  measurement flags this every run (`nav.position: static` vs `relative`), and it
  reads like a broken hamburger on 79 pages. **It is not** — `m-app.css` is
  JS-injected at ≤768px and wins, and the rendered open-menu measurements above are
  identical to `index.html`. It is a latent inconsistency that would only surface
  if `m-app.css` failed to load. Left alone rather than churn 79 pages for a
  code path nothing reaches.
- **`special-needs.css` sets a page palette** — body `#13304a` on `#f4f8fb` vs the
  sitewide `#1f2937` on `#ffffff`, inherited onto `<header>`. Every header and
  footer text node sets its own colour, so nothing visibly inherits it. Still a
  design decision for Michael, not a regression fix. Unchanged from last run.
- **Printable footers remain 269/274/294px vs 291/294/336px** on `main.css` pages,
  and printable nav containers remain full-bleed (`nav._x = 0` vs `16`). Both
  printable sheets agree with each other exactly. Declared deliberate 2026-08-20;
  re-confirmed, unchanged.
- **Desktop nav links are 39.05px tall (under 44px).** Pointer targets at 1280px —
  WCAG 2.5.8 AA requires 24px, which this clears. Mobile is 44px+ everywhere. Not
  a defect; noted because a naive tap-target counter reports it at 1280px.

## Confirmed non-bugs (do not "fix" next run)

- Everything on the 2026-08-20 list still holds: the hidden `.footer-links`
  column-vs-row split on `article.css` pages at ≤768px (`display:none`, height 0),
  the blue `.active` nav link from `main.js` pathname matching, and Google Fonts
  reporting `BLOCKED` (the harness's own route-abort, required or `networkidle`
  hangs).
- The printables' 24px footer logo icon vs the 28px header icon is **not** drift —
  it is the printables' own footer variant, applied identically in both sheets.

## Method notes for the next run

1. **Verify your exclusion filters actually exclude something.** The `logo` /
   `nav-logo` class miss above turned a real 80-page defect into a clean sheet for
   at least one prior run.
2. **`m-app.css` masks static-CSS divergence at ≤768px.** Before filing a mobile
   nav or footer defect from computed styles alone, *interact* — click the
   hamburger and measure the open state. Static `nav.position: static` was a false
   alarm for exactly this reason.
3. Serve over HTTP on a **fresh port each bash call**, and start the server in the
   same call as the render. Never `pkill -f http.server` — it matches the calling
   shell.
4. Chromium in the sandbox: `playwright-core` + `npx playwright-core install
   chromium`, then `apt-get download` ~35 libs, `dpkg-deb -x` into a local sysroot,
   run with `LD_LIBRARY_PATH` pointed at it. ~2 minutes. `--with-deps` needs root
   and will fail.
