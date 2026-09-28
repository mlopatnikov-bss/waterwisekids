# Google Index Compliance — 2026-09-16

**Corpus:** fresh clone of `origin/live` @ `97d262546` · 782 HTML · 680 indexable · 657 in sitemap
**Result:** COMPLIANT. Every previously-closed axis 0; six new axes opened and closed at 0;
one real publish-surface hygiene defect found and fixed.
**Shipped:** `a8303e584` (pushed to `live`, verified at the git layer).

## Why this run was not churn
The last compliance close was `fc5f87c` (09-15 PM). Delta since: **2 HTML added / 11 modified,
CSS+JS 0 bytes, `sitemap.xml` touched.** Added pages plus a sitemap edit invalidate a sitemap
reconciliation baseline, so the surface was re-measured rather than assumed.

## Re-closed axes (all 0)
All six saved probes canary-gated PASS before each real run.

| Probe | Result |
|---|---|
| `index_compliance_probe` | sitemap **657/657 exact both directions** (0 missing, 0 extra); canonical / title / h1 / meta-desc / OG+Twitter / stub integrity / robots **all 0**. Only finding: the 19 known stub-convention duplicate canonicals. |
| `seo_depth_probe` | 0 — 469 headlines under the 110-char cap; og:image 680, twitter:image 680, JSON-LD image 471, all absolute and all targets resolving. |
| `alt_jsonld_interior_probe` | 0 — **2,291 JSON-LD nodes** (570 Article / 649 FAQ / 3,099 Q-A / 755 breadcrumb / 47 HowTo / 247 steps); alt **1,915/1,915 described**. |
| `canonical_target_robots_probe` | 0 — 657/657 self-canonical, 0 cross-canonical to a noindex/stub/missing target; 0 robots.txt Disallow rules; 23 stubs, 0 two-hop chains. |
| `asset_size_validity_probe` | 0 real — 3,956 local asset refs, 0 missing; tag balance 0; duplicate `id` 0. Only `education/index.html` at 352KB, the known architectural hub, not a defect. |
| `internal_link_resolution_probe` | **34,883 internal links / 0 broken / 0 broken fragments / 0 http-scheme self-links.** |

## SIX NEW AXES — opened and closed this run, all 0
Nothing had ever measured the head-declaration surface or content depth.
Probe: `.deploy/probes/head_declaration_thin_probe.py`, gated on **17 positive shapes + a negative canary**.

1. **`<meta charset>` integrity** — 782/782 present, **one variant** (`utf-8`), every one inside the
   first 1024 bytes. (Past that boundary a browser may re-sniff the encoding and mangle the snippet.)
2. **`<html lang>` integrity** — 782/782 present, **one variant** (`en`), all well-formed BCP-47.
3. **`<base href>` presence — 0.** A single `<base>` silently rewrites every relative href and
   canonical resolution site-wide; this confirms none exists.
4. **Robots directive *value* validity** — 0 invalid tokens, 0 `robots`-vs-`googlebot` conflicts,
   0 pages with multiple `robots` metas. (A typo like `no-index` is silently ignored by Google, so
   a page meant to be hidden stays indexed — invisible to every presence-based check.)
5. **Sitemap XML *protocol* validity** — well-formed, correct namespace, 657 URLs (cap 50,000),
   129KB (cap 50MB); every `<loc>` absolute, escaped and whitespace-free; every `lastmod` valid
   W3C datetime; changefreq/priority all in range.
6. **Thin-content floor on indexable pages** — **0 under 150 words** across all 657, bucketed by
   template family first. Median 1,923 words; articles median 2,256, min 1,456.

**Probe-design trap recorded:** the first canary build FAILED, correctly. A raw `&` in a `<loc>`
makes the whole sitemap unparseable, so an escaping check that reads the *parsed* tree can never
fire — dead code. The escaping scan now runs on **raw bytes**, independent of the XML parse.

## Defect found and fixed
**12 dated ops-report filename patterns / 53 files in the web root were untracked but NOT ignored.**
That is one `git add -A` away from the earlier incident where 83 ops reports were served 200 to the
public web. Among the exposed patterns was `GOOGLE-INDEX-COMPLIANCE-*.md` — the filename this very
task writes every day.

Fix: 12 anchored rules appended to `.gitignore`. Membership was tested against **exact lines**, not
substrings — the prior miss happened because `AUDIT-REPORT-*` appeared to be "already present" while
only hiding inside `SITE-AUDIT-REPORT-*`. Effect verified end to end: **unignored 331 → 0**.
Negative canary: **0 of 1,281 tracked files** match any new rule, and the tracked count is unchanged.

> Note: the mount's `.gitignore` is stranded at 2026-08-20 and lacks 24 lines the live branch has.
> Audit the clone, never the mount.

## Thin tail (no action — reported for visibility)
The 10 shortest indexable pages are all transactional or utility templates, correctly so:
`contact/` 152w · `teens/scholarships.html` 191w · `jobs/` 207w · `aquatic-jobs/` 330w ·
`jobs/post.html` 383w · `swim-schools/add.html` 401w · three NJ city pages 457–485w · `privacy/` 481w.
None is a soft-404 risk at these lengths, but `contact/` and `teens/scholarships.html` are the two
worth watching if Google ever trims the index.

## Carried forward (unchanged, human decisions)
- Live edge/HTTP verification remains impossible in a scheduled run — `web_fetch` refuses the domain
  (provenance) and the browser pane auto-declines with nobody present. **Git-layer verification only.**
  To unblock: paste verbatim leaf URLs into the task file body.
- `http://` variants still indexed by Google — needs Michael's toggle.
- 136-page date-surface backlog (lastmod / dateModified / prose) — all-or-none editorial call.
- Outbound canonicalisation backlog: Goldfish 218 / Aqua-Tots 144 / SafeSplash 131 / BigBlue 62.
- `.git` at 271MB across 64 packs, never gc'd.
