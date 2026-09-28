# Mobile Consistency Report — 2026-08-30

**Method:** headless Chromium render sweep (not grep). 751 HTML files → 23 meta-refresh
stubs excluded → 728 live pages partitioned on the 4-part equivalence key
(stylesheet set with `?v=` stripped, header hash, footer hash, inline `<style>` hash)
→ **68 classes → 72 representative pages**, each rendered at **375px and 320px**
(144 renders), plus a **drawer-open pass** across all 7 header markup variants.

**Tripwire held:** 7 header variants / 2 footer variants — unchanged.
**Canary gate:** passed on every batch (injected overflow div, 10px button, 6px text
all fired). A clean result is only trustworthy behind the canary.

---

## Shipped

### Open mobile drawer was 4px proud of its own footer on 158 pages — FIXED

`m-app.css` hardcoded `header > nav.mobile-open .nav-links { left: 16px; right: 16px }`
in the 2026-08-22 fix, when the shared container gutter was still 16px. The
2026-08-30 rem-gutter fix (`d38dcbe`) moved the chrome rail to a **literal 20px at
≤768px**. The 570 `.container`-wrapped pages followed automatically; the **158 pages
that ship bare `<header><nav>` did not**.

Measured at 375px, before:

| cohort | open drawer | footer rail | aligned |
|---|---|---|---|
| `.container`-wrapped (570) | x=20 / right=355 | x=20 / right=355 | yes |
| bare `header > nav` (158) | **x=16 / right=359** | x=20 / right=355 | **no — 4px both sides** |

After: **x=20 / right=355 on all 7 header variants**, printables included
(`width: auto` held against `printable-checklist.css` / `printable-poster.css`
`width:100%`).

Shipped `691f29a` on `live`. Cache-bust chain bumped at both links so the inner
bump is not inert: `m-app.css` v=20260830a→c (inside `main.js`) **and** `main.js`
v=20260830b→c across 734 pages. Verified live end-to-end:
HTML → `main.js?v=20260830c` → `m-app.css?v=20260830c` → `left: 20px`.

**Regression check:** the full 72-page × 375/320px sweep re-run post-fix produced
**0 diffs** against the pre-fix baseline on overflow, tap targets, text floor and images.

---

## Clean

| Check | Result |
|---|---|
| `<meta name=viewport>` | **751/751 present**, all `width=device-width, initial-scale=1.0`; zero `user-scalable=no` / `maximum-scale=1` |
| Horizontal overflow @375 | **0 pages** (probe compares against intended device width, not `innerWidth`) |
| Horizontal overflow @320 | **0 pages** |
| Images scaling | **0** wider-than-viewport or overflowing-right, both widths |
| Hamburger | present, `display:flex`, **44×44** on 72/72; clicks open on 15/15 header-variant reps, 8 links each |
| Drawer link tap targets | 0 under 44px height / 24px width, 0 off-right, 0 under 12px |
| Form fields (iOS zoom) | 0 inputs/selects/textareas under 16px font-size or 44px height across the 19 interactive pages checked |
| CTA buttons | 0 under 44px on `swim-schools`, `find-swim-lessons`, `aquatic-jobs`, `contact`, hubs, town pages, printables |
| Root font-size | 14px at both 375 and 320 (main.css `≤480px` block) — matches design |
| Gutter rail | `main` padding == footer rail == 20px on every rep |

---

## Inspected, not defects

- **4 links measuring ~17px tall** (`find-swim-lessons`, `kids-swim-lessons-philadelphia`,
  `special-needs-swimming`, `pool-safety-rules-printable`) are inline CDC / AAP citation
  links inside `.tldr-box` sentence copy. WCAG 2.2 exempts inline targets. Probe
  false-positive: its prose test accepted `P`/`LI`/`SPAN` parents but not a `DIV`
  holding a sentence. Site is correct.
- **10px `<span>` labels on all 72 pages** are `.mobile-bottom-nav a` and
  `.mobile-cat-item` children. Held at 10px by design — 11px reflows those fixed
  5-across nowrap rows. The probe reads the child `span`, which carries no class.
- **`.cat-btn` on `/education/`** reports right-edges out to 1916px, but the parent
  `.category-filters` is `overflow-x: auto` and scrollable (335px visible / 11571px
  content). Intentional horizontal filter strip; page-level overflow is 0.

---

## Watch

- **`/education/` category strip is 11571px of horizontal scroll on a 335px rail**
  (~50 buttons). Functional and non-overflowing, but on a phone the categories past
  the first four are effectively undiscoverable. Not a consistency defect, so not
  fixed here — flagging as a UX call for Michael.
- **The 16px value recurs by construction.** It was hardcoded to match a container
  gutter that has since moved twice. The comment now records the coupling
  ("keep this value in step with `header .container` padding"), but any future
  gutter change must re-render the *open* drawer — a closed-state sweep is uniform
  by construction (`.nav-links` is `display:none` at ≤768px everywhere) and will
  report a clean sheet.

---

*Workspace mount is at `2476831c5`, 2 commits behind `live` — this audit ran against a
fresh clone of `origin/live`, per standing practice.*
