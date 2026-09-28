# Mobile Consistency Check — 2026-09-02

**Scope:** all 757 HTML files on `origin/live` @ `071bd30` (734 real pages + 23 meta-refresh stubs).
**Result: no defects shipped. Nothing was pushed — the site's mobile surface passed every check that could be verified today.**

---

## Capability note (read this first)

The headless-browser CDN is **still blocked by the egress proxy** (re-tested this run, 2026-09-02):

| host | result |
|---|---|
| `playwright.azureedge.net` (default) | download aborts, `code=1` |
| `registry.npmmirror.com/-/binary/playwright` (mirror) | download aborts |
| `storage.googleapis.com/chrome-for-testing-public` | **reachable (HTTP 206)** — but publishes `linux64` only; sandbox is `aarch64` |
| `apt-get install chromium` | no candidate; `chromium-browser` is the snap stub (v85) |

So **no visual/layout sweep was possible**. Everything below was verified either by
parsing, or by running each page's real JavaScript in **jsdom** (which executes scripts
but has no layout engine). Anything that requires measured pixel geometry is listed
under "Not verified" at the bottom — it is *not* claimed as passing.

Every sweep below was canary-gated (a deliberately broken copy of `/index.html` was fed
through the same probe and had to fail) so a silently-inert probe can't report "clean".

---

## Passed

### 1. Viewport meta — 757/757
One single variant sitewide: `width=device-width, initial-scale=1.0`.
Zero pages with `user-scalable=no`, zero with `maximum-scale` under 5. Pinch-zoom is
available everywhere.

### 2. Hamburger menu — 142 pages rendered in jsdom, 0 failures
Sample = all **6** header markup variants + 120 randomly drawn pages + 16 hand-picked
template exemplars. On every one:

- `.hamburger` present (a real `<button>`, `aria-label="Toggle menu"`, `aria-expanded="false"`)
- click → `nav.mobile-open` added, `aria-expanded` flips to `true`
- click again → class removed, `aria-expanded` back to `false`
- 8 nav links reachable in the open drawer
- zero console errors, zero uncaught exceptions

**Canary proof:** a copy with the class renamed reported `burger=false`; a copy with a
broken `main.js` src reported `opens=false, mappCss=false, bottomNav=false` + 1 error.

### 3. Mobile app layer boots — 142/142
`main.js` injects `m-app.css?v=20260901a` + `m-app.js?v=20260413` at `innerWidth <= 768`.
Confirmed executing, not merely present: `.mobile-bottom-nav` appears in **0** HTML files
but was found in the live DOM of every page tested, i.e. `m-app.js` ran to completion and
built the bottom nav and category strip.

### 4. Header/footer markup variants — no drift
6 header / 2 footer variants, matching the standing tripwire exactly. No new variant has
crept in, so no floor rule has been orphaned by a new markup shape.

### 5. Horizontal overflow
- **`minmax()` tracks:** 157 occurrences, **0** unwrapped mins ≥200px. (One regex hit at
  `m-app.css:1247` is prose inside the explanatory comment, not a declaration.)
- **Fixed widths:** 0 declarations of `width: >320px` in any HTML or CSS.
- **Tables:** all **55** tables sitewide are reached by a scroll-protection rule
  (`.cl-section > table`, `.article-body table`, `.article-content table`,
  `table.pricing-table`) — verified with real selector matching, not ancestor guessing.
  My first pass flagged 10 pages; that was a false positive from looking for a wrapper
  element instead of testing the selectors. No fix needed.
- **`nowrap`:** 6 inline instances on 5 pages — 1 short button label, 1 sr-only label,
  rest benign.
- **`<pre>` blocks:** none.

### 6. Images scale correctly
1,841 `<img>`, **0** missing dimensions once inline `style` is read alongside the
`width`/`height` attributes (the attribute-only check reports a fake 1,481). Global
`img { display:block; max-width:100%; height:auto }` is in `main.css`.
The 92 printable pages don't load `main.css` and have no bare `img` rule in their own
sheets — but they carry **only** the 28px inline-sized logo, so there is no gap.

### 7. Text readable without zooming
- All 66 distinct classes used on interactive elements have a rule in some stylesheet or
  inline `<style>` block. **Zero** orphan classes invisible to the design system.
- Inline `font-size` below the floor: `.75rem`/`0.75rem` (10.5px @14px root) and
  `0.78rem` are both covered by `[style*=]` selectors in `m-app.css`, in **both**
  spellings (leading-dot and leading-zero).
- `0.82rem` (11.48px) and `0.8rem` (11.20px) clear the 11px non-prose floor — documented
  as deliberate at `m-app.css:1934`, not a defect.
- The `0.5em` price suffix on `/advertise/index.html` resolves against a `1.8rem` parent
  → 12.6px. Passes. (`em` math, not `rem` math — worth restating.)
- iOS 16px focus-zoom rule for `input`/`textarea`/`select` is present in `m-app.css`
  **and** mirrored into both printable sheets.

### 8. Cache-bust hygiene — clean
Every stylesheet's `?v=` key is at or ahead of that file's real last-change date:

| file | last changed | key |
|---|---|---|
| `main.css` | 09-02 | `20260902b` |
| `m-app.css` | 09-01 | `20260901a` (via `main.js`) |
| `main.js` | 09-01 | `20260901a` |
| `article.css` | 08-28 | `20260828d` |
| `printable-checklist.css` / `-poster.css` | 09-02 | `20260902a` |
| `local-pages.css` | 08-30 | `20260830v` |
| others (teens, hubs, gear, advertise…) | 08-19 – 08-31 | key ≥ change date |

Mid-run I nearly filed five stale keys as a defect — that was an artifact of the
`--depth 1` clone, which makes every file look "created" at the shallow boundary.
Un-shallowing the clone showed the real dates all line up. **Deploy hygiene is fine.**

---

## Not verified (needs a renderer — carried to the next run)

These are *candidates*, not findings. Each is an anchor styled like a button whose
computed height I can only estimate from declared padding × an assumed inherited
line-height. None is a WCAG 2.2 **AA** failure — AA requires 24×24px and all of these
clear that comfortably. They are only short of the 44px **AAA** target the site has
otherwise adopted.

| shape | count | est. height @14px root | verdict |
|---|---|---|---|
| `a[style*="padding: 10px 20px"]` — "Get the Printable →" | 7 CTAs / 7 pages | ~40px | probably short |
| `a[style*="padding: 12px 28px"]` — "Find Swim Lessons →" | 29 CTAs / 29 pages | 41–45px | line-height dependent |
| `.article-cta-btn` | 1 instance / 1 page | ~43.6px | borderline, ≤480px only |

Cardinality is already verified for the two attribute selectors: they match **36
elements sitewide, 100% of them `<a>` CTAs, zero non-CTA collateral** — so the house fix
(append them to the existing `min-height:44px / inline-flex / align-items:center` family
at `m-app.css:1207`) would be safe to apply as a raise-only no-op.

**I did not ship it**, for three reasons:

1. It's unverified. The last tap-target pass was explicitly found by rendering, not
   grepping, and the estimate here straddles the threshold on the larger of the two groups.
2. Editing `m-app.css` forces a `main.js` key bump, which is a **740-file HTML diff**.
   That is a large, risky deploy to buy ~4px on 7 links.
3. The gap is AAA-only. Precedent on this site is to accept that — breadcrumb links were
   deliberately capped at 36px rather than 44px for exactly this reason.

Cleared as *not* defects while checking the same list: `.dir-city-chip` (already carries
`min-height:44px` in the directory pages' own `<style>` block, 51 pages), `.cta-button`
(44.2px), `.btn-primary` (44.8px), `.cancel-button`, `.btn-back` (48px), bare `button`
(already in the floor family), and every `.related-card` / `.article-card` / `.hub-card` /
`.pillar-card` / `.tool-card` — those are full-size block cards, not small controls.
`.internal-link` is an inline citation link and is exempt by design.

Also unverified, same reason: rendered tap-target geometry generally, rendered text sizes
against the 15px/14px mobile root, sticky-header height, drawer geometry when open, and
the 320px narrow-viewport band.

---

## One small accessibility gap (not fixed)

The hamburger has `aria-label` and `aria-expanded` but no `aria-controls` pointing at the
nav list, on all 734 pages. Screen-reader users get the state but not the relationship.
Fixing it needs an `id` on the nav plus `aria-controls` on the button — a 734-file HTML
diff for a minor improvement. Flagging rather than shipping; worth bundling into the next
run that already touches every page.

---

## Cleanup
Mandatory workspace cleanup ran at the end of this session.
