# Functionality Validation — 2026-09-09

**Scope:** fresh clone of `origin/live` @ `8b257e0e0` (2026-09-09), 772 HTML pages, rendered in Chromium over a local HTTP server.
**Result: no broken functionality found. Nothing fixed, nothing pushed.**

---

## Verdict by axis

| Axis | Denominator | Result |
|---|---|---|
| Page load | 772 | 772 OK, 0 load errors |
| Uncaught JS exceptions | 772 | **0** |
| Failed local (same-origin) requests | 772 | **0** |
| Broken images (`naturalWidth===0`) | 772 | **0** |
| Internal links resolve | 30,297 | **0 broken** |
| Asset refs (img/script/link/source) | 772 pages | **0 broken** |
| Empty `href` / dead `#` CTAs / missing fragments | 39,223 anchors | **0** |
| Nav + hamburger present | 772 | 772 OK |
| localStorage available | 772 | 772 OK |
| Formspree forms POST correctly | 151 pages | **151/151** |
| Dead forms (submit → no request) | 151 | **0** |
| Forms invalid after filling required | 151 | **0** |
| Review system (open → rate → write → save) | 51 state pages | **51/51** |
| Search filter + clear/restore | 51 state pages | **51/51** |
| Undefined `onclick` handlers | 772 | **0** |

## What was exercised, not just grepped

- **Forms.** For each of the 151 Formspree pages: filled every `[required]` control with valid data, confirmed `checkValidity()` passed, clicked the real submit button, and captured the outbound request. All 151 produced a genuine `POST`. Endpoint split: `mojpyqdo` ×150, `xzdkybrw` ×1 — both correct. **No data was actually sent** — formspree.io was intercepted at the network layer and served a synthetic `200`.
- **Review system.** On all 51 state pages: clicked the *per-card* review button (not a global one), confirmed the modal opened, set a 5-star rating, filled the textarea, submitted, and confirmed the review persisted under the `swimSchoolReviews` localStorage key and the modal closed.
- **Search.** Confirmed button-driven (not live-filter): typed a no-match query, clicked the search button, confirmed the card set shrank or a no-results block appeared, then confirmed clear restored the original count.
- **Pool barrier self-check tool.** 44 inputs filled, `#pbsc-go` clicked, produced a real scored result ("4 items to fix and 2 to verify…").

## Three things that looked like defects and are not

1. **`jobs/post.html` — form with no `action`, no `name` attributes, 9 required fields.** It has a submit handler that `preventDefault()`s, saves a draft to sessionStorage, and redirects to the working aquatic-jobs form. Intentional.
2. **52 `reviewText` textareas marked `required` with no `name`.** Read by `getElementById` into localStorage; no form submission involved, so `name` is not needed.
3. **`advertise.html` and `gear.html` — Formspree form present in HTML but absent from the rendered DOM.** Both are `meta refresh` redirect stubs. Checked the destinations (`/advertise/`, `/gear/`) — both carry **field-for-field identical** forms. No drift.

## Not covered this run — stated plainly

- **Live site not verified.** Browser access to waterwisekids.com was declined (scheduled run, nobody present to approve). Findings describe the clone of `origin/live`, which is the deployed source — not the edge-cached response users receive.
- **Formspree inbox delivery not tested.** Wiring is proven; actual receipt is not.
- **Jobs API still unverified.** `script.google.com/…/exec` could not be fetched (URL not in fetch provenance set). The `Failed to fetch jobs` error on `/aquatic-jobs/` reproduced locally, but only because the probe blocks external hosts — so this run neither confirms nor clears it. **Remains the open item: Apps Script access must be set to "Anyone".** Needs Michael.
- **Chromium only.** No Safari/Firefox pass.

## Baseline drift to note

Formspree form count moved **154 → 155** since 09-08 (`mojpyqdo` 153→154). Consistent with one new form shipping; all endpoints still correct and `_gotcha` honeypots all clean.

## Canary agreements (probe calibration held)

- Internal links checked: **30,297** — exact match to the prior baseline.
- Directory cards rendered: **770** — exact match to the known 770-row directory.
- Page count: **772**.
