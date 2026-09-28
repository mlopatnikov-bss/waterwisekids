# New Content Validation — 2026-09-23

**Window:** commits on `origin/live` from 2026-09-22 09:13 through 2026-09-23 09:13 EDT (9 commits, latest `3c268962a`, "[publish] 2 queued demand sections + 6 upgrades")
**Source validated:** file contents taken directly from `origin/live`, which is what's published. The local checkout was not used because it has diverged (see below).
**Result: ✅ All checks pass. No fixes were needed, so nothing was pushed.**

## Education articles: structural template checks (23 files)

All 13 required-class checks and all 4 banned-pattern checks were run on each file.

| Result | Files |
|---|---|
| ✅ PASS (22) | aed-water-emergencies, after-water-scare-symptom-watch-log, backyard-pool-fence-requirements, beach-flag-color-card, beach-warning-flags-explained, cpr-adults, cpr-basics-parents, cpr-class, drowning-cpr-quick-card, electric-shock-drowning-risk-card, free-water-safety-resources, isr-vs-traditional-swim-lessons, lightning-pool-safety, parent-cpr-water-rescue-basics, secondary-drowning-dry-drowning, signs-of-drowning, swim-lesson-annual-cost-worksheet, swim-lesson-format-decision-worksheet, swim-lesson-levels-explained, swimming-ear-infections-guide, swimming-when-sick-kids, swimming-with-ear-tubes, when-to-start-swim-lessons |
| ➖ Exempt (1) | `after-water-scare-symptom-watch-log-printable.html` (new): this is a `noindex` print sheet. It follows the house printable format, which has no article layout, matching every other `*-printable.html` on the site. Not a defect. |

No page uses the banned patterns (`<article>`, `article-layout`, `article-main`, or `<main class="main-layout">`).

## Extended checks (43 changed HTML files, excluding the 50 state directory pages)

- **JSON-LD:** every block parses as valid JSON. All 22 articles have Article, FAQPage and BreadcrumbList schema. Every FAQ question in the schema also appears in the visible page text. The new sections added 3 FAQs to swimming-with-ear-tubes (8 total) and 2 to free-water-safety-resources (7 total).
- **Nav and footer:** the nav and footer match the reference article on every page. The only differences are whitespace in the logo link on 7 pages, which doesn't change how they render. The printable uses its own print footer, as all printables do.
- **Internal links:** no broken internal links on any changed page.
- **Image alt text:** every `<img>` has alt text.
- **OG tags:** every changed page has og:title, og:description, og:image and og:url.
- **Sitemap:** every indexable changed page has a `<loc>` entry. The 2 consolidated pages (`how-long-does-it-take-a-child-to-learn-to-swim`, `when-should-kids-start-swimming`) are set to `noindex, follow` and have been removed from the sitemap. Their target pages exist (`education/realistic-swim-progress-timelines.html`, `education/when-to-start-swim-lessons.html`). No other page on the site still links to either consolidated page.
- **CTAs:** the updated articles have the same CTA count as the reference article (4).

## ⚠️ Still open: the local repo on the Mac Mini is out of sync

This is the same issue flagged on 09-15, and it is still unresolved:

- Local `live` and `origin/live` have diverged: **273 commits exist only locally, and 27 exist only on the remote.**
- **94 modified files are uncommitted** in the local checkout.

I did not reconcile this. Until it's resolved, any task that pushes from the local `live` checkout risks a conflicted or destructive push. The recommended step is still to back up local `live` to a branch, then decide which history to keep.

---
*Workspace cleanup completed per task spec.*
