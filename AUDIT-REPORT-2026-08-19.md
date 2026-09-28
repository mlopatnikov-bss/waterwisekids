# Site Audit Report — 2026-08-19

**Scope:** waterwisekids.com, `live` branch @ `987f6c2` (fresh clone; workspace `.git/index.lock` still blocks in-place git — see Blockers)
**Pages scanned:** 729 HTML files (710 real pages + 19 redirect stubs) · 1,779 images · 634 sitemap URLs · 1,277 files on disk

---

## Health Summary

| Check | Result | Status |
|---|---|---|
| Broken internal links | 0 / ~30k anchors | ✅ PASS |
| Links to redirect stubs (crawl-budget hops) | 0 | ✅ PASS |
| `http://` internal links | 0 | ✅ PASS |
| Missing CSS / JS references | 0 | ✅ PASS |
| Missing images on disk | 0 | ✅ PASS |
| Images missing alt text | 0 / 1,779 | ✅ PASS |
| Images missing dimensions (CLS risk) | 0 / 1,779 | ✅ PASS |
| JSON-LD parse errors | 0 | ✅ PASS |
| Schema `image`/`logo` URLs 404 | 0 | ✅ PASS |
| Speakable selectors matching nothing | 0 | ✅ PASS |
| Sitemap entries with no file on disk | 0 / 634 | ✅ PASS |
| Indexable self-canonical pages missing from sitemap | 0 | ✅ PASS |
| Duplicate `<title>` | 0 groups | ✅ PASS |
| Duplicate meta descriptions | 0 groups | ✅ PASS |
| Missing / empty `<title>` | 0 | ✅ PASS |
| Missing meta description | 0 | ✅ PASS |
| Meta descriptions >160 chars | 0 | ✅ PASS |
| Missing `lang` / `viewport` | 0 | ✅ PASS |
| Missing or multiple `<h1>` | 0 | ✅ PASS |
| Nested `<a>` inside `<a>` | 0 | ✅ PASS |
| Duplicate element IDs | 0 | ✅ PASS |
| `<p>` nested in `<p>` | 0 | ✅ PASS |
| Render-blocking scripts in `<head>` | 0 | ✅ PASS |
| Oversized files (>500 KB) | 0 | ✅ PASS |
| Formspree endpoints well-formed | 2 / 2 | ✅ PASS |
| Live HTTP status (4 key URLs) | 200 / 200 | ✅ PASS |
| **False directory-size claim** | **4 strings** | **🔴 FIXED & DEPLOYED** |
| Titles >65 chars | 76 pages | 🟡 REPORT |
| Heading-level skips | 28 pages | 🟡 REPORT |
| `/jobs/post.html` form has no `action` | 1 page | 🟡 KNOWN |
| External link status verification | blocked | ⚪ N/A this session |

---

## 🔴 Fixed and deployed

### False directory-size claim on the money page — inflated 23×

`/swim-schools.html` is the canonical, indexed directory hub. It advertised **"10,000+ swim schools"** in four places. The actual directory (`swim-lessons/directory/schools-data.js`) contains **428 school entries across 51 state keys** (50 states + DC) — verified by evaluating the data file, not by grepping.

The homepage already said **"400+ swim schools"** (accurate), so the site was contradicting itself, and the SERP snippet for the directory promised 23× more inventory than it delivers. Beyond the credibility problem, this is a bounce-rate trap: a visitor arriving expecting 10,000 listings finds 428.

Corrected to `400+` in all four locations:

| Location | Before | After |
|---|---|---|
| `meta name="description"` | Search 10,000+ swim schools across all 50 states… | Search 400+ swim schools across all 50 states… |
| `meta property="og:description"` | Search and rate 10,000+ swim schools nationwide. | Search and rate 400+ verified swim schools nationwide. |
| `meta name="twitter:description"` | Search and rate 10,000+ swim schools nationwide. | Search and rate 400+ verified swim schools nationwide. |
| WebPage JSON-LD `description` | Search 10,000+ swim schools across America | Search 400+ verified swim schools across America |

No visible body copy changed — the on-page hero never claimed a count. Because body text was unchanged, `sitemap.xml` `lastmod` was deliberately **not** bumped.

- Commit: `c89bbb6` on `live`
- Deploy verified live at `https://www.waterwisekids.com/swim-schools.html`

**Checked and cleared as legitimate:** Minnesota's "Land of 10,000 Lakes" (`/swim-lessons/directory/minnesota.html`) and Hope Floats Foundation's "200+ swim schools in 31 states" (`/scholarships/`) are third-party or geographic facts, not our inventory.

---

## 🟡 Reported, not auto-fixed

### 1. Titles over 65 characters — 76 pages (25 over 70)

Distribution: `/education/` 63 · `/swim-lessons/` 11 · `/statistics/` 2. Worst offenders:

| Chars | Page |
|---|---|
| 79 | `/education/bath-time-safety-infants.html` |
| 77 | `/education/pool-slide-safety.html` |
| 76 | `/education/year-round-swim-skills-checklist.html` |
| 76 | `/education/swimmers-ear-prevention-checklist.html` |
| 75 | `/education/swim-lessons-cost.html` |

The overflow is almost entirely the 16-character ` | WaterWiseKids` suffix — the substantive part of each title is ~50–63 chars and survives truncation. **Severity is low**, and Google frequently drops brand suffixes on its own.

Not auto-fixed because the copy is well-crafted and rewriting 76 titles programmatically risks damaging CTR on pages that are currently performing. It would also collide with the pinned directory title pattern (`Swim Lessons in {STATE}`), which must not be reverted.

**Recommendation:** if worth doing, drop the brand suffix only on the 25 pages over 70 chars — a targeted, reviewable edit rather than a sweep.

### 2. Heading-level skips — 28 pages (WCAG 1.3.1)

- `h2 → h4` on 16 pages (e.g. `/special-needs-swimming.html`, `/british-swim-school/jersey-shore.html`, `/teens/aquatics-careers.html`)
- `h1 → h3` on 12 pages (e.g. `/404.html` "Explore WaterWiseKids", `/statistics/index.html` "Cite this page", `/swim-schools/add.html` "Free Listing")

All the `h1 → h3` cases are sidebar/callout boxes where the h3 is visually correct. `main.css` carries only 3 `h4` rules, so promoting `h4 → h3` would enlarge that text and change layout on 16 pages. Screen-reader impact is real but modest; the visual-regression risk of a blind sweep is higher than the benefit. Flagging for a deliberate pass with render verification rather than fixing blind.

### 3. `/jobs/post.html` — form with no `action`

Known issue, unchanged: the Apps Script jobs API is dead (403/503) and requires Michael to redeploy it. The form is inert until then.

---

## ⚪ Could not verify this session

**External link status (145 unique off-site URLs, ~3,000 link instances).** `web_fetch` enforces a provenance rule — it only retrieves URLs that appeared in a user message or a prior search result — and this is an unattended scheduled run with no user message to seed from. Direct HTTP checks via shell are off-limits under the web-content policy.

The highest-volume external targets, which carry the most risk if they rot, are:

| Instances | URL |
|---|---|
| 606 | healthychildren.org — Water-Safety-And-Young-Children |
| 402 | cdc.gov/drowning/data-research/facts/ |
| 279 | redcross.org/take-a-class/swimming/swim-lessons |
| 275 | redcross.org — water-safety |
| 167 | cdc.gov/drowning/ |
| 150 | ndpa.org |
| 145 | usaswimming.org/foundation |

A single rotted CDC or Red Cross URL would break hundreds of citations at once. Worth running an external link check from an interactive session, where the URLs can be seeded into provenance.

---

## Notes and non-issues confirmed

- **13 root-level `.html` files carry no stylesheet** — all 13 are meta-refresh redirect stubs with correct cross-canonicals and no `noindex`. Correct pattern; not a defect.
- **1,433 images "missing width/height"** was a false positive from attribute-only counting. 1,421 are the nav/footer logo SVG carrying `style="width:28px;height:28px"`. Counting inline styles as well as attributes gives **0 images genuinely missing dimensions**. Worth keeping in mind: any future image-dimension audit must read inline `style`, not just the `width`/`height` attributes.
- **`/education/index.html` is 332 KB** — 5× the next-largest page. It's a legitimate 345-card index of 480 articles with 387 links and 88k characters of text, not bloat. Flagging for awareness only; if it grows further, pagination or lazy card rendering becomes worth considering.
- **Directory state pages require JavaScript** to render listings (`schools-data.js`, 107 KB). Google renders JS, so this is not an indexation blocker, but the listings are absent from the raw HTML.
- **Directory depth is thin in 10 states** (fewer than 3 schools each; NH has 1). Not a technical defect, but it caps what the "400+" promise delivers regionally.

## Blockers

- **`.git/index.lock`** in the mounted workspace is still a stale 0-byte file that the mount will not let the sandbox delete (`Operation not permitted`). All git work continues to route through a fresh clone. Michael needs to `rm` it locally to restore in-place operations.

---

*Workspace cleanup completed per standing procedure.*
