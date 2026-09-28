# Internal Linking Report — 2026-09-09

**Result: NO ACTION. Nothing committed, nothing pushed.**
Measured on a fresh clone of `origin/live` @ `23f3656b5`. **Sixth consecutive closed run.**

---

## 1. Corpus A — indexable `/education/` pages with `.article-body`

**423 pages** (523 education HTML files, 96 `noindex`, 4 indexable without `.article-body`).
Was 422 on 09-08, 421 on 09-07, 420 on 09-06.

Locked definition (per 09-08): an `<a>` inside a `<p>` or `<li>` within `.article-body`, with
no ancestor within 6 levels carrying a *role* class (`related`), and with `myth-card` /
`truth-section` explicitly allowlisted as editorial prose. Metric = **distinct donors**.

Exclusion-filter canary fired — **158 links** dropped, identical to 09-08:

| blocking class | links | pages | verdict |
|---|---|---|---|
| `article-related` | 121 | 18 | correct — boilerplate |
| `related-articles` | 26 | 4 | correct — boilerplate |
| `myth-card` | 11 | 1 | **allowed** — editorial prose (09-08 false-negative fix, held) |

| distinct donors | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11+ |
|---|---|---|---|---|---|---|---|---|---|---|
| pages | 106 | 66 | 61 | 30 | 25 | 26 | 19 | 13 | 10 | 67 |

- **Floor is still 2.** Zero pages at 0 or 1.
- **0 broken internal hrefs** inside `.article-body` across all 423 pages (4,008 links in `p|li`).
- **Outbound floor is 1 — zero dead ends.** Every Corpus A page links onward to at least one
  other education page.

Per the standing directive no links were manufactured. Link concentration is measurably
uncorrelated with rank on this site, so filling the 2-donor band is spend with no expected
return.

---

## 2. Post-publish gate — three files shipped 09-08 → 09-09

Added in `d1cf5def9` / `6948ec037`:

| new page | inbound | verdict |
|---|---|---|
| `education/pool-weather-rules.html` | **6 contextual donors** | healthy at launch |
| `education/pool-weather-rules-printable.html` | 1 (`noindex`, no `.article-body`) | correct — printable convention |
| `tools/pool-barrier-self-check.html` | 4 (`/tools/` index + 3 fence-cluster articles) | healthy at launch |

The six donors for `pool-weather-rules` are genuine topical neighbours — `lightning-pool-safety`,
`heat-exhaustion-kids-pool`, `heat-illness-young-swimmers`, `sun-safety-at-pool`,
`pool-opening-season-safety`, `child-swimming-nutrition-hydration`. The authoring flow is still
seeding donors at publish time. No remediation needed.

384 existing HTML files were modified in the same window (meta-description repair, HowTo schema,
form autocomplete, BSS canonical CTAs) — none of it regressed the link graph.

---

## 3. Corpus B — sitemap pages with no `.article-body`

**225 pages** (was 224). Donor definition: any `<a href>` resolving to the page, from any page,
after `decompose()`-ing `<header>`/`<nav>`/`<footer>`. Strip canary fired: **2,333** chrome
elements removed.

**6 pages** below 2 donors — one *fewer* than the stable set of 7 seen on 09-05/09-07/09-08:

| donors | page | verdict |
|---|---|---|
| 0 | `/privacy/`, `/terms/` | footer-only by design — not a defect |
| 1 | `/swim-lessons/asbury-park-nj.html`, `/brick-nj.html`, `/howell-nj.html`, `/ocean-county-nj.html` | depth-5 city leaves, unchanged |

`/tools/` has left the list — the printable-library and Pool Barrier Self-Check work pushed it to
2+ contextual donors. No action taken; the improvement was a side effect of content shipping, not
of this job.

---

## 4. Reachability

- **652 sitemap URLs, all 652 resolve on disk. 0 unresolved.** (650 on 09-08.)
- BFS from `/` reaches **748 files**; **0 sitemap pages unreachable** — no orphans.
- Max depth 5; only **5 pages** at depth ≥ 5 (the four NJ city pages plus
  `/pool-safety-rules-for-kids.html`). Unchanged since 09-03.

## 5. Site-wide broken-link sweep

**30,608 internal `<a>` hrefs across 772 HTML files. 0 broken.**

### Probe note — a resolver false positive worth recording

The first pass reported exactly one broken link: `/contact/?ref=scholarship-suggestion` from
`/scholarships/`. This was a **probe bug, not a site defect** — the resolver stripped `#fragment`
but not `?query`, so it tried to stat a path ending in `?ref=…`. `/contact/index.html` exists and
the link is fine. Any future link sweep must strip the query string before the four-shape
resolution (`path`, `path/index.html`, `path.html`, `path/`). Canaries confirmed live: a
fabricated href resolved `BROKEN`, real `/contact/` resolved to `/contact/index.html`.

---

## 6. Recommendation (third repetition, unchanged)

The link surface has now held closed through **six** publishing waves across six axes: donor
density, outbound dead-ends, broken hrefs, corpus-B donors, sitemap resolution, and reachability.
Every axis reports zero. **Retire the daily cadence.** Re-run this job only as a post-publish gate
on newly shipped pages — which this run demonstrates takes about two minutes and has found a
starved launch zero times in four waves.

## 7. Still escalated to Michael (unchanged, not a linking fix)

- `sitemap.xml` has not been downloaded by Google since 2026-04-07 — needs manual resubmission in
  Search Console. Until then a new page has no fast discovery path.
- HTTP variants of the site are still indexed alongside HTTPS.
