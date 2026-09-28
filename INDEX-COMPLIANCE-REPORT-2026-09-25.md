# Google Index Compliance: 2026-09-25

**Corpus:** `origin/live` @ `adb5e36`, measured in a clean clone. The mount's working tree was not read or written; its `.git/index.lock` is still stuck.
**Shipped:** `7fc442f` → `live`. Verified with `git ls-remote`: `refs/heads/live` == `7fc442f`.

## Verdict: COMPLIANT. One new defect found and fixed: 4 Article schemas had no `image`.

## Census

| | |
|---|---|
| HTML files | 810 (+3 since 09-24) |
| indexable | 670 |
| noindex (printables, 404, consolidated) | 116 |
| meta-refresh stubs | 24 |
| sitemap `<loc>` | 670: **0 missing, 0 extra, 0 duplicates, 0 unresolved, 0 future/invalid lastmod** |
| robots.txt | `Allow: /` + sitemap line: OK |

The new pages since yesterday (`how-to-teach-a-child-to-swim`, plus the Parent & Me card landing page and its printable) are wired correctly. The landing page is in the sitemap, and the printable is `noindex` and not in the sitemap.

## Defect fixed: Article JSON-LD missing `image`

Google lists `image` as a recommended property for Article. Without it, a page is less likely to get image-rich results. The other 482 education articles use the site card `waterwisekids-og.png` (1200×630). I added the same card to:

- education/infant-swim-resource.html
- education/boating-safety-activities.html
- education/goldfish-swim-school-levels.html
- education/autism-speaks-water-safety.html

The change was one line per page. All JSON-LD re-parses. `lastmod` was not bumped because the page content didn't change.

## Checks (all post-fix, all 0)

| Check | Result |
|---|---|
| Canonical present / self-referencing / single / target exists | 670/670 OK |
| og:url == canonical | 0 mismatches |
| noindex pages in sitemap | 0 |
| Indexable pages missing from sitemap | 0 |
| robots meta `max-image-preview` | 670/670; 0 `nofollow` |
| Title / meta description present | 670/670; 0 duplicates (quote-aware parse) |
| Missing H1 | 0 |
| JSON-LD parse errors | 0 of 2,368 blocks |
| Internal URLs inside JSON-LD resolve | 4,230, **0 unresolved** |
| FAQPage Qs complete / duplicate FAQPage per page | 0 / 0 |
| BreadcrumbList positions sequential | 0 bad |
| Article missing headline/datePublished/author/image | **0** (was 4) |
| sitemap lastmod behind dateModified | 0 |
| Double-encoded entities in visible text / entities in LD | 0 / 0 |
| Duplicate `id=` in a page | 0 |
| Internal `<a href>` links | 32,461 checked, **0 broken**, 0 `http://` self-links |

## Google ping
I didn't ping anything. Google retired the `/ping?sitemap=` endpoint in 2023, and it now returns 404. Google finds the sitemap through the `Sitemap:` line in robots.txt and through Search Console, and both are already in place.

## Decisions for Michael (unchanged from 09-24, not auto-fixed)
1. **4 pages under 250 words:** `aquatic-jobs/`, `contact/`, `teens/scholarships.html`, `jobs/`.
2. **Repeated FAQ answer:** the swim-lesson cost answer appears word-for-word on ~93 pages.
3. **65 pages have a JSON-LD image below Google's 696px floor**, from 600×360 card crops. Regenerating the cards at 1200×630 fixes this.
4. `education/silent-drowning-what-it-looks-like.html` is both noindex and canonicalized. It does no harm, but it would be cleaner to use one signal.

## Still unmeasured
Live HTTP status codes. The unattended sandbox can't fetch waterwisekids.com.

## Housekeeping
- The mount repo's `.git/index.lock` (0 bytes, dated 09-25 05:12) can't be removed from the sandbox. Delete it once on the Mac mini (`rm .git/index.lock`), then run `git worktree prune`.
- The mount's local `live` branch has diverged from `origin/live` (273 vs 32 commits). All work ships through the clean clone, so this is harmless, but don't push from the mount without reconciling first.
- The mandatory cleanup ran.
