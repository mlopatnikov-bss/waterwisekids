# Privacy and operating prerequisites

Application-level minimization is implemented and tested, but it is not sufficient by itself. These platform controls are release gates.

## Stored data

- Accepted event fields from the documented schema only.
- Minute-level event time, coarse device and referrer categories, opaque entity IDs and a one-page-load dedupe nonce.
- Aggregate ingest counters, daily metrics, aggregate school-reported conversions and data-quality results.
- Opaque portal auth subjects and memberships. No password, email, IP address, cookie, user agent, Referer header, arbitrary URL/query, child/family record or rejected payload.

## Required Cloudflare settings before traffic

1. Keep automatic invocation logs disabled for both Workers. If diagnostic logs are temporarily enabled, confirm query strings and request bodies are absent and restrict access to named operators.
2. Apply collector rate limits and bot/WAF rules at the platform edge. Rate-limit by platform signals without copying those signals into D1 or application logs.
3. Protect the portal with one Worker Access application. Initially allow only the reviewed administrator identity; require the account's normal MFA/identity-provider controls. Add school operators later only when their tenant memberships are provisioned and verified. Do not protect the collector with the portal policy.
4. Limit Cloudflare account roles: deployment operators, Access policy administrators and evidence viewers should be explicit.
5. Store `IDENTITY_HMAC_KEY` only as a Worker secret. Generate at least 32 random bytes. Record its custodian and rotation date outside the repository.
6. Configure alerts for sustained collector 4xx/5xx changes, portal 5xx, D1 write failures, freshness warnings and Access policy changes without logging payloads.

## Proposed retention (requires owner approval)

| Data | Proposed retention | Reason |
|---|---:|---|
| Raw accepted events | 90 days | Dedupe, short-window audit and rollup repair |
| Ingest outcome counters | 90 days | Quality and abuse trend |
| Daily aggregates | 25 months | Year-over-year commercial proof |
| Aggregate reported conversions | 25 months | Sponsor reporting and renewal analysis |
| Data-quality runs | 13 months | Reliability trend |
| Application audit records | 25 months | Access and operational review |

No purge job is enabled yet. Retention, legal/privacy wording and incident owner must be approved before live pilot collection.

## Daily commercial reporting

The portal distinguishes Observed (WWK events), Reported (school-supplied aggregate conversions) and Derived metrics. A click is not called a lead, and the dashboard states correlation rather than attribution. Daily email should summarize only tenant totals, trend and quality status and link back to the protected portal; it must not contain real identity details or raw events.

