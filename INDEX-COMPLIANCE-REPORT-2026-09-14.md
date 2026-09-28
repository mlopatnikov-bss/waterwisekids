# Index Compliance Report — 2026-09-14

**Status: PASS** · corpus 780 pages · commit `4297c10d8` pushed to `live`

Audited on a fresh clone of `live` (never the mount). Both probes copied verbatim
from `.deploy/probes/` and canary-gated before their output was read.

---

## Gate results

| Probe | Canary | Result |
|---|---|---|
| `index_compliance_probe.py` | PASS — all 9 injected TPs fired; href-before-rel canonical still parsed | 19 findings, all by-design |
| `internal_link_resolution_probe.py` | PASS — missing-target and missing-fragment both fired | 0 broken |

Independent denominator cross-check (separate script, parser constructed not assumed):

```
html 780 · with_title 780 · with_h1 763 · with_metadesc 780
pages_with_jsonld 780 · jsonld_blocks 2282 · jsonld_unparseable 0 · parse_err 0
```

`with_h1 763` = 780 − 17 redirect stubs, which is the expected exemption, not a defect.
`jsonld_blocks 2282` matches the 09-13 baseline exactly.

## Census

| | |
|---|---|
| total | 780 |
| indexable | 679 |
| noindex | 101 |
| stub | 23 |
| printable | 103 |
| article | 428 |
| legacy | 226 |

## Axis results

**Sitemap** — 656 locs, 656 expected, **0 missing / 0 extra**. Every `<loc>` carries a
`lastmod` (656/656). No non-indexable URL present. Indexable 679 − 23 stubs = 656. ✅

**Canonicals** — 0 missing, 0 empty, 0 multiple, 0 non-https, 0 wrong-host, 0 outside
`<head>`, 0 pointing at a missing target. Parsed, never grepped, so attribute order
can't under-count. ✅

**noindex** — 101 pages: 100 printables + `404.html`. A separate check confirmed
**0 noindex pages that are not printables**, i.e. no real content page has lost its
indexability. The 3 indexable printables are the known `three_printables_outrank_their_landing_pages` item. ✅

**Structured data** — 2282 JSON-LD blocks across all 780 pages, **0 unparseable**,
0 http-scheme, 0 non-www host. ✅

**robots.txt** — present, `Allow: /`, sitemap reference on the correct https www host. ✅

**Meta descriptions** — 780/780 present. 0 empty, 0 duplicate-shape, 0 over the 160-char
hard cap, 0 under floor, 0 truncated mid-clause. ✅

**Internal links** — 34,719 internal `<a>` links across 780 pages: **0 broken targets,
0 broken fragments, 0 http-scheme self-links**. ✅

**Titles** — 780/780 present, 0 empty, 0 multiple, 0 soft-404 titles. ✅

## Only finding — by design

`duplicate_canonical_stub_convention: 19` — 19 groups where a redirect stub shares a
canonical with its destination. This is the stub convention, not a collision; the probe
classifies it separately and 0 real collisions survive once stubs are stripped.

---

## Change shipped

**`4297c10d8` — unpublished 27 dated ops reports and closed the `.gitignore` gap.**

The 09-13 sweep (`3c4be070e`) removed the 44 ops reports whose filename families
`.gitignore` already declared "never publish", and left 29 behind because their families
had **no ignore rule at all**. That gap is now closed for 8 dated run-report families:

`AEO-REPORT` · `AUDIT-REPORT` · `CSS-REGRESSION-REPORT` · `INDEX-COMPLIANCE-REPORT`
`MOBILE-REPORT` · `NEW-CONTENT-VALIDATION` · `SEO-REPORT` · `VISUAL-AUDIT-REPORT`

27 files removed. None was linked from any page (checked against all 780) and none was in
the sitemap, so no link or index surface changed. Staged set verified to contain
**0 `.html`, 0 assets, 0 AutoDeploy `.app` bundles** before commit.

### One trap caught mid-fix

My first pass added only 7 of the 8 rules. The membership test was a substring test, and
`AUDIT-REPORT-*.md` is a substring of the pre-existing `SITE-AUDIT-REPORT-*.md` rule — so
it was silently skipped and would have reported success. Caught by verifying each rule with
`git check-ignore --no-index` (a tracked path returns a false all-clear without it) rather
than trusting the writer's own return value. Re-tested line-exact: 8/8 families ignored,
and `index.html` / `sitemap.xml` / `robots.txt` / `main.css` / `education/index.html`
all confirmed still publishable.

---

## Needs Michael

1. **2 root `.md` files still served 200 from the web root** — `AEO-STRATEGY.md` and
   `aeo-progress.md`. Left in place deliberately: unlike the 27, these are not dated run
   artifacts, so whether they are ops scratch or intentional content is a call about intent,
   not a mechanical class. Say the word and they go the same way.
2. **`AUTHORITY`/edge verification not performed this run** — `web_fetch` is provenance-gated
   in scheduled runs, so the live-edge 404/200 check was skipped. Repo state is definitive
   for what GitHub Pages serves; the Cloudflare edge may lag up to ~600s regardless.
3. Carried over, unchanged: 80 HowTo `step.url` (editorial, not mechanically closable),
   sitemap `lastmod` vs `dateModified` disagreement on 356 urls, `.git` at 271MB / 64 packs
   never gc'd.
