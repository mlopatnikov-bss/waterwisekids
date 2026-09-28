# AEO Report — 2026-09-04 (Batch 54)

Source of truth: fresh `origin/live` clone at `3fc4e4202`. The mount was not audited.

## Measurement re-derived before any edit

| check | result |
|---|---|
| `/education/` files scored (n>=3 non-`cl-` H2s) | 419 of 513 |
| pages under 50% question H2s | **8** (7 prose + `education/index.html`) |
| over-skip canary (>2 skips of one role per file) | **0** |
| "never skip a question" canary | **20**, all `Ready to...?` CTA headings, **all on pages that drop at n<3** |

This reproduces the 2026-09-03 state exactly, so the post-edit number is a real delta.

## Headings converted (12)

### `education/water-slide-safety-checklist.html` — 2/8 -> 7/8
| id | was | now | worst collision |
|---|---|---|---|
| `landing` | The landing zone is where the real risk lives | Why is the bottom of a water slide the riskiest spot? | 0.623 |
| `height-limits` | Height and age limits are engineering, not red tape | How do you match a slide to your child's size and swimming ability? | 0.721 |
| `gear` | Goggles, life jackets, and what to leave at the top | Can kids wear goggles or a life jacket on a water slide? | 0.653 |
| `backyard` | Backyard inflatable water slides need their own rules | How should you set up a backyard inflatable water slide safely? | 0.717 |
| `skills` | The layer that makes every slide safer | How much do swimming skills matter at a water park? | 0.667 |

Residual 1/8 is `#printable`, the lead-magnet CTA H2 — not convertible.

### `education/fall-swim-skill-retention-checklist.html` — 2/6 -> 6/6
| id | was | now | worst collision |
|---|---|---|---|
| `why-safety` | Why this is a safety issue, not just a skills issue | Why does off-season skill loss matter for safety? | 0.705 |
| `keep-sharp` | How to keep swim skills sharp after summer | What should off-season swim practice look like? | 0.711 |
| `year-round-lessons` | The most reliable fix: year-round lessons | Why do year-round lessons beat practicing on your own? | 0.627 |
| `build-plan` | Build your fall skill-retention plan | How do you turn this into a fall plan you'll actually follow? | 0.602 |

### `education/swim-practice-log.html` — 2/6 -> 5/6
| id | was | now | worst collision |
|---|---|---|---|
| `why-practice` | Why a Practice Log Beats "We'll Practice More" | Why Does Writing Practice Down Work Better Than Good Intentions? | 0.642 |
| `how-to-use` | How to Use the Printable Log | What Should You Write in the Log After Each Session? | 0.725 |
| `safety` | One Rule That Never Bends | Does a Stronger Swimmer Need Less Supervision? | 0.661 |

Title Case preserved — this file's existing question H2s are Title Case; the other two are
sentence case. Residual 1/6 is `#printable`.

**Worst collision overall: 0.725** against a **7,084**-heading corpus (h1+h2+h3 ending in
`?` across all 741 files, **including the file being edited**), threshold 0.75.

## Three re-aims

1. `How do you build a fall skill-retention plan?` — **0.759** vs
   `education/lazy-river-safety-kids :: How do you build a family lazy-river plan?`.
   Re-aimed to `How do you turn this into a fall plan you'll actually follow?` (**0.602**),
   taken from the section's own lead sentence.
2. `keep-sharp` could not take the literal question: the page's FAQ h3 already owns
   *How can I keep my child's swim skills sharp after summer?* Aimed at what the lead
   actually argues — cadence and shape of practice — instead of restating the FAQ.
3. `height-limits` and `backyard` would each have landed verbatim on this page's own FAQ h3s
   (*What are the height and age rules on water slides for?*, *Are backyard inflatable water
   slides safe for kids?*). Aimed at **matching a slide to a child** and at **setup
   procedure**; the latter also stays clear of the sibling guide `water-slide-safety-kids`,
   which owns "are they safe" (0.716).

Every rewritten section was re-read afterwards: **all 12 open with a direct answer to their
new question**, and no lead paragraph was altered by the heading work.

## Citation fix — the 88% figure

Four instances rewritten, on two pages:

| file | where | was | now |
|---|---|---|---|
| `water-slide-safety-checklist` | prose `#skills` | "According to the AAP, formal swim lessons reduce drowning risk by up to 88%..." | "According to **research cited by** the AAP..." |
| `fall-swim-skill-retention-checklist` | prose `#year-round-lessons` | "...according to the AAP" | "...according to **research cited by** the AAP" |
| `fall-swim-skill-retention-checklist` | visible FAQ answer | same | same |
| `fall-swim-skill-retention-checklist` | **FAQ JSON-LD** answer | same | same |

The figure is from a case-control study in the *Archives of Pediatrics and Adolescent
Medicine* (Brenner et al.); the AAP cites it. `swim-practice-log` was **already** using the
hedge in both its visible FAQ and its JSON-LD, so this is the site's established convention,
not a new one. Prose and schema were changed together, and FAQ parity re-verified after.

## The surface behind it — 288 files, not 2

| shape | files |
|---|---|
| producer ("AAP reports / finds / shows") | 114 |
| "according to the AAP" only | 57 |
| hedged correctly ("research it cites") | 52 |
| other AAP + 88% phrasings | 86 |
| **carrying it inside `ld+json`** | **42** |

Not swept this run — deliberately. A blanket sweep of AAP-naming pages is the thing the
standing rule forbids; the correct unit is a dedicated claim-hygiene batch that fixes prose
and JSON-LD together and re-verifies FAQ parity per file. Flagged as the top open item.

## A probe regression, caught before it was believed

The FAQ-parity check reported one schema question as an orphan on
`fall-swim-skill-retention-checklist`: *What is the "post-summer swim slide"?* It is not
missing — it is a visible **`h2`**, the section header itself.

This was **not** a new shape discovery. The recorded working selector set is already
`h1|h2|h3|h4|h5|summary|p/strong|p/b|dt|button|.faq-question|legend`; this run rebuilt a
narrower one (`h3`, `p > strong`, `button.faq-question`) from a partial reading of the rule,
and the narrower probe manufactured the orphan. Real orphan count after using the full set:
**0**.

The generalizable point: **a probe re-derived from memory of a rule silently loses the fixes
the rule encodes.** Copy the recorded selector set verbatim, and keep its cardinality canary
— an empty or shrunken visible set reports every schema question as an orphan, and the fix
for a real orphan is deletion.

## Validation

| check | result |
|---|---|
| DOM signature diff vs HEAD (scripts stripped) | **221/221**, **234/234**, **206/206** — identical |
| text-node diff | only the 12 headings, 4 attribution phrases, 1 `Updated` line |
| html5lib head integrity | 16 head metas, **0 body metas**, canonical in head (x3) |
| raw-head embedded-quote scan | 0 |
| JSON-LD | `[Article, BreadcrumbList, FAQPage]` x3, parses clean, 0 leaked entities |
| FAQ schema <-> visible drift | **0** across 5/5/5 Q&A, four markup shapes |
| speakable selectors | every selector resolves to exactly 1, on every file |
| `headline == h1` | true x3 |
| meta description (decoded) | 149 / 147 / 128 — unchanged |
| dead in-page anchors | 0 (every `h2 id` preserved) |
| placeholders / ownership-voice hits | 0 / 0 |
| `dateModified` | 2026-08-11, 2026-08-31, 2026-07-12 -> **2026-09-04** |
| visible `Updated` line | synced on the one page that has one |
| `sitemap.xml` lastmod | exactly 3 URLs bumped, re-parsed clean, **646 entries** unchanged |

## Backlog after this run

**4 prose articles under 50%** (+ `education/index.html`, a hub, scoped separately):
`water-confidence-challenge` (2/6) · `swim-milestones-by-age` (3/8) ·
`swim-strokes-guide-kids` (3/7) · `autism-wandering-water-safety` (4/9).
The **71 printable "bridge" H2s** remain unworked.
