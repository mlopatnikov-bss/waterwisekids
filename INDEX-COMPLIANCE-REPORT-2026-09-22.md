# Google Index Compliance — 2026-09-22

**Corpus:** `origin/live` @ `d5b8552`, measured in a clean clone (the mount's
working tree was dirty again — 372 uncommitted changes, HEAD stranded at
`0e211752b` — and was never read or written).
**Shipped:** `58f6d95` → `live`.

## Verdict: COMPLIANT. One real defect found and fixed on a brand-new axis.

---

## Census

| | |
|---|---|
| HTML files | 801 |
| indexable | 667 |
| noindex (printables + 404) | 110 |
| meta-refresh stubs | 24 |
| sitemap `<loc>` | 667 — **0 missing, 0 extra** |

## Standing probes — all canary gates PASS, all axes zero

| Probe | Result |
|---|---|
| `index_compliance_probe` | 20 findings, **all** the by-design `duplicate_canonical_stub_convention` groups. Canary gate **PASS** (all 5 shapes fired, href-before-rel canonical still parsed). |
| `index_head_agreement_probe` | **0** — `lang=en` 667/667, LD SVG image refs 0, 438 raster LD refs. |
| `index_preview_directive_probe` | `max-image-preview` **667/667**, `max-snippet` 667/667, canonical self-resolves 691, 126 distinct `@id`. Only finding is the known by-design `swim-schools.html` + `swim-schools/index.html` stub pair. |
| `social_head_completeness_probe` | **0** — declared og w/h truthful 667/667. |
| `index_image_signal_probe` | Only the two carried-forward non-defects (below). |

---

## ⭐ New axis this run — and it found something

### Wave 1: eligibility thresholds and crawl-signal leaks — all zero

Six sub-axes nobody had ever measured. Canary gate **PASS**. All **zero**:

- **A.** `Article.headline` > 110 chars (Google's documented Article limit — schema
  validates, rich result is disqualified). **0 / 481 headlines.** Timely: `d5b8552`
  had just realigned `headline` to `h1` site-wide.
- **B.** meta-refresh stub delay ≠ 0 (Google treats only an *instant* refresh as a
  redirect; a delayed one passes no signal). **0 / 24 stubs** — all `0;url=`.
- **C.** internal `href` carrying `rel=nofollow|ugc|sponsored` — a self-inflicted
  PageRank sink. **0.**
- **D.** `<meta name="googlebot">` contradicting `<meta name="robots">`. **0.**
- **E.** LD `datePublished`/`dateModified` not valid ISO-8601. **0 / 966 dates.**
- **F.** indexable pages reachable only through noindex pages or stubs — a stricter
  orphan model than the standing BFS. **667 / 667 reachable via indexable-only hops.**

### ⭐ Wave 2: `speakable` cssSelector resolution — **1 real defect, fixed**

Every prior probe asked whether structured data is *valid*. None asked whether a
selector it declares **resolves to anything in the page's own DOM**. Across **2246
declared `cssSelector` values on 667 pages**, exactly one matched zero elements:

```
education/jump-turn-swim-explained.html
  "cssSelector": [".tldr-box", ".article h1", ".article-excerpt", ".article > p:first-of-type"]
                                                                   ^^^ matches nothing
```

The page wraps its prose in `.article-body`, so `.article` (the `<main>`) has **no
direct `<p>` child** — its children are `.article-header`, `.tldr-box`,
`.article-body`, `.related`. **322 other pages declare the identical selector and
resolve it correctly**, which is why the shape survived: it is not a bad selector,
it is a selector on the wrong template variant.

**Fix:** repointed to `.article-body > p:first-of-type` — the established 82-page
variant, and it resolves to the opening paragraph on this page. All 4 LD blocks
reparse. **Post-fix 0 / 2246.**

⚠️ **This is the FOURTH consecutive run to find a defect on
`education/jump-turn-swim-explained.html`** (09-18 `og:image` half-converted, 09-20
`og:image:alt` missing, and now this). Treat that file as a known-fragile page and
check it explicitly on any new axis.

`lastmod` **deliberately not bumped** — a markup-only selector change is not a
content edit, same rule as 09-20 and 09-21.

---

## Findings reported, NOT auto-fixed — these are Michael's calls

### 1. Four thin indexable pages (< 250 visible words)

| page | words |
|---|---|
| `aquatic-jobs/index.html` | 103 |
| `contact/index.html` | 130 |
| `teens/scholarships.html` | 185 |
| `jobs/index.html` | 202 |

`aquatic-jobs/` and `jobs/` are **JS-injected listing pages** — their real content
comes from the jobs API, which is a known open 503, so the raw HTML is genuinely
thin to a crawler. `contact/` is legitimately short. `teens/scholarships.html` is
the one where adding prose would actually help. Not auto-fixable.

### 2. Five FAQ answers repeated verbatim across many pages

| pages | answer opens with |
|---|---|
| **93** | "Swim lesson costs vary based on program type, instructor experience…" |
| 41 | "The American Academy of Pediatrics (AAP) recommends that children star…" |
| 30 | "Compare what you can actually verify rather than star ratings alone…" |
| 29 | "The American Academy of Pediatrics (AAP) recommends formal swim lesson…" |
| 23 | "The American Academy of Pediatrics (AAP) recommends that children star…" |

3174 FAQ answers total. Boilerplate at this scale is a *scaled-content* signal, and
the 93-page block is the one worth varying first. Content decision, not a mechanical fix.

### 3. `<title>` ≠ LD `headline` on 422 pages — **NOT a defect, bucket it out**

My own wave-2 axis flagged this; verification killed it. `headline == h1` on
**442 / 442** pages — the house convention set by `d5b8552` aligns `headline` to the
**h1**, while `<title>` is the SEO-shortened form. Divergence is intended. Any
rewrite of this probe must not re-report it.

---

## Carried forward, unchanged — both blocked on one flag

- **`ld_image_under_696px`: 63** pages whose LD `image` is 600×360, under Google's
  696px large-preview floor.
- **297-page `og:image` rollout** still deferred for the same reason.
- ⚠️ **One change unblocks both (and two more surfaces):**
  `.deploy/gen-card-image.py` generates at 1536×1024 then **hard-crops to 600×360**.
  The resolution exists at generation time and is thrown away. Change that output
  size to **1200×630** and regenerate.
- `img_dim_scaled_same_ratio`: 25 — ratio-preserving SVGs, **not a defect**, as always.

## Still unmeasured

**Live-HTTP status codes.** `web_fetch` refuses waterwisekids.com URLs in a
scheduled run ("URL not in provenance set") and the browser pane auto-declines with
nobody present to approve. The only remaining route is pasting the verbatim URLs —
including a **leaf** URL, not just the hub — into the task file body.

## Housekeeping

`/tmp/wwk-wt` is still a dangling **locked** worktree registered with the mount's
repo while the directory is absent — **twenty-eighth** confirmation. Clearing it is
a git write on the mount, so no unattended run may do it.
⚠️ **Michael: run `git worktree prune --force` in the mount's repo once, interactively.**

New probes saved to `.deploy/probes/`:
`index_eligibility_threshold_probe.py`, `index_eligibility_wave2.py`.
