# Site Audit — waterwisekids.com — 2026-09-10 (evening)

Fresh clone of `origin/live` @ `6d2e0f4`. 774 HTML files. Audited the clone, not the
stranded mount.

## Health summary

| Axis | Denominator | Result | Status |
|---|---|---|---|
| Broken internal links | 34,940 hrefs | 0 | ✅ |
| Missing asset refs (css/js/img) | 774 pages | 0 | ✅ |
| Missing `alt` | 1,895 images | 0 | ✅ |
| Invalid JSON-LD | 774 pages | 0 | ✅ |
| Duplicate element IDs | 774 pages | 0 | ✅ |
| Sitemap entries resolving | 653 locs | 653 / 0 unresolved | ✅ |
| Oversized files (>500 KB) | 774 pages | 0 | ✅ |
| Contextual inbound floor | 424 indexable | floor 2, 0 under-2 | ✅ |
| **Scripts published from web root** | `git ls-files` | **6 found, removed** | 🔴→✅ |

Every zero above was **canary-gated**: one defect of each class was injected into a
throwaway copy and all six classes fired before the zeros were trusted. The inbound-link
probe was run verbatim from `.deploy/probes/` and canaried at the previous commit — its
3-way blocking-class fingerprint (121 / 26 / 11) reproduced exactly.

## Action taken — `3e0409b`, pushed to `live`

**Six build scripts were being served publicly at HTTP 200.**

- `.deploy/directory-gen/{apply,gen,gen3,hub,write}.py`
- `swim-lessons/directory/generate-state-pages.sh`

The `.py` files entered the deploy branch by accident in `28481e1` (a directory-data
commit) even though `.gitignore:6` declares `.deploy/` must never publish — gitignore
rules only govern *untracked* paths, so they shipped anyway. This is the **third**
occurrence of scratch-in-clone reaching production; this morning's pass removed `/h.py`
from the web root but missed five siblings added by the *same commit* one directory
deeper.

Scanned for credentials first: **no secrets in any of the six**. No inbound references
in any HTML/XML/TXT, not in `sitemap.xml`.

Because a `.py`/`.sh` has no `<head>` to carry `noindex` and `_headers` is inert on
GitHub Pages, removal was the only effective lever. Before removing, copies were
preserved off the web root at `.deploy/directory-gen/` and `.deploy/scripts/` on the
mount and **md5-verified** — necessary, because the mount's copy was empty and the
tracked files were the only copies of the directory generator in existence.
No `robots.txt Disallow` was added: blocking a deleted path stops Google recrawling and
seeing the 404, which slows deindexing.

**Verified:** exactly 6 deletions staged and nothing else; 774 HTML files before and
after; both removed URLs now return 404 at the edge; `/tools/index.html`,
`/tools/pool-barrier-self-check.html`, `/tools/family-water-safety-plan.html`,
`/swim-lessons/directory/`, and the child-protection audit all still return 200 (no
collateral damage of the kind a prior delete caused).

## No publishing wave today

Nothing shipped between `9549c7d` and `6d2e0f4`; the only intervening commit is a
`[visual-qa]` CSS class restore. The inbound gate is a pass, not a skipped measurement.

## Still open for Michael

- Rotate the GitHub PAT embedded in the git remote URL.
- `git gc --aggressive` — `.git` is 271 MB / 64 packs, 84% of the workspace vs 51 MB of
  site.
- Mount is stranded at 2026-08-20; its file counts describe an old snapshot.
- Resubmit `sitemap.xml` in GSC — not downloaded since April.
- Jobs API: CORS + Apps Script 403 (access must be set to "Anyone").
- HTTP (non-HTTPS) variants are still indexed.
- Outbound canonicalisation backlog: GF 218 / AT 144 / SafeSplash 131 / BigBlue 62.
- `HowTo step.url` — 80 remaining, needs an editorial pass.
- The three date surfaces (lastmod 310 / dateModified 236 / prose 189) — fix all three
  or none.
- 122 pages with `.content-grid` off-rail on desktop.
