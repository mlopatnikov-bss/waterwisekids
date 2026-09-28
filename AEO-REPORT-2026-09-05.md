## Run 2026-09-05 — Batch 55: the prose backlog cut to one, and a lead-magnet ad wearing the summary box's class

Shipped from a fresh `origin/live` clone at `c04aef422`. Three articles taken:
`water-confidence-challenge` (1/5 → 5/5), `swim-milestones-by-age` (3/8 → 8/8),
`autism-wandering-water-safety` (4/9 → 9/9). **14 H2s converted.**

### Backlog reconciliation before touching anything

The scorer was rebuilt from the recorded role table verbatim (`cl-` class, cta ancestor,
related-cards, sources-list, structural-id, faq-block-requires-non-question-h2), with the
≤3-direct-children restriction on the parent test and the per-role cardinality canary.

| canary | reading |
|---|---|
| over-skip (>2 per role per file, printables excluded) | **0** |
| skipped headings ending in `?` | 83, of which **18 printable-label** |
| non-printable skipped `?` | 65 — **45 `cta-text`, 20 `cta`** |
| pages scored (n≥3) / dropped (n<3) | 420 / 95 |

**The `20` in the standing canary is the `cta` ancestor-class role only.** The other 45 are
the `#printable` lead-magnet CTAs — *"Where can I get the free printable X?"* — which carry
**no class** and are caught only by the acquisition-verb ∩ printable-noun text rule. All 45
were printed and read: every one is a lead-magnet CTA, none is content. That is why this
run reads `water-confidence-challenge` as **1/5** where Batch 54's report said **2/6** —
the difference is exactly that page's `#printable` CTA, counted there and excluded here.
The exclusion moves a *question* out of the numerator, so it can only make a page look
worse, never hide one; the backlog page set was identical either way (5 pages).

### The 14 conversions

`water-confidence-challenge` (emoji stored as **HTML entities**, sentence case):

| id | was | now |
|---|---|---|
| `works` | Why a 30-day drip works better than a big push | Why do 30 short sessions work better than one big push? |
| `weeks` | The four weeks, at a glance | How does the challenge build from bathtub to pool? |
| `safety` | Confident is not the same as safe | Can a more confident child actually be at greater risk? |
| `next` | What comes after Day 30 | Why is the end of the challenge the best time to enroll? |

`swim-milestones-by-age` (Title Case, **no ids on the target H2s** — replacement keyed on
full raw heading string with `count==1` asserted before and after):

| was | now |
|---|---|
| What Should Babies Do Before Age 1: Water Comfort & Acclimation | What Swim Skills Should a Baby Have Before Age 1? |
| What Can Ages 1-2 Do: Foundation Skills | What Do 1- and 2-Year-Olds Learn in Their First Year of Lessons? |
| What Can Ages 2-3 Achieve: Building Independence (Slowly) | When Do Toddlers Start Floating With Minimal Support? |
| What Can Ages 3-5 Learn: Skill Development Accelerates | Which Swim Skills Develop Fastest Between Ages 3 and 5? |
| What Can Ages 5+ Master: Toward Independent Swimmers | What Swim Skills Do Children Master After Age 5? |

These five were **pseudo-questions** — `What Should Babies Do Before Age 1:` reads as a
question but ends in a colon and a label, so it never scored. See
[[question_heading_not_ending_in_question_mark]].

`autism-wandering-water-safety` (the `Layer N:` prefix is the page's ladder and was
**preserved**, so the sidebar TOC labels stay accurate):

| id | was | now |
|---|---|---|
| `prevent-wandering` | Layer 1: Stop the wandering at the door | Layer 1: How do you stop a child from getting out the door? |
| `supervision` | Layer 2: Supervision built for wandering | Layer 2: What kind of supervision does a child who wanders need? |
| `swim-lessons` | Layer 3: Swim lessons and self-rescue | Layer 3: Which self-rescue skills matter most for a child who wanders? |
| `emergency` | Layer 4: Plan for the worst | Layer 4: Where should you search first if your child goes missing? |
| `bottom-line` | The bottom line for families | Can wandering drownings actually be prevented? |

### Collision handling — three re-aims, all against *other* pages this time

Corpus **7,106** headings (`h1+h2+h3` ending in `?` across 763 files, including the files
being edited). Threshold **0.75**. Final worst **0.742**.

1. `What happens in each of the four weeks?` — **0.775** vs
   `swim-float-swim-method-explained :: What happens in each phase of the sequence?`.
   Re-aimed to the ladder the lead actually describes (home → shallow water):
   `How does the challenge build from bathtub to pool?` (0.639).
2. `What should you do after Day 30?` — **0.812** vs
   `bathtub-safety-checklist :: What Should You Do After the Bath?`. First re-aim,
   `Is your child ready for swim lessons after Day 30?`, scored **0.847** against
   `water-anxious-kids-preparation :: Is Your Child Ready for Swim Lessons?` — a second
   collision the first re-aim walked straight into. Landed on the section's actual claim
   (momentum, not readiness): `Why is the end of the challenge the best time to enroll?` (0.565).
3. `What should you do if your child goes missing?` — **0.791** vs
   `drowning-prevention-guide :: What should you do if a child is drowning?`; then
   `How do you prepare for a missing-child emergency?` — **0.787** vs
   `hot-tub-spa-safety-checklist :: How should you prepare for a spa emergency?`.
   Landed on the section's one distinctive instruction — *search water first* —
   `Where should you search first if your child goes missing?` (0.714).

**A re-aim can collide harder than the original.** Two of the three needed a second pass.
Re-score every re-aim against the full corpus; do not assume a rewrite moves away.

Two proposals sat just under threshold and were **kept deliberately**, both scope splits
rather than intent duplicates: `What Swim Skills Should a Baby Have Before Age 1?` (0.742 vs
`swim-milestones-checklist :: What swim skills should my child have at each age?` — the
sibling owns "each age", this owns age 1) and `Which Swim Skills Develop Fastest Between
Ages 3 and 5?` (0.738 vs `swimming-achievement-milestones :: What Swim Milestones Develop
Between Ages 1 and 2?` — different age band, same shape). Both are the "split scope, not
topic" case; flagged for the cannibalization watch rather than re-aimed.

All 14 sections were re-read after editing: **every one opens with a direct answer to its
new question**, and no lead paragraph was altered by the heading work.

### The real find — a printable ad wearing `.tldr-box`

`swim-milestones-by-age` declared `speakable.cssSelector` including `.tldr-box`, and
`.tldr-box` resolved to **2**. The second is a lead-magnet promo —
*"🖨️ Track it on paper: Our free printable Age-by-Age Swim Milestones Checklist…"* —
reusing the summary box's class for its styling. Answer engines were being handed a
**printable ad as one of the page's two speakable summaries.**

Swept the shape sitewide before fixing: **684 files carry `speakable`; this is the only
page where a `.tldr-box` promo exists.** Not a family, a one-off.

Fixed without touching styling or markup shape: `id="quick-answer"` added to the genuine
summary box and the selector narrowed `.tldr-box` → `#quick-answer`. No class was changed,
so no CSS rule was disturbed — see [[markup_variant_must_be_added_to_every_rule_in_the_family]]
for why renaming the promo's class would have been the wrong fix.

**The wider speakable-cardinality surface, characterized not swept:** 160 selectors across
the site do not resolve to exactly 1. **113 of them are printable-family selectors**
(`.cl-item` 76, `.cl-checkbox` 14, `h2.cl-section-title` 13, `.cl-section-title` 10) and are
**correct by design** — printables are a separate template family. The remainder is a real
open surface and is listed below rather than fixed blind.

### A probe that lied, caught by its own canary

The raw-head embedded-quote scan reported **1 hit** on `swim-milestones-by-age`. It is a
false positive: the regex `<meta[^>]*content="[^"]*"[^">]*"` spans **two adjacent meta
tags** (`content="summary_large_image"` … `name="`). Confirmed by an odd-quote-count test
per meta tag (**0**), by html5lib parsing clean, and by running the same regex against
`HEAD` — **also 1**, so it predates this batch entirely. The correct test is
per-tag quote parity, not a cross-tag regex.

### Validation

| check | result |
|---|---|
| DOM signature diff vs HEAD (scripts stripped) | **179/179**, **200/200** identical; `swim-milestones` 341→342, accounted for exactly by the one added `id` |
| text-node diff | only the 14 headings and 2 `Updated` lines; **0 prose strings removed elsewhere** |
| html5lib parse | clean x3 |
| head integrity | 16 head metas, **0 body metas**, canonical in head (x3) |
| per-meta quote parity | 0 odd-quote tags (x3) |
| JSON-LD | `[Article, BreadcrumbList, FAQPage]` x3, parses clean, **0 leaked entities** |
| FAQ schema ↔ visible parity | **0 orphans** across 5/5/4 Q&A, full recorded selector set (`h1..h5, summary, p>strong, p>b, dt, button, .faq-question, legend`), canonical apostrophe/emoji normalization |
| visible-candidate-set canary | 29 / 51 / 38 — non-empty, probe not shrunken |
| speakable | every selector → exactly **1**, on all three |
| `headline == h1` | true x3 |
| meta description (decoded) | 138 / 155 / 152 — unchanged |
| dead in-page anchors | **0** (every `h2 id` preserved) |
| placeholders / ownership-voice | 0 / 0 |
| `dateModified` | 2026-08-09 / 2026-07-30 / 2026-08-23 → **2026-09-05** |
| visible `Updated` line | synced on the two pages that carry one |
| `sitemap.xml` lastmod | exactly 3 URLs bumped, re-parsed clean, **647 entries** |

Text-only changes plus one `id` attribute, so no render sweep was warranted.

### Backlog after this run

**Prose backlog is down to 1:** `swim-strokes-guide-kids` (3/7).
It carries a **HowTo** schema, so per [[howto_blocks_heading_rewrite_bind_by_url]] the next
run must bind `HowToStep.url` to the section ids and replace `step.text` with each section's
verbatim lead `<p>` **before** touching the four stroke H2s.

`education/index.html` (1/8) is a hub and stays scoped separately.
The **71 printable "bridge" H2s** remain unworked.

### Flagged for Michael — not changed

1. **Speakable selectors that do not resolve to exactly 1, outside the printable family:**
   `beginner-swim-lessons/index.html` `.hub-answer` → **8**; `.state-info h3` → 18 across the
   directory family; `.wwk-intro-box p` → 13; `.faq-section h3` → 5; `.article-body h2` → 3;
   `adaptive-swimming-special-needs.html` `.article-body > p:first-of-type` → **2**.
   Some of these are plausibly deliberate (a hub with 8 answers); the article-family ones
   are not. Worth its own batch, characterized per family before any edit.
2. **Batch 54's open items still stand:** the 88% attribution surface is closed (residual 0),
   but `free-reduced-swim-lessons-make-a-splash.html`'s two divergent FAQ blocks and
   `teaching-kids-safe-pool-entry.html`'s uncited "leading cause" claim remain open.

---
