# Mobile Consistency Check — 2026-09-23

**Corpus:** fresh clone of `origin/live` @ `3c26896`. 805 HTML files: 18 redirect stubs and 787 live pages.
**Baseline:** `39142d0` (the 09-22 mobile push). Changes since then: 4 commits, 26 HTML pages plus the sitemap. **No CSS or JS changed**, so `m-app.css`, `main.css` and `main.js` are the same as yesterday.
**Pushed:** nothing. No defects found, so there was nothing to fix.

## Results

**Static checks on all 787 live pages**
- Viewport meta tag is present on 787/787 pages. No page blocks zoom (no `user-scalable=no` or `maximum-scale=1`).
- `.hamburger` appears exactly once on every page that has a nav. `main.js` loads on every live page. The only pages without it are the 18 redirect stubs, which is expected.
- 0 inline fixed widths over 360px.
- The static scan flagged `education/pool-safety-rules-printable.html` for a missing 16px input guard. That was wrong: the page loads `printable-poster.css`, which has the guard, and the rendered check confirmed its inputs are 16px.

**Rendered checks: all 26 changed pages plus a random 90, at 390px (110 pages after removing duplicates), with a third of them also at 320px (37). Total 147 renders.**
- Page overflow 0 and element overflow 0.
- 0 inputs below 16px.
- 0 text below 11px (the bottom nav is excluded; its small labels are by design).
- 0 images that are broken or wider than the screen.
- Hamburger: 147/147 opened (`aria-expanded` false→true), all 44×44 or larger.
- The new and changed content today (CPR-for-kids section on `free-water-safety-resources`, the ear-tubes rewrite, `cpr-class`, `cpr-adults`, and the 3 AEO directory pages) all render clean.

**Wide-table sweep: all 61 pages with a table, at 390px**
- Page overflow 0 on all 61. None of yesterday's "scroll wrapper that doesn't scroll" defects came back.
- Every word flagged as too wide for its cell turned out to be a hyphenated or en-dash term wrapping at the hyphen (`$1,000–$1,400`, `speech-language`, `head-circumference`, `A:__________` write-in blanks). These are normal line breaks, not words split mid-word.

## Tap targets (no change, known backlog)
- The most common items under 32px are text links in "related reading" lists (about 24px tall, full-width rows) and inline citation links in prose (CDC, AAP, Red Cross, about 17px). Both fall under the WCAG 2.5.8 inline/spacing exemptions. They are the same standalone-block-anchor backlog as in earlier reports.
- The 17px `(details)` link in the new Quick Answer box on `free-water-safety-resources` is inline in a sentence, so it is also exempt.

## For Michael (carried over, still open)
1. **Table min-width rule in `m-app.css`** (proposed 09-22). Not needed today because no new table pages shipped, but new pages will keep hitting the defect until the rule is in the shared stylesheet. That change needs a cache-bust, so it's your call.
2. 21px footer rail on `privacy/` and `jobs/post.html`: deferred.
3. Desktop/tablet stacked gutter on the 122-page group: still needs a decision.
4. **Local repo on the Mac mini:** it is still on its own history and doesn't match `origin/live` (it shows "273 ahead / 27 behind"; see the 09-17 report). Runs work around this by cloning fresh into /tmp. Re-cloning the local folder would remove the risk of a mistaken push from it.

## Environment note
The shared `/sessions` disk was at **100% full** at the start of this run, which blocked the normal pip and browser installs into the home directory. For this run everything was installed under `/tmp` instead, and it was removed at cleanup. If other scheduled tasks install into `~`, they will fail until that disk is cleared.
