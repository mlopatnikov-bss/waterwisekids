# Remote staging deployment record

Remote staging was deployed with owner approval on November 2, 2026. This record deliberately omits account IDs, database IDs, real identities, tokens, and secrets.

## Required values

| Value | Status |
|---|---|
| Cloudflare account and deployment identity | Configured out of band |
| D1 database for `wwk-commercial-staging` | Created; identifier held in ignored deployment config |
| Collector hostname/route | `events-staging.waterwisekids.com` |
| Portal hostname/route | `sponsors-staging.waterwisekids.com` |
| Worker Access application and audience tag | Configured; audience held in ignored deployment config |
| Initial administrator identity for all pilot accounts | Supplied out of band; never record here |
| Separate PA/NJ and Manhattan school-user identities | Deferred; provision when each operator needs direct access |
| 32+ byte random HMAC secret and custodian | Installed as Worker secret; never printed or persisted |
| Real pilot start/end dates | `<REQUIRED>` |
| Retention approval and incident owner | `<REQUIRED>` |
| Allowed collector origin | Fixed: `https://www.waterwisekids.com` |
| Worker names | Fixed: `wwk-commercial-collector-staging`, `wwk-commercial-portal-staging` |

Real emails, tokens, account IDs and secrets must not be written to this repository. The initial identity belongs in the Access allow policy and a one-time opaque-subject administrator provisioning step. The administrator can switch among PA, NJ and Manhattan now and automatically sees later tenant records. Separate school-user identities can be added later with tenant-specific memberships.

## Executed deployment sequence

The reviewed sequence was executed with ignored, environment-specific config copies under `.data/remote/`. The placeholders in the checked-in templates remain untouched.

```sh
cd /Users/bss/DeveloperTools/Expansion/Worktrees/wwk-commercial-poc/commercial-poc/staging

# 1. Create once; record the returned UUID in both reviewed config copies.
npx wrangler d1 create wwk-commercial-staging

# 2. Re-run local acceptance after replacing only reviewed placeholders.
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
npx wrangler deploy --dry-run -c collector/wrangler.jsonc
npx wrangler deploy --dry-run -c portal/wrangler.jsonc

# 3. Remote database and secret. These are state-changing and require action-time review.
npx wrangler d1 migrations apply DB --remote -c portal/wrangler.jsonc
npx wrangler secret put IDENTITY_HMAC_KEY -c portal/wrangler.jsonc

# 4. Deploy Workers. workers.dev and preview URLs remain disabled; reviewed routes/domains are required.
npx wrangler deploy -c collector/wrangler.jsonc
npx wrangler deploy -c portal/wrangler.jsonc
```

The Access application and administrator-only Allow policy are configured for the portal hostname. An unauthenticated edge request receives a Cloudflare Access redirect containing the expected audience. The public collector has no Access policy and its minimal health route returns HTTP 200.

## Deployment verification — November 2, 2026

- Collector Worker and portal Worker deployed to their custom staging domains.
- Remote D1 migrations and deterministic synthetic seed completed.
- Portal Worker redeployed with the Access audience value and preserved HMAC secret.
- Cloudflare Access login succeeded for the provisioned administrator.
- Administrator switching verified for Jersey Shore, Manhattan, and Northwest Philadelphia.
- Fresh local acceptance: 52/52 tests passed, static findings 0, reconciliation true, both dry-run bundles successful, and workerd E2E successful.
- Missing Access and wrong-audience requests remain fail-closed in automated verification.
- Public WWK pages and production placement logic remain unchanged.

## Seed and live data decision

The deterministic seed is synthetic and proves reporting behavior. If a remote staging database uses it, generate the SQL locally and execute it only after review:

```sh
node scripts/build-seed.mjs
npx wrangler d1 execute DB --remote -c portal/wrangler.jsonc --file <REVIEWED_GENERATED_SEED_SQL>
```

Before a real pilot, choose either a clean database or a clearly labeled synthetic-demo database. Synthetic and real pilot metrics must never share a report window.

## Release gates

- Complete tests, static findings 0, reconciliation true, two dry-runs exit 0, workerd E2E true.
- Exact Access identity matrix: administrator → all present and future tenants; ordinary owner → PA/NJ only; partner → Manhattan only; missing/wrong audience 403.
- Platform privacy, WAF/rate-limit, retention and incident access reviewed.
- Phase 2 editorial wording and campaign dates approved.
- Collector hostname inserted into the Phase 2 proposal; patched pages reverified before any public release.
- Rollback owner and evidence capture confirmed.

