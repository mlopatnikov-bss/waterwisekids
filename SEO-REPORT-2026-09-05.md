# SEO Optimizer — 2026-09-05

**Corpus:** fresh clone of `origin/live` @ `2bac82fac` — 763 HTML files (93 noindex).
**Shipped:** `c04aef422` on `live`, 5 files changed.

## Presence-level sweeps — all clean (0 defects)

Every check below was canary-gated (cardinality asserted, negative canary run) before
its zero was believed.

| Check | Result |
|---|---|
| Missing meta description | 0 / 763 |
| Duplicate meta description groups | 0 |
| Meta description with unparseable `content` attr (embedded-quote defect) | 0 |
| Missing `<title>` / missing canonical | 0 / 0 |
| `og:title` / `og:description` / `og:image` / `og:url` present | 763 / 763 each |
| `og` ↔ `twitter` mirror mismatch | 0 |
| `<img>` without `alt` attribute | 0 / 1868 |
| Inline `<svg>` without accessible name | 0 (15 raw svg: 10 `aria-hidden`, 5 named) |
| JSON-LD parse errors | 0 / 2181 blocks, 13,226 nodes |
| Non-www or `http://` host inside JSON-LD | 0 / 0 |
| JSON-LD `image` / `og:image` resolving to a missing local file | 0 / 0 |
| `dateModified` in the future or before `datePublished` | 0 / 0 |
| JSON-LD `url` contradicting the page canonical | 0 |
| `Question` without a usable `acceptedAnswer`, or duplicated in-page | 0 / 0 |
| FAQ schema questions with no visible counterpart (**true** orphans) | 0 |

## Fixed

1. **`swimmers-hub/backstroke-complete-guide.html` — duplicate FAQ section.**
   The page carried two `<h2>Frequently Asked Questions…</h2>` blocks: `#faqs` with 8
   visible Q&As and **no schema**, and an appended `#faq` with 5 Q&As that were the
   *only* ones in the `FAQPage`. The sidebar TOC pointed at `#faqs`. Its three sibling
   guides each have exactly one FAQ h2, so this was drift, not design.
   Consolidated into the single `#faqs` section in that section's existing
   `<p><strong>Q: …</strong>` markup shape, removed the duplicate h2, and extended the
   `FAQPage` from 5 to **13** questions so every visible Q&A is now schema-backed.
   Verified: `div` balance 24/24, sidebar still nests under `.main-layout`, 0 orphan
   headings, FAQ parity still 0 orphans after the change.

2. **`education/bath-time-safety-infants.html` — stale `Article.headline`.**
   Schema said *"Bath Time Safety for Infants and Toddlers"*; the h1 had been rewritten
   to *"Baby Bath Safety: Bath Time Rules for Infants and Toddlers"*. Synced to the h1.

3. **`education/swim-instructor-continuity-worksheet.html` — dead speakable selector.**
   `.article > p:first-of-type` matched nothing on this page (the paragraphs sit inside
   `.article-body`). Swapped to `.article-body > p:first-of-type`, the in-corpus
   convention already used on 94 pages. Sitewide speakable selectors matching nothing:
   now 0 of 684.

4. **Two over-length meta descriptions** trimmed under the truncation threshold, with
   the `og:`/`twitter:` mirrors updated in the same pass (3 occurrences each):
   - `education/swim-instructor-continuity-worksheet-printable.html` 168 → 149 chars
   - `swim-lessons/directory/kansas.html` 171 → 140 chars (brand names deliberately
     kept — brand+city is the demand cluster; the generic tail was cut instead)

## Probe corrections worth keeping

- **FAQ parity: a first pass reported 151 orphans; the true count is 0.** The visible-question
  selector set must include `h2` — `education/cold-water-shock.html` renders its FAQ
  questions as `<h2 id="what">`. Using the verbatim set from memory
  (`h1|h2|h3|h4|h5|summary|p/strong|p/b|dt|button|legend|*[class~=faq-question]`, `.//span`
  dropped, `^[QA][:.]` stripped after whitespace collapse) took it to 0. Canary held at
  21,477 visible strings.
- **Breadcrumb last-crumb vs h1 is not a defect signal.** A sweep flagged 228 pages;
  essentially all are legitimate short crumb labels. The only real instance was
  bath-time-safety-infants, where the crumb matched the *stale headline* — that is the
  actual signature, not "crumb ≠ h1".

## Not touched, deliberately

- **`sitemap.xml` lastmod / `dateModified`** — no page's visible body-text set changed
  (the backstroke edit relocates existing Q&As; the rest are meta/schema-only). Bumping
  either would be noise. The open 356-URL lastmod↔dateModified contradiction still needs
  Michael.
- **Cache-bust keys** — no CSS or JS asset was modified.
- **214 pages hotlinking `og:image` from `images.pexels.com`** — known standing item; a
  presence check cannot detect it breaking. Unchanged this run.
- **Title / meta-description CTR rewrites** — lever flagged EXHAUSTED 2026-08-31; only
  mechanical over-length was corrected.
- Two `alt` strings of 132 chars on `education/index.html` — over a soft 125-char
  guideline only, no ranking or accessibility impact. Left alone rather than churn.
