# CSS Regression Report — 2026-09-09

**Verdict: CLEAN. 749 / 749 pages pass every axis. Nothing fixed, nothing pushed.**

Source: fresh clone of `origin/live` @ `23f3656b5`. 772 HTML files − 23 redirect
stubs = **749 live pages**, rendered in headless Chromium 151 at **1280 / 900 /
390 / 320 px**. Zero render errors.

---

## 1. Chrome markup tripwire

Normalized header/footer markup hashes (comments stripped, `?v=` cachebust
stripped, `.active` class stripped):

| region | variants | sizes |
|---|---|---|
| `<header>` | **5** | 508 / 98 / 79 / 63 / 1 |
| `<footer>` | **2** | 650 / 99 |

Matches the 2026-09-08 baseline exactly. The footer split is
article-family (650) vs printable-family (99). No structural drift.

## 2. Computed nav / footer styles

Every region bucketed into a single style signature per stylesheet family, at
every viewport:

| axis | 1280 | 900 | 390 | 320 |
|---|---|---|---|---|
| `<header>` box (bg, border, shadow, padding, position) | ✅ | ✅ | ✅ | ✅ |
| `<footer>` box | ✅ | ✅ | ✅ | ✅ |
| `<body>` / `<html>` font + colour | ✅ | ✅ | ✅ | ✅ |
| nav-link signature (colour, family, size, weight, decoration, tracking) | ✅ | ✅ | ✅ | ✅ |
| footer-link signature | ✅ | ✅ | ✅ | ✅ |
| logo signature | ✅ | ✅ | ✅ | ✅ |

Fonts: `Inter, system-ui, -apple-system, sans-serif` on **749 / 749**. Root
font-size scaling 16 → 14px reaches the printable sheets correctly.

## 3. Geometry and accessibility floors

| check | result |
|---|---|
| horizontal overflow (`scrollWidth − clientWidth > 1`) | **0 / 749** at all four widths |
| nav tap targets under AA 24px | **0 / 749** |
| footer tap targets under AA 24px | **0 / 749** |
| header/footer text under 11px | **0 / 749** |
| footer rail | 84px @1280, 24px @900, **20px on all 749 @390** |

## 4. Rogue inline CSS overriding main.css

Checked at runtime by walking every matched CSS rule for every element inside
`<header>` and `<footer>` and recording its origin stylesheet.

- **4 pages** have a page-level `<style>` rule that matches shared chrome.
- All four are `display:none !important` inside **`@media print`** — the
  intended "hide chrome when printing" rule. Verified by reading the enclosing
  at-rule on each file.
- **0 pages** override shared chrome in a screen context.

## 5. Interaction states

Real hover with transitions killed (`transitionDuration == 0s` canary), across
16 template representatives — one per stylesheet group plus the two singletons:

- Logo hover: `#075985 → #0369a1` on **16 / 16**, printables included.
- Footer-link hover: `#bae6fd → #ffffff` on **16 / 16**.
- Mobile drawer (hamburger clicked at 390px): identical on **16 / 16** —
  x=20, width=350, white background, 8 links, minimum link height 49px.

## 6. Undefined CSS custom properties

Re-ran the axis that paid on 2026-09-08 (dead `var()` references silently drop
the whole declaration). After stripping CSS comments and gating with a two-sided
canary: **0 / 749** pages reference an undefined, fallback-less custom property.

> The first pass reported 98 pages — a false positive worth recording.
> `printable-checklist.css:57` carries a comment from an earlier run that
> *quotes* `var(--blue-700)` while the live rule below it correctly uses the
> locally-defined `--cl-blue-700`. This codebase documents its own fixes in CSS
> comments that contain CSS, so static probes here must strip comments first.

---

## Noted, deliberately not changed

`assets/css/article.css:488` sets `.footer-links { flex-direction: column }`
inside `@media (max-width: 768px)`, but `m-app.css:921` sets
`footer .footer-links { display: none !important }` in the same band. Measured
`display: none` on every mobile representative — the rule renders nothing. It is
dead code, not a visual defect. Editing a stylesheet loaded by 427 pages to
remove a no-op is a worse trade than leaving it.

## Two single-page style buckets — by design, not drift

`special-needs-swimming.html` (`special-needs.css`) and
`education/pool-safety-rules-printable.html` (`printable-poster.css`) each set
their own neutral ramp on a bare `html, body` rule. Each stylesheet is loaded by
exactly one page, and neither reaches the shared chrome — nav, logo and footer
signatures bucket 650/650 and 99/99 respectively. These are one-file template
families, and singleton buckets are expected.

## Context

`git diff --stat @{3 days ago} -- assets/css assets/js` is **empty**. No
stylesheet or script changed this week; the recent commits were content, schema
and directory data. That bounds how much CSS regression was possible, and the
sweep confirms none occurred.
