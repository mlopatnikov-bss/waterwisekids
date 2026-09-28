# SEO Optimizer Report — 2026-08-21

## Fixes applied (515 pages, additive only, 0 deletions)

| Fix | Pages | Detail |
|---|---|---|
| `og:image:width` + `og:image:height` added | 510 | 457 @ 1200x630, 53 @ 600x360 — every value read from the actual image file header or the Pexels URL's own `w=`/`h=` params. No estimated dimensions. |
| `twitter:title` + `twitter:description` added | 5 | Copied verbatim from each page's `og:title`/`og:description` raw attribute values, preserving existing entity escaping. |

Pages skipped deliberately: 19 meta-refresh redirect stubs (no `og:image:alt` anchor, cross-canonicalled, absent from sitemap, zero inbound internal links) and `404.html`.

## Baseline audit — all clean (731 files, 78 noindex)

`no_title` `no_meta_desc` `no_canonical` `jsonld_broken` `jsonld_none` `faq_issues`
`article_issues` `img_no_alt` `img_empty_alt` `og_missing` `meta_desc_long`
`meta_desc_short` `dup_meta_desc` — **all 0**.

Second-order checks also returned 0: canonical 404s, og:image 404s, schema image/URL 404s,
breadcrumb target 404s and position gaps, multi-canonical, relative or http canonicals,
future/inverted article dates. The 2026-08-21 FAQ answer-text fix holds — 0 schema answers
failed the content-word overlap test against visible page text.

## Open findings — NOT auto-fixed (need a judgement call)

1. **53 education pages ship a 600x360 `og:image`** (`/assets/images/cards/*`), below the
   1200x630 social-card recommendation. Cards will render small on Facebook/LinkedIn.
   Dimensions are now declared honestly; regenerating these assets at 1200x630 is the real fix.
2. **109 titles exceed 65 characters** (median 71, max 89) and will truncate in SERPs.
   Left alone on purpose — rewriting titles without GSC click data is guesswork, and the
   growth loop already owns CTR rewrites against real query data.
3. **79 pages skip a heading level** (mostly `h1 -> h3` on printable checklists, where the
   h3s are a flat sibling list). Semantic/a11y only. Changing levels would alter type scale,
   so it needs a render check, not a blind sweep.
4. **`404.html` has no `og:image:alt`** and so was skipped by the dimension pass. Harmless.

## Detector notes (false-positive classes confirmed this run)

- `no_h1` (13) — all 13 are meta-refresh redirect stubs. Correctly have no h1.
- `faq_schema_no_visible_head` (50) — detector bug, not a site bug. The regex anchored `FAQ`
  at the start of the heading; these pages use it at the end ("Alabama Swim Lesson & Water
  Safety FAQ"). Content is fully visible. **Not a Google policy violation.**
- `ogtitle_drift` (435) / `ogdesc_drift` (446) — by design. Social copy is intentionally
  written longer/differently than the SERP title and meta description. Do not "reconcile" these.
- `alt_overused` — 1,437 images with `alt="WaterWiseKids"` are the header/footer logo across
  731 pages. Correct alt for a linked logo.
