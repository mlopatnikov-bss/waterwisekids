# Lead Magnet Report — 2026-08-27

**Shipped:** Swim School Policy Fine-Print Checklist
**Commit:** `90d07a8` on `live` — verified 200 on production.

- Landing: https://www.waterwisekids.com/education/swim-school-policy-fine-print-checklist.html
- Printable: https://www.waterwisekids.com/education/swim-school-policy-fine-print-checklist-printable.html (noindex, self-canonical)

## Why this topic

GSC pull, 90 days to 2026-08-24, `sc-domain:waterwisekids.com` (3,077 page×query rows,
516 page rows, 2,607 query rows).

The **swim school policy cluster** — six articles about the enrollment contract rather than
the school — has depth, page-1 rankings, and converts nothing:

| Page | Impressions | Clicks | Avg pos | Words |
|---|---|---|---|---|
| `swim-school-makeup-lesson-policies` | 193 | 0 | 8.7 | 1,848 |
| `swim-lesson-makeup-tokens` | 62 | 0 | 9.1 | 1,980 |
| `pause-freeze-swim-lessons-policies` | 50 | 0 | 12.2 | 1,964 |
| `swim-school-cancellation-policies` | 48 | 0 | 15.9 | 1,977 |
| `swim-school-refund-policies` | 35 | 1 | 15.9 | 1,972 |
| `swim-school-membership-tiers` | 9 | 0 | 26.6 | 1,786 |
| **Cluster total** | **415** | **1** | — | **~11,500** |

**Zero printables across the whole cluster.** The prose-only-checklist-H2 signal fired on
**five of the six** pages:

- `pause-freeze` → "What should you ask about freeze policies before enrolling?"
- `makeup-tokens` → "How do you evaluate a makeup policy before enrolling?"
- `cancellation` → "What should I verify before enrolling?"
- `makeup-lesson-policies` → "What Questions Should I Ask Before Enrolling?"
- `membership-tiers` → "What should I ask before clicking upgrade?"

Five articles promise a list of questions and deliver prose. The magnet was already scoped.

The query text confirms it is a conversion problem, not a ranking one — the rows are long
conversational AI-style questions sitting at positions 4–8 with zero clicks: *"what is a good
makeup lesson policy for a swim school if my children miss a class due to illness"* (6 impr,
pos 6.5), *"how do most reputable swim schools handle makeup lessons or schedule changes…"*
(3, pos 5.3), *"i need a swim school with flexible scheduling and clear makeup options; what
should i ask about when enrolling"* (1, pos 4.0). That last query is literally the deliverable.

**Commercially:** a parent auditing contract fine print is at the point of enrollment. The
honest answer — most of these terms are legitimate, but you have to ask for them — makes
"go ask three schools" the natural next step, which is the CTA.

### Cannibalization guard

Five existing printables mention policy, so this looked like a collision until the actual
lines were read. Every one is a **single tick-box inside a school-selection checklist**:

| Printable | The entire policy content |
|---|---|
| `swim-school-comparison-worksheet` | "Fair makeup / cancellation policy" |
| `swim-lesson-quality-checklist` | "What are your make-up, refund, and safety policies?" |
| `swim-lesson-enrollment-checklist` | "What are the schedule, pricing, make-up, and cancellation policies?" |
| `swim-instructor-questions-checklist` | none |
| `switching-swim-schools-checklist` | none |

Splitting on **dimension** — contract fine print, not school selection — keeps the scope clean.
Title-similarity dedup against all 745 live titles: **max 0.58** (threshold 0.80).

### Topics considered and rejected

| Candidate | Signal | Rejected because |
|---|---|---|
| Prescription swim goggles | 283 impr, 0 clicks | Positions 45–67 — a ranking problem, not a magnet gap; and `swim-bag-checklist` covers gear |
| Pool noodle / flotation | 1,006 impr @ 8.3 | `floaties-puddle-jumpers-safety-checklist` + `life-jacket-sizing-guide` already exist |
| Swimming with a cast / illness | 117 impr, 0 clicks | Positions 35–60, and `swimmers-ear-prevention-checklist` covers the adjacent dimension |
| Pool fence laws by state | 1,341 impr | Under the de-cannibalization MONITOR; `pool-fence-gate-inspection-checklist` exists |
| Beach warning flags | 211 impr | Shipped as magnet #15 on 2026-08-23 |

## What shipped

- **Landing page** — Article + BreadcrumbList + FAQPage schema, 7 H2s, **20 internal prose
  links inside `.article-body`**, sidebar TOC + CTA, inline printable CTA, Formspree capture
  (`mojpyqdo`), `data-cta` + dataLayer events wired.
- **Printable** — one page, 8 sections, 3 fill-in tables with School A / School B columns,
  26 tick boxes, 30 fill-in cells, red-flag panel, fill-in policy record card, screen-only
  CTA to `/swim-lessons/`.
- **Card SVG** at `assets/images/cards/swim-school-policy-fine-print-checklist.svg` (600×360).
- **6 inbound prose links** so it does not launch link-starved — one from each cluster page —
  plus the education hub card (7 total).
- `education/index.html` card at top of grid; `sitemap.xml` +1 (landing only, printable excluded).
- Guide count 413 → **414** in all four spots. `about/index.html` was **two behind at 411**;
  corrected. Sitemap `/education/` count is now 415, source of truth = 415 − 1 = 414. ✅

## Claim discipline

No new numbers were invented. Every range on both pages is reused verbatim from the
already-validated cluster articles, so there is no cross-page contradiction:
2–4 makeups per session · 30–60 (and 30–90) day expiry · 24–48h advance notice ·
up to 4 weeks freeze per 12 months with 2 weeks' notice · 60–90 day return window ·
30-day written notice as the most common perpetual policy · 60–120 day card dispute window.
Every range is stated as "commonly published" with an explicit "policies vary widely" note.

## Verification

- **FAQ schema and visible FAQ generated from one Python source** — 7/7 question and answer
  strings asserted byte-identical between JSON-LD and the rendered `<h3>`/`<p>` pairs.
- All 5 JSON-LD blocks parse; 0 metas stranded in `<body>` (html5lib); 1 `<h1>` per page;
  meta descriptions 156 / 155 decoded chars; printable carries `robots: noindex` + self-canonical.
- Every internal `href` on both new pages resolves to a real file — **0 broken links**.
- Each of the 6 inbound anchors asserted **unique in the raw HTML**, asserted **not present in
  any JSON-LD block** on that page, and the page re-parsed after the prose edit to confirm the
  link lands inside `.article-body` and the `</p>` survived.
- **Class-set diff vs the `swim-lesson-annual-cost-worksheet` baseline sibling: zero novel
  classes** on both the landing and the printable ⇒ no CSS regression possible.
- **Headless render over HTTP** (never `file://`) at 320 / 768 / 1280 px across all 11 touched
  pages — 33 renders, all 200, `scrollWidth == clientWidth` everywhere, **0 JS errors**.
- Rendered-DOM function checks: 7/7 FAQ answers present in `innerText`; newsletter form visible;
  success message confirmed a **sibling of the form, not nested inside it**; Formspree endpoint
  `mojpyqdo` present; submit button 45px and print button 54px tap targets.
- Production after deploy: landing 200, printable 200 with `noindex`, card SVG 200, sitemap
  contains the landing and **not** the printable, hub renders the card, homepage and about
  both read 414.

## Note for the next run

`about/index.html` holds two guide-count spots that `index.html` does not, and the two files
drift independently — the homepage was correct at 413 while about said 411. Patch all four
spots across both files every run.
