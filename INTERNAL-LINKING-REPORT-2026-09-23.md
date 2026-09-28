# Internal Linking Report — 2026-09-23

**Result: NO ACTION. Nothing committed, nothing pushed.**
Measured on a fresh clone of `origin/live` @ `3c268962` ("[publish] 2 queued demand sections…", 2026-09-23 08:12).
Gate window: since the last internal-linking commit `ed00cf5b` (2026-09-21).

## 1. Probe validity (canary)

`.deploy/probes/contextual_inbound_probe.py` run verbatim. Canaried first at `3e74c0d` (09-13 late gate):
reproduced **exactly** — 778 HTML / 529 education / 426 indexable / 6,516 p|li links / floor 2 / under-2 0 /
blocking-class fingerprint `article-related` 121 · `related-articles` 26 · `myth-card` 11. Probe intact.
A copy with a per-page donor dump produced byte-identical aggregate output.

## 2. Corpus A — indexable `/education/` pages with `.article-body`

| | 09-21 (`ed00cf5b`) | 09-23 HEAD |
|---|---|---|
| HTML files | 799 | 805 |
| education HTML | 550 | 556 |
| indexable w/ article-body | 438 | **442** |
| p\|li links in article-body | 6,831 | 6,946 |
| inbound floor | 2 | **2** |
| pages under 2 | 0 | **0** |
| broken hrefs in article-body | 0 | **0** |
| 2-donor band | 78 | 73 |

## 3. Post-publish gate — new pages since 09-21

| new page | contextual donors | verdict |
|---|---|---|
| `education/cpr-adults.html` | 5 | healthy |
| `education/cpr-class.html` | 5 | healthy |
| `education/after-water-scare-symptom-watch-log.html` | 5 | healthy |
| `education/electric-shock-drowning-risk-card.html` | 15 | healthy |
| the two `-printable` twins | — | noindex, correctly outside denominator |

Today's consolidation (`how-long-does-it-take-a-child-to-learn-to-swim`, `when-should-kids-start-swimming` → noindex,follow):
**0 internal links still point at either page**, and both were removed from the sitemap. Clean.

## 4. Outbound (fewest outgoing links to other education content)

Outbound floor = 1: only `education/water-safety-myths.html`. **Probe artifact, not a gap** — its in-body links sit
inside `.myth-card` blocks, which the saved probe drops (the `myth-card 11` row) but which were ruled editorial prose
on 09-08. Read by hand, the page carries ~11 in-body contextual links (signs-of-drowning, water-wings-vs-life-jackets,
life-jacket-guide, pool-safety-rules, backyard-pool-fence-requirements, cpr-basics-parents, secondary-drowning, etc.).
Next lowest: one page at 2, 18 at 3. No dead ends.

## 5. Sitewide

- `internal_link_resolution_probe.py`: **805 pages, 36,134 internal `<a>`, 0 broken targets, 0 broken fragments**; `--canary` gate PASS (both injected defects fired).
- Sitemap: **668 locs, 0 unresolved, 0 noindex pages listed.**

## 6. Why no links were added

Every axis holds (inbound floor 2, outbound no dead ends, 0 broken, new pages seeded at publish time). Per the standing
directive, links are not manufactured to pad the 2-donor band — link concentration has measured uncorrelated with rank on
this site. The recommendation stands: run this job as a post-publish gate rather than a daily linker.

## 7. Housekeeping (not touched)

The mounted repo's `live` branch has diverged from `origin/live` (273 local-only vs 27 remote-only commits) with a dirty
working tree — another task's state. All work was done in a `/tmp` clone, removed by the mandated cleanup.
Still open for Michael: rotate the GitHub token embedded in the mount's remote URL.
