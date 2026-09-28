# Internal Linking Report — 2026-09-08

**Result: NO ACTION. Nothing committed, nothing pushed.**
Measured on a fresh clone of `origin/live` @ `d05a85a1`. Fifth consecutive closed run.

---

## 1. Corpus A — indexable `/education/` pages with `.article-body`

**422 pages** (521 education HTML files, 95 `noindex`, 4 without `.article-body`).
Was 421 on 09-07, 420 on 09-06, 419 on 09-05.

Locked definition: an `<a>` inside a `<p>` or `<li>` within `.article-body`, with no
ancestor within 6 levels carrying a class matching
`card|related|grid|teaser|module|widget|cta|promo`. Metric = **distinct donors**.

Exclusion-filter canary fired — **158 of 6,413** `.article-body` internal links dropped as
boilerplate, so the filter is live and not silently passing everything.

| distinct donors | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11+ |
|---|---|---|---|---|---|---|---|---|---|---|
| pages | 104 | 70 | 59 | 31 | 23 | 27 | 21 | 10 | 11 | 66 |

- **Floor is still 2.** Zero pages at 0 or 1.
- **0 broken internal hrefs** inside `.article-body` across all 422 pages.

Per the standing directive no links were manufactured — link concentration is measurably
uncorrelated with rank on this site, so filling the 2-donor band is spend with no expected
return.

### New page since 09-07 launched healthy

Two files shipped in `1df82d98`:

| page | contextual donors |
|---|---|
| `pool-fence-code-compliance-worksheet` | **6** |
| `pool-fence-code-compliance-worksheet-printable` | 2 inbound (`noindex`, no `.article-body` — the convention) |

The landing page did not launch link-starved. The authoring flow is still seeding donors at
publish time. No remediation needed.

---

## 2. NEW AXIS THIS RUN — contextual **outbound** (dead-end detection)

Every prior run measured inbound only. The task brief asks for "articles with the fewest
outgoing links," which had never actually been measured. Same locked definition, direction
reversed, counting distinct `/education/` targets (printables excluded).

| edu outbound | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10+ |
|---|---|---|---|---|---|---|---|---|---|---|
| pages | 2 | 3 | 20 | 45 | 51 | 73 | 57 | 49 | 33 | 89 |

**Floor is 1 — there are zero dead ends.** Every indexable education page passes link equity
onward to at least one other education page. The axis is closed on arrival; no action.

### …but the probe had a false-negative class, and it surfaced here

`water-safety-myths.html` reported **1** outbound. It actually carries **10** editorial
`/education/` links. All the missing ones sit in
`p < div.truth-section < div.myth-card < div.article-body` — real body prose in a real
paragraph, dropped solely because the container class contains the substring `card`.

Enumerating what the exclusion regex actually drops:

| blocking class | links dropped | pages | verdict |
|---|---|---|---|
| `article-related` | 121 | 18 | correct — boilerplate |
| `related-articles` | 26 | 4 | correct — boilerplate |
| **`myth-card`** | **11** | **1** | **false negative — editorial prose** |

The discriminating token is the *role* (`related`), not the word `card`. Corrected, the
outbound floor is still 1 (held by `cpr-basics-parents`, whose link budget legitimately goes
to Red Cross / AHA / AAP / CDC rather than internal pages).

**Impact on the inbound number: none that creates work.** Restoring 11 links can only *raise*
donor counts, so the reported floor of 2 is a conservative under-count, never an over-count.
Some pages shown at exactly 2 donors may in fact have 3. No page moves below 2.

---

## 3. Corpus B — sitemap pages with no `.article-body` (legacy template family)

**224 pages**, unchanged. Counted by the Corpus B donor definition (any `<a href>` resolving
to the page, from any page, after `decompose()`-ing `<header>`, `<nav>`, `<footer>`). Strip
canary fired: 2,324 chrome elements removed.

Only **7 pages** below 2 distinct donors — the *identical set* as 09-05 and 09-07:

| donors | page | verdict |
|---|---|---|
| 0 | `/privacy/`, `/terms/` | footer-only by design — not a defect |
| 1 | `/tools/` | reachable at depth < 5 via chrome |
| 1 | `/swim-lessons/asbury-park-nj.html` | see §4 |
| 1 | `/swim-lessons/brick-nj.html` | see §4 |
| 1 | `/swim-lessons/howell-nj.html` | see §4 |
| 1 | `/swim-lessons/ocean-county-nj.html` | see §4 |

---

## 4. Reachability

- **650 sitemap URLs, all 650 resolve on disk. 0 unresolved.** (649 on 09-07; reconciles to
  canonicals − noindex.)
- BFS from `/` reaches **745 files**; **0 sitemap pages unreachable** — no orphans.
- Only **5 pages** at depth ≥ 5: the four NJ city pages above plus
  `/pool-safety-rules-for-kids.html`. Unchanged since 09-03.

---

## 5. Site-wide broken-link sweep

**30,491 internal `<a>` hrefs checked across all 769 HTML files. 0 broken.**

## 6. Canonical-equality axis (opened 09-08)

Resolve each internal href to a file, read *that file's own* `<link rel=canonical>`, require
`abs(href) == canonical`. This is strictly stronger than "the file exists."

**0 mismatches across 30,491 links.** Corpus-wide residual grep for internal
`href="…/index.html"` is **0**. The three `/contact/index.html` links fixed in `8c6d9d785`
have not regressed and nothing new has been introduced.

Canary: fabricated hrefs `/contact/index.html` and `/education/index.html` were both caught
as mismatches while the real `/contact/` passed — the check is live, not vacuously passing.

---

## 7. Recommendation (repeated from 09-07, now stronger)

The link surface has held closed through **five** publishing waves across six axes: donor
density, outbound dead-ends, broken hrefs, canonical equality, corpus-B donors, and
reachability. Every axis reports zero. **Retire the daily cadence** and re-run this job only
as a post-publish gate on newly shipped pages.

## 8. Still escalated to Michael (unchanged, not a linking fix)

- `sitemap.xml` has not been downloaded by Google since 2026-04-07 — needs manual
  resubmission in Search Console. Until then an unreachable page has no discovery path at all.
- HTTP variants of the site are still indexed alongside HTTPS.
