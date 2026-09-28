# Google Index Compliance — 2026-09-01

Audited commit `a44e087` on `live` (fresh clone, not the mount). 755 HTML files, 643 sitemap URLs.

## Verdict

**On-site compliance: PASS. Zero defects found, zero fixes needed, nothing pushed.**

Every remaining problem is off-site and blocked on Michael — see "Blocked" below. The
largest one (sitemap not fetched since April) is worth more than everything else combined.

## What passed

| Check | Result |
|---|---|
| sitemap.xml validity | 643 `<loc>`, 643 `<lastmod>`, 0 dupes, 0 non-www, 0 http |
| sitemap ↔ site sync | 643 indexable pages, **643 in sitemap, 0 missing, 0 orphan entries** |
| sitemap targets | 0 point at noindex / meta-refresh / canonicalized-away pages |
| canonical tags | 0 missing, 0 http, 0 non-www, 0 relative |
| noindex | 89 total — 88 `*-printable.html` lead magnets (deliberate) + `404.html`. 0 unexplained |
| cross-canonicals | 23, all legacy redirect stubs; **all 23 carry meta-refresh** (no stranded stubs) |
| duplicate titles | 13 pairs, all stub↔target pairs from the 23 above. 0 unexplained |
| robots.txt | valid, `Allow: /`, correct www sitemap reference |
| JSON-LD parse | 0 parse errors, 0 empty blocks |
| JSON-LD required fields | **0 missing** across 544 Article, 630 FAQPage, 731 BreadcrumbList, 2963 Question, 42 HowTo |
| JSON-LD hosts | 0 non-www, 0 http |
| BreadcrumbList nesting | 0 nested under a WebPage property |
| schema image URLs | 0 unresolvable |
| FAQ schema integrity | 0 Questions missing `acceptedAnswer.text` |
| headline length | 0 over 110 chars |
| meta descriptions | 0 missing, 0 over 170, 0 under 50, 0 duplicated |
| og:description | 0 pages have a meta description without one |
| titles | 0 missing, 0 over 70 chars |
| head integrity | 0 body-level `<meta>` (no unescaped-quote head breakage) |
| soft 404s | 1 error-titled page = `404.html` itself (correct) |
| internal links | **29,747 checked, 0 broken** (canary-gated resolver) |
| images | 0 broken `src`/`data-src` |
| crawl reachability | **0 sitemap URLs with zero internal inbound links** |
| live HTTP status | 40-URL sample (20 newest + 20 random): 40/40 return 200 |

Resolver was canary-gated before trusting the zero: fabricated paths correctly returned
"broken", real paths correctly resolved. A zero here is a measurement, not a silence.

## Blocked on Michael — ranked

### 1. Sitemap has not been downloaded by Google since 2026-04-07 (critical)

GSC Sitemaps API, read live today:

| Sitemap | Last submitted | Last downloaded | URLs Google saw |
|---|---|---|---|
| `https://www.waterwisekids.com/sitemap.xml` | 2026-04-05 | **2026-04-07** | 97 |
| `https://waterwisekids.com/sitemap.xml` | 2026-03-10 | 2026-04-05 | 51 |

We publish **643** URLs. Google's last fetch saw **97**. Roughly **546 URLs (85%) have never
been announced through the sitemap** and rely entirely on internal-link discovery.

I cannot fix this: the stored GSC OAuth token's granted scope is
`https://www.googleapis.com/auth/webmasters.readonly`. A resubmit `PUT` was attempted and
returned 403, confirming it is scope, not a transient error.

**Action for Michael:** open Search Console → Sitemaps → re-submit `sitemap.xml`. Takes a
minute and is the single highest-leverage indexing action available on this site.

### 2. `http://www.` serves 200 instead of redirecting (root cause now isolated)

Live probe today:

- `http://www.waterwisekids.com/...` → **200 OK** (no redirect)
- `http://waterwisekids.com/...` → 301 (correct)
- `https://waterwisekids.com/...` → 301 to www (correct)

So the duplicate-content surface is exactly one host-protocol pair: `http://www.`. Six
http:// pages currently draw impressions in GSC (152 impressions, 0 clicks over 28 days),
led by `/education/lightning-pool-safety.html` at 99.

Mitigation is already in place — those pages serve the correct `https://www.` canonical —
so this is a wasted-crawl and split-signal issue, not a wrong-canonical one.

**Action for Michael:** enable "Always Use HTTPS" in Cloudflare (and confirm "Enforce
HTTPS" on GitHub Pages). Not fixable from the repo.

### 3. sitemap `lastmod` still runs ahead of schema `dateModified` — but improving

364 of 643 URLs disagree; direction is uniform (lastmod ahead, never behind). Worst gaps
reach back to June. 321 of the 364 sit at `lastmod` = 2026-08-29.

Trend: 439 (08-29) → 425 (08-30) → **364 (today)**. Moving the right way.

Unchanged from prior runs: the fix belongs in the reconciliation job — stop bumping
`lastmod` on metadata-only passes — not in the sitemap. Reverting 364 crawl signals
unilaterally is still above a nightly audit's authority, especially while item #1 means
Google is barely reading the sitemap at all.

The 186 sitemap pages with no `dateModified` remain correct: they are FAQPage/WebPage
types, not Articles.

## Traffic context (GSC, 28 days to 2026-08-29)

429 pages drew impressions; 20,055 impressions, 153 clicks.
