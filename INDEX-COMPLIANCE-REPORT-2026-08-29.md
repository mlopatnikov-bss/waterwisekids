# Google Index Compliance — 2026-08-29

**Site:** waterwisekids.com · **Audited:** fresh clone of `origin/live` @ `1894cf04` → pushed `b13a530b`
**Status: PASS on-site / 2 items need Michael**

---

## Headline: Google has not re-read the sitemap since 2026-04-07

The Search Console Sitemaps API reports:

| Sitemap | Last submitted | **Last downloaded by Google** | URLs Google saw | Errors |
|---|---|---|---|---|
| `https://www.waterwisekids.com/sitemap.xml` | 2026-04-05 | **2026-04-07** | **97** | 0 |
| `https://waterwisekids.com/sitemap.xml` *(stale, apex 301s to www)* | 2026-03-10 | 2026-04-05 | 51 | 0 |

The live sitemap now holds **640 URLs**. Google's copy is 4½ months old and 543 URLs short. Everything
published since April has had to be discovered through internal links alone.

The cost is measurable. `/beginner-swim-lessons/` is in the sitemap with `lastmod 2026-08-21`, returns
200 to Googlebot right now, and Search Console still records it as **"Not found (404)"** — because
Google's last crawl was 2026-05-05, two months *before* the page was created, and nothing has told
Google to look again.

**I could not resubmit it.** The stored OAuth credential (`.deploy/secrets/gsc-oauth.json`) carries
scope `webmasters.readonly` — reads work, the `PUT …/sitemaps/…` resubmit returns
`403 insufficient authentication scopes`.

### Action 1 (Michael, ~30 seconds)
Search Console → **Sitemaps** → enter `sitemap.xml` → **Submit**. While there, delete the stale
`https://waterwisekids.com/sitemap.xml` entry (apex now 301s to www, so it is dead weight).

To let this job do it automatically in future, re-authorize the OAuth client with the read-write scope
`https://www.googleapis.com/auth/webmasters` instead of `webmasters.readonly`.

---

## Second finding: Google is indexing the insecure `http://` URLs

`http://www.waterwisekids.com/` returns **200 with full page content** — no redirect to HTTPS. Every
one of the 640 URLs is reachable twice. This is not theoretical:

- URL Inspection on `http://www.waterwisekids.com/statistics/` → **"Submitted and indexed"**, and
  **Google's chosen canonical is the `http://` URL** while our declared canonical is `https://`.
  A direct canonical conflict that Google resolved against us.
- Six `http://` URLs appear in the last 28 days of Search Console performance data, including
  `http://…/education/lightning-pool-safety.html` with 89 impressions.

The HTML is innocent — canonicals are correct on all 640 pages. The fix is at the edge.

### Action 2 (Michael)
Cloudflare → **SSL/TLS → Edge Certificates → Always Use HTTPS: On**. (A GitHub Pages "Enforce HTTPS"
toggle will not cover this while Cloudflare fronts the origin.) Consider enabling HSTS afterwards.

---

## Indexing status of the 640 sitemap URLs

418 pages drew impressions in the last 28 days. I inspected a random sample (n=40) of the 236 that
drew none, via the URL Inspection API:

| Coverage state | Sample | Estimated sitewide |
|---|---|---|
| Submitted and indexed (just low demand) | 23 (58%) | ~136 |
| Crawled — currently not indexed | 10 (25%) | ~59 |
| **URL is unknown to Google** | 6 (15%) | ~35 |
| Not found (stale 404 record) | 1 (2.5%) | ~6 |

Roughly **554 of 640 pages (87%) are indexed**; ~86 are not. The ~35 never-discovered pages are the
clearest win available and are exactly what a sitemap resubmission addresses — several
(`pool-water-quality-checklist`, `swim-lesson-annual-cost-worksheet`, `poolside-emergency-kit-checklist`)
have never been crawled at all.

The "Crawled — currently not indexed" set was last crawled June–July and skews toward
thinner or lower-demand pages (`/advertise/`, `/swim-schools/add.html`, `/teens/aquatics-careers.html`).
That is a content-quality signal, not a technical defect.

---

## Fixed and deployed this run

**`b13a530b [index-compliance] Correct 6 understated sitemap lastmods to verified content-change dates`**

| Page | lastmod | → |
|---|---|---|
| `education/swim-lesson-scholarships-free-programs.html` | 2026-08-21 | 2026-08-27 |
| `education/swim-school-cancellation-policies.html` | 2026-08-20 | 2026-08-27 |
| `education/swim-school-refund-policies.html` | 2026-08-24 | 2026-08-27 |
| `education/swim-school-membership-tiers.html` | 2026-08-23 | 2026-08-27 |
| `education/swim-lesson-makeup-tokens.html` | 2026-08-26 | 2026-08-27 |
| `education/pause-freeze-swim-lessons-policies.html` | 2026-08-26 | 2026-08-27 |

All six gained real body copy on 2026-08-27 (lead-magnet CTA prose, corrected source text) after their
declared `lastmod`. Verified live.

### Why only six, when 412 pages look stale against git

A first pass flagged 412 sitemap URLs whose newest git touch post-dates their `lastmod`, and a
diff-line classifier narrowed that to 214 "prose changes." Both numbers were wrong. Re-extracting the
rendered visible text at each page's `lastmod`-era revision and comparing it to `HEAD` showed
**208 of 214 were byte-identical in visible text** — the diffs were cache-bust bumps, `aria-label`
additions, and whitespace reflow of minified one-line markup that made unchanged FAQ blocks read as
insertions. Only 6 pages actually changed. Bumping the other 208 would have been a blanket bump that
erodes the freshness signal precisely when we most need Google to trust it.

---

## Everything that passed

Full sweep of 749 tracked HTML files (640 indexable + 86 noindex printables/404 + 23 redirect stubs):

| Check | Result |
|---|---|
| Sitemap valid XML, 640 unique `<loc>`, all HTTPS, all `www` | ✅ |
| Sitemap URLs resolving to a file | 640 / 640 |
| Indexable pages missing from sitemap | **0** |
| `noindex` on a sitemap page | 0 |
| Missing / duplicate / mismatched canonical | 0 |
| Missing or malformed `lastmod` | 0 |
| Missing title, or title outside 10–70 chars | 0 |
| Missing meta description, or outside 70–165 chars (decoded) | 0 |
| Missing or duplicate `<h1>` | 0 |
| `<meta>` leaked into `<body>` (unescaped-quote head break) | 0 |
| Broken internal links | 0 / 28,633 checked |
| Broken local assets (img/css/js) | 0 |
| JSON-LD blocks failing to parse | 0 / ~2,900 |
| Schema image / URL references that 404 | 0 |
| Article schema missing headline, image, date, author, publisher | 0 |
| `FAQPage` with empty question or answer | 0 |
| `BreadcrumbList` missing position or name | 0 |
| `speakable` selectors matching nothing | 0 |
| `robots.txt` — allows all, declares sitemap | ✅ |
| 404 handling — returns real 404 status | ✅ |
| Googlebot user-agent served normally (not Cloudflare-blocked) | ✅ |
| apex → www 301 | ✅ |

Schema headline-vs-h1 drift shows 85 hits; all 85 are `-printable.html` pages, which are `noindex`
and out of the sitemap. That is the documented printable convention, not a defect.

---

## Search Console, 28 days (to 2026-08-26)

152 clicks · 18,262 impressions · CTR 0.83% · avg position 20.0
