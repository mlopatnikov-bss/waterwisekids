# AEO Report — 2026-09-01 (Batch 51)

**Shipped:** `0ff04d2` → `live`. Two articles, 10 statement H2s converted to question H2s,
3 TOC labels re-synced, `dateModified` + visible `Updated` + `sitemap.xml lastmod` bumped
on exactly 2 URLs. All live-verified.

| Article | Before | After | Words |
|---|---|---|---|
| `education/weighted-practice-flip-turns-skills.html` | 0/5 | **5/5** | 1,902 |
| `education/swim-readiness-indicators-age-4.html` | 0/5 | **5/5** | 1,956 |

This closes the 0/5 template cluster flagged as the next batch in the 2026-08-31 report.

---

## The finding: the "articles under 50% question H2s" backlog number has been measuring the wrong pages

Re-scored all 507 `/education/` files rather than trusting `aeo-progress.md`. A naive
scorer — every `<h2>` in `<body>`, minus a role-based skip list — returns **106 pages under
50%**. The prior report's figure was **18**. Neither number describes the same population.

**The gap is the printable checklist pages.** 71 `*-printable.html` files build their body
out of `<h2 class="cl-section-title">` and `<h2 class="cl-emergency-title">` — these are
**checklist card section labels** ("On-Duty Rules (The Non-Negotiables)", "How the Water
Watcher System Works"), not prose article headings. 466 such headings sitewide. They are
printed on a physical card. Turning them into questions would be wrong, and counting them
as an AEO deficit inflates the backlog by ~6x.

Excluding class-`cl-*` headings collapses every printable to a denominator of **1 or 2** —
the single prose "bridge" H2 that sits below the card (e.g. `water-watcher-card-printable`:
"Supervision Is One Layer — Swim Skills Are Another"). At n=1 the ratio can only be 0.00 or
1.00, so **the ratio is not a meaningful metric on these pages at all** and they should be
excluded from the denominator, not merely down-weighted.

**Real prose backlog, after exclusion: 16 articles.** That reconciles with the prior
report's 15 — so the historical *aggregate* was right, and this is the third consecutive
batch (49, 50, now 51) where the aggregate was right while the composition was wrong. The
generalization from Batch 50 — *assert the composition of the skipped set, not its size* —
extends: **assert the composition of the scored set too.**

Skip-set self-assertion (Batch 50's rule) ran clean: **0 suspicious skips**, i.e. no
heading already ending in `?` was skipped without a printable noun.

### The 71 printable bridge H2s are a real, separate, cheap surface

Each printable carries exactly one statement-form prose H2 below the card. That is 71
extractable headings currently invisible to answer engines, at one edit per file with no
schema coupling. **Not touched this run** — 71 files is its own batch and warrants its own
validation pass. Recommended as the next high-leverage AEO batch.

---

## H2 conversions

### `weighted-practice-flip-turns-skills.html`

| id | Was | Now |
|---|---|---|
| `what-is-it` | 🎯 What Weighted Practice Actually Means | 🎯 What Does Weighted Practice Mean in Youth Swimming? |
| `why-it-works` | 🧠 Why This Beats Pure Volume | 🧠 Why Do Four Focused Repetitions Beat Fifty Unfocused Laps? |
| `flip-turns-example` | 🔄 Flip Turns: A Concrete Example | 🔄 How Do You Fix a Child's Flip Turn Without Swimming More Laps? |
| `parents-can-look-for` | 👀 What Parents Can Look For from the Deck | 👀 How Can You Tell Coaching Feedback Is Specific and Not Generic? |
| `ages-and-stages` | 📈 When Weighted Practice Fits a Young Swimmer | 📈 How Does a Drill Block Change From Age Four to Age Twelve? |

### `swim-readiness-indicators-age-4.html`

| id | Was | Now |
|---|---|---|
| `why-4-matters` | 🎂 Why Age Four Is a Developmental Milestone | 🎂 What Changes Between Age Two, Three, and Four in the Water? |
| `physical-readiness` | 💪 Physical Readiness Indicators | 💪 Which Physical Skills Should a Four-Year-Old Have Before Lessons? |
| `emotional-readiness` | 💗 Emotional Readiness | 💗 Is My Four-Year-Old Emotionally Ready to Be Separated at a Lesson? |
| `cognitive-readiness` | 🧩 Cognitive and Language Readiness | 🧩 How Much Language Does a Child Need to Follow Swim Instructions? |
| `what-to-do-if-not-ready` | ⏳ What to Do If Your Child Is Not Yet Ready | ⏳ What Should Parents Do If a Four-Year-Old Is Not Ready Yet? |

Numbers in the new headings were verified against the section body before commit:
"four focused repetitions" / "fifty unfocused laps" and "age four to age twelve" are all
stated in their own sections, not invented for the heading.

---

## Collision handling

10 proposals scored against a **7,002-heading** sitewide corpus (h1–h4 ending in `?` across
665 files), **including each page's own FAQ `<h3>`s**. **Zero collisions. Final worst 0.673.**

Two re-aims, both driven by reading the nearest match's URL rather than by the number:

1. **`parents-can-look-for`.** Drafted as *"What Should Parents Watch for From the Pool
   Deck?"* → **0.747** vs `swim-lesson-separation-anxiety-plan :: "What Should Parents Do
   While Watching From the Side?"` and **0.706** vs `thirty-minute-swim-lesson-science ::
   "What Should Parents Watch for During a 30-Minute Lesson?"`. Legal under 0.80, but
   `thirty-minute-swim-lesson-science` is the topical owner of "what parents watch for
   during a lesson." Compounding it, this page's own FAQ already owns *"How do I know if my
   child's coach uses weighted practice?"*. Re-aimed onto what the section **uniquely**
   carries — specific vs. generic feedback — landing at **0.539**.
2. **`why-4-matters`.** The obvious *"Why Is Age Four a Turning Point for Swim Lessons?"*
   scored **0.720** against three `kids-swim-lessons-*` city pages in the crowded
   "right starting age" cluster. Aimed instead at the 2→3→4 progression the section
   actually enumerates: **0.673**.

Self-cannibalization was again the binding constraint. Both pages carry five FAQ `<h3>`s
that already own the definitional queries (`At what age can my child benefit from weighted
practice?`, `Is my four-year-old too old to start?`), so every H2 had to be aimed at an
angle its own FAQ does not answer — mechanism, observable signal, or developmental
trajectory rather than start age.

---

## Method notes

- **id-keyed raw-file replacement**, `count==1` asserted per heading before and after,
  nested markup asserted absent. bs4 output never string-matched against the raw file.
- **An emoji was silently dropped and caught by the assertion loop, not by eye.** ⏳ (U+23F3,
  Miscellaneous Technical) falls outside the `U+1F000–U+1FAFF` + dingbats ranges the capture
  regex used, so it was swallowed into the "old text" group and not re-emitted. Nine of ten
  headings kept their emoji; one lost it. Restored by exact-string replace and re-verified.
  **Generalizable: an emoji-preserving heading regex must cover U+2300–U+23FF and
  U+2600–U+27BF, not just the Supplemental Symbols plane — or better, capture "everything
  before the first ASCII letter" rather than enumerate ranges.**
- **No HowTo schema on either page**, confirmed before drafting — so the Batch 47
  bind-by-`url` step was not needed and heading text was free from the start.
- Section lead-ins read before drafting and re-read after: **all 10 sections open with a
  direct answer to their new question.** No lead paragraph was altered.
- **3 TOC labels re-synced.** Precedent is to leave short non-verbatim TOC labels alone, but
  three had drifted into inaccuracy once the section was re-aimed
  (`What Parents Can Look For` → `Spotting Specific Feedback`;
  `When It Fits Young Swimmers` → `How Drills Change by Age`;
  `Why Age Four Is a Milestone` → `What Changes by Age Four`). The other seven remain
  accurate and were left untouched. All `<h2 id>` values preserved; all in-page anchors resolve.

## Validation

- Tag balance `err=0 / stackleft=0` on both.
- html5lib head integrity: 16 metas in `<head>`, **0 metas in `<body>`**, canonical in head.
- JSON-LD parses clean — `[Article, FAQPage, BreadcrumbList]`; `jerr=0`; **0 HTML entities
  leaked inside JSON-LD** (the `&#39;` in the flip-turn heading is HTML body text, not schema).
- **FAQ schema↔visible drift 0** across 5/5 Q&A each, checked against all three markup
  shapes (`h3`, `p > strong`, `button.faq-question`).
- Speakable resolved with soupsieve: `.tldr-box`, `.article h1`, `.article-excerpt` →
  **exactly 1 each** on both files. None match zero.
- `headline == h1` on both. Meta descriptions unchanged, decoded 158 / 151 (≤160).
- Nested anchors 0. Unsubstituted placeholders 0. All internal `#` anchors resolve.
- **DOM signature diff vs HEAD, scripts stripped: 198/198 and 195/195 — tag+id+class
  sequence byte-identical.** Text-node diff shows exactly the 10 headings, 3 TOC labels, and
  2 `Updated` lines. **No prose deleted anywhere on either file.** Text-only change, so no
  render sweep warranted.
- `sitemap.xml` re-parsed clean, **643 entries unchanged**, lastmod bumped for exactly the
  2 URLs. Both had been sitting at `2026-08-29` while `dateModified` read Aug 19 / Aug 28 —
  the known sitemap-vs-dateModified contradiction, now consistent for these two. No blanket bump.
- **Live-verified** after push: both pages `http 200`, all 10 question H2s serving, both
  `dateModified` and both visible `Updated` lines live, sitemap live with 643 entries and
  both `lastmod` at `2026-09-01`.

---

## Flagged for Michael — not changed

1. **71 printable bridge H2s** (above) — the single highest-volume remaining AEO surface,
   one edit per file, no schema coupling. Recommended as the next batch.
2. **Batch 50's open item stands:** a sitewide sweep for numbers attributed to
   AAP/CDC/Red Cross that those bodies do not state. Two such misattributions have now been
   found in consecutive batches.
3. **Batch 49's open item stands:** `free-reduced-swim-lessons-make-a-splash.html` ships two
   divergent FAQ blocks and the one the JSON-LD quotes is stranded below `<div class="related">`.
4. **Batch 47/48's open item stands:** `teaching-kids-safe-pool-entry.html` asserts headfirst
   entries are "a leading cause" of neck/spinal injuries, in body *and* FAQ schema, uncited.

## Backlog — 14 prose articles under 50% question H2s

Next, in priority order:

- `national-water-safety-action-plan-explained` (1/11 — **check the AAP-2026 and NDPA
  two-taxonomies rules before touching**)
- `education/index.html` (1/10, 14,375w hub — **hub-cannibalization rule applies**, aim H2s
  at scope not topic)
- `end-of-summer-swim-skills-report-card` (1/7) · `new-jersey-pool-fence-law` (1/7 — **VGB
  scope rule applies**)
- `water-confidence-challenge` (1/6) · `make-a-splash-local-partner-badge-decoded` (1/5 —
  **legacy-branding rule; bridge, don't strip**)
- `year-round-swim-skills-checklist` (1/4) · `swimmers-ear-prevention-checklist` (1/4)
- `water-slide-safety-checklist` (2/7) · `swim-practice-log` (2/6) ·
  `fall-swim-skill-retention-checklist` (2/6)
- `swim-milestones-by-age` (3/8) · `swim-strokes-guide-kids` (3/7) ·
  `autism-wandering-water-safety` (4/9)
