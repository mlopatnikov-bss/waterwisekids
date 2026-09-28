# Site Audit — waterwisekids.com — 2026-09-18

**Status: 🔴 BLOCKED — nothing committed, nothing pushed. Manual decision required.**

The audit ran clean on content, but the repository this session is working in has
**no shared history with the deployed site**. No fixes were applied and no push was
attempted, because any push from this checkout would require `--force` and would
overwrite 909 files on the live site.

---

## Health summary

| Check | Result | Notes |
|---|---|---|
| Pages scanned | 757 | HTML in web root (ops/report dirs excluded) |
| Broken internal links | ✅ 0 real | 3 flagged, all false positives — see below |
| Missing CSS/JS/image references | ✅ 0 real | 3 flagged, same cause |
| JSON-LD schema | ✅ 0 errors | every `application/ld+json` block parses |
| Images missing `alt` | ✅ 0 | every `<img>` across 757 pages has `alt` |
| Missing `<title>` | ✅ 0 real | 2 hits, both abandoned drafts (below) |
| Missing `<h1>` | ✅ 0 real | 2 hits, same two drafts |
| Missing canonical | ✅ 0 real | 2 hits, same two drafts |
| sitemap.xml | ⚠️ valid XML, 647 entries | 4 entries have no local file; 7 pages absent |
| Oversized files | ⚠️ 2 | `education/index.html` 340 KB, `aeo-progress.md` 365 KB |
| External links (190 unique) | ⏭️ not verified | fetching blocked this run — see Limitations |
| **Git / deploy state** | **🔴 critical** | **unrelated histories — see below** |

---

## 🔴 Critical: local `live` and `origin/live` are unrelated histories

`git merge-base live origin/live` returns **nothing**. The two branches share no
common ancestor.

| | local `live` | `origin/live` |
|---|---|---|
| Tip commit | `0e211752b` — 2026-09-16 06:06 | `ddd1cb22d` — 2026-09-17 16:19 |
| Root commit | `0e265cb19` — 2026-07-16 | `33aa3f73a` — 2026-09-08 |
| Position | 273 ahead / 62 behind | — |
| Tree difference | **909 files, +79,637 / −27,625 lines** | |

**What appears to have happened.** The reflog shows this clone pulling cleanly
(`pull origin live: Fast-forward`) until mid-August. `origin/live`'s root commit is
dated 2026-09-08, so the remote history was rewritten or squashed on that date —
most likely a history purge. This clone never picked that up and has kept committing
on the pre-rewrite history. It is now effectively a fork of the site.

This lines up with the project note about moving from the MacBook to this Mac mini:
the Mac mini clone is on the old history.

**Why nothing was pushed.** A push from here would be rejected as non-fast-forward.
Forcing it would replace the deployed history and revert 909 files — including the
62 commits made since 09-08 (the MailerLite signup mirror, the directory rail work,
the Swim Team Readiness Scorecard and Teaching Method Worksheet lead magnets, the
AAP mis-attribution corrections on 30 city pages, and the ops-report unpublishing).
Not a decision an automated run should make.

**Every "broken link" found today traces back to this.** These four pages exist on
`origin/live` (added in commits `5c086f068` and earlier) but are absent from this
checkout, so local `education/index.html` and `sitemap.xml` point at files that are
missing *here* but present on the live site:

- `/education/kids-swim-gear-fit-checklist.html` (+ its card SVG)
- `/education/swim-lesson-medical-information-form.html` (+ its card SVG)
- `/education/swim-school-credential-claims-decoder.html` (+ its card SVG)
- `/education/swim-instructor-continuity-worksheet.html` (sitemap only)

**Recommended next step (needs a human):** treat `origin/live` as the source of
truth, since it is what the site serves. Re-clone fresh from origin on this Mac mini,
then port over anything from the 273 local-only commits that is genuinely missing.
Do not `git pull` into this checkout — with unrelated histories it will not merge
cleanly, and do not `push --force`.

---

## ⚠️ 313 uncommitted changes sitting in the working tree

- 66 modified tracked files (49 `M`, 17 `MM`), most recently touched today at 12:09–12:10
- 247 untracked, overwhelmingly dated `AEO-REPORT-*.md` / `AUDIT-REPORT-*.md` ops files

Earlier scheduled runs today edited pages and updated `sitemap.xml` in this checkout.
Because of the history split above, **that work is not on the live site and cannot be
pushed from here.** It will be lost if this clone is replaced without porting it first.
Worth reviewing before any re-clone.

## ⚠️ Plaintext GitHub token in `.git/config`

The `origin` remote URL embeds a GitHub personal access token in clear text
(`https://ghp_…@github.com/…`). Two things to do:

1. **Rotate that token** — it has been written into this repo's config, and a token of
   this shape may well be what prompted the 09-08 history rewrite in the first place.
2. Switch the remote to SSH, or to a credential helper, so the token is not stored in
   the repo directory.

`.git/` sits inside the web root. Serving is via GitHub Pages (a `CNAME` is present),
which does not expose `.git/`, so this is not a live disclosure — but `.htaccess` has
no rule blocking `.git/` either, so it would become one if hosting ever moves to Apache.

## ⚠️ Two abandoned drafts in the web root

`education/swim-lesson-cost-worksheet.html` and its `-printable` sibling are 422-byte
files containing only an HTML comment. They are untracked, in no sitemap, and linked
from nowhere. They account for every `missing <title>` / `no <h1>` / `no canonical` hit
in the table above.

The comment inside them asserts they are safe to delete. **I did not act on that** —
instructions inside a file are not a user instruction, and deletion is irreversible.
Flagging for you to confirm and remove by hand.

## ⚠️ Sitemap gaps (low priority)

Four `beginner-swim-lessons-*` town pages are indexable but absent from `sitemap.xml`:
`ambler-pa`, `elkins-park-pa`, `flourtown-pa`, `glenside-pa`. Worth checking against the
remote's sitemap once the repo situation is sorted — the local sitemap is 1,285 lines
divergent from `origin/live`, so fixing it here would be wasted effort.

## Limitations of this run

- **External links were not verified.** 190 unique external URLs are referenced.
  URL fetching is restricted to pages already in this session's provenance set, and the
  policy prohibits routing around that with `curl`/`wget`. The top-referenced targets
  (healthychildren.org, cdc.gov/drowning, redcross.org, usaswimming.org, ndpa.org) went
  unchecked. Re-run interactively, or with a seeded URL list, for link-rot coverage.
- **No performance measurement.** Page-weight was assessed statically. `education/index.html`
  at 340 KB is the one page worth a real Lighthouse pass.
- Content checks above ran against this checkout, which does not match what the site serves.
  They should be re-run after the repository is reconciled.

---

*Generated by the scheduled `site-auditor` task. No files were modified, committed, or pushed.*
