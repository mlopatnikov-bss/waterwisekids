# Site Audit — 2026-09-09

Clone: full (unshallow) `live` @ `8b257e0e0`. Denominator: **772 HTML files**, 652 in sitemap.
**Nothing was committed or pushed this run** — see "Why nothing shipped".

## Health summary

| Axis | Denominator | Result |
|---|---|---|
| Broken internal links | 30,297 links | **0** |
| Broken asset refs (CSS/JS/img/font) | 5,208 refs | **0** |
| Missing CSS references | included above | **0** |
| Images missing `alt` | 1,890 imgs | **0** (also 0 empty `alt=""`) |
| HTML tag balance | 772 pages | **0** |
| Head attribute-quote integrity | 772 pages | **0** |
| Duplicate DOM ids | 5,012 ids | **0** |
| Malformed JSON-LD | 2,260 blocks | **0** |
| JSON-LD missing `@context` | 2,260 blocks | **0** |
| JSON-LD urls → non-existent internal page | 2,260 blocks | **0** |
| Sitemap reconciliation | 652 urls | **exact** (652 canonicals − noindex = 652) |
| Oversized files | 772 pages | **1** (`education/index.html`, 345 KB) |

Every axis named in the task file is clean. Two open items below; neither is safe to auto-fix.

## Open item 1 — date surfaces lag real content changes (310 pages)

The site carries three "when did this change" surfaces. All three sit **behind** the date the
page's visible text actually last changed, and — importantly — essentially never ahead:

| Surface | Present on | Behind true change | Ahead | Exact |
|---|---|---|---|---|
| sitemap `<lastmod>` | 652 | **310** | 1 | 341 |
| JSON-LD `dateModified` | 465 | **236** | 0 | 229 |
| Visible "Updated" prose | 348 | **189** | 0 | 159 |

Of the 348 pages carrying all three, 187 agree and 161 have exactly two agreeing — **zero** have
all three disagreeing. So the surfaces are partially coupled, and the lag is one-directional.

Cause: content edits (largely automated) change prose without bumping any date field. Worst cases
are ~5 months stale — e.g. `education/pool-safety-rules-printable.html` declares
`dateModified 2026-04-08` against a true text change of `2026-08-30`.

**Why I didn't just fix it:** correcting only `<lastmod>` would push the three surfaces further
out of agreement on the 161 pages where two currently match. This needs one decision from you —
which surface is authoritative — and then all three should be derived from it. My recommendation:
make the true last-text-change date authoritative and stamp all three at deploy time, since it's
the only one of the four that's computable rather than hand-maintained.

Full per-page detail: `audit-2026-09-09-stale-dates.csv` (310 rows, all four dates each).

## Open item 2 — HowTo `step.url` is not mechanically closable (80 steps, 16 pages)

247 `HowToStep` nodes exist; 167 carry `url`, **80 do not**, across 16 pages.

I probed the markup rather than the schema, and the remaining 80 are stuck for a structural
reason: step names are editorial paraphrases written for the schema, not mirrors of page sections.
Measuring each step name against every linkable element on its page:

- near-exact prose counterpart (≥0.85 similarity): **3**
- partial (0.60–0.85): 26
- **no real counterpart (<0.60): 51**

The steps also don't live at a consistent markup level — on `teens/lifeguard-certification.html`
they're `<li>`, on `parent-and-me-swim-lessons-guide.html` they're inline `<strong>` inside a
paragraph, and on `summer-camp-water-safety.html` they don't appear in prose at all. Auto-anchoring
would deep-link readers to the wrong place, which is worse than an absent optional field.

Closing this needs an editorial pass that either rewrites step names to match headings or adds
real step sections. Worth noting `step.url` is optional in schema.org — this is polish, not a defect.

## Probe corrections made this run

Three sweeps produced false positives before canaries caught them; recording so they aren't repeated:

1. **16,342 phantom broken links** — resolver didn't normalize trailing-slash directory paths
   (`/education/`). Every one was a false positive.
2. **52 phantom duplicate-id pages** — regex counted `id=` inside JavaScript string literals
   (`const countHTML = '<div id="schoolCount">'`). True DOM duplicates: 0.
3. **650/652 phantom stale sitemap entries** — one 656-file cosmetic commit
   (`[visual-qa] Stop screen furniture printing`) set nearly every file's git mtime to today.
   Commit-size thresholding was unsound too: the count swung 112→650 purely on where I put the
   cutoff. Only comparing extracted visible text across revisions gave a stable answer.

All final sweeps are canary-gated — each asserts it both fires on a synthetic defect and stays
silent on a synthetic correct case.
