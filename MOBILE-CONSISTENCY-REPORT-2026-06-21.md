# Mobile Consistency Report — 2026-06-21

**Scope:** 539 HTML pages (root, /education/, subdirectories) on live @ a729898
**Method:** DOM + CSS static analysis (BeautifulSoup, no regex false-positives)
**Result:** ✅ PASS — no mobile issues found, no fixes required, no deploy needed.

## Checks performed

| Check | Result |
|---|---|
| Responsive viewport meta (`width=device-width`) | ✅ All 539 pages |
| Hamburger menu markup on nav pages | ✅ All nav pages (`.hamburger`/`.nav-toggle`) |
| Hamburger JS toggle works | ✅ `main.js` toggles `nav.mobile-open`, closes on outside click |
| Touch targets ≥44px | ✅ `min-height/min-width: 44px` on nav toggle (main.css:628) |
| Horizontal overflow guard | ✅ `body { overflow-x: hidden }` (main.css:117) |
| Responsive images | ✅ Global `img { max-width:100%; height:auto }` (main.css:187) |
| Code/pre block overflow | ✅ `overflow-x: auto` on `.article-content pre` |
| Table overflow | ✅ Tables `width:100%` + scroll wrappers (`overflow-x:auto`) |
| Readable mobile font | ✅ 16px base → 14px at ≤480px; tables 0.875rem at ≤768px |
| Media queries present | ✅ 11 in main.css + per-page printable media queries |

## Notes / non-issues
- **13 root pages link no main.css/main.js** (about.html, articles.html, several how-to-* and beginner-swim-lessons-* pages). These are **intentional redirect stubs** — `noindex` + meta-refresh to the canonical `/dir/` version, single line of text + link. Inherently mobile-friendly; no action.
- **21 `*-printable.html` pages** are **self-contained** with their own `printable-poster.css` / `printable-checklist.css`, own viewport, own media queries, hamburger nav, and `width:100%` percentage tables. Verified responsive; no action.
- The 351 inline `max-width:NNNpx` matches are responsive-safe (max-width caps but still shrinks below breakpoint) — not overflow risks.

## Action taken
None required. Report committed for the record.
