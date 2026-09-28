# Google Index Compliance — 2026-09-23

**Corpus:** `origin/live` @ `58f6d95`, measured in a clean clone (mount's working tree still dirty; not read or written).
**Shipped:** `28dcaac` → `live` (verified on `origin/live`).

## Verdict: COMPLIANT. One real defect found and fixed: the 2 new CPR pages shipped with an incomplete social head.

## Census

| | |
|---|---|
| HTML files | 805 (+4 since 09-22) |
| indexable | 670 |
| noindex (printables + 404) | 111 |
| meta-refresh stubs | 24 |
| sitemap `<loc>` | 670, **0 missing, 0 extra**; XML parses |
| robots.txt | `Allow: /` + sitemap line, OK |

## Defect fixed: `education/cpr-class.html` and `education/cpr-adults.html`

These 2 pages were published in `f346514`. Both had:

- `og:image` = site default PNG, while LD `image` = their own card JPG (the house convention is og = card, as on every other card page)
- no `og:image:alt`, no `og:image:width/height`
- no `twitter:card / title / description / image`

**Fix:** set og:image to `cards/<slug>.jpg`, added alt + true dims (600×360, measured), and added the full twitter block using the page's existing og:title and og:description. LD blocks still parse. `lastmod` not bumped because this was a markup-only change.

**Post-fix:** `social_head_completeness` 14 → **0**, `index_head_agreement` 2 → **0**, `index_compliance` 22 → 20 (only the by-design stub-canonical groups remain). Canary gates **PASS**.

⚠️ Pattern: the publish pipeline's new-page template is missing the social block. The 09-22 QA run added the robots directive to these same 2 pages after the fact. Fix it upstream in the publish template.

## Standing probes (post-fix)

| Probe | Result |
|---|---|
| index_compliance | 20 by-design stub groups; gate PASS |
| index_head_agreement | 0 |
| index_preview_directive | max-image-preview 670/670; only the known `swim-schools` pair |
| social_head_completeness | 0 |
| eligibility threshold (headline length, refresh delay, nofollow, googlebot, ISO dates, reachability) | 0 (484 headlines, 972 dates, 670/670 reachable) |
| internal_link_resolution | 36,117 links, **0 broken**, 0 broken fragments |

## Reported, NOT auto-fixed (your calls, Michael; unchanged from 09-22)

1. **Thin pages under 250 words:** `aquatic-jobs/` (103), `contact/` (130), `teens/scholarships.html` (185), `jobs/` (202).
2. **FAQ boilerplate:** 5 answers repeated verbatim; the worst is the swim-lesson cost answer, repeated on **93 pages**.
3. **`ld_image_under_696px`: 65** (was 63; the 2 new CPR cards are also 600×360). This is still blocked by `.deploy/gen-card-image.py` cropping to 600×360. Change the output to 1200×630 and regenerate.
4. Title ≠ headline on 423 pages: **by design**, not a defect.

## Still unmeasured
Live HTTP status codes. Unattended runs can't fetch waterwisekids.com.

## Housekeeping
Cleanup commands ran. The stale `/tmp/wwk-wt` worktree still needs `git worktree prune --force`, run once interactively in the mount's repo.
