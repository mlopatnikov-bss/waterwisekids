# Content Validation Report — 2026-08-31

Branch: `live` (fresh clone audited, not the mount — mount is stale at `2476831c5`, 2026-08-20)
Window: commits since 2026-08-30 ~11:00 EDT (12 commits)

## Scope

| Category | Count |
|---|---|
| Commits in window | 12 |
| HTML files touched (mostly sitewide chrome sweeps) | ~700 |
| **Genuinely new pages** | **2** |
| Education articles run through full structural check | 414 |

New pages (commit `552d80b`, Lead magnet: Survival Swim Skill Decoder):

- `education/survival-swim-skill-decoder.html` (landing)
- `education/survival-swim-skill-decoder-printable.html` (printable)

## 1. Structural template checks — 414/414 PASS

All 17 required/banned checks passed on every education article touched in the window:

Required present: `main-layout`, `<main class="article">`, `article-header`, `article-meta-item`,
`article-body`, `article-excerpt`, styled breadcrumb (`background: #f8fafc`), `main.css`,
`article.css`, `GTM-5DN8B3QT`, `tldr-box`, `FAQPage`, `sidebar`.

Banned absent: `article-layout`, `article-main`, `</article>`, `<main class="main-layout">`.

**0 failures. No template repairs were required.**

## 2. New landing page — deep validation

`education/survival-swim-skill-decoder.html`

| Check | Result |
|---|---|
| Structural template (17 checks) | PASS |
| Head integrity (metas leaking into `<body>`) | 0 — head intact |
| Title length | 60 chars |
| Meta description length | 149 chars (in range) |
| H1 | exactly 1 |
| Canonical / OG title / OG desc / OG url / OG image / twitter:card | all present |
| JSON-LD | Article + BreadcrumbList + FAQPage, all parse cleanly |
| `datePublished` / `dateModified` | 2026-08-30 / 2026-08-30 — correct |
| Article `image` | resolves (`waterwisekids-og.png`) |
| Internal links | 60, **0 broken** |
| Images | 2, **0 missing alt** |
| Sitemap entry | present |
| Nav / footer chrome | 1 header, 1 footer — matches sibling convention |

### FAQ schema ↔ visible parity — 6/6 verified

A naive probe initially reported all 6 questions as "not visible." That is the known
false-positive class: the FAQ block sits directly under `main.article`, **outside**
`.article-body`, and the page also carries emoji-prefixed `h2` questions in the prose.
Re-probed against the full document with emoji/entity/em-dash normalization:

- All 6 schema questions appear verbatim as visible `h3` headings.
- All 6 `acceptedAnswer` bodies match the visible answer text (windowed from word 5 to
  skip lead-ins) — **no paraphrase drift**.

## 3. New printable — validated against the *printable* convention

`education/survival-swim-skill-decoder-printable.html` fails the article-template checks by
design. Confirmed it matches how all 90 printables on the site behave:

| Convention | Sitewide | New file |
|---|---|---|
| `noindex` | 87 / 90 | yes |
| Excluded from sitemap | 87 / 90 | yes |
| GTM present | 90 / 90 | yes |
| Self-referential canonical | yes | yes |

The 3 printables that *are* in the sitemap are exactly the 3 that lack `noindex` —
internally consistent, no conflict. Schema `headline` differs from the `h1` on this file,
but the page is `noindex`, so it is correctly outside the headline-drift corpus.
**No defect.**

## 4. Freshness and count integrity

- `dateModified` and sitemap `lastmod` are **2026-08-31** on all four pages given real
  body-text edits today (3 AEO rewrites + the code-brown title/meta rewrite). No drift.
- The 13 pages in yesterday's CPR-guidance fix all carry `dateModified` 2026-08-30. Correct.
- Guide-count truth (`sitemap /education/ locs − 1`) = **417**, matching the corrected
  claims shipped in `3bbcc94`. Remaining "400+" phrasings are safe roundings.

## 5. Residual sweep — drowning CPR guidance (commit `c997950`)

Re-swept the *shape* of the claim sitewide, including JSON-LD `acceptedAnswer` text, for
"hands-only" / "compression-only" in drowning, infant, or pediatric contexts.

13 hits found — **all correctly framed**: breaths-first for drowning, with hands-only
presented only as a dry-land technique or an explicit better-than-nothing fallback. No
residuals outside the touched pages. Verified the fix did not leave a contradicting
variant in schema.

## 6. Issue found and fixed — new lead magnet was link-starved

The Survival Swim Skill Decoder shipped 2026-08-30 with **1 inbound link** sitewide (the
`/education/` hub only). This is the recurring "new lead magnets launch link-starved"
pattern. Nine highly relevant live guides linked to it zero times.

Seeded 4 contextual prose links, inserted into `.article-body` byte ranges only:

| Source page | Anchor |
|---|---|
| `swim-float-swim-method-explained.html` | survival swim skill decoder |
| `two-self-rescue-skills-children.html` | survival swim skill decoder |
| `swim-school-survival-tests-explained.html` | roll to a back float |
| `distance-vs-survival-swimming.html` | rolling to a back float |

Guards applied per known trap classes:

- Replacement scoped to the raw `.article-body` byte range via depth-matched `div` walk —
  `swim-school-survival-tests-explained.html` had 2 whole-file matches for the anchor
  string, one of them inside FAQ JSON-LD. **The JSON-LD copy was correctly skipped.**
- Asserted exactly 1 occurrence in body, exactly 1 resulting anchor, no nested anchor,
  and asserted zero `survival-swim-skill-decoder` references inside any `ld+json` block
  post-edit on all four files.
- `dateModified` and `sitemap lastmod` deliberately **not** bumped — matching the
  convention of yesterday's internal-linking commit `ead221c`, since a prose-link insert
  is not a significance-signature content change.

**Shipped:** `459adbd` → `live`.
Verified live over HTTPS after deploy: all 4 source pages return the link; landing page
returns 13 self-references. Inbound links to the magnet: 1 → 5.

## Summary

| | |
|---|---|
| Template failures | 0 of 414 |
| Template repairs needed | 0 |
| New pages validated | 2 (1 article, 1 printable) — both clean |
| Broken internal links on new pages | 0 |
| Missing alt text | 0 |
| Schema/visible FAQ mismatches | 0 |
| Freshness drift | 0 |
| Claim residuals | 0 |
| Issues fixed and pushed | 1 (link starvation) |
