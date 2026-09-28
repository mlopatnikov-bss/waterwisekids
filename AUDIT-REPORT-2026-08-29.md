# Site Audit — waterwisekids.com — 2026-08-29

Audited a fresh `/tmp` clone reset to `origin/live` @ `9030751c` (749 HTML files, 640 sitemap URLs).
The mount was 12+ commits stale, as usual — not audited.

## Health summary

| Check | Result | Status |
|---|---|---|
| Broken internal links | 0 / ~40k hrefs across 749 pages | ✅ |
| Missing assets (css/js/img/srcset) | 0 | ✅ |
| Missing CSS references | 0 | ✅ |
| `<img>` missing `alt` attribute | 0 of 1,833 | ✅ |
| `<img>` missing width/height (CLS) | 0 | ✅ |
| JSON-LD parse errors | 0 | ✅ |
| JSON-LD non-www host drift | 0 | ✅ |
| Schema `image` URLs 404 | 0 | ✅ |
| Head `<meta>` leaked into `<body>` | 0 | ✅ |
| Pages with missing/duplicate `<title>` | 0 | ✅ |
| Pages with missing/duplicate meta description | 0 | ✅ |
| Meta description over 160 decoded chars | 0 | ✅ |
| Pages with ≠1 `<h1>` | 0 | ✅ |
| Sitemap URLs with no backing file | 0 of 640 | ✅ |
| Indexable pages absent from sitemap | 0 (23 excluded pages are redirect stubs) | ✅ |
| `noindex` pages wrongly in sitemap | 0 | ✅ |
| Cache-bust version drift | 0 — `main.css` uniform at `v=20260829a` (644 pages), `main.js` at `v=20260828c` (732) | ✅ |
| Live HTTP status, 14 key URLs | all 200; `/this-page-should-404` correctly 404 | ✅ |
| Deploy drift (live vs repo HEAD) | in sync — the only delta is Cloudflare's injected email-decode + insights beacon | ✅ |
| Today's commits verified live | prose links from `543057fa` present; all 3 sampled redirect stubs meta-refresh correctly | ✅ |
| Oversized assets | largest image 57 KB; 362 jpg / 14 MB total; CSS 281 KB | ✅ |
| Render-blocking scripts | 0 — `main.js` is end-of-body on all 732 pages | ✅ |

**All probes were canary-gated**: a deliberately corrupted page was injected and every
probe (broken link, missing asset, missing alt, JSON-LD, body-meta) fired on it before
the real sweep ran. Zero results mean zero defects, not a probe that never fires.

## Findings

### P1 — `http://www.waterwisekids.com` still serves 200 over plain HTTP

```
curl -I http://www.waterwisekids.com/   ->  HTTP/1.1 200 OK   (Server: cloudflare)
curl -I http://waterwisekids.com/       ->  HTTP/1.1 301 Moved Permanently
```

The bare domain redirects correctly; the `www` hostname does not. Every page is
therefore reachable over unencrypted HTTP as a duplicate of its HTTPS twin.

Confirms the standing open item — still broken as of today. Not fixable from a commit
(edge config is inert on GitHub Pages). **Needs Michael**: turn on *Always Use HTTPS*
in Cloudflare → SSL/TLS → Edge Certificates, or add a redirect rule covering
`www.waterwisekids.com`.

### P2 — 361 sitemap `lastmod` values now contradict the pages' own `dateModified`

This morning's commit `f387109f` reconciled stale schema `dateModified` on 394 pages —
correctly, and verified against real content diffs. But the same commit rewrote those
pages' sitemap `lastmod` to **2026-08-29** (3 → 397 entries dated today).

The only change those pages received was the schema date itself plus a visible
`Updated <date>` meta line. Result: on 361 URLs the two signals now disagree, e.g.

| URL | sitemap lastmod | schema dateModified |
|---|---|---|
| `/education/aed-water-emergencies.html` | 2026-08-29 | 2026-07-10 |
| `/benefits-of-swimming-for-kids.html` | 2026-08-29 | 2026-08-14 |
| `/adult-swimming-lessons.html` | 2026-08-29 | 2026-08-24 |

Only 40 pages had genuine content edits today (`543057fa`, `239b2e97`, `2fee64c4`);
the other 361 are metadata-only.

**Not auto-fixed — this needs a decision, not a sweep.** Both readings are defensible:
the visible body text *did* change (the `Updated` line), so `lastmod` = today is not a
fabrication; but announcing 394 changed pages to a crawler that then finds no
substantive diff spends lastmod credibility, and this site can least afford that given
the sitemap has not been downloaded by Google since April. Reverting 361 crawl signals
unilaterally is not something a nightly audit should do.

Recommended: have the reconciliation job stop bumping sitemap `lastmod` for
metadata-only passes, and set `lastmod` from the same verified content-change date it
already computes for `dateModified`.

### P4 — cosmetic, not fixed

- **727 pages**: the footer `logo-swimmer.svg` (second occurrence of the header logo)
  lacks `loading="lazy"`. Already in cache from the header paint — measurable benefit
  is ~nil, and it would mean touching every page in the repo. All 355 content-card
  images on the education hub are correctly lazy.
- `/education/swim-lesson-format-decision-worksheet.html` — title estimates at ~602px
  against the ~600px SERP cap. Inside the estimator's error bar; left for the growth job.
- `/education/index.html` is 342 KB (355 cards inline). Intentional hub design, images
  lazy, no inline CSS. Noted, not flagged.

## Actions taken

No commit pushed. Nothing surfaced this run was both a defect and safely
auto-fixable — the two real findings are an infrastructure toggle and a judgment call.

## Notes

- Sitemap still lists 640 URLs; robots.txt points at it correctly.
- Two Formspree endpoints in use by design: `mojpyqdo` (141 inline/lead-magnet forms)
  and `xzdkybrw` (`/contact/` only). Both present and well-formed.
- External-link re-probing skipped: the WAF returns 403/404 for a large share of live
  destinations, so a failure carries zero information.
- CSS regression + content validation jobs already ran today; not duplicated here.
