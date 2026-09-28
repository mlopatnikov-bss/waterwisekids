# Google Index Compliance — 2026-09-08

Measured on a fresh full clone of `origin/live` @ `09b85e044`; shipped as `8c6d9d785`.

## Corpus

| | |
|---|---|
| HTML files | 769 (+2 since 09-07) |
| Indexable | 650 |
| `noindex` | 96 (95 printables + `404.html`) |
| meta-refresh stubs | 23 |
| sitemap `<loc>` | 650 |
| JSON-LD blocks | 2031 (was 1980) |
| internal links scanned | 26,754 |

**Sitemap ↔ indexable set: exact match, 0 either way.**

## Status: PASS

Every previously-closed axis returned zero again, on the full corpus, not a sample:

- **sitemap** — duplicate `<loc>`, wrong host, URL with no file, indexable page
  missing, `noindex`/stub wrongly included, missing or malformed `lastmod`: all 0
- **canonical** — absent, multiple, empty, wrong host, in `<body>`, not self-referential: all 0
- **robots.txt** — present, `Allow: /`, sitemap declared, no `Disallow: /`
- **title / meta description / h1** across the 650 — missing, empty, duplicate,
  multiple, out-of-range, soft-404 title: all 0
- **head markup breakage** — per-attribute residue scan on every `<meta>`/`<link>`/`<title>`
  in every `<head>`. Canary-gated on both breakage shapes (embedded `"` and embedded `'`)
  before running: 0
- **JSON-LD** — 2031 blocks: unparseable, missing required fields on top-level nodes,
  FAQ Question/Answer integrity, BreadcrumbList position sequence, non-www host,
  404 breadcrumb target, future dates, `dateModified` before `datePublished`: all 0
- **links & assets** — broken internal href, wrong-host internal link, 404
  img/script/stylesheet/og:image/twitter:image, `og:url` ≠ canonical,
  og↔twitter title/description parity: all 0
- **23 meta-refresh stubs** — refresh target == canonical == a file that exists: 23/23

Only known-deferred item recurred: **11 duplicate-`h1` pairs** (the legacy-root ↔
`/swim-lessons/` city twins). Unchanged from 09-07, and a human call, not a defect.

## New axis opened this run

The auto-fixable raw-HTML surface has been closed since 09-07, so this run opened
three axes that had never been measured.

### 1. Rendered-DOM vs raw HTML for indexing signals — CLEAN, and now closed

Checked whether any script mutates an indexing-critical signal after load.
`site-nav.js` only toggles classes; `assets/js/main.js` (752 pages) touches only
`document.head.appendChild(style)` and a form-status message. No `document.title`,
no canonical rewrite, no meta-robots rewrite, no JSON-LD injection anywhere in the
corpus. **Rendered head == raw head on all 769 files**, so the raw-HTML probes above
are measuring what Googlebot resolves. No render pass needed.

### 2. Directory listings absent from structured data — FIXED

The 51 directory state pages render their school cards from `schools-data.js` via
`container.innerHTML`. The listings are therefore in **neither** the raw HTML **nor**
any JSON-LD node — the state pages carried `WebPage`, `WebSite`, `FAQPage` and
`BreadcrumbList` and nothing else. All 768 rows of the site's money product were
invisible to any consumer that does not execute JavaScript, and invisible to
structured-data consumers entirely. **0 of 51 pages had an `ItemList`.**

**Fixed:** each state page now carries an `ItemList` of its own listings —
`numberOfItems`, and one `ListItem` per school wrapping a `LocalBusiness` with
`name`, `url`, and `addressLocality`/`addressRegion`. Generated from the same
`schools-data.js` the cards render from, so the markup matches visible content
field for field. Verified after the write: **51 pages, 768 `ListItem`s, contiguous
positions 1..n, `numberOfItems` == length, every item has a name and an http url,
every block parses.**

### 3. Internal-link URL form vs canonical — FIXED

New check: every internal `<a href>` must resolve to its target's *canonical* URL,
not merely to a file that exists. Across 26,754 internal links this found
`advertise/index.html` linking `/contact/index.html` three times — a second
crawlable URL for a page whose canonical is `/contact/`. Repointed; the
corpus-wide residual sweep for internal `href=".../index.html"` is now **0**.

Two remaining hits are false positives: `href="https://www.waterwisekids.com"`
(bare origin, empty path) in the printable footer credit, which is the same URL
as the homepage canonical.

Also measured on this axis and **not** defects:
- **695 links into `noindex` pages** — all are article→printable links. Printables
  are a deliberately `noindex` template family; this is the intended shape.
- **3 indexable printables** (`pool-safety-rules`, `summer-safety-checklist`,
  `swim-lesson-readiness`) — deliberate, and confirmed against the GSC evidence
  from 09-03: `pool-safety-rules-printable` sits at position 9.6 while its own
  landing page sits at 47. Conforming them to the 95-page convention would
  surrender a page-1 slot. Left alone.
- **noscript listing count** ("All N *State* swim school listings are shown above")
  is a 13th count mirror nobody had checked. Verified against `schools-data.js`:
  **51/51 in sync.**

## Shipped

`8c6d9d785` → `origin/live`

- 51 directory state pages: `ItemList` structured data, 768 listings
- `advertise/index.html`: 3 CTAs repointed to `/contact/`

`sitemap.xml` `lastmod` deliberately **not** bumped — no visible body text changed
on any of the 52 files, and faking a freshness signal for a schema-only edit is
exactly the drift this site already tracks.

## Still needs Michael

1. **Sitemap not re-downloaded since April** — 650 URLs live, 97 announced. 85% of
   the corpus has never been announced to Google. Needs a manual resubmit in Search
   Console; the stored API token is `webmasters.readonly` and cannot do it.
2. **`lastmod` contradicts `dateModified` on 199 of 650 URLs** — uniform direction
   (sitemap ahead), 174 still pinned to the 2026-08-29 batch date.
3. **103 self-canonical city twins / 11 duplicate-h1 pairs** — a consolidation
   decision, not a defect.
4. **`http://` variants indexed** — still unverified. Live-HTTP checks remain
   impossible from a scheduled run: `web_fetch` refuses `waterwisekids.com` with
   *"URL not in provenance set"* because a scheduled task carries no user message
   bearing the URL. Carried forward for the sixth run.
