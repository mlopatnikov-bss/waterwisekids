# Site Audit — waterwisekids.com

**Date:** 2026-08-18
**Commit audited:** `fdaeafd` (live)
**Scope:** 727 HTML pages, 1,786 images, 162 distinct external URLs, sitemap, edge config
**Method:** BeautifulSoup parse-based audit (never regex), live HTTP probes, TLS chain inspection, GitHub Pages API

---

## Health summary

| Check | Result | Status |
|---|---|---|
| Broken internal links | 0 / 727 pages | OK |
| Broken asset refs (CSS/JS/img) | 0 | OK |
| Redirect-hop links (links to stubs) | 0 | OK |
| Orphan pages (indexable, 0 inbound) | 0 | OK |
| Sitemap: missing files / noindex / dupes / http | 0 / 0 / 0 / 0 (633 entries) | OK |
| Images missing `alt` | 0 / 1,786 | OK |
| JSON-LD parse errors | 0 | OK |
| FAQPage schema without visible copy | 0 | OK |
| Duplicate JSON-LD `@type` (head+body) | 0 | OK |
| Nested `<a>` (card-insert bug) | 0 | OK |
| Content after `</html>` | 0 | OK |
| Missing GTM / `<h1>` / viewport / `lang` / canonical / `<title>` | 0 each | OK |
| Multiple `<h1>` | 0 | OK |
| noindex + cross-canonical conflict | 0 | OK |
| Encoding corruption / mojibake | 0 | OK |
| Formspree endpoint IDs | `mojpyqdo`, `xzdkybrw` — correct | OK |
| External links returning true 404 | 0 / 162 | OK |
| Homepage guide-count drift | 344 = 344 rendered cards | OK |
| Oversized pages (>250 KB) | 1 (`/education/`, optimized) | info |
| **HTTPS enforcement at origin** | **disabled** | **P1** |
| Inert edge config (`_headers`, `functions/`) | dead on this host | P3 |

**No code defects found. No commits required beyond this report.**

---

## P1 — `https_enforced: false` on GitHub Pages (root cause of the http:// indexation leak)

This is the long-standing http:// leak, and this audit **corrects the previously recorded diagnosis**.

Every page still answers over plain HTTP with no upgrade:

```
http://www.waterwisekids.com/                                         200  (no redirect)
http://www.waterwisekids.com/education/                               200  (no redirect)
http://www.waterwisekids.com/statistics/state-of-drowning-prevention/ 200  (no redirect)
http://www.waterwisekids.com/swim-schools.html                        200  (no redirect)
http://www.waterwisekids.com/about/                                   200  (no redirect)
```

The apex redirect actively **preserves the insecure scheme**:
`http://waterwisekids.com/` -> `301` -> `http://www.waterwisekids.com/` (still HTTP).

### What changed in the diagnosis

Response headers show `x-github-request-id`, `x-github-edge-region: iad`, `via: 1.1 varnish`,
`x-fastly-request-id` — **the origin is GitHub Pages (behind Fastly)**, with Cloudflare proxying in
front (`cf-ray` present). The GitHub Pages API confirms the origin-level cause:

```json
{ "cname": "www.waterwisekids.com", "source": { "branch": "live" },
  "html_url": "http://www.waterwisekids.com/",   "https_enforced": false }
```

Prior notes attributed this purely to a Cloudflare "Always Use HTTPS" toggle. That toggle would also
fix it, but `https_enforced: false` is the origin-level switch and the more precise root cause.

### Why this was not fixed automatically

The API call is available (token carries `repo` scope), but flipping it unattended risks a
**full-site outage**: if Cloudflare's SSL mode is **Flexible**, Cloudflare fetches the origin over
HTTP, the origin would then 301 to HTTPS, and the result is an infinite redirect loop
(`ERR_TOO_MANY_REDIRECTS`) across all 727 pages. SSL mode is not observable from outside Cloudflare,
so the audit stopped rather than gamble the whole site on an assumption.

Blast radius of guessing wrong (total outage) far exceeds the cost of waiting; the leak is already
partially mitigated because **all canonical tags correctly point to `https://`**.

### Remediation — pick one (30 seconds)

**Option A — Cloudflare (safest, no precondition):**
Cloudflare dashboard -> SSL/TLS -> Edge Certificates -> enable **Always Use HTTPS**.

**Option B — GitHub Pages origin.** First confirm Cloudflare SSL/TLS mode is **Full** or
**Full (strict)**, *not* Flexible. Then:

```bash
curl -X PUT -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/mlopatnikov-bss/waterwisekids/pages \
  -d '{"https_enforced":true}'
```

Doing **both** is ideal (defense in depth), but Option A alone resolves the indexed-http problem.

---

## P3 — `_headers` and `functions/_middleware.js` are inert on this host

Because the origin is **GitHub Pages**, not Cloudflare Pages:

- `_headers` is **never applied**. GitHub Pages does not support it. Its only rule targets
  `/styles.css`, which **does not exist** (live returns 404) — leftover from a pre-`/assets/css/`
  layout.
- `functions/_middleware.js` **cannot execute**. This is reassuring: it confirms the neutralized
  legacy HTMLRewriter landmine is not merely dormant but structurally unreachable on the current host.

No action taken — both are harmless. Documented because the trap is that a future change could add
security headers to `_headers`, verify nothing, and believe they shipped. **Real header changes must
be made in Cloudflare (Transform Rules / Managed Headers), not in-repo.** Note the files would become
live again if the site ever migrates to Cloudflare Pages.

---

## P3 — ndpa.org serves an incomplete certificate chain (third-party)

`https://ndpa.org/` and two sub-paths are linked from **116 page-instances** and fail strict TLS
verification:

```
depth=0 CN = *.ndpa.org
issuer  = GlobalSign GCC R46 AlphaSSL CA 2025
Verify return code: 21 (unable to verify the first certificate)
```

The server sends only the leaf certificate and omits the GlobalSign intermediate. With verification
disabled all three URLs return **200** — the site is healthy, the chain presentation is not.

Most browsers recover via AIA fetching, so typical visitors are unaffected; strict clients (some
Android versions, some crawlers, `curl`) will fail. This is ndpa.org's misconfiguration and not
fixable from our side. Links retained — NDPA is a valuable authority citation. Worth an occasional
recheck.

---

## Confirmed false positives — do not "fix" these

Recording these so future audits do not burn cycles re-investigating:

1. **19 indexable pages "missing from sitemap"** — all 19 are meta-refresh redirect stubs with
   correct cross-canonicals. Excluding stubs from the sitemap is correct.
2. **13 pages with "no stylesheet"** — the same redirect stubs. Stubs need no CSS.
3. **10 "duplicate titles"** — stubs intentionally mirror their target's title.
4. **80 external links returning 403/503** — bot-blocking of the datacenter IP, not dead links.
   **Zero returned 404.** Affects CDC, CPSC, AAP, britishswimschool.com, heart.org, USLA, BLS,
   ScienceDirect, PubMed, and Amazon (503).
5. **81% of images lacking `loading="lazy"`** — arithmetic artifact. 714 pages x ~2 eager images
   (logo + hero) is approximately 1,445. Above-fold images *should* be eager. Not a defect.
6. **`/education/` at 328 KB** — large but genuinely well-optimized: 340/346 images lazy, all 344
   cards carry explicit `width`+`height` (no CLS), zero inline CSS, and the 6 eager images are the
   logo plus 5 above-fold cards using `fetchpriority`. Left alone.

---

## Verified-healthy items

- **Deploy pipeline:** live is current with `fdaeafd`; cache-busted assets `main.js?v=20260818b` and
  `main.css?v=20260817w` both resolve 200.
- **robots.txt:** `Allow: /` for all agents, sitemap declared. No AI-crawler block — the Cloudflare
  managed-robots regression has not returned.
- **Repo hygiene:** 37 MB working tree; `.git` down to **20 MB** from the 155 MB peak — the native gc
  took effect.
- **`functions/_middleware.js`:** still a no-op; the documented rationale is intact.

## Recommended next action

Michael: enable **Always Use HTTPS** in Cloudflare (Option A above). It is the only outstanding P1
and closes the last known indexation leak.

---
*Generated by the daily site-auditor. Findings are parse-based, not regex-based; external status
codes reflect requests from a datacenter IP and are interpreted accordingly.*
