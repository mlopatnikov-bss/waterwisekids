# Visual Design Audit — 2026-09-23

**Result: CLEAN. Nothing pushed.**

- Audited GitHub `live` @ `3c26896` (baseline: 09-22 visual push `cba262f`). 7 commits since then, 44 files changed.
- **No CSS or JS files changed** since the baseline. The changes were HTML only: the new "After a Water Scare" symptom watch log (landing + printable), new sections on ear-tubes and free-water-safety-resources, AEO Quick Answer boxes on the Alaska, Iowa and Montana directory pages, and some title and link edits.
- Every inline style added in the diff uses house values (`#0369a1` links, `#6b7280` separators, `#0c4a6e` headings, `#cbd5e1` table borders, `#fff7ed` banners on classless divs).
- The new directory Quick Answer boxes match the other 21 directory state pages that have one, down to the byte.

## Rendered check (live site, Chrome, 1280px, cache-busted iframes). 20 pages across every template family

The pages checked were: home, both new watch-log pages, ear-tubes, free-water-safety-resources, cpr-class, directory alaska/iowa/index, education hub, kids-swim-lessons, find-swim-lessons, an FAQ article, levels-explained, 404, about, tools, and teens-hub.

| Check | Result |
|---|---|
| Text contrast below AA (per element, solid backgrounds) | **0 failures on 20 pages** |
| Horizontal overflow | 0 |
| Broken images | 0 |
| Header `rgba(255,255,255,.95)` / footer `rgb(12,74,110)` | identical on all |
| main.js present | 20/20 |
| Visual screenshot of the new watch-log page | alignment, sidebar TOC, summary box and CTA card all look right |

The static axes (cache-bust keys, omission probe, `#0284c7`/`#9ca3af` text colours, chrome census) were measured today at this same HEAD by the 09-23 css-regression run, and all were clean. I didn't re-run them.

## Not measured
The 390px mobile viewport wasn't checked here. The Chrome profile's page zoom still pins `innerWidth`, so that check is covered by the separate daily mobile-consistency task.

## Still waiting on a decision from Michael (unchanged)
- `.stars` gold `#fbbf24` on the 2 BSS pages has 1.67:1 contrast.
- `.page-breadcrumb a` shows links in grey, in the same shade as the separator.
