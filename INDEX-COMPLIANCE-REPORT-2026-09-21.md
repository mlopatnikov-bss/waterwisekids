# Google Index Compliance — 2026-09-21

**Corpus:** fresh clone of `origin/live` @ `9ddf137`
**Shipped:** `da1bfb6` → pushed to `origin/live`
**Scratch:** `/tmp/gic921/` (non-matching prefix, removed)

---

## Census

| | |
|---|---|
| HTML files | **798** |
| noindex | 109 (printables + `404.html`) |
| meta-refresh stubs | 23 |
| indexable primary | **666** |
| sitemap `<loc>` | 666 — **0 missing, 0 extra** |

---

## Standing probes — all canary gates PASS, all axes zero

| Probe | Result |
|---|---|
| `index_compliance_probe` | 19 findings, **all** `duplicate_canonical_stub_convention` (by design) |
| `index_head_agreement_probe` | **0** — `lang=en` 666/666, LD raster refs 437, LD SVG refs 0 |
| `social_head_completeness_probe` | **0** — declared og w/h 666/666 truthful |
| `internal_link_resolution_probe` | 35,752 internal links — **0 broken targets, 0 broken fragments, 0 http-scheme self-links** |
| `index_image_signal_probe` | 88, all two known/blocked buckets (below) |

Sitemap cross-check (fresh, this run): **0** `<loc>` pointing at a redirect stub,
**0** at a noindex page, **0** resolving to nothing, **0** ambiguous between
`foo.html` and `foo/index.html`.

---

## ⭐ New axis this run: robots **preview directives** — 666/666 missing

The standing probes check `index`/`noindex` and canonical, and every page passed.
But **not one page on the site carried a preview directive.** Without an explicit
`max-image-preview`, Google chooses the preview size itself, and the site is
**not eligible for large-image cards in Google Discover** — the single largest
image-driven traffic surface for a parenting/safety site.

Measured shape:

- **658** indexable pages had **no robots meta at all**
- **8** hub pages (`/`, `/education/`, `/about/`, `/contact/`, `/swim-lessons/`,
  `/swimmers-hub/`, `/for-swim-schools/`, `/scholarships/`) had
  `content="index, follow"` and nothing more
- **0** had `max-image-preview`, `max-snippet`, or `max-video-preview`

### Fix shipped (`da1bfb6`)

`max-image-preview:large, max-snippet:-1, max-video-preview:-1`

- **658** pages: new `<meta name="robots">` inserted immediately after the single
  `<link rel="canonical">` (verified exactly one canonical per page first)
- **8** pages: existing `index, follow` **extended in place** — never a second
  robots meta
- **109 noindex** and **23 stubs** deliberately untouched
- Post-fix: `max-image-preview` **666/666**; pages with >1 robots meta **0**;
  noindex count unchanged at **109**

Purely permissive — it widens what Google *may* show and changes no index/follow
decision. Head-only, so **sitemap `lastmod` was intentionally not bumped**: a
preview directive is not a content edit and a false `lastmod` asks Google to
recrawl for nothing.

Probe and fixer saved to the mount at
`.deploy/probes/index_preview_directive_{probe,fixer}.py`.

---

## Carried forward — Michael's decisions, not auto-fixable

1. ⚠️ **`gen-card-image.py` still outputs 600×360.** Now **four** surfaces blocked
   on one flag change: 63 pages whose JSON-LD `image` is under Google's 696px
   rich-result floor; the deferred 297-page `og:image` rollout; and raster cards
   for `swim-practice-log` + `swim-lesson-separation-anxiety-plan`. The script
   renders at 1536×1024 and **hard-crops down** — the resolution exists and is
   thrown away. Changing the output to 1200×630 and regenerating unblocks all four.
   (`ld_image_under_696px` 66 → 64 → **63** as pages get converted one at a time.)
2. **25 `img_dim_scaled_same_ratio`** — 600×360 declared on a 300×180 SVG.
   Ratio-preserving vector; **not a defect**, re-reported every run by design.
3. **Sitemap not downloaded by Google since April** — token scope is still
   `webmasters.readonly`, so this run could not re-submit.
4. **`lastmod` vs `dateModified`** — unchanged from 09-20 (195 ahead / 0 behind);
   not touched, see above.
5. ⚠️ **Dangling locked worktree `/tmp/wwk-wt`** — still registered with the mount's
   repo, directory absent. Needs one interactive `git worktree prune --force`.
6. **Live-HTTP axis still unmeasured.** `web_fetch` refuses waterwisekids.com URLs
   in a scheduled run ("URL not in provenance set") and the browser pane
   auto-declines with nobody present. The only route left is pasting verbatim URLs
   into the task file body.

---

## Environment notes

- Mount working tree dirty at session start (**347** uncommitted changes, HEAD
  stranded at `0e211752b`) — **sixth consecutive day**. Never read as the corpus,
  never written; all measurement in the clone.
- `/sessions` 100% / 0 bytes free throughout; `/` 5.7G of 9.6G.
- Mandated cleanup run with the worktree skip-guard.
