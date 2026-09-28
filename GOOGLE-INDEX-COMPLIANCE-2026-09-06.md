# Google Index Compliance — 2026-09-06

Audited against a **fresh clone of `live`** at `fbc2c7268` (2026-09-05 20:16). Every sweep below was
canary-gated: a synthetic defect was injected and the detector confirmed to fire before any
"0 findings" was accepted.

## Verdict

**On-page compliance: CLEAN. No code changes required, nothing pushed.**
Two live-infrastructure blockers remain open and both need Michael — neither is fixable from the repo.

---

## 1. Sitemap — valid

| Check | Result |
|---|---|
| XML parses | OK |
| URLs | 648, **0 duplicates** |
| Entries pointing at missing files | **0** |
| Non-canonical host in `<loc>` | 0 |
| `lastmod` missing / malformed / future-dated | 0 / 0 / 0 |
| robots.txt | valid, `Allow: /`, correct `Sitemap:` line |

**117 HTML files on disk sit outside the sitemap — all deliberate, none a defect:**

- **94 `noindex`** — the printable template family (93) + `404.html`
- **23 redirect stubs** — legacy root URLs with `meta refresh` to their live destinations

## 2. Indexability — 648/648 pages clean

Zero findings across 15 checks: `noindex` leakage, missing/duplicate/relative/non-www canonical,
canonical mismatch, missing or empty meta description, missing/duplicate `<title>`, missing/duplicate
`<h1>`, JSON-LD parse failure, non-www schema URLs, and unbalanced quotes in `<head>` meta attributes
(parsed **per tag**, so the known two-adjacent-tags regex trap does not apply).

All 14 detectors passed canary injection.

## 3. Structured data — clean

648/648 pages carry JSON-LD. 3,002 Q&A pairs, 647 BreadcrumbLists, 634 FAQPages, 461 Articles, 43 HowTos.

- Article: **0** missing `headline`, `image`, `datePublished`, `dateModified`, `author`, `publisher`
- FAQPage: **0** empty `acceptedAnswer`
- BreadcrumbList: **0** malformed `itemListElement`
- HowTo: **0** malformed steps
- Schema image URLs: 65 local, **0 missing**; 14 external (Pexels)
- Missing `@context`: 0 · non-www `url`/`@id`: 0

> **Retracted over-flag:** an initial rule reported 613 `Organization` nodes missing `url`. All 613 are
> nested `author`/`publisher` reference objects, where Google requires only `name`. Both genuine
> top-level `Organization` nodes have `url`. **Real defects: 0.** Top-level requirements must not be
> applied to nested reference objects.

## 4. Links — clean

- **30,215** internal `<a>` links resolved → **0 broken**
- **0** missing `#fragment` targets
- **0** broken local asset references (img/script/css)
- Resolver canaried: correctly rejects fabricated paths, correctly accepts extensionless and
  directory-index URLs (both valid GitHub Pages behavior)

## 5. Crawl discoverability — clean

BFS from `/`: **741 pages reachable**, and **0 of the 648 sitemap URLs are orphaned.**
Canary: the BFS correctly identifies the known-orphaned legacy hub `education.html` as unreachable,
confirming the sweep can detect orphans rather than trivially returning zero.

---

## Open blockers — require Michael

### A. Sitemap stale in Search Console since April (highest impact)

Google Search Console reports, as of today:

| Submitted sitemap | Last downloaded | URLs Google saw |
|---|---|---|
| `https://www.waterwisekids.com/sitemap.xml` | **2026-04-07** | **97** |
| `https://waterwisekids.com/sitemap.xml` | 2026-04-05 | 51 |

The live sitemap contains **648** URLs. Google has not re-fetched it in **five months** and is still
working from a 97-URL snapshot — so ~551 URLs get no sitemap-based discovery signal at all.

**I cannot fix this.** The stored OAuth credential grants only
`https://www.googleapis.com/auth/webmasters.readonly`, which permits reading status but not
resubmission. Michael needs to resubmit the sitemap in the Search Console UI.

*(The `indexed: 0` field in the API response is not meaningful — Google deprecated that counter and
returns 0 for all properties.)*

### B. `http://` URLs still being served and indexed

Six `http://` pages drew impressions in the last 28 days, meaning HTTPS is not being enforced and
indexing is split across protocols:

```
http://www.waterwisekids.com/do-swim-lessons-reduce-drowning-risk.html
http://www.waterwisekids.com/education/lightning-pool-safety.html
http://www.waterwisekids.com/education/national-water-safety-action-plan-explained.html
http://www.waterwisekids.com/education/water-rescue-skills-for-kids.html
http://www.waterwisekids.com/education/water-safety-special-needs.html
http://www.waterwisekids.com/statistics/
```

On-page canonicals already point at `https://www` correctly, so the markup is right — the gap is the
**"Enforce HTTPS" toggle** in GitHub Pages / Cloudflare. No `https://waterwisekids.com` (non-www)
pages drew impressions, so there is no www-vs-non-www split.

---

## Search performance context (28d, 2026-08-06 → 2026-09-03)

- **438** distinct pages drew impressions · **22,057** impressions · **162** clicks
- 210 sitemap URLs recorded no impressions in the window. This is **not** proof they are unindexed —
  the GSC page dimension is known to omit low-volume pages, so absence ≠ zero.

---

## Not verified this run

Stating these explicitly, because a partial audit that reports "fine" is worse than no audit:

- **Live HTTP responses were not fetched.** `web_fetch` refused the URL on provenance grounds, and the
  browser pane needs an interactive site approval that no one can grant in a scheduled run. So the
  served status of `sitemap.xml` and the actual `http→https` redirect behavior are inferred from GSC
  data, not observed directly. Findings A and B rest on Google's own reporting.
- **External outbound links were not probed.** WAF 403s make sequential re-probing uninformative.

## Repo/workspace note

The local working folder is **stale relative to `live`** — its `live` ref (`2476831c`) is not an
ancestor of the deployed tip, and 773 files differ. This matches the known down deploy loop. The live
branch is the authoritative and current state, and is what was audited. **Nothing was written to the
local git state.**
