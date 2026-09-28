# Visual QA — 2026-09-13 (second run, geometry axes)

Clone of `origin/live` @ `3e74c0d31` → shipped `6768bd6a5`.
778 HTML − 23 redirect stubs = **755 pages**.
Rendered **755/755 at 1280 and 755/755 at 390, 0 errors** on both bands.

## Why this run did not re-sweep the usual axes

`origin/live` was still at `3e74c0d31` — **zero commits since the previous
visual ship earlier the same day**. The CSS/JS delta was therefore zero bytes
and the content delta was empty, so every axis in the closed-axes index would
have been re-measuring an unchanged corpus. Re-running them is churn, so this
run spent its budget on three axes that had never been enumerated.

## The three new axes

| Axis | What it measures | Why a floor probe can't see it |
|---|---|---|
| **Label alignment** | Text top of sibling controls, measured with a `Range`, not the element rect | `align-items: stretch/flex-end` equalises the *boxes*; only the labels move |
| **Sibling gap variance** | Gap between consecutive members of a repeating group, within-page **and** against the corpus mode | Every gap can clear a minimum and still be inconsistent |
| **In-flow overlap** | Rect intersection of non-positioned siblings | Not a threshold violation — nothing is too small or too big |

The cross-page part matters: a page where *every* gap is wrong reads clean to a
within-page variance check. Computing the modal gap per component across all 755
pages is what caught defect 2.

## Defects found and fixed (shipped `6768bd6a5`)

**1. `/swim-lessons/directory/` — Search / Clear labels 2px out of alignment**

`.btn-clear` carries `border: 2px solid`, `.btn-search` had `border: none`. In an
`align-items: flex-end` row the two boxes bottom-aligned identically (both 46px,
both `top: 518.36`) while the *labels* sat 2px apart — invisible to any
rect-based check. Matched the border width in the button's own colour, so the
appearance is unchanged and the row height is still 46px. Hover changes
`border-color` with the background so no ring appears.

- Before: `btn-search textTop 534.36` / `btn-clear textTop 532.36`
- After: both `532.36`

**2. Three education articles — sidebar box 24px off the house spacing**

The first `.sidebar-box` on three pages carried an inline `margin-bottom: 24px`,
producing a 56px gap to the next box where the house spacing is the flex `gap`
of 32px. Corpus scan: 3 of 121 sidebar boxes carried it.

- `education/adaptive-swimming-special-needs.html`
- `education/intensive-vs-weekly-swim-lessons.html`
- `education/swim-level-assessment.html`

Gaps now read `32 / 32` on all three; each sidebar is 24px shorter.

**3. `education/swim-lessons-cost.html` — copy fragmented by a callout rule**

`main.css` sets `.callout strong { display: block }`. That is correct for a
lead-in label, but this page uses `<strong>` for three price ranges *inside a
sentence*, so each was forced onto its own line, orphaning the punctuation —
the callout rendered as "…typically cost" / "**$15–$30 per session**" /
"at community pools…", and later ", while private lessons average" on a line by
itself. On a page targeting swim-lesson cost queries.

Corpus scan: **8** `.callout strong` in total — 2 genuine lead-ins
(`index.html`, `contact/index.html`, both fine) and these 6. Fixed with a
page-scoped override rather than editing `main.css`, because **659 pages load
`main.css`** and changing it would force a sitewide cache-bust bump for a
one-page defect.

Before/after crops: `searchbtn_before/after.png`, `callout_before/after.png`.

## Result after the fix — axis enumerated clean

| Viewport | Pages | Errors | align | gaps | overlap |
|---|---|---|---|---|---|
| 1280 | 755/755 | 0 | 0 | 0 | 0 |
| 390 | 755/755 | 0 | 0 | 0 | 0 |

## Probe artifacts named this run (four, all caught by canary or triage)

1. **Row bucketing by `round(top / 40)` merges a vertical stack** — produced
   260 phantom hits on `.toc-list`, where consecutive TOC links 34px apart
   landed in one bucket. Group by actual vertical *overlap* of the text rects.
2. **An icon-only control has no label to align** — the hamburger returns a
   Range rect from its child boxes, so it read as a misaligned label against the
   logo on **every** page at 390. A defect that is uniform sitewide is a probe
   bug, not a corpus defect. Require non-empty trimmed text.
3. **An inline child's rect is the union of its line boxes** — a wrapped `<a>`
   or `<strong>` inside a paragraph fakes both an overlap and a wildly uneven
   gap (22 pages at 390, 2 at 1280). Reject the whole group rather than
   filtering the child, so the change stays monotonic and can be verified on
   just the flagged pages.
4. **`<colgroup>` has no visual box of its own** but reports a rect spanning the
   table, so it "overlaps" `<thead>`. Excluded.

Canary gate: a synthetic page carrying an injected border mismatch, an injected
stray margin and an injected negative margin must fire all three axes, while
`index.html` and `about/index.html` must report zero on all three — asserted
before and after every probe change.

## Not fixed — judgement calls

- **`main.css` `.callout strong { display: block }` is a latent trap.** It is
  right for today's two lead-ins and wrong for any future mid-sentence bold in a
  callout, and it fails silently. The structural fix is to make the block
  behaviour opt-in via a class, but that means editing `main.css` plus the two
  lead-in pages and bumping the cache-bust key across 659 pages — too broad to
  do unattended. **Recommend for a supervised run.**
- **`swimmers-hub/butterfly-complete-guide.html`** carries the same stray
  `margin-bottom: 24px` on a `.sidebar-box`, but it is the only box in that
  sidebar so there is no sibling gap to distort. Inert; left alone.
- **`education/water-safety-teens.html`** wraps a checklist in a `.toc-list`
  container, so its 20px item spacing differs from the 10px TOC mode. Two
  different components under one class name — renders correctly, semantic
  rather than visual. Not touched.
- **`for-swim-schools/index.html`** unclassed divs in a `gap: 1.5rem` grid read
  as 24-vs-14 against a coarse selector key. Design intent.

## Verification status

Push succeeded: `3e74c0d31..6768bd6a5  live -> live`. All three fixes are
verified by render in the clone at 1280 and 390. **Live/edge verification was
not possible** — this was an unattended run and browser access to the domain
could not be approved. Worth a spot-check on
`/education/swim-lessons-cost.html` (a leaf page, not the directory hub, which
serves a stale edge cache).
