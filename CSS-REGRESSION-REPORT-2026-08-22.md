# CSS Regression Report — 2026-08-22

**Method:** headless Chromium render sweep, served over HTTP, not grep. 23 template
representatives (one per stylesheet-fingerprint group, 13 groups + extra coverage of
the five largest) × 1280 / 390 / 320px, capturing computed styles +
`getBoundingClientRect` for `html`, `body`, `header`, `nav`, `.nav-logo`, the first
visible non-logo nav link, `.nav-links`, the nav container, `footer`,
`.footer-content`, `.footer-links`, `.footer-bottom`, the footer container and the
first footer link. Elements filtered to `_vis: true` before bucketing. Plus an
*interactive* pass: hamburger clicked open at 390 and 320 on 7 representatives.

Baseline: `live` @ `efe78de1`. Fix commit: **`175655e0`**. **Deployed and verified live.**

Stylesheet fingerprint groups unchanged — 13 groups over 735 files, the same 13
no-stylesheet files (all `<meta http-equiv="refresh">` redirect stubs, correctly
excluded).

---

## Workspace note: the mount was 12 commits behind `live`

The mounted workspace's local `live` was at `2476831c` (2026-08-20) while
`origin/live` was at `efe78de1` — 12 commits and 12 HTML files apart. **Auditing the
mount would have measured a site that is not the site.** The whole sweep was run
against a fresh `/tmp` clone reset to `origin/live`, and all fixes were made and
pushed from there.

Two untracked files in the mount (`education/swim-lesson-cost-worksheet.html` and
its `-printable` twin) are *abandoned drafts* — 6-line HTML comments, never
committed, superseded 2026-08-21. They register as "pages with zero stylesheets" in
any naive fingerprint scan. Confirmed untracked via `git ls-files --error-unmatch`
and excluded.

---

## Fixed and deployed (2 defect classes, 724 files)

### 1. The open mobile drawer was edge-to-edge on 142 pages, inset on 580

This is the finding that only an **interactive** pass could produce. Closed-state
computed styles are identical on every template — `.nav-links` is `display:none` at
≤768px everywhere, so a static sweep reports a clean sheet.

The site ships two header markups:

| markup | pages |
|---|---|
| `<header><div class="container"><nav>` | 580 |
| `<header><nav>` (bare) | 142 — 61 `article.css`, 80 checklist printables, 1 poster |
| no header (redirect stubs) | 13 |

`m-app.css` positions the open drawer with `position:absolute; left:0; right:0`,
which resolves against **`nav`'s padding box**. On contained pages that box is
358px wide (390px viewport); on bare-nav pages `nav` *is* the viewport, so the same
declaration produced a 390px panel.

| @390 open drawer | contained (580) | bare nav (142) |
|---|---|---|
| panel `x` | 16 | **0** |
| panel `width` | 358 | **390** |
| panel right edge | 374 | **390** |

Same white background, same 409px height, same centred link positions — the drawer's
own **drop shadow (`0 4px 12px`) and 1px bottom divider ran to the screen edge on
one fifth of the site and stopped 16px short on the rest.** Two visually different
mobile menus depending on which template you landed on.

**Fix** — one additive rule in `m-app.css`, scoped so the 580 contained pages are
untouched:

```css
header > nav.mobile-open .nav-links { left: 16px; right: 16px; width: auto; }
```

**`width: auto` is load-bearing and the first attempt shipped without it.** Both
printable stylesheets set `width:100%` on the open drawer. `left` + `right` +
`width` is over-constrained; `width` wins and `right` is dropped, so the first patch
moved the printables' panel to `x=16, w=390` — hanging 16px off the right edge and
shifting the links 16px out of alignment with every other template. Caught by
re-rendering, not by reading the diff.

### 2. One page shipped a stale `article.css` cache-bust

`education/legal-swim-instructor-student-ratio.html` referenced
`article.css?v=20260819b`; the other **408** article pages use `?v=20260819c`. A
returning visitor holding the `b` copy would be served their *stale cached
stylesheet* on that one page while every other article page busts to fresh bytes —
precisely the failure a cache-bust exists to prevent. Bumped to `c`.

Every other sheet is version-consistent sitewide: `main.css?v=20260821v` ×641,
`printable-checklist.css?v=20260821v` ×80, `local-pages.css?v=20260821a` ×17,
`teens.css?v=20260819c` ×4, and the eight singletons.

### Cache-bust chain

`m-app.css` is **JS-injected** by `main.js`, so bumping the stylesheet alone would
not have reached anyone: a returning visitor's cached `main.js` still points at the
old URL. The full chain was bumped — `m-app.css?v=20260822a` inside `main.js`, and
`main.js?v=20260820b → ?v=20260822a` on all **722** real pages (asserted exactly one
occurrence per file). `20260822` was unused before this push, so no version
collision.

### Verification

- **0 unintended computed-style deltas** — the closed-state sweep was re-run after
  the fix across all 23 templates × 3 viewports and diffed property-by-property
  against the pre-fix capture. Zero differences.
- Post-fix open drawer at 390: `x=16, w=358, right=374, h=409` on **all 7**
  representatives (contained, bare article, checklist printable, poster, local,
  hub). At 320: `x=16, w=288, right=304`. Previously two distinct signatures.
- Open-drawer safety counters: horizontal overflow **0**, sub-11px text **0**,
  sub-44px tap targets **0**, on all 7 at both mobile viewports.
- Live-verified by fetching the deployed assets: the new rule is present in
  `m-app.css`, `main.js` points at `?v=20260822a`, and sampled bare-nav, printable
  and article pages all serve the new `main.js` version and `article.css?v=...c`.

---

## Clean this run

- **`.nav-logo` and the first footer link are byte-identical across all 23
  templates at all three viewports.** Logo `x=84` desktop / `x=16` mobile,
  `width` 179.75 / 139.06, `letter-spacing -0.5px` — the 2026-08-21 printable
  mirror fix is holding.
- Header geometry uniform: 73px at 1280, 72px at 390 and 320, on every template.
  9 nav anchors, 8 nav links, 11 footer links on every page.
- **Font family resolves to Inter on 100% of templates** for `body`, `header`,
  `nav`, `.nav-logo`, `footer` and footer links. No serif fallback anywhere.
- Horizontal overflow **0**, header/footer text under 11px **0**, mobile tap
  targets under 44px **0** — at all three viewports, before and after the fix.
- **`m-app.css` loads on all 23 templates including both printable families**
  (confirmed in `document.styleSheets`), which is what makes the checklist sheet's
  divergent dropdown rules genuinely dead code rather than a live defect.
- **Inline `style` attributes on header/footer: three per page, all benign** — the
  28px header logo `<img>`, the 24px printable footer logo `<img>`, and one
  `text-align:center` on the footer container. **None override `main.css`.**
- The bare-nav *closed* header is fully handled by the 2026-07-17 `header > nav`
  rule: `logo._x = 84 / 16` and header height match contained pages exactly on all
  8 bare-nav samples at all three viewports. Markup differs; pixels do not.

## Flagged, not changed

- **Desktop footer links are 23.05px tall and `.footer-bottom` links 15px, with a
  16px gap.** WCAG 2.5.8 (Target Size Minimum, AA) wants 24px or adequate spacing.
  The footer-links row clears it on the spacing exception (24px gap); the
  `.footer-bottom` pair at 15px tall with a 16px gap is the marginal case. Uniform
  on all 23 templates, so **not a regression** — an accessibility decision for
  Michael. Mobile is 44px+ everywhere.
- **`special-needs.css` still sets a page palette** — `#13304a` on `#f4f8fb` vs the
  sitewide `#1f2937` on `#ffffff`, inherited onto `<header>` and `<footer>`. Every
  header/footer text node sets its own colour so nothing visibly inherits it.
  Unchanged from the last three runs; Michael's call.
- **The generator still ships two header markups.** 142 bare-nav pages vs 580
  contained. Both now render identically, closed and open, so this is cosmetic
  debt rather than a defect — but every future rule written against
  `header .container` will silently miss a fifth of the site.
- **Printable footers remain 1100px wide vs 1160px**, `.footer-bottom` not flexed,
  body background `#f9fafb` / `#f0f4f8`. Both printable sheets agree with each
  other exactly. Declared deliberate 2026-08-20; re-confirmed.

## Confirmed non-bugs (do not "fix" next run)

- The `.footer-links` `row`-vs-`column` and `21px`-vs-`10.5px` gap split on
  `article.css` pages at ≤768px — **`display:none`, height 0, width 0 on every
  template.** Invisible. Bucket on `_vis` first or this resurfaces every run.
- The blue `.active` nav link (`#075985` on `#f3f4f6`) on the four `/education/`
  representatives — `main.js` pathname matching, working as designed.
- Google Fonts reporting `BLOCKED` in `document.styleSheets` — the harness's own
  route-abort, required or `networkidle` never settles.
- `printable-checklist.css`'s in-flow dropdown rules — dead code, `m-app.css` is
  injected on printables too and wins.
- The printables' 24px footer logo icon vs the 28px header icon — the printables'
  own footer variant, applied identically in both sheets.

## Method notes for the next run

1. **Check the mount against `origin/live` before measuring anything.** It was 12
   commits stale today. Clone `origin/live` into `/tmp` and audit that.
2. **Static computed styles cannot see the mobile menu.** `.nav-links` is
   `display:none` at ≤768px on every template, so the closed-state sweep is
   uniform by construction. Both of this run's real nav findings required
   `page.click('.hamburger')`. Interact, then measure.
3. **`left` + `right` + `width` is over-constrained.** When patching an absolutely
   positioned element, grep every stylesheet that can reach it for a competing
   `width` before assuming `left`/`right` will be honoured — and re-render rather
   than trusting the diff.
4. **A JS-injected stylesheet needs its injector cache-busted too.** Bumping
   `m-app.css` alone reaches nobody; the version lives in `main.js`, which is
   itself versioned on 722 pages.
5. Chromium in the sandbox: `npm i playwright-core`, then
   `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 npx playwright-core install
   chromium`. Only **one** library was actually missing today (`libxdamage1`) —
   `apt-get download` it, `dpkg-deb -x` into a local sysroot, run with
   `LD_LIBRARY_PATH`. Under two minutes, no root needed.
6. Serve over HTTP on a **fresh port each bash call**, starting the server in the
   same call as the render. Never `pkill -f http.server` — it matches the calling
   shell.
