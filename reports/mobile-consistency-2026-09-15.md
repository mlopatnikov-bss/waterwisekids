# Mobile consistency check — 2026-09-15

**Tree audited:** fresh clone of `origin/live` @ `fc5f87c` (780 HTML − 23 meta-refresh
stubs = **757 live pages**).
**Verdict: CLEAN. Nothing pushed.**
One probe blind spot closed (see below), one 1px observation left for Michael.

---

## Scope, and why it is this size

The CSS/JS byte delta since the last mobile closure (`94b8921`, 2026-09-13) is **ZERO** —
`git diff --stat 94b8921..HEAD -- '*.css' '*.js'` is empty. 75 HTML files changed, 0 added,
0 removed; the rest of the 118-file delta is unpublished ops reports and `sitemap.xml`.
With no stylesheet or script change, a new mobile defect can only reach a page that was
itself edited, so the render sweep was scoped to **the 75 delta pages at 390 and 320**,
plus a **70-page random control** at 390 as a drift guard. Two axes that are cheap to
parse statically were run at **full corpus**.

Probes copied verbatim from `.deploy/probes/` (never re-derived) and **canary-gated before
use**: synthetic TP fires on all five list axes plus `docOverflow`, `rail 0`, `hamburger 0`;
synthetic TN fires on none.

## Results

| Axis | Scope | Result |
|---|---|---|
| Viewport meta (HTML-parsed, not regex) | **780/780** | one variant `width=device-width, initial-scale=1.0`; **0** `user-scalable=no`, **0** `maximum-scale` |
| `.hamburger` present exactly once | **763/763** | 1 per page, visible at 390 |
| Hamburger actually opens the drawer | 12 pages, every template family | **12/12** — 44×44 target, `aria-expanded` false→true, 2 panels appear |
| Document horizontal overflow | 145 pages @390 + 75 @320 | **0** |
| Element overflow escaping a scroller | 145 pages | **0** (95 raw hits, all contained — see FP 1) |
| Chrome text < 11px | 145 pages | **0** |
| Text-entry inputs < 16px (iOS zoom) | 145 pages | **0** |
| Image container/viewport overflow + aspect distortion | 145 pages | **0** |
| Tap targets < AA 24px | 145 pages | **0** |
| Content rail @390 | **298 pages** newly measured + 145 | **20px**, 4 exceptions at 21px |

Render errors: **0** across every chunk (75 @390, 75 @320, 70 control, 298 rail, 12 burger).

---

## ⭐ The finding: the rail axis was unmeasured on 39% of the corpus

`mobile_measure.js` rooted its rail measurement at `main` with a single fallback to
`.article-body`. A census of the live corpus:

| content root available | pages |
|---|---|
| `<main>` | 459 |
| `article.article` (city / local-guide family) | 122 |
| neither (printables + a few index pages) | 176 |

So on **298 of 757 pages** the probe found no root and returned `rail: null`. Every run
since 09-13 recorded that as "298 None (printables have no `<main>`)" and moved on — but
`null` is *not measured*, not *clean*. This is the same shape as the defect that survived
three stylesheet passes in `inline_style_gutter_outranks_the_mobile_band`.

Measured this run with a widened root list, all at 390:

- `article.article` family — **122/122 read exactly 20px** content rail, 20px footer rail.
- body-rooted family — **176/176 read 20px**, except the 4 below.
- Re-run of the 75 delta pages with the patched probe: **75/75 at 20px, 0 `None`.**

No defect was hiding there. The axis is now genuinely closed rather than silently skipped.

`.deploy/probes/mobile_measure.js` patched (root list + chrome exclusion when rooted at
`body`, or the reading is the header's rail). Re-canaried: TP still 0, TN still 20.

## Observation left for Michael — 4 pages at a 21px rail, not 20

`privacy/index.html`, `terms/index.html`, `swim-schools.html`, `jobs/post.html` carry a
page-local `.content { padding: 3rem 1.5rem }`. The mobile root font-size is 14px, so
`1.5rem` computes to **21px** against the chrome's hard 20px rail — the documented
`rem_side_gutter_drifts_off_chrome_rail` class.

**Not fixed, deliberately.** The deviation is **1px**, invisible in use, and the fix means
editing four page-local stylesheets to chase a rounding difference. Flagging rather than
shipping, alongside the ~2px `.related-articles` / `.article-related` item already parked
as a typography call.

`jobs/post.html` additionally read leftmost-text 28.1 — that is its **centred gradient
hero** (`section.page-header`, box on the 21px rail, text centred), not a gutter defect.

## Three false positives triaged — do not re-report

1. **95 element-overflow hits on 3 control pages** — `education/index.html` (93
   `button.cat-btn`) and two printables (`table.wk-calc`). The containment probe returns
   **contained 95 / uncontained 0**: all sit inside legitimate `overflow-x:auto` scrollers.
   `docOverflow == 0` together with non-zero element hits is the signature of the probe
   bug, not a corpus defect — `element_overflow_probe_must_skip_scrollers` again.
2. **Footer leftmost-text reads 23.2 @390 and 31.8 @320.** The footer container is
   `text-align:center` on 660 pages, so leftmost *text* moves with the viewport. The house
   metric is `box.x + paddingLeft`, which reads **20 at both widths**. A leftmost-text
   reading is not a footer-rail proxy for a centred footer.
3. **3 pages reading leftmost text 21 on an `h2`** — same 21px box rail as above, not a
   separate defect; the Range-vs-box difference is sub-pixel.

## Not verified

- **Live edge freshness — still blocked, third day running.** No browser access was
  available in this unattended run, so no `last-modified` / `age` check on a leaf page.
  The audited bytes are `origin/live` HEAD; this gap touches edge staleness only
  (`directory_hub_serves_a_stale_edge_cache` is why it matters). Granting the browser pane
  `waterwisekids.com` once would restore it.
- The 682 non-delta pages were not re-rendered on the five list axes. Justified by the zero
  CSS/JS delta plus the 09-13 full-corpus closure and the 09-15 full-corpus navlist floor
  run (0/4,736 links under 24×24 @834); the 70-page control found nothing.
- Tablet band (769–1149) not swept this run — no CSS changed since it was last measured.
