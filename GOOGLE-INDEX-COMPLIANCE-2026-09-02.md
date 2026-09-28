# Google Indexing Compliance — 2026-09-02

**Status: PASS with 2 owner-action blockers**
Audited commit `897ab7b2` → shipped `44171df9` to `live`. Verified against a fresh clone of `origin/live` and against the live site under a Googlebot user-agent.

Scope: 757 tracked HTML files, 644 sitemap URLs, 2,164 JSON-LD blocks, 37,803 anchors.

---

## Fixed and deployed

**282 Article nodes were missing `publisher.logo`** — 282 of the 546 `Article`/`BlogPosting` nodes carried a `publisher` Organization with no `logo`. Google's Article structured-data spec lists `publisher.logo` as a recommended property, and its absence is the most common reason an otherwise-valid Article node fails to qualify for rich results. Inserted the sitewide-standard shape:

```json
"logo": {"@type": "ImageObject", "url": "https://www.waterwisekids.com/assets/images/waterwisekids-og.png"}
```

The edit was surgical rather than a re-serialization: for every one of the 282 files, stripping the inserted text reproduces the original byte-for-byte (verified programmatically). 282 insertions, 0 content deletions.

**Logo dimensions declared 28×28 on a 1200×630 image** — `swimmers-hub/backstroke-complete-guide.html` declared `width: 28, height: 28` on both `author.logo` and `publisher.logo`. The actual PNG is 1200×630, and Google requires an Organization logo of at least 112px. The page was asserting a violation that wasn't real. Corrected to the true dimensions.

**2 bare-string logos normalized** — `index.html` and `for-swim-schools/index.html` carried `logo` as a URL string rather than an `ImageObject`, the only two of 551 nodes doing so. Normalized.

This was a metadata-only pass, so sitemap `lastmod` and schema `dateModified` were deliberately **not** bumped — see the open item below on why bumping them on metadata passes is the thing to avoid.

---

## Clean — no action

| Check | Result |
|---|---|
| sitemap.xml well-formed, 644 URLs | 0 duplicates, 0 wrong-host locs, 0 malformed/missing `lastmod` |
| Every sitemap URL resolves to a real file | 0 unresolved |
| robots.txt | `Allow: /`, declares sitemap, serves 200 `text/plain` |
| `noindex` pages leaking into the sitemap | 0 |
| Canonical tags | 757/757 present, 0 duplicated, 0 wrong host, 0 contradicting the sitemap |
| The 113 files outside the sitemap | correctly excluded: 90 `noindex`, 23 canonicalized-away redirect stubs (all carrying meta-refresh). 0 indexable orphans |
| Titles / meta descriptions | 644/644 present, 0 duplicates across the indexable set, 0 truncation outliers |
| JSON-LD parse | 2,164 blocks, 0 syntax errors, 0 missing `@context` |
| Article required fields | 546/546 have `image`, `author`, `publisher`, `publisher.logo`, `headline` ≤110 chars |
| `BreadcrumbList` | 733 nodes, positions sequential, all items named and linked |
| `FAQPage` / `HowTo` | 631 + 42 nodes, 0 empty questions, answers or steps |
| Date sanity | 0 `datePublished` after `dateModified`, 0 future dates |
| Schema image URLs | 65 internal, 0 404s |
| Broken internal links | 0 across 29,848 resolved anchors |
| Broken local asset references (css/js/img/og) | 0 (probe canary-tested) |

---

## Blocked on Michael — unchanged, and this is the whole ballgame

**1. Google has not fetched the sitemap since 2026-04-07.** Re-confirmed today through the Search Console API:

| sitemap | last downloaded | URLs Google saw |
|---|---|---|
| `https://www.waterwisekids.com/sitemap.xml` | **2026-04-07** | **97** |
| `https://waterwisekids.com/sitemap.xml` (stale apex) | 2026-04-05 | 51 |

Live sitemap has 644 URLs. About 85% of the site has never been announced through this channel — everything published since April was found by internal links alone, or not at all. The stored OAuth token is scoped `webmasters.readonly`, so the resubmit `PUT` returns 403; this is a scope limit, not a transient failure, and it was not retried.

*Action:* Search Console → Sitemaps → submit `sitemap.xml`, and delete the stale apex entry. Every other finding in this report is downstream of this one.

**2. `http://www.` serves 200 without redirecting to HTTPS.** Probed live today:

```
http://www.waterwisekids.com/education/lightning-pool-safety.html  → 200, no redirect
http://waterwisekids.com/                                          → 301 → http://www. (stays on HTTP)
```

Six `http://` URLs are drawing impressions in Search Console (156 impressions, 0 clicks over the last 28 days) — duplicate-content signal spend for nothing. The canonical tags already point at `https://www.`, which is why the clicks are zero, but the duplicates persist.

*Action:* GitHub → repo Settings → Pages → tick **Enforce HTTPS**. This cannot be fixed from a file in the repo; GitHub Pages ignores redirect config.

---

## Watch list — measured, not acted on

**Sitemap `lastmod` contradicts schema `dateModified` on 354 of 644 URLs.** Direction is uniform: `lastmod` is ahead in all 354, behind in none. This is the known artifact of metadata-only passes bumping `lastmod`. The trend continues to improve — 439 → 425 → 364 → **354**. Left alone deliberately: reverting 354 crawl signals is the growth job owner's call, and it is a signal nobody is currently reading while blocker #1 stands.

**12 duplicate-`h1` pairs** — `kids-swim-lessons-<city>.html` against `swim-lessons/<city>.html`, plus `swim-lessons/directory/` against `swim-lessons/`. Both members of each pair sit in the sitemap. Previously triaged as defer-rewrite; unchanged.

**214 pages hotlink their `og:image` from `images.pexels.com`.** All 7 distinct URLs returned 200 today. No action needed, but this is a third-party dependency on the social preview for a third of the site, and a presence check in the HTML cannot detect it breaking.

**186 sitemap pages carry no `dateModified`.** Re-confirmed as correct — they are `FAQPage`/`WebPage` types, not Articles, where the property does not apply.

---

*Workspace cleanup completed. Report written 2026-09-02.*
