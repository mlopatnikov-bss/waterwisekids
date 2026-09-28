# Site Audit — waterwisekids.com — 2026-08-28

Audited commit `966dbf0` (fresh `live` clone, not the mount). 747 HTML pages,
32,464 internal links, 5,052 asset references, 2,138 JSON-LD blocks,
309 unique external URLs.

## Health summary

| Check | Scanned | Result | Status |
|---|---|---|---|
| Broken internal links | 32,464 | 0 | PASS |
| Missing CSS / JS / image assets | 5,052 | 0 | PASS |
| Malformed `<head>` (metas leaking into body) | 747 | 0 | PASS |
| Missing title / meta description / canonical | 747 | 0 | PASS |
| Canonical target resolves | 747 | 0 missing | PASS |
| JSON-LD parses (lxml ground truth) | 2,138 | 0 errors, 0 empty | PASS |
| Schema image URLs resolve | 664 | 0 × 404 | PASS |
| `og:image` present + resolves | 747 | 0 missing, 0 × 404 | PASS |
| `img` alt attribute present | 1,828 | 0 missing | PASS |
| `img` width/height present | 1,828 | 0 missing | PASS |
| `html lang` / viewport / charset | 747 | 0 missing | PASS |
| Sitemap entries with no backing file | 639 | 0 | PASS |
| Unsubstituted template placeholders | 747 | 0 | PASS |
| Schema `headline` vs `h1` drift | 537 | 0 | PASS |
| External links — hard dead (404/410) | 309 | 0 | PASS |
| Core routes + 404 handling | 8 | correct | PASS |
| Formspree endpoints | 2 | both live (405 on GET = healthy) | PASS |
| Orphaned legacy pages serving 200 | 747 | **4 found → FIXED** | FIXED |

**Every detector was canary-gated** against synthetic bad input before its zero
was trusted — all 11 detectors confirmed firing. One real trap caught in the
process: `html5lib` returns empty text for `<script>` nodes, so JSON-LD
validation was re-run with `lxml` as ground truth.

## Fixed and deployed

**4 orphaned legacy town pages were serving full 200 responses while
canonicalizing away.** Commit `42b452c`, pushed to `live`, verified live.

`beginner-swim-lessons-{ambler,elkins-park,flourtown,glenside}-pa.html` each
canonicalized to the richer `/swim-lessons/<town>-pa.html` (23KB vs 13.8KB),
had **0 inbound internal links**, and were correctly absent from `sitemap.xml`
— but carried **no meta-refresh**. Any stale external link or cached SERP entry
dropped the visitor on the superseded thin copy with no forwarding.

All 19 other superseded pages on the site carry a redirect stub; these 4 were
the only exception. Converted to the standard stub (meta-refresh + canonical +
og/twitter mirrors + WebPage JSON-LD + visible fallback link), with metadata
inherited from the target page.

Verified live — all four return 200 at ~3.4KB with the correct refresh target,
and all four destinations return 200.

> This is the same defect class recorded for `/swim-schools/` on 2026-07-30:
> canonical and noindex applied, meta-refresh forgotten.

## Open items for Michael

**1. `http://` does not redirect to `https://` — still open.**
`http://www.waterwisekids.com/` returns `200` directly, no 301. This is an
edge/DNS-layer setting, not fixable in the repo (Pages edge config is inert
here). Previously logged and still unresolved.

**2. `ndpa.org` external links — UNVERIFIED, not confirmed broken.**
150 references across the education corpus. From the sandbox, `https://ndpa.org/`
fails TLS (`unexpected eof while reading`) while DNS resolves cleanly to four
Google Cloud LB IPs and `http://` returns a 301 — consistent with sandbox egress
interference, not a dead host. The sanctioned fetch tool refused the URL
(provenance restriction), so this could not be settled either way.
**Worth one manual browser check** given 150 links ride on it. Not treated as a
defect in the table above.

**3. `education/index.html` is 341KB.** The education hub index — large by
design (it lists the full guide corpus), flagged for awareness only, no action
taken.

## Benign classes confirmed, not defects

- **17 pages with no `h1` / 13 duplicate titles** — all redirect stubs
  (including the 4 created today). Stubs mirror their target's title and carry
  no `h1` by site convention.
- **`swim-schools.html` duplicating `swim-schools/index.html`** — the
  documented intentional inversion; the flat file is the indexed hub.
- **108 pages absent from sitemap** — 84 noindex, 19 redirect stubs, 1 × 404,
  plus the 4 fixed today. Correct exclusions.
- **110 external links returning 403** — WAF bot-blocking (britishswimschool,
  bigblueswimschool, et al). A 403 carries zero information about liveness.
