# Site Audit — waterwisekids.com

**Date:** 2026-09-22
**Audited revision:** `origin/live` @ `cba262f86` (what is actually deployed)
**Pages scanned:** 803 HTML files
**Commits pushed:** none — see "Blocked: repo out of sync"

---

## Health summary

| Check | Result | Status |
|---|---|---|
| Broken internal links | 0 | PASS |
| Missing CSS / JS / image references | 0 | PASS |
| HTML structural errors | 0 | PASS |
| Broken JSON-LD schema | 0 | PASS |
| Images missing `alt` text | 0 | PASS |
| Sitemap dead entries | 0 of 669 URLs | PASS |
| Sitemap coverage gaps | 0 (108 omissions all correctly `noindex`) | PASS |
| Oversized pages (>150 KB) | 2 | WATCH |
| Titles over 65 chars | 47 | WATCH |
| Meta descriptions under 50 chars | 44 | WATCH |
| **Local repo sync** | **273 ahead / 20 behind origin** | **ACTION NEEDED** |
| **Credential hygiene** | **GitHub token in `.git/config`** | **ACTION NEEDED** |

**The live site is healthy.** Every content-integrity check passed. The two items
needing attention are both about this machine's local repository, not the website.

---

## Blocked: local repo is out of sync with origin

This is the finding that matters, and it is why nothing was pushed.

| | Commit | |
|---|---|---|
| Local `live` | `0e211752b` | 273 commits ahead of origin |
| Remote `live` | `cba262f86` | 20 commits ahead of local |
| Stale tracking ref | `d5b85526a` | was 20 commits behind reality until this run fetched |

The branches have **genuinely diverged**. The 20 commits only on origin are real
deployed work from the cloud agents — `[visual-qa]`, `[css-regression]`,
`[publish]`, `[index-compliance]`, `[internal-linking]`, `[lead-magnet]`, and
others. Pushing on top of the local branch would have been rejected as a
non-fast-forward; forcing it would have **destroyed those 20 deployed commits**.
So the push was deliberately not attempted.

There are also **376 uncommitted files** in the working tree (17 staged, the rest
unstaged) — accumulated output from earlier scheduled runs on this machine:
sitemap `lastmod` rewrites, related-article cards, FAQPage schema, `og:image`
dimensions.

### What this means for the audit

The 5 HTML validation errors I initially found existed **only in the stale local
copy**. Checked against `origin/live`, all five files are already clean — the
cloud agents fixed them in the 20 commits this machine never pulled. There was
nothing to fix and nothing to push. The working tree was left exactly as found
(376 changes, unmodified by this run).

### Suggested resolution (needs a human — do not automate)

Given the Mac mini is becoming the permanent home for this project, the cleanest
path is probably to treat origin as the source of truth:

1. Back up the current working tree (it holds unreviewed work).
2. `git fetch origin && git reset --hard origin/live` to realign.
3. Re-apply anything from the 376 uncommitted files that is still wanted.

The alternative — rebasing 273 local commits onto origin — is likely not worth it
if those commits are superseded by what already shipped. Worth a look before
deciding.

---

## Stale git lock files

Seven lock files are left over from crashed runs, and this sandbox **cannot
delete files inside `.git`** (`unlink: Operation not permitted`), so they could
not be cleared automatically:

```
.git/index.lock                     2026-09-22 05:12
.git/HEAD.lock                      2026-09-22 12:18
.git/objects/maintenance.lock       2026-09-22 05:12
.git/refs/heads/live.lock           2026-09-19 12:13
.git/worktrees/wwk-wt/index.lock    2026-09-16 14:12
.git/worktrees/wwk-wt/HEAD.lock     2026-09-16 14:11
.git/next-index-7.lock              2026-08-20 11:21
```

These block `git add`, `git commit`, and `git update-ref`, which is very likely
why 376 files of prior work never got committed. Clearing them from Terminal
(no git process is running) should unblock future scheduled runs:

```bash
cd ~/Documents/Claude/Projects/WATERWISEKIDS.COM
find .git -name '*.lock' -delete
```

---

## Security: GitHub token stored in plaintext

`.git/config` has the remote URL in the form
`https://ghp_<token>@github.com/mlopatnikov-bss/waterwisekids.git`.

The personal access token sits in plaintext on disk and is printed by any
`git remote -v`, in logs, and in audit output like this. Worth rotating the
token and switching to SSH or a credential helper:

```bash
git remote set-url origin git@github.com:mlopatnikov-bss/waterwisekids.git
```

Not urgent if the machine is single-user, but it is a standing exposure.

---

## Performance

| Page | Size | Note |
|---|---|---|
| `education/index.html` | 367 KB | 402 links, ~2,500 card elements; no inline CSS, 9 KB inline JS |
| `swim-lessons/directory/texas.html` | 191 KB | directory listing |
| `swim-lessons/directory/new-jersey.html` | 138 KB | directory listing |
| `swim-lessons/directory/california.html` | 117 KB | directory listing |

`education/index.html` is the one worth attention — it ships the entire article
index as static HTML on every load. Pagination or client-side lazy rendering
would cut it substantially. The directory pages are large but structurally
simple. Total asset weight is 16 MB; no single CSS/JS file exceeds 80 KB and no
image exceeds 300 KB, so asset delivery itself is fine.

---

## SEO items (editorial judgment needed — not auto-fixed)

**47 titles over 65 characters** will be truncated in search results. Longest:

- `education/index.html` — 82 chars
- `education/underwater-games-safety-card.html` — 82
- `education/jump-turn-swim-explained.html` — 80
- `education/electric-shock-drowning-risk-card.html` — 78
- `education/autism-speaks-water-safety.html` — 77

**44 meta descriptions under 50 characters** are too thin to earn a good snippet,
including `adult-swimming-lessons.html`, `education/adult-learn-to-swim.html`, and
`education/at-what-age-can-kids-swim-alone.html`.

These were left alone deliberately — rewriting titles and descriptions is a
copy decision, not a mechanical fix.

---

## External links

Most outbound links resolve normally (AAP, USA Swimming, Red Cross,
HealthyChildren, US Coast Guard Boating all returned 200).

Several return 403 to automated requests — cdc.gov, cpr.heart.org, cpsc.gov,
britishswimschool.com. This is bot filtering of datacenter traffic, **not
evidence of broken links**; they are almost certainly fine for real visitors.

One worth a manual look: **`ndpa.org`** returned a connection failure (not a
403) from this environment. Could be transient or geo/network-related, but it is
the only host that failed to connect at all. It is referenced from 107 pages.

---

## Local-only cruft (informational)

Two stub files exist in the local working tree but not on `origin/live`:

- `education/swim-lesson-cost-worksheet.html` (422 bytes)
- `education/swim-lesson-cost-worksheet-printable.html` (432 bytes)

Both are comment-only placeholders with no page content. They are untracked, not
in the live sitemap, and have no inbound links, so they have no effect on the
live site. Flagged rather than deleted — permanent deletion is outside what a
scheduled audit should do unattended, and they will disappear on their own if the
repo is realigned to origin as suggested above.

---

## Method

Static analysis of the deployed revision, extracted via `git archive cba262f86`:
link resolution against the real file tree (directory-index and extensionless
forms both honored), HTML well-formedness via a tag-stack parser with
script/style regions masked, `json.loads` on every JSON-LD block, sitemap
cross-check in both directions, and `curl` HEAD checks on the top external hosts.

The 53 "broken links" the raw scan reports on `${school.website}` are false
positives — a JavaScript template literal inside the directory pages' card
renderer, not markup. Verified and excluded.

---

*No changes were committed or pushed this run. The working tree is exactly as it
was found.*
