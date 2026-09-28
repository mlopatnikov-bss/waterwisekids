# Internal Linking Report — 2026-08-28

**Commit:** `58955c7` → pushed to `live`, verified on production (HTTP 200, links present).
**Scope:** 499 `/education/` pages (412 non-printable) parsed with html5lib.

## Method

Built the full internal link graph, separating **prose links** (`<p>`/`<li>` anchors inside
`.article-body`, excluding the `.related` card block) from **all links** (which include the
related-article cards). Ranked pages by *outgoing* prose links, and chose destinations
preferring pages with the lowest *inbound* prose count.

This respects the standing finding that internal-link **concentration** toward hubs is a dead
lever (`internal-link-lever-exhausted`): no links were added toward `/statistics/`,
`when-to-start-swim-lessons`, `pool-safety-rules`, or any other saturated hub. Every
destination here had prose_in ≤ 9, and three had prose_in = 1.

## What shipped — 20 prose links across 10 donor pages

| Donor (prose_out before → after) | New contextual links |
|---|---|
| child-swimming-nutrition-hydration (1 → 3) | heat-illness-young-swimmers, post-swim-care-for-kids |
| conditioning-mile-swim-goal (1 → 3) | body-awareness-exercises-swimmers **(prose_in 1)**, child-swimming-nutrition-hydration |
| backyard-water-play-safety (2 → 4) | heat-exhaustion-kids-pool, inflatable-pool-safety |
| kids-hair-care-swimmers (2 → 4) | pool-chemistry-basics-for-parents, post-swim-care-for-kids **(prose_in 2)** |
| home-swim-lessons-vs-swim-school (2 → 4) | apartment-pool-safety-kids **(prose_in 1)**, pool-chemistry-basics-for-parents |
| post-swim-care-for-kids (2 → 4) | kids-hair-care-swimmers **(prose_in 1)**, swimming-with-eczema-kids **(prose_in 2)** |
| olympic-sized-pool-decoded (2 → 4) | conditioning-mile-swim-goal **(prose_in 2)**, warm-water-swim-lessons |
| pool-deck-safety (2 → 4) | pool-drain-safety, teaching-kids-safe-pool-entry |
| swim-readiness-indicators-age-4 (2 → 4) | body-awareness-exercises-swimmers **(prose_in 1)**, parent-and-me-swim-lessons-guide |
| first-swim-lesson-checklist (2 → 4) | child-swimming-nutrition-hydration, swim-lesson-instructor-ratio |

Eight of the twenty convert a relationship that previously existed **only as a related-article
card** into real prose. Anchor text was matched to each destination's actual H1 subject — no
generic "click here" and no anchor that overstates what the destination covers.

## Verification (81 static checks + 20 rendered checks, 0 failures)

- **Static:** every insertion applied by exact-string replace with `count == 1` asserted; all
  20 destination files exist; JSON-LD blocks re-parsed as valid JSON with no anchor markup
  leaked in; no `meta[name=description]` stranded in `<body>`; no nested anchors.
- **Rendered:** headless Chromium over a local HTTP server (not `file://`) — all 20 anchors
  resolve in the DOM under `.article-body p`, pass `is_visible()`, have a non-zero bounding
  box, render at `rgb(3, 105, 161)` (AA-passing link blue), and each destination returns 200.
  **0 console errors** across all 10 pages.
- **Sitemap:** `lastmod` advanced to 2026-08-28 for the 10 touched URLs. This is a genuine
  significance-signature change (new prose inside `<main>`), not a chrome sweep. One URL
  (`olympic-sized-pool-decoded`) was already at today from an earlier run; sitemap re-parsed
  clean at 639 URLs.

## Notes for the next run

- **The graph is saturated on the inbound side.** Exactly one education page has zero prose
  inbound links, and that is `/education/index.html` — the hub itself, which is fine. The
  weakest tier is now 47 pages at prose_in = 1. Adding links for their own sake is no longer
  a high-value daily lever; the useful residue is what this run did — converting card-only
  relationships into prose where the sentence genuinely calls for it.
- **`.related` lives *inside* `.article-body`.** Any dedup guard scoped to
  `.article-body a[href]` will wrongly report "already linked" for every related-article card.
  Scope prose checks to `p`/`li` anchors with `.related` decomposed first.
- **Mount is stale.** `git merge --ff-only` on the mounted repo fails on an unremovable
  `.git/objects/maintenance.lock` (Operation not permitted). The mount sits at
  `2476831c5`; `live` on GitHub is authoritative at `58955c7`. Clone fresh rather than
  trusting the mount.
