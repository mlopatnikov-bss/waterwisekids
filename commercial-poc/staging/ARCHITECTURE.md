# Phase 3 architecture and threat delta

## Decision

Use a separate Cloudflare staging service. Do not modify the live WWK Pages project or its no-op middleware.

```text
WWK public page
  └─ nonblocking beacon ──> public collector Worker ──> shared staging D1
                                                        ^
authorized school user ──> Cloudflare Worker Access ──> private portal Worker
```

Two Worker entrypoints prevent accidental route mixing. The collector has no portal route or identity code. The portal has no collector route, client JavaScript, passwords or homegrown session. The portal is server-rendered rather than routed through Workers Static Assets because the authenticated Worker context must reach every protected request.

## Authentication and authorization

1. Cloudflare Worker Access authenticates the person and provides `ctx.access`.
2. The portal checks the expected Access audience before any D1 read.
3. `ctx.access.getIdentity()` supplies the verified email. The Worker normalizes it in memory and computes `HMAC-SHA-256(secret, context + email)`.
4. Only the resulting opaque `sub_…` value is stored in `users.auth_subject`; the email and HMAC key are not stored or logged.
5. Authorization is read from D1 on every request. Ordinary school users require an explicit tenant membership. A user with an explicit `operator_roles.role = 'admin'` record may select any row in `tenants`, so newly created sponsor accounts appear automatically. Revoking either authorization takes effect on the next request. Tenant IDs, names and query parameters never grant access by themselves.

Local development uses Wrangler's Access simulation with reserved `.test` identities. These identities appear only in generated local configuration under the ignored state directory.

## Data path

- The Phase 2 client sends only schema-v1 allowlisted events. A page view uses a random in-memory nonce for dedupe and does not create a visitor profile.
- The collector accepts batches of at most 25 and caps each event at 2 KB. It reads only `Origin`, `Content-Type` and `Content-Length`.
- Validation checks shape, PII-like fields and values, ownership, page and destination allowlists, timing and viewability.
- Accepted events, aggregate outcome counters and rebuilt daily rollups are written in one D1 batch. Rejected payloads are never stored.
- Portal reads are tenant-scoped. Every `TenantScope` query binds `tenant_id` as its first parameter.

## Threat delta from Phase 1

| Threat | Phase 3 control | Residual decision |
|---|---|---|
| Public collector abused as a tracker | Exact WWK Origin CORS, allowlisted IDs/paths/destinations, no arbitrary URL, no IP/header/cookie storage, body caps | Configure Cloudflare WAF/bot/rate limits and verify request-log redaction before traffic |
| Forged portal identity | Worker Access context and audience checked before D1; HMAC subject; no identity headers trusted | Real Access application and allow policy require action-time review |
| Cross-tenant read | Fresh membership or explicit administrator role plus tenant-bound query layer; ordinary users receive an indistinguishable 404 | Add automated remote smoke for both user classes after deployment |
| Secret or email committed | Placeholder configs, required Worker secret, static scan, `.test` fixtures | Supply real identities only to Access and one-time provisioning process |
| Remote test mutation | Automated tests use local D1 only; Wrangler wrapper rejects remote command shapes | Remote rollout is a separate manual gate |
| Logging captures payload/identity | Application logs contain status, counts, reason codes and error class only | Platform request logging and incident access must be configured per `PRIVACY-OPERATIONS.md` |
| Sponsored content distorts editorial order | One labeled card, exact no-fee disclosure, sponsored links, directory order unchanged | Editorial approval and release decision remain open |

## Verification result

The accepted local run uses Wrangler 4.151.1 and Node 22. It passes the complete test suite, exact Phase 1 table hashes, exact three-tenant totals, both Worker dry-run bundles, and a real-workerd identity matrix that covers administrator access and ordinary-user isolation. See `evidence/verification.json`.

