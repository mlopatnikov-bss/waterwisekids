# Internal Linking Report — 2026-08-27

Commit `d539736` on `live`. Measured on a fresh clone of `origin/live` (745 HTML
files, 497 under /education/, 659 non-printable pages rendered).

## 1. Link-graph hygiene sweep — still saturated, as expected

| metric (prose links in body containers, printables excluded) | value |
|---|---|
| pages with 0 **inbound** prose links | **0** |
| pages with 0 **outbound** prose links | **0** |
| broken internal prose hrefs (all edges) | **0** |

Confirms the 2026-08-26 finding. The count lever is finished; "added N more
links" is not a useful output for this job any more. The 87 zero-outbound and 4
zero-inbound hits were all `*-printable.html`, which sitewide sweeps exclude by
design.

## 2. The defect found: 683 invisible prose links on 118 pages

`main.css` opens with `a { color: inherit; text-decoration: none }`. `article.css`
supplies `.article-body a` and (since `4953ae65`) `.article-excerpt a`. **Any page
that does not load `article.css` had no prose-anchor rule at all** — its in-body
links rendered pixel-identical to the surrounding sentence. Present in the DOM,
resolving 200, counted by every crawler and every audit. Invisible to readers.

Found by rendering all 659 non-printable pages headless over HTTP at 1280×900
with transitions disabled, and flagging every anchor whose computed colour,
weight, style, background and border matched its parent and whose
`text-decoration-line` was `none`.

| affected area | links | pages |
|---|---|---|
| `.article` (legacy root-level article layout) | 230 | 43 |
| `.state-info` / `.dir-coverage` / `.state-content` / `.dir-hub-body` (directory) | 338 | 51 |
| `.hub-intro` / `.hub-body` / `.hub-answer` / `.hub-section` | 46 | 5 |
| `.wwk-highlight-box` / `.wwk-info-box` / callouts / source lists | 63 | 15 |
| `.page-hero` / `.cta-section` (white on gradient) | 6 | 6 |

Every one of the 683 anchors had **no class** — they are all plain prose links,
not buttons or cards. The split is its own canary: of 415 pages that load
`article.css`, only 23 links were affected; of 209 pages on `main.css` alone, 597.

## 3. Fix

Appended to `assets/css/main.css`:

- `p a, li a, dd a, td a, blockquote a` → `--blue-700` + underline. Specificity
  **(0,0,2)** on purpose: above the base `a` rule, below every class-scoped
  anchor rule in the codebase, so `.article-body a`, `.toc-item a`, `.tldr-box a`,
  `.inline-cta a`, `.nav-links > li > a`, `.footer-col ul li a` all still win.
  A default, not an override.
- `nav a, header a, footer a, aside a` → `inherit` / `none`. Equal specificity,
  declared later, so chrome and sidebar rails keep exactly their current look.
- `aside p a` (0,0,3) → carve-back, so a real sentence inside a sidebar box still
  reads as a link while the TOC rails stay untouched.
- `.page-hero a`, `.page-hero-subtitle a`, `.cta-section p a|li a` → keep the
  inherited white, add the underline. blue-700 on those gradients would be
  unreadable.

**Element selectors, not scoped ones**: 209 pages have neither a `<main>` nor an
`<article>` wrapper. A first attempt scoped to `main`/`article` fixed only 811 of
the 1,526 links and silently missed every directory and statistics page.

## 4. Verification

Full before/after computed-style diff of **all 33,259 anchors on 659 pages**:

- **1,526** anchors gained an underline; **1,230** of those also gained blue-700.
- **0** anchors lost colour or decoration. No nav, footer, breadcrumb, card,
  button, TOC or sidebar-rail regression.
- 7 diffs were mid-transition colour jitter on nav links (≤10 RGB units, no
  decoration change) — the known `transition: color 0.15s ease` artefact; the
  sweep was re-run with transitions disabled to isolate them.
- Re-run at 390 px with the m-app drawer opened: only the intended prose changes.
- Contrast of `#0369a1` against every background observed under an affected link:
  **5.52–5.93:1** (AA needs 4.5:1).
- Residual: 72 links in `aside` TOC / related rails on 7 pages — excluded by design.
- 0 broken internal prose hrefs before or after.

`main.css` cache-bust `20260825e` → `20260827a` across all 646 referencing pages;
0 left on the old token. No content changed, so `sitemap.xml` `lastmod` is
deliberately untouched.

## 5. Open

- **Live verification blocked.** `web_fetch` refused
  `https://www.waterwisekids.com/assets/css/main.css?v=20260827a` on a provenance
  restriction, and policy forbids falling back to curl. The push to `live`
  succeeded (`ea9cb09..d539736`); the Pages build was not independently confirmed.
  Worth an eyeball on any directory page — the links there should now be blue and
  underlined.
- `special-needs-swimming.html` (the only page loading `special-needs.css`) is now
  covered by the element-scoped default; it previously had no anchor rule outside
  `.breadcrumb`. Closes the item left open on 2026-08-26.
