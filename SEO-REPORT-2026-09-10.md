# SEO Report — 2026-09-10

**Scope:** daily seo-optimizer run — meta descriptions, image alt text, FAQ/Article JSON-LD, OG tags.
**Corpus:** fresh full clone of `origin/live` @ `b0548166a` (2026-09-10 05:10 EDT), 774 shipped HTML files.
**Outcome: zero defects found. Nothing committed, nothing pushed.**

---

## Denominators

| Family | Total | Indexable |
|---|---|---|
| article (`.article-body`) | 428 | 428 |
| legacy (no `.article-body`) | 246 | 245 |
| printable | 100 | 3 |
| **All** | **774** | **676** (98 noindex) |

Printables are a separate template family and fail article-shaped checks by design; they are
bucketed separately throughout, not excluded.

---

## The four mandated axes — all clean

### 1. Meta descriptions

| Check | Result |
|---|---|
| Indexable pages missing a description | **0** |
| Pages with more than one `description` tag | **0** |
| Duplicate description strings among indexable pages | **0** |
| Descriptions under 70 chars | **0** |
| Descriptions not ending in terminal punctuation (mid-clause truncation) | **0** |

18 pages exceed a **965px** width under the estimator written for this run, but **none exceeds
160 characters**, and no pixel-measurement tool is committed to the repo — the 965px figure was
measured in a browser in an earlier session, so it is not comparable to a heuristic estimator.
Treated as an estimator mismatch, **not** a defect. Not touched.

### 2. Image alt text

1,895 `<img>` elements scanned. **Every one carries an `alt` attribute.**

| Check | Result |
|---|---|
| Missing `alt` attribute | **0** |
| Empty `alt=""` | **0** |
| Filename-like alt (`hero-image.jpg`) | **0** |
| Generic alt (`image`, `photo`, `icon`) | **0** |
| Same alt on two *different* images in one page | **0** |

A naive duplicate-alt check reports **757** pages, which is a false positive: 1,515 of the 1,895
images are the header/footer logo (`logo-swimmer.svg`), repeated twice per page with the same alt.
Once the check requires the *sources* to differ, the count is zero. The real content-image corpus
is ~380 images.

Seven alt strings on `education/index.html` run 132–187 chars, against a page median of ~55. They
are accurate, specific descriptions of the newest SVG cards. Shortening them would remove
information from screen-reader users to satisfy an arbitrary lint threshold — **left alone
deliberately**, recorded here so a future run does not treat them as new.

### 3. JSON-LD

| Check | Result |
|---|---|
| Unparseable `ld+json` blocks | **0** |
| Indexable pages with zero structured data | **0** |
| `Article` missing headline / datePublished / author / publisher / mainEntityOfPage / image | **0** |
| `Article` headline over 110 chars | **0** |
| `FAQPage` with empty mainEntity, unnamed question, or empty/stub answer | **0** |
| `BreadcrumbList` with non-sequential positions or unnamed items | **0** |
| `HowTo` with no steps or unnamed steps | **0** |
| `ItemList` where `numberOfItems` disagrees with element count | **0** |

Type census: BreadcrumbList 747, FAQPage 641, Article 562, WebPage 199, ItemList 52, HowTo 47.

### 4. OG / Twitter tags

All nine of `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `twitter:card`,
`twitter:title`, `twitter:description`, `twitter:image` are present on **all 676 indexable pages**.

| Check | Result |
|---|---|
| `og:description` vs `twitter:description`, HTML-decoded | **0 mismatches** |
| `og:title` vs `twitter:title`, decoded | **0 mismatches** |
| `og:image` vs `twitter:image` | **0 mismatches** |
| `og:url` vs `<link rel=canonical>` | **0 mismatches** |
| `twitter:card` outside the valid vocabulary | **0** (774/774 `summary_large_image`) |
| `og:image` / `twitter:image` pointing at a file absent from the repo | **0** |

Comparison is done on decoded, NFKC-normalised strings. A raw-byte comparison produces phantom
mismatches. `og:description` differing from `<meta name=description>` is house convention and is
not flagged.

---

## Additional axes checked, since the mandated four were clean

**JSON-LD asset resolution** — every `image` / `logo` / `thumbnailUrl` in structured data resolves
to a file present in the repo. 0 broken.

**Sitemap reconciliation** — 653 `<loc>` entries vs 653 distinct indexable canonicals, **exact match
in both directions**. (Was 652/652 on 09-09; +1 page.)

**Duplicate `<title>`** — 12 groups covering 25 indexable pages. **All 12 are the redirect-stub
convention, not a defect.** Each duplicate is a legacy URL that canonicalises to its replacement and
correctly shares that replacement's title. See the note below — this one is worth remembering,
because it looks alarming and is not.

**Redirect-stub integrity** — 23 pages canonicalise away from their own URL. All 23 carry a matching
`<meta http-equiv="refresh">` pointing at the same destination as the canonical. 0 stubs assert their
own URL in JSON-LD. 0 contradictions.

**Production parity** — head signals (title, description, canonical, og:title, og:image, JSON-LD block
count, image count, missing-alt count) fetched live and compared against the clone for one page from
each template family: `education/fear-of-water.html`, `swim-lessons/ambler-pa.html`,
`education/toddler-water-safety.html`, `swim-lessons/directory/california.html`. **All four match
exactly**, so this clean result describes production, not just the repo. Leaf pages were used
deliberately — the directory hub serves a stale edge cache and cannot be used to verify a deploy.

**Web root hygiene** — no stray `.py` / `.sh` / scratch files in the served root. The `h.py` leak
fixed in HEAD has not recurred.

---

## What this run did NOT check

Naming these so the "clean" verdict above is not read as broader than it is:

- Rendered-DOM / CSS / mobile layout regressions
- Internal link graph, orphan pages, crawl depth
- Outbound link canonicalisation (Goldfish 218 / AquaTots 144 / SafeSplash 131 / BigBlue 62 still open)
- Factual claim correctness and sourcing
- GSC impression / CTR data
- Directory row accuracy and count-mirror consistency
- The three date surfaces (`lastmod`, `dateModified`, prose) — known to lag, needs a decision from Michael
- Content quality, thin pages, cannibalisation beyond exact-duplicate titles

---

## Recommendation

The four axes this task exists to police are closed, and have been for several consecutive runs.
Continuing to run them daily produces no change. The remaining upside is not on-page: head terms
sit at position 55–76, which is a backlink/authority ceiling, not a markup ceiling.

Suggest either widening this task's mandate to an axis that is still open, or reducing its cadence
to weekly as a regression tripwire.
