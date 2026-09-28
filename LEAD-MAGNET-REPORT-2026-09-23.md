# Lead Magnet Report — 2026-09-23

**Shipped:** Winter Swim Lesson Routine Card (the routine from the pool to the car)
**Commit:** `99a1004` on `live` (pushed 3c26896..99a1004). All three URLs return 200 on production.

- Landing: https://www.waterwisekids.com/education/winter-swim-lesson-routine-card.html
- Printable: https://www.waterwisekids.com/education/winter-swim-lesson-routine-card-printable.html (noindex, self-canonical)

## Why this topic

- **Timing:** it's late September, and families are deciding whether to keep lessons going over the winter. Keeping lessons going through the year is the enrollment outcome that matters most for British Swim School.
- **Gap in the site:** several pages already argue *for* winter lessons: winter-swim-lessons, year-round-vs-seasonal, and the fall retention and schedule printables. None of the 111 printables deals with the practical reason families stop in January: the cold 15 minutes after the lesson (wet hair, a chilly changing room, the car seat, the "wet hair gives them a cold" worry). The only existing coverage was one paragraph in swim-bag-checklist.
- **Enrollment link:** the page answers the "they'll get sick / it's too cold" objection directly. It ends with a "Winter Is When Swimmers Are Made" section that points to Find Lessons, the winter and year-round articles, and the fall schedule planner.

No GSC or query data was available this run. The topic choice rests on the season and on the gap in printables.

## What was built

**Printable (7 sections):**
- Before you leave home
- Leaving the pool (the first 2 minutes)
- A timed 10-minute changing-room routine
- The car seat winter coat rule, including the AAP pinch test
- The wet-hair myth, with a box on when to skip a lesson
- An 8-week log: minutes from water to car, shivering, mood, what to practise, and what to fix next week
- A family plan to fill in

**Landing page:**
- 13 H2 sections and about 3,100 words
- Article, BreadcrumbList and FAQPage schema (8 questions)
- Email capture form (same Formspree endpoint and fields as the other lead magnets)
- Sidebar table of contents and printable call-to-action
- 5 sources: 3 from the AAP's HealthyChildren site (winter car seats, winter safety, swim lessons) and 2 from the CDC (common cold, swimmer's ear)
- A disclaimer that this is not medical advice

**Wiring:**
- New card image (SVG)
- Card added to education/index.html, above the 09-22 card
- Sitemap: 668 → 669 URLs; lastmod bumped on the 5 related articles
- One contextual link added to each of 5 related articles: winter-swim-lessons, year-round-vs-seasonal-swim-lessons, kids-hair-care-swimmers, post-swim-care-for-kids, swim-bag-checklist

## Checks

- JSON-LD parses
- Tags balance on both pages
- 0 broken internal links
- Sitemap XML is valid
- Live URLs return 200

## Notes

- **Health claims kept conservative:** no pool temperature figures, and no claims about British Swim School policy. The page says wet hair doesn't *cause* colds (the CDC says colds are viral) and frames the routine as keeping kids comfortable, not preventing illness.
- **Local repo still out of sync:** the Mac Mini copy's `live` branch still diverges from `origin/live`. As on 09-22, this run worked in a fresh clone of `origin/live` and did not touch the local copy.
- **Cleanup:** all cleanup commands ran. This run's own clone was removed. About 530 MB of leftover `/tmp/wwk-*` files (wwk-pw, wwk-py, wwk-mob, wwk-home, and others) belong to another session's user (`nobody`), so this session couldn't delete them (permission denied). Disk usage is 69%.
- **Security:** the local repo's `origin` URL has a GitHub personal access token embedded in plain text. Consider rotating it and switching to a credential helper.
