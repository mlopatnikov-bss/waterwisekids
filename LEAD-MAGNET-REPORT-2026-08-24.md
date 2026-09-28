# Lead Magnet Report — 2026-08-24

**Shipped:** Water Safety Activities You Can Do at Home (No Pool Needed)
**Commit:** `efcff02` on `live` — verified 200 on production.

- Landing: https://www.waterwisekids.com/education/water-safety-activities-at-home.html
- Printable: https://www.waterwisekids.com/education/water-safety-activities-at-home-printable.html (noindex, self-canonical)

## Why this topic

GSC pull, 90 days, `sc-domain:waterwisekids.com` (2,504 query rows / 2,858 query+page rows).

The `/education/` hub is absorbing ~283 impressions of generic
"water safety program / activities / skills / classes / education / for preschoolers"
queries at **positions 33–82 with zero clicks**, while the two dedicated articles in
that cluster draw almost nothing:

| Page | Impressions | Clicks |
|---|---|---|
| `/education/` hub (generic water-safety-activity queries) | ~283 | 0 |
| `water-safety-games-kids.html` | 6 | 0 |
| `water-safety-activities-schools.html` | 0 | 0 |
| `water-safety-for-kids.html` | 51 | 0 |

Classic hub-cannibalization. The cluster had **two strong articles (3,404 and 3,610 words)
but zero printable and zero email capture** — the exact "cluster without a printable" gap.

Existing scope was already taken in two directions:
- `water-safety-games-kids.html` → **in-water** pool games
- `water-safety-activities-schools.html` → **K–5 classroom** activities

Uncovered: the **at-home, dry-land, no-pool family** angle. Seasonally right for late
August — pools close, lessons pause, and the habits built all summer quietly fade.
It also bridges cleanly to enrollment: home activities build habit and judgement but
cannot build the in-water skill, which is the honest case for year-round lessons.

### Topics considered and rejected

| Candidate | Impressions | Rejected because |
|---|---|---|
| Sibling / family discounts | 176 @ p3.5–10.1 | Already has `multi-child-swim-lesson-cost-worksheet-printable` |
| Pool "code brown" closures | 77 @ p8.8–12.1 | 3 overlapping articles already; definitional intent, poor magnet |
| Pool fence laws by state | 268 @ p6.4 | Already has `pool-fence-gate-inspection-checklist-printable` |
| YMCA swim levels | 105 @ p7.2 | Covered + open cannibalization WATCH (recheck after 2026-09-15) |
| Intensive vs weekly lessons | 28 @ p2.0/p5.8 | Landing page would collide with the existing article (title dup risk) |

Title-similarity dedup against all 899 live pages: **max 0.56** (threshold 0.80). Clear.

## What shipped

- Landing page — Article + BreadcrumbList + FAQPage schema, 21 prose links inside
  `.article-body`, sidebar TOC + CTA, inline printable CTA, Formspree email capture
  (`mojpyqdo`), `data-cta` + dataLayer events wired.
- Printable — one page, six tick-box activities, "make it stick" habits, safety reminder,
  fill-in family plan, screen-only CTA to `/swim-lessons/`.
- Card SVG at `assets/images/cards/water-safety-activities-at-home.svg` (600×360).
- **6 inbound prose links** so it does not launch link-starved:
  `water-safety-games-kids`, `water-safety-activities-schools`, `water-safety-for-kids`,
  `teaching-water-respect`, `home-water-safety-room-by-room-checklist`,
  `water-safety-beyond-the-pool` — plus the education hub card (7 total).
- `education/index.html` card at top of grid; `sitemap.xml` +1 (landing only).
- Guide count 410 → **411** in all 4 spots (index.html ×2, about/index.html ×2).
  Sitemap `/education/` count is now 412; source of truth = 412 − 1 = 411. ✅

## Verification

- FAQ schema text generated from the same Python source as the visible copy — **parity asserted**, 5/5 Q&A.
- Every inbound-link anchor asserted **unique in raw HTML** and asserted **not mirrored in any JSON-LD FAQ answer**.
  This caught one bad anchor in `water-safety-for-kids.html` (the CPR-caregivers sentence
  is also an FAQ answer) — moved to a safe paragraph rather than silently desyncing the schema.
- Headless render over HTTP at 320 / 768 / 1280 px on all 5 touched pages: all 200,
  `scrollWidth == clientWidth` everywhere, zero JS errors.
- Tap-target and contrast signatures **diffed against the `fall-swim-skill-retention-checklist`
  baseline sibling** — identical fail fingerprints (mobile bottom-nav 10px labels, and the
  CTA-card ancestor-background walker artifact). No regression introduced.
- All internal links resolve; all JSON-LD parses; printable correctly absent from sitemap
  (the only 3 indexable printables remain the known by-design ones).
- Production: landing 200, printable 200 with `robots: noindex`, card SVG 200,
  sitemap contains the landing page, education hub renders the card.

## Notes / choices made autonomously

- Slug pair follows the site convention `X.html` + `X-printable.html`.
- Printable `headline` carries the "(Printable)" suffix so it differs from the H1 —
  that is the existing 81/81 convention, not drift.
- Cache-bust versions left untouched (no CSS changed): `main.css?v=20260824c`,
  `article.css?v=20260823b`, `printable-checklist.css?v=20260824a`, `main.js?v=20260823c`.
- No new statistics invented. The only figure used is the AAP 88% reduction for ages 1–4,
  already used sitewide.
