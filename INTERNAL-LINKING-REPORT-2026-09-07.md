# Internal Linking Report — 2026-09-07

**Result: NO ACTION. Nothing committed, nothing pushed.**
Measured on a fresh clone of `origin/live` @ `86021a229`.

---

## 1. Corpus A — indexable `/education/` pages with `.article-body`

**421 pages** (519 education HTML files, 94 `noindex`, 4 without `.article-body`).
Was 419 on 09-05, 420 on 09-06.

Counted by the locked definition: an `<a>` inside a `<p>` or `<li>` within
`.article-body`, with no ancestor within 6 levels carrying a class matching
`card|related|grid|teaser|module|widget|cta|promo`. Ranked by **distinct donors**.
Exclusion-filter canary fired — 158 of 6,376 `.article-body` internal links dropped as
card/related boilerplate, so the filter is live and not silently passing everything.

| distinct donors | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11+ |
|---|---|---|---|---|---|---|---|---|---|---|
| pages | 108 | 66 | 59 | 31 | 24 | 25 | 21 | 10 | 11 | 66 |

- **Floor is still 2.** Zero pages at 0 or 1.
- **0 broken internal hrefs** inside `.article-body` across all 421 pages.

The surface remains closed. Per the standing directive no links were manufactured —
link concentration is measurably uncorrelated with rank on this site, so filling the
2-donor band would be spend with no expected return.

### New pages since 09-05 launched healthy

Four files shipped (two landing pages + two printable twins):

| page | contextual donors |
|---|---|
| `swim-school-pool-tour-checklist` | 6 |
| `when-to-get-kids-out-of-water-checklist` | 6 |
| both matching `-printable` files (`noindex`, no `.article-body`) | 1 each — the convention |

Neither landing page launched link-starved. The authoring flow is still seeding donors
at publish time. No remediation needed.

---

## 2. Corpus B — sitemap pages with no `.article-body` (legacy template family)

**224 pages**, unchanged. Counted by the Corpus B donor definition (any `<a href>`
resolving to the page, from any page, after `decompose()`-ing `<header>`, `<nav>`,
`<footer>`) — the Corpus A probe is structurally blind to this family. Strip canary
fired: 2,318 chrome elements removed.

Only **7 pages** sit below 2 distinct donors — the identical set as 09-05:

| donors | page | verdict |
|---|---|---|
| 0 | `/privacy/`, `/terms/` | footer-only by design — not a defect |
| 1 | `/tools/` | reachable at depth < 5 via chrome; the 09-07 printable-library build added 143 outbound links, not inbound |
| 1 | `/swim-lessons/asbury-park-nj.html` | see §3 |
| 1 | `/swim-lessons/brick-nj.html` | see §3 |
| 1 | `/swim-lessons/howell-nj.html` | see §3 |
| 1 | `/swim-lessons/ocean-county-nj.html` | see §3 |

---

## 3. Reachability

- **649 sitemap URLs, all 649 resolve on disk. 0 unresolved.**
- BFS from `/` reaches **743 files**; **0 sitemap pages unreachable** — no orphans.
- Only **5 pages** at depth ≥ 5: the four NJ city pages above plus
  `/pool-safety-rules-for-kids.html`. Unchanged since 09-03.

## 4. Site-wide broken-link sweep

**30,402 internal `<a>` hrefs checked across every HTML file in the repo. 0 broken.**
This includes the 143 links on the newly built `/tools/` printable library — all resolve.

---

## 5. Still escalated to Michael (unchanged, not a linking fix)

The five depth-5 pages fail the twin test — linking them would strengthen cannibalizing
duplicates. Each of the four NJ pages has exactly one donor
(`/swim-lessons/jersey-shore.html`) and sits in a reciprocal 2-cycle with it. The
correct fix is consolidation, not a link. See the 09-05 report §3 for the Asbury Park
five-way self-canonical example, and the standing
`city_cluster_has_100_self_canonical_twins` item.

---

**Bottom line:** every internal-linking axis measured today is at its floor with zero
defects. This lever has been closed since 09-02 and has now held through four
publishing waves. Recommend retiring the daily cadence for this task and re-running it
only as a post-publish gate on newly shipped pages.
