# Sponsor definition — schema `wwk.sponsor-definition` v1

One JSON file per sponsor engagement, in `definitions/<definition_key>.sponsor.json`. Code of record: `src/schema.mjs` (shape) and `src/validate.mjs` (rules). `test/validate.test.mjs` checks that this page names every field.

**Every object is closed:** an unknown field is an error. Strings are trimmed, have no markup (`<`, `>`) and no control characters. Dates are real `YYYY-MM-DD` calendar dates.

**No sensitive identity values.** No email address, phone number, IP address or 9+ digit run may appear anywhere (`pii_value`). Analytics keys (`definition_key`, `slot_key`, `campaign_key`, `invite_ref`) may not name contact or personal data. Portal users are referenced only by an opaque `invite_ref`; the real address stays with the operator and goes only into Cloudflare Access.

## Top level

| Field | Type | Rule |
|---|---|---|
| `schema` | `"wwk.sponsor-definition"` | fixed |
| `schema_version` | `1` | fixed |
| `definition_key` | key | `^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$`; also the default packet folder name |
| `prepared_on` | date | facts may not be observed after it; default `--as-of` for fact age |
| `site` | object | `host` = `www.waterwisekids.com`, `collector_url` = `https://events.waterwisekids.com/v1/collect` (both pinned), `component_version` = asset cache key (`p2r2` today) |
| `destination_hosts` | string[1–4] | public DNS names the sponsor's official pages live on; never an IP, `localhost` or a WWK host |
| `markets` | object[] | `market_key`, `state` (2 letters), `label`, `place_names` (proper nouns the page must mention; matched case-sensitively as whole words) |
| `page_inventory` | object[] | `page_path`, `market_key`, `page_status`. Only `existing` is accepted; `proposed_new` is refused with `new_page_not_supported` (there is no page generator) |
| `tenants` | object[1–6] | one per sponsor territory (portal tenant), below |
| `portal` | object | `users[]`: `invite_ref`, `display_label` (a role label, never a person's name), `memberships[]` of `{ tenant_key, role: owner \| viewer }` — only tenants in this definition |
| `approvals` | object[6] | exactly one per gate: `gate`, `status` (`pending` \| `recorded`), `recorded_on`, `evidence_ref` (repo path that must exist when recorded) |

Gates (in order): `sponsor_terms`, `source_verification`, `editorial_review`, `preview_qa`, `portal_access`, `activation`. The tool never records a gate; a human edits the definition.

## Tenant

| Field | Rule |
|---|---|
| `tenant_key`, `tenant_id` | `tenant_id = stableId('ten', territory_url)` |
| `display_name`, `timezone` | US IANA zone |
| `school` | `school_id = stableId('sch', territory_url)`, `display_name` (must equal the official snapshot's school name when cited), `territory_url` (https, normalized, ends `/`, host in `destination_hosts`, no query/fragment/port/credentials) |
| `locations[]` | `location_key`, `location_id = stableId('loc', official_url)`, `display_name`, `market_key`, `official_url` (must sit **under** `territory_url` — ownership), `address_display`, `facts[]` |
| `destinations[]` | `destination_id`, `kind` (`territory` \| `location`), `location_key` (null for territory). Exactly one territory destination and one per location. `destination_id = stableId('dst', url)` |
| `campaign` | below |
| `placements[]` | below |

### Facts (`facts[]`)

`fact_key` (`address` \| `location_page` \| `territory_page` \| `venue_name`), `value`, `source` (`official_snapshot` \| `repo_directory_data` \| `operator_written_confirmation`), `source_ref` (repo-relative path), `source_url`, `observed_on`.

- `address_display` must equal a cited `address` fact and `official_url` a cited `location_page` fact (`uncited_fact`).
- `official_snapshot` facts are checked against the snapshot JSON: same territory, URL, address, venue name and `observed_on`; a location with `no_classes_notice` or not listed on the territory page is refused (`location_not_offering`).
- Facts older than 120 days at `--as-of` are `stale_fact`. `operator_written_confirmation` is accepted with a warning (the evidence lives outside the repo).

### Campaign (`campaign`)

`campaign_key`, `campaign_id = stableId('cmp', territory_url + '#' + campaign_key)`, `kind` (`sponsored_pilot` only), `display_name`, `disclosure_label` (must be `Sponsored pilot` — D1 constraint), `disclosure_text` (must contain "Sponsorship does not change directory order or editorial content." and, when free, "No-fee"), `starts_on`, `ends_on` (≤ 366 days), `price_cents`, `currency` (`USD`).

`price_cents > 0` is refused with `campaign_value_requires_schema_migration`: migration 0001 enforces `price_cents = 0` and `pilot_price_cents = 0`. Paid campaigns need a reviewed migration first.

### Placement (`placements[]`)

`slot_key`, `placement_id = stableId('plc', territory_url + '#' + slot_key)`, `page_path` (`/lowercase/path.html`; not under `commercial-poc/`, `assets/`, `functions/`, `docs/`, `tools/`; no `..`), `market_key` (must match the inventory row), `variant` (`featured_location`: exactly one location in the same market; `venue_list`: 1–7 locations; the cap is `MAX_PLACEMENT_LOCATIONS` in `src/schema.mjs`, also enforced by `render.mjs`), `location_keys` (this tenant's only — another tenant's is `ownership_conflict`), `indent` (spaces, to match the page), `anchor` (`type` = `existing_marker` with `text` null, or `insert_after` with the exact unique line `text`).

Page rules, read from the repo: file exists; ≥ 400 editorial words **excluding any sponsored card** (`thin_content`); mentions a market place name (`irrelevant_page`); carries no other sponsored placement (`ownership_conflict`); canonical equals the page URL (warning otherwise).

## Cross-definition ownership

Every ID, location URL and page is compared with `seed/pilot-manifest.json` and with every other definition in `definitions/`. The same ID or location under a different tenant, or a page already carrying a different sponsored placement, is `ownership_conflict`.

## Error codes

`unknown_field`, `missing_field`, `invalid_type`, `invalid_value`, `too_few`, `too_many`, `template_placeholder`, `pii_value`, `duplicate_key`, `id_mismatch`, `bad_host`, `bad_url`, `host_not_allowed`, `ownership_conflict`, `unknown_location`, `unknown_market`, `market_mismatch`, `destination_invalid`, `missing_disclosure`, `campaign_value_requires_schema_migration`, `uncited_fact`, `fact_mismatch`, `source_missing`, `stale_fact`, `location_not_offering`, `unsafe_path`, `page_not_found`, `page_not_in_inventory`, `thin_content`, `irrelevant_page`, `new_page_not_supported`, `anchor_not_found`, `approval_incomplete`, `evidence_missing`, `malformed_card_block`.

## Field index

`schema`, `schema_version`, `definition_key`, `prepared_on`, `site`, `host`, `collector_url`, `component_version`, `destination_hosts`, `markets`, `market_key`, `state`, `label`, `place_names`, `page_inventory`, `page_path`, `page_status`, `tenants`, `tenant_key`, `tenant_id`, `display_name`, `timezone`, `school`, `school_id`, `territory_url`, `locations`, `location_key`, `location_id`, `official_url`, `address_display`, `facts`, `fact_key`, `value`, `source`, `source_ref`, `source_url`, `observed_on`, `destinations`, `destination_id`, `kind`, `campaign`, `campaign_key`, `campaign_id`, `disclosure_label`, `disclosure_text`, `starts_on`, `ends_on`, `price_cents`, `currency`, `placements`, `slot_key`, `placement_id`, `variant`, `location_keys`, `indent`, `anchor`, `type`, `text`, `portal`, `users`, `invite_ref`, `display_label`, `memberships`, `role`, `approvals`, `gate`, `status`, `recorded_on`, `evidence_ref`
