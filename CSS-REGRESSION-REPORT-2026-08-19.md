# CSS Regression Report — 2026-08-19

**Method:** headless-Chromium computed-style render sweep (not grep).
22 representative pages — one per `<link rel=stylesheet>` fingerprint group — × 3 viewports
(1280 / 390 / 320px), against a fresh clone of `live` @ `e54a3a9`.
Per probe: computed styles + `getBoundingClientRect` for header / nav / logo / navLink /
footer / footerLink, visible-only tap-target minimums, sub-11px text in header/footer,
`scrollWidth − clientWidth`, inline styles inside header/footer, and a functional
hamburger click asserting `aria-expanded` flips.

**Result:** 2 regressions found and fixed, both of the recurring
*"the rule exists, but a markup variant was never in its selector list"* class.
Shipped as `f21ff1c` on `live`, verified 200 at the edge.

---

## Template inventory (729 HTML files → 13 stylesheet-fingerprint groups)

| Pages | Stylesheets | Representative |
|---:|---|---|
| 406 | `main.css` + `article.css` | `/education/fear-of-water.html` |
| 209 | `main.css` | `/404.html` |
| 77 | `printable-checklist.css` | `/education/swim-practice-log-printable.html` |
| 13 | `main.css` + `local-pages.css` | `/swim-lessons/brick-nj.html` |
| 13 | *(none — meta-refresh redirect stubs)* | `/about.html` |
| 4 | `main.css` + `local-pages.css` + `teens.css` | `/teens/scholarships.html` |
| 1 each | `special-needs` · `teens-hub` · `advertise` · `gear` · `swimmers-hub` · `education-hub` · `printable-poster` | — |

The 13 no-stylesheet pages are `<meta http-equiv="refresh">` redirect stubs
(`about.html` → `/about/` etc.). Correctly excluded from the sweep — not a defect.

---

## Regression 1 — `.wwk-breadcrumbs` links were 15px tap targets on 13 directory town pages ✅ FIXED

**Severity: high.** These are the money-product directory pages.

`/swim-lessons/{town}.html` uses a **third** breadcrumb class, `.wwk-breadcrumbs`, defined
only in `local-pages.css` as bare inline `<a>`. Every tap-target rule written by the
8/16 and 8/18 sweeps targets `.breadcrumb` / `.breadcrumbs` / `.page-breadcrumb` /
`nav[aria-label="Breadcrumb"]`. None of them reach `.wwk-breadcrumbs`.

Measured at both 390px and 320px, before:

| Page | Link | w × h | font |
|---|---|---|---|
| `/swim-lessons/brick-nj.html` | Home | 37 × **15** | 12.6px |
| | Swim Lessons | 88 × **15** | 12.6px |
| | Jersey Shore | 79 × **15** | 12.6px |
| | Brick | 32 × **15** | 12.6px |
| `/swim-lessons/philadelphia.html` | 3 links | **15** tall | 12.6px |

15px against a 44px house standard — the worst remaining tap target on the site.

**Why six prior passes missed it:** the earlier sweeps queried the breadcrumb classes they
knew about, so these pages returned *zero* breadcrumb elements and read as clean. Absence
of a match is indistinguishable from absence of a defect unless you enumerate the variants
first.

Affected (all 13): `jersey-shore`, `cheltenham-pa`, `ocean-county-nj`, `monmouth-county-nj`,
`northwest-philadelphia`, `ambler-pa`, `philadelphia`, `brick-nj`, `howell-nj`,
`asbury-park-nj`, `glenside-pa`, `flourtown-pa`, `elkins-park-pa`.

## Regression 2 — `.breadcrumb a` outside a `.breadcrumb-inner` wrapper stayed at 36px ✅ FIXED

`m-app.css` has two breadcrumb rules: a generic one at `min-height: 36px`, and a 44px rule
scoped to `.page-breadcrumb .breadcrumb-inner a` (added 8/16). 68 pages have the
`.breadcrumb-inner` wrapper and get 44px. `/special-needs-swimming.html` renders its
breadcrumb directly inside `div.container`, so only the 36px rule reached it — 8px under
standard at both 390px and 320px.

### Fix for 1 & 2

New Round-4 block appended to `m-app.css`, folding `.wwk-breadcrumbs a` into the list and
lifting the floor from 36px to the 44px house standard, plus a flex container rule so the
`>` separators stay vertically centred against the now-taller links.

Both live in a full-width wrap-capable row and the rule only ever *grows* height, so
neither can introduce horizontal overflow — confirmed by measurement below.

## Regression 3 — printable stylesheets kept a 24px mobile nav gutter ✅ FIXED

`main.css` drops the container gutter to 16px at ≤768px. `printable-checklist.css` (77 pages)
and `printable-poster.css` (1 page) are standalone — they never load `main.css` — and both
hardcode `padding: 0 24px` on the header nav at every width. The printable header logo sat
8px further in than on every other template on a phone.

Mirrored the 16px value into both sheets inside `@media (max-width: 768px)`.
Another instance of the standalone-stylesheet-drift class (same shape as the 8/18 root
font-size finding). Desktop `padding: 0 24px` left untouched — at 1280px the logo already
lands at x=84 on both printables and the main site, so desktop is already aligned.

---

## Verification

Re-rendered all 22 pages × 3 viewports and diffed computed styles against the pre-fix run:

```
390   printable-checklist   nav   padding: 0px 24px -> 0px 16px
320   printable-checklist   nav   padding: 0px 24px -> 0px 16px
390   printable-poster      nav   padding: 0px 24px -> 0px 16px
320   printable-poster      nav   padding: 0px 24px -> 0px 16px

TOTAL DELTAS: 4      DESKTOP (1280px) DELTAS: 0
```

Breadcrumb minimum height after fix:

| Page | 390px | 320px | 1280px |
|---|---|---|---|
| `/swim-lessons/brick-nj.html` | 15 → **44** | 15 → **44** | 16 (unchanged) |
| `/swim-lessons/philadelphia.html` | 15 → **44** | 15 → **44** | 16 (unchanged) |
| `/swim-lessons/glenside-pa.html` | 15 → **44** | 15 → **44** | 16 (unchanged) |
| `/special-needs-swimming.html` | 36 → **44** | 36 → **44** | 16 (unchanged) |
| `/education/`, `/about/` (control) | 44 → 44 | 44 → 44 | 16 (unchanged) |

Printable nav gutter after fix: `logoLeft = 16px` on both printables at 390px and 320px,
matching `/`. Desktop `logoLeft = 84px` on all three, unchanged.

Horizontal overflow (`scrollWidth − clientWidth`): **0 on all 22 pages at all 3 viewports**,
before and after.

Print media re-checked (`emulate_media("print")` → PDF): checklist 2 pages, poster 3 pages —
identical to the `git stash`ed baseline. The fix sits inside a `max-width: 768px` query, so
print is untouched.

---

## Checked and clean

- **Header nav and footer tap targets** — no sub-44px element on any of the 22 pages at
  390px or 320px. The 8/18 footer-bottom fix (`min-height: 44px` on the inline legal/contact
  links) has held.
- **Sub-11px text in header or footer** — none, at either mobile width.
- **Hamburger** — clicked on 8 pages incl. both printables: `aria-expanded` flips
  false → true, `.nav-links` becomes `display: flex`, every menu link ≥ 48px tall.
- **Rogue inline CSS in header/footer** — only the two canonical logo `<img>` sizers
  (`width:28px;height:28px;vertical-align:middle`) and the footer `text-align:center` div.
  Byte-identical across all 22 templates. No inline rule overrides `main.css`.
- **Nav / footer / logo / navLink computed styles** — uniform across all 22 templates at all
  3 viewports apart from the items below.
- **Root font-size scaling** — 16 / 14 / 14px across all templates including printables;
  the 8/18 printable root-scaling mirror held.
- **Body font-family** — `Inter, system-ui, …` on every template.

## Observed, deliberately NOT changed

- **`printable-checklist` nav is `position: static` at mobile** (site standard is `relative`),
  so the injected `m-app.css` dropdown resolves against the header instead of the nav and
  renders full-bleed (left 0, w 390) rather than inset (left 16, w 358). The menu is still
  correctly placed vertically and fully usable — cosmetic only, and the printable ships its
  own in-flow mobile menu that this would interact with. Flagged for a dedicated pass.
- **Printable body `line-height: 1.5` vs `main.css` 1.6.** Real drift, but body line-height
  on a printable moves print pagination; not worth the risk for a 1.6px difference at 16px.
- **`header`/`nav` inherited `color` on `/special-needs-swimming.html` (`#13304a`) and
  `/education/pool-safety-rules-printable.html` (`#1b2a4a`)** vs the `#1f2937` majority.
  Affects only non-link text in the header, of which there is none — invisible.
- **`printable-poster` header `margin: 0 -16px`** — intentional full-bleed hack.
- **`html { font-family }` on `/special-needs-swimming.html`** resolves to Inter rather than
  the browser default; `body` is Inter everywhere regardless. No rendered difference.
- **Desktop nav max-width 1160px on printables vs 1112px site-wide** — the logo lands at the
  same x=84 on both, so there is nothing visible to fix.

---

## Deploy

- Commit `f21ff1c` on `live` (720 files: 3 stylesheets + `main.js` + 716 HTML cache-bust).
- Cache-bust `?v=20260818c` → `?v=20260819a` — one version bump for this push, applied to
  `main.js`, the `m-app.css` href inside `main.js`, and both printable stylesheets.
- Edge verified 200 with the new content on `m-app.css`, `main.js`, `printable-checklist.css`.
- Pushed from a fresh clone. The mount's `.git/index.lock` is **still stale and still
  undeletable from the sandbox** (`Operation not permitted`) — Michael needs to
  `rm "/Users/bss/Documents/Claude/Projects/WATERWISEKIDS.COM/.git/index.lock"` to restore
  the local deploy loop.

## For the next run

Enumerate breadcrumb/nav **class variants** across the tree before asserting a tap-target
rule covers them — query by role and geometry, not by the class names already in the CSS.
A selector that matches nothing looks exactly like a page with no defect.
