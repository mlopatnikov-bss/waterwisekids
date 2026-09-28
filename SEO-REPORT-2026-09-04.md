# SEO Optimizer — 2026-09-04

Audited a fresh clone of `origin/live` @ `fb43340a1`. Shipped `3fc4e4202`.
Corpus: **761 HTML files** — 422 article, 222 legacy, 94 printable, 23 stub.

## Stated scope: clean, and the probes were proven to fire

| Axis | Result |
|---|---|
| Meta descriptions | 761/761 present, 0 empty, 0 duplicate, 0 multiple |
| Image alt text | 1,863 `<img>`, 0 missing `alt`, 0 empty non-decorative |
| JSON-LD | 2,176 blocks, 0 parse errors, 0 pages without LD, 0 malformed FAQ |
| OG / Twitter | 6,826 og + 3,045 twitter tags, 0 missing, **0 og≠twitter mismatches** |

A clean result is only trustworthy if the probe can fail, so cardinality was
asserted before believing it — the counts above are the evidence. Also ran the
raw-head scan for embedded unescaped quotes (which `lxml` silently recovers and
truncates, blinding a body-meta tripwire): **0**.

## Fixed and live-verified

**8 decorative SVGs given `aria-hidden="true" focusable="false"`** — the `<img>`
alt sweep is structurally blind to inline SVG, so these unnamed graphics had
never been in scope of a prior run.

- 2 search-box magnifiers (`education/`, `swimmers-hub/`)
- 4 `pillar-card-visual` ornaments (`swimmers-hub/`)
- 2 copies of the directory empty-state icon

`aria-hidden` is the correct fix rather than invented labels: each adjacent
control already carries an accessible name (`input aria-label="Search guides"`,
the `results-prompt` `<h3>`), so the icons are genuinely redundant.

**The second directory icon lives in a JS `innerHTML` string** at
`swim-lessons/directory/index.html:564` and rebuilds the empty state on filter
reset. A DOM-only probe sees one icon; the rendered page has two. Both fixed.

Verified on the live site same run — `education/` 1/1, `swimmers-hub/` 5/5,
`swim-lessons/directory/` 2/2 aria-hidden, all HTTP 200.

## Investigated and deliberately not changed

**Meta-description width — the headline number was a font artifact.** Measured
in DejaVu Sans, 678 of 761 descriptions looked over-budget. Nearly the whole
corpus failing is a threshold bug, not a site defect. Re-measured in Liberation
Sans (metric-compatible with Arial, what the SERP actually renders): **44**.
DejaVu is ~14% wider — `Hamburgefonstiv` @20px is 172.7px vs Arial's 151.2px.
The remaining 44 lose only trailing words from an already-complete sentence,
which is a hook-in-tail judgement rather than a defect.

**4 titles over the 600px budget — all benign.** Simulated the cut character by
character. Every one loses only brand-tail text:

| Page | Width | Cut |
|---|---|---|
| `swim-lessons/index.html` | 672px | `WiseKids` |
| `education/lightning-pool-safety.html` | 669px | `WiseKids` |
| `swim-lessons/directory/massachusetts.html` | 617px | `ots` |
| `…format-decision-worksheet-printable.html` | 608px | `s` |

Zero keyword loss, so rewriting them would spend risk for nothing. The printable
is `noindex` regardless.

**2 files flagged by a raw-regex fallback were false positives.**
`statistics/state-of-drowning-prevention/` and `swim-schools.html` already use
`role="img"` with descriptive `aria-label` — including genuinely good chart
descriptions. Left alone.

## Confirmed still holding

- Stub JSON-LD `url` vs own canonical: **0 contradictions** (yesterday's
  `fb43340` fix held)
- Canonical wrong-host: 0 · og:url vs canonical mismatch: 0 · non-www JSON-LD: 0
- H1: 0 missing, 0 multiple

## Unchanged, still needs Michael

- **12 duplicate-H1 pairs** — exactly the known set (`kids-swim-lessons-*.html`
  vs `swim-lessons/*.html`). Count unchanged; rewrite still deferred pending the
  consolidate-vs-differentiate call.
- **Sitemap `lastmod` contradicts `dateModified`** on 356 URLs, and the sitemap
  has not been downloaded by Google since April — the API token is read-only, so
  resubmission needs Michael.
