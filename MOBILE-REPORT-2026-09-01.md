# Mobile Consistency Check — 2026-09-01

**Result: clean. No defects found, no code change, no deploy.**

**Method:** headless Chromium render of a fresh clone reset to `origin/live` at `1e9da2ff`, served over HTTP from a `ThreadingTCPServer` in-process. Sample built on the 4-part equivalence key (stylesheet set + normalized header hash + footer hash + inline `<style>` hash) → **69 classes / 71 representative pages** out of 755 HTML files; 23 meta-refresh stubs excluded.

The overflow probe was **canary-gated before every one of the 9 batches** — an over-wide div was injected and the probe reported `excess: 300` each time. Comparison is against the *intended device width*, never `window.innerWidth`, so the emulation-expands-innerWidth blindness could not recur.

## Coverage

| Width | Pages | Purpose |
|---|---|---|
| 375 × 812 | 71 | primary phone sweep, full sample |
| 320 / 390 / 414 | 24 each | narrow + common phone widths |
| 768 | 24 | mobile/tablet boundary |
| 900 / 1024 | 24 each | tablet band (m-app.css does not apply above 768) |
| 812 × 375 | 24 | landscape phone |

Plus a **state pass** at 375px on all 71 pages with the drawer clicked open.

## Clean — no action

| Check | Result |
|---|---|
| Viewport meta | 71/71 identical, `width=device-width, initial-scale=1.0` |
| Horizontal overflow | **0** at 320, 375, 390, 414, 768, 812, 900, 1024 |
| Images exceeding viewport | 0 |
| Text floor | 0 violations outside the by-design and printable-scoped sets |
| Input font size (iOS focus zoom) | 0 inputs under 16px |
| Tap targets ≥ 24×24 (WCAG 2.5.8 AA) | 0 real failures |
| Hamburger | present, visible, **44×44** on 71/71 |
| Drawer opens | `display:flex` on 71/71 |
| Drawer geometry vs footer rail | **exact match at every width** — 20/300 at 320px, 20/355 at 375, 20/370 at 390, 20/394 at 414, 20/748 at 768 |
| Drawer links (state pass) | 568 links measured, **all 49px tall / 15px font** — 0 under target |
| Bottom nav | 5 items, gap spread **0px** at 320/375/390/414 and 1px at 768; item height 47–48px |
| Fixed-bar occlusion | `body` carries 68px bottom padding against a 60–61px bottom nav — 7–8px clearance, no content trapped |
| Root font size | 14px ≤480, 15px at 768, 16px above — matches the documented cascade |
| Cache-bust chain | intact end-to-end (below) |

The 2026-08-31 WCAG 2.5.8 list-nav fix and the 2026-08-30 gutter/rail coupling both still hold. The hardcoded-inset regression has not recurred.

## Two findings that were *not* defects

**1. `.tldr-box` anchor, 199×17px** — flagged on `/education/pool-safety-rules-printable.html` at 320, 375, 390 and 768. This is an **inline citation mid-sentence** (`<a href="/statistics/">Drowning is the leading cause</a> of unintentional death…`), which WCAG 2.5.8 explicitly exempts. My probe's inline-exemption only checked `P`/`LI`/`SPAN` parents, and here the prose sits directly in the `DIV`. **Probe bug, not a site bug** — logged to memory so the next run's exemption keys on text ratio rather than parent tag.

**2. Prose at 12–13.3px on phones** — 140 sub-14px paragraph instances across 40 pages. Traced to source: the majority are **printable-scoped** (`.checklist-page`, `.cl-*`, `.poster`), which sitewide sweeps skip by design. The rest — `.hero-sub`, `.article-card-excerpt`, `.newsletter-section p`, `.hero p` — are all sitting at **exactly 12px because that is the deliberate floor** installed on 2026-08-27 (`font-size: max(12px, <own rem>)` in m-app.css), with the reasoning documented inline in the stylesheet. Working as designed; not touched.

## Cache-bust chain — verified intact

The mobile stylesheet is JS-injected, so the chain has two links and a break at the outer asset makes every mobile fix inert:

- `assets/js/main.js` last changed **2026-09-01**, referenced as `main.js?v=20260901a` — key is *not* older than the file.
- `m-app.css` last changed **2026-09-01**, requested as `m-app.css?v=20260901a` from inside main.js — matches.
- **738/738** pages carry `main.js?v=20260901a`. Zero pages reference main.js without a `?v=`, and zero carry a stale key — so no page missed the bump.
- The 17 HTML files that never reference main.js are **all meta-refresh stubs**; no real page is missing the mobile bootstrap.

## Tripwire: header variants 7 → 6

The markup-variant tripwire moved. Traced to commit `40e4fe87` *"[fix] Mobile breadcrumb + printable body bands: align 410+90 pages to the 20px mobile rail"* — a sibling job's mobile-rail alignment collapsed two header variants into one. **Legitimate consolidation, not a regression**, and the render confirms it: all 6 surviving variants land the drawer on the 20px rail. Footer variants unchanged at 2.

Current distribution: `9cd0f86c` n=507 · `0674e965` n=90 · `18c942ff` n=71 · `283d3678` n=62 · `72378466` n=1 (404) · `01d2dc59` n=1 (pool-safety printable).

**Expected count for the next run is 6, not 7.**

## Limitation

Live-URL verification was blocked this run — `web_fetch` refused `waterwisekids.com` on a URL-provenance restriction, and the fetch rules forbid routing around it with curl. Mitigated by auditing a clone hard-reset to `origin/live`, which is the exact tree GitHub Pages builds from, so the measured tree and the deployed tree are the same commit.

## Commits

None. Nothing required changing.
