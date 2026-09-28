# CSS Regression Check — 2026-09-17

**Clone:** fresh `origin/live` @ `850a6e4` · **Baseline:** `e6ec173` (the 09-16 run B push)
**Corpus:** 785 HTML − 23 redirect stubs = **762 live pages**
**Delta:** 8 commits · 34 HTML · 1 JS · 0 CSS
**Result:** 0 regressions introduced by the delta. **19 pre-existing sibling inconsistencies fixed.**

---

## 1. Delta surface — clean

`assets/css/*` was **untouched**. The only non-HTML change is `assets/js/main.js`
(+58 lines, MailerLite signup mirror + GA4 `checklist_signup` broadening) — a
behavioural change with no style surface.

Across all 34 changed files, **base → now identical** for: stylesheet link sets,
`<header>` signature, `<footer>` signature, `<nav>` signature, `<style>` block
count, font-family declarations.

Three net-new pages, all joining existing families with no new chrome variant:

| page | sheets | header | footer | family |
|---|---|---|---|---|
| `education/jump-turn-swim-explained` | main + article | `36a733dba0` | `13d511bdbe` | article (509 pages) |
| `education/swim-team-readiness-scorecard` | main + article | `0cf1f7c635` | `13d511bdbe` | lead-magnet landing (85) |
| `…-scorecard-printable` | printable-checklist | `bf2c0e3ea0` | `eb68a557c4` | checklist printable (104) |

Corpus chrome variant counts, unchanged: **6 headers / 2 footers / 3 navs**.
The 2-page header+nav singleton (`49a5ba1bae` / `c930b54b03`) is `index.html` +
`404.html` — legitimate, not drift.

---

## 2. The finding: `.tldr-box` is inline-overridden on 487 pages, and the overrides have drifted apart

`main.css:1920` owns a `.tldr-box` component. **487 of 611** `.tldr-box`
elements in the corpus carry an inline `style` re-implementing it with
off-ramp near-duplicates of the house tokens (`#f0f7ff` vs `--blue-50:#eff8ff`,
`#0077b6` vs `--blue-700:#0369a1`).

⭐ **The 487 is corpus-wide convention and was NOT touched** — de-inlining it is
Michael's call, not a regression fix. What *was* fixed is the **variance between
siblings of the same template**, where the same box rendered differently on
pages a visitor compares side by side. Corpus inline variants: **13 → 8**.

### 2a. Directory state pages — 3 variants → 1 (11 pages)

26 of 51 state pages carry the box. They had split into three shapes:

| n | max-width | line-height | colour | pages |
|---|---|---|---|---|
| 15 | 820px | 1.65 | `#334155` | AZ CO CT IN MD MA MN MO OR SC TN UT VA WA WI |
| 8 | **860px** | **1.6** | `#334155` | CA FL GA IL NY OH PA TX |
| 3 | **860px** | **1.6** | **`#1e293b`** | MI NJ NC |

Normalised the 11 minority pages to the 15-page shape (which is also what
today's AEO commit `e4d5991` shipped on CT/OR/UT). Property sets are now
**identical on 23 of 26**; the remaining 3 keep `margin:0 auto` because their
box sits inside a padded `<section class="section">` wrapper — structural, not
cosmetic, so left alone and flagged below.

### 2b. Root article pages — a 40px indent on 5 of 101

96 root pages used `margin:20px 0`; **5 used `margin:20px 40px`**, rendering the
box inset from the body column while every sibling sat flush
(`how-parents-can-support-swim-lessons-at-home`, `swim-safety-tips-for-parents`,
`why-year-round-swim-lessons-matter`, `what-should-kids-wear-to-swim-lessons`,
`why-kids-need-swim-lessons-even-if-they-have-a-pool`). Normalised to `20px 0` →
**101 of 101 identical**.

`adult-swimming-lessons.html` carried the same `margin:20px 40px` **followed by
`margin-left:auto;margin-right:auto`**, so the 40px was dead code. Rewritten to
`margin:20px 0` — computed margins unchanged, dead asymmetry removed. Its
`max-width:1160px` is a corpus singleton, flagged not changed.

### 2c. Swimmers-hub stroke guides — 4 siblings, 4 renderings

| page | box |
|---|---|
| backstroke | bare `.tldr-box` (house component) |
| freestyle | `padding:16px 20px; margin:20px 0; radius:8px` ← corpus dominant (456) |
| breaststroke | `padding:20px; margin:30px 0; **radius:4px**` |
| butterfly | `padding:16px; margin:24px 0; **radius:4px**` |

Normalised breaststroke + butterfly to freestyle's shape. Three of the four now
match each other and the 456-page corpus dominant; backstroke keeps the clean
bare component.

---

## 3. False positives reproduced

- **Rogue chrome CSS in `<style>`: real count 0.** The probe flagged 2 printables
  for `footer { display:none !important }` — both inside `@media print`, and both
  merely duplicating a rule `printable-checklist.css:282` already owns. ⇒ the
  probe must skip `@media print` blocks *as well as* stripping comments
  (extends the 09-16 comment-stripping fix).
- **Undefined classes: 0 regressions.** `.state-info` (41 pages), `.related-card`
  (94 printables), `.hub-intro` (1) are defined in no loaded sheet — all
  **pre-existing and unchanged base→now**. They are dead markup hooks with no
  styling, not broken styling. An earlier pass also mis-flagged 11
  `education/index.html` classes because the probe's sheet list omitted
  `education-hub.css`; the probe must read the page's own `<link>` set.

---

## 4. Left for Michael

1. ⭐ **487 pages inline-override the `.tldr-box` component main.css owns**, using
   `#f0f7ff`/`#0077b6` rather than `--blue-50`/`--blue-700`. Two sites' worth of
   blue. De-inlining is a corpus-wide design decision, not a regression fix.
   `swimmers-hub/backstroke-complete-guide` + `swimmers-hub/index` +
   `education/swim-milestones-by-age` already do it the clean way — 3 of 611.
2. 3 directory pages (MI, NJ, NC) wrap the box in `<section class="section"
   style="padding-bottom:0">` while the other 23 use a bare `<div>`. Structural
   divergence; unifying it is a markup change, not a style one.
3. `adult-swimming-lessons.html` is the only page with `max-width:1160px` on a
   `.tldr-box`.
4. 25 of 51 directory state pages have **no Quick Answer box at all** (AL AK AR
   DE HI ID IA KS KY LA ME MS MT NE NV NH NM ND OK RI SD VT DC WV WY) — an AEO
   coverage gap, not a CSS defect.
5. `british-swim-school/jersey-shore.html` and `…/northwest-philadelphia.html`
   each carry an empty `style=""` attribute. Pre-existing, harmless, untidy.

---

## 5. Verification

Static analysis only. **No browser — fifth consecutive run**; `/sessions` again
at 100% (0 bytes free), `/` had 4.3G. Scratch at `/tmp/cssreg917` (deliberately
outside the mandatory `/tmp/wwk-*` `/tmp/wk-*` cleanup globs).

Canaries, all passing:
- diff is exactly **+19 / −19 lines**, every one a `<div class="tldr-box" style=…>` line
- 0 other lines touched; 0 markup, class, or stylesheet-link changes
- 0 style attributes emptied; corpus `.tldr-box` count **611 → 611**
- directory prop-set groups **3 → 2**, root article **3 → 2**, swimmers-hub **4 → 2**
- corpus inline variants **13 → 8**
- 0 untracked files in the commit

⚠️ `git worktree list` on the mount still reports the deleted `/tmp/wwk-wt` as
locked. Unchanged from 09-16; needs one interactive `git worktree prune --force`.
