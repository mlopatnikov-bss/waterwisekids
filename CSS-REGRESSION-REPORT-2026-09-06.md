# CSS Regression Report — 2026-09-06

**Base:** `origin/live` @ `b64e83140` → shipped `1f24151eb`
**Method:** headless Chromium 151 render sweep (computed styles + leaf-text geometry), not grep.
**Coverage:** 31 template-representative pages × 4 viewports (1280 / 900 / 390 / 320) = **124 probes, 0 errors, 0 page errors.**
Plus a mobile drawer pass (8 pages, hamburger clicked) and a hover/focus state pass (31 pages).

---

## Sample construction

765 HTML files → 23 meta-refresh stubs excluded → **742 scanned**. Partitioned on the
4-part key (normalized header hash, normalized footer hash, stylesheet set, page type)
→ 20 buckets → 31 pages sampled (largest + median member of each multi-member bucket).

**Tripwire held.** Normalized markup variants came back at exactly the documented counts:

| | variants | expected |
|---|---|---|
| header | **6** | 6 ✓ |
| footer | **2** | 2 ✓ |

No new chrome variant has entered the corpus.

---

## Clean

| check | result |
|---|---|
| Footer computed styles (18 props) | **1 bucket** across all 31 pages × all 4 viewports |
| Header computed styles | 1 bucket + 2 known-family outliers (below) |
| Header rail == footer rail | **31/31 at every viewport** — 84px @1280, 24px @900, 20px @390/320 |
| `max-width` of both rails | 1160px, 31/31, all viewports |
| Horizontal overflow | **0px** on every page at every viewport |
| Body font stack | `Inter, system-ui, -apple-system, sans-serif` — 31/31 |
| Mobile drawer (hamburger clicked, 8 pages across all header variants) | link x=36, w=318, h=49, 15px, toggle 44×44 — **identical on all 8**; no stacked gutter, no overflow |
| Hover / focus state pass | 3 buckets, and the only difference between them is *which* nav link carries `.active` — i.e. correct per-page behaviour, not drift. Hover colours, hover backgrounds, footer link states, focus outlines all identical |
| Rogue inline CSS in chrome | 2 distinct patterns, both convention: logo `width/height` (CLS guard, known false-positive class) and footer `.container{text-align:center}` |

The 20px ≤768 / 24px ≥769 gutter convention is intact, and the drawer inset did **not**
decouple from the rail — the failure mode flagged in `hardcoded_inset_decouples_from_the_gutter_it_copied`.

---

## Shipped — `1f24151eb`

**Four divergent monospace stacks normalized onto the house stack.**

A rendered font-family census (not a grep of stylesheets — the census walks visible
text leaves and reads `getComputedStyle`) surfaced `statistics/index.html` rendering
text in bare UA `monospace`. Chasing that one hit found the site's "cite this page"
surfaces resolving to **four different fonts**:

| where | declared stack | resolved to |
|---|---|---|
| `main.css` `.article-content code` | `'Monaco','Courier New',monospace` | **the house stack** |
| `education/drowning-statistics-facts.html` (inline on `<p>`) | `Menlo,Consolas,monospace` | Menlo on macOS, Consolas on Windows |
| `aquatic-jobs/index.html` `.code-value` | `'Courier New',monospace` | Courier New |
| `statistics/index.html` `.cite-box code` | *undeclared* | UA default |
| `statistics/state-of-drowning-prevention/` `.cite-box code` | *undeclared* | UA default |

The two `.cite-box code` rules were otherwise fully styled in their page `<style>`
blocks — background, border, padding, size, colour — they simply never declared
`font-family`, so the one property that decides what the citation actually *looks*
like fell through to the browser. All four now carry `'Monaco','Courier New',monospace`.

**Verification:**

- All 4 elements re-render with `font-family: Monaco, "Courier New", monospace` at 1280 and 390.
- Full 31-page × 2-viewport re-render diffed against the pre-edit capture: **0 chrome/layout diffs**; the font-family census changed on exactly one page (`statistics/index.html`), which is the intended change.
- No asset file was touched — all four edits are inline in HTML — so **no cache-bust bump and no `main.js` 3-file deploy** was required.
- Not a body-text change, so no `dateModified` / sitemap `lastmod` bump.

---

## Logged, not shipped

**`special-needs.css` re-declares `html, body { color:#13304a; background:#f4f8fb; font-family:… }` alongside `main.css`.**

This is the documented `page_stylesheet_leaks_into_shared_chrome` shape, and the
`<header>` element on that page does inherit the wrong colour (`rgb(19,48,74)` vs the
sitewide `rgb(31,41,55)`).

**But nothing visible renders from it.** A leaf-text walk of the header and footer on
`special-needs-swimming.html` versus three control pages returned byte-identical
colour, size, weight and family for all 9 header text nodes and all 17 footer text
nodes — every one of them carries an explicit colour rule, so the leaked inherit never
surfaces. Shipping a scoping change here would alter the page's own themed body text
(the sheet is deliberately themed; it even carries a comment reasoning about its
main.css interaction) in exchange for zero rendered improvement.

Left as a **latent trap**: any *new* unstyled text added to the chrome would render
off-brand on this one page. Flagging rather than fixing, in line with the `#114c76`
retraction — a colour-ramp decision on a themed page is Michael's, not a sweep's.

`education/pool-safety-rules-printable.html` showed the same header-colour inherit and
is exempt by design — printables are a standalone template family with no `main.css`,
and `printable-poster.css` documents its bare `body` rule as a deliberate mirror.

---

## Method notes for the next run

- The npm registry install of `playwright-core` **fails with ENOSPC** even with ~2.9 GB free and 90% of inodes available — npm's staging blows a quota the `df` doesn't show. Fetching the tarball directly works: `curl -sL registry.npmjs.org/playwright-core/-/playwright-core-1.62.0.tgz | tar xz` and rename `package/` → `playwright-core/`. Saves the whole detour.
- Container border-box `x` is **not** a rail measurement: `headerInner.x` reads 0 at mobile and `footerInner.x` reads 20 on the same page, which looks like a 20px misalignment and is not one. The rails are equal once `paddingLeft` is added. Measure `x + paddingLeft`, or the leaf.
- Conversely, leftmost *text leaf* is not a rail proxy for `main` — it lands inside centred cards and hero blocks and scatters across 12 values at 1280 with no defect present. Leaf for chrome, `x+padding` for content rails.

---

## Score

| | |
|---|---|
| Probes | 124 render + 8 drawer + 31 state |
| Errors | 0 |
| Chrome variants | 6 header / 2 footer — unchanged |
| Regressions found | 1 (font stack, 4 pages) |
| Regressions shipped | 1 |
| Latent items logged | 1 (`special-needs.css` chrome inherit) |
