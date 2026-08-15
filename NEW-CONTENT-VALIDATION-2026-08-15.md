# New Content Validation — 2026-08-15

Branch: `live` @ `eff5ebd` (matches `origin/live` — deployed, both URLs return 200)

## Scope

15 commits in the last 24 hours. Two of them added new pages; the rest were site-wide
sweeps (FAQ schema sync, og:image fixes, CTR meta/title rewrites, noindex+canonical
resolution) that touched **398 education articles** — so all 398 were re-validated for
structural regressions, not just the new ones.

## New pages (added in last 24h)

| File | Result |
|---|---|
| `education/daycare-school-water-safety-questions-checklist.html` | ✅ PASS — all 17 checks |
| `education/daycare-school-water-safety-questions-checklist-printable.html` | ✅ PASS (printable template) |
| `assets/images/cards/daycare-school-water-safety-questions-checklist.svg` | ✅ present |

### Main article detail

- Structure: `main-layout` / `<main class="article">` / `article-header` /
  `article-meta-item` / `article-body` / `article-excerpt` / `sidebar` — all present
- Banned patterns (`article-layout`, `article-main`, `</article>`, `<main class="main-layout">`) — none
- Assets: `main.css?v=20260814b`, `article.css?v=20260718vqa` (both cache-busted), GTM-5DN8B3QT present
- Styled breadcrumb present; `tldr-box` present; header + footer present
- Schema: Article, FAQPage (5 Q&A), BreadcrumbList, Organization, SpeakableSpecification — 1 Article node, no duplicates
- **FAQ schema ↔ visible copy: all 5 Q&A pairs verified present in body text** (the failure mode from the 2026-08-14 site-wide fix)
- Meta description 148 chars (under 160); canonical self-referencing; full OG set; og:image resolves
- All internal links resolve; zero images missing alt text
- Sitemap entry present (`lastmod 2026-08-14`, priority 0.8)
- Not an orphan — 5 inbound links (education index + 4 related guides)

### Printable detail

Correctly follows the *printable* template, not the article template: `printable-checklist.css?v=20260722b`,
GTM present, `noindex` paired with a **self**-canonical (correct — not the cross-canonical
conflict pattern), correctly **excluded** from sitemap, linked 6× from the parent article.

## Site-wide regression sweep (398 modified education articles)

| Check | Result |
|---|---|
| 13 required structural classes/assets | **0 failures** |
| 4 banned layout patterns | **0 occurrences** |
| Missing meta description | **0** |
| Meta description > 160 chars (entity-decoded) | **0** — the recurring overflow bug is clean today |
| og:image referencing a non-existent file | **0** — confirms the `ed17cbc` fix held |

## Actions taken

None required. No files modified, nothing pushed — the tree already validates clean.

## Notes

- Meta-description length was measured after decoding HTML entities (`&mdash;`, `&amp;`,
  `&rsquo;`), since raw-byte counting overstates length and was the source of past false
  positives/negatives on this check.
- The 2026-08-14 FAQPage schema/visible-content sweep did not regress: the new article
  ships matching visible copy for every schema Q&A.
