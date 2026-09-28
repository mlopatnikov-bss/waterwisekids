# Functionality Validation — 2026-09-10

**Corpus:** `origin/live` @ `3e0409b` — 774 HTML pages, 1354 tracked files.
**Verdict:** No code defects found. **Nothing pushed** (no fix was warranted).
**One real user-facing outage confirmed — not fixable in site code:** the Aquatic Jobs API.

Every sweep below was **canary-gated**: a known-bad input was injected first to prove
the probe can actually see the defect it reports. Three "findings" turned out to be
probe artifacts and were withdrawn (documented at the bottom).

---

## Results

| Surface | Denominator | Result |
|---|---|---|
| Internal links / 404s | 33,989 hrefs across 774 pages | **0 broken** |
| CTA buttons | 1,985 `cta`/`btn`-classed anchors | **0 dead** (no `#`, empty, or `javascript:`) |
| Formspree forms | 152 pages / 156 forms | **152/152 post exactly once via `fetch`** |
| JS-only forms | 3 (self-check, job post, job board) | 2 healthy, 1 blocked by the API outage |
| JS console errors | 280 pages sampled | **0 errors, 0 failed first-party requests** |
| Review system | 2 state pages (23 + 119 cards) | **Full pass**, incl. reload persistence |
| Search / filter | 4 surfaces + 95 categories | **All pass, 0 dead categories** |
| Redirect stubs | 23 meta-refresh stubs | **All 23 targets resolve** |

### Detail

**Links.** Resolver handles root-relative, bare-relative, directory-index, and
absolute `waterwisekids.com` forms, with `<script>`/`<style>`/comments masked.
Canary: 5 synthetic bad hrefs all caught, 5 known-good shapes all passed.

**Forms.** Route-intercepted `**/formspree.io/**` and classified on
`resource_type` — `fetch`/`xhr` = healthy AJAX, `document` = native POST
fall-through (which would break on-page printable delivery), none = dead form.
Canary distinguished all three. Every one of the 152 pages posts once, via `fetch`.

**Reviews** (localStorage). Drove the real user path — `.school-card .review-btn`
→ modal opens titled for the correct school → 4-star click registers 4 → text →
submit → confirmation. Stored under `swimSchoolReviews` keyed by a **real school id**
(`British Swim School of Bensalem-PA`, `…Houston-TX`) — **no `null` key** — card
re-renders with rating and text, and **survives reload**. Passed on both PA and TX.

**Search.** PA state page (button-driven): 23 → school "British" 5 → city
"Philadelphia" 1 → nonsense 0 with empty state + Clear → back to 23 → Enter-key
"Goldfish" 10. Education (live filter): 367 → drowning 35 → floaties 3 → nonsense 0
→ clear 367; **95/95 categories return results, 0 dead**. Hub hero handoff:
Houston + Texas → `texas.html?city=Houston` → 8 cards (0 cards on the hub itself is
correct by design). State index: 51 `.state-link`.

**Reachability.** 24 pages are unreachable by link-walk from `/`. All 24 are
**intentional**: 23 are legacy-URL redirect stubs (0s meta-refresh + canonical
pointing to the live destination, all targets verified to resolve), and `404.html`
is correctly `noindex` + self-canonical. Not a defect.

---

## Needs Michael — Aquatic Jobs API still down

`/aquatic-jobs/` cannot load or post jobs. Verbatim from the rendered console:

> Access to fetch at `https://script.google.com/macros/s/AKfycbx…` … blocked by
> CORS policy — No 'Access-Control-Allow-Origin' header
> `Failed to fetch jobs: TypeError: Failed to fetch at loadJobs`

Unchanged since 2026-06-12. An Apps Script web app deployed as **"Anyone"** returns
`Access-Control-Allow-Origin: *` automatically; the header's absence means the
deployment is access-restricted and redirects to a Google sign-in page.

**Fix (Google console only, no site change):** redeploy the Apps Script with
*Execute as: Me* + *Who has access: Anyone*, then paste the new `/exec` URL into
`aquatic-jobs/index.html`. Do **not** work around it with a CORS proxy or
`mode:'no-cors'` — the response becomes unreadable.

The front end degrades gracefully (fallback copy + gmail address, no crash), and
this remains the **only** console error anywhere on the site.

---

## Withdrawn — probe artifacts, not site defects

1. **`swim-schools/add.html` "zero-post."** Reproduced across runs, so the usual
   race test cleared it — but it was still false. The form has a `type="url"` field;
   my synthetic fill wrote `"probe"` into it, so `requestSubmit()` failed constraint
   validation and fired no submit event at all. Real click + valid data → posts once
   via `fetch`. Probes must now fill **by input type** and assert
   `form.checkValidity()` before submitting.
2. **`tools/pool-barrier-self-check.html` "submits natively and loses answers."**
   The form has **no submit control** — only `type="button"` elements bound on
   `click`. Forcing `requestSubmit()` fabricated a navigation no user can trigger.
   Real path: click `#pbsc-go` → results render, URL unchanged.
3. **`index.html` "failed asset."** The GA4 beacon's `dl=` param embeds the local
   page URL, so a `"127.0.0.1" in url` substring filter matched a third-party
   request. Fixed by classifying on parsed hostname.

Also verified as healthy, not broken: `jobs/post.html` has no API call by design —
it saves a `jobPostDraft` to `sessionStorage` and hands off to `/aquatic-jobs/#post-job`,
which does read that draft back.

---

*Method note:* probing this endpoint with python/urllib is prohibited by the
environment's content-fetching rules; the rendered-console evidence above is the
correct and sufficient signal.
