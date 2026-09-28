# New Content Validation — 2026-09-25

**Window:** commits on `origin/live` from 2026-09-24 ~09:15 through 2026-09-25 09:15 EDT. There were 6 commits, and the latest is `8d3987f3f` ("[publish] Goggles head-term fixes").
**Source validated:** the published `origin/live` tree, extracted fresh. The local checkout was not used because it has diverged (see below).
**Result: ✅ All checks pass. No fixes were needed, so nothing was pushed.**

## Commits in window

| Commit | What changed |
|---|---|
| `8d3987f3f` | Goggles: /gear answer-first section, prescription-goggles page retitled, 8 contextual links |
| `82861c52b` | AEO copy added to 3 directory pages (mississippi, north-dakota, west-virginia) |
| `7fc442f9e` | Article.image schema added to 4 education articles |
| `adb5e3632` | QA copy fixes and a main.css cache key fix |
| `4b3d159b2` | **New:** Parent & Me Swim Class Card (a landing page, a printable, and an SVG card) plus 6 inbound links |
| `6b1842334` | 44px touch targets and a site-wide CSS cache-bust (`v=20260924m`). This commit is why so many files show as changed. |

## Education articles: structural template checks (449 files)

Every education HTML file touched in the window got all 13 required-class checks and all 4 banned-pattern checks. The cache-bust commit is why the count is so high.

- ✅ **447 PASS**
- ➖ **2 exempt:** `parent-and-me-swim-class-card-printable.html` (new) and `electric-shock-drowning-risk-card-printable.html`. Both are `noindex` print sheets in the house printable format, which has no article layout. This matches every other `*-printable.html` on the site and is not a defect.
- No page uses a banned pattern (`<article>`, `article-layout`, `article-main`, or `<main class="main-layout">`).

## Extended checks (25 pages with substantive edits)

- **JSON-LD:** every block parses. Every indexable article has Article, FAQPage and BreadcrumbList schema. (`education/index.html` is the hub page and correctly has no Article schema.)
- **Nav and footer:** these match the reference article on every education article, ignoring whitespace and cache-bust query strings.
- **Internal links:** no broken internal links. The `${school.website}` matches on the 4 directory pages are JavaScript template literals, not real hrefs.
- **Image alt text:** every `<img>` has alt text.
- **OG tags:** every page has og:title, og:description, og:image and og:url.
- **Sitemap:** every indexable changed page has an entry, including the new `parent-and-me-swim-class-card`. The printable is `noindex` and is correctly left out.
- **CTAs:** standard articles have 4, the same as the reference. The lead-magnet and checklist landing pages have 2 (the sidebar CTA and its button), which is the pattern on every existing card landing page (water-watcher-card, beach-flag-color-card, electric-shock-drowning-risk-card).

## ⚠️ Still open: the local repo on the Mac Mini is out of sync

- Local `live` vs `origin/live`: **273 commits exist only locally, and 38 exist only on the remote.** The remote count was 27 on 09-23, so the gap is growing.
- **398 modified or uncommitted files** are in the local checkout.

I did not reconcile this. Any task that pushes from the local `live` checkout risks a conflicted or destructive push. The recommended step is still to back up local `live` to a branch, then decide which history to keep.

---
*Workspace cleanup completed per task spec.*
