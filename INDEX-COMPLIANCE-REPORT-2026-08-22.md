# Google Index Compliance Report — 2026-08-22

**Status: COMPLIANT.** 2 defect classes found, both fixed and verified live.
Deployed as `e6dd645` on `live` (from `b757b41`).

---

## Scope

Audited a fresh clone of `live` (735 HTML files, 656 indexable, 633 sitemap URLs).
Live sitemap count matched the clone exactly, so the audit reflects production.

---

## Defects found and fixed

### 1. `LocalBusiness` missing required `address` — 2 pages (Search Console error)

`british-swim-school/jersey-shore.html` and `.../northwest-philadelphia.html` each
carried a `LocalBusiness` node with no `address`. Google requires `address` on
`LocalBusiness`; without it the markup is ineligible for rich results and reports as
*Missing field 'address'*.

Neither page contains a postal address or phone number anywhere in its visible text,
so there was nothing to source an address from — these are service-area businesses,
not storefronts.

**Fix (no fabricated data):** retyped both nodes as `Service`, which has no address
requirement and correctly models a service offered across an area:

- `areaServed` upgraded from bare strings to `Place` objects
- `email` moved into a `provider` `Organization` node (`Service` has no `email` property)
- `name`, `url`, `description`, `serviceType` preserved verbatim

**Open item for Michael:** if you have the real business address and phone for these two
BSS franchises, telling me will let me restore `LocalBusiness` with full NAP — that
unlocks local rich results, which `Service` does not. I did not guess.

### 2. FAQ answer paraphrase drift — 1 page (Google FAQ policy violation)

`what-should-kids-wear-to-swim-lessons.html` had a `FAQPage` `acceptedAnswer`
asserting two things absent from the visible page:

- "Bring a **robe** or towel" — page says "a towel, and dry clothes"
- "Most programs **don't allow regular clothes or jeans** in the water" — page says
  "Most programs don't require anything beyond what keeps kids comfortable and safe"
  (a different claim, and an unsupported one)

Google requires FAQ structured data to reproduce content present on the page.

**Fix:** replaced the schema answer with the page's own Quick Answer verbatim.

---

## Checks that came back clean

| Check | Result |
|---|---|
| sitemap.xml well-formed / parses | pass |
| sitemap URLs resolving to a real file | 633 / 633 |
| sitemap duplicate URLs | 0 |
| `lastmod` malformed / future-dated | 0 / 0 (range 2026-04-08 → 2026-08-21) |
| Canonical tag present | 735 / 735 |
| Canonical host consistency | 735 / 735 on `https://www.` (matches CNAME + robots.txt) |
| Canonical targets that 404 | 0 |
| Canonical chains (A→B→C) | 0 |
| `noindex` + cross-canonical conflicts | 0 |
| JSON-LD parse errors | 0 across 12,338 nodes |
| Schema required-property gaps | 0 (after fix) |
| Schema image URLs resolving | 132 / 132 |
| FAQ Q/A not in visible text | 0 / 0 (after fix) — 2,841 pairs checked |
| `Article` date sanity (future, modified<published) | 0 |
| `BreadcrumbList` position sequences | 0 bad |
| Broken internal links | 0 of 27,851 |
| Missing meta description | 0 |
| Meta description >160 / <70 decoded chars | 0 / 0 |
| Duplicate meta descriptions | 0 |
| Missing / duplicate `<title>` | 0 / 0 unexplained |
| Missing or multiple `<h1>` | 0 / 0 |
| Orphan pages | 0 |
| `<html lang>` | 735 / 735 `en` |
| robots.txt correctness | pass — `Allow: /`, sitemap points to www |

---

## Known false positives — confirmed still correct, not touched

- **23 indexable pages absent from sitemap.** These are the legacy cross-canonical
  alias stubs (`about.html` → `/about/`, `beginner-swim-lessons-*.html` → `/swim-lessons/*`,
  etc.). Correctly absent — you don't submit non-canonical duplicates. Verified the set
  is exactly the known 23.
- **9 duplicate-title groups (19 pages).** Every group resolves to one non-alias page
  plus its alias stubs. Verified programmatically: 0 unexplained groups.
- **79 sitemap-absent `noindex` pages.** Correct exclusion.

---

## Notes on judgment calls

- **Did not bump `lastmod`** for the 3 edited pages. Both changes are structured-data
  only; no visible body text changed, so a `lastmod` bump would be a false freshness
  signal.
- **Did not fabricate an address** to satisfy the `LocalBusiness` requirement. Retyping
  to `Service` clears the error honestly; see the open item above.
