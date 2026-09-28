# Google Index Compliance Report — 2026-08-24

Audited against a fresh `/tmp` clone reset to `origin/live` (`203a118c`).
Scope: 739 HTML files on disk, 635 sitemap URLs, 2,124 JSON-LD blocks, 42,364 link/asset references.

## Status: COMPLIANT — 2 defect classes found and fixed

---

## Clean (verified, no action)

| Check | Result |
|---|---|
| robots.txt | `Allow: /` + sitemap declared. Correct. |
| sitemap.xml well-formed | Parses; 635 `<url>`; 0 duplicate `<loc>`; 0 missing `lastmod`; 0 malformed or future dates |
| Sitemap coverage | 0 indexable pages missing from sitemap; 0 noindex pages wrongly included; 0 sitemap URLs with no page behind them |
| Canonical tags | 0 missing, 0 non-https, 0 off-host |
| noindex | 81 pages, all intentional (printables); none in sitemap |
| Titles | 0 missing |
| JSON-LD parse | 2,124 blocks, **0 parse errors**, 0 missing `@context` |
| Schema image URLs | 0 unresolvable against disk |
| Article schema | 0 missing `headline`/`datePublished`/`author`/`publisher`; 0 over-long headlines |
| BreadcrumbList | 719 lists, 0 bad `position` sequences, 0 items missing `name` |
| HowTo | 39 blocks, 0 missing steps |
| FAQPage visibility | **2,871 Q&A pairs — 100% visible on-page** (see false positive #1) |
| Internal links | 42,364 refs checked, **0 broken** |
| Template placeholders | 0 unsubstituted `__TOKEN__` in hrefs |

---

## Fixed this run

### 1. Sitemap `lastmod` understated on 52 pages with real content changes

`lastmod` was older than the date the page's **visible body text** actually changed — in some cases by two months (`teens/lifeguard-certification.html` claimed 2026-06-13; a full FAQ section was added 2026-08-14). Google uses `lastmod` to prioritise recrawl, so understated dates delay reindexing of new content.

Bumped each of the 52 to the date of the commit that actually changed its body text — not to today, and not in bulk.

Examples:

| Page | was | now |
|---|---|---|
| `teens/lifeguard-certification.html` | 2026-06-13 | 2026-08-14 |
| `teens/aquatics-careers.html` | 2026-06-13 | 2026-08-14 |
| `teens/swim-instructor.html` | 2026-06-13 | 2026-08-14 |
| `education/in-home-swim-lessons-explained.html` | 2026-06-29 | 2026-08-04 |
| `education/swim-instructor-employment-model.html` | 2026-06-29 | 2026-08-01 |
| `education/swimming-with-eczema-kids.html` | 2026-06-20 | 2026-08-01 |
| `aquatic-jobs/index.html` | 2026-04-08 | 2026-08-18 |
| `education/autism-wandering-water-safety.html` | 2026-07-11 | 2026-08-23 |

### 2. Two meta descriptions over the 160-character limit

The 2026-08-23 Beach Flag Color Card lead magnet shipped with descriptions that truncate in SERPs (163 and 161 decoded chars). Trimmed to 153 and 155. All **three** mirrors updated per page (`description`, `og:description`, `twitter:description`) — they were identical on these pages, so leaving one behind would have desynced them.

---

## Deliberately NOT changed

**309 pages whose `lastmod` is older than their last commit — correct as-is.** Those commits changed only a CSS cache-bust query string (`?v=20260820b` -> `?v=20260821v`) or a colour value. Bumping them would tell Google 309 pages changed when no content did, which devalues the signal for the 52 that genuinely did. Verified by diffing each file's content between its `lastmod` commit and HEAD, not by reading commit subjects — the two big sitewide sweeps (`635966dd` contrast, `9b575545` mobile nav) touched 724 of 731 HTML files each and would otherwise have looked like real edits.

**222 pages with head-metadata-only changes since `lastmod`** (og:image dimensions, twitter tags, schema additions). Held: Google refreshes these on its normal recrawl, and bumping 222 dates dilutes the freshness signal. Flagged rather than actioned — reversible if snippet refresh proves slow.

---

## False positives caught before filing

1. **42 "FAQ questions not visible on page" — all case artifacts.** Schema `name` is sentence case ("What is a rip current?"), the visible H2 is title case ("What Is a Rip Current?"). A case-sensitive substring probe flagged 42 across 31 pages. Re-probed with case/punctuation normalisation: **0 genuine**. Same for answer drift: 0 of 2,871.
2. **13 pages with no H1** — all 13 are `<meta http-equiv="refresh">` alias stubs (2.8–3.9 KB). 19 such stubs exist site-wide; a stub has no H1 by design.
3. **19 canonicals shared by more than one file** — same alias-stub class; the stub and its target correctly declare one canonical.
4. **23 indexable pages absent from the sitemap** — the cross-canonical alias stubs, which correctly point at a canonical that *is* in the sitemap. (739 files − 81 noindex − 635 sitemap = 23, exactly.)
5. **HTML entities in FAQ answers** — first probe flagged 2; both were a literal `&` in prose, not an unescaped entity. 0 real.

## Noted, not actioned

**117 page titles exceed 65 characters** and will truncate in SERPs. This is a click-through concern rather than an indexing-compliance one, and rewriting titles belongs to the CTR workstream where impression data can pick the targets. Listed here so it isn't rediscovered as new.
