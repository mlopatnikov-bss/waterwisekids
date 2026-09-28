# Google Index Compliance — 2026-08-26

**Status: PASS (1 defect found and fixed).** Audited a fresh clone of `origin/live` @ `47ee582`; shipped as `43eab8c`, verified live.

Scope: 743 HTML files, 637 sitemap URLs, 6,619 JSON-LD nodes, all internal links.

## Fixed and deployed

**8 stale `<lastmod>` dates in sitemap.xml** — these pages received real payload changes in commits `6df8688` and `47ee582` on 2026-08-25, but their sitemap dates still read 2026-08-09 → 2026-08-24. Google had no signal to recrawl them.

| URL | was | now |
|---|---|---|
| `/education/` | 2026-08-24 | 2026-08-25 |
| `/education/pool-chemistry-basics-for-parents.html` | 2026-08-21 | 2026-08-25 |
| `/education/recreational-water-illness-prevention.html` | 2026-08-18 | 2026-08-25 |
| `/education/pool-code-brown-closures-explained.html` | 2026-08-24 | 2026-08-25 |
| `/education/cloudy-pool-water-safety-signal.html` | 2026-08-20 | 2026-08-25 |
| `/education/pool-skills-vs-open-water-transfer.html` | 2026-08-22 | 2026-08-25 |
| `/education/teaching-kids-safe-pool-entry.html` | 2026-08-09 | 2026-08-25 |
| `/education/daycare-school-water-safety-questions-checklist.html` | 2026-08-24 | 2026-08-25 |

Each was classified by **payload diff**, not by git-touch — cache-buster (`?v=`) and lastmod-only lines were excluded, so no date was bumped without a real content change behind it. Dates were set to the actual commit date (2026-08-25), not to today.

Verified on the live sitemap after deploy: all 8 correct, 637 URLs, parses clean.

## Clean — no action needed

| Check | Result |
|---|---|
| Sitemap parse / duplicate `<loc>` / future dates | 637 URLs, 0 dupes, 0 future |
| Sitemap entries with no corresponding file | 0 |
| Missing canonical | 0 |
| `noindex` pages leaking into sitemap | 0 |
| Missing `<title>` / missing meta description | 0 / 0 |
| Duplicate titles among indexable pages | 0 |
| Duplicate meta descriptions among indexable pages | 0 |
| JSON-LD parse errors | 0 |
| Schema missing required fields | 0 |
| FAQ questions absent from visible page text | 0 |
| Duplicate FAQ `name` values | 0 |
| FAQ empty `acceptedAnswer` | 0 |
| HTML entity leaks inside JSON-LD | 0 |
| Schema `image` URLs resolving to 404 | 0 |
| Malformed schema dates | 0 |
| `speakable` selectors matching nothing | 0 |
| **Broken internal links** | **0** |
| Metas or canonicals escaped into `<body>` (broken `<head>`) | 0 |
| Unsubstituted template placeholders | 0 |
| robots.txt | valid, `Allow: /` + correct Sitemap directive |
| Formspree endpoints (`mojpyqdo`, `xzdkybrw`) | both 200, CORS echoes `www.waterwisekids.com` |

Yesterday's FAQ-node cleanup (`47ee582`) holds: 2,902 `Question` nodes across 628 `FAQPage` blocks, zero duplicates, zero invisible.

## Verified false positives — do not "fix" these

- **23 canonical mismatches / 23 orphans / 23 sitemap omissions** — one class, not three. These are the legacy redirect stubs (`/about.html`, `/how-to-*.html`, `/beginner-swim-lessons-*.html`, etc.). They correctly point canonical at their live replacement and are correctly excluded from the sitemap and the link graph. Counts match exactly across all three signals.
- **82 `headline` ≠ `<h1>` drifts** — all 82 are printables, where the schema headline carries "(Printable)" and the on-page H1 does not. This is house convention. The count rose from 81 because the Pool Water Quality Checklist shipped yesterday.
- **43 "placeholder" hits** — a regex artifact, not a defect. `__[A-Z_]+__` includes `_` in its own character class, so it matches the underscore write-in blanks on printable worksheets (`________`). Re-run with `__[A-Z][A-Z0-9_]*__`: zero real placeholders sitewide.
- **140 title-length outliers, 23 meta descriptions at 159–160 chars** — SERP truncation cosmetics, within normal bands. Not an indexing issue.
- **55 forms with no `action`** — by design; they're handled by the JS fetch-to-Formspree path.

## Flagged for Michael — needs a decision, not a code change

**`http://` still serves 200 without redirecting to `https://`.** Confirmed again today: `http://www.waterwisekids.com/index.html` returns 200 at the http URL rather than a 301.

New detail this run: **the site is served through Cloudflare, not raw GitHub Pages** (`server: cloudflare` fronting `x-github-request-id`; Cloudflare also rewrites the footer email into its obfuscation script). So this is **not** the GitHub Pages "Enforce HTTPS" checkbox — it's the Cloudflare toggle at **SSL/TLS → Edge Certificates → Always Use HTTPS**. One switch.

Impact is currently contained: every page carries a correct `https://www.` canonical, so Google consolidates rather than splitting. Worth closing anyway.

## Note on the Google sitemap ping

The task asks to "ping Google." Google **retired** the `google.com/ping?sitemap=` endpoint in June 2023 — it returns 404 today (confirmed this run). There is no replacement API. Discovery now runs entirely through the `Sitemap:` directive in robots.txt (present and correct) and Search Console. Nothing is being missed; the ping step is simply obsolete and I'm no longer treating its failure as a finding.

---
*Audited against a fresh clone of `origin/live`. The mounted working copy is stale (last commit 2026-08-20) and has a stranded `.git/index.lock` the sandbox cannot remove, so the fix was committed and pushed from the clone.*
