# Site Audit — waterwisekids.com — 2026-09-07

**Commit audited:** `8a7d459c9` (branch `live`, full clone, not shallow)
**Corpus:** 767 HTML files · 32,591 internal hrefs · 1,878 asset refs · 2,191 JSON-LD blocks
**Result: clean. Zero defects fixed, nothing pushed.**

## Health summary

| Check | Result | Status |
|---|---|---|
| Broken internal links | 0 / 32,591 | PASS |
| Broken asset refs (img/script/srcset) | 0 / 1,878 | PASS |
| Missing CSS references | 0 / 1,952 stylesheet links | PASS |
| HTML tag balance (unclosed/stray) | 0 issues | PASS |
| Malformed `<head>` attributes (embedded quotes) | 0 | PASS |
| JSON-LD parse validity | 0 invalid / 2,191 blocks | PASS |
| `<title>` present | 767 / 767 | PASS |
| `meta description` present | 767 / 767 | PASS |
| `canonical` present | 767 / 767 | PASS |
| `viewport` present | 767 / 767 | PASS |
| `og:description` ≡ `twitter:description` | 767 / 767 | PASS |
| `img` missing `alt` | 0 / 1,878 | PASS |
| Sitemap URLs resolving to a real file | 649 / 649 | PASS |
| Indexable pages missing from sitemap | 0 | PASS |
| Duplicate-title cannibalization | 0 real (12 stub/canonical pairs) | PASS |
| Cache-bust key consistency | 14 assets, 1 key each | PASS |
| Chrome markup variants | 5 header / 2 footer (matches baseline) | PASS |
| Oversized assets (>300 KB) | 0 | PASS |
| External link liveness | **not verified this run** | BLOCKED |

## False positives ruled out

Four findings looked like defects and were disproved rather than "fixed":

1. **53 broken links in the state directory.** All were JS template literals
   (`${school.website}`) inside `<script>` blocks. Re-ran with script/style/comments
   stripped: 0 broken. Every sweep below is canary-gated — the tag-balance, head-quote
   and JSON-LD probes were each confirmed to fire on a planted defect before their
   zeros were accepted.

2. **118 pages missing from the sitemap.** All correctly excluded: 95 `noindex`
   (94 printables + `404.html`), 23 canonicalised away. **0 genuine gaps.** The
   printable `noindex` is long-standing (present since each file's creation commit,
   2026-04-08 / 2026-06-21), not a regression that would deindex ranking pages.

3. **12 duplicate `<title>` groups (25 pages).** Every group is a legacy stub pointing
   at its canonical target. Classified each page by self-canonical + indexable +
   in-sitemap: **0 groups have more than one live member.** No cannibalization.

4. **A singleton header variant** on `education/pool-safety-rules-printable.html`
   (bare `<header>`, where 96 other printables use `<header class="screen-header">`).
   Correct by design: this is the only page on the *poster* family
   (`printable-poster.css`), where `header` is styled directly (line 63) and
   `.screen-header` names a different element — the intro block inside
   `.screen-wrapper`. The print rule hides both `header` and `.screen-header`, so
   printing is unaffected.

Also confirmed benign: the 17 pages with zero stylesheet links are all instant
(`0;url=`) meta-refresh redirect stubs.

## Open items — need Michael, not auto-fixable

**Sitemap `lastmod` vs schema `dateModified`: 198 of 649 disagree** (265 agree,
185 have no `dateModified` — correctly, they are FAQPage/WebPage not Article).
Direction is uniform: `lastmod` is ahead in all 198, behind in 0.

Trend across runs: 439 → 425 → 364 → **198**. It is halving without intervention,
because later reconciliation passes pull `dateModified` up to meet the stale `lastmod`.

Not auto-fixed, deliberately. Syncing `dateModified` from `lastmod` would assert a
content edit that never happened — `dateModified` must be derived from a body-text
diff. Reverting 198 crawl signals the other way is above a nightly audit's remit.
Both readings stay defensible, and the priority is low while Google has not fetched
the sitemap since 2026-04-07.

**Three printables are indexable** (`pool-safety-rules`, `summer-safety-checklist`,
`swim-lesson-readiness`) while the other 94 are `noindex`. All three are
self-canonical and in the sitemap — internally consistent, so nothing is broken.
This is the known "printables outrank their landing pages" item; whether to align
them with the family convention is a traffic decision, not an audit fix.

## Not verified this run

**External link liveness (729 distinct URLs across 134 domains).** `web_fetch` is
provenance-restricted in scheduled runs and rejected the URLs, and the standing rule
forbids falling back to `curl`/scripted HTTP. No external URL was checked. The
highest-leverage citations, unverified, are:

| Pages | URL |
|---|---|
| 392 | `healthychildren.org/.../Water-Safety-And-Young-Children.aspx` |
| 271 | `cdc.gov/drowning/data-research/facts` |
| 204 | `redcross.org/.../water-safety.html` |
| 189 | `redcross.org/take-a-class/swimming/swim-lessons` |
| 147 | `cdc.gov/drowning` |
| 132 | `aap.org/en/patient-care/drowning-prevention-and-water-safety` |
| 113 | `usaswimming.org/foundation` |

A single dead URL here is a site-wide citation defect, so this gap is worth closing.
To check them, either run the audit interactively, or paste the URLs into a message
so they enter the fetch provenance set.
