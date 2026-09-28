# Google Index Compliance Report — 2026-08-19

**Site:** waterwisekids.com · **Branch:** `live` · **Commit pushed:** `8b4c0e8d` · **Pages build:** `built` ✅

**Status: COMPLIANT** — 2 defects found and fixed, both pushed and verified live.

---

## Scope scanned

| Check | Scale | Result |
|---|---|---|
| HTML pages parsed | 729 | — |
| Sitemap URLs | 634 | ✅ live == repo, identical sets |
| Internal links resolved | 27,284 | ✅ 0 broken |
| JSON-LD blocks parsed | 729 files | ✅ 0 invalid |

---

## Defects found & fixed

### 1. 387 sitemap `lastmod` dates were stale by up to 4 months (HIGH)

The sitemap was *structurally* perfect — every URL resolved, no noindex entries, no duplicates, no dead canonicals — which is why every prior audit passed it. The defect was in the **values**, not the structure.

387 URLs advertised a `lastmod` that predated their actual content change, in many cases by four months:

| Advertised | Actual content change | Pages |
|---|---|---|
| 2026-04-08 | 2026-08-14 | 47 |
| 2026-04-20 | 2026-08-14 | 24 |
| 2026-04-08 | 2026-08-18 | 12 |
| 2026-04-09 | 2026-08-14 | 10 |
| …68 more date pairs | | 294 |

These weren't cosmetic edits. Verified body-text growth on affected pages:

- `beginner-swim-lessons-abington-pa.html` — 1,727 → 2,674 chars
- `beginner-swim-lessons-ocean-grove-nj.html` — 1,384 → 3,434 chars
- `education/backyard-pool-fence-requirements.html` — 20,445 → 23,975 chars
- `education/at-what-age-can-kids-swim-alone.html` — 9,937 → 12,255 chars

**Impact:** `lastmod` is the primary signal Google uses to schedule recrawls. A page that gained 55% more body copy on Aug 14 while telling Google "last modified April 8" gets deprioritized in the crawl queue — the new content sits unindexed.

**Method — and why it isn't a blanket bump.** The naive fix (set every `lastmod` to today) is actively harmful: Google discounts the signal entirely for sitemaps that bulk-refresh dates. So each date was *verified* rather than assumed:

1. Extracted body text per page with nav/header/footer/sidebar **and the "Keep Reading" related-articles block** stripped — sitewide related-link regeneration touches all 729 files and would otherwise have produced 579 false positives (it inflated the count by 57 pages before that filter went in).
2. Binary-searched each file's git history for the newest commit whose body text still differed from HEAD — yielding the true content-change date per page.
3. Updated only where `true_date > recorded_date`. 135 pages that changed since July were already dated correctly and were left alone.

Applied as a surgical string edit (387 `<lastmod>` values), not an XML re-serialize. Verified: stripping all `<lastmod>` lines from both versions yields byte-identical files, so nothing else in the sitemap moved. 0 future-dated entries.

### 2. Invalid `JobPosting` schema on `jobs.html` (MEDIUM)

`jobs.html` carried a `JobPosting` JSON-LD node that violated Google's structured-data policy three ways:

- Missing every required property — no `datePosted`, `hiringOrganization`, or `jobLocation`
- Marked up a job *search/listing* page as a single job posting, which the JobPosting policy explicitly forbids
- Sat on a meta-refresh redirect stub (`jobs.html` → `/jobs/`) that shouldn't be indexed at all

Invalid JobPosting markup is a manual-action risk in Search Console, not just a warning. The canonical target `/jobs/` correctly uses `WebPage`, confirming the node was legacy cruft. Changed `@type` to `WebPage` to match the canonical. Verified live: 0 JobPosting references remain.

---

## Checks that passed clean

- **Canonicals** — 0 missing on indexable pages, 0 pointing at nonexistent pages, 0 external.
- **noindex/canonical conflict** — 0. (The 19 redirect stubs correctly carry cross-canonicals *without* noindex; per the 2026-08-15 fix, adding noindex there would risk deindexing the target hubs. Left alone deliberately.)
- **Sitemap hygiene** — 0 noindex pages listed, 0 dead URLs, 0 duplicates, 0 indexable pages missing. All 72 pages published since 7/17 are present and correctly dated.
- **Meta descriptions / titles** — 0 missing across all indexable pages.
- **Internal links** — 27,284 checked, 0 broken, 0 redirect-hop links pointing at meta-refresh stubs.
- **Structured data** — 0 invalid JSON, 0 duplicate type nodes, 0 Articles missing required fields, and **0 FAQPage nodes without matching visible body copy** (the 2026-08-15 policy-violation class is still clean across all 618 FAQPage instances).
- **Orphans** — 1 (`/404.html`), which is correct.
- **robots.txt** — serves 200, `Allow: /`, sitemap declared. AI crawlers still unblocked (Cloudflare managed-robots stays off).
- **Live response codes** — 40-URL random sample from the sitemap, all 200.
- **No `X-Robots-Tag: noindex`** headers on any sampled response.

---

## Open item for Michael (unchanged, needs a human)

**`http://` still serves 200 with no redirect to HTTPS.** Confirmed again this run:

```
curl http://www.waterwisekids.com/  →  code=200, redirect_url=(none)
```

Google treats http:// and https:// as separate URLs, so this leaves a fully duplicate crawlable copy of all 634 pages.

**Fix: enable "Always Use HTTPS" in Cloudflare** (SSL/TLS → Edge Certificates).

⚠️ Do **not** fix this by flipping GitHub Pages' `https_enforced` flag instead — if Cloudflare's SSL mode is set to Flexible, that combination causes an infinite redirect loop and takes the whole site down.

---

*Workspace cleanup completed per skill requirements.*
