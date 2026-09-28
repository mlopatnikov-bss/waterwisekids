# New Content Validation — 2026-09-15

**Result: ALL PASS.** 10 education articles changed on `origin/live` in the last 24 hours. Zero template, CSS, schema, nav, footer, CTA, or sitemap failures. Nothing fixed, nothing pushed.

---

## Scope

`git log origin/live --since="24 hours ago"` → 4 commits, 25 HTML files changed.

| Commit | Time | Summary |
|---|---|---|
| `c45b07a8f` | 09-15 08:15 | De-cannibalize pool-fence pair, lightning governing bodies, town-answer pattern on 7 states |
| `debbdd02a` | 09-15 07:42 | AEO optimize 4 top-level pages |
| `bd4ad7b48` | 09-14 10:25 | Move new sections above Bottom Line + TOC entries |
| `a902378f8` | 09-14 10:24 | SafeSplash level column, Roark layer, PA town-answer on 4 states |

**Education articles validated (10):**
backyard-pool-fence-requirements · flow-pools-vs-traditional-pools · four-cs-of-progress-swim-curriculum · lightning-pool-safety · private-equity-swim-school-ownership · swim-level-translator · swim-school-consolidation-explained · swimming-pool-fence-laws-by-state · swimtastic-safesplash-swimlabs-comparison · video-analysis-swim-lessons

Also sitemap-checked: 12 state directory pages, 2 top-level `how-*` pages, 2 top-level `why-*` pages.

---

## Structural checks — 10/10 PASS

Every article carries all 13 required markers and zero banned patterns.

**Required (all present, all 10 files):** `main-layout` · `<main class="article">` · `article-header` · `article-meta-item` · `article-body` · `article-excerpt` · styled breadcrumb (`background: #f8fafc`) · `main.css` · `article.css` · `GTM-5DN8B3QT` · `tldr-box` · `FAQPage` · `sidebar`

**Banned (zero occurrences, all 10 files):** `article-layout` · `article-main` · `</article>` · `<main class="main-layout">`

## Schema, meta, and accessibility — 10/10 PASS

Per file: 1× Article JSON-LD, 1× BreadcrumbList, 1× FAQPage, 1× `og:title`, 1× `og:image`, 1× canonical, 1× `twitter:card`, 1× `<nav>`, 1× `<footer>`, exactly one `<h1>`, 2 images — **0 images missing alt text**.

**FAQ schema ↔ visible text:** every `mainEntity` question string was matched against the rendered page text. All questions appear on-page. No orphaned schema questions (the failure mode `a6f053ea7` fixed on 08-15 has not recurred).

## Nav, footer, CTA — 10/10 PASS

Nav and footer blocks hashed and compared byte-for-byte (whitespace-normalized) against the reference article `education/swim-milestones-by-age.html`. All 10 match exactly. All 10 carry a CTA / directory link.

## Internal links — PASS

10 links initially flagged were false positives: directory-relative hrefs from inside `education/`. All 8 unique targets confirmed present on `origin/live` (`swim-school-facility-models`, `warm-water-swim-lessons`, `cpr-basics-parents`, `swim-instructor-training-hours-compared`, `swim-instructor-turnover-continuity`, `swim-class-ratio-by-level`, `new-pool-owner-water-safety-checklist`, `two-self-rescue-skills-children`). **No broken internal links.**

## Sitemap — 25/25 PASS

All 25 changed HTML files have a `<loc>` entry in `origin/live:sitemap.xml` (656 URLs total).

---

## ⚠️ Needs your attention: the local repo on this Mac Mini is not in sync with live

This does not affect the validation above — I validated file contents pulled directly from `origin/live`, which is what is actually published. But the local checkout is in a state that will cause problems the next time anything is pushed from this machine.

**1. `live` has diverged from `origin/live` — it is not merely behind.**

```
git rev-list --left-right --count live...origin/live
272   192
```

272 commits exist locally that are not on the remote; 192 exist on the remote that are not local. Local HEAD is `2476831c5` (2026-08-20); remote HEAD is `c45b07a8f` (2026-09-15) — about 26 days of published work missing locally. A divergence this shape usually means a history rewrite happened on one side.

**2. 23 uncommitted modified files — and every one of them also changed on the remote.**

Full overlap between locally-modified files and files changed on `origin/live`. A merge or rebase will conflict on all 23, including `sitemap.xml`, `index.html`, `education/index.html`, and 20 education articles (mtimes 08-19 through 09-05).

**3. 223 untracked files**, mostly accumulated `AEO-REPORT-*.md` / `AUDIT-REPORT-*.md` / `CSS-REGRESSION-REPORT-*.md` output.

**I did not attempt to reconcile this.** Any fetch-and-merge, reset, or push risks destroying either the 272 local commits or the 26 days of published work, and there is no safe way to judge which side is authoritative without you. Recommended next step before running any publishing task from this machine: create a backup branch of the current local `live`, then decide whether the Mac Mini's history or the remote's is the keeper.

Until that is resolved, scheduled tasks that push from this machine should be treated as unsafe to run.

---

*Workspace cleanup completed per task spec.*
