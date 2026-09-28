# SEO Optimizer — 2026-08-27

**Scope:** 745 HTML files on `live` (592 content, 133 printables, 19 redirect stubs, 1 noindex).
**Method:** fresh `/tmp` clone of `live` (never the mount), parsed with **html5lib**; every sweep canary-gated with an asserted cardinality before its result was trusted.
**Commit:** `8642016` → pushed to `live`, verified live via `curl -L`.

---

## The mandated sweep came back clean — again

Meta descriptions (0 missing, 0 duplicate across 725 distinct strings, 0 outside 70–165 decoded chars, 0 outside `<head>`) · titles (0 missing, 0 duplicate) · alt text (**1,831 images**, 0 missing `alt`, 0 filename/junk alts) · OG + Twitter (0 missing across all nine fields on 592 content pages) · JSON-LD (**2,141 blocks**, 0 parse failures, 0 empty blocks, 0 content pages without schema, 0 Article missing required fields, 0 BreadcrumbList position defects, 0 duplicate schema nodes) · **2,916 FAQ questions** all present in visible page text · canonicals (present, single, in-head, 0 mismatches against `og:url`) · **3,856 asset URLs** checked, 0 404s · 0 future or inverted schema dates · 0 images without dimensions.

This is the third consecutive clean baseline. The lever has moved elsewhere, so the run went after the defect a static sweep structurally cannot see.

---

## Fixed: snippet vocabulary gap on the two worst page-1 zero-click pages

Pulled live GSC (2026-07-27 → 08-24; **151 clicks / 18,556 impressions / 0.81% CTR**) at `page × query` granularity and scored, for every ranking page, how much of its actual query vocabulary appears in its title + meta description.

Two pages rank on **page 1** and converted **0 clicks from 348 impressions**. Their problem is not position — it is that the snippet never says the words people typed.

### 1. `education/intensive-vs-weekly-swim-lessons.html` — pos 5.9, 73 impr, 0 clicks

The word **"intensive"** carried **52% of the page's impressions** ("advantages of an intensive, short-term swim program…") and appeared in **no** title, description, `og:*` or `twitter:*` field. The page's own H1, breadcrumb, URL slug and **95 body mentions** all use it; only the snippet didn't.

- Title → `Intensive vs. Weekly Swim Lessons: Is a 5-Day Clinic Faster?` — leads with the demanded term while keeping "5-Day Clinic," which carries roughly 27 impressions of its own.
- Description → now states the page's own Quick Answer verbatim: intensive builds fastest, weekly retains longest.

### 2. `education/sibling-discount-swim-lessons.html` — pos 5.3, 275 impr, 0 clicks

The site's single largest zero-click page-1 page. The old description **promised a number without giving one** ("…how much two or three children can save") and omitted **"family"**, the vocabulary in its second-highest query ("family discounts or multi-child enrollment incentives").

- Description → now leads with the figure the page itself substantiates in its Quick Answer: **10–20% off a second child's tuition**, and names both "sibling" and "family" discounts.
- **Title left alone deliberately** — it already ranks at pos 2.7–8 and already matches the head query. Only the snippet was changed, which is the CTR lever and the lower-risk edit.

All **3 description mirrors** and **3 title mirrors** per page were updated together and asserted by count. Schema `headline` was left untouched on both (still matches H1 exactly). `lastmod` bumped for these two only — a title and snippet change *is* index-relevant, unlike yesterday's social-image-only edit.

---

## Rejected: a 278-page "defect" that wasn't

A sweep for content pages whose H1 vocabulary is absent from title + description returned **278 pages** — far too many to be a defect class. Inspection showed almost all are deliberate editorial practice: a long, human H1 paired with a tighter keyword-focused title (`H1: "Hot Tub and Spa Safety for Children: What Parents Must Know"` → `Title: "Hot Tub & Spa Safety for Children"`). The "missing" terms were filler — *know, every, parent, complete*.

Mass-rewriting 278 titles would have been an unforced ranking risk. Intersecting the sweep with **actual GSC demand** collapsed it to 8 pages, of which only the 2 above rank high enough for a snippet fix to matter; the other 6 sit at pos 25–78, where the problem is ranking, not snippet.

---

## Not touched, on purpose

**83 printables with `schema.headline` ≠ `H1`** — the established printable convention, not a defect. Verified all 83 are printables and 0 are content pages. (Was 82; one printable added since.)

**4 pages whose canonical points elsewhere** — `beginner-swim-lessons-{ambler,elkins-park,flourtown,glenside}-pa.html` canonicalize to their richer `/swim-lessons/<town>-pa.html` twin. Verified each target exists and each alias is correctly absent from the sitemap. Intentional cross-canonical aliasing.

**High-impression low-CTR pages at pos 44–60** (`backyard-pool-fence-requirements` 180 impr pos 58, `beach-warning-flags-explained` 145 impr pos 60, `swim-lessons/directory/arizona` 123 impr pos 49) — a meta rewrite cannot fix position 58. These belong to the authority/ranking track, not this one.

**`swim-lessons/directory/pennsylvania.html`** — 128 impr, pos 9.7, 0 clicks, but snippet coverage is already 0.80 and the description already names Glenside, Ambler and the cost range. Nothing to fix here; it needs the half-page of rank.

---

## Watch

**Sitewide CTR is 0.81%** (151 clicks / 18,556 impressions). The dominant query shape is long conversational questions — the AI-Overview surface, where the answer is often consumed without a click. Today's two fixes test a specific hypothesis: *a snippet that states the answer's number outperforms one that promises the answer exists.* Re-check both pages' CTR in ~2–3 weeks; if `sibling-discount` is still at 0 clicks from a page-1 position, the cause is the surface, not the snippet, and the response should shift to content format rather than metadata.

---

## Needs Michael

Nothing blocking the site. Carried forward from 2026-08-26: generating true 1200×630 per-page social cards for the 53 pages currently sharing the generic brand image — still requires new assets and a generator that doesn't exist in the repo.

**Housekeeping:** the agent memory index (`MEMORY.md`) is now ~21KB against a 24.4KB read limit and tripped its compaction warning during this run. I attempted an in-place compaction and it did not get under target — the index holds ~190 entries and the filenames alone are a ~17KB floor, so shortening hooks cannot fix it. It needs a real consolidation pass that **merges related memory files** (the `consolidate-memory` skill), which is better run interactively than inside an automated job. Not urgent — it still reads fine — but it will keep growing daily.
