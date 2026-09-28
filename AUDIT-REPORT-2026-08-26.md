# Site Audit — waterwisekids.com — 2026-08-26

Audited a fresh `live` clone at `2ed5261` (743 HTML files, 637 sitemap URLs).
Fixes shipped as **`6889f7a`**, deploy confirmed, and residue re-checked against the live site.

## Health summary

| Check | Scope | Result | Status |
|---|---|---|---|
| Broken internal links | 36,280 `<a href>` on 743 pages | **0** | 🟢 |
| Live HTTP status | 637 sitemap URLs | **637/637 → 200** | 🟢 |
| Redirect hops (internal) | 637 live URLs | **0** extra hops | 🟢 |
| Soft-404s (200 + error body) | 637 live pages | **0** | 🟢 |
| Thin pages (<4 KB served) | 637 live pages | **0** | 🟢 |
| Missing assets (css/js/img/icon) | 5,754 local refs | **0** | 🟢 |
| `<head>` integrity (unescaped-quote class) | html5lib parse, 743 pages | **0** metas/canonicals leaked to `<body>` | 🟢 |
| JSON-LD parse errors | 2,136 `ld+json` nodes | **0** | 🟢 |
| Duplicate JSON-LD `@type` per page | 743 pages | **0** | 🟢 |
| Missing / empty `alt` | 1,826 `<img>` | **0** | 🟢 |
| Missing `width`/`height` (CLS) | 1,826 `<img>` | **0** | 🟢 |
| Meta description missing / empty / >165ch | 743 pages (decoded length) | **0** | 🟢 |
| Duplicate meta descriptions | 743 pages | **0** | 🟢 |
| Canonical coverage + targets resolve | 743 canonicals | **743/743**, 0 dangling | 🟢 |
| Canonical chains (A→B→C) | 743 canonicals | **0** | 🟢 |
| `og:image` / `twitter:image` assets exist | 1,486 refs | **0** missing | 🟢 |
| `<html lang>` | 743 pages | **0** missing | 🟢 |
| Sitemap dead entries / noindex leakage | sitemap.xml | **0** / **0** | 🟢 |
| Unsubstituted `__PLACEHOLDER__` | raw source | **0** | 🟢 |
| Formspree endpoints malformed | all forms | **0** | 🟢 |
| Oversized images (>400 KB) | all assets | **0** | 🟢 |
| Below-fold `loading="eager"` / `fetchpriority` | 743 pages | **0** | 🟢 |
| **Dead external citation URLs** | 307 distinct URLs | **3 → fixed** | 🟡→🟢 |
| **External redirect hops** | 307 distinct URLs | **19 links → fixed** | 🟡→🟢 |

## Fixed and pushed (`6889f7a`) — 23 files, 27 URL occurrences

**CDC reorganized `/drowning/facts/` → `/drowning/data-research/facts/`, and the migration was left half-finished.** 293 links on the site use the new path; 21 were still on the old one. Two other CDC URLs had rotted independently.

| Old URL | Status | Links | New URL |
|---|---|---|---|
| `/drowning/facts/index.html` | **404** | 6 | `/drowning/data-research/facts/` |
| `/model-aquatic-health-code/php/index.html` | **404** | 1 | `/model-aquatic-health-code/php/about/index.html` |
| `/healthy-swimming/prevention/swimmers-ear.html` | **404** | 1 | `/healthy-swimming/prevention/preventing-swimmers-ear.html` |
| `/drowning/facts/` | **301 hop** | 19 | `/drowning/data-research/facts/` |

These sit on drowning-prevention and swimmer-safety articles — the pages where an authoritative CDC citation does the most work. A 404 on the primary source is the worst kind of dead link on this site.

Replacement targets were each confirmed **200 with a full page body** before the swap, replacements were applied **longest-URL-first** so the trailing-slash form couldn't clobber the `index.html` form, and anchor text was re-read against every new destination (`CDC — Drowning Facts`, `CDC — Model Aquatic Health Code`, `CDC — Healthy Swimming: Swimmer's Ear` — all still accurate). Residue check run against the **live site** after deploy: 0 dead URLs remaining, 0 pages missing the new URL, across all 23 pages.

### Why this was invisible to every prior audit

Past runs bucketed all ~114 cdc.gov non-200s as "WAF bot-blocking, known false positive." That was mostly right and it hid three real 404s.

**CDC's WAF returns 403 based on request *rate*, not on the URL.** A 16-thread sweep gets 403 for nearly everything; a slow sequential probe with full browser headers gets true status codes. Proof from this run: `/drowning/data-research/facts/` returned a verified 200 with a real page body, and the identical request 20 minutes later returned a 443-byte 403 block page. The status code from a fast sweep carries no information either way.

**Detection recipe:** never conclude "dead" *or* "fine" from a bulk external-link sweep against a WAF host. Re-probe every non-200 sequentially with ~4 s spacing and a full browser header set (`Sec-Fetch-*`, `Accept-Language`, `Upgrade-Insecure-Requests`). Where the WAF locks you out entirely, `WebSearch` + `web_fetch` reads the page through a sanctioned path and confirms both liveness and the correct replacement URL.

## Reviewed, not defects

- **4 PA town twins** (`beginner-swim-lessons-{ambler,elkins-park,flourtown,glenside}-pa.html`). These serve ~640 words at 200 with a cross-canonical whose target shares only **0–3%** of their sentences, no `noindex`, no meta-refresh, 0 inbound links, absent from the sitemap. That looks exactly like a broken consolidation — it is instead the **deliberate 2026-08-19 merge design**: cross-canonical plus a visible "now merged" routing link, with `noindex` intentionally omitted because pairing it with a cross-canonical risks deindexing the target. Left alone. *(I measured containment, not Jaccard — Jaccard's 0.22 was an artifact of the 14 KB vs 23 KB size gap and would have been the wrong basis for a decision either way.)*
- **19 other legacy stubs** carry `meta-refresh` + canonical, 0 inbound links, correctly excluded from the sitemap. The 23-page "missing from sitemap" signal resolves entirely into these two classes — 19 refresh stubs + 4 held twins. 0 unexplained.
- **13 pages with no `<h1>`** — the same ~3 KB refresh stubs. By design.
- **9 duplicate `<title>` pairs** — every one is a stub mirroring its canonical destination's title. By design.
- **3 `ndpa.org` SSL errors.** `openssl s_client` returns `Verification: OK, return code 0`. The sandbox CA bundle lacks the intermediate; the cert chain is valid. Sandbox artifact, not a dead link.
- **90 remaining external 401/403/429** — WAF noise on britishswimschool.com, amazon.com and others, spot-checked as above.

## Watch

- **`/aquatic-jobs/` renders 38 words** — "No jobs posted yet." It's a 64 KB file whose listings are JS-injected from the jobs API, and that API is a known open issue (dead Apps Script / 503). Until it's restored, this is an empty-state page sitting in the sitemap inviting Google to index it. Worth either fixing the API or pulling the URL from the sitemap; I didn't act because that's a product decision, not a defect. `/contact/` at 134 words is thin but appropriate for its purpose.
- **`education/index.html` is 339 KB** (up ~2 KB from 337 KB on 08-25) with 353 images — still the largest payload on the site by ~10×, still growing. All images lazy and dimensioned, so runtime cost stays contained, but the raw HTML keeps creeping.

## Notes on method

Parsed with **html5lib** rather than regex so a stray unescaped `"` in a meta would surface as content leaking into `<body>` instead of silently passing a presence check. Every sweep carried canary assertions (link/img/JSON-LD/meta/asset counts must be non-zero, parse count must equal page count) so a probe that silently matches nothing fails loudly rather than reporting a clean bill of health. External checks used GET, never HEAD. `lastmod` was **not** bumped — these are citation-target changes, not content updates — and no cache-bust was needed since no CSS or JS changed.
