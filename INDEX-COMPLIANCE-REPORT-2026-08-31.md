# Google Index Compliance — 2026-08-31

**Audited commit:** `3bbcc94b` (origin/live) · **Status: PASS — no fixes required, nothing deployed**

> Mount's local `live` was at `2476831c` (2026-08-20), **11 commits stale**. Audited a fresh
> `/tmp` clone reset to `origin/live`, per standing practice.

## Scorecard

| Check | Result |
|---|---|
| sitemap.xml well-formed | ✅ valid, 642 `<loc>`, 0 duplicates, 0 wrong-host |
| Indexable pages ↔ sitemap parity | ✅ **642 = 642**, 0 missing, 0 stale entries |
| noindex/redirect pages in sitemap | ✅ 0 |
| Canonical present & self-referential | ✅ 642/642, 0 wrong-host, 0 mismatched |
| Meta description present | ✅ 642/642 (len 71–160, 0 outliers) |
| Title present | ✅ 642/642 (30–67 chars) |
| Exactly one `<h1>` | ✅ 642/642 |
| Meta tags stranded in `<body>` | ✅ 0 (head intact sitewide) |
| JSON-LD parses | ✅ **1,954 blocks, 0 parse errors** |
| JSON-LD required fields | ✅ 0 issues across FAQPage/Article/BreadcrumbList/HowTo/Organization |
| Schema image URLs resolve | ✅ 80/80 |
| JSON-LD wrong-host URLs | ✅ 0 |
| Broken internal links | ✅ **0 of 26,161** |
| Orphan indexable pages | ✅ 0 |
| Soft-404 / error titles on indexable pages | ✅ 0 |
| Duplicate titles / meta descriptions | ✅ 0 / 0 |
| sitemap `lastmod` format | ✅ 0 missing, 0 malformed, 0 future |
| Date coherence | ✅ 0 conflicting `dateModified`, 0 `datePublished > dateModified`, 0 future |
| robots.txt | ✅ `Allow: /` + sitemap declared |
| Live deploy in sync | ✅ live sitemap byte-identical to repo (128,922 b) |

**Probe integrity:** all-zero results were canary-gated — the parser returns 642/642
non-null on every field, 1,954 JSON-LD blocks and 33,949 hrefs, with sampled real values.
The zeros are real, not a filter that never fires.

**noindex set (88) is fully intentional:** 87 `*-printable.html` lead magnets + `404.html`.
All 87 self-canonical, all correctly excluded from the sitemap. The 23 `meta refresh` stubs
each pair a `0;url=` redirect with a canonical to the same target — correct, and correctly
out of the sitemap.

---

## Open items — all require Michael, none fixable by this job

### 1. `http://` does not redirect to HTTPS *(highest impact)*
```
http://www.waterwisekids.com/          -> 200 OK   (no redirect, no Location)
http://waterwisekids.com/              -> 200      (lands on http://www)
https://waterwisekids.com/             -> 301 -> https://www.waterwisekids.com/   ✅
```
Apex→www is correct; **protocol→HTTPS is not**. Every page is reachable and crawlable on
`http://`, splitting signals across duplicate hosts. Mitigated only by the canonical tag,
which *is* served correctly on the http variant (`https://www.…`).

**Fix:** enable **Enforce HTTPS** in GitHub Pages settings. Edge/redirect config is inert on
GitHub Pages, so this cannot be done from the repo.

### 2. sitemap `lastmod` contradicts schema `dateModified` — 411 URLs
Was 425 on 08-30, 361 on 08-29. Direction is **uniform: 411 ahead, 0 behind** — the
signature of an upstream job bumping `lastmod` on metadata-only passes, not a data defect.
The 186 pages with no `dateModified` are correctly typed FAQPage/WebPage, not Articles.

**Fix belongs in the reconciliation job** (stop bumping `lastmod` on metadata-only passes;
when bumping, reuse the verified content-change date). Reverting 411 crawl signals
unilaterally is above a nightly audit's remit — deliberately not touched.

### 3. Twelve duplicate-H1 page pairs — content strategy, not a defect
e.g. `kids-swim-lessons-ambler-pa.html` vs `swim-lessons/ambler-pa.html`, both
"Kids Swim Lessons in Ambler, PA". **Not a duplicate-content risk** — body similarity
measured at **0.03–0.06**; titles and metas are distinct, both self-canonical, both
legitimately in the sitemap. GSC shows the `/swim-lessons/` twin always wins and the
flat-file twin has zero impressions.

An H1 rewrite has no evidence basis (title↔H1 divergence is site convention). The real
question — whether 12 zero-impression flat-file twins should exist at all — is content
strategy for Michael or the growth job.

### 4. Carried forward: sitemap not fetched by Google since April
Unchanged and unverifiable from here — the API token is read-only. Michael needs to
resubmit the sitemap in Search Console. This is what makes item 2's `lastmod` credibility
worth protecting.

---

*Audit method: fresh clone of `origin/live`; 753 tracked HTML files parsed (642 indexable);
canary-gated probes; hrefs resolved relative to each page's own directory with `<script>`
masked, avoiding the root-relative and JS-template-literal false-positive classes.*
