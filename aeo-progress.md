# AEO Optimization Progress

Tracking which articles have been optimized for Answer Engine Optimization (AEO).
Each article is checked against the full 8-point checklist:
1. Answer-first opening
2. Question-based H2s
3. TL;DR summary box
4. FAQPage JSON-LD schema
5. HowTo JSON-LD schema (step-by-step articles only)
6. Authoritative citations with hyperlinks
7. Key statistics with source attribution
8. Speakable metadata

---

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

## Run 2026-09-04 — Batch 54: three printable-landing articles, and an 88% attribution that is a 288-file surface

Shipped from a fresh `origin/live` clone at `3fc4e4202`. `water-slide-safety-checklist`
2/8 -> **7/8**, `fall-swim-skill-retention-checklist` 2/6 -> **6/6**, `swim-practice-log`
2/6 -> **5/6**. All three at **100% of convertible H2s** — the only residuals are the
lead-magnet printable CTA H2s, which are not convertible. 12 headings converted, worst
collision **0.725** against a **7,084-heading** corpus, three re-aims. **Backlog 8 -> 5.**
Full detail: `AEO-REPORT-2026-09-04.md`.

**The scorer reproduced the 2026-09-03 state exactly before any edit** — 8 pages under 50%
(7 prose + `education/index.html`), over-skip canary 0, and the "never skip a question"
canary at 20, all `Ready to...?` CTA headings on pages that drop at n<3. Re-deriving the
measurement on a fresh clone first is what makes "backlog 8 -> 5" a real number rather than
a phantom.

### The finding that mattered most: the 88% misattribution is not a page defect, it is a 288-file surface

Two of the three articles asserted the 88% drowning-risk-reduction figure **as the AAP's own
finding** — `water-slide-safety-checklist#skills` ("According to the American Academy of
Pediatrics, formal swim lessons reduce drowning risk by up to 88%") and
`fall-swim-skill-retention-checklist#year-round-lessons`, the latter in **prose, visible FAQ,
and FAQ JSON-LD simultaneously**. The figure is from a case-control study in the *Archives of
Pediatrics and Adolescent Medicine* (Brenner et al.); the AAP **cites** it. All four instances
were rewritten to the site's dominant correct hedge, "research cited by the American Academy
of Pediatrics" — which `swim-practice-log` was already using, in both its visible FAQ and its
JSON-LD, and which is therefore the established convention rather than a new one.

**Sweeping the shape sitewide is the part worth recording.** Across all 741 HTML files,
**288 carry an 88% claim naming the AAP without naming the study**, and **42 of those carry
it inside `ld+json`**:

| shape | files | example |
|---|---|---|
| producer ("AAP reports/finds/shows") | 114 | `benefits-of-swimming-for-kids` |
| "according to the AAP" only | 57 | `beginner-swim-lessons-toms-river-nj` |
| hedged correctly ("research it cites") | 52 | `beginner-swim-lessons-asbury-park-nj` |
| other AAP+88% phrasings | 86 | `education/drowning-prevention-guide` |

This was **not** swept this run, deliberately. It is a claim-hygiene batch, not a heading
batch, and the standing rule against blanket sweeps of the 645 AAP-naming files applies —
the correct unit of work is a dedicated pass that fixes prose and JSON-LD together and
verifies FAQ parity per file. **Flagged as the highest-value open item.** Reporting "the two
pages I touched are now clean" without naming the other 286 would have been the partial audit
that is worse than none.

### Collision handling
12 proposals scored against a 7,084-heading corpus (h1+h2+h3 ending in `?` sitewide,
**including each file being edited**) plus intra-batch. Three re-aims, all driven by the
page's *own* FAQ or by a section lead that answered a different question than the heading
asked:
- `Build your fall skill-retention plan` -> `How do you build a fall skill-retention plan?`
  scored **0.759** against `lazy-river-safety-kids :: How do you build a family lazy-river
  plan?`. Re-aimed to **`How do you turn this into a fall plan you'll actually follow?`**
  (0.602) — which is what the section's lead sentence actually argues.
- `How to keep swim skills sharp after summer` could not become the literal question: the
  page's own FAQ h3 already owns *How can I keep my child's swim skills sharp after summer?*
  Re-aimed to **`What should off-season swim practice look like?`** (0.711), matching the
  lead's claim that short and frequent beats long and rare.
- `Height and age limits...` and `Backyard inflatable slides...` would both have landed
  verbatim on this page's own FAQ h3s. Aimed at *matching a slide to a child* and at *setup
  procedure* instead — the second also stays clear of the sibling guide
  `water-slide-safety-kids`, which owns "are they safe" (0.716).

**Every one of the 12 sections was re-read after the rewrite and opens with a direct answer
to its new question.** Two headings were chosen *from* the lead sentence rather than the
other way round, which is the cheaper direction.

### The FAQ-parity probe regressed to a narrower selector than the recorded one
The parity check flagged one schema question as an orphan on
`fall-swim-skill-retention-checklist`: *What is the "post-summer swim slide"?* It is not
missing — it is a visible **`h2`**, the section header itself. **This was a probe regression,
not a new discovery**: the recorded working selector set already includes `h1|h2|h3|h4|h5|
summary|p/strong|p/b|dt|button|.faq-question|legend`, and this run rebuilt a narrower one
(`h3`, `p > strong`, `button.faq-question`) from a partial reading of it. The recorded canary
— assert the visible-question count is in the expected thousands — is exactly what would have
caught it before the result was believed. Real orphan count across all three files: **0**.
The lesson is not about `h2`; it is that **re-deriving a probe from memory of a rule is how a
fixed probe un-fixes itself**, and the antidote is to copy the recorded selector set verbatim.

### Validation
- DOM signature diff vs HEAD, scripts stripped: **221/221**, **234/234**, **206/206** —
  tag+id+class sequence **identical** on all three. Text-node diff: the only removed strings
  are the 12 replaced headings, the 4 attribution phrases, and the 1 visible `Updated` line.
  No prose deleted anywhere.
- html5lib: 16 metas in `<head>`, **0 metas in `<body>`**, canonical in head, on all three.
  Raw-head attribute scan for embedded quotes: 0.
- JSON-LD parses clean — `[Article, BreadcrumbList, FAQPage]` on all three; 0 HTML entities
  leaked inside `ld+json`.
- FAQ schema<->visible drift **0** across 5/5/5 Q&A, checked against four markup shapes.
- Speakable: every selector resolves to exactly 1 on every file (`.tldr-box`, `.article h1`,
  `.article-excerpt`, `.article > p:first-of-type`). None match zero.
- `headline == h1` on all three. Meta descriptions unchanged, decoded 149 / 147 / 128.
- Dead in-page anchors 0 — every `h2 id` preserved, so all TOC links still resolve, and all
  12 TOC labels remain accurate short descriptors of their rewritten sections (left as-is per
  Batch 41/42 precedent). Unsubstituted placeholders 0. Brand-voice ownership scan 0 hits.
- `dateModified` 2026-08-11 / 2026-08-31 / 2026-07-12 -> **2026-09-04**. Only
  `water-slide-safety-checklist` carries a visible `Updated` line; it was synced. The other
  two have a published date only — **not** given one, since inserting a date mirror is a
  template change, not a content edit.
- `sitemap.xml` lastmod bumped for **exactly these 3 URLs** (2026-08-29 / 2026-08-31 /
  2026-08-14 -> 2026-09-04). Re-parsed clean, **646 entries unchanged**. No blanket bump.

### Backlog — 4 prose articles under 50% (+ `education/index.html`, hub)
`water-confidence-challenge` (2/6) - `swim-milestones-by-age` (3/8) -
`swim-strokes-guide-kids` (3/7) - `autism-wandering-water-safety` (4/9).
The 71 printable "bridge" H2s remain unworked.

### Flagged for Michael — not changed
1. **The 88% attribution surface: 288 files, 42 of them in JSON-LD.** Numbers and file
   classes above. Worth its own batch; it is the sitewide sweep for
   authority-misattributed figures that Batches 50 and 53 both said was warranted.
2. `education/index.html` sits at 1/7 question H2s but is a **hub**, not an article — the
   hub-cannibalization rule applies and it should be scoped separately from the prose backlog.
3. Two of the three pages carry a `dateModified` with **no visible date mirror**. Consistent
   with their template, but it means a reader cannot see the freshness signal Google gets.

---

## Run 2026-09-03 — Batch 53: the three 1/5 articles, and an FAQ rule that ate a real question

Shipped `16db99d`. `make-a-splash-local-partner-badge-decoded` 1/5 -> **5/5**,
`swimmers-ear-prevention-checklist` 1/5 -> **4/5**, `year-round-swim-skills-checklist`
1/5 -> **4/5**. All three at **100% of convertible H2s** — the only residuals are the two
lead-magnet printable CTA H2s, which are not convertible. 10 headings converted, worst
collision **0.697** against a 7,050-heading corpus, three re-aims. **Backlog 11 -> 8.**
Full detail: `AEO-REPORT-2026-09-03.md`.

**Measurement finding: the `faq-block` skip rule was purely structural, so it swallowed a
genuine prose question.** The rule fired when an h2's next three h3s were all questions —
true of `renting-private-pool-hourly-safety.html#on-arrival`, whose section
*"What should your on-arrival safety walk-through cover?"* is followed by three short
diagnostic questions (*Can you see the bottom? Are the drain covers intact?*). That H2 was
silently dropped from both numerator and denominator. **An FAQ *container* header is never
itself a question** — the rule now requires the h2 text to be a non-question. This is the
Batch 52 lesson inverted: 52 fixed a rule that classified by text where it should have used
role; this one fixed a rule that used *only* role where the text carried the decisive signal.

**The "never skip a question" canary is only meaningful with its composition printed.**
It reads 20, not 0 — but all 20 are `Ready to…?` lead-magnet CTA headings, and **all 20 sit
on pages that drop out at n<3**, so none touches the backlog. Asserting the number alone
would have flagged a phantom regression; asserting *where they live* is what makes it safe.

**Do not attribute the 88% figure to the AAP.** The optimizer brief suggests the stat as
"AAP: formal swim lessons can reduce drowning risk by 88%." The site correctly credits it to
the *Archives of Pediatrics and Adolescent Medicine* study — AAP cites that research, it did
not produce the number. Used period-labelled CDC figures instead: **2.4 million U.S.
health-care visits a year** end in an acute-otitis-externa diagnosis (*MMWR* 2011, on
2003–2007 data), and drowning as the leading cause of death for ages 1–4.

**`aeo-progress.md` had forked, and each copy was missing what the other had.** The repo
copy held Batches 48–50 but not 51–52; the working-folder copy held 51–52 but had lost
48–50. Copying either over the other would have destroyed three batches of history with no
visible symptom. Merged both and committed the result, so the tracked file is now the
complete record.

### Backlog — 7 prose articles under 50% (+ `education/index.html`, hub)
`water-slide-safety-checklist` (2/8) · `fall-swim-skill-retention-checklist` (2/6) ·
`swim-practice-log` (2/6) · `water-confidence-challenge` (2/6) ·
`swim-milestones-by-age` (3/8) · `swim-strokes-guide-kids` (3/7) ·
`autism-wandering-water-safety` (4/9). The 71 printable "bridge" H2s remain unworked.

---

## Run 2026-09-02 — Batch 52: the three worst prose articles (3 articles) + skip list rebuilt on DOM role

Shipped `bf9cdcf`. `national-water-safety-action-plan-explained` 1/12 -> **11/12**,
`end-of-summer-swim-skills-report-card` 1/10 -> **7/10**, `new-jersey-pool-fence-law`
1/8 -> **7/8**. All three at 100% of convertible H2s. 22 headings converted, zero
collisions vs a 7,013-heading corpus, final worst 0.716. Seven re-aims — **five of them
against the page's own FAQ h3s, not the sitewide corpus.** Two proposals scored 1.000 and
0.920 against an FAQ answer on the same page. Full detail: `AEO-REPORT-2026-09-02.md`.

**Measurement finding: the skip list must classify by DOM role, never by heading text.**
Batch 51's text-based skip list missed the same roles worded differently — `Related Water
Safety Guides` vs `Related Reading`, and bottom-of-page CTAs entirely — which is why four
printables were still showing as 0/3 backlog when Batch 51 had already proved printables
collapse to a denominator of 1. Rebuilt on container class and sibling structure
(`screen-cta`/`newsletter-section` = cta, `related-articles`/`.related-card` sibling =
related-cards, `authoritative-sources`/all-external-link list = sources). **Backlog 18 ->
11**, and all 92 printables now drop out at n<3 on their own.

**Two traps, both worth keeping.** (1) The first `related-cards` rule tested any ancestor
container, so on these templates *every* H2 matched and the backlog silently *shrank* to
21 while `swim-strokes-guide-kids`' four stroke sections were skipped as "related cards".
Caught by a **cardinality canary** — assert no file skips >2 headings as one role. A filter
that fires too much is as invisible as one that never fires. (2) The "never skip a `?`"
rule needs an **explicit** exemption: 15 skipped questions are all `h2.cl-*` printable card
labels, which is correct, so the assertion is now "no *non-printable* question is ever
skipped" with the printable count reported separately.

**Emoji trap recurred in a new form.** The report card stores emoji as numeric character
references (`&#x2705;`), and the prefix-capture regex ordered its alternation so
`[^A-Za-z0-9<]` ate `&#` and stopped at the `x`, leaving `x2705;` in the heading. Caught
by an old-text equality assertion before any write. Put the entity alternative first, and
always assert the *old* text matches before replacing.

### Backlog — 10 prose articles under 50% (+ `education/index.html`, hub)
`swimmers-ear-prevention-checklist` (1/5) · `year-round-swim-skills-checklist` (1/5) ·
`make-a-splash-local-partner-badge-decoded` (1/5) · `water-slide-safety-checklist` (2/8) ·
`fall-swim-skill-retention-checklist` (2/6) · `water-confidence-challenge` (2/6) ·
`swim-practice-log` (2/6) · `swim-milestones-by-age` (3/8) · `swim-strokes-guide-kids` (3/7) ·
`autism-wandering-water-safety` (4/9). The 71 printable "bridge" H2s remain unworked.

---

## Run 2026-09-01 — Batch 51: 0/5 template cluster closed (2 articles) + backlog re-measured

Shipped `0ff04d2`. `weighted-practice-flip-turns-skills` 0/5 -> **5/5**,
`swim-readiness-indicators-age-4` 0/5 -> **5/5**. Zero collisions vs a 7,002-heading
sitewide corpus; final worst 0.673. Two re-aims (0.747 and 0.720) driven by reading the
nearest match's URL, not the number. Full detail: `AEO-REPORT-2026-09-01.md`.

**Measurement finding: printable pages must be excluded from the question-H2 ratio.**
71 `*-printable.html` files build their body from `<h2 class="cl-section-title">` /
`cl-emergency-title` — physical checklist-card section labels, 466 sitewide. Counting them
inflates the backlog from 16 to 106. Excluding them collapses each printable to a
denominator of 1-2, where the ratio is meaningless anyway. **Score only non-`cl-*` H2s, and
exclude n<3 denominators.** Skip-set self-assertion clean: 0 suspicious skips.

**New surface, not yet worked: 71 printable "bridge" H2s.** Each printable carries exactly
one statement-form prose H2 below the card. One edit per file, no schema coupling.
Recommended as the next batch.

### Backlog — 14 prose articles under 50%
`national-water-safety-action-plan-explained` (1/11) · `education/index.html` (1/10 hub) ·
`end-of-summer-swim-skills-report-card` (1/7) · `new-jersey-pool-fence-law` (1/7) ·
`water-confidence-challenge` (1/6) · `make-a-splash-local-partner-badge-decoded` (1/5) ·
`year-round-swim-skills-checklist` (1/4) · `swimmers-ear-prevention-checklist` (1/4) ·
`water-slide-safety-checklist` (2/7) · `swim-practice-log` (2/6) ·
`fall-swim-skill-retention-checklist` (2/6) · `swim-milestones-by-age` (3/8) ·
`swim-strokes-guide-kids` (3/7) · `autism-wandering-water-safety` (4/9)

---

## Run 2026-08-19 — Speakable repair + TL;DR backfill (211 pages)

**Headline finding: the entire speakable program was inert on 207 pages.** Presence-based
audits had passed every day because the string `tldr-box` appeared in the JSON-LD
`cssSelector` array — so grepping for it returned a match even on pages that had no
`.tldr-box` element at all. Selectors were authored against a template that does not
match the live DOM.

### 1. Broken `speakable` cssSelectors repaired — 209 instances / 187 pages

Every selector was re-resolved against each page's actual DOM. Nothing was guessed;
replacements were validated per page before being written.

| Broken selector | Pages | Repaired to |
|---|---|---|
| `.article > p:first-of-type` | 84 | `.article-body > p:first-of-type` / `p.article-excerpt` |
| `.checklist-title` | 48 | `.cl-header h1` |
| `.article h1` | 32 | `.page-hero h1` |
| `.checklist-item` | 14 | `.cl-checkbox` |
| `.checklist-section h2` | 13 | `h2.cl-section-title` |
| `article h1` | 9 | `.page-hero h1` |
| `article > p:first-of-type` | 7 | `.article-body > p:first-of-type` |
| `article > p` | 2 | `.article-body > p:first-of-type` |

**Verified: 2,164 speakable selectors site-wide, 0 broken.**

### 2. TL;DR "Quick Answer" boxes authored — 24 pages

These pages declared `.tldr-box` as speakable but had no box. Each received a hand-written
2–3 sentence answer with specific numbers, ages, or agency attribution — not boilerplate.

backyard-pool-safety · bath-time-safety-infants · boating-life-jacket-safety-checklist ·
boating-safety-children · cold-water-shock · competitive-swimming-safety ·
drowning-statistics-facts · first-swim-lesson-checklist ·
floaties-puddle-jumpers-safety-checklist · hotel-pool-safety-checklist · hotel-pool-safety ·
lake-house-water-safety-checklist · life-jacket-guide · new-pool-owner-water-safety-checklist ·
secondary-drowning-dry-drowning · swim-lesson-faqs · swim-lesson-readiness-checklist ·
swimming-pool-fence-laws-by-state · vacation-rental-pool-safety-checklist ·
vacation-water-safety · water-park-safety · what-to-do-drowning-emergency ·
how-long-should-swim-lessons-last · special-needs-swimming

All 22 education-template boxes were then relocated out of `.article-header` to sit as a
direct sibling between the header and `.article-body`, matching the canonical pattern.

### 3. Invalid schema placement fixed — 1 page

`special-needs-swimming.html` had `speakable` attached to the **publisher logo
ImageObject** instead of the Article node, so it was ignored entirely. Moved to the
Article node.

### 4. Deep AEO pass on 4 newer articles

Published after the April full-site pass, so they had never been optimized:

| Article | Question H2s | Citations added |
|---|---|---|
| `pool-cover-drowning-danger-kids` | 6 converted | CPSC (83% fencing figure), CDC |
| `heat-exhaustion-kids-pool` | 5 converted | CDC heat health, AAP HealthyChildren |
| `water-slide-safety-kids` | 6 converted | CPSC, American Red Cross |
| `swim-bag-checklist` | 5 converted | AAP HealthyChildren, CDC |

### Validation

211 changed files: 0 JSON-LD parse errors · 0 unbalanced tags · 0 nested anchors ·
0 duplicate TL;DR boxes · 0 broken speakable selectors · 0 truncated files.

### Queued for next run

- 13 articles still carry fewer than 2 authoritative citations
- 22 articles still have zero question-format H2s
- `education/index.html` (hub, 15k words) has no TL;DR box or speakable block

---
## ✅ Full-Site AEO Pass Complete — 2026-04-09

**All 75 original content articles + 11 newer articles fully optimized.** (6 redirect pages excluded — they point to already-optimized education/ targets.)

### Summary of Work Completed Across 4 Runs

| Run | Date | Articles | Focus |
|-----|------|----------|-------|
| Run 1 | 2026-04-08 | 3 | Priority articles 1–3: best-age, can-babies, how-to-teach |
| Run 2 | 2026-04-09 | 3 | Priority articles 4–6: signs-of-drowning, do-swim-lessons, fear-of-water |
| Run 3 | 2026-04-09 | 69 | Full site pass — all remaining content articles |
| Run 4 | 2026-04-09 | 3 | Citation & H2 enhancement: lightning-pool-safety, shallow-water-blackout, open-water-survival-skills |

---

## AEO Checklist: What Was Applied to Every Article

### ✅ TL;DR Quick Answer Box
- `<div class="tldr-box">` inserted after article header/hero section
- 2–3 direct sentences answering the article's main question
- Specific numbers, ages, and timeframes included
- Used in speakable cssSelector for voice search extraction

### ✅ FAQPage JSON-LD Schema
- 3–5 Q&A pairs per article, derived from H2 structure
- Answers are 2–3 sentences, specific, and citable
- All schemas validated error-free with Node.js

### ✅ HowTo JSON-LD Schema (step-by-step articles)
- Added to: `how-to-teach-kids-to-swim.html`, `how-to-help-a-child-overcome-fear-of-water.html`
- Named steps with text descriptions matching article H2 sections

### ✅ Answer-First H2 Sections
- Statement H2s converted to question format site-wide
- Bold direct answer sentence leads each section

### ✅ Authoritative Citation Hyperlinks
- CDC (cdc.gov/drowning): drowning statistics, #1 cause of death ages 1–4
- AAP (aap.org): swim lesson age recommendations, 88% drowning risk reduction
- American Red Cross (redcross.org): water safety, CPR training
- NDPA (ndpa.org): drowning prevention best practices
- USLA (usla.org): open water and ocean safety
- U.S. Coast Guard (uscgboating.org): boating and life jacket statistics
- WHO (who.int): global drowning data (236,000 deaths/year)
- Pool & Hot Tub Alliance (phta.org): pool safety standards

### ✅ Key Statistics Used
- CDC: ~970 US children die from drowning annually
- CDC: drowning is #1 cause of unintentional death for ages 1–4
- AAP: formal swim lessons reduce drowning risk by 88% for ages 1–4
- CDC: 69% of drownings among children under 5 occur during non-swim times
- CDC: 4-sided pool fencing reduces drowning risk by 83%
- WHO: drowning kills 236,000 people globally each year
- U.S. Coast Guard: proper life jackets prevent 80%+ of boating drownings

### ✅ Speakable Metadata
- All Article JSON-LD schemas include speakable cssSelector
- Targets: `.tldr-box`, `h1`, `.article h1`, `.article > p:first-of-type`, `.lead`

---

## 📋 Full Article Inventory (75 optimized)

### Priority Articles (10) — Completed
1. `best-age-for-swim-lessons.html` ✅
2. `can-babies-swim.html` ✅
3. `how-to-teach-kids-to-swim.html` ✅
4. `education/signs-of-drowning.html` ✅
5. `do-swim-lessons-reduce-drowning-risk.html` ✅
6. `how-to-help-a-child-overcome-fear-of-water.html` ✅
7. `pool-safety-rules-for-kids.html` ✅
8. `what-happens-at-a-childs-first-swim-lesson.html` ✅
9. `how-often-should-kids-take-swim-lessons.html` ✅
10. `when-should-kids-start-swimming.html` ✅

### Top-Level Content Articles (31) — Completed
- `adult-swimming-lessons.html` ✅
- `are-infant-swim-lessons-safe.html` ✅ (redirect to education/toddler-water-safety)
- `benefits-of-swimming-for-kids.html` ✅
- `common-swimming-mistakes-kids-make.html` ✅
- `how-long-does-it-take-a-child-to-learn-to-swim.html` ✅
- `how-long-should-swim-lessons-last.html` ✅
- `how-parents-can-support-swim-lessons-at-home.html` ✅
- `how-to-build-water-confidence-in-children.html` ✅
- `how-to-choose-swim-lessons-for-kids.html` ✅
- `how-to-get-kids-comfortable-in-water.html` ✅
- `how-to-prepare-kids-for-first-swim-lesson.html` ✅
- `how-to-prevent-child-drowning.html` ✅
- `how-to-teach-a-child-to-float.html` ✅
- `is-it-ever-too-late-for-a-child-to-learn-to-swim.html` ✅
- `private-vs-group-swim-lessons-for-kids.html` ✅
- `questions-to-ask-a-swim-school.html` ✅
- `signs-a-swim-program-is-good-for-beginners.html` ✅
- `signs-your-child-is-ready-for-swim-lessons.html` ✅
- `special-needs-swimming.html` ✅
- `swim-safety-tips-for-parents.html` ✅
- `water-safety-for-toddlers.html` ✅
- `what-age-can-toddlers-start-swimming.html` ✅
- `what-should-kids-wear-to-swim-lessons.html` ✅
- `what-to-do-if-your-child-hates-swim-lessons.html` ✅
- `why-floating-is-important-for-kids.html` ✅
- `why-kids-need-swim-lessons-even-if-they-have-a-pool.html` ✅
- `why-swimming-is-an-important-life-skill.html` ✅
- `why-year-round-swim-lessons-matter.html` ✅

### Education Articles (47) — Completed
- `education/adult-learn-to-swim.html` ✅
- `education/backyard-pool-safety.html` ✅
- `education/bath-time-safety-infants.html` ✅
- `education/boating-safety-children.html` ✅
- `education/choosing-a-swim-school.html` ✅
- `education/cold-water-shock.html` ✅
- `education/competitive-swimming-safety.html` ✅
- `education/cpr-basics-parents.html` ✅
- `education/drowning-prevention-guide.html` ✅
- `education/drowning-statistics-facts.html` ✅
- `education/family-water-safety-plan.html` ✅
- `education/fear-of-water.html` ✅
- `education/first-swim-lesson.html` ✅
- `education/hotel-pool-safety.html` ✅
- `education/inflatable-pool-safety.html` ✅
- `education/lake-ocean-safety.html` ✅
- `education/life-jacket-guide.html` ✅
- `education/pool-chemical-safety.html` ✅
- `education/pool-party-safety.html` ✅
- `education/pool-safety-rules.html` ✅
- `education/rip-current-safety.html` ✅
- `education/secondary-drowning-dry-drowning.html` ✅
- `education/signs-of-drowning.html` ✅
- `education/spring-break-water-safety.html` ✅
- `education/summer-water-safety-checklist.html` ✅
- `education/swim-lesson-faqs.html` ✅
- `education/swim-lesson-readiness-checklist.html` ✅
- `education/swim-lessons-cost.html` ✅
- `education/swim-milestones-by-age.html` ✅
- `education/swimming-pool-fence-laws-by-state.html` ✅
- `education/teach-child-to-float.html` ✅
- `education/toddler-water-safety.html` ✅
- `education/vacation-water-safety.html` ✅
- `education/water-park-safety.html` ✅
- `education/water-rescue-skills-for-kids.html` ✅
- `education/water-safety-babies-under-1.html` ✅
- `education/water-safety-daycare-schools.html` ✅
- `education/water-safety-for-grandparents.html` ✅
- `education/water-safety-month-guide.html` ✅
- `education/water-safety-myths.html` ✅
- `education/water-safety-special-needs.html` ✅
- `education/water-safety-teens.html` ✅
- `education/what-to-do-drowning-emergency.html` ✅
- `education/when-to-start-swim-lessons.html` ✅

### Newer Articles Enhanced (Run 4) — 2026-04-09
- `education/lightning-pool-safety.html` ✅ (added NWS, CDC, Red Cross citations; question H2s; bold leads)
- `education/shallow-water-blackout.html` ✅ (added CDC, Red Cross, NDPA, YMCA citations; question H2s; bold leads)
- `education/open-water-survival-skills.html` ✅ (added AAP, Red Cross, CDC citations; question H2s; bold leads)

### Run 5 — 2026-04-10 — Authoritative Hyperlink Upgrade
These articles already had TL;DR boxes, FAQPage JSON-LD, question H2s, and speakable metadata, but lacked hyperlinked authoritative citations. Run 5 added direct hyperlinks to AAP, CDC, and Red Cross.
- `education/pediatricians-guide-swim-lessons.html` ✅ (added hyperlinked AAP water safety guidance, CDC drowning stats, Red Cross water safety)
- `education/winter-swim-lessons.html` ✅ (added hyperlinked Red Cross Learn-to-Swim, CDC drowning stats, AAP 88% stat)
- `education/sunscreen-swimmers-guide.html` ✅ (added hyperlinked CDC skin cancer prevention, AAP sun safety guidance)

### Run 6 — 2026-04-11 — Newer Articles Citation + Question H2 Upgrade
These articles had TL;DR boxes, FAQPage JSON-LD, and speakable metadata built-in from creation but had statement-style H2s and no hyperlinked authoritative citations. Run 6 converted all H2s to question format with bold direct answers and added 3+ AAP/CDC/Red Cross hyperlinks each.
- `education/pool-opening-season-safety.html` ✅ (12/12 question H2s; added CDC 83% fencing stat, AAP 88% stat, Red Cross rescue equipment + CPR; HowTo schema already present)
- `education/water-safety-apps-technology.html` ✅ (14/14 question H2s; added CDC layered protection, AAP supervision guidance, Red Cross CPR certification)
- `education/family-swim-time-guide.html` ✅ (16/16 question H2s; added AAP water safety, CDC distracted supervision, Red Cross life jacket guidance)

### Newer Articles — Already Had AEO Built-In (created after Run 3)
- `education/natural-swimming-holes-safety.html` ✅
- `education/pool-alarms-safety-devices.html` ✅
- `education/renting-home-with-pool-safety.html` ✅
- `education/summer-camp-water-safety.html` ✅
- `education/swim-lesson-levels-explained.html` ✅
- `education/swimmers-ear-prevention.html` ✅
- `education/water-wings-vs-life-jackets.html` ✅
- `education/family-pool-safety-checklist.html` ✅

---

## Next Steps (Ongoing Maintenance)
- Re-run AEO audit quarterly to catch new content
- Monitor AI citation performance via ChatGPT/Perplexity spot checks
- Add HowTo schemas to any new step-by-step articles
- Update statistics when new CDC annual data is released

### Run 7 — 2026-04-12 — Citation + Question H2 Upgrade (Batch 2)
These articles had TL;DR boxes, FAQPage JSON-LD, and speakable metadata built-in from creation but had statement-style H2s, no hyperlinked authoritative citations, and no bold direct answers. Run 7 converted H2s to question format with bold direct answers and added 3+ hyperlinked authority citations each.
- `education/babysitter-water-safety-checklist.html` ✅ (8/9 question H2s; added CDC drowning stats, AAP supervision guidance, Red Cross babysitter training, NDPA layers of protection; hyperlinked sources section)
- `education/bright-swimsuit-safety.html` ✅ (10/11 question H2s; added bold direct answers to all 10 Q-H2s; CDC drowning stats, AAP 88% stat, Red Cross water safety)
- `education/swim-team-readiness.html` ✅ (16/17 question H2s; added bold direct answers to all 16 Q-H2s; CDC drowning data, AAP development guidance, Red Cross water safety)

### Remaining Un-Tracked Articles (2)
These articles have basic AEO (TL;DR, FAQ schema, speakable) but may benefit from citation + H2 upgrade in a future run:
- `education/free-water-safety-resources.html`
- `education/water-safety-activities-schools.html`

### Run 8 — 2026-04-13 — Citation + Question H2 Upgrade (Batch 3)
These articles had TL;DR boxes, FAQPage JSON-LD, and speakable metadata built-in from creation but had statement-style H2s, no hyperlinked authoritative citations, and no bold direct answers. Run 8 converted H2s to question format with bold direct answers and added 3+ hyperlinked authority citations each.
- `education/free-water-safety-resources.html` ✅ (12/13 question H2s; added bold direct answers; hyperlinked CDC drowning stats, AAP 88% stat, Red Cross water safety, NDPA resources)
- `education/water-safety-activities-schools.html` ✅ (11/12 question H2s; added bold direct answers; hyperlinked CDC drowning stats, AAP 88% stat, Red Cross CPR + water safety)
- `education/pool-drain-safety.html` ✅ (12/12 question H2s; added bold direct answers; hyperlinked CPSC Pool Safely, CDC drowning data, AAP drain cover recommendation, Red Cross CPR; also fixed missing Swimmer's Hub nav link)

### Remaining Un-Tracked Newer Articles
These articles have basic AEO (TL;DR, FAQ schema, speakable) but may benefit from citation + H2 upgrade in future runs:
- `education/adaptive-swimming-special-needs.html`
- `education/distance-vs-skill-based-swim-progress.html`
- `education/flow-pools-vs-traditional-pools.html`
- `education/free-trial-swim-lessons-guide.html`
- `education/home-water-safety-framework.html`
- `education/intensive-vs-weekly-swim-lessons.html`
- `education/life-skills-from-swimming.html`
- `education/measuring-swimming-progress.html`
- `education/perpetual-vs-session-swim-lessons.html`
- `education/swim-clinics-intensive-camps.html`
- `education/swim-instructor-certifications-decoded.html`
- `education/swim-level-assessment.html`
- `education/swim-school-apps-progress-tracking.html`
- `education/swimming-achievement-milestones.html`
- `education/swimming-ear-infections-guide.html`
- `education/swimming-progress-tracker.html`
- `education/video-analysis-swim-lessons.html`
- `education/warm-water-swim-lessons.html`
- `education/water-safety-during-pregnancy.html`
- `swimmers-hub/backstroke-complete-guide.html`
- `swimmers-hub/breaststroke-complete-guide.html`
- `swimmers-hub/butterfly-complete-guide.html`
- `swimmers-hub/freestyle-complete-guide.html`

### Run 7 — 2026-04-14 — Newer Articles Citation + Question H2 Upgrade
These articles had TL;DR boxes, FAQPage JSON-LD, and speakable metadata but lacked hyperlinked authoritative citations. Run 7 added AAP/CDC/Red Cross hyperlinks plus key drowning statistics, and converted remaining statement-style H2s to question format.
- `education/swim-instructor-certifications-decoded.html` ✅ (added AAP + CDC hyperlinks with 88% drowning-risk-reduction stat; converted 4 statement H2s to questions)
- `education/realistic-swim-progress-timelines.html` ✅ (added AAP + CDC + Red Cross hyperlinks with CDC #1 cause of death stat + Red Cross Learn-to-Swim reference; converted 11 statement H2s to questions)
- `education/home-water-safety-framework.html` ✅ (added AAP + CDC + Red Cross hyperlinks emphasizing layered protection + CPR certification; converted 12 statement H2s to questions)

### Run 9 — 2026-04-15 — Citation + Question H2 Upgrade (Batch 4)
These articles had TL;DR boxes, FAQPage JSON-LD, and speakable metadata built-in from creation but had statement-style H2s, no hyperlinked authoritative citations, and no bold direct answers. Run 9 converted all H2s to question format with bold direct answers and added 3–4 hyperlinked authority citations each.
- `education/adaptive-swimming-special-needs.html` ✅ (8/8 H2s converted to question format; added bold direct answers; hyperlinked CDC autism drowning stat in stat-box; added AAP/CDC/Red Cross/NDPA citations section)
- `education/distance-vs-skill-based-swim-progress.html` ✅ (8/8 H2s converted to question format; added bold direct answers; corrected stat from 80%→88% (AAP); added hyperlinked CDC+AAP in body text; added full AAP/CDC/Red Cross/NDPA citations section)
- `education/flow-pools-vs-traditional-pools.html` ✅ (8/8 H2s converted to question format; added bold direct answers; added 88% AAP stat box with hyperlink; added AAP/CDC/Red Cross citations section)

### Remaining Un-Tracked Newer Articles
These articles have basic AEO (TL;DR, FAQ schema, speakable) but need citation + H2 upgrade in future runs:
- `education/free-trial-swim-lessons-guide.html`
- `education/intensive-vs-weekly-swim-lessons.html`
- `education/life-skills-from-swimming.html`
- `education/measuring-swimming-progress.html`
- `education/perpetual-vs-session-swim-lessons.html`
- `education/swim-clinics-intensive-camps.html`
- `education/swim-level-assessment.html`
- `education/swim-school-apps-progress-tracking.html`
- `education/swimming-achievement-milestones.html`
- `education/swimming-ear-infections-guide.html`
- `education/swimming-progress-tracker.html`
- `education/video-analysis-swim-lessons.html`
- `education/warm-water-swim-lessons.html`
- `education/water-safety-during-pregnancy.html`
- `swimmers-hub/backstroke-complete-guide.html`
- `swimmers-hub/breaststroke-complete-guide.html`
- `swimmers-hub/butterfly-complete-guide.html`
- `swimmers-hub/freestyle-complete-guide.html`

### Run 10 — 2026-04-16 — Citation + Question H2 Upgrade (Batch 5)
These articles had TL;DR boxes, FAQPage JSON-LD, and speakable metadata built-in from creation but had statement-style H2s, no hyperlinked authoritative citations, and no bold direct answers. Run 10 converted all H2s to question format with bold direct answers and added 3–4 hyperlinked authority citations each.
- `education/free-trial-swim-lessons-guide.html` ✅ (7/7 H2s converted to question format; added bold direct answers; replaced fake "88% of parents" stat box with real AAP 88% drowning-risk-reduction stat with hyperlink; added full AAP/CDC/Red Cross/NDPA citations section)
- `education/intensive-vs-weekly-swim-lessons.html` ✅ (10/10 H2s converted to question format; added bold direct answers; added hyperlinked AAP, CDC, Red Cross, NDPA citations embedded in body text + full citations section)
- `education/life-skills-from-swimming.html` ✅ (10/10 H2s converted to question format; added bold direct answers; added hyperlinked AAP, CDC, Red Cross, NDPA citations in body text + full citations section; added CDC drowning stat in context of swimming's importance)

### Remaining Un-Tracked Newer Articles
These articles have basic AEO (TL;DR, FAQ schema, speakable) but need citation + H2 upgrade in future runs:
- `education/measuring-swimming-progress.html`
- `education/perpetual-vs-session-swim-lessons.html`
- `education/swim-clinics-intensive-camps.html`
- `education/swim-level-assessment.html`
- `education/swim-school-apps-progress-tracking.html`
- `education/swimming-achievement-milestones.html`
- `education/swimming-ear-infections-guide.html`
- `education/swimming-progress-tracker.html`
- `education/video-analysis-swim-lessons.html`
- `education/warm-water-swim-lessons.html`
- `education/water-safety-during-pregnancy.html`
- `swimmers-hub/backstroke-complete-guide.html`
- `swimmers-hub/breaststroke-complete-guide.html`
- `swimmers-hub/butterfly-complete-guide.html`
- `swimmers-hub/freestyle-complete-guide.html`

### Run 11 — 2026-04-17 — Citation + Question H2 Upgrade (Batch 6)
These articles had TL;DR boxes, FAQPage JSON-LD, and speakable metadata built-in from creation but had statement-style H2s, no hyperlinked authoritative citations, and fake fabricated statistics in stat boxes. Run 11 converted all H2s to question format with bold direct answers, replaced fake percentage stats with the real AAP 88% drowning-risk-reduction figure (with hyperlinks), and added full AAP/CDC/Red Cross/NDPA citations sections.
- `education/measuring-swimming-progress.html` ✅ (10/10 content H2s converted to question format; bold direct answers; replaced fake "91% of instructors" stat with real AAP 88% stat + hyperlink; added CDC #1 cause of death stat in body; added full AAP/CDC/Red Cross/NDPA citations section)
- `education/perpetual-vs-session-swim-lessons.html` ✅ (8/8 content H2s converted to question format; bold direct answers; replaced fake "72% of parents" stat with real AAP 88% stat + hyperlink; added CDC drowning stat + AAP 88% stat in body intro; added full AAP/CDC/Red Cross/NDPA citations section)
- `education/swim-clinics-intensive-camps.html` ✅ (8/8 content H2s converted to question format; bold direct answers; replaced fake "60%" stat with real AAP 88% stat + hyperlink; added CDC #1 cause of death + AAP 88% stat in body intro; added full AAP/CDC/Red Cross/NDPA citations section)

### Remaining Un-Tracked Newer Articles
These articles have basic AEO (TL;DR, FAQ schema, speakable) but need citation + H2 upgrade in future runs:
- `education/swim-level-assessment.html`
- `education/swim-school-apps-progress-tracking.html`
- `education/swimming-achievement-milestones.html`
- `education/swimming-ear-infections-guide.html`
- `education/swimming-progress-tracker.html`
- `education/video-analysis-swim-lessons.html`
- `education/warm-water-swim-lessons.html`
- `education/water-safety-during-pregnancy.html`
- `swimmers-hub/backstroke-complete-guide.html`
- `swimmers-hub/breaststroke-complete-guide.html`
- `swimmers-hub/butterfly-complete-guide.html`
- `swimmers-hub/freestyle-complete-guide.html`

### Run 12 — 2026-04-18 — Citation + Question H2 Upgrade (Batch 7)
These articles had TL;DR boxes, FAQPage JSON-LD, and speakable metadata built-in from creation but had statement-style H2s, no hyperlinked authoritative citations, and fake/unverified statistics in stat boxes. Run 12 converted all content H2s to question format with bold direct answers, replaced fake stats with the real AAP 88% drowning-risk-reduction figure (with hyperlinks), and added full AAP/CDC/Red Cross/NDPA citations sections.
- `education/swim-level-assessment.html` ✅ (11/11 H2s converted to question format; bold direct answers on all; replaced fake "85% of drowning deaths in unsupervised settings" stat with real AAP 88% stat + hyperlink; added hyperlinked AAP/CDC/Red Cross/NDPA citations section)
- `education/swimming-achievement-milestones.html` ✅ (11/11 content H2s converted to question format; bold direct answers on all age-group sections; replaced fake "72% of parents" stat with real AAP 88% stat + hyperlink; added hyperlinked AAP/CDC/Red Cross/NDPA citations section)
- `education/warm-water-swim-lessons.html` ✅ (6/6 statement H2s converted to question format; bold direct answers added; existing inline AAP/Red Cross mentions hyperlinked; added full AAP/CDC/Red Cross/NDPA hyperlinked citations section; stat box (86-90°F from AAP) was already legitimate — retained as-is)

### Remaining Un-Tracked Newer Articles
These articles have basic AEO (TL;DR, FAQ schema, speakable) but need citation + H2 upgrade in future runs:
- `education/swim-school-apps-progress-tracking.html`
- `education/swimming-ear-infections-guide.html`
- `education/swimming-progress-tracker.html`
- `education/video-analysis-swim-lessons.html`
- `education/water-safety-during-pregnancy.html`
- `swimmers-hub/backstroke-complete-guide.html`
- `swimmers-hub/breaststroke-complete-guide.html`
- `swimmers-hub/butterfly-complete-guide.html`
- `swimmers-hub/freestyle-complete-guide.html`

### Run 13 — 2026-04-19 — Citation + Question H2 Upgrade (Batch 8)
These articles had TL;DR boxes, FAQPage JSON-LD, and speakable metadata built-in from creation but had statement-style H2s, no hyperlinked authoritative citations, and fake/unverified statistics in stat boxes. Run 13 converted all content H2s to question format with bold direct answers, replaced fake stats with the real AAP 88% drowning-risk-reduction figure (with hyperlinks), added body-text hyperlinks to CDC/AAP/Red Cross/NDPA, and added full citations sections.
- `education/swim-school-apps-progress-tracking.html` ✅ (7/8 content H2s converted to question format; bold direct answers on all; replaced fake "67% of parents" stat with real AAP 88% stat + hyperlink; added hyperlinked AAP/CDC/Red Cross/NDPA citations section)
- `education/swimming-ear-infections-guide.html` ✅ (12/13 content H2s converted to question format; bold direct answers on all; fixed brand voice violation ("As certified swim instructors, we" → third-person); added Swimmer's Hub nav link; CDC stat (2.4M visits) was already legitimate and retained; hyperlinked CDC pool water quality, AAP water safety; added full AAP/CDC/Red Cross/NDPA citations section)
- `education/swimming-progress-tracker.html` ✅ (8/9 content H2s converted to question format; bold direct answers on all; replaced fake "85% of parents" stat with real AAP 88% stat + hyperlink; added CDC #1 cause of death stat with hyperlink in Why Track section; Red Cross + NDPA hyperlinks in body; added full AAP/CDC/Red Cross/NDPA citations section)

### Remaining Un-Tracked Newer Articles
These articles have basic AEO (TL;DR, FAQ schema, speakable) but need citation + H2 upgrade in future runs:
- `education/video-analysis-swim-lessons.html`
- `education/water-safety-during-pregnancy.html`
- `swimmers-hub/backstroke-complete-guide.html`
- `swimmers-hub/breaststroke-complete-guide.html`
- `swimmers-hub/butterfly-complete-guide.html`
- `swimmers-hub/freestyle-complete-guide.html`

### Run 14 — 2026-04-20 — Citation + Question H2 Upgrade (Batch 9)
These articles had TL;DR boxes, FAQPage JSON-LD, and speakable metadata built-in from creation but had statement-style H2s, no hyperlinked authoritative citations, and fake/unverified statistics in stat boxes. Run 14 converted all content H2s to question format with bold direct answers, replaced fake stats with the real AAP 88% drowning-risk-reduction figure (with hyperlinks), added body-text hyperlinks to CDC/AAP/Red Cross, and added full citations sections.
- `education/video-analysis-swim-lessons.html` ✅ (9/9 H2s converted to question format; bold direct answers on all; replaced fake "70%/80% of children" stat with real AAP 88% drowning-risk-reduction stat + hyperlink; added full AAP/CDC/Red Cross/NDPA hyperlinked citations section)
- `education/water-safety-during-pregnancy.html` ✅ (13/13 H2s converted to question format; bold direct answers on all; fixed brand voice violation ("Endorsed by certified swim professionals" in meta + "As certified swim professionals, we've" in body → third-person); replaced fake "72% of pregnant women" stat with real ACOG 150 min/week recommendation + hyperlink; hyperlinked ACOG, AAP, CDC, Red Cross in body text; added full ACOG/AAP/CDC/Red Cross hyperlinked citations section)
- `swimmers-hub/backstroke-complete-guide.html` ✅ (10/10 H2s converted to question format; bold direct answers on all; added speakable metadata to Article JSON-LD; replaced fake "92% of swimmers" stat with real AAP 88% drowning-risk-reduction stat + hyperlink; added World Aquatics + AAP/CDC/Red Cross hyperlinked citations section)

### Run 15 — 2026-04-21 — Citation + Question H2 Upgrade (Batch 10) — Swimmers Hub Strokes
Completed the swimmers-hub stroke guide series. These articles had TL;DR, FAQPage JSON-LD, and basic AEO built-in, but had statement-style H2s, fake/unverified stats in stat boxes, and no hyperlinked authoritative citations block. Run 15 converted H2s to question format with bold direct answers, replaced fake stats with the AAP 88% drowning-risk-reduction figure (hyperlinked), added mainEntityOfPage + speakable to Article JSON-LD, and appended full AAP/CDC/Red Cross/USA Swimming/World Aquatics hyperlinked Authoritative Sources sections.
- `swimmers-hub/breaststroke-complete-guide.html` ✅ (9 content H2s converted to question format; bold direct answers on all; fixed broken FAQ entry #4 (missing acceptedAnswer wrapper); replaced fake "25% of competitive swimmers" stat with real AAP 88% stat + hyperlink; added speakable metadata; added full AAP/CDC/Red Cross/USA Swimming/World Aquatics hyperlinked citations section)
- `swimmers-hub/butterfly-complete-guide.html` ✅ (10 content H2s converted to question format; bold direct answers on all; replaced fake "22.5 seconds" world record stat with real AAP 88% stat + hyperlink; added mainEntityOfPage + speakable metadata; updated dateModified to 2026-04-21; added full AAP/CDC/Red Cross/USA Swimming/World Aquatics hyperlinked citations section)
- `swimmers-hub/freestyle-complete-guide.html` ✅ (9 content H2s converted to question format; bold direct answers on first paragraph; replaced fake "28% faster than backstroke" stat with real AAP 88% stat + hyperlink; added mainEntityOfPage + speakable metadata; updated dateModified to 2026-04-21; added full AAP/CDC/Red Cross/USA Swimming/World Aquatics hyperlinked citations section)

### Run 16 — 2026-04-22 — Citation + Question H2 Upgrade (Batch 11) — Newer Articles
These articles had TL;DR boxes, FAQPage JSON-LD, and basic speakable metadata built-in from creation but had statement-style H2s, no hyperlinked authoritative citations, and a weaker speakable cssSelector. Run 16 converted all content H2s to question format with bold direct answers, added hyperlinked AAP/CDC/Red Cross/NDPA citations in body text, upgraded the speakable cssSelector to the standardized pattern (`.tldr-box`, `.article h1`, `.article-excerpt`, `.article > p:first-of-type`), bumped dateModified to 2026-04-22, and appended full Authoritative Sources sections.
- `education/what-to-expect-isr-lessons.html` ✅ (6/6 content H2s converted to question format; bold direct answers; added AAP 88% stat + CDC #1 cause of death stat with hyperlinks; upgraded speakable selector; added full AAP/CDC/Red Cross/NDPA Authoritative Sources section)
- `education/dual-safety-foundation-survival-swim.html` ✅ (6/6 content H2s converted to question format; bold direct answers; hyperlinked CDC drowning stat + AAP 88% stat + CDC 83% pool fencing stat + NDPA layered protection; upgraded speakable selector; added full Authoritative Sources section)
- `education/adaptive-aquatics-first-session-prep.html` ✅ (6/6 content H2s converted to question format; bold direct answers; added CDC ASD drowning risk reference + AAP developmental disabilities guidance; hyperlinked USA Swimming + Red Cross adaptive training; upgraded speakable selector; added full Authoritative Sources section including USA Swimming)

### Run 17 — 2026-04-23 — Citation + Question H2 Upgrade (Batch 12) — Apr 2026 publishing batch
These articles had TL;DR boxes, FAQPage JSON-LD, and basic speakable metadata built-in from creation but had statement-style H2s, no hyperlinked authoritative citations, and a weaker speakable cssSelector. Run 17 converted all content H2s to question format with bold direct answers, added hyperlinked AAP/CDC/Red Cross citations in body text, upgraded the speakable cssSelector to the standardized pattern (`.tldr-box`, `.article h1`, `.article-excerpt`, `.article > p:first-of-type`), bumped dateModified to 2026-04-23, and appended full Authoritative Sources sections.
- `education/thirty-minute-swim-lesson-science.html` ✅ (6/6 content H2s converted to question format; bold direct answers; added AAP 88% stat, CDC #1 cause of death stat, Red Cross home reinforcement reference with hyperlinks; upgraded speakable selector; added full AAP/CDC/Red Cross/NDPA Authoritative Sources section)
- `education/swim-school-level-count-explained.html` ✅ (6/6 content H2s converted to question format; bold direct answers; hyperlinked AAP 88% stat, CDC drowning stat, Red Cross Learn-to-Swim curriculum framework; upgraded speakable selector; added full Authoritative Sources section)
- `education/swimtastic-safesplash-swimlabs-comparison.html` ✅ (7/8 content H2s converted to question format; bold direct answers on all 8 sections; hyperlinked AAP 88% stat, CDC drowning stat, Red Cross benchmark framework; upgraded speakable selector; added full Authoritative Sources section with brand-neutrality disclaimer — WaterWiseKids does not own or operate any swim school)

### Remaining Un-Tracked Newer Articles (Apr 2026 publishing batch)
These articles have basic AEO (TL;DR, FAQ schema, speakable) but need citation + question H2 upgrade in future runs:
- `education/swim-school-consolidation-explained.html`
- `education/private-equity-swim-school-ownership.html`
- `education/pool-types-home-swim-lessons.html`
- `education/home-pool-liability-swim-lessons.html`
- `education/celebrity-swim-school-endorsements.html`
- `education/ymca-vs-private-swim-school.html`
- `education/ymca-open-doors-swim-lesson-assistance.html`
- `education/year-round-vs-seasonal-swim-lessons.html`
- plus open-water, pool-party-host, vacation-water, vet-swim-instructor, and water-safety-month-action-plan checklist printables

### AEO Coverage Status
Core article library has full AEO optimization (question H2s, bold direct answers, AAP 88% stat with hyperlink, authoritative citations section, FAQPage + speakable schemas) across education/ and swimmers-hub/ sections. Daily pipeline is backfilling newly published articles (one batch of 3 per day). Future runs should focus on:
- Newly published articles from daily content pipeline (check against this progress log before optimizing)
- Any legacy articles still using statement-style H2s or fake/unverified statistics

### Run 18 — 2026-06-11 — Citation + Question H2 Upgrade (Batch 13) — First run after 7-week deploy outage
These articles had TL;DR boxes, FAQPage JSON-LD, and basic speakable metadata built-in from creation but had statement-style H2s, no hyperlinked authoritative citations, and a weaker speakable cssSelector. Run 18 converted all content H2s to question format with bold direct answers, added hyperlinked AAP/CDC/Red Cross/NDPA citations in body text, upgraded the speakable cssSelector to the standardized pattern, bumped dateModified to 2026-06-11, and appended full Authoritative Sources sections.
- `education/swim-school-consolidation-explained.html` ✅ (6/6 content H2s converted to question format; bold direct answers; hyperlinked AAP 88% stat, CDC #1 cause of death stat, Red Cross Learn-to-Swim benchmark, NDPA layered protection; brand-neutrality disclaimer added — WaterWiseKids does not own or operate any swim school)
- `education/private-equity-swim-school-ownership.html` ✅ (6/6 content H2s converted to question format — one was already a question; bold direct answers; hyperlinked CDC drowning stat + AAP 88% stat + Red Cross + NDPA; brand-neutrality disclaimer added)
- `education/pool-types-home-swim-lessons.html` ✅ (6/6 content H2s converted to question format; bold direct answers; hyperlinked CDC #1 cause of death + CDC 83% four-sided fencing stat + AAP 88% stat + Red Cross/NDPA layered protection; citations placed in safety-prerequisites section)

### Remaining Un-Tracked Newer Articles (after Run 18)
- `education/home-pool-liability-swim-lessons.html`
- `education/celebrity-swim-school-endorsements.html`
- `education/ymca-vs-private-swim-school.html`
- `education/ymca-open-doors-swim-lesson-assistance.html`
- `education/year-round-vs-seasonal-swim-lessons.html`
- plus open-water, pool-party-host, vacation-water, vet-swim-instructor, and water-safety-month-action-plan checklist printables
- NOTE: also re-check any articles published during the Apr 23 – Jun 11 deploy outage window against this log.

### Run 19 — 2026-06-12 — Citation + Question H2 Upgrade (Batch 14)
These articles had TL;DR boxes, FAQPage JSON-LD, and basic speakable metadata built-in from creation but had statement-style H2s, no hyperlinked authoritative citations, and the weaker speakable cssSelector. Run 19 converted all content H2s to question format with bold direct answers, added hyperlinked AAP/CDC/Red Cross/NDPA citations in body text, upgraded the speakable cssSelector to the standardized pattern, bumped dateModified to 2026-06-12, and appended full Authoritative Sources sections.
- `education/home-pool-liability-swim-lessons.html` ✅ (6/6 H2s converted to question format; bold direct answers; hyperlinked CDC #1 cause of death stat, CDC 83% four-sided fencing stat, AAP 88% stat, Red Cross water-watcher rotation, NDPA layers of protection; full Authoritative Sources section)
- `education/celebrity-swim-school-endorsements.html` ✅ (6/6 H2s converted to question format; bold direct answers; hyperlinked AAP 88% stat + Red Cross Learn-to-Swim certification benchmark; full AAP/CDC/Red Cross/NDPA Authoritative Sources section; brand-neutrality disclaimer added — WaterWiseKids does not own or operate any swim school and has no relationship with any endorser)
- `education/ymca-vs-private-swim-school.html` ✅ (8/8 H2s in question format incl. 2 converted-and-strengthened existing questions; bold direct answers; hyperlinked AAP warm-water + 88% stat, Red Cross Learn-to-Swim benchmark; full Authoritative Sources section; brand-neutrality disclaimer added)

### Remaining Un-Tracked Newer Articles (after Run 19)
- `education/ymca-open-doors-swim-lesson-assistance.html`
- `education/year-round-vs-seasonal-swim-lessons.html`
- plus open-water, pool-party-host, vacation-water, vet-swim-instructor, and water-safety-month-action-plan checklist printables
- NOTE: also re-check any articles published during the Apr 23 – Jun 11 deploy outage window against this log.

---

## Run — 2026-06-13 (Teen Aquatics Career Hub pass)

**Context:** The full water-safety education corpus (238+ indexable articles) plus root content was confirmed fully AEO-optimized (tldr-box + FAQPage + speakable all present). The remaining indexable real-content pages lacking AEO markers were the `/teens/` career guides. Optimized 3 this run.

| Article | Optimizations applied |
|---------|----------------------|
| `teens/lifeguard-certification.html` | Answer-first opening, TL;DR box, question H2s, **HowTo** schema (8 steps), **FAQPage** (5 Q&A), speakable, Red Cross + BLS citations/stats |
| `teens/swim-instructor.html` | Answer-first opening, TL;DR box, question H2s, **HowTo** schema (5 steps), **FAQPage** (5 Q&A), speakable, Red Cross WSI citation |
| `teens/aquatics-careers.html` | Answer-first opening, TL;DR box, question H2s, **FAQPage** (5 Q&A), speakable, BLS + Red Cross citations/stats |

**Verified facts (web):** Red Cross lifeguard min age 15 (last day of class); Red Cross WSI min age 16; BLS lifeguards median wage $16.57/hr ($34,470/yr), mean >$21/hr in CA, HI, DC.

**Note (scope choice):** These are aquatics-career pages, not water-safety Q&A. Used career-appropriate authoritative sources (American Red Cross, U.S. BLS) rather than drowning statistics. All 3 pages are indexable (no noindex). JSON-LD validated, tags balanced, internal links verified.

**Remaining un-optimized indexable real content:** none identified at root/teens. Hub/index pages (gear, education, swim-schools, find-swim-lessons, jobs) and `-printable.html` worksheets intentionally left as-is (functional pages, not Q&A articles). Future runs: re-audit citation depth on older education articles.

### Run 20 — 2026-06-14 — Citation + HowTo + Bold-Answer Upgrade (Batch 15)
These articles already had TL;DR boxes, FAQPage JSON-LD, question-format H2s, and basic speakable metadata, but lacked bold direct answers, hyperlinked authoritative citations, an Authoritative Sources section, and the standardized speakable cssSelector. Run 20 added a bold direct-answer lead sentence to every H2 section, hyperlinked CDC/AAP/Red Cross/NDPA/USA Swimming/YMCA citations in body and a full Authoritative Sources section, upgraded the speakable cssSelector to the standardized pattern (`.tldr-box`, `.article h1`, `.article-excerpt`, `.article > p:first-of-type`), and bumped dateModified to 2026-06-14.
- `education/year-round-vs-seasonal-swim-lessons.html` ✅ (6/6 H2 sections given bold direct answers; added inline AAP 88% stat + CDC #1-cause-of-death stat hyperlinks; full AAP/CDC/Red Cross Authoritative Sources section; speakable upgraded)
- `education/ymca-open-doors-swim-lesson-assistance.html` ✅ (8/8 H2 sections given bold direct answers; hyperlinked existing CDC disparity + USA Swimming Foundation stats in the key-context box; added **HowTo** JSON-LD schema (5 steps) for the application process; full CDC/USA Swimming/AAP/YMCA Authoritative Sources section; speakable upgraded)
- `education/two-self-rescue-skills-children.html` ✅ (7/7 H2 sections given bold direct answers; converted 4 statement H2s to question format + synced TOC; hyperlinked CDC stat box; added inline CDC + AAP 88% citations; full CDC/AAP/Red Cross/NDPA Authoritative Sources section; existing HowTo schema retained; speakable upgraded)

### Remaining Un-Tracked Articles (after Run 20)
~135 education articles still have basic AEO (TL;DR, FAQ schema, speakable) but lack hyperlinked authoritative citations / bold direct answers — these are the deeper "citation + bold-answer upgrade" candidates for future runs (e.g. at-what-age-can-kids-swim-alone, deep-water-readiness-kids, drown-proofing-techniques, five-layers-protection-drowning-prevention, emergency-pool-action-plan, etc.). All core/priority articles remain fully optimized. Continue ~3 per run.

### Run 19 — 2026-06-15 — Citation + Question H2 Upgrade (Batch 14) — Mac Mini permanent host
First run from the Mac Mini after project transfer. Focused on the newest/high-value supervision + drowning-prevention articles still missing hyperlinked authoritative citations and an Authoritative Sources section. For each: converted statement H2s to question format with bold direct-answer leads, added hyperlinked AAP/CDC/Red Cross/NDPA/USCG citations in body text, appended a full Authoritative Sources section, standardized the speakable cssSelector (`.tldr-box`, `.article h1`, `.article-excerpt`, `.article > p:first-of-type`), and bumped dateModified to 2026-06-15. All three validated: JSON-LD parses clean, HTML tag stack balanced, FAQPage + Article + BreadcrumbList schemas intact.
- `education/lifeguards-dont-replace-supervision.html` ✅ (newest article, was fully unoptimized — 7/7 content H2s converted to questions with bold answers; added CDC #1-cause-of-death stat + AAP 88% stat with hyperlinks; full Authoritative Sources section; upgraded speakable from 2-selector to standardized 4-selector)
- `education/touch-supervision-explained.html` ✅ (3 remaining statement H2s converted to questions; bold answer leads added to all 7 content sections; hyperlinked existing AAP + CDC prose mentions; added AAP 88% stat; full Authoritative Sources section; standardized speakable)
- `education/five-layers-protection-drowning-prevention.html` ✅ (2 statement H2s converted to questions; bold answer leads added to all 8 sections; hyperlinked NDPA + AAP x2 + USCG + Red Cross prose mentions; added CDC to sources; full Authoritative Sources section; standardized speakable; preserved accurate Brenner-et-al 88% caveat)

### Remaining High-Value Un-Cited Articles (after Run 19)
Large backlog still has TL;DR + FAQ + speakable but no hyperlinked authoritative citations / Authoritative Sources section. Priority safety topics to target next:
- `education/swim-school-membership-tiers.html` (newest, has question H2s but cites=0)
- `education/drown-proofing-techniques.html`
- `education/emergency-pool-action-plan.html`
- `education/touch-supervision`-adjacent: `community-pool-safety-rules.html`, `family-pool-safety-checklist.html`, `nighttime-pool-safety.html`
- NOTE: progress file's "full-site pass complete" (Apr 9) overstated coverage — ~140 education articles carry a TL;DR box but cites=0. Many are lifestyle/product articles where drowning stats don't apply, but safety/supervision/drowning articles should be prioritized for the citation upgrade.

### Run 7 — 2026-06-16 — Authoritative Citation Hyperlinks (newer articles)
Daily aeo-optimizer run. The full educational corpus already carries TL;DR boxes, FAQPage JSON-LD, question H2s, and speakable metadata. The remaining gap on ~155 newer articles is **hyperlinked** authoritative citations (they mentioned AAP/CDC/Red Cross in plain text only). This run converted those to live links and confirmed stat attribution.
- `education/are-puddle-jumpers-safe.html` ✅ (linked AAP water-safety guidance + U.S. Coast Guard life-jacket page; added attributed CDC stat — drowning is #1 cause of unintentional injury death ages 1–4)
- `education/at-what-age-can-kids-swim-alone.html` ✅ (linked AAP + American Red Cross in intro; hyperlinked CDC on the leading-cause Key Stat; linked AAP touch-supervision recommendation)
- `education/swimming-after-eating-myth.html` ✅ (linked American Red Cross + AAP; attributed the 83% four-sided-fencing stat to CDC with link)

All JSON-LD revalidated error-free (3 schemas/article); anchor tags balanced; no brand-voice violations (WaterWiseKids does not own or operate any swim school).

---

## Run — 2026-06-17 (indexable printables)

The full-site content-article AEO pass remains complete; daily publishing now enforces AEO at generation, so all standard education/ articles already carry the TL;DR box + FAQ schema. The only remaining indexable pages lacking AEO were three printable lead-magnet pages. Optimized this run (noindex printables intentionally skipped — AI engines won't cite non-indexable pages):

1. `education/pool-safety-rules-printable.html`
2. `education/summer-safety-checklist-printable.html`
3. `education/swim-lesson-readiness-printable.html`

**Applied to each:** screen-only TL;DR "Quick Answer" box (print-hidden via page-local `@media print` rule so the printed poster/checklist is untouched), FAQPage JSON-LD (4 Q&A each), authoritative citations (CDC, AAP, American Red Cross, U.S. Coast Guard) and key statistics (~970 child drownings/yr; #1 cause of death ages 1–4; 88% risk reduction from lessons; 83% from 4-sided fencing) embedded in the TL;DR + FAQ answers. Article schema already carried `speakable` metadata. Validated: all JSON-LD parses, div tags balanced, no brand-voice ownership violations.

### Run 21 — 2026-06-18 — Citation + Bold-Answer + Question-H2 Upgrade (high-value safety backlog)
First run from the Mac Mini permanent host this date. Targeted three high-value supervision/survival-skill articles that carried TL;DR + FAQPage + speakable but had cites=0, statement-style H2s, no bold direct answers, and the weaker speakable cssSelector. For each: converted all content H2s to question format with bold direct-answer lead sentences, added hyperlinked CDC/AAP/Red Cross/NDPA citations in body text, appended a full "📚 Authoritative Sources" section, standardized the speakable cssSelector (`.tldr-box`, `.article h1`, `.article-excerpt`, `.article > p:first-of-type`), and bumped dateModified to 2026-06-18. Validated with BeautifulSoup: all 3 JSON-LD schemas per page (Article + FAQPage + BreadcrumbList) parse clean; div/p/h2/ul/li/a tag stacks balanced; no brand-voice ownership violations.
- `education/drown-proofing-techniques.html` ✅ (8/8 content H2s → questions with bold answers; hyperlinked CDC Key Stat + AAP 88% stat in body; full Authoritative Sources section; speakable upgraded; dateModified 2026-06-18)
- `education/emergency-pool-action-plan.html` ✅ (6/6 content H2s → questions with bold answers; hyperlinked CDC submersion-timing stat, Red Cross residential-pool stat, Red Cross CPR class; full Authoritative Sources section; speakable upgraded)
- `education/nighttime-pool-safety.html` ✅ (6/6 content H2s → questions with bold answers; hyperlinked NDPA nighttime-access risk, CDC 83% four-sided-fencing stat, AAP touch-supervision; full Authoritative Sources section; speakable upgraded from 2-selector to standardized 4-selector)

### Remaining High-Value Un-Cited Articles (after Run 21)
- `education/swim-school-membership-tiers.html` (has question H2s but cites=0)
- `education/community-pool-safety-rules.html`
- `education/family-pool-safety-checklist.html`
- plus the large backlog of ~130 education articles carrying TL;DR + FAQ + speakable but cites=0 (prioritize safety/supervision/drowning topics; many lifestyle/product articles don't need drowning stats).

### Run 22 — 2026-06-19 — Citation + Question-H2 + Bold-Answer Upgrade (high-value safety backlog)
Daily aeo-optimizer run from the Mac Mini permanent host. Targeted the three articles named in the Run 21 remaining-backlog list — all carried TL;DR + FAQPage + speakable but had cites=0 and (for the two safety articles) statement-style H2s with no bold direct answers. For each: converted content H2s to question format with bold direct-answer lead sentences, added hyperlinked CDC/AAP/Red Cross/NDPA/CPSC citations in body text, added/upgraded a "📚 Authoritative Sources" section with live links, standardized the speakable cssSelector to the 4-selector pattern (`.tldr-box`, `.article h1`, `.article-excerpt`, `.article > p:first-of-type`), and bumped dateModified to 2026-06-19. Validated with BeautifulSoup: all 3 JSON-LD schemas/page (Article + FAQPage + BreadcrumbList) parse clean; a/div/h2/ul/li/p tag stacks balanced; no brand-voice ownership violations (WaterWiseKids does NOT own or operate any swim school — membership-tiers article kept its neutral consumer-advice framing).
- `education/community-pool-safety-rules.html` ✅ (6/6 content H2s → questions with bold answers; replaced a vague unattributed "50–60%" stat with attributed CDC leading-cause stat; hyperlinked CDC, AAP four-sided-fence guidance, NDPA Water Watcher, Red Cross CPR; added full Authoritative Sources section + TOC entry; speakable upgraded from `[.article-excerpt,.tldr-box,h2]`; cites 0→8)
- `education/family-pool-safety-checklist.html` ✅ (9 question H2s incl. all 5 numbered sections + lessons/usage/professional headings, each with bold direct answers; hyperlinked existing plain-text CDC/AAP/Red Cross mentions; converted plain "Sources & References" list to hyperlinked "📚 Authoritative Sources" (CDC, AAP, Red Cross, CPSC Pool Safely); speakable standardized; cites 0→13)
- `education/swim-school-membership-tiers.html` ✅ (already had question H2s — left intact; grounded the "what moves a young swimmer" conclusion with an AAP 88% lesson-value citation; added a 2-source Authoritative Sources section (AAP + CDC); speakable upgraded from 2- to 4-selector; brand voice preserved — no swim-school ownership implied; cites 0→3)

### Remaining High-Value Un-Cited Articles (after Run 22)
- Large backlog of ~127 education articles carrying TL;DR + FAQ + speakable but cites=0; prioritize remaining safety/supervision/drowning topics (lifestyle/product articles generally don't need drowning stats).

### Run 23 — 2026-06-20 — Citation + Question-H2 + Bold-Answer Upgrade (high-value safety backlog)
Daily aeo-optimizer run from the Mac Mini permanent host. Targeted three high-value safety/emergency articles from the un-cited backlog that carried TL;DR + FAQPage + speakable but had cites=0, statement-style H2s (two of three), no bold direct answers, and the weaker 2-selector speakable. For each: converted statement H2s to question format with bold direct-answer lead sentences, hyperlinked CPSC/CDC/AAP/Red Cross/AHA/National Autism Association citations in body text, appended a full "📚 Authoritative Sources" section, standardized the speakable cssSelector to the 4-selector pattern (`.tldr-box`, `.article h1`, `.article-excerpt`, `.article > p:first-of-type`), and bumped dateModified to 2026-06-20. Validated with BeautifulSoup: all 3 JSON-LD schemas/page (Article + FAQPage + BreadcrumbList) parse clean; h2/div tag stacks balanced; 0 missing internal links; no brand-voice ownership violations; meta descriptions ≤160.
- `education/bucket-small-container-drowning-toddlers.html` ✅ (already had question H2s; converted 1 remaining statement H2 "Why supervision alone is not enough" → question with bold answer; hyperlinked existing plain-text CPSC (x2) + CDC mentions; added full CPSC/CDC/AAP/Red Cross Authoritative Sources section; speakable upgraded; cites 0→7)
- `education/autism-wandering-water-safety.html` ✅ (converted 4 statement H2s → questions with bold answers + added bold lead sentences to all 4 "Layer" sections and the bottom-line; hyperlinked AAP + National Autism Association in intro, added inline AAP + CDC stat citations in the swim-lessons layer; full CDC/AAP/NAA/Red Cross Authoritative Sources section; speakable upgraded; cites 0→8)
- `education/aed-water-emergencies.html` ✅ (converted 4 statement H2s → questions with bold answers + added bold leads to remaining sections; hyperlinked American Red Cross + American Heart Association training, added inline CDC #1-cause-of-death stat in the children section; full Red Cross/AHA/CDC/AAP Authoritative Sources section; speakable upgraded; cites 0→7)

### Remaining High-Value Un-Cited Articles (after Run 23)
- Large backlog of ~124 education articles carrying TL;DR + FAQ + speakable but cites=0; prioritize remaining safety/supervision/drowning topics (e.g. `deep-water-readiness-kids.html`, `electric-shock-drowning-docks.html`, `child-wont-wear-life-jacket.html`, `older-siblings-water-supervision.html`, `how-to-teach-treading-water.html` — the last is a HowTo-schema candidate). Lifestyle/product articles generally don't need drowning stats.

---

## Run 24 — 2026-06-20 — FULL BACKLOG CLEARED (305 articles, 4 deploy waves)

User directive: "address everything in the backlog." A fresh audit of `live` found the prior "full-site pass complete" notes overstated coverage: **305 indexable content articles** carried a TL;DR box + FAQ schema but lacked an "📚 Authoritative Sources" section (194 had zero authority citations; 111 had some inline links but no sources section). 8 redirect stubs / non-article hub pages were correctly excluded.

**Method:** Parallel subagents ran the standardized Run-23 playbook on safety-topic articles first, in 4 deploy waves (70 + 80 + 80 + 75 = 305). Each article received: statement H2s → question format (ids preserved) with bold direct-answer leads; 2+ hyperlinked authoritative citations woven into the body (approved URLs only: CDC, AAP/HealthyChildren, American Red Cross, NDPA, CPSC, USCG, AHA, USA Swimming); a tailored "📚 Authoritative Sources" section; standardized 4-selector speakable cssSelector; `dateModified` → 2026-06-20. Topic-appropriate authorities used for non-drowning articles (lessons, progress, credentials, swimmer-health) — drowning stats were NOT force-fit where irrelevant.

**Statistics hygiene:** Agents removed/corrected multiple fabricated or mis-attributed stats found in pre-existing content (e.g. invented "42%", "72% of parents", "91% of instructors", "5–10x", a mislabeled CDC→AAP 88% attribution). Only the approved attributed stat set was used going forward.

**Validation (all 305):** JSON-LD parses clean (Article + FAQPage + BreadcrumbList per page); h2/div tag stacks balanced; speakable standardized; ≥2 authority citations + sources section present; dateModified = 2026-06-20; 0 broken internal links. Brand-voice check: my run introduced **0** new ownership phrases (global ownership-phrase count unchanged 71→71).

**Deploy commits to `live`:** 84cfef6 (wave 1, 70), bbef172 (wave 2, 80), 563074c (wave 3, 80), bcc3771 (wave 4, 75). Each rebased onto concurrent AutoDeploy/footer-fix commits before pushing.

**Backlog status after Run 24:** Re-running the detector (indexable article with tldr-box but no Authoritative Sources section) returns **0**. The education/, swimmers-hub/, teens/, and root content corpora are now fully AEO-optimized with hyperlinked authoritative sources.

**Open item (pre-existing, NOT introduced here):** ~30 articles contain pre-existing first-person "our instructors/our program/our lessons/we teach" phrasing in body copy or example quotes (many are "y*our program*" false positives). These predate this run and are a brand-voice cleanup candidate for a future pass — flagged to Michael.

### Run 25 — 2026-06-21 — HowTo Schema for Step-by-Step Articles
Daily aeo-optimizer run from the Mac Mini permanent host. The structural AEO backlog (TL;DR + FAQ + speakable + Authoritative Sources) was cleared in Run 24, and the detector still returns 0. This run targeted the one remaining measurable AEO gap: genuinely procedural step-by-step articles that carried Article + FAQPage + BreadcrumbList schema but lacked **HowTo JSON-LD** (the schema AI answer engines and Google use to extract numbered procedures). Added HowTo schema + resolvable per-step deep-link anchors to three procedural articles, and bumped dateModified to 2026-06-21.
- `education/teach-child-to-float.html` ✅ — HowTo "How to Teach a Child to Back Float" (5 named steps mirroring the article's Stage 1–5 progression: build water comfort → supported back float → starfish position → reduce support → independent float/recovery). Added id="step1".."step5" to the five `<h3>` Stage headings so each HowToStep url fragment resolves.
- `education/what-to-do-drowning-emergency.html` ✅ — HowTo "How to Respond to a Drowning Emergency: Reach, Throw, Row, Go" (6 named steps: Call 911 → Reach → Throw → Row → Go → Get out & CPR), grounded in the American Red Cross "Reach or Throw, Don't Go" principle. Added id="call911/reach/throw/row/go" to the five `<h3>` Step headings; the CPR step reuses the existing id="cpr" h2.
- `education/swim-strokes-guide-kids.html` ✅ — HowTo "How Children Progress Through the Four Competitive Swim Strokes" (4 named steps: Freestyle → Backstroke → Breaststroke → Butterfly). Reused the existing h2 ids (freestyle/backstroke/breaststroke/butterfly) for step anchors — no heading edits needed.

**Validation (BeautifulSoup + json):** all 4 JSON-LD schemas/page parse clean (Article + HowTo + FAQPage + BreadcrumbList); every HowToStep url fragment resolves to a real element id (0 dead anchors); div open/close balanced on all 3 pages; 0 brand-voice ownership phrases introduced. Files staged as Modified (not new) — no duplicate-slug risk.

**Next HowTo candidates (step-by-step articles still lacking HowTo schema):** `cpr-basics-parents.html`, `parent-cpr-water-rescue-basics.html`, `swim-level-assessment.html`, `teaching-water-respect.html`, `family-water-safety-plan.html`, `pool-to-open-water-transition-kids.html`, `weaning-kids-off-floaties.html`. (Many other articles contain "Step N" markers but are explanatory rather than procedural — only add HowTo where the steps are a genuine sequential procedure.)

### Run 26 — 2026-06-22 — HowTo Schema for Step-by-Step Articles (CPR + rescue + weaning)
Daily aeo-optimizer run from the Mac Mini permanent host. The structural AEO backlog (TL;DR + FAQ + speakable + Authoritative Sources) remains clear (detector returns 0; only 3 print-first printables and the hub index.html legitimately lack a tldr-box). This run continued the Run-25 HowTo program, targeting three genuinely procedural articles from the named candidate list that carried Article + FAQPage + BreadcrumbList but lacked **HowTo JSON-LD**. Added HowTo schema + resolvable per-step deep-link anchors, and bumped dateModified to 2026-06-22.
- `education/cpr-basics-parents.html` ✅ — HowTo "How to Perform CPR on a Child (Ages 1-8)" (7 named steps mirroring the article's step-box sequence: ensure safety → check responsiveness → check breathing → hand position → compressions → rescue breaths → continue CPR). Added id="cpr-step1".."cpr-step7" to the seven `.step-title` divs so each HowToStep url fragment resolves.
- `education/parent-cpr-water-rescue-basics.html` ✅ — HowTo "How to Perform a Water Rescue: Reach, Throw, Don't Go" (3 named steps grounded in the American Red Cross "Reach or Throw, Don't Go" principle). Added id="reach/throw/dont-go" to the three Step `<h3>` headings.
- `education/weaning-kids-off-floaties.html` ✅ — HowTo "How to Wean a Child Off Floaties" (6 named steps mirroring the article's `<ol>` progression: stand in shallow water → become the flotation device → practice horizontal skills → reduce buoyancy → life jacket for open water → add swimming milestones). Added id="wean1".."wean6" to the six `<li>` items.

**Validation (BeautifulSoup + json):** all 4 JSON-LD schemas/page parse clean (Article + HowTo + FAQPage + BreadcrumbList); every HowToStep url fragment resolves to a real element id (0 dead anchors); div open/close balanced on all 3 pages (60/60, 25/25, 25/25); 0 brand-voice ownership phrases; dateModified=2026-06-22; 0 broken internal links. Files staged as Modified (not new) — no duplicate-slug risk. (Note: initial generation used Python %r which emits single-quoted invalid JSON; caught by the parse check and rebuilt with json.dumps before deploy.)

**Next HowTo candidates (step-by-step articles still lacking HowTo schema):** `swim-level-assessment.html`, `teaching-water-respect.html`, `family-water-safety-plan.html`, `pool-to-open-water-transition-kids.html` (these 4 from the Run-25 list remain; CPR/rescue/weaning now done). Continue picking genuinely sequential procedures only.

### Run 27 — 2026-06-23 — HowTo Schema for Step-by-Step Articles (planning + open-water + baby intro)
Daily aeo-optimizer run from the Mac Mini permanent host. Structural AEO backlog (TL;DR + FAQ + speakable + Authoritative Sources) remains clear. Continued the Run-25/26 HowTo program, targeting three genuinely procedural articles that carried Article + FAQPage + BreadcrumbList but lacked **HowTo JSON-LD**. Added HowTo schema + resolvable per-step deep-link anchors; bumped dateModified to 2026-06-23.
- `education/family-water-safety-plan.html` ✅ — HowTo "How to Create a Family Water Safety Plan" (8 named steps mirroring the article's Step 1–8 sections: assess water exposure → evaluate swim skills → set up supervision → install barriers/equipment → build emergency protocol → set environment rules → communicate to caregivers → review/update). Reused existing id="step-1".."step-8" — no heading edits needed. Step text grounded in CDC, NDPA Water Watcher, AAP four-sided-fence, and Red Cross CPR guidance.
- `education/pool-to-open-water-transition-kids.html` ✅ — HowTo "How to Transition Your Child From Pool to Open Water" (6 named steps from the step-by-step `<ol>`: calm designated areas → fitted life jacket → feel bottom/temperature → practice floating to rest → teach sighting/exits → add gentle challenges). Added id="owstep1".."owstep6" to the six `<li>` items.
- `education/introducing-baby-to-pool-first-time.html` ✅ — HowTo "How to Introduce Your Baby to the Pool for the First Time" (5 named steps anchored to the article's existing h2 ids: know when baby is ready (when) → check water temperature (temperature) → prepare for the visit (prepare) → hold baby safely (holds) → follow safety rules (safety)). No heading edits needed.

**Validation (BeautifulSoup + json):** all 4 JSON-LD schemas/page parse clean (Article + HowTo + FAQPage + BreadcrumbList); every HowToStep url fragment resolves to a real element id (0 dead anchors across all 3); div open/close balanced (49/49, 26/26, 26/26); meta descriptions ≤160 (156/153/149); 0 brand-voice ownership phrases introduced (the lone grep hit in family-water-safety-plan is a "y*our pool*" false positive, pre-existing); dateModified=2026-06-23. Files staged as Modified (not new) — no duplicate-slug risk. JSON built with json.dumps (avoided the %r single-quote pitfall).

**Audited but skipped (not genuinely procedural):** `swim-level-assessment.html` (home-assessment is flowing prose, no discrete step markup) and `teaching-water-respect.html` (by-age/modeling, explanatory not sequential). Left for non-HowTo treatment.

**Next HowTo candidates (genuinely sequential procedures still lacking HowTo schema):** `water-rescue-skills-for-kids.html`, `rip-current-safety.html` (Reach/Throw escape sequence), `secondary-drowning-dry-drowning.html` (response steps). Continue picking only genuine step-by-step procedures.

### Run 28 — 2026-06-24 — HowTo Schema (rip-current escape + water-rescue Reach/Throw + pool EAP)
Daily aeo-optimizer run from the Mac Mini permanent host. Structural AEO backlog (TL;DR + FAQ + speakable + Authoritative Sources) remains clear site-wide. Continued the Run-25/26/27 HowTo program, targeting three genuinely procedural articles that carried Article + FAQPage + BreadcrumbList but lacked **HowTo JSON-LD**. Added HowTo schema + resolvable per-step deep-link anchors; bumped dateModified to 2026-06-24.
- `education/rip-current-safety.html` ✅ — HowTo "How to Escape a Rip Current" (5 named steps from the article's Escape Technique `<ol>`: stay calm/don't fight → don't swim to shore → swim parallel → angle back to shore once free → float and signal if you can't escape). Added id="rip-step1".."rip-step5" to the five `<li>` items. Grounded in standard NOAA/USLA/Red Cross rip-current guidance already in the body.
- `education/water-rescue-skills-for-kids.html` ✅ — HowTo "How to Help Someone Caught in the Water: Reach, Throw, Row, Don't Go" (4 named steps from the Reach-Throw-Row-Don't-Go `<ol>`). Added id="wr-reach/wr-throw/wr-row/wr-go" to the four `<li>` items.
- `education/emergency-pool-action-plan.html` ✅ — HowTo "How to Create a Pool Emergency Action Plan" (6 named steps mirroring the article's six numbered components: home address → contact numbers → CPR card → rescue equipment locations → designated adult roles → evacuation path). Added id="eap-step1".."eap-step6" to the six numbered `<h3>` headings. totalTime PT30M. CPR step grounded in AHA Hands-Only guidance already in body.

**Validation (BeautifulSoup + json):** all JSON-LD blocks parse clean (parsefail=0); every HowToStep url fragment resolves to a real element id (0 dead anchors); div open/close balanced (36/36, 50/50, 29/29); 0 brand-voice ownership phrases introduced; 0 duplicate ids; dateModified=2026-06-24 on all; meta descriptions ≤160 (158/157/150). Files staged as Modified (not new) — no duplicate-slug risk. JSON built with json.dumps (avoided the %r single-quote pitfall).

**Audited but skipped (not genuinely procedural):** `secondary-drowning-dry-drowning.html` (symptom-recognition checklist + when-to-seek-care decision criteria using `<ul>`, not a sequential procedure — left for non-HowTo treatment, consistent with Run-27 discipline).

**Next HowTo candidates (genuinely sequential procedures still lacking HowTo schema):** `drown-proofing-techniques.html` (back-float / jellyfish-float teaching progression — would need step markup added), `what-to-do-drowning-emergency.html` already has HowTo. Continue picking only genuine step-by-step procedures; prefer articles with existing ordered-list or numbered-heading structure to anchor steps.

### Run — 2026-06-25 — Location landing pages (AEO buildout, Batch 1)
Re-audited against **origin/live** (not the stale local workspace, which was ~weeks behind). Confirmed the entire `education/` corpus is now fully AEO-optimized on live — every content article carries TL;DR + FAQPage + speakable + hyperlinked authoritative citations + a sources section, and all how-to articles have HowTo schema (0 gaps found). The remaining indexable real-content gap is the **98 local "swim-lessons-/beginner-/kids-/toddler-" landing pages**, which had FAQPage + BreadcrumbList but **no TL;DR box and no speakable metadata**. Began the location-page AEO buildout (~3/run):

- `swim-lessons-philadelphia.html` ✅
- `swim-lessons-toms-river-nj.html` ✅
- `swim-lessons-monmouth-county-nj.html` ✅

**Applied to each:** a TL;DR "Quick Answer" box after the hero (answer-first guidance on choosing a local program, AAP age-4 recommendation, AAP 88% risk-reduction + CDC leading-cause stats, both hyperlinked); a `WebPage` JSON-LD node with standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`); and all 5 statement H2s converted to question format matching real search queries. Brand voice preserved — pages give guidance and point families to British Swim School; no ownership/operation claims. Validated: FAQPage + BreadcrumbList + WebPage JSON-LD all parse, div/section/h2 tags balanced, no brand violations.

**Backlog:** 95 remaining location landing pages need the same TL;DR + speakable + question-H2 pass; plus 12 education articles still use a non-standardized speakable cssSelector (missing `.article-excerpt`) — minor cleanup for a future run.

**Note:** The local Mac Mini workspace git tree is badly diverged from origin/live (≈200 ahead / 126 behind) and its file copies are stale; this run was done from a fresh `live` clone and pushed directly, per the deploy-safety memory. Workspace-side edits made earlier this run were discarded as redundant (those 3 education articles were already fully optimized on live).

### Run — 2026-06-26 — Location landing pages (AEO buildout, Batch 2)
Daily aeo-optimizer run from the Mac Mini permanent host, off a fresh `origin/live` clone. The `education/` + `swimmers-hub/` + `teens/` corpus remains fully AEO-optimized. Continued the location-page buildout started 2026-06-25 (~3/run). Target backlog: **95 indexable** local landing pages that carry FAQPage + BreadcrumbList but lack a TL;DR box, speakable metadata, and question-format H2s. (The 4 `*-philadelphia.html` short-slug stubs are noindex redirects to `/swim-lessons/` and are intentionally skipped — AI engines won't cite non-indexable pages.) Optimized this run:
- `beginner-swim-lessons-abington-pa.html` ✅
- `kids-swim-lessons-abington-pa.html` ✅
- `toddler-swim-lessons-abington-pa.html` ✅

**Applied to each:** TL;DR "Quick Answer" box after the hero (answer-first local-program guidance + audience-appropriate AAP age guidance + AAP 88% risk-reduction & CDC leading-cause stats, both hyperlinked); a `WebPage` JSON-LD node with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`); all 5 statement H2s converted to question format with bold direct-answer leads. Brand voice preserved — guidance only, families pointed to British Swim School; no ownership/operation claims.

**Validation (json + regex):** all 3 JSON-LD schemas/page parse clean (FAQPage + BreadcrumbList + WebPage); 5/5 question H2s/page; div open/close balanced (15/15 each); 2 hyperlinked authoritative citations/page (AAP + CDC); 0 brand-voice ownership violations. Files staged as Modified (not new) — no duplicate-slug risk.

**Backlog:** 92 indexable location landing pages remain for the same TL;DR + speakable + question-H2 pass (continue ~3/run). Plus the minor cleanup item: 12 education articles still use a non-standardized speakable cssSelector (missing `.article-excerpt`).

### Run — 2026-06-27 — Location landing pages (AEO buildout, Batch 3)
Daily aeo-optimizer run from the Mac Mini permanent host, off a fresh `origin/live` clone. The `education/` corpus remains fully AEO-optimized (TL;DR + FAQ + speakable + HowTo where procedural + hyperlinked citations). Continued the location-page buildout (~3/run). Target backlog: indexable local landing pages carrying FAQPage + BreadcrumbList but lacking a TL;DR box, speakable metadata, and question-format H2s. Optimized this run (the Ambler, PA trio):
- `beginner-swim-lessons-ambler-pa.html` ✅
- `kids-swim-lessons-ambler-pa.html` ✅
- `toddler-swim-lessons-ambler-pa.html` ✅

**Applied to each:** TL;DR "Quick Answer" box after the hero (answer-first local guidance + audience-appropriate AAP age guidance + AAP 88% risk-reduction & CDC leading-cause stats, both hyperlinked to healthychildren.org and cdc.gov/drowning); a `WebPage` JSON-LD node with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`); all 5 statement H2s converted to question format with bold direct-answer leads on the 4 content sections. Brand voice preserved — guidance only, no ownership/operation claims.

**Validation (json + HTMLParser):** all 3 JSON-LD schemas/page parse clean (FAQPage + BreadcrumbList + WebPage); 5/5 question H2s/page; div open/close balanced (15/15 each); 2 hyperlinked authoritative citations/page (AAP + CDC); meta descriptions ≤160 (131/116/121); 0 brand-voice ownership violations. Files staged as Modified (not new) — no duplicate-slug risk. JSON built with json.dumps.

**Backlog:** ~89 indexable location landing pages remain for the same TL;DR + speakable + question-H2 pass (continue ~3/run). Plus the minor cleanup item: 12 education articles still use a non-standardized speakable cssSelector (missing `.article-excerpt`).

### Run — 2026-06-28 — Location landing pages (AEO buildout, Batch 4)
Daily aeo-optimizer run from the Mac Mini permanent host, off a fresh `origin/live` clone. The `education/` corpus remains fully AEO-optimized. Continued the location-page buildout (~3/run), next alphabetical town trio (Andorra, Philadelphia):
- `beginner-swim-lessons-andorra-philadelphia.html` ✅
- `kids-swim-lessons-andorra-philadelphia.html` ✅
- `toddler-swim-lessons-andorra-philadelphia.html` ✅

**Applied to each:** TL;DR "Quick Answer" box after the hero (answer-first local guidance + audience-appropriate AAP age guidance — age 4 for beginner/kids, as-early-as-age-1 for toddler — plus AAP 88% risk-reduction & CDC leading-cause stats, both hyperlinked to healthychildren.org and cdc.gov/drowning); a `WebPage` JSON-LD node with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`); all 4 content-section H2s converted to question format with bold direct-answer leads (5th "Explore…" CTA H2 left as-is). Brand voice preserved — guidance only, families pointed to British Swim School; no ownership/operation claims.

**Validation (json + HTMLParser):** all 3 JSON-LD schemas/page parse clean (FAQPage + BreadcrumbList + WebPage); 4/4 question H2s/page; div tags balanced (final 0); 2 hyperlinked authoritative citations/page (AAP + CDC); meta descriptions ≤160 (142/127/132); 0 brand-voice ownership violations. Files staged as Modified (not new) — no duplicate-slug risk. JSON built with json.dumps-safe literals.

**Backlog:** ~86 indexable location landing pages remain for the same TL;DR + speakable + question-H2 pass (continue ~3/run; next alphabetical: Asbury Park, NJ trio). Plus the minor cleanup item: 12 education articles still use a non-standardized speakable cssSelector (missing `.article-excerpt`).

---

## Run — 2026-06-29 (Local hub pages: TL;DR + speakable)

**Finding:** Full indexable content corpus (373 education/ articles, 1,120 JSON-LD blocks) is already AEO-complete — every non-printable article has tldr-box, FAQPage, and speakable, and all JSON-LD validates clean. Remaining gap was in **local landing/hub pages** (root level), which had FAQPage but lacked the TL;DR Quick Answer box and speakable metadata.

**Optimized 3 highest-intent local hub pages** (added answer-first TL;DR box with AAP + CDC citations and 88%/ages-1–4 stats, plus WebPage speakable JSON-LD targeting `.tldr-box`, `.page-hero h1`, `.lead`):
- `swim-lessons-ocean-county-nj.html`
- `swim-lessons-monmouth-county-kids.html`
- `swim-lessons-jersey-shore.html`

Brand-safe phrasing preserved (WWK guides families to options; references British Swim School of Jersey Shore as a local option, does not claim to operate it). All 3 validated: JSON-LD 0 errors, balanced tags, TL;DR placed after hero before content-grid.

**Remaining un-optimized (deferred, low AEO value):** ~27 noindex printable checklists/worksheets — noindex pages aren't cited by answer engines, so AEO markers add little; indexability is a deliberate prior decision (leave to Michael). Several more indexable local town pages still lack TL;DR/speakable — next runs.

### Run — 2026-06-30 — Location landing pages (AEO buildout, Batch 5)
Daily aeo-optimizer run from the Mac Mini permanent host, off a fresh `origin/live` clone. The `education/` + `swimmers-hub/` + `teens/` corpus remains fully AEO-optimized. Continued the location-page buildout (~3/run), next alphabetical town trio (Asbury Park, NJ):
- `beginner-swim-lessons-asbury-park-nj.html` ✅
- `kids-swim-lessons-asbury-park-nj.html` ✅
- `toddler-swim-lessons-asbury-park-nj.html` ✅

**Applied to each:** TL;DR "Quick Answer" box after the hero (answer-first local guidance + audience-appropriate AAP age guidance — age 4 for beginner/kids, as-early-as-age-1 for toddler — plus AAP 88% risk-reduction & CDC leading-cause stats, both hyperlinked to healthychildren.org and cdc.gov/drowning); a `WebPage` JSON-LD node with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`); all 4 content-section H2s converted to question format with bold direct-answer leads (5th "Explore…" CTA H2 left as-is). Brand voice preserved — guidance only, families pointed to British Swim School; no ownership/operation claims.

**Validation (json + HTMLParser):** all 3 JSON-LD schemas/page parse clean (FAQPage + BreadcrumbList + WebPage); 4/4 question H2s/page; div tags balanced (15/15 each); 0 unbalanced end tags / 0 left-open; 2 hyperlinked authoritative citations/page (AAP + CDC); meta descriptions ≤160 (136/121/126); 0 brand-voice ownership violations. Files staged as Modified (not new) — no duplicate-slug risk.

**Backlog:** ~75 indexable location landing pages remain for the same TL;DR + speakable + question-H2 pass (continue ~3/run; next alphabetical: Belmar, NJ). Plus the minor cleanup item: 12 education articles still use a non-standardized speakable cssSelector (missing `.article-excerpt`).

### Run — 2026-07-01 — Location landing pages (AEO buildout, Batch 6)
Daily aeo-optimizer run from the Mac Mini permanent host, off a fresh `origin/live` clone. The `education/` + `swimmers-hub/` + `teens/` corpus remains fully AEO-optimized. Continued the location-page buildout (~3/run), next alphabetical town trio (Belmar, NJ):
- `beginner-swim-lessons-belmar-nj.html` ✅
- `kids-swim-lessons-belmar-nj.html` ✅
- `toddler-swim-lessons-belmar-nj.html` ✅

**Applied to each:** TL;DR "Quick Answer" box after the hero (answer-first local guidance + audience-appropriate AAP age guidance — age 4 for beginner/kids, as-early-as-age-1 for toddler — plus AAP 88% risk-reduction & CDC leading-cause stats, both hyperlinked to healthychildren.org and cdc.gov/drowning); a `WebPage` JSON-LD node with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`); all 4 content-section H2s converted to question format with bold direct-answer leads (5th "Explore…" CTA H2 left as-is). Brand voice preserved — guidance only, families pointed to British Swim School; no ownership/operation claims.

**Validation (json + HTMLParser):** all 3 JSON-LD schemas/page parse clean (FAQPage + BreadcrumbList + WebPage); 4/4 question H2s/page; 0 tag errors / 0 left-open; 1 speakable + 1 tldr-box/page; 2 hyperlinked authoritative citations/page (AAP + CDC); meta descriptions ≤160 (131/116/121); 0 brand-voice ownership violations. Files staged as Modified (not new) — no duplicate-slug risk.

**Backlog:** ~72 indexable location landing pages remain for the same TL;DR + speakable + question-H2 pass (continue ~3/run; next alphabetical: Brick, NJ). Plus the minor cleanup item: 12 education articles still use a non-standardized speakable cssSelector (missing `.article-excerpt`).

---

## Run 5 — 2026-07-02: Citation-link pass on post-April articles

Audit of all 382 education pages found every non-printable article already carries TL;DR, FAQPage schema, and speakable metadata (generator now bakes them in). However, **8 newer authority/standards articles had zero external citation hyperlinks** (orgs named in text only). Fixed 3 this run:

| Article | Links added |
|---|---|
| who-sets-water-safety-standards.html | Red Cross, NDPA, CDC/drowning, CPSC (poolsafely.gov) |
| national-water-safety-action-plan-explained.html | Water Safety USA (NWSAP), CDC data page, USCG life jackets |
| what-is-the-model-aquatic-health-code-mahc.html | CDC MAHC page, Red Cross, NDPA |

All HTML + JSON-LD validated; URLs return 200 (poolsafely.gov 403s to bots only — canonical CPSC URL, kept).

**Remaining queue (no external citations yet):**
- free-reduced-swim-lessons-make-a-splash.html
- home-water-safety-room-by-room-checklist.html
- make-a-splash-local-partner-badge-decoded.html
- new-jersey-pool-fence-law.html
- what-is-usa-swimming-make-a-splash.html

### Run — 2026-07-03 — Citation-link pass (Batch 2 of post-April queue)
Daily aeo-optimizer run from the Mac Mini, off a fresh `origin/live` clone. Continued the 07-02 citation-hyperlink queue — 3 of the 5 remaining zero-external-citation articles fixed:

| Article | Links added |
|---|---|
| free-reduced-swim-lessons-make-a-splash.html | CDC drowning facts, AAP (healthychildren.org, 88% stat), USA Swimming Foundation ×2, YMCA Safety Around Water, Red Cross Learn-to-Swim |
| home-water-safety-room-by-room-checklist.html | CDC drowning facts ×2 (TL;DR + body), AAP 88% stat, Red Cross CPR classes |
| make-a-splash-local-partner-badge-decoded.html | USA Swimming Foundation, NDPA, Red Cross Learn-to-Swim |

All dateModified bumped to 2026-07-03. Validation: 3/3 JSON-LD schemas parse clean per page (Article + BreadcrumbList + FAQPage); 0 tag errors; anchors balanced (54/54, 53/53, 50/50); meta descriptions ≤160 (137/151/158); 0 brand-voice ownership violations; files staged as Modified (no duplicate-slug risk). All URLs are the site-canonical citation URLs (used 100–400× site-wide).

**Remaining queue (no external citations yet):**
- new-jersey-pool-fence-law.html
- what-is-usa-swimming-make-a-splash.html
Then resume the location-landing-page TL;DR buildout (next alphabetical: Brick, NJ; ~72 pages remain).

### Run — 2026-07-04 — Citation queue closed + Location landing pages (Batch 7)
Daily aeo-optimizer run from the Mac Mini, off a fresh `origin/live` clone. Two workstreams:

**1. Citation-link pass — post-April queue COMPLETE.** The last 2 zero-external-citation articles fixed:

| Article | Links added |
|---|---|
| new-jersey-pool-fence-law.html | CDC drowning facts ×2 (leading-cause stat + four-sided-fencing stat box), AAP 88% stat (healthychildren.org), CPSC Pool Safely (poolsafely.gov) |
| what-is-usa-swimming-make-a-splash.html | AAP attribution on 88% stat box, CDC leading-cause stat (new, hyperlinked), USA Swimming Foundation, usaswimming.org (age-group clubs), SafeSport standard page |

Both dateModified bumped to 2026-07-04. The entire 07-02 citation queue is now done — every post-April authority/standards article carries hyperlinked citations.

**2. Location landing pages (AEO buildout, Batch 7) — Brick, NJ trio:**
- `beginner-swim-lessons-brick-nj.html` ✅
- `kids-swim-lessons-brick-nj.html` ✅
- `toddler-swim-lessons-brick-nj.html` ✅

Applied the standard pattern: TL;DR "Quick Answer" box after the hero (audience-appropriate AAP age guidance — age 4 for beginner/kids, as-early-as-age-1 for toddler — plus hyperlinked AAP 88% + CDC leading-cause stats); `WebPage` JSON-LD with standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`); all 4 content H2s converted to question format with bold direct-answer leads ("Explore…" CTA H2 left as-is).

**Validation (json + HTMLParser):** all JSON-LD parses clean on all 5 files (Article/FAQPage/BreadcrumbList/WebPage as applicable); 0 tag errors / 0 left-open; meta descriptions ≤160; internal link targets all exist; 0 brand-voice ownership violations; all files staged as Modified (no duplicate-slug risk).

**Backlog:** ~69 indexable location landing pages remain for the TL;DR + speakable + question-H2 pass. Note Brick has extra variants beyond the base trio (`-brick-township-nj` ×3, `kids-swim-lessons-brick-beaches`, `swim-lessons-brick-nj`) — pick these up next before moving to the next town alphabetically. Minor cleanup item still open: 12 education articles use a non-standardized speakable cssSelector (missing `.article-excerpt`).

## 2026-07-06 — AEO run (aeo-optimizer)
Enhanced 3 high-value decision-query articles that already had TL;DR/FAQ/speakable but lacked the key citable drowning statistics + CDC citation:
- private-vs-group-swim-lessons.html — added answer-first citable stat paragraph (CDC #1-cause-of-death ages 1–4 + AAP 88% risk reduction) + CDC Drowning Facts source.
- swim-lesson-frequency-guide.html — same stat paragraph + CDC source.
- twice-weekly-swim-lessons.html — same stat paragraph + CDC source.
Rationale: statistics + authoritative citations (AEO req 6 & 7) are the strongest extraction signals for AI answer engines; these articles were missing the drowning stats that make them citable. All JSON-LD validated; additive-only diff (9 insertions, 0 deletions).

---

## Run — 2026-07-07 (Authoritative Sources section — standards/pillar batch)

The content corpus (390 education articles) is confirmed AEO-complete on the core markers: TL;DR box, FAQPage JSON-LD, question-format H2s, and speakable metadata all present. Remaining gap = a standardized **Authoritative Sources** reference section (the last un-upgraded real articles). Only 12 real (non-printable, non-index) articles still lacked it. Optimized the 3 highest-value standards/pillar pages this run:

1. `education/water-safety-for-kids.html` (pillar) — added Authoritative Sources section (AAP, CDC, Red Cross); hyperlinked AAP + CDC inside the 88% stat-box (previously plain text); added `.article-excerpt` to speakable selector; dateModified → 2026-07-07.
2. `education/who-sets-water-safety-standards.html` — added Authoritative Sources section (Red Cross, NDPA, CDC, Pool Safely/CPSC); standardized speakable selector to 4-selector pattern; dateModified → 2026-07-07.
3. `education/national-water-safety-action-plan-explained.html` — added Authoritative Sources section (official National Water Safety Action Plan site watersafetyplan.us, CDC, Red Cross); standardized speakable; dateModified → 2026-07-07.

**URL verification (web):** confirmed live canonical URLs — AAP page is `/en/patient-care/drowning-prevention-and-water-safety/` (corrected a guessed URL); official plan site is `watersafetyplan.us` (corrected). All JSON-LD (3 blocks/article) validated parse-clean; div tags balanced; no brand-voice ownership violations.

**Remaining un-upgraded real articles (9):** four-cs-of-progress-swim-curriculum, free-reduced-swim-lessons-make-a-splash, home-water-safety-room-by-room-checklist, make-a-splash-local-partner-badge-decoded, new-jersey-pool-fence-law, swim-lesson-waitlists-what-to-do, what-is-the-model-aquatic-health-code-mahc, what-is-usa-swimming-make-a-splash, ymca-safety-around-water-saw-explained. Continue ~3/run. (35 `-printable` worksheets + hub index pages intentionally excluded.)

### Run — 2026-07-08 — Authoritative Citation + Sources-section pass (post-April queue)
Daily aeo-optimizer run. Cloned `live` (source of truth) after finding the local workspace ~3 weeks stale — the originally-picked articles (community-pool-safety-rules, nighttime-pool-safety, swim-school-membership-tiers) were already fully optimized in live from June runs, so nothing was shipped for them (avoided the stale-workspace revert trap). Re-scanned live for real content articles carrying TL;DR + FAQPage + speakable but **no hyperlinked authoritative citations and no Authoritative Sources section**. Optimized the three remaining un-cited candidates. Each already had question-format H2s and standardized speakable; this run added hyperlinked CDC/AAP/USA Swimming/USCG citations in body text, appended a full `📚 Authoritative Sources` section (site-standard bare-h2 pattern), and bumped dateModified to 2026-07-08. All validated: 3 JSON-LD schemas parse clean, div/h2/ul/a tag stacks balanced.
- `education/four-cs-of-progress-swim-curriculum.html` ✅ (added hyperlinked CDC leading-cause stat + AAP 88%-risk-reduction citation in the water-safety sequencing section; CDC/AAP/USA Swimming Foundation Authoritative Sources section)
- `education/swim-lesson-waitlists-what-to-do.html` ✅ (attributed & linked the "70% during non-swim times" stat to AAP; added CDC 83% four-sided-fencing stat to the home-barriers bullet; linked USCG on life-jacket guidance; AAP/CDC/USCG Authoritative Sources section)
- `education/ymca-safety-around-water-saw-explained.html` ✅ (upgraded the bare `rel="nofollow"` CDC link to the current CDC Facts URL with proper rel; added AAP 88% citation; CDC/AAP/USA Swimming Authoritative Sources section)

**Process note:** local Mac Mini workspace is drifting badly behind `live` (stale titles, old CSS cache-busts, missing Twitter cards). Resynced the three originally-touched files + aeo-progress.md from live. Future runs should clone `live` first and pick candidates from the clone, not the workspace.

### Remaining Un-Cited Backlog (after 2026-07-08 run)
Live scan shows the indexable education corpus is now essentially fully cited — only lifestyle/product articles where drowning stats don't apply remain without an Authoritative Sources section. Future runs: deepen citation quality on partially-cited articles (1–3 cites, no sources section) and re-audit newly published daily articles.

### Run — 2026-07-09 — Location landing pages (AEO buildout, Batch 8) — Brick variants
Daily aeo-optimizer run. Cloned `live` (source of truth); local workspace still stale. Continued the location-landing-page TL;DR + speakable + question-H2 pass, completing the entire **Brick, NJ** cluster (the 5 remaining Brick variants beyond the base trio done 2026-07-05):
- `beginner-swim-lessons-brick-township-nj.html` ✅
- `kids-swim-lessons-brick-township-nj.html` ✅
- `toddler-swim-lessons-brick-township-nj.html` ✅ (age-1 AAP framing)
- `kids-swim-lessons-brick-beaches.html` ✅ (open-water/beach framing)
- `swim-lessons-brick-nj.html` ✅

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`); inserted a "Quick Answer" TL;DR box after the hero `</section>` with hyperlinked AAP (age-4 guidance, age-1 for toddler) + AAP 88%-risk-reduction + CDC leading-cause-of-death citations; converted all 4 content H2s to question format with a bold direct-answer lead sentence (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json + HTMLParser):** all 3 JSON-LD blocks/file (FAQPage/BreadcrumbList/WebPage) parse clean; 0 unclosed tags / 0 orphan end-tags; exactly one body TL;DR box per file; 4 question-format H2s each; additive diff (4 ins / 1 mod-line per file). Caught and fixed a first-pass bug where the TL;DR div was skipped because the speakable cssSelector string already contained "tldr-box" — the visible box is now confirmed present on all 5.

**Backlog:** ~73 indexable location landing pages still remain for this pass. Next town alphabetically (after Brick): Brielle (`beginner/kids/toddler-swim-lessons-brielle-nj`), then Cheltenham PA cluster. Continue ~5/run (one town per run keeps a clean unit). Two general articles surfaced in the no-TL;DR scan — `are-infant-swim-lessons-safe.html` and `how-to-choose-swim-lessons-for-kids.html` — should be checked separately (may be redirect stubs).

### Run — 2026-07-10 — Authoritative Sources section (post-April standards/program batch)
Daily aeo-optimizer run from a fresh `origin/live` clone (workspace still stale). Continued closing the last real content articles that carried TL;DR + FAQPage + speakable and had hyperlinked body citations but **no standardized `📚 Authoritative Sources` section**. Optimized the 3 highest-value standards/program/legal pages:

| Article | Sources section added | Other |
|---|---|---|
| what-is-the-model-aquatic-health-code-mahc.html | CDC MAHC (official about page), CDC Drowning Facts, American Red Cross, NDPA | speakable standardized to 4-selector; dateModified → 2026-07-10 |
| new-jersey-pool-fence-law.html | CDC Drowning Facts (four-sided fencing), AAP/HealthyChildren (88% + fencing rec), CPSC Pool Safely | speakable standardized; dateModified → 2026-07-10 |
| what-is-usa-swimming-make-a-splash.html | USA Swimming Foundation (Make a Splash), CDC Drowning Facts, AAP/HealthyChildren (88%) | speakable standardized; dateModified → 2026-07-10 |

All URLs are the site-canonical citation URLs already validated + used across the corpus. **Validation:** 0 unclosed / 0 stray tags each; all 3 JSON-LD blocks/file parse clean; exactly 1 sources section + 1 TL;DR box + 1 FAQPage per file; no brand-voice ownership violations; additive diff. Speakable selectors upgraded from 2-selector `[".article-excerpt", ".tldr-box"]` to the standard 4-selector pattern.

**Remaining un-upgraded real articles (3):** free-reduced-swim-lessons-make-a-splash, home-water-safety-room-by-room-checklist, make-a-splash-local-partner-badge-decoded — all already have hyperlinked body citations from earlier runs, just need the Sources section. Close next run, then the corpus's real articles are fully upgraded (location-landing-page TL;DR buildout continues in parallel, ~73 pages remaining).

### Run — 2026-07-11 — Final real-article Authoritative Sources batch (corpus close-out)
Daily aeo-optimizer run from a fresh `origin/live` clone (workspace still stale). Closed the **last 3 real content articles** that had TL;DR + FAQPage + speakable + hyperlinked body citations but no standardized `📚 Authoritative Sources` section:

| Article | Sources section added |
|---|---|
| free-reduced-swim-lessons-make-a-splash.html | USA Swimming Foundation (Make a Splash), CDC Drowning Facts, AAP/HealthyChildren (88%), American Red Cross |
| make-a-splash-local-partner-badge-decoded.html | USA Swimming Foundation, NDPA (Layers of Protection), American Red Cross, CDC Drowning Facts |
| home-water-safety-room-by-room-checklist.html | CDC Drowning Facts, AAP/HealthyChildren (88%), American Red Cross (CPR), CPSC Pool Safely |

All Sources use site-canonical citation URLs. dateModified bumped to 2026-07-11 on each. **Validation:** all 3 JSON-LD blocks/file parse clean; 0 unclosed / 0 stray end-tags; exactly 1 Sources section + 1 TL;DR box + 1 FAQPage per file; no brand-voice ownership violations; additive diff only.

**Milestone:** with these three, the indexable real-article corpus is now fully AEO-upgraded (answer-first opening, question H2s, TL;DR, FAQPage, speakable, hyperlinked citations, and Authoritative Sources section). Remaining AEO work is the location-landing-page TL;DR buildout (~73 pages, next town Brielle → Cheltenham PA) plus re-auditing newly published daily articles.

### Run — 2026-07-12 — Location landing pages (AEO buildout, Batch 9) — Brielle NJ cluster
Daily aeo-optimizer run from a fresh `origin/live` clone (workspace still stale). Continued the location-landing-page TL;DR + speakable + question-H2 pass, completing the entire **Brielle, NJ** cluster (next town alphabetically after Brick):
- `beginner-swim-lessons-brielle-nj.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-brielle-nj.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-brielle-nj.html` ✅ (age-1 AAP framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`); inserted a "Quick Answer" TL;DR box after the hero `</section>` with hyperlinked AAP (age-4 / age-1) + AAP 88%-risk-reduction + CDC leading-cause-of-death citations; converted all 4 content H2s to question format with a bold direct-answer lead sentence (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json + HTMLParser):** all 3 JSON-LD blocks/file (FAQPage/BreadcrumbList/WebPage) parse clean; 0 unclosed tags / 0 stray end-tags; exactly one body TL;DR box per file (2 total "tldr-box" hits = speakable selector + visible div); 4 question-format H2s each; additive diff only (~1.5k chars/file).

**Backlog:** ~70 indexable location landing pages remain for this pass. Next town alphabetically: **Cheltenham PA** cluster (5 pages: beginner/kids/toddler-swim-lessons-cheltenham-pa, kids-swim-lessons-cheltenham-township-pa, swim-lessons-cheltenham-pa). Continue ~one town per run. All real content articles remain fully AEO-upgraded (corpus close-out completed 2026-07-11).

### Run — 2026-07-13 — Location landing pages (AEO buildout, Batch 10) — Cheltenham PA cluster
Daily aeo-optimizer run from a fresh `origin/live` clone (workspace still stale). Completed the entire **Cheltenham, PA** cluster (next town alphabetically after Brielle) — 5 pages:
- `beginner-swim-lessons-cheltenham-pa.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-cheltenham-pa.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-cheltenham-pa.html` ✅ (age-1 AAP framing)
- `kids-swim-lessons-cheltenham-township-pa.html` ✅ (age-4 AAP framing)
- `swim-lessons-cheltenham-pa.html` ✅ (age-4 AAP framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`); inserted a "Quick Answer" TL;DR box after the hero `</section>` with hyperlinked AAP (age-4 / age-1) + AAP 88%-risk-reduction + CDC leading-cause-of-death citations; converted all 4 content H2s to question format with a bold direct-answer lead sentence (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json + HTMLParser):** all 3 JSON-LD blocks/file (FAQPage/BreadcrumbList/WebPage) parse clean; 0 unclosed / 0 stray end-tags each; exactly one visible TL;DR box per file; 4 question-format H2s each; no brand-voice ownership violations; additive diff only (+10 ins / -5 mod-lines across 5 files).

**No new un-optimized real content articles this run:** the no-TL;DR education/ scan returned only the 40 intentionally-excluded `-printable` checklist pages + `index.html`; the real-article corpus remains fully AEO-upgraded (closed 2026-07-11).

**Backlog:** ~65 indexable location landing pages remain. Next town alphabetically: **Chalfont / Doylestown PA** area or next in the swim-lessons-* set — re-scan the no-TL;DR root-level `*-swim-lessons-*` files at start of next run. `swim-lessons/cheltenham-pa.html` (directory-style variant, 7 H2s, no page-hero) not part of this template batch — evaluate separately.

### Run — 2026-07-14 — HowTo schema for procedural articles (NEW lever)
Daily aeo-optimizer run from a fresh `origin/live` clone. **Key finding:** prior runs declared the real-article corpus "closed" (2026-07-11) based on a no-TL;DR scan, but that scan never checked for **HowTo JSON-LD** — which was absent from ~every content article. Genuine how-to articles (how-to-teach-treading-water, teach-child-to-float, teaching-kids-to-climb-out-pool) already had it from the generator, but several true step-by-step procedures did not. Added valid HowTo schema (steps matching visible on-page content — no spammy/mismatched markup) to 3 procedural articles:
- `self-rescue-home-pool-practice.html` ✅ HowTo (5 steps: certified instructor → no surprise/drop → rehearse exit → short & positive → touch supervision)
- `swim-float-swim-method-explained.html` ✅ HowTo (3 phases: Swim → Float → Swim again)
- `first-swim-lesson-checklist.html` ✅ HowTo (5 steps: night-before → pack bag → morning-of → ask instructor → after-lesson wrap-up)

All 3 already carried FAQPage + Article/BreadcrumbList + speakable + TL;DR (template-baked), so this run was purely additive HowTo enrichment.

**Validation:** each file now 4/4 ld+json blocks parse clean (json.loads); `<script>`/`</script>` balanced 6/6; HowTo step text is verbatim-faithful to visible content; no brand-voice ownership violations. Additive diff only (one script block/file).

**Backlog / next lever:** the HowTo gap likely spans other genuine procedures still lacking it — but must be applied ONLY where an on-page ordered procedure actually exists (comparison/explainer `<ol>` articles are NOT valid HowTo targets). Next-run candidates to vet: teaching-water-respect (conceptual, likely no), kids-snorkeling-safety, safe-diving-rules-kids, self-rescue variants. Location landing pages remain a parallel TL;DR/WebPage backlog (~65) per Batch 10 note.

### Run — 2026-07-15 — Location landing pages (AEO buildout, Batch 11) — Elkins Park PA cluster
Daily aeo-optimizer run from a fresh `origin/live` clone (workspace still stale). Completed the entire **Elkins Park, PA** cluster (next alphabetical town with un-optimized location pages) — 3 pages:
- `beginner-swim-lessons-elkins-park-pa.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-elkins-park-pa.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-elkins-park-pa.html` ✅ (age-1 AAP framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`); inserted a "Quick Answer" TL;DR box after the hero `</section>` with hyperlinked AAP (age-4 / age-1) + AAP 88%-risk-reduction + CDC leading-cause-of-death citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema (pretty-printed FAQPage in head — nearly duplicated it this run; validation caught it and the added dup was removed, keeping the original higher-detail FAQPage with local cost/year-round Q&As).

**Validation (json + HTMLParser):** all 3 JSON-LD blocks/file (FAQPage/BreadcrumbList/WebPage) parse clean; 0 unclosed / 0 stray end-tags each; exactly one visible TL;DR box, one FAQPage, one WebPage, one speakable, and 4 question-format H2s per file; balanced 5/5 script tags; no brand-voice ownership violations; additive diff only (+~2.6k chars/file).

**Process note:** location pages in this alphabetical band ship from the generator with a pretty-printed FAQPage that the compact `"@type":"..."` grep does NOT detect — always parse ld+json blocks (json.loads) to enumerate existing schema types before adding FAQPage, or a duplicate will slip in.

**Backlog:** ~62 indexable location landing pages remain (next un-optimized cluster alphabetically: Flourtown PA → Glenside PA → Howell NJ → Jenkintown PA → Jersey Shore, per the no-TL;DR root scan). Continue ~one town per run. All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11; HowTo enrichment ongoing per 2026-07-14).

### Run — 2026-07-16 — Location landing pages (AEO buildout, Batch 12) — Flourtown PA cluster
Daily aeo-optimizer run from a fresh `origin/live` clone (workspace still stale). Completed the entire **Flourtown, PA** cluster (next alphabetical town with un-optimized location pages, after Elkins Park) — 3 pages:
- `beginner-swim-lessons-flourtown-pa.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-flourtown-pa.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-flourtown-pa.html` ✅ (age-1 AAP framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`); inserted a "Quick Answer" TL;DR box after the hero `</section>` with hyperlinked AAP (age-4 / age-1) + AAP 88%-risk-reduction + CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended to the existing paragraph (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file (FAQPage/BreadcrumbList/WebPage) parse clean; 0 unclosed / 0 stray end-tags each; balanced 5/5 script tags; exactly one visible TL;DR box, one WebPage, one speakable, and 4 question-format H2s per file; no brand-voice ownership violations; additive diff only (~1.6k chars/file, all 3 stage as `M` not `A`). Pre-parsed existing ld+json to avoid the pretty-printed-FAQPage duplication trap (per Batch 11 note) — no dup introduced.

**Backlog:** ~59 indexable location landing pages remain (next un-optimized clusters alphabetically: Glenside PA → Howell NJ → Jenkintown PA → Jersey Shore → Monmouth County NJ, per the no-TL;DR root scan). Continue ~one town per run. All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11; HowTo enrichment ongoing per 2026-07-14).

### Run — 2026-07-17 — Location landing pages (AEO buildout, Batch 13) — Glenside PA cluster
Daily aeo-optimizer run from a fresh `origin/live` clone (workspace still stale). Completed the entire **Glenside, PA** cluster (next alphabetical un-optimized town after Flourtown) — 3 pages:
- `beginner-swim-lessons-glenside-pa.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-glenside-pa.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-glenside-pa.html` ✅ (age-1 AAP framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box before the first content H2 with hyperlinked AAP (age-4 / age-1) + AAP 88%-risk-reduction + CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended to the existing paragraph (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file (FAQPage/BreadcrumbList/WebPage) parse clean; 0 unclosed / 0 stray end-tags each; balanced 3/3 ld+json script tags; exactly one TL;DR box, one WebPage, one speakable, one FAQPage, and 4 question-format H2s per file; 0 brand-voice ownership claims; additive diff only (+~1.6k chars/file, all 3 stage as `M`). Pre-parsed existing ld+json to avoid the pretty-printed-FAQPage duplication trap — no dup introduced.

**Backlog:** ~56 indexable location landing pages remain (next un-optimized clusters alphabetically: Howell NJ → Jenkintown PA → Jersey Shore → Monmouth County NJ). Continue ~one town per run. All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11).

### Run — 2026-07-18 — Location landing pages (AEO buildout, Batch 14) — Howell NJ cluster
Daily aeo-optimizer run from a fresh `origin/live` clone (workspace still stale). Completed the entire **Howell, NJ** cluster (next un-optimized town after Glenside) — 4 pages (this town has a 4th general page beyond the usual beginner/kids/toddler trio):
- `beginner-swim-lessons-howell-nj.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-howell-nj.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-howell-nj.html` ✅ (age-1 AAP framing)
- `swim-lessons-howell-nj.html` ✅ (age-4 AAP framing, general/town-level page)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box before the first content H2 with hyperlinked AAP (age-4 / age-1) + AAP 88%-risk-reduction + CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended to the existing paragraph (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file (FAQPage/BreadcrumbList/WebPage) parse clean; 0 unclosed / 0 stray end-tags each; balanced 3/3 ld+json script tags; exactly one TL;DR box, one WebPage, one speakable, and 4 question-format H2s per file; 0 brand-voice ownership claims; additive diff only (+~1.7k chars/file, all 4 stage as `M`). Pre-parsed existing ld+json to enumerate schema types before adding WebPage — no duplication.

**Process note:** the "no TL;DR" pre-scan must test for `class="tldr-box"`, not the bare string `tldr-box` — the speakable cssSelector contains `.tldr-box`, so a bare-substring guard false-positives once WebPage schema is inserted.

**Backlog:** ~52 indexable location landing pages remain (next un-optimized clusters alphabetically: Jenkintown PA → Jersey Shore beaches → Monmouth County NJ → Mount Airy Philadelphia → Oakhurst NJ → Ocean County NJ → Ocean Grove NJ → Sea Girt NJ → Spring House PA → Toms River NJ → Wyndmoor PA). Also still un-optimized: several hub pages (`index.html`, `find-swim-lessons.html`, `swim-schools.html`, `kids-swim-lessons-philadelphia.html`) — worth a dedicated run since they carry the most traffic. Continue ~one town per run. All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11).

### Run — 2026-07-19 — Location landing pages (AEO buildout, Batch 15) — Jenkintown PA cluster
Daily aeo-optimizer run from a fresh `origin/live` clone (workspace still stale). Completed the entire **Jenkintown, PA** cluster (next un-optimized town after Howell) — 3 pages:
- `beginner-swim-lessons-jenkintown-pa.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-jenkintown-pa.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-jenkintown-pa.html` ✅ (age-1 AAP framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box before the first content H2 with hyperlinked AAP (age-4 / age-1) + AAP 88%-risk-reduction + CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended to the existing paragraph (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file (FAQPage/BreadcrumbList/WebPage) parse clean; 0 unbalanced tags each; balanced 5/5 script tags (3 ld+json + 2 other); exactly one TL;DR box, one WebPage, one speakable, and 4 question-format H2s per file; 0 brand-voice ownership claims; additive diff only (+~1.5–1.7k chars/file, all 3 stage as `M`). Pre-parsed existing ld+json before adding WebPage — no duplication trap.

**Backlog:** ~49 indexable location landing pages remain (next un-optimized clusters alphabetically: Jersey Shore beaches → Monmouth County NJ → Mount Airy Philadelphia → Oakhurst NJ → Ocean County NJ → Ocean Grove NJ → Sea Girt NJ → Spring House PA → Toms River NJ → Wyndmoor PA), plus several `swim-lessons/` town pages and high-traffic hub pages (`index.html`, `find-swim-lessons.html`, `swim-schools.html`, `kids-swim-lessons-philadelphia.html`) worth a dedicated run. Continue ~one town per run. All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11).

### Run — 2026-07-21 — Location landing pages (AEO buildout, Batch 16) — Monmouth County NJ cluster
Daily aeo-optimizer run from a fresh `origin/live` clone (workspace still stale). Completed the indexable **Monmouth County, NJ** age-tier pages — 2 pages (the kids-tier page `swim-lessons-monmouth-county-kids.html` was already optimized in an earlier run, so this closes the Monmouth-County-NJ entity):
- `beginner-swim-lessons-monmouth-county-nj.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-monmouth-county-nj.html` ✅ (age-1 AAP framing)

**Skipped as false positives:** the `*-jersey-shore.html` and `*-jersey-shore-beaches.html` root pages flagged in prior backlog scans are `noindex, follow` meta-refresh **redirect stubs** (~3.1k chars, 0 H2s) pointing to `/british-swim-school/jersey-shore.html` — AEO-optimizing a noindex redirect is pointless, so they were excluded. Future no-TL;DR scans should filter out `noindex` pages.

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box before the first content H2 with hyperlinked AAP (age-4 / age-1) + AAP 88%-risk-reduction + CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended to the paragraph (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file (FAQPage/BreadcrumbList/WebPage) parse clean; tag-balance stack=0 / err=0 each; exactly one TL;DR box, one WebPage, one speakable, and 4 question-format H2s per file; 0 brand-voice ownership claims; additive diff only (+13 lines/file, both stage as `M`). Pre-parsed existing ld+json before adding WebPage — no FAQPage-duplication trap.

**Backlog:** ~47 indexable location landing pages remain (next un-optimized clusters alphabetically: Mount Airy Philadelphia → Oakhurst NJ → Ocean County NJ → Ocean Grove NJ → Sea Girt NJ → Spring House PA → Toms River NJ → Wyndmoor PA, each a clean beginner/kids/toddler trio; also Monmouth-County-beaches and Monmouth-County-shore-towns variants). High-traffic hub pages (`index.html`, `find-swim-lessons.html`, `swim-schools.html`, `kids-swim-lessons-philadelphia.html`) still un-optimized — worth a dedicated run. Continue ~one town per run. All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11).

### Run — 2026-07-21 (2nd guarantee) — Location landing pages (AEO buildout, Batch 17) — Mount Airy Philadelphia cluster
Daily aeo-optimizer scheduled run from a fresh `origin/live` clone (workspace still stale). Today's deterministic run already closed the Monmouth County NJ cluster (Batch 16, commit 3e0532f); this second-guarantee run advanced the backlog to the next un-optimized cluster alphabetically — the full **Mount Airy, Philadelphia** trio (3 pages):
- `beginner-swim-lessons-mount-airy-philadelphia.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-mount-airy-philadelphia.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-mount-airy-philadelphia.html` ✅ (age-1 AAP framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box before the first content H2 with hyperlinked AAP (age-4 / age-1) + AAP 88%-risk-reduction + CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended to the existing paragraph (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file (FAQPage/BreadcrumbList/WebPage) parse clean; tag-stack=0 / tag-err=0 each; exactly one TL;DR box, one WebPage, one speakable, and 4 question-format H2s per file; 0 brand-voice ownership claims; additive diff only (+1.7–1.9k bytes/file, all 3 stage as `M`). Pre-asserted no pre-existing WebPage/tldr before insertion — no FAQPage-duplication trap.

**Backlog:** ~44 indexable location landing pages remain (next un-optimized clusters alphabetically: Oakhurst NJ → Ocean County NJ → Ocean Grove NJ → Sea Girt NJ → Spring House PA → Toms River NJ → Wyndmoor PA, each a clean beginner/kids/toddler trio). High-traffic hub pages (`index.html`, `find-swim-lessons.html`, `swim-schools.html`, `kids-swim-lessons-philadelphia.html`) still un-optimized — worth a dedicated run. Continue ~one town per run. All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11).

### Run — 2026-07-22 — Location landing pages (AEO buildout, Batch 18) — Oakhurst NJ cluster
Daily aeo-optimizer scheduled run from a fresh `origin/live` clone (workspace still stale). Completed the entire **Oakhurst, NJ** trio (next un-optimized cluster alphabetically after Mount Airy) — 3 pages:
- `beginner-swim-lessons-oakhurst-nj.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-oakhurst-nj.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-oakhurst-nj.html` ✅ (age-1 AAP framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box before the first content H2 with hyperlinked AAP (age-4 / age-1) + AAP 88%-risk-reduction + CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended to the existing paragraph (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file parse clean in order [FAQPage, BreadcrumbList, WebPage]; tag_err=0 / stack_left=0 each; exactly one TL;DR box, one WebPage, one speakable, and 4 question-format H2s (all 4 with bold-answer leads) per file; 0 brand-voice ownership claims; additive diff only (+1.8k bytes/file, all 3 stage as `M`). Pre-asserted no pre-existing WebPage/tldr before insertion — no FAQPage-duplication trap.

**Backlog:** ~41 indexable location landing pages remain (next un-optimized clusters alphabetically: Ocean County NJ → Ocean Grove NJ → Sea Girt NJ → Spring House PA → Toms River NJ → Wyndmoor PA, each a clean beginner/kids/toddler trio). High-traffic hub pages (`index.html`, `find-swim-lessons.html`, `swim-schools.html`, `kids-swim-lessons-philadelphia.html`) still un-optimized — worth a dedicated run. Continue ~one town per run. All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11).

### Run — 2026-07-23 — Location landing pages (AEO buildout, Batch 19) — Ocean County NJ cluster
Daily aeo-optimizer scheduled run from a fresh `origin/live` clone. Completed the entire **Ocean County, NJ** trio (next un-optimized cluster alphabetically after Oakhurst) — 3 pages:
- `beginner-swim-lessons-ocean-county-nj.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-ocean-county-nj.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-ocean-county-nj.html` ✅ (age-1 AAP framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box before the first content H2 with hyperlinked AAP (age-4 / age-1) + AAP 88%-risk-reduction + CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file parse clean in order [FAQPage, BreadcrumbList, WebPage]; tag_err=0 / stack_left=0 each; exactly one TL;DR box, one speakable, and 4 question-format H2s per file; 2 authoritative cite links (aap.org + cdc.gov) each; 0 brand-voice ownership claims; additive diff only (+1.6–1.7k bytes/file, all 3 stage as `M`). Pre-asserted no pre-existing WebPage/tldr before insertion — no FAQPage-duplication trap.

**Backlog:** ~38 indexable location landing pages remain (next un-optimized clusters alphabetically: Ocean County beaches → Ocean Grove NJ → Sea Girt NJ → Spring House PA → Toms River NJ → Wyndmoor PA). Note `swim-lessons-ocean-county-nj.html` (the parent tier) was already optimized in an earlier run. High-traffic hub pages (`index.html`, `find-swim-lessons.html`, `swim-schools.html`, `kids-swim-lessons-philadelphia.html`) still un-optimized — worth a dedicated run. Continue ~one town per run. All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11).

### Run — 2026-07-24 — Location landing pages (AEO buildout, Batch 20) — Ocean Grove NJ cluster
Daily aeo-optimizer scheduled run from a fresh `origin/live` clone. Completed the entire **Ocean Grove, NJ** trio (next un-optimized cluster alphabetically after Ocean County) — 3 pages:
- `beginner-swim-lessons-ocean-grove-nj.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-ocean-grove-nj.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-ocean-grove-nj.html` ✅ (age-1 AAP framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box after the local-note and before the first content H2, with hyperlinked AAP (age-1 for toddler / age-4 + 88%-risk-reduction for kids & beginner) and CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file parse clean in order [FAQPage, BreadcrumbList, WebPage]; tag_err=0 / stack_left=0 each; exactly one TL;DR box, one WebPage, one speakable, and 4 question-format H2s per file; ≥1 aap.org + ≥1 cdc.gov cite link each; 0 brand-voice ownership claims; additive diff only (+1.65–1.79k bytes/file, all 3 stage as `M`). Pre-asserted no pre-existing WebPage/tldr before insertion — no FAQPage-duplication trap.

**Backlog:** ~35 indexable location landing pages remain (next un-optimized clusters alphabetically: Sea Girt NJ → Spring House PA → Toms River NJ → Wyndmoor PA, each a clean beginner/kids/toddler trio; also check Ocean Grove-adjacent shore-town variants). High-traffic hub pages (`index.html`, `find-swim-lessons.html`, `swim-schools.html`, `kids-swim-lessons-philadelphia.html`) still un-optimized — worth a dedicated run. Continue ~one town per run. All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11).

### Run — 2026-07-25 — Location landing pages (AEO buildout, Batch 21) — Sea Girt NJ cluster
Daily aeo-optimizer scheduled run from a fresh `origin/live` clone. Completed the entire **Sea Girt, NJ** trio (next un-optimized cluster alphabetically after Ocean Grove) — 3 pages:
- `beginner-swim-lessons-sea-girt-nj.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-sea-girt-nj.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-sea-girt-nj.html` ✅ (age-1 AAP framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box before the first content H2 with hyperlinked AAP (age-1 for toddler / age-4 + 88%-risk-reduction for kids & beginner) and CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file parse clean in order [FAQPage, BreadcrumbList, WebPage]; tag_err=0 / stack_left=0 each; exactly one TL;DR box, one WebPage, one speakable, and 4 question-format H2s per file; ≥1 aap.org + ≥1 cdc.gov cite link each; 0 brand-voice ownership claims; additive diff only (+1.48–1.60k bytes/file, all 3 stage as `M`). Pre-asserted no pre-existing WebPage/tldr before insertion — no FAQPage-duplication trap.

**Backlog:** ~32 indexable location landing pages remain (next un-optimized clusters alphabetically: Spring House PA → Toms River NJ → Wyndmoor PA, each a clean beginner/kids/toddler trio; also the `beginner-swim-lessons-sea-girt-beaches.html` shore-town variant still un-optimized). High-traffic hub pages (`index.html`, `find-swim-lessons.html`, `swim-schools.html`, `kids-swim-lessons-philadelphia.html`) still un-optimized — worth a dedicated run. Continue ~one town per run. All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11).

### Run — 2026-07-26 — Location landing pages (AEO buildout, Batch 22) — Spring House PA cluster
Daily aeo-optimizer scheduled run from a fresh `origin/live` clone. Completed the entire **Spring House, PA** trio (next un-optimized cluster alphabetically after Sea Girt) — 3 pages:
- `beginner-swim-lessons-spring-house-pa.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-spring-house-pa.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-spring-house-pa.html` ✅ (age-1 AAP framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box after the local-note and before the first content H2, with hyperlinked AAP (age-1 for toddler / age-4 + 88%-risk-reduction for kids & beginner) and CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file parse clean in order [FAQPage, BreadcrumbList, WebPage]; tag_err=0 / stack_left=0 each; exactly one `class="tldr-box"`, one WebPage, one speakable, and 4 question-format H2s (each with a bold-answer lead) per file; ≥1 aap.org + ≥1 cdc.gov cite link each; 0 brand-voice ownership claims; additive diff only (+1.49–1.61k bytes/file, all 3 stage as `M`). Pre-asserted no pre-existing WebPage/tldr before insertion — no FAQPage-duplication trap.

**Backlog:** ~29 indexable location landing pages remain (next un-optimized clusters alphabetically: Toms River NJ → Wyndmoor PA, each a clean beginner/kids/toddler trio; also the `beginner-swim-lessons-sea-girt-beaches.html` shore-town variant still un-optimized). High-traffic hub pages (`index.html`, `find-swim-lessons.html`, `swim-schools.html`, `kids-swim-lessons-philadelphia.html`) still un-optimized — worth a dedicated run. Continue ~one town per run. All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11).

### Run — 2026-07-27 — Location landing pages (AEO buildout, Batch 23) — Toms River NJ cluster
Daily aeo-optimizer scheduled run from a fresh `origin/live` clone (workspace still stale). Completed the entire **Toms River, NJ** trio (next un-optimized cluster alphabetically after Spring House) — 3 pages:
- `beginner-swim-lessons-toms-river-nj.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-toms-river-nj.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-toms-river-nj.html` ✅ (age-1 AAP framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box after the local-note and before the first content H2, with hyperlinked AAP (age-1 for toddler / age-4 + 88%-risk-reduction for kids & beginner) and CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file parse clean in order [FAQPage, BreadcrumbList, WebPage]; tag_err=0 / stack_left=0 each; exactly one `<div class="tldr-box">`, one WebPage, one speakable, and 4 question-format H2s (each with a bold-answer lead) per file; ≥1 aap.org + ≥1 cdc.gov cite link each; 0 brand-voice ownership claims; additive diff only (all 3 stage as `M`). Pre-asserted no pre-existing WebPage/tldr before insertion — no FAQPage-duplication trap.

**Backlog:** ~26 indexable location landing pages remain (next un-optimized cluster alphabetically: Wyndmoor PA — a clean beginner/kids/toddler trio; also the `beginner-swim-lessons-sea-girt-beaches.html` shore-town variant still un-optimized). High-traffic hub pages (`index.html`, `find-swim-lessons.html`, `swim-schools.html`, `kids-swim-lessons-philadelphia.html`) still un-optimized — worth a dedicated run. Continue ~one town per run. All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11).

### Run — 2026-07-28 — Location landing pages (AEO buildout, Batch 24) — Wyndmoor PA cluster
Daily aeo-optimizer scheduled run from a fresh `origin/live` clone (workspace still stale). Completed the entire **Wyndmoor, PA** trio (next un-optimized cluster alphabetically after Toms River) — 3 pages:
- `beginner-swim-lessons-wyndmoor-pa.html` ✅ (age-4 AAP framing)
- `kids-swim-lessons-wyndmoor-pa.html` ✅ (age-4 AAP framing)
- `toddler-swim-lessons-wyndmoor-pa.html` ✅ (age-1 AAP framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box after the local-note and before the first content H2, with hyperlinked AAP (age-1 for toddler / age-4 + 88%-risk-reduction for kids & beginner) and CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file parse clean in order [FAQPage, BreadcrumbList, WebPage]; tag_err unchanged from original template (20, pre-existing) / stack_left=0 each; exactly one `class="tldr-box"`, one WebPage, one speakable, and 4 question-format H2s (each with a bold-answer lead) per file; ≥1 aap.org + ≥1 cdc.gov cite link each; 0 brand-voice ownership claims; additive diff only (+1.65–1.86k bytes/file, all 3 stage as `M`). Pre-asserted no pre-existing WebPage/tldr before insertion — no FAQPage-duplication trap.

**Backlog:** ~23 indexable location landing pages remain (Wyndmoor was the last named town trio in the alphabetical queue; the `beginner-swim-lessons-sea-girt-beaches.html` shore-town variant is still un-optimized — good next single-page target). High-traffic hub pages (`index.html`, `find-swim-lessons.html`, `swim-schools.html`, `kids-swim-lessons-philadelphia.html`) still un-optimized — worth a dedicated run. Continue ~one cluster per run. All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11).

### Run — 2026-07-29 — Location landing pages (AEO buildout, Batch 25) — Monmouth County Beaches cluster
Daily aeo-optimizer scheduled run from a fresh `origin/live` clone (workspace still stale). With the named-town alphabetical queue exhausted (Wyndmoor was last), moved to the county/region beach clusters. Completed the entire **Monmouth County Beaches** trio (3 real, indexable content pages) — skipped the four noindex/meta-refresh redirect stubs (`beginner-swim-lessons-jersey-shore.html`, `-jersey-shore-beaches.html`, `-northwest-philadelphia.html`, `-philadelphia.html`) which are `robots:noindex` and should NOT receive AEO treatment:
- `beginner-swim-lessons-monmouth-county-beaches.html` ✅ (age-4 AAP + 88% framing)
- `kids-swim-lessons-monmouth-county-beaches.html` ✅ (age-4 AAP + 88% framing)
- `toddler-swim-lessons-monmouth-county-beaches.html` ✅ (age-1 AAP water-familiarization framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box after the local-note and before the first content H2, with hyperlinked AAP (age-appropriate + 88%-risk-reduction) and CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file parse clean in order [FAQPage, BreadcrumbList, WebPage]; balance_err=0 / stack_left=0 each; exactly one `class="tldr-box"`, one WebPage, one speakable, and 4 question-format H2s (each with a bold-answer lead) per file; ≥1 aap.org + ≥1 cdc.gov cite link each; 0 brand-voice ownership claims; additive diff only (+~1.3–1.45k bytes/file, all 3 stage as `M`). Pre-asserted no pre-existing WebPage/tldr before insertion — no FAQPage-duplication trap.

**Backlog:** ~14 real indexable location landing pages remain un-optimized (remaining county/region clusters: Monmouth County shore-towns, Ocean County beaches, Jersey Shore beaches, plus the `-jersey-shore` toddler variant, `-northwest-philadelphia` kids/toddler, `-philadelphia` kids/toddler, and the `-sea-girt-beaches` beginner variant). NOTE: four `beginner-*` jersey-shore/philadelphia/northwest-philadelphia pages are noindex redirect stubs — do NOT optimize. High-traffic hub pages (`find-swim-lessons.html`, `swim-schools.html`) still un-optimized — worth a dedicated run (avoid `index.html`, which is protected/hardcoded). All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11).

### Run — 2026-07-30 — Location landing pages (AEO buildout, Batch 26) — Monmouth County Shore Towns cluster
Daily aeo-optimizer scheduled run from a fresh `origin/live` clone (workspace still stale). Continued the county/region beach clusters. Completed the entire **Monmouth County Shore Towns** trio (3 real, indexable content pages) — the next un-optimized index cluster alphabetically:
- `beginner-swim-lessons-monmouth-county-shore-towns.html` ✅ (age-4 AAP + 88% framing)
- `kids-swim-lessons-monmouth-county-shore-towns.html` ✅ (age-4 AAP + 88% framing)
- `toddler-swim-lessons-monmouth-county-shore-towns.html` ✅ (age-1 AAP water-familiarization framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box after the local-note and before the first content H2, with hyperlinked AAP (age-appropriate + 88%-risk-reduction) and CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file parse clean; tag err=0 / stack_left=0 each; exactly one `class="tldr-box"`, one WebPage, one speakable, and 4 question-format H2s (each with a bold-answer lead) per file; ≥1 aap.org + ≥1 cdc.gov cite link each; 0 brand-voice ownership claims; additive diff only (all 3 stage as `M`, +bytes). Pre-asserted no pre-existing WebPage/tldr before insertion — no FAQPage-duplication trap.

**Backlog:** ~11 real indexable location landing pages remain un-optimized (remaining county/region clusters: Ocean County beaches [beginner/kids/toddler], Jersey Shore beaches [kids/toddler], plus `toddler-swim-lessons-jersey-shore.html`, `-northwest-philadelphia` [kids/toddler], `-philadelphia` [kids/toddler], and the `beginner-swim-lessons-sea-girt-beaches.html` shore-town variant). NOTE: the `beginner-*` jersey-shore/philadelphia/northwest-philadelphia pages are noindex redirect stubs — do NOT optimize. High-traffic hub pages (`find-swim-lessons.html`, `swim-schools.html`) still un-optimized — worth a dedicated run (avoid `index.html`, which is protected/hardcoded). All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11).

### Run — 2026-07-31 — Location landing pages (AEO buildout, Batch 27) — Ocean County Beaches cluster
Daily aeo-optimizer scheduled run from a fresh `origin/live` clone (workspace still stale). Continued the county/region beach clusters. Completed the entire **Ocean County Beaches** trio (3 real, indexable content pages) — the next un-optimized index cluster alphabetically after Monmouth County Shore Towns:
- `beginner-swim-lessons-ocean-county-beaches.html` ✅ (age-4 AAP + 88% framing)
- `kids-swim-lessons-ocean-county-beaches.html` ✅ (age-4 AAP + 88% framing)
- `toddler-swim-lessons-ocean-county-beaches.html` ✅ (age-1 AAP water-familiarization framing)

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box after the local-note and before the first content H2, with hyperlinked AAP (age-appropriate + 88%-risk-reduction) and CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file parse clean in order [FAQPage, BreadcrumbList, WebPage]; tag_err=0 / stack_left=0 each; exactly one `class="tldr-box"`, one WebPage, one speakable, and 4 question-format H2s (each with a bold-answer lead) per file; ≥1 aap.org + ≥1 cdc.gov cite link each; 0 brand-voice ownership claims; additive diff only (all 3 stage as `M`, +bytes). Pre-asserted no pre-existing WebPage/tldr before insertion — no FAQPage-duplication trap.

**Backlog:** ~8 real indexable location landing pages remain un-optimized (Jersey Shore Beaches [kids/toddler], `toddler-swim-lessons-jersey-shore.html`, Northwest Philadelphia [kids/toddler], Philadelphia [kids/toddler], `beginner-swim-lessons-sea-girt-beaches.html`, plus standalone town pages `swim-lessons-andorra-philadelphia.html` and `swim-lessons-asbury-park-nj.html`). NOTE: `beginner-*` jersey-shore/philadelphia/northwest-philadelphia pages are noindex redirect stubs — do NOT optimize. Hub pages `find-swim-lessons.html` and `swim-schools.html` still un-optimized (worth a dedicated run; avoid `index.html`, protected/hardcoded). All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11); the 58 `*-printable.html` checklists are noindex and correctly excluded.

### Run — 2026-08-01 — Location landing pages (AEO buildout, Batch 28) — Jersey Shore Beaches cluster
Daily aeo-optimizer scheduled run from a fresh `origin/live` clone (workspace still stale). Continued the county/region beach clusters. Completed the **Jersey Shore Beaches / Jersey Shore** trio (3 real, indexable content pages) — the next un-optimized index cluster alphabetically after Ocean County Beaches:
- `kids-swim-lessons-jersey-shore-beaches.html` ✅ (age-4 AAP + 88% framing)
- `toddler-swim-lessons-jersey-shore-beaches.html` ✅ (age-1 AAP water-familiarization framing)
- `toddler-swim-lessons-jersey-shore.html` ✅ (age-1 AAP water-familiarization framing)

NOTE: `beginner-swim-lessons-jersey-shore.html` and `beginner-swim-lessons-jersey-shore-beaches.html` are noindex meta-refresh redirect stubs and were correctly excluded.

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box after the local-note and before the first content H2, with hyperlinked AAP (age-appropriate + 88%-risk-reduction) and CDC leading-cause-of-death (ages 1–4) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead sentence prepended (the "Explore…" CTA H2 left as-is). These pages already carried FAQPage + BreadcrumbList schema.

**Validation (json.loads + HTMLParser):** all 3 JSON-LD blocks/file parse clean in order [FAQPage, BreadcrumbList, WebPage]; balErr=0 / stackLeft=0 each; exactly one `class="tldr-box"`, one WebPage, one speakable, and 4 question-format H2s (each with a bold-answer lead) per file; ≥1 aap.org + ≥1 cdc.gov cite link each; 88%-stat + leading-cause present; 0 brand-voice ownership claims; additive diff only (all 3 stage as `M`, +~1.17–1.2k bytes/file). Pre-asserted no pre-existing WebPage/tldr before insertion — no FAQPage-duplication trap.

**Backlog:** ~5 real indexable location landing pages remain un-optimized: Northwest Philadelphia [kids/toddler], Philadelphia [kids/toddler], and `beginner-swim-lessons-sea-girt-beaches.html`; plus standalone town pages `swim-lessons-andorra-philadelphia.html` and `swim-lessons-asbury-park-nj.html`. NOTE: `beginner-*` philadelphia/northwest-philadelphia pages are noindex redirect stubs — do NOT optimize. Hub pages `find-swim-lessons.html` and `swim-schools.html` still un-optimized (worth a dedicated run; avoid `index.html`, protected/hardcoded). All real content articles remain fully AEO-upgraded (corpus close-out 2026-07-11); the `*-printable.html` checklists are noindex and correctly excluded.

## 2026-08-02 — AEO run (aeo-optimizer)
Full AEO pass on 3 indexable location landing pages that still lacked the TL;DR/speakable/question-H2 treatment (verified against LIVE — the workspace copy was stale and had already-optimized Abington pages, so worked directly from a fresh `live` clone):
- `kids-swim-lessons-philadelphia.html` — added TL;DR Quick Answer box (hyperlinked AAP age-4 guidance + CDC leading-cause stat + AAP 88% risk-reduction stat); `WebPage` speakable JSON-LD; all 4 content H2s → question format with bold direct-answer leads.
- `toddler-swim-lessons-philadelphia.html` — same pattern, toddler-appropriate (as-early-as-age-1 AAP guidance + supervision emphasis).
- `swim-lessons-asbury-park-nj.html` — same pattern, mixed-age framing (age 4 formal / age 1 familiarization).

Each already had FAQPage + BreadcrumbList JSON-LD (preserved). Validation: 3/3 JSON-LD parse clean per file; 0 unclosed/stray tags; meta descriptions ≤160; 4 question-format H2s each; 0 brand-voice ownership violations; both citation URLs (cdc.gov/drowning/, healthychildren.org water-safety) already used site-wide (74 / 58 files) so confirmed canonical. All 3 staged as Modified (no duplicate-slug risk). Additive-only diffs.

**Backlog note:** ~5 indexable location/landing pages still lack the TL;DR pass (beginner-swim-lessons-sea-girt-beaches, kids/toddler-swim-lessons-northwest-philadelphia, swim-lessons-andorra-philadelphia; plus the find-swim-lessons.html hub which is a directory index, lower priority). Education corpus remains AEO-complete. Also: 1 real article still needs Authoritative Sources section — home-water-safety-room-by-room-checklist.

## 2026-08-03 — AEO run (aeo-optimizer)
Full AEO pass on 3 indexable Philadelphia-area location landing pages from the backlog (worked from a fresh `origin/live` clone; workspace copy stale):
- `kids-swim-lessons-northwest-philadelphia.html` — age-4 AAP + CDC leading-cause + 88% framing.
- `toddler-swim-lessons-northwest-philadelphia.html` — age-1 water-familiarization + supervision emphasis.
- `swim-lessons-andorra-philadelphia.html` — mixed-age framing (age 4 formal / age 1 familiarization).

Applied the standard location-page pattern per file: added `WebPage` JSON-LD with the standardized `speakable` cssSelector (`.tldr-box`, `.page-hero h1`, `.lead`) before `</head>`; inserted a "Quick Answer" TL;DR box after the local-note and before the first content H2, with hyperlinked AAP (healthychildren.org) and CDC (cdc.gov/drowning) citations; converted all 4 content H2s from statement to question format with a bold direct-answer lead prepended (the "Explore…" CTA H2 left as-is). Each already had FAQPage + BreadcrumbList JSON-LD (preserved).

**Validation (json.loads + HTMLParser):** 3/3 JSON-LD blocks parse clean per file; tags_err=0 / stack_left=0 each; exactly one tldr-box, one WebPage, one speakable, 4 question-format H2s per file; ≥1 AAP + ≥1 CDC cite link each; meta descriptions ≤160 (128/133/155); 0 brand-voice ownership violations; all 3 staged as `M` (additive diff).

**Backlog:** ~2 indexable location/landing pages still lack the TL;DR pass: `beginner-swim-lessons-sea-girt-beaches.html`, plus the `find-swim-lessons.html` hub (directory index, lower priority) and `swim-schools.html`. Also 1 real article still needs an Authoritative Sources section — `home-water-safety-room-by-room-checklist`. Education corpus remains AEO-complete; `*-printable.html` checklists are noindex and correctly excluded.

## 2026-08-04 — AEO run (aeo-optimizer)
Cleared the last of the indexable non-optimized backlog (verified against a fresh `origin/live` clone; a filesystem scan for `class="tldr-box"` confirmed the entire `education/` corpus is AEO-complete and only these 3 indexable pages remained):

- `beginner-swim-lessons-sea-girt-beaches.html` — final Jersey Shore location landing page. Full standard location pattern: added `WebPage` speakable JSON-LD (`.tldr-box`, `.page-hero h1`, `.lead`); inserted "Quick Answer" TL;DR after the local-note (hyperlinked AAP age-4 + 88% risk-reduction + CDC leading-cause-of-death ages 1–4); converted all 4 content H2s → question format with bold direct-answer leads (the "Explore…" CTA H2 left as-is). Already had FAQPage + BreadcrumbList (preserved).
- `find-swim-lessons.html` — directory hub. Additive-only (nav-category H2s intentionally left intact): added `speakable` to the existing `WebPage` node; inserted a TL;DR "Quick Answer" after the hero intro; added a new 3-Q&A `FAQPage` (how to find lessons / start age / why lessons matter) with AAP + CDC facts.
- `swim-schools.html` — canonical rich directory hub (hardcoded inline-styled hero left untouched). Additive-only: added `speakable` to the existing `WebPage` node; inserted a container-wrapped TL;DR "Quick Answer" between the hero and the "How It Works" section; added a new 4-Q&A `FAQPage` (find a school / what makes a good school / start age / are reviews verified).

**Validation (json.loads + HTMLParser):** all JSON-LD blocks parse clean per file (sea-girt = FAQPage/BreadcrumbList/WebPage; both hubs = WebPage/FAQPage, no duplicate WebPage); tag_err=0 / stack_left=0 each; exactly one `class="tldr-box"` + one speakable + one FAQPage per file; ≥1 AAP + ≥1 CDC cite link each; swim-schools meta desc 147 ≤160; 0 brand-voice ownership violations (directory framing only — "lists/organizes/collects reviews", never "our schools"); all 3 staged as `M` (additive diff, +1.7k/+2.2k/+2.4k bytes).

**Backlog:** No indexable content/location/landing pages remain un-optimized. `education/index.html` is a listing page (correctly excluded); `*-printable.html` checklists are noindex (excluded). One legacy note still open: `home-water-safety-room-by-room-checklist` could use a dedicated Authoritative Sources section. Otherwise the AEO corpus is fully covered — future runs should re-scan for newly published pages.

## 2026-08-05 — AEO run (aeo-optimizer) — swim-lessons/ subdirectory town pages (Batch 29)
A site-wide `class="tldr-box"` scan (previous runs only scanned root + `education/`) revealed a large un-optimized cluster in deeper subdirectories: `swim-lessons/{town}.html` town pages, the 50 `swim-lessons/directory/{state}.html` pages, `british-swim-school/*`, `teens/*`, `tools/*`. Root + `education/` corpus confirmed complete (only the two `index.html` listing pages lack a TL;DR, correctly excluded). Started clearing the subdirectory backlog with the Montgomery County, PA town trio (all served by BSS Northwest Philadelphia, shared `wwk-local-content` template):
- `swim-lessons/cheltenham-pa.html` — mixed-age framing (age 4 formal / age 1 familiarization). Already had WebPage + FAQPage (preserved).
- `swim-lessons/ambler-pa.html` — same framing; **added a new FAQPage** (visible 3-Q&A section + JSON-LD) since it had none.
- `swim-lessons/glenside-pa.html` — same framing; **added a new FAQPage** (visible + JSON-LD).

Pattern applied per file: inserted a "Quick Answer" TL;DR box after the intro-box and before the first `wwk-highlight-box` H2 (hyperlinked AAP healthychildren.org age guidance + CDC leading-cause-of-death ages 1–4 + AAP 88% risk-reduction stat); added `speakable` to the existing WebPage node (cssSelector `.tldr-box`, `.wwk-local-content h1`, `.wwk-intro-box p`); converted the two informational statement H2s ("Why…", "What to Look for…") to question format with a bold direct-answer lead sentence prepended (brand/CTA/"Nearby Communities" H2s left as-is).

**Validation (json.loads + HTMLParser):** all JSON-LD parses clean [WebPage, FAQPage] per file; tagerr=0 / stackleft=0 each; exactly one tldr-box + one speakable + one FAQPage per file; ≥1 healthychildren.org + ≥1 cdc.gov cite link each; 88%-stat + leading-cause present; meta descriptions ≤160 (139/134/122); 0 brand-voice ownership violations (directory/informational voice only — no new "our pool/school" claims); all 3 staged as `M` (additive diff, +1.6k/+3.8k/+3.8k bytes).

**Backlog (subdirectory pages still lacking TL;DR):** remaining `swim-lessons/` town pages — philadelphia, ocean-county-nj, monmouth-county-nj, brick-nj, howell-nj, asbury-park-nj, flourtown-pa, elkins-park-pa, jersey-shore, northwest-philadelphia; the 50 `swim-lessons/directory/{state}.html` pages (directory listings — big high-value cluster, ~one region-batch per run); `british-swim-school/{jersey-shore,northwest-philadelphia}.html`; `teens/scholarships.html`; `tools/family-water-safety-plan.html`. Utility/form pages `swim-schools/add.html` and `jobs/post.html` are low priority (form pages — likely skip). Continue ~3 pages/run.

## 2026-08-06 — AEO run (aeo-optimizer) — swim-lessons/ town pages (Batch 30)
Continued clearing the `swim-lessons/{town}.html` subdirectory backlog. Optimized the next 3 town pages (all `wwk-local-content` template):
- `swim-lessons/philadelphia.html` — already had WebPage + FAQPage (preserved). Additive: added `speakable` to WebPage node; inserted "Quick Answer" TL;DR after the intro-box (hyperlinked AAP age-1/age-4 + 88% risk-reduction + CDC leading-cause-of-death ages 1–4); converted the two informational statement H2s ("Why Swim Lessons Matter…", "What to Look for…") → question format with a bold direct-answer lead prepended.
- `swim-lessons/ocean-county-nj.html` — had WebPage but **no FAQPage**. Added a new visible 3-Q&A FAQ section + FAQPage JSON-LD (age to start / risk reduction / how often); added TL;DR, speakable, and converted the two statement H2s → questions with bold leads.
- `swim-lessons/monmouth-county-nj.html` — same as ocean (no FAQPage → added visible FAQ + FAQPage JSON-LD, TL;DR, speakable, 2 question H2s).

Pattern per file: TL;DR inserted before the first `wwk-highlight-box`; `speakable` cssSelector `.tldr-box`, `.wwk-local-content h1`, `.wwk-intro-box p`; brand/CTA/"Nearby Communities"/"Featured School" H2s left as-is.

**Validation (json.loads + HTMLParser):** all JSON-LD parses clean [WebPage, FAQPage] per file; tagerr=0 / stackleft=0 each; exactly one tldr-box + one speakable + one FAQPage + one WebPage per file; ≥1 healthychildren.org + ≥1 cdc.gov cite link each; 88%-stat + leading-cause present; meta descriptions ≤160 (144/131/142); 0 brand-voice ownership violations; all 3 staged as `M` (additive diff, +1.3k/+3.4k/+3.4k bytes).

**Backlog (swim-lessons/ town pages still lacking TL;DR):** brick-nj, howell-nj, asbury-park-nj, flourtown-pa, elkins-park-pa, jersey-shore, northwest-philadelphia; then the 50 `swim-lessons/directory/{state}.html` pages (big high-value cluster); `british-swim-school/{jersey-shore,northwest-philadelphia}.html`; `teens/scholarships.html`; `tools/family-water-safety-plan.html`. Form pages (`swim-schools/add.html`, `jobs/post.html`) likely skip. Continue ~3 pages/run.

## 2026-08-11 — AEO run (aeo-optimizer) — swim-lessons/ town pages (Batch 31)
Continued clearing the `swim-lessons/{town}.html` Jersey Shore backlog. Optimized the next 3 town pages (all `wwk-local-content` template, verified against a fresh `origin/live` clone — workspace matched live exactly, no drift):
- `swim-lessons/asbury-park-nj.html` — had WebPage + Organization but **no FAQPage**. Added visible 3-Q&A FAQ section + FAQPage JSON-LD (start age / risk reduction / how often); shore/mixed-age framing (age 4 formal, age 1 familiarization).
- `swim-lessons/brick-nj.html` — same (no FAQPage → added visible FAQ + FAQPage JSON-LD).
- `swim-lessons/howell-nj.html` — same (no FAQPage → added visible FAQ + FAQPage JSON-LD).

Pattern per file: added `speakable` to the existing WebPage node (cssSelector `.tldr-box`, `.wwk-local-content h1`, `.wwk-intro-box p`); inserted a "Quick Answer" TL;DR box after the intro-box and before the first `wwk-highlight-box` (hyperlinked AAP healthychildren.org age guidance + AAP 88% risk-reduction + CDC leading-cause-of-death ages 1–4); converted the two informational statement H2s ("Why…", "What to Look for…") → question format with a bold direct-answer lead prepended (brand/CTA/"Nearby Communities"/"Featured School" H2s left as-is).

**Validation (json.loads + HTMLParser):** all JSON-LD parses clean [WebPage, FAQPage] per file; tagerr=0 / stackleft=0 each; exactly one tldr-box + one speakable + one FAQPage per file; ≥1 healthychildren.org + ≥1 cdc.gov cite link each; 88%-stat + leading-cause present; meta descriptions ≤160 (81/142/131); 0 brand-voice ownership violations; all 3 staged as `M` (additive diff).

**Backlog (swim-lessons/ town pages still lacking TL;DR):** flourtown-pa, elkins-park-pa, jersey-shore, northwest-philadelphia; then the 52 `swim-lessons/directory/{state}.html` pages (big high-value cluster — none optimized yet); `british-swim-school/{jersey-shore,northwest-philadelphia}.html`; `teens/scholarships.html`; `tools/family-water-safety-plan.html`. Listing pages (`swim-lessons/index.html`, `teens/index.html`, `tools/index.html`) correctly excluded. Continue ~3 pages/run.

## 2026-08-12 — AEO run (aeo-optimizer) — swim-lessons/ town pages (Batch 32)
Cleared the last 3 of the 4 remaining `swim-lessons/{town}.html` town pages (verified via a full-repo `class="tldr-box"` scan: `education/` corpus confirmed 100% AEO-complete; only these town pages + the 52 `swim-lessons/directory/{state}.html` pages remained un-optimized). All three shared the `wwk-local-content` template and had WebPage + Organization JSON-LD but **no FAQPage** — added one to each:
- `swim-lessons/flourtown-pa.html` — Montgomery County PA (BSS Northwest Philadelphia), mixed-age framing (age 4 formal / age 1 familiarization).
- `swim-lessons/elkins-park-pa.html` — same PA/BSS-NWP framing.
- `swim-lessons/jersey-shore.html` — shore hub page; ocean/bay/pool open-water framing.

Pattern applied per file: added `speakable` to the existing WebPage node (cssSelector `.tldr-box`, `.wwk-local-content h1`, `.wwk-intro-box p`); inserted a "Quick Answer" TL;DR box after the intro-box and before the first `wwk-highlight-box` (hyperlinked AAP healthychildren.org age guidance + AAP 88% risk-reduction + CDC leading-cause-of-death ages 1–4); added a new visible 3-Q&A FAQ section (`faq-section`/`faq-item`) + matching FAQPage JSON-LD (start age / risk reduction / how often); converted the two informational statement H2s ("Why…", "What to Look for…") → question format with a bold direct-answer lead prepended (brand/CTA/"Nearby Communities"/"Featured School" H2s left as-is).

**Validation (json.loads + HTMLParser):** all JSON-LD parses clean [WebPage, FAQPage] per file; tagerr=0 / stackleft=0 each; exactly one tldr-box + one speakable + one FAQPage + one WebPage + 3 faq-items + 2 question-H2s per file; ≥1 healthychildren.org + ≥1 cdc.gov cite link each; 88%-stat + leading-cause present; meta descriptions ≤160 (141/124/123); 0 brand-voice ownership violations in added content (informational/directory voice only — pre-existing BSS featured-school "we/us" copy left untouched). Deploy loop auto-committed + pushed all three to origin/live (verified HEAD == origin/live, 0 ahead/0 behind).

**Backlog:** Only 1 town page remains — `swim-lessons/northwest-philadelphia.html` — then the 52 `swim-lessons/directory/{state}.html` pages (big high-value cluster, none optimized yet); `british-swim-school/{jersey-shore,northwest-philadelphia}.html`; `teens/scholarships.html`; `tools/family-water-safety-plan.html`. Listing pages (`swim-lessons/index.html`, `teens/index.html`, `tools/index.html`) + `*-printable.html` (noindex) correctly excluded. Continue ~3 pages/run.

## 2026-08-13 — AEO run (aeo-optimizer) — last town page + directory cluster kickoff (Batch 33)
Verified workspace == origin/live (0 ahead / 0 behind) before editing. Cleared the final `swim-lessons/{town}.html` town page and started the 52-page `swim-lessons/directory/{state}.html` cluster (none previously optimized):
- `swim-lessons/northwest-philadelphia.html` — town page (`wwk-local-content` template), had WebPage + Organization but **no FAQPage**. Added: `speakable` on WebPage node; "Quick Answer" TL;DR after the intro-box (hyperlinked AAP healthychildren.org age-4/age-1 guidance + AAP 88% risk-reduction + CDC leading-cause ages 1–4); new visible 3-Q&A FAQ section (`faq-section`/`faq-item`) + matching FAQPage JSON-LD (start age / risk reduction / how often); converted the two statement H2s ("Why … Choose Professional Swim Lessons", "Programs for Every Age & Stage") → question format with bold answer-first leads; added CDC citation link into the Why paragraph. Brand/CTA/Nearby/Featured-School H2s left as-is.
- `swim-lessons/directory/texas.html` — rich directory template (already had WebPage + FAQPage + answer-first intro + visible FAQ). Additive only: added `speakable` to WebPage node (cssSelector `.tldr-box`, `.page-hero h1`, `.state-info h3`) and a "Quick Answer" TL;DR box after the hero (AAP age guidance + 88% stat + CDC leading-cause, both hyperlinked).
- `swim-lessons/directory/florida.html` — same rich template; same additive treatment (speakable + TL;DR after hero, hyperlinked AAP + CDC + 88%).

**Validation (json.loads + HTMLParser):** all JSON-LD parses clean [WebPage, FAQPage] per file; tag-mismatch=0 / stackleft=0 each; exactly one tldr-box + one speakable + one FAQPage per file; ≥1 healthychildren.org + ≥1 cdc.gov cite link + 88% stat present each; meta descriptions ≤160 (133/131/133); 0 brand-voice ownership violations in added content (informational/directory voice only — pre-existing BSS featured-school copy untouched).

**Backlog:** All `swim-lessons/{town}.html` town pages now complete. Remaining un-optimized: 50 `swim-lessons/directory/{state}.html` pages (california is a simpler variant with JSON-LD FAQPage but no visible FAQ section — handle its variant when reached); `british-swim-school/{jersey-shore,northwest-philadelphia}.html`; `teens/scholarships.html`; `tools/family-water-safety-plan.html`. Listing/index pages + `*-printable.html` (noindex) correctly excluded. Continue ~3 directory pages/run (prioritize high-population states: california, new-york, illinois, pennsylvania, ohio, georgia, north-carolina, michigan).

## 2026-08-14 — AEO run (aeo-optimizer) — directory state cluster (Batch 34) + FAQ-visibility backfill
Verified against a fresh `origin/live` clone before editing. Confirmed via full-repo `tldr-box` scan that the `education/` corpus and all `swim-lessons/{town}.html` town pages remain 100% complete (only noindex `*-printable.html` + listing `index.html` files lack a TL;DR, correctly excluded). Continued the 52-page `swim-lessons/directory/{state}.html` cluster, taking the three highest-population remaining states:
- `swim-lessons/directory/california.html`
- `swim-lessons/directory/new-york.html`
- `swim-lessons/directory/illinois.html`

Pattern applied per file (all three share the rich directory template with WebPage + FAQPage + BreadcrumbList JSON-LD and an answer-first state intro):
1. Added `speakable` to the WebPage node — cssSelector `[".tldr-box", ".page-hero h1", ".faq-section h3"]`.
2. Inserted a "Quick Answer" TL;DR box between the hero and the State Intro section, with a state-specific risk hook and **two new authoritative outbound citations** (AAP healthychildren.org age-4/age-1 guidance + CDC drowning facts) plus the AAP 88% risk-reduction stat. These pages previously had **zero** external authority links — this is the first hyperlinked AAP/CDC citation on the directory template.
3. **Added a visible FAQ section** (`faq-section` / `faq-item`, inline-styled to avoid orphaned-class CSS) rendering the 4 Q&As that already existed only in the FAQPage JSON-LD.

**Structured-data compliance fix (backfill):** Google requires FAQPage content to be visible on the page. A parity check revealed that `texas.html` and `florida.html` (optimized in Batch 33) carried FAQPage JSON-LD with **no visible counterpart** — an invisible-content violation that risks the whole rich result being ignored. Backfilled both with the same visible FAQ section and updated their speakable selector from the non-existent `.state-info h3` to `.faq-section h3`. All 5 directory pages now pass visible-vs-schema FAQ parity.

**Validation (json.loads + HTMLParser):** all JSON-LD parses clean [WebPage, FAQPage, BreadcrumbList] per file; tagerr=0 / stackleft=0 on all 5; exactly one tldr-box + one speakable + one FAQPage per file; visible FAQ questions match schema questions exactly (parity=True, 4/4 each); ≥1 healthychildren.org + ≥1 cdc.gov link + 88% stat present in each of the 3 new files; meta descriptions ≤160 (136/134/134); 0 brand-voice ownership violations (one "see our pool fence laws by state guide" hit in florida.html is a self-referential link to a WWK guide, not an ownership claim — false positive); all 5 staged as `M`, additive diff (+136 / −2 lines).

**Backlog:** 47 `swim-lessons/directory/{state}.html` pages remain (done so far: texas, florida, california, new-york, illinois). Next by population: pennsylvania, ohio, georgia, north-carolina, michigan, new-jersey, virginia, washington, arizona, massachusetts. Also outstanding: `british-swim-school/{jersey-shore,northwest-philadelphia}.html`; `teens/scholarships.html`; `tools/family-water-safety-plan.html`. Top-level hub pages (`about`, `articles`, `education.html`, `gear.html`, `jobs.html`, `teens.html`, `404`) and form pages (`swim-schools/add.html`, `jobs/post.html`) remain deliberately excluded as listing/utility pages. Continue ~3 directory pages/run — note the new-state template now includes the visible-FAQ step.

## 2026-08-15 — AEO run (aeo-optimizer) — directory state cluster (Batch 35)
Verified workspace == `origin/live` (0 ahead / 0 behind) before editing. Continued the 52-page `swim-lessons/directory/{state}.html` cluster with the next three by population:
- `swim-lessons/directory/pennsylvania.html`
- `swim-lessons/directory/ohio.html`
- `swim-lessons/directory/georgia.html`

**Template note (changed since Batch 34):** these three already carried a rich `<section class="section state-info">` block containing the state intro **and a visible 4-Q&A FAQ whose `<h3>` text matches the FAQPage JSON-LD exactly** (a downstream effect of the site-wide FAQPage schema/visible-content fix in `4e9e40b8` + `ed17cbc2`). So unlike Batches 33–34, **no visible FAQ section needed to be added** — parity was already 4/4. The remaining AEO gaps were the two additive items below.

Pattern applied per file (purely additive, +12 lines each, 0 deletions):
1. Added `speakable` to the existing WebPage JSON-LD node — cssSelector `[".tldr-box", ".page-hero h1", ".state-info h3"]`. **Selector note:** these pages use `.state-info` (not `.faq-section` as on texas/florida/california/new-york/illinois) — verify which wrapper class a page actually uses before copying the selector, or speakable points at nothing.
2. Inserted a "Quick Answer" TL;DR box between the hero `</section>` and the Search Section, with a **state-specific risk hook** and the page's **first two authoritative outbound citations** (AAP healthychildren.org age-4/age-1 guidance + CDC drowning facts) plus the AAP 88% risk-reduction stat. All three pages previously had **zero** external authority links (only usswimschools.org / usaswimming.org in the footer).
   - PA hook: rivers, Lake Erie, and flooded former quarries (deep, steep-sided, cold, unlifeguarded).
   - OH hook: short outdoor season + Lake Erie cold-water shock, pier/breakwall currents, deep quarries.
   - GA hook: long warm season around backyard/neighborhood pools and Lakes Lanier & Allatoona.

**Validation (json.loads + HTMLParser):** all JSON-LD parses clean `[WebPage, FAQPage, BreadcrumbList]` per file; tagerr=0 / stackleft=0 on all three; exactly one tldr-box + one speakable per file; visible FAQ `<h3>` text matches schema question names exactly (parity=True, 4/4 each); ≥1 healthychildren.org + ≥1 cdc.gov/drowning link + "88% reduction" stat now present in each; meta descriptions ≤160 (138/130/133); 0 brand-voice ownership violations. Deploy loop auto-committed + pushed as `8cb92e7e` (3 files, +36/−0); HEAD == origin/live (0 ahead / 0 behind).

**Backlog:** 44 `swim-lessons/directory/{state}.html` pages remain. Done so far (8): texas, florida, california, new-york, illinois, pennsylvania, ohio, georgia. Next by population: north-carolina, michigan, new-jersey, virginia, washington, arizona, massachusetts, tennessee, indiana, maryland. Also outstanding: `british-swim-school/{jersey-shore,northwest-philadelphia}.html`; `teens/scholarships.html`; `tools/family-water-safety-plan.html`. Listing/index pages + `*-printable.html` (noindex) + form pages remain deliberately excluded. Continue ~3 directory pages/run — **check each page's FAQ wrapper class and existing visible-FAQ state first**, since the site-wide fix may have already satisfied the parity step.

## 2026-08-16 — AEO run (aeo-optimizer) — directory state cluster (Batch 36)
Verified against a fresh `origin/live` clone (`c1b3f83`) before editing — note the **Mac deploy loop is down** (mount HEAD `7a3f219b`, 2 commits behind origin/live), so this batch was committed and pushed **directly** from the clone rather than via loop auto-pickup. Continued the 52-page `swim-lessons/directory/{state}.html` cluster with the next three by population:
- `swim-lessons/directory/north-carolina.html`
- `swim-lessons/directory/michigan.html`
- `swim-lessons/directory/new-jersey.html`

**Template state on arrival:** all three already carried `WebPage` + `FAQPage` + `BreadcrumbList` JSON-LD and a visible 4-Q&A FAQ inside `<section class="section state-info">` whose `<h3>` text matched the FAQPage schema exactly (parity 4/4 pre-existing — the site-wide FAQ-visibility fix had already covered them, same as Batch 35). So **no visible FAQ section needed to be added**. The two real gaps were: no TL;DR box, no `speakable`, and — notably — **zero authoritative outbound citations on any of the three** (`healthychildren.org`=0, `cdc.gov`=0 before this run; michigan and new-jersey also had **no 88% stat anywhere on the page**).

Pattern applied per file (purely additive, +12 lines each, 0 deletions):
1. Added `speakable` to the existing WebPage node — cssSelector `[".tldr-box", ".page-hero h1", ".state-info h3"]`. Verified per-file that both `.page-hero` and `.section state-info` actually exist (these three use `.state-info`, like PA/OH/GA — **not** `.faq-section` as on texas/florida/california/new-york/illinois).
2. Inserted a "Quick Answer" TL;DR box between the hero `</section>` and the next section, carrying the page's first two authoritative outbound citations (AAP healthychildren.org age-4/age-1 guidance + CDC drowning-facts) plus the AAP 88% risk-reduction stat, a state-specific risk hook, and an explicit layers-of-protection close (fencing / life jackets / supervision).
   - NC hook: backyard pools + inland lakes (Norman, Jordan) + Outer Banks surf, rip currents as the top open-water hazard.
   - MI hook: Great Lakes dominance — Lake Michigan the deadliest of the five, cold-water shock, structural currents along piers and breakwalls.
   - NJ hook: Jersey Shore rip currents, deceptively calm back bays and lagoons, dense backyard/community pool stock.

**Validation (json.loads + HTMLParser):** all JSON-LD parses clean `[WebPage, FAQPage, BreadcrumbList]` per file; tagerr=0 / stackleft=0 on all three; exactly one tldr-box + one speakable per file; visible FAQ `<h3>` text matches schema question names exactly (parity=True, 4/4 each); ≥1 healthychildren.org + ≥1 cdc.gov/drowning link + "88%" stat now present in each; `.page-hero` and `.state-info` wrappers confirmed present so speakable resolves; meta descriptions unchanged and ≤160 (140/134/136); 0 brand-voice ownership violations in added copy (informational/directory voice only); all three staged as `M` with an additive diff (+36 / −0).

**Backlog:** 41 `swim-lessons/directory/{state}.html` pages remain. Done so far (11): texas, florida, california, new-york, illinois, pennsylvania, ohio, georgia, north-carolina, michigan, new-jersey. Next by population: virginia, washington, arizona, massachusetts, tennessee, indiana, maryland, missouri, wisconsin, colorado. Also outstanding: `british-swim-school/{jersey-shore,northwest-philadelphia}.html`; `teens/scholarships.html`; `tools/family-water-safety-plan.html`. Listing/index pages + `*-printable.html` (noindex) + form pages remain deliberately excluded. Continue ~3 directory pages/run — **check each page's FAQ wrapper class (`.state-info` vs `.faq-section`) and existing visible-FAQ parity first**, and check whether the deploy loop is alive before relying on auto-pickup.

## 2026-08-17 — AEO run (aeo-optimizer) — directory state cluster (Batch 37)
Worked from a fresh `origin/live` clone (workspace mount was stale — its copy of this file still ended at Batch 35, while live carried Batch 36). Verified the 8/16 stale `.git/index.lock` is gone. Continued the 52-page `swim-lessons/directory/{state}.html` cluster with the next three by population:
- `swim-lessons/directory/virginia.html`
- `swim-lessons/directory/washington.html`
- `swim-lessons/directory/arizona.html`

**Template state on arrival:** all three already carried `WebPage` + `FAQPage` + `BreadcrumbList` JSON-LD and a visible 4-Q&A FAQ inside `<section class="section state-info">` with `<h3>` text matching the FAQPage schema exactly (parity 4/4 pre-existing) — no visible FAQ section needed. All three had **zero authoritative outbound citations** (`healthychildren.org`=0, `cdc.gov`=0); washington and arizona also had **no 88% stat anywhere on the page**.

**Template variant note:** unlike virginia (and the earlier PA/OH/GA/NC/MI/NJ batches), `washington.html` and `arizona.html` have **no State Intro section at all** — the hero runs straight into the Search Section. On those two the new TL;DR box is the page's first and only piece of authoritative safety copy above the FAQ, which makes it the highest-leverage insertion on the whole cluster. Watch for this variant on the remaining states.

Pattern applied per file (purely additive, +8 lines each, 0 deletions):
1. Added `speakable` to the existing WebPage node — cssSelector `[".tldr-box", ".page-hero h1", ".state-info h3"]`. Verified per-file that `.page-hero` and `.section state-info` both actually exist so the selector resolves (these three use `.state-info`, **not** `.faq-section`).
2. Inserted a "Quick Answer" TL;DR box between the hero `</section>` and the next section: AAP age-4-formal / age-1-familiarization guidance (hyperlinked to healthychildren.org), the AAP 88% risk-reduction stat, CDC leading-cause-of-death ages 1–4 (hyperlinked to cdc.gov/drowning), a state-specific risk hook, and an explicit layers-of-protection close (four-sided fencing / USCG life jackets / designated water watcher).
   - VA hook: Chesapeake Bay currents and drop-offs, Virginia Beach & Eastern Shore rip currents, unguarded reservoirs (Smith Mountain Lake, Lake Anna).
   - WA hook: cold-water shock — Puget Sound, the Columbia, and mountain-fed lakes stay cold year-round and can disable a strong swimmer within a minute; short outdoor season means limited in-water time.
   - AZ hook: one of the highest per-capita residential pool rates in the country, open nearly year-round, most young-child drownings occur during non-swim times; canals and irrigation ditches as a second hazard.

**Validation (json.loads + HTMLParser):** all JSON-LD parses clean `[WebPage, FAQPage, BreadcrumbList]` per file; tagerr=0 / stackleft=0 / nested-anchors=0 on all three (nested-`<a>` scan run explicitly per the known card-insert bug); exactly one tldr-box + one speakable per file; visible FAQ `<h3>` text matches schema question names exactly (parity=True, 4/4 each); every speakable cssSelector target confirmed present in the DOM; ≥1 healthychildren.org + ≥1 cdc.gov link + "88% reduction" stat now present in each; meta descriptions unchanged and ≤160 (134/155/133, decoded length); 0 brand-voice ownership violations in added copy (informational/directory voice only); all three staged as `M` with an additive diff (+24 / −0 total).

**Backlog:** 38 `swim-lessons/directory/{state}.html` pages remain. Done so far (14): texas, florida, california, new-york, illinois, pennsylvania, ohio, georgia, north-carolina, michigan, new-jersey, virginia, washington, arizona. Next by population: massachusetts, tennessee, indiana, maryland, missouri, wisconsin, colorado, minnesota, south-carolina, alabama. Also outstanding: `british-swim-school/{jersey-shore,northwest-philadelphia}.html`; `teens/scholarships.html`; `tools/family-water-safety-plan.html`. Listing/index pages + `*-printable.html` (noindex) + form pages remain deliberately excluded. Continue ~3 directory pages/run — **check each page's FAQ wrapper class (`.state-info` vs `.faq-section`), existing visible-FAQ parity, and whether a State Intro section exists at all** before applying the pattern.

## 2026-08-18 — AEO run (aeo-optimizer) — directory state cluster (Batch 38)
Worked from a fresh `origin/live` clone (`6ddf71f`). Continued the 52-page `swim-lessons/directory/{state}.html` cluster with the next three by population:
- `swim-lessons/directory/massachusetts.html`
- `swim-lessons/directory/tennessee.html`
- `swim-lessons/directory/indiana.html`

**Template state on arrival:** all three carried `WebPage` + `FAQPage` + `BreadcrumbList` JSON-LD and a visible 4-Q&A FAQ inside `<section class="section state-info">` with `<h3>` text matching the FAQPage schema exactly (parity 4/4 pre-existing) — no visible FAQ section needed. All three had a State Intro section present (unlike the washington/arizona variant from Batch 37). All three had **zero authoritative outbound citations** (`healthychildren.org`=0, `cdc.gov`=0) and **no 88% stat anywhere on the page** before this run. Note: `indiana.html` grep-reports `FAQPage`=2 but the second hit is inside an HTML comment (`<!-- State depth: bridge + visible FAQ (matches FAQPage schema) -->`), not a duplicate JSON-LD node — verified 3 blocks only.

Pattern applied per file (purely additive, +8 lines each, 0 deletions):
1. Added `speakable` to the existing WebPage node — cssSelector `[".tldr-box", ".page-hero h1", ".state-info h3"]`. Verified per-file that `.page-hero` and `.section state-info` both exist so the selector resolves (these three use `.state-info`, **not** `.faq-section`).
2. Inserted a "Quick Answer" TL;DR box between the hero `</section>` and the State Intro section: AAP age-4-formal / age-1-familiarization guidance (hyperlinked to healthychildren.org), the AAP 88% risk-reduction stat, CDC leading-cause-of-death ages 1–4 (hyperlinked to cdc.gov/drowning), a state-specific risk hook, and an explicit layers-of-protection close (four-sided fencing / USCG life jackets / designated water watcher).
   - MA hook: cold water + short outdoor season — the Atlantic off Cape Cod, the North Shore, and the South Coast stays cold enough to trigger cold-water shock; inland ponds, reservoirs, and flooded former quarries hide drop-offs and near-zero visibility; compressed pool season means less continuous in-water practice.
   - TN hook: the TVA reservoir/river system — Norris, Douglas, Chickamauga — steep bank drop-offs, submerged timber, cold water below the surface layer, heavy boat traffic, and mostly unlifeguarded shoreline; long warm season keeps backyard pools open year-round.
   - IN hook: two concentrations — the Lake Michigan shoreline in the northwest corner (structural currents along piers/breakwalls, sudden cold layers) and inland quarries, gravel pits, and farm ponds (deep, steep-sided, cold, unlifeguarded); short outdoor season compresses pool time.

**Validation (json.loads + HTMLParser):** all JSON-LD parses clean `[WebPage, FAQPage, BreadcrumbList]` per file; tagerr=0 / stackleft=0 / nested-anchors=0 on all three (nested-`<a>` scan run explicitly per the known card-insert bug); exactly one tldr-box + one speakable per file; visible FAQ `<h3>` text matches schema question names exactly (parity=True, 4/4 each); every speakable cssSelector target confirmed present in the DOM; ≥1 healthychildren.org + ≥1 cdc.gov link + "88% reduction" stat now present in each; DOM order verified hero → tldr-box → state-info; meta descriptions unchanged and ≤160 (139/135/133, decoded length); 0 brand-voice ownership violations in added copy (informational/directory voice only); all three staged as `M` with an additive diff (+24 / −0 total).

**Backlog:** 35 `swim-lessons/directory/{state}.html` pages remain. Done so far (17): texas, florida, california, new-york, illinois, pennsylvania, ohio, georgia, north-carolina, michigan, new-jersey, virginia, washington, arizona, massachusetts, tennessee, indiana. Next by population: maryland, missouri, wisconsin, colorado, minnesota, south-carolina, alabama, louisiana, kentucky, oregon. Also outstanding: `british-swim-school/{jersey-shore,northwest-philadelphia}.html`; `teens/scholarships.html`; `tools/family-water-safety-plan.html`. Listing/index pages + `*-printable.html` (noindex) + form pages remain deliberately excluded. Continue ~3 directory pages/run — **check each page's FAQ wrapper class (`.state-info` vs `.faq-section`), existing visible-FAQ parity, and whether a State Intro section exists at all** before applying the pattern.

## 2026-08-20 — AEO run (aeo-optimizer) — directory state cluster (Batch 39)
Worked from a fresh `origin/live` clone (`125aa77`) — the mounted workspace was 56 commits behind and carried unrelated uncommitted edits, so it was not used. Continued the 52-page `swim-lessons/directory/{state}.html` cluster with the next three by population:
- `swim-lessons/directory/maryland.html`
- `swim-lessons/directory/missouri.html`
- `swim-lessons/directory/wisconsin.html`

**Template state on arrival:** identical to Batch 38 — all three carried `WebPage` + `FAQPage` + `BreadcrumbList` JSON-LD and a visible 4-Q&A FAQ inside `<section class="section state-info">` with `<h3>` text matching the FAQPage schema exactly (parity 4/4 pre-existing), so no visible FAQ section was needed. Section order on all three is `page-hero` → search `section` → `section state-info` — **no separate State Intro section** (the washington/arizona variant from Batch 37, not the indiana variant), so the TL;DR box inserts directly between the hero `</section>` and the Search Section. All three had **zero** authoritative outbound citations (`healthychildren.org`=0, `cdc.gov`=0) and no 88% stat anywhere on the page before this run.

Pattern applied per file (purely additive, +7 lines each, 0 deletions):
1. Added `speakable` to the existing WebPage node — cssSelector `[".tldr-box", ".page-hero h1", ".state-info h3"]`. Verified per file that `.page-hero`, `.state-info`, and `.tldr-box` all resolve in the DOM (these three use `.state-info`, **not** `.faq-section`).
2. Inserted a "Quick Answer" TL;DR box after the hero: AAP age-4-formal / age-1-familiarization guidance (hyperlinked to healthychildren.org), the AAP 88% risk-reduction stat, CDC leading-cause-of-death ages 1–4 (hyperlinked to cdc.gov/drowning), a state-specific risk hook, and the layers-of-protection close (four-sided fencing / USCG life jackets / designated water watcher). Link color `#0369a1` per the WCAG-AA rule (brand `#0284c7` fails at 4.10:1).
   - MD hook: tidal water — the Chesapeake Bay and its tributaries drop off sharply past the shallows, near-zero visibility, tide-driven currents plus heavy recreational boat traffic; Ocean City Atlantic rip currents; dense backyard/community pool concentration in the Baltimore–suburban D.C. corridor.
   - MO hook: the big reservoirs (Lake of the Ozarks, Table Rock, Truman) — steep bank drop-offs, submerged timber, cold water below the surface layer, heavy boat traffic, mostly unlifeguarded shoreline; the Missouri and Mississippi Rivers (fast current, undertow, barge traffic); farm ponds and flooded quarries close to home.
   - WI hook: Lake Michigan and Lake Superior pier/breakwall structural currents plus cold-water shock through the summer; thousands of deep, steep-sided, unlifeguarded inland lakes, gravel pits, and flooded quarries; short outdoor season compressing pool time.

**Validation (json.loads + HTMLParser):** all JSON-LD parses clean `[WebPage, FAQPage, BreadcrumbList]` per file; tagerr=0 / stackleft=0 / nested-anchors=0 on all three (nested-`<a>` scan run explicitly per the known card-insert bug); exactly one tldr-box + one speakable per file; visible FAQ `<h3>` text matches schema question names exactly (parity=True, 4/4 each — note the 5th `<h3>` in the `state-info` window is "Leave a Review", part of the review widget, not a FAQ item); every speakable cssSelector target confirmed present; DOM order verified hero → tldr-box → state-info; ≥1 healthychildren.org + ≥1 cdc.gov link + "88% reduction" stat now present in each; meta descriptions unchanged and ≤160 (150/143/145, decoded length); 0 brand-voice ownership violations in added copy (informational/directory voice only); diff is additive (+21 / −0 across 3 files).

**Backlog:** 32 `swim-lessons/directory/{state}.html` pages remain. Done so far (20): texas, florida, california, new-york, illinois, pennsylvania, ohio, georgia, north-carolina, michigan, new-jersey, virginia, washington, arizona, massachusetts, tennessee, indiana, maryland, missouri, wisconsin. Next by population: colorado, minnesota, south-carolina, alabama, louisiana, kentucky, oregon, oklahoma, connecticut, utah. Also outstanding: `british-swim-school/{jersey-shore,northwest-philadelphia}.html`; `teens/scholarships.html`; `tools/family-water-safety-plan.html`. Listing/index pages + `*-printable.html` (noindex) + form pages remain deliberately excluded. Continue ~3 directory pages/run — **check each page's FAQ wrapper class (`.state-info` vs `.faq-section`), existing visible-FAQ parity, and whether a State Intro section exists** before applying the pattern.

## 2026-08-21 — AEO run (aeo-optimizer) — directory state cluster (Batch 40)
Worked from a fresh `origin/live` clone (`af07b29`) — the mounted workspace was **272 ahead / 60 behind** origin/live with unrelated uncommitted edits, so it was not used (its `aeo-progress.md` still ended at Batch 35 and would have shown a false backlog). Continued the 52-page `swim-lessons/directory/{state}.html` cluster with the next three by population:
- `swim-lessons/directory/colorado.html`
- `swim-lessons/directory/minnesota.html`
- `swim-lessons/directory/south-carolina.html`

**Template state on arrival — two changes since Batch 39:**
1. Section order is now `page-hero` → search `section` → **`dir-coverage`** → `section state-info`. The `dir-coverage` block is new; the TL;DR still inserts between the hero `</section>` and the Search Section, so placement is unaffected.
2. The visible FAQ is now **6 Q&As, not 4** (a downstream effect of the 2026-08-21 FAQPage answer-alignment commit `fe12a49`, which rewrote 110 Q&A pairs to match visible page text). Visible `<h3>` text matched the FAQPage schema question names exactly on arrival (parity 6/6), so **no visible FAQ section needed to be added**. All three still had **zero** authoritative outbound citations (`healthychildren.org`=0, `cdc.gov`=0) and no 88% stat before this run.

Pattern applied per file (purely additive, +7 lines each, 0 deletions):
1. Added `speakable` to the existing WebPage node — cssSelector `[".tldr-box", ".page-hero h1", ".state-info h3"]`. The WebPage block was located by **parsing each `ld+json` node and matching `@type`**, not by regex position (per the known wrong-block-match bug), then asserted unique before replacement.
2. Inserted a "Quick Answer" TL;DR box after the hero: AAP age-4-formal / age-1-familiarization guidance (hyperlinked to healthychildren.org), the AAP 88% risk-reduction stat, CDC leading-cause-of-death ages 1–4 (hyperlinked to cdc.gov/drowning), a state-specific risk hook, and the layers-of-protection close (four-sided fencing / USCG life jackets / designated water watcher). Link color `#0369a1` per the WCAG-AA rule (brand `#0284c7` fails at 4.10:1).
   - CO hook: cold water at altitude — Chatfield, Cherry Creek, Horsetooth, and Dillon stay cold enough all summer for cold-water shock with banks that drop off past the shallows; snowmelt-fed Arkansas / Colorado / Cache la Poudre rivers run fast into July with undercut rocks and strainers; a short outdoor season concentrates pool time at hotel, HOA, and community pools.
   - MN hook: thousands of deep, steep-sided, unlifeguarded lakes that turn sharply colder a few feet below the warm surface layer, plus docks, boat traffic, and weed beds; Lake Superior cold-water shock in midsummer; short season means kids spend more time near water than learning in it.
   - SC hook: Atlantic rip currents at Myrtle Beach, Hilton Head, and the Charleston beaches; tidal creeks and salt marsh behind the barrier islands with strong tide-driven currents and near-zero visibility; Lakes Murray, Marion, Moultrie, and Hartwell with steep drop-offs, submerged timber, and unlifeguarded shoreline; long warm season around backyard pools.

**Validation (json.loads + HTMLParser):** all JSON-LD parses clean `[WebPage, FAQPage, BreadcrumbList]` per file; tagerr=0 / stackleft=0 / nested-anchors=0 on all three; exactly one tldr-box + one speakable per file; visible FAQ `<h3>` text matches schema question names exactly (parity=True, 6/6 each); every speakable cssSelector target confirmed to resolve (`h1` inside `section.page-hero`; 7 `<h3>` inside `section.state-info` — 6 FAQ + "Leave a Review" review-widget heading); DOM order verified hero → tldr-box → state-info; ≥1 healthychildren.org + ≥1 cdc.gov link + "88% reduction" stat now present in each; meta descriptions unchanged and ≤160 (154/153/152, decoded length); 0 brand-voice ownership violations in added copy (informational/directory voice only).

**Note — no headless render this run:** the sandbox had no chromium/puppeteer cached and installing one conflicts with the mandatory npm-cache purge, so verification was structural (tag-balance parser + JSON parse + selector-resolution check) rather than rendered. The diff is additive markup only (one `<div>` + one JSON key per file), so visual regression risk is low, but a render sweep should be folded into the next css-regression run.

**Backlog:** 29 `swim-lessons/directory/{state}.html` pages remain. Done so far (23): texas, florida, california, new-york, illinois, pennsylvania, ohio, georgia, north-carolina, michigan, new-jersey, virginia, washington, arizona, massachusetts, tennessee, indiana, maryland, missouri, wisconsin, colorado, minnesota, south-carolina. Next by population: alabama, louisiana, kentucky, oregon, oklahoma, connecticut, utah, iowa, nevada, arkansas. Also outstanding: `british-swim-school/{jersey-shore,northwest-philadelphia}.html`; `teens/scholarships.html`; `tools/family-water-safety-plan.html`. Listing/index pages + `*-printable.html` (noindex) + form pages remain deliberately excluded. Continue ~3 directory pages/run — **check the FAQ wrapper class (`.state-info` vs `.faq-section`), the visible-FAQ Q&A count (now 6), and whether a State Intro / `dir-coverage` section exists** before applying the pattern.

## 2026-08-22 — AEO run (aeo-optimizer) — question-format H2 conversion + HowTo schema (Batch 41)

Worked from a fresh `origin/live` clone. **Changed track this run.** Batches 36–40 had been working the `swim-lessons/directory/{state}.html` cluster (TL;DR + speakable). Before continuing that, I re-scored **all 735 HTML files** against the six AEO signals rather than trusting the backlog list, because the progress file records intent, not live state.

**Scan result (545 article-class pages scored — `<article>`/`<main>`, ≥400 words, ≥2 H2s):**
- Priority-list items 1–10 from the skill spec are **already complete** (tldr + FAQPage + speakable all present). Item 6, `how-to-help-a-child-overcome-fear-of-water.html`, is a **redirect stub** pointing to `/education/fear-of-water.html` — correct behavior, not a defect, do not "optimize" it.
- 67 pages still fail at least one signal. The dominant failure is **not** missing TL;DR or FAQ schema — it is **question-format H2s**. 48 `/education/` articles carry tldr + FAQPage + speakable + citations but have emoji-prefixed *statement* H2s (`🛁 The Bathroom: Highest-Risk Room Indoors`), so AI answer engines have no heading text to match a user query against. This is the largest untouched AEO gap on the site and no prior batch addressed it.

**Optimized this run (3 files):**
- `education/home-water-safety-room-by-room-checklist.html` — 7 statement H2s → questions; H2 question ratio 0/10 → 7/10
- `education/backyard-pool-safety-layers-explained.html` — 5 statement H2s → questions; 0/7 → 5/7
- `education/silent-drowning-what-it-looks-like.html` — 5 statement H2s → questions; 0/7 → 5/7

Remaining non-question H2s on all three are utility sections (Authoritative Sources, Get the Free Printable, Frequently Asked Questions, Keep Reading) — correctly left alone.

**Emoji removed from converted content H2s**, matching the pattern already established on the AEO'd flagship `education/signs-of-drowning.html` (plain question H2s for content, emoji retained on `📚 Authoritative Sources` / `🖨️` utility headings).

**HowTo JSON-LD added** to the two procedural pages (`home-water-safety-room-by-room-checklist`: 6 steps; `backyard-pool-safety-layers-explained`: 5 steps). Step `text` was **extracted programmatically from each section's first visible `<p>`** rather than written by hand, so paraphrase drift against visible content is structurally impossible. Every step `url` is an in-page anchor asserted to resolve. `silent-drowning-what-it-looks-like.html` is explanatory, not procedural — no HowTo added, deliberately.

**Cannibalization guard (the reason this run is not just a find-and-replace).** New question H2s were diffed at 0.80 similarity against **every question heading sitewide** before shipping. Two collisions were caught and rewritten:
1. "What Water Hazards Are in the Kitchen and Laundry Area?" collided at 0.89 with `education/home-water-safety-framework.html` and `education/toddler-home-water-safety-checklist.html` → changed to **"What Should You Empty in the Kitchen and Laundry Room?"** (checklist-action framing, distinct from the "what hazards exist" framing those two pages own).
2. "How Should Parents Prepare for a Water Emergency at Home?" collided at 0.82–0.86 with **four** pages (`hotel-pool-safety`, `pool-party-host-safety-checklist`, `special-needs-water-safety-checklist`, `summer-water-safety-checklist`) → changed to **"What Emergency Skills and Supplies Should Every Home Have?"**.
Separately, `silent-drowning-what-it-looks-like.html` sits directly beside the 3,223-word flagship `education/signs-of-drowning.html`, which already owns 11 question H2s including "What Does Real Drowning Look Like vs. Hollywood Portrayals?" and "What Are the Visible Signs of Drowning to Watch For?". Its H2s were therefore steered onto the *silence* angle it uniquely owns ("Why Is Drowning Silent?", "What Does a Quiet Child in Distress Actually Look Like?", "What Did Researchers Find When They Studied Real Drownings?") instead of the obvious literal conversions, which would have put the smaller page into a link-equity fight it would lose.

**Gotcha for next run — emoji encoding is not consistent across files.** `home-water-safety-room-by-room-checklist.html` stores emoji as HTML entities (`&#x1F6C1;`), while the other two store raw UTF-8. A replacement table written against raw emoji silently matched **0 of 7** H2s on that file and the script reported success on the other two. Always assert `count(old)==1` per replacement and fail loudly.

**Validation:**
- All JSON-LD parses: `[Article, BreadcrumbList, FAQPage, HowTo]` / `[Article, FAQPage, BreadcrumbList, HowTo]` / `[Article, FAQPage, BreadcrumbList]`.
- FAQPage answer-vs-visible-text drift check re-run on all three: **0 drift**, 5 Q&A each (the Batch-40 `fe12a49` alignment still holds).
- All HowTo step text confirmed present verbatim in the rendered article text; all 11 step anchors resolve.
- All speakable cssSelectors confirmed to resolve (`.tldr-box`→1, `main h1`/`.article h1`→1, `.article-body > p:first-of-type`/`.article-excerpt`→1). None match zero.
- **DOM structure diffed against HEAD with scripts stripped: 273/273, 198/198, 192/192 elements, tag+id+class sequence byte-identical.** Only `<h2>` inner text changed plus one added head-level `<script>`. Zero CSS/layout regression surface — no heading levels changed, so no CSS pin needed, and every `<h2 id>` was preserved (in-page TOC anchors on all three files still resolve).
- TOC labels intentionally left as short nav labels (they were already non-verbatim before this run, so no new inconsistency introduced).
- `sitemap.xml` lastmod bumped for exactly these 3 URLs (real body-text change today) and re-parsed clean. No blanket bump.

**Note — no headless render this run:** sandbox had no chromium/playwright cached and installing one conflicts with the mandatory npm-cache purge. Mitigated by the DOM-structure equality check above, which is a stronger guarantee than a screenshot for a text-only diff.

**Backlog — reprioritized.** The 45 remaining `/education/` articles with statement-only H2s are now the top of the queue, ahead of the directory-state cluster, because they are long-form (1,368–2,730 words), already carry TL;DR + FAQ + citations, and are one heading rewrite away from being extractable. Highest word count first: `swim-lesson-levels-explained` (2,730, 6/14 questions), `swim-lesson-separation-anxiety-plan` (2,640, 1/10), `swimtastic-safesplash-swimlabs-comparison` (2,627, 4/10), `advocacy-affiliation-swim-school-test` (2,570, 3/11), `family-water-safety-risk-assessment` (2,296, 2/9), `swim-strokes-guide-kids` (2,231, 3/10), `community-pool-swim-lessons-vs-swim-school` (2,198, 2/9), `ymca-open-doors-swim-lesson-assistance` (2,180, 4/10), `new-jersey-pool-fence-law` (2,154, 1/9), `water-slide-safety-checklist` (2,097, 2/10), `indoor-pool-safety-checklist` (2,094, 0/8), `aqua-tots-nj-vs-local-swim-schools` (2,081, 4/10), `national-water-safety-action-plan-explained` (2,026, 1/13), `what-is-the-model-aquatic-health-code-mahc` (1,978, 3/8), `daycare-school-water-safety-questions-checklist` (1,966, 0/8). **Always run the sitewide 0.80-similarity dup check before committing new question H2s** — the checklist cluster reuses the same section topics across many pages and collisions are the norm, not the exception.

Also still outstanding and confirmed by this scan: `swim-lessons/index.html`, `about/index.html`, `gear/index.html`, `advertise/index.html` (no tldr / no speakable / no FAQ); `british-swim-school/{jersey-shore,northwest-philadelphia}.html` (no tldr, no speakable); and 4 short root articles that have TL;DR + question H2s but **no FAQPage schema at all** — `how-parents-can-support-swim-lessons-at-home`, `why-kids-need-swim-lessons-even-if-they-have-a-pool`, `why-year-round-swim-lessons-matter`, `how-long-should-swim-lessons-last`. Those four are the cheapest remaining wins. 29 `swim-lessons/directory/{state}.html` pages remain on the older track.

## 2026-08-23 — AEO run (aeo-optimizer) — question-format H2 conversion + HowTo schema (Batch 42)

Worked from a fresh `origin/live` clone (`77280b8`). The mounted workspace was again stale — its `aeo-progress.md` ended at **Batch 35** and its `live` branch sat at `2476831c`, which would have produced a false backlog (it still listed the directory-state cluster as the priority). Confirms the standing rule: audit the clone, not the mount.

**Re-scored all `/education/` pages live rather than trusting the Batch-41 backlog list.** 38 indexable education articles still score <50% question H2s. Two names from Batch 41's "highest word count first" queue — `swim-lesson-levels-explained` and `swimtastic-safesplash-swimlabs-comparison` — no longer appear, so the recorded backlog was already partly stale. `education/index.html` (13,985w, q1/9) is a **listing hub** and is correctly excluded, not a defect.

**Optimized this run (3 files), all previously carrying tldr + FAQPage + speakable + citations and failing only on heading extractability:**

| File | Words | H2 question ratio | HowTo |
|---|---|---|---|
| `education/swim-lesson-separation-anxiety-plan.html` | 2,946 | 1/7 → **7/7** | 5 steps |
| `education/advocacy-affiliation-swim-school-test.html` | 2,789 | 3/9 → **9/9** | 4 steps (PT10M) |
| `education/family-water-safety-risk-assessment.html` | 2,512 | 2/6 → **6/6** | 5 steps |

All three now sit at a **100% question ratio on content H2s**. Utility headings (`📚 Authoritative Sources`, `Frequently Asked Questions`, `🖨️ Get the Free Printable…`, `Keep Reading`) were left as statements with emoji intact, matching the flagship `education/signs-of-drowning.html` pattern.

**Method note — replace by `id`, not by heading text.** Batch 41 was burned by emoji encoding drift (entities on one file, raw UTF-8 on another, a replacement table matching 0/7 while reporting success). This run sidestepped the problem entirely by matching `<h2 id="…">…</h2>` and replacing the **inner content wholesale**, asserting `count(id)==1` per replacement before substituting. Encoding was in fact mixed again — `swim-lesson-separation-anxiety-plan.html` and `family-water-safety-risk-assessment.html` store emoji as entities (`&#x1F62D;`), `advocacy-affiliation-swim-school-test.html` stores them raw — so a text-keyed table would have failed again. **Keep using the id-keyed approach.**

**Every section already opened with an answer-first sentence** (verified by extracting each section's first `<p>`), so no body copy was rewritten. The gap on these pages was purely heading text — the diff is heading-text-only plus one added head-level `<script>` per file.

**Cannibalization guard.** All 22 new/normalized question headings were diffed at 0.80 similarity against **6,578 question headings sitewide** (every `h1`/`h2`/`h3` ending in `?` across all 735 HTML files). **Zero collisions** — the rarest clean result so far, because these three pages occupy distinct niches (toddler separation anxiety, swim-school vetting, household risk scoring) rather than the checklist cluster where Batch 41 hit six collisions.

**HowTo JSON-LD added to all three.** Step `text` was extracted **programmatically from visible page content**, never hand-written, so paraphrase drift is structurally impossible:
- `swim-lesson-separation-anxiety-plan` — 5 steps from each section's first `<p>` (ramp-up → goodbye → watch → reinforce → check for non-separation causes).
- `family-water-safety-risk-assessment` — 5 steps from each section's first `<p>`, resequenced into procedural order (learn layers → score 25 questions → score your average day → fix lowest layer → re-score each spring).
- `advocacy-affiliation-swim-school-test` — **first draft was wrong and was rebuilt.** Taking the `#applying-the-test` first `<p>` yielded `"You can do the entire test from a phone in a waiting room:"` — a colon-terminated list lead-in, verbatim but useless as a step. Replaced with the section's **four `<li>` items** (Website check 3 min / Social feed check 3 min / Google check 2 min / One phone question 2 min), each verbatim, `totalTime: PT10M`. **Lesson: when a section's first `<p>` ends in a colon it is a list stem, not a step — pull the `<li>`s instead.**

**Validation:**
- JSON-LD parses clean on all three: `[Article, BreadcrumbList, FAQPage, HowTo]`.
- Tag balance: tagerr=0 / stackleft=0 / nested-anchors=0 on all three.
- **All 14 HowTo step texts confirmed verbatim** in the tag-stripped rendered text; all 14 step anchors resolve to a real `id`.
- FAQPage answer-vs-visible drift re-checked: **0 drift** (6 / 5 / 6 Q&A).
- Speakable selectors **resolved with soupsieve, not grepped** — `.tldr-box`→1, `.article h1`→1, `.article-excerpt`→1, `.article > p:first-of-type`→1 on each file. None match zero.
- **DOM structure diffed against HEAD with scripts stripped: 232/232, 243/243, 232/232 elements — tag + id + class sequence byte-identical.** Only `<h2>` inner text changed. Zero CSS/layout regression surface; no heading levels changed so no CSS pin needed; every `<h2 id>` preserved.
- All in-page `#` anchors resolve on all three (TOC nav labels left as short labels, per Batch 41 precedent — they were already non-verbatim).
- Meta descriptions unchanged and ≤160 decoded (151 / 154 / 144).
- Brand-voice scan: 5 hits, **all false positives, all pre-existing** — `"Does your school participate…"` (a script the parent reads aloud), `"all our instructors are wonderful people"` (a quoted example of a *bad* answer), and `"Our pool fence and gate inspection checklist"` (self-referential link to a WWK guide). No ownership language was added.
- `sitemap.xml` lastmod bumped for **exactly these 3 URLs** (2026-08-14 / 2026-08-14 / 2026-08-18 → 2026-08-23) and re-parsed clean. No blanket bump.

**Note — no headless render this run:** the sandbox had no chromium cached and installing one conflicts with the mandatory npm-cache purge. Mitigated by the DOM-signature equality check above, which for a text-only diff is a stronger guarantee than a screenshot.

**Backlog — 35 `/education/` articles remain with <50% question H2s.** Next by word count: `community-pool-swim-lessons-vs-swim-school` (2,420, 2/7), `water-slide-safety-checklist` (2,361, 2/7), `swim-strokes-guide-kids` (2,351, 3/7), `new-jersey-pool-fence-law` (2,328, 1/7), `indoor-pool-safety-checklist` (2,310, **0/5**), `national-water-safety-action-plan-explained` (2,208, 1/11), `daycare-school-water-safety-questions-checklist` (2,204, **0/5**), `water-rescue-reach-throw-dont-go-card` (2,173, 1/7), `rolling-recovery-jump-recovery-methods` (2,123, **0/5**), `end-of-summer-swim-skills-report-card` (2,117, 1/7), `swim-milestones-by-age` (2,113, 3/8), `spot-drowning-warning-signs-card` (2,101, **0/6**), `independent-swimming-readiness-checklist` (2,017, **0/5**), `free-reduced-swim-lessons-make-a-splash` (2,007, **0/5**), `drowning-cpr-quick-card` (2,002, **0/5**). The `*-card` and `*-checklist` pages are the collision-prone cluster — **run the sitewide 0.80 dup check before committing**, it is the norm there, not the exception. Behind that: 29 `swim-lessons/directory/{state}.html` pages still lack a TL;DR (alabama, alaska, arkansas, connecticut, delaware, hawaii, idaho, iowa, kansas, kentucky, louisiana, maine, mississippi, montana, nebraska, nevada, new-hampshire, new-mexico, north-dakota, oklahoma, oregon, rhode-island, south-dakota, utah, vermont, washington-dc, west-virginia, wyoming — `directory/index.html` is a listing page, excluded); plus `british-swim-school/{jersey-shore,northwest-philadelphia}.html`, `teens/scholarships.html`, `tools/family-water-safety-plan.html`.

---

## Run 2026-08-24 — Batch 43: the backlog was scoped to `/education/` only

**Headline finding: the AEO backlog has only ever tracked `/education/`, and that hid a class of failing pages.** Re-scoring all 658 indexable pages live (not trusting the Batch-42 list) returned 71 pages under 50% question H2s — but **34 of them sit outside `/education/`** and had therefore never entered the queue. Among them are genuine long-form articles, not hubs: `special-needs-swimming.html` (3,514w, 1/7) was the single largest failing real article on the site and had never been picked up. **Widen the scoring scope, not just the queue depth.**

**Listing pages are false positives — exclude the class, don't "fix" it.** `swim-lessons/directory/new-jersey.html` scored 0/4 and looked like the #2 target. Inspecting it showed 47 `<h3>` school listings and four statement H2s that are correctly statements (`Cities We Cover`, `Local Swim Lesson Guides in New Jersey`). Same for `pennsylvania.html`, `education/index.html`, `statistics/state-of-drowning-prevention/index.html`, and the `*/index.html` hubs. Converting those to questions would have been active damage to the money product. **A low question ratio on a listing page is not a defect.**

**Optimized this run (3 files):**

| File | Words | H2 question ratio | Other changes |
|---|---|---|---|
| `special-needs-swimming.html` | 3,514 | 1/7 → **7/7** | — |
| `adult-swimming-lessons.html` | 1,611 | 1/7 → **6/7** | FAQPage 5 → **8** Q&A; +CDC citation |
| `education/daycare-school-water-safety-questions-checklist.html` | 1,871 | 0/5 → **5/5** | +CDC statistic |

`adult-swimming-lessons.html` sits at 6/7 because `Common Questions About Adult Swim Lessons` is a FAQ container heading, left as a statement per the utility-heading convention.

### Method notes

**Two different replacement strategies were required in the same run — a text-keyed table would have silently no-opped.** The daycare file stores emoji as entities (`&#x1F50D;`) while the two top-level files store them raw, so `raw_html.count(str(h2_node))` returned **0 for all 8 daycare headings** and **1 for every top-level heading**. Confirms the standing rule: bs4 re-serializes entities, so never string-match bs4 output against the raw file. Used **id-keyed inner-replacement** on the daycare file (ids present, emoji prefix re-attached programmatically) and **outerHTML replacement with an asserted `count==1`** on the two top-level files (no heading ids exist there at all). Every substitution asserted before and after.

**The 0.80 dup check found 7 collisions in 16 proposed headings — and twice the right answer was to defer, not rephrase.** Checked against **6,672 question headings sitewide**. Worst was `How Do You Overcome Fear of Water as an Adult?` at **0.95** against `education/adult-learn-to-swim.html`, which is the dedicated page for that query — and which itself carries two near-duplicate headings 0.95 apart internally (pre-existing, flagged below). Similarly `Is Aquatic Therapy the Same Thing as a Swim Lesson?` hit 0.90 against `education/aquatic-therapy-kids.html`. In both cases the hub was rephrased to a *decision* query (`Should Your Child Do Aquatic Therapy, Swim Lessons, or Both?`) so the dedicated page keeps the *definitional* query. Final state: **0 collisions**.

**Speakable was verified, not extended.** Both top-level pages carry only `{.tldr-box, h1}` versus the education template's four selectors. Resolving the education selectors against them showed `.article-body`, `.article`, `<article>` and `<main>` **all return 0** — those pages use an older template with no article wrapper. Adding the richer selector list would have recreated the inert-speakable bug of 2026-08-19. Left as-is; both selectors resolve to 1.

**Citation/statistic gaps closed from the site's own canonical phrasings, not invented.** `adult-swimming-lessons.html` had only one authoritative org (Red Cross); `daycare-school-water-safety-questions-checklist.html` had five outbound authority links but **zero attributed numbers**. Both fixed by grepping the sitewide canonical CDC phrasing first and matching it (`roughly 4,000 fatal unintentional drownings each year`, `leading cause of unintentional injury death for children ages 1–4`), both linked to `cdc.gov/drowning/data-research/facts/`.

### Validation
- Tag balance `tagerr=0 / stackleft=0`, nested anchors `0`, unsubstituted `__PLACEHOLDER__` `0` on all three.
- JSON-LD parses clean; entity leaks inside JSON-LD **0**.
- **FAQ drift 0** across 6 / 8 / 5 Q&A, checked tag-stripped and whitespace-normalised, with `Q:`/`A:` prefixes stripped before comparison.
- DOM signature diff vs HEAD (scripts stripped): `special-needs-swimming.html` **byte-identical, 359/359** (heading text only). The other two differ by **exactly +1 `<a>`** — the added CDC citation. No other structural change.
- Brand-voice ownership scan: **0 hits** on all three.
- Link check: all internal hrefs and `#` anchors resolve. One anchor/destination mismatch flagged and **dismissed as a false positive** — `American Academy of Pediatrics` → `healthychildren.org` is correct, that is the AAP's official parent-facing site.
- `sitemap.xml` lastmod bumped for **exactly these 3 URLs** and re-parsed clean (635 entries). No blanket bump.

### Flagged for Michael — not changed
1. **`education/daycare-school-water-safety-questions-checklist.html` has meaning carried by an `<em>` that JSON-LD strips.** The visible line reads *"Vague answers such as 'someone is always watching' <em>are</em> the answer"* — the italic is what makes it parse. In the FAQ schema the emphasis is gone and the sentence reads as self-contradictory to a machine reading it. The answer is otherwise verbatim, so this is a copy decision, not a drift bug. Suggest rewording the visible sentence so it stands alone.
2. **`education/adult-learn-to-swim.html` carries two near-duplicate question headings on the same page** (`How do I overcome fear of water as an adult?` and `How Can You Overcome Fear of Water as an Adult?`, 0.95). Pre-existing, self-cannibalizing.
3. **`adult-swimming-lessons.html` has two separate FAQ containers** (`Common Questions About Adult Swim Lessons`, 6 Q&A, and `Frequently Asked Questions`, 2 Q&A). Now unified in the schema at 8 Q&A, but the page structure remains split.

### Backlog
**68 pages remain under 50% question H2s**, of which roughly 34 are `/education/` and **~30 are non-education pages that were never queued** — including `teens.html`, `swim-lessons-monmouth-county-kids.html`, `swim-lessons-jersey-shore.html`, `swim-lessons-ocean-county-nj.html`, `british-swim-school/{jersey-shore,northwest-philadelphia}.html`, and the `swim-lessons/{brick,howell,asbury-park}-nj.html` town pages. Screen each for listing-vs-article before queueing. Next by size among true articles: `education/swim-strokes-guide-kids.html` (1,749w, 3/7), `education/community-pool-swim-lessons-vs-swim-school.html` (1,701w, 2/7), `education/autism-wandering-water-safety.html` (1,699w, 4/9), `education/new-jersey-pool-fence-law.html` (1,617w, 1/7).

---

## Run 2026-08-25 — Batch 44: the largest true article on the backlog, and a step-by-step card that had no HowTo

Re-scored **all 741 HTML files** in a fresh `origin/live` clone rather than trusting the Batch-43 backlog list (per the standing rule: re-derive scope every run). 55 indexable pages with ≥4 H2s and ≥900 words scored under 50% question H2s. After screening out the listing class (`education/index.html` at 14,571w/356 `<h3>`, `swim-lessons/directory/{new-jersey,pennsylvania}.html`, `aquatic-jobs/index.html`, `scholarships/index.html` — all correctly statement-headed), the largest remaining **true articles** were the three optimized below.

**Optimized this run (3 files):**

| File | Words | H2 question ratio | Other changes |
|---|---|---|---|
| `education/swim-lesson-levels-explained.html` | 3,521 | 6/16 → **13/16** | — |
| `education/swimtastic-safesplash-swimlabs-comparison.html` | 2,884 | 4/11 → **8/11** | — |
| `education/water-rescue-reach-throw-dont-go-card.html` | 2,795 | 2/13 → **8/13** | **+HowTo JSON-LD (4 steps)** |

All three finished at **100% of convertible H2s**. The residual non-question headings are the three utility headings the site convention leaves alone (`📚 Authoritative Sources`, `Frequently Asked Questions`, `Keep Reading`), plus two CTA headings on the rescue card (the printable block and the email-capture block).

### Method notes

**The numbered-ladder page needed a heading pattern, not free rewriting.** `swim-lesson-levels-explained.html` carries six sequential `Level N: <skill>` H2s. Converting them to bare questions would have destroyed the scannable ladder *and* produced six sibling headings ~0.9 similar to each other. Keeping the `Level N:` label as a prefix and making only the predicate a question (`Level 3: When Do Kids Start Learning Strokes?`) preserved the ladder and kept intra-batch similarity below 0.80 on every pair.

**Three headings on the comparison page were questions that didn't end in one.** `🐬 What Is Swimtastic? The Beginner-Focused Brand` reads as a question to a human but terminates in a label, so a heading-text match against a query stops at the wrong token. Re-formed as `🐬 What Is Swimtastic, and Which Ages Is It Built For?` — same content, extractable terminus.

**One collision, and the fix was to re-aim the section, not reword it.** `Step 3: Why Shouldn't You Swim Out to a Drowning Person?` hit **0.826** against this page's own FAQ `<h3>` (`Why shouldn't I just swim out to save a drowning person?`) — the self-cannibalization pattern flagged in Batch 43. Instead of paraphrasing, the H2 was pointed at the query the *section* uniquely answers (the exception): **`Step 3: When Is It Ever Safe to Go In After Someone?`** The FAQ keeps the "why not" query; the section owns the "when is it OK" query. Final: **0 collisions across 17 proposed headings vs 6,720 question headings sitewide.** Zero intra-batch collisions.

**Two emoji encodings again, in the same run.** `water-rescue-*` stores emoji as entities (`&#x1F91A;`), `swimtastic-*` stores them raw, `swim-lesson-levels-*` has none. Handled by id-keyed **raw-file** regex replacement that captures and re-emits the leading emoji/entity prefix verbatim, with `count==1` asserted per heading. bs4 output was never string-matched against the raw file.

**HowTo step text pulled programmatically.** Four steps for the rescue card, each the verbatim first `<p>` of its section, with an assertion that no lead `<p>` ends in a colon (the list-stem trap from Batch 42). Each step `url` anchors to a real `id`.

### Validation
- **DOM signature diff vs HEAD, scripts stripped: 522/522, 234/234, 243/243 elements — tag + id + class sequence byte-identical on all three.** Only `<h2>` inner text changed; every `<h2 id>` preserved. Zero layout regression surface, so no render sweep was warranted for a text-only diff.
- Head integrity parsed with **html5lib**: 16 metas in `<head>`, **0 metas in `<body>`**, canonical in head on all three (no unescaped-quote break).
- JSON-LD parses clean: `[Article, BreadcrumbList, FAQPage]` ×2 and `[Article, BreadcrumbList, FAQPage, HowTo]`. No HTML entities leaked inside JSON-LD.
- **FAQ answer drift 0** across 6 / 5 / 6 Q&A (tag-stripped, whitespace-normalised).
- **All 4 HowTo step texts confirmed verbatim** in rendered text; all 4 anchors resolve.
- Speakable resolved with soupsieve, not grepped: all four selectors → exactly 1 match on each file.
- In-page `#` anchors all resolve. TOC labels left as short non-verbatim labels, per Batch 41/42 precedent.
- Meta descriptions unchanged (155 / 158 / 146 decoded). Unsubstituted `__PLACEHOLDER__` 0. Nested anchors 0. Brand-voice ownership scan **0 hits**.
- Citations/statistics were already present and hyperlinked on all three (CDC, AAP/healthychildren.org, Red Cross, NDPA, USCG) — nothing invented, nothing added.
- `dateModified` bumped to 2026-08-25 in all three Article schemas; `sitemap.xml` lastmod bumped for **exactly these 3 URLs** and re-parsed clean (636 entries). No blanket bump.

### Backlog
**51 true-article pages remain under 50% question H2s** (13 listing-class pages excluded as correct-by-design, not queued). Next by word count: `education/swim-milestones-by-age.html` (2,574w, 3/11), `education/water-slide-safety-checklist.html` (2,545w, 2/12), `education/indoor-pool-safety-checklist.html` (2,494w, **0/10**), `education/community-pool-swim-lessons-vs-swim-school.html` (2,412w, 2/10), `education/ymca-open-doors-swim-lesson-assistance.html` (2,401w, 4/11), `education/swim-strokes-guide-kids.html` (2,341w, 3/10), `education/aqua-tots-nj-vs-local-swim-schools.html` (2,331w, 4/11), `education/new-jersey-pool-fence-law.html` (2,320w, 1/10). The `*-card` / `*-checklist` cluster dominates the next tier — **run the sitewide 0.80 dup check before committing there, collisions are the norm.** Nine non-education pages also remain (`swim-schools.html`, `find-swim-lessons.html`, `british-swim-school/{jersey-shore,northwest-philadelphia}.html`, and five `swim-lessons/*` town pages) — screen each for listing-vs-article first.

## 2026-08-27 — AEO run (aeo-optimizer) — Batch 46 (question-H2 + first-citation pass)
Scope re-derived from a fresh `origin/live` clone at `8642016` (410 indexable `education/*.html` articles re-scored). Optimized:
- `education/pool-chemistry-basics-for-parents.html` — **0/5 → 5/5** question H2s.
- `education/beach-sand-hole-collapse-safety.html` — 1/6 → **6/6**, **+ first external authority citations on the page** (USLA beach safety, NWS beach hazards, CDC drowning facts, AAP drowning prevention) + `.article h1` added to speakable.
- `education/pool-skills-vs-open-water-transfer.html` — 1/6 → **6/6**, **+ first external authority citations** (NWS rip currents, USCG life jackets, CDC drowning facts, AAP) + `.article h1` added to speakable.

All three already had Article + FAQPage + BreadcrumbList + tldr-box + speakable; headings were the primary gap, and two of the three had **zero** outbound authority links.

**Scorer correction (backlog shrank again).** Added `Keep Reading` and `More from/on` to the non-convertible SKIP set — they are sitewide navigational convention H2s, never convertible, and were inflating denominators (turned `pool-chemistry-basics` from 0/6 into its true 0/5, `poolside-emergency-kit` from 1/7 into 1/6). Under-50% count: **23 → 22** from that fix alone, then **22 → 19** after this batch. Note the `aap` flag in the scorer greps `healthychildren.org` only, so pages citing `aap.org/en/patient-care/drowning-prevention-and-water-safety/` (e.g. pool-chemistry-basics) read as `aap=0` — check both domains before concluding a citation gap.

**Deliberate deferral.** `education/teaching-kids-safe-pool-entry.html` is now the worst-scoring page (1/7) but was **skipped**: its five body H2s are the visible counterparts of a 5-step HowTo JSON-LD (`Stop and check`, `Start with the seated slide-in`, …). Rewriting them to questions would break HowTo step↔visible-content correspondence. It needs a paired heading + HowTo `step.name` rewrite in one pass — handle it as its own batch, not inside a heading-only run.

**Collision handling.** 16 proposals scored against a **9,597-heading** sitewide corpus (h1+h2+h3, all 660+ pages) plus intra-batch. Two re-aims: (a) `What Free Chlorine Level Is Safe for a Pool?` scored **0.900** against `pool-chemical-safety.html`'s FAQ "What chlorine level is safe for pools?" — that page is the topical owner, so re-aimed to `What Does Free Chlorine Actually Do in a Pool?`; (b) `Do Pool Swimming Skills Transfer to Open Water?` scored **0.889** against **its own H1** — re-aimed to `Why Do Parents Assume a Pool Swimmer Is Ready for Open Water?`. Scorer refinement: matches against a heading that is itself being replaced on the same file are false positives and are now excluded from that file's corpus. Final set worst score **0.771** (vs unrelated topics: hair care, heat illness), 0 collisions.

**Byte note:** `pool-chemistry-basics` H2 emoji prefixes are **raw UTF-8** (🧪 ⚖️ ☀️ 🚩 📋 📚), not HTML entities — replacements preserved exact prefix bytes and all `id` attributes.

**Validation (html5lib + HTMLParser balance + json.loads):** tagerr=0 / stackleft=0 on all three; 0 body metas, canonical in head; JSON-LD parses clean (`Article`, `FAQPage`, `BreadcrumbList`) with jerr=0; FAQ schema↔visible parity 5/5 each; speakable 3/3 selectors resolving per file; `headline` == `h1` on all three; meta descriptions 151/152/153 (≤160); **0 existing text nodes removed or altered** on any file — the only added text is the 4 new source `<li>` per file on the two citation-gap pages; 0 brand-voice ownership hits. External URLs GET-probed: weather.gov/aap.org/uscgboating.org/redcross.org = 200; cdc.gov + usla.org = 403 **WAF false positives** (both already in sitewide use 381× and 7× respectively).

`dateModified` + sitemap `lastmod` bumped to 2026-08-27 for exactly these 3 URLs (638 entries, XML re-parsed, count unchanged). Pushed as `c85a3b6`; **live-verified** — 17 question H2s serving, both new Authoritative Sources blocks live, all three `dateModified` and sitemap `lastmod` live.

**Backlog: 19 education articles under 50%.** Next by score: `teaching-kids-safe-pool-entry` (1/7 — **HowTo-paired, own batch**), `free-reduced-swim-lessons-make-a-splash` (1/6), `poolside-emergency-kit-checklist` (1/6), `body-awareness-exercises-swimmers` (1/5), `drowning-cpr-quick-card` (1/5), `independent-swimming-readiness-checklist` (1/5), `swimmers-ear-prevention-checklist` (1/4), `national-water-safety-action-plan-explained` (3/11), `new-jersey-pool-fence-law` (2/7), `water-slide-safety-checklist` (2/7), `cloudy-pool-water-safety-signal` (2/6). Listing pages (`education/index.html`, `scholarships/index.html`), `*-printable.html` (noindex), and form/utility pages remain excluded as classes.

---

## Run 2026-08-28 — Batch 47: the deferred HowTo-paired page, and the zero-citation class

Scope re-derived from a fresh `origin/live` clone at `9c29803` (the mount was again stale at `2476831c` — audit the clone, not the mount). All 499 `education/*.html` re-scored.

**New audit axis added this run: outbound authority links.** The question-H2 scorer had never checked whether a page cites anything. Cross-scoring found **4 true articles ≥900 words with zero external authority links** (`schema.org` excluded) — a page that cites no authority cannot plausibly be cited *as* one, which is the whole point of AEO. Two of the four were also the worst-scoring pages on the heading backlog, so they were taken together.

**Optimized this run (3 files):**

| File | Words | H2 question ratio | Other changes |
|---|---|---|---|
| `education/teaching-kids-safe-pool-entry.html` | 1,554 | 0/7 → **7/7** | HowTo steps re-bound + verbatim; **0 → 5 authority links** |
| `education/swim-test-deep-end-readiness.html` | 1,552 | 0/6 → **6/6** | **0 → 5 authority links**; stray `</p>` repaired |
| `education/rolling-recovery-jump-recovery-methods.html` | 2,100 | 0/5 → **5/5** | headings only |

All three finish at **100% of convertible H2s**. Residual statement headings are the sitewide utility set only (`📚 Authoritative Sources`, `Frequently Asked Questions`, `Keep Reading`).

### The Batch-46 deferral, resolved

`teaching-kids-safe-pool-entry.html` was explicitly skipped last run because its five body H2s were the visible counterparts of a 5-step HowTo and rewriting them would break step↔content correspondence. **The correspondence was never machine-readable in the first place** — it was implicit text similarity, and the HowTo steps carried no `url`. Fixed properly:

- Each `HowToStep` gained a `url` anchoring it to the real section `id` (`#stop-check`, `#seated`, `#feet-first`, `#diving`, `#exit`), making the binding explicit rather than inferred.
- Each `step.text` was **replaced with the verbatim first `<p>` of its section**, extracted programmatically, with an assertion that no lead `<p>` ends in a colon (the list-stem trap from Batch 42). The previous step texts were hand-written paraphrases — drift was possible; it now is not.
- Only then were the H2s converted to questions. Because the binding is by `id`, heading text is now free to be query-shaped without touching the HowTo.

**Generalizable: when a HowTo blocks a heading rewrite, bind the steps by `url` first. The block dissolves.**

### The zero-citation class

Both zero-citation pages already *named* an authority in a `stat-box` but **never linked it** — `teaching-kids` said "The American Academy of Pediatrics (AAP) lists swimming competence among the layers of protection…", `swim-test` said "According to the U.S. Centers for Disease Control and Prevention (CDC)…". A presence grep for `aap.org`/`cdc.gov` reads these as uncited; a human reading the page sees an attribution. **Both were hyperlinked in place** rather than duplicated, then each page received the canonical `📚 Authoritative Sources` block (4 links, matching the `rolling-recovery` markup pattern) inserted **before** `<h2 id="faq">` per the poolside/independent-readiness convention, plus a matching `toc-item`.

A second `stat-box` was initially added to `swim-test` before the pre-existing CDC one was noticed; it was **removed** rather than shipped. Check for an existing stat-box before adding one — this template has them and they are easy to miss under a `<div>` with inline styles.

**Nothing was invented.** All 8 source URLs are already in sitewide use (621×/433×/282×/181×/19×) and were GET-probed: aap.org, redcross.org, healthychildren.org = 200; cdc.gov, poolsafely.gov = 403 **WAF false positives**. No new statistic was authored — the only numbers on these pages are the pre-existing CDC attribution, now linked.

### Method notes

- **id-keyed raw-file replacement with emoji-prefix capture.** `rolling-recovery` stores emoji as raw UTF-8 (🔄 ⚖️ 🏊 🚸 🔎); the other two have none but `swim-test` carries `&mdash;` entities and a raw `"` inside an H2. A regex captured the leading emoji/entity run and re-emitted it byte-for-byte; `count==1` asserted per heading before and after. bs4 output was never string-matched against the raw file.
- **Pre-existing tag defect found and fixed.** `swim-test-deep-end-readiness.html` had a stray `</p>` inside its `stat-box` (no opening `<p>`) at line 123 col 586 — confirmed **identical in HEAD**, so not introduced here. Removed; element counts unchanged (`p` stays at 22), so it was purely a validator defect, not a layout one.
- **Speakable extended, not assumed.** Both top-level education pages carried only `{.article-excerpt, .tldr-box}`. `.article h1` was **resolved with soupsieve first** (→1 on both) and only then added — the 2026-08-19 inert-speakable bug was caused by adding selectors that matched nothing.
- **TOC labels left as short non-verbatim labels**, per Batch 41/42 precedent. `rolling-recovery`'s `#what-to-ask` label ("Questions to Ask a Swim School") still describes its section accurately after the heading re-aim.

### Collision handling

18 proposals scored at 0.80 against a **6,877-heading** sitewide corpus (h1+h2+h3 ending in `?`, 747 files) plus intra-batch, excluding each file's own heading-being-replaced. **Two collisions, both re-aimed rather than reworded:**

1. `What Pool-Entry Rules Should Every Family Set?` — **0.809** vs `safe-diving-rules-kids.html :: What diving rules should every family post?`. That page owns the postable-family-rules query, so this section was re-aimed at what it uniquely covers: **`Which Entry Habits Should Kids Drill Until They Are Automatic?`**
2. `What Should You Ask a Swim School About These Methods?` — **0.815** vs *two* instructor-vetting pages (`swim-instructor-employment-model`, `full-time-vs-part-time-swim-instructors`) sharing the identical heading, and 0.800 vs a third. Re-aimed to the method-specific query: **`How Do You Tell If a Program Teaches Both Recovery Methods?`**

Final set: **worst score 0.742, zero collisions.** Note the `swim-test` page's six FAQ `<h3>`s already own the obvious definitional queries ("What is a pool swim test?", "What does a swim test check for?"), so all six H2s had to be aimed at *different* angles than the FAQ — self-cannibalization was the binding constraint on that file, not the sitewide corpus.

### Validation
- Tag balance `err=0 / stackleft=0` on all three (swim-test now clean, was 1 pre-existing).
- html5lib head integrity: 16 metas in `<head>`, **0 metas in `<body>`**, canonical in head, on all three.
- JSON-LD parses clean — `[Article, HowTo, BreadcrumbList, FAQPage]`, `[Article, BreadcrumbList, FAQPage]`, `[Article, FAQPage, BreadcrumbList]`; `jerr=0`; **0 HTML entities leaked inside JSON-LD**.
- **FAQ schema↔visible drift 0** across 5/5/5 Q&A (tag-stripped, whitespace-normalised, both question and answer).
- **All 5 HowTo step texts confirmed verbatim** in rendered text; all 5 `url` anchors resolve to a real `id`.
- Speakable resolved with soupsieve: every selector → exactly 1 on every file. None match zero.
- `headline == h1` on all three. Meta descriptions unchanged, decoded 155 / 157 / 154 (≤160).
- Nested anchors 0. Unsubstituted `__PLACEHOLDER__` 0. Brand-voice ownership scan **0 hits**. All internal `#` anchors and site-relative hrefs resolve.
- **DOM signature diff vs HEAD, scripts stripped.** `rolling-recovery`: **190/190 elements, tag+id+class sequence byte-identical** — heading text only. `teaching-kids`: 178→190, accounted for exactly (+1 inline `<a>`, +1 `h2#sources`, +1 `ul`, +4 `li`, +4 `a`, +1 toc `a`). `swim-test`: 183→195, same accounting. `p` count unchanged on all three.
- **Text-node diff:** every "removed" string is either a replaced heading or a sentence split by an inserted `<a>` — **no prose was deleted or altered** on any file.
- `dateModified` bumped 2026-06-21 / 2026-06-21 / 2026-04-22 → **2026-08-28**; `sitemap.xml` lastmod bumped for **exactly these 3 URLs**, re-parsed clean, **639 entries unchanged**. No blanket bump.

### Flagged for Michael — not changed
1. **`teaching-kids-safe-pool-entry.html` asserts an unsourced superlative.** "Headfirst entries into shallow or unknown-depth water are **a leading cause** of serious neck and spinal injuries in recreational swimming" appears in the body *and* in a FAQ answer (so it is in the schema too). A sitewide grep found **zero diving/spinal-injury citations anywhere on the site** — nothing supports it. It was left alone rather than reworded, because changing it means changing the FAQ schema in the same pass. Either source it or soften it to a non-superlative.
2. **`rolling-recovery-jump-recovery-methods.html` has `<div class="related">` (line 121) sitting *between* the Authoritative Sources block and the FAQ H2** — the "main content stranded below `.related`" ordering pattern. Pre-existing; the FAQ still renders, but it is below a Related Reading block in source order.

### Backlog
**26 education articles under 50% question H2s** (listing class `index.html` and the `*-printable.html` class excluded as correct-by-design). Next by score, and the two most valuable are the **only remaining zero-citation true articles**:
- `choose-your-own-swim-instructor-vs-assigned.html` (1,791w, 1/7, **0 authority links**)
- `cloudy-pool-water-safety-signal.html` (1,508w, 1/6, **0 authority links**)
- then `free-reduced-swim-lessons-make-a-splash` (2,087w, 0/5 — note the *Make a Splash* legacy-branding rule: bridge, do not strip), `independent-swimming-readiness-checklist` (2,027w, 0/5), `drowning-cpr-quick-card` (2,024w, 0/5), `conditioning-mile-swim-goal` (1,938w, 0/5), `body-awareness-exercises-swimmers` (1,924w, 0/5), `bubbles-through-nose-breath-control` (1,916w, 0/5), `swim-readiness-indicators-age-4` (1,907w, 0/5), `weighted-practice-flip-turns-skills` (1,899w, 0/5), `poolside-emergency-kit-checklist` (1,831w, 0/6).

The 0/5 cluster above shares one template and one shape (five emoji-prefixed statement H2s + Authoritative Sources + FAQ + Keep Reading) — they are strong candidates for a **batched pass with a shared collision check**, since their topics are adjacent (skills/technique) and intra-batch similarity is the real risk there.

---

## Run 2026-08-29 — Batch 48: the zero-citation class closed, and a WAF that returns 404

Scope re-derived from a fresh `origin/live` clone at `2fee64c` (the mount was again stale, at `2476831c`). All 499 `education/*.html` re-scored on two axes: question-H2 ratio and outbound authority links.

**Optimized this run (3 files):**

| File | Words | H2 question ratio | Other changes |
|---|---|---|---|
| `education/choose-your-own-swim-instructor-vs-assigned.html` | 1,789 | 1/7 → **7/7** | **0 → 5 authority links**; speakable +`.article h1` |
| `education/cloudy-pool-water-safety-signal.html` | 1,508 | 1/6 → **6/6** | **0 → 5 authority links**; speakable +`.article h1` |
| `education/independent-swimming-readiness-checklist.html` | 2,027 | 0/5 → **5/5** | headings only |

All three finish at **100% of convertible H2s**. **The zero-citation class is now closed: 0 true articles ≥900 words on the whole site cite no external authority** (was 4 at Batch 47, 2 at the start of this run). Backlog 24 → **21**.

### The finding that mattered most: a WAF that answers 404

While GET-probing candidate source URLs, **every `healthychildren.org/*.aspx` URL returned HTTP 404** — including the site's single most-used external citation (620 occurrences) and three others (29×, 9×, 6×). A real IIS 404 body, `<title>404 - File or directory not found`, on four distinct paths. On the face of it, ~665 outbound authority links were dead.

**They are not.** Fetched through a real browser stack, `Water-Safety-And-Young-Children.aspx` renders in full, is indexed, and carries `Last Updated 5/18/2026`. healthychildren.org **cloaks non-browser clients with a 404, not a 403.**

This is the inverse of the known `WAF 403s masked real 404s` trap, and it is worse: **403 makes an auditor suspicious, 404 makes an auditor confident.** A link checker run against this site would report 665 broken authority links and any "fix" would have stripped or rewritten the site's best citations. Recorded to memory as `waf_404_fakes_dead_external_link`. **Operational rule: on a 404 from a known-good authority domain, re-probe through a rendering fetch before believing it. Status-code-only link checking cannot be trusted on `healthychildren.org`.** No links were changed.

### Zero-citation pages: link what the page already names

Both zero-citation pages repeated the Batch-47 pattern exactly — each **named an authority in a `stat-box` but never hyperlinked it**:
- `choose-your-own`: "According to the American Academy of Pediatrics (AAP), swim lessons are one layer of drowning prevention…"
- `cloudy-pool`: "According to the U.S. Centers for Disease Control and Prevention (CDC), drowning is the leading cause of unintentional injury death for children ages 1 to 4…"

Both were **hyperlinked in place** rather than duplicated, then each received the canonical `📚 Authoritative Sources` block (4 links, matching the `teaching-kids-safe-pool-entry` markup) inserted **before** `<h2 id="faq">`, plus a matching `toc-item`. **Nothing was invented — no new statistic was authored**; the only numbers on these pages are the pre-existing attributions, now linked. All 8 source URLs were already in sitewide use (620×/438×/283×/281×/182×/20×/8×) and GET-probed: aap.org, redcross.org ×2 = 200; cdc.gov ×2, poolsafely.gov = 403 WAF false positives; healthychildren.org = 404 **cloak**, verified live by rendered fetch (above).

### Collision handling

17 proposals scored against a **6,876-heading** sitewide corpus (h1+h2+h3 ending in `?` across 749 files) plus intra-batch, excluding each file's own headings-being-replaced. **One collision and two near-misses, all re-aimed rather than reworded:**

1. `What Are the Five Water Competency Skills?` — **0.937** vs `water-competency-skills-checklist.html :: ✅ What Are the 5 Water Competency Skills?`. That page owns the definitional query outright; this page's job is the *pass/fail readiness test*, so it was re-aimed to **`Which Skills Must a Child Demonstrate Before Swimming Unassisted?`**
2. `What Is the See-the-Bottom Rule for Pool Water?` — 0.762 vs `cold-water-shock.html :: What is the 1-10-1 rule for cold water?` (the "What is the X rule" shape is crowded). Re-aimed to **`Why Should You Stay Out If You Cannot See the Pool Bottom?`**
3. `What Does a Child Need Beyond the Five Basic Skills?` — 0.753 vs `rolling-recovery :: ⚖️ Why Does a Child Need Both Recovery Skills?`. Re-aimed to **`What Else Do Deep Water and Cold Demand From a Swimmer?`**

**Final set: worst score 0.000 — no proposal matches any existing heading at ≥0.72.**

**Self-cannibalization was again the binding constraint, not the sitewide corpus.** All three pages carry FAQ `<h3>`s that already own the obvious queries — `cloudy-pool`'s H2 `What makes water turn cloudy or green?` was a **near-verbatim duplicate of its own FAQ h3**, so it was re-aimed to `What Is Actually in the Water When a Pool Turns Cloudy?` rather than merely re-shaped. Every H2 on all three files was aimed at an angle its own FAQ does not already answer.

### Method notes

- **id-keyed raw-file replacement with emoji/entity-prefix capture.** `independent-swimming` stores its emoji as **numeric entities** (`&#x2753;`, `&#x1F3CA;`, `&#x1F4AA;`, `&#x1F9E0;`, `&#x1F441;&#xFE0F;`), not raw UTF-8 like `rolling-recovery` — a regex captured the leading entity/emoji run and re-emitted it byte-for-byte. One heading (`still-watch`) carried raw `"` quotes. `count==1` asserted per heading, and nested markup asserted absent, before and after. bs4 output was never string-matched against the raw file.
- **Speakable extended only after resolution.** Both top-level pages carried `{.article-excerpt, .tldr-box}`. `.article h1` was resolved with soupsieve first (→1 on both) and only then added. **`.article > p:first-of-type` resolved to 0 on both and was deliberately NOT added** — that is exactly the 2026-08-19 inert-speakable bug. (It resolves to 1 on `independent-swimming`, where it was already present and correct.)
- Section lead-ins were re-read after every rewrite: **all 17 sections open with a direct answer to their new question.**

### Validation
- Tag balance `err=0 / stackleft=0` on all three.
- html5lib head integrity: 16 metas in `<head>`, **0 metas in `<body>`**, canonical in head, on all three.
- JSON-LD parses clean — `[Article, BreadcrumbList, FAQPage]` on all three; `jerr=0`; **0 HTML entities leaked inside JSON-LD**.
- **FAQ schema↔visible drift 0** across 5/5/4 Q&A (tag-stripped, entity-decoded, whitespace-normalised, both question and answer).
- Speakable resolved with soupsieve: every selector → exactly 1 on every file. **None match zero.**
- `headline == h1` on all three. Meta descriptions unchanged, decoded 139 / 159 / 158 (≤160).
- Nested anchors 0. Unsubstituted `__PLACEHOLDER__` 0. Brand-voice ownership scan **0 hits**. All internal `#` anchors and site-relative hrefs resolve.
- `.related` ordering checked on both edited-structure files: `#sources` < `#faq` < `.related` — **no main content stranded below the Related block.**
- **DOM signature diff vs HEAD, scripts stripped.** `independent-swimming`: **213/213 elements, tag+id+class sequence byte-identical** — heading text only. `choose-your-own` 189→201 and `cloudy-pool` 176→188, each accounted for exactly (+1 `h2#sources`, +1 `ul`, +4 `li`, +4 `a`, +1 inline `a`, +1 toc `a`). `p` count unchanged on all three (27/23/25).
- **Text-node diff:** every "removed" string is either a replaced heading or the stat-box sentence split by the inserted `<a>` — **no prose was deleted or altered** on any file.
- `dateModified` bumped to **2026-08-29**; `sitemap.xml` lastmod bumped for **exactly these 3 URLs**, re-parsed clean, **640 entries unchanged**. No blanket bump.
- **Live-verified** after push `239b2e9`: all three serve 200, question-H2 counts 7/6/5 serving, both new Authoritative Sources blocks live, all three `dateModified` and all three sitemap `lastmod` live.

### Flagged for Michael — not changed
1. **`healthychildren.org` link-checking is unreliable sitewide.** 665 outbound links to that domain will report 404 to any status-code-based checker. They are live. Do not let an automated broken-link pass "fix" them.
2. **Batch 47's open item stands:** `teaching-kids-safe-pool-entry.html` still asserts, in body *and* FAQ schema, that headfirst entries are "a leading cause" of neck and spinal injuries, with **zero supporting citation anywhere on the site**. Either source it or soften it to a non-superlative — and the FAQ schema must change in the same pass.

### Backlog
**21 education articles under 50% question H2s**; **zero remain without authority citations.** The next tranche is the 0/5 single-template cluster, best taken as one batch with a shared intra-batch collision check since their topics are adjacent: `free-reduced-swim-lessons-make-a-splash` (2,089w — note the *Make a Splash* legacy-branding rule: bridge, do not strip), `drowning-cpr-quick-card` (2,024w), `conditioning-mile-swim-goal` (1,969w), `body-awareness-exercises-swimmers` (1,924w), `swim-readiness-indicators-age-4` (1,922w), `bubbles-through-nose-breath-control` (1,916w), `weighted-practice-flip-turns-skills` (1,899w), `poolside-emergency-kit-checklist` (1,829w, 0/6). Then the low-ratio long-tail: `national-water-safety-action-plan-explained` (1/11 — **check `aap_2026` and the NDPA two-taxonomies rules before touching**), `new-jersey-pool-fence-law` (1/7), `end-of-summer-swim-skills-report-card` (1/7).

---

## Run 2026-08-30 — Batch 49: the 0/5 template cluster, and a skip-list regex that ate a denominator

Scope re-derived from a fresh `origin/live` clone at `b5680c3` (the mount was again stale, at `2476831c`). All 413 indexable `education/*.html` true articles ≥900 words re-scored on question-H2 ratio and outbound authority links.

**Optimized this run (3 files):**

| File | Words | H2 question ratio | Other changes |
|---|---|---|---|
| `education/drowning-cpr-quick-card.html` | 2,171 | 0/5 → **5/5** | headings only |
| `education/free-reduced-swim-lessons-make-a-splash.html` | 2,084 | 0/6 → **6/6** | speakable +`.article h1`; visible `Updated` synced to `dateModified` |
| `education/poolside-emergency-kit-checklist.html` | 1,977 | 0/6 → **6/6** | headings only |

All three finish at **100% of convertible H2s**. Residual statement headings are the sitewide utility set only (`📚 Authoritative Sources`, `Frequently Asked Questions`, `Keep Reading`, the printable CTA). Backlog 21 → **18**. All three already carried Article + BreadcrumbList + FAQPage + tldr-box + speakable and 3–6 authority links, so headings were the only real gap.

### The finding that mattered most: `\bsources\b` vs "re**sources**"

The backlog scorer's non-convertible SKIP set matched the bare substring `sources` — which also matches **"resources"**. `free-reduced-swim-lessons-make-a-splash.html` has an H2 `Parks & Recreation and other free resources`; it was being silently dropped from the denominator, so the page scored **0/5 when its true ratio was 0/6**. Same defect would hit any H2 containing "resources," "outsourcing," or "sourced."

The under-50% *count* did not move (21 either way), which is exactly why this survived four batches: **the aggregate was right while an individual denominator was wrong.** Anchored to `\bsources\b`; `poolside-emergency-kit-checklist` also corrected 0/5 → 0/6. **Generalizable: a skip-list built from bare substrings silently shrinks denominators. Anchor every skip term to a word boundary and assert the skipped set, not just the surviving count.**

### The second finding: an FAQ parity failure that was the validator's fault, and a real defect underneath it

The validation pass reported `free-reduced` had a schema question with **no visible counterpart** — `How do I find free or low-cost swim lessons near me?`. Confirmed identical in `HEAD`, so not introduced here. It is **not** an orphan: the validator only looked for `<h3>`, and this page renders its in-body FAQ as `<p><strong>Question?</strong><br>Answer</p>`. All five questions are visible; parity is **5/5, drift 0**. Parity checks must accept **both** FAQ markup shapes (`h3` and `p > strong`) or they manufacture orphans.

**But the false positive exposed a real, pre-existing structural defect.** That page ships **two FAQ blocks with divergent wording**:

- offset 20062 — inside `.article-body`, immediately after `<h2 id="faq">`, `<p><strong>` shape, **all 5 questions**, short answers. Correct location.
- offset 25134 — **outside `.article-body`**, and **after `<div class="related">`** (22754), `<h3>` shape, only 4 questions, longer answers that the JSON-LD mirrors verbatim.

So the block the schema actually quotes is the one stranded below Related Reading — the `main content stranded below .related` pattern, here compounded by a duplicated FAQ. **Not fixed in this run**, per the Batch-47 precedent of flagging `.related` ordering rather than restructuring inside a heading batch; de-duplicating means choosing which set of answers to delete and re-pointing the schema in the same pass. Flagged below.

### Collision handling

17 proposals scored at 0.80 against a **6,910-heading** sitewide corpus (h1+h2+h3 ending in `?` across 751 files) plus intra-batch, excluding each file's own headings being replaced. **Zero collisions; worst score 0.703**, then re-aimed to 0.614.

**Self-cannibalization was again the binding constraint.** `drowning-cpr-quick-card`'s own five FAQ `<h3>`s already own the obvious queries — the natural headings (`Is CPR for drowning different?`, `What are the steps of CPR after someone is pulled from the water?`, `How is CPR different for an infant?`, `Does knowing CPR replace swim lessons and supervision?`) are **verbatim its own FAQ**. All five H2s had to be aimed at angles the FAQ does not already answer: the physiological *why* (`Why Do Rescue Breaths Come Before Compressions in Drowning?`), the *sequence* (`In What Order Should You Check, Call, Breathe, and Pump?`), the *numbers* (`How Deep Should Compressions Go for an Infant or Child?`), and the *layers* framing (`Which Layers Keep a Family From Ever Needing CPR?`).

One re-aim on the sitewide corpus: `Why Do Free Swim Lessons Change a Child's Drowning Risk?` scored **0.703** against the `Do swim lessons reduce drowning risk?` FAQ carried by many `swim-lessons/*` town pages — and `do-swim-lessons-reduce-drowning-risk.html` owns that efficacy query outright. This section is about the **access gap**, not efficacy, so it was re-aimed to **`Why Are Free Swim Lessons a Safety Issue, Not a Perk?`** (0.614) — which its own second paragraph answers verbatim ("not a luxury extracurricular; it is a safety intervention").

`How Affordable Are Municipal Parks and Recreation Lessons?` deliberately **narrows** the old H2's scope ("Parks & Recreation and other free resources") to the query its lead paragraph actually answers. The "other resources" content stays as supporting material below.

**Make a Splash branding preserved, not stripped** — `How Does the Make a Splash Grant Network Work?` keeps the legacy name while the body bridges to USA Swimming Foundation / Local Partners, per the standing rule.

### Method notes

- **id-keyed raw-file replacement with emoji/entity-prefix capture.** `drowning-cpr-quick-card` and `poolside-emergency-kit-checklist` store emoji as numeric entities (`&#x1FAC1;`, `&#x1F9ED;`, `&#x1F6E1;&#xFE0F;`, `&#x2600;&#xFE0F;`, …); `free-reduced` has none on its body H2s but a raw UTF-8 📚 on `#sources`. A regex captured the leading entity/emoji run and re-emitted it byte-for-byte; `count==1` asserted per heading, nested markup asserted absent. bs4 output was never string-matched against the raw file.
- **Speakable extended only after resolution.** `free-reduced` carried only `{.article-excerpt, .tldr-box}`; `.article h1` was resolved with soupsieve first (→1) and only then added. Every selector on all three files resolves to exactly 1 — **none match zero**.
- **TOC labels left as short non-verbatim labels**, per Batch 41/42 precedent. All 19 remain accurate after the re-aims, including `Parks & Rec + free resources`.
- Section lead-ins re-read after every rewrite: **all 17 sections open with a direct answer to their new question.**
- USA Swimming's finder was GET-probed with a browser UA: `usaswimming.org/home/find-a-team` → **200**, titled "Find A Team", and it hosts the **Swim Lesson Provider** network — so the page's instruction ("set the finder type to Learn to Swim") is sound and does **not** violate the `usaswimmingfoundation.org is not a lesson finder` rule. Terminology drift noted below.

### Validation
- Tag balance `err=0 / stackleft=0` on all three.
- html5lib head integrity: 16 metas in `<head>`, **0 metas in `<body>`**, canonical in head, on all three.
- JSON-LD parses clean — `[Article, BreadcrumbList, FAQPage]` on all three; `jerr=0`; **0 HTML entities leaked inside JSON-LD**.
- **FAQ schema↔visible drift 0** across 5/5/5 Q&A, checked against **both** markup shapes (tag-stripped, entity-decoded, whitespace-normalised, question and answer).
- Speakable resolved with soupsieve: every selector → exactly 1 on every file.
- `headline == h1` on all three. Meta descriptions unchanged, decoded 149 / 133 / 157 (≤160).
- Nested anchors 0. Unsubstituted `__PLACEHOLDER__` 0. Brand-voice ownership scan **0 hits**. All internal `#` anchors resolve.
- **DOM signature diff vs HEAD, scripts stripped: 231/231, 259/259, 238/238 elements — tag + id + class sequence byte-identical on all three.** Text-node diff: the only removed strings are the 17 replaced headings and the one visible `Updated` date. **No prose was deleted or altered on any file.** Text-only diff, so no render sweep was warranted.
- `dateModified` bumped 2026-08-03 / 2026-08-28 / 2026-08-12 → **2026-08-30**; `free-reduced`'s visible `Updated August 28, 2026` synced to match (the other two carry a publish date only, per template convention). `sitemap.xml` lastmod bumped for **exactly these 3 URLs** (all three had been sitting at `2026-08-29` while their `dateModified` said August 3/12/28 — the known sitemap-vs-dateModified contradiction, now consistent for these three), re-parsed clean, **641 entries unchanged**. No blanket bump.

### Flagged for Michael — not changed
1. **`free-reduced-swim-lessons-make-a-splash.html` has two divergent FAQ blocks, and the one the JSON-LD quotes is stranded below `<div class="related">`** (details above). Needs a dedicated pass: pick one answer set, put it inside `.article-body`, re-point the schema in the same commit.
2. **Terminology drift on the same page.** It calls the destination "the Make a Splash **provider finder**" and its listings "**Local Partners**" (4 occurrences, one inside FAQ schema). The live page is branded **"Find A Team"** and the network is **"Swim Lesson Providers."** The link target is correct and the advice works; only the labels are dated. Fixing it touches FAQ schema, so it was left for its own pass.
3. **Batch 47/48's open item still stands:** `teaching-kids-safe-pool-entry.html` asserts, in body *and* FAQ schema, that headfirst entries are "a leading cause" of neck and spinal injuries, with zero supporting citation anywhere on the site.

### Backlog
**18 education articles under 50% question H2s**; zero remain without authority citations. The 0/5 single-template cluster is now the whole head of the queue and should be taken as one batch with a shared intra-batch collision check, since the topics are adjacent (skills/technique) and intra-batch similarity is the real risk: `conditioning-mile-swim-goal` (1,966w, **auth=1 — lowest citation count on the backlog**), `body-awareness-exercises-swimmers` (1,921w), `swim-readiness-indicators-age-4` (1,919w), `bubbles-through-nose-breath-control` (1,911w), `weighted-practice-flip-turns-skills` (1,895w, 4 near-question H2s already). Then the low-ratio long tail: `national-water-safety-action-plan-explained` (1/11 — **check the `aap_2026` and NDPA two-taxonomies rules before touching**), `new-jersey-pool-fence-law` (1/7), `end-of-summer-swim-skills-report-card` (1/7), `water-confidence-challenge` (1/5), `make-a-splash-local-partner-badge-decoded` (1/5 — same legacy-branding and "Local Partners" terminology question as flag #2 above; consider taking both in one pass).

---

## Run 2026-08-31 — Batch 50: the 0/5 cluster head, and a skip list that ate content questions

Scope re-derived from a fresh `origin/live` clone at `97152a1`. The mount was again stale (`2476831c`, 2026-08-20, with uncommitted working-tree changes from an older run) — **audited the clone, not the mount**, per standing rule.

**Optimized this run (3 files):**

| File | Words | H2 question ratio | Other changes |
|---|---|---|---|
| `education/conditioning-mile-swim-goal.html` | 1,430 | 0/5 → **5/5** | AAP figure corrected; AAP hyperlinked inline |
| `education/bubbles-through-nose-breath-control.html` | 1,394 | 0/5 → **5/5** | headings only |
| `education/body-awareness-exercises-swimmers.html` | 1,371 | 0/5 → **5/5** | headings only |

All three finish at **100% of convertible H2s**. Backlog **18 → 15**.

### The finding that mattered most: word-boundary anchoring was not enough

Batch 49 fixed the skip list by anchoring `sources` to `\bsources\b`, after bare `sources` was found eating "re**sources**". Re-deriving the scorer from scratch this run showed **the anchored version still eats legitimate content questions**, because a skip term can word-boundary-match a real topic:

- `What Backyard Water **Sources** Pose Seasonal Hazards?` (`home-water-safety-framework`, `child-wont-wear-life-jacket`) — "water sources" is a genuine subject heading, matched by `\bsources\b`.
- `How do I **get the** right fit?` and `🎯 How do I **get the** right fit for kids' swim goggles?` (`swim-goggles-for-kids`) — matched by `\bget the\b`.

These headings **already end in `?`**, so skipping them removed each from the numerator *and* the denominator — deflating the ratio of pages that had done the work correctly.

**The fix is not a better substring; it is a different test.** Utility headings are identified by **role**, via whole-heading anchored patterns (`^authoritative sources$`, `^keep reading$`, `^related .* (reading|articles)$`), and the lead-magnet CTA class requires **an acquisition verb AND a printable noun to co-occur** (`get|download|grab|print` … `printable|pdf|checklist|card|worksheet`) rather than either alone. Emoji prefixes are stripped before matching.

The scorer now **asserts its own skip set**: any skipped heading that ends in `?` without a printable noun is reported as suspicious. That assertion returns **0** — previously it would have returned 4. Under-50% count is 18 either way, so, exactly as in Batch 49, **the aggregate was right while individual denominators were wrong.** Generalizable: *assert the composition of the skipped set, not its size — and never skip a heading that is already a question unless it is provably a CTA.*

### The second finding: a number attributed to a named authority that the authority does not state

`conditioning-mile-swim-goal.html` asserted, in body prose: "The American Academy of Pediatrics guidance on youth sports recommends building volume gradually (**no more than ten percent** week-over-week increases)…"

The AAP's own parent-facing guidance says **10% to 20%**: "student athletes do not add more than 10% to 20% to their weekly training loads at a time." The page was **tightening AAP's range and presenting the tightened version as AAP's** — a misattribution to a named authority, not a rounding difference.

Fixed: the figure now reads "adding no more than **ten to twenty percent** to a weekly training load at a time," and the inline mention of the AAP — previously **named but never hyperlinked** — now links to the specific source that carries the claim, rather than to the generic `/sports/` landing page already in the sources block. **Verified before linking**: the destination was GET-probed (200) *and its rendered text was searched for the claim*, per the "probe the replacement destination" rule. `publications.aap.org` returned 403 behind Cloudflare ("Just a moment…") — zero information, not a dead link, so it was not used.

The companion claim on the same sentence ("at least one full rest day per week") **was verified and left alone** — AAP recommends at least 1–2 days off per week from sport-specific training, so the page's conservative reading is sound.

The claim was **confirmed absent from the JSON-LD** before editing, so this was a pure prose fix with no schema coupling — unlike the Batch 47 `teaching-kids` superlative, which remains flagged precisely because it *is* in the FAQ schema.

### Collision handling

15 proposals scored against a **6,186-heading** sitewide corpus (h1+h2+h3 ending in `?` across 753 files) plus intra-batch. **Zero collisions.**

One re-aim: `What Skills Should a Swimmer Have Before Mile Training?` scored **0.776** against `camping-water-safety-checklist :: 🏊 What skills should kids have before the trip?` — under threshold but the closest of the set, and generic where the section is specific. Re-aimed to **`Which Freestyle Fundamentals Come Before Mile Conditioning?`** (0.562), which is what the lead paragraph actually enumerates (steady freestyle, bilateral breathing, streamline push-off, stamina). **Final worst score 0.718.**

**Intra-batch similarity was the predicted risk and it materialised in drafting, not scoring.** `body-awareness`'s two drill sections would naturally read `Which Dryland Drills…?` / `Which In-Water Drills…?` — differing only by one modifier. They were split by *what each section teaches* instead of by location: `What Can Swimmers Practice on the Deck Before Getting In?` vs `Which Swim Drills Teach a Child to Feel Their Body Position?`.

**Self-cannibalization was again the binding constraint**, as in Batches 48 and 49. All three pages carry five FAQ `<h3>`s that already own the obvious definitional queries — `At what age can my child start nose-bubble practice?`, `At what age does body awareness start to develop?`, `What age can my child train for a mile swim?`. Every H2 had to be aimed at an angle its own FAQ does not already answer: mechanism (`Why Do Swimmers Need to Exhale Through the Nose?`), developmental *trajectory* rather than start age (`How Does Nose-Breathing Control Develop From Toddler to Preschool?`), and setting (`What Does Safe Bathtub Practice Look Like Between Lessons?`).

### Method notes

- **id-keyed raw-file replacement with emoji-prefix capture.** All three store emoji as raw UTF-8 (📏 ✅ 📊 🩹 🧠 / 💨 🎓 👶 ⚠️ 🛁 / 🧭 🧘 🌊 🛟 🎲). A regex captured the leading emoji run and re-emitted it byte-for-byte; `count==1` asserted per heading before and after, and nested markup asserted absent. bs4 output was never string-matched against the raw file.
- Section lead-ins were read **before** drafting and re-read after: **all 15 sections open with a direct answer to their new question.** No lead paragraph was altered by the heading work.
- **TOC labels left as short non-verbatim labels**, per Batch 41/42 precedent — all 15 remain accurate after the re-aims (`Readiness Indicators`, `On-Deck Drills`, `The Safety Dimension`, etc.).
- Speakable was already complete on all three (`.tldr-box`, `.article h1`, `.article-excerpt`) and every selector resolves to exactly 1 — nothing was added blind.

### Validation
- Tag balance `err=0 / stackleft=0` on all three.
- html5lib head integrity: 16 metas in `<head>`, **0 metas in `<body>`**, canonical in head, on all three.
- JSON-LD parses clean — `[Article, FAQPage, BreadcrumbList]` on all three; `jerr=0`; **0 HTML entities leaked inside JSON-LD**.
- **FAQ schema↔visible drift 0** across 5/5/5 Q&A, checked against **both** markup shapes (`h3` and `p > strong`).
- Speakable resolved with soupsieve: every selector → exactly 1 on every file. None match zero.
- `headline == h1` on all three. Meta descriptions unchanged, decoded 142 / 138 / 151 (≤160).
- Nested anchors 0. Unsubstituted `__PLACEHOLDER__` 0. Brand-voice ownership scan **0 hits**. All internal `#` anchors resolve.
- **DOM signature diff vs HEAD, scripts stripped.** `bubbles`: **195/195**, `body-awareness`: **192/192** — tag+id+class sequence **byte-identical**, heading text only. `conditioning`: 194→195, accounted for exactly by the one inserted inline `<a>`. Text-node diff: the only removed strings are the 15 replaced headings, the 3 visible `Updated` dates, and the one corrected sentence. **No prose was deleted elsewhere on any file.** Text-only changes, so no render sweep was warranted.
- `dateModified` 2026-08-28 / 2026-08-21 / 2026-08-21 → **2026-08-31**; each page's **visible `Updated` line synced to match** (all three carry one). `sitemap.xml` lastmod bumped for **exactly these 3 URLs** — all three had been sitting at `2026-08-29` while their `dateModified` said Aug 21/28, the known sitemap-vs-dateModified contradiction, now consistent for these three. Re-parsed clean, **642 entries unchanged**. No blanket bump.
- **Live-verified** after push (`15b01e6`): all 15 question H2s serving, all three `dateModified` live, the corrected AAP sentence live with the old wording returning 0 hits, the new inline link present, and all three sitemap `lastmod` values live with 642 entries parsing.

### Flagged for Michael — not changed
1. **Two pages carry question H2s that the previous scorer was silently discarding** (`home-water-safety-framework`, `child-wont-wear-life-jacket`, `swim-goggles-for-kids` — details above). Their content is fine; only the measurement was wrong. Worth knowing because past backlog numbers for those pages were understated.
2. **Batch 49's open item still stands:** `free-reduced-swim-lessons-make-a-splash.html` ships two divergent FAQ blocks, and the one the JSON-LD quotes is stranded below `<div class="related">`. Needs a dedicated pass.
3. **Batch 47/48's open item still stands:** `teaching-kids-safe-pool-entry.html` asserts, in body *and* FAQ schema, that headfirst entries are "a leading cause" of neck and spinal injuries, with zero supporting citation anywhere on the site. Given this run found a *second* unsupported figure attributed to a named authority, a **sitewide sweep for numbers attributed to AAP/CDC/Red Cross that those bodies do not state** is probably worth its own batch.

### Backlog
**15 education articles under 50% question H2s.** The 0/5 template cluster is nearly closed — two remain and should be taken together as the next batch, since they share the template and adjacent topics:
- `weighted-practice-flip-turns-skills` (1,340w, 0/5, 4 near-question H2s already)
- `swim-readiness-indicators-age-4` (1,310w, 0/5)

Then the low-ratio long tail: `national-water-safety-action-plan-explained` (1/11 — **check the `aap_2026` and NDPA two-taxonomies rules before touching**), `new-jersey-pool-fence-law` (1/7 — **VGB scope rule applies**), `end-of-summer-swim-skills-report-card` (1/7), `water-confidence-challenge` (1/5), `make-a-splash-local-partner-badge-decoded` (1/5 — legacy-branding + "Local Partners" terminology question from Batch 49 flag #2; consider taking both in one pass), `swimmers-ear-prevention-checklist` (1/4), `year-round-swim-skills-checklist` (1/4).

## Run 2026-09-06 — Batch 56: the prose backlog closed, and a parity probe that invented 144 defects

Shipped from a fresh `origin/live` clone at `fbc2c7268`. One article converted
(`swim-strokes-guide-kids` 3/7 → **7/7**) and **five speakable defects** fixed across the
article family. **The prose question-H2 backlog is now empty.**

### Backlog reconciliation

Scorer rebuilt from the recorded role table verbatim (`cl-` class, cta ancestor,
related-cards, sources-list, structural-id, faq-block-requires-non-question-h2, cta-text),
with the ≤3-direct-children parent restriction and the per-role cardinality canary.

| canary | recorded (Batch 55) | this run |
|---|---|---|
| over-skip (>2 per role per file, printables excluded) | 0 | **0** |
| skipped headings ending in `?` | 83 | **83** |
| — of which printable-label / cta-text / cta | 18 / 45 / 20 | **18 / 45 / 20** |
| pages scored (n≥3) / dropped (n<3) | 420 / 95 | 421 / 96 |

The skip composition reproduced **exactly**; the two extra pages are content shipped since
Batch 55. Backlog read `swim-strokes-guide-kids` 3/7 and `education/index.html` 1/8 — the
recorded state, unchanged.

### `swim-strokes-guide-kids`: HowTo bound by url, then the headings freed

The HowTo already carried `url` on every step (Batch 47's step 1 was done). What was still
missing was step 2: `step.text` was a **hand-written paraphrase**, so the step↔section
coupling remained implicit text similarity. All four `step.text` values were replaced with
the **verbatim lead `<p>`** of the section their `url` points at, extracted programmatically;
each lead was asserted not to end in a colon (the list-stem trap) before use. Two other
sections on the page *do* end in colons — `stroke-progression` and `supporting-your-swimmer` —
which is why the assertion is worth keeping even when it passes.

Only then were the four stroke H2s converted. The `Stroke N:` ordinal prefix and the raw
UTF-8 emoji were preserved byte-for-byte, per the Batch 55 `Layer N:` precedent:

| id | was | now |
|---|---|---|
| `freestyle` | 🔵 Stroke 1: Freestyle (Front Crawl) | 🔵 Stroke 1: What Makes Freestyle the Foundation of Swimming Competence? |
| `backstroke` | 🟢 Stroke 2: Backstroke | 🟢 Stroke 2: What Makes Backstroke Easier to Breathe In Than Freestyle? |
| `breaststroke` | 🟡 Stroke 3: Breaststroke | 🟡 Stroke 3: Why Is Breaststroke Harder for Beginners Than It Looks? |
| `butterfly` | 🔴 Stroke 4: Butterfly | 🔴 Stroke 4: Which Body Movements Make Butterfly So Demanding? |

**Collision handling.** Corpus **7,138** headings (`h1+h2+h3` ending in `?` across 765 files,
including the file being edited). Threshold 0.75. The first freestyle proposal,
`How Does the Freestyle Stroke Actually Work?`, scored **0.840** against
`swimmers-hub/freestyle-complete-guide.html :: How Does the Freestyle Arm Stroke Work?` — a
dedicated sibling that owns freestyle mechanics outright. Three re-aims were scored before
landing on the section's own distinctive claim (foundation, not mechanics): **0.595**.
Final worst 0.606 corpus / 0.577 intra-batch.

The similarity metric was **re-derived and then verified against a labelled set** rather than
trusted: `difflib.SequenceMatcher` over lowercased, punctuation-stripped, whitespace-collapsed
text reproduces five of Batch 55's recorded scores (0.775, 0.812, 0.847, 0.791, 0.742)
**to three decimals**. Keeping the `?` or the punctuation shifts every value by ~0.005 —
enough to move a borderline proposal across the threshold.

### The finding: a FAQ-parity probe that reported 144 defects, all of them its own

The recorded probe checks FAQ schema questions against **three** visible shapes (`h3`,
`p > strong`, `button.faq-question`) scoped to `.article-body`. Run across the corpus it
reported **144 schema questions with no visible counterpart** on 6+ files — a large,
plausible-looking defect surface. Every one was the probe's fault:

1. **Scope.** On this template family the FAQ block sits **outside** `.article-body`, between
   it and `</main>`. That is not a defect: **310 of 414** `/education/` pages with an `#faq`
   put it outside, against 104 inside. It is the majority convention. Measuring first is what
   kept this from being "fixed."
2. **A fourth visible shape: `h2`.** A FAQPage entry is often mirrored by a **section
   heading**, not a dedicated FAQ block — `cold-water-shock.html` answers
   *"What is cold water shock?"* with `<h2 id="what">`. Adding `h2` collapsed 144 → 30.
3. **Ordinal prefixes.** `swim-lesson-faqs.html` renders *"2. How long does it take to learn
   to swim?"*. The recorded normalization strips emoji and `Q:` but not `1.` / `Q1)`.
4. **`h1`.** A page whose whole subject is the question answers it in the `<h1>`.

With the shape set widened to `h1, h2, h3, h4, p > strong, button.faq-question, summary, dt`,
document scope, and leading-ordinal normalization, the reading is **0 drift across 2,137 Q&A
on 424 files.** Given that acting on a wrong parity probe **deletes healthy Q&A**, a probe
that reports a 144-item surface is the more dangerous failure — it looks like work.

**Same class, same run:** the `.tldr-box` on `swim-strokes-guide-kids` says freestyle and
backstroke start *"as early as age 4–6"* while the body says full arm-stroke integration is
*"ages 5–7"*. That was edited to 5–7 as a drift fix — and then **reverted**, because the
page's own FAQ states 4–6 for *begin learning*. The two figures name **different milestones**;
"fixing" one would have contradicted the FAQ. Check which milestone a number names before
calling two numbers a contradiction.

### The "71 printable bridge H2s" are conversion copy, not an AEO surface

This item has been carried as unworked backlog for several runs. Characterized in full:
95 printable pages carry **293** non-`cl-` H2s. Of those, **191** are related-cards utility
(`Keep Reading` 93, `More Related Guides` 68, `Related Reading` 16, `Related Water Safety
Guides` 14), **20** are already questions, 2 are FAQ containers, and the remaining **80**
were classified by whether their section contains an enrolment/tool link or CTA button:
**76 are conversion CTAs** (*"Build Your Child's Water Safety Skills"*, *"Cost Is Worth
Comparing. Safety Is Worth More."*) and **4 are card instruction labels** (*"Parent Fills In
Before Handing Off"*). **Zero are prose content headings.**

Printables are excluded from the H2 ratio by design and drop at n<3 regardless. Converting
persuasive CTA headlines into questions would degrade conversion copy for **no AEO gain**.
Recommend closing this item rather than working it.

### Speakable: the article-family defects closed

Batch 55 flagged 160 selectors not resolving to exactly 1. Characterized per family:
**114 printable** (correct — the recorded 113 plus one new page), **5 hub `.hub-answer`**
(4–10 matches; a hub with N answers is deliberate), **24 directory** `.state-info h3` /
`.faq-section h3`, **13 town** `.wwk-intro-box p` → 2. The **article-family** ones were real
and are fixed:

- `intensive-vs-weekly-swim-lessons`, `life-skills-from-swimming`, `swimming-progress-tracker`:
  `.article-body h2` matched **11 / 11 / 9** — the selector pointed at *every heading on the
  page*, which is an article, not a speakable summary. Replaced with `.article h1` (→1).
- `adaptive-swimming-special-needs`: `.article-body > p:first-of-type` → **2**, because the
  page has **two `div.article-body`** elements. Selector dropped (`.tldr-box`,
  `.article h1`, `.article-excerpt` all resolve to 1 and already cover the summary); the
  duplicate div is flagged below, not silently restructured.
- `water-safety-for-toddlers`: `.article > p:first-of-type` → **2**, because `.article`
  matches both `<article class="article">` and a `<div class="article">` breadcrumb wrapper.
  The first match was **"← Back to Articles"** — speakable was handing an assistant a
  breadcrumb. Narrowed to `article.article > p:first-of-type` (→1).

Non-1 selectors 160 → 155; the article family is now clean, and **zero selectors match nothing**.

### Validation
- Tag balance: lxml structural errors **0** on all six files. (One pre-existing
  `expected-named-entity` from an unescaped `&` in the Google Fonts URL is present at HEAD
  on every page and was not introduced here.)
- JSON-LD parses clean on all six; `jerr=0`; **0 HTML entities leaked inside JSON-LD**.
- HowTo: every `step.url` resolves to a real section `id`, and every `step.text` **equals**
  that section's lead `<p>` verbatim — asserted programmatically, 4/4.
- FAQ schema↔visible: 5/5 on `swim-strokes-guide-kids`; **0 drift corpus-wide** (2,137 Q&A).
- Speakable: every selector on every touched file resolves to exactly 1.
- `headline == h1` on all six. 16 metas in `<head>`, **0 metas in `<body>`**; per-tag quote
  parity in `<head>` clean. Nested anchors 0. Placeholders 0. Brand-voice ownership scan 0.
- **DOM signature diff vs HEAD, scripts and styles stripped: byte-identical on all six**
  (249/294/266/244/262/183). Text-node diff: the only change anywhere is the **four replaced
  headings**. No prose was deleted.
- `dateModified` 2026-08-25 → **2026-09-06** and the visible `Updated` line synced, on
  `swim-strokes-guide-kids` **only** — the other five changed JSON-LD selectors and no body
  text, so their dates were deliberately left alone. `sitemap.xml` lastmod bumped for
  **exactly that one URL** (2026-08-29 → 2026-09-06); re-parsed clean, **648 entries**.
- Backlog re-scored after the edit: `swim-strokes-guide-kids` **7/7**, off the backlog.

### Backlog after this run

**Prose backlog: 0.** `education/index.html` (1/8) is a hub and stays scoped separately —
per the hub-cannibalization rule, converting hub H2s to questions risks absorbing queries
its dedicated pages should own, so it should be taken as a deliberate scope decision, not as
backlog cleanup. The 71 printable "bridge" H2s are recommended **closed** (see above).

### Flagged for Michael — not changed

1. **`adaptive-swimming-special-needs.html` has two `div.article-body` elements.** The
   speakable selector was the symptom; the duplicate container is the cause and may affect
   styling and any rule that assumes one article body. Needs a look before restructuring.
2. **Directory and town speakable selectors resolving to >1** (24 × `.state-info h3` /
   `.faq-section h3` at 4–8; 13 × `.wwk-intro-box p` at 2). Plausibly deliberate multi-answer
   designs, unlike the article-family cases. Left alone pending a decision on whether
   speakable should ever address more than one block.
3. **Batch 54/55 open items still stand:** `free-reduced-swim-lessons-make-a-splash.html`'s
   two divergent FAQ blocks, and `teaching-kids-safe-pool-entry.html`'s uncited
   "leading cause" claim.

---
