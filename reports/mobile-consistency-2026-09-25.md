# Mobile Consistency Check — 2026-09-25

Source: fresh clone of `origin/live` @ 53728a7 (fetched directly from the remote URL, not
the mount's stale local pointer). 810 live HTML pages. Rendered at 390×844 with
`is_mobile:false` (mobile viewport-rescale hides overflow — see house lesson), Chromium
headless-shell (arm64), served over HTTP (not `file://`).

## Method
Full corpus sweep, 0 render errors on 810/810. Probe canary-gated on synthetic
true-positive/true-negative pairs before trusting corpus results (a first pass had a
tap-target exemption bug — fixed and re-verified before the numbers below).

Checked: viewport meta tag, horizontal overflow (documentElement.scrollWidth vs
innerWidth), tap targets (WCAG 2.5.8 AA 24px floor, exempting genuine inline prose links
and `.mobile-bottom-nav`/`.mobile-cat-item`/`.wwk-navlist`), text readability floor
(<10px, below the documented 10–11px deliberate floors), image overflow, and the
table word-split check for the recurring "inert overflow-x wrapper" defect (Range
.getClientRects per word, >1 distinct `top` = broken, hyphenated words skipped).
Hamburger binding / main.js coverage / desktop-breakpoint axes were NOT re-run — closed
2026-09-09, and `assets/js/main.js` / `main.css` / `m-app.css` / `m-app.js` carry no
logic changes since (only a cache-bust key bump on 09-24), so re-running is wasted
budget per [[hamburger_and_mainjs_coverage_axes_closed]].

## Results

**Clean, 0/810:** viewport meta, horizontal overflow, image scaling, text readability
floor (<10px).

**Table overflow-x wrapper defect (the 09-21/09-22 recurring class): did NOT reproduce.**
Table page count grew 59 -> 65 since the 09-22 sweep, but none of the 6 net-new table
pages shipped with the crushing defect this time (contrast 09-22, which found 8 newly
broken pages the same way). Two pages showed 1-2 broken words out of ~61 sampled —
`education/goldfish-swim-school-levels.html` (1/61, table already has the
`overflow-x:auto` wrapper, width 620 > viewport — genuinely scrollable, minor residual)
and `education/how-to-teach-a-child-to-swim.html` (2/61, `width:100%` responsive table,
rendered width 350 < the 390 viewport — this table isn't even overflowing, so it is
categorically not an instance of the crushing bug; almost certainly ordinary text wrap
in a narrow cell, not a layout defect). Neither rises to the 09-22 pattern's signal
strength (500+ broken words on a genuinely crushed page) — logged as low-confidence,
not fixed, to avoid a speculative edit on a working table.

**Tap-target backlog grew, not new — same known class.** 16 standalone block-anchor
links (a `<p>`/heading whose entire text is one link — not WCAG 2.5.8 inline-exempt)
measure 14-20px tall, up from the 12 recorded 2026-09-13 in
[[standalone_block_anchor_backlog_outside_printables]]. Four are new pages using the
same "Open the printable ... card" pattern: `after-water-scare-symptom-watch-log`,
`parent-and-me-swim-class-card`, `pool-chemical-storage-safety-card`,
`underwater-games-safety-card`, `water-safety-device-audit-card`,
`how-to-prevent-child-drowning.html`, plus a second hit on
`swimming-achievement-milestones.html`. This is the SAME deferred class recorded
2026-09-13 — the fix spans four stylesheets (main.css, article.css, local-pages.css,
teens.css) and needs a 659-page cache-bust bump, already queued to batch with the
`.callout strong{display:block}` fix. Not touched by this run; growing list logged to
memory for whoever picks up that batch.

## Nothing pushed
No code changes this run — the only findings were the known deferred backlog (growing,
logged) and two low-confidence, sub-threshold table hits that don't match the crushing
defect's signature. Baseline unchanged at 53728a7.
