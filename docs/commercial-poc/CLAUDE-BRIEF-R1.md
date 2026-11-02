# Claude task: WWK Commercial POC — Phase 1 local vertical slice R1

Read `docs/commercial-poc/PLAN.md` in full before acting.

## Role

You are the implementation engineer. Codex is the coordinator and reviewer. Build the Phase 1 local vertical slice in the assigned worktree and return evidence for review. Do not reinterpret the commercial rules.

## Assigned checkout

- Worktree: `/Users/bss/DeveloperTools/Expansion/Worktrees/wwk-commercial-poc`
- Branch: `feat/wwk-commercial-poc`
- Starting commit: `676fdc401af5710a29925d661ddcc7fd8fc17db6`
- The worktree is physically on external APFS and has already been prepared with `/Users/bss/DeveloperTools/bin/dev-external --prepare`.

Before any install/build/test batch, run:

`/Users/bss/DeveloperTools/bin/dev-external --check`

Run heavy commands only as:

`/Users/bss/DeveloperTools/bin/dev-external --cwd /Users/bss/DeveloperTools/Expansion/Worktrees/wwk-commercial-poc -- COMMAND ARGS`

Do not use internal `node_modules` or `.next` symlinks. Do not touch `/Volumes/4TB SSD/ORIGINAL_DO NOT DELETE`. Do not inspect or modify the live checkout, production services, Claude session storage, backup staging, or unrelated projects. Preserve all existing source and Git metadata.

## Phase 1 scope

First inspect the repository and return a short architecture checkpoint. Then implement a self-contained local POC under `commercial-poc/` with:

1. A documented architecture/threat model.
2. A seed manifest for Northwest Philadelphia, Jersey Shore, and Manhattan derived from current repository sources. Report source conflicts. Do not silently guess active status.
3. A privacy-safe event schema for eligible view, viewable impression, sponsored click, outbound click, and imported conversion.
4. A local collector/storage layer with validation, idempotency, tenant ownership, and tests.
5. Daily rollups with exact reconciliation tests.
6. A responsive account portal that shows only the selected authenticated tenant's fixture data.
7. Seeded synthetic data that makes the funnel and trends inspectable for all three tenants.
8. Clear badges for observed, imported/self-reported, and derived metrics.
9. Data-quality/freshness warnings and empty/error states.
10. A local runbook and verification packet.

Choose the smallest maintainable stack that supports local tests and a later edge deployment. Explain the choice. Avoid unnecessary dependencies and do not add a production auth system. The POC auth adapter must not imply that a URL parameter or display name is secure authorization.

## Explicit non-goals

- No production or staging deployment
- No Cloudflare, DNS, GTM, GA4, Search Console, GitHub, or external-account changes
- No credentials or API keys
- No edits to current public WWK HTML, sitemap, directory data, advertising pages, or scheduled jobs
- No commit, push, merge, pull, rebase, reset, or checkout
- No automated Google result scraping
- No storage of PII, raw IP, full user agent, or arbitrary query strings
- No claims that clicks equal leads or enrollments

## Required evidence

Return:

- exact changed/untracked paths
- architecture and security decisions
- source-of-truth conflicts found in pilot locations
- commands run through the external wrapper
- test names and results
- build/lint/typecheck results
- synthetic reconciliation totals by tenant
- tenant-isolation evidence
- privacy/PII rejection evidence
- screenshots or render evidence for desktop and mobile portal states
- known limitations and Phase 2 recommendations
- confirmation that live WWK, production, schedulers, accounts, and unrelated files were untouched

Stop after the local Phase 1 packet. Do not begin Phase 2.
