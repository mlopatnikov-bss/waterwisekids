# Content Validation Report — 2026-08-29

**Scope:** education articles touched in the last 24h on `live`
**Audited revision:** `f387109` (fresh clone, not the mount)
**Result: PASS — 0 defects. No fixes needed, no push made.**

---

## 1. What changed in 24h

16 commits touched **501** education HTML files, but almost all of that
volume is one sitewide metadata sweep (`f387109`, the Article `dateModified`
reconciliation across 394 pages). Classifying by diff rather than by commit
subject:

| Class | Count |
|---|---|
| Genuinely **new** pages | **2** |
| Metadata / schema-only touches | ~499 |
| Printables + `education/index.html` (excluded per validator policy) | 89 |
| **Articles structurally validated** | **412** |

New pages this cycle:

- `education/swim-lesson-format-decision-worksheet.html` (guide)
- `education/swim-lesson-format-decision-worksheet-printable.html` (printable pair)

## 2. Structural template checks — 412/412 pass

All 13 required markers present and all 4 banned patterns absent on every
article. **0 failures, 0 files affected.**

Required: `main-layout`, `<main class="article">`, `article-header`,
`article-meta-item`, `article-body`, `article-excerpt`, styled breadcrumb,
`main.css`, `article.css`, `GTM-5DN8B3QT`, `tldr-box`, `FAQPage`, `sidebar`.
Banned: `article-layout`, `article-main`, `</article>`, `<main class="main-layout">`.

## 3. Deep parser sweep — 412 files

Grep-level clean, so the run escalated to a parsed audit (html5lib for
head/body, lxml for `<script>` text). All clean:

- **Head integrity:** 412/412 with zero `<meta>` leaking into `<body>` — no unescaped-quote head breakage.
- **Canonical, meta description, `og:title` / `og:description` / `og:url` / `og:image`:** present on all.
- **`<title>` present and non-empty; exactly one `<h1>`:** all pass.
- **JSON-LD:** every block parses; `Article`, `FAQPage` and `BreadcrumbList` present on all 412.
- **Host drift:** 0 non-www `waterwisekids.com` URLs inside JSON-LD (the `2fee64c` normalization is holding).
- **Image `alt`:** no missing attributes.
- **`<nav>` / `<footer>`:** present on all.
- **Sitemap:** every validated article has an entry (640 URLs total, 416 under `/education/`).

## 4. Internal links — 17,598 checked, 0 broken

Every relative and root-relative `href` resolved against the tree
(direct file, `.html` extension, and directory-index forms).

## 5. FAQ schema ↔ visible heading — 0 real mismatches

The naive comparison flagged **52** across 24 files. All 52 were false
positives, in three distinct classes worth recording:

1. **Emoji-prefixed headings** — `🤝 What Is Adaptive Aquatics?` vs schema `What is adaptive aquatics?`. Needs Unicode symbol stripping, not just case folding. (36 hits)
2. **Ordinal-numbered headings** — `swim-lesson-faqs.html` numbers its h2s `1.`–`15.`; the schema text is the same question without the ordinal. Authoring convention, not a defect. (15 hits)
3. **Question answered in the `<h1>`** — `what-is-the-model-aquatic-health-code-mahc.html` carries `What is the Model Aquatic Health Code (MAHC)?` in the h1 rather than an FAQ h2. (1 hit)

After normalizing for all three and running an answer-presence probe
(8-word sliding window starting at word 5, to avoid the lead-in false-positive
trap), the residual is **0** — every schema question's answer text is
genuinely rendered on its page.

## 6. New-content-specific checks — both new pages pass

- **Cache-bust:** new pages carry `main.js?v=20260828c` / `*.css?v=20260828d`, matching the sitewide current version — they did not miss the bump.
- **Link starvation:** the new magnet has 6 inbound links from 6 pages, **5 of them prose links inside `.article-body`** (plus one hub card). Not launch-starved.
- **Indexation:** guide is indexable and in the sitemap with `lastmod 2026-08-28`; printable correctly carries `robots: noindex` and is correctly absent from the sitemap.
- **Schema dates:** `datePublished` = `dateModified` = `2026-08-28`, matching the actual git content date.

---

## Verdict

No corrective action taken because none was warranted. The corpus is
structurally clean at both grep and parser depth, and the two new pages
shipped compliant — correctly cache-busted, correctly linked, correctly
indexed.

**One note for the next run:** the FAQ heading comparator needs the emoji /
ordinal / h1 normalization described in §5 baked in. Without it this check
reports a 52-item false-positive backlog every single day.
