# Google Index Compliance — 2026-09-07

**Audited:** fresh `/tmp` clone reset to `origin/live` @ `3e903a65` (2026-09-06)
**Corpus:** 767 HTML files · 649 in sitemap · 95 `noindex` · 23 meta-refresh stubs
**Verdict:** **PASS — no auto-fixable defect found. Nothing pushed.**

---

## 1. Sitemap & robots — clean

| Check | Result |
|---|---|
| `sitemap.xml` well-formed | ✅ parses, 130 KB, 649 URLs (limits 50 MB / 50 k) |
| Duplicate `<loc>` | ✅ 0 (649 unique) |
| `<loc>` on canonical host | ✅ 649/649 `https://www.waterwisekids.com/` |
| Sitemap URLs with no file behind them | ✅ 0 |
| Indexable self-canonical pages **missing** from sitemap | ✅ 0 |
| Sitemap entries that should **not** be there (noindex / stub / canonicalized away) | ✅ 0 |
| `lastmod` present & valid | ✅ 649/649 |
| `changefreq` / `priority` values legal | ✅ 0 invalid |
| `robots.txt` | ✅ `Allow: /`, declares `https://www.waterwisekids.com/sitemap.xml` |
| `.nojekyll`, `404.html`, `CNAME` | ✅ present and correct |

The 118 files excluded from the sitemap are all explained: **95 `noindex`** (94 printables — a deliberately separate template family — plus `404.html`) and **23 meta-refresh stubs**. Zero unexplained exclusions.

**All 23 stubs verified individually:** in every case the refresh target and the `rel=canonical` point at the same live URL, and that URL exists.

## 2. Indexability signals — clean

| Check (767 files) | Result |
|---|---|
| Pages with no `rel=canonical` | ✅ 0 |
| Pages with **multiple** canonicals | ✅ 0 |
| Canonical on wrong host / scheme | ✅ 0 |
| `<meta>` or `<link rel=canonical>` leaked into `<body>` | ✅ 0 |
| `noindex` **+** canonical pointing elsewhere (conflicting signals) | ✅ 0 |
| Files without exactly one `<title>` | ✅ 0 |
| Unescaped-quote head breakage (per-attribute raw scan) | ✅ 0 — **canary confirmed the probe fires** |

**Indexable corpus (649):** 0 missing meta descriptions, 0 duplicates, 0 outside 70–160 chars · 0 missing titles, 0 duplicate titles · 0 pages without an `h1`, 0 with more than one · 0 soft-404 / placeholder titles.

Only cosmetic note: 3 titles run 67–70 characters (`fishing-water-safety-checklist`, `swim-instructor-continuity-worksheet`, `swim-lesson-medical-information-form`). Left alone — SERP width, not an indexing fault.

## 3. Structured data — clean

2,192 `ld+json` blocks parsed. **0 unparseable. 0 indexable pages without structured data.**

- Required-field sweep on **top-level graph nodes only** (nested `publisher`/`author` refs excluded, per the known false-positive trap): **0 gaps** across Article, FAQPage, BreadcrumbList, HowTo, Organization, WebPage.
- 3,013 `Question`/`Answer` pairs: **0** missing `name` or `acceptedAnswer.text`.
- 2,259 `ListItem`: **0** missing `position`/`name`.
- `@context` uniform `https://schema.org` on all 2,192.
- **0** schema URLs on a non-`www` or `http` host.
- **0** local `image`/`logo`/`contentUrl` targets that 404.
- **0** BreadcrumbList `item` URLs that 404.
- **0** Article/WebPage self-URL (`url`, `@id`, `mainEntityOfPage`) disagreeing with the page canonical.
- Dates: **0** future, **0** `dateModified` < `datePublished`, **0** conflicting `dateModified` within a page.

## 4. Links & assets — clean

- **0 broken internal links** — every `href` resolves to a servable path.
- **0** internal links written against the wrong host.
- **0** `img src` / `srcset` / `script src` / `link href` / `og:image` / `twitter:image` references that 404.
- **0** `og:url` ≠ `canonical`; **0** og↔twitter parity mismatches.
- **Crawl reachability:** BFS from `/` reaches 743 pages. **0 sitemap pages are orphaned**, and **0 have zero inbound links** from an indexable page. That matters more than usual here — see §5.

## 5. Open items — Michael's action, not the agent's

### 🔴 Sitemap still not fetched by Google since 2026-04-07 (unchanged, 5th consecutive confirmation)

Read live from the GSC Sitemaps API this run (`sc-domain:waterwisekids.com`):

| sitemap | lastSubmitted | **lastDownloaded** | URLs submitted |
|---|---|---|---|
| `https://www.waterwisekids.com/sitemap.xml` | 2026-04-05 | **2026-04-07** | 97 |
| `https://waterwisekids.com/sitemap.xml` (stale apex) | 2026-03-10 | 2026-04-05 | 51 |

0 errors, 0 warnings. Live sitemap is **649** URLs ⇒ **552 (85 %) have never been announced**; everything published since April is discovered by internal link only.

The agent cannot fix this: the stored OAuth token's scope re-read off the refresh response this run is still `…/auth/webmasters.readonly`, so the resubmit `PUT` 403s. The `/ping?sitemap=` endpoint was retired in 2023. **Michael: Search Console → Sitemaps → resubmit `sitemap.xml`, and delete the stale apex entry.** This remains the highest-leverage open item on the site.

### 🟡 `lastmod` ahead of schema `dateModified` — improving fast, no action taken

**199 of 649** sitemap URLs disagree, direction uniform (ahead 199, behind 0). Trend: 439 → 425 → 364 → **199**. 174 of the 199 still sit at the original 2026-08-29 batch date. 186 URLs legitimately carry no `dateModified` (FAQPage/WebPage, not Article). Fix belongs in the reconciliation job, and it is a signal nobody is currently reading while §5.1 holds.

### 🟡 Duplicate-intent city cluster — unchanged, content strategy call

- **11 duplicate-`h1` pairs** (was 12; one resolved). In every pair with GSC data the `/swim-lessons/` twin wins and the flat-file twin has 0 impressions.
- **30 of 35 city slugs carry 2–5 indexable near-duplicate pages — 103 pages total.** Titles and metas are all distinct and every page is correctly self-canonical, which is exactly why no automated check flags them.

The repo already contains the precedent (`beginner-swim-lessons-ambler-pa.html` → canonicalized stub). Collapsing the cluster would take ~103 pages to ~35. Which twin wins each city is Michael's call, so nothing was changed.

## 6. Coverage limitation

Live-HTTP verification (serving status of `robots.txt` / `sitemap.xml`, `http→https` behaviour) could **not** be performed this run — outbound fetches to `waterwisekids.com` were blocked by the fetch provenance rule. All findings above are measured against `origin/live`, which is what GitHub Pages serves. The known `http` variants indexed / `http` not redirecting item is therefore carried forward unverified.

---

**Changes pushed to `live`: none.** Every axis this job can act on is already compliant; the three remaining items all require a human decision.
