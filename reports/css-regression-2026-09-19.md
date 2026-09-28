# CSS regression — 2026-09-19

Fresh clone of `origin/live`. Baseline `513c90921` (the 09-18 css-regression push),
HEAD at start `92364a6cb`. **793 html − 23 meta-refresh stubs = 770 live pages.**
Pushed **`fa95c2163`** (5 files). A concurrent visual-qa run pushed `f43563adf`
mid-session with an overlapping subset — see "Concurrency" below.

## Delta
`assets/css/*` changed only by the 09-18 mobile hero fix (already verified by that
run); `main.js` cache-bust only. 776 HTML files show in the diff but **740 of those
are cache-bust-token-only** — 36 have substantive changes, 4 are net-new.

## Chrome axes — CLEAN at 770/770
| axis | result |
|---|---|
| header markup variants | 3 (576 / 106 / 88) |
| footer markup variants | 2 (663 / 107) |
| nav markup variants | 1 |
| stylesheet sets | 12, each matching its page family |
| rogue chrome CSS in `<style>` | **0** (comments stripped, `@media print` skipped) |
| `font-family` declarations | `inherit` ×226 + the `--mono` stack ×4; no drift |
| cache-bust key uniformity | 669/669 main.css, 440/440 article.css **after fix** |

## ⭐ The finding: a light background repainted inline, but the element's own colour left white

`article.css:164` declares

```css
.stat-box { background: linear-gradient(var(--blue-700), var(--blue-800)); color: white; }
```

Nine callouts repaint that background light with an inline `style` but never cancel
the colour. The inline attribute overrides `background` only, so `color: white`
still applies to the element. **Eight of the nine had bare text runs with no
coloured descendant — white on `#fff7ed` / `#ecfeff` / `#e0f2fe`, roughly 1.05:1.
Invisible.**

| page | background | verdict |
|---|---|---|
| `infant-swim-resource` ×2 | `#fff7ed`, `#f0f7ff` | invisible (3 bare runs each) |
| `autism-speaks-water-safety` | `#fff7ed` | invisible |
| `swimming-pool-fence-laws-by-state` | `#fff7ed` | invisible |
| `lightning-pool-safety` | `#fff7ed` | invisible |
| `swim-vest-life-jacket` | `#ecfeff` | invisible |
| `jump-turn-swim-explained` | `#ecfeff` | invisible |
| `rip-currents-pull-you-under` | `#ecfeff` | invisible |
| `heat-exhaustion-kids-pool` | `#e0f2fe` | **covered** — every inner span sets its own colour; consistency-only |

The 49 house-shape siblings all carry `color:#1e293b`. ⭐ `article.css:1013` already
documents this exact trap — but only for **links** inside light boxes, "keyed on the
dark background hex so a light box can never match and lose its links to white."
The element's **own** colour was the half of the same bug nobody covered.

⇒ **Generalisable probe:** for any component whose stylesheet rule pairs a
background with a colour, flag every inline override that sets one and not the
other. Add it to the standing battery — it is cheap and it catches an AA failure,
not a cosmetic one.

## Also converged
- **Off-ramp orange.** 6 `.stat-box` accent on `#ea580c`, defined in no sheet;
  `main.css:34` declares `--orange-500: #f97316` and 54 siblings use it. Corpus
  `.stat-box` orange is now one colour in two shapes (25 plain @ `margin:20px`,
  29 with the `#fed7aa` border @ `margin:22px`), split by border presence rather
  than drift.
- **Breadcrumb blue.** `#0284c7` ×4 on the two pages published this morning vs
  **892** pages on `#0369a1`. **Identical to `e23bfee84`, one day earlier** — the
  publish template is reintroducing it.
- **`.tldr-box`-shaped `.stat-box` margin** 22px → 20px (474 siblings at 20px).
- **Cache-bust keys.** Both net-new pages shipped `main.css` with **no key**
  (667 use `?v=20260913b`) and `article.css?v=20260406` (438 use `?v=20260828d`).
  They were the only two pages in the corpus that could be served a different
  `main.css` than their family, and the only two pinned to a pre-August
  `article.css`. Same class as `9dfc309d6`, also one day earlier.

⇒ Three of today's four findings are **same-defect recurrences from yesterday**,
all localised to pages emitted by the publish pipeline. The pipeline's page
template, not the corpus, is the thing that needs the fix.

## FPs retired
- **`.checklist-icon` `color:#f97316`** on `swim-lessons-cost` (1 vs 138). It is the
  ⚠️ row in a 💧 list — deliberate. The "missing `font-weight:700`" was a probe
  artifact: the inline overrides only `color`, the class rule still supplies weight.
  ⇒ **an inline style is a patch on the class rule, not a replacement for it** —
  compare computed sets, never inline sets.
- **Directory `.tldr-box` `margin:0 auto`** on MI/NJ/NC (3 of 32). They wrap the box
  in `<section class="section" style="padding-bottom:0;">` which supplies the
  spacing; `margin:0` is correct *given that wrapper*. Confirms the 09-17 read.
- **`div.container style="max-width:820px"`** on MS/MT (2 of 52). A markup variant of
  the prose rail that computes to the same 820px box as the 49 `section.state-info`
  siblings.
- **`margin:22px 0` corpus-wide** (105 files) is the `#e0f2fe` AEO answer-box
  component, not drift. Only the `.tldr-box`/`.stat-box` instances were defects.
  ⇒ census the **full property set**, never the one declaration you noticed.
- **Two pages with a `monospace` stack** match `main.css:1098` exactly. The probe
  reported them as an *empty* font-family because `[^;}"']*` truncates at the
  apostrophe in `'Monaco'` — the recorded attr-regex trap, reproduced again.

## Concurrency ⚠️
A **visual-qa run pushed `f43563adf` mid-session** carrying the same white-on-light
`.stat-box` finding and the same breadcrumb fix, discovered independently. The push
was rejected non-fast-forward; the clone was reset to `origin/live` and only the
**non-overlapping** deltas re-applied, so nothing was clobbered and nothing was
duplicated. ⇒ **`git fetch` and diff before force-anything** — and an independent
run reaching the same finding is the strongest confirmation available in a session
with no browser.

## Left for Michael
- ⭐ **The publish pipeline's page template is the root cause.** Three defect classes
  (breadcrumb `#0284c7`, unkeyed/stale cache-bust, off-house callout colours) have
  now been hand-fixed on net-new pages on two consecutive days. Fixing the emitter
  once retires all three.
- Standing corpus-scale calls, unchanged: the 487-page inline `.tldr-box` override;
  the two neutral ramps (slate vs gray); the 430-page double-inset breadcrumb bar;
  `.content-grid` 30px off-rail at desktop on 122 pages.
- ⚠️ `git worktree list` on the mount **still** reports the deleted `/tmp/wwk-wt` as
  locked — fourteenth consecutive confirmation. Needs one interactive
  `git worktree prune --force`. No unattended run may do it.

## Sandbox
**No browser — seventh consecutive run.** The Browser pane was declined (unattended)
and `web_fetch` is provenance-gated, so nothing was *seen*. Verification was cascade
analysis instead, which for this defect is actually stronger: `.stat-box` has exactly
one owning rule and the rest is inline, so the computed colour is determinate. All 8
affected pages were confirmed to load `article.css`.
`/sessions` 100% / 0 bytes free throughout; `/` 5.5G of 9.6G. Scratch `/tmp/cssreg919/`
(non-matching prefix), removed explicitly.
