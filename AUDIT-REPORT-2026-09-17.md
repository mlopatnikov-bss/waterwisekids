# Site Audit — waterwisekids.com

**Date:** 2026-09-17
**Audited tree:** `origin/live` @ `7c7ab3a85` (785 HTML pages, 42 MB)
**Commits / pushes this run:** none — see blocker below

---

## Health summary

| Check | Result | Status |
|---|---|---|
| Broken internal links | 0 real (51 static-analysis false positives) | PASS |
| Broken absolute self-links | 0 of 763 checked | PASS |
| Missing CSS references | 0 | PASS |
| Missing image files | 0 | PASS |
| Images without `alt` | 0 of 1,400+ | PASS |
| Invalid JSON-LD | 0 of ~2,300 blocks | PASS |
| Missing `<title>` | 0 | PASS |
| Missing meta description | 0 | PASS |
| Missing canonical | 0 | PASS |
| Missing `<html lang>` | 0 | PASS |
| Multiple `<h1>` per page | 0 | PASS |
| Duplicate element IDs | 0 real (52 false positives) | PASS |
| Sitemap entries → missing files | 0 of 659 | PASS |
| Indexable pages missing from sitemap | 0 | PASS |
| Sitemap freshness | newest `lastmod` 2026-09-17 | PASS |
| robots.txt | present, `Allow: /`, sitemap declared | PASS |
| Render-blocking JS in `<head>` | 0 pages | PASS |
| Oversized files (>400 KB) | 0 | PASS |
| **Git repository state (local)** | **unrelated history, diverged** | **FAIL** |
| External link liveness | not verifiable this run | SKIPPED |

The deployed site itself is in excellent shape. Everything below is either a
resolved false positive or an infrastructure problem with the local checkout.

---

## BLOCKER — local repo shares no history with `origin/live`

The local `live` branch and `origin/live` have **no common ancestor**
(`git merge-base live origin/live` returns empty). They are two unrelated
histories that happen to share a branch name.

```
local  live        0e211752b   2026-09-16 06:06   273 commits not on origin
origin live        7c7ab3a85   2026-09-17 12:19    60 commits not on local
merge-base                     (none)
working tree                   302 uncommitted modified/untracked files
```

Almost certainly a side effect of the MacBook → Mac mini project transfer: the
repository was re-created rather than cloned, so the local commit graph is a
fresh history built over the same files.

**No commit or push was made this run.** Publishing from this checkout would
require `git push --force`, which would discard the 60 commits of real work
currently live — including today's `[visual-qa]`, `[publish]` and `[google-index-compliance]`
commits from the other scheduled jobs. That is not a safe unattended action.

The deployed site is unaffected and current. Only this local copy is stranded.

### Suggested recovery (needs a human, ~5 minutes)

Re-clone into a clean directory and point the project at it:

```bash
cd ~/Documents/Claude/Projects
git clone https://github.com/mlopatnikov-bss/waterwisekids.git WATERWISEKIDS.COM.new
cd WATERWISEKIDS.COM.new && git checkout live
```

Then move any genuinely local-only files across and retire the old folder.
Nothing in the current working tree appears to be unique work worth
rescuing — the 302 dirty files are partially-applied edits whose finished
versions already exist on `origin/live`.

Secondary side effect: `.git` has grown to **289 MB** (plus 13 MB in `.deploy`)
holding two full histories. A fresh clone reclaims most of that.

---

## Security note

The `origin` remote URL has a GitHub personal access token embedded in
plaintext in `.git/config`. Anyone with read access to the machine or to a
backup of that folder can extract it. Recommend rotating the token and
switching to SSH or the macOS keychain credential helper. If the repo is
re-cloned per the steps above, do not carry the tokenized URL forward.

---

## False positives resolved (no action needed)

**1. 51 "broken links" to `${school.website}`**
In all 50 state directory pages plus one sibling, this string lives inside a
JavaScript template literal in `renderSchoolCard()`. It is interpolated at
runtime and never reaches the DOM as a literal href.

**2. 52 pages with "duplicate `id="schoolCount"`"**
The second occurrence is inside a JS string literal, and its injection is
guarded by `if (!document.querySelector('.directory-note'))`. Since the static
markup already carries `.directory-note`, the guard never fires when the static
`#schoolCount` is present. No runtime duplicate.

**3. 123 pages "missing canonical"**
A first-pass regex assumed `rel` preceded `href`. These pages write
`<link href="..." rel="canonical"/>` — valid HTML, attribute order is
immaterial. Re-checked: 0 pages genuinely lack a canonical.

**4. 2 pairs of "duplicate/truncated meta descriptions"**
Descriptions read as `"It"` and `"Swimmer"` only because the extraction regex
stopped at an apostrophe inside a double-quoted attribute. The live values are
complete and distinct.

**5. 19 duplicate canonical targets / 12 duplicate titles / 17 pages with no `<h1>`**
These are the 23 intentional redirect stubs plus legacy URLs consolidating onto
their canonical targets (e.g. `beginner-swim-lessons-elkins-park-pa.html` →
`swim-lessons/elkins-park-pa.html`). Correct SEO behaviour, working as designed.

**6. Pages with images but no lazy loading**
Only 3 pages with 3+ images lack `loading="lazy"`: `index.html` (11),
`about/index.html` (5), `404.html` (3). All are small above-the-fold SVG icons,
where lazy loading would hurt rather than help. `education/index.html` correctly
lazy-loads 373 of its 375 images.

---

## Not verified this run

**External link liveness (1,748 unique URLs).** URL fetching was restricted to
pages already in the session's provenance set, so no outbound HTTP checks ran.
Direct fetching via curl/wget is disallowed by policy, so this was skipped
rather than worked around.

The highest-fanout external citations, which are the ones worth watching
because a single rot event would affect hundreds of pages:

| Pages | URL |
|---:|---|
| 401 | healthychildren.org — Water-Safety-And-Young-Children |
| 277 | cdc.gov/drowning/data-research/facts/ |
| 208 | redcross.org — water-safety.html |
| 190 | redcross.org/take-a-class/swimming/swim-lessons |
| 147 | cdc.gov/drowning/ |
| 115 | usaswimming.org/foundation |

Worth a manual or separately-scheduled check, particularly the CDC URLs — that
site reorganised its drowning section relatively recently.

Minor tidiness item: several CDC paths appear in both bare-slash and
`index.html` forms (`/drowning/data-research/facts/` on 277 pages vs
`/drowning/data-research/facts/index.html` on 60). Both resolve; normalising to
one form would make future link-rot checks cheaper.

---

## Content profile (for reference)

| Metric | Value |
|---|---|
| HTML pages | 785 |
| Sitemap URLs | 659 |
| `noindex` pages | 103 |
| Redirect stubs | 23 |
| Total site size | 42 MB |
| Largest page | `education/index.html` — 355 KB, 373 article cards |

Structured data coverage: 758 BreadcrumbList, 651 FAQPage, 573 Article,
201 WebPage, 52 ItemList, 48 HowTo, plus Dataset/Organization/Service/
WebApplication/WebSite singles. All parse cleanly.

---

## Next run

Once the repo is re-cloned, this audit can resume committing fixes normally.
Until then it will keep reporting without pushing, since the local checkout
cannot safely reach `origin/live`.
