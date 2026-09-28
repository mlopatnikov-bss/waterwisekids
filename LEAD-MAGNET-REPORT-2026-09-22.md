# Lead Magnet Report — 2026-09-22

**Shipped:** After a Water Scare: 8-Hour Symptom Watch Log
**Commit:** `ed1f919` on `live` (pushed f15723f..ed1f919). All three URLs return 200 on production.

- Landing: https://www.waterwisekids.com/education/after-water-scare-symptom-watch-log.html
- Printable: https://www.waterwisekids.com/education/after-water-scare-symptom-watch-log-printable.html (noindex, self-canonical)

## Why this topic

- "Secondary drowning", "dry drowning" and "delayed drowning" show up about 190 times across 26 article pages. That makes it one of the site's most-referenced drowning topics.
- None of the 110 existing printables covers the hours **after** a child is pulled out coughing. The only coverage was one line in the Drowning/CPR quick card and one in the grandparent checklist.
- The search intent is urgent and practical ("how long to watch", "when to go to the ER"). The existing explainer answers "what is it" but gives parents nothing to use that evening.
- **Enrollment link:** the week after a near miss is when many families book lessons. The page and printable end with a "what changes tomorrow" debrief (supervision, barriers, going back in the water) that leads to Find Lessons.

No GSC export was available locally this run, so topic choice rests on the site's own content and the gap in printables, not on query data.

## What was built

**Printable (8 sections):**
- Three tiers of signs: call 911 now, get seen today, keep watching
- A box to record the child's normal breathing rate
- A timed log with 9 rows, from "out of the water" through 30 min, 1–8 hours and bedtime/morning. Each row tracks breathing, cough, lip colour, alertness, and vomiting/fever, and parents read it for a *trend* rather than any single value.
- Guidance for naps and overnight
- An incident sheet to hand the doctor
- A "tomorrow" plan
- A medical disclaimer

**Landing page:**
- 13 H2 sections and about 3,300 words
- Article, BreadcrumbList and FAQPage schema (8 questions)
- Email capture form (same Formspree endpoint and fields as the other magnets)
- Sidebar table of contents and printable CTA
- 5 authoritative sources: Red Cross, Cleveland Clinic, WHO, AAP, CDC
- A "not medical advice" disclaimer

**Wiring:**
- New card image (SVG)
- Card added to education/index.html, above the 09-21 electric shock drowning card
- Sitemap: landing row added (669 → 670 URLs), lastmod bumped on 6 rows
- One contextual link added to each of 5 related articles, placed in the article body above the FAQ: secondary-drowning-dry-drowning, signs-of-drowning, drowning-cpr-quick-card, parent-cpr-water-rescue-basics, aed-water-emergencies

## Checks

- JSON-LD parses on both pages
- 0 broken internal links
- Tags balance on both pages
- Sitemap XML is valid

## Notes

- **Medical wording:** kept deliberately conservative. Anyone who needed breaths or CPR goes straight to 911, the 6–8 hour window is described as "commonly used", and the pages never say a child is "safe".
- **Wording conflict:** some older articles use stronger language, e.g. signs-of-drowning says it "can be fatal hours after", and one line on the secondary-drowning page mentions symptoms up to 24 hours. These don't contradict the new page, but a later content pass could bring the terminology in line.
- **Why a fresh clone:** the Mac Mini copy of the repo has 377 uncommitted changes and its `live` branch has diverged from `origin/live` (273 local vs 20 remote commits). This run worked in a clean clone of `origin/live` and did not touch the local copy. Someone should reconcile it before any task pushes from that folder.
