# Site Audit — waterwisekids.com — 2026-09-19

**Status: 🟢 Site healthy. Nothing committed or pushed — no fix met the bar for an
unattended change.**

Audited a fresh `--depth 1` clone of `origin/live` (tip `fa95c21`, 2026-09-19 13:17),
not the mount. The mount is still on an unrelated history — see the git section.

---

## Health summary

| Check | Result | Notes |
|---|---|---|
| Pages scanned | 793 | HTML on `origin/live`, ops dirs excluded |
| Broken internal links | ✅ 0 | every `href`/`src` resolves to a file on disk |
| Missing CSS / JS / image refs | ✅ 0 | |
| CSS cache-bust keys | ✅ consistent | 13 assets, one version key each, no unversioned refs |
| JSON-LD schema | ✅ 0 errors | every `application/ld+json` block parses |
| Images missing `alt` | ✅ 0 | across all 793 pages |
| Missing `<title>` / `<h1>` / canonical | ✅ 0 real | 17 `no-h1` hits are all redirect stubs |
| Meta descriptions | ✅ 793/793 present, all 70–160 chars | none missing, none over or under |
| Duplicate element IDs | ✅ 0 real | 52 flagged, all inside JS template literals |
| Markup balance | ✅ 0 real | 1 flagged, the stray `<div` is inside a comment |
| sitemap.xml | ✅ 664 entries, 0 dead | all resolve; `lastmod` current through 2026-09-19 |
| noindex ∩ sitemap conflicts | ✅ 0 | |
| robots.txt | ✅ valid | `Allow: /` + sitemap declared |
| Oversized files | ⚠️ 1 | `education/index.html` 360 KB |
| Title length | ⚠️ 42 over 65 chars | truncation risk in SERP |
| Heading level skips | ⚠️ 67 pages | usually `h1 → h3` |
| External links | ⚠️ partial | 4 top targets verified live; rest blocked, see Limitations |
| Git / deploy state | 🔴 unchanged | mount still a fork of the live history |

Every mechanical axis came back clean. The four items below are judgment calls, not
defects an automated run should have silently rewritten.

---

## 🔴 1. AAP citations point at a superseded policy statement

The site cites the AAP **"Prevention of Drowning" policy statement** in 12 places. All
12 point at the **2021** statement (*Pediatrics* 148(2):e2021052227).

That statement has been **superseded by a 2026 policy statement** — *Prevention of
Drowning: Policy Statement*, *Pediatrics* 158(1):e2026077410 (doi 10.1542/peds.2026-077410).
Confirmed against publications.aap.org this run.

This matters more here than on a typical site: these links carry the layers-of-protection
and swim-lesson-age claims that the drowning-prevention content is built on, and the 2026
statement is the version a reader or an AI answer engine will now surface.

**Secondary problem — the URLs are internally inconsistent.** AAP URLs are
`/pediatrics/article/{vol}/{issue}/{eid}/{articleId}/{slug}`. The site uses **four different
article IDs for the same document**, and none is the ID AAP currently serves (`179784`):

| Article ID used | Count | Files |
|---|---|---|
| `179589` | 3 | `education/swim-team-readiness.html`, `education/babysitter-water-safety-checklist.html` (×2) |
| `179788` | 3 | `education/babysitter-water-safety-checklist.html` |
| `179775` | 2 | `swimmers-hub/freestyle-complete-guide.html` |
| `179780` | 1 | `education/babysitter-water-safety-checklist.html` |
| *(no ID — bare eid)* | 3 | mixed |

**Why I did not fix this automatically.** Two reasons. The URL normalization alone is
cheap, but it would leave the citation pointing at a retired policy — so these links have
to be touched by hand anyway, and fixing the ID first is churn. And the fetch tooling could
not return a status code for any AAP URL this run, so I could not prove the current links
are broken rather than silently redirected.

**Recommended:** route this to the content pipeline — re-point all 12 to the 2026 statement
and re-check the surrounding prose against it. The 2021 → 2026 update is the kind of change
that can move a claim, not just a link.

## ⚠️ 2. `education/index.html` is 360 KB

The only page-weight outlier on the site, and it grew from 340 KB at the 09-18 audit.
It is not scripts (9 KB) or inline CSS (0) — it is card markup for every education page,
rendered in full at load. Second-heaviest page is `swim-lessons/directory/texas.html` at
190 KB; nothing else clears 150 KB. No image on the site exceeds 200 KB.

Worth a real Lighthouse pass and, if it keeps growing, pagination or lazy rendering on the
hub. Not an automated fix.

## ⚠️ 3. 42 titles run past 65 characters

Longest are 82 chars (`education/underwater-games-safety-card.html`,
`education/index.html`). Google truncates around 60–65. The site has a firm meta-description
discipline (all 793 within 70–160), so the title cap looks like the one envelope not being
enforced. Editorial call — left alone.

## ⚠️ 4. 67 pages skip a heading level

Almost all `h1 → h3`, e.g. `education/swim-lesson-quality-checklist.html`,
`education/pool-safety-rules-printable.html`, `aquatic-jobs/index.html`. A WCAG 1.3.1
advisory issue. Deliberately not fixed: heading levels on this site are styling-coupled,
so promoting `h3 → h2` changes the rendered size and would land as a visual regression.
Needs a paired CSS change.

## 🔴 Git: the mount is still a fork of the live history

Unchanged from the 09-18 audit, and it is the thing most worth Michael's attention.

| | mount (`/WATERWISEKIDS.COM`) | `origin/live` |
|---|---|---|
| Tip | `0e211752b` (2026-09-16) | `fa95c21` (2026-09-19 13:17) |
| `git merge-base` | **empty — no common ancestor** | |
| Uncommitted | **334 changes** in the working tree | — |

The mount's `origin/live` ref is also stale (`92364a6cb`, the 08:13 commit), so it is
behind even its own remote-tracking branch. Other scheduled tasks are publishing fine —
they clone from origin and push from the clone, which is why the live site is healthy
while this checkout drifts further away every day.

**The 334 uncommitted changes in the mount cannot be pushed from there and will be lost
if the clone is replaced.** Same recommendation as 09-18: re-clone fresh from origin on
this Mac mini, porting anything genuinely missing out of the local-only commits first.
Do not `pull` and do not `push --force`.

Also still outstanding: the plaintext GitHub PAT in `.git/config` (rotate it), and the
dangling locked worktree entry for `/tmp/wwk-wt` — one interactive `git worktree prune --force`
clears it.

## Limitations of this run

- **External links only partially verified.** 6,780 external references across 151 hosts.
  `web_fetch` is restricted to URLs already in the session's provenance set, and routing
  around it with `curl`/`wget` is prohibited; the browser pane needs a site approval nobody
  is present to give. I verified the four highest-referenced targets via search
  (**2,165 references, 32% of all external link volume**) — all live:
  healthychildren.org Water-Safety-And-Young-Children (635 refs, retitled to *"Drowning
  Prevention for Curious Toddlers"*, last updated 2026-05-18), cdc.gov/drowning
  data-research/facts (452), redcross.org swim-lessons (293), aap.org drowning-prevention
  hub (185). The remaining 147 hosts went unchecked.
- **No runtime measurement.** Page weight is static; no Lighthouse, no console or layout
  checks — those belong to the css-regression and functionality tasks, which ran clean today.

---

*Generated by the scheduled `site-auditor` task. Audited `origin/live` @ `fa95c21`.
No files were modified, committed, or pushed.*
