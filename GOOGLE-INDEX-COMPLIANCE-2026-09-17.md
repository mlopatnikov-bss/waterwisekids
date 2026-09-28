# Google Index Compliance — 2026-09-17

**Measured on:** fresh clone of `origin/live` @ `4eda08c` → **shipped `2099b70`**
**Census:** 784 HTML · 681 indexable · 103 noindex (102 printables + `404.html`) · 23 redirect stubs · sitemap **658 locs**

**Verdict: COMPLIANT.** One real defect found and fixed; every other axis returned zero.

---

## Why this run was not churn

Delta since the 09-16 compliance close (`a8303e584`):
**2 HTML added / 30 modified / CSS+JS 0 bytes / `sitemap.xml` touched.**
Added pages plus a sitemap edit invalidate a reconciliation baseline, so a full pass was warranted.

---

## The defect: donor-template prose on the page published yesterday

`education/swim-team-readiness-scorecard.html` (landing, published 09-16) was re-templated from
`education/swim-lesson-financial-aid-tracker.html`. The re-template pass rewrote **every block
containing the page slug as a token** — headings, `href`s, `data-cta`, form field names,
`<title>`, meta/og/twitter descriptions, canonical — and **missed every block that did not**.
Four blocks of the donor's prose shipped unchanged:

| # | Block | What shipped | Detected by |
|---|---|---|---|
| 1 | sidebar TOC `<li>` list | 6 anchors (`#why #routes #ask #documents #timing #mistakes`) that exist on the donor and not here → **6 broken in-page fragments**, plus 6 labels naming financial-aid sections | internal-link probe |
| 2 | `p.article-excerpt` (the lede) | A full paragraph about affording swim lessons, directly contradicting the Quick Summary beneath it | new axis (below) |
| 3 | Article JSON-LD `description` | The donor's description, byte-identical | new axis (below) |
| 4 | `.sidebar-cta <p>` | Described the aid tracker's contents, not the scorecard's | new axis (below) |

Everything else on the page was correctly re-templated — which is what made blocks 2–4 invisible to
presence-based checks: the `description` field was **present and well-formed**, just about the wrong subject.

**Fixed in `2099b70`.** TOC now points at this page's own 8 section ids plus the printable;
lede, LD `description`, and CTA copy rewritten from the page's own content.
`dateModified` + sitemap `lastmod` bumped to 09-17 (the page carries no prose "Updated" line,
so those are both date surfaces it has).

---

## New axis opened and closed: shared description / excerpt across pages

Never measured before. Two checks over 658 indexable non-stub pages:

- **Article JSON-LD `description` shared by more than one page** — 1 group before (this pair) → **0 after**, 470 distinct values
- **Visible `p.article-excerpt` shared by more than one page** — 1 group before (this pair) → **0 after**, 433 distinct values

Also confirmed: `headline` shared across pages **0/464** — already clean.

### Calibration note (a false-positive shape worth recording)

The first cut of this axis measured *lexical overlap* between the LD `description` and the
`<meta name=description>`, flagging anything under 30%. **It fired 43 times and 42 were false positives.**
Writing the LD description independently of the meta description is a house convention — same subject,
different words — so wording overlap measures style, not correctness. The 3 redirect stubs
(`Redirecting....`) are likewise convention. Only 1 of the 43 was a real topical mismatch.

**Use the duplicate-across-pages test, not the overlap-with-meta test.** It is exact, has no
threshold to tune, and catches precisely the donor-leak shape.

---

## Axes re-verified, all zero

All seven saved probes canary-gated **PASS** before the real run (`.deploy/probes/`).

| Axis | Result |
|---|---|
| Sitemap reconciliation | **658 / 658 exact both directions** — 0 missing, 0 extra |
| Sitemap protocol validity | 0 (ns, W3C lastmod, changefreq enum, priority range, `<loc>` escaping + absoluteness, 50k/50MB caps) · 131,931 bytes |
| Canonical | 0 absent / multiple / wrong-host / in-`<body>` |
| Canonical **target** validity | **658 / 658 self-canonical**, 0 cross |
| robots.txt shadowing sitemap | **0 Disallow rules**, 658/658 crawlable |
| Redirect-stub chains | 23 stubs, **0 two-hop** |
| robots meta token validity | 0 invalid tokens, 0 robots-vs-googlebot conflicts |
| Internal links | **35,025 `<a>` · 0 broken targets · 0 broken fragments · 0 http-scheme self-links** |
| JSON-LD | **2,296 nodes**, 0 parse errors — Article 572 / FAQ 650 / Q-A 3,117 / breadcrumb 757 / HowTo 47 / steps 247 |
| JSON-LD interiors | 0 (required + recommended fields, Q/A integrity, breadcrumb contiguity, HowTo step types) |
| Image alt | **1,920 / 1,920 described**, 0 missing, 0 placeholder |
| og/twitter/LD image targets | 0 missing, 0 non-absolute |
| `headline` vs Google's 110-char cap | 0 / 470 |
| Title · h1 · meta description | 0 missing / duplicate / out-of-range / multiple / soft-404 |
| `<meta charset>` | 784/784, one variant `utf-8`, all within the first 1024 bytes |
| `<html lang>` | 784/784, one variant `en`, valid BCP-47 |
| `<base href>` | **0** |
| Thin content (<150w) | **0 / 658**, bucketed by family first (median 1,927w; articles min 1,456w) |
| Local asset references | 1,227 CSS + 819 JS + 1,920 img, **0 missing** |
| Tag balance · duplicate ids | 0 · 0 |

## Known, not defects

- **19 duplicate canonicals** — the redirect-stub convention, unchanged.
- **`education/index.html` at 353KB** — the hub renders all ~430 article cards statically and filters
  with `display:none`. Architectural, an editorial call.

## Carried forward (needs Michael)

- Sitemap **not downloaded by Google since April** — 658 live vs 97 announced. GSC token scope is
  `webmasters.readonly`, so a resubmit cannot be automated.
- **`http://` variants indexed** — unverifiable in an unattended run (`web_fetch` provenance rule and
  browser-pane approval both block live HTTP with nobody present).
- **Live edge cache not verified** for this push, same reason. Git layer only.
- 136-page `lastmod` / `dateModified` historical backlog — all-or-none call.
