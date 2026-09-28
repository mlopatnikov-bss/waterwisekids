# Google Index Compliance — 2026-09-19

**Base:** fresh clone of `origin/live` @ `e5ecf30aa` → **shipped `c1507ccb1`**
**Verdict:** compliant. Every standing axis zero; one real defect found by a new axis, fixed and pushed.

---

## Census

| | |
|---|---|
| HTML files | 791 |
| `noindex` | 106 (105 printables + `404.html`) |
| redirect stubs (`meta refresh`) | 23 |
| **indexable, non-stub** | **662** |
| sitemap `<loc>` | 662 — **0 missing, 0 extra** |

Sitemap reconciles to the canonical set **by exact string**, not merely normalized —
a stricter statement than any prior run made.

---

## Standing axes — all zero

Ran `.deploy/probes/index_compliance_probe.py` verbatim (not re-derived).
**Canary gate: PASS** — every injected true positive fired, including the
href-before-rel canonical parse.

Zero findings across: sitemap integrity (dup loc, wrong host, URL-with-no-file,
indexable-missing, should-not-be-there, lastmod/changefreq/priority validity) ·
canonical (absent, multiple, non-https, wrong host, in `<body>`) · title / meta
description / h1 (missing, duplicate, out-of-range, multiple, soft-404) · head
breakage (per-attribute raw scan) · JSON-LD (unparseable, missing required
top-level fields, Q/A and ListItem integrity, self-URL ≠ canonical, date sanity) ·
links & assets (broken internal href, 404 img/script/link/og:image) · reachability.

The only output is `duplicate_canonical_stub_convention: 19` — **by design**, a stub
and its destination share a canonical. Not a defect.

---

## New axes opened this run

Per the standing advice that re-running closed axes adds nothing, five axes that
no prior run had measured:

### ⭐ A. `og:image` ≠ JSON-LD `image` — **2 pages, REAL, FIXED**

- `education/swim-vest-life-jacket.html`
- `education/rip-currents-pull-you-under.html`

Both were **half-converted**: `twitter:image` and JSON-LD `image` pointed at the
page's own card, `og:image` was still the generic site card, and
`og:image:width/height` were **absent entirely**. Net effect — Facebook and
LinkedIn showed the generic card while X showed the article card, for the same URL.

This is the identical shape found on `education/jump-turn-swim-explained.html` on
2026-09-18, so the axis that was closed that day has regressed by two pages.

**Fixed:** `og:image` now points at the page's own card, with `600x360` declared
and **verified against the JPEG SOF marker** — truthful, not aspirational.
Publisher-logo `ImageObject` left untouched. Post-fix: **0/662**.

Head-meta-only change, so sitemap `lastmod` and schema `dateModified` were
deliberately not bumped (no prose diff).

### B. JSON-LD image pixel width vs Google's rich-result floor — **66 pages, blocked on Michael**

66 indexable pages declare a JSON-LD `image` whose **actual** pixels are
**600×360** — below Google's 696px-wide floor for a large image preview, and well
below the 1200px recommendation. 434 raster LD image references in total.

⚠️ **Do not "fix" this by repointing `image` at the generic 1200×630 card** — that
would re-open axis A above on 66 pages. And do not upscale the existing JPEGs:
`.deploy/gen-card-image.py` generates at 1536×1024 and then **hard-crops down to
600×360**, so the source resolution exists at generation time and is thrown away.

**The one correct fix is Michael's:** change the generator's output size to
1200×630 and regenerate, after which the cards, the `og:image` declaration, and
the LD image floor all become correct in a single move. This is the same
blocked-on-Michael root cause recorded on 2026-09-18 for the 297-page og:image
rollout — now quantified on a second surface.

### C. Header-level indexing directives — clean

`robots.txt`: `Allow: /`, no `Disallow`, sitemap correctly declared at the www
host. No sitemap URL is blocked. `_headers` carries only a `styles.css` cache
rule. No `X-Robots-Tag` anywhere. `.htaccess` is inert on GitHub Pages but
contains no indexing directives either.

### D. `<img>` declared `width`/`height` vs actual file pixels — clean

377 local images carry both attributes. **0 aspect-ratio mismatches**, so no
CLS exposure. 25 declare `600x360` against a `300x180` SVG — ratio-preserving and
vector, therefore not a defect (reported separately so it is not miscounted next
run).

### E. `<html lang>`, charset, viewport — clean

`lang="en"` on **662/662**. 0 missing charset, 0 missing viewport.

---

## Probe hygiene applied

- House filter pair used verbatim on every corpus-wide count: skip `noindex`
  **and** skip `http-equiv="refresh"`. Without the second, the denominator
  over-reports by 23.
- Image dimensions read from the **bytes** (JPEG SOF / PNG IHDR / GIF / WebP /
  SVG viewBox), never from the declaration.
- New probes canary-gated with injected true positives before any output was read.
- An exact-string replace asserted its own match count. It **caught a
  near-miss**: the generic image URL appears twice per page, the second being the
  publisher-logo `ImageObject`. A naive replace would have rewritten the
  publisher logo on both pages. Nothing was written until the assertion was
  narrowed to the `og:image` meta tag.

## Unverified

Live-HTTP status checks remain impossible in a scheduled run: `web_fetch` refuses
`waterwisekids.com` URLs for lack of provenance, and browser `request_access`
auto-declines with nobody present. The only route is pasting verbatim URLs into
the task file body. Carried forward.

## Needs Michael

1. **Regenerate the education cards at 1200×630** (`.deploy/gen-card-image.py`,
   currently hard-coded to 600×360). Unblocks the 66-page LD image floor *and*
   the deferred 297-page `og:image` rollout in one move.
2. `git worktree prune --force` in the mount's repo — `/tmp/wwk-wt` has been a
   dangling locked registry entry for 11 runs across 4 days.
3. Standing items unchanged: sitemap not downloaded since April; `lastmod` vs
   `dateModified` drift; the city-cluster self-canonical twins.
