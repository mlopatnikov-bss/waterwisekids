# CSS Regression Report — 2026-09-03

**Base:** `origin/live` @ `7b999be67` → shipped `5b39c514e`
**Method:** headless Chromium 151 render sweep (computed styles), not grep.
**Coverage:** 40 pages × 4 viewports (1280 / 900 / 390 / 320) = 160 probes, 0 errors.

---

## Headline: the renderer is back

The 2026-09-02 memo recorded the Playwright browser CDN as blocked by the egress
proxy, which had made every visual/CSS sweep impossible. **That is no longer true,
and the earlier diagnosis was slightly off.**

| URL | result |
|---|---|
| `.../chromium/1234/chromium-headless-shell-linux.zip` (x86_64 name) | **HTTP 400**, 24-byte `GatewayExceptionResponse` |
| `.../chromium/1234/chromium-headless-shell-linux-arm64.zip` | **HTTP 206 — downloads fine** |

The proxy was refusing the *x86_64* artifact; the **arm64** artifact — the one this
aarch64 sandbox actually needs — is reachable. The previous run only ever probed the
x86_64 filename, concluded the host was blocked, and fell back to static/jsdom checks.

Working recipe (~4 min, survives the ~178s bash cap if you checkpoint per viewport):

```bash
curl -sL -o shell.zip \
  https://cdn.playwright.dev/dbazure/download/playwright/builds/chromium/1234/chromium-headless-shell-linux-arm64.zip
unzip -q shell.zip -d shell            # -> shell/chrome-linux/headless_shell
apt-get download libxdamage1 && dpkg-deb -x libxdamage1*.deb root
export LD_LIBRARY_PATH=$PWD/root/usr/lib/aarch64-linux-gnu
npm i playwright-core@1.62             # launch with executablePath=<headless_shell>
```

Everything render-dependent — CSS regressions, mobile breakpoints, contrast, tap
targets, JS-injected `m-app.css`, widget behaviour — is measurable again.

---

## Shipped

**`5b39c514e` — 6 CTAs lifted to the 44px tap-target floor.**

The AAA tap-target backlog has sat open since 09-02, estimated at *"36 elements,
7 at ~40px and 29 at 41–45px"* and deliberately not shipped because it straddled the
threshold unmeasured and because the assumed fix (appending to the floor family in
`m-app.css`) forces a `main.js` cache-bust bump and a 740-file HTML diff.

Measured, the backlog is much smaller:

| rendered height @390 | count | verdict |
|---|---|---|
| 47.9px | 27 | already passes |
| 45.3px | 1 | already passes |
| **40.1px** | **6** | **short — fixed** |

All 6 are the same `Get the Printable →` link on 6 checklist landing pages, and all 6
are **inline-styled**. So the fix lands in the HTML — **no `m-app.css` change, no
cache-bust bump, no 740-file diff.** That was the entire reason for the deferral.

`display: inline-block` → `display: inline-flex; align-items: center; min-height: 44px`
(the existing floor-family pattern; no `justify-content`, so the arrow stays left-aligned).

Verification: all 34 CTAs now ≥44px at both 390 and 1280; chrome computed styles on the
6 edited pages **byte-identical to an untouched control page** at both viewports;
document overflow 0.

---

## Clean — with the probe that proved it

- **Markup tripwire holds: 6 header / 2 footer variants** across all 736 real pages
  (23 meta-refresh stubs excluded), normalized with intertag-whitespace collapsing.
  0 pages missing a header or footer.
- **Chrome styling is perfectly uniform.** Across all 40 pages × 4 viewports, every
  chrome region resolved to a **single bucket** for font-family, font-size, weight and
  colour:
  - `font-family: Inter, system-ui, -apple-system, sans-serif` — 1 value, all 7 regions
  - navLink / logo: `17.6px/700/#075985` @1280, `13.3px/800/#0369a1` @390 — ×40 each
  - footerLink: `14.4px/400/#bae6fd` @1280, `11.9px/400/#0369a1` @390 — ×40 each
- **Zero horizontal overflow** on every page at every viewport, including the 769–1149
  tablet band that previously broke the printables.
- **State pass clean.** Hover and focus resolved to a single bucket on all 40 pages:
  nav `#075985 → #0369a1`, footer `#bae6fd → #fff`, first Tab lands on the logo with a
  visible ring. Transitions were killed before bucketing so jitter couldn't fake drift.
- **No rogue inline CSS overriding shared chrome.** 154 pages carry inline `<style>`;
  every rule touching `header` / `footer` / `body` sits inside `@media print`.
- **Printable sheets mirror `main.css` correctly.** Root font-size scaling verified *by
  render* (16px @1280 → 14px @390, uniform ×40 including printables), plus the
  769–1149 tablet-band chrome block and the 44px/16px floors present in both standalone
  sheets. The wrap thresholds stay intentionally split (952 main / 936 printables).
- **All 13 cache-bust keys current** (clone `--unshallow`ed first, since a shallow clone
  fakes stale keys). No key predates its file's last change. The `main.js` → `m-app.css`
  chain is consistent at `20260901a` on both ends — no inert bump.
- **`m-app.js` boots everywhere:** `.mobile-bottom-nav` present in the live DOM of all
  40 pages at 390/320 and absent at 900/1280; hamburger visible exactly at ≤768.
- **No text below the 11px floor**, except the `.mobile-bottom-nav` labels at 10px,
  which are deliberate.

---

## Confirmed NOT bugs — do not "fix" these next run

- **Nav box geometry splits into buckets at every viewport** (e.g. `left:0 / padding:0 20px`
  vs `left:20 / padding:0`). This is the box-vs-leaf trap. Measured at the **leaf**, the
  first header link sits at **x=20 on all 40 pages @390 and x=84 on all 40 @1280**, with
  the last nav link's right edge exactly 84px from the viewport edge — symmetric.
- **`main.left` vs footer rail left "differs" on 38/40 pages.** Same trap: `main` is
  full-width with padding while the footer rail is an inset box. Leaf-measured, the
  standard template gutter is 20px @390, matching the chrome rail.
- **`pool-safety-rules-printable` header/footer `margin: 0 -16px`** is deliberate and
  commented in `printable-poster.css` (standalone poster template). Causes no overflow.
- **Printable body backgrounds** (`#f9fafb`, `#f0f4f8`) — separate template family by design.

---

## Backlog — reported, not shipped (each needs a design call, not a regression fix)

1. **Breadcrumb size is inconsistent: 11px vs 12.6px.** Four class variants are live
   (`page-breadcrumb`/`breadcrumb-inner`, `wwk-breadcrumbs`, `breadcrumb`, and 25 sampled
   pages with an *unclassed* breadcrumb `div`). All render **at or above** the 11px floor
   — the 9.8px case in the older note did not reproduce — but `wwk-breadcrumbs` renders
   12.6px while everything else renders 11px. Recommend standardising **up** to 12.6px;
   I did not shrink the outliers, since that would reduce legibility.
2. **`special-needs.css` is the only page stylesheet with a bare `html, body` rule**,
   redeclaring `color: #13304a; background: #f4f8fb` against the sitewide `#1f2937` on
   white. The leak is **inert in the chrome** (every chrome element has an explicit
   colour, and all chrome buckets stayed uniform), but that one page's body copy and page
   background are off-palette. Contrast is fine. Left alone — reverting it is a visual
   design decision.
3. **`/swim-schools/` search inputs use `outline: none`** with only a 1px border-colour
   change (`#e5e7eb → #0f5f94`) as the focus indicator. Passes WCAG 2.4.7 (an indicator
   *is* present) but is weak; a `box-shadow` ring like the one used at `main.css:1158`
   would be stronger. One page.
4. **Desktop-only footer legal links are 15px tall** (`Privacy Policy` et al. in
   `.footer-bottom`). At mobile they are ≥44px. They are inline within a text line, which
   is the WCAG 2.5.8 inline exception, so this is likely conformant — flagging only
   because it is the one sub-24px pointer target left anywhere.
5. **The hamburger still has no `aria-controls`** on any page — carried over; worth
   bundling into a run that already touches every page.

---

## Probe integrity

Every finding above comes from a canary-gated probe. On a scratch copy I injected
`header nav a { color:#ff0000; font-family:Georgia }` on one page and an 8px
`footer p` on another, then re-ran the sweeps:

- font-family drift → flagged, 39 vs 1, at **both** 390 and 1280 ✅
- colour drift → flagged at **1280** ✅; **silently masked at 390** ❌

That second result is itself worth recording: at ≤768px, `m-app.css` is JS-injected
*after* page CSS and its `!important` chrome rules beat any page-level `!important`.
**Colour drift in the chrome is therefore undetectable at mobile and must be bucketed at
desktop.** The colour probe's sensitivity at 1280 is confirmed both by the canary and by
its independent detection of the real `special-needs` / poster colour differences.

Sub-11px text probe → flagged the injected 8px `footer p` ✅.
Canary tree deleted and the poisoned probe outputs discarded before the real run was
re-measured.

---

## Not checked

- **Visual/pixel diffing.** This sweep compares computed styles and geometry, not
  rendered pixels. Now that the browser is back, screenshot diffing is possible and is
  the obvious next capability to add.
- **Print rendering.** `@media print` rules were read statically, not rasterised.
- **The 320px band for the 24 non-sampled fingerprint cells** — every fingerprint ×
  header-variant × footer-variant cell *is* represented (15 cells, all covered), but
  within-cell per-page inline drift was sampled at 40 of 736 pages, not exhaustively.
