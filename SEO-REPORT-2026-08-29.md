# SEO Optimizer Report — 2026-08-29

**Commit:** `2fee64c4` on `live` · verified live over HTTPS
**Scope:** 749 HTML files tracked · 636 indexable (113 excluded: 89 printables, 23 redirect stubs, 404.html)

## Fixed

### 1. Non-www URLs inside JSON-LD — 23 refs across 6 pages
Schema `url`, `@id`, and `BreadcrumbList` `item` values pointed at `https://waterwisekids.com`
while each page's own `<link rel=canonical>` is `https://www.waterwisekids.com`.
Confirmed non-www returns **301** → breadcrumb items carried redirect chains into rich
results, and `@id` split the page entity across two hosts.

| Page | refs |
|---|---|
| `aquatic-jobs/index.html` | 3 |
| `education/teaching-kids-safe-pool-entry.html` | 5 (HowToStep urls) |
| `swimmers-hub/backstroke-complete-guide.html` | 3 |
| `swimmers-hub/breaststroke-complete-guide.html` | 4 |
| `swimmers-hub/butterfly-complete-guide.html` | 4 |
| `swimmers-hub/freestyle-complete-guide.html` | 4 |

Replacement was scoped to `<script type="application/ld+json">` blocks only — verified
zero occurrences existed outside them before editing. All blocks re-parsed after the edit.

### 2. Over-length alt text — 4 images on `education/index.html`
Screen readers truncate around 125 characters. All four card images exceeded it.
Trimmed on **decoded** length (source uses `&mdash;` entities, which is why a naive
literal match failed first):

| Image | before | after |
|---|---|---|
| `swim-lesson-format-decision-worksheet.svg` | 146 | 123 |
| `swim-school-policy-fine-print-checklist.svg` | 144 | 120 |
| `swim-lesson-annual-cost-worksheet.jpg` | 130 | 111 |
| `water-safety-activities-at-home.svg` | 133 | 121 |

**Sitemap `lastmod` deliberately not bumped** — both changes are metadata-only, no prose
payload change.

## Clean — verified, not assumed

Probes were canary-tested against a synthetic defective page first, so a zero here means
the check fired and found nothing.

| Check | Result |
|---|---|
| Missing / duplicate / body-scope meta descriptions | 0 |
| Missing canonical, `og:title/description/image/url/type`, `og:image:alt`, `twitter:card/image`, `og:image:width` | 0 |
| Images missing `alt` (1,643 alts checked) | 0 |
| Invalid JSON-LD | 0 |
| `og:url` ≠ canonical | 0 |
| Schema image URLs 404 — incl. GET-probe of all 17 external Pexels URLs | 0 |
| FAQ schema question/answer not present in visible copy (quote-normalized, lead-in window slid) | 0 |
| Duplicate FAQ questions, breadcrumb position gaps, missing breadcrumb names | 0 |
| `schema.headline` vs `<h1>` drift · multiple `<h1>` | 0 |

## Investigated and rejected — do not "fix" these

- **`mainEntityOfPage` absent on 290 Article nodes / `publisher.logo` on 281.**
  Both are recommended-only, and Google dropped the publisher-logo requirement for
  Article rich results. Not worth a 280-file churn commit. Note the site runs two
  publisher-logo variants (`waterwisekids-og.png` ×91, `icons/logo-swimmer.svg` ×78) —
  **needs your call** before anyone standardizes.
- **Bare `https://www.waterwisekids.com` (no trailing slash) in JSON-LD — 303 files.**
  I applied this normalization, saw the blast radius, and reverted it. The bare domain
  does not redirect and is not a defect; rewriting `@id` values Google has already
  resolved is a needless risk for zero gain.
- **3 hub pages flagged as missing `BreadcrumbList`** (`education/`, `swimmers-hub/`,
  `aquatic-jobs/`). False positive in my walker — they nest it correctly under the
  WebPage `breadcrumb` property. Correct schema; leave alone.
- **Duplicate alt "WaterWiseKids" on all 636 pages** — header + footer logo. Convention.
- **`schema.description` ≠ meta description on 347 pages** — same deliberate pattern as
  the known `og:description` divergence.

## Open for you

- **273 meta descriptions estimated over the ~920px desktop SERP width** (all ≤165 chars,
  so within the site's own char standard). Pixel estimate is approximate; worth a
  dedicated pass if snippet truncation matters more than the char rule.
- **3 titles over ~600px:** `education/back-to-school-swim-lesson-checklist.html` (604),
  `education/swim-lesson-format-decision-worksheet.html` (626),
  `scholarships/index.html` (601).
- **`og:locale` absent on all 636 pages** — uniform, cheap to add, but a 636-file commit.
  Not doing that unattended.
- Two publisher-logo variants (above).
