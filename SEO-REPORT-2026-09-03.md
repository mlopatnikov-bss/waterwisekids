# SEO Optimizer — 2026-09-03

Audited a fresh clone of `origin/live` (base `f9f45afc8`). 759 HTML files; 23 redirect stubs and
91 noindex pages excluded → **645 indexable pages** in scope.

## Baseline checks — all clean, no action

| Check | Result |
|---|---|
| Missing `<title>` | 0 |
| Duplicate `<title>` | 0 |
| Missing / empty `meta description` | 0 |
| Duplicate `meta description` | 0 |
| `meta` tags stranded in `<body>` (broken-head signature) | 0 |
| `<img>` with no `alt` attribute | 0 |
| Missing `canonical` | 0 |
| Canonicalized-away pages | 0 |
| Missing OG tag (`og:title/description/image/url/type`) | 0 |
| `og:url` on a non-canonical host | 0 |
| Relative `og:image` | 0 |
| Pages with no JSON-LD | 0 |
| JSON-LD that fails to parse | 0 |

The checks the task file names as its scope were already at zero. The finding below came from
looking at the **mirror** tags instead — the defect shape recorded after the 2026-08-22 pass.

## Fixed — stale social mirror tags (67 pages, commit `d8f2b1958`)

A `<title>` / `meta description` rewrite updates the primary tag and its `og:` mirror but leaves
`twitter:*` behind. Each stale tag is individually unique and well-formed, so every
uniqueness-based audit passes it.

**1. `twitter:title` ≠ `og:title` — 22 pages.** `og:title` matched the current `<title>` on 12/22;
`twitter:title` on 1/22 — so the twitter copy is the stale one. Several still carried the retired
`… | WaterWiseKids` title template (`education/bath-time-safety-infants.html`,
`education/lake-ocean-safety.html`).

**2. `twitter:description` ≠ `og:description` — 57 pages.** Breakdown: 20 where `og` already equalled
the meta description, 5 where `twitter` did, 32 where both mirrors predated a meta rewrite. Some
were visibly truncated mid-sentence (`…and a complete safety che...`), and some carried a retired
angle — `education/signs-of-drowning.html` served "symptoms that show up after swimming" to Twitter
while the page is about the Instinctive Drowning Response.

**3. `og:description` was a copy of `og:title` — 4 pages.** `teens/aquatics-careers.html`,
`teens/lifeguard-certification.html`, `teens/scholarships.html`, `teens/swim-instructor.html` all
served e.g. `"Swimming Scholarships - WaterWiseKids Teen Hub"` as both the OG and Twitter
description. Set both to the page's real meta description.

Syncing restores the site's own convention rather than inventing one: `twitter:title == og:title`
already held on 623/645 pages and `twitter:description == og:description` on 588/645.

### Not touched, deliberately

- **333 pages where `og:description` ≠ `meta description`.** Sampling shows distinct, purpose-written
  social copy, not drift — that is site-wide practice, not a defect.
- **`sitemap.xml` lastmod / JSON-LD `dateModified`.** No body text changed; a social-mirror edit is
  not a content revision.
- **Cache-bust keys.** No asset file changed.

## Verification

Re-ran every probe on the patched tree:

- `og:title == twitter:title` on **645/645**
- `og:description == twitter:description` on **645/645**
- `og:description == title` on **0** pages
- 67 changed files re-parsed: 0 metas stranded outside `<head>`, `og:description` and
  `twitter:description` present on all 67
- Full baseline table re-run: still all zeros

Deployed to `live` as `d8f2b1958`.

## Probe correction worth recording

The first run of the canonical check reported 623 "canonicalized-away" pages and silently skipped
them, which would have made every downstream count a near-zero over ~22 pages. Cause: the path
normaliser stripped `.html` from the file path but not from the canonical href, so a
self-canonical page compared unequal. Fixed, then confirmed the filter's cardinality (0) before
trusting any result — per the standing rule that an exclusion filter must have its cardinality
asserted.
