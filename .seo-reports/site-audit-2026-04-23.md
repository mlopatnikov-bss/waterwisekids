# Site Auditor — Daily Health Report
**Date:** 2026-04-23
**Branch audited:** `live` @ `7c2235b`
**Pages scanned:** 457 HTML files

## Health Summary

| Check | Result | Status |
|---|---|---|
| Broken internal links | 0 / ~8k refs scanned | PASS |
| Broken asset refs (css/js/img) | 0 | PASS |
| Sitemap integrity (URLs → files) | 438/438 resolve | PASS |
| Files not in sitemap | 18 (all redirect stubs — correct) | PASS |
| JSON-LD blocks parse cleanly | 1064 / 1064 | PASS |
| `<html>`/`<head>`/`<body>` structure | 457 / 457 well-formed | PASS |
| Missing `<title>` | 0 | PASS |
| Missing canonical | 0 | PASS |
| Missing meta description | 0 | PASS |
| Missing viewport meta | 0 | PASS |
| `<img>` missing alt | 0 | PASS |
| Files without main.css | 23 (all intentional: 11 redirect stubs + 11 printable pages + 1 JS-redirect stub) | PASS |
| Oversized HTML (>200KB) | 0 | PASS |
| Oversized JS (>200KB) | 0 | PASS |
| Oversized images (>500KB) | 0 | PASS |
| Placeholder `href="#"` links | 22 occurrences in 3 files | WARN |

## Size Champions (informational)

| File | Size |
|---|---|
| education/index.html | 159 KB |
| swim-lessons/directory/schools-data.js | 105 KB |
| sitemap.xml | 85 KB |
| aquatic-jobs/index.html | 59 KB |
| swimmers-hub/backstroke-complete-guide.html | 49 KB |
| assets/css/main.css | 45 KB |

## WARN: placeholder `href="#"` anchors

These three education pages contain TOC-style links and social share buttons
whose `href` is `#` (no target). Clicking them scrolls to top instead of
navigating. Not a 404 — UX blemish only. Leaving unfixed this run because
fixing requires adding matching `id=` attributes on headings and verifying
heading/TOC text mapping, which should be done with author attention.

- /education/adaptive-swimming-special-needs.html
- /education/intensive-vs-weekly-swim-lessons.html
- /education/swim-level-assessment.html

## Auto-Fixes Applied

None — no broken links, no malformed schema, no missing assets were found.
The site is in clean health. No commit required.

## Coverage Notes

- False positives filtered: 51 `${school.website}` matches inside `<script>`
  blocks on directory pages were correctly identified as JS template literals,
  not broken links.
- Files excluded from scans: `.git/`, `.deploy/`, `AutoDeploy*.app/`.
- Redirect stubs excluded from the "missing main.css" finding because they
  legitimately don't need it (they refresh to canonical).
