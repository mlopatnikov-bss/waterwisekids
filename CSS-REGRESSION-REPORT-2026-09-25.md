# CSS Regression Report — 2026-09-25

**Verdict: CLEAN. No regressions found. Nothing fixed, nothing pushed.**

Source: fresh shallow clone of `origin/live` @ `8d3987f` (121 commits since the last
CSS report on 2026-09-09). 810 HTML files − 18 redirect stubs = **792 live pages**.

**Method change this run:** the sandbox had no Chromium and pip could not install
Playwright (the `/sessions` disk is 100% full). So the full-site checks were done on
the source files, and computed styles were measured in real Chrome on the live site
for **20 template pages at 1280px and 390px** (40 renders, 0 errors).

---

## 1. Chrome markup tripwire (all 792 pages, source)

| region | variants | sizes |
|---|---|---|
| `<header>` | 6 (4 real) | 523 / 112 / 93 / 61 / 2 / 1 |
| `<footer>` | 2 | 679 / 113 |

- Growth from 09-09 (508/98/79/63/1 and 650/99) matches the new pages.
- The one "new" header variant (`index.html`, `404.html`) differs only by
  whitespace before `</a>` in the logo link. It renders the same. **Not a regression.**
- No page is missing a header or footer.

## 2. Stylesheets, fonts, cache keys (source)

- Inter (Google Fonts, one URL) loaded on **792 / 792** pages.
- Each stylesheet has one cache key everywhere: `main.css?v=20260924m` (679),
  `article.css?v=20260828d` (451), `printable-checklist.css?v=20260913c` (112),
  `local-pages.css?v=20260924m` (17). No stale or mixed versions.
- Undefined `var()` with no fallback: **0** across all 13 stylesheets.
- Page stylesheets that target chrome selectors are the same set as the baseline
  (printable-checklist, printable-poster, special-needs, m-app). None are new.

## 3. Rogue inline CSS (source)

- Inline `style=` inside header/footer is only the two template ones: the 28px logo
  icon (2 per page) and `text-align:center` on the footer bottom line. Both are the same on every page.
- Page `<style>` rules touching chrome: **7, all inside `@media print`** (hide
  chrome / white background when printing). **0 screen overrides.**

## 4. Computed styles, live site (20 templates × 1280 / 390)

Tested: home, 2 articles, 2 location pages, education hub, education article, 2
printables, about, swim-lessons, directory, swimmers-hub, teens, gear, advertise,
special-needs, british-swim-school/jersey-shore, jobs, 404.

| axis | 1280 | 390 |
|---|---|---|
| Header (bg, border, shadow, sticky, height 73/72px) | 20/20 same | 20/20 same |
| Logo (`#075985` 17.6px/700 → `#0369a1` 13.3px/800 mobile) | 20/20 | 20/20 |
| Nav link (Inter 14.4px/500 `#374151`, 8/12px padding) | 20/20 * | 18/20 † |
| Footer box (`#0c4a6e` / `#e0f2fe`, 40/24px) | 20/20 ‡ | 20/20 |
| Footer link (`#bae6fd` 14.4px) | 20/20 | 20/20 |
| Body font (Inter) | 20/20 | 20/20 |
| Horizontal overflow | 0 | 0 |

\* 5 pages show the first nav link as `#075985`. That is the **active "Education"
state** on education pages, working as designed.
† The 2 printables use their own screen-header padding at 390px. This is the
printable family's layout and has been in place since earlier baselines.
‡ Printables center their footer (`printable-checklist.css:233`). This is an older, intended difference between the two page families.

Body text colour is different on `special-needs-swimming.html` (`#13304a`) and the poster
printable (`#1b2a4a`). These come from their own stylesheets and match past runs.

## 5. Not covered this run

- A rendered check of all 792 pages, hover states, and the mobile drawer. These need headless Chromium, which could not be installed here.
- Nothing was pushed. Also, the local repo in the workspace folder has **diverged**
  from `origin/live` (273 local vs 38 remote commits). Any push from that folder
  needs a manual reconcile first.

## Environment warning

The `/sessions` disk is **100% full**, which blocked `pip install`. The cleanup
report for 2026-09-25 says file deletion is still blocked in unattended runs.
Freeing space on the Mac Mini would let this checker go back to full rendered sweeps.
