## Batch 58 — 2026-09-09 — HowTo backlog closed; a new axis opened: unbound HowTo steps

### What changed

**1. `how-to-build-water-confidence-in-children.html` — new anchored `HowTo` (closes the gap).**
This was the single genuine HowTo gap left after Batch 57. It is a Corpus B legacy root page
(no `.article-body`), so the five prose H2s were located structurally, not by container class.
Added `id`s to those five H2s — `comfort-first`, `small-wins`, `consistent-exposure`,
`confidence-language`, `learning-environment` — then bound one `HowToStep` to each.
Step `text` is a **verbatim leading substring** of that section's own paragraph, truncated
before the first `<a>` so no link text is silently absorbed into schema. Step 1 drops its
leading *"Yes, ..."* answer sentence, which reads as a reply to the H2 question rather than as
an instruction; the remainder is still verbatim.

**2. The new axis — HowTo steps that are not bound to anything.**
The prose H2 backlog has been 0 since Batch 56 and the on-page levers are exhausted, so this
run measured a surface nobody had enumerated: the **interior** of the 43 HowTo blocks already
on the site.

Baseline before this run — **43 blocks, 223 steps**:

| Defect | Steps | Files |
|---|---|---|
| step has no `url` (not deep-linkable) | 94 | 19 |
| step has no `position` (order not asserted) | 81 | 16 |
| step has no `name` (unlabelled to an extractor) | 27 | 5 |
| block has no `totalTime` | — | 30 |

This matters for AEO specifically: an answer engine that wants to quote *step 3 of 5* needs a
name to label it, a position to order it, and a URL to cite it. A step carrying only `@type`
and `text` is an anonymous blob of prose that happens to sit inside a `HowTo`.

**3. Fixed this run — 27 unnamed steps across 5 files, plus the cleanest anchor case.**

- `natural-swimming-holes-safety.html` (5), `open-water-survival-skills.html` (5),
  `renting-home-with-pool-safety.html` (5), `summer-camp-water-safety.html` (7),
  `water-wings-vs-life-jackets.html` (5) — every step given a `name` and a `position`.
  Each name is a faithful compression of **that step's own opening clause**; nothing was
  invented and no step text was edited.
- `how-to-teach-treading-water.html` — the only file whose steps already mapped 1:1 onto
  existing section `id`s (`step1`–`step4`). Steps bound to `canonical + #id` and given
  `position`.

Residual after this run: **`name` 27 → 0**, `position` 81 → 50, `url` 94 → 85.

### Why the other 18 `url` files were left alone

Anchoring is only honest when a step has a section of its own to point at. On the five files
named above, the steps are sub-points *inside a single* procedure section — there is no
per-step heading to anchor to, and inventing `id`s on arbitrary `<li>`s would produce fragments
that resolve to nothing a reader recognises as "step 3". `self-rescue-home-pool-practice.html`
is the clearest example: 5 steps, all living under one `#how-to-practice` H2. Pointing all five
at the same fragment would satisfy a probe and tell an answer engine nothing. **Deferred, with
the reason recorded, rather than faked.**

### Validation

- 7/7 files: all JSON-LD blocks parse; `Article`, `FAQPage` and `BreadcrumbList` unchanged.
- 5/5 new step texts on the confidence page assert **verbatim** against rendered page text;
  shortest is 210 chars; none ends in a colon.
- Every step `url` fragment resolves to a real `id` on its own page; base equals that page's
  own `rel=canonical`. 0 duplicate `id`s introduced.
- `position` is 1..n contiguous on all 7 blocks; 0 steps without `name`.
- **Rendered prose is byte-identical before and after on all 7 files** (script/style stripped,
  whitespace collapsed) — the change is schema-only.
- Tag balance unchanged on all 7; 1 `<h1>` each; 0 `<meta>` and 0 JSON-LD in `<body>`.
- Speakable re-checked: every selector on the 7 files resolves to exactly 1.
- 0 brand-voice ownership hits.
- Playwright skipped on purpose — no JS on this site mutates head signals.

### Backlog after this run

- **Prose H2 backlog: still 0.** Untouched.
- **HowTo coverage: the "How to" H1 gap is now closed.** `how-to-build-water-confidence-in-children.html`
  was the last real candidate; the remaining 9 are decision guides and should stay schema-free.
- **New open axis: 85 unbound steps across 18 files.** Progress on it is gated on those pages
  having per-step section `id`s, which is a content-structure change, not a schema change.
  Do not report this as "85 broken anchors" — the correct denominator is *223 steps in 43
  HowTo blocks, printables excluded by rule*.
- `how-to-teach-kids-to-swim.html` still carries the oldest HowTo shape on the site: 5 steps,
  no `url`, and its step names do not correspond to any heading on the page. It needs its
  sections restructured before it can be anchored, not a schema patch.

### Flagged for Michael — not changed

1. **`water-safety-babies-under-1.html`** still says the AAP recommends 90–100°F water — that
   is *bath* water guidance, still unsourced, still the last unverified AAP number on the site.
2. **`/education/shallow-water-blackout.html`** — Red Cross / USA Swimming / YMCA deprecate
   "shallow water blackout" for "hypoxic blackout". Renaming the URL is a redirect decision.
3. **Batch 54–57 open items stand:** `free-reduced-swim-lessons-make-a-splash.html`'s two
   divergent FAQ blocks, `teaching-kids-safe-pool-entry.html`'s uncited "leading cause" claim,
   and `adaptive-swimming-special-needs.html`'s two `div.article-body` elements.
