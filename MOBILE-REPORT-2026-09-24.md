# Mobile Consistency Check — 2026-09-24

I checked `origin/live` @ `cc2189c` (808 HTML pages) from a fresh clone, because the local `live` branch still shares no history with the remote (same blocker as 9-17).

**Pushed:** `6b18423` → `origin/live`

## Baseline checks: all pass

| Check | Result |
|---|---|
| Viewport meta tag | 808/808 (redirect stubs excluded) |
| Pinch-zoom blocked (`user-scalable=no` / `maximum-scale=1`) | 0 pages |
| Hamburger nav markup without toggle JS | 0 pages |
| Inline fixed widths > 360px | 0 |
| Global image scaling / overflow guards | Present (main.css) |
| iOS input zoom (16px inputs on mobile) | Still fixed and live |

## Fixed: 4 touch targets under 44px

The 9-17 report flagged these, but they hadn't been fixed yet. Each fix only applies at `max-width: 768px`, so desktop doesn't change.

| Selector | Was | Pages | File |
|---|---|---|---|
| `.cat-btn` | ~28px | education hub, swimmers hub | education-hub.css, swimmers-hub.css |
| `.wwk-city-link` | ~33px | 17 local `swim-lessons/*` pages | local-pages.css |
| `.filter-pills .pill` | ~33px | jobs/index.html | main.css |
| `.swim-schools-page .state-chip` | ~39px | swim-schools/index.html | main.css |

Cache-bust: all references to these four stylesheets now use `?v=20260924m`. That's 678 pages for main.css, 17 for local-pages.css and 1 each for the two hub stylesheets. The HTML changes are only the version string.

## Not verified

- **No rendered check.** The live URL wasn't allowed for fetching in this unattended run, and the sandbox has no headless browser. Heights are calculated from the CSS, not measured. When you get a chance, look at `/education/` and `/swim-schools/` at 375px.

## Still open (needs you)

- **Local repo is out of sync.** The local `live` branch has no common history with `origin/live`, and there are about 391 uncommitted files. Re-clone on the Mac mini, and make sure the MacBook's scheduled tasks are off.
- **GitHub token is stored in plain text.** It's in the remote URL in `.git/config` (today's audit flagged this too). Rotate it and switch to a credential helper.
