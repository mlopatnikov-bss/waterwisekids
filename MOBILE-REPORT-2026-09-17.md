# Mobile Consistency Check — 2026-09-17

Audited against **`origin/live`** (the deployed tree, 787 HTML pages), not the
local working copy. Reason in "Blocker" below.

**Nothing was pushed this run.** One blocker needs a human decision; four small
touch-target fixes are written and waiting in
`MOBILE-TOUCH-TARGETS-2026-09-17.patch.css`.

---

## Blocker: this clone cannot push to `origin/live`

The local `live` branch and `origin/live` have **no common ancestor** —
`git merge-base live origin/live` exits non-zero with no output. They are two
unrelated histories with different root commits:

| | root commit | tip | tip date |
|---|---|---|---|
| local `live` | `0e265cb19` | `0e211752b` | 2026-09-16 06:06 |
| `origin/live` | `33aa3f73a` | `ddd1cb22d` | 2026-09-17 16:19 |

Git reports "273 ahead, 62 behind", but that is just the size of each disjoint
history — not a normal divergence that a merge or rebase would reconcile.

This is almost certainly the MacBook → Mac mini migration: the mini's copy was
re-initialised as a fresh repo rather than cloned, so it shares no history with
the remote. Meanwhile **the old machine is still pushing** — `origin/live`
received commits as recently as 16:19 today.

Consequences:

- A normal `git push` is rejected (non-fast-forward).
- A `--force` push would erase the 62 commits currently on `origin/live`,
  including today's `[lead-magnet]`, `[functionality-validator]` and
  `[visual-qa]` work.

I stopped rather than force-push. **Recommended fix:** back up any local-only
work, then re-clone from the remote on the mini and confirm the old machine's
scheduled tasks are switched off, so only one machine owns the history.

There are also 45 files with uncommitted changes in the local tree (~4,000
inserted lines) from earlier runs. Since that tree is a dead end, check whether
any of it is worth salvaging before re-cloning.

---

## What's healthy on the live site

| Check | Result |
|---|---|
| Viewport meta tag | **787/787 pages** — none missing |
| `user-scalable=no` / `maximum-scale` | **None anywhere** — pinch-zoom never blocked |
| Hamburger menu | **770 pages** with nav markup, **0 orphaned** — all load toggle JS |
| Image scaling | Global `img { max-width:100%; height:auto }` (main.css:189) |
| Horizontal overflow | `body { overflow-x:hidden }` + `overflow-wrap:break-word` (main.css:117) |
| Fixed-width inline styles | **0 bare `width:###px`** — all 700+ hits are `max-width` |
| Wide tables | All wrapped in `overflow-x:auto` scrollers, or `width:100%` with % columns |
| Form-field font size | **Fixed and deployed** — see below |

**The iOS zoom-on-focus fix is live.** A previous `[mobile-consistency]` run
pinned every text input to `16px` under `@media (max-width: 768px)` with
`!important`, and it is present in `main.css` (×3), `m-app.css`,
`printable-checklist.css` (×3) and `printable-poster.css` (×3). Source
declarations are still `0.93rem`/`0.95rem` in ~62 files, but the mobile
override correctly beats them all, including per-page `<style>` blocks. No
action needed. Also confirmed: no `<input>` lacks a `type=` attribute, so
nothing slips past the attribute selectors.

---

## Found: 4 touch targets under 44px, on 11 pages

Each of these already has a correct `min-height: 44px` rule — written in
`m-app.css`. But **`m-app.css` is loaded by only 9 pages, and none of them are
the pages using these classes.** The fix exists and reaches nobody.

| Selector | Element | Height | Pages |
|---|---|---|---|
| `.cat-btn` | `<button>` | **~28px** | `education/index.html`, `swimmers-hub/index.html` |
| `.wwk-city-link` | `<a>` | **~33px** | 7 × `swim-lessons/*.html` |
| `.pill` | `<button>` | **~33px** | `jobs/index.html` |
| `.state-chip` | `<a>` | **~39px** | `swim-schools/index.html` (50 instances) |

Heights are `padding-top + padding-bottom + font-size × 1.3`. All fall under the
44×44px minimum (WCAG 2.5.5, Apple HIG). The category filters and city links are
the most exposed — they're the primary navigation on those hub pages.

Deliberately **not** flagged, because they aren't tap targets: `.meta-chip`
(`<div>`/`<span>`, 122 pages) and `.requirement-tag` (`<div>`) are metadata
labels.

**Patch:** `MOBILE-TOUCH-TARGETS-2026-09-17.patch.css` — four CSS blocks, one
per stylesheet, each scoped to `max-width: 768px` so desktop is untouched. Two
of them should be merged into mobile `.cat-btn` blocks that already exist rather
than added separately; the file says where. Remember to bump the `?v=` cache-bust
on the affected pages or the change ships to nobody.

`.cat-btn` and `.wwk-city-link` live in horizontal nowrap scrollers, so taller
pills only grow the strip — they can't introduce horizontal overflow. That's the
same reasoning already recorded at `m-app.css:1071-1072`.

---

## Verification notes

Static analysis only — two verification routes were unavailable:

- **Live-site rendering:** the browser pane requires per-site approval, and with
  no user present in a scheduled run the request was declined.
- **Local headless rendering:** no Chromium/Puppeteer/Playwright in the sandbox,
  and installing one conflicts with this task's disk-cleanup mandate.

So the pixel heights above are computed from CSS, not measured. They're well
under 44px even on generous line-height assumptions, but a visual pass on
`education/index.html` at 375px would confirm before shipping. Allowing
`waterwisekids.com` in the browser pane once would let a future run measure
`scrollWidth` and real bounding boxes directly.
