# AEO Report — 2026-09-02 (Batch 52)

**Shipped:** `bf9cdcf` → `live` (from `2598293`). Three articles, 22 statement H2s converted
to question H2s, `dateModified` + visible `Updated` + `sitemap.xml lastmod` bumped on
exactly 3 URLs. All live-verified over HTTPS.

| Article | Before | After | Words |
|---|---|---|---|
| `education/national-water-safety-action-plan-explained.html` | 1/12 | **11/12** | 2,204 |
| `education/end-of-summer-swim-skills-report-card.html` | 1/10 | **7/10** | 2,111 |
| `education/new-jersey-pool-fence-law.html` | 1/8 | **7/8** | 2,326 |

All three finish at **100% of convertible H2s.** Residuals are role headings only
(`Keep Reading`, `Authoritative Sources`) plus two lead-magnet CTA headings on the report
card — see "The one residual worth naming" below.

These were the three worst-scoring true prose articles on the backlog, and
`national-water-safety-action-plan-explained` had been deferred at the top of the backlog
for four consecutive runs.

---

## The finding: a role classifier is only as good as its worst markup variant

Batch 51 established that the question-H2 ratio must skip printable card labels
(`h2.cl-*`) and drop pages with fewer than 3 scored H2s. Re-running that scorer today
returned **18 backlog pages** — but four of them were printables scoring 0/3, which
should have been impossible under Batch 51's own finding that printables collapse to a
denominator of 1.

They didn't collapse because the skip list was **matching heading text**, and these pages
use different words for the same roles. `Related Water Safety Guides` is the same role as
`Related Reading`. `Build Your Child's Water Safety Skills` is a bottom-of-page CTA. The
text differs; the role does not.

**Rewritten to classify by DOM role, never by heading prose.** A heading is skipped when:

| Role | Detected by |
|---|---|
| `printable-card-label` | `class` starts with `cl-` |
| `cta` | ancestor class matches `screen-cta` / `cta-card` / `lead-magnet` / `newsletter-section` / `email-capture` |
| `related-cards` | ancestor class matches `related-articles` / `related-reading` / `keep-reading`, **or** the h2's immediate next sibling contains `.related-card` / `.article-card` |
| `sources-list` | ancestor class `authoritative-sources`, **or** next sibling is a list whose links are all external |
| `structural-id` | `id` in `{faq, sources, related, keep-reading}` |
| `faq-block` | the next three `h3`s are all questions and this h2 is their nearest preceding h2 |

Two traps this walked into and out of, both worth keeping:

**1. The over-broad ancestor test fires on everything.** The first `related-cards` rule
was `h2.parent.find(class_="related-card")`. On these templates the whole `.article-body`
is one container that includes a Related block at the bottom — so *every* H2 on the page
matched. `national-water-safety-action-plan-explained` went from 1/11 to **1/2**;
`swim-strokes-guide-kids`' four stroke sections were all classified as related-cards. The
symptom was silent: the backlog *shrank* to 21 and looked healthier.

The fix was a **cardinality canary**: assert no file skips more than 2 headings as
`related-cards`. It fired at 0 after restricting the parent test to containers with ≤3
direct element children, and would have caught the bug immediately had it existed first.
Every sweep gets a canary; a filter that fires too much is as invisible as one that never
fires.

**2. The "never skip a question" rule needs an explicit exemption, not a silent one.**
Fifteen headings ending in `?` are skipped — all fifteen are `h2.cl-*` printable card
labels (`Symptom by Symptom — Swim or Skip?`, `4. Cancellation — How Do I Leave?`). That
is correct: they are printed on a physical card. But the assertion has to distinguish
*that* exemption from a genuine over-skip, so the check is now **"no non-printable
question is ever skipped" — currently 0**, with the printable count reported separately
rather than folded into the same number.

### The corrected backlog

| Scorer | Backlog under 50% | Printables in it |
|---|---|---|
| Batch 51 text-based skip list | 18 | 4 |
| Role-based, over-broad related-cards | 21 → 30 | 14 |
| **Role-based, canary-clean (final)** | **11** | **0** |

`dropped(n<3) = 92, of which printables = 92` — every printable now drops out on its own,
with no printable-specific rule needed beyond the `cl-` class. That is the Batch 51 finding
reproducing itself from a cleaner premise, which is the point.

**Real prose backlog: 10 articles** (plus `education/index.html`, the hub, excluded as a
class):
`swimmers-ear-prevention-checklist` (1/5) · `year-round-swim-skills-checklist` (1/5) ·
`make-a-splash-local-partner-badge-decoded` (1/5, and note the *Make a Splash* legacy-branding
rule: bridge, do not strip) · `water-slide-safety-checklist` (2/8) ·
`fall-swim-skill-retention-checklist` (2/6) · `water-confidence-challenge` (2/6) ·
`swim-practice-log` (2/6) · `swim-milestones-by-age` (3/8) · `swim-strokes-guide-kids` (3/7) ·
`autism-wandering-water-safety` (4/9).

---

## H2 conversions

### `national-water-safety-action-plan-explained.html`

| id | Was | Now |
|---|---|---|
| `not-a-law` | Is it a law? How the plan actually works | If it is not a law, how does the plan actually work? |
| `six-areas` | The six focus areas, decoded for parents | What does each focus area mean for your family? |
| `area-1` | 1. Barriers, entrapment & electrical safety | 1. How do barriers stop a child from reaching the water? |
| `area-2` | 2. Data & surveillance | 2. Why does better drowning data prevent drownings? |
| `area-3` | 3. Life jackets & personal flotation devices | 3. What does the plan say about life jackets versus water wings? |
| `area-4` | 4. Rescue & CPR | 4. Why does CPR for drowning include rescue breaths? |
| `area-5` | 5. Lifeguards & supervision | 5. Who is responsible for watching the water? |
| `area-6` | 6. Water safety, competency & swim lessons | 6. Why do swim lessons count as a national prevention strategy? |
| `equity` | The thread running through it all: equity | Who drowns most, and what does the plan do about it? |
| `layers` | How the plan connects to everything else | How does the plan connect to the layers of protection? |

The six focus areas keep their `1.`–`6.` ordinal prefix; the plan enumerates them, and the
numbers are load-bearing for a reader scanning against the source document.

### `end-of-summer-swim-skills-report-card.html`

| id | Was | Now |
|---|---|---|
| `how` | ✅ How the Report Card Works | ✅ How Do You Score a Child's Swim Skills at Home? |
| `stage1` | 🌊 Stage 1: Comfort (the foundation) | 🌊 Stage 1: Is Your Child Comfortable and Relaxed in the Water? |
| `stage2` | 🦺 Stage 2: Survival Skills (the life-savers) | 🦺 Stage 2: Can Your Child Float and Get Back to the Wall? |
| `stage3` | 🏊 Stage 3: Water Competency (the goal) | 🏊 Stage 3: Can Your Child Jump In, Tread, and Swim 25 Yards? |
| `reading` | 🔍 Reading Your Child's Scores | 🔍 What Do Your Child's Report Card Scores Mean? |
| `fall` | 🍂 What to Do With the Results This Fall | 🍂 What Should You Do With the Results This Fall? |

Stage labels are retained because the three stages are referenced by name in the body, in
the FAQ answers, and on the linked printable.

### `new-jersey-pool-fence-law.html`

| id | Was | Now |
|---|---|---|
| `height` | Fence height and the 4-inch gap rule | How tall must a New Jersey pool fence be? |
| `gates` | Gate rules: self-closing, self-latching, opening outward | What gate hardware does New Jersey require on a pool fence? |
| `above-ground` | Above-ground pools, hot tubs, and spas | Do above-ground pools, hot tubs, and spas need a fence? |
| `house-wall` | When your house is one wall of the barrier | Can your house serve as one wall of the pool barrier? |
| `permits` | Permits, inspections, and filling the pool | Does a new pool in New Jersey need a permit and inspection? |
| `layers` | A fence is the first layer, not the only one | What other layers should a New Jersey pool owner add? |

Every number and claim in the new headings ("48 inches", the 4-inch sphere, permit before
fill) is stated in its own section. Nothing was authored into a heading that the body does
not support, and no legal claim was altered — only the framing of the question the section
already answers.

---

## Collision handling

22 proposals scored against a **7,013-heading** sitewide corpus (h1+h2+h3 ending in `?`
across 757 files) plus intra-batch. **Seven re-aims**, five of them driven by
*self*-cannibalization rather than the sitewide corpus:

| Proposal | Score | Nearest | Re-aimed to |
|---|---|---|---|
| `Is the National Water Safety Action Plan a law?` | **1.000** | its own FAQ h3, verbatim | `If it is not a law, how does the plan actually work?` |
| `What are the six focus areas of the action plan?` | **0.920** | its own FAQ h3 | `What does each focus area mean for your family?` |
| `6. What water competency skills should every child learn?` | **0.885** | `water-safety-for-kids.html` | `6. Why do swim lessons count as a national prevention strategy?` |
| `3. When should a child wear a Coast Guard-approved life jacket?` | 0.776 | `life-jacket-sizing-guide.html` | `3. What does the plan say about life jackets versus water wings?` |
| `5. What is a water watcher, and who should be one?` | 0.776 | `fourth-of-july-water-safety.html` | `5. Who is responsible for watching the water?` |
| `Do you need a permit before filling a new pool in New Jersey?` | 0.779 | its own FAQ h3 | `Does a new pool in New Jersey need a permit and inspection?` |
| `Is a pool fence enough to prevent drowning on its own?` | 0.767 | `pool-fence-gate-inspection-checklist.html` | `What other layers should a New Jersey pool owner add?` |

Re-aim threshold was lowered to **0.75** for this batch because the two worst offenders
were exact duplicates of the page's own FAQ. On a page whose FAQ already owns the
definitional queries, the body H2s must be aimed somewhere else entirely — the sitewide
corpus was not the binding constraint here, the page itself was.

**Final: worst score 0.716, zero collisions at any threshold.**

## The one residual worth naming

`end-of-summer-swim-skills-report-card.html` finishes at 7/10, not 7/7, because two of its
three residual H2s are lead-magnet CTAs — `🖨️ Get the Free Printable Report Card` and
`Get the Free End-of-Summer Swim Skills Report Card + Weekly Tips`. The second sits inside
`section.newsletter-section` and is now skipped by role. The first sits **inside
`.article-body` with no CTA container or class at all** — structurally indistinguishable
from a content section, so no role rule can catch it without falling back to matching its
prose.

It was **not** converted. Turning a "download the printable" CTA into a question would aim
it at a query no parent types and would damage the conversion path for the sake of a
metric. Flagged instead: if lead-magnet CTA sections inside `.article-body` are given a
class (`lead-magnet-cta` would already be caught by the existing rule), they become
skippable by role sitewide and stop appearing as false AEO deficits.

---

## Validation

All three files, all checks:

- Tag balance `err=0 / stackleft=0`.
- html5lib head integrity: 16 metas in `<head>`, **0 metas in `<body>`**, canonical in head.
- JSON-LD parses clean — `[Article, BreadcrumbList, FAQPage]` on all three; `jerr=0`;
  **0 HTML entities leaked inside JSON-LD**.
- **FAQ schema↔visible drift 0** across 5/5/5 Q&A; **0 orphan visible FAQ questions**
  (the Batch-49 append bug does not recur).
- Speakable resolved with soupsieve: every selector → exactly 1 on every file, none match zero.
- `headline == h1` on all three. Meta descriptions untouched, decoded 157 / 154 / 154 (≤160).
- Nested anchors 0. Unsubstituted `__PLACEHOLDER__` 0. Broken in-page `#` anchors 0.
  Brand-voice ownership scan **0 hits**.
- **DOM signature diff vs HEAD, scripts stripped: 210/210, 209/209, 214/214 elements,
  tag+id+class sequence byte-identical on all three.** Heading text only.
- **Text-node diff:** every removed string is a replaced heading; every added string is its
  replacement. **No prose was deleted or altered on any file.**
- Emoji preserved byte-for-byte. The report card stores its emoji as **numeric character
  references** (`&#x2705;`, `&#x1F9BA;`), and the first prefix-capture regex ordered its
  alternation so `[^A-Za-z0-9<]` consumed `&#` and stopped at the `x` — leaving `x2705;`
  in the heading. Caught by an old-text equality assertion before any write. **Put the
  entity alternative first in the alternation**, and always assert the old text matches
  before replacing, never just that the new text was written.
- `dateModified` 2026-07-27 / 2026-07-28 / 2026-08-15 → **2026-09-02**; visible `Updated`
  line bumped on the two files that carry one; `sitemap.xml` lastmod bumped for **exactly
  these 3 URLs**, re-parsed clean, **644 entries unchanged**. No blanket bump.
- Live-verified after deploy: all three HTTP 200, question-H2 counts 11 / 7 / 7 serving,
  `dateModified` 2026-09-02 live on all three, sitemap `lastmod` 2026-09-02 live on all three.

---

## Flagged for Michael — not changed

1. **Sitemap `lastmod` was ahead of `dateModified` on two of these three pages before this
   run** — `national-water-safety-action-plan-explained` and `new-jersey-pool-fence-law`
   both carried `lastmod 2026-08-29` against a `dateModified` of 2026-07-27 and 2026-08-15.
   This is the known 356-URL contradiction (`f387109f`), reproducing on pages this batch
   happened to touch. These three are now consistent; the other ~353 are not, and Google is
   being told a modification date the page itself denies.

2. **`education/index.html` sits at 1/7 question H2s** and is the highest-traffic page on
   the backlog at 14,421 words. It has been excluded from every batch as a "listing page
   class", but at 7 scored H2s it is not really a listing page any more — it has genuine
   prose sections. Worth a decision: either work it, or exclude it explicitly and stop
   printing it in the backlog.

3. **Lead-magnet CTA sections inside `.article-body` carry no distinguishing class.** See
   "The one residual worth naming". A one-line class addition would remove a recurring
   class of false AEO deficit sitewide.
