# New Content Validation — 2026-09-05

**Branch:** `live` @ `a4f053b3` (fresh /tmp clone reset to origin/live)
**Window:** commits in last 24h (12 commits, 747 HTML files touched)
**Result: PASS — no defects found, nothing pushed.**

## Scope

| Set | Count |
|---|---|
| HTML files touched in 24h | 747 |
| Education files touched | 515 |
| — printables (separate template family, excluded by design) | 95 |
| — `education/index.html` (hub, not an article) | 1 |
| **Articles validated** | **419** |
| **Genuinely NEW files (diff-filter=A)** | **2** |

New files: `swim-instructor-continuity-worksheet.html` + its `-printable.html`
(lead magnet shipped in `839003de`). The other 513 were touched by sitewide sweeps
(main.js cache-bust key, drowning-figure accuracy, FAQ apostrophe parity).

## Mandated structural checks — 419/419 PASS

All present: `main-layout`, `<main class="article">`, `article-header`,
`article-meta-item`, `article-body`, `article-excerpt`, styled breadcrumb
(`background: #f8fafc`), `main.css`, `article.css`, `GTM-5DN8B3QT`, `tldr-box`,
`FAQPage`, `sidebar`.

All banned patterns absent (0 hits each): `article-layout`, `article-main`,
`</article>`, `<main class="main-layout">`.

## Extended checks — all clean

- **JSON-LD:** 419/419 parse cleanly. Every page carries `Article` +
  `BreadcrumbList` + `FAQPage` + `Organization` + `ImageObject` +
  `SpeakableSpecification`; 39 also carry `HowTo`, 109 also `WebPage`, 1 `Dataset`.
- **Internal links:** 18,612 checked, **0 broken**.
- **Image alt text:** 0 `<img>` without `alt`.
- **Head integrity:** 0 meta tags with unbalanced quotes; 0 metas stranded in `<body>`.
- **Sitemap:** 419/419 articles present.
- **Header variants:** 3 across the set (344 / 76 / 1-printable) — all known.
  **Footer variants:** 2 (420 article / 1 printable) — matches the expected tripwire.

## New-file deep check

Both new files conform:
- Landing page uses header variant `18c942ff` (shared with 76 live articles), the
  standard article footer, canonical + og/twitter parity (title and description equal),
  indexable, in sitemap.
- Printable matches the dominant printable template on every axis: header
  `0674e965` (94/95 of the corpus), footer `33057b1b` (95/95), `noindex`, print button,
  GTM, canonical — and is **correctly absent from the sitemap** (92 of 95 printables are
  noindex + sitemap-excluded; the only 3 in-sitemap printables are the known
  outranking exceptions).
- Article schema `datePublished`/`dateModified` = 2026-09-04, matching the ship commit.

## Probe notes (false positives caught, not defects)

1. A literal `'"@type": "Article"'` string grep flagged 50 files. **False positive** —
   their JSON-LD is minified (`"@type":"Article"`). Re-run through a JSON parser:
   0 failures. Never test schema presence with a whitespace-sensitive grep.
2. A naive href resolver reported 420 files with broken links, all on `href="/"` —
   `os.path.normpath('')` yields `.`, not `index.html`. After fixing the root case:
   0 broken links.

## Actions taken

None required. No commits, no push.
