# CSS / visual regression — 2026-09-15 (second run)

**Tree audited:** `origin/live` @ `c45b07a` — **unchanged** since the 09-15 08:38 PT run.
**Corpus:** 780 html − 23 meta-refresh stubs = **757 live pages**, 12 stylesheet families.
**Shipped to `live`: nothing.** No site defect found.
**Probe changed:** `.deploy/probes/gv_lib.py` (region list) — saved to the mount, not committed.

---

## 1. Why this run did not repeat the morning battery

`git ls-remote` put `refs/heads/live` at `c45b07a8f0bd…` — byte-identical to the
commit audited 35 minutes earlier and reported CLEAN. Re-running the same battery
against the same bytes would have produced the same answer at full cost, so the run
was pointed at the two items the morning report listed under **"Not verified"**.

| Morning gap | This run |
|---|---|
| Live edge spot-check blocked (`web_fetch` refused the URL) | **Still blocked** — Chrome extension not connected, and browser-pane access to `waterwisekids.com` was declined (no one present to approve). Edge freshness remains unmeasured. |
| 390 / 834 grouped variance + chrome battery **sampled (162/757)**, only 1280 was full-corpus | **Closed** — 390, 834 and 1280 all enumerated at **757/757, 0 render errors**. |

---

## 2. Result — grouped variance is viewport-invariant

Per-page multi-bucket sweep (one computed-style bucket per component; `gv_lib.py`
region/state exemptions), 757 pages × 3 viewports, 0 errors.

| Viewport | Pages with >1 bucket | Distinct keys |
|---|---|---|
| 390 | 197 / 757 | 33 |
| 834 | 197 / 757 | 34 |
| 1280 | 197 / 757 | 34 |

- The **flagged page set is identical at all three widths** (same 197 pages).
- 834 and 1280 key sets are **identical**.
- My 1280 figure (197 pages / 34 keys) **independently reproduces** the morning
  run's headline from a separate clone and probe build.
- Exactly **one** key broke invariance: `body>.hero-actions::A.button-secondary`,
  present at 834/1280 and absent at 390, on **one page** — `find-swim-lessons.html`.

That one key turned out to be a probe artifact, below.

---

## 3. The one candidate, and why it is not a defect

`find-swim-lessons.html` carries three `.hero-actions` blocks. The secondary button
in the first one computes **white** at ≥834 and **mid-blue `rgb(3,105,161)`** at 390,
while its two in-content siblings stay blue at every width.

Measured what it sits on:

| Width | `section.hero` background | `.button-secondary` colour | Verdict |
|---|---|---|---|
| 1280 / 834 | `linear-gradient(135deg, #0c4a6e, #0369a1)` (dark) | white | correct |
| 390 | `#ffffff` (light) | `#0369a1` | correct |

**The hero background and the button colour flip together at the mobile band.** Both
states are legible on their own background; there is no contrast regression. Not a
defect — nothing to fix, nothing pushed.

Note the trap: the hero is gradient-painted, so its `background-color` computes
`rgba(0,0,0,0)`. A probe reading only `background-color` would have called this
white-on-white. That is [[gradient_reads_as_transparent_background_color]], found
this morning and already patched into `PROPS`; it bit again here in the
*triage*, not the sweep.

---

## 4. Real finding — the probe's region list was under-scoped

Why was a correctly-themed hero button flagged at all? `gv_lib.REGIONS` contained
`.page-hero` but **not `.hero`**. The hero ships under several class names:

| class token | pages |
|---|---|
| `.page-hero` | 193 (in REGIONS) |
| `.hero` | 7 (**absent**) |
| `.fwsp-hero`, `.tools-hero`, `.pbsc-hero` | 1 each (**absent**) |

On those 10 pages a dark-themed hero component was bucketed against its light
in-content siblings, so the dark/light split read as drift. The same gap produced
`body::SPAN.kicker` — measured as white on `section.hero` and `section.cta`,
blue inside `.soft-card` / `.band`.

This is the **"same furniture under two class names"** shape again — the one that
put `.related-articles` (514) next to bare `.related` (314).

**Fix applied to the probe** (adds `.hero`, `.fwsp-hero`, `.tools-hero`,
`.pbsc-hero`, `.cta`, `.band`, `.soft-card` to `REGIONS`), then re-swept the full
corpus at 1280 to confirm:

```
BASE regions @1280: 197/757 pages, 34 keys
EXT  regions @1280: 196/757 pages, 30 keys
removed: body::SPAN.kicker, body>.hero-actions::A.button,
         body>.hero-actions::A.button-secondary, body>.hero-actions::DIV.hero-actions
added:   (none)
```

Adding a region can only make a component identity **more** specific, so the pass is
monotonically FP-reducing — it cannot mask a real divergence. Nothing was added, one
page dropped out, and **with the corrected list the key set is the same at 390, 834
and 1280.**

**Corrected baseline: 196/757 pages, 30 keys, all previously documented design intent.**

---

## 5. Not verified

- **Edge freshness / live-served HTML.** Two independent browser paths refused;
  everything here is `origin/live` HEAD rendered locally over HTTP. If the
  Cloudflare edge is stale, this run would not see it —
  [[directory_hub_serves_a_stale_edge_cache]] is the known precedent.
- **No screenshots were taken.** The task asks for them; both browsers were
  unavailable, so the visual axes were measured numerically (computed style +
  geometry) instead. For an approved run, granting the browser pane access to
  `waterwisekids.com` once would restore the image-based check.
- The **chrome battery** (footer rail, variant counts, cache-bust, overflow) was
  **not** re-run — it was full-corpus clean this morning on identical bytes.

---

## 6. Sandbox note for the next run

`mcp__workspace__bash` is capped near **180 s** regardless of the `timeout_ms`
requested, so a 757-page sweep must be chunked at ~250 pages per call. `gv_sweep.py`
appends per page, so it resumes cleanly from a page-key diff after a kill.

`/sessions` is at **100%** (other sessions' data; my own tree is 352 MB). Work in
`/tmp` — and `TMPDIR=/tmp` must be exported **at browser launch**, not only at
install time, or `chromium.launch()` dies `ENOSPC mkdtemp '/sessions/…/tmp/…'`
even though the install itself succeeded.
