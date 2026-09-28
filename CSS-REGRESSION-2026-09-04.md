# CSS Regression Sweep — 2026-09-04

Base: `origin/live` @ `8743ef80` → shipped `d37e2894`. Audited a fresh `/tmp` clone, not the mount
(the mount's local `live` was still at `2476831c`, 2026-08-20).

Method: real headless Chromium (arm64 `headless_shell` 151), served over HTTP with a threading
server, computed styles + `getBoundingClientRect` at **1280 / 1024 / 390 / 320px**. 24 template
representatives (one per stylesheet-fingerprint × header-hash × footer-hash × `.article-body` group,
plus a second sample from each group over 40 pages), then a second pass over 14 pages chosen to cover
every *form* family, which the fingerprint grouping had missed.

## Shipped

**Sidebar escaping the `.main-layout` grid — 2 article pages.**
`<aside class="sidebar">` rendered full-width instead of in the 320px rail:

| page | before | after |
|---|---|---|
| `education/water-rescue-skills-for-kids.html` | `.sidebar` 1112px, parent `div.container`, `.main-layout` 1064px | `.sidebar` 320px, parent `.main-layout` 1112px |
| `education/adaptive-swimming-special-needs.html` | `.sidebar` 894px wide, parent **`<body>`** (no page gutter) | `.sidebar` 320px, parent `.main-layout` |

Cause on both: a pair of premature `</div>` closing `.main-layout` and `.container` *before* the FAQ
block and the aside, so the parser hoisted the aside out of the grid and stranded the `#faq` section
outside `<main>`. `.main-layout` had only one child (`MAIN`) on both; peers have `[MAIN, ASIDE]`.

On `water-rescue-skills-for-kids.html` there was a second, hidden cost: a redundant nested
`.container` inside a `.container` — a double gutter worth 48px (`.main-layout` 1064px vs the peer's
1112px). Replaced the outer one with a bare `flex: 1` sticky-footer child.

Verified after the fix at all four widths: `.main-layout` children `[MAIN, ASIDE]`, sidebar 320px at
1280/1024 and stacked at 390/320, `#faq` inside `main.article`, **0** horizontal overflow, `<div>`
tags balanced (51/51 and 24/24), and rendered text byte-identical to `origin/live`. Control page
unchanged. Structural scan of all **422** pages carrying `.sidebar`: 420 were already correct, these
were the only 2, and the count is now 0.

## Checked and clean

- **Chrome variant tripwire: 6 header hashes / 2 footer hashes** across 761 files (23 meta-refresh
  stubs excluded) — matches the recorded baseline, no structural drift.
- Header, footer, logo, nav-link and footer-link computed-style signatures: **single bucket** at 1280
  and 1024 across all 24 representatives.
- Root font-size 16px desktop / 14px mobile everywhere; body font-family `Inter` on all 24.
- Zero horizontal overflow at 1280 / 1024 / 390 / 320 on every page probed.
- Zero sub-44px tap targets in header or footer at 390/320.
- Zero header/footer text under 11px.
- No rogue inline `style` overriding shared chrome — the 3 inline-styled elements in header/footer
  (2 on printables) are identical on all 24 pages, i.e. template, not drift.
- No text input under 16px at mobile (iOS focus-zoom rule holding).

## Confirmed NOT bugs — do not "fix" next run

- `header` `border-bottom-color` differs on `special-needs-swimming.html` (rgb 19,48,74) and
  `education/pool-safety-rules-printable.html` (rgb 27,42,74) vs the majority (rgb 31,41,55).
  Invisible: `border-width` is `0px` and `border-style` is `none`. Same call as 2026-08-18.
- `.newsletter-form button` at 11.34px on mobile is m-app.css's deliberate
  `font-size: max(11px, 0.81rem)` floor, not drift.
- `.state-grid` renders at 11.2px/gray on the homepage vs 11.9px/blue on the directory hub. Four
  documented markup variants (`a`, `li > a`, `a.state-link`, `a.state-chip`), each styled by its own
  page-level `<style>`. Both clear the 11px floor and both are 44px tall. Page-level design, not a
  regression.
- `.cat-btn` filter chips at 12.48px / 29px on `/education/` and `/swimmers-hub/` — a chip
  component, internally consistent.
- Checkbox/radio inputs at 24×24 on `swim-schools/add.html` and `jobs/post.html` — exactly the
  WCAG 2.5.8 AA floor, which m-app.css names as the house standard.

## Backlog (not shipped — design standard, not regression)

The inline-styled sidebar newsletter submit (`.sidebar-box form button`, ~340 pages) is **36px tall
at 14.4px on desktop**, the only CTA on the site under 42px there; m-app.css floors it to 44px at
mobile but nothing floors it above 768px. Every other submit is 42–50px / 15.2–16px. Fixing means
touching an inline `style` attribute on ~340 pages, so it wants a decision rather than a daily pass.

## Probe note

Chromium's renderer crashes ~50% of the time on this sandbox when a page's stylesheet chain includes
the remote Google Fonts CSS — blocking `fonts.googleapis.com` / `fonts.gstatic.com` at the route
level takes the failure rate to 0/96 page loads. Computed `font-family` is unaffected (the family
list is CSS, not the font file), so style bucketing is sound; text-derived *widths* fall back to
system metrics, so width-only anomalies were not treated as findings. Also: raise `ulimit -n` to
65536 first, and the probe file descriptor default of 1024 produces `ERR_INSUFFICIENT_RESOURCES`.
