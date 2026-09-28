# Mobile Consistency Check — 2026-09-05

**Scope:** all 742 non-stub pages (23 meta-refresh stubs excluded), rendered in headless
Chromium at 375px, 320px and 768px. Verified against a fresh clone of `origin/live`
after deploy.

**Deployed:** `102a22106` → `live`

---

## Result

One real defect found and fixed. Everything else on the mobile surface is clean.

| Check | Result |
|---|---|
| Viewport meta | 742/742, one variant, `width=device-width, initial-scale=1.0` |
| Zoom blocking (`user-scalable=no` / `maximum-scale=1`) | 0 |
| Hamburger button present | 742/742 |
| Hamburger opens drawer (clicked, `aria-expanded` flips) | 18/18 reps across all 6 header variants |
| `aria-controls` wired at runtime | 742/742 (JS-injected by `m-app.js`) |
| Horizontal overflow @375 / @320 / @768 | 0 pages at every width |
| Images wider than viewport | 0 |
| Tap targets below WCAG 2.5.8 AA (24×24) | **3 → 0** (fixed this run) |
| Text below the 11px floor | 3,717 instances — all deliberate (see below) |
| `m-app.js` failed to boot | 0 |
| JS page errors | 0 |

---

## The defect: TOC links were floored on one axis only

`m-app.css` "Round 6" (2026-08-21) resolved three contradictory table-of-contents rules
down to `min-height: 44px`. It set the **height** axis and nothing else. Because the same
rule declares `display: flex`, each TOC link becomes a flex *item* of its `.toc-item`
parent, so its box shrink-wraps to the label text and the **width** stays text-bound.

Every TOC row on the site renders 62–146px wide purely because its label is long enough.
The one exception is the three-character `FAQ` entry:

```
23.0 × 44   /education/drowning-prevention-guide.html
23.0 × 44   /education/pool-party-safety.html
23.0 × 44   /education/water-safety-for-kids.html
```

1px under the WCAG 2.5.8 AA minimum, and the only interactive controls anywhere on the
site below it. This is latent on *any* short TOC label, not a property of those 3 pages.

This is the same omission shape as `.back-link`, which sat at 42.3 × 44 on 126 pages for
eight days before being fixed in `787bd4c`.

**Fix:** `min-width: 44px` + `justify-content: flex-start` on the Round-6 rule. The box
grows rightward inside a 285px column, so the label's left edge does not move and no
reflow is possible. Verified: the FAQ row now renders 44 × 44.

**Cache-bust chain bumped end to end** so the fix is not inert:

```
HTML     main.js?v=20260905a  →  20260905b   (748 files)
main.js  m-app.css?v=20260905a → 20260905b
```

---

## Not defects — do not re-report

- **3,717 instances of 10px text.** `.mobile-bottom-nav a` and `.mobile-cat-item` are
  pinned to 10px by an explicit rule in `m-app.css` ("Compact strips: 10px floor — 11px
  reflows the row"). 5 bottom-nav labels × 742 pages, plus 7 category chips on the
  homepage. Deliberate.
- **Hamburger has no `aria-controls` in the HTML** (0/742 statically). `m-app.js` injects
  it at runtime; measured 742/742 in the live DOM.
- **17 pages have no hamburger.** All 17 are meta-refresh redirect stubs with no `<nav>`.

---

## Latent, not shipped

13 rules in `m-app.css` declare `min-height: ≥40px` on an `inline-flex`/`inline-block`
element **without a matching `min-width`** — the same one-axis shape as the defect above.
None is currently under 24px, because every affected label happens to be wide enough
today; the render sweep confirms 0 live instances at 320, 375 and 768px.

They were deliberately **not** blanket-fixed: adding `min-width: 44px` to all 13 would
widen controls that are narrow by design. The correct trigger is a measured sub-24px
instance, as here. The rules to watch:

```
.visit-btn / .school-card buttons      .nav-logo
education-hub filter pills             footer .footer-bottom p a, footer .footer-contact a
.print-btn, .search-button, .search-group .btn
button, a[data-cta], .cta-link, .feature-link, .gear-link, .popular-links a
.source-list a, .sources a, .hero-actions .button
.wwk-breadcrumbs a, .breadcrumb a, .breadcrumbs a, .page-breadcrumb a
.jump-links a        .partnership-callout a        .contact-cta a, .jobs-grid a[href]
```

---

## Two probe traps hit this run

1. **A stale clone from another session.** `/tmp/wwk-clone` existed, was owned by
   `nobody`, dated 08:03, and sat at `a4f053b33` — four commits behind. `rm -rf` on it
   failed silently (not my file) and the first ~40 minutes of static checking ran against
   it. Caught by a `mkdir` permission error. Always clone to a session-unique path and
   assert `stat -c %U` before trusting a tree.

2. **A viewport regex re-derived from memory instead of copied.** The verification pass
   used `name="viewport"[^>]*content="` and reported **123 pages missing a viewport meta**.
   All 123 were false: those pages write the attributes in the other order
   (`<meta content="…" name="viewport"/>`). The original probe matched the whole `<meta>`
   tag first and read `content` out of it, which is order-independent. 619 pages use
   `name`-first and 123 use `content`-first; any viewport, og or twitter probe written the
   naive way will report those 123 as missing.

Both probes were canary-gated before use: a synthetic bad page fired every check
(overflow, sub-24 tap, sub-11px text, oversized image) and a synthetic good page fired
none, with all three inline-link exemptions correctly suppressed.

---

## ⚠️ Sandbox disk — needs attention

The shared session disk is **100% full (22 MB free of 9.8 GB)**. Only ~360 MB is visible
to `du`; the rest is held by deleted-but-still-open files from other sessions, which this
run cannot reclaim. `npm install` failed with `ENOSPC` until everything was redirected to
`/tmp` (a different, healthier filesystem with 3 GB free).

The skill's mandatory cleanup ran and removed everything this run created. It could **not**
remove ~115 MB of leftovers from earlier sessions (`/tmp/wwk-clone`, `/tmp/wwk-fix*.py`,
`/tmp/wwk-gsc`, `/tmp/p.html`) because those files are owned by a different user — `rm`
fails silently on them. The cleanup step cannot fix cross-session bloat on its own.

Nothing here affects the website. It does mean future scheduled runs may fail at the
dependency-install step until the sandbox is recycled.
