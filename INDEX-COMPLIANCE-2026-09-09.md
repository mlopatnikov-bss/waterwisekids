# Google Index Compliance — 2026-09-09

**Verdict: COMPLIANT. Zero defects on every auto-fixable axis. No commit, no push.**

Measured on a fresh full clone of `origin/live` @ `33aa3f73`
("[quality-assurance] Give the 12 unlabelled redirect-stub fallback links the aria-label…", 2026-09-08 20:18 -0400).
Audited the clone, never the mount.

---

## File census — 0 unexplained

| Bucket | Count |
|---|---|
| HTML files total | **771** |
| `noindex` | 97 (96 printables + `404.html`) |
| canonical-away redirect stubs | 23 |
| **primary (indexable, self-canonical)** | **651** |
| Unexplained | **0** |

Corpus grew 767 → 771 since the 09-07 sweep; every new file lands in an
explained bucket.

## Axis results

| Axis | Result |
|---|---|
| Sitemap ↔ canonicals − noindex | **exact**: 651 = 651, 0 drift in *both* directions |
| Sitemap completeness | 651/651 have `lastmod`, `changefreq`, `priority`; 0 dupes |
| Canonical present | 771/771 (0 missing, 0 multiple, 0 wrong host, 0 in `<body>`) |
| `robots.txt` | valid, `Allow: /`, correct absolute sitemap URL |
| JSON-LD | **2,256 blocks, 0 parse failures**, 0 missing required fields |
| JSON-LD host hygiene | 0 non-www, 0 `http://` |
| JSON-LD self-URL vs canonical | 0 contradictions |
| Titles / meta descriptions | 0 missing, 0 duplicates across the 651 |
| Meta description length (decoded) | 71–160 chars, median 149; 0 under 50 |
| Head integrity (per-attribute raw scan) | 0 odd-quote tags, 0 tag-inside-content, 0 body-level meta |
| Internal links | **35,468 refs, 0 broken** |
| Absolute self-links | 1,082 — all `https`, all `www`, all resolve |
| Redirect stubs | 23/23 refresh target == canonical == a file that exists |

Two recorded traps re-confirmed rather than assumed:

- The naive `rel="canonical"\s+href=` regex counted **648** vs the parser's
  **771** — the undercount is exactly **123**, as recorded. Attribute order
  splits this corpus; the audit used a parser throughout.
- Both sitemap `<url>` formats were parsed via block extraction, and the block
  count was asserted (651) rather than trusting a single-line regex.

## Deliberate non-defects (verified, left alone)

- **3 indexable printables** — `pool-safety-rules-printable`,
  `summer-safety-checklist-printable`, `swim-lesson-readiness-printable`.
  Confirmed still self-canonical and in the sitemap. These are the pages that
  outrank their own landing pages; conforming them to the 96-page `noindex`
  convention would surrender a page-1 slot. **Do not deindex.**
- **23 redirect stubs** indexable-but-canonical-away — all carry a matching
  meta refresh, so this is by design, not canonical drift.

---

## Needs Michael (unchanged — not auto-fixable)

**1. Live-HTTP verification is now structurally impossible from a scheduled run.**
This is the second consecutive run blocked, and the previously-planned
workaround has now closed too:

- `web_fetch` → *"URL not in provenance set"* (a scheduled task has no user
  message carrying the URL).
- Browser pane → access request **declined**; nobody is present to approve it.

So `http://` → `https://` redirect behaviour remains **unverified**, and the
open item "http variants are indexed by Google" is carried forward a third time
without measurement.

**Concrete fix — add these verbatim URLs to the task file's body**, which puts
them in the provenance set and unblocks `web_fetch` on the next run:

```
https://www.waterwisekids.com/
https://www.waterwisekids.com/sitemap.xml
https://www.waterwisekids.com/robots.txt
https://www.waterwisekids.com/education/drowning-prevention-guide.html
```

(A leaf page is included deliberately — the directory hub serves a stale edge
cache, so deploys must be verified on a leaf, never a hub.)

**2. Sitemap `lastmod` contradicts schema `dateModified` — now 193 of 651.**
Trend: 439 → 425 → 364 → 199 → **193**. Direction is still uniformly one-way
(193 ahead, **0 behind**), and **168** of them still sit on the single
`2026-08-29` batch date while their `dateModified` spreads across August. That
signature is a past blanket bump, not real edits. Not auto-fixed here, because
correcting it means re-deriving each date from a payload diff — a blanket
re-bump would just relabel the problem.

**3. Sitemap not downloaded by Google since April** — unchanged, 6th run.
Michael must resubmit in Search Console; the API token is `webmasters.readonly`
so this cannot be automated.

---

## Coverage boundary

This run covered indexation-facing signals in the **raw HTML of the clone**. It
did **not** cover: live HTTP status codes or redirect behaviour (blocked, above),
GSC coverage/CTR data, rendered-DOM differences, external link liveness, or
visual/CSS regressions. A clean result above is a statement about those axes
only.
