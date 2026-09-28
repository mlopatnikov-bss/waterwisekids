# New Content Validation — 2026-08-30

**Audited:** fresh `/tmp` clone reset to `origin/live` @ `6011a8ee`
(mount's local `live` was 10 days stale at `2476831c` — audited the clone, not the mount)
**Result:** ✅ PASS — no defects found, nothing pushed.

---

## Scope

`git log --since="24 hours ago" --name-only` returned **734 HTML files** — almost all of
them collateral from sitewide sweeps (cache-bust, internal linking, nav rail fix), not new
content. Isolated genuine new content with `--diff-filter=A`:

| Added in last 24h | |
|---|---|
| `education/sick-day-swim-lesson-decision-guide.html` | new article |
| `education/sick-day-swim-lesson-decision-guide-printable.html` | new printable |
| `assets/images/cards/sick-day-swim-lesson-decision-guide.svg` | new card art |

Also deep-checked the 3 education pages rewritten by the AEO pass (`cddd7941`) and the
prior day's new article `swim-lesson-format-decision-worksheet.html`.

---

## 1. Structural battery — 413/413 article pages clean

Ran the full 17-check contract (main-layout, `<main class="article">`, article-header,
article-meta-item, article-body, article-excerpt, styled breadcrumb, main.css, article.css,
GTM, tldr-box, FAQPage, sidebar + 4 banned patterns) across **every** education article,
not just the new ones — sitewide sweeps touched all of them, so this doubles as a
regression check.

```
--- checked 413 article pages, 0 with findings ---
```

**Printables excluded** (89 files) — they are a different template class and the article
battery flags all of them as broken by design. Validated against a peer-printable contract
instead: noindex ✓, printable stylesheet ✓, GTM ✓, self-canonical ✓, absent from sitemap ✓.

**Canary gate:** battery fired 8/8 on the new printable, confirming the checks are live and
not silently passing. Cardinality reconciles: 413 articles + 89 printables + index = 503.

## 2. New article — deep pass

| Check | Result |
|---|---|
| Title / meta description / OG set | complete |
| Title pixel width | 381px (well under the ~580px SERP cut) |
| Canonical | self, www host |
| Sitemap entry | present, `lastmod 2026-08-29` |
| `dateModified` vs visible "Updated" | both `2026-08-29`, no drift |
| Article + FAQPage + BreadcrumbList JSON-LD | all present, parse clean |
| Schema `headline` vs H1 | match |
| FAQ schema ↔ visible | 8/8 questions have visible h3 counterparts, 0 orphans |
| Image alt text | all present |
| Internal links (51) | all resolve |
| `og:image` / schema image | resolve on disk |
| Meta tags stranded in `<body>` | none (no unescaped-quote head break) |
| Cache-bust | `main.css?v=20260829c`, `article.css?v=20260828d` |

Header markup variant shared with 68 peers; footer variant shared with 410 peers — both
land in the majority bucket, no chrome drift.

## 3. Cache-bust uniformity — sitewide

```
645/645 pages   main.css?v=20260829c
413/413 pages   article.css?v=20260828d
```

Perfectly uniform. The `article.css` key trailing `main.css` by a day is correct — that
sheet wasn't touched in the 08-29 pass, so no bump was due.

## 4. Chrome variant tripwire

7 header variants (matches the established count). 3 footer variants, which resolves to
the expected **2** real ones: article footer (411) and printable footer (89). The third
"variant" is 3 pages that differ from the majority only in leading indentation — byte
difference, zero rendered difference. Not a defect.

## 5. Live deployment verified same run

Did not take the repo state as evidence of what ships:

```
200  /education/sick-day-swim-lesson-decision-guide.html
200  /education/sick-day-swim-lesson-decision-guide-printable.html
200  /assets/images/cards/sick-day-swim-lesson-decision-guide.svg
```

Live HTML carries main-layout, `<main class="article">`, article-body, sidebar, tldr-box,
FAQPage, GTM and the current cache-bust key. Live `sitemap.xml` lists the article.

## 6. Resolved — previously open ⚠️

**`free-reduced-swim-lessons-make-a-splash.html` duplicate divergent FAQ block is gone.**
The page was carrying two FAQ blocks with diverging answers, one stranded below
`.related`. It now has exactly 1 `FAQPage` JSON-LD block and 10 question headings with
zero duplicates. The 08-30 AEO pass cleared it.

---

## Probe false positives caught before they became "fixes"

Two findings from the first pass were **my probe's bugs, not the site's** — worth recording
so the next run doesn't chase them:

1. **"51 broken internal links"** on every page — the link resolver joined root-relative
   hrefs (`/about/`, `/education/`) against the *file's* directory instead of the repo
   root, so it looked for `education/about/index.html`. Corrected resolver: **0 broken
   links** across all five pages. Canary confirms the fixed resolver still detects a real
   404.
2. **"8 FAQ schema questions with no visible counterpart"** — the visible-question corpus
   was scoped to `.article-body`, but the FAQ block on these pages lives *outside* it.
   Widened to `<body>`: **0 orphans** on all five pages.

Following either at face value would have rewritten correct markup.

## Not assertable

`cdc.gov/drowning/data-research/facts/` and `cdc.gov/healthy-swimming/about/index.html`
return **403** to the sandbox. That is a WAF response and carries zero information about
whether the URL is live — not reported as broken. The first is cited by 322 other pages and
the second by 2, so both are established citations rather than something this article
introduced. The two non-CDC sources return 200.

---

## Actions taken

**None required.** No files modified, no push to `live`. Workspace cleanup completed.
