# Google Index Compliance Report — 2026-08-17

**Site:** waterwisekids.com  **Branch:** live  **Pages scanned:** 725 HTML (706 real + 19 redirect stubs)

## Status: PASS — 1 open item requiring Michael

| Check | Result |
|---|---|
| sitemap.xml well-formed | PASS (valid XML, 632 URLs) |
| All indexable pages in sitemap | PASS (0 missing) |
| No noindex pages in sitemap | PASS (0 of 74 noindex pages listed) |
| No sitemap entries without a file | PASS (0 orphans) |
| robots.txt correct | PASS (`Allow: /`, sitemap declared, AI crawlers unblocked) |
| Canonical present on every page | PASS (0 missing) |
| Canonical self-referential / correct | PASS (0 mismatches) |
| Canonical uses https | PASS (0 http:// canonicals in repo) |
| noindex + cross-canonical conflict | PASS (0 — regression from 2026-08-15 stays fixed) |
| JSON-LD parses | PASS (0 syntax errors across 706 pages) |
| JSON-LD coverage | PASS (0 pages without structured data) |
| FAQPage schema matches visible content | PASS (0 violations — 2026-06 fix holds) |
| Meta description present | PASS (0 missing) |
| Meta description length | PASS (0 overflow, 0 too short) |
| Title present | PASS (0 missing) |
| H1 present, exactly one | PASS (0 missing, 0 duplicate) |
| Broken internal links | PASS (0) |
| Redirect-hop internal links | PASS (0 — 2026-08-14 fix holds) |
| Orphan pages (0 inbound links) | PASS (0) |
| sitemap.xml reachable over https | PASS (200) |
| robots.txt reachable over https | PASS (200) |
| **http:// redirects to https://** | **FAIL — see below** |

## Structured data coverage
BreadcrumbList 701 · FAQPage 613 · Article 514 · WebPage 182 · HowTo 34 · Dataset 3 · Organization 2 · LocalBusiness 2 · CollectionPage 2 · WebSite/Report/ItemList/WebApplication/AboutPage/ContactPage 1 each

## Fixed this run
Two titles whose pre-brand portion exceeded 60 characters were truncating in SERPs. Trimmed (title + og:title + twitter:title kept in sync; visible H1 and breadcrumb JSON-LD deliberately untouched so structured data still matches rendered text):

- `/education/backyard-pool-fence-requirements.html` — 67 → 62 chars
  `Backyard Pool Fence Requirements: Height, Gates & Compliance (2026)` → `…Height, Gates & Code 2026`
- `/education/swim-instructor-questions-checklist.html` — 62 → 56 chars
  `Questions to Ask Your Child's Swim Instructor (Free Printable)` → `…(Printable)`

`lastmod` updated for both in sitemap.xml.

## OPEN — needs Michael (30 seconds, not fixable from the repo)

**http:// still serves 200 with no redirect to https://.** Verified again today:
```
curl -I http://www.waterwisekids.com/                                    → HTTP/1.1 200 OK
curl -I http://www.waterwisekids.com/statistics/state-of-drowning-prevention/ → HTTP/1.1 200 OK
```
Google can index the http:// variant as a separate URL. Six pages including the flagship annual report are already indexed that way. Every on-page canonical correctly points to https, which limits the damage, but the duplicate URLs stay crawlable until this is closed.

**Fix:** Cloudflare dashboard → waterwisekids.com → SSL/TLS → Edge Certificates → toggle **"Always Use HTTPS"** on. This is an edge setting; there is no repo-side equivalent (and per standing policy this site does no edge markup rewriting).

## Advisory — no action taken

- **15 titles run 66–70 characters total** but their pre-brand portion is ≤60, so only the `| WaterWiseKids` suffix truncates. Google routinely drops the brand suffix itself; rewriting keyword-bearing titles for this is higher risk than reward. Left as-is.
- **Mount is 12 commits behind `origin/live`.** The workspace mount at `/WATERWISEKIDS.COM` sits at `7a3f219b`; remote live is at `1ab5e299`. The Mac Mini deploy loop is not pulling remote commits back down, so anything written to the mount would ship stale. The 2026-08-16 `.git/index.lock` blocker is gone (verified absent), so the loop's original failure is cleared — but it still is not syncing. This run published via fresh clone + direct push, which is unaffected.
