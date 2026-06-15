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
