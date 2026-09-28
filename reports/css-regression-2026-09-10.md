# CSS regression check — 2026-09-10

Clone of `origin/live` @ `20970b54f` → shipped `83b3d9ae8`.
774 html − 23 refresh stubs = **751 live pages**, rendered at 1280 and 390,
**0 render errors**. Print-media pass over the 577 pages carrying any targeted
furniture.

## Screen axes — all CLEAN, unchanged vs the 09-09 baseline

| axis | result |
|---|---|
| header / footer markup variants (normalized, `.active` stripped) | **5 / 2** — matches 09-08 and 09-09 exactly |
| header, footer, body, `html` computed styles | 1 bucket per stylesheet family, both viewports |
| logo / nav-link / footer-link style signature | 1 bucket per family, both viewports |
| horizontal overflow | 0 / 751 |
| tap targets < AA 24px | 0 / 751 |
| chrome text < 11px | 0 / 751 |
| footer rail @390 | 20px on all 751 |
| undefined fallback-less `var()` | 0 (75 tokens defined, 62 used without fallback) |
| inline `<style>` rules touching shared chrome outside `@media print` | **0** |
| `main.css` cachebust | uniform (651 pages + 100 no-main printables) |
| page-level breakpoints colliding with the 768/769 house bands | **0** — only 3 `min-width` blocks corpus-wide, all already at 769 |

660 files changed since the last clean sweep, but the only CSS delta was a
22-line `@media print` addition, which bounds how much screen regression was
possible. Confirmed inert: 44 reps covering every header variant × stylesheet
family × 2 viewports × 14 style/geometry signals produced **0 deltas** before
vs after this session's own change.

## The one real defect: `.related` was never print-hidden

`8b257e0e0` (09-09) added a print-hide list to `main.css` and reported
"chrome 481 → 0". It hid `.related-articles`. **The corpus ships the same
"Keep Reading" furniture under two class names**, and the bare `.related`
variant is on **314 live pages** — hidden by no stylesheet, anywhere.

Exact class-token census over the 751 live pages:

| class token | pages |
|---|---|
| `related-articles` | 514 |
| `related` | **314** |
| `cta-button` | 334 |
| `review-btn` | 52 |
| `cat-btn` | 2 |
| `btn-search` / `btn-clear` | 1 |

The 09-09 pass could not see the gap because its verification probe was keyed
to the same class list it had just fixed. The miss reproduces on pages that
commit claimed to have fixed — `/education/aap-infant-swim-lessons-research.html`
printed a **957px** `.related` block; `/education/pool-safety-rules.html`
printed **2095px**.

### Shipped

- `.related` added to the print-hide list in `main.css`, and mirrored into
  `printable-checklist.css` and `printable-poster.css`.
- `.cat-btn`, `.btn-search`, `.btn-clear` print-hidden — dead JS controls,
  the same class of defect as the `.review-btn` / `.search-box` the 09-09
  pass already accepted. (95 category pills were printing on `/education/`.)
- `/education/flow-pools-vs-traditional-pools.html`: its **"Sources & Further
  Reading" citation box was nested inside the `.related` wrapper**, so hiding
  `.related` would have stripped attribution from paper. Moved into `.article`
  immediately before `.related`. Another instance of the
  main-content-stranded-in/below-`.related` class.
- Cachebust → `20260910a` on `main.css` and both printable sheets.

### Verification (print media, 577 pages)

```
.related / .related-articles / .cat-btn / .btn-search / .btn-clear /
.review-btn / .search-box / breadcrumb / header / footer   0 visible
pages with a visible sources block                         385
h1, main and prose still visible on every non-printable page
flow-pools: sources y=7702 visible in print, .related collapsed to 0
```

Confirmed live on `www.waterwisekids.com` (leaf page, not a hub):
`main.css?v=20260910a`, `last-modified 2026-09-10 15:35 GMT`, and all eight
selectors present in the served print block.

## Not fixed, deliberately

- **`.cta-button` prints on 334 pages.** Unlike `.cat-btn`, it carries real
  copy rather than being a dead control, so whether a conversion CTA belongs
  on paper is an editorial call for Michael, not a regression.
- `article.css:488` `.footer-links{flex-direction:column}` is still a dead
  declaration under `m-app.css`'s `display:none!important` — unchanged from
  the 09-09 judgement that touching a 427-page stylesheet for a no-op is more
  risk than the defect.

## Probe artifacts worth recording (not corpus defects)

- **Header variant count read 14 before normalization, 5 after.** Stripping
  `.active` leaves `class=" "` behind, and the *position* of that residue
  differs by which nav link `main.js` marks active — so each active-position
  became its own bucket. Strip `\s+class="\s*"` after removing `active`.
- **Footer rail read 0 on all 751 at 1280.** At desktop the `<footer>` box
  spans full width with no padding and the rail lives on an inner container;
  `footer.x + paddingLeft` only measures the rail at ≤768. The @390 value
  (20px, 751/751) is the canary that matched the baseline.
- **"0 visible `main`/`.article-body`" on 152 pages** is the printable family
  using its own wrapper, and a `rect.height > 2` visibility test drops the
  poster `h1`. Both pre-date this session; use a display-only test for
  presence checks.
