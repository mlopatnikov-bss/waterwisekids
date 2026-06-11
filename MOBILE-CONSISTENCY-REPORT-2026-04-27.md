# Mobile Consistency Report — 2026-04-27

Automated daily mobile audit of waterwisekids.com (live branch).

## Scope
- 459 HTML files audited
- 447 active pages + 12 redirect stubs

## Results: PASS — no fixes required

| Check | Status | Notes |
|---|---|---|
| `<meta name="viewport" width=device-width>` | PASS | 459/459 pages |
| `user-scalable=no` / `maximum-scale=1` anti-pattern | PASS | 0 instances |
| Mobile nav (`m-app.js` via `main.js` loader) | PASS | 447/447 active pages load it; 12 missing pages are all redirect stubs |
| Fixed-width layout containers | PASS | All matches were `max-width:` (not `width:`); shrink correctly on mobile |
| Fixed-width images that could overflow | PASS | Global `img { max-width: 100% }` rule in main.css covers all `width="600"` article-card images |
| Horizontal-overflow body/html rules | PASS | None found |
| Tiny inline font-sizes (<13px) | PASS w/ note | 4 pages (advertise, swim-schools, jobs, teens) use 11–12px on badges/labels (POPULAR, VERIFIED, NEW, HOT) and on the 50-state filter pills. Decorative labels are non-interactive — fine. State pills have ~28px tap height; just under WCAG AA's 24px minimum but below Apple's 44px ideal. Not auto-fixing — intentional design choice for the dense state directory. |
| Live HTTP status spot-check | PASS | 200 on /, /education/, /swim-schools.html, /jobs.html |
| Fixed-width tables | PASS | None |

## Notes
- Workspace at `/Users/bss/Documents/Claude/Projects/WATERWISEKIDS.COM` was mid-rebase and stale. Audit performed against fresh `live`-branch clone per memory protocol (`deploy_never_copy_stale_workspace`).
- No changes pushed — site is mobile-clean.

## Optional follow-up (not blocking)
The 50-state filter pills on `/swim-schools.html` use 8px×14px padding + 12px font (~28px tall). If a future tap-target audit fails, bump to padding `10px 14px` and font 13px to clear 32px target.
