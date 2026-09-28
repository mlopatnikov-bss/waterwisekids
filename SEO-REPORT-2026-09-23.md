# SEO optimizer — 2026-09-23

Fresh shallow clone of `origin/live` @ `28dcaac` ("[index-compliance] Complete social head on the 2 new CPR pages…", 2026-09-23 05:13).

**Corpus: 805 HTML / 670 indexable / 111 noindex / 24 redirect stubs / 1,974 images.**
(Indexable = not noindex and not a meta-refresh stub.)

## Verdict: all four mandated axes ZERO. Nothing fixed, nothing committed, nothing pushed.

| Axis | Checks | Result |
|---|---|---|
| Meta description | missing, empty, duplicate tag, duplicate string, <70ch, >160ch | 0 / 0 / 0 / 0 / 0 / 0 |
| Image alt | missing attr, empty (non-decorative), filename-like, generic | 0 / 0 / 0 / 0 |
| JSON-LD | pages with none, unparseable, missing required fields (Article/BlogPosting.headline, FAQPage.mainEntity, Question.name/acceptedAnswer, Answer.text) | 0 / 0 / 0 |
| OG + Twitter | og:* missing, twitter:* missing, og:url ≠ canonical, card ≠ summary_large_image, local og:image absent, og:image is SVG | 0 / 0 / 0 / 0 / 0 / 0 |

Eighth consecutive clean measurement.

## Probe verified with 7 injected canaries

Injected into a copy of `education/`: meta >160ch, generic alt, missing alt, unparseable JSON-LD, stripped `Article.headline`, og:url ≠ canonical, twitter:card = `summary`. **All 7 fired.**
One first attempt at the twitter:card canary landed on a noindex printable page and was correctly excluded — injection error, not probe error (same trap recorded on 09-20).

## Pexels hotlink concentration — trend reversed, now improving

| | 09-20 | 09-23 | Δ |
|---|---|---|---|
| Indexable pages with og:image on `images.pexels.com` | 214 | **203** | −11 |
| …on the single file `pexels-photo-12940787.jpeg` | 208 | **197** | −11 |

Still a single point of failure for ~197 social cards. The recommended lever (fix the page template default, then self-host that one file) remains open and was not actioned unattended.

## Housekeeping

- The mount's `live` branch has diverged from `origin/live` (273 local-only vs 20 remote-only commits), has a dirty working tree (~110 modified, ~270 untracked) and stale `.git/index.lock` / `.git/next-index-7.lock` files. Another task's in-flight state — **not touched**. All work was done in the /tmp clone. Worth an interactive look by Michael.
- Scratch was `/tmp/wwk-seo923/`, removed by the mandated cleanup block.
