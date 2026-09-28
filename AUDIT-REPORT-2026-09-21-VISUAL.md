# Visual design audit — 2026-09-21

Fresh clone of `origin/live`, scratch `/tmp/vda921/`. Baseline `65ae17c` (09-20
visual audit). 799 html − 24 stubs = **775 live pages**. Delta since baseline:
683 files, 3 net-new pages, CSS/JS delta = `m-app.css` + `main.js` (the 09-20
gutter push).

**Pushed 4 commits** (`1eb75ade4`, `b18e2619c`, `4b7998aa6`, `cf0245594`) —
592 files, all colour values, no geometry and no markup structure touched.

---

## The axis this run opened: the CSS surface is 14 sheets, not 13

Every contrast sweep in this series has read `assets/css/*.css`. **172 pages carry
their own page-local `<style>` block**, and that surface had never been measured.
It held 15 failing rules, 12 of them live — including the shared breadcrumb
separator *restated locally on 5 pages*, which would have silently overridden the
stylesheet fix shipped in the same run.

Second new axis: **pseudo-state rules that change only half the colour pair**
(`::placeholder`, `:hover`, `:focus`) and inherit the other half from their base
rule. The 09-20 sweep only kept rules declaring `color` **and** `background`
together, so an entire class of defect sat outside it — 12 hits, 8 live.

---

## Fixed and verified rendered

| what | where | before | after |
|---|---|---|---|
| form placeholders | `main.css`, 355 fields / 218 pages | **2.43** (field) / 2.54 (focus) | **4.63 / 4.83** |
| breadcrumb separator `›` | 939 inline spans + `main.css` + 5 page-local blocks | **2.43** | **4.62** |
| checklist `✓` icons | 138 inline + `main.css`, 24 pages | **2.49** | **5.47** |
| review stars `.star` | 51 directory state pages, page-local | **2.49** | **5.47** |
| hub search placeholder | education + swimmers hub | **2.54** | **4.83** |
| hub search icon (SVG) | education + swimmers hub | **2.54** | **4.83** |
| hub clear button `×` | education + swimmers hub | **4.39** | **6.87** |
| `.form-error` | `main.css` + new `--red-700` | **3.76** | **6.47** |
| poster lead-form button hover | `printable-poster.css` | **3.48** | **7.31** |
| jobs meta labels, `.faq-arrow`, `.btn-delete` | page-local, 3 pages | 2.43–4.41 | 4.62–6.47 |

Every one of these was **seen rendered post-deploy**, not only computed: placeholder
4.83, search icon 4.83, clear button 6.87, hub separator 4.63, article separator
4.62, checklist icons 5.47 ×8.

New colours were avoided. `#0f766e` for the stars is the value the directory hub
already uses two lines away (`.school-review-stars`); `--red-700: #b91c1c` codifies
a hex already in the corpus 16×; `#9A3412` for the poster hover matches
`.btn-print:hover` in the same sheet.

## Fixed, live at the origin, NOT yet rendered-verified

`m-app.css` mobile chrome `#a3a3a3 → #6b7280` (2.52 → 4.83). `main.js` **injects**
the mobile chrome, so `.mobile-bottom-nav`, `.mobile-cat-item` and
`.search-pill-sub` show **0 instances** in static HTML and every class census in
this series reported them dead. At 390px they are all live. A prior run had already
darkened the **label spans** to `#6b7280` — but the parent `a` kept `#a3a3a3`, and
that is the colour the inline SVG icons inherit through `stroke="currentColor"`, so
the icons stayed at 2.52:1 while their own labels passed.

The new bytes are confirmed at the origin. The rendered value still reads the old
colour because the page requests `m-app.css?v=20260920a` and no key was bumped;
it propagates on its own within `max-age=14400` (4 h).

## Clean at 775/775

Horizontal overflow 0. Broken images 0. Header/footer rail 84px uniform at 1280 and
20px at 390, all 12 sheet families. Header markup variants 3, footer 2 (the
documented counts). Cache-bust keys 100% uniform on all 13 assets, `main.js`
781/781. `color:#0284c7` **0** corpus-wide — this morning's emitter fix held. All
**3 net-new pages fully conformant** (correct keys, house breadcrumb blue,
`main.js` present, no novel inline declarations vs their family) — 5th consecutive
clean run on that axis. Yesterday's three fixes all held, including
`.program-badge` re-verified **with the state filter driven** (90 chips, 0 fails).

## Left for Michael

- **`.stars { color: #fbbf24 }`** — gold star ratings on the two British Swim
  School pages, **1.67:1**. Below even the 3:1 floor for a graphical object, but
  darkening gold stars to `#b45309` changes their character. A design call, not a
  regression fix.
- **5 dead AA-failing sheet rules** carried over from 09-20 (`.badge-orange`,
  `.btn-orange`, `.nav-links .has-badge::after`, `.badge-green`, `.btn-teal`) plus
  `teens-hub.css .cta-button` — all still **0 instances**, so zero visual impact,
  but latent traps the moment anyone uses the class.
- **98 `#9ca3af` fill-in-the-blank rules** on printables (`border-bottom`), left
  alone as pen-and-paper decoration.
- Standing corpus-scale calls unchanged: `.tldr-box`'s two vocabularies (501 vs
  126), the 430-page breadcrumb inset, the neutral-ramp split.

## Corrections to the record

The 09-21 css-regression note states the breadcrumb separator split is "cosmetic"
and that "both separators clear AA on `#f8fafc`". **`#9ca3af` on `#f8fafc` is
2.43:1.** The claim was wrong in four consecutive notes; the passing variant
(`#6b7280`, 4.62) was the 52-page minority, and the whole corpus has now been
converged onto it.
