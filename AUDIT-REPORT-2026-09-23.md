# Site Audit — waterwisekids.com

**Date:** 2026-09-23
**Audited revision:** `origin/live` @ `3c26896` (what is actually deployed — fresh clone, not the local working tree)
**Pages scanned:** 805 HTML files
**Commits pushed:** none — nothing needed fixing on the deployed site

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
| Sitemap dead entries | 0 of 668 URLs | PASS |
| Sitemap duplicates / noindex pages listed | 0 / 0 | PASS |
| Sitemap coverage gaps | 0 | PASS |
| Sitemap freshness | newest `lastmod` 2026-09-23 | PASS |
| External links — real 404/410/DNS failures | 0 of 999 | PASS |
| External links — bot-blocked (403/503) | 209 (CDC, CPSC, AAP, USLA, Goldfish, Foss…) | INFO — not broken |
| Files over 400 KB | 0 | PASS |
| Oversized pages (>150 KB HTML) | 2 | WATCH |
| Titles over 65 chars | 30 (was 47 yesterday) | WATCH |
| **Local repo sync** | **273 ahead / 27 behind origin** | **ACTION NEEDED** |
| **Credential hygiene** | **GitHub token in `.git/config` remote URL** | **ACTION NEEDED** |

**The live site is healthy.** Every content-integrity check passed.

---

## Notes

- **External links:** 213 non-OK responses, all explainable: 200× 403 and 9× 503 are
  anti-bot responses to automated requests (government/medical sites and competitor
  location pages). 4× SSL errors on ndpa.org are a sandbox trust-store gap — the
  certificate is valid (GlobalSign, expires Feb 2027) and the site responds.
- **Oversized pages:** `education/index.html` (368 KB) and
  `swim-lessons/directory/texas.html` (191 KB). Unchanged from prior runs; consider
  paginating the education hub if it keeps growing.
- **Long titles (30):** mostly `education/*` printable/checklist pages. Google truncates
  around 60 chars; low priority.

## Still blocked: local repo out of sync (unchanged from 2026-09-22)

The Mac mini's local `live` (`0e211752b`) has diverged from `origin/live`: 273 local-only
commits, 27 origin-only commits (up from 20 yesterday as the cloud agents keep
shipping), plus ~384 uncommitted files. This run audited a fresh clone of `origin/live`
in a temp folder and left the local working tree untouched. Suggested resolution (needs
a human): back up the working tree, `git fetch origin && git reset --hard origin/live`,
then re-apply anything still wanted.

The remote URL also still embeds a GitHub personal access token — recommend rotating
it and switching to a credential helper.
