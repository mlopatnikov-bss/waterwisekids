# Google Index Compliance — 2026-09-24

**Corpus:** `origin/live` @ `2aab9be`, measured in a clean clone (the mount's working tree was not read or written).
**Shipped:** `b290fdc` → `live` (verified: `origin/live` == `b290fdc`, empty diff).

## Verdict: COMPLIANT. Found and fixed one new defect: double-encoded HTML entities in visible headings on 5 pages.

## Census

| | |
|---|---|
| HTML files | 807 |
| indexable (sitemap) | 669 |
| noindex (printables + 404 + 4 consolidated) | 114 |
| meta-refresh stubs | 24 |
| sitemap `<loc>` | 669, **0 missing, 0 extra** |
| robots.txt | `Allow: /` + sitemap line, OK |

## Defect fixed: literal `&ldquo;` / `&mdash;` / `&rsquo;` showing on the page

18 text nodes had been escaped twice (`&amp;ldquo;` instead of `&ldquo;`). Browsers and Google showed the raw code, so readers saw headings like *How can several schools all be the &ldquo;largest&rdquo;?*. Most were H2 question headings and their TOC links, which are the passages Google uses for jump links and answer snippets.

| page | fixes |
|---|---|
| education/swim-school-superlative-claims.html | 8 (2 H2s + 2 TOC links) |
| education/kick-first-vs-survival-curricula.html | 6 (3 H2s + 3 TOC links) |
| education/recreational-water-illness-prevention.html | 2 (H2 + TOC link) |
| education/kiddie-pool-safety-checklist-printable.html | 1 (related link) |
| education/cold-water-safety-checklist-printable.html | 1 (related link) |

All 18 were in body text, with none inside scripts, attributes or JSON-LD. Heading `id`s did not change, so no anchors broke. After the fix, a corpus-wide rescan finds **0**. `lastmod` was not bumped because this was a display-encoding fix, not a content change.

## New axes this run (canary gate PASS)
- Internal URLs anywhere in the JSON-LD tree resolve to a file: **4,813 URLs in 2,359 blocks, 0 unresolved**
- DOM idrefs resolve (aria-labelledby/describedby/controls, `for=`, `headers=`, `<use href="#">`): **0 unresolved**
- Duplicate `id=` within a page: **0**
- HTML entities inside LD JSON strings: **0**
- Scratch files tracked in the repo (`.py/.sh/.bak/...`): **0**
- lastmod vs dateModified: 222 ahead / **0 behind** / 261 equal / 186 pages with no dateModified

## Standing probes (post-fix, all canary gates PASS)

| Probe | Result |
|---|---|
| index_compliance | 20 by-design stub-canonical groups only |
| index_head_agreement | 0 |
| index_preview_directive | max-image-preview 669/669; only the known `swim-schools` stub pair |
| social_head_completeness | 0 |
| eligibility threshold | 0 (483 headlines, 970 dates, 669/669 reachable) |
| internal_link_resolution | 36,228 links, **0 broken**, 0 broken fragments |

## Decisions for Michael (not auto-fixed, unchanged from 09-23)
1. **4 pages under 250 words:** `aquatic-jobs/` (103), `contact/` (130), `teens/scholarships.html` (185), `jobs/` (202).
2. **Repeated FAQ answers:** the swim-lesson cost answer appears word-for-word on **93 pages**.
3. **65 pages have a JSON-LD image below Google's 696px floor.** `.deploy/gen-card-image.py` crops cards to 600×360. Changing that output to 1200×630 and regenerating fixes this and unblocks the og:image rollout.
4. **Worth a look:** `education/silent-drowning-what-it-looks-like.html` is `noindex` and also canonicals to `signs-of-drowning.html`. Google advises using one signal or the other. It isn't hurting anything, because the page is already excluded.

## Still unmeasured
Live HTTP status codes. Unattended runs can't fetch waterwisekids.com.

## Housekeeping
The mandatory cleanup ran. `/tmp/wwk-wt` is still a stale registered worktree, so run `git worktree prune` once interactively in the mount's repo.
