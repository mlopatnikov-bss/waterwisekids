# Google Index Compliance — 2026-09-10

**Measured on:** fresh full clone of `origin/live` @ `6d39ae689`
**Pushed:** `b0548166a` (1 commit, 1 file deleted)
**Status:** COMPLIANT — 0 failures across every auto-fixable axis

---

## Census (reconciles exactly)

| | count | vs 09-09 |
|---|---|---|
| HTML files | 774 | +3 |
| primary (indexable) | 653 | +2 |
| `noindex` | 98 | +1 |
| meta-refresh stubs | 23 | — |
| sitemap `<loc>` | 653 | +2 |

`653 + 98 + 23 = 774` — **0 unexplained files.**
Sitemap reconciles to primary pages **exactly**, 0 drift in either direction.
2,265 JSON-LD blocks · 35,873 internal refs.

## Regression canary — all previously-closed axes

Every axis closed on 09-07/09-09 was re-run and returned **zero**:

- **sitemap** — dup `<loc>`, wrong host, should-not-be-there, indexable-missing, missing/invalid `lastmod`
- **canonical** — absent, multiple, wrong host, in `<body>`
- **title / meta description / h1** across the 653 — missing, duplicate, multiple, out-of-range, soft-404, `<50ch`, `>160ch`
- **head breakage** — per-attribute raw scan
- **JSON-LD** (2,265 blocks) — unparseable, missing required fields on top-level nodes, Q/A integrity, ListItem integrity, non-www host
- **internal links** (35,873 refs) — broken href, wrong host, non-https
- **stubs** (all 23) — refresh target == canonical == a file that exists
- **robots.txt** — `Allow: /`, valid `Sitemap:` on the canonical host, no `Disallow` blocking any sitemap URL

**Probe canaries: 3/3 PASS** (head-quote fires, script-strip fires, stub path-compare fires).

Two first-pass hits were confirmed **probe artifacts**, not defects, and the probe
was corrected before the clean result was accepted:

1. `${school.website}` on 51 directory state pages — a JS template literal inside
   `<script>`, caught by the raw `href` regex. Fixed by stripping `<script>`/`<style>`
   before harvesting refs.
2. All 23 stubs "target ≠ canonical" — relative-vs-absolute string compare.
   Fixed by comparing on URL *path*.

---

## New axis opened this run

Per standing guidance, the closed list was not the point of the run. Three
previously unmeasured axes:

### A. Indexable pages linking to non-indexable targets — CLEAN
- **0** anchors from indexable pages to any of the 23 meta-refresh stubs.
  (This was the axis most likely to hold a real defect — Google treats meta-refresh
  as a soft redirect, so internal links pointing at stubs would waste crawl budget.
  None exist.)
- 705 anchors point to 97 of the 98 `noindex` printables. **This is convention,
  not a defect** — printables are a deliberate noindex template family and these are
  resource download links. No action; do not "fix" these.

### B. Crawl depth from `/` — HEALTHY
| depth | pages |
|---|---|
| 0 | 1 |
| 1 | 68 |
| 2 | 491 |
| 3 | 75 |
| 4 | 13 |
| 5 | 5 |

**0 unreachable**, max depth 5, nothing deeper. The 5 deepest are
`/pool-safety-rules-for-kids.html` and four NJ city pages
(asbury-park, brick, howell, ocean-county). Depth 5 is within Google's comfortable
range; flagged as an observation only — the internal-link lever is recorded as
exhausted and these were not churned.

### C. Non-HTML files served at web root — 1 DEFECT FOUND AND FIXED

| file | verdict |
|---|---|
| `h.py` | **stray scratch — removed** |
| `site-nav.js` | orphaned, left in place (see below) |

---

## Fix applied

**Removed `/h.py`** (6,042 bytes) — pushed as `b0548166a`.

A scratch script accidentally committed in `28481e14d` during the 09-09 Streamline
harvest. It was publicly served at `https://www.waterwisekids.com/h.py`, referenced
by **zero** pages, absent from sitemap and robots, and it leaked an internal sandbox
path (`/tmp/scout9/...`) plus a raw harvest dataset. Nothing indexable references it,
so removal touches no indexable surface.

This is the second instance of the same failure mode: scratch created inside the repo
clone getting committed to the live site. The prior instance deleted three live pages.

## Left alone deliberately

**`site-nav.js`** — orphaned (0 references from any live HTML; appears only in
archived functionality reports), superseded by `main.js`. It is a real, deliberately
maintained asset rather than scratch, and removing a shipped asset on inference alone
is exactly the move that cost three live pages previously. **Needs Michael's call.**

## Carried forward — human decisions, unchanged

1. **Sitemap not downloaded by Google since April** — 6th consecutive run. 653 live
   URLs vs 97 announced ≈ 85% never announced. Michael must resubmit in Search Console;
   the API token is still `webmasters.readonly`, so this cannot be automated.
2. **`lastmod` ahead of `dateModified`** — direction still uniform (never behind).
3. **~103 self-canonical city twins / 11 duplicate-h1 pairs** — losers have zero
   impressions; deferred by prior decision.
4. **http:// variants indexed** — still unverified. Live-HTTP checking remains
   impossible in a scheduled run: `web_fetch` refuses the domain (no user message
   carries the URL, so it is outside the provenance set) and the browser pane
   auto-declines with nobody present to approve. **The only remaining route is to
   paste the verbatim URLs — including a leaf page, not just a hub — into the task
   file body.**

---

*Verification note: the push was confirmed against the remote ref
(`origin/live` = `b0548166a`), not by fetching the live page, for the provenance
reason above. The change is a file deletion, so there is no rendered surface to check.*
