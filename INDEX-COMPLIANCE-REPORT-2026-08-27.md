# Google Index Compliance Report — 2026-08-27

**Site:** waterwisekids.com · **Branch:** `live` · **Commit shipped:** `a3e2e757`
**Status: COMPLIANT** — 1 defect class found and fixed, verified live.

---

## Summary

| Check | Result |
|---|---|
| HTML files in repo | 745 |
| Indexable pages | 661 |
| `noindex` pages | 84 (printables + intentional) |
| Sitemap URLs | 638 |
| Sitemap URLs returning HTTP 200 (live probe) | **638 / 638** |
| Soft-404s among 2xx responses | **0** |
| Unexpected redirects on sitemap URLs | **0** |
| Broken `<head>` (metas leaked to `<body>`) | **0** |
| Pages missing canonical | **0** |
| Canonical outside `<head>` / relative / duplicated | **0** |
| Sitemap URLs that canonicalize elsewhere | **0** |
| `noindex` pages listed in sitemap | **0** |
| Pages missing meta description | **0** |
| Meta descriptions out of 50–160 range (decoded) | **0** |
| JSON-LD blocks failing to parse | **0** |
| JSON-LD missing required fields / duplicate FAQ names | **0** |
| Broken internal links | **0** |
| Internal links pointing at canonical-alias stubs (hops) | **0** |
| Missing / future-dated `lastmod` | **0** |
| **Stale `lastmod` on index-relevant changes** | **119 — FIXED** |

`robots.txt`: `User-agent: * / Allow: / / Sitemap: https://www.waterwisekids.com/sitemap.xml` — valid, HTTP 200. Sitemap serves `application/xml`, HTTP 200, 638 `<loc>` entries.

---

## Defect found and fixed: 119 stale `lastmod` dates

**What was wrong.** 119 sitemap entries advertised a `lastmod` older than the date their index-relevant content actually changed. Google treats `lastmod` as a recrawl hint, so pages whose titles, meta descriptions, canonicals, JSON-LD (Article, FAQPage, BreadcrumbList, `speakable`), or main body text had been corrected were being announced to Google as unchanged — suppressing recrawl of work already shipped.

Worst cases understated the change by **12 days**; the bulk were 1–8 days behind.

**How they were classified.** A naive git-touch comparison flags 620 files, and a payload diff flags 452 — both are inflated by sitewide cosmetic churn. Each file's history was walked newest-first and each revision pair compared on a *significance signature* only:

- `<title>`, meta description, `meta robots`, `link rel=canonical`
- every `application/ld+json` block
- the text content of `<main>` / `<article>`

Explicitly excluded from the signature: cache-bust `?v=` token bumps, Cloudflare `__cf_email__` obfuscation, whitespace, and `og:*` / `twitter:*` social-preview tags. **No blanket bump was applied** — each of the 119 dates was set to that file's own true significant-change date, not to today. 519 sitemap entries were correctly left alone.

**Change drivers behind the 119:**

| Originating commit | Pages |
|---|---|
| Fix 53 undersized og:image refs (also repointed JSON-LD `image`) | 53 |
| AEO: repair 209 broken `speakable` selectors, backfill TL;DRs | 35 |
| Add BreadcrumbList schema to 83 pages; trim overlong titles | 10 |
| CTR: fix 33 truncated meta descriptions + 4 titles | 5 |
| Bridge USCG Type→Level on pages rejecting valid 2025+ life jackets | 3 |
| Normalize non-canonical Article author values | 3 |
| Remaining (FAQPage schema alignment, unescaped-quote meta repair, headline↔H1 sync, life-jacket label fix) | 10 |

**Verification.** Cardinality asserted (119 targets → 119 replacements, 0 mismatches), sitemap re-parsed post-write, URL count unchanged at 638, and the change confirmed on the live origin through Cloudflare.

---

## Open item handed back — not fixed here

**10 titles at 80–95 characters** will truncate in SERPs. This is a snippet/CTR concern rather than an indexing-compliance failure, and rewriting titles is editorial work that belongs in the growth loop rather than an automated compliance pass, so it was left alone.

| Page | Title length |
|---|---|
| /education/swim-level-translator.html | 95 |
| /swim-lessons/directory/georgia.html | 89 |
| /swim-lessons/directory/south-carolina.html | 88 |
| /education/summer-camp-water-safety.html | 81 |
| /swim-lessons/directory/florida.html | 81 |
| /swim-lessons/directory/mississippi.html | 81 |
| /swim-lessons/directory/new-jersey.html | 81 |
| /swim-lessons/directory/arizona.html | 80 |
| /swim-lessons/directory/new-mexico.html | 80 |
| /swim-lessons/directory/ohio.html | 80 |
Note also that 86 titles are ≥70 characters — worth a batch pass if CTR on those clusters is soft.

---

## Full list of `lastmod` corrections

| Page | Old lastmod | Corrected to | Change that justified it |
|---|---|---|---|
| /advertise/index.html | 2026-04-08 | 2026-08-14 | [seo] Add BreadcrumbList schema to 83 pages; trim 3 overlong titles; f |
| /contact/index.html | 2026-04-08 | 2026-08-14 | [seo] Add BreadcrumbList schema to 83 pages; trim 3 overlong titles; f |
| /gear/index.html | 2026-04-08 | 2026-08-14 | [seo] Add BreadcrumbList schema to 83 pages; trim 3 overlong titles; f |
| /privacy/index.html | 2026-04-08 | 2026-08-14 | [seo] Add BreadcrumbList schema to 83 pages; trim 3 overlong titles; f |
| /swim-lessons/cheltenham-pa.html | 2026-08-05 | 2026-08-14 | [seo] Add BreadcrumbList schema to 83 pages; trim 3 overlong titles; f |
| /swim-lessons/howell-nj.html | 2026-08-11 | 2026-08-14 | [seo] Add BreadcrumbList schema to 83 pages; trim 3 overlong titles; f |
| /swim-lessons/jersey-shore.html | 2026-08-12 | 2026-08-14 | [seo] Add BreadcrumbList schema to 83 pages; trim 3 overlong titles; f |
| /swim-lessons/philadelphia.html | 2026-08-06 | 2026-08-14 | [seo] Add BreadcrumbList schema to 83 pages; trim 3 overlong titles; f |
| /swim-schools/add.html | 2026-04-08 | 2026-08-14 | [seo] Add BreadcrumbList schema to 83 pages; trim 3 overlong titles; f |
| /terms/index.html | 2026-04-08 | 2026-08-14 | [seo] Add BreadcrumbList schema to 83 pages; trim 3 overlong titles; f |
| /education/backyard-water-play-safety.html | 2026-08-14 | 2026-08-15 | [publish] CTR: fix 33 truncated meta descriptions + 4 title rewrites o |
| /education/cold-water-safety-checklist.html | 2026-08-14 | 2026-08-15 | [site-auditor] FAQPage schema compliance: align 15 schema questions to |
| /education/natural-swimming-holes-safety.html | 2026-08-14 | 2026-08-15 | [publish] CTR: fix 33 truncated meta descriptions + 4 title rewrites o |
| /education/pool-chemical-safety.html | 2026-08-14 | 2026-08-15 | [publish] CTR: fix 33 truncated meta descriptions + 4 title rewrites o |
| /education/renting-home-with-pool-safety.html | 2026-08-14 | 2026-08-15 | [publish] CTR: fix 33 truncated meta descriptions + 4 title rewrites o |
| /education/who-sets-water-safety-standards.html | 2026-08-14 | 2026-08-15 | [site-auditor] FAQPage schema compliance: align 15 schema questions to |
| /for-swim-schools/index.html | 2026-08-14 | 2026-08-15 | [publish] CTR: fix 33 truncated meta descriptions + 4 title rewrites o |
| /education/choose-your-own-swim-instructor-vs-assigned.html | 2026-08-15 | 2026-08-16 | [compliance] Align FAQPage schema answers to visible on-page copy (41  |
| /education/swim-test-deep-end-readiness.html | 2026-08-12 | 2026-08-16 | [compliance] Align FAQPage schema answers to visible on-page copy (41  |
| /education/holiday-weekend-water-safety-checklist.html | 2026-08-14 | 2026-08-17 | [seo] Trim 4 truncating titles, improve 1 alt; full-site SEO audit cle |
| /education/life-skills-from-swimming.html | 2026-08-16 | 2026-08-18 | [quality-assurance] Normalize 19 non-canonical Article author entities |
| /education/swimming-achievement-milestones.html | 2026-08-14 | 2026-08-18 | [quality-assurance] Normalize 19 non-canonical Article author entities |
| /teens/scholarships.html | 2026-04-08 | 2026-08-18 | [quality-assurance] Normalize 19 non-canonical Article author entities |
| /benefits-of-swimming-for-kids.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /can-babies-swim.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /common-swimming-mistakes-kids-make.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/apartment-pool-safety-kids.html | 2026-08-04 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/back-float-first-infant-swim.html | 2026-08-13 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/backward-design-swim-curriculum.html | 2026-07-31 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/group-vs-continuous-swim-advancement.html | 2026-07-31 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/heat-illness-young-swimmers.html | 2026-08-06 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/in-home-swim-lessons-explained.html | 2026-08-04 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/kids-snorkeling-safety.html | 2026-08-06 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/lake-house-water-safety-families.html | 2026-07-31 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/lazy-river-safety-kids.html | 2026-08-04 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/prescription-goggles-swimming-kids.html | 2026-08-15 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/quarterly-vs-monthly-swim-lessons.html | 2026-07-31 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/renting-private-pool-hourly-safety.html | 2026-08-06 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/self-rescue-home-pool-practice.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/water-safety-teens.html | 2026-08-14 | 2026-08-19 | SEO: fix 81 pages with broken/non-canonical structured-data image URLs |
| /education/wave-pool-safety-kids.html | 2026-08-06 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/wave-pool-safety.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /how-parents-can-support-swim-lessons-at-home.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /how-to-build-water-confidence-in-children.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /how-to-teach-kids-to-swim.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /pool-safety-rules-for-kids.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /private-vs-group-swim-lessons-for-kids.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /questions-to-ask-a-swim-school.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /signs-a-swim-program-is-good-for-beginners.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /signs-your-child-is-ready-for-swim-lessons.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /swim-safety-tips-for-parents.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /swimmers-hub/breaststroke-complete-guide.html | 2026-04-21 | 2026-08-19 | SEO: fix 81 pages with broken/non-canonical structured-data image URLs |
| /water-safety-for-toddlers.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /what-age-can-toddlers-start-swimming.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /what-happens-at-a-childs-first-swim-lesson.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /what-to-do-if-your-child-hates-swim-lessons.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /why-floating-is-important-for-kids.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /why-kids-need-swim-lessons-even-if-they-have-a-pool.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /why-swimming-is-an-important-life-skill.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /why-year-round-swim-lessons-matter.html | 2026-08-14 | 2026-08-19 | AEO: repair 209 broken speakable selectors, backfill 24 TL;DR boxes, o |
| /education/secondary-drowning-dry-drowning.html | 2026-08-23 | 2026-08-25 | [seo] Fix unescaped-quote attribute breaks in meta tags on 2 pages |
| /education/aed-water-emergencies.html | 2026-08-14 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/are-puddle-jumpers-safe.html | 2026-07-10 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/autism-wandering-water-safety.html | 2026-08-23 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/babysitter-water-safety-checklist.html | 2026-08-24 | 2026-08-26 | [quality-assurance] Bridge USCG Type->Level on 6 pages that rejected v |
| /education/cruise-ship-water-safety-families.html | 2026-07-29 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/dock-swimming-safety-kids.html | 2026-07-13 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/ear-equalizing-diving-kids.html | 2026-08-20 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/electric-shock-drowning-docks.html | 2026-08-22 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/epilepsy-swimming-safety.html | 2026-08-06 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/floating-water-park-safety.html | 2026-08-15 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/founder-owned-vs-franchise-swim-school.html | 2026-08-24 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/free-baby-swim-classes-funnel.html | 2026-08-17 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/free-water-safety-presentations-schools.html | 2026-08-14 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/heat-exhaustion-kids-pool.html | 2026-08-20 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/how-to-teach-treading-water.html | 2026-08-23 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/ice-safety-cold-weather-kids.html | 2026-08-06 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/infant-water-safety-checklist.html | 2026-08-14 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/is-my-child-drown-proof.html | 2026-08-24 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/jellyfish-sting-treatment-kids.html | 2026-08-20 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/jet-ski-pwc-safety-families.html | 2026-08-04 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/kick-first-vs-survival-curricula.html | 2026-08-05 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/life-jacket-guide.html | 2026-08-21 | 2026-08-26 | Fix life jacket label test that rejected new USCG Level-labeled jacket |
| /education/lifeguards-dont-replace-supervision.html | 2026-07-22 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/nose-clips-ear-plugs-kids.html | 2026-08-23 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/older-siblings-water-supervision.html | 2026-08-16 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/open-water-safety-checklist.html | 2026-08-18 | 2026-08-26 | [quality-assurance] Bridge USCG Type->Level on 6 pages that rejected v |
| /education/pause-freeze-swim-lessons-policies.html | 2026-08-18 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/play-based-swim-lessons-decoded.html | 2026-08-21 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/pool-code-brown-closures-explained.html | 2026-08-25 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/pool-party-host-safety-checklist.html | 2026-08-24 | 2026-08-26 | [quality-assurance] Bridge USCG Type->Level on 6 pages that rejected v |
| /education/pool-party-safety.html | 2026-08-24 | 2026-08-26 | Fix life jacket label test that rejected new USCG Level-labeled jacket |
| /education/post-lesson-practice-time.html | 2026-08-20 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/public-fountain-safety-kids.html | 2026-08-24 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/public-pool-safety-checklist.html | 2026-08-22 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/quarry-swimming-dangers.html | 2026-08-23 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/recreational-water-illness-prevention.html | 2026-08-25 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/retention-pond-water-safety.html | 2026-08-20 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/rollover-breathing-vs-side-breathing.html | 2026-08-20 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/six-beat-kick-swim-science.html | 2026-08-22 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/swim-clinics-intensive-camps.html | 2026-08-25 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/swim-curriculum-credentials-decoded.html | 2026-08-24 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/swim-instructor-employment-model.html | 2026-08-01 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/swim-instructor-turnover-continuity.html | 2026-08-20 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/swim-lesson-makeup-tokens.html | 2026-08-20 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/swim-school-amenities-decoded.html | 2026-08-24 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/swim-school-facility-models.html | 2026-08-24 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/swim-school-referral-programs.html | 2026-08-17 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/swim-school-safety-seals-explained.html | 2026-07-02 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/swim-school-superlative-claims.html | 2026-08-21 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/swimming-with-a-cast-kids.html | 2026-08-24 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/swimming-with-adhd-kids.html | 2026-06-24 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/swimming-with-down-syndrome-kids.html | 2026-06-20 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/swimming-with-eczema-kids.html | 2026-08-23 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/teaching-kids-to-climb-out-pool.html | 2026-08-17 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/tide-sandbar-safety-families.html | 2026-08-06 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/touch-supervision-explained.html | 2026-08-18 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/towable-tube-tubing-safety.html | 2026-08-25 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |
| /education/water-safety-with-twins-multiples.html | 2026-08-16 | 2026-08-26 | [seo] Fix 53 undersized og:image refs (600x360 -> 1200x630) + sync 1 F |