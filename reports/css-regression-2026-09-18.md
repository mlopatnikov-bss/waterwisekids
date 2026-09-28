# CSS Regression Check — 2026-09-18

**Clone:** fresh `origin/live` @ `c2f5285` · **Baseline:** `6338066` (the 09-17 run push)
**Pushed:** `513c9092` → `origin/live` (fast-forward)
**Corpus:** 789 HTML − 17 redirect stubs = **772 live pages**
**Delta:** 9 commits · 772 HTML · 0 CSS · 0 JS
**Result:** 0 regressions introduced by the delta. **153 pre-existing defects fixed
across 70 pages**, in two families — a font fallback chain and an unconverted
related-card shape.

---

## 1. Delta surface — clean

`assets/css/*` was **untouched**, and so was `assets/js/*`. The 772-file
footprint is almost entirely one commit: `5c086f0` cache-busts
`main.js v=20260913b → 20260917a` on 768 pages — one attribute per file, no
style surface. The style-relevant commits are the two `[visual-qa]` passes
(`846c853`, `7c7ab3a`, prose column → the 820px directory rail) and
`22d491a` (og:image dimensions — meta only).

Across all 768 pre-existing pages, **base → now identical** for: stylesheet link
sets, `<header>` signature, `<footer>` signature, `<nav>` signature, `<style>`
block count, chrome-selector overrides, font-family declarations. Zero drift.

Four net-new pages, all joining existing families with no new chrome variant:

| page | sheets | header | footer | nav |
|---|---|---|---|---|
| `education/rip-currents-pull-you-under` | main + article | `36a733dba0` (517) | `13d511bdbe` (666) | `97066cad90` (518) |
| `education/swim-vest-life-jacket` | main + article | `36a733dba0` (517) | `13d511bdbe` (666) | `97066cad90` (518) |
| `education/swim-lesson-teaching-method-worksheet` | main + article | `0cf1f7c635` (86) | `13d511bdbe` (666) | `2cdac5b6bb` (252) |
| `…-worksheet-printable` | printable-checklist | `bf2c0e3ea0` (105) | `eb68a557c4` (106) | `2cdac5b6bb` (252) |

Corpus chrome variant counts, unchanged from 09-17: **6 headers / 2 footers /
3 navs / 12 sheet sets**. `<style>`-block chrome overrides: **0** (the 09-17
`@media print` + comment-stripping probe fix holds — no false positives this run).
The Google Fonts `<link>` is byte-identical on all 772 pages.

---

## 2. Finding A: 5 different Inter fallback chains, on form controls main.css already fixed

`main.css:110` sets the canonical body stack
`'Inter', system-ui, -apple-system, sans-serif`. `main.css:120-137` then carries a
dated comment block and the rule
`button, input, select, textarea, optgroup { font-family: inherit }` — added
2026-08-28 after a rendered font census found form controls falling back to Arial
because **no browser inherits the page font into form controls**.

**65 declarations on 55 pages re-declared the font on exactly those controls, at
higher specificity, with a shorter fallback chain — silently undoing that fix:**

| n | pages | selector(s) | declared chain | fallback if Inter fails |
|---|---|---|---|---|
| 53 | 52 directory pages | `.search-controls input`, `.search-field select` | `'Inter', sans-serif` | **generic sans (Arial)** |
| 11 | `aquatic-jobs/index` | inputs, selects, textarea + 7 button classes | `Inter, sans-serif` | **generic sans (Arial)** |
| 1 | `index.html` | `.newsletter-form input[type=email]` | `'Inter', system-ui, sans-serif` | system-ui ✓ |
| 1 | `contact/index` | `.form-group textarea` | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | -apple-system ✓ |

`.job-search-bar input` (0,1,1) beats `input` (0,0,1), so the sheet's `inherit`
never applied on those pages. When Inter loads all five chains render
identically — the defect is invisible until Inter *doesn't* load (offline,
blocked font CDN, slow first paint), at which point 53 form controls on the
directory and all 11 on `aquatic-jobs` drop to Arial on an otherwise all-Inter
site, while every other page falls back to the OS UI font.

**Fixed:** all 65 → `font-family: inherit`, which resolves to the canonical
main.css stack and is what `article.css` / `education-hub.css` already do. Corpus
font-family values in HTML are now **`inherit` only** (plus the legitimate
`'Monaco','Courier New',monospace` code stack, which matches `main.css:1098`).
Rendering with Inter present is unchanged on all 55 pages.

---

## 3. Finding B: 15 printables never got the related-card conversion

`printable-checklist.css:276-279` owns the component:

```
.related-card       { display:block; background:#fff; padding:14px 16px; border-radius:8px;
                      text-decoration:none; border:1px solid #e2e8f0;
                      transition: box-shadow 0.2s, transform 0.2s; }
.related-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); transform: translateY(-2px); }
.related-card-title { color:#0369a1; font-weight:600; font-size:0.95rem; }
.related-card-link  { color:#0e7490; font-size:0.85rem; font-weight:600; }
```

93 of 105 printables carry a related-card block. **78 used the canonical classed
form; 15 were still on a pre-conversion shape** — same family, same template,
five concrete divergences per card:

| | canonical (78 pages) | unconverted (15 pages, 88 cards) |
|---|---|---|
| card border | `#e2e8f0` gray | **`#bae6fd` blue** |
| card `color` | *(unset)* | **`#0c4a6e`** — inherited by the title div |
| `transition` | *(sheet: `box-shadow, transform`)* | **`box-shadow 0.2s`** — kills the transform easing |
| title | `class="related-card-title"`, `0.95rem` | **bare `<div>`, `.93rem`** |
| link | `class="related-card-link"`, `font-size:max(11px,0.82rem)` | **bare `<span>`, `.82rem`** — no floor |

Two of these bite. The inline `transition` overrides the sheet's, so the sheet's
`:hover { transform: translateY(-2px) }` **snapped instead of easing** on 88
cards. And the missing `max(11px, …)` — the legibility floor commit `846c853`
shipped to this family — left the "Read Guide →" link free to render under 11px.
Same defect class that commit was written to fix; these 15 pages were simply
missed.

**Fixed:** all 88 cards converted to the canonical classed form. The 11px floor
now covers **93 of 93** printables that have a related-card block (was 78 of 93).
Link text moves `#0369a1` → `#64748b`, matching the other 78. Card labels
("Read Guide" vs "Read Article") are content, not style, and were left alone.

---

## 4. Triaged and deliberately NOT changed

Sibling-variance sweep across all 12 sheet families flagged these; each is
semantic variation or a design call, not drift:

- **`.stat-box`, 15 inline variants on 168 elements.** The spread is
  meaningful — blue `#e0f2fe` for data, amber `#fff7ed` + orange left rule for
  caution, blue gradient reversed-out for the hero stat. Collapsing it would
  destroy information. ⭐ *But* three pairs differ only in syntax, not output
  (`#f97316` vs `#ea580c` left rules; `linear-gradient(135deg,#e0f2fe,#f0f9ff)`
  vs the same gradient written `0%/100%`). A token pass would be worth doing.
- **`.cl-checkbox`, 9 variants on 17 elements** — 8 are a one-page colour-coded
  legend. Intentional.
- **`.checklist-icon` `color:#f97316` on 1 of 139** — it's a `⚠️` among `✓`s.
  Intentional.
- **`.tldr-box`, 4 variants in the `main` family** — all four documented and
  left by the 09-17 run (100 bare / 26 directory 820px / 3 section-wrapped /
  1 `max-width:1160px` singleton). Unchanged.
- **`.sidebar-box`, 10 variants on 119 elements** — 46 use
  `var(--gray-50,#f9fafb)` tokens, 56 use raw hex for the blue gradient. Mixed
  convention, but the colours carry meaning. Flagged below.

---

## 5. Left for Michael

1. ⭐ **`.authoritative-sources` — 9 elements, 2 shapes, neither matching the
   sheet.** `main.css:2651` owns it
   (`border:1px solid #e2e8f0; border-radius:var(--r-lg,12px); padding:1.25rem`).
   6 pages inline a `border-left:4px solid #0284c7` accent + `8px` radius +
   `20px 24px`; 3 pages inline `border:1px solid #e2e8f0` + `10px` + `18px 22px`.
   Because `border-left` only overrides the left edge, the 6 render as a gray box
   *with* a thick blue spine and the 3 as a plain gray box. 6-vs-3 is too even to
   call a dominant shape, and the right answer is probably to de-inline all 9 and
   let main.css own it — a design decision, so untouched.
2. ⭐ **The 487-page `.tldr-box` inline override is still open** (09-17 item 1).
   `#f0f7ff`/`#0077b6` inline vs `--blue-50`/`--blue-700` in the sheet — two
   sites' worth of blue. Only 3 of 611 do it the clean way.
3. **`.sidebar-box` mixes `var(--gray-50,#f9fafb)` tokens (46) with raw hex
   (56+)** for equivalent treatments. Worth one token pass.
4. 3 directory pages (MI, NJ, NC) wrap the tldr-box in
   `<section class="section" style="padding-bottom:0">`; the other 23 use a bare
   `<div>`. Structural, unchanged.
5. `adult-swimming-lessons.html` is still the only page with
   `max-width:1160px` on a `.tldr-box`.
6. `british-swim-school/jersey-shore.html` and `…/northwest-philadelphia.html`
   still each carry an empty `style=""`. Harmless, untidy, third run flagged.
7. 25 of 51 directory state pages still have **no Quick Answer box** (AL AK AR
   DE HI ID IA KS KY LA ME MS MT NE NV NH NM ND OK RI SD VT DC WV WY). AEO
   coverage gap, not CSS.
8. 🔒 **The `origin` remote URL on the Mac mini mount embeds a GitHub PAT in
   plaintext** (`git remote -v` prints it). Worth rotating it and switching to a
   credential helper or SSH key now that this is the permanent host.
9. ⚠️ **The Mac mini mount's `live` branch is 273 ahead / 62 behind
   `origin/live`** with 308 dirty paths (46 modified, 17 staged+modified, 245
   untracked). It is not a usable deploy checkout — this run pushed from a fresh
   clone, as the last six have. Worth one interactive session to reconcile or
   re-clone it, or it will keep drifting.
10. ℹ️ **`reports/` and `qa-reports/` are not tracked in git** (0 files under
    either in `git ls-files`), so this report series exists only on the mount.
    If the Mac mini is now the permanent home that is fine, but there is no
    off-machine copy. Worth either committing them or backing the folder up.

---

## 6. Verification

Static analysis only. **No browser — sixth consecutive run**; `/sessions` again
at 100% (0 bytes free), `/` had 4.1G. Scratch at `/tmp/cssreg918*` (deliberately
outside the mandatory `/tmp/wwk-*` `/tmp/wk-*` cleanup globs).

Canaries, all passing:

- diff is exactly **+329 / −329 lines** across **70 files**, all tracked HTML
- added lines reduce to **4 distinct shapes** (88 anchors, 88 titles, 88 links,
  65 `font-family: inherit`); removed lines to **8** — nothing else was touched
- **0** `<link>` stylesheet lines in the diff; **0** href values changed
  (removed-side and added-side href sets are byte-identical)
- re-ran the probe post-edit: `sheets` / `header` / `footer` / `nav` /
  `<style>` count / chrome-overrides changed on **0 of 772** pages
- corpus font-family values in HTML: **3 variants → 1** (`inherit`)
- `.related-card` blue-border variant: **15 pages → 0**; cards with an unclassed
  title inside a `.related-card`: **0**
- 11px link floor on printables with a related-card block: **78/93 → 93/93**
- `.related-card` element count preserved by the edit (88 removed / 88 added)
- empty `style=""` count **2 → 2** (the two pre-existing, none introduced)
- **0 untracked files** in the commit
- push to `origin/live` confirmed fast-forward (`origin`-only commits: 0)

⚠️ `git worktree list` on the mount still reports the deleted `/tmp/wwk-wt` as
locked. Unchanged since 09-16; still needs one interactive
`git worktree prune --force`.
