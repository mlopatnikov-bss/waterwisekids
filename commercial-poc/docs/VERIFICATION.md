# Phase 1 verification packet (R1 + R2 + R3 corrections)

**Prepared by:** Claude (implementation)  **For:** Codex review  **Date:** 2026-11-02
**Worktree:** `/Users/bss/DeveloperTools/Expansion/Worktrees/wwk-commercial-poc` (branch `feat/wwk-commercial-poc`, starting commit `676fdc4…` per the brief; git could not be queried, see §1)
**Scope:** Phase 1 local vertical slice only. Phase 2 was not started.

## R3 correction (Codex review round R3)

**Codex confirmed for R2 on the Mac:** 104/104 tests passed. The native seed took 4.31 s wall time (3.094 s reported) with 9 transactions and exact totals.

**R3 changed paths** (all under `commercial-poc/`):
- Added: `src/seed-args.mjs`, `test/seed-cli.test.mjs`.
- Modified: `scripts/seed.mjs`, `src/config.mjs`, `README.md`, `docs/VERIFICATION.md`.
- Regenerated: `evidence/verification.json`, `evidence/test-output.txt`.

### R3-1. Seed CLI validates everything before touching any file

**Defect found by Codex.**
- `scripts/seed.mjs` deleted the existing database and journal and opened a new one *before* an invalid or missing `--tx-batch` reached `seedAll`. So a bad argument could destroy the current synthetic database and then fail.
- `dbPath.startsWith(POC_ROOT)` accepted prefix-sharing siblings such as `…/commercial-poc-evil/x.sqlite`.

**Fix.**
- **Validation before effects.** `src/seed-args.mjs` (`parseSeedArgs`) is read-only. It never creates, deletes or opens a database. It must finish before `seed.mjs` does anything else.
- **Arguments.** Only `--db <path>`, `--tx-batch <n|all>`, `--allow-outside` and `--help` are accepted.
  - Each may appear once.
  - Value flags must have a value that is non-empty and doesn't start with `--`.
  - The `--flag=value` form, unknown options and stray positional arguments are refused.
- **Batch value.** It comes from the CLI first, then `POC_SEED_TX_BATCH` (if the variable is set at all, even empty), then the default of 5000. `parseSeedTxBatch` accepts only `all` or `^[1-9][0-9]*$` up to 100,000,000. The library default in `config.mjs` turns an invalid env value into `NaN`, which `seedAll` refuses before writing.
- **Path containment.**
  - The target must end in `.sqlite`.
  - Unless `--allow-outside` is given, it must resolve strictly inside `commercial-poc/.data/`. The check uses `path.relative`, not a string-prefix test, and runs after resolving symlinks in every existing ancestor.
  - This scope is narrower than R1/R2, which allowed anywhere in `commercial-poc/`. The tighter scope stops `--db` from replacing source files.
- **Existing files.** The target and its sidecars must be regular files (not directories or symlinks), and a non-empty target must start with the SQLite header. This check applies even with `--allow-outside`.
- **Order of operations.**
  1. Parse and validate (exit 2 on failure, usage printed).
  2. Read the manifest (exit 2 on failure).
  3. Only then import the database modules, remove the old database and sidecars, and seed.

  The output now includes `tx_batch_source` and `replaced_files`.
- **Unchanged.** A valid in-scope seed still replaces the previous synthetic database, as intended.

**Proof (`test/seed-cli.test.mjs`, 7 tests).**
1. **A pre-existing marker database and journal survive every bad invocation.** The marker is a real SQLite database with an `r3_marker` table, plus a marker `-journal`. Across 18 invalid or missing argument cases, each run exits 2 with a specific message, and both files keep the same SHA-256, size and mtime with no files added or removed. The cases:
   - Batch values `0`, `-5`, `1.5`, `abc`, `1e3`, empty, and a missing value at the end.
   - `--tx-batch` followed directly by another flag.
   - Env batch `0`, `abc` and empty.
   - An unknown option, a positional argument, duplicate flags, the `--db=` form, and `--db` with no value.
   - An outside path without `--allow-outside`.
2. **The default in-scope `.data/poc.sqlite` and its sidecars are untouched** by `--tx-batch 0`, a missing `--tx-batch` value, an invalid env value, and an unknown option.
3. **Sibling and escape paths are refused, and nothing is created.** Refused targets: `commercial-poc-r3-sibling-*/poc.sqlite` (prefix-sharing sibling of the package), `.data-r3-sibling-*/poc.sqlite` (sibling of `.data`), a path in `commercial-poc/` outside `.data`, a `.data/../src/` escape, and a temp-directory path. All exit 2, and neither the file nor its directory exists afterwards. The same sibling path parses only with an explicit `--allow-outside`.
4. **Non-database targets are never replaced:** a text file named `.sqlite`, a directory named `.sqlite`, and a `.db` name are all refused and left unchanged.
5. **Symlinks can't escape:** a symlink inside a data directory that points outside it is refused.
6. **Precedence and default target:** CLI over env over default, and the default target is `.data/poc.sqlite`.
7. **A valid run still replaces the database:** `--tx-batch all` on the marker database exits 0. The marker table is gone, the journal is removed, `replaced_files` lists both, there is 1 transaction, and reconciliation passes for all three tenants.

## R2 corrections (Codex review round R2)

**R2 changed paths** (all under `commercial-poc/`):
- Modified: `src/collector.mjs`, `src/config.mjs`, `src/pipeline.mjs`, `src/quality.mjs`, `scripts/seed.mjs`, `scripts/serve.mjs`, `test/isolation.test.mjs`, `test/portal.test.mjs`, `README.md`, `docs/ARCHITECTURE.md`, `docs/VERIFICATION.md`.
- Added: `test/seed-batching.test.mjs`, `test/quality-integrity.test.mjs`.
- Regenerated: `evidence/verification.json`, `evidence/test-output.txt`.
- Not touched by R2 source: `.data/` (gitignored; see R2-4).

Codex ran the Mac wrapper verification independently: 93/93 tests passed, native APFS SQLite worked, reconciliation was exact, portal and collector health returned 200, Manhattan got 200 on its own tenant and 404 on NW Philadelphia, and a PII payload was rejected. Two corrections were required.

### R2-1. Seed transaction batching (local synthetic seed only)

- **Observed on the Mac by Codex:** the default file-backed seed took about 138 s, because `seedAll` committed one SQLite transaction per 25 deliveries (1,667 commits for 41,669 deliveries).
- **Change.**
  - `src/collector.mjs` now has one per-delivery core, `ingestOne`, used by two entry points:
    - `ingestDeliveries(db, registry, [{payload, receivedAtMs}])`: many deliveries in one transaction, each with its own receipt time.
    - `ingestBatch`: HTTP semantics, one receipt time; it is now a thin wrapper over `ingestDeliveries`.
  - Validation, idempotency, semantic dedupe and outcome counting are unchanged and still run per event. The three prepared statements are now prepared once per call instead of once per event (no behaviour change).
  - `seedAll` groups deliveries `txBatchSize` per transaction. The default is `SEED_TX_BATCH = 5000`, so 41,669 deliveries take 9 transactions. It is configurable with `POC_SEED_TX_BATCH` or `node scripts/seed.mjs --tx-batch <n|all>`, and invalid values are refused before anything is written. *(R3 correction: in R2 this was true only for the `seedAll` library call. The `seed.mjs` CLI deleted the old database before the value was checked. Fixed in R3-1.)*
  - Each seeded event now validates against its own receipt time. Before, a 25-event chunk shared the last event's receipt time, which was a small fidelity gain only; totals are unchanged.
- **Unchanged:**
  - The HTTP contract: `MAX_BATCH_EVENTS = 25`, plus a test that asserts it.
  - Durability: `journal_mode=DELETE` and `synchronous=FULL` (SQLite default). A test asserts both on a file-backed database.
  - Event validation.
- **Proof (`test/seed-batching.test.mjs`, 6 tests):**
  - The 25-per-transaction, default and single-transaction seeds produce byte-identical `events`, `ingest_outcomes`, `daily_metrics`, `conversion_records` and `data_quality_runs` (SHA-256 per table), and exact per-tenant totals.
  - The transaction count is `ceil(deliveries / txBatchSize)`.
  - Batched and one-at-a-time ingestion give identical per-delivery outcomes (accepted, duplicate_event_id, duplicate_semantic, pii_field, timestamp_in_future).
  - A file-backed seed, closed and reopened, reconciles exactly.
- **Timing.** I could not measure on the Mac. In my Linux VM, on VM-local disk (not the Mac, not APFS), `scripts/seed.mjs` reported `seed_elapsed_ms_this_run`:

  | `--tx-batch` | Transactions | Elapsed (VM only) |
  |---|---|---|
  | 25 | 1,667 | 9,457 ms |
  | 5000 (default) | 9 | 1,861 ms |

  Both runs gave identical table hashes and `reconciliation_ok: true` for all three tenants. The Mac figure needs re-measuring with the wrapper. `seed.mjs` now prints `seed_elapsed_ms_this_run`, `ingest.tx_batch_size` and `ingest.transactions` for that purpose.

### R2-2. Sponsored outbound ≤ sponsored click integrity rule

- **Change.** The `funnel_integrity` check in `src/quality.mjs` now evaluates three rules per placement-day and attributes each violation to its rule:
  1. `viewable_exceeds_eligible`: viewable impressions > eligible views.
  2. `sponsored_click_exceeds_viewable`: sponsored-card clicks > viewable impressions.
  3. **New:** `sponsored_outbound_exceeds_sponsored_click`: sponsored-card clicks to the official site > sponsored-card clicks. This applies to sponsored cards only; ordinary-listing outbound clicks are excluded, since listings have no card click.
- **Output.** The check returns `value` (failing placement-days), `by_rule` counts and up to 20 `violations`, each with its date, placement, kind and the four values. Example warning: "1 placement-day(s) fail funnel integrity: 1 with more sponsored-card clicks to the official site than sponsored-card clicks."
- **Proof (`test/quality-integrity.test.mjs`, 5 tests):**
  - An injected violating rollup (card clicks 2, outbound 3) raises the warning, with exact rule attribution and values.
  - An ordinary listing with 4 outbound clicks and 0 card clicks does not trigger it, and outbound equal to card clicks is allowed.
  - The two earlier rules still fire.
  - The warning renders in the portal's data-status panel.
  - The seeded fixture passes all three rules for every tenant.
- This rule is no longer deferred to Phase 2 (§12 and §13 updated).

### R2-3. Test flake found and fixed during the R2 run (test code only)

- **What happened.** In the first R2 verify run, `http isolation: no session, forged, tampered and foreign-key cookies are all rejected` failed once: a "tampered" cookie returned 404 instead of 303.
- **Cause: a test defect, not an auth defect.** The R1 test tampered by replacing the last two base64url characters of the signature with `AA`. When the signature already ended in characters that decode to the same bytes (the last base64url character carries padding bits), the "tampered" token was the genuine signature. The request was then correctly authenticated as the Manhattan partner, who correctly got 404 on Jersey Shore.
- **Fix.** The test now flips every bit of the first decoded signature byte, so the token is always invalid. Product code is unchanged. Signatures are compared as decoded bytes with `timingSafeEqual`, so a different encoding of the same valid signature grants nothing new.
- **Evidence.** 25 consecutive runs of `test/isolation.test.mjs` passed, followed by the full verify run in §5.

### R2-4. A test opened the local database file (found and fixed during R2)

- **What happened.** During R2, `.data/poc.sqlite` changed and a `poc.sqlite-journal` appeared. The R1 test "production mode refuses to start" spawned `scripts/serve.mjs` with no `--db`. `serve.mjs` opened the default `.data/poc.sqlite`, which runs `migrate()` and writes `schema_meta`, before the auth mode refused.
  - On the Mac this means each R1/R2 test run made an idempotent metadata write into the operator's seeded database.
  - In my VM the write hit the mount's SQLite locking limit and left a hot journal: `.data/poc.sqlite-journal`, 12,824 bytes, at 14:17.
- **Fix.**
  - `serve.mjs` now validates the auth mode before checking for or opening any database, and exits 3.
  - The test passes a `--db` path under the OS temp directory and asserts exit code 3, the refusal message, and that no file was created.
  - The full suite no longer touches `.data/`: the database mtime and SHA-256 were unchanged across a full run.
- **Action for the Mac.** Re-run `node commercial-poc/scripts/seed.mjs` through the wrapper. It deletes `.data/poc.sqlite` and any `-journal` before reseeding. I could not delete them from the VM.

## 1. Execution environment and deviations (report-first)

| Item | What happened |
|---|---|
| `dev-external` wrapper | **Not run.** My shell is a Linux VM that mounts only this worktree, so `/Users/bss/DeveloperTools/bin/` isn't reachable. Mitigations: zero dependencies, no install or build step, no `node_modules` or `.next` used, every write confined to `commercial-poc/`. Exact wrapper commands for re-running on the Mac are in §4. |
| Git | **Not available.** The worktree's `.git` file points to `/Users/bss/Documents/Claude/Projects/WATERWISEKIDS.COM/.git/worktrees/wwk-commercial-poc`, which is not mounted. I ran no git commands at all. Change tracking used a SHA-256 snapshot of all 1,657 files taken before the first write (§2). |
| Official operator pages | Read-only web fetches of the britishswimschool.com territory and location pages for all three markets on 2026-11-02, as PLAN.md requires ("official operator pages remain the authority"). Recorded in `seed/sources/official-operator-snapshot-2026-11-02.json`. No phone numbers or other contact data were kept. |
| SQLite file on the VM mount | `scripts/seed.mjs` with the default `.data/poc.sqlite` failed with `disk I/O error`: SQLite file locking isn't supported on the VM's mounted folder. All tests use in-memory databases and pass. The seed, health and serve smoke runs used `--db ~/poc-local/poc.sqlite --allow-outside` (VM-local, outside the worktree). On native macOS the default path works: Codex confirmed it in R2. A failed partial `commercial-poc/.data/poc.sqlite` (12 KB) plus `-journal` remain. They are gitignored, I couldn't delete them from the VM, and `seed.mjs` removes them on its next run. |
| Node | v22.23.4 (VM). Requirement: >= 22.13. |

## 2. Changed and untracked paths

All new files are under `commercial-poc/`. No pre-existing file was modified, added or removed:

```
baseline (before first write, 2026-11-02T13:32:12Z): 1657 files
after (excluding commercial-poc/):                   1657 files
diff baseline.sha256 after.sha256  ->  no differences (byte-identical)
```

New (untracked) paths:
```
commercial-poc/.gitignore
commercial-poc/README.md
commercial-poc/package.json
commercial-poc/docs/{ARCHITECTURE.md, EVENT-SCHEMA.md, SOURCE-CONFLICTS.md, VERIFICATION.md}
commercial-poc/seed/{pilot-tenants.json, pilot-manifest.json, sources/official-operator-snapshot-2026-11-02.json}
commercial-poc/src/{collector, config, conversions, db, events, http-collector, ids, manifest, pipeline, quality, registry, rollup, scope, synthetic, time}.mjs
commercial-poc/src/schema.sql
commercial-poc/src/portal/{auth.mjs, html.mjs, server.mjs, views.mjs, portal.css}
commercial-poc/scripts/{build-manifest, seed, serve, health, static-checks, verify, capture-screenshots}.mjs
commercial-poc/test/{helpers.mjs, manifest, events-privacy, collector, rollup-reconciliation, conversions-quality, isolation, portal}.test.mjs
commercial-poc/evidence/{verification.json, test-output.txt}
commercial-poc/evidence/screenshots/{01..13}-*.png, render-report.json
commercial-poc/.data/poc.sqlite, poc.sqlite-journal   (gitignored failed partial; see §1)
```

## 3. Architecture and security decisions

See `docs/ARCHITECTURE.md` for the ADR, STRIDE threat model and retention proposal, and `docs/EVENT-SCHEMA.md` for the schema. In short:

- **Stack.** Node built-ins only (`node:http`, `node:sqlite`, `node:test`, `node:crypto`), with a server-rendered portal and no client JS. The SQL is SQLite and portable to an edge store. The collector core doesn't depend on its transport.
- **Privacy.**
  - Allowlist schema. PII-shaped field names and values are rejected.
  - No query strings or fragments, IP, user agent or cookies are ever stored. Timestamps are kept to the minute.
  - Rejected payloads are counted by reason only and never stored.
- **Isolation.**
  - The membership check runs on every request.
  - `TenantScope` is the only read path, and every statement binds `tenant_id`; a test enforces this.
  - All denied tenant IDs get the same 404.
- **Auth.**
  - Demo mode runs on loopback only, refuses `NODE_ENV=production`, and uses HMAC-signed HttpOnly, SameSite=Strict cookies.
  - Production mode throws on startup. No passwords exist anywhere.
- **Commercial integrity.** These are schema CHECK constraints:
  - Sponsored campaigns carry the label "Sponsored pilot" and `price_cents = 0`.
  - Sponsored cards use `rel="sponsored noopener"`.
  - Ordinary listings can't receive sponsored clicks.

## 4. Commands run

On the user's machine (Linux VM shell, worktree mounted). The wrapper was unavailable (see §1).

```
node scripts/build-manifest.mjs                       # real repo, full link scan -> 10 conflicts
node scripts/verify.mjs                               # ok: true (15.3 s)
  ├─ node scripts/static-checks.mjs                   # exit 0, 45 files, 34 .mjs syntax-checked, 0 findings
  ├─ node scripts/build-manifest.mjs --check          # exit 0, "matches current sources"
  └─ node --test --test-reporter=spec test/*.test.mjs # exit 0, 93/93 pass, 11.0 s
node scripts/seed.mjs --db ~/poc-local/poc.sqlite --allow-outside   # reconciliation_ok true x3
node scripts/health.mjs --db ~/poc-local/poc.sqlite                 # exit 2 (critical: Manhattan stale fixture, expected)
node scripts/serve.mjs --db ~/poc-local/poc.sqlite                  # smoke: GET / 303; partner own tenant 200; partner->NWP 404;
                                                                    # collector /v1/health 200; PII post (email field) -> {"rejected":1}
POC_HOST=0.0.0.0 node scripts/serve.mjs                             # exit 2 "loopback only"
```

In the cloud sandbox (same source; Chromium and Playwright available there only):
```
node scripts/capture-screenshots.mjs                  # 12 states + keyboard walk; 0 horizontal overflow
```

To re-run on the Mac through the wrapper (recommended before review sign-off):
```sh
/Users/bss/DeveloperTools/bin/dev-external --check
W=/Users/bss/DeveloperTools/Expansion/Worktrees/wwk-commercial-poc
/Users/bss/DeveloperTools/bin/dev-external --cwd "$W" -- node commercial-poc/scripts/verify.mjs
/Users/bss/DeveloperTools/bin/dev-external --cwd "$W" -- node commercial-poc/scripts/seed.mjs
/Users/bss/DeveloperTools/bin/dev-external --cwd "$W" -- node commercial-poc/scripts/health.mjs
```

R2 commands (same VM shell, user's machine):
```
node --test --test-reporter=dot test/seed-batching.test.mjs test/quality-integrity.test.mjs     # 11/11
node scripts/seed.mjs --db ~/poc-local/r2-25.sqlite   --allow-outside --tx-batch 25    # 1,667 tx, 9,457 ms (VM)
node scripts/seed.mjs --db ~/poc-local/r2-5000.sqlite --allow-outside --tx-batch 5000  # 9 tx, 1,861 ms (VM); identical table hashes
for i in 1..25: node --test test/isolation.test.mjs                                     # 25/25 clean after the R2-3 fix
node scripts/verify.mjs                                                                 # ok: true, 104/104, static 0 findings (51 files, 36 .mjs), manifest current
node --test 'test/*.test.mjs'  x3                                                       # 0 failures each
```

R3 commands (same VM shell, user's machine):
```
node --test --test-reporter=spec test/seed-cli.test.mjs     # 7/7
node scripts/seed.mjs --tx-batch 0                          # exit 2, usage printed, .data/poc.sqlite unchanged
node scripts/verify.mjs                                     # ok: true, 111/111, static 0 findings (53 files, 38 .mjs), manifest current
node --test --test-reporter=spec 'test/*.test.mjs'  x2      # 111/111 each
# Default .data/poc.sqlite SHA-256 unchanged across all R3 runs; all 1,657 non-POC files byte-identical to the pre-R1 snapshot.
```

## 5. Tests (111/111 pass after R3; 104 after R2; 93 in R1)

Full names and timings are in `evidence/test-output.txt`. Grouped:

| File | Tests | Covers |
|---|---|---|
| `manifest.test.mjs` | 8 | Deterministic opaque IDs. The committed manifest matches the sources. 3 tenants at $0. Held locations are never placed. Conflicts are reported, not resolved. Pages exist and use rel=sponsored. Placement shape per tenant. No emails or phones. |
| `events-privacy.test.mjs` | 43 | Each event type accepted. Stored form is minimized. 17 PII rejections (fields, values, query strings, fragments). 18 schema rejections. IAB viewability threshold. Unknown entities and hosts. Every cross-tenant reference. Organic or sponsored misuse. Time windows. Rejections never echo values. |
| `collector.test.mjs` | 8 | Event-ID idempotency. Semantic dedupe. Rejections leave no payload trace (full DB dump). Ownership. HTTP: no IP, UA or cookie stored; origin, query, method, media type, size and envelope guards; rate limit 429. |
| `rollup-reconciliation.test.mjs` | 8 | Events = generator expected totals. Every tenant-day-metric cell matches (more than 1,000 cells). Duplicates and rejections don't inflate. Rejection reasons match what was injected. Portal model = rollups. Idempotent rollup. Deterministic seed. Retention purge keeps aggregates. |
| `conversions-quality.test.mjs` | 7 | Supersede and replay semantics. Tenant comes from the scope. PII and free text refused. Quality flags per tenant. Freshness degrades over time. Health summary schema. |
| `isolation.test.mjs` | 8 | Scoped reads leak no other tenant's IDs or names. Every scoped SQL statement binds tenant_id. Membership-only scopes. HTTP 404s for cross-tenant pages, JSON and query tampering. Indistinguishable denials. Forged, tampered and foreign-key cookies. Immediate revocation. |
| `seed-batching.test.mjs` (R2) | 6 | HTTP cap still 25. Default seed transactions = ceil(deliveries / 5000), more than 100× fewer than 25-event commits. Byte-identical tables and exact totals at 25, 5000 and all-in-one. Invalid batch sizes refused before writing. Batched and unbatched per-delivery outcomes identical. File-backed seed keeps journal DELETE and synchronous FULL, and persists exact totals after reopen. |
| `quality-integrity.test.mjs` (R2) | 5 | Injected sponsored outbound > card clicks raises a warning with rule attribution. Ordinary-listing outbound clicks are excluded and equality is allowed. Earlier rules still fire. The warning shows in the portal. The seeded fixture is clean. |
| `seed-cli.test.mjs` (R3) | 7 | Validation happens before any file effect: 18 invalid or missing argument cases leave a marker database and journal byte-identical. The default `.data` database is untouched by bad arguments. Sibling-prefix, out-of-`.data`, `..` and temp paths are refused and nothing is created. Non-SQLite files, directories and `.db` names are never replaced. Symlink escape refused. CLI/env/default precedence. A valid run still replaces the database. |
| `portal.test.mjs` | 11 | KPI = rollups (28-day). Full window = generator. Badges on every KPI. DQ warnings visible. Empty and invalid ranges. 500 error state with no internals. HTML escaping. Security headers, no scripts or inline styles. CSRF refusal. Production auth, NODE_ENV and loopback refusal. Accessibility structure. |

## 6. Build, lint and typecheck

- **Build:** none. There is no build step by design.
- **Lint and syntax:** `scripts/static-checks.mjs` exit 0.
  - `node --check` on 34 `.mjs` files (R1); 36 files and 51 scanned in R2.
  - Rules: no-eval, no-innerHTML, no `console.log` in `src/`, no TODO, no wildcard bind, no SQL string concatenation, no `fetch` in `src/`.
  - Secret scan: AWS, private key, sk-, Slack, GitHub, Google, assigned secrets. Personal-data scan: emails and phones.
  - 0 findings.
- **Typecheck:** not run. There is no TypeScript, and adding `tsc` would add a dependency. Recorded as a known limitation.

## 7. Synthetic reconciliation totals by tenant

The fixture covers 2026-08-04 → 2026-11-01: 30 baseline days (ordinary listing only) plus 60 sponsored days. Seed 20261102; report time 2026-11-02T14:00Z.

| Tenant (`tenant_id`) | Metric | Generator expected | Accepted events | Daily rollups | Portal read model |
|---|---|---|---|---|---|
| NW Philadelphia (`ten_b234a48144f47f06`) | eligible_view | 8,166 | 8,166 | 8,166 | 8,166 |
| | viewable_impression | 4,623 | 4,623 | 4,623 | 4,623 |
| | sponsored_click | 153 | 153 | 153 | 153 |
| | outbound_click | 172 | 172 | 172 | 172 |
| Jersey Shore (`ten_9d294d23e0e9841e`) | eligible_view | 11,906 | 11,906 | 11,906 | 11,906 |
| | viewable_impression | 6,962 | 6,962 | 6,962 | 6,962 |
| | sponsored_click | 247 | 247 | 247 | 247 |
| | outbound_click | 265 | 265 | 265 | 265 |
| Manhattan (`ten_52bf92991a0305d0`) | eligible_view | 5,122 | 5,122 | 5,122 | 5,122 |
| | viewable_impression | 2,773 | 2,773 | 2,773 | 2,773 |
| | sponsored_click | 75 | 75 | 75 | 75 |
| | outbound_click | 86 | 86 | 86 | 86 |

Outbound split, sponsored cards / ordinary listing: NWP 130 / 42; JS 205 / 60; Manhattan 66 / 20.

**Ingest:**
- 41,669 deliveries: 40,550 accepted, 963 duplicates, 156 rejected. Exactly as injected.
- Duplicates: 841 event-ID retries and 122 re-fired views.
- Rejections: pii_field 20, pii_value 20, page_path_query_or_fragment 20, unknown_placement 20, host_not_allowed 19, timestamp_in_future 19, cross_tenant_reference 19, unknown_field 19.

**Reported conversions** (stored = expected after supersede and replay):
- NWP: assessment_start 48, enrollment 19 (booking-system export, medium confidence).
- JS: call 28, qualified_lead 24, enrollment 8 (owner tally, low confidence). One correction superseded 3 rows, and one replayed import was a no-op.
- Manhattan: none (empty state).

## 8. Tenant-isolation evidence

- **Read model.** Every `TenantScope` method was run for each tenant over the full window. The output contains none of the other tenants' tenant, school, location, destination, campaign or placement IDs, and none of their display names.
- **Static enforcement.**
  - All 15 SQL statements in `TenantScope` bind `tenant_id = ?` or `?1`.
  - Only two helpers call `db.prepare`, and both bind the scope's tenant ID as parameter 1.
- **HTTP, owner of NWP + JS:**
  - 200 on both of their tenants.
  - 404 on Manhattan's overview, on `quality.json`, and with `?tenant_id=` tampering.
  - Their pages never contain Manhattan's name or ID.
- **HTTP, Manhattan partner:** 404 on both NWP and JS. `quality.json` returns only its own `tenant_id`.
- **HTTP, no-access user:**
  - Gets the "No school is linked" page.
  - The same 404 body for a non-member, an unknown, an uppercase and a display-name tenant ID.
- **Sessions.** These are all redirected to sign-in: no cookie, a claims swap with the old signature, a tampered signature, a token from a different key, and garbage.
- **Revocation.** Deleting a membership returns 404 on the very next request.
- **Live smoke on the user's machine:** partner → own tenant 200; partner → NWP 404.

## 9. Privacy and PII rejection evidence

- **Rejection tests.** 17 PII tests (`events-privacy.test.mjs`) all pass. They reject:
  - Fields: email, phone, ip, user_agent, child_name, student, fingerprint, device_id, zip.
  - Values: email or phone in the path, IPv4 or IPv6 as the host, long digit runs, an email nested inside the viewability object.
  - Query strings and fragments.
- **Full database dumps:**
  - After rejecting a planted `leaky.parent@example.com`, it appears in no table.
  - After an HTTP post carrying a unique user agent, `X-Forwarded-For: 203.0.113.77` and a cookie, none of those values, nor `127.0.0.1`, appear in any table.
- **Conversion imports** refuse a payload `tenant_id`, `family_name` and `notes` fields, and phone or email in `source_label`.
- **Static scan.** No real emails or phones anywhere in `commercial-poc/`. Tests use reserved example data only.
- **Live smoke.** Posting an event with an `email` field to the collector returned `{"accepted":0,"duplicates":0,"rejected":1}`.

## 10. Render evidence (desktop 1280×900, mobile 390×844)

Files are in `evidence/screenshots/`; `render-report.json` has the HTTP status, horizontal overflow (0 px for every state) and console errors. The only console errors are the expected 404 and 500 document statuses.

| # | State | Viewport |
|---|---|---|
| 01 / 02 | Demo sign-in with its "not real authentication" warning | desktop / mobile |
| 03 / 04 | NW Philadelphia overview, Data status "Note" (Andorra pending) | desktop / mobile |
| 05 / 06 | Jersey Shore: Warning for the 2026-10-12 missing day and anomaly; Asbury Park pending | desktop / mobile |
| 07 / 08 | Manhattan: Critical, stale for 84 h, 3 missing days; leads and enrollments "Not reported"; East Village address withheld | desktop / mobile |
| 09 | Empty date range state | desktop |
| 10 | Cross-tenant 404 (owner → Manhattan) | desktop |
| 11 | No-access user | mobile |
| 12 | 500 error state with a reference and no internals | desktop |
| 13 | Keyboard: the first Tab focuses the skip link (3 px focus ring); Enter moves focus to `main` | desktop |

Keyboard walk: the skip link comes first, then the brand, the two tenant links, Sign out, the date fields, Apply and the presets. Every stop shows a visible 3 px outline.

## 11. Source-of-truth conflicts (pilot locations)

Full table: `docs/SOURCE-CONFLICTS.md`. Every item is reported, not resolved.

| ID | Tenant | Subject | Conflict | Effect |
|---|---|---|---|---|
| C01, C02 | NWP | LA Fitness – Andorra (701 E Cathedral Rd) | Listed on the official territory page, but there is no WWK directory row, and the official location page says "no classes available" | `needs_owner_confirmation`; card on `/swim-lessons-andorra-philadelphia.html` not created |
| C03 | NWP | LA Fitness – Cheltenham | Locality is "Philadelphia, PA 19150" (territory page, geo file) vs "Cheltenham, PA 19150" (location page, directory); "W Cheltenham Ave" vs "Cheltenham Avenue" | Same number and ZIP; no status change |
| C04 | NWP | Cheltenham URL variant | 4 WWK pages link `/northwest-philadelphia/la-fitness-cheltenham/` (without `/location/`). That path also loads on the official site. | Manifest uses the official listed URL; cleanup goes to a Phase 2 proposal |
| C05, C06 | JS | Boys & Girls Club – Asbury Park (1201 Monroe Ave) | Listed on the official territory page, but there is no WWK directory row, and the location page says "no classes available" | `needs_owner_confirmation`; card on `/swim-lessons/asbury-park-nj.html` not created |
| C07 | JS | LA Fitness – Howell | Official pages render the ZIP as "7731" | Manifest uses 07731 |
| C08, C09 | Manhattan | East Village | On the official territory page but missing from the directory `poolAddresses`; the location page shows both **720** and **710** E 11th St (the WWK geo file already withholds it) | Held; address withheld; not linked |
| C10 | Manhattan | Inventory | No Manhattan local guide page exists in WWK, only `/swim-lessons/directory/new-york.html` | The fixture card shares the page with the ordinary listing; Phase 2 must propose inventory |

**Result:**
- 14 official locations: 11 `eligible_fixture` and 3 held.
- 13 fixture placements: 8 sponsored cards and 5 ordinary-listing baselines. 2 placements were not created.

"Eligible" means fixture eligibility only: listed in both sources with no conflicting notice. Live status still needs owner confirmation.

## 12. Known limitations

1. The `dev-external` wrapper and git weren't available from this session (§1). Re-run `verify.mjs` on the Mac through the wrapper before sign-off.
2. The file-backed SQLite store doesn't work on the VM mount. It is expected to work on native APFS, but that hasn't been verified on the Mac yet.
3. There is no TypeScript typecheck (zero-dependency choice).
4. "Tracking failure never blocks outbound navigation" (PLAN technical gate) is a client-side property and lands with the Phase 2 component. Phase 1 only guarantees the collector is a separate, optional service.
5. Demo auth is not security. Production identity is unimplemented by design and refuses to start.
6. A public collector can't stop forged but well-formed events for real placements. Anomaly flags exist; edge bot filtering and optional signed placement tokens are Phase 3 items.
7. The rate limiter lives in process memory only. Production needs edge or WAF limits.
8. All data is synthetic. Viewability, CTR and the "+X% clicks per day" lift come from generator parameters and carry no evidential weight.
9. The official snapshot is a point-in-time web read (2026-11-02). It must be refreshed and owner-confirmed before any live placement.
10. "Featured" location metrics count only cards that feature a specific location. Manhattan's single card features the territory, so its per-venue featured columns are zero by design.
11. The retention purge exists, but no scheduler runs it (schedulers are not authorized).
12. Rollups recompute whole ranges. That is fine at pilot scale; incremental rollups would come later.
13. Seed transaction batching (R2) applies only to the local synthetic seed. A production edge collector would commit per request (25 events at most) or use its platform's batching. Mac seed timing after R2 has not been measured by me.
14. The `seed-batching` file-backed test writes a temporary SQLite file under the OS temp directory (`os.tmpdir()`, which honours `TMPDIR`) and removes it afterwards.

## 13. Phase 2 recommendations (not started)

1. **Owner decisions first.** Confirm Andorra, Asbury Park and East Village status, and the Cheltenham canonical URL and locality. Decide whether the 4 WWK pages linking the non-`/location/` Cheltenham path should be normalized.
2. **Manhattan inventory.** Decide what to propose beyond the NY state directory, keeping within agent limits (no mass city pages).
3. **Sponsored-card component.**
   - Visually separate, labeled "Sponsored pilot", `rel="sponsored noopener"`.
   - Measures viewability with `IntersectionObserver` (≥ 50% visible for ≥ 1 s).
   - A `page_view_id` held in memory only. Sends via `navigator.sendBeacon`, fire-and-forget, so links remain plain `<a href>` that work without JS or a working collector.
4. **UTM contract** as in `EVENT-SCHEMA.md`.
5. **Exact page inventory with before/after diffs only.** Start from the 8 fixture pages listed in the manifest.
7. **Phase 3 preparation.** Hosting decision (an edge runtime plus SQLite-compatible store fits this code), managed identity, edge rate limiting, raw-log retention at the platform layer.

## 14. Confirmation of boundaries

- **Live site and production.** The live WWK site, the live checkout (`/Users/bss/Documents/Claude/Projects/WATERWISEKIDS.COM`), production services, DNS, Cloudflare, GTM, GA4, Search Console and GitHub were **not touched**. The `.git` pointer was read; its target wasn't accessed.
- **Schedulers and external accounts.** None were created or changed. No credentials or API keys are used or committed.
- **Git and disk.** No commit, push, merge, pull, rebase, reset or checkout. No `npm install`. No `node_modules` or `.next` used.
- **Pre-existing files.** All 1,657 are byte-identical to the pre-change snapshot. Public WWK HTML, the sitemap, directory data, advertising pages and scheduled jobs are unchanged.
- **Network.** The only network access was read-only fetches of public britishswimschool.com pages. No Google result scraping.
- **Phase 2:** not begun.
- **R3:** changes were confined to `commercial-poc/`, with no git, live-site or Phase 2 actions. The CLI tests write only under the OS temp directory and clean up after themselves. They never create anything in `.data/` or beside `commercial-poc/`.
- **R2:** changes were confined to `commercial-poc/`. All 1,657 files outside it are still byte-identical to the pre-R1 snapshot. No git actions, no installs, no live-site, production, scheduler or account changes.
