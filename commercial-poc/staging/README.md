# WWK Commercial POC — live pilot

Status: **live pilot (Northwest Philadelphia and Jersey Shore) deployed and smoke-tested on November 2, 2026. The Manhattan expansion is implemented in this worktree and awaits activation review** (`evidence/manhattan-pilot-2026-11-02.md`).

This package turns the Phase 1 proof into two Cloudflare Worker-shaped services sharing one D1 database:

- `collector/`: public, write-only event collection (`POST /v1/collect`) plus minimal health.
- `portal/`: private, server-rendered sponsor reporting. Cloudflare Worker Access supplies `ctx.access`; the Worker maps the verified identity to an opaque HMAC subject and rechecks authorization on every request. School users see only their memberships; an explicit administrator role can switch among every current and future sponsor account.

The pilot uses isolated Cloudflare Workers and D1 for collection and reporting. Seven clearly labeled sponsored placements route families to the official British Swim School pages for Cheltenham, Howell, Brick, and Toms River. Ordinary directory order remains editorial and is never sold.

## Live pilot

- Public collector: `https://events.waterwisekids.com` (`GET /v1/health`, `POST /v1/collect`).
- Private portal: `https://sponsors.waterwisekids.com` behind Cloudflare Access.
- Administrator: an opaque identity mapping for the approved administrator can switch among all current and future sponsor tenants.
- Pilot tenants: British Swim School of Northwest Philadelphia and British Swim School of Jersey Shore.
- Manhattan expansion (pending activation): British Swim School of Manhattan as a separate no-fee sponsor account. It has seven verified venues and two independently attributed sponsored cards: `plc_10e8497ef216c69d` on `/swim-lessons/directory/new-york.html` and, approved 2026-11-02, `plc_e487fb00e271338e` on the editorial guide `/swim-lessons/manhattan-ny.html`. East Village is held. There is no sponsor portal user: the administrator role exposes the tenant automatically. There is no ordinary-listing control (see `../onboarding/MEASUREMENT.md` §4). Activation applies the onboarding packet's `d1-upsert.sql` to the live D1. The live D1 is never re-seeded.
- Pilot locations: LA Fitness Cheltenham, Howell, Brick, and Toms River.
- Start date: November 2, 2026; pilot value is $0.
- No family names, contact information, IP addresses, cookies, referrers, full URLs, or device fingerprints are collected by the WWK event collector.
- Leads and enrollments are imported only as aggregate Jackrabbit registration-source counts and are labeled as school-reported, not attributed facts.

## Remote staging

- Public collector: `https://events-staging.waterwisekids.com` (`GET /v1/health`, `POST /v1/collect`).
- Private portal: `https://sponsors-staging.waterwisekids.com` behind Cloudflare Access.
- The initial administrator can switch among Jersey Shore, Manhattan, and Northwest Philadelphia; the role automatically includes future sponsor tenants.
- All current figures are synthetic fixtures and are labeled as staging data in the portal.
- The daily Codex monitor checks endpoint health, access protection, tenant data freshness, and pilot KPIs.
- Workers Paid was activated on November 2, 2026 after the synthetic seed exceeded the D1 Free daily write allowance. The plan is $5/month and includes 25 billion D1 rows read and 50 million rows written per monthly billing period; overages remain billable.

## Verify locally

The worktree must be on the external APFS development volume. From the repository root:

```sh
/Users/bss/DeveloperTools/bin/dev-external --check
/Users/bss/DeveloperTools/bin/dev-external --cwd /Users/bss/DeveloperTools/Expansion/Worktrees/wwk-commercial-poc -- npm ci --prefix commercial-poc/staging --ignore-scripts --no-audit --no-fund
/Users/bss/DeveloperTools/bin/dev-external --cwd /Users/bss/DeveloperTools/Expansion/Worktrees/wwk-commercial-poc -- npm --prefix commercial-poc/staging run verify
```

`verify` runs syntax/secret checks, the complete Node test suite, a real local D1 migration/seed/reconciliation, Wrangler dry-run bundles for both Workers, and the Phase 2 client → real workerd collector → D1 → Access-simulated workerd portal flow. Evidence is written to `evidence/`. Temporary verification state is marker-guarded and removed at the end.

Individual commands are listed in `package.json`. Local identities use the reserved `.test` TLD and are generated only in derived configs under the local state directory.

## Documents

- `ARCHITECTURE.md`: service boundaries, identity flow and threat changes.
- `PRIVACY-OPERATIONS.md`: data minimization and required platform settings.
- `DEPLOYMENT-WORKSHEET.md`: unresolved values, reviewed remote command sequence and release gates.
- `ROLLBACK.md`: staged rollback and evidence preservation.

