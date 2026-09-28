# New Content Validation — 2026-08-25

**Window:** last 24h on `live` (16 commits, `63bd6b8` → `670de86`)
**Method:** fresh `--depth 50` clone of `live` at `/tmp/wwk-val` (never the mount), html5lib parse, live curl verify.
**Result: PASS — 0 defects, 0 fixes required, nothing pushed.**

---

## Scope: what is actually *new*

The 24h `--name-only` list is ~900 files, but that is sitewide sweep noise (sitemap lastmod
correction of 152 pages, 184 vendor-error link repoints, 83-page printable CSS mirror, AAP
policy corrections). Filtering with `--diff-filter=A` gives the real new-content set:

| File | Type |
|---|---|
| `education/water-safety-activities-at-home.html` | new education article (lead magnet hub) |
| `education/water-safety-activities-at-home-printable.html` | new printable |
| `assets/images/cards/water-safety-activities-at-home.svg` | new hub card |

Two additional content commits were validated as modified-content: `5895638` (AEO pass on 3
articles) and `670de86` (CTR/vocabulary pass on 12 page-1 zero-click pages).

## Structural battery (article.css class contract)

17 checks — required classes, required assets, banned layout patterns.

- `education/water-safety-activities-at-home.html` — **17/17 PASS**
- 3 AEO-modified articles — **17/17 PASS each**
- 12 CTR-modified articles — **17/17 PASS each**

**16 articles, 272 assertions, zero failures.** No `article-layout`, no `article-main`,
no `</article>`, no `<main class="main-layout">` anywhere in the new/changed set.

### ⚠️ One deliberate non-fix (false positive)

`water-safety-activities-at-home-printable.html` fails 12 of the 17 checks. This is **correct
and must not be "fixed."** Printables are a separate template class: `printable-checklist.css`
instead of `main.css`+`article.css`, no sidebar, no TL;DR, no FAQ schema, `noindex`, excluded
from the sitemap. It is byte-for-byte conventional against peer printables
(`swim-bag-checklist-printable`, `pool-safety-rules-printable`). Rewriting it into the article
template would have destroyed the page. **The validator battery must be scoped to
non-`*-printable.html` education files.**

## Secondary validation — new article

| Check | Result |
|---|---|
| `<head>` integrity (html5lib) | 16 metas in head, **0 in body**, canonical in head ✓ |
| Title / meta description | 64 / 148 chars — both inside limits ✓ |
| OG + Twitter tags | all 6 present; `og:image` = sitewide `waterwisekids-og.png` (convention: 433/438 education pages) ✓ |
| JSON-LD | Article + BreadcrumbList + FAQPage, all parse ✓ |
| Schema headline vs H1 | exact match ✓ |
| Schema image resolves | file exists on disk ✓ |
| FAQ schema ↔ visible copy | 5/5 questions **and** 5/5 answer bodies present in rendered text ✓ |
| H2 form (AEO) | 5 of 9 H2s are question-form ✓ |
| Images / alt text | 2 images, 0 missing alt ✓ |
| Nav / footer / GTM-5DN8B3QT | all present ✓ |
| Canonical / robots | self-canonical, indexable ✓ |
| Sitemap entry | present ✓ |
| Internal links | 56 links, 0 broken ✓ |
| Unsubstituted `__PLACEHOLDER__` | none ✓ |

Printable: same battery where applicable — `noindex` ✓, **correctly absent from sitemap** ✓,
self-canonical (no noindex/canonical conflict) ✓, 0 missing alt ✓, 32 links 0 broken ✓.

## Link-starvation check — the lead magnet did NOT launch starved

The recurring failure mode for new lead magnets is shipping with zero in-body inbound links.
This one did not:

- **9 inbound links** to the hub — **6 in-prose** from `teaching-water-respect`,
  `water-safety-activities-schools`, `water-safety-for-kids`, `water-safety-beyond-the-pool`,
  `home-water-safety-room-by-room-checklist`, `water-safety-games-kids` — plus the
  `education/index.html` hub card.
- **4 inbound** to the printable, 2 of them in-prose from the hub article.
- Card SVG is referenced by `education/index.html` and resolves.

## Live verification (curl -L, not the mount)

```
200  34,126b  /education/water-safety-activities-at-home.html            → correct <title>
200  16,970b  /education/water-safety-activities-at-home-printable.html  → correct <title>
200   4,472b  /assets/images/cards/water-safety-activities-at-home.svg
```

Body fingerprints confirm real content, not soft-404s.

## Actions taken

None required. No commits, no push to `live`.

## Note for the next run

Scope the structural battery to `education/*.html` **excluding** `*-printable.html`.
Two other benign false positives to ignore: `mailto:` addresses containing the domain get
caught by naive internal-link resolvers, and the fill-in-the-blank underscore runs in
printables are not template placeholders.

---
*Mandatory workspace cleanup executed at end of run.*
