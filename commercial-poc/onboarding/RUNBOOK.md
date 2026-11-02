# Sponsor onboarding — one-day operator runbook

Goal: take a signed sponsor from intake to a live, measured card in one working day, with a named person approving each gate. The CLI only reads and prints; **every action that touches production is done by a human, after the gate above it is recorded.**

Commands (from `commercial-poc/onboarding/`; the module has its own `package.json` and no dependencies):

```bash
npm run onboard -- validate definitions/<key>.sponsor.json
npm run onboard -- ids      definitions/<key>.sponsor.json
npm run onboard -- plan     definitions/<key>.sponsor.json
npm run onboard -- packet   definitions/<key>.sponsor.json --write
```

`--write` saves to `onboarding/out/<key>/` (git-ignored) or a folder outside the repo; anything else inside the repo is refused. Re-running reports each file as `unchanged`, `updated` or `created`; nothing is deleted.

## Roles

| Role | Owns |
|---|---|
| **Operator** | definition file, CLI runs, packet, applying approved SQL and patches |
| **Editor** | page fit, card copy, disclosure, content worklist |
| **Approver** (WWK owner) | sponsor terms and the final activation go/no-go |
| **Sponsor contact** | confirms locations and receives the portal invite |

One person may hold several roles, but the person who prepares a gate never approves the same gate.

## Timeline

### 09:00 — Intake (Operator, 45 min)

1. Copy `definitions/template.sponsor.json` to `definitions/<key>.sponsor.json`. The template is refused until every `TODO_` value is replaced.
2. Fill tenant, school, territory URL, locations, markets and the existing pages you want (from `proposal/INVENTORY.md`). Use `placement_id`s from `npm run onboard -- ids …` (stable: same input, same ID).
3. Add the sponsor contact as an `invite_ref` (for example `testville-owner`) and a role label. **Do not write names, emails or phone numbers anywhere in the repo.**
4. `validate` until the only errors are things you still need to verify.

**Gate `sponsor_terms` (Approver):** written agreement or approval of scope, dates, price and disclosure exists. Record `recorded_on` and an `evidence_ref` to a repo note that contains no personal data (for example `commercial-poc/staging/evidence/<key>-terms.md`: "terms approved by owner on DATE; original held in the WWK mailbox").

### 10:00 — Source and editorial verification (Operator + Editor, 90 min)

1. Capture an official snapshot (same format as `seed/sources/official-operator-snapshot-2026-11-02.json`) by reading the sponsor's official territory and location pages by hand. Record venue, address, location URL, "listed on territory page" and any "no classes" notice. Commit only public business facts.
2. Cite each address and location page as `facts[]`. The validator refuses an address that differs from the snapshot, a stale snapshot (>120 days) and any location showing a "no classes" notice.
3. Editor reviews each target page: real local content (≥ 400 words without the card), mentions the town, one sponsored card per page, card placed after the local guide section and before the generic footer content.
4. Editor reads `content-worklist.md` and decides which items to schedule. **No city page edit happens in this step** — only a decision.

**Gate `source_verification` (Editor):** every fact matches the official page today. **Gate `editorial_review` (Editor):** copy, label "Sponsored pilot", `rel="sponsored noopener"` and the disclosure sentence are acceptable on every page.

### 11:30 — Packet and preview/QA (Operator + Editor, 90 min)

1. `packet … --write`. Read `summary.json`: `network_actions`, `deploy_actions`, `database_actions` are 0; `pending_gates` lists what is left.
2. Review `patch-plan.json`. `insert`/`replace` actions have a diff in `patches/`; `unchanged` means the page already matches.
3. Apply patches to a **local branch only**, from the repository root (`git apply commercial-poc/onboarding/out/<key>/patches/<slot>.diff`) and preview with the existing proposal preview server (`proposal/scripts/preview-server.mjs`) on desktop (1280px) and mobile (375px).
4. Check per page: label visible above the fold of the card, card visually separated from editorial content, every link opens the official page with the four UTM tags, keyboard focus visible, no layout shift, directory order unchanged.
5. Click each tagged URL in `destinations.json` once and confirm the official page loads (HTTP 200, no redirect to a different territory).

**Gate `preview_qa` (Editor):** screenshots saved under `staging/evidence/` and referenced.

### 13:30 — Portal access (Operator, 45 min)

Follow `portal-access-checklist.md` from the packet:

1. Confirm the contact's address out of band; add it to the Access allow policy in the Cloudflare dashboard (human).
2. After `d1-upsert.sql` is applied (next step), apply `portal-memberships.sql`. The user row has no `auth_subject`, so it grants nothing yet.
3. Bind the opaque subject with the existing administrator provisioning procedure (HMAC with the Worker secret). The address never enters D1, logs or the repo.
4. Ask the sponsor to sign in; confirm they see only their tenants and that another tenant's URL returns 404.

**Gate `portal_access` (Operator, checked by Approver).**

### 14:30 — Activate (Operator, Approver present, 45 min)

**Gate `activation` (Approver):** the Approver reads `summary.json`, `patch-plan.json` and `d1-preflight.sql`, then says "go".

1. Run every query in `d1-preflight.sql` against the pilot D1 (read-only). **Every query must return zero rows.** If query 5 reports a missing host, stop: changing the collector host allowlist is a separate, approved global change.
2. Apply `d1-upsert.sql` (idempotent; never deletes; never overwrites another tenant's row).
3. Publish the page patches with the normal reviewed site publish process (PR → review → merge). This tool does not deploy.
4. Within 15 minutes: load each page, confirm one `eligible_view` per page load arrives (portal "Data status" freshness), click one card link and confirm an `outbound_click`.

### Same day, after activation — ordinary-listing control (optional for the first sponsor, recommended)

Follow `MEASUREMENT.md` §1. Set `starts_on` in `definitions/<key>.controls.json` to the owner-approved start (never before the plan date or the sponsored start; the pilot uses 2026-11-02), run `packet … --controls definitions/<key>.controls.json --write`, preview the directory pages (rows must look identical), then **Gate `activation` (Approver)**: apply `control/d1-control-preflight.sql` (zero rows), `control/d1-control-upsert.sql`, and publish `control/patches/*.diff` through the normal reviewed process.

### Weekly — school-reported totals (Operator + Sponsor)

Follow `MEASUREMENT.md` §2. The sponsor (or Alfie) produces an aggregate totals file per tenant. Keep it and the location map **outside the repo**. Run `import-plan` (dry-run), read the per-basis totals back to the sponsor, then write with `--out <outside repo>`. Apply `d1-import-preflight.sql` (zero rows), then `d1-import.sql`. Re-running is safe.

### 15:30 — Monitor (Operator, rest of day + daily)

- Day 0: portal Data status shows no `critical`; ingest rejections < 5 %; duplicates < 10 %.
- Daily for the first week, then weekly: the checks in `LAUNCH-CHECKLIST.md`.

### Deactivate or roll back (any time)

Follow `rollback.md` from the packet: (1) remove the cards with `rollback/remove-<slot>.diff` (`git apply` from the repository root) through the normal publish process; (2) regenerate with `--deactivate-on YYYY-MM-DD` and apply `deactivate.sql` so the collector rejects later events as `outside_campaign_window`; (3) keep or revoke portal access. To restore, re-apply `d1-upsert.sql` and the patches. Nothing is deleted from D1; deletion needs a separate retention decision.

## Stop conditions

Stop and escalate if: the validator reports `ownership_conflict`; a preflight query returns rows; an official page shows "no classes"; the sponsor asks for wording that removes "Sponsored" or the disclosure sentence; a paid price is requested (needs a schema migration first); or anyone proposes generating new town pages for the sponsor.
