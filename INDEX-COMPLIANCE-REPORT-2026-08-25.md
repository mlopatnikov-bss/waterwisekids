# Google Index Compliance — 2026-08-25

**Verdict: COMPLIANT.** 152 sitemap `lastmod` dates corrected and deployed (`b670e326`). Every other compliance check returned zero defects.

---

## Deployed fix — 152 understated `lastmod` dates

Raw git history showed **590** sitemap entries whose file had been committed *after* its stated `lastmod`. Blanket-bumping all 590 would have been wrong — most of that churn was mechanical (cache-bust `?v=` bumps, CSS class swaps, tap-target width fixes) that Google should not be asked to recrawl for.

Each of the 590 was classified by **indexable-payload diff** — rendering the blob at each commit and its parent, then comparing visible text + `<title>` + meta description + JSON-LD — walking back until the first real divergence:

| Class | Count | Action |
|---|---|---|
| Substantive content change after stated `lastmod` | **152** | `lastmod` bumped to true change date |
| Outbound-href-only swap (the 8-24 AAP URL repoint) | 109 | Left alone — link target changed, page content did not |
| Mechanical churn / already correct | 329 | Left alone |

**Post-fix verification:** re-ran the full classifier against the modified tree — **0 substantive-stale entries remain**. Sitemap revalidates as well-formed XML at 636 URLs. Live sitemap confirmed serving the new dates.

Why it matters: an understated `lastmod` tells Google a page hasn't changed, so it sits lower in the recrawl queue. 152 pages that were substantively rewritten in the 8-14 → 8-24 window were advertising stale dates.

---

## Checks that came back clean

**Sitemap** — 636 URLs, 0 duplicates, 0 ghost entries (every `<loc>` resolves to a file on disk), 0 noindex pages listed, 0 inflated dates. The 23 indexable pages absent from the sitemap are all cross-canonical alias stubs whose canonical target *is* in the sitemap — correct by design, not orphans.

**Structured data** — 741 pages, every JSON-LD block parses. 0 missing `@context`/`@type`, 0 Articles without `headline` or `datePublished`, 0 FAQ `Question` nodes without an answer, 0 malformed `ListItem` breadcrumbs, 0 empty string values, 0 schema `image`/`logo` URLs pointing at missing files.

**Schema ↔ page agreement** — 0 Article `headline` vs `<h1>` drift across all indexable pages. All FAQ schema answers verified present in rendered body text across **627** FAQ pages (0 invisible).

**Indexability** — 0 pages missing a canonical, 0 canonicals pointing at a non-existent file, 0 canonical chains. 82 noindex pages: 81 printables + `404.html`; the 3 indexable printables are the known by-design exceptions. `robots.txt` returns 200 with a correct `Sitemap:` directive and no blocking rules.

**Head tags** — 0 missing titles, 0 missing meta descriptions, 0 over-length (>165 char) or under-length (<70 char) descriptions, 0 duplicate titles, 0 duplicate meta descriptions among indexable pages. 13 pages without an `<h1>` are all alias stubs.

**Open Graph** — 0 missing `og:url`/`og:title`/`og:image`, 0 `og:url` disagreeing with canonical, 0 `og:image` files missing from disk.

**Internal links** — every `href` on all 741 pages resolved against disk: **0 broken**, 0 unsubstituted `__PLACEHOLDER__` hrefs, 0 links pointing at alias stubs (no redirect hops wasting crawl budget), **0 orphan indexable pages** (every indexable URL has at least one inbound internal link).

**Outbound links** — all 299 distinct external URLs fetched with full GET. 0 hard 4xx/5xx among them and **0 soft-404s** (200-OK responses with error-shaped titles). 104 URLs returned 403, but every affected host returned 403 on *all* its URLs — uniform WAF blocking of the datacenter IP (cdc.gov 29/29, britishswimschool.com 36/36, cpsc.gov 5/5, publications.aap.org 5/5), not link rot.

Yesterday's 184-link AAP repoint landed correctly: `aap.org/en/patient-care/drowning-prevention-and-water-safety/` returns 200 with title *"Drowning Prevention and Water Safety"*.

**Guide-count accuracy** — sitemap `/education/` count is 412, so the source-of-truth figure is **411**. Homepage (`411 Guides`) and `/about/` (`411 in-depth education guides`) both agree. No drift.

---

## Flagged, not actioned

**`arkansasswimacademy.com` returns HTTP 500** — a directory listing's outbound site. Retested twice, 500 both times, so not transient. It's the vendor's server, not ours; one inbound link. Worth a look on the next directory-maintenance pass if it persists.

---

## Note on "ping Google"

Google retired the sitemap ping endpoint (`/ping?sitemap=`) in 2023 — it now returns 404 and is a no-op. Discovery relies on the `Sitemap:` directive in `robots.txt` (verified present and serving 200) plus Search Console. No ping was attempted.
