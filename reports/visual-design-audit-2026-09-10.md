# Visual design audit — 2026-09-10

Clone: fresh `origin/live` @ `9549c7d` → shipped **`6d2e0f4`**
Corpus: 774 html − 23 meta-refresh stubs = **751 live pages**. 0 render errors, 0 nav errors.
Harness: Playwright/Chromium aarch64, served over HTTP (ThreadingTCPServer), fonts fulfilled-not-aborted.

## Scope note
A full CSS regression sweep already ran earlier today and closed every screen axis at 751/751
(variants 5/2, rail, overflow, tap, text-floor, undefined `var()`, breakpoint collisions).
Re-running those would have been churn, so this run targeted axes **absent from the closed-axes
index**.

## Axes measured this run

| Axis | Viewport | Denominator | Result |
|---|---|---|---|
| Horizontal overflow, tablet band | 834px | 751 pages | **0** |
| Image aspect-ratio distortion | 834px | 1,516 rendered `<img>` | **0** |
| Text clipped by `overflow:hidden` | 834px | 1,526 clipping elements | **0** |
| Broken / missing images | static | 1,883 `<img src>` refs, 373 distinct targets | **0 missing** |
| Missing `url()` targets in CSS | static | all `assets/**/*.css` | **0 missing** |
| Heading + prose typography census | 1280px | 751 pages, 11 template families | 1 defect (below) |

Every zero above is backed by a non-zero denominator and a positive-control canary. The canary
caught one bug in my own probe before the sweep: `object-fit:cover` was being scored as pixel
distortion. Only `object-fit:fill` actually stretches an image, so the check now keys on that.

## Defect found and fixed — `.sources` card shipped under two markups

31 pages carry an "Authoritative Sources" block. It renders in two legitimate forms:
21 as a plain section heading in the article flow, and **9 as a styled card**. Of those 9 cards,
6 used the canonical `<div class="sources" …>` and **3 used a bare `<div>` with hand-rolled
inline styles**. This is another instance of the site's recurring
"same furniture ships under two class names" pattern.

The 3 bare cards silently missed every rule keyed on `.sources`:

| Property | Canonical (6) | Bare (3), before | After |
|---|---|---|---|
| **Source-link height @390px** | **44px** | **16px** | **44px** |
| link `display` @390px | inline-flex | inline | inline-flex |
| card font-size @1280 | 14.72px | 16px | 14.72px |
| card colour | `#475569` | `#1f2937` | `#475569` |
| padding | 20px 24px | 18px 22px | 20px 24px |
| margin-top | 32px | 26px | 32px |

The tap-target gap is the one that matters: `m-app.css .sources a` forces a 44px touch target at
≤768px, and these three pages never received it. **The corpus tap sweep reads this as clean** —
each `<li>` is an anchor followed by prose, so it is correctly exempted as an inline link. The
defect is only visible as an *inconsistency between siblings*, which is why a floor-based probe
could never surface it.

Also dropped an inline `color:#334155` on the `<ul>` that was overriding the inherited card colour.

Files: `education/five-layers-protection-drowning-prevention.html`,
`education/lifeguards-dont-replace-supervision.html`,
`education/touch-supervision-explained.html` — 3 files, 6 insertions, 6 deletions, no deletions of
files. All 9 cards now emit byte-identical markup; re-rendered parity is exact at 1280 and 390
(the single 50px reading in the canonical set is a two-line link, i.e. content variance).

## Not fixed — judgement calls

- **`swimmers-hub/freestyle-complete-guide.html`** — lone `<h2 id="authoritative-sources"
  style="margin-top:40px">`, a bare heading with an ad-hoc margin. Sibling of the butterfly guide
  already flagged as authored outside the house template. Editorial, left alone.
- **`education/drowning-statistics-facts.html`** — one `<p>` in `Monaco/Courier New/monospace`.
  This trips the "bare monospace is the tell" heuristic but is a deliberate *cite-this-page* block,
  not an undeclared font-family. Correctly a false positive.
- **Fractional computed sizes** (13.248px, 17.28px, 14.72px, 18.88px…) appear across families from
  nested `em` sizing. Cosmetic compounding, not a defect; would need a house decision to normalise.

## Deploy status — needs confirmation

`git push origin HEAD:live` returned `9549c7d..6d2e0f4`, so the commit **is on `live` at origin**.
Live/edge verification could **not** be completed: browser access to the domain was declined in
this unattended run, and `web_fetch` is provenance-gated. Please confirm on a **leaf** page —
`https://www.waterwisekids.com/education/touch-supervision-explained.html` — never a hub, since the
directory hub serves a stale edge cache. Check `last-modified` + `age`; `?cb=` does not bust the
Cloudflare edge.
