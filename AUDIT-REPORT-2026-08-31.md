# Site Audit — 2026-08-31

Audited a fresh `live` clone at `16cce42` (753 HTML files, 641 live indexable pages,
23 redirect stubs, 88 noindex). Deployed `e386d5f`.

## Health summary

| Check | Result |
|---|---|
| HTML parse errors | **0** / 753 |
| Head integrity (title/canonical/meta-desc present, none stranded in body) | **0** defects |
| Duplicate element IDs | **0** |
| Broken internal links | **0** of 29,359 resolved |
| Missing CSS / JS / image references | **0** of 4,726 asset refs |
| Images missing `alt` | **0** of 1,843 |
| Images missing dimensions (CLS) | **0** |
| JSON-LD parse errors | **0** of 2,154 blocks |
| JSON-LD non-www or 404 image URLs | **0** |
| Schema completeness (Article headline/datePublished, FAQ answers, breadcrumb positions) | **0** defects |
| Canonicals (https, correct host, target exists, one per page) | **0** defects |
| Sitemap: wrong host, 404 target, noindex listed, indexable page missing | **0** / 642 URLs |
| `og:`/`twitter:` image files present, `og:url` == canonical | **0** defects |
| Duplicate titles / meta descriptions (live self-canonical) | **0** |
| Cache-bust `?v=` version splits | **0** |
| Redirect-stub integrity (canonical + refresh agree, target exists) | **0** of 23 |
| Live HTTP sample (8 URLs incl. sitemap, robots, CSS, 404) | all **200** |
| Live HTML == repo HEAD | ✅ (only diff is Cloudflare `__cf_email__`) |
| **Form controls with no accessible name** | **106 → 0** ✅ fixed |
| Heading-level jumps | 79 on 67 pages — deferred |
| Oversized files | 1 (`education/index.html`, 336 KB — by design) |

## Fixed and deployed — `e386d5f`

**106 search inputs across 54 pages had no accessible name.** The directory
school/city search boxes and the guide/article search boxes exposed only a
`placeholder`. A placeholder is not an accessible name: it is dropped by several
screen readers and vanishes on focus for everyone, so the control announced as a
bare "edit text". No visible `<label>` existed anywhere near them.

| Input | Pages | aria-label added |
|---|---|---|
| `#schoolSearch` "Search by school name…" | 51 | Search by school name |
| `#citySearch` "Search by city…" | 51 | Search by city |
| `#schoolSearch` "e.g. Goldfish, British…" | 1 | Search by school name |
| `#citySearch` "e.g. Houston, Chicago…" | 1 | Search by city |
| `#articleSearch` (education hub) | 1 | Search guides |
| `#articleSearch` (swimmers hub) | 1 | Search technique articles |

Exact-string replacement with per-variant count assertions (51/1/51/1/1/1 — all
matched). Re-probe after patch: **0** unlabeled controls remain. Full baseline
re-run: no regressions. Verified live on `/swim-lessons/directory/alabama.html`
and `/education/`.

No `lastmod` bump and no cache-bust bump: an `aria-label` attribute changes no
rendered content and no asset, so it fails the significance test for announcing a
modification to crawlers.

## Probe corrections (findings that were not real)

Three all-zero results were canary-gated before being trusted, and three
apparent defects turned out to be artifacts of my own probes:

- **Resolver canary passed** — 29,359 relative internal links actually resolved;
  the zero is real, not a filter that never fires. Asserted the resolver rejects
  bogus paths and accepts real ones including directory-index and bare-`.html` forms.
- **"257 unlabeled form controls"** → really 104. 19 were *implicit* labels
  (`<label><input></label>`, perfectly valid) and 140 were `_gotcha` spam-honeypot
  fields. Corrected the probe before fixing anything.
- **"`index.html` canonicalized away without meta refresh"** → false. Its canonical
  is `https://www.waterwisekids.com/`, which my path normalizer failed to equate
  with `/index.html`. Self-canonical, correct.
- **"BreadcrumbList nested under WebPage property" on 3 hubs** → not a defect.
  `WebPage.breadcrumb` is valid schema.org. Same probe shape flagged in the
  2026-08-30 note.
- **13 duplicate titles / 14 duplicate h1s** → 10 of each are redirect stubs
  legitimately mirroring their canonical target. Excluding cross-canonical pages
  leaves 0 duplicate titles and 12 duplicate h1s (below).

## Not fixed — deferred or needs Michael

### P1 — `http://www.waterwisekids.com/` still serves 200

```
curl -I http://www.waterwisekids.com/  ->  200 OK    (Server: cloudflare)
curl -I http://waterwisekids.com/      ->  301
```

Unchanged for a fifth consecutive run. The bare domain redirects, the `www` host
does not, so every page has an unencrypted indexable duplicate. Not fixable from a
commit — edge config is inert on GitHub Pages.

**Needs Michael:** Cloudflare → SSL/TLS → Edge Certificates → *Always Use HTTPS*,
or a redirect rule covering `www.waterwisekids.com`.

### P1 — mount working copy is stranded (my fault, one command to fix)

Running `git fetch` against the mounted repo created `.git/index.lock`, and the
sandbox cannot unlink files inside the mount ("Operation not permitted"). The
subsequent `reset --hard` therefore half-applied and left the mount at
`2476831c5` (2026-08-20) with 145 dirty files.

**This does not affect the live site.** GitHub Pages builds from the `live` branch
on GitHub, which is at `e386d5f` and verified serving the fix. But a future session
that publishes from the mounted repo would push 11-day-old content.

**Needs Michael**, from a terminal on the Mac mini:
```bash
cd ~/Documents/Claude/Projects/WATERWISEKIDS.COM
rm -f .git/index.lock .git/ORIG_HEAD.lock .git/next-index-7.lock
git fetch origin live && git reset --hard origin/live
```
(`ORIG_HEAD.lock` dates to 08-16 and `next-index-7.lock` to 08-20, so lock debris
has been accumulating in this repo for a while.) Going forward this job will treat
the mount as read-only and do all git work in a `/tmp` clone.

### P2 — sitemap `lastmod` newer than schema `dateModified` on 377 pages

| | |
|---|---|
| `dateModified` == `lastmod` | 79 |
| `dateModified` older than `lastmod` | **377** |
| `dateModified` newer than `lastmod` | 0 |
| No `dateModified` in JSON-LD | 186 |

Entirely one-directional. 333 of the 377 carry `lastmod=2026-08-29` from the
metadata-only reconciliation pass — the sitemap announced a change the page's own
schema never claimed.

Checked the 186 with no `dateModified` at all: **all are `WebPage`/`FAQPage`-typed**
(town pages, state directories, hubs), never `Article`. `dateModified` is optional
on `WebPage`, so that group is not a defect.

**Still not auto-fixed**, same reasoning as 08-30: choosing which signal is
authoritative is a policy call, and moving crawl signals on 377 URLs unilaterally
is not a nightly-audit decision — particularly while Google has not downloaded the
sitemap since April.

### P3 — 12 duplicate h1s between live self-canonical pages

Root-level `kids-swim-lessons-<town>.html` vs `swim-lessons/<town>.html`, e.g.
"Kids Swim Lessons in Ambler, PA". Both self-canonical, both indexable. Known item;
the losers carry zero impressions. Deferred to the growth job — rewriting one h1 of
each pair is a content decision, not an audit fix.

### P3 — 79 heading-level jumps on 67 pages

60 × `h1→h3` (e.g. `404.html`: "Page Not Found" → "Explore WaterWiseKids") and
19 × `h2→h4` (e.g. `british-swim-school/jersey-shore.html`: "Welcome to…" →
"Locations"). Real semantic gaps, but **deliberately not touched**: `16cce42`
retuned the mobile heading hierarchy across 22 templates *today*, and heading
levels are load-bearing for that type scale. Belongs to the CSS/visual-QA job,
which can see the rendered result.

### P4 — noted only

- `education/index.html` is 336 KB (355 inline cards). Intentional hub design.
- Non-lazy below-fold images: `index.html` (8), `about/` (2), `education/` (1).
- 1 title over 65 chars (`education/fishing-water-safety-checklist.html`, 67).
- Stylesheets per page: 3 on 437 pages, 2 on 295, 4 on 4, 0 on 17 — the 17 are all
  redirect stubs, which need no CSS. Correct.

## Notes

- Cache-bust chain is consistent end to end: `main.js?v=20260831a`, and the
  `m-app.css?v=20260831a` key *inside* `main.js` matches — no inert inner bump.
- External-link re-probing skipped again: the WAF returns 403/404 for a large share
  of live destinations, so a failure carries zero information.
- Render sweep not duplicated — the CSS-regression and content-validation jobs
  already ran today.
