# Site Audit — waterwisekids.com — 2026-09-01

Audited a fresh `live` clone (base `04050bc6`), 755 HTML files. Shipped 1 fix as `1e9da2ff`.

## Health summary

| Check | Scope | Result |
|---|---|---|
| Broken internal links | 29,453 internal `<a href>` resolved | **0** |
| Broken assets (img/script/link/source/data-src) | all pages | **0** |
| Missing / empty `alt` | 1,848 images | **0** |
| JSON-LD parse errors | 2,159 blocks | **0** |
| Duplicate `id` attributes | 4,870 ids | **0** |
| `<meta>` stranded in `<body>` (broken head) | all pages | **0** |
| Missing/empty `<title>` | all pages | **0** |
| Missing canonical | all pages | **0** |
| Canonical → nonexistent target | all pages | **0** |
| `meta refresh` → nonexistent target | 23 stubs | **0** |
| `http://` or non-www URLs in head/schema | all pages | **0** |
| og:image / schema image → local 404 | all pages | **0** |
| Missing meta description | all pages | **0** |
| Sitemap `<loc>` with no backing file | 643 URLs | **0** |
| Duplicate `<loc>` / mixed host / mixed scheme | 643 URLs | **0** |
| Missing viewport / `lang` / charset | all pages | **0 / 0 / 0** |
| Multiple `<h1>` · nested `<a>` · unbalanced block tags | all pages | **0 / 0 / 0** |
| Formspree endpoints (static only) | 200 forms | **0 unknown IDs** |
| Soft-404 / placeholder titles / lorem-ipsum | all pages | **0** |

## Fixed this run

**Stale cache-bust key on `schools-data.js` — 52 directory pages.** `1e9da2ff`

On 2026-08-22 two broken outbound school URLs were repaired in
`swim-lessons/directory/schools-data.js` (Waterworks Aquatics Torrance, EmBe
Aquatics). The file changed but its cache-bust key did not — all 52 state
directory pages still requested `schools-data.js?v=20260406`, a URL the edge had
been caching since April. Returning visitors kept getting the pre-fix file and
kept hitting both dead links, ten days after the fix "shipped."

Bumped to `?v=20260901b` on all 52 pages. Verified on a fresh clone of `live`:
0 residual `20260406` references, 52 pages on the new key.

Used `b` rather than `a` because commit `40e4fe87` already published `20260901a`
for other assets today.

### Cache-bust key audit (full sweep of the class)

Every versioned asset was checked for the same defect — key older than the file's
last content change:

| Asset | File last changed | Key | |
|---|---|---|---|
| `schools-data.js` | 2026-08-22 | `20260406` | **was stale — fixed** |
| `main.js` | 2026-09-01 | `20260901a` | ok |
| `m-app.css` | 2026-09-01 | `20260901a` | ok |
| `printable-checklist.css` | 2026-09-01 | `20260901a` | ok |
| `main.css` | 2026-08-30 | `20260830a` | ok |
| `local-pages.css` | 2026-08-30 | `20260830v` | ok |
| `printable-poster.css` | 2026-08-30 | `20260830a` | ok |
| `special-needs` / `teens-hub` / `advertise` / `gear.css` | 2026-08-31 | `20260831a` | ok |
| `article.css` · `teens.css` · `swimmers-hub` · `education-hub` | ≤2026-08-28 | `20260828d` | ok |
| `m-app.js` | 2026-07-28 (created) | `20260413` | ok — see watch item |

## Open items — need Michael

1. **Sitemap `lastmod` contradicts schema `dateModified` on 357 of 643 URLs.**
   Unchanged from the previously logged count (356). Only 100 URLs agree. Not
   auto-fixed: `lastmod` must be reclassified per-URL from the last real body-text
   diff, never blanket-bumped.
2. **186 sitemap URLs have no `dateModified` in schema at all** — includes the
   ~141 directory pages already in the pipeline.
3. **Sitemap still not being fetched by Google since April** (token is read-only;
   requires a manual resubmit in Search Console). Combined with item 1 this is why
   `lastmod` corrections are not moving anything.
4. **214 pages hotlink `og:image` from `images.pexels.com`.** Down from 396, so
   the migration is progressing. A presence check cannot detect these breaking —
   only a live probe can, and external probing is unreliable behind the WAF.

## Watch items — no action taken

- **`m-app.js` is pinned to a fixed literal key `?v=20260413` inside `main.js`.**
  Not stale today (the file was created 2026-07-28 and has not changed since), but
  it is a two-layer key: if `m-app.js` is ever edited and only `main.js`'s own
  outer key is bumped, the edit ships inert. Same shape as the bug fixed above.
- **70 pages skip a heading level** (mostly `h2 → h4` inside card lists). Low
  severity; not auto-fixed because heading rewrites need a corpus-wide duplicate
  check first.
- **`education/index.html` is 345 KB** — the only file over 300 KB, and roughly 3.5×
  the next largest page. It is the 418-guide hub, so the size is structural, but it
  is the site's heaviest first paint.

## Notes on method

- Three initial "defects" were confirmed false positives and dismissed: 738 pages
  of "content stranded after `</footer>`" (the probe walked footer descendants —
  the copyright block is inside it), and unbalanced `<main>`/`<div>` on 3 pages
  (the extra opening tag is text inside a CSS comment).
- Formspree was **statically** validated only: 144 × `mojpyqdo`, 1 × `xzdkybrw`,
  55 action-less JS-handled forms, 0 unknown IDs, 0 missing `method=post`, 0
  missing email input, 0 pages promising "check your inbox." **Zero live POSTs —
  no submissions consumed, no notification emails.**
- The 23 HTML files absent from the sitemap were each verified to be redirect
  stubs (meta refresh + canonical away, all targets resolving). Correctly excluded.
- All work was done in a `/tmp` clone; no git commands were run against the
  mounted repo.
