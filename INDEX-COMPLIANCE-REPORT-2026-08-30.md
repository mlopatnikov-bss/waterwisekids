# Google Index Compliance — 2026-08-30

**Site:** waterwisekids.com · **Audited commit:** `64e4c262` (fresh `/tmp` clone reset to `origin/live`)
**Verdict:** **PASS — no fixes pushed.** Every content-level indexing signal is clean. The two real defects are infrastructure/escalation items outside a nightly job's authority.

> Note: the mounted workspace's local `live` was 12+ commits behind `origin/live` (`2476831c`, 2026-08-20). All measurements below are from the fresh clone, not the mount.

---

## Scorecard

| Check | Scope | Result |
|---|---|---|
| sitemap.xml well-formed, parses | 641 URLs | ✅ |
| sitemap entries backed by a real file | 641 | ✅ 0 orphans |
| duplicate `<loc>` entries | 641 | ✅ 0 |
| all locs `https://www.` | 641 | ✅ 0 deviations |
| `<lastmod>` present on every entry | 641 | ✅ 0 missing |
| robots.txt valid + declares sitemap | — | ✅ |
| `noindex` on a sitemap URL | 751 files | ✅ 0 |
| indexable page missing from sitemap | 751 files | ✅ 0 (23 gaps are all meta-refresh stubs) |
| canonical present / single / correct host | 641 | ✅ 0 missing, 0 duplicate, 0 foreign host |
| canonical self-reference on sitemap URLs | 641 | ✅ 0 canonicalized-away |
| meta description present, unique, 70–165 chars | 641 | ✅ 0 missing, 0 duplicate, 0 over/under |
| `<title>` present + unique | 641 | ✅ 0 missing, 0 duplicate |
| metas stranded in `<body>` (broken `<head>`) | 751 | ✅ 0 |
| soft-404 / error strings in indexable titles | 641 | ✅ 0 |
| **JSON-LD parses** | 751 files, 2,051 blocks | ✅ 0 parse errors, 0 pages without schema |
| JSON-LD URLs on a non-www host | 641 | ✅ 0 |
| schema image URLs resolve to a real file | 80 distinct | ✅ 0 missing (14 are external Pexels CDN) |
| FAQPage → visible-content policy | 626 FAQ blocks | ✅ 0 violations |
| duplicate question inside one FAQPage | 626 | ✅ 0 |
| BreadcrumbList position sequence + `item` | 727 | ✅ 0 (262 last-item-only omissions are spec-legal) |
| `speakable` selectors matching nothing | 672 | ✅ 0 |
| og:url ↔ canonical, og:title/image/type, `article:modified_time` ↔ `dateModified` | 641 | ✅ clean |
| **broken internal links** | **28,671 link instances** | ✅ **0** |
| apex → www redirect | live | ✅ 301 |
| 404 handling | live | ✅ returns 404 + `noindex, follow` |
| sitemap fetch as Googlebot | live | ✅ 200, `application/xml`, 128 KB, 0.13 s |
| Googlebot page fetch (Cloudflare bot-gate) | 4 samples | ✅ 200, full HTML — no gate |
| deploy freshness (live vs clone) | homepage | ✅ current (only Cloudflare `__cf_email__` drift) |

---

## Finding 1 — HTTP is serving 200 and Google is indexing it (NEW, needs Michael)

The site answers on plain HTTP with **no redirect to HTTPS**:

```
http://waterwisekids.com/       → 301 → http://www.waterwisekids.com/   ← stays on HTTP
http://www.waterwisekids.com/   → 200  (no redirect)
```

This was previously logged as a config nit. It is no longer theoretical — **Search Console shows Google has indexed the `http://` variants as separate URLs**, drawing impressions over the last 90 days:

| URL (protocol as indexed) | Impressions |
|---|---|
| `http://www.waterwisekids.com/education/lightning-pool-safety.html` | 9 |
| `http://www.waterwisekids.com/education/backyard-pool-fence-requirements.html` | 7 |
| `http://www.waterwisekids.com/education/secondary-drowning-dry-drowning.html` | 2 |
| `http://www.waterwisekids.com/education/swim-lessons-cost.html` | 1 |
| `http://www.waterwisekids.com/education/swimming-pool-fence-laws-by-state.html` | 1 |

Every one of those pages already carries a correct `https://www` canonical — the canonical is being ignored or under-weighted because the duplicate is directly crawlable. Ranking signals are being split across two protocols on at least 5 pages.

**Fix (Michael — one toggle, no code change):** either
- GitHub → repo **Settings → Pages → Enforce HTTPS**, or
- Cloudflare → **SSL/TLS → Edge Certificates → Always Use HTTPS**.

Not actioned here: flipping a repository/CDN setting is an account-settings change and is outside what this job is authorized to do. `_headers` is inert on GitHub Pages, so there is no in-repo fix to push.

## Finding 2 — sitemap `lastmod` contradicts schema `dateModified` on 425 URLs (known, worsening)

Previously logged at 361 URLs on 2026-08-29; now **425 of 641** (66%). Direction is consistent — `lastmod` is *ahead* of `dateModified` in all 425 cases, never behind. 186 sitemap pages carry no `dateModified` at all (correctly — they are FAQPage/WebPage types, not Articles, so no `dateModified` is expected).

No internal contradictions: 0 pages with conflicting `dateModified` values, 0 with `datePublished` after `dateModified`, 0 future dates.

Still unresolved for the same reason as before: reverting 425 crawl signals unilaterally is above a nightly audit's authority, and the underlying cause is upstream — the reconciliation job keeps bumping `lastmod` on metadata-only passes. **The durable fix is in that job**, not in the sitemap: set `lastmod` from the same verified content-change date it already computes for `dateModified`.

## Finding 3 — 12 duplicate-H1 pairs, and Google has already picked the winner

Twelve town/region topics exist as two indexable URLs with a **byte-identical `<h1>`**:

| H1 | flat file | `/swim-lessons/` twin |
|---|---|---|
| Kids Swim Lessons in Elkins Park, PA | `kids-swim-lessons-elkins-park-pa.html` | `swim-lessons/elkins-park-pa.html` |
| Kids Swim Lessons in Brick, NJ | `kids-swim-lessons-brick-nj.html` | `swim-lessons/brick-nj.html` |
| …10 more (Howell, Asbury Park, Glenside, Ambler, Flourtown, Cheltenham, Monmouth County, Ocean County, Jersey Shore, + the `swim-lessons/` vs `swim-lessons/directory/` hub pair) | | |

Titles and meta descriptions are distinct on every pair, so no duplicate-title flag fires — the collision is at the H1 only.

**GSC settles it: in every pair with any data, the `/swim-lessons/` version is the one Google surfaces, and the flat-file twin has drawn zero impressions in 90 days.** Three of the `/swim-lessons/` pages have since been re-pitched at the title level ("Elkins Park PA Swim Lessons: **Cost & Choosing a Top School**", ~23 KB vs the twin's ~13 KB) while their H1 was never updated to match.

**Not actioned deliberately.** Site convention is that `<title>` is SERP-pixel-optimized and `<h1>` is editorial — they diverge on purpose across the corpus (I measured 20+ indexable pages at title/H1 token overlap below 0.35, all intentional). Rewriting an H1 to resolve a collision, absent evidence about which phrasing wins, is the "rephrase instead of defer" mistake. The real question is whether the 12 zero-impression flat-file twins should exist at all — a content-strategy call, not a compliance fix.

## Finding 4 — indexation coverage remains the ceiling

**236 of 641 sitemap URLs (36.8%) drew a single impression in the last 90 days. 405 drew none — 261 of those under `/education/`.**

Ruled out as causes this run: the sitemap serves cleanly to Googlebot (200, `application/xml`, 0.13 s), robots.txt is permissive, there is no Cloudflare bot-gate, and every page returns 200 to Googlebot with full HTML. Nothing on our side is blocking crawl. This is consistent with the standing issue that Google has not re-downloaded the sitemap since April and has only ever processed a fraction of it — which needs a **manual resubmission in Search Console** (the API token on file is read-only).

---

## Observation, not a defect: publisher schema is inconsistent

281 of 454 Article pages ship `publisher` without a `logo`; 173 include one, split across two different assets (`waterwisekids-og.png`, a 1200×630 banner, on 94 pages; `logo-swimmer.svg`, an 891-byte icon, on 79). Three distinct `publisher` shapes exist across the corpus, and one page declares its logo at 28×28.

**Not fixed, and not a compliance failure.** Google's Article documentation states there are no required properties for Article, and logo validation moved out of Article into Organization markup in 2023. Stamping a chosen logo across 281 pages would be a brand-identity decision on a night when nothing is actually broken, and neither available asset is a proper square logo — one is an OG banner, the other an SVG icon below the 112 px minimum Google applies to Organization logos.

**Worth doing properly, once:** add a single `Organization` node with a real square raster logo to the homepage, which is where Google now reads publisher identity from. That is a one-page change with a real asset dependency — flagging it rather than improvising it.

---

## Actions taken

None pushed. All 20+ content-level compliance checks passed; the four findings are one infrastructure toggle, one upstream job bug, one content-strategy question, and one crawl-budget/resubmission item — none of which are fixed by editing HTML.

## Next run should re-check

- Whether HTTPS enforcement got enabled, and whether the 5 `http://` URLs drop out of GSC
- `lastmod` vs `dateModified` drift — currently 425/641, was 361 (rising means the upstream job is still mis-bumping)
- Sitemap processed-URL count in Search Console after any resubmission

Sources: [Google Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article) · [Organization markup / logo](https://developers.google.com/search/blog/2023/11/introducing-organization-markup)
