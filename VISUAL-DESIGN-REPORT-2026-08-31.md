# Visual Design Audit — 2026-08-31

**Method:** headless Chromium render sweep (measured, not grepped). 753 HTML files
partitioned by the 4-part template key (stylesheet set + normalized header hash + footer
hash + body class) into **14 variant classes**, minus the **23 meta-refresh stubs**. Every
class contributed a representative; 27 representatives plus 2 pages surfaced mid-run =
**29 pages × 3 viewports** (1440 / 768 / 390), served over HTTP from a fresh clone of
`origin/live`. Probes: heading rank + computed size, font families, text colours, sub-11px
text, horizontal overflow, clipped text, broken/distorted images, zero-size SVG icons.

Header markup variants: **4**. Footer variants: **2** — within the standing tripwire.

**Result: one defect class found, fixed sitewide, and deployed** (`16cce42` on `live`).
**Live re-render after deploy: 7/7 pages PASS, 0 overflow.**

---

## The defect: the page title was the *smallest* heading on every phone

**143 measured heading-rank inversions across 22 of 29 templates.**

`m-app.css` — the mobile app layer, JS-injected last, `!important` throughout — defines a
mobile type scale. It compacts the hero:

```css
@media (max-width: 768px) {
  .hero h1                                    { font-size: 1.5rem  !important; }  /* 21px   */
  .page-hero h1, .page-hero--edu h1,
  .tools-hero h1                              { font-size: 1.35rem !important; }  /* 18.9px */
  .section-header h2, .section-title          { font-size: 1.25rem !important; }  /* 17.5px */
}
```

The homepage uses `.section-header` / `.section-title` markup, so it gets the whole scale and
reads correctly: **h1 21 > h2 17.5**. Every *interior* template uses a **bare `<h2>`** or a
page-scoped class that `m-app.css` never names. Those h2s therefore kept their desktop-derived
size while their h1 was compacted — so the h1 landed *below* its own subheads:

| template | h1 @390 | largest h2 @390 | ratio |
|---|---|---|---|
| `/special-needs-swimming.html` | 21px | **28px** | 1.33× |
| `/for-swim-schools/` | 18.9px | **28px** | 1.48× |
| `/advertise/`, `/gear/` | 18.9px | **25.2px** | 1.33× |
| `/swim-lessons/` | 18.9px | **24.5px** | 1.30× |
| `/about/`, `/statistics/`, `/tools/`, `/contact/`, `/jobs/`, the three lesson hubs, `/swimmers-hub/`, `/scholarships/`, `/education/` | 18.9px | 21px | 1.11× |

Three things made this survive every previous pass:

- **The `!important` was killing the authors' own fixes.** `gear.css`, `advertise.css` and
  `for-swim-schools/index.html` each already declare a mobile `h1 { font-size: 2rem }`.
  All three were dead — overridden by `m-app.css`, which loads last. A CSS grep finds the
  intent and reports the page as handled.
- **It is invisible at desktop.** At ≥769px every one of these pages ranks correctly. The
  inversion is created by the mobile override, so a desktop-only check passes clean.
- **The worst two pages have no class at all** (below).

### The two worst pages had no hook for the design system

`/swim-schools.html` — the directory hub, the money product — and
`/adult-swimming-lessons.html` build their heroes from an **unclassed `<section>` with
everything written inline**:

```html
<section style="background: linear-gradient(...); padding: 64px 20px; text-align: center;">
  <h1 style="color:#fff; font-size: 42px; ...">Find &amp; Rate Swim Schools Across America</h1>
```

Not one selector in `m-app.css` can reach that. These were **the only two pages on the site
that shipped a 42px h1 to a 390px phone** — identical to desktop, while every other template
compacted to ~21px. On `/swim-schools.html` the headline ate three lines and pushed the search
widget — the page's entire purpose — most of the way down the first screen.

This is the same defect class already named in `m-app.css` for `.tools-hero` on 2026-08-19
("the ONLY hero on the site that kept its dark desktop gradient on mobile … so /tools/ read as
a different site"). It survived on two more pages because they carry no class to hook.

**Before / after, `/swim-schools.html` at 390px:** headline 3 lines → 2 lines; the search card
and the Quick Answer block both move fully above the fold (~100px of content recovered).

---

## What was changed

Everything sits inside `@media (max-width: 768px)`. **Desktop rendering is byte-identical.**

| file | change |
|---|---|
| `assets/css/m-app.css` | `.hero h1` 1.5rem → **1.6rem**; `.page-hero/.page-hero--edu/.tools-hero h1` 1.35rem → **1.6rem**, sub-gap 2px → 6px, so all mobile heroes agree at 22.4px |
| `assets/css/m-app.css` | new attribute-selector block: `h1[style*="font-size: 42px"] → 1.6rem`, `h2[style*="font-size: 24px"/"28px"] → 1.5rem`. Author `!important` beats a normal inline declaration, so this fixes the two unclassed pages without touching their markup or their desktop look. Same shape as the existing `[style*="font-size: 0.72rem"]` block. |
| `assets/css/special-needs.css` | mobile `h2` 28px → 1.5rem, new `h3` 24px → 1.25rem (literal px never scaled with the 14px mobile root) |
| `assets/css/advertise.css` | mobile block for the six 1.8rem section headings → 1.5rem |
| `assets/css/gear.css` | same, three headings |
| `for-swim-schools/index.html` | mobile `.section h2` → 1.5rem |
| `swim-lessons/index.html` | mobile `.section-heading h2` → 1.5rem |
| `assets/css/teens-hub.css` | mobile `.feature-card h3` 1.3rem → 1.15rem (the one residual h3 > h2 case) |

Resulting mobile scale, uniform sitewide: **h1 22.4 > h2 ≤21 > h3 ≤18.2**.

Cache-bust `main.js` / `m-app.css` `20260830c → 20260831a` across 736 pages, plus the four
page stylesheets. Inner and outer keys bumped together so the chain does not break.

## Verification

| check | before | after |
|---|---|---|
| heading rank inversions (29 pages × 3 viewports) | **143** | **0** |
| desktop heading deltas | — | **0** |
| horizontal overflow | 0 | **0** |
| clipped text | 0 | **0** |
| broken / distorted images | 0 | **0** |
| zero-size SVG icons | 0 | **0** |
| live re-render after deploy | — | **7/7 PASS** |

---

## Clean on every other axis

- **Typography:** one family sitewide (`Inter`, 13,085 text nodes; 3 `monospace` nodes are
  intentional code spans). No fallback-font leakage.
- **Assets:** zero 4xx responses, zero broken `<img>`, zero aspect-ratio distortion >8%,
  zero zero-size inline SVG across all 87 page-viewport combinations.
- **Overflow / clipping:** zero at 1440, 768 and 390.

## Not fixed — deliberately

- **10px `.mobile-bottom-nav` / `.mobile-cat-item` labels** (135 instances). The probe flags
  these against the 11px floor, but `m-app.css:1433` records them as a **documented deliberate
  exception** — "11px reflows the strip". Left alone; noting it here so future runs stop
  re-finding it.
- **`/education/*-printable.html` h1 == h2 at 18.2px.** Printables are excluded from sitewide
  sweeps by convention.

## Needs Michael — one design call

`/swim-schools.html` and `/adult-swimming-lessons.html` still keep their **dark blue gradient
hero, 64px vertical padding and centred text on mobile**, while every other template flattens
to a white, 16px-padded, left-aligned app-style hero. The heading sizes are now consistent, but
those two pages still *look* like a different site on a phone — the exact complaint the
2026-08-19 pass fixed for `/tools/`.

Fixing it properly means giving both heroes the `page-hero` class (their inline styles would
still win at desktop, so desktop is safe) and adding `class="hero-sub"` to the
`/adult-swimming-lessons.html` intro `<p>` — without that the paragraph would render white on
the newly-white background. That is a visible brand change to the directory hub, so it is
flagged rather than shipped autonomously.

## Colour palette — observation, no action

The audit counted **30+ distinct text colours** in use, mostly near-duplicate grays
(`#171717`, `#1f2937`, `#111827`, `#374151`, `#4b5563`, `#525252`, `#737373`, `#6b7280`,
`#334155`, `#475569`, `#64748b`) and blues (`#0369a1`, `#075985`, `#0c4a6e`, `#13304a`,
`#0d4d77`, `#114c76`, `#0f5f94`, `#2b6cb0`, `#1a365d`). None fails contrast — all were
cleared by earlier passes — but the set is far larger than a design system needs.
Consolidating it is a multi-session refactor, so it is recorded here rather than started.

---

**Commit:** `16cce42` on `live` — `[visual-qa] Fix mobile heading hierarchy inversion on 22 templates`
