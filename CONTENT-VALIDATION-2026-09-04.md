# New Content Validation — 2026-09-04

**Corpus:** fresh clone of `origin/live` @ `8743ef80b` (2026-09-04 08:22 EDT).
Mount was stale at `2476831c5` (08-20) — audited the clone, not the mount.

## Scope
- 16 commits in the last 24h; **618 HTML files** touched (mostly sitewide claim-hygiene passes).
- **2 files genuinely new:** `education/swim-progress-audit-worksheet.html` + its `-printable` twin.
- Structural checks run on **409** education files (94 printables excluded — separate template family, fail article checks by design).
- Secondary checks run on **408** (hub `education/index.html` excluded — CollectionPage, not an article).

## Result: PASS — 0 defects, 0 fixes, nothing pushed

### Structural (13 required classes + 4 banned patterns)
408/408 articles clean. The single flagged file was `education/index.html`, which is the education
hub (CollectionPage template) and legitimately has no `article-body`, `sidebar`, or `tldr-box`.
Known template-family false positive, not a regression.

### Secondary
0 issues across 408 files: Article JSON-LD, BreadcrumbList, og:title/description/image,
twitter tags, canonical, footer, nav, image alt text, sitemap entry.

### New article detail
| | worksheet.html | -printable.html |
|---|---|---|
| canonical | self | self |
| schema blocks | 22 | 9 |
| robots | index | **noindex** (correct) |
| sitemap | present | absent (correct) |
| internal links | 37, all resolve | 25, all resolve |
| inbound links | **7 donors** — not orphaned | — |

## Probe integrity (canary-gated)
Every probe was proven able to fail before its clean result was accepted:
- All 4 BANNED patterns fired on a mutated copy; `</article>` fired on a synthetic.
- MISSING branch fired on a mutated copy (`article-body`, `tldr-box`).
- img-alt probe fired on a missing alt and stayed silent on a present one.
- Sitemap probe demonstrated it can report absence (the printable).
- Broken-link resolver fired on a synthetic dead href.
- Loop cardinality asserted: 409 structural / 408 secondary, not 0.

## Notes
- Mount remains stale at `2476831c5`. Not synced — per standing rule, no git writes against the mount.
- Nothing required a push, so `live` is unchanged at `8743ef80b`.
