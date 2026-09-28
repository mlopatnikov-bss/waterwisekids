# SEO Optimizer Report — 2026-08-22

**Scope:** 735 HTML pages on `live` (fresh clone @ `e6dd645`). Meta descriptions, alt text, JSON-LD schema, OG/Twitter tags.
**Result:** 16 pages fixed, deployed as `7ed2dd1`, verified live. 3 findings flagged for Michael.

---

## 1. Presence baseline — all clean (0 defects)

Every first-order check that this task nominally exists to fix returned zero. Verified with an HTML
parser, not regex (meta attribute order varies sitewide — see `meta_tag_attribute_order_varies`).

| Check | Result |
|---|---|
| Missing / empty meta description | 0 / 735 |
| Duplicate meta descriptions | 0 groups |
| Meta description >160 or <70 chars | 0 |
| Duplicate `<title>` (excl. redirect stubs) | 0 |
| Missing `<title>` / canonical / `lang` | 0 |
| `<img>` missing or empty `alt` | 0 of 1,806 images |
| Alt text generic / filename / >125 chars | 0 |
| Pages with no JSON-LD | 0 |
| JSON-LD parse errors | 0 of ~6,900 nodes |
| Missing `og:title`/`description`/`image`/`url`/`type` | 0 |
| Missing `twitter:card`/`title`/`description`/`image` | 0 |
| `og:url` ≠ canonical | 0 |
| Canonical target 404 | 0 |
| Sitemap URL 404 / sitemap contains noindex | 0 / 0 |
| FAQ schema answer not in visible page text | 0 of 2,841 pairs |
| `speakable` cssSelector matching nothing (resolved, not grepped) | 0 of 660 |
| BreadcrumbList item URL 404 / missing name | 0 of 2,175 |
| Malformed / future / modified-before-published dates | 0 |
| `og:image` in SVG format (unsupported by FB/LI/X) | 0 |

The presence layer is saturated. Everything below came from second-order checks.

---

## 2. Fixed and deployed (`7ed2dd1`)

### 2a. Broken publisher logo — 2 pages, rich-result blocking
`education/swim-level-translator.html` and `…-printable.html` pointed their Article `publisher.logo`
at `https://www.waterwisekids.com/images/logo-swimmer.svg` — **HTTP 404**. The correct path, used by
89 other pages, is `/assets/images/icons/logo-swimmer.svg`.

This was invisible to every prior audit because the JSON-LD *parsed fine* and the URL *looked* right —
it only fails when the URL is resolved against disk. A 404 publisher logo makes the Article ineligible
for rich results.

Verified live: old path `404`, new path `200`, both pages now emit the correct URL.

### 2b. `WebPage` schema node missing `name` — 12 town pages
Twelve pages carried a `WebPage` node with `url` + `speakable` but no `name` — the property Google
uses to label the speakable block. Sourced each `name` from the page's own visible H1 (no invented
text). Pages: `beginner-swim-lessons-abington-pa`, `kids-swim-lessons-{abington-pa,philadelphia}`,
`swim-lessons-{asbury-park-nj,jersey-shore,monmouth-county-kids,monmouth-county-nj,ocean-county-nj,philadelphia,toms-river-nj}`,
`toddler-swim-lessons-{abington-pa,philadelphia}`.

### 2c. Article `headline` diverged from visible H1 — 2 pages
- `education/rip-current-safety.html` — headline `"Rip Current Safety: How to Spot, Escape, and Avoid Them"` vs H1 `"Rip Currents Explained: How to Keep Your Family Safe at the Beach"`
- `education/six-beat-kick-swim-science.html` — headline `"The Six-Beat Kick: Real Motor-Learning Science or Marketing Physics?"` vs H1 `"Why Some Swim Schools Teach the Kick First…"`

Aligned `headline` to the H1 per Google's documented expectation. **`<title>` deliberately untouched** —
that's the CTR lever and is not shown by `headline`.

**Verification:** all 16 pages re-fetched from production — 48/48 JSON-LD blocks parse, 12/12 `WebPage`
nodes now carry `name`, logo resolves 200. Zero regressions across the full re-audit.

---

## 3. Flagged — needs Michael's call, not changed

### 3a. ⚠️ 53 pages ship an undersized `og:image` (600×360)
Facebook, LinkedIn and X want **≥1200×630**. At 600×360 the preview renders as a small square thumbnail
or is dropped entirely. This does not show up in any tag-presence audit — the tag is present, absolute,
and points at a real file. It only surfaces when you read the image header.

Scope check: **all 361 local card images are 600×360**; exactly one 1200×630 asset exists in the repo.
I checked every one of the 53 pages for a larger local alternative to swap in — **there is none**. This
needs the card generator's output size raised and the 53 cards regenerated; I won't fabricate a fix.

The other 214 pages hotlink Pexels with `?w=1200&h=630&fit=crop` and are correctly sized. The 468
PNG-based `og:image`s are all ≥1200×630 and fine.

Affected pages:

- `/education/aed-water-emergencies.html` → `/assets/images/cards/aed-water-emergencies.jpg` (600×360)
- `/education/are-puddle-jumpers-safe.html` → `/assets/images/cards/are-puddle-jumpers-safe.jpg` (600×360)
- `/education/autism-wandering-water-safety.html` → `/assets/images/cards/autism-wandering-water-safety.jpg` (600×360)
- `/education/cruise-ship-water-safety-families.html` → `/assets/images/cards/cruise-ship-water-safety-families.jpg` (600×360)
- `/education/dock-swimming-safety-kids.html` → `/assets/images/cards/dock-swimming-safety-kids.jpg` (600×360)
- `/education/ear-equalizing-diving-kids.html` → `/assets/images/cards/ear-equalizing-diving-kids.jpg` (600×360)
- `/education/electric-shock-drowning-docks.html` → `/assets/images/cards/electric-shock-drowning-docks.jpg` (600×360)
- `/education/epilepsy-swimming-safety.html` → `/assets/images/cards/epilepsy-swimming-safety.jpg` (600×360)
- `/education/floating-water-park-safety.html` → `/assets/images/cards/floating-water-park-safety.jpg` (600×360)
- `/education/founder-owned-vs-franchise-swim-school.html` → `/assets/images/cards/founder-owned-vs-franchise-swim-school.jpg` (600×360)
- `/education/free-baby-swim-classes-funnel.html` → `/assets/images/cards/free-baby-swim-classes-funnel.jpg` (600×360)
- `/education/free-water-safety-presentations-schools.html` → `/assets/images/cards/free-water-safety-presentations-schools.jpg` (600×360)
- `/education/heat-exhaustion-kids-pool.html` → `/assets/images/cards/heat-exhaustion-kids-pool.jpg` (600×360)
- `/education/how-to-teach-treading-water.html` → `/assets/images/cards/how-to-teach-treading-water.jpg` (600×360)
- `/education/ice-safety-cold-weather-kids.html` → `/assets/images/cards/ice-safety-cold-weather-kids.jpg` (600×360)
- `/education/infant-water-safety-checklist.html` → `/assets/images/cards/infant-water-safety-checklist.jpg` (600×360)
- `/education/is-my-child-drown-proof.html` → `/assets/images/cards/is-my-child-drown-proof.jpg` (600×360)
- `/education/jellyfish-sting-treatment-kids.html` → `/assets/images/cards/jellyfish-sting-treatment-kids.jpg` (600×360)
- `/education/jet-ski-pwc-safety-families.html` → `/assets/images/cards/jet-ski-pwc-safety-families.jpg` (600×360)
- `/education/kick-first-vs-survival-curricula.html` → `/assets/images/cards/kick-first-vs-survival-curricula.jpg` (600×360)
- `/education/lifeguards-dont-replace-supervision.html` → `/assets/images/cards/lifeguards-dont-replace-supervision.jpg` (600×360)
- `/education/nose-clips-ear-plugs-kids.html` → `/assets/images/cards/nose-clips-ear-plugs-kids.jpg` (600×360)
- `/education/older-siblings-water-supervision.html` → `/assets/images/cards/older-siblings-water-supervision.jpg` (600×360)
- `/education/pause-freeze-swim-lessons-policies.html` → `/assets/images/cards/pause-freeze-swim-lessons-policies.jpg` (600×360)
- `/education/play-based-swim-lessons-decoded.html` → `/assets/images/cards/play-based-swim-lessons-decoded.jpg` (600×360)
- `/education/pool-code-brown-closures-explained.html` → `/assets/images/cards/pool-code-brown-closures-explained.jpg` (600×360)
- `/education/post-lesson-practice-time.html` → `/assets/images/cards/post-lesson-practice-time.jpg` (600×360)
- `/education/public-fountain-safety-kids.html` → `/assets/images/cards/public-fountain-safety-kids.jpg` (600×360)
- `/education/public-pool-safety-checklist.html` → `/assets/images/cards/public-pool-safety-checklist.jpg` (600×360)
- `/education/quarry-swimming-dangers.html` → `/assets/images/cards/quarry-swimming-dangers.jpg` (600×360)
- `/education/recreational-water-illness-prevention.html` → `/assets/images/cards/recreational-water-illness-prevention.jpg` (600×360)
- `/education/retention-pond-water-safety.html` → `/assets/images/cards/retention-pond-water-safety.jpg` (600×360)
- `/education/rollover-breathing-vs-side-breathing.html` → `/assets/images/cards/rollover-breathing-vs-side-breathing.jpg` (600×360)
- `/education/six-beat-kick-swim-science.html` → `/assets/images/cards/six-beat-kick-swim-science.jpg` (600×360)
- `/education/swim-curriculum-credentials-decoded.html` → `/assets/images/cards/swim-curriculum-credentials-decoded.jpg` (600×360)
- `/education/swim-instructor-employment-model.html` → `/assets/images/cards/swim-instructor-employment-model.jpg` (600×360)
- `/education/swim-instructor-turnover-continuity.html` → `/assets/images/cards/swim-instructor-turnover-continuity.jpg` (600×360)
- `/education/swim-lesson-makeup-tokens.html` → `/assets/images/cards/swim-lesson-makeup-tokens.jpg` (600×360)
- `/education/swim-school-amenities-decoded.html` → `/assets/images/cards/swim-school-amenities-decoded.jpg` (600×360)
- `/education/swim-school-annual-fees.html` → `/assets/images/cards/swim-school-annual-fees.jpg` (600×360)
- `/education/swim-school-facility-models.html` → `/assets/images/cards/swim-school-facility-models.jpg` (600×360)
- `/education/swim-school-referral-programs.html` → `/assets/images/cards/swim-school-referral-programs.jpg` (600×360)
- `/education/swim-school-safety-seals-explained.html` → `/assets/images/cards/swim-school-safety-seals-explained.jpg` (600×360)
- `/education/swim-school-superlative-claims.html` → `/assets/images/cards/swim-school-superlative-claims.jpg` (600×360)
- `/education/swimming-with-a-cast-kids.html` → `/assets/images/cards/swimming-with-a-cast-kids.jpg` (600×360)
- `/education/swimming-with-adhd-kids.html` → `/assets/images/cards/swimming-with-adhd-kids.jpg` (600×360)
- `/education/swimming-with-down-syndrome-kids.html` → `/assets/images/cards/swimming-with-down-syndrome-kids.jpg` (600×360)
- `/education/swimming-with-eczema-kids.html` → `/assets/images/cards/swimming-with-eczema-kids.jpg` (600×360)
- `/education/teaching-kids-to-climb-out-pool.html` → `/assets/images/cards/teaching-kids-to-climb-out-pool.jpg` (600×360)
- `/education/tide-sandbar-safety-families.html` → `/assets/images/cards/tide-sandbar-safety-families.jpg` (600×360)
- `/education/touch-supervision-explained.html` → `/assets/images/cards/touch-supervision-explained.jpg` (600×360)
- `/education/towable-tube-tubing-safety.html` → `/assets/images/cards/towable-tube-tubing-safety.jpg` (600×360)
- `/education/water-safety-with-twins-multiples.html` → `/assets/images/cards/water-safety-with-twins-multiples.jpg` (600×360)

### 3b. ⚠️ 11 town-page pairs share a byte-identical H1
Both halves of each pair are self-canonical and both are in the sitemap, so they compete with each
other. Body content is genuinely different (Jaccard 0.21–0.28), so this is **not** duplicate content —
but an identical H1 is the single strongest on-page relevance signal, and shipping it twice splits it.

This is a third variant of the twin problem already tracked in `directory_duplicate_town_twins`
(which covers `/swim-lessons/{town}` ÷ `/beginner-swim-lessons-{town}`). This set is
`kids-swim-lessons-{town}` and bare `swim-lessons-{town}` vs `/swim-lessons/{town}`:

| Shared H1 | Pair |
|---|---|
| Kids Swim Lessons in Ambler, PA | `/kids-swim-lessons-ambler-pa.html` ÷ `/swim-lessons/ambler-pa.html` |
| Kids Swim Lessons in Asbury Park, NJ | `/kids-swim-lessons-asbury-park-nj.html` ÷ `/swim-lessons/asbury-park-nj.html` |
| Kids Swim Lessons in Brick, NJ | `/kids-swim-lessons-brick-nj.html` ÷ `/swim-lessons/brick-nj.html` |
| Kids Swim Lessons in Elkins Park, PA | `/kids-swim-lessons-elkins-park-pa.html` ÷ `/swim-lessons/elkins-park-pa.html` |
| Kids Swim Lessons in Flourtown, PA | `/kids-swim-lessons-flourtown-pa.html` ÷ `/swim-lessons/flourtown-pa.html` |
| Kids Swim Lessons in Glenside, PA | `/kids-swim-lessons-glenside-pa.html` ÷ `/swim-lessons/glenside-pa.html` |
| Kids Swim Lessons in Howell, NJ | `/kids-swim-lessons-howell-nj.html` ÷ `/swim-lessons/howell-nj.html` |
| Swim Lessons in Cheltenham, PA | `/swim-lessons-cheltenham-pa.html` ÷ `/swim-lessons/cheltenham-pa.html` |
| Swim Lessons at the Jersey Shore | `/swim-lessons-jersey-shore.html` ÷ `/swim-lessons/jersey-shore.html` |
| Swim Lessons in Monmouth County, NJ | `/swim-lessons-monmouth-county-nj.html` ÷ `/swim-lessons/monmouth-county-nj.html` |
| Swim Lessons in Ocean County, NJ | `/swim-lessons-ocean-county-nj.html` ÷ `/swim-lessons/ocean-county-nj.html` |

Cheapest fix that needs no consolidation decision: differentiate the H1 by intent
(`Kids Swim Lessons in Ambler, PA` vs `Swim Lessons in Ambler, PA — All Ages`). Held pending your call,
consistent with how the other 9 twins are being handled.

### 3c. `og:title` / `og:description` differ from `<title>` / meta description on ~440 pages
Reviewed a sample — these are deliberate social-vs-SERP variants (og drops the `| WaterWiseKids`
suffix, uses a longer phrasing). **Not a defect.** Recording it so it isn't re-flagged next run.

---

## 4. Confirmed false-positive classes (do not "fix" these)

- **13 pages with no H1** — all are `<meta http-equiv="refresh">` redirect stubs. Correct.
- **4 cross-canonical pages absent from sitemap** — the consolidated `beginner-swim-lessons-{ambler,elkins-park,flourtown,glenside}-pa` twins. Canonicalising elsewhere *and* staying out of the sitemap is correct.
- **110 titles >65 chars** — known, tracked in `cross_canonical_alias_false_positives`.
- **688 `Organization` nodes without `url`** — all nested as `author`/`publisher`, where Google does not require `url`.
- **112 `WebPage` nodes without `name`** — all under `mainEntityOfPage` as `{"@type":"WebPage","@id":…}`, the standard idiom.
- **722 "duplicate alt within page"** — the header + footer logo pair (`alt="WaterWiseKids"`) on every page.
- **`Guide` and `Report` @types** — both are valid schema.org types.
- **urllib 403s from the sandbox** — Cloudflare WAF rejecting the default user-agent. `curl` succeeds. Not a site defect.

### Methodology note
Two checks in my first pass produced false positives from **my own resolver**, not the site: matching a
*directory* where a file was required inflated "canonical cross-domain" to 25 and "indexable not in
sitemap" to 25; an absolute-path `os.path.join` faked a 404 on the homepage canonical and its sitemap
entry. Real counts after correcting the resolver: 4 and 0. Worth remembering — a URL resolver that
accepts directories will quietly manufacture a defect on every pretty-URL page on the site.
