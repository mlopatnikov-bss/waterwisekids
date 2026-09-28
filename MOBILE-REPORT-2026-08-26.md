# Mobile Consistency Check — 2026-08-26

**Result: clean. No defects found, nothing pushed.**

Audited the `live` branch at commit `7327291` via a fresh clone (not the mount,
which is several days stale). Headless Chromium, real HTTP server, mobile
emulation with touch + iPhone UA.

## Coverage

| Sweep | Pages | Widths | Renders |
|---|---|---|---|
| Full-site overflow | **743 (all)** | 320 | 743 |
| Template representatives | 16 | 320/360/375/414/480/768 | 96 |
| Riskiest inline `<style>` pages | 21 | 320/360/414/768 | 84 |
| Hamburger state-transition | 16 | 320/375/768 | 48 |

971 renders, **0 errors**, canary green on every sweep.

## Findings

| Check | Result |
|---|---|
| Horizontal overflow | **0 / 743 pages** at 320px |
| Images wider than viewport | **0** |
| Viewport meta | uniform sitewide, `width=device-width, initial-scale=1.0` — no `user-scalable=no`, no `maximum-scale` |
| Form controls < 16px (iOS focus-zoom) | **0** |
| Text rendering < 11px | only the intentional 10px bottom-nav / category labels |
| Tap targets | no WCAG 2.2 AA (24×24) failures |
| Hamburger menu | 48/48 pass — verified by state change, not presence |

### Hamburger — verified properly

Rather than checking "is a nav visible", each run captured geometry before and
after a real click:

- toggle measures exactly **44×44** on every page and width
- `aria-expanded` transitions `false` → `true`
- `ul.nav-links` goes `display: none` → `flex`, sized to the viewport with a
  16px gutter, never off-screen
- a second click closes it and restores the original state

## Two standing false positives — deliberately not "fixed"

1. **Breadcrumb "Home" is 36×44.** Width is under Apple's 44px guideline but
   above the WCAG 2.2 AA minimum of 24×24, so it passes. A previous read
   mis-attributed this 36px to the bottom nav — it is the breadcrumb.
2. **Bottom nav is fine.** Items measure 64px @320, 75px @375, 153.6px @768,
   all 48px tall. The 10px labels are a documented intentional exception.

Also confirmed correct rather than broken: `min-width: 460px` tables sit inside
`overflow-x: auto` scroll wrappers, and the `repeat(7, 1fr)` calendar grid is
fractional so it shrinks to fit 320px.

## One real problem found — in the audit tooling, not the site

The first sweep reported "0 overflow across 96 renders". That was **instrument
failure, not a clean site**. Under Playwright's `is_mobile=True`, Chrome
reflows the layout viewport to fit overflowing content, so `window.innerWidth`
grows in lockstep with `scrollWidth` and the standard check

```js
document.documentElement.scrollWidth > window.innerWidth
```

can never fire. Injecting a deliberately 300px-too-wide element moved
`innerWidth` from 768 → 1068 and the probe still reported no overflow.

Only the canary caught it. The probe now takes the intended device width as a
parameter and treats an expanded layout viewport as an overflow signal in its
own right. Every result above was re-measured with the corrected probe.

Worth noting: `body` carries `overflow: hidden auto` sitewide, so
`body.scrollWidth` also pins to the viewport — `documentElement.scrollWidth` is
the one that moves.

## Recommendation

Mobile is exhausted as a daily lever, the same way internal linking was. These
exact checks will keep returning clean. Future runs should either move to an
untested axis — landscape orientation, user font-scaling, `prefers-reduced-motion`
— or yield the slot to a higher-value audit.

Separately: the memory index (`MEMORY.md`) is at 20.7KB against a 24.4KB read
limit and should be consolidated soon.
