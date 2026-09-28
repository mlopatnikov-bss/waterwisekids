# Lead Magnet Report — 2026-09-24

**Shipped:** Parent & Me Swim Class Card (holds, cues, when to stop, and an 8-class log)
**Commit:** `4b3d159` on `live` (pushed 6b18423..4b3d159)

- Landing: https://www.waterwisekids.com/education/parent-and-me-swim-class-card.html
- Printable: https://www.waterwisekids.com/education/parent-and-me-swim-class-card-printable.html (noindex, self-canonical)

## Why this topic

- **Gap:** none of the 112 printables covers parent-and-child (infant) classes. The site already has 36 pages that mention parent-and-me classes, including a 4,100-word guide, but nothing a parent can take into the pool or fill in from week to week.
- **Enrollment link:** baby classes are how many families first sign up with a swim school. Nervous first-time parents drop out after two or three tearful classes. This card helps with those early weeks, then points to what comes next: the first-birthday line on the class plan, "what comes after the baby class", and Find Lessons.
- **Timing:** fall sessions are starting, and new baby classes are forming now.

No GSC or query data was available this run. The topic choice rests on the gap in printables and the enrollment funnel.

## What was built

**Printable (9 sections):**
- Before class
- Getting in and out safely
- A table of the three holds
- The cue routine (no surprise water)
- Reading your baby, with an out / pediatrician / 911 box
- What a baby class does and doesn't do
- An 8-class log
- A class plan to fill in

**Landing page:**
- 13 H2 sections and about 3,260 words
- Article, BreadcrumbList and FAQPage schema (8 questions)
- The same Formspree email capture as the other lead magnets
- Sidebar table of contents and printable call-to-action
- 5 sources: the AAP's 2026 updated drowning prevention news release and policy statement, AAP swim lessons, AAP infant water safety, and CDC swim diaper tips

**Wiring:**
- New card image (SVG)
- Card added to education/index.html, above the 09-23 card
- Sitemap: 669 → 670 URLs
- One contextual link added above the FAQ on each of 5 related articles, with their lastmod bumped: parent-and-me-swim-lessons-guide, introducing-baby-to-pool-first-time, swim-diapers-for-baby-swim-class, infant-water-safety-checklist, baby-swim-lessons-8-weeks

## Checks

- JSON-LD parses on all 8 touched pages
- Tags balance
- 0 broken internal links
- Sitemap XML is valid (670 URLs)
- Meta description is 157 characters and the title is 68

**Live URLs not checked:** the browser pane needed a site approval, and nobody was present to give it.

## Notes

- **Deliberately conservative, following the AAP's May 2026 policy update:**
  - The page says plainly that there is no evidence infant lessons reduce drowning.
  - Lessons are recommended after age 1, with touch supervision for babies.
  - Going underwater happens only when the instructor leads it.
  - Nothing is said about specific British Swim School program names or policies.
- **Content flag:** the existing parent-and-me-swim-lessons-guide makes two claims worth a later review:
  - A "Griffith University" statistic about the parent-child bond predicting water confidence. The source isn't clear.
  - Blowing on a baby's face "triggers the dive reflex".

  The new page does not repeat either claim.
- **Push:** the first push was rejected because a mobile-consistency commit (6b18423) landed during the build. This run rebased onto it cleanly and pushed.
- **Local repo still out of sync:** the Mac Mini copy's `live` branch still diverges from `origin/live`. This run worked in a fresh clone of `origin/live` and left the local copy untouched. This report is the only file written to the local folder.
- **Security, still open:** a GitHub token is stored in plain text in the local repo's `origin` URL. Consider rotating it.
