# CSS Regression Report — 2026-08-26

**Method:** fresh clone of `live` (`beaa34e`), headless Chromium render sweep,
**33 representative templates × 3 viewports** (1280 / 390 / 320), served over HTTP.
Computed styles — not greps — for header, nav, logo, nav links, footer, footer links,
plus tap targets, sub-11px text, overflow, and rogue inline CSS.

**Result: 1 real regression found and fixed. Everything else clean.**

---

## Fixed

### `printable-poster.css` gave the shared site footer a 40px gap

`printable-poster.css:504` set `margin: 40px -16px 0` on the shared `<footer>`.
Every one of the other 32 sampled templates — including `printable-checklist.css`,
which styles the other **84 printables** — renders the footer flush at `margin-top: 0`.

Un-mirrored standalone-stylesheet drift: the two printable sheets are supposed to be
kept in parity, and this rule was only ever added to one of them.

**Fix:** `margin: 40px -16px 0` → `margin: 0 -16px`.
The negative side margins are deliberately kept — they cancel the poster's body padding
so the footer stays full-bleed. Verified the last section already supplies its own 40px
of bottom padding, so content is not cramped against the footer.

| | before | after | control (`babysitter-…-printable`) |
|---|---|---|---|
| footer `margin-top` | 40px | **0px** | 0px |
| footer rect (desktop) | 0, 1280×276 | 0, 1280×276 | 0, 1280×276 |
| gap above footer text | 80px | **40px** | 26px |
| horizontal overflow | 0 | 0 | 0 |

**Regression check:** full 33×3 re-sweep after the fix produced **12 deltas, all on this
one page, all intended** (margin 40→0, the resulting 40px y-shift, and the cache-bust
token). **Zero unintended deltas on the other 32 templates.**

Commit `2d86a32`. Cache-bust bumped `20260825e` → `20260826a` → `20260826b` (see caveat below).

---

## Checked and clean

| Check | Result |
|---|---|
| Stylesheets failing to load | 0 across all 33 × 3 |
| Root font-size scaling (16→15→14px) | uniform on all 33 |
| Body font family | uniform (`Inter, system-ui, …`) |
| Logo type/colour | **identical on all 33** |
| Nav-link type/colour/padding | **identical on all 33** |
| Footer-link type/colour | **identical on all 33** |
| Header paint (bg, border, shadow, sticky, z-index) | uniform |
| Footer paint (bg, colour, padding) | uniform |
| Footer rendered size | uniform per viewport (1280×276 / 390×280 / 320×301) |
| Horizontal overflow | **0 on every page at every viewport** |
| Header/footer text under 11px | **none** |
| Tap targets (nav + footer) | **44px minimum everywhere** — no regression of the 8/18 fix |
| Hamburger present & visible on mobile | 33/33 |
| Rogue inline `style=` in chrome | none beyond the known 28px logo `<img>` |

### Markup tripwire (all 743 pages, not just the sample)

Normalised + hashed every page's `<header>` and `<footer>` block:

- **header: 7 variants** (517 / 84 / 65 / 61 / 1 / 1 / 1) — matches baseline
- **footer: 2 variants** (645 / 85) — matches baseline
- **hamburger: 730 / 730** pages carrying chrome

Counts moved only by the +2 new pages added since the last baseline. No markup drift.

---

## Confirmed NOT bugs — do not "fix" these next run

**Body-colour leak into shared chrome (`special-needs.css` `#13304a`, `printable-poster.css`
`#1b2a4a`).** Both set a bare `html, body { color }`, which the `<header>` and `<footer>`
elements do inherit — so a naive computed-style diff flags them as outliers.

Walked **every visible text element** in the header and footer on both pages against two
control pages, at desktop and mobile. Every single one carries its own colour rule and
computed **byte-identical** across all four pages. The inherited colour paints nothing.
Invisible difference — same class as the known zero-width border-colour false positive.
The tinted body background on those pages is intentional page theming.

**Printables' nav lacking the `.container` wrapper.** `nav` reports `max-width: 1160px`
+ side padding instead of the majority's `max-width: none`, and a different bounding rect.
The rendered content box is identical (desktop 84→1196 both ways; mobile 16→374 both ways).
This is the documented compensation for the 148 pages that omit
`<header><div class="container">`. Working as designed.

---

## Open — deployment blocked by a GitHub outage

Both commits are safely on `origin/live`:

- `2d86a32` — the footer fix
- `8cd6e16` — cache-token re-bump

**GitHub Pages has not built either one.** Build status is frozen in `building` with
`duration: 0` and `updated_at == created_at`. githubstatus.com reports a
**Partial System Outage** with a critical Actions incident open. Normal builds for this
repo take 24–47 seconds; this has been stalled ~25 minutes. A manual rebuild `POST` was
accepted but also stalled.

This is the known "wait it out" failure mode — nothing to fix locally. The site continues
to serve the last good build (`beaa34e`), so **there is no visible breakage**; the fix is
simply not live yet. It should deploy on its own once the incident clears.

**Caveat worth flagging:** the `?v=20260826a` URL was fetched while the build was still
running, so Cloudflare cached the *pre-fix* CSS at that URL (`cf-cache-status: HIT`,
`max-age=14400` → stale for ~4h). That is why the token was re-bumped to `20260826b`,
which has deliberately **not** been fetched. When the outage clears, verify with:

```
curl -sL "https://waterwisekids.com/assets/css/printable-poster.css?v=20260826b" | grep -c 'margin: 40px -16px 0'
```

`0` means the fix is live. If it returns `1`, the build still hasn't landed — bump to
`20260826c` rather than re-fetching `b`.
