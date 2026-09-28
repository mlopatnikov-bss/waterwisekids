# Google Index Compliance — 2026-09-03

**Scope:** waterwisekids.com · audited against a fresh full clone of `live` @ `d27967090`
**Corpus:** 759 HTML files · 645 sitemap URLs · 429 pages with GSC data (28d)
**Shipped:** `f9f45afc8` — verified live
**Status:** on-page compliance CLEAN · two blockers require Michael

---

## 1. What was fixed and deployed

### Orphan cluster closed — 6 sitemap URLs had no discovery path

A breadth-first crawl from `/` following only `<a href>` found **6 sitemap URLs unreachable
from the homepage**:

```
/teens/                              /jobs/
/teens/aquatics-careers.html         /teens/lifeguard-certification.html
/teens/scholarships.html             /teens/swim-instructor.html
```

They were not orphans by inbound-link count — they had 2–5 inbound links each. But every
one of those links came from *inside the cluster*, or from `/teens.html` / `/jobs.html`,
two legacy meta-refresh stubs that nothing on the site links to. The cluster was a closed
island.

That mattered more than usual here: with the sitemap not downloaded by Google since
2026-04-07 (§2), these six pages had **no discovery path at all** — not by link, not by
sitemap.

**Fix:** added a prose section to `/aquatic-jobs/` (main-nav, depth 1) linking to `/jobs/`
and `/teens/`. All six are now reachable at depth 2–3. Sitemap `lastmod` bumped for the
edited page only.

**Verified live:** both links present in the served HTML; sitemap serving `2026-09-03`.

---

## 2. Blockers that need Michael

### 2a. Google has not downloaded the sitemap since 2026-04-07 — 548 URLs never submitted

Search Console API, `sc-domain:waterwisekids.com`:

| Sitemap | Last submitted | Last downloaded | URLs Google saw |
|---|---|---|---|
| `https://www.waterwisekids.com/sitemap.xml` | 2026-04-05 | **2026-04-07** | 97 |
| `https://waterwisekids.com/sitemap.xml` | 2026-03-10 | 2026-04-05 | 51 |

The live sitemap has **645 URLs**. Google's snapshot is 97 — a ~5-month-old view missing
**548 pages**, roughly 85% of the site.

This is *not* a serving fault. Fetched as Googlebot, `sitemap.xml` returns `HTTP 200`,
`content-type: application/xml`, 129,488 bytes, well-formed, 0 errors, 0 warnings. The
submission state itself has gone stale on Google's side.

**Why the agent can't fix it:** the stored OAuth token's scope is
`https://www.googleapis.com/auth/webmasters.readonly`. The sitemaps submit endpoint needs
the read-write `.../auth/webmasters` scope. Confirmed against Google's tokeninfo endpoint
this run. Google's legacy `/ping?sitemap=` endpoint was retired in 2023, so there is no
unauthenticated fallback.

**Two ways to clear it:**

1. **30-second manual fix** — Search Console → Sitemaps → resubmit `sitemap.xml`.
2. **Permanent fix** — re-run the OAuth consent for `.deploy/secrets/gsc-oauth.json` with
   the read-write `webmasters` scope. This daily agent can then resubmit automatically and
   the problem never recurs.

Option 2 is worth the extra few minutes: option 1 will drift stale again.

### 2b. `http://` does not redirect to `https://`

```
http://www.waterwisekids.com/            → 200 OK      (no redirect)
http://www.waterwisekids.com/education/  → 200 OK      (no redirect)
http://waterwisekids.com/                → 301 → http://www...   (still http)
https://waterwisekids.com/               → 301 → https://www...  (correct)
```

Every page is reachable on `http://` with a 200. Non-www correctly folds to www, but the
http→https hop is missing entirely, so the http surface never resolves to https.

Canonical tags on those pages do point at `https://`, which is why the damage is contained
— but it is not zero. GSC page dimension, 2026-08-03 → 2026-08-31:

| http:// URL | Impressions | Clicks |
|---|---|---|
| `/education/lightning-pool-safety.html` | 95 | 0 |
| `/statistics/` | 25 | 0 |
| `/education/water-rescue-skills-for-kids.html` | 23 | 0 |
| `/education/national-water-safety-action-plan-explained.html` | 9 | 0 |
| `/education/water-safety-special-needs.html` | 5 | 0 |
| `/do-swim-lessons-reduce-drowning-risk.html` | 1 | 0 |
| **Total** | **158** | **0** |

Six duplicate URLs indexed, 158 impressions, **zero clicks**. Small today, but it is a
crawl-budget leak on a site that is already discovery-starved by 2a.

**Fix:** Cloudflare → SSL/TLS → Edge Certificates → **Always Use HTTPS = On**. This cannot
be fixed from the repo — GitHub Pages ignores `_headers` / `_redirects`, and the edge sits
in front of it.

---

## 3. Clean — swept this run, no action needed

Every check below ran across all 759 files.

| Check | Result |
|---|---|
| Broken internal links | **0** (2,447 internal hrefs resolved in the 80-file canary alone) |
| Sitemap: indexable pages missing | **0** |
| Sitemap: URLs with no backing file | **0** |
| Sitemap: noindex/redirect URLs listed | **0** |
| Sitemap: duplicate `<loc>` | **0** |
| Sitemap: non-www or http `<loc>` | **0** |
| Sitemap: missing / malformed / future `lastmod` | **0** |
| Sitemap URLs unreachable from `/` | **0** (was 6 — §1) |
| Sitemap URLs with zero inbound links | **0** |
| Missing `<title>` / duplicate `<title>` tag | **0** |
| Missing or empty meta description | **0** |
| Duplicate meta descriptions | **0** |
| Missing canonical | **0** |
| Canonical non-www / http / duplicated | **0** |
| Body-level `<meta>` (broken-head signature) | **0** |
| Soft 404 (error title on a 200) | **0** |
| JSON-LD parse errors | **0** |
| JSON-LD non-www URLs | **0** |
| JSON-LD nodes missing `@type` | **0** |
| Article missing headline/datePublished/author/publisher | **0** |
| Malformed or future-dated schema dates | **0** |
| FAQPage empty / missing question name / missing answer | **0** |
| BreadcrumbList empty / bad positions / missing name | **0** |
| HowTo missing `step`, Organization missing `name` | **0** |
| Redirect stub: dest missing or canonical ≠ dest | **0** |
| `robots.txt` | Valid, `Allow: /`, sitemap declared |

**Structured-data inventory** (2,209 nodes): BreadcrumbList 732 · FAQPage 632 · Article 548 ·
WebPage 199 · HowTo 42 · CollectionPage 3 · Dataset 3 · Organization 2 · Service 2 ·
AboutPage/ContactPage/WebSite/Report/ItemList/WebApplication 1 each.

### Deliberate patterns confirmed, not defects

- **91 noindex pages** — 90 `*-printable.html` lead magnets (kept out of the index so they
  don't compete with their parent articles) plus `404.html`. Intentional.
- **23 meta-refresh stubs** — legacy URLs preserved for old backlinks. All 23 canonical to
  their destination, all destinations exist, none are in the sitemap.
- **13 duplicate titles** — every pair is a stub and its destination. Canonical resolves it.
- **17 pages with no `<h1>`** — all 17 are redirect stubs. Expected.
- **`stub carries a form` (2)** — `/advertise.html` and `/gear.html` carry Formspree forms,
  but both destinations (`/advertise/`, `/gear/`) carry the equivalent form with a complete
  option list. No stranded conversion path. This defect class stays closed.

---

## 4. Method notes

- Audited a **fresh full clone** of `live`, not the mount, and never ran a git write against
  the mount.
- **Canaried the link resolver before trusting `0 broken`** — fed it known-good and
  known-bad paths and confirmed it returns False for missing targets. A resolver that
  silently passes everything would have reported the same zero.
- **Orphan detection by BFS, not by inbound count.** Inbound count reported 0 orphans; the
  BFS found a 6-page island. Counting inbound links cannot see a cluster that links to
  itself. Worth keeping as the standing detector.
- 28-day GSC totals for context: 157 clicks, 20,027 impressions, avg position 21.2.

---

## Bottom line

The site's own markup is in good shape — every on-page indexing signal checked clean across
all 759 files, and the one real defect found (the orphan cluster) is fixed and live.

What is actually capping indexing is off-page and needs Michael: **Google is working from a
97-URL snapshot of a 645-URL site because the sitemap submission went stale in April.**
Resubmitting is a 30-second fix; re-consenting the OAuth token with write scope makes it
self-healing. The http→https redirect is the smaller second item, one Cloudflare toggle.
