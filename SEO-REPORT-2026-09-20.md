# SEO optimizer — 2026-09-20

Fresh clone of `origin/live` @ `72a799d` ("[index] Complete the social-head block on 5 pages:
2 had no twitter card at all, 2 pointed og:image at an SVG crawlers reject, 1 missing
og:image:alt").

**Corpus: 795 HTML / 688 indexable / 107 noindex / 23 redirect stubs / 1,734 images.**
(Was 791 / 662 / 106 / 23 / 1,713 on 09-19 — +4 files, +26 indexable.)

## Verdict: all four mandated axes ZERO. Nothing fixed, nothing committed, nothing pushed.

| Axis | Measured | Result |
|---|---|---|
| Meta description | missing, empty, duplicate tag, duplicate string, <70ch, >160ch | **0 / 0 / 0 / 0 / 0 / 0** |
| Image alt | missing attr, empty, filename-like, generic, duplicate-with-differing-src | **0 / 0 / 0 / 0 / 0** |
| JSON-LD | unparseable, pages with no schema, missing required fields | **0 / 0 / 0** |
| OG + Twitter | og missing, twitter missing, og↔twitter mismatch, og:url≠canonical, card not `summary_large_image`, image asset absent | **0 / 0 / 0 / 0 / 0 / 0** |

Seventh consecutive clean measurement. Per the standing note this task is a regression
tripwire, not a fix loop: a non-zero reading means suspect the probe first. That held again —
the one non-zero reading was the known intentional page.

## Probe verified against 8 injected canaries before the zeros were believed

An all-zero run is indistinguishable from a broken probe, so the probe was re-run against a
copy of the corpus with eight defects injected. **All eight fired**: meta >160ch, generic alt,
missing alt attribute, unparseable JSON-LD, stripped `Article.headline`, og:url≠canonical,
`twitter:card` not `summary_large_image`, og:image pointing at an absent repo-relative file.

⚠️ **Worth recording: the first canary attempt failed on five of eight, and every failure was
the injection, not the probe.**

- Two injections landed on `noindex` pages / pages with no `<img>` — correctly outside the
  denominator.
- One target page had no `Article` node at all, so stripping `headline` removed nothing.
- Two regexes missed because the site ships `<meta content="…" property="og:image"/>` —
  **content before property**. This is the same attribute-order trap recorded on 09-13 for
  `twitter:card`, and it is now confirmed on the OG tags too. The probe parses attributes so
  it was never affected; the fragile injection regex was. **Parse, never grep** — including
  when writing the test.

## FP shape #6 needs widening (the one non-zero reading)

`education/rip-currents-pull-you-under.html` reported an og↔twitter description mismatch. It is
the documented intentional page, but the recorded rule is slightly wrong about *how*:

- og: "…What actually happens in one, **why people still drown,** and the way out."
- twitter: "…What actually happens in one, and the way out."

The Twitter variant **elides an interior clause**, it is not a trailing cut at a sentence
boundary. A prefix-based truncation test therefore flags it. ⇒ the rule should read: *a
mismatch is a defect only when the two disagree in substance; a shortened Twitter variant is
correct whether it drops a trailing clause or an interior one.* `education/swim-vest-life-jacket.html`
is a clean trailing truncation and passed unflagged.

## Finding worth Michael's attention — the Pexels concentration is getting WORSE

Reported 09-19 as in-flight and owned by index-compliance. One day later the trend has
reversed:

| | 09-19 | 09-20 | Δ |
|---|---|---|---|
| og:image self-hosted | 458 | **474** | +16 |
| og:image hotlinked to `images.pexels.com` | 204 | **214** | +10 |
| …of those, on the single file `pexels-photo-12940787.jpeg` | 198 | **208** | +10 |

The migration off Pexels is real and running (+16 converted), but **new pages are being
authored onto the shared hotlink faster than old ones are converted off it**. Net exposure grew
by 10 pages in a day. The 208 pages sit mostly in the root landing family (134) and
`swim-lessons/` (64).

Two consequences, unchanged but now larger:

- **Single point of failure.** One Pexels URL change, takedown or hotlink block silently breaks
  the social card on 208 pages at once. Nothing on our side would report it.
- **No differentiation.** 208 pages present an identical share image, weakening social CTR and
  the per-page distinctiveness answer engines reward.

⭐ **The lever is the page template, not the back-catalogue.** Converting existing pages one at a
time cannot win while the authoring template still emits the hotlink as its default. Fixing the
default first would stop the bleed; self-hosting that one file would then retire the bulk of the
exposure in a single commit. Not actioned unattended — it needs an asset download, a licence
check, and a template edit.

## Housekeeping

- `/tmp/wwk-wt` is still registered as a locked worktree on the mount while absent from disk —
  **eighteenth consecutive run**. Needs a one-time interactive `git worktree prune --force` from
  Michael; no unattended run may fix it (it is a git write on the mount).
- The mount's working tree is dirty (~80 modified files, staged and unstaged changes that invert
  each other). That is another task's in-flight work — **not touched**. All measurement was done
  in the clone.
- Scratch was `/tmp/seo920/` — prefix chosen before the clone command was typed. Removed
  explicitly. The mandated cleanup block ran with the skip-guard so it could not take out a
  legitimately recreated worktree.
