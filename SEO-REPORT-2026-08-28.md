# SEO Optimizer — 2026-08-28

**Scope:** 747 HTML files on `live` (640 content, 87 printables, 19 redirect stubs, 1 noindex).
**Method:** fresh `/tmp` clone of `live` (never the mount), parsed with **html5lib**; every sweep canary-gated with an asserted cardinality before its result was trusted.
**Commit:** `9c29803` → pushed to `live`, verified live via `curl -L`.

---

## The mandated sweep came back clean — fourth consecutive run

Meta descriptions (0 missing, 0 empty, **640 distinct across 640 pages**, 0 outside 70–165 decoded chars, **0 outside `<head>`**) · titles (0 missing, 640 distinct) · alt text (**1,821 images**, 0 missing `alt`, 0 filename/junk alts) · OG + Twitter (0 missing across all ten fields on every content page) · JSON-LD (**2,124 blocks**, 0 parse failures, 0 empty blocks, 0 content pages without schema, 0 Article missing required fields, 0 BreadcrumbList position defects) · canonicals (present, single, in-head, 0 mismatches against `og:url`).

Note the classification is *stricter* than prior runs — my printable detector matched 87 files where earlier runs counted 133, so ~46 printables were audited under full content-page rules and still passed. The clean result holds under the tighter net.

Since the mandated surface is exhausted, the run went after two defect classes a static sweep structurally cannot see.

---

## Closed: FAQ schema **answers** had never been validated against visible text

Every prior run validated FAQ *questions* against rendered page text. Google's FAQ policy requires the **answer** text to be present on the page too, and nothing had ever checked it.

Swept **2,940 answers across 630 pages**, comparing each `acceptedAnswer.text` to the page's visible body text after decomposing `<script>`, `<style>`, `<noscript>` and `<template>` — the strip is mandatory, because `get_text()` otherwise returns the JSON-LD source itself and every answer trivially "matches" its own schema. The strip was canary-asserted (fired on 152 pages; a run where it fires zero times is blind, not clean).

**Result: 0 defects.** Every answer's opening 10-word shingle appears verbatim in visible text, and token coverage is ≥0.85 on all 2,940. The `faq_schema_answer_paraphrase` risk is closed, not merely untested.

Also swept `aggregateRating` / `Review` structured data, since two open notes flagged unsourced star ratings on town pages: **0 rating nodes exist in schema anywhere on the site**. The stars are visible UI only. That is a content-trust question for Michael, not a structured-data policy exposure — worth recording, because the two flags read as if they were.

---

## Fixed: demanded terms sitting **past the SERP title truncation point**

Yesterday's run measured whether a query's vocabulary was *present* in the title. That is the wrong boundary. Google truncates desktop titles at roughly 600px — a term can be present in the `<title>` and still never be seen by the searcher.

Pulled live GSC (2026-07-28 → 08-25; **151 clicks / 17,940 impressions / 0.84% CTR**) at `page × query` granularity, estimated rendered pixel width per title in the SERP font, computed the visible prefix, and asked which page-1 queries lose a term at the cut.

### The first pass was wrong and I threw it out

The naive version reported **25 qualifying pages**. It was matching query terms against the title as a *substring* rather than a token, so `water` "matched" inside `waterwisekids` and `kid` inside `kids`. Re-run with token-set membership and light stemming, the same data yields **2 pages** — the substring test had manufactured **50 false-positive term hits**. Three exclusions were also asserted to actually fire: `site:` operator queries (62 rows), positions >15 where CTR is not winnable regardless of snippet (870 rows), and brand-suffix truncation, which is *intended* — `| WaterWiseKids` goes last precisely so it is the thing that gets cut.

### 1. `swim-lessons/directory/pennsylvania.html` — 131 impr, **0 clicks**, pos 8.9–10.7

The site's highest-impression page-1 zero-click directory page. **113 of its 131 impressions** come from queries containing "swim **schools**" — and "Schools" was the last word before the brand, sitting past the cut:

> `Swim Lessons in Pennsylvania: Costs & Top-Rated Swim` … ← what searchers actually saw

Yesterday's run explicitly passed on this page, concluding "snippet coverage is already 0.80 … nothing to fix here." That conclusion was correct on presence and wrong on visibility. Retitled to **`Swim Lessons in Pennsylvania: Swim School Costs by Town`** — the head phrase "Swim Lessons in Pennsylvania" is preserved intact so the existing ranking is not disturbed, while "Swim School Costs" moves inside the visible window and "by Town" serves the Glenside / Ambler / Fort Washington query set. Verified substantiated: the page carries all three towns, $15–$30 per-class rates, and 13 verified schools.

### 2. `education/swim-lessons-cost.html` — 45 impr, **0 clicks**, pos 6.4–10

79 chars / ~812px. Both **"Programs"** and **"Fees"** fell past the cut, together carrying 29 impressions on page-1 queries ("monthly costs for baby swim programs … registration fees").

Retitled to **`How Much Do Swim Lessons Cost? Baby Program Fees & Rates`**. The head question is kept verbatim — it is what ranks at pos 6.4 — and "2026" was dropped from the title only after confirming the meta description still carries "2026 rates", so the freshness signal survives in the snippet. Verified substantiated: the page has a dedicated baby/infant pricing section with $60–$120 and $140–$220 monthly figures.

All **3 title mirrors** (`<title>`, `og:title`, `twitter:title`) were updated per page and asserted by exact count. Schema `headline` left untouched on both — it still matches H1 exactly. `lastmod` bumped for these two only.

---

## Fixed: one inert `speakable` selector — a regression from yesterday's own commit

Swept all **2,361 `speakable` cssSelectors across 672 pages** against their own DOM. 671 pages matched every selector; **one did not**: `education/swim-goggles-for-kids.html` declared `.article > p:first-of-type`, which matched nothing because `.article`'s only children are `<div>`s.

The cause is yesterday's `e3d336c`, which merged stranded Q&As into the article body and restructured that container. Repointed to `.article-body > p:first-of-type` (the selector its sibling pages already use), verified to match. `lastmod` deliberately **not** bumped — a speakable selector repair changes no user-visible content and no snippet.

---

## Not touched, on purpose

**The 23 other pages the truncation probe surfaced before filtering** — all were either `site:` operator noise, brand-suffix truncation (intended), or generic "kids" cut from state directory titles at 1–4 impressions each. Rewriting 20+ directory titles for that is an unforced ranking risk against negligible upside.

**53 pages sharing the generic social image** — still blocked on assets that do not exist in the repo.

---

## Watch

The two retitled pages are the direct test of the truncation hypothesis. **Re-check CTR in 2–3 weeks.** Note that `sibling-discount-swim-lessons.html` and `intensive-vs-weekly-swim-lessons.html` were retitled *yesterday* on a different hypothesis (snippet states the number vs. promises it) — when reading results, keep the two experiments separate; they are one day apart and will mature together.

Sitewide CTR is **0.84%** (up from 0.81% on a near-identical window, well within noise). The dominant query shape remains long conversational questions on the AI-Overview surface.

---

## Needs Michael

**Unsourced star ratings on town pages.** Confirmed today that these exist *only* as visible UI — there is no `aggregateRating` schema anywhere, so there is no structured-data penalty exposure. But 64 pages render a ★ rating with no stated source, and separately the review system stores review text that is never rendered (no `renderReviews` implementation exists). Both are trust/credibility issues rather than SEO defects, and both need a product decision, not a metadata edit.

**Carried forward:** per-page 1200×630 social cards for the 53 pages on the generic brand image — needs new assets and a generator that does not exist in the repo.

**Carried forward:** `MEMORY.md` is ~21KB against a 24.4KB read limit and is still growing daily. It needs a real `consolidate-memory` pass that merges related memory files; shortening hooks cannot fix it, since ~190 filenames alone are a ~17KB floor. Better run interactively than inside an automated job.
