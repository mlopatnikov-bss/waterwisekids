# Visual Design Audit — 2026-08-21

**Method:** headless Chromium render sweep. 24 page-template representatives
(95 stylesheet+structure fingerprint groups, covering every distinct template)
× 1440 / 768 / 320px. Probed for: broken images and icons, colour contrast,
sub-11px text, horizontal overflow, tap-target size, and grid alignment.

Baseline clone: `live` @ `bc8dbeb` → rebased onto `ff9cbf5`.
**Fix commit `96d770d`. Deployed and verified live.**

---

## Headline: 3 invisible-text defects found, fixed, deployed

All three were text rendered at **1.0–1.1:1 contrast** — i.e. genuinely
unreadable, not merely below AA. None of them is greppable: in every case the
bad colour is *never written down anywhere*. It emerges at runtime from a
missing declaration.

### 1. The "Quick Answer" TL;DR box was white-on-white — on the speakable element

`find-swim-lessons.html`. `.tldr-box` in `main.css` declared its own light
background (`var(--blue-50)`) and its own border, but **no `color`**. On this
page the box sits inside a hero that sets `color:#fff`, so the box inherited
white text onto its own `#f0f7ff` background: **1.08:1**. Only the bold
"Quick Answer:" label (which has its own `.tldr-box strong` colour rule) was
readable; the entire answer body was invisible.

This is the highest-value of the three because that element is exactly what the
page's `speakable` JSON-LD points at (`"cssSelector": [".tldr-box", "h1"]`) —
it is the block written to be lifted into featured snippets and AI answers, and
sighted visitors could not read a word of it.

**Fix:** `.tldr-box` now declares `color: var(--gray-800)` and `.tldr-box a`
declares `var(--blue-800)`. Rule: *the element that declares the background
must declare the text colour.* 580 pages carry a `.tldr-box`; a 40-page render
sample found this was the only one rendering light-on-light, but the fix is at
source so the whole class is now closed.

### 2. Footer wordmark was dark grey on the navy footer

`british-swim-school/jersey-shore.html` and
`british-swim-school/northwest-philadelphia.html`. `.footer-title` in
`main.css` set no `color` and relied on inheriting `#e0f2fe` from `footer`.
Both pages have an inline `<style>` containing a bare
`p, li { color: #374151 }`. Because `.footer-title` is a `<p>`, that
element-selector rule (specificity 0,0,1) beat *inheritance*, which loses to
any direct declaration. Result: the brand name rendered `#374151` on `#0c4a6e`
— **1.09:1** — while every other footer element around it stayed light.

**Fix:** `.footer-title` now declares `color: #e0f2fe` explicitly (0,1,0, so it
outranks the page's `p` rule). Verified that `m-app.css`'s
`footer .footer-title { color: … !important }` still wins at ≤768px, where the
mobile footer is deliberately white — that documented carve-out is intact
(checked at 390px: dark `rgb(31,41,55)` on white, correct).

### 3. Inline prose links inside printable CTAs rendered as giant white buttons

All **79 checklist printables**. `printable-checklist.css` had
`.screen-cta-card a { display:inline-block; padding:12px 28px; background:white; … }`
— intended for the single CTA button, but written as a *descendant* selector, so
it also matched the inline link inside the CTA paragraph. Every printable's
closing paragraph was chopped into three pieces by a full-width white button
block dropped into the middle of the sentence.

This also produced the contrast flag that led me to it: the white block
dominated the `<p>`'s box, so the paragraph measured as white-on-white.

**Fix:** selector narrowed to `.screen-cta-card > a`, plus a new
`.screen-cta-card p a` rule styling prose links as white underlined text on the
teal gradient.

---

## Verified clean

| Check | Result |
|---|---|
| Broken images / 404 `<img>` | **0** |
| Zero-size inline SVG icons | **0** |
| Horizontal overflow (320 / 768 / 1440) | **0** on all 24 templates |
| Page render errors | **0** |
| Regressions introduced by this fix | **0** (before/after diff) |

---

## Known classes left unchanged (deliberate — need Michael's call)

These are design-system colour decisions, not bugs to fix in an automated QA
run:

| Ratio | Element | Colour |
|---|---|---|
| 4.10 | `.btn-primary`, `button`, `.age-badge`, `.button` | white on brand blue `#0284c7` |
| 2.80 | `a.cta-button` on `/beginner-swim-lessons/` | white on orange `#f97316` |
| 4.39 | `.related-area-inactive` | `#6b7280` on `#f3f4f6` |

Brand blue backgrounds are a known outstanding item (text was moved to
`#0369a1` on 2026-08-19; backgrounds were not). The orange CTA at 2.80:1 is the
worst of these and is a primary conversion button — worth a decision.

---

## Two false-positive classes my own harness produced (method notes)

Both are worth recording, because each one looked like a large, credible finding.

**A. Computed-style background walking fakes ~175 contrast defects.** Walking
ancestors for `backgroundColor` returns white for any element sitting on a
`linear-gradient` hero, because the gradient lives in `background-image` and the
`background-color` is `rgba(0,0,0,0)`. That reported every hero headline on the
site as white-on-white at 1.00:1. **214 raw candidates → 11 real.** Contrast
must be verified against rendered pixels, never against the computed cascade.

**B. `full_page` screenshots do not share the live layout.** My first pixel
verification sampled a `page.screenshot(full_page=True)` at coordinates from
`getBoundingClientRect`. Chromium reflows for full-page capture, so the
coordinates pointed at the wrong rows — it "confirmed" a teal gradient card as
white (sampled `(237,249,249)` where `element.screenshot()` gives `(18,178,169)`).
Use `element.screenshot()`, which clips to the element and is layout-accurate.

A third, smaller trap: taking the *worst* of the top-3 most-common pixels as the
background is not conservative, it is wrong — the 2nd/3rd most common pixels are
anti-aliasing and focus-ring noise. A blue button read as white-on-white 1.00:1
that way. Use the single dominant pixel, and require it to hold ≥35% of the
element's area.

---

## Non-defects confirmed (do not "fix" these next run)

- **10px mobile bottom-nav labels** ("Home", "All") — documented intentional carve-out.
- **`.content-grid.article-shell` 692/320 width split** — intentional article+sidebar layout, not a broken grid.
- **`.hero-search-grid` 425/283/120** — intentional search-bar proportions.
- **Inline prose links measuring <44px tall** — exempt by design; they are text, not tap targets.
- **`a.toc-item` at 38px tall** — 6px under the 44px guideline, a known generator-level item, not a regression.
