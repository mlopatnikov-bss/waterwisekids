# Visual Design Audit — 2026-08-29

**Method:** headless Chromium render sweep (not grep). 26 template-variant representatives
served over HTTP from a fresh clone of `origin/live` (`025ba40`), rendered at
**1440 / 1000 / 820 / 375** px. 749 HTML files partition into **18 variant classes**
by a 4-part key (stylesheet set + header hash + footer hash + body class); every class
contributed at least one representative, the largest two contributed two.

Header-markup variants: 7 + the empty bucket (the 17 meta-refresh redirect stubs).
Footer variants: 2. Both within the standing tripwire counts.

**Result: 5 defect classes found, all 5 fixed and pushed** (`9030751` on `live`).

---

## What was fixed

Every finding was the same underlying class: **text that fails WCAG AA contrast because
it sits on a gradient**. Colour-only CSS audits can't see these — you have to render,
composite the stack, and score against the *worst* gradient stop.

### 1. Star ratings were effectively unreadable — 1.87:1
`assets/css/local-pages.css` · **13 pages**

The `★★★★★` glyphs on featured-school cards are real text nodes, rendered in amber-500
`#f59e0b`. Against the `#e0f2fe` stop of the `.featured-school` gradient that measures
**1.87:1** — the stars were barely distinguishable from the card behind them.

amber-700 `#b45309` only reaches 4.38:1 on that same stop, still short of the 4.5 bar,
so the fix goes one rung further.

- **Before:** `#f59e0b` — 1.87:1 on the card, 2.15:1 on white
- **After:** `#92400e` — **6.18:1** on the card, 7.09:1 on white
- **Visual:** stars now read as a deep amber/bronze; still unmistakably stars, now legible

### 2. CTA banner body copy — 3.47:1
`assets/css/local-pages.css` · **13 pages**

`.wwk-cta-banner` runs a blue-800 → blue-600 gradient with body copy in `--blue-100`
`#dbeffe`. At the blue-600 end that's **3.47:1**.

Worth noting *why* the fix is the gradient and not the type: recolouring the copy to
solid white would only have reached 4.10:1 on blue-600 — still failing. blue-700 is the
site's canonical "white text is safe on it" blue (already used by `.btn-primary`).

- **Before:** light end `var(--blue-600, #0284c7)` — copy at 3.47:1
- **After:** light end `var(--blue-700, #0369a1)` — copy at **5.03:1** (6.41:1 at the dark end)
- **Visual:** banner is marginally deeper blue; type unchanged and now clearly legible

### 3. Homepage hero subtitle — 3.61:1
`index.html` · **1 page (the highest-traffic one)**

`.hero p` is `rgba(255,255,255,.9)` at **18.4px/400** — one third of a pixel under the
18.66px large-text threshold, so it needs 4.5:1, not 3.0:1. Against the blue-600 end of
the hero gradient it measured **3.61:1**. Solid white would have reached only 4.10:1.

- **Before:** hero gradient `blue-600 → blue-800`
- **After:** hero gradient `blue-700 → blue-800` — subtitle at **5.13:1**, h1 at 5.93:1
- **Visual:** confirmed by screenshot — hero reads slightly richer; the white-bordered
  `.btn-secondary` (whose border was added by the 2026-08-23 pass precisely to give it an
  edge against this gradient) still has a clean 5.93:1 boundary

### 4. Orange hub CTA buttons — 2.80:1 (worst finding)
`kids-swim-lessons/index.html`, `beginner-swim-lessons/index.html` · **2 pages**

White on orange-500 `#f97316` is **2.80:1**. Two earlier passes already replaced this
exact pair elsewhere — `advertise.css` (2026-08-20) and `teens-hub.css` (2026-08-23) —
but both hub pages carry the rule in their own inline `<style>` block, so the shared-CSS
fixes never reached them. Found by sweeping the *shape* rather than the file.

- **Before:** `background: #f97316` — 2.80:1; hover `#ea580c` — 3.56:1
- **After:** `background: #c2410c` — **5.18:1**; hover `#9a3412` — 7.31:1
- **Visual:** button stays warm orange against the blue CTA panel, label now solid

### 5. Pricing "/month" labels — 4.46:1
`advertise/index.html` · **5 spans**

`#64748b` at 12.8px against the `#f0f9ff` stop of the featured package card's gradient —
**4.46:1**, missing the bar by 0.04. These live in `style="…"` attributes, which is why no
CSS-file audit has ever seen them. `gear.css` had already set the precedent for this
exact pair on 2026-08-22.

- **Before:** `#64748b` — 4.46:1 · **After:** `#475569` — **7.11:1**

---

## Cache busting

`local-pages.css` changed, so its key moved `20260828d → 20260829b` across all **17**
pages that link it. `20260829a` was already spent by an earlier run today, hence `b`.

---

## Clean at every viewport

Probed and found **zero** defects in: true viewport overflow (excluding content inside
deliberately scrollable containers), child-overflows-parent, broken images, zero-size
SVG icons, clipped text (excluding `-webkit-line-clamp`), control font-family
inheritance, control font-size floors, and iOS 16px input zoom.

`document.scrollWidth === clientWidth` on every page at every width — no horizontal
scroll anywhere, including the 769–1149px tablet band.

---

## Confirmed false positives (do not re-report)

Three probe results looked alarming and are not defects. Recording the reasoning so
future runs don't chase them:

| Signal | Volume | Verdict |
|---|---|---|
| `.mobile-bottom-nav a span` / `.mobile-cat-item span` at 10px | 152 hits, all 29 pages | **Deliberate.** Documented as an intentional sub-11px exception at `m-app.css:1423` and `:1961` — 11px reflows the nav strip. Left alone. |
| `.cat-btn` chips overflow the viewport on /education/ | 93 hits | **By design.** Parent `.category-filters` is `overflow-x: auto` — a horizontal chip scroller. The page itself has zero horizontal scroll. |
| `<a>` tap targets under 44px | 18 hits | **WCAG 2.5.8 inline exception.** All 18 are bare inline citation links inside sentences ("the CDC", "American Academy of Pediatrics"). None has a class; none is a control. |
| `.article-card-excerpt` text clipped | 282 hits | `-webkit-line-clamp: 2`. Intentional truncation. |

**Probe correction worth keeping:** the first pass reported 82 contrast failures. The
composited-background walker was recording that it had *seen* a gradient but continuing
up the tree to the page's white base, then scoring white-on-white — so white hero type
read as 1.00:1 and genuinely-failing light-on-mid-blue type was scored against the wrong
pair. Corrected to extract every opaque colour stop from the gradient and require the
worst one to pass. That took 82 → 12, and every one of the 12 was real.
Canary: 651 gradient-backed text nodes measured, 0 unmeasurable.

---

## Verification

Re-rendered 29 pages (original sample + all 5 fixed pages) at all 4 viewports after the fix:

```
contrast-fail        0      (was 12 desktop / 11 mobile / 12 tablet / 12 tablet-narrow)
overflow-viewport    0
text-clipped         0
broken-image         0
zero-size-svg        0
font-family          0
tap-target-small    18      all inline prose links (exempt)
text-below-floor   152      all documented m-app.css exceptions
```

Assertion held: `contrast-fail == 0 across 29 pages × 4 viewports`.
Five region screenshots reviewed by eye to confirm the colour changes read correctly and
didn't flatten any component boundary.

---

## Open, needs Michael

- **`.stars` still shows an unsourced 4.9/5 (218 reviews)** on featured-school cards.
  This pass made those stars *legible*; whether the rating itself should be there at all
  is the separate open item already on file. Making them readable arguably raises the
  stakes on that decision.
- Dead rule: `british-swim-school/jersey-shore.html` and `northwest-philadelphia.html`
  both define `.stars { color: #fbbf24 }` but render zero `.stars` elements. Harmless,
  but it will trip future colour sweeps — worth deleting on the next content pass.

## Commit

`9030751` — pushed to `live` (rebased onto `543057f`; zero file overlap with the
concurrent internal-linking run).
