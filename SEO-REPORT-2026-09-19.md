# SEO optimizer — 2026-09-19

Fresh clone of `origin/live` @ `c1507ccb1` (2026-09-19 05:10, "[index-compliance] Complete
og:image conversion on 2 half-converted education pages").

**Corpus: 791 HTML / 662 indexable / 106 noindex / 23 redirect stubs / 1,713 images.**
(Was 776 / 677 / 99 on 09-13 — +15 files.)

## Verdict: all four mandated axes ZERO. Nothing fixed, nothing pushed.

| Axis | Measured | Result |
|---|---|---|
| Meta description | missing, empty, duplicate tag, duplicate string, <70ch, >160ch | **0 / 0 / 0 / 0 / 0 / 0** |
| Image alt | missing attr, empty, filename-like, generic, duplicate-with-differing-src | **0 / 0 / 0 / 0 / 0** |
| JSON-LD | unparseable, pages with no schema, missing required fields | **0 / 0 / 0** |
| OG + Twitter | og tags missing, twitter tags missing, og↔twitter mismatch, og:url≠canonical, card not `summary_large_image`, image asset absent | **0 / 0 / 0 / 0 / 0 / 0** |

This is the sixth consecutive clean measurement. Per the standing note, the task is a
regression tripwire, not a fix loop — a non-zero reading means suspect the probe first.
That held again today: the probe's three non-zero readings were all artifacts.

## Probe artifacts caught this run (all three initially looked like defects)

**1. `WebPage.name` missing on 122 pages — NOT a defect. New FP shape.**
The nodes are `"mainEntityOfPage": {"@type": "WebPage", "@id": "…"}` — reference stubs, which
carry `@type` + `@id` by design and correctly have no `name`. A recursive JSON-LD validator
that applies required-field rules to every node it meets will hit every reference node in the
corpus. Rule: only apply required-field checks to a node that has properties beyond
`@type`/`@id`.

**2. `og:image`/`twitter:image` asset absent on 408 tags — NOT a defect.**
The probe stripped the scheme+host off absolute URLs and looked for the file in the repo. The
URLs are external (Pexels CDN), so of course nothing was found locally. Rule: resolve
repo-relative paths only; an absolute off-domain URL is out of scope for a file-existence check.

**3. `og:description` ≠ `twitter:description` on 2 pages — NOT a defect, intentional.**
`education/rip-currents-pull-you-under.html` and `education/swim-vest-life-jacket.html` carry a
deliberately shortened Twitter variant of the OG text, cut at a sentence boundary. That is
correct authoring for Twitter's shorter display envelope, not drift. Rule: a mismatch is only a
defect when the two disagree in substance, not when Twitter is a clean truncation.

## Finding worth Michael's attention (in-flight, owned elsewhere)

**198 indexable pages share one hotlinked Pexels og:image.**

og:image hosting splits 458 self-hosted / 204 hotlinked to `images.pexels.com`. Of the 204,
**198 point at the same single file** (`pexels-photo-12940787.jpeg`); the other 6 are one page
each.

Two consequences:

- **Single point of failure.** One Pexels URL change, takedown or hotlink block silently breaks
  the social card on 198 pages at once. Nothing on our side would report it.
- **No differentiation.** 198 pages present an identical share image, which weakens both social
  CTR and the per-page distinctiveness that answer engines reward.

This is already being worked — today's head commit converted 2 more education pages off Pexels,
so the migration is live and belongs to the index-compliance task. Flagging the concentration
number because 198-on-one is a sharper risk than the raw 204 count suggests. Self-hosting that
one image would retire the bulk of the exposure in a single commit.

## Housekeeping

- `/tmp/wwk-wt` is still registered as a locked worktree on the mount while absent from disk —
  **twelfth consecutive run**. Needs a one-time interactive `git worktree prune --force` from
  Michael; no unattended run is permitted to fix it (it is a git write on the mount).
- Scratch was `/tmp/seo919/` (non-matching prefix), removed explicitly. The mandated cleanup
  block ran with the skip-guard so it could not take out a legitimately recreated worktree.
