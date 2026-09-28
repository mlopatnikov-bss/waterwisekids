# CSS Regression — 2026-09-20

**Baseline** `fa95c2163` (09-19 push) → **HEAD at start** `7c61b4ef3`
**Corpus** 796 HTML − 23 redirect stubs = **773 live pages**
**Pushed** `e8354d67` (1 file)

`git diff fa95c2163 HEAD -- '*.css' '*.js'` was **empty** — every candidate
finding is HTML-side. 42 changed HTML files, 3 net-new.

---

## Fixed and pushed

**`education/swim-milestones-by-age.html` — two `.tldr-box`, two appearances**

The page carries two TL;DR callouts. `#quick-answer` uses the corpus shape
(`#f0f7ff` background, 4px `#0077b6` left rule, `16px 20px` padding, `8px`
radius). The second declared `style="margin: 2rem 0;"` and nothing else, so it
fell through to `main.css:1920 .tldr-box` — `--blue-50 #eff8ff`, `--blue-700
#0369a1`, `padding:1rem 1.25rem` — and rendered in a **different blue with
different padding immediately below its sibling**.

Given the same inline shape as its sibling; its `2rem` margin is preserved.
Only split-identity `.tldr-box` page in the corpus; 0 remaining.

---

## Flagged, not shipped — corpus-scale, your call

**`.tldr-box` is running two different vocabularies.**

| | pages | background | left rule | padding |
|---|---|---|---|---|
| inline (hardcoded) | **501** | `#f0f7ff` | `#0077b6` | `16px 20px` |
| `main.css:1920` (tokens) | **126** | `--blue-50 #eff8ff` | `--blue-700 #0369a1` | `1rem 1.25rem` |

Neither inline hex is defined in any stylesheet. Two consequences:

1. The 4px left rule is a visibly different blue depending on which page a
   visitor lands on.
2. **The hardcoded padding deletes the responsive step.** `main.css` sets
   `html{font-size:15px}` at ≤768px and `14px` at ≤480px, so the token version
   tightens to 15/18.75 then 14/17.5 on phones — the 501 inline pages stay at
   16/20. An inline value doesn't just diverge, it removes the narrow-width
   behaviour.

501 files is emitter-scale. Worth fixing once in the publish template rather
than by hand.

---

## Two false positives that would each have been a bad mass edit

**47 `.related-card` anchors on 26 printables carry no inline style** and their
pages never load `article.css` — they looked like unstyled cards sitting beside
550 styled siblings. But **`printable-checklist.css:276` defines `.related-card`
with the identical shape.** The rule is to ask "does the page load the sheet
that owns this component" against *every* sheet in its `<link>` set, not just
the one you expect. (`pool-safety-rules-printable.html` is the only
`.related-card` page on `printable-poster.css`, which doesn't define it — and
all 6 of its cards are inline-styled. Correct.)

**Both `.cta-button` inline overrides (2 of 341) are deliberate.** The house
button is `background:white; color:var(--blue-700)` — right inside `.cta-box`,
a dark teal→blue gradient. The two overrides sit in `.sidebar-box` repainted
*light* inline (`#f9fafb`, `#e8f4f8`), where a white button would be invisible,
so they set a solid blue and cancel the colour. This is the correctly-authored
inverse of yesterday's `.stat-box` bug, where an inline light background left
`color:white` behind. Verified: **0** house `.cta-button` stranded on a light box.

---

## Clean at 773/773

- **Yesterday's standing probe returns 0** — no inline override sets a
  `background` without a `color` on any class whose rule pairs them (42 such
  classes painted white; broadened to any paired rule at contrast <4.5: still 0).
- **Breadcrumb `#0284c7`: 0 real.** 103 files contain the hex; the 15 that read
  as `color:` are all `border-color` / `background-color` /
  `text-decoration-color` / `accent-color`. House `#0369a1` holds at 5,075.
- **Cache-bust keys 100% uniform** — `main.css?v=20260913b` 665/665,
  `article.css?v=20260828d` 442/442, `main.js?v=20260918b` **773/773**,
  `printable-checklist.css?v=20260913c` 107/107.
- **`main.js` on 773/773** — yesterday's missing-script defect did not recur.
- Chrome: headers **3** real shapes (577 / 107 `.screen-header` / 89 bare-nav),
  footers **2**, navs **1**, **12** stylesheet sets each matching its family,
  rogue chrome CSS in page `<style>` **0**, dangling speakable selectors **0**,
  `font-family` = `inherit`×226 + `'Monaco'`×4.
- **All 3 net-new pages conformant** against their family's declaration census.
  First run since 09-17 where all three recurring publish-emitter defects
  (breadcrumb hex, stale cache-bust, off-house callout colour) failed to recur.

## Notes

No browser available — eighth consecutive run, so this is static analysis only.
Two probe artifacts worth recording: `#[0-9a-fA-F]{6}` matches HTML numeric
entities (`&#128218;` faked off-ramp colours on 12 files), and stripping
`active` from a class list *after* collapsing whitespace splits headers 3→6 and
navs 1→3 into phantom buckets.
