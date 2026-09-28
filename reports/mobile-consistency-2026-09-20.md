# Mobile consistency check — 2026-09-20

**Baseline:** `7057da0`, the 09-19 mobile closure
**Corpus at start:** `origin/live` @ `e39f2b9` → reset to `6ddd399` mid-run (concurrent push)
**Pages:** 796 HTML − 23 meta-refresh stubs = **773 live** (776 after `6ddd399`)
**Pushed:** `5db6346` — 2 files, no HTML touched
**Method:** Chrome tool + same-origin hidden iframe against production, 390 / 320 / 834 / 1280 / 1440
**Scratch:** `/tmp/mob920/` (non-matching prefix), removed

---

## Delta since the baseline

CSS/JS byte delta was **7 lines in `main.css`** — the 09-20 visual-qa WCAG contrast
fix (`--green-700` token, `.milestone-age`, `.checkmark`). `m-app.css` and `main.js`
were **untouched**, so the mobile layer itself was unchanged and every finding below
predates this window. 674 files changed in total, 671 of them the `main.css?v=` bump.

---

## THE finding — three more nested gutters, 126 pages, the largest instance yet

The 2026-09-05 / 09-18 rule in `m-app.css` cancels a `.container` nested **inside** a
hero, using a `>` child combinator. Three nestings that combinator cannot reach were
found, verified by eye at 390, and fixed.

### (a) The nesting inverted — 122 pages

122 local-landing and root article pages put the hero **inside** the page's own
`.container`, not the other way round:

```
DIV.container      x=0   padding-left 20   ← the rail
 SECTION.page-hero x=20  padding-left 20   ← second gutter
  H1 / .kicker / lead    x=40
```

On the same page the header logo, the sibling `.tldr-box` card edge, every `h2` in
the article body and the footer all sat at **20**. A visible, left-aligned 20px step
directly above the body copy. Confirmed in a rendered zoom before fixing.

### (b) Three-deep — 3 photo-hero pages

`education/swimming-after-eating-myth.html`, `kayak-canoe-safety-kids.html`,
`pool-floaties-dangers.html` use `article.css`'s photo-hero structure:

```
DIV.page-hero          padding-left 20
 DIV.page-hero-content padding-left 14   (article.css:550, 2.5rem 1rem × 14px root)
  DIV.container        padding-left 20
   H1                  x=54
```

**x=54 is the largest single content inset measured on this site.** The `>` combinator
in the existing rule cannot see through `.page-hero-content`.

### (c) The homepage

`.what-we-offer` and `.featured-articles` (and `.featured-programs` at 16px) each wrap
their body in a `.container`, so their section headers rendered at **44 / 44 / 40**
while the sibling `.about-snippet`, the H1 and the hero lead all sat at **20**.

⭐ **`.about-snippet` is the one homepage section with no inner `.container`, and it was
already correct — that sibling disagreement inside a single page is what identified it.**
A corpus census would never have found it: each section is a one-page family.

### The fix — `m-app.css`, inside the existing `@media (max-width: 768px)` block

```css
.container > .page-hero,
.page-hero > .page-hero-content,
.page-hero-content > .container,
.what-we-offer > .container,
.featured-articles > .container,
.featured-programs > .container { padding-left: 0 !important; padding-right: 0 !important; }
```

In every case the **outermost** box already sits on the 20px rail, so each nested
gutter is cancelled rather than the rail being moved — the same shape as the existing
`footer > .container` and `.page-hero > .container` rules.

### Verified live, cache-busted, after deploy

| | before | after |
|---|---|---|
| 122-page cohort, h1 + kicker @390 / @320 | 40 | **20** |
| 3 photo-hero pages, h1 @390 / @320 | 54 | **20** |
| homepage `.what-we-offer` / `.featured-articles` / `.featured-programs` h2 | 44 / 44 / 40 | **24 / 24 / 20** |
| controls (`british-swim-school/jersey-shore`, `/education/`, `/special-needs-swimming`) | 20 | 20 |
| 834 / 1280 / 1440, all cohorts | — | **identical before and after** |

Inert above the 768 cap on all three bands — not a
[band-fix-dies-above-its-upper-cap] shape.

**Residue, deliberate:** the two homepage section headers land at 24 rather than 20
because `.section-header` carries its own 4px. Below the visible-step threshold; left
alone rather than restyling a shared wrapper for 4px.

### Cache-bust call — no HTML touched

`m-app.css` is JS-injected, so its cache key lives inside `main.js`. The key was bumped
`20260918a → 20260920a` **inside `main.js` only**. `main.js` is served
`max-age=14400` + ETag, so the fix reaches new visitors immediately and cached visitors
within 4 hours. Bumping `main.js?v=` in the HTML would make it instant at the cost of a
**779-file commit** — not paid for an alignment fix. (Contrast `e39f2b9` earlier the same
day, which did pay the 671-file tax for a WCAG contrast failure. Severity is the
tiebreaker.) **Michael: bump `main.js?v=` sitewide if you want it instant.**

---

## Every other axis — 0

**Static, 773/773 (776 after the concurrent push):**

- viewport: **1 variant**, `width=device-width, initial-scale=1.0`, 0 zoom-blocked
- `.hamburger`: exactly 1 per page, 0 missing, 0 duplicated
- **`main.js`: 0 pages missing** — the 09-19 defect class did not recur
- form controls: **0 pages** carry one without loading a sheet that declares the 16px guard
- 12 stylesheet families intact

**Rendered, 98 pages @390 (3 net-new + 4 per family across all 12 families + 60 random
+ 15 key templates) and 50 @320:**

- document overflow **0** · element overflow **0**
- tap targets under AA 24 **0** · text under 10.95px **0** · text-entry inputs under 16px **0**
- images broken / distorted **0**
- **footer rail 20 on 96/96**, content rail 20 on 93, **0 `null` buckets**
- m-app injected, bottom nav present, hamburger present on **every page**

**Hamburger clicked on 15 pages across all families:** 15/15 open,
`aria-expanded false→true`, `display none→flex`, button **44×44** on all 15, drawer
geometry identical `x=20, 350×409` on all 15, **0 tap failures inside the open drawer**.

**Net-new pages (`6ddd399`, pushed mid-run):** `pool-chemical-safety`,
`pool-chemical-storage-safety-card`, `-printable` — all three carry `main.js`, the
correct viewport, their family's sheet set and a hamburger, and all three measure
fully conformant. **Third consecutive publish batch clean on the mobile side.**

**Edge freshness CLOSED:** 5/5 live assets hash-identical to HEAD before the push, and
`m-app.css` + `main.js` hash-identical after it, `age: 0`. Deploy lag ~3 min.

---

## Probe artifacts — two new shapes

1. ⭐ **The rail-descend step must exclude m-app-INJECTED chrome, not just
   `header`/`footer`/`nav`.** On `/index.html` the probe descended into
   `DIV.mobile-app-search-header` and reported the rail as **16**. Every real content
   section on that page (`.what-we-offer`, `.featured-articles`, `.about-snippet`) and
   the footer measure **20**. The search header is a deliberate m-app component with its
   own 16px inset. Add `.mobile-app-search-header` and `.mobile-category-bar` to the
   chrome exclusion list alongside `.mobile-bottom-nav`. One level past the 09-18 card
   discriminator and the 09-19 body-descend fix.

2. ⭐ **A general stacked-gutter probe is dominated by the gradient FP unless the card
   test reads `background-image`.** A "two or more padded non-card ancestors" sweep
   returned **27 distinct shapes on 76 of 95 pages**. Re-triaging each shape's innermost
   wrapper with `background-image` included collapsed it to **2 real shapes**: every
   other hit was a card — `.sidebar-box` (bg + radius + 1px border), `.inline-cta`,
   `.sidebar-cta`, `.wwk-cta-banner`, `.contact-cta` (all gradient-painted, so
   `backgroundColor` reads `rgba(0,0,0,0)`), `.screen-cta-card` (bg + radius). This is
   [gradient_reads_as_transparent_background_color] arriving in a new probe. The card
   test must be `(bg||gradient) && (radius||border||shadow)`, not `backgroundColor` alone.

3. **13 printable h1s at x=41 are card padding, not a gutter** — `.checklist-card` sits
   at exactly 20 (bg white + radius 12 + 1px border + shadow) inside `.checklist-page`'s
   20px rail, and its h1 takes the card's own 20px. Correct by design, uniform across all
   12 printables in the sample including the net-new one.

4. **Canary re-run before the sweep** (`srcdoc`, no site CSS): every true positive fired
   exactly once — doc overflow, element overflow, 18×18 tap, 9px text, 12px text input,
   distorted image, rail 40 vs footer 20 — and **no** true negative fired, including the
   `display:inline` prose link and the 11px `type="checkbox"`. The 09-16 inline exemption
   and the 09-18 text-entry filter both held.

---

## Left for Michael

1. ⭐ **The same stacked gutter persists in the tablet and desktop bands on the same 122
   pages.** At 834 the hero h1 reads **48** against a 24px rail; at 1280 it reads **108**
   against an 84px rail. `m-app.css` is a mobile-only sheet by construction, so this run
   fixed ≤768 only — every previous stacked-gutter fix on this site was scoped the same
   way. The desktop half needs the equivalent rule in `main.css` and is a visual change
   on 122 pages, so it is your call. It is also the **same 122-page cohort** as the
   standing `.content-grid` 30px-off-rail typography call.
2. **`main.js?v=` sitewide bump** if you want today's fix to reach cached visitors in
   under 4 hours rather than up to 4 (779-file commit — see the cache-bust call above).
3. **21px rem-drift rail on 3 pages** — `privacy/`, `terms/`, `jobs/post.html`;
   page-local `.content{padding:3rem 1.5rem}` against a 14px mobile root. Fix is
   `1.5rem` → `20px` in three sheets. **Deferred a sixth time.**
4. **Dangling `/tmp/wwk-wt` worktree — twenty-first confirmation.** Absent on disk both
   before and after the mandated cleanup, still reported by `git worktree list` on the
   mount. Needs one interactive `git worktree prune --force`.
5. **The mount's working tree was dirty at session start — 346 uncommitted changes,
   fourth consecutive day.** Another task's in-flight work. Not touched; all measurement
   was done in the clone.
6. **Long tail of one-off nested gutters, flagged not fixed** — `.dir-coverage` inside
   `.section` (1 page, x=42), `.cta-section > .container` on `/special-needs-swimming`
   (x=60), `UL` inside `.hub-body` on `/swimmers-hub/` (x=39), two unclassed `DIV`s on
   `/education/` and `/education/life-skills-from-swimming`. Each is a 1–2 page family
   needing an individual judgement call; none is a sibling-inconsistency inside its own
   page the way the three fixed shapes were.
