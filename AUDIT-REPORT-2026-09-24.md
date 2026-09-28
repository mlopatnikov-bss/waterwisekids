# Site Audit: waterwisekids.com

**Date:** 2026-09-24
**Audited revision:** `origin/live` @ `cc2189c`, the deployed site (fresh clone, not the local working tree)
**Pages scanned:** 808 HTML files · 1,006 unique external URLs
**Commits pushed:** none. Nothing on the deployed site needed fixing.

---

## Health summary

| Check | Result | Status |
|---|---|---|
| Broken internal links | 0 | PASS |
| Missing CSS / JS / image references (HTML + CSS `url()`) | 0 | PASS |
| HTML structural errors (unclosed / stray tags) | 0 | PASS |
| Duplicate element IDs | 0 | PASS |
| Broken JSON-LD schema | 0 | PASS |
| Images missing `alt` text | 0 | PASS |
| Missing title / meta description | 0 / 0 | PASS |
| Sitemap dead entries | 0 of 669 URLs | PASS |
| Sitemap duplicates / noindex pages listed | 0 / 0 | PASS |
| Sitemap coverage gaps | 0 | PASS |
| Sitemap freshness | newest `lastmod` 2026-09-24 | PASS |
| External links: real 404/410/DNS failures | 0 of 1,006 | PASS |
| External links: bot-blocked / rate-limited (403/429/503) | 191 / 151 / 20 | INFO, not broken |
| Files over 400 KB | 0 | PASS |
| Oversized pages (>150 KB HTML) | 2 | WATCH |
| Titles over 65 chars | 32 (was 30 yesterday) | WATCH |
| **Local repo sync** | **273 ahead / 32 behind origin, 391 uncommitted files** | **ACTION NEEDED** |
| **Credential hygiene** | **GitHub token in `.git/config` remote URL** | **ACTION NEEDED** |

**The live site is healthy.** Every content-integrity check passed.

---

## Notes

- **External links:** None are broken.
  - 403s are anti-bot responses from BigBlue (62), British Swim School (61), CDC (35), CPSC, AAP, USLA, AHA and doi.org.
  - All 151 429s came from goldfishswimschool.com rate-limiting the parallel check. A slow retry of 25 returned 200 every time.
  - All 20 503s are Amazon bot protection.
  - 4 SSL errors on ndpa.org come from the sandbox trust store, as in prior runs.
  - 2 "404s" are the `preconnect` hints to `fonts.googleapis.com` / `fonts.gstatic.com`. Bare origins return 404 by design, and fonts load normally.
- **Oversized pages:** `education/index.html` (369 KB) and `swim-lessons/directory/texas.html` (190 KB). Neither has changed. If the education hub keeps growing, consider paginating it.
- **Long titles (32):** mostly `education/*` printable and checklist pages. Google truncates titles at about 60 characters, so this is low priority.

## Still blocked: local repo out of sync (unchanged since 2026-09-22)

The Mac mini's local `live` (`0e211752b`) has diverged from `origin/live`:

- 273 commits exist only locally.
- 32 commits exist only on origin (up from 27 yesterday).
- About 391 files are uncommitted.

This run audited a fresh clone of `origin/live` in a temp folder and did not touch the local working tree. Resolving this needs a person. Suggested steps:

1. Back up the working tree.
2. Run `git fetch origin && git reset --hard origin/live`.
3. Re-apply anything that's still wanted.

The remote URL still contains a GitHub personal access token. Rotate it and switch to a credential helper.
