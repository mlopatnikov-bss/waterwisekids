# Functionality validator — 2026-09-24

Target: `origin/live` @ `cc2189c`, 808 HTML pages, headless Chromium over local HTTP, plus live checks on www.waterwisekids.com.
**Result: all clean. Nothing fixed, nothing pushed.**

| Axis | Result |
|---|---|
| Console (808 pages) | 0 uncaught page errors, 0 local 4xx, 0 broken images, 0 undefined `onclick`, 0 dead CTA hrefs. The only console error is the known Aquatic Jobs one |
| Internal links | 37,592 internal anchors (of 43,263): 0 broken targets, 0 broken fragments, 0 `http://` self-links. 24 redirect stubs resolved against their final URL |
| Forms | 166 Formspree forms, all OK: exactly 1 fetch POST, no page navigation, email in the payload. 163 signup forms mirror to MailerLite with the correct email; 3 inquiry forms correctly skip. All honeypots left empty. Endpoints: 165 `mojpyqdo` + 1 `xzdkybrw` |
| Static guard | 94 files with `data-formspree-inline="1"`: every one has an inline `fetch(` handler |
| Reviews + search | 52/52 directory pages OK (search filter, no-results, clear, review modal, 4-star save, survives reload). Hub: AL→7, houston→8 |
| Hamburger nav | 10/10 across template families, including today's new page `/education/how-to-teach-a-child-to-swim.html` |
| Tools | pool-barrier self-check → 1,079-char result + print button; family water safety plan → 2,547 chars + print button; URL unchanged |
| Cache-bust | 0 unversioned local CSS/JS, 1 token per asset (14 assets); no JS/CSS changes since 09-22. Live serves `main.css`/`main.js` `?v=20260921a` |
| Live 404 | Returns a real 404 status with the branded "Page Not Found \| WaterWiseKids" page |

Canary checks (deliberately broken test pages) all fired before each axis was trusted: console ×5, links ×3, forms ×3 (main.js stripped / no submit button / bare native form), reviews ×3 (search no-op / setItem removed / null school id).

## Open item needing Michael: Aquatic Jobs board (13th check)
Live `/aquatic-jobs/` still fails with a CORS block from the Google Apps Script endpoint (`AKfycbxccVXU…`, unchanged since 09-06). The page handles it well: 0 page errors, the "Unable to load jobs" message and the waterwisekids.com@gmail.com fallback both show, and the search, filter and post controls still work.
**Fix (only Michael can do this):** in Apps Script, redeploy the web app with *Execute as: Me* and *Who has access: Anyone*, then put the new `/exec` URL into `aquatic-jobs/index.html`.

Not covered: status codes of external links, Formspree inbox delivery, a real MailerLite subscription, and browsers other than Chromium.
