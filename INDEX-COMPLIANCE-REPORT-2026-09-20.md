# Google Index Compliance — 2026-09-20

**Baseline:** fresh clone of `origin/live` @ `36dabed`
**Shipped:** `72a799d` (5 files, +21 / -6)
**Status:** compliant. Every standing axis zero; one new axis found and fixed 5 pages.

---

## Census

| | |
|---|---|
| total HTML | 795 |
| noindex | 107 (printables + 404.html) |
| redirect stubs | 23 |
| primary indexable | 665 |
| sitemap `<loc>` | 665 — **0 drift both ways** |
| JSON-LD blocks | 0 parse failures |
| `<html lang>` | 665/665 `en`, 0 missing charset/viewport |
| robots.txt | `Allow: /`, no Disallow, sitemap declared at www |

Canary gate **PASS** on all four standing probes — the probes were verified to fire
before their zeros were believed.

---

## Standing axes — all zero

Sitemap integrity, canonical presence/host/placement, canonical **target** validity,
title/meta/h1 uniqueness and length, head breakage (per-attribute raw scan),
JSON-LD required fields and interiors, internal links and assets, `og:url` = canonical,
og↔twitter parity, reachability (0 orphans, 0 zero-inbound), stub integrity,
stub chains, robots.txt vs sitemap, `X-Robots-Tag` in `_headers`/`.htaccess`,
duplicate meta descriptions, img alt coverage.

The only standing-probe output is the **19 `duplicate_canonical_stub_convention`
groups**, which are the redirect-stub convention working as designed.

---

## New axis this run: per-tag social-head completeness

The standing probe checks `twitter:card` presence and og↔twitter *parity*. A page with
**neither** side passes parity trivially — which is how two pages sat here with zero
Twitter tags. The new probe checks each required tag individually, plus declared
`og:image:width/height` against the image's **actual bytes**, and og = twitter = LD
image agreement.

**15 findings across 5 pages. All fixed.**

**1. Two pages had no Twitter card at all** — a complete OG block, zero `twitter:*`
tags, no `og:image:alt`, no `og:image:width/height`:

- `education/autism-speaks-water-safety.html`
- `education/infant-swim-resource.html`

Added `og:image:alt`, truthful `1200x630` dimensions for the generic card, and the full
`twitter:card / title / description / image` block. Both keep the generic
`waterwisekids-og.png` — they do each have a 600x360 card on disk, but repointing at it
would be a **downgrade**, so they stay in the deferred rollout (see Blocked below).

**2. Two pages pointed `og:image` at an SVG.** Facebook, LinkedIn and X do not accept
SVG as a share image, so both rendered with **no preview image at all** — and the
declared `1200x630` was wrong twice over, since the file is a 300x180 SVG:

- `education/swim-practice-log.html`
- `education/swim-lesson-separation-anxiety-plan.html`

These were the only 2 SVG share-image references in the corpus. No raster alternative
exists on disk for either slug, so `og:image`, `twitter:image` and the JSON-LD `image`
were all repointed to the generic 1200x630 PNG — a supported format at a real size,
which makes the existing declaration truthful. The SVG was referenced only in the head,
so nothing visible on either page changed. `ld_image_svg_refs` 2 -> **0**.

**3. One page missing `og:image:alt`** — `education/jump-turn-swim-explained.html`.
This is the same page flagged as half-converted on 09-18; that fix completed `og:image`
but never added the alt. Confirms the half-converted shape keeps recurring and this
should stay a per-run measurement, not a closed axis.

Post-fix: **0/665** on every sub-axis, `declared_wh` now 665/665.

The probe is saved as `.deploy/probes/social_head_completeness_probe.py`.

---

## Blocked on you, Michael — one decision, two surfaces

`.deploy/gen-card-image.py` generates cards at **1536x1024 and hard-crops to 600x360**.
The resolution exists at generation time and is thrown away. Because of that:

- **64 indexable pages** carry a JSON-LD `image` under Google's 696px large-preview
  floor (down from 66 — the two SVG pages moved off it this run).
- **297 pages** have an unused card on disk that cannot be rolled out, because
  600x360 is worse than the generic 1200x630 they use today.

Changing that output size to **1200x630** and regenerating unblocks both at once. Also
worth generating raster cards for `swim-practice-log` and
`swim-lesson-separation-anxiety-plan`, which now share the generic image.

Separately: `git worktree prune --force` in the repo, once, interactively — a deleted
`/tmp/wwk-wt` worktree has been stuck in the registry for six days and unattended runs
are not permitted to clear it.

---

## Carried forward

- **Sitemap `lastmod` vs `dateModified`:** 195 ahead / 0 behind / 283 equal; 143 still
  on the 2026-08-29 batch date. Direction remains uniformly ahead, never behind. Not
  bumped for this run's changes — these were head-only social signals, not content
  edits, and a false `lastmod` bump asks Google to recrawl for nothing.
- **Live-HTTP status codes still unmeasured.** `web_fetch` refuses waterwisekids.com
  URLs in a scheduled run (no user message carries them), and the browser pane
  auto-declines with nobody present to approve. The only remaining route is pasting
  verbatim URLs — including a leaf, not just the hub — into the task file body.
- **Search Console API** still scoped `webmasters.readonly`; sitemap last downloaded
  April, so 665 live pages vs 97 announced.
- 25 `img` tags declare 600x360 on a 300x180 SVG. Ratio-preserving vector — not a
  defect, bucketed separately so it stops re-reporting.
