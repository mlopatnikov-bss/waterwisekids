# Phase 2 evidence packet (P2-R2)

**Prepared by:** Claude (implementation)  **For:** Codex review  **Date:** 2026-11-02
**Scope:** Phase 2 proposal only, under `commercial-poc/proposal/`. Nothing applied; Phase 3 not started.
**Revision:** P2-R2 answers Codex Phase 2 review R2: Featured School blocks are replaced (not left beside the card), all eight pages were audited for other BSS promotion, the disclosure states the no-fee pilot relationship, and new tests run over the fully patched pages.

## 1. Environment and deviations

| Item | Detail |
|---|---|
| `dev-external` wrapper | Not reachable from my shell (a Linux VM that mounts only this worktree, as in Phase 1). No dependency, install or build step exists. Wrapper commands for the Mac are in `README.md`. |
| Git | Not used, as in Phase 1. No commit, push, merge, pull, rebase, reset or checkout. `git apply --check` was run only against temporary copies of the eight pages in the OS temp directory, outside any repository. |
| Node | v22.23.4 (VM) |
| Browser evidence | Playwright + Chromium in a cloud sandbox. The 8 source pages and 9 local assets were copied there; the pages' SHA-256s match the worktree (spot-checked: howell `6ac2395c31df…`, new-york `f5785f02de1c…`). Third-party hosts were blocked, and britishswimschool.com was answered by a local stub. |
| Network | No britishswimschool.com URL (with or without UTMs) was requested in Phase 2. No live WWK URL was requested. |

## 2. Changed paths

All changes are under `commercial-poc/proposal/`. **No file outside `commercial-poc/proposal/` was created or modified in P2-R2**, including Phase 1 files and the public site.

P2-R2 changed: `inventory.config.json` (edit plan + disclosure), `src/{build,udiff,report,dispositions}.mjs`, `scripts/{build-proposal,preview-server,capture-previews}.mjs`, `test/proposal-{diffs,inventory}.test.mjs`, new `test/proposal-patched-pages.test.mjs`, `README.md`, `PROPOSAL.md`, `EVIDENCE.md`, and every generated artefact (`diffs/*`, `INVENTORY.md`, `inventory.json`, `source-snapshot.json`, `evidence/*`). `component/wwk-sponsored.{css,js}` are unchanged.

```
commercial-poc/proposal/README.md
commercial-poc/proposal/PROPOSAL.md
commercial-poc/proposal/EVIDENCE.md
commercial-poc/proposal/INVENTORY.md                     (generated)
commercial-poc/proposal/inventory.json                   (generated)
commercial-poc/proposal/inventory.config.json
commercial-poc/proposal/source-snapshot.json             (generated)
commercial-poc/proposal/component/wwk-sponsored.css
commercial-poc/proposal/component/wwk-sponsored.js
commercial-poc/proposal/diffs/00-new-assets.diff          (generated, not applied)
commercial-poc/proposal/diffs/01-…08-*.diff               (generated, not applied; 8 files)
commercial-poc/proposal/src/{build,udiff,utm,snapshot,report,dispositions}.mjs
commercial-poc/proposal/scripts/{build-proposal,verify-proposal,preview-server,capture-previews}.mjs
commercial-poc/proposal/test/{harness.mjs, client-privacy, client-behavior, proposal-inventory, proposal-diffs, proposal-patched-pages}.test.mjs
commercial-poc/proposal/evidence/{verification.json, test-output.txt}
commercial-poc/proposal/evidence/previews/*.png (19), preview-report.json
```

## 3. Proof that no public file changed

- `source-snapshot.json` records **1,657 public files**, aggregate SHA-256 `34c93ab531b6c0782fd4ffa2fe525ebbcbfccf0bbc3a3a466a66ed867acbede1`. This covers everything outside `commercial-poc/`, `.git`, `node_modules`, `.next`, `.DS_Store` and `._*`.
- `verify-proposal.mjs` and the `proposal-diffs` test recompute the fingerprint. It is identical, and the eight target pages match their recorded SHA-256s.
- Compared file-by-file with the pre-R1 baseline taken before any Phase 1 write, the only difference outside `commercial-poc/` is `docs/commercial-poc/CLAUDE-BRIEF-PHASE2.md`, which Codex added. The `.git` pointer file is excluded from the new fingerprint but was also unchanged.
- No public `.html`, `.js` or `.css` file contains `wwk-sponsored` or `data-wwk-sponsored-card`, which a test checks.
- `assets/css/wwk-sponsored.css` and `assets/js/wwk-sponsored.js` do not exist in the public tree, which is also tested.
- Phase 1 files under `commercial-poc/` (outside `proposal/`) are byte-identical to the end of R3: all 50 files match the SHA-256 list taken before Phase 2 began. The Phase 1 suite still passes 111/111.

## 4. Tests, build and static checks

| Check | Result |
|---|---|
| `node proposal/scripts/build-proposal.mjs --check` | ok: all 12 artefacts match a fresh in-memory build |
| `node --check proposal/component/wwk-sponsored.js` | ok |
| `node --test 'proposal/test/*.test.mjs'` | **54/54 pass**, 0 skipped (`evidence/test-output.txt`) |
| `node scripts/static-checks.mjs`: Phase 1 lint, secret scan and PII scan, also covering `proposal/` | exit 0, 81 files, 0 findings |
| Phase 1 suite `node --test 'test/*.test.mjs'` | **111/111 pass** (unchanged) |
| `node proposal/scripts/verify-proposal.mjs` | `ok: true` (`evidence/verification.json`) |

Each brief requirement maps to tests (`evidence/test-output.txt` has the full list):

| Brief requirement | Test(s) |
|---|---|
| No public source file changed | `no public source file changed…`, `the proposal is not applied anywhere in the public tree` |
| Proposed IDs, pages and destinations are in the manifest and tenant-owned | `every proposed ID, page and destination exists in the manifest…` |
| Sponsored anchors are labeled and carry the required `rel` | `every sponsored anchor is inside a labeled card…` |
| No held location promoted or linked | `no held location is promoted, named or linked…` |
| Tracking doesn't cancel navigation | `clicks: … never cancels navigation`, the 7 `transport failure swallowed …; links still work` tests, `harness self-check …` |
| Viewability is once per page view, with threshold and duration | 5 `viewability:` tests (≥ 50%, 1 continuous second, interruption restarts, once per page view with observer released, hidden tab pauses, no IO means no guess) |
| Schema shape, allowlisted paths and hosts, UTMs, no PII or storage | `schema: every event from every proposed card is accepted by the Phase 1 collector`, `schema: … non-allowlisted host is rejected`, `privacy: …` (×3), `client static scan …`, `client is completely inert without a valid collector URL`, `client refuses cards …`, UTM assertions in the anchor test |
| Beacon and fetch failures swallowed; links still work | 7 `transport failure swallowed (beacon=…, fetch=…)` tests, no unhandled rejections |
| Diffs apply and reverse cleanly, never against the worktree | `each page diff applies strictly IN MEMORY, reverses to the exact source, and changes only audited lines` (also refuses a drifted line), `GNU patch: --dry-run …, and apply + reverse round-trips, on a temporary copy only`, `git apply: --check …, and apply + -R round-trips, on a temporary copy only`, `committed diff files equal a fresh in-memory build`, `new-asset diff creates exactly the two component files`, `the build refuses drifted, duplicated or missing expected source text` |
| **R2-1** Card replaces the whole Featured School block | `six Featured School pages: the card REPLACES the whole old block in place`, `patched pages: no .featured-school block remains` |
| **R2-2** One disclosed sponsored module per page; other BSS promotion neutralized; editorial navigation kept; Toms River links neutralized | `patched pages: exactly one labeled sponsored-pilot card and one disclosure per page`, `patched local pages: outside the card there are no stars, ratings, review counts, offers, unsupported claims or BSS mentions/links` (with a self-check that each scan fires on the unpatched sources), `editorial internal navigation is preserved; only /british-swim-school/ promo links are removed` (includes the Toms River checks), `audit records every changed promotional item…` |
| **R2-3** Exact disclosure, no price | `patched pages: exactly one labeled sponsored-pilot card and one disclosure per page` (exact text; no price pattern) |
| **R2-4** No external BSS link outside the card except the NY organic listing | `New York: the only BSS links outside the card are the pre-existing organic directory ones, byte-for-byte`, `patched local pages: …` (`bss_external` scan) |
| Organic order and content unchanged | `New York directory: card sits outside #schoolsList and the organic listing order is unchanged`, `organic directory order and content unchanged; other-option listings unchanged on every page` |
| Structured data stays valid and consistent | `structured data still parses on every patched page, and Cheltenham FAQ JSON-LD matches the visible FAQ` |
| Copy rules | `card copy makes no unsourced claims…`, `works without JavaScript…` |

The client is tested by running the **real** `component/wwk-sponsored.js` in a Node `vm` context:
- It gets a fake DOM, fake timers, an `IntersectionObserver` and transports.
- Proxies record any access to `document.cookie`, `localStorage`, `sessionStorage`, `navigator.userAgent`, `location.pathname/search/href`, `history`, `screen` and similar.
- A self-check test proves these guards fire on a deliberately bad script.

## 5. Proposed diff summary

| Diff | Target | Card | Audited edits | Hunks | Lines +/− | Sponsored links | Proposed sha |
|---|---|---|---|---|---|---|---|
| `00-new-assets.diff` | `assets/css/wwk-sponsored.css`, `assets/js/wwk-sponsored.js` | n/a | n/a | 2 | 2 new files (unchanged from P2-R1) | n/a | n/a |
| `01-swim-lessons-northwest-philadelphia.diff` | `swim-lessons/northwest-philadelphia.html` (sha `910f73997fe2…`) | card replaces lines 168–185 | 4 | 4 | +20 / −22 | 2 | `66e13e72c510…` |
| `02-swim-lessons-cheltenham-pa.diff` | `swim-lessons/cheltenham-pa.html` (sha `2c9399af052f…`) | card replaces lines 204–220 | 12 | 9 | +25 / −29 | 2 | `5a0a379d2f7d…` |
| `03-swim-lessons-philadelphia.diff` | `swim-lessons/philadelphia.html` (sha `a72b5b678f39…`) | card replaces lines 209–226 | 1 | 1 | +16 / −18 | 2 | `12eb3fa648be…` |
| `04-swim-lessons-jersey-shore.diff` | `swim-lessons/jersey-shore.html` (sha `ee01a298bd83…`) | card replaces lines 188–204 | 2 | 2 | +19 / −18 | 4 | `ad167ff9308e…` |
| `05-swim-lessons-howell-nj.diff` | `swim-lessons/howell-nj.html` (sha `6ac2395c31df…`) | card replaces lines 187–203 | 2 | 2 | +15 / −19 | 2 | `82eb0e59ac04…` |
| `06-swim-lessons-brick-nj.diff` | `swim-lessons/brick-nj.html` (sha `4fd7d4a7c906…`) | card replaces lines 182–198 | 2 | 2 | +15 / −19 | 2 | `807dbeea89ee…` |
| `07-swim-lessons-toms-river-nj.diff` | `swim-lessons-toms-river-nj.html` (sha `35322587a7fe…`) | card inserted before line 133 | 6 | 3 | +17 / −4 | 2 | `ccd4e63b0eba…` |
| `08-swim-lessons-directory-new-york.diff` | `swim-lessons/directory/new-york.html` (sha `f5785f02de1c…`) | card inserted before line 629 | 1 | 1 | +22 / −0 | 8 | `73416d8697e4…` |

- Every removed or changed source line belongs to an audited edit in `inventory.config.json`, and a test enforces this.
- Each edit names the exact source text it expects; the build refuses drifted, duplicated or missing text.
- Each diff reverses to the exact source, both in memory and with `patch -R` / `git apply -R`.
- All nine diffs pass `patch --dry-run --forward -p1` with no offset or fuzz, and `git apply --check`. Real apply-then-reverse round trips ran only in OS temp copies outside any repository.
- The New York diff is still a pure insertion: removing the card restores the source byte-for-byte.

**Audit totals:**
- 28 promotional items changed: 6 Featured School blocks replaced by the card, plus 22 neutralized.
- 2 card insertions (Toms River and New York).
- 23 items reviewed and kept (editorial, editorial navigation, or NY organic directory).

Each item is listed per page in `INVENTORY.md` with its line(s), classification, finding and action.

## 6. UTM examples

- Howell location card: `https://britishswimschool.com/jersey-shore/location/la-fitness-howell/?utm_source=waterwisekids&utm_medium=sponsored_pilot&utm_campaign=cmp_88f0a7279a2972e2&utm_content=plc_bb4b763cf97d56ee`
- Cheltenham location card: `https://britishswimschool.com/northwest-philadelphia/location/la-fitness-cheltenham/?utm_source=waterwisekids&utm_medium=sponsored_pilot&utm_campaign=cmp_e4ca517dbb784119&utm_content=plc_759c890d4a301219`
- Manhattan territory link: `https://britishswimschool.com/manhattan/?utm_source=waterwisekids&utm_medium=sponsored_pilot&utm_campaign=cmp_c7fea2983961d658&utm_content=plc_10e8497ef216c69d`

## 7. Render, keyboard and no-JS evidence (real Chromium)

Report: `evidence/previews/preview-report.json` (regenerated for P2-R2). Every screenshot is clipped around the card. On the six replacement pages it now shows the card where the Featured School block was, followed by the page's next section; the old block is gone. The preview server injects a preview-only ribbon ("PROPOSAL PREVIEW (local only, not live)") at the top of the page and a loopback `data-wwk-collector`. Neither is in the diffs.

**Rendered-DOM checks (new in P2-R2), all 16 page views:**
- Exactly 1 sponsored card and 1 "Sponsored pilot" label.
- 0 `.featured-school` / `.featured-badge` elements.
- 0 visible stars outside the card.
- 0 britishswimschool.com links outside the card on the seven local pages.
- On New York, the 3 pre-existing organic directory links are outside the card, none tagged or `rel=sponsored`.

| Screenshot | Page | Viewport | Horizontal overflow (px) | Console errors |
|---|---|---|---|---|
| `evidence/previews/01-swim-lessons-northwest-philadelphia-desktop.png` | `/swim-lessons/northwest-philadelphia.html` | 1280x900 | 0 | 0 |
| `evidence/previews/01-swim-lessons-northwest-philadelphia-mobile.png` | `/swim-lessons/northwest-philadelphia.html` | 390x844 | 0 | 0 |
| `evidence/previews/02-swim-lessons-cheltenham-pa-desktop.png` | `/swim-lessons/cheltenham-pa.html` | 1280x900 | 0 | 0 |
| `evidence/previews/02-swim-lessons-cheltenham-pa-mobile.png` | `/swim-lessons/cheltenham-pa.html` | 390x844 | 0 | 0 |
| `evidence/previews/03-swim-lessons-philadelphia-desktop.png` | `/swim-lessons/philadelphia.html` | 1280x900 | 0 | 0 |
| `evidence/previews/03-swim-lessons-philadelphia-mobile.png` | `/swim-lessons/philadelphia.html` | 390x844 | 0 | 0 |
| `evidence/previews/04-swim-lessons-jersey-shore-desktop.png` | `/swim-lessons/jersey-shore.html` | 1280x900 | 0 | 0 |
| `evidence/previews/04-swim-lessons-jersey-shore-mobile.png` | `/swim-lessons/jersey-shore.html` | 390x844 | 0 | 0 |
| `evidence/previews/05-swim-lessons-howell-nj-desktop.png` | `/swim-lessons/howell-nj.html` | 1280x900 | 0 | 0 |
| `evidence/previews/05-swim-lessons-howell-nj-mobile.png` | `/swim-lessons/howell-nj.html` | 390x844 | 0 | 0 |
| `evidence/previews/06-swim-lessons-brick-nj-desktop.png` | `/swim-lessons/brick-nj.html` | 1280x900 | 0 | 0 |
| `evidence/previews/06-swim-lessons-brick-nj-mobile.png` | `/swim-lessons/brick-nj.html` | 390x844 | 0 | 0 |
| `evidence/previews/07-swim-lessons-toms-river-nj-desktop.png` | `/swim-lessons-toms-river-nj.html` | 1280x900 | 0 | 0 |
| `evidence/previews/07-swim-lessons-toms-river-nj-mobile.png` | `/swim-lessons-toms-river-nj.html` | 390x844 | 0 | 0 |
| `evidence/previews/08-swim-lessons-directory-new-york-desktop.png` | `/swim-lessons/directory/new-york.html` | 1280x900 | 0 | 0 |
| `evidence/previews/08-swim-lessons-directory-new-york-mobile.png` | `/swim-lessons/directory/new-york.html` | 390x844 | 0 | 0 |
| `evidence/previews/nojs-swim-lessons-howell-nj-desktop.png` | `/swim-lessons/howell-nj.html`, JavaScript disabled | 1280x900 | n/a | n/a |
| `evidence/previews/nojs-swim-lessons-directory-new-york-desktop.png` | `/swim-lessons/directory/new-york.html`, JavaScript disabled | 1280x900 | n/a | n/a |
| `evidence/previews/keyboard-focus-howell-desktop.png` | `/swim-lessons/howell-nj.html`, keyboard focus on card link | 1280x900 | n/a | n/a |

**No-JS.** With JavaScript disabled, both cards render visibly with the label "Sponsored pilot". Their links are plain `rel="sponsored noopener"` hrefs, and clicking navigated to the exact tagged URL. The collector received **0** events.

**Keyboard.**
- Tab reaches the card's two links in DOM order (Howell location page, then the Jersey Shore website).
- Each shows a `solid 3px rgb(245, 158, 11)` focus outline.
- Enter navigated to the exact tagged URL in 37 ms (local stub).

**Navigation under collector failure.** On the Manhattan card's first link:

| Collector | Landed on exact href | Click to navigation |
|---|---|---|
| Healthy | yes | 74 ms |
| Network abort | yes | 63 ms |
| HTTP 500 | yes | 70 ms |
| Never responds | yes | 60 ms |

No page errors in any mode.

**Events from real Chromium**, validated by the Phase 1 `validateEvent` with the preview host allowlisted:
- **During the 16 screenshot page views:** 32 events, all valid (16 `eligible_view`, 16 `viewable_impression`), across 16 distinct page-view IDs.
- **During the keyboard and healthy-navigation runs:** 7 events, all valid.
- **All requests:** content type `text/plain;charset=UTF-8`, and no `Cookie` header was seen.
- **Keys seen:** only schema v1 keys.

**Finding during the run:** with the preview served at `http://127.0.0.1`, the Phase 1 collector rejected every event as `pii_value`, because an IPv4-shaped `site_host` looks like an IP address. That is the correct, conservative behaviour. The preview now uses `http://localhost`, and staging hosts must be named (see `PROPOSAL.md` §6.5).

## 8. Component and tracking design, inventory, audit, release blockers

See `PROPOSAL.md` §1–§5 and `INVENTORY.md`.

**RB-1, RB-2 and RB-3 are resolved by the proposal:**
- RB-1: Featured School blocks are replaced in place.
- RB-2: the disclosure on every card reads "No-fee pilot placement. WaterWiseKids may offer paid sponsored placements in the future. Sponsorship does not change directory order or editorial content."
- RB-3: Toms River's unlabeled BSS hero sentence, Next-step button and School-website sidebar card are removed.

**Still open and visible:**
- Source conflicts C01–C10.
- Phase 3 prerequisites:
  - P3-1: collector endpoint (the client ships inert).
  - P3-2: real campaign dates (the fixture window ends 2026-11-30).
  - P3-3: cross-browser and real-device QA plus a screen-reader pass.
  - P3-4: release decision, including the GA4 `.featured-school` classifier that will no longer match.

**Items for reviewer attention:**
- The neutralized copy (CTAs, Cheltenham intro and FAQ, Jersey Shore intro, Toms River sidebar) reuses wording the site already uses. It still needs editorial sign-off.
- HOW-K1, the Howell generic intro, is kept but flagged.
- The disclosure text is exactly as Codex specified. It does not separately state the operator's ownership of two tenants.

## 9. Limitations and Phase 3 prerequisites

See `PROPOSAL.md` §6 and §7, and the P3 table in `INVENTORY.md`.
