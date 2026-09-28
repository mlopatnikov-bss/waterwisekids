# Site Audit — 2026-09-03

**Audited:** fresh `/tmp` clone reset to `origin/live` @ `b194f223` · 759 HTML files
**Shipped:** `77805192` → `live`
**Note:** the mounted workspace's local `live` was 14 days stale (`2476831c`, 2026-08-20). Audited the clone, as always.

## Health summary

| Check | Scope measured | Result |
|---|---|---|
| Broken internal links | 29,863 internal hrefs across 759 pages | **0** |
| Missing image files | 1,858 `<img>` + 615 JSON-LD image refs | **0** |
| Missing `alt` | 1,858 images | **0** (1,858 filled, 0 empty) |
| Missing image dimensions | 1,858 images | **0** (attr or inline style) |
| Invalid JSON-LD | 2,171 `ld+json` blocks | **0** parse errors |
| Missing CSS/JS assets | 1,932 stylesheet + script refs | **0** |
| Missing title / meta desc / canonical | 759 pages | **0 / 0 / 0** |
| Broken `<head>` (metas in body) | 759 pages | **0** |
| Duplicate element IDs | 759 pages | **0** |
| Soft 404s (error title, 200 status) | 759 pages | **0** |
| Sitemap: entries with no file | 645 URLs | **0** |
| Sitemap: noindex pages listed | 91 noindex pages | **0** |
| Orphan pages (BFS from `/`) | 759 pages | **0 real** (24 = 404 page + 23 redirect stubs, by design) |
| Oversized HTML (>300 KB) | all files | **1** — see below |
| Cache-bust key drift | 14 versioned assets | **1 → fixed** |
| `http://` self-links in markup | 37,929 anchors | **0** |

Every sweep was canary-gated (asserted a known-positive fires and a known-negative doesn't) before its zero was believed.

## Fixed and shipped

### Printables loaded Inter without its italic face — 41 emphases rendering as faux oblique

`77805192` — 93 files, one line each.

The printable template requested `Inter:wght@400;500;600;700;800`. No `ital` axis. But 25 of the 93 printables carry **41 visible `<em>` elements**, and `printable-checklist.css` sets `font-family: 'Inter'`. With no italic face available, every one of those was browser-synthesized oblique — a mechanically slanted upright face — instead of real Inter Italic.

The affected words are the ones where emphasis actually carries meaning in safety copy: *"(not optional gear)"*, *"**not**"* in the CPR quick card, *"everyone"* in layers-of-protection, *"tell the program, in writing"* in the daycare questions checklist.

The other 649 pages already requested `ital,wght@0,400;…;0,900;1,400` and rendered these correctly — so identical markup rendered two different ways depending on which template family you landed on.

Fixed by consolidating the printables onto the byte-identical sitewide font URL. Two wins beyond the glyphs: the site now issues **one** Google Fonts request instead of two, so a reader moving from an article to its printable reuses the cached font response; and the cache-bust drift table goes to zero, restoring the variant-count tripwire.

Verified: 742/742 pages on one font URL, 0 pages on the old one, all 41 `<em>` elements still present, diff confirmed as exactly one changed line per file (both `>` and `/>` tag variants handled).

## Checked and deliberately not "fixed"

Three signals that look like defects and are not — recording so they don't get re-reported:

- **23 indexable pages absent from `sitemap.xml`.** All 23 are canonicalized-away redirect stubs carrying `<meta http-equiv="refresh">` (`education.html` → `/education/`, `how-to-prevent-child-drowning.html` → `/education/drowning-prevention-guide.html`, etc.). Excluding them is correct. They are also the same 23 that show as orphans — also correct, they should not be linked.
- **BreadcrumbList "missing" on 3 hub pages.** `education/`, `aquatic-jobs/` and `swimmers-hub/` nest it under `WebPage.breadcrumb` rather than as an `@graph` sibling. Valid schema.org; a top-level-only probe is what's wrong.
- **1,497 images without `loading="lazy"`.** 1,485 are the header/footer `logo-swimmer.svg` (above-fold chrome — lazy would hurt LCP) and 6 are 36px inline-sized homepage card icons. All 361 real content images are already lazy.

## Open — needs your call

- **`education/index.html` is 339 KB.** Not bloat: it's 360 article cards and 362 (correctly lazy) images — the full guide index. Reducing it means paginating or filtering the index, which is an architecture decision, not an audit fix.
- **`sitemap.xml` still hasn't been fetched by Google since April** (carried over). Google has seen 97 of 645 URLs. The API token is read-only, so resubmission has to come from you in Search Console.
- **`sitemap.xml` `lastmod` contradicts schema `dateModified` on 356 URLs** (carried over, `f387109f`).

## Method notes

Parser-based throughout (bs4/lxml), never grep. `<script>`/`<template>`/`<noscript>` masked before link extraction — the known trap where a root-relative resolver reads chrome and fakes ~50 broken links. Both corpora audited (the 127 legacy root pages have no `.article-body` and are invisible to article-shaped probes). External hosts inventoried (132 distinct, led by cdc.gov 812, healthychildren.org 687, redcross.org 671) but not liveness-probed — direct URL fetching was blocked this run.
