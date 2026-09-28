# Content Validation Report — 2026-08-28

**Scope:** 14 commits in the last 24h. 499 education HTML files touched
(412 non-printable), 1 genuinely new article.
**Audited against:** fresh clone of `origin/live` @ `15dcc90` (not the mount).
**Result:** 1 real defect found and fixed. Pushed as `a9eee87`.

## New content

| File | Status |
|---|---|
| `education/swim-school-policy-fine-print-checklist.html` | **PASS** — all 13 structural checks, 0 banned patterns, 4,052 words, 1 h1, 12 h2, meta desc 156 chars, canonical present, Article + FAQPage + BreadcrumbList + Organization + Speakable schema, sitemap entry w/ lastmod 2026-08-28 |
| `...-printable.html` | Excluded — printables are out of scope for the content validator |

## Defect found and fixed

**FAQ schema questions paraphrased instead of sourced from visible copy**
— `education/swim-school-makeup-lesson-policies.html`

Commit `15dcc90` added two FAQ Q&As and two new h2 sections in the same
change, but worded them differently:

| | |
|---|---|
| schema | How do make-up lessons work if I have more than one child enrolled? |
| visible | How do make-up policies work when you have multiple children enrolled? |
| schema | What makes a good swim school make-up lesson policy? |
| visible | What does a good make-up lesson policy look like? |

FAQPage entries must match on-page text. The commit message claimed the Q&As
were "sourced from the visible copy" — they were not. Schema now matches the
visible h2s exactly. All 2,070 FAQ questions sitewide now resolve to visible
copy.

## Checks run (all canary-gated)

| Sweep | Scope | Result |
|---|---|---|
| Full structural template + 4 banned patterns | 412 articles | 0 failures |
| OG / canonical / breadcrumb / Article schema / h1 / meta-desc / img-alt / sitemap | 411 articles | 0 failures |
| `<head>` integrity after 149-title rewrite (html5lib, body-meta assertion) | 149 files | 0 broken, 0 body metas |
| FAQ schema ↔ visible copy | 2,070 questions / 414 articles | 2 real → fixed |
| Speakable selector liveness | 1,845 selectors | 0 inert |
| Internal link integrity (parser-based) | 499 files | 0 broken |
| Nav / footer markup variants | 412 articles | 2 nav, 1 footer (within tripwire) |
| Content stranded below `.related` | 499 files | 0 genuine |

## False-positive classes confirmed (no action taken)

- **`og:title` / `twitter:title` diverging from `<title>` (81 files).** Not
  drift. Divergence is *higher* on files untouched by the title rewrite
  (67%, 274/410) than on touched files (51%, 76/149), and `15dcc90`
  documents the decision explicitly — og/twitter carry no SERP width
  constraint. Blanket-syncing would have been wrong.
- **FAQ "answer paraphrase" (93 flags).** Probe artifact. Schema answers
  open with a lead-in ("Yes —", "Almost never —") absent from prose; the
  substance is present from word ~5 onward. Verified by sliding-window test.
- **Content below `.related` (94 flags).** All lead-magnet CTA h2s and
  conventional FAQ/Keep Reading blocks, placed there by design.
- **`education/index.html` failing article checks.** It is the education hub
  listing page, not an article. Correct exception.

## Notes

- The `hub`/`index` exception is the only structural check failure sitewide;
  worth encoding into the skill's file filter so it stops surfacing.
- The recurring risk this run confirms: an authoring pass that generates
  schema and visible copy in the *same* commit can still desync them. Only a
  schema↔visible diff catches it — the structural greps all passed.
