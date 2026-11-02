# WWK Commercial POC — Phase 1 local runbook

This is a local proof of concept: sponsored-placement measurement plus a tenant-isolated sponsor portal for three pilot tenants (British Swim School of Northwest Philadelphia, Jersey Shore and Manhattan). **Everything runs on loopback with synthetic data. Nothing here is deployed or approved for deployment.**

- Plan and brief: `../docs/commercial-poc/PLAN.md`, `../docs/commercial-poc/CLAUDE-BRIEF-R1.md`
- Architecture, ADR and threat model: `docs/ARCHITECTURE.md`
- Event schema: `docs/EVENT-SCHEMA.md`
- Pilot source conflicts: `docs/SOURCE-CONFLICTS.md` (generated)
- Verification packet: `docs/VERIFICATION.md`

## Requirements

- Node.js **22.13 or newer**. It needs the built-in `node:sqlite` and `node:test` modules.
- No `npm install`. This package has zero dependencies and never creates `node_modules`.
- Optional: Playwright with Chromium, only for `scripts/capture-screenshots.mjs`. It is not a project dependency.

## Commands

On the operator Mac, run heavy commands through the external-disk wrapper:

```sh
/Users/bss/DeveloperTools/bin/dev-external --check
W=/Users/bss/DeveloperTools/Expansion/Worktrees/wwk-commercial-poc
/Users/bss/DeveloperTools/bin/dev-external --cwd "$W" -- node commercial-poc/scripts/static-checks.mjs
/Users/bss/DeveloperTools/bin/dev-external --cwd "$W" -- node commercial-poc/scripts/build-manifest.mjs --check
/Users/bss/DeveloperTools/bin/dev-external --cwd "$W" -- node --test --test-reporter=spec 'commercial-poc/test/*.test.mjs'
/Users/bss/DeveloperTools/bin/dev-external --cwd "$W" -- node commercial-poc/scripts/verify.mjs
```

From inside `commercial-poc/`:

| Command | What it does |
|---|---|
| `node scripts/build-manifest.mjs` | Rebuilds `seed/pilot-manifest.json` and `docs/SOURCE-CONFLICTS.md`. It only reads repo sources. Add `--check` to verify the committed manifest is current without writing. |
| `node scripts/seed.mjs` | Replaces `.data/poc.sqlite` (gitignored) with a fresh synthetic database, then prints reconciliation, quality status, elapsed time and transaction count. Options: `--db <path.sqlite>`, `--tx-batch <n\|all>` and `--allow-outside`; `--help` prints usage. `--tx-batch` overrides `POC_SEED_TX_BATCH`; the default is 5000. It only sets deliveries per SQLite transaction, and every event is still validated and deduplicated individually. All arguments are validated **before** any file is deleted or created (see Safety boundaries). |
| `node scripts/serve.mjs` | Portal at http://127.0.0.1:4310 (demo sign-in) and collector at http://127.0.0.1:4311/v1/collect. Loopback only. |
| `node scripts/health.mjs` | Machine-readable health summary. Exit code 0 means ok/info, 1 warn, 2 critical. |
| `node --test 'test/*.test.mjs'` | Full test suite. Uses in-memory databases, except one durability test that writes and then removes a temporary SQLite file under `os.tmpdir()` (honours `TMPDIR`). |
| `node scripts/static-checks.mjs` | Syntax check, lint rules, secret scan and personal-data scan. |
| `node scripts/verify.mjs` | Builds the whole evidence packet: writes `evidence/verification.json` and `evidence/test-output.txt`. |
| `node scripts/capture-screenshots.mjs` | Desktop and mobile screenshots plus a keyboard walk, written to `evidence/screenshots/`. Needs Playwright. |

`POC_AS_OF` overrides the fixed report time (default `2026-11-02T14:00:00Z`). Use it to watch freshness warnings change.

## Using the portal

1. Run `node scripts/seed.mjs`, then `node scripts/serve.mjs`.
2. Open http://127.0.0.1:4310. You land on the **demo sign-in**. It is clearly marked as not real authentication.
3. Pick a fixture user:
   - **Pilot owner (NW Philadelphia + Jersey Shore):** sees two tenants and can switch between them in the header. Manhattan URLs return 404.
   - **Pilot partner (Manhattan):** sees Manhattan only.
   - **No tenant access:** sees the "no school linked" state.
4. Change the date range with the form or the quick links. A range with no data shows the empty state.

### What each tenant's fixture data demonstrates

| Tenant | Fixture behaviour | What you should see |
|---|---|---|
| NW Philadelphia | Clean feed. Weekly booking-system imports (medium confidence). Andorra held. | Data status "Note" (pending location only) |
| Jersey Shore | Collector outage on 2026-10-12. Weekly owner tallies (low confidence) with one correction and one replay. Asbury Park held. | "Warning": missing day and anomaly |
| Manhattan | Feed stops after 2026-10-29. No conversion imports. East Village held (address conflict). | "Critical": stale. "Not reported" lead and enrollment states. |

## Safety boundaries

- Do not point `--repo-root` at the live checkout. The manifest builder only reads, but the brief keeps it scoped to this worktree.
- `.data/` is gitignored and holds only synthetic data. Delete it at any time.
- `scripts/seed.mjs` deletes and recreates its target database. Before it touches any file it checks four things:
  - Every option is known, given once, and has a value.
  - The batch value (CLI or `POC_SEED_TX_BATCH`) is `all` or an integer from 1 to 100,000,000.
  - The target ends in `.sqlite` and resolves, after following symlinks, strictly inside `commercial-poc/.data/`. Prefix-sharing siblings such as `commercial-poc-evil/` or `.data-evil/` are refused.
  - Any existing target is a regular file with a SQLite header, and its `-journal`/`-wal`/`-shm` sidecars are regular files.

  Any failure exits with code 2 and leaves every file byte-for-byte unchanged. A path outside `.data/` needs an explicit `--allow-outside`; the `.sqlite` and SQLite-header checks still apply.
- There is no deploy script, scheduler, external API call, credential or production auth in this package.
