# Internal Linking Report — 2026-09-18

**Scope:** all 509 pages in `/education/`
**Method:** built the full internal link graph, then ranked pages by outgoing
internal links. Candidate targets chosen by TF-IDF body-text similarity (not
slug matching), with a tie-break toward low-inbound pages so link equity
reaches thin content.

## Result

48 new internal links added across 12 pages (4 each).

| Page | Out before | Out after |
|---|---|---|
| water-safety-activities-at-home-printable | 7 | 11 |
| teaching-kids-safe-pool-entry | 9 | 13 |
| swim-lesson-reward-chart-printable | 9 | 13 |
| water-confidence-challenge | 9 | 13 |
| water-slide-safety-kids | 10 | 14 |
| water-confidence-challenge-printable | 10 | 14 |
| fall-swim-schedule-planner-printable | 10 | 14 |
| legal-swim-instructor-student-ratio | 10 | 14 |
| pool-drain-entrapment-safety-checklist-printable | 10 | 14 |
| swim-level-translator | 10 | 14 |
| heat-exhaustion-kids-pool | 11 | 15 |
| beach-sand-hole-collapse-safety | 11 | 15 |

The site-wide floor for outgoing links moved from **7 to 10**. Existing
markup conventions were matched per page (`related-articles` list,
`related-grid` cards, and the inline-styled card variant).

## Verification

- Every new href resolves to an existing file — no broken links.
- Every new href points to a **git-tracked** file, so nothing 404s on `live`.
- No duplicate cards; `<a>` and `<div>` tag balance unchanged on all 12 pages.

Two planned targets were swapped because their pages exist on disk but are
**not committed**, so they would have 404'd in production:

- `survival-swim-skill-decoder` → `ymca-safety-around-water-saw-explained`
- `beach-flag-color-card` → `camping-water-safety-checklist`

## Blocked: could not commit or push

The repo has **stale git lock files** from a crashed git process at 09:01 today:

- `.git/index.lock`
- `.git/refs/heads/live.lock`

The workspace mount denies file deletion, so git cannot commit until these are
removed. The permission request to delete them was auto-declined because no one
was available to approve it during a scheduled run.

**The linking work is saved in the working-tree files** — the HTML on disk is
updated and verified. It just is not committed or pushed.

To ship it:

```bash
cd ~/Documents/Claude/Projects/WATERWISEKIDS.COM
rm -f .git/index.lock .git/refs/heads/live.lock
git add education/    # or just the 12 files above
git commit -m "Internal linking: strengthen cross-links on 12 under-linked education guides"
git push origin live
```

## Other findings (not acted on)

- **Repo has a large uncommitted backlog:** 66 modified and 246 untracked files
  predating this run. Several education pages referenced by existing internal
  links are untracked, meaning those links already 404 on `live` — worth a
  separate pass.
- `education/swim-lesson-cost-worksheet.html` and
  `education/swim-lesson-cost-worksheet-printable.html` are 422-byte
  comment-only stubs with no article content. They were excluded from linking.
  Nothing was deleted.
- 195 education pages have no related-article block at all, though most still
  carry 11+ in-body contextual links. A follow-up run could add blocks there.
