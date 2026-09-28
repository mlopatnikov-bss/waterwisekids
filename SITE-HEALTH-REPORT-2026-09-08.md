# Site Health Audit — 2026-09-08 (site-auditor)

**Corpus:** 769 HTML files in the `live` clone · 23 redirect stubs · 461 images · 13 CSS + 2 JS assets.
**Shipped:** `a1582b113` → `live`. 128 files, 285 link normalizations + 24 rel attributes + 1 file deleted.

> Runs *after* the 09-08 SEO audit (`d3fdeb34a`), which closed meta/canonical/JSON-LD/sitemap/anchor-integrity.
> This pass took the axes that audit did **not** cover: link + asset resolution, HTML validity, outbound-link
> health, cache-bust integrity, and page/asset weight.

---

## Health summary

| Axis | Denominator | Result |
|---|---|---|
| Broken internal links | 30,182 anchor refs | **0** ✅ *(canary-verified)* |
| Missing assets (CSS/JS/img/iframe) | 5,190 refs | **0** ✅ *(canary-verified)* |
| HTML validity (libxml2) | 769 files | **0 errors** ✅ *(canary-verified)* |
| Insecure `http://` external links | 911 unique ext URLs | **0** ✅ |
| Cache-bust key staleness | 14 keyed assets | **0 stale** ✅ |
| Assets referenced without a cache-bust key | 1,253 refs | **0** ✅ |
| Images with no width/height (CLS) | 1,883 `<img>` | **0** ✅ |
| First image on page set `loading="lazy"` (LCP) | 769 pages | **0** ✅ |
| Images >150 KB | 461 images | **0** (largest 58 KB) ✅ |
| Files >200 KB | all files | **2** ⚠️ (see below) |
| Non-canonical outbound host/path forms | 4,180 ext anchors | **285** → **fixed** |
| Unqualified commercial outbound links | 24 | **24** → **fixed** |
| Orphaned assets | 15 CSS/JS files | **1** → **deleted** |

---

## Fixed and shipped

### 1. 285 British Swim School enrolment CTAs pointed at a non-canonical URL

The highest-value finding of the run, because these are the money links — the "Enroll Today" /
franchise CTAs for Michael's own two territories, on 125 pages.

I fetched the destination. It redirects and declares its own canonical:

```
https://britishswimschool.com/jersey-shore  →  https://britishswimschool.com/jersey-shore/
<link rel="canonical" href="https://britishswimschool.com/jersey-shore/">
```

Google indexes that same trailing-slash, **non-www** form. The site was linking two other variants:

| Count | URL as linked | Hops to destination |
|---:|---|---|
| 143 | `https://www.britishswimschool.com/jersey-shore` | 2 (www→apex, then slash) |
| 131 | `https://www.britishswimschool.com/northwest-philadelphia` | 2 |
| 6 | `https://britishswimschool.com/northwest-philadelphia` | 1 |
| 5 | `https://britishswimschool.com/jersey-shore` | 1 |

All 285 now point at the canonical form. The 161 URLs already correct were left alone, and deeper
paths (`/jersey-shore/location/la-fitness-brick/`) were untouched — the match is right-anchored on a
delimiter, so it cannot fire on a URL *prefix*.

### 2. 24 Amazon product links carried no link qualifier

`gear.html` and `gear/index.html` link 24 Amazon product-search URLs with only `rel="noopener"`.
Commercial outbound links should be qualified under Google's link-spam guidance. Now
`rel="noopener sponsored nofollow"`. These are bare search URLs with no affiliate tag, so nothing
monetary changes — this removes a thin-affiliate pattern signal on a site whose whole position is
editorial authority.

### 3. Deleted `assets/js/mobile-app.js` — dead since April

13.8 KB, last touched 2026-04-08, **zero references anywhere in the corpus**. The mobile loader in
`main.js` injects `m-app.css` + `m-app.js`; the only "mobile-app" hits were the loader's own comment
and a set of `.mobile-app-*` CSS class names. Confirmed before deleting, not inferred from the name.

---

## Clean — with the probe proven, not assumed

Every zero below was canary-gated: a synthetic defect was injected into a scratch copy and the probe
confirmed to catch it, so these are real zeros rather than filters that never fire.

- **Link + asset resolution — 0 bad out of 35,372 references.** Canary injected a missing stylesheet,
  a missing image, a dead relative link and a dead absolute-internal link; the probe caught 4/4.
  Note the resolver is *page-relative*, which is what stops the recurring `schools-data.js`
  false positive on the 52 directory pages.
- **HTML validity — 0 errors across 769 files.** libxml2's parser error log. Canary injected an
  unclosed `<strong>` and a `<div>/<span>` crossover; caught both. This is the class that historically
  hides from link, meta and schema checks — it is genuinely clean.
- **Cache-bust integrity — 0 stale keys.** Every one of the 14 keyed assets carries a `?v=` date at or
  ahead of the file's last commit date, and **every** stylesheet/script reference in the corpus is keyed
  (0 unkeyed). The two dynamically injected mobile assets are keyed too:
  `m-app.css?v=20260907c` (file 09-07) and `m-app.js?v=20260903a` (file 09-03). Both current.
  Worth re-checking on any run that ships CSS — the last two commits touched HTML only, which is why
  this came back clean.
- **Redirect stubs — all 23 correct.** 17 carry no stylesheet at all, which initially looked like
  unstyled pages; all 17 are meta-refresh stubs with a canonical and 58 characters of body text.
  Correct by design. The other 6 are the known "stub carries the only form" family.
- **Lazy-loading — correct, not missing.** 1,517 `<img>` have no `loading` attribute, but 1,505 of them
  are the header/footer logo SVG and the remaining 12 are above-fold icons. Lazy-loading those would
  hurt, not help. Content images that should be lazy (366) are.

---

## Flagged, deliberately not changed

- **`education/index.html` is 344 KB of HTML** — 11× the corpus median (29 KB) and 1.9× the next-largest
  page (`directory/texas.html`, 185 KB). This is a structural call on the hub, not something to
  auto-trim, and the hub was already restructured on 09-08 for the cannibalization fix — worth pairing
  with the **09-22 watch** on that page rather than touching it twice in a fortnight.
- **112 links to `www.uscgboating.org` where the site itself uses non-www.** I fetched it: the non-www
  form returns 200 with **no redirect** and declares no canonical, and the USCG footer brands itself
  "WWW.USCGBOATING.ORG". Both forms work. No hop to save, so no reason to churn 112 links. Also
  confirms the site's single most-cited external source (the life-jacket page) is **live and current** —
  "Last Modified: September 2026".
- **`gear.html` vs `gear/index.html` content drift.** Both self-declare canonical `/gear/`, but the
  root twin has a different H1 ("Swim Gear & Product Guide" vs "Swim Gear Guide 2026") and 6 Amazon
  links to the destination's 18. Handled correctly by canonical + meta refresh, so no SERP consequence;
  recording it as an instance of the known legacy-root-twin drift class, not a new defect.

---

## Standing items still needing Michael

Unchanged, none actionable from here:

- **Sitemap not resubmitted in Search Console since April** — the file reconciles exactly (650 = 650),
  but Google has not re-fetched it.
- **HTTP variants indexed** — needs the redirect toggle.
- **Outreach batch unsent** — still the authority bottleneck.
- **Sitemap `lastmod` contradicts schema `dateModified`** on 356 URLs.
- **122 pages: `.content-grid` sits 30 px off-rail on desktop** — needs a design call.

---

## Read of the day

The three axes this task names as its core — broken links, HTML validity, missing assets — are all
genuinely at zero, and now provably so rather than presumptively. The defect that *did* surface came
from a direction none of those probes point: the links were not broken, they were **valid links to the
wrong version of a working page**. 285 of them, on the two CTAs that actually convert.

That is the shape worth carrying forward. A link checker asks "does this resolve?" and every one of
these resolved. The better question for outbound links is "does this resolve *directly*, and does the
destination agree that this is its URL?" — which requires fetching the destination and reading its
canonical, not just its status code. Next run should apply the same test to the four large directory
chains (Goldfish 218, Aqua-Tots 144, SafeSplash 131, Big Blue 62), where the same www/slash drift would
be invisible to any status-code check and sits on 555 outbound anchors.
