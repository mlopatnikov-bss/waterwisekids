# AEO Report — 2026-09-03 (Batch 53)

**Shipped:** `16db99d` → `live` (from `d8f2b19`). Three articles, 10 statement H2s converted
to question H2s, one HowTo schema added, two period-labelled statistics added,
`dateModified` + visible `Updated` + `sitemap.xml lastmod` bumped on exactly 3 URLs.
All live-verified over HTTPS.

| Article | Before | After | Convertible |
|---|---|---|---|
| `education/make-a-splash-local-partner-badge-decoded.html` | 1/5 | **5/5** | 100% |
| `education/swimmers-ear-prevention-checklist.html` | 1/5 | **4/5** | 100% |
| `education/year-round-swim-skills-checklist.html` | 1/5 | **4/5** | 100% |

The two 4/5 residuals are the lead-magnet printable CTA H2s
(`🖨️ Get the free printable …`), which carry no class and are not convertible.

**Backlog: 11 → 8.** These were the three joint-worst prose articles on it.

---

## The finding: a structural rule needs the text signal when the text is decisive

Batch 52 rebuilt the skip list to classify by **DOM role, never by heading text**. That was
right, and it is why this run started from a clean 11. But one rule took the principle too
far.

The `faq-block` rule skipped any h2 whose next three `h3`s were all questions. On
`renting-private-pool-hourly-safety.html` that description fits a section which is *not* an
FAQ block:

```
<h2 id="on-arrival">What should your on-arrival safety walk-through cover?</h2>
   <h3>Can you see the bottom?</h3>
   <h3>Are the drain covers intact?</h3>
   <h3>Do the fence and gate work?</h3>
```

Those three h3s are the walk-through itself — short diagnostic checks, not FAQ entries. The
h2 is a genuine, already-converted prose question, and the rule dropped it from **both the
numerator and the denominator**. A page was being scored on 6 headings instead of 7, in its
own favour, invisibly.

**An FAQ *container* header is never itself a question.** "Frequently Asked Questions",
"Common Questions" — the label names the block; it does not ask anything. The rule now
requires the h2 text to be a non-question, and the three real FAQ containers it was built
for still classify correctly:

| File | H2 | Still skipped |
|---|---|---|
| `kayak-canoe-safety-kids.html` | Frequently Asked Questions | ✅ |
| `pool-floaties-dangers.html` | Frequently Asked Questions | ✅ |
| `swimming-after-eating-myth.html` | Frequently Asked Questions | ✅ |
| `renting-private-pool-hourly-safety.html` | What should your on-arrival…cover? | **now scored** |

This is Batch 52's lesson inverted. Batch 52 fixed a rule that matched **text** where
**role** was the real signal. This fixes one that used **role only** where the text carried
the decisive bit. The rule is not "never look at text" — it is *look at the thing that
actually distinguishes the class*, and prove it by naming the members that must survive.

## The canary that reads 20, not 0, and is still clean

Batch 52 left the standing assertion **"no non-printable question is ever skipped — currently 0."**
It now reads **20**, which looks like a regression and is not one.

All 20 are lead-magnet CTA headings — `Ready to Enroll Your Grandchild in Swim Lessons?`,
`Want Swim Lessons for Your Family?` — correctly classified as `cta`. They are not
information-seeking queries and no answer engine targets them, so skipping them is right.
Scoring them would be *worse*: each would count as a question and inflate its page's ratio
with false credit.

The number alone cannot tell those apart from a genuine over-skip. So the assertion is now
positional, and it is the composition that carries the proof:

```
CTA/other question skips on pages that SURVIVE n>=3:  0
```

Every one of the 20 lives on a `*-printable.html` page that drops out at n<3 anyway. **Zero
effect on the backlog.** A count is not a canary until you can say where its members live —
this is the third consecutive batch where the aggregate was right and only the composition
could prove it.

## Do not attribute the 88% figure to the AAP

The optimizer brief lists, as a suggested stat, *"AAP: formal swim lessons can reduce
drowning risk by 88% for ages 1-4."* **That attribution is wrong and was not used.**

The site already handles this correctly in 8+ places: the figure comes from a study in the
*Archives of Pediatrics and Adolescent Medicine*, led by researchers at the Eunice Kennedy
Shriver National Institute of Child Health and Human Development. The AAP **cites** that
research; it did not produce the number. Publishing "AAP: 88%" would have created exactly
the defect class where a number is attributed to an authority that never stated it — and it
would have contradicted our own pages.

Two statistics were added instead, both period-labelled:

| Page | Stat | Attribution |
|---|---|---|
| `swimmers-ear-prevention-checklist` | ~**2.4 million** U.S. health-care visits a year end in an acute otitis externa diagnosis | CDC, *MMWR* May 20 2011;60(19):605–9, on **2003–2007** data |
| `year-round-swim-skills-checklist` | Drowning is the leading cause of death for children ages 1–4 | CDC Drowning Facts (matches the site's 24 existing uses of this phrasing) |

The MMWR URL was not linked: `cdc.gov` returns **403 to every automated GET**, including
URLs already live and healthy on this site, so a link probe there carries no information.
The citation names the report and links the CDC swimmer's-ear page the article already
trusts.

## H2 conversions

### `make-a-splash-local-partner-badge-decoded.html` (1/5 → 5/5)

| id | Was | Now |
|---|---|---|
| `certifies` | What the badge actually certifies | What does registering as a Local Partner actually give a swim school? |
| `does-not` | What the badge does *not* certify | What does the badge *not* tell you about lesson quality? |
| `category-error` | The category error this badge shares with others | Why do parents mistake a participation badge for a quality guarantee? |
| `how-to-use` | How to use the badge when choosing lessons | What should you ask a Local Partner about scholarships and free slots? |

*Make a Splash* legacy branding was bridged, not stripped. The TOC chip for `#certifies`
was updated from "What it certifies" to "What the badge gives you" — the only label that
drifted out of sync with its section.

### `swimmers-ear-prevention-checklist.html` (1/5 → 4/5)

| id | Was | Now |
|---|---|---|
| `after-swim` | ✅ The after-swim routine: drain, dry, protect | ✅ How do you dry a child's ears after every swim? |
| `protect` | 🏊 Extra protection for frequent and prone swimmers | 🏊 What extra steps help a child who swims several times a week? |
| `warning-signs` | 🚨 Warning signs: when to stop swimming and see a doctor | 🚨 When should a child stop swimming and see a doctor? |

### `year-round-swim-skills-checklist.html` (1/5 → 4/5)

| id | Was | Now |
|---|---|---|
| `keep-lessons` | ✅ The most effective fix: keep lessons going year-round | ✅ How does lesson continuity make progress faster and cheaper? |
| `at-home` | 🏠 How to reinforce swim skills between lessons | 🏠 Why is at-home practice not the same as teaching a child to swim? |
| `off-season` | 🗓️ Off-season habits that protect skills and safety | 🗓️ Which off-season habits protect both swim skills and supervision? |

## Collisions: three re-aims, all below threshold, all still wrong

Ten proposals were scored against a **7,050-heading** corpus of every `h1+h2+h3` ending in
`?` sitewide, *including each page's own FAQ*. None crossed 0.75. Three were re-aimed
anyway, because a score under threshold is not the same as an idea that is free:

| Proposal | Score | Owned by | Re-aimed to |
|---|---|---|---|
| Do swim earplugs or a swim cap prevent swimmer's ear? | 0.735 | `swimmers-ear-prevention.html` — "Do earplugs really prevent swimmer's ear?" | What extra steps help a child who swims several times a week? (**0.554**) |
| Why do year-round indoor lessons protect skills better than summer-only? | 0.735 | `swim-lesson-readiness-checklist.html` — "Are year-round lessons better than summer-only?" | How does lesson continuity make progress faster and cheaper? (**0.621**) |
| What can you safely practice at home between lessons? | 0.747 | `swim-instructor-questions-checklist.html` — "🏡 What should we practice between lessons?" | Why is at-home practice not the same as teaching a child to swim? (**0.667**) |

Each re-aim was found by reading what the section *uniquely* covers, never by rewording
toward the same meaning: the earplug section's own subject is the frequent swimmer, not the
earplug; the continuity section's own claim is that progress compounds and costs less; the
at-home section's own point is a caution — practice supports lessons and never replaces
them. **Worst final score: 0.697.**

## Schema

`swimmers-ear-prevention-checklist` gained a **HowTo** (5 steps, `PT2M`) for the
drain-dry-protect routine, built from the page's own prose and bound to
`#after-swim` per the site's established HowTo shape. Step 4 is the negative instruction
("never push cotton swabs… into the ear canal") because the routine is defined as much by
what it forbids as by what it does.

The other two articles are explanatory, not procedural — no HowTo was added, and inventing
steps to satisfy a checklist item would be schema that does not describe the page.

All three articles already carried TL;DR, answer-first openings, FAQPage schema, speakable
metadata and ≥2 authoritative citations. Those were verified present, not re-added.

## Verification

| Check | Result |
|---|---|
| Scorer canary — over-skip (>2/role/file) | 0 |
| Scorer canary — non-printable questions skipped, on pages surviving n<3 | 0 |
| Heading collisions ≥0.75 | 0 of 10 |
| Old heading text asserted present before every replace | 10/10, exactly 1 match each |
| Emoji numeric character references preserved | `&#x2705;` `&#x1F3CA;` `&#x1F6A8;` `&#x1F3E0;` `&#x1F5D3;&#xFE0F;` intact, render correctly live |
| h2 `id`s unchanged | 8, 9, 9 — identical |
| Visible FAQ questions unchanged | 7, 5, 5 — identical (canary: >0, non-vacuous) |
| FAQPage schema questions unchanged | 4, 5, 5 — identical |
| Link destinations added/removed | none — both CDC URLs already present on their pages |
| JSON-LD parses | 3 + 4 + 3 blocks, all valid |
| Unclosed tags | none |
| `sitemap.xml` | valid XML; **exactly 3** `lastmod` lines changed |
| Statistics present in **rendered** text | verified after parse, not by grep |
| Live over HTTPS | 200 on all three; question H2s, HowTo and both stats confirmed in served HTML |

## Two things for Michael

**1. `aeo-progress.md` had forked, and neither copy was complete.** The tracked repo copy
held Batches 48, 49 and 50 but not 51 or 52; the working-folder copy held 51 and 52 but had
**lost 48, 49 and 50**. Batches 51 and 52 updated only the working-folder copy and were
never committed, and something then truncated the older tail. Copying either file over the
other — the obvious move — would have destroyed three batches of history silently. The two
were merged, every batch heading asserted to appear exactly once, and the result committed,
so the tracked file is now the complete record. **Worth writing the progress log to the repo
copy from now on, so this cannot fork again.**

**2. A possible swimmer's-ear cannibalization cluster.** Four pages compete on the same
intent: `swimmers-ear-prevention-checklist`, `swimmers-ear-prevention`,
`swimming-ear-infections-guide`, and a "Swimmer's Ear in Kids" entry linked from Keep
Reading. The 0.735 collision above surfaced it. Not acted on — this needs a GSC page-dimension
pull to see which one actually earns the impressions before anything is merged or
redirected.

## Backlog after this run — 7 prose articles (+ the hub)

`water-slide-safety-checklist` (2/8) · `fall-swim-skill-retention-checklist` (2/6) ·
`swim-practice-log` (2/6) · `water-confidence-challenge` (2/6) ·
`swim-milestones-by-age` (3/8) · `swim-strokes-guide-kids` (3/7) ·
`autism-wandering-water-safety` (4/9), plus `education/index.html` (1/7), excluded as a hub.

The **71 printable "bridge" H2s** remain unworked — one edit per file, no schema coupling,
still the largest untouched AEO surface on the site.
