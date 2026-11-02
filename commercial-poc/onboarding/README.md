# WWK sponsor onboarding

Turns one reviewed **sponsor definition** into a deterministic **activation packet**. Offline only: no network, deploy, database, account or DNS action; nothing is deleted. Every production step is done by a person after an approval gate (`RUNBOOK.md`).

| File | Purpose |
|---|---|
| `SCHEMA.md` | Definition format v1 and every validation rule |
| `definitions/template.sponsor.json` | Generic starting point. It is refused until every `TODO_` value is replaced |
| `definitions/bss-pilot-2026.sponsor.json` | The live pilot (2 tenants, 4 LA Fitness locations, 7 cards). Keeps every live ID and URL |
| `definitions/bss-manhattan-pilot-2026.sponsor.json` | Manhattan expansion: a separate no-fee sponsor account (1 tenant, 7 verified venues, 2 cards: `/swim-lessons/directory/new-york.html` and the Manhattan guide `/swim-lessons/manhattan-ny.html`). No portal user; no ordinary-listing control (see `MEASUREMENT.md` §4). East Village held |
| `cli.mjs` | `validate`, `ids`, `plan` (dry-run, the default), `packet --write` |
| `src/` | `schema.mjs` (shape) · `validate.mjs` (rules) · `render.mjs` (card HTML, UTM) · `packet.mjs` (artifacts) · `repo.mjs` (read-only repo access) |
| `RUNBOOK.md` | One-day operator runbook with the six human gates |
| `LAUNCH-CHECKLIST.md` | Traffic/conversion launch checks and the success-metrics contract (portal metric keys) |
| `CONTENT-WORKLIST.md` | Evidence-based four-page worklist (Cheltenham, Howell, Brick, Toms River) |
| `MEASUREMENT.md` | Fair ordinary-listing control, aggregate enrollment import contract, pilot portal reporting rules |
| `definitions/bss-pilot-2026.controls.json` | Ordinary-listing control plan for the pilot (4 directory rows, pending gates) |
| `assets/wwk-ordinary-listing.js` | Proposed new public client for ordinary listings (shipped only as a packet diff) |
| `src/controls.mjs` · `src/conversion-import.mjs` | Control plan validation/artifacts · aggregate import contract and dry-run |
| `examples/` | Synthetic location map and totals file (no real codes or counts) |
| `src/conversion-feed.mjs` | BSS Messenger instant events → per-tenant aggregate exports (`conversion-feed` command). Exactly one basis per lead/enrollment (sponsored UTM wins over self-report); aggregates only, never PII |
| `package.json` | Self-contained scripts, no dependencies: `npm test`, `npm run onboard -- <command> definitions/<key>.sponsor.json` (run from this folder) |
| `test/` | `npm test` |
| `seo/` | Territory SEO toolkit: primary-URL map, audit and consolidation CLI, the Manhattan guide placement record, and the rollout/measurement packet (`seo/README.md`) |

## Packet contents

`summary.json` (machine summary, file hashes, pending gates) · `ids.json` · `cards/<slot>.html` · `patch-plan.json` + `patches/<slot>.diff` (insert/replace only) · `destinations.json` (UTM-tagged URLs) · `d1-preflight.sql` (read-only; must return zero rows) · `d1-upsert.sql` (idempotent, tenant-guarded, no DELETE) · `portal-memberships.sql` + `portal-access-checklist.md` · `content-worklist.{json,md}` (sitemap, canonical, inbound links, twin pages) · `rollback.md` + `rollback/remove-<slot>.diff` (+ `deactivate.sql` with `--deactivate-on`).

## Design choices

- **IDs are re-derived, not trusted.** Each ID must equal `stableId(prefix, natural key)` from `commercial-poc/src/ids.mjs`, so the pilot's live IDs are reproduced exactly.
- **Cards are byte-compatible with the live pages.** Tests compare the rendered HTML against every live card block (seven for `bss-pilot-2026`, two for the Manhattan expansion).
- **The SQL upsert is a no-op on the live pilot database** (tested against the seed built by `staging/scripts/build-pilot-seed.mjs`). The Manhattan upsert, applied to today's two-tenant database, produces exactly the three-tenant seed. Applied to the live three-tenant database, it adds only the guide placement, its page row and its eight destination rows (`test/manhattan.test.mjs`). Provenance columns are written on first insert only. Any row owned by another tenant is never overwritten.
- **Unapproved locations stay ineligible.** Until `sponsor_terms` and `source_verification` are recorded, locations are written as `needs_owner_confirmation`, which the collector refuses to count.
- **No page generator.** Cards attach only to existing pages with ≥ 400 editorial words that mention the town. New-page proposals are refused.
- **Paid campaigns are blocked by design.** The D1 schema enforces `price_cents = 0`, so a paid value needs a reviewed migration first.
