# Site Audit Report — 2026-08-20

**Site:** waterwisekids.com · **Branch:** `live` · **Baseline commit:** `cd900e1` · **Deployed:** `e81f2de`
**Scope:** 731 HTML pages, 13 CSS, 7 JS, 442 images, 631 sitemap entries, 172 unique external URLs.

---

## Health summary

| Check | Result | Status |
|---|---|---|
| Broken internal links | 0 / ~all anchors resolved to disk | ✅ |
| Broken asset refs (img/script/link/source) | 0 | ✅ |
| CSS `url()` / JS asset refs | 0 broken | ✅ |
| Broken in-page `#fragment` anchors | 0 | ✅ |
| Missing `alt` attributes | 0 | ✅ |
| JSON-LD parse errors | 0 | ✅ |
| JSON-LD image URLs resolving | 0 × 404 | ✅ |
| Duplicate element IDs | 0 | ✅ |
| Nested anchors | 0 | ✅ |
| Missing `lang` / `viewport` / `charset` | 0 | ✅ |
| Duplicate `<title>` / meta description / canonical | 0 | ✅ |
| Meta description length (70–160) | 0 out of range | ✅ |
| Images without dimensions (CLS risk) | 0 | ✅ |
| Render-blocking `<head>` scripts | 0 | ✅ |
| CSS brace balance / truncated selectors | 0 real defects | ✅ |
| Sitemap → nonexistent file | 0 | ✅ |
| Sitemap containing `noindex` pages | 0 | ✅ |
| Indexable pages missing from sitemap | 0 genuine | ✅ |
| `noindex` + cross-canonical conflicts | 0 | ✅ |
| Oversized files | 1 (`education/index.html`, 325 KB) | ⚠️ |
| Broken external links | 1 dead + 1 redirect hop → **both fixed** | ✅ |
| **Directory listings crawlable** | **0 of 428 → 428 of 428** | 🔴→✅ |

---

## Critical finding: the money product was invisible to search engines

All 51 state directory pages under `/swim-lessons/directory/` shipped an **empty**
`<div class="schools-list" id="schoolsList"></div>`. Every one of the 428 school
listings was injected client-side by JavaScript at runtime. The only content a
crawler could see in the raw HTML was a `<noscript>` banner reading
*"JavaScript Required: Please enable JavaScript to view the swim schools directory."*

This matched a previously-logged defect that had been recorded as fixed on
2026-08-20 — **the fix was not present on the `live` branch, and was not present
in the local workspace either.** It had never shipped.

### Fix applied

School cards are now pre-rendered into `#schoolsList` at build time, mirroring
the markup the JS template produces. Because `applySearch()` assigns
`container.innerHTML = ...` on load, the JS cleanly replaces the static markup —
search, filtering, and the localStorage review system behave identically. The
`.directory-note` insert is already guarded by a `!document.querySelector()`
check, so it does not double-insert.

The inaccurate `<noscript>` copy was replaced with a truthful note (search and
reviews need JS; the listings themselves no longer do).

**Verified live on 6 sampled states:**

| State | Listings in raw HTML | Count line |
|---|---|---|
| Alabama | 3 | "3 swim schools found in Alabama" |
| New Jersey | 47 | "47 swim schools found in New Jersey" |
| Texas | 38 | "38 swim schools found in Texas" |
| California | 24 | "24 swim schools found in California" |
| Pennsylvania | 13 | "13 swim schools found in Pennsylvania" |
| Wyoming | 2 | "2 swim schools found in Wyoming" |

DOM-level verification across all 51 pages: exactly one `#schoolsList`, one
`.directory-note`, one `#schoolCount` each, and **428 school cards total**,
matching `schools-data.js` state-by-state. Post-change re-audit found no new
duplicate IDs, nested anchors, or JSON-LD errors.

---

## External link audit

172 unique external URLs checked with a real browser user-agent, following redirects.

**Fixed (2):**

| Issue | Page | Change |
|---|---|---|
| 404 dead link | `education/heat-exhaustion-kids-pool.html` | healthychildren.org extreme-heat: `/at-play/` → `/at-home/` (the `/at-home/` path returns 200; `sun-safe-swim-day-checklist.html` already used the correct one) |
| 301 redirect hop | `education/indoor-vs-outdoor-swim-lessons.html` | `noaa.gov/jetstream/lightning-safety` → `/jetstream/lightning/lightning-safety` |

**Not broken — WAF bot-blocking (60 URLs, no action):** `www.cdc.gov` (28),
`publications.aap.org` (5), `www.cpsc.gov` (5), `britishswimschool.com` (10),
`www.ymca.org`, `www.usla.org`, `cpr.heart.org`, `rnli.org`, `www.bls.gov`,
`www.uscg.mil`, `www.sciencedirect.com`, `www.ahajournals.org`, `www.poolsafely.gov`.
These return 403 to any non-browser client. Confirmed as a false-positive class:
`wisqars.cdc.gov` and all 14 `www.aap.org` URLs returned 200 from the same client,
so the 403s are per-host WAF rules, not dead pages.

**Not broken — bare-origin preconnect hints (2, no action):**
`fonts.googleapis.com` and `fonts.gstatic.com` return 404 at the root by design.

**⚠️ Could not verify (1 host, 117 pages):** `ndpa.org` fails the TLS handshake from
this environment (`SSL routines::unexpected eof while reading`, plus a cert-chain
error). DNS resolves to four Google Cloud IPs. This is most likely a sandbox
egress/TLS issue rather than a dead site, but it is worth a manual browser check
given 117 pages link to it. Not changed.

---

## Known false positives confirmed again (no action)

- **13 pages with no `<h1>`** — all meta-refresh redirect stubs (`about.html`,
  `how-to-*.html`, etc.) that correctly cross-canonical to their live targets.
- **23 indexable pages absent from the sitemap** — all cross-canonical aliases;
  0 are self-canonical, so all 23 are correctly excluded.
- **2 "truncated CSS selectors"** in `article.css` / `printable-poster.css` —
  multi-line `linear-gradient(` declarations, not truncated rules.
- **731 "canonical mismatches"** — an artifact of the check assuming a non-www
  host. The site is consistently `www.waterwisekids.com` across CNAME, robots.txt,
  all 631 sitemap entries, and all canonicals.

---

## Open items for Michael

1. **`ndpa.org` TLS** — 117 pages link to it; verify it loads in a normal browser.
2. **`education/index.html` is 325 KB** — the only oversized file on the site.
   Worth trimming or paginating, though it is not currently breaking anything.
3. **109 titles exceed 65 characters** and will truncate in SERPs. Left alone
   deliberately — title rewrites belong to the growth-loop CTR work, and
   overwriting them here would collide with it.
4. **Deploy loop is still wedged — one command fixes it.** `.git/index.lock` is
   gone, but three other locks survive and still block every git write in the
   mount: `HEAD.lock` and `next-index-7.lock` (Aug 20 11:21) and `ORIG_HEAD.lock`
   (Aug 16 05:17). `.deploy/logs/` confirms it: newest entry is Aug 16 04:40.

   ```bash
   cd /Users/bss/Documents/Claude/Projects/WATERWISEKIDS.COM
   rm -f .git/*.lock
   git merge --ff-only origin/live
   ```
   then restart `.deploy/start-deploy-loop.command`. The workspace is behind
   `live` and has no commits of its own, so the fast-forward is safe. This audit
   published by direct push from a `/tmp` clone, so nothing is stuck waiting.

---

## Changes deployed

Commit `e81f2de` on `live` — 54 files changed, 258 insertions, 156 deletions:

- 51 state directory pages: 428 listings server-rendered
- 2 education pages: external link fixes
- `sitemap.xml`: `lastmod` bumped for the 53 changed pages only (no blanket bump)

Deployment confirmed live: all 6 sampled state pages return 200 with listings in
the raw HTML, both link fixes are serving, and the sitemap shows the new `lastmod`.
