# CSS regression — 2026-09-13 (second run)

Clone of `origin/live`. Started at `9be99f5100` → shipped **`3e74c0d310`**
(rebased onto a concurrent AEO push `7157f391`).
778 HTML − 23 stubs = **755 live pages**.

---

## 1. There was no regression to find

`origin/live` was at **exactly `9be99f5100`** — the commit this morning's CSS
regression run shipped. **Zero commits, zero bytes of delta** since that sweep,
which had already measured the chrome axes clean on a 122-page delta+control
sample at 1280/834/390 and closed grouped-variance at full corpus 755/755.

Re-rendering an unchanged corpus against closed axes is churn. The run's budget
went instead to the largest **named-open** CSS defect.

---

## 2. Closed: the tablet-band tap-target floor

### The hole

`.wwk-navlist` is a *runtime* class. `m-app.js:219` adds it to a `<ul>` only
when every `<li>` holds a single anchor and no other text — a structural test
CSS cannot express. But `m-app.js` / `m-app.css` are injected by `main.js`
**only at `innerWidth <= 768`**, so above the mobile breakpoint the tagging
never ran and the 24px AA floor had nothing to attach to.

A coverage hole, not drift. It had **no upper bound** — desktop was as exposed
as tablet.

### Measured before (independent reproduction of the 09-13 finding)

| viewport | pages failing AA 24×24 | sub-24px targets | of which `ul > li > a` |
|---|---|---|---|
| **834** (all 755 pages) | **633** | **4,263** | **4,229** |
| **1280** (380 pages) | 363 | 2,404 | 2,343 |

Heights 16 / 18 / 19px. The **width** axis measured clean at 834 (0 targets
under 24px wide). 633/755 matches the previously recorded figure exactly.

**Containers are not stable — 20 distinct signatures:**
`section.related-articles` (2,367), `div.sidebar-toc` (552), `article.article`
(367), `ul.note-list` (366), `div.article-related` (102), `section.screen-only`
(88), `div.container` (86), `div.article-body` (73), `ul.state-grid` (51),
`div.sidebar-box`, `ul.toc-list`, `div.sidebar-widget`, … A class-selector
restatement would have reported clean and missed the tail.

### The fix — 4 assets, no HTML content change

- **`assets/js/main.js`** — `initNavlistShapeTagging()` runs the *same*
  structural test at every width. The `<=768` double-add against `m-app.js` is
  inert (`classList.add` is idempotent). The test is copied verbatim rather than
  re-derived, so the two copies cannot diverge.
- **`assets/css/main.css`, `printable-checklist.css`, `printable-poster.css`** —
  `.wwk-navlist > li > a { display:inline-flex; align-items:center;
  justify-content:flex-start; min-height:24px; min-width:24px }`, screen-scoped,
  **unscoped by media query**, **no `!important`** so `m-app.css`'s `!important`
  copy still governs ≤768.

> **All three sheets, not just `main.css`.** **102 of the 633 affected pages are
> printables that never load `main.css`** (101 load only `printable-checklist.css`,
> 1 only `printable-poster.css`). A `main.css`-only fix would have closed 531 and
> silently left 102 — and reported clean.

`min-width` is kept even though the width axis measured clean at 834: the
3-character `FAQ` row in `.sidebar-toc` already falsified the "anchors are
always wide enough" assumption once, at 375px.

### Measured after

| viewport | pages failing | targets | `ul > li > a` | doc overflow | render errors |
|---|---|---|---|---|---|
| **834** (755 pages) | 633 → **36** | 4,263 → **37** | 4,229 → **3** | 0 → 0 | 0 |
| **1280** (380 pages) | 363 → **62** | 2,404 → **62** | 2,343 → **1** | 0 → 0 | 0 |
| **769** (240 pages) | — | 15 | 1 | 0 | 0 |
| **390** (380 pages) | 22 → **22** | 22 → **22** | 0 → **0** | 0 → 0 | 0 |
| **320** (240 pages) | 14 → **14** | 14 → **14** | 0 → **0** | 0 → 0 | 0 |

- **Mobile is byte-identical before and after** — the `m-app.css` `!important`
  copy still wins ≤768, exactly as intended.
- **Document-level overflow 0 at every viewport, before and after.** The
  box-level overflow set is *identical* (7 pages @390, 4 @320) — pre-existing
  horizontally scrollable `table.wk-calc` and the `.cat-btn` filter strip,
  untouched by this change.

### Live verification (leaf pages, never a hub)

`.wwk-navlist` now tags 1–3 lists per page at 834 **and** 1280, and `ul > li > a`
sub-24px is **0** on every page checked at 834 / 1280 / 390.

---

## 3. Residual at 834 — a *different* class, deliberately not widened

The 36 remaining pages are **not** the class that was fixed:

- **34 × standalone `<p><a>CTA</a></p>` in `.cl-footer`** on printables —
  "Browse all free water safety guides", 13–15px tall, failing at **390 as well
  as 834**.
  The standing note treats `.cl-footer p a` as *exempt by design*, and for the
  **"Created by … — Free water safety education"** paragraph that is right: the
  anchor sits in running prose and is WCAG 2.5.8-exempt. But a **third**
  paragraph in the same block contains *only* the anchor. That one is not prose
  and is a genuine sub-24px control. **The exemption was a claim about a
  selector, and the selector now covers two different shapes.**
  Not fixed here: the only CSS hook (`.cl-footer p a`) also matches the prose
  citation, and flooring that would break the sentence's inline flow. Needs
  either the runtime-tagging idiom extended to standalone block anchors, or a
  markup change. **Editorial call.**
- **3 × single-item lists** excluded by the `itemCount >= 2` gate
  (`kids-swim-caps-guide`, `swimming-achievement-milestones` ×2). Left alone
  deliberately: the gate is shared with `m-app.js`, and a structural test that
  differs between its two copies is a worse defect than 3 links.

---

## 4. Same-page variance check (ruling out partial tagging)

A floor fix that tags *some* lists in a container can introduce fresh
sibling drift. Measured at 1280 over 300 pages: multi-height list groups
**57 → 63 pages / 59 → 65 groups**. All 6 new groups triaged:

Two different components share one container signature — a **prose sources
list** (`"American Academy of Pediatrics: cites research finding…"`, untagged,
20px, correctly prose-exempt) and a **standalone related-links list** (tagged,
26/29px). Different components, correctly treated differently. The coarse
`container > ul` key lumps them; the key is the artifact, not the corpus.

The 43 "changed spread" groups were already multi-height before
(`(19,45) → (26,51)`): lists mixing one-line and wrapped links. Shape unchanged,
both values shifted by the floor.

---

## 5. Cache-bust

All four assets carry `max-age=14400`, so they revalidate within 4h with no HTML
change — but leaving keys stale would violate the one-key-per-asset invariant and
trip the next audit. Bumped to **`20260913b`**:

| asset | refs | old key → new |
|---|---|---|
| `main.js` | 761 | `20260907c` → `20260913b` |
| `main.css` | 659 | `20260910a` → `20260913b` |
| `printable-checklist.css` | 101 | `20260910a` → `20260913b` |
| `printable-poster.css` | 1 | `20260910a` → `20260913b` |

`20260913a` was **already taken** by `schools-data.js` — collision avoided.
Post-push: **one key per asset, 0 stale survivors, 0 unkeyed refs.** The `m-app.css`
/ `m-app.js` keys inside `main.js` are untouched, correctly — neither file changed.
761 HTML files touched, **cache-bust only — no content change**, so no `lastmod`
or `dateModified` bump.

Re-verified **after** the rebase onto the concurrent push, not before.

---

## 6. Probe notes for the next run

- **Canary gate passed before any corpus number was trusted**: TN 0 hits / TP 3
  hits at 390, 834 **and** 1280. The TN carries a prose link, an `inline-block`
  prose link, and the `.mobile-bottom-nav` 10px strip — the three exemptions
  that produce phantom mass failures.
- 🔴 **A `head -N` on the sweep killed the HTTP server.** The threading server's
  request logger raised `BrokenPipeError` once `head` closed stdout, taking every
  handler thread with it: **379/380 pages returned `ERR_EMPTY_RESPONSE` and the
  run still wrote a JSON file.** The resulting before/after comparison looked
  plausible and was entirely false. Always override `log_message`, never pipe a
  sweep through `head`, and **assert `rendered == len(pages)` before reading any
  comparison.**
- 🔴 **`min-height:24px` computes to 23.9999.** A strict `min(w,h) >= 24` test
  flags floored elements, and membership flips between runs on sub-pixel
  rounding — 2 pages in, 2 pages out, net zero, pure noise. Compare on the
  rounded value. Real failures are 16–19px and nowhere near the boundary.
- A file named `inspect.py` shadows stdlib `inspect` and breaks the Playwright
  import with a confusing circular-import trace.

---

## Axis status

**Tablet-band tap-target floor: CLOSED** at 755/755 for the `ul > li > a` class
(4,229 → 3), at 769 / 834 / 1280, with 390 / 320 re-verified unchanged.
Remaining: the 34-page `.cl-footer` standalone-CTA class, newly characterized
above, which is **not** the tablet-band defect and needs an editorial call.
