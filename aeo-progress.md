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
