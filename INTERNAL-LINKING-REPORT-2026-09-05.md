# Internal Linking Report — 2026-09-05

**Result: NO ACTION. Nothing committed, nothing pushed.**
Measured on a fresh clone of `origin/live` @ `a40b5171` (2026-09-05 11:27 EDT).

---

## 1. Corpus A — indexable `/education/` pages with `.article-body`

**419 pages** (was 416 on 09-02, 417 on 09-03). Contextual inbound counted by the
locked definition: an `<a>` inside a `<p>` or `<li>` within `.article-body`, with no
ancestor within 6 levels carrying a class matching
`card|related|grid|teaser|module|widget|cta|promo`. Ranked by **distinct donors**.
Exclusion-filter canary fired (150 card/related links dropped) — the probe is live.

| distinct donors | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11+ |
|---|---|---|---|---|---|---|---|---|---|---|
| pages | 109 | 66 | 60 | 32 | 22 | 24 | 20 | 10 | 10 | 66 |

- **Floor is still 2.** Zero pages at 0 or 1.
- **0 orphans** — BFS from `/` reaches every sitemap URL.
- **0 broken internal hrefs** inside `.article-body` across all 419 pages.

The link surface remains closed. Per the standing directive, no links were
manufactured. Link concentration is measurably uncorrelated with rank on this site,
so filling the 2-donor band would be spend with no expected return.

### New pages since 09-02 launched healthy

Six files shipped (three landing pages + three printables):

| page | contextual donors |
|---|---|
| `swim-instructor-continuity-worksheet` | 6 |
| `swim-lesson-medical-information-form` | 6 |
| `swim-progress-audit-worksheet` | 7 |
| the three matching `-printable` files (`noindex`) | 1 each — the convention |

None launched link-starved. No remediation needed.

---

## 2. Corpus B — sitemap pages with no `.article-body` (legacy template family)

**224 pages.** Counted by distinct donors over in-content links with header/nav/footer
stripped (this family has no `.article-body`, so the Corpus A probe is structurally
blind to it — running the Corpus A definition here falsely reports 144 pages at zero).

Only **7 pages** sit below 2 distinct donors:

| donors | page | verdict |
|---|---|---|
| 0 | `/privacy/`, `/terms/` | footer-only by design — not a defect |
| 1 | `/tools/` | 2-cycle with `tools/family-water-safety-plan.html`; reachable at depth < 5 via chrome |
| 1 | `/swim-lessons/asbury-park-nj.html` | see §3 |
| 1 | `/swim-lessons/brick-nj.html` | see §3 |
| 1 | `/swim-lessons/howell-nj.html` | see §3 |
| 1 | `/swim-lessons/ocean-county-nj.html` | see §3 |

BFS `depth >= 5`: **5 pages** — the four NJ pages above plus
`/pool-safety-rules-for-kids.html`. Unchanged from the 09-03 measurement.

---

## 3. ⚠️ Escalation for Michael — the deep pages are duplicates, not link-starved

All five depth-5 pages fail the twin test, so **linking them would strengthen
cannibalizing duplicates**. Each of the four NJ pages has exactly one donor
(`/swim-lessons/jersey-shore.html`) and sits in a reciprocal 2-cycle with it — the
same closed-cluster shape as the `/teens/` island, but here the correct fix is
consolidation, not a link.

Example — **Asbury Park has five self-canonical, near-identical pages**:

| words | URL |
|---|---|
| 750 | `/swim-lessons-asbury-park-nj.html` |
| 736 | `/toddler-swim-lessons-asbury-park-nj.html` |
| 718 | `/kids-swim-lessons-asbury-park-nj.html` |
| 701 | `/beginner-swim-lessons-asbury-park-nj.html` |
| 572 | `/swim-lessons/asbury-park-nj.html` ← the depth-5, single-donor one |

`/pool-safety-rules-for-kids.html` (1036w) is the previously-flagged twin of
`/education/pool-safety-rules.html` (2740w) — still open, still deliberately unlinked.

### The sweep memory asked for is now done, and it's larger than expected

Across the 34-city local cluster (`/swim-lessons/<city>`, `/swim-lessons-<city>`,
`/kids-swim-lessons-<city>`, `/toddler-swim-lessons-<city>`, `/beginner-swim-lessons-<city>`):

**30 of 34 cities have two or more self-canonical near-duplicate pages.**

| self-canonical twins per city | cities |
|---|---|
| 5 | 5 (asbury-park-nj, brick-nj, cheltenham-pa, howell-nj, ocean-county-nj) |
| 4 | 4 (andorra-philadelphia, monmouth-county-nj, philadelphia, toms-river-nj) |
| 3 | 20 |
| 2 | 1 |

That is roughly **100 indexable pages competing with each other** on 500–750-word
bodies that differ mainly by the intent prefix in the title.

Precedent for the fix already exists in the repo: `/beginner-swim-lessons-ambler-pa.html`
is a 23-word stub canonicalized to `/swim-lessons/ambler-pa.html` (1412w). Applying that
same pattern — one substantial page per city, the prefix variants canonicalized into it —
would collapse ~100 pages into ~34 and resolve the depth-5 signal as a side effect.

**This is a consolidation decision, not an automated one.** It changes what is indexable
and needs Michael's call on which page wins each city, and whether the prefix variants
become 301s or canonical-only stubs.

---

## 4. Method notes

- Audited a fresh `/tmp` clone reset to `origin/live`; the mount's local `live` is
  1,000+ commits behind (`2476831c`, 2026-08-20) and was never written to.
- Two corpora measured with **two different donor definitions** — the `.article-body`
  contextual definition is not portable to the legacy family and silently reports
  144 false zeroes there.
- Every sweep canary-gated (exclusion filter asserted non-zero, chrome-strip asserted
  non-zero) before its result was believed.
- Workspace cleanup run.
