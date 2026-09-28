# SEO Optimizer — 2026-08-31

**Corpus:** 753 HTML pages (fresh clone of `live` @ `3bbcc94`) · 642 indexable · 88 noindex · 23 redirect stubs
**Shipped:** `97152a1` → `live`, verified on production.

---

## Fixed

### JSON-LD publisher/author logo used an unsupported image format (102 pages, 104 refs)

`publisher.logo.url`, `author.logo.url`, and bare `Organization.logo` pointed at
`/assets/images/icons/logo-swimmer.svg`. The file exists and returns 200, so every
presence-and-parse audit passed it — but Google's structured-data image requirements accept
only **.jpg / .png / .gif**. SVG is silently ignored, which suppresses logo display in rich
results and Knowledge Panel eligibility.

Repointed to `/assets/images/waterwisekids-og.png` (1200×630 PNG, HTTP 200).

**Scoping tripwire:** the same SVG is the legitimate nav/footer `<img>` logo in **1473**
places across the corpus. Edits were confined to `<script type="application/ld+json">`
block text; asserted post-fix that JSON-LD occurrences went 104 → 0 while UI occurrences
held at exactly 1473. All 2154 JSON-LD blocks still parse.

Distribution before: 82 SVG / ~157 PNG / rest omit logo. Now unified — 480 blocks on the PNG.
This closes the follow-up left open on 2026-08-19.

---

## Audited clean — no action

Presence checks are all at zero and stayed there:

| Check | Result |
|---|---|
| Missing / duplicate meta descriptions | 0 / 0 |
| Meta description length (decoded, 70–160) | 0 out of band |
| Missing `alt` attributes | 0 |
| `alt` over 125 chars | 0 |
| Missing OG tags (title/desc/image/url/type) | 0 |
| Missing `og:image:alt`, `twitter:card` | 0 |
| Invalid or absent JSON-LD | 0 / 0 |
| Missing title, missing h1, multiple h1 | 0 / 0 / 0 |
| `<meta>` stranded in `<body>` (broken head) | 0 |

Second-order checks, all zero:

- **On-domain URL resolution** — 6486 URLs from JSON-LD, canonical, `og:image`,
  `twitter:image`, `og:url` resolved against a 1322-file disk index (handling
  `/foo/`→`index.html` and `/foo`→`foo.html`). **0 non-resolving.**
- **Host/scheme hygiene** — 0 apex-host (`waterwisekids.com`) and 0 `http://` URLs in schema.
- **`og:url` vs `<link rel=canonical>`** — 0 disagreements.
- **`Article` required fields** (headline, datePublished, dateModified, author, publisher, image) — 0 incomplete.
- **`BreadcrumbList` presence** (recursive, catches nesting under `WebPage`) — 0 missing.
- **FAQ schema** — 627 pages / 2952 questions. 0 missing `mainEntity`, 0 missing `name`,
  0 missing `acceptedAnswer.text`, 0 questions absent from visible content.

---

## Two probe artifacts caught before they became bad edits

Both initially looked like real defect classes. Neither was.

**1. "105 FAQ answer paraphrases" on 84 pages — false.**
The visible answer matched the schema answer verbatim. The probe normalised ` — ` to a
*double* space in the page-text haystack (em-dash → `-` → stripped, leaving the spaces on
both sides) but built the needle from `.split()`, which collapses to a single space. Every
answer containing an em-dash mismatched. Fixed by collapsing whitespace after character
stripping → 105 → 0. Had this been trusted, 105 correct schema answers would have been
rewritten to match text they already matched.

**2. "2 questions visible but not a heading" — false.**
The heading set was `h2|h3|h4|summary|p>strong|button`. Both questions were the page `<h1>`.

**3. Undercount, corrected mid-run.** The first sweep's regex found 82 SVG logo pages;
a JSON-path walk of the parsed objects found **102** — the regex `"logo"\s*:\s*\{[^}]*"url"`
missed `author.logo.url` and bare-string `Organization.logo`. The walk count is what shipped.

---

## Carried forward (needs Michael — unchanged from prior runs)

- **Sitemap not downloaded since April** — Google has seen 97 of 640 URLs. Deploy token is
  read-only; requires manual resubmission in Search Console.
- **`sitemap.xml` lastmod contradicts schema `dateModified`** on 356 URLs (`f387109f`).
- **`http://` variants indexed** — needs the redirect toggle flipped.
- **Jobs API returning 503.**
