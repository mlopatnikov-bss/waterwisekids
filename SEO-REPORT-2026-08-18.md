# SEO Optimizer Report — 2026-08-18

Automated daily run. Base commit: `ef14440` (live).

## Scope

727 HTML files scanned with BeautifulSoup (never regex — see `seo_audit_use_parser`).
19 redirect stubs excluded from content checks. 75 noindex pages checked separately.

## Result: 0 defects found, 0 fixes required

### Core surface — all clean

| Check | Pages failing |
|---|---|
| Missing `<title>` | 0 |
| Duplicate `<title>` | 0 |
| Missing meta description | 0 |
| Duplicate meta description | 0 |
| Meta description overflow (decoded length >160) | 0 |
| Missing canonical | 0 |
| Missing/partial Open Graph (title, description, image, url, type) | 0 |
| Missing `twitter:card` | 0 |
| Missing JSON-LD schema | 0 |
| Malformed JSON-LD (parse failure) | 0 |
| Missing image `alt` | 0 |
| Missing/multiple `<h1>` | 0 |

### Deep checks — also clean

Article schema required fields (headline, datePublished, author, image), headline
length, relative schema/OG image URLs, `og:url` vs canonical mismatch, http:// in
canonicals, nested anchors (`a.find('a')`), identical duplicate JSON-LD blocks,
generic/filename alt text: **all 0**.

### Link & asset integrity — clean

Broken internal links, missing image/CSS/JS files, links pointing at redirect stubs,
orphan pages, hardcoded `http://waterwisekids.com` references: **all 0**.

### Sitemap — reconciles exactly

633 URLs. 727 files − 19 redirect stubs − 75 noindex = 633. No sitemap 404s, no
noindex pages listed, no indexable page missing, no http:// entries.

## Three flags investigated and dismissed as false positives

1. **75 "noindex + cross-canonical"** — all 75 verified self-canonical (printables +
   404). Correct as-is; documented in `noindex_canonical_conflict`.
2. **`404.html` — 3 identical alt values** — same logo SVG in nav, mobile nav, and
   footer. Correct.
3. **`education/switching-swim-schools-checklist.html` — FAQ schema without visible
   content** — the question *is* visible as an H2. Schema uses a straight apostrophe
   (`it's`), the heading uses `&rsquo;` (`it’s`), so naive substring matching missed
   it. Google normalizes this. No change made. Confirms the apostrophe gotcha noted
   in `faq_schema_visible_mismatch`.

## Open issue — requires Michael (not fixable in-repo)

**http:// still serves 200 with no HTTPS redirect.** Re-verified today:

- `http://www.waterwisekids.com/` → 200, no redirect
- `http://www.waterwisekids.com/statistics/state-of-drowning-prevention/` → 200, no redirect
- `http://waterwisekids.com/` → 301 → `http://www.waterwisekids.com/` (**still http** —
  the apex redirect funnels traffic *into* the duplicate)

Fix: Cloudflare → SSL/TLS → Edge Certificates → **Always Use HTTPS**. ~30 seconds.
Do **not** attempt this with a Pages Function (see `destructive_legacy_pages_middleware`).

Mitigation already in place: every affected page carries a correct `https://` canonical,
so most consolidation happens regardless. This is a leak, not a catastrophe — but
`/statistics/` is the flagship asset pitched for backlinks, and equity landing on an
http duplicate is the one thing the authority program can't afford.
