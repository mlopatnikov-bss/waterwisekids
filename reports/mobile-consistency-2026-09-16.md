# Mobile consistency check — 2026-09-16

**Commit swept:** `adb55b149` (origin/live)
**Baseline:** `fc5f87c` (the 2026-09-15 mobile closure)
**Verdict: CLEAN. Nothing pushed — no defect found.**

782 HTML files − 23 meta-refresh stubs = **759 live pages**.

---

## Headline: first rendered check in five days, and it was run against the live edge

Runs 09-15 (second), 09-16 (CSS regression A and B) and 09-16 (functionality) all reported
"no browser in the sandbox". That is still true — `chrome-headless-shell` dies on a missing
`libXdamage.so.1`, and this time `apt-get download` could not be rescued either: `apt-get
update` into a private lists dir fails GPG signature splitting, so no package could be
verified. Sideloading an unverified `.deb` remains off the table.

**Worked around it with the Chrome browser tool instead**, driving a same-origin
390×844 `<iframe>` harness over `https://www.waterwisekids.com`. Media queries evaluate
against the iframe viewport, so this measures real rendered geometry at mobile widths —
and because it hits production rather than a local clone, it *also* closes the
edge-freshness axis that has been unverifiable since 09-12.

Root font inside the harness reads **14px**, matching the documented mobile root.

---

## Delta

⭐ **The CSS/JS byte delta since the 09-15 mobile baseline `fc5f87c` is ZERO.**
34 HTML files changed (**2 added**, 32 modified); the rest of the delta is `sitemap.xml`,
`.gitignore` and one new card SVG. Scope therefore = **34 delta pages**, a **40-page random
control**, the two statically-parseable axes at **full corpus**, and the live-asset check.

Added pages (both swept, both clean):
`education/swim-lesson-financial-aid-tracker.html`,
`education/swim-lesson-financial-aid-tracker-printable.html`.

---

## Results

| Axis | Scope | Result |
|---|---|---|
| Viewport meta (parsed) | **759/759** | 1 variant `width=device-width, initial-scale=1.0`; 0 `user-scalable`, 0 `maximum-scale` |
| `.hamburger` present ×1 | **759/759** | exactly one per page, 0 exceptions |
| Hamburger **opens** (clicked) | 12 pages, all families | **12/12** — 44×44, `aria-expanded` false→true, panel count +1, **0 tap failures inside the open drawer** |
| Document overflow | 74 pages @390, 40 @320 | **0** |
| Element overflow (scrollers excluded) | 74 pages | **0** |
| Chrome/body text floor (11px) | 74 pages | **0** |
| Text-entry input ≥16px (iOS zoom) | 74 pages | **0** |
| Tap targets (house AA **24px**) | 74 pages | **0** |
| Image scale / distortion | 74 pages | **0** |
| Content rail | 74 pages @390 + 40 @320 | **20px**, 3 exceptions at 21 (below) |
| Live asset ↔ repo parity | 3 assets | **exact SHA-256 match** |

Control sample rail distribution: `{20: 40}`. Content-root distribution
`{main: 24, body: 12, article.article: 4}` — the widened root list from
[[rail_axis_was_unmeasured_on_298_pages]] is doing its job; **zero `null` buckets**.

---

## Edge freshness — closed, first time since 09-12

| Asset | cf-cache-status | age | last-modified | live sha256[:16] | repo sha256[:16] |
|---|---|---|---|---|---|
| `assets/css/main.css` | MISS | 0 | Wed 16 Sep 2026 20:17:06 GMT | `f32ba0a4ad0cff88` | `f32ba0a4ad0cff88` |
| `assets/css/m-app.css` | MISS | 0 | Wed 16 Sep 2026 20:17:06 GMT | `ff8953a25212393c` | `ff8953a25212393c` |
| `assets/js/main.js` | MISS | 512 | Wed 16 Sep 2026 20:17:06 GMT | `dbc7dd51580feb38` | `dbc7dd51580feb38` |

`/swim-lessons/directory/`, `/swim-lessons/directory/index.html`, `/education/index.html`
and `/` all return `age: 0`, `last-modified` today 20:17:06 GMT. **The edge is serving
exactly repo HEAD `adb55b149`.** No stale cache.

(Character counts differ from on-disk byte counts — `response.text()` returns decoded
UTF-16 — but the UTF-8 hashes are byte-identical, which is the authoritative signal.)

---

## Left for Michael — 1px, not shipped, and the count on record is wrong

⚠️ **The parked rem-drift rail is 3 pages, not 4.** Measured with the correct metric
(`box.x + paddingLeft`, not leftmost visible text):

| page | rail | footer rail |
|---|---|---|
| `privacy/index.html` | **21** | 20 |
| `terms/index.html` | **21** | 20 |
| `jobs/post.html` | **21** | 20 |
| `swim-schools.html` | **20** ✅ | 20 |

`swim-schools.html` was on the 09-15 list and reads **20** — it was on that list because
the 09-15 run measured leftmost text. Cause on the other three is unchanged: a page-local
`.content{padding:3rem 1.5rem}` against a 14px mobile root ⇒ `1.5rem` = 21px vs the
chrome's hard 20px rail. Fix is `1.5rem` → `20px` in three page-local stylesheets.
Deferred a third time — it is a 1px rem-vs-px typography call, consistent with the
standing deferral, not a new finding.

---

## Three probe artifacts triaged — all mine, do not re-report

The first pass reported three "defects". All three were bugs in the probe, caught by
digging before believing them. Recorded because two of the three are *new* shapes.

1. **`/scholarships/index.html` rail 33** — the ancestor chain is
   `MAIN padL=20px (x=0)` → `DIV.jump-links padL=0` → `A padL=12px`. Box is on the rail at
   20; the *text* sits at 32 because the jump-link chip has its own 12px padding.
   Classic [[rail_probe_needs_x_plus_padding_not_box_x]] — I had shipped the probe with a
   leftmost-visible-text metric. **Switched the rail verdict to `box.x + paddingLeft`**,
   with a descend-if-full-bleed fallback.
2. **`/teens/swim-instructor.html` tap 222×17** — `a.internal-link`, `display:inline`,
   14px, inside a `<p>` whose text is 44 chars against a 33-char link. My exemption
   threshold (`ancestor > link + 15`) missed it by two characters. A `display:inline`
   anchor's height *is* its line-height and cannot be set by CSS, so this can never be a
   real tap defect. **Exemption now keys on `display:inline` outright**; the
   ancestor-text test is retained only for `inline-block`. Same family as artifact 2 in
   [[mobile_tap_probe_exemption_and_artifacts]], one threshold further down.
3. **`/education/index.html` `button.cat-btn` at 10.92px** — read 10.92 on a 350ms settle
   and **11.00px on a 400ms settle**, with all 95 sibling buttons identical. `0.78rem ×
   14px` lands on the floor exactly; the 0.08px was rem rounding caught mid-injection of
   the JS-injected `m-app.css`. Floor moved to `< 10.95` and the settle to 400ms.

⭐ **The probe was re-canaried after every one of these edits** and the TP/TN pair still
separates cleanly: TP fires on all six axes (docOverflow +310, 9px text, 12px input,
16×16 block anchor, rail 0), TN fires on **none** — including its prose link in running
text, which is the canary that catches artifact 2.

---

## Not verified

- **Tablet band (769–1149px)** not swept — no CSS changed, per the standing convention.
- **The 685 non-delta pages** were not individually re-rendered. Covered by the zero
  CSS/JS delta, the 09-13 full-corpus closure, the 09-15 full-corpus navlist run, and the
  40-page control that came back 40/40 clean on every axis.
- Sandbox Playwright remains unusable; the harness above is the standing workaround until
  `libXdamage.so.1` can be obtained through a signature-verified channel.
