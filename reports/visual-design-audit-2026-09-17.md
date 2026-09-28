# Visual Design Audit — 2026-09-17

**Baseline:** `origin/live` @ `6338066` (this morning's css-regression push)
**Pushed:** `846c853`, `7c7ab3a` — 84 files, 4 defect classes + 1 alignment class
**Corpus:** 785 html − 23 redirect stubs = **762 live pages**, 12 stylesheet families
**Browser:** available — **first run in 6 days with actual rendered screenshots.**
Chrome tool against **production** (direct navigation for screenshots, a
same-origin 390/320/1280px `<iframe>` for measurement).

---

## Screenshot pass — one page per template family

| Family | Representative page | Verdict |
|---|---|---|
| `main.css` (homepage) | `/` | clean |
| `education-hub.css` | `/education/` | clean (see FP #1) |
| `article.css` | `/swimmers-hub/breaststroke-complete-guide.html` | clean |
| `main.css` (directory state) | `/swim-lessons/directory/florida.html` | **DEFECT — fixed** |
| `main.css` (directory hub) | `/swim-lessons/directory/` | clean |
| `main.css` (city page) | `/kids-swim-lessons-elkins-park-pa.html` | clean |
| `local-pages.css` | `/swim-lessons/jersey-shore.html` | clean |
| `printable-checklist.css` | `/education/independent-swimming-readiness-checklist-printable.html` | **DEFECT — fixed** |
| `printable-poster.css` | `/education/pool-safety-rules-printable.html` | clean (see FP #2) |
| `teens-hub.css` / `teens.css` | `/teens/`, `/teens/lifeguard-certification.html` | clean |
| `gear.css` | `/gear/` | clean |
| `advertise.css` | `/advertise/` | clean |
| `special-needs.css` | `/special-needs-swimming.html` | clean |
| `swimmers-hub.css` | `/swimmers-hub/` | clean |

Floor axes across the sample at 390px: horizontal overflow **0**, footer rail
**20/20**, broken images **0**, zero-size SVG/icons **0**, chrome text under
10.95px **0** (the only 10px spans are the deliberate bottom-nav labels).

---

## ⭐ The finding: a 20px ragged left edge on the directory cluster

Caught **by eye in a rendered zoom**, not by any probe. On
`/swim-lessons/directory/florida.html` the intro paragraph visibly hung to the
left of the Quick Answer box directly above it. Measured at a 1920 viewport:

| | before | after |
|---|---|---|
| `.tldr-box` (Quick Answer) | x=550, w=820 | x=550, w=820 |
| intro prose block | **x=530, w=860** | **x=550, w=820** |
| delta | **−20px** | **0px** |

820px is unambiguously the house directory rail: `.dir-coverage` is 820px on
**51/51** state pages, and `.state-info`, `.state-content`, `.dir-metros` and
`.tldr-box` are 820px wherever they appear. 860px had crept into four later
block shapes — an **unclassed** intro prose `div` (19 pages),
`.section.state-info.town-answers` (4), `.faq-section` (3) and a bare
`.container` (2): **29 blocks over 22 files**. None wraps a table, so narrowing
is safe. All now 820px; `max-width:860px` is **0 corpus-wide in the directory**.

⭐ **Probe gap this exposed:** the intro div carries **no class**, so a variance
probe keyed on `tag + class` never enumerated it — the 19-page defect was
invisible to the very sweep that found the other four in `846c853`. *Key
inline-styled elements by their property set even when they have no class.*

---

## Other fixes shipped

**FL/TX `section.state-info` 908px → 820px** (2 pages vs 36 siblings). A second,
separate block on the same two pages. Before: prose 860px at x=210 under an
820px box at x=230 (1280 viewport); after: 772px at x=254, nesting 24px inside
the box exactly as all 36 siblings do. Both pages were touched by the 09-16
FL/TX de-dup commit — same two pages, same drift history.

**8 education articles: `div.stat-box` `color:#1f2937` → `#1e293b`.** Property
set byte-identical to 20 sibling stat-boxes that use `#1e293b`; only the text
colour differed. Component now **28/28 uniform**. Deliberately does *not*
relitigate the standing sitewide gray-vs-slate ramp question — if that lands on
gray, one sed now fixes all 28 instead of 28 disagreeing pages.

**31 printables: `span.related-card-link` bare `font-size:0.82rem` → `max(11px, 0.82rem)`.**
47 siblings already carried the small-text floor. No computed change at current
root sizes (11.48px at a 14px mobile root); closes a latent floor gap. **78/78.**

**23 printables: `div.related-grid`** differed from 55 siblings by one space
inside `minmax(min(220px, 100%),1fr)`. Zero render change; removes a permanent
diff-noise variant. **78/78 byte-equal.**

---

## False positives reproduced and retired

1. ⭐ **`/education/` hero fades to white at the bottom** — looked like a broken
   gradient in the screenshot. It is `.page-hero--edu::after`, a deliberate 60px
   `transparent → white` scrim (main.css:979). `.page-hero--edu` and
   `.page-hero--hub` are each 1-page families — legitimate hub styling, not drift.
2. **Poster print button is orange while every other primary CTA is blue** —
   `.btn-print` uses `--poster-orange-text`; `printable-poster.css` is a
   one-file family with its own navy/orange palette, matching the poster art.
3. ⭐ **CA/IL/NY carry `.faq-section`/`.faq-item` whose CSS lives in `article.css`,
   which those pages do not load** — *not* broken styling: those blocks are fully
   inline-styled, so the inline attrs are the only styling and are load-bearing.
   The discriminator remains "does the page load the sheet that owns the
   component", not "does it have inline styles".
4. **MI/NJ/NC `.tldr-box` `margin:0 auto`** (vs 23 siblings on `20px auto`) —
   correct: those three wrap the box in `section.section`, which supplies the
   top margin.
5. **`.checklist-icon` orange `#f97316` on `swim-lessons-cost.html`** — the glyph
   is ⚠️, a colour emoji, so `color` is inert. The bare `•`, 💧 and `1`–`5`
   variants are different glyph roles, not unstyled checkmarks.
6. **Dangling speakable `cssSelector` — still 0** corpus-wide (re-verified).

---

## Left for Michael (design calls, not regressions)

- **487-page inline `.tldr-box` override** — unchanged standing call. Two blues
  sitewide (`#f0f7ff` vs `--blue-50:#eff8ff`, `#0077b6` vs `--blue-700:#0369a1`).
  3 clean exemplars still exist.
- **`div.screen-cta` themed on 4 of 81 printables** — green `#f0fdf4` on hot-tub
  / kiddie-pool / pool-party, blue `#eff6ff` on cold-water, against 77 siblings
  with no band. Reads as intentional topic theming; left alone.
- **`a.related-card`: 78 slate-bordered vs 14 blue-bordered + hover transition**
  (`#e2e8f0` vs `#bae6fd`, plus `color:#0c4a6e`). The 14 also *gain* a
  `transition` — normalising down would remove a feature. Design call.
- **`div.stat-box`: 16 variants over 155 pages** — mostly deliberate roles (blue
  info / orange warning / gradient CTA). Two residual near-dupes worth a look:
  `border-left:4px solid #ea580c` (2 pages) vs `#f97316` (20), and
  `div.sidebar-box` at 8 variants over 71 pages.
- **`.content-grid` 30px off-rail at desktop on 122 pages** — unchanged
  typography call.
- **Undefined-but-harmless class hooks** (corpus-wide denominator, wider than any
  previous delta scan): `.state-info` 41, `.state-content` 8, `.town-answers` 4,
  `.related-card` 94, plus ~12 singletons. Dead markup hooks, nothing visibly
  broken — worth a tidy, not a fix.
- **`aeo-progress.md` / `.deploy/` artifacts and the dangling `/tmp/wwk-wt`
  worktree** — still needs one interactive `git worktree prune --force` in the
  mount's repo.

---

## Sandbox notes

- `/sessions` arrived at **100% (0 bytes free)** again; `/` had 4.3G. All work in
  `/tmp/vda917`, a prefix deliberately outside the mandatory `/tmp/wwk-*`
  `/tmp/wk-*` cleanup globs.
- All git writes done in the `/tmp` clone; the mount's repo was never written to
  (it carries unrelated uncommitted changes from other sessions).
- **Deploy lag measured: ~2 min for `846c853`, ~3 min for `7c7ab3a`.** Chrome's
  own HTTP cache served the pre-fix HTML to `navigate` for several minutes after
  the edge was already current — verify with `fetch(url+'?x='+Date.now(), {cache:'no-store'})`
  before trusting a rendered measurement, or the "after" state reads as a
  failed deploy.
