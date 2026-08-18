# Google Index Compliance Report — 2026-08-18

**Site:** https://www.waterwisekids.com
**Branch audited:** `live` @ `91786d4` (fresh clone, 727 HTML files)
**Result:** ✅ **PASS — no in-repo defects found. No code changes required.**

---

## Scorecard

| Check | Result |
|---|---|
| Sitemap valid XML / parses | ✅ 633 URLs, 0 duplicates, 127 KB (limit 50 MB) |
| Sitemap host + scheme consistent | ✅ 100% `https://www.waterwisekids.com` |
| noindex pages leaked into sitemap | ✅ 0 |
| Sitemap URLs with no backing file | ✅ 0 |
| Indexable pages missing from sitemap | ✅ 0 (19 excluded = redirect stubs, correct) |
| `lastmod` missing / malformed / future-dated | ✅ 0 / 0 / 0 |
| robots.txt correct + live | ✅ `Allow: /` + sitemap directive, no managed override |
| `X-Robots-Tag` header interference | ✅ none on any sampled URL |
| Pages missing canonical | ✅ 0 |
| Multiple / http:// / non-www canonicals | ✅ 0 / 0 / 0 |
| **noindex + cross-canonical conflict** | ✅ 0 (75 noindex pages all self-canonical) |
| JSON-LD parse errors | ✅ 0 across 727 pages |
| JSON-LD missing required fields | ✅ 0 |
| Duplicate top-level schema types | ✅ 0 |
| **FAQPage schema without visible Q&A** | ✅ 0 (Google policy check) |
| Missing `<title>` / meta description | ✅ 0 / 0 |
| Meta description >160 chars | ✅ 0 |
| Duplicate meta descriptions | ✅ 0 |
| Broken internal links | ✅ 0 (resolver sanity-verified) |
| Links pointing at redirect stubs (hops) | ✅ 0 |
| Orphan indexable pages (0 inbound links) | ✅ 0 |
| Missing local assets (css/js/img) | ✅ 0 |
| Nested `<a>` inside `<a>` | ✅ 0 |
| Missing `<html lang>` / viewport / H1 | ✅ 0 / 0 / 0 real pages |
| Multiple H1 | ✅ 0 |
| Live URL sample (25 random sitemap URLs) | ✅ 25/25 → HTTP 200 |
| Live canonical matches repo | ✅ 5/5 spot-checked |
| Deploy freshness (live vs `live` branch) | ✅ identical (only Cloudflare email-obfuscation delta) |

**Page accounting balances exactly:** 633 sitemap + 75 noindex + 19 redirect stubs = 727 HTML files. No page is unaccounted for.

---

## Open issue requiring Michael (unchanged, ~30 seconds)

### 🔴 `http://` still serves HTTP 200 — no redirect to HTTPS

```
curl -I http://www.waterwisekids.com/statistics/state-of-drowning-prevention/
→ 200 OK   (should be 301 → https://)
```

Verified again today. The apex→www 301 works (`https://waterwisekids.com/` → 301), but the **scheme** redirect does not exist. This lets Google index `http://` duplicates of pages — including the flagship `/statistics/state-of-drowning-prevention/` report — splitting authority between two URL sets.

**Fix:** Cloudflare dashboard → waterwisekids.com → **SSL/TLS → Edge Certificates → "Always Use HTTPS" → ON.**

This cannot be fixed from the repo. GitHub Pages does not emit scheme redirects, `_headers`/`_redirects` are Cloudflare-Pages-only features that are inert on this stack (confirmed: no `Strict-Transport-Security` header is being served), and a Pages Function would reintroduce the edge-rewriting risk class that was deliberately neutralized on 2026-08-16.

---

## Observations (no action taken)

**1. Local repo mount is 3 commits behind `live`.**
`/Users/bss/Documents/Claude/Projects/WATERWISEKIDS.COM` HEAD = `7a3f219b` (2026-08-15); `origin/live` = `91786d4` (2026-08-17). The stale `.git/index.lock` that caused the 8/16 outage is **gone** — but the deploy loop is still not syncing the mount. Agents are publishing successfully via fresh-clone + direct push (yesterday's 08-17 report is on `live`), so nothing is blocked; the mount is just a stale mirror. Two reports are stranded there uncommitted: `AUDIT-REPORT-2026-08-16.md`, `INDEX-COMPLIANCE-REPORT-2026-08-16.md`.

**2. Cloudflare IS rewriting markup at the edge — benignly.**
Live HTML differs from the repo in exactly one way: Cloudflare's Email Address Obfuscation converts the footer `mailto:` into a JS-decoded `/cdn-cgi/l/email-protection` link. Harmless for indexing (the email simply isn't crawlable), but worth recording since site policy assumes zero edge markup rewriting.

**3. `_headers` targets a file that doesn't exist.**
The only rule in `_headers` is a cache directive for `/styles.css`, which returns 404 and is referenced by 0 pages. Dead config. Left in place — zero SEO impact and edge-config edits carry more risk than the cleanup is worth.

**4. 72 titles exceed 65 characters** (4 exceed 75; longest is 79 on `education/bath-time-safety-infants.html`). This is a CTR/truncation matter, not an indexing defect — leaving it to the growth loop, which owns title rewrites against live GSC CTR data rather than character count alone.

---

## Method notes

- Audited a **fresh clone of `live`**, not the workspace mount, which is 3 commits stale.
- All HTML parsed with BeautifulSoup/lxml (never regex) per established practice.
- Link resolver was sanity-tested against a known-fake path before trusting its 0-broken result.
- Schema duplicate detection counts **top-level `@graph` nodes only** — a naive recursive walk falsely reports 517 "duplicate Organization" hits, because publisher Organization is legitimately nested inside every Article.
- FAQ-vs-visible-body check normalizes smart quotes, en/em dashes, HTML entities, and non-breaking spaces before matching, which otherwise produce false positives.
- 12 pages carry body-located (not head) JSON-LD. All are valid and non-duplicative — known-good, deliberately not "fixed."
