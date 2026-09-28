# Mobile Consistency Check — 2026-08-31

**Method:** headless Chromium render at 375px (and 320px for the fix verification), site served over HTTP from a fresh clone of `live` at `ccf6776`. Sample built on the 4-part equivalence key (stylesheet set + header hash + footer hash + inline `<style>` hash) → **68 classes / 72 representative pages** out of 753 HTML files; 23 meta-refresh stubs excluded. Header variants **7**, footer variants **2** — tripwire matches expected.

Overflow probe **canary-gated** before every batch (injected an over-wide div; probe reported `excess: 300` each run), so a clean overflow result is a real result and not instrument failure.

## Clean — no action

| Check | Result |
|---|---|
| Viewport meta | 72/72 identical, `width=device-width, initial-scale=1.0` |
| Horizontal overflow | 0 pages at 375px (and 0 at 320px) |
| Image scaling | 0 images exceeding the viewport |
| Text floor (11px) | 0 violations outside the by-design set |
| Input font size (iOS focus zoom) | 0 inputs under 16px |
| Header / footer tap targets | 0 failures — prior passes hold |
| Hamburger | present and visible on 72/72 |
| Drawer geometry | opens `flex` on 72/72 at `x=20 / right=355` — **matches the footer rail exactly** on every one of the 7 header variants |

The drawer/rail coupling from the 2026-08-30 gutter change is holding; the hardcoded-inset regression has not recurred.

## Fixed — WCAG 2.5.8 AA target size

Standalone list-navigation links rendered **15–17px tall**, below the 24×24 AA floor. A bare `<li><a>…</a></li>` anchor is inline, so its box is just the line box — and with the mobile root at 14px it lands well under 24. **There is no height rule to grep for; the defect is the absence of one**, which is why static audits never surfaced it.

| Component | Height | Pages |
|---|---|---|
| `.sidebar-toc ul li a` (in-guide TOC) | 15px | 66 |
| `.screen-only ul li a` ("Related Reading") | 17px | 19 |
| `.state-grid li a` (directory state index) | 16px | 5 |
| `.link-grid` / `.link-list li a` | 16px | town cross-links |

Fix: `display:inline-flex; align-items:center; min-height:24px` at ≤768px in `m-app.css`. Anchors are 40–238px wide, all far over the 24px minimum, so no `min-width` is needed and no horizontal overflow can be introduced.

**Verified:** 25 pages × 375px and 320px pre-deploy → 156 matched links, 0 residual, 0 overflow. Live re-render of the 8 affected pages → 93 links, 0 residual.

### Deliberately not changed

- `.related-articles ul li a` sits at exactly 24px — already clears AA. House target is AA, not AAA (breadcrumbs were set to 36px, not 44px, for the same reason).
- `a.internal-link` doubles as an **inline citation** class (Red Cross, BLS inside sentences), so it can't be targeted by class.
- `.cl-footer p a` and `.tldr-box a` are inline citations inside prose — WCAG exempts inline targets.
- `.mobile-bottom-nav` / `.mobile-cat-item` 10px labels — deliberate; 11px reflows the strip.
- Checkbox/radio controls — already handled by the existing 24px rule.

## Cache-bust incident

The `?v=20260831b` token was requested to verify it **before GitHub Pages finished rebuilding**, so Cloudflare cached the pre-fix `main.js` and `m-app.css` against the brand-new key — the bump was defeated by the act of verifying it. Origin was proven correct with a cache-bypassing request, then re-bumped to `20260831c`, a token never fetched. Both links of the chain moved together: `main.js?v=` in 736 pages **and** the `m-app.css` href inside `main.js`. Live pages now load `m-app.css?v=20260831c`.

Correct order, for next time: poll the **page** until its HTML shows the new token, and only then request the asset.

## Commits

- `001318d` — WCAG 2.5.8 AA: lift standalone list-nav links to 24px min-height
- `847ed06` — re-bump cache-bust `b` → `c` after the poisoned key
