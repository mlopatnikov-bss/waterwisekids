# SEO Optimizer — 2026-09-16

## Headline: the local checkout is stale and cannot be pushed

The `live` branch in this folder and `origin/live` on GitHub have **completely
unrelated histories** — no shared root commit, empty merge-base.

| | last commit | position |
|---|---|---|
| local `live` | 2026-08-20 `[css-regression] Report 2026-08-20` | 273 commits not on remote |
| `origin/live` | 2026-09-16 `[compliance] Ignore 12 dated ops-report patterns…` | 196 commits not local |

The remote is the authoritative live site and is being updated daily. This
local copy is ~4 weeks behind on a different lineage. **Push was not attempted
beyond a normal fast-forward** — the only way to push from here would be a force
push that destroys 196 remote commits, which is not a call this task should make.

**Needs a human decision.** Likely fix: re-clone `origin/live` into this folder,
or re-point the scheduled task at whatever checkout the remote commits are
coming from.

## The live site has no outstanding SEO defects

Audited all 782 HTML pages of `origin/live` (extracted read-only):

| Check | Result |
|---|---|
| Missing meta description | 0 |
| Duplicate meta descriptions | 0 |
| Missing `<title>` | 0 |
| Missing image `alt` | 0 |
| Missing OG tags | 0 |
| Incomplete OG set | 0 |
| Missing `twitter:card` | 0 |
| Missing JSON-LD | 0 |
| Invalid JSON-LD | 0 |
| Missing canonical | 0 |

The 23 canonical "mismatches", 17 missing-H1s and 12 duplicate titles the scan
flagged were each verified as intentional `meta http-equiv="refresh"` redirect
stubs pointing canonical at their destination. Correct behavior, not defects.

### Two minor, optional items on live

1. **8 titles over 65 characters** (SERP truncation risk) — all in `/education/`:
   `cold-water-safety-checklist-printable`, `fishing-water-safety-checklist`,
   `index`, `kiddie-pool-safety-checklist-printable`,
   `public-pool-safety-checklist-printable`, `swim-instructor-continuity-worksheet`,
   `swim-lesson-medical-information-form`, `swim-school-child-protection-audit-printable`.
2. **2 printable checklists** use question-style section headers without FAQPage
   schema (`swim-instructor-questions-checklist-printable`,
   `swim-school-policy-fine-print-checklist-printable`). Defensible as-is — they
   are checklists, not Q&A pairs.

Neither was changed; both are judgment calls, and neither could be pushed anyway.

## Work committed locally (redundant — do not salvage)

Commit `0e211752b` on the local `live` branch, 17 files:

- FAQPage JSON-LD added to 4 article pages (5 Q/A each, drawn verbatim from
  visible H2 questions and body copy)
- `og:url` aligned to `rel=canonical` on 13 redirect stubs

**All 4 pages already carry FAQPage schema on `origin/live`.** The fixes were
made against the stale snapshot before the divergence was found, and are
superseded. The commit is inert on an unpushable branch; no action needed.

## Repo health notes

- `.git/index.lock` is stale (0 bytes, 06:02) and **cannot be removed** — the
  mount blocks file deletion. Staging required a temporary index
  (`GIT_INDEX_FILE`). Side effect: the on-disk `.git/index` is stale relative to
  `HEAD`, so `git status` will show phantom modifications until it refreshes.
- Same no-delete restriction leaves orphaned `.git/objects/*/tmp_obj_*` files.
- Two abandoned 422-byte draft stubs in `education/`
  (`swim-lesson-cost-worksheet.html`, `-printable.html`) are untracked, absent
  from the sitemap, and have zero inbound links. Superseded by the
  `multi-child-` versions. They were correctly skipped by the optimizer.
- The `origin` remote URL embeds a GitHub personal access token in plaintext.
  Worth rotating and moving to a credential helper.

## Cleanup

Mandatory workspace cleanup ran. `/tmp` clear, disk at 50%.
