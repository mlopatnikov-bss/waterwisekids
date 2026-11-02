# Remote staging smoke test — 2026-11-02

- Zero Trust Free activated at $0/month; usage beyond included limits is billable under the owner-approved Cloudflare terms.
- `events-staging.waterwisekids.com/v1/health` returned HTTP 200 with schema version 1.
- An unauthenticated request to `sponsors-staging.waterwisekids.com` returned HTTP 302 to Cloudflare Access.
- Administrator authentication reached the portal successfully.
- Tenant switching reached the Jersey Shore, Manhattan, and Northwest Philadelphia dashboards.
- Portal content clearly labels the environment as staging and the metrics as synthetic fixtures.
- Portal Worker deployment version: `2bb76b5a-fa4d-44c0-9b1f-99ef9fd6d235`.
- Local post-deployment verification passed: 52 tests, 0 failures, 0 static findings, reconciliation true, dry-run bundles successful, workerd E2E successful.

No public WWK page was modified or released during this deployment.

## Capacity upgrade

- The synthetic staging seed reached approximately 169,290 D1 rows written against the Free plan's 100,000 rows-written daily allowance.
- The owner approved Workers Paid at $5/month on November 2, 2026.
- Cloudflare confirmed the subscription is active.
- The account dashboard now shows monthly D1 allowances of 25 billion rows read and 50 million rows written.
- A zero-row, non-mutating UPDATE probe and a tenant-count query both completed successfully after the upgrade; the tenant count remained 3.
- Usage beyond the plan's included allowances can incur additional charges.
