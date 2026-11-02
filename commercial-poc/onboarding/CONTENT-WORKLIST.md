# Four-page content worklist — Cheltenham, Howell, Brick, Toms River

Status: **proposal only; no city page, sitemap, canonical or link was changed.** Evidence: the onboarding packet for `bss-pilot-2026` (`content-worklist.json`, generated offline 2026-11-02) plus repository greps listed below. Every item needs Editor approval; items marked **blocked** need a fact that the repository does not hold.

## Finding 1 — the card sits on the less-linked twin page (Cheltenham, Howell, Brick)

For three of the four towns the repository has two indexable pages for the same search, both self-canonical and both in `sitemap.xml`:

| Town | Card page (live) | Editorial words | Twin page | Twin words | Same-town pages linking to card page / twin |
|---|---|---:|---|---:|---|
| Cheltenham | `/swim-lessons/cheltenham-pa.html` | 724 | `/swim-lessons-cheltenham-pa.html` | 896 | beginner/kids/toddler: 0 / 3 |
| Howell | `/swim-lessons/howell-nj.html` | 552 | `/swim-lessons-howell-nj.html` | 903 | 0 / 3 |
| Brick | `/swim-lessons/brick-nj.html` | 686 | `/swim-lessons-brick-nj.html` | 860 | 0 / 3 |
| Toms River | `/swim-lessons-toms-river-nj.html` | 795 | none | — | 3 / (same page) |

The packet counts 2, 1 and 2 internal links into the Cheltenham, Howell and Brick card pages. Each twin has roughly 10–15 internal links pointing to it (repo grep of absolute-path hrefs), and each twin links directly to the same official LA Fitness location page **without UTM tags**. Visitors who arrive through the stronger twin therefore reach the sponsor without being counted.

**Decision needed (Editor + Approver, before any link work):** choose one primary URL per town. Options, none applied:

- **A. Keep the card page primary:** point the three same-town pages (`beginner-`, `kids-`, `toddler-swim-lessons-<town>.html`) at the card page, and consolidate the twin (redirect or canonical). This is an SEO change with risk: the twin is the better-linked URL, and its current search standing is not in the repo (Search Console data needed — **blocked**).
- **B. Make the twin primary:** move the reviewed card to the twin. This needs a new placement (`slot_key`, so a new `placement_id`) with its own ownership and preview checks. The existing placement IDs stay valid; the old card would be removed with its rollback patch. **This changes the live pilot inventory, so it needs sponsor approval.**
- **C. Do nothing for the pilot:** report the limitation in the day-30 review.

Recommendation: **C for this pilot**, and decide between A and B with Search Console data before the next sponsor. Changing URLs during a 60-day measurement window would break comparability.

## Finding 2 — Howell card page is the thinnest page and the least linked

`/swim-lessons/howell-nj.html` has 552 editorial words (the minimum is 400) and 1 inbound internal link (from `/swim-lessons/jersey-shore.html`). Safe edits with evidence available today:

- [x] Link from `/swim-lessons/jersey-shore.html` — **already present**, no action.
- [ ] If option A above is chosen, add links from `beginner-swim-lessons-howell-nj.html`, `kids-swim-lessons-howell-nj.html` and `toddler-swim-lessons-howell-nj.html` (verified: each mentions Howell and none links to the card page).
- [ ] **Blocked:** adding unique Howell copy (class days, age bands, pool temperature, parking). None of these facts is in the official snapshot or the directory data; adding them without a verified source would be unsupported content.

## Finding 3 — Cheltenham and Brick have township-name variants

`kids-swim-lessons-cheltenham-township-pa.html`, `beginner-swim-lessons-brick-township-nj.html`, `kids-swim-lessons-brick-township-nj.html` and `toddler-swim-lessons-brick-township-nj.html` link to neither the card page nor the twin. Brick's official address is "Brick Township, NJ".

- [ ] Editor decides whether these township pages should link to the chosen primary town page (one contextual link each). Low risk, but it follows the primary-URL decision above.

## Finding 4 — Toms River is structurally healthy

The card is on the page that the town cluster already links to (11 inbound links per the packet; same-town beginner/kids/toddler pages link to it). It is in the sitemap, self-canonical and 795 words long. **No action.**

## Not proposed

- No new town, venue or "near me" pages. The onboarding tool refuses `proposed_new` inventory.
- No copy that repeats the sponsor's marketing, and no claims about schedules, prices, results or instructor credentials. None of these is verified in the repository.
- No sitemap edits: all seven pilot pages are already listed.

## Evidence commands

From `commercial-poc/onboarding/`:

```bash
npm run onboard -- packet definitions/bss-pilot-2026.sponsor.json --write
```

From the repository root:

```bash
grep -c '/swim-lessons-howell-nj.html"' beginner-swim-lessons-howell-nj.html kids-swim-lessons-howell-nj.html toddler-swim-lessons-howell-nj.html
```
