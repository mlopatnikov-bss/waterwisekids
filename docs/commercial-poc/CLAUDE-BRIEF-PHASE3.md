# Claude task: WWK Commercial POC — Phase 3 staging implementation

Read the plan, accepted Phase 1 verification, accepted Phase 2 proposal/evidence, and this brief in full before acting.

## Decision

Implement a separate Cloudflare staging service; do not change the existing WWK Pages project or its no-op middleware.

Use two Workers sharing one staging D1 database:

1. `wwk-commercial-collector-staging`: public collector endpoint for browser beacons, with strict WWK-origin CORS and no portal routes.
2. `wwk-commercial-portal-staging`: private, server-rendered tenant portal protected by Cloudflare Worker Access. Do not rely on Workers Static Assets for authenticated routes because Access identity is not propagated through the static-assets router. Render the small CSS/HTML responses from Worker code.

This turn builds and fully validates the local staging implementation under `commercial-poc/staging/`. Prepare reviewed Wrangler configuration, D1 migrations and exact remote deployment commands, but do not create remote Cloudflare resources, policies, secrets, custom domains, routes or deployments yet. Those require final identities/account context and a separate action-time review.

## Required implementation

### Runtime and storage

- Cloudflare Workers module syntax and D1 bindings, current Wrangler v4-compatible configuration.
- One D1 staging schema/migration for the Phase 1 model, adapted only where the edge runtime requires it.
- Deterministic staging seed using the accepted three-tenant manifest and synthetic dataset.
- Idempotent seed/migrations and exact reconciliation with Phase 1 totals.
- Collector and portal may share pure domain modules, but their HTTP entrypoints and exposure remain separate.

### Public collector Worker

- `POST /v1/collect` and minimal `/v1/health` only.
- Accept `text/plain` and `application/json`, strict body/event limits and batch max 25.
- CORS only for `https://www.waterwisekids.com`; no wildcard, no reflected unknown origin.
- Validate the accepted Phase 1 schema, entity ownership, page/destination allowlists, timing, viewability and dedupe.
- Store no raw IP, request headers, cookie, Referer, user agent, arbitrary URL/query string or rejected payload.
- Response/logging must contain counts/reason codes only; never echo payloads.
- Tracking failure remains non-blocking in the Phase 2 client.
- Document platform-level privacy prerequisites: request logging/observability, WAF/bot/rate-limit configuration, retention and incident access.

### Private portal Worker

- Require `ctx.access`; reject missing identity before reading tenant data.
- Map the Access identity to an opaque auth subject using HMAC-SHA-256 with a Worker secret. Do not commit email addresses or the HMAC key. Tests use reserved `.test` identities only.
- Membership is rechecked on every request. URL/display names never grant access.
- Server-render the accepted portal views with tenant switching, date range, KPIs, funnel, trends/tables, placement/location/destination performance, reported conversions, definitions, freshness and quality warnings, empty/error states.
- Security headers, no client-side portal JavaScript, no homegrown passwords/sessions.
- Do not expose an operator-wide health endpoint to tenant users. Tenant health stays scoped; an operator health route, if included, must require a separate operator role.

### Local staging and tests

- Use local Wrangler/D1 only; never connect a remote binding in automated tests.
- Provide scripts for local migration, seed, collector/portal startup, verification and teardown. Teardown targets only the staging-local state directory.
- Tests must cover collector privacy/PII rejection, event ownership/dedupe, exact D1 reconciliation, CORS, tenant isolation, missing/forged Access context, identity HMAC mapping, revocation, portal output, security headers, production refusal when required bindings/secrets are absent, and no public WWK source changes.
- Include an end-to-end local flow: Phase 2 client fixture -> collector Worker -> D1 -> portal Worker, with two identities proving own-tenant 200 and cross-tenant 404.
- Preserve the external-storage policy. No internal `node_modules` or `.wrangler` build/cache. Codex will install/run dependencies through `dev-external` after Claude's implementation is idle.

## Configuration and secrets

- Commit only placeholder binding names and `.dev.vars.example`; never a real account ID, database ID, email, token, audience, HMAC key or credential.
- Provide a deployment worksheet listing the exact values that must be supplied later: Cloudflare account, D1 database ID, Worker names, Access policy/application, authorized owner identity, authorized Manhattan identity, HMAC secret, allowed collector origin, real campaign dates and retention.
- Do not create or change Cloudflare Access in this turn.

## Evidence required

Return architecture/threat changes, exact paths, dependency/version rationale, migrations, local commands, tests/results, three-tenant reconciliation, privacy evidence, tenant-isolation and Access evidence, end-to-end evidence, deployment worksheet, rollback plan, known limitations, and confirmation that WWK public source, live Pages, Cloudflare account, DNS, GTM/GA4/Search Console, schedulers and external identities were untouched.
