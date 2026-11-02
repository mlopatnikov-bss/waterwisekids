# WWK Commercial POC — Architecture decision record and threat model

Status: **Phase 1 local vertical slice.** Not approved for deployment. Nothing here touches the live site, DNS, Cloudflare, GTM, GA4, Search Console, schedulers or any external account.

## ADR-001: Stack

**Decision.** Plain Node.js (>= 22.13) using only built-in modules: `node:http`, `node:sqlite`, `node:test`, `node:crypto`. Zero npm dependencies. The portal is rendered on the server with no client JavaScript.

**Context.** The WWK repo is a static site on Cloudflare Pages, and its `functions/_middleware.js` is a deliberate no-op. The POC must run locally with tests, avoid heavy installs on the operator Mac (which has a strict external-disk policy), and be able to move to an edge runtime later.

**Why this stack.**
- **No install step.** There is no `node_modules`, no build and no supply-chain surface. Every command is `node …`.
- **Portable storage.** The SQL is plain SQLite (`src/schema.sql`), so it ports to an edge SQLite store (for example D1) or to Postgres with only minor dialect changes. Choosing the host is a Phase 3 decision, not made here.
- **Transport-free core.** Validation and ingestion live in plain functions (`validateEvent`, `ingestBatch`), so a later edge handler wraps the same code. Nothing in `src/` depends on the local HTTP server.
- **Server-rendered HTML.** It allows a strict CSP (`default-src 'none'`), makes accessibility and rendering easy to check, and needs no framework.

**Trade-offs.**
- There is no TypeScript typecheck. That would need a dependency, so `scripts/static-checks.mjs` runs `node --check`, lint rules, a secret scan and a personal-data scan instead.
- `node:sqlite` is still flagged experimental in Node 22. `src/db.mjs` silences that one warning and nothing else.
- A larger product will probably want a typed framework. The domain modules are kept framework-free so that migration stays cheap.

## Components

```
WWK page (Phase 2) ──beacon──▶ collector (src/http-collector.mjs → src/collector.mjs → src/events.mjs)
                                   │  validate · allowlist · tenant ownership · dedupe · count outcomes
                                   ▼
                               events ──▶ daily rollups (src/rollup.mjs) ──▶ data quality (src/quality.mjs)
                                                         │
sponsor import (counts only) ─▶ conversions (src/conversions.mjs)
                                                         ▼
                        portal (src/portal/*) ── TenantScope (src/scope.mjs) ── membership check
```

| Module | Responsibility |
|---|---|
| `src/manifest.mjs`, `scripts/build-manifest.mjs` | Reads the repo sources read-only and merges them with the official-site snapshot. Reports conflicts and never guesses status. |
| `src/registry.mjs` | Loads the manifest into storage and builds the in-memory allowlist registry. |
| `src/events.mjs` | Schema v1 checks: shape, PII rejection, registry ownership checks, time windows and the semantic dedupe key. |
| `src/collector.mjs` | Idempotent ingest. Every delivery is validated and deduplicated individually; callers choose only how many deliveries share a transaction (HTTP: one request of at most 25; local seed: `SEED_TX_BATCH`, default 5000). Counts outcomes; never stores payloads. |
| `src/http-collector.mjs` | Local transport: CORS allowlist, size and batch caps, in-memory rate limit. Ignores cookies, IP and user agent. |
| `src/rollup.mjs` | Idempotent daily rollups, plus reconciliation of rollups against raw events. |
| `src/conversions.mjs` | Aggregate imported conversions. The tenant comes from the authenticated scope; a newer import supersedes an older one instead of being added to it. |
| `src/quality.mjs` | Freshness, completeness, funnel integrity (per placement-day: views ≥ viewable ≥ card clicks ≥ sponsored-card clicks to the official site; ordinary listings are excluded from the last rule), ingest rates, reconciliation, conversion staleness, anomalies, pending locations, and the machine-readable health summary. |
| `src/scope.mjs` | `TenantScope`: the only read path the portal uses. Every statement binds `tenant_id`. |
| `src/portal/*` | Demo auth adapter, HTTP handler, server-rendered views, CSS. |
| `src/synthetic.mjs` | Deterministic fixture generator with its own independent expected totals. |

## Security and privacy decisions

1. **Personal data never enters the pipeline.**
   - The event schema is an allowlist. Unknown fields are rejected, and any field name that looks like PII (email, phone, ip, user_agent, name, child, student, zip, lat/lon, fingerprint, device_id, …) is rejected as `pii_field`.
   - Every string value is scanned for email, phone, IPv4/IPv6 and long digit runs, and rejected as `pii_value`.
   - Page paths are lowercase paths only; `?` and `#` are rejected.
   - Timestamps are stored truncated to the minute.
   - Rejected payloads are counted by reason code only. The payload is never written. Tests dump every table to prove planted values are absent.
2. **No IP address, user agent or cookies are stored.** The HTTP collector never reads the user agent or `X-Forwarded-For` and ignores cookies. The rate limiter keeps socket addresses in a fixed-window map in memory, which is cleared every window and never persisted.
3. **`page_view_id`** is a random nonce generated per page load (Phase 2 client), used only for semantic dedupe. It must not be stored on the client, so it cannot link page views or visitors together. Raw events can be purged after rollups are final (`purgeRawEvents`), and daily aggregates survive the purge.
4. **Tenant ownership on ingest.** The event's school, campaign, placement, page, destination and location must all belong to the claimed tenant, and the placement must be linked to that campaign, page and destination. Any mismatch is rejected (`cross_tenant_reference`, `*_mismatch`, `*_not_allowed_for_placement`). Destinations are referenced by opaque ID, never by URL, so the collector can't be used to record arbitrary URLs. Destination hosts are allowlisted (`britishswimschool.com`).
5. **Tenant isolation on read.**
   - Portal code can get data only through `scopeForSession`, which checks `tenant_memberships` on every request.
   - Inside `TenantScope`, only two helpers touch the database and both bind `tenant_id` as parameter 1. A test parses every SQL string in the class to enforce this.
   - Non-member, unknown and malformed tenant IDs all return the same 404, so tenants can't be enumerated.
   - Display names and query parameters are never used for authorization.
6. **Authentication.**
   - Demo mode exists only to test isolation. It binds to loopback only (the server refuses any other host), refuses to run with `NODE_ENV=production`, signs sessions with HMAC-SHA256 using a random per-process key, and sets HttpOnly, SameSite=Strict cookies. Memberships are re-read on every request, so revoking one takes effect immediately.
   - Production mode deliberately throws `ProductionAuthNotConfigured`. The target is a managed identity or access provider whose verified assertion maps to `users.auth_subject`. No passwords are stored anywhere.
7. **Web hardening.**
   - CSP `default-src 'none'; style-src 'self'; form-action 'self'; frame-ancestors 'none'`.
   - No scripts, inline styles or inline event handlers; tests assert all three.
   - All template output is auto-escaped (`src/portal/html.mjs`). POST requests are checked for same origin. Pages are sent with no-store caching, nosniff and DENY framing.
8. **Commercial integrity.**
   - Sponsored placements must have `link_rel = 'sponsored noopener'`. Sponsored campaigns must carry the disclosure label `Sponsored pilot`, and price must be 0. These are enforced by schema CHECK constraints.
   - Ordinary listings are measured only as an editorial baseline and cannot receive `sponsored_click` events.
   - The portal labels every metric Observed, Reported or Derived. It states "a click is not a lead" and "correlation, not attribution", and never adds clicks to leads.
9. **Status is never guessed.**
   - A location gets a placement or destination only when the official site lists it, the WWK directory lists it, and no no-classes notice or address conflict was seen.
   - Anything else is held at `needs_owner_confirmation` or `needs_address_confirmation`, and the conflict is reported in `docs/SOURCE-CONFLICTS.md`.

## Threat model (STRIDE, Phase 1 scope)

| Threat | Vector | Mitigation in Phase 1 | Residual / later phase |
|---|---|---|---|
| **Spoofing** a sponsor user | Forged or replayed session cookie | HMAC-signed token with expiry and a random per-process key; tests cover payload swap, tampered signature and foreign key | Demo auth is not security. Phase 3 needs managed identity, MFA and session revocation. |
| **Spoofing** a tenant in events | Attacker posts events claiming tenant X | Full ownership chain checked against the registry; unknown or cross-tenant IDs rejected | A public collector accepts forged *valid-looking* events for real placements, so totals can be inflated. Needs edge bot filtering, per-origin rate limits and anomaly flags (in place), plus optional signed placement tokens. |
| **Tampering** with totals | Duplicate or replayed events | Event-ID idempotency plus semantic dedupe per page view, placement, type and destination; reconciliation check | Clock-skew window is ±5 min future / 72 h late. |
| **Tampering** with conversions | Sponsor inflates reported leads | Labeled Reported with source, method and confidence; latest import supersedes; audit log | Reported data stays self-reported by definition. |
| **Repudiation** | Disputes over data changes | `audit_log` for manifest loads, rollups and imports | Production needs append-only logging stored off-host. |
| **Information disclosure** across tenants | ID guessing, URL tampering, SQL without tenant filter | Membership check on every request, identical 404s, every scoped statement binds `tenant_id`, opaque IDs | Production should add row-level security in the database. |
| **Information disclosure** of visitors | PII in payloads or query strings, IP/UA logging | Allowlist schema, PII rejection, nothing stored from transport metadata, minute-precision timestamps | Edge platform access logs are out of scope here and must be configured in Phase 3. |
| **Denial of service** | Floods to the collector | Body cap (51 KB), 25-event batch cap, 2 KB per-event cap, rate limiter | Needs edge rate limiting and WAF; the in-memory limiter is per process. |
| **Elevation of privilege** | Demo mode reachable in production | Loopback-only bind, refuses `NODE_ENV=production`, production mode refuses to start | Release checklist must verify demo code is excluded from deployed builds. |
| **Phishing / brand misuse** | Collector records arbitrary outbound URLs | Destinations are ID-referenced and allowlisted per placement | — |

## Data retention (proposed)

- **Raw events:** keep 30 days after the day's rollup is final, then `purgeRawEvents`.
- **Daily rollups:** keep for the life of the contract plus 13 months.
- **Ingest outcome counters:** 13 months.
- **Conversion records:** keep for the life of the contract. The sponsor can request deletion.
- **Audit log:** 24 months.

These are proposals for owner review. They are not implemented as schedulers, because no scheduler is authorized in Phase 1.
