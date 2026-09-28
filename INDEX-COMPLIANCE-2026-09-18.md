# Google Index Compliance — 2026-09-18

**Audited:** fresh clone of `origin/live` @ `3ff9e85`
**Shipped:** `22d491ab7` → `live` (62 files, 125 lines)
**Verdict:** compliant. One real defect class found and fixed; every carried-forward axis re-verified at zero.

---

## Census (clean, 0 unexplained)

| | |
|---|---|
| HTML files | 787 |
| `noindex` | 104 (printables + `404.html`) |
| meta-refresh stubs | 23 |
| **primary indexable** | **660** |
| sitemap `<loc>` | **660** |
| drift, either direction | **0** |

---

## Fixed this run

### og:image dimensions contradicted the actual image — 62 pages

61 pages declared `og:image:width=1200` / `og:image:height=630` while the card
image they referenced in `assets/images/cards/` measures **600×360**. Facebook
and LinkedIn use the declared dimensions to reserve the preview box *before*
fetching the image, so the mismatch produces a cropped or blank first-share
render. Corrected to the measured values.

`education/jump-turn-swim-explained.html` was half-converted — `twitter:image`
pointed at its card while `og:image` still pointed at the generic site image.
Aligned `og:image` to the card and corrected its dimensions, matching the
convention the other 62 card pages use.

**After:** 454 primary pages carry a local `og:image`; **0** dimension
mismatches, **0** `og:image` ≠ `twitter:image` disagreements sitewide.

---

## Re-verified at zero

- **Sitemap** — 0 duplicate `<loc>`, 0 wrong-host, 0 URL-with-no-file, 0 indexable-page-missing, 0 noindex-or-stub included. XML well-formed, correct namespace, 132 KB, all 660 `lastmod` well-formed W3C dates, 0 future-dated, all `priority` in range.
- **robots.txt** — `Allow: /`, sitemap declared, blocks nothing indexable.
- **Canonical** — 0 absent, 0 multiple, 0 wrong-host, 0 in `<body>`, 0 self-mismatch, 0 noindex-page-canonicalling-elsewhere. *New axis:* 0 canonicals pointing at a redirect stub or a `noindex` page.
- **Structured data** — 2,305 JSON-LD blocks: 0 unparseable, 0 missing required fields, 0 non-canonical host, 0 Q/A integrity failures, 0 ListItem failures, 0 future or reversed dates, 0 self-URL ≠ page canonical.
- **Titles / meta / h1** — 0 missing titles, 0 duplicate titles, 0 missing meta descriptions, 0 missing or multiple `h1`. *New axis:* 0 duplicate meta descriptions across all 660.
- **Meta description length** — 0 outside 70–160 once HTML entities are decoded. (Raw byte-count flags 17; `&mdash;` is 7 bytes and 1 character. Measure decoded.)
- **Redirect stubs** — all 23: refresh target == canonical == a file that exists.
- **Links** — 37,726 internal references, 0 broken, 0 wrong-host. 0 orphans from `/`, 0 zero-inbound pages.
- **Images** — 1,707 `<img>`, **0** missing an `alt` attribute.

---

## Needs Michael — carried forward

1. **Card images are 600×360, not 1200×630.** This run made the *declaration*
   truthful, which is the correct compliance fix, but 600×360 is below the
   1200×630 Facebook recommends. Regenerating the cards at 1200×630 and
   restoring the declaration is an image-generation job, not an unattended one.
   → 297 more pages have a card sitting unused on disk; rolling `og:image` over
   to them was **deliberately not done** this run, because at 600×360 it would
   be a downgrade from the generic 1200×630 image. Regenerate first, then roll out.

2. **`sitemap.xml` lastmod ahead of `dateModified` — 182 pages** (was 193 →
   199 → 364 → 425 → 439; trending down). Direction still uniformly ahead,
   0 behind; 149 still stuck on the 2026-08-29 batch date.

3. **3 titles over 70 characters** (75–80). The overflow is the ` | WaterWiseKids`
   brand suffix, so Google truncates the brand, not the keyword — low priority,
   and trimming risks the keyword. Editorial call:
   `education/jump-turn-swim-explained.html` (80),
   `education/swim-lesson-teaching-method-worksheet.html` (76),
   `education/swim-team-readiness-scorecard.html` (75).

4. **354 pages where `twitter:title` differs from `og:title`.** Not treated as a
   defect — the corpus has no single convention (272 pages match the title
   exactly, 34 match it minus the brand suffix). Three of them
   (`lake-ocean-safety`, `lightning-pool-safety`, `pool-safety-rules`) also carry
   the old headline in `og:image:alt`, which suggests a genuine stale pair rather
   than deliberate variation — worth an editorial pass.

5. **Live-HTTP axis still unmeasured.** `web_fetch` refuses `waterwisekids.com`
   URLs in scheduled runs (no provenance), and browser `request_access`
   auto-declines with nobody present. The only route left is pasting verbatim
   URLs into the task file — include a **leaf** page, not just a hub.

6. **`git worktree prune --force`** — `/tmp/wwk-wt` is still a dangling locked
   registry entry on the mount. Fifth confirmation. One interactive command.

---

## Probe notes (do not re-derive these from prose)

Four findings this run were **probe artifacts**, not defects. Any rewritten probe
must reproduce these exemptions or it will report false positives:

- **Attribute regex must be quote-aware.** `content=["']([^"']*)["']` truncates at
  apostrophes — it reported a 2-character meta description on a valid page.
  Match the opening quote and read to the *same* character.
- **Decode HTML entities before measuring length.** 17 false "too long" meta
  descriptions and 283 false og/twitter parity failures were `&mdash;`, `&rsquo;`
  and `&amp;` counted as raw bytes.
- **Stub refresh targets are relative, canonicals are absolute.** Normalize both
  before comparing, or all 23 stubs read as broken.
- **JS template literals inside `<script>` look like hrefs.** `${school.website}`
  and `' + STATE_SLUGS[stateFilter] + '` produced 3 phantom broken links.
- **JSON-LD self-URL must be compared to the page's own canonical**, not to the
  page's path. Stubs legitimately carry the *target's* URL; comparing against the
  stub's own path produced 19 phantom failures.
