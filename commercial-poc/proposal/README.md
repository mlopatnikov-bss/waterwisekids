# WWK Commercial POC — Phase 2 instrumentation proposal (P2-R2)

**Proposal only.** Nothing in this folder has been applied to the public WaterWiseKids source. The page diffs are generated against the current source and checked in dry-run mode only. No public HTML, shared asset, middleware, sitemap, directory data, account, scheduler or service has been changed.

| File / folder | What it is |
|---|---|
| `PROPOSAL.md` | Component and tracking design, UTM contract, promotional audit, release blockers, limitations, Phase 3 prerequisites |
| `INVENTORY.md`, `inventory.json` | The exact eight-page inventory with the per-item promotional audit. Generated; do not edit. |
| `diffs/` | `00-new-assets.diff` (two new files) plus one unified diff per page. Generated; **never applied**. |
| `component/wwk-sponsored.{css,js}` | The reusable card styles and tracking client (would be published as `/assets/css/…` and `/assets/js/…`) |
| `inventory.config.json` | The eight pages, their slot keys, the disclosure, and the audited per-page edit plan (each edit names the exact source text it expects). IDs and URLs come from `seed/pilot-manifest.json`. |
| `source-snapshot.json` | Fingerprint of the public tree at build time (1,657 files) |
| `src/` | Builder (`build.mjs`), strict unified-diff tools (`udiff.mjs`), UTM contract (`utm.mjs`), report writers, recorded dispositions |
| `scripts/` | `build-proposal.mjs [--check]`, `verify-proposal.mjs`, `preview-server.mjs`, `capture-previews.mjs` |
| `test/` | 54 tests: client privacy and behaviour (run against the real script in a Node `vm` stand-in), inventory and content rules, diffs (strict apply/reverse) and no-public-change proof, and content rules over the fully patched pages |
| `EVIDENCE.md`, `evidence/` | The Phase 2 evidence packet, test output, verification JSON, and preview screenshots with their report |

## Commands

These run from `commercial-poc/` with Node ≥ 22.13 and no dependencies. On the operator Mac, run them through the wrapper: `/Users/bss/DeveloperTools/bin/dev-external --cwd <worktree> -- node commercial-poc/…`.

```sh
node proposal/scripts/build-proposal.mjs --check     # artefacts match a fresh in-memory build; writes nothing
node proposal/scripts/verify-proposal.mjs            # check + client syntax + 54 tests + static checks + public-tree fingerprint
node --test 'proposal/test/*.test.mjs'               # tests only
node proposal/scripts/preview-server.mjs             # http://localhost:4320/__preview/ (binds 127.0.0.1 only)
node proposal/scripts/capture-previews.mjs           # needs Playwright + Chromium in the environment (not a dependency)
node proposal/scripts/build-proposal.mjs             # regenerate artefacts (writes under proposal/ only)
```

Applying a diff is a Phase 3+ release action and needs a separately reviewed decision. Never run `patch` or `git apply` against the worktree. The tests run `patch --dry-run`, `git apply --check`, and apply-then-reverse round trips only on copies in the OS temp directory.
