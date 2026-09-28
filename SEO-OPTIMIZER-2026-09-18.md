# SEO Optimizer — 2026-09-18

Measured on a fresh shallow clone of `origin/live` @ `22d491a`.
Shipped as `8972d5b` (pushed to `live`).

**Census: 787 HTML = 104 `noindex` + 23 meta-refresh stubs + 660 primary.**
Reproduces this morning's index-compliance census exactly.

---

## The four mandated axes — all clean, no action

| Axis | Result |
|---|---|
| Meta description missing | **0** / 660 |
| Meta description exact duplicate | **0** |
| Meta description out of range (<70 / >160ch, entity-decoded) | **0 / 0** |
| `<img>` with no `alt` attribute | **0** / 1,707 images |
| `<img alt="">` | **0** |
| Filename-as-alt (`IMG_1234.jpg`) | **0** |
| JSON-LD parse failures | **0** / 2,073 blocks |
| FAQPage integrity (650 nodes: Question `name`, `acceptedAnswer.text`) | **0** failures |
| Article/BlogPosting required fields (472 nodes) | **0** missing |
| Article `headline` > 110ch (Google's cap) | **0** |
| OG required set (`og:title/description/image/url/type`) | **0** missing |
| `og:url` ≠ canonical | **0** |
| `twitter:card` invalid value | **0** (all `summary_large_image`) |
| Duplicate FAQ question within one page | **0** |

This is the expected outcome, not a lazy one — these axes were closed by prior
runs. Value this run came from opening a new one.

---

## ⭐ New axis that found something: og ↔ twitter **text** parity

Prior runs closed og↔twitter **image** parity. The **title and description**
pair had never been measured. It found **9 defects across 6 pages** — all the
same failure mode: **the page was rewritten and the `twitter:*` tags were left
behind.** On every one, `meta description == og:description` and
`og:title == <title>`, while `twitter:*` still carried the pre-rewrite copy.

| Page | Fixed |
|---|---|
| `education/lake-ocean-safety.html` | twitter:title + twitter:description |
| `education/pool-safety-rules.html` | twitter:title + twitter:description |
| `education/lightning-pool-safety.html` | twitter:title + twitter:description |
| `education/jump-turn-swim-explained.html` | twitter:title |
| `swim-lessons/directory/florida.html` | twitter:description |
| `swim-lessons/directory/oregon.html` | twitter:description |

Worst case — `lake-ocean-safety.html` — was sharing on X as *"Lake Safety Tips
for Kids: Hidden Open-Water Dangers"* with a description about **ocean** rip
currents and cold-water survival, while the page itself now answers *"Do lakes
have undercurrents?"*. The share card was describing an article that no longer
exists.

**Fix method:** the og value's *raw attribute string* was copied verbatim into
the twitter tag, so curly quotes and entity encoding are preserved byte-for-byte.
**After: 0 title-parity, 0 description-parity failures.**

**Probe canaried** — mutating one `twitter:title` moved the count 4 → 5 → 4 on
restore, so the zero is a measured zero, not a probe that never fired.

Note `jump-turn-swim-explained.html` is the *same page* this morning's run
caught half-converted on `og:image`. Two different axes, one underlying cause:
that page's rewrite was never finished. Worth a manual look.

---

## Findings NOT auto-fixed, and why

### 1. `og:title` ≠ `<title>` on 384 pages — mostly CONVENTION, do not "fix"

Breakdown:

- **306 — substantive rewrite. Leave alone.** `<title>` is the SERP-compact form,
  `og:title` the fuller social form (`"Toddler Swim Lessons: Mount Airy PA"` vs
  `"Toddler Swim Lessons in Mount Airy, Philadelphia"`). Same deliberate pattern as
  `og:description` differing sitewide.
- **78 — differ *only* by the ` | WaterWiseKids` suffix, and in both directions**
  (45 where og has it and `<title>` doesn't; 33 the reverse). This is real drift.

**Why it wasn't fixed — this needs one decision from Michael, not a guess:**

The `<title>` side is provably deliberate: of the 201 titles lacking the suffix,
**195 would exceed 60 characters if it were added**. The suffix was dropped for
SERP length. So `<title>` is correct as-is — the question is only what `og:title`
should do, and **all 660 pages already carry `og:site_name`**, which Facebook and
LinkedIn render as the brand *above* the title. So ` | WaterWiseKids` inside
`og:title` is duplicated brand in the card.

The consistent rule would be **strip the brand suffix from `og:title` sitewide**
(273 pages), not just the 45 — half-applying it would leave 228 pages inconsistent
and make things worse. That is a brand-presentation call with zero SEO risk
(`og:title` isn't indexed, `<title>` untouched), so it is yours to make.

**Decision needed:** strip ` | WaterWiseKids` from all 273 `og:title`/`twitter:title`
pairs? One-line yes and a later run does it in a single uniform pass.

### 2. 611 near-duplicate meta description pairs (≥0.90 similarity)

Exact duplicates are 0, but the city-cluster templates are near-identical —
`beginner-swim-lessons-brick-nj` vs `beginner-swim-lessons-brielle-nj` scores
**0.977**, differing only by town name. This is the same underlying thin-content
problem as the known self-canonical city twins. **Not auto-fixable** —
differentiating 600 descriptions is editorial work, not a mechanical pass.

### 3. 13 `alt` texts over 125 characters

All on `education/index.html`, all descriptive illustration alts
(`"Illustration: a swim school child protection policy binder on…"`, 151–187ch).
There is no Google penalty for long alt text; 125 is a screen-reader convention.
Rewriting human-written alt copy autonomously risks making it worse. Left alone.

---

## Housekeeping

- **`/tmp/wwk-wt` still dangling — 5th consecutive confirmation.** The directory
  is absent while `git worktree list` on the mount still reports it as locked.
  Only Michael can clear it: `git worktree prune --force` in the mount's repo,
  once, interactively.
- **The mount's checkout is stale** — `HEAD` is `0e211752b` (2026-08-20) with a
  dirty working tree, while `origin/live` is now `8972d5b`. All auditing was done
  on a fresh clone, never the mount. Recovery still needs Michael at a terminal.
- Cleanup used the skip-guard form so it cannot delete a registered worktree.
  Scratch lived at `/tmp/seoopt/` (non-matching prefix), removed explicitly.
