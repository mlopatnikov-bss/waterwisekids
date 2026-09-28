# SEO Optimizer — 2026-09-14

Corpus: **780 HTML / 679 indexable / 101 noindex / 23 stubs / 103 printables**
Baseline: `4297c10d` → shipped `cab8113e` (branch `live`)

## Why a full sweep was not churn

The four target axes (meta desc, alt, JSON-LD, OG) were last closed 09-13 at 776/677.
Since the last close, **761 of 780 HTML files were modified** (`3e74c0d3` tap-floor sweep,
`7157f391`/`938f4d73` AAP corrections, `94b8921b` printable CTA floor) plus 2 new pages.
A 97%-of-corpus modification wave invalidates a markup baseline, so the axes were re-measured
rather than assumed.

## Result: all four target axes CLEAN

Probe: `.deploy/probes/index_compliance_probe.py`, copied verbatim. **Canary gate PASS** —
all 5 injected shapes fired and the href-before-rel canonical trap still parsed.

| Axis | Result |
|---|---|
| Meta description — missing / multiple / empty / >160ch / <70ch / truncated mid-clause | **0** |
| Image alt text | **0** — 1,910/1,910 `<img>` carry non-empty, non-placeholder alt |
| JSON-LD — unparseable / non-www host / http scheme | **0** across 2,282 nodes |
| OG + Twitter — og:title, og:description, og:url, og:image, twitter:card | **0** |
| Canonical / title / h1 / stub integrity / robots.txt | **0** |
| Sitemap | **656/656 exact, both directions** |

Only finding: 19 `duplicate_canonical_stub_convention` — the known redirect-stub convention,
0 real collisions surviving the stub filter. Not a defect.

### New depth axes (not previously in the closed-axes index)

Two new canary-gated probes written and saved to `.deploy/probes/`:
`alt_jsonld_interior_probe.py`, `seo_depth_probe.py`. Both **0 findings**.

- JSON-LD **interiors**: 568 Article (required + recommended fields), 644 FAQPage /
  3,070 Q-A pairs, 753 BreadcrumbList (position contiguity), 47 HowTo / 247 steps — all clean.
- `og:image` / `twitter:image` / JSON-LD `image` **target existence** — 0 broken, 0 relative.
- Schema `headline` vs Google's 110-char limit — 0 over, across 468 headlines.

## Shipped: 10 dated ops reports unpublished (`cab8113e`)

The 09-13 (44 files) and 09-14 (27 files) unpublish sweeps both scoped their denominator to
**UPPERCASE dated filenames in the web root**, so neither ever saw the three **lowercase report
directories**. `.nojekyll` is present, so Pages serves them verbatim. All 10 were crawlable thin
ops content with **0 inbound links and 0 sitemap entries** — pure index bloat.

- `.seo-reports/` — 5 files · `qa-reports/` — 2 · `reports/` — 3
- `.gitignore`: added **anchored** `/.seo-reports/`, `/qa-reports/`, `/reports/`. None of the
  three had any rule, so they would have kept recurring. Anchored deliberately — a bare rule
  would also swallow nested paths like `education/reports/`.
- Verified: 6 positive canaries ignored, 6 negative canaries kept (incl.
  `education/reports/keepme.html`, `assets/reports.css`, `swim-lessons/qa-reports-guide.html`).
- Post-change re-run: census identical, sitemap still 656/656, 0 dated ops reports tracked.

No page content changed, so no lastmod or cache-bust bump was warranted.

## ⚠️ Needs Michael

**1. 214 indexable pages hotlink their `og:image` from `images.pexels.com` — and it is one photo.**
`pexels-photo-12940787` is the default social card on 450 references (238 written with a raw `&`,
212 with `&amp;` — same URL, two encodings). 47 JSON-LD `image` values point off-host too.
Distribution: 134 legacy root pages, 51 directory, 13 swim-lessons, 7 education, 5 teens, 4 other.

- **Risk:** a single third-party URL rotating, or Pexels blocking hotlinking, silently kills the
  social preview on 214 pages *and* the Article rich-result image on 47 — with every existing
  probe still reporting the tag present and well-formed.
- Google requires structured-data image URLs to be **crawlable and indexable**. The URLs are
  correctly sized (1200×630, meeting the ≥1200px minimum), but **I could not verify
  `images.pexels.com/robots.txt` this run** — browser access to that host needs approval and no
  one is present in a scheduled run. That crawlability question is unresolved, not cleared.
- **Not auto-remediated on purpose:** rehosting 200+ third-party stock images is a licensing and
  repo-weight decision, not a markup fix.
- Side note: the `&` / `&amp;` split means any future regex sweep on that URL that matches one
  encoding will silently miss ~half the surface.

**2. Four non-dated ops artifacts still tracked in the web root** (deliberately untouched, since
"not dated" was already flagged as your call): `AEO-STRATEGY.md`, `aeo-progress.md`,
`memory-transfer/image_registry.md`, `swim-lessons/directory/README.md`.

**3. Not touched, as always:** the 6 AutoDeploy `.app` files — git-rm'ing those would delete your
launchers on the next pull.
