# SEO optimizer — 2026-09-25

Fresh shallow clone of `origin/live` @ `7fc442f` ("[index-compliance] Add Article.image … to 4 education articles missing it", 2026-09-25 05:13).

**Corpus: 810 HTML / 670 indexable / 1,742 images on indexable pages.**
(Indexable = not noindex and not a meta-refresh stub.)

## Verdict: all four axes at ZERO. Nothing fixed, nothing committed, nothing pushed.

| Axis | Checks | Result |
|---|---|---|
| Meta description | missing, empty, duplicate tag, duplicate string, <70ch, >160ch | 0 / 0 / 0 / 0 / 0 / 0 |
| Image alt | missing attr, empty (non-decorative), filename-like/generic | 0 / 0 / 0 |
| JSON-LD | pages with none, unparseable, Article/BlogPosting missing headline, FAQPage missing mainEntity, Question missing name/acceptedAnswer/text | 0 / 0 / 0 / 0 / 0 |
| OG + Twitter | og:title/description/url/image/type missing, twitter:* missing, card ≠ summary_large_image, og:url ≠ canonical, canonical missing, og:image SVG, local og:image file missing | all 0 |

Ninth consecutive clean measurement.

## Probe verified with 6 injected canaries

Injected into a copy of `adult-swimming-lessons.html`: meta description 200ch, missing alt, unparseable JSON-LD, og:title removed, og:url ≠ canonical, twitter:card = `summary`. **All 6 fired.**
Two injection misses on the first try (a noindex page, and an og:url regex that assumed `property` came before `content`). Both were injection mistakes, not probe gaps. The probe parses attributes in any order.

## Pexels hotlink concentration (still improving)

| | 09-20 | 09-23 | 09-25 |
|---|---|---|---|
| Indexable pages with og:image on `images.pexels.com` | 214 | 203 | **200** |
| …on the single file `pexels-photo-12940787.jpeg` | 208 | 197 | **194** |

Still a single point of failure for ~194 social cards. Recommendation unchanged: set the page-template default to a self-hosted image, then self-host that one file. Not actioned unattended.

## Housekeeping

- The mounted repo's `live` branch is still diverged from `origin/live` (273 local-only vs 32 remote-only commits), with staged changes that include ~48-line deletions in 4 article pages. Some other task left this state partway through, so it was **not touched**. It needs an interactive look before anyone pushes from the mount.
- The git remote URL in the mount contains a plaintext GitHub token. Consider rotating it and switching to a credential helper.
- Scratch (`/tmp/wwk-seo925`, `/tmp/wwk-probe`, `/tmp/wwk-canary`) removed by the mandated cleanup block.
