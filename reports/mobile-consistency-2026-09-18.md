# Mobile consistency check — 2026-09-18

**Baseline commit:** `adb55b149` (the 2026-09-16 mobile closure — the last recorded mobile run)
**origin/live at start:** `9dfc309d6`
**Pushed:** `c5db54b` — 1 real defect fixed
**Corpus:** 789 HTML − 23 meta-refresh stubs = **766 live pages**

---

## Result

| axis | denominator | result |
|---|---|---|
| viewport meta (1 variant, no zoom block) | 766/766 | **0** |
| `.hamburger` present ×1 | 766/766 | **0** |
| `main.js` loaded | 766/766 | **0** |
| form control ≥16px guard reachable | 766/766 pages with a control | **0** |
| doc horizontal overflow @390 / @320 | 90 / 90 | **0** |
| element overflow (scroller-aware) @390 / @320 | 90 / 90 | **0** |
| tap targets < AA 24px | 90 @390 + 90 @320 | **0** |
| chrome text < 10.95px | 90 @390 + 90 @320 | **0** |
| text-entry input < 16px (iOS focus zoom) | 90 @390 + 90 @320 | **0** |
| image scale / aspect distortion | 90 @390 + 90 @320 | **0** |
| hamburger opens (click) | 10/10 | **0** — 44×44, `aria false→true`, 0 tap fails in the open drawer |
| **content rail == footer rail** | 90 @390 + 90 @320 | **1 defect** (below) |

Rail distribution @390: `{20px: 88, 40px: 1, 41px: 1}`. Rail roots exercised:
`main.article` 42, `body` 24, `article.article` 11, `main.wwk-local-content` 11, `main` 2 —
**0 `null` buckets**, so the 09-15 blind spot stayed closed.

## Edge freshness — CLOSED

All five live assets hash-identical to repo HEAD, both before and after the push:

| asset | live sha256[:16] | repo |
|---|---|---|
| `main.css` | `f32ba0a4ad0cff88` | match |
| `m-app.css` | `370704a241ebc740` (post-push) | match |
| `main.js` | `8c5a095988bbdbe5` (post-push) | match |
| `article.css` | `a0b47cd821ac4a8e` | match |
| `printable-checklist.css` | `5bf661559b477550` | match |

Hubs `/`, `/education/`, `/swim-lessons/directory/` all `age: 0–8`. Deploy lag ~3 min.

---

## The defect — a stacked hero gutter the 09-05 pass missed

`/special-needs-swimming.html` rendered its H1 and hero sub at **x=40** while every
paragraph, h2 and the footer on the same page sat at **x=20** — a visible 20px step in
the page's left edge, at both 390 and 320.

**Cause.** `m-app.css` sets `.hero { padding: 16px 20px 8px !important }` at ≤768, and
the general `.container` rule adds another 20px. The 2026-09-05 pass fixed exactly this
shape for `.page-hero` and `.tools-hero` — it did not list bare `.hero`.

**Why only one page.** Eight pages carry a bare `class="hero"`. Seven of them
(`/`, `/find-swim-lessons.html`, `/advertise/`, `/gear/`, `/swim-schools/`,
`/swim-schools/add.html`, `/teens/`) put their hero content in `.hero-content`, which has
no rail of its own and already reads 20. `/special-needs-swimming.html` is the only one
that wraps it in a `.container`. The majority here is also the house shape, so the fix
brings the outlier into line rather than moving the rail.

**Fix (`c5db54b`).** One selector added to the existing 09-05 rule:

```css
.page-hero > .container,
.tools-hero > .container,
.hero > .container { padding-left: 0 !important; padding-right: 0 !important; }
```

Cache-bust `m-app.css?v=20260907c → 20260918a` and `main.js?v=20260917a → 20260918b`
across 772 pages (m-app.css is JS-injected, so the main.js key has to move with it).

**Verified live, cache-busted:** 320 → `h1x 20 == body 20 == footer 20`;
390 → `20/20/20`; 834 → `24/24/24` and the rule is inert (`.hero` carries no horizontal
padding above the cap, so this is not a band fix that dies above its ceiling).
Doc overflow 0 at all three.

**Census done at the same time** so this does not recur under a fourth name: seven
hero-class elements corpus-wide wrap a `.container`. `.fwsp-hero`
(`/tools/family-water-safety-plan.html`) and `.pbsc-hero`
(`/tools/pool-barrier-self-check.html`) do — but set **no horizontal padding of their
own**, measured at 20 at 390. They are deliberately not added to the selector list, and
the reason is written into the stylesheet comment.

---

## Probe artifacts triaged (not defects)

1. **`/404.html` rail 41.** `MAIN` itself reads 20. The 41 is `div.error-content` —
   white background, 12px radius, box-shadow, i.e. **a card**, exempt by the house
   convention. My descend-if-full-bleed step lacks the card discriminator: at 390 `main`
   *is* full-bleed, so the probe descended into the card and reported its inset as the
   rail. Same root cause on `/special-needs-swimming.html`'s `x=49` paragraphs
   (`div.card`, `div.condition-item`).
2. **`/swim-schools/add.html` — 20+ inputs at 13.33px.** All `type="checkbox"`. The
   16px `!important` guard enumerates text-entry types only, correctly: a checkbox has no
   text entry and cannot trigger iOS focus zoom. Filter the input axis to text-entry types.
3. **12 static `font-size < 16px` declarations on form controls** across 6 stylesheets —
   all inert. Every page carrying a form control loads at least one of the four sheets
   that declare the `16px !important` guard (`main.css`, `m-app.css`,
   `printable-checklist.css`, `printable-poster.css`); checked as a `<link>`-set question,
   not a "does the page have inline styles" question. 0 pages uncovered.
4. **A greedy `[^}]*` rule-block regex** invented 12 more iOS-zoom hits by matching a
   `font-size` from a *different* rule. Parse `selector { decls }` with a
   no-nested-brace group before believing any declaration-level census.
5. **5 pages with an inline `min-width` > 360px** (`directory/index.html` 420px,
   4 PA locals 520px) — every one sits inside an `overflow-x:auto` wrapper, which is why
   the page-level overflow baseline reads 0. Known, load-bearing, do not strip.

## Canary

Built with `srcdoc` (no site CSS, portable). TP fires on all six axes — doc overflow,
element overflow, rail 40 vs footer 20, sub-24 tap target, 9px text, 12px input, aspect
distortion. TN fires on none, **including its inline prose link**, so the 09-16
`display:inline` exemption held.

## Not verified

- The 676 pages outside the 90-page sample were not individually rendered. Covered by:
  a **zero CSS delta** from the baseline (the only asset change was the MailerLite mirror
  in `main.js`, which touches no layout), the 09-13 full-corpus closure, 766/766 on the
  four static axes, and a clean 90-page render at two widths spanning all 12 stylesheet
  families.
- Tablet band (769–1149) swept only on the fixed page. No CSS rule in that band changed.

## Standing items left for Michael (unchanged, flagged not shipped)

- **21px rem-drift rail on 3 pages** — `privacy/`, `terms/`, `jobs/post.html`. Page-local
  `.content{padding:3rem 1.5rem}` × a 14px mobile root. Fix is `1.5rem`→`20px` in three
  page-local sheets. Deferred a fourth time, consistent with the standing typography call.
- **Dangling git worktree** — `git worktree list` on the mount still reports
  `/tmp/wwk-wt … locked` while the directory is absent. Eighth confirmation. Needs one
  interactive `git worktree prune --force` in the mount's repo; an unattended run is not
  permitted to do it.
- The mount's own checkout is still stranded at `0e211752b` (2026-09-16) with ~780
  modified files in the working tree. All work this run was done in a fresh clone.
