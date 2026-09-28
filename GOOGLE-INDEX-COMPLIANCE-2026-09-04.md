# Google Indexing Compliance — 2026-09-04

**Status: PASS with 2 owner-action blockers (both unchanged).**
Audited a fresh clone of `origin/live` at `82ab010` → shipped `fb43340`. GitHub Pages build `fb43340` completed successfully (28.4s, no errors).

Scope: 761 tracked HTML files, 646 sitemap URLs, 35,853 resolved internal references, 8,700+ JSON-LD nodes.

---

## Fixed and deployed

**19 redirect stubs carried three conflicting self-identity signals.** Each of the 23 canonicalized-away stubs sets `<link rel="canonical">` and `og:url` to its destination — but 19 of them also carried a `WebPage`/`CollectionPage` JSON-LD node whose `url` pointed at *the stub's own address*. So one page told Google "I am /education/toddler-water-safety.html" twice and "I am /are-infant-swim-lessons-safe.html" once. Aligned the JSON-LD `url` to the canonical, matching the `og:url` convention already present on the same pages.

The 4 remaining stubs carry a JSON-LD node with no `url` field at all — no contradiction, left alone.

**31 breadcrumbs pointed position 2 at a redirect stub.** 31 legacy root articles carried `BreadcrumbList` → `{"name":"Articles","item":".../articles.html"}`. `/articles.html` is itself a meta-refresh stub canonicalized to `/education/`, so every one of those breadcrumb trails resolved through a non-canonical hop. Repointed to `/education/` and relabelled `Articles` → `Education`, which is the sitewide majority label for that node (460 existing uses vs. 256 "Water Safety Education").

This mattered because HTML anchors were already clean — **zero** `<a href>` anywhere on the site points at a stub. The defect survived only inside structured data, which the anchor sweep is blind to.

Both edits were surgical exact-string replacements, not re-serializations: 49 files, 50 insertions, 50 deletions, every file a 1-line change except one with 2. Reversing each edit reproduces the original byte-for-byte (asserted programmatically), and every JSON-LD block was re-parsed after the write.

Metadata-only pass, so sitemap `lastmod` and schema `dateModified` were deliberately **not** bumped.

---

## Clean — no action

| Check | Result |
|---|---|
| sitemap.xml well-formed | 646 `<url>`, 0 duplicate `<loc>`, all `www` host |
| `lastmod` sanity | 646/646 present, 0 malformed, 0 in the future |
| Every sitemap URL resolves to a real file | 0 unresolved |
| Indexable pages missing from the sitemap | 0 |
| Non-indexable pages leaking *into* the sitemap | 0 |
| The 115 files outside the sitemap | fully explained: 92 `noindex` (91 printables + `/404.html`), 23 meta-refresh stubs. 0 unexplained |
| Printable `noindex` convention | 91/94 noindexed; the 3 exceptions are the known printables that outrank their landing pages — deliberate |
| robots.txt | `Allow: /`, declares the correct absolute sitemap URL |
| Canonicals | 761/761 present, 0 wrong host, 0 non-https, 0 pointing at a non-existent path, 0 self-mismatches outside the stub set |
| Redirect stubs | 23/23 refresh target exists **and** equals the canonical |
| Titles / meta descriptions | 646/646 present, 0 duplicate descriptions across the indexable set |
| Meta tags stranded in `<body>` (broken-head tripwire) | 0 |
| Unescaped quotes in head attributes | 0 (probe canary-tested — the `body_meta` tripwire alone is **blind** to this on this template family; see note below) |
| JSON-LD parse | 0 syntax errors across every block |
| JSON-LD host hygiene | 0 non-www, 0 non-https waterwisekids URLs |
| Required schema fields | 0 missing across Article, FAQPage, HowTo, BreadcrumbList, Organization, WebSite |
| `headline` ≤110 chars | 0 violations |
| Indexable pages with no JSON-LD | 0 |
| Broken internal links | **0** across 35,853 resolved refs (`a`, `link`, `img`, `script`, `source`, `iframe`) |
| `og:image` / `twitter:image` targets | 0 missing files; 0 indexable pages without an `og:image` |
| `<html lang>` | 761/761 present |
| Soft-404 title patterns on 200 pages | 0 |

**Probe note worth keeping.** The standing tripwire for unescaped quotes in `<head>` is "assert 0 metas in `<body>`". I canary-tested it by injecting `content="Best 6" pool fence…` into a live page: lxml recovers, the meta stays in `<head>`, and the tripwire reads clean while the description is silently truncated to `Best 6`. Replaced it with a raw-source attribute-residue scan that does fire on that mutation (canary confirmed). Sitewide result is still 0 — but the old probe was not earning its keep.

---

## Blocked on Michael — both re-confirmed today, both unchanged

**1. Google has not fetched the sitemap since 2026-04-07.** Re-queried through the Search Console API this morning:

| sitemap | last downloaded | URLs Google saw |
|---|---|---|
| `https://www.waterwisekids.com/sitemap.xml` | **2026-04-07** | **97** |
| `https://waterwisekids.com/sitemap.xml` (stale apex) | 2026-04-05 | 51 |

The live sitemap has **646** URLs. Roughly 85% of the site has never been announced through this channel. I attempted the resubmit `PUT` again; it returned **403**, and the token's granted scope reads back as exactly `webmasters.readonly` — a scope limit, not a transient failure. **This needs Michael to either resubmit the sitemap by hand in Search Console, or re-issue the OAuth credential with `webmasters` (read-write) scope.** It is the single highest-leverage item on the site.

For context on what that costs: over the last 28 days (2026-08-04 → 2026-09-01) only **432 distinct pages** drew any impression at all, against 646 in the sitemap — 156 clicks on 21,406 impressions.

**2. Six `http://` (non-TLS) URLs are still drawing impressions.** Google continues to surface non-HTTPS variants of five education articles plus `/do-swim-lessons-reduce-drowning-risk.html`. No apex (`https://waterwisekids.com`) variants remain, so that half has resolved. The `http://` half needs the Cloudflare "Always Use HTTPS" toggle, which is Michael's to flip.

---

## What I could not verify

Live-site fetch under a Googlebot user-agent was **not** performed this run — the browser pane requires a per-site approval the scheduled run cannot grant, and `web_fetch` refused the URLs as outside its provenance set. Everything above is verified against the deployed commit and the GitHub Pages build record rather than against a live HTTP response. The Search Console API calls did succeed, so the two blocker numbers are live.

*Local mount is stale relative to `live` (drift on ~all HTML and CSS) — audited the clone, as standing practice requires.*
