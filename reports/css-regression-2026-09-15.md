# CSS Regression — 2026-09-15

**Verdict: CLEAN. Nothing shipped — no defect found.**

Fresh clone of `origin/live` @ `c45b07a`. 780 html − 23 stubs = **757 live pages**,
**13** stylesheet families. Baseline for the delta: `9be99f510` (the 09-13 run).

| Pass | Denominator | Viewports | Renders | Errors |
|---|---|---|---|---|
| Chrome / floor / inline-CSS / rail | 162-page stratified sample, all 13 families | 1280 / 834 / 390 | 486 | 0 |
| `.wwk-navlist` AA floor + coverage | **all 757** | 834 | 757 | 0 |
| `.cl-cta` floor + prose exemption | **all 30** carrying the shape | 390 / 834 | 60 | 0 |
| Grouped variance (1 bucket per component) | **all 757** | 1280 | 757 | 0 |

---

## The CSS/JS delta was NOT zero this run — read this first

Unlike 09-10 and 09-13, the delta since the baseline **does touch chrome**:
167 inserted lines across `main.css`, `printable-checklist.css`,
`printable-poster.css` and `main.js`, plus 763 changed HTML files.

The change is the 09-13 AA-floor fix:

1. `.wwk-navlist > li > a { display:inline-flex; min-height:24px; min-width:24px }`
   added to all three screen stylesheets, **unscoped by media query** (the gap
   started at 769px and had no upper bound). No `!important`, by design.
2. `main.js` now runs `initNavlistShapeTagging()` at **every width** — previously
   the tagging lived only in `m-app.js`, injected at ≤768px.
3. `printable-checklist.css` floors `.cl-footer p.cl-cta a`, with `.cl-cta` added
   to the 30 standalone-CTA paragraphs in HTML.

Because this rule now applies sitewide at desktop for the first time, the whole
run was weighted toward verifying it rather than toward a delta sample.

**Both halves of the fix verify, at full corpus:**

- **834px, all 757 pages:** 649 pages carry navlists — **927 lists, 4,736 links,
  0 under 24×24.** The 09-13 measurement was 4,229 sub-24px targets on 633 pages.
  The hole is fully closed.
- **0 untagged standalone link lists with sub-24px anchors** — the tagger has no
  coverage tail left.
- 0 anchors escaping their list box, 0 past the viewport, 0 document overflow.
- **`.cl-cta`: 30/30 pages, every anchor ≥24×24 at 390 and 834** (was 29/30 at
  13px). The two prose paragraphs in `.cl-footer` still compute `display:inline`
  on every page — the WCAG inline exemption survived the fix exactly as intended.

## Clean axes

- Header / footer / body / html / logo / footer-link computed styles:
  **1 bucket per stylesheet family**, 13 families × 3 viewports, 0 multi-bucket.
- Footer markup variants **2** at all three viewports (tripwire unchanged).
- Document overflow **0**; element overflow **0** (scroller-skipping applied).
- Chrome text under 11px: **0** (`.mobile-bottom-nav` 10px labels exempted).
- Footer rail uniform 162/162: **167@1280 / 90@834 / 30@390**.
- Cache-bust: 13 keyed assets, **exactly 1 key each, 0 stale, 0 unkeyed refs**.
  `main.css`/`main.js` `?v=20260913b`, `printable-checklist` `20260913c`,
  `printable-poster` `20260913b` — all match their file change date of 09-13.
  Reference counts reconcile exactly: 763 main.js = 660 main.css + 102
  printable-checklist + 1 printable-poster.
- Grouped variance at full corpus: 197/757 pages, 34 keys, **all design intent**.

## Triaged and dismissed — four false positives

**1. Header variant count read 13, not the 5-6 tripwire.** This is the documented
*phantom* signature (raw hash = 13/5). My normalisation was weaker than the saved
one — it did not fold relative path depth in the logo `href`. Footer read 2, which
is correct, and the per-family computed-style buckets read 1 across all 13
families, so the chrome itself is uniform. **Not a corpus finding; use the saved
normaliser next run.**

**2. `main` rail = 41px at 390 on `/contact/` and `/gear/`.** Both are the
documented card FP, not a stacked gutter: the containing box sits at **x=20 (on
the rail)** with white background, 12px radius and a box-shadow, and 21px of
internal padding puts the text at 41. Box at 20 + text at 41 = card.

**3. "Rogue inline chrome CSS" on 162/162 pages.** My probe flagged any `style=`
attribute inside `<header>`/`<footer>`. Corpus-wide there are exactly **three**
such shapes, all uniform: the 28px logo `img` (763 header + 763 footer) and
`text-align:center` on the footer container (660 — exactly the main.css page
set). House convention, not override. **Zero `<style>` blocks target
`header|footer|nav` outside `@media print`.**

**4. A `.stat-box` reading white-on-white.** `background-color` computes
`rgba(0,0,0,0)` on the bare `.stat-box` while `color` is white — which looks like
invisible text. It is not: `article.css:169` paints it with
`linear-gradient(135deg, #0369a1, #075985)`, and all **80** bare `.stat-box`
instances sit on pages that load `article.css` (0 exceptions). The contrast was
already tuned to 5.93:1 in the 08-27 pass.

FP #4 was the useful one — see the probe fix below.

## Probe fixes made this run

**⭐ `gv_lib.py` bucketed on `background-color` but not `background-image`.** A
gradient-painted element reports `background-color: rgba(0,0,0,0)`, so a gradient
box and a genuinely transparent box produced the **same bucket signature** — and
in triage a gradient looked like "no background at all". 45 `.stat-box` instances
in this corpus are gradient-painted, so two siblings with *different* gradients
would have bucketed as identical and been missed entirely.

Added `background-image` to `PROPS`, re-ran the canary (PASS: TN 0 multi-bucket,
TP catches both injected divergences at 1280 and 390) and re-swept all 757 pages.
Result: **197 pages unchanged, 34 keys (was 33)**. The one new key is
`.pillar-card-visual`, which splits because the four pillar cards carry different
gradients — already-named design intent. Verdict unchanged, blind spot closed.
Saved to `.deploy/probes/gv_lib.py`.

Also saved: `.deploy/probes/navlist_floor_probe.py` (the full-corpus navlist floor
+ coverage-hole pass) and `.deploy/probes/css_chrome_measure.js`.

**Own-error note:** my first `.cl-cta` triage reported *0 tagged, 30 untagged* —
i.e. "the CSS shipped but the markup half never did". That was a bug in my triage
script, not a site defect: `('cl-cta' in attrs and tagged or untagged).append(...)`
evaluates `True and [] → []`, which is falsy, so every hit fell through to
`untagged` while `tagged` was still empty. **Never use the `and/or` idiom with a
list accumulator.** The corpus has 30 tagged and 0 untagged, confirmed by grep and
by render.

## Observation for Michael — no action taken

At ≤768px, standalone link lists render in **two different display boxes**
depending on their container, and both are house rules:

- `m-app.css:1909` — `.sidebar-card ul li a, .sidebar-widget ul li a, .note-list a,
  .related-articles ul li a { display:inline-block !important; line-height:24px }`
- `m-app.css:2258` — `.wwk-navlist > li > a { display:inline-flex !important;
  align-items:center }`

`.related-articles ul li a` (0,1,3) outranks `.wwk-navlist > li > a` (0,1,2), so
the older inline-block rule wins inside those four containers. Measured at 390 on
the sample: **129 lists inline-block, 53 inline-flex**.

This is **not a regression** — the inline-block rule predates the 09-13 change,
**no single list is ever mixed inside itself** (0/182), and both shapes clear the
AA floor. The only visible consequence is that a two-line wrapped link is exactly
48px in a `.related-articles` list (line-height 24 × 2) versus 50.38px in an
`.article-related` list. Converging them means editing a house `!important` rule
for ~2px, which is a typography call, not a regression fix.

Separately: **11 links on `swimmers-hub/butterfly-complete-guide.html` compute
`display:block`** rather than inline-flex — a page-level rule overriding the new
main.css rule, which is precisely the behaviour the "no `!important` here" comment
intends. All 11 clear 24×24. That page is already on file as authored outside the
house template.

## Not verified this run

- **Live edge spot-check was blocked.** `web_fetch` refused the URL (not in the
  session's provenance set), so I could not confirm `last-modified`/`age` on a leaf
  page. The audited tree *is* `origin/live` HEAD, so this affects only edge-cache
  freshness, not correctness of the audit.
- Grouped variance and the chrome battery at **390 and 834 were sampled (162
  pages), not enumerated**; only 1280 (grouped variance) and 834 (navlist floor)
  were full-corpus.
