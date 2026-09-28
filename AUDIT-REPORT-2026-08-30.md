# Site Audit — waterwisekids.com — 2026-08-30

Audited a fresh `/tmp` clone of `origin/live` @ `d38dcbe` (751 HTML files, 641 sitemap URLs).
The mount was stale (`2476831c`, ~10 days behind) — not audited.

## Health summary

| Check | Result | Status |
|---|---|---|
| Broken internal links | 0 real / 751 pages | ✅ |
| Broken assets (src/srcset) | 0 | ✅ |
| Missing CSS references | 0 | ✅ |
| `<img>` missing `alt` | 0 | ✅ |
| `<img>` missing width/height (CLS) | 0 | ✅ |
| JSON-LD parse errors | 0 | ✅ |
| JSON-LD non-www host drift | 0 | ✅ |
| Schema `image` URLs 404 | 0 | ✅ |
| `og:image` / `twitter:image` 404 | 0 | ✅ |
| Head `<meta>` leaked into `<body>` | 0 | ✅ |
| Missing/duplicate `<title>` | 0 | ✅ |
| Missing/duplicate meta description | 0 | ✅ |
| Meta description > 160 decoded chars | 0 | ✅ |
| Meta `content` unparsable (unescaped quote) | 0 | ✅ |
| Pages with ≠1 `<h1>` | 0 | ✅ |
| Canonical: count / host / scheme / 404 / points-away | 0 / 0 / 0 / 0 / 0 | ✅ |
| `og:url` ≠ canonical | 0 | ✅ |
| Missing `lang` / `viewport` | 0 / 0 | ✅ |
| Soft-404 or placeholder text (`TODO`, `{{…}}`, lorem) | 0 | ✅ |
| Redirect stubs with dead targets | 0 of 23 | ✅ |
| Sitemap URLs with no backing file | 0 of 641 | ✅ |
| Indexable pages absent from sitemap | 0 | ✅ |
| `noindex` pages wrongly in sitemap | 0 | ✅ |
| Render-blocking `main.js` in `<head>` | 0 of 734 | ✅ |
| Oversized assets | largest image 57 KB; 452 files / 14.3 MB | ✅ |
| Live HTTP, 10 key URLs | all 200; bogus URL correctly 404 | ✅ |
| Deploy drift (live vs repo HEAD) | `main.css` and `main.js` byte-identical | ✅ |
| **Cache-bust chain integrity** | **BROKEN — fixed this run** | 🔧 |

**Every probe was canary-gated.** A deliberately corrupted page was injected before each
sweep; all 11 structural probes and all 13 deep probes fired on it with cardinality 1,
and the stub probe detected a synthetic dead target. Zero results mean zero defects,
not a probe that never fires.

## Findings

### P1 — FIXED: today's `main.js` edit shipped under yesterday's cache key

Commit `d112f95` (this morning) modified `assets/js/main.js` — bumping the mobile
stylesheet it injects from `m-app.css?v=20260827a` → `?v=20260830a`. But `main.js`
itself was still referenced by all 734 pages as `?v=20260828c`, unchanged since 08-28.

The chain therefore failed at its first link:

```
page  → main.js?v=20260828c   ← cached by returning visitors, never re-fetched
          └─ old cached copy still requests m-app.css?v=20260827a
```

A returning mobile visitor keeps executing the 08-28 `main.js`, which asks for the
*pre-fix* mobile stylesheet. Today's mobile CSS work — `d112f95` (header/footer gutter
alignment), `d38dcbe` (body content rail pin), `eca0a5e` (tablet-band WCAG target-size
and 16px input floor) — was invisible to exactly the audience it was written for, since
`m-app.css` only loads at ≤768px. The bump was inert.

**Fixed** in `5ca7f16`: `main.js?v=20260828c` → `?v=20260830b` across all 734 pages.
Asserted exactly 734 occurrences before and after, zero residuals of the old token,
and that `20260830b` had never been used for `main.js` in any branch (no collision).
Distinct from `main.css`'s `20260830a` so grep-verification stays unambiguous.

Verified live after the Pages build: `/`, `/education/`, `/education/water-safety-basics.html`
and `/swim-lessons/directory/` all serve `?v=20260830b`, and that URL returns 200.

Sitemap `lastmod` deliberately **not** touched — a query-string change is chrome with
zero content diff.

**Root cause worth fixing upstream:** a version string that lives *inside* a
cache-busted asset can only take effect if that asset's own key is bumped in the same
commit. Nothing currently enforces that. Suggest a pre-commit check: if
`assets/js/main.js` is in the diff, its `?v=` token in the HTML must also be in the diff.

### P1 — `http://www.waterwisekids.com` still serves 200 over plain HTTP

```
curl -I http://www.waterwisekids.com/   ->  HTTP/1.1 200 OK   (Server: cloudflare)
curl -I http://waterwisekids.com/       ->  HTTP/1.1 301 Moved Permanently
```

Unchanged from yesterday and the days before. The bare domain redirects; the `www`
hostname does not, so every page has an unencrypted duplicate. Not fixable from a
commit — edge config is inert on GitHub Pages.

**Needs Michael:** Cloudflare → SSL/TLS → Edge Certificates → *Always Use HTTPS*, or a
redirect rule covering `www.waterwisekids.com`.

### P2 — sitemap `lastmod` vs schema `dateModified`: 421 pages disagree

Yesterday's finding persists and grew slightly. 377 of the 421 carry `lastmod=2026-08-29`
from the metadata-only reconciliation pass; the rest are older drift.

New this run, and the more interesting half: **`ead221c` added contextual prose links to
18 education guides today, and only 1 of the 18 had either date signal moved to 08-30.**

| Page | sitemap lastmod | schema dateModified |
|---|---|---|
| `education/lake-house-water-safety-families.html` | 2026-08-29 | 2026-07-29 |
| `education/fall-swim-schedule-planner.html` | 2026-08-29 | 2026-08-03 |
| `education/safe-diving-rules-kids.html` | 2026-08-23 | 2026-06-20 |
| `education/swimming-when-sick-kids.html` | 2026-08-30 | 2026-08-30 ✅ |

So same-day commits are being treated inconsistently: the AEO rewrite (`cddd794`, 3
pages) correctly moved both signals to 08-30, the prose-link pass moved neither on 17
of 18 pages.

**Not auto-fixed.** Whether a single inserted anchor inside existing prose is a
"modification" worth announcing is a judgment call, and given the sitemap has not been
downloaded by Google since April, announcing 17 marginal changes has near-zero upside.
Moving crawl signals on 17–421 URLs unilaterally is not something a nightly audit
should do. Flagged for the growth job to settle as one policy rather than per-commit.

### P4 — noted, not fixed

- `education/index.html` is 342 KB (355 inline cards). Intentional hub design; images
  lazy, no inline CSS.
- 53 "broken links" reported by the raw scan are all `${school.website}`-style JS
  template literals inside `<script>` blocks on the directory pages — confirmed all 53
  occurrences vanish when scripts and comments are masked. Zero real broken hrefs.

## Actions taken

Pushed `5ca7f16` to `live`: cache-bust `main.js` v=20260828c → v=20260830b, 734 files,
one line each. Verified live.

## Notes

- Cache-bust versions are otherwise uniform per asset: `main.css` 20260830a (645),
  `article.css` 20260828d (417), `printable-checklist.css` 20260830a (88),
  `local-pages.css` 20260830v (17), `m-app.css` 20260830a (via `main.js`).
- Three older `main.js?v=` tokens found in the repo are inside archived markdown
  reports, not shipped HTML.
- External-link re-probing skipped again: the WAF returns 403/404 for a large share of
  live destinations, so a failure carries zero information.
- CSS regression and content validation jobs already ran today; not duplicated here.
