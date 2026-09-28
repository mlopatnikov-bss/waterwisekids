# Site Audit — waterwisekids.com — 2026-08-27

Audited a fresh `live` clone at `3d207f3` (745 HTML files, 638 sitemap URLs).
Fixes shipped as **`abb4f9b`**, deploy confirmed, and all 10 changed pages re-verified against the live site.

## Health summary

| Check | Scope | Result | Status |
|---|---|---|---|
| Broken internal links | 36,414 `<a href>` on 745 pages | **0** | 🟢 |
| Live HTTP status | 638 sitemap URLs | **638/638 → 200** | 🟢 |
| Redirect hops (internal) | 638 live URLs | **0** extra hops | 🟢 |
| Soft-404s (200 + error body) | 638 live pages | **0** | 🟢 |
| Thin pages (<4 KB served) | 638 live pages | **0** | 🟢 |
| Missing assets (css/js/img/icon) | 5,038 local refs | **0** | 🟢 |
| `<head>` integrity (unescaped-quote class) | html5lib parse, 745 pages | **0** metas/canonicals leaked to `<body>` | 🟢 |
| JSON-LD parse errors | 2,141 `ld+json` nodes | **0** | 🟢 |
| HTML entities inside JSON-LD text | 2,141 nodes | **0** | 🟢 |
| Missing / empty `alt` | 1,831 `<img>` | **0** | 🟢 |
| Missing `width`/`height` (CLS) | 1,831 `<img>` | **0** | 🟢 |
| Meta description missing / empty / >165ch | 745 pages (decoded length) | **0** | 🟢 |
| Duplicate meta descriptions | 745 pages | **0** | 🟢 |
| Canonical coverage | 745 canonicals | **745/745** | 🟢 |
| `og:image` / `twitter:image` assets exist | 1,490 refs | **0** missing | 🟢 |
| `<html lang>` / `<title>` present | 745 pages | **0** missing | 🟢 |
| Unsubstituted `__PLACEHOLDER__` | raw source | **0** | 🟢 |
| Formspree endpoints malformed | 140 forms | **0** | 🟢 |
| Below-fold `loading="eager"` / `fetchpriority` | 745 pages | **0** | 🟢 |
| **Dead in-page fragment targets** *(new)* | 3,296 `#anchor` links | **0** | 🟢 |
| **Dangling `aria-*` / `label[for]` refs** *(new)* | 131 references | **0** | 🟢 |
| **`target="_blank"` without `noopener`** *(new)* | 3,385 links | **0** | 🟢 |
| **Dead internal URLs inside JSON-LD** *(new)* | 3,343 schema URLs | **0** | 🟢 |
| **Duplicate `id` attributes** *(new)* | 4,754 ids on 745 pages | **1 → fixed** | 🟡→🟢 |
| **Main content stranded below the exit-card block** *(new)* | 295 pages with a `.related` grid | **10 → fixed** | 🟡→🟢 |
| Dead external citation URLs | 305 distinct URLs | **0 confirmed dead** (102 unverifiable — see below) | 🟡 |

## Fixed and pushed (`abb4f9b`) — 10 files

**An AEO pass appended question-led sections *after* the Related Reading exit-card grid.** On 10 education articles, a `<h2>` + `<h3>` block of 150–400 words sat below the "keep reading" cards but still inside `.article-body`. A reader who reaches the exit cards has been handed the door; everything after it reads as an afterthought, and main-content extraction treats post-boilerplate text accordingly. These blocks are the site's best-performing format — question-led explainers with bolded lead answers — buried at the very bottom of the page.

| Page | Stranded section |
|---|---|
| `bucket-small-container-drowning-toddlers.html` | How Much Water Does It Take for a Toddler to Drown? |
| `child-wont-wear-life-jacket.html` | What If My Toddler Refuses to Wear a Life Jacket? |
| `hiring-lifeguard-pool-party.html` | How Much Does It Cost to Hire a Lifeguard for a Pool Party? |
| `olympic-sized-pool-decoded.html` | How Big Is an Olympic-Sized Pool? Length, Laps and Gallons |
| `summer-camp-water-safety.html` | 7 Questions to Ask a Summer Camp About Water Safety (+ the whole FAQ section) |
| `swim-instructor-training-hours-compared.html` | How Many Hours of Training Does a Swim Instructor Actually Need? |
| `swim-lesson-family-budget-guide.html` | Monthly Costs and Registration Fees |
| `swim-lesson-parent-involvement.html` | Do Parents Stay During Swim Lessons? |
| `swimtastic-safesplash-swimlabs-comparison.html` | What Do Swimtastic, SafeSplash and SwimLabs Cost? |
| `towable-tube-tubing-safety.html` | What Age Can Kids Go Tubing, and How Fast Is Safe? |

Each block was moved above the `.related` div — a pure DOM reorder, not an edit. Before writing each file the fixer asserted **identical sorted word list, identical sorted heading set (but different order), identical `<a>` count, identical `<img>` count, `.related` block count unchanged**, and re-parsed the result to confirm no heading remains after the exit cards. Ten for ten.

`swim-lesson-parent-involvement.html` additionally carried a **duplicate `<h2 id="do-parents-stay">`** — the appended heading collided with the id of the existing in-body section. Verified first that nothing off-page links to `#do-parents-stay`, that the page's own TOC anchor resolves to the surviving heading, and that the FAQPage schema carries exactly one such Question. Removed the redundant `<h2>` so its prose continues the existing section; site-wide duplicate-id count is now 0.

`lastmod` was **not** bumped — no information was added, changed or removed beyond one duplicated heading. No cache-bust: no CSS or JS touched.

### Why this was invisible to every prior audit

The duplicate `id` is what surfaced it, and that was luck: on 9 of the 10 pages the appended heading used a *different* id, so no id collision existed and nothing tripped. Word count, link count, heading count, schema and rendering were all correct — the content was present, valid, and in the wrong place. **Ordering defects are invisible to every count-based probe.**

**Detection recipe:** anchor on the exit-card block (`.related`) and assert nothing follows it inside `.article-body`. Two traps I hit building this:

- **Anchor on the right block.** The pages carry three "related" variants — `.related` (card grid), `.related-grid` (nested child) and `.related-articles` ("Keep Reading", which legitimately sits last). My first pass anchored on the *last* match and reported **0 pages** on a corpus where I already knew of a positive. A probe that returns zero against a known positive is a broken probe, not a clean site.
- **The block title is itself a heading.** `<h3>Related Reading</h3>` lives inside `.related`, so an unfiltered "headings after the anchor" query returns all 294 pages. Excluding descendants of the anchor takes it to 11 — of which 1 (`water-rescue-skills-for-kids.html`) is the by-design "Keep Reading" block, not orphan prose.

## Reviewed, not defects

- **29 pages with a duplicated question heading.** Nearly all are a body `<h2>` deep-dive plus an `<h3>` in the page's FAQ section asking the same question in snippet-shaped form (e.g. `are-puddle-jumpers-safe.html` repeats three). That is the intended FAQPage pattern — long section for the reader, short answer for the schema — not accidental duplication. Left alone. The 3 that *also* had a stranded block are resolved by the reorder.
- **70 pages with a heading-level skip** (63 × h1→h3, 19 × h2→h4). Concentrated in the 50 directory state pages and the printables, where h3 is the card-title level throughout. Template convention, uniform, and not worth a mass edit — noting it rather than acting.
- **9 duplicate `<title>` pairs** — each a redirect stub mirroring its canonical destination. By design, unchanged from prior runs.
- **16 external links that 200 through a redirect.** All permanent 301s that resolve correctly (NCBI's `www.ncbi.nlm.nih.gov/pmc/` → `pmc.ncbi.nlm.nih.gov`, `usaswimmingfoundation.org` → `usaswimming.org/foundation`, several www/apex canonicalizations). Cosmetic for outbound links; not worth 16 files of churn against the anchor-text risk.
- **3 `ndpa.org` SSL errors** — sandbox CA bundle lacks the intermediate; the chain is valid. Sandbox artifact, as in prior runs.

## Watch

- **102 external citation URLs are currently unverifiable, and that is a change from yesterday.** Every non-200 in this run was a `403` from a WAF host (cdc.gov, publications.aap.org, cpsc.gov, cpsc/poolsafely, ymca.org, usla.org, heart.org, sciencedirect, doi.org, britishswimschool.com). Yesterday's run resolved these by re-probing sequentially at ~4 s spacing with a full browser header set — that is how three real CDC 404s were caught. **Today that technique returned 403 on 102 of 102**, so the probe carries no information in either direction. I did not treat it as clean. What I could establish: only **one** external URL has been added since yesterday's audit (`projectplay.org` on `swim-lessons-cost.html`), and it returns **200 with a full 282 KB body**. The other 304 were verified 24 hours ago and nothing on our side has changed. Sanctioned `web_fetch` is provenance-gated and could not be used to spot-check. If the sandbox IP stays blocked, external-citation verification needs a different route before it can be called green again.
- **`/aquatic-jobs/` still renders an empty state** — listings are JS-injected from the jobs API, which remains a known 503. Still in the sitemap. Unchanged product decision, not a defect.
- **`education/index.html` is 340 KB** with 353 images, up ~1 KB from 339 KB on 08-26 — still the largest payload by ~10×, still creeping. All images lazy and dimensioned.

## Notes on method

Parsed with **html5lib**, never regex, so a stray unescaped `"` in a meta surfaces as content leaking into `<body>` rather than passing a presence check. Every sweep carried canary assertions on its own cardinality — link, image, JSON-LD, meta, id, heading and fragment counts must clear a floor, and parse count must equal page count — so a probe that silently matches nothing fails loudly. Two canaries fired usefully: `aria-*` references number **3 site-wide** (not a bug, just a genuinely small surface, so the floor was lowered deliberately rather than silently), and the exit-card probe's zero-result was caught by testing it against a known positive before trusting it. External checks used GET, never HEAD.
