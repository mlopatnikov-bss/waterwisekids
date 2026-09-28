# SEO Optimizer — 2026-08-26

**Scope:** 743 HTML files on `live` (638 indexable, 85 printables, 19 redirect stubs, 1 noindex).
**Method:** fresh `/tmp` clone of `live` (never the mount), parsed with **html5lib**, every probe canary-tested before its result was trusted.
**Commit:** `25cd566` → pushed to `live`, verified live via curl.

---

## Probe failure caught before it produced a false clean

The FAQ-visibility probe reported **0 invisible questions** — and was wrong. `soup.get_text()` includes `<script>` contents, so every JSON-LD FAQ question was matching **itself inside its own schema block**. The probe could never fail.

Fixed by decomposing `script/style/noscript/template` before extracting visible text, then re-canaried. This is a new variant of the known `get_text_space_fakes_faq_invisible` class and is the only reason the FAQ defect below was found at all.

Every other sweep in this run was canary-gated the same way, and cardinality was asserted (e.g. 2,902 FAQ answers actually tested, not 0 silently filtered out).

---

## Fixed

### 1. 53 pages served undersized social/structured-data images

Each of these 53 pages declared `twitter:card="summary_large_image"` while pointing `og:image`, `twitter:image`, **and** the JSON-LD `Article.image` at a **600×360** card JPEG — below the 1200×630 minimum for a large Facebook/LinkedIn/X card, and below Google's ≥1200px guidance for structured-data images. Result: downgraded thumbnail cards instead of large ones, and images ineligible for rich results.

The site already had a clear convention — 475 pages use the sitewide 1200×630 asset and 208 use Pexels URLs sized `w=1200&h=630`. These 53 were the only outliers.

**Action:** repointed all three references to the sitewide 1200×630 asset and corrected `og:image:width`/`height`. Exactly 3 URL + 2 dimension replacements per page, asserted — no page deviated.

**No visual change:** the card images were meta/schema-only references, never rendered as a visible `<img>`.

*Trade-off, logged:* this swaps 53 unique card images for the generic branded image. A large generic card outperforms a small specific one, so this is a net win today — but the ideal fix is generating true 1200×630 per-page cards. There is no card generator in the repo and no higher-resolution source (all 361 card assets are 600×360), so that remains a follow-up needing new assets. `og:image:alt` was deliberately left page-specific rather than copied from the sitewide pattern, which names British Swim School and would have spread an owner-identity reference onto 53 more pages.

### 2. FAQ schema name did not match its visible heading

`education/swim-clinics-intensive-camps.html` — schema said *"What is a 5-day swim clinic and what happens each day?"* while the page showed *"What Is a 5-Day Swim Clinic, and What Happens Each Day?"*. Synced schema to the visible text verbatim.

---

## Clean — verified, not assumed

Meta descriptions (0 missing, 0 duplicate, 0 outside 70–165 chars, 0 outside `<head>`) · titles (0 missing, 0 duplicate) · OG + Twitter tags (0 missing across all six fields) · canonicals (present, single, in-head, all resolving to real files; 0 mismatches against `og:url`) · alt text (0 images missing `alt`, 0 junk/filename alts) · JSON-LD (0 parse failures, 0 pages without schema, 0 Article missing required fields, 0 BreadcrumbList position defects, 0 HowTo defects) · all 2,902 FAQ answers match visible page text · 0 metas leaked into `<body>` · all local `og:image` and schema image URLs resolve.

---

## Not touched, on purpose

**82 printable pages with `schema.headline` ≠ `H1`** — this is the established printable convention, not a defect. Confirmed all 82 are printables and 0 are content pages. (Previously recorded as 81; one printable has been added since.)

**128 titles outside 25–65 characters** — mostly 66–78 chars. Google truncates on pixel width, not character count, and these read well. Mass-rewriting 128 titles is high-risk, low-return; flagged rather than changed.

**Sitemap `lastmod` not bumped** for the 54 edited files — the change is social-metadata only, not content. Bumping would inject exactly the kind of inflated-lastmod noise previously cleaned up.

---

## Needs Michael

**Generating true 1200×630 per-page social cards for the 53 pages.** Today's fix restores large cards using the generic brand image; unique per-page imagery would likely convert better but requires new assets and a generator that doesn't exist in the repo yet.
