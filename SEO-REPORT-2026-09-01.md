# SEO Optimizer — 2026-09-01

**Corpus:** 755 HTML pages (fresh clone of `live` @ `a44e087`) · 643 indexable · 89 noindex · 23 redirect stubs
**Shipped:** `418098d` → `live`, verified on production.

---

## The finding: descriptions pass the character check and still get cut

The daily scan measures meta descriptions at 70–160 characters. All 643 indexable pages pass.
But Google truncates the desktop snippet by **pixel width** (~920px at Arial 14px), not by
character count — the same distinction that made title width a 2.6x CTR lever.

Measured every indexable page with Liberation Sans (metric-compatible with Arial):

| | over limit |
|---|---|
| Titles > 600px | 1 |
| Descriptions > 920px | **326 of 643** |

326 rewrites would be high churn for a soft signal, and Google rewrites descriptions often
anyway. The tail that gets cut is usually just the end of the last sentence — losing
`'matters in a coach.'` costs nothing.

So the sweep was narrowed to the case that actually costs clicks: **the cut hides a hook the
surviving text doesn't repeat** — a deliverable (printable / checklist / worksheet / log), a
sourcing claim (CDC / AAP), or a CTA (compare quotes). That filter kept **11 of 326**
(canary-asserted as neither 0 nor all 326).

Six of the eleven were lead magnets losing the word "printable" — the single token doing the
click work on that page.

### Fixed (11 pages)

| Page | was | lost to the cut |
|---|---|---|
| `statistics/state-of-drowning-prevention/` | 1028px | `CDC/AAP data.` |
| `education/homeschool-swim-lessons-pe` | 1022px | `sample weekly PE log.` |
| `education/swimtastic-safesplash-swimlabs-comparison` | 1014px | `compare quotes.` |
| `education/ymca-vs-red-cross-learn-to-swim` | 1008px | `tracking compare.` |
| `education/summer-camp-water-safety-checklist` | 1001px | `Printable included.` |
| `education/pool-fence-gate-inspection-checklist` | 983px | `Free printable.` |
| `education/hot-tub-spa-safety-checklist` | 962px | `printable.` |
| `education/indoor-pool-safety-checklist` | 943px | `checklist.` |
| `education/swim-lesson-separation-anxiety-plan` | 931px | `printable.` |
| `education/ear-equalizing-diving-kids` | 924px | `guide.` |
| `education/bath-time-safety-infants` | 923px | `checklist.` |

All rewritten to land in 779–909px with the hook moved **ahead** of the cut. Every replacement
was an exact-string replace across the raw file, so identical `og:description`,
`twitter:description` and JSON-LD `description` mirrors moved with it — **22 mirrors across 13
files**, each asserted to reach zero occurrences of the old string.

Post-fix: hook-losing pages **11 → 0**. The remaining 315 overflow pages lose only trailing
sentence-tail words and were deliberately left alone.

### Also fixed

- **Title 617px → 586px** — `education/swim-lesson-format-decision-worksheet`, the only title
  over the 600px limit. "or Intensive?" → "or Clinic?"; verified "clinic" appears 11 times in
  the body, so the title still promises only what the page delivers. The `<title>`, `og:title`
  and `twitter:title` all moved; the `h1` is a different string and was not touched.
- **alt 127 → 123 chars** — `education/index.html`, a regression introduced by yesterday's
  lead-magnet publish. Restores `alt_gt125` to 0.

---

## Audited clean — no action

Baseline presence checks, all confirmed at zero before and after the edit:

missing title / meta description / canonical / h1 · multiple h1 · meta description length out
of band · missing `og:title` `og:description` `og:image` `og:url` `og:type` `og:image:alt` ·
missing `twitter:card` · missing `alt` · missing or unparseable JSON-LD · `<meta>` stranded in
`<body>` · duplicate meta descriptions.

Second-order checks run today, all zero:

| Check | Result |
|---|---|
| Future `dateModified` / `datePublished` in JSON-LD | 0 |
| `datePublished` later than `dateModified` | 0 |
| `canonical` ≠ `og:url` | 0 |
| JSON-LD `url` / `@id` / `mainEntityOfPage` ≠ canonical | 0 |
| Duplicate `<title>` among indexable pages | 0 |
| `<img src>` not present on disk | 0 |
| `<img>` without width+height (CLS) | 0 |
| Indexable canonicals missing from sitemap | 0 |
| Sitemap URLs with no matching indexable canonical | 0 |

Sitemap is exactly 643 URLs = 643 indexable canonicals, no duplicates.

---

## Two probe artifacts caught before they became bad edits

**1. "9 og:image URLs missing" — false.** Seven were Pexels hotlinks; the probe only stripped
the `waterwisekids.com` prefix before doing a disk `stat`, so every external URL failed by
construction. Fetched them directly: all return 200. The two real files
(`waterwisekids-og.png`, `og-image.png`) are both 1200×630.

**2. "19 noindex/stub URLs in the sitemap" — false.** The same set showed
`sitemap − indexable_canonicals = 0`, which is only possible if each URL is *also* claimed by
an indexable page. These are the documented flat-`.html` ÷ `/index.html` pairs and redirect
stubs cross-canonicalling to the live page — the stub's canonical correctly points at the
indexed URL. No action, as previously established.

---

## Worth noting, not acted on

**396 pages hotlink their `og:image` from Pexels.** The URLs are live today (verified 200), so
this is not a defect. But social card rendering across those pages depends on a third party
that has no obligation to keep a given photo ID reachable — if one 404s, the cards break
silently and nothing in the daily scan would catch it, since a presence check sees the tag is
there. Cheapest mitigation is mirroring them locally; that's a bulk asset change, so flagging
rather than doing it mid-run.

---

## Still blocked on Michael (unchanged)

- **Sitemap not downloaded by Google since April** — Google has seen 97 of 640 URLs. The API
  token is read-only; resubmission has to come from Michael in Search Console.
- **`sitemap lastmod` contradicts `dateModified` on 356 URLs** (`f387109f`).
- **HTTP variants indexed** — needs the redirect toggle.
- **Directory state pages carry no `dateModified`** (pipeline #141).

---

## Method notes for the next run

- Pixel measurement used `LiberationSans-Regular.ttf` at 20px (title) / 14px (description),
  canary-asserted against known Arial metrics (`M` = 16.7px, pangram = 280.8px) before trusting
  any output. A wrong font here silently reclassifies the whole corpus.
- Descriptions overflowing the pixel limit are **not** by themselves a defect. The actionable
  signal is hook-in-tail, and that filter must be asserted non-degenerate — a filter that keeps
  all 326 or none of them is broken, not clean.
