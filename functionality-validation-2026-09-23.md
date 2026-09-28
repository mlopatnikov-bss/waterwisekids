# Functionality Validation — 2026-09-23

**Scope:** fresh clone of `origin/live` @ `3c26896` (2026-09-23). The clone has 805 HTML pages. Each page was loaded in headless Chromium from a local HTTP server.
**Result: nothing is broken. No fixes were needed, so nothing was pushed.**

## Results

| Check | Scope | Result |
|---|---|---|
| Page load | 805 | 805 OK |
| Uncaught JS exceptions | 805 | **0** |
| Failed local requests | 805 | **0** |
| Broken images | 805 | **0** |
| Internal links + asset refs resolve | 41,210 refs | **0 broken** |
| Empty `href` / missing `#fragment` targets | 41,319 anchors | **0** |
| Undefined inline handlers (`onclick`, `onsubmit`, etc.) | 805 | **0** |
| Nav/header present | 805 | 805 |
| Formspree forms: required fields filled → valid → real `POST` | 168 pages / 172 forms | **168/168 posted** |
| Review system (open → 5★ → write → submit → saved in `swimSchoolReviews` → modal closes → review shows on card) | 51 state pages | **51/51** |
| Search: no-match query shrinks results or shows the no-results message → clear restores the list | 51 state pages | **51/51** |
| Directory hub (`/swim-lessons/directory/`) | search "british" → 66 cards; TX filter → 119; no-match message; clear; review saves | **OK** |
| `?city=` handoff (`texas.html?city=Houston`) | pre-filters | 8 cards, OK |

Formspree endpoints: `mojpyqdo` ×171 and `xzdkybrw` ×1. Both are correct. **No data was actually sent.** The test caught every request to formspree.io before it left the machine and returned a fake 200 response.

Directory cards across the 51 state pages total **815**, which matches the hub's "815 Verified Schools" headline.

## Changes since 09-09
- Page count went from 772 to 805, and Formspree forms from 155 to 172. That fits with new content shipping. All new forms are wired correctly.

## Harness note (not a site defect)
In the first pass, 26 state pages showed "review not saved." The cause was the test itself: all pages shared one browser context, so parallel runs overwrote each other's localStorage key. I re-ran all 51 one at a time, each in its own context, and all 51 passed.

## Not covered: needs Michael
- **Live site not verified.** This run tested the source in `origin/live`, not the cached pages that visitors actually receive.
- **Jobs API** (`script.google.com/…/exec` on `/aquatic-jobs/`) is **still unverified.** External hosts were blocked during the test. The open item carries over: the Apps Script access setting must be "Anyone."
- **External CTA destinations** (for example britishswimschool.com) were not fetched. Only internal links were checked.
- Formspree inbox delivery was not tested. Chromium only; no Safari or Firefox pass.

## Housekeeping flags
1. **The local repo on the Mac mini has diverged from GitHub.** Local `live` has 273 commits that aren't on `origin/live`, and `origin/live` has 27 that aren't local. The local HEAD looks like an August state. This run avoided the problem by testing and working from a fresh clone. Before anyone runs `.deploy/waterwisekids-push.sh` from the Mac mini, reconcile the local repo (probably by resetting it to `origin/live`) so the push can't clobber or fail.
2. **A GitHub personal access token is stored in plain text** in the git remote URL (`.git/config`). Consider rotating it and switching to a credential helper.
3. **The shared sandbox disk (`/sessions`) was 100% full** at the start of this run, so tools had to be installed under `/tmp`. Other scheduled tasks may fail for the same reason.
