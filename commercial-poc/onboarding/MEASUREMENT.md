# Fair comparison and aggregate attribution

This doc covers three things: how ordinary WWK listings are measured against sponsored cards, how school-reported enrollment totals come in, and how the pilot portal reports both. Everything here is offline and reviewable. Nothing is applied to pages, D1 or Cloudflare until a person approves the gate.

## 1. Ordinary-listing control (`definitions/<key>.controls.json`, schema `wwk.control-plan` v1)

| Rule | Why | Enforced by |
|---|---|---|
| The ordinary directory row is **measured, not changed**. The patch adds `data-wwk-*` attributes and one script tag. It changes no text, no order, no label and no `rel`. | Ordinary order is editorial and never sold | `controls.test.mjs`: stripping the attributes returns the original bytes; row order and hrefs are identical |
| Same events and definitions as the card: `eligible_view`, `viewable_impression` (≥ 50 % for ≥ 1 s), `outbound_click`. The listing never sends `sponsored_click`. | Like-for-like rates | `listing-client.test.mjs`; the collector rejects `sponsored_click_on_organic_listing` |
| The control window starts **no earlier than the plan date** and never before the sponsored campaign. It ends with the sponsored campaign. | No invented historical baseline | `backdated_control`, `window_mismatch`; the collector rejects earlier events as `outside_campaign_window` |
| Every featured sponsored location has exactly one control row | Coverage | `missing_control` |
| A control page must not carry the tenant's sponsored card | No contamination | `control_contaminated` |
| IDs re-derive from Phase 1's natural keys (`plc` = territory URL + `#organic:` + location URL) | Continuity with the accepted model | `id_mismatch` |
| A **new** client, `assets/js/wwk-ordinary-listing.js`. The live `wwk-sponsored.js` is never patched. | Zero risk to the live cards | packet test |

`tag_ordinary_links` (default `false`) decides whether ordinary links also carry `utm_medium=referral` tags. With `false`, the sponsor's own analytics sees UTM traffic only from sponsored cards. "UTM-matched" conversions therefore cannot be compared between the two placements. **This is an editorial decision for review.**

Packet: `packet … --controls definitions/<key>.controls.json` adds `control/` (row patches, new-asset diff, rollback diffs, `d1-control-preflight.sql`, `d1-control-upsert.sql`, `plan.json`). Without `--controls` the packet is byte-identical to before.

## 2. Aggregate enrollment import (`wwk.aggregate-conversions` v1)

Facts verified in the Alfie Jackrabbit integration spec:
- Jackrabbit has **no API**; Alfie works through browser automation.
- One Jackrabbit account covers both territories.
- Locations are identified by short internal codes.

Not verified: whether Jackrabbit stores a registration-source ("how did you hear") value or a UTM. The contract therefore makes the school **state** how each basis was computed (`basis_definitions`). The portal shows the basis next to every number.

```json
{ "schema": "wwk.aggregate-conversions", "schema_version": 1, "tenant_key": "jersey-shore",
  "source_system": "jackrabbit", "extraction": "manual_report | alfie_automation", "exported_on": "YYYY-MM-DD",
  "granularity": "day | week | month", "period": { "from": "…", "to": "…" }, "confidence": "high | medium | low",
  "basis_definitions": { "self_reported_wwk_mention": "how the school system computes it" },
  "rows": [ { "date": "…", "location_ref": "CODE", "conversion_type": "assessment_start | qualified_lead | call | enrollment",
              "attribution_basis": "self_reported_wwk_mention | utm_matched_in_sponsor_system | self_reported_any_source", "count": 0 } ] }
```

**Counts only.** The import refuses:
- any unknown column (personal-looking ones as `pii_field`);
- contact-shaped values;
- non-integer or negative counts;
- rows outside the period;
- dates that don't align to the granularity (weeks run Monday–Sunday, dated Sunday; months are dated on their last day);
- periods that start before the sponsored campaign;
- a location code that maps to **another tenant** (`location_not_in_tenant`: the operator splits the export per tenant, nothing is silently dropped).

**Location map** (`wwk.location-map` v1) translates school-system codes to WWK `location_key`s. It is operator-local: keep it outside the repo, or name it `*.local.json` (git-ignored). `examples/` holds synthetic codes only. **`commercial-poc/` is publicly served from www.waterwisekids.com, so real codes and real totals must never be committed.**

**Pipeline:** run `npm run onboard -- import-plan definitions/<key>.sponsor.json --export <file> --map <file>`.
- It is a dry-run by default and prints aggregate totals per basis only.
- It builds the Phase 1 batch and validates it with the unchanged `src/conversions.mjs` `validateImport`.
- The `import_id` is a UUIDv4 derived from the tenant and the file content, so re-sending the same file is a no-op.
- `--write --out <dir outside the repo>` writes `import/batch.json`, `d1-import-preflight.sql`, `d1-import.sql` and `summary.json`.
- The SQL matches the accepted D1 importer row-for-row. Replaying it is a no-op, the newest export wins per key, and an older export applied later never overwrites a newer one. Values are replaced, never summed.

## 2b. Conversion feed from BSS Messenger instant events (`src/conversion-feed.mjs`)

This feed avoids scraping Jackrabbit. BSS Messenger (`src/instant.js`) already records booking-page lead emails (`loc`, `pool`, `heard`, `utmSource`, `utmMedium`, …) and Jackrabbit web-registration emails (`emails`, `phones`, `pools`) in `data/growth/instant.json` and `data/growth/nj/instant.json`. Those files contain family-level PII. The adapter reads them only when they are passed explicitly, and only from outside the repo. It keeps emails and phones in memory as match keys and outputs only aggregate counts.

```bash
npm run onboard -- conversion-feed definitions/bss-pilot-2026.sponsor.json --events <pa instant.json> --events <nj instant.json> --map <location-map.local.json> --to 2026-11-15 --exported-on 2026-11-16
```

It is a dry-run by default and prints per-tenant totals, an import-compatibility check, and warning **counts** only. `--write --out <dir outside the repo>` writes `feed/<tenant>.aggregate-conversions.json` (for `import-plan`) plus `feed/summary.json`.

Rules (assumptions are marked; each is the conservative choice):
| Rule | Detail |
|---|---|
| UTM basis (authoritative) | lead `utmSource` = `waterwisekids` **and** `utmMedium` = `sponsored_pilot` (case-insensitive) → `utm_matched_in_sponsor_system`. It **wins** when present, even if the family also answered WaterWiseKids (that case adds only to the `lead_both_signals_utm_wins` warning count). `waterwisekids` with any other medium adds only to `lead_waterwisekids_other_medium`. |
| Self-reported basis | **only when the exact UTM basis is absent**: lead "How did you hear about us?" = WaterWiseKids → `self_reported_wwk_mention`. |
| One basis invariant | every lead and every enrollment carries **exactly one** basis, so a sum of rows across `attribution_basis` counts each family once. `conversion-feed.test.mjs` asserts this. |
| Lead | one `qualified_lead` per attributed lead, at its location (code via the local map, else the friendly pool name matched to the definition). Leads at unmapped or closed pools get no row but can still attribute an enrollment. |
| Enrollment | a web registration matches an attributed lead by normalized email or phone, with lead ≤ registration ≤ lead + 90 days. The **most recent** such lead wins and the enrollment inherits its single basis. The location comes from the registration. *Assumption:* counted once per (lead, location, local day), because repeated registration emails would otherwise inflate counts. A registration naming two pilot locations is skipped as ambiguous. |
| Dedupe | by kind + messageId across both files. Events without a messageId or valid timestamp are skipped and counted. |
| Zeros | every active location × bucket × type × basis gets a row, so a live 0 differs from missing data. |
| Granularity | `week` (Monday–Sunday, dated Sunday; default) or `day`. Month cannot align with the 2026-11-02 start. A weekly export cannot end on 2026-12-31 (a Thursday); use `day` for the final partial week. |
| Provenance | `source_system` = `jackrabbit`, `extraction` = `bss_messenger_instant` (an **additive** contract value; import semantics unchanged), `confidence` = `medium` (email/phone matching). |
| Location codes | real pool codes go only in the operator-local map (`*.local.json` or outside the repo). The pilot map lists the four live codes for Cheltenham, Howell, Brick and Toms River. Committed examples use synthetic codes. |

Limits: the instant files keep the last 300 events per region (`instant.js` `KEEP`). Run the feed at least weekly so older leads are not lost before their enrollment arrives. Registrations by families who never filled in the booking page are not attributed. There is no all-source total in this feed.

## 3. Pilot portal (`PORTAL_ENV = "pilot"` only; `staging/src/portal/pilot-report.mjs`)

- **No invented baseline.** The before/during block appears only when an ordinary-listing campaign really started before the sponsored one and has data in that pre-period. In the live pilot it never does.
- **Same locations, same days only.** The comparison counts only **location-paired** placements: a sponsored card that features a location, and that same location's ordinary listing (`TenantScope.pairedComparisonTotals`, tenant-bound like every scope query).
  - Regional sponsored cards with no featured location (for example `/swim-lessons/jersey-shore.html`) are excluded from the comparison but still counted in the headline sponsored figures. The table names the paired locations.
  - Days are the selected range ∩ sponsored window ∩ control window.
  - Both sides show eligible views, viewable impressions, clicks to the official site, and clicks per viewable impression. No lift percentage is shown. The caveat says it is side by side, not a controlled test.
- **One headline basis** (`selectHeadlineBasis`). Only `qualified_lead` and `enrollment` decide; `assessment_start` and `call` never do. UTM-matched wins if its total is positive, else family-reported WWK mention if its total is positive. Otherwise, if either WWK-linked basis has explicit zero rows, UTM-matched, so active zero reporting shows 0 and not "Not reported". Otherwise there is no headline. "All sources" never reaches the headline. A new **Attribution basis** table lists each basis as a separate row and says rows are never added together.
- Staging and local rendering are unchanged. `portal-output.test.mjs` still proves byte-for-byte parity with the accepted Phase 1 views.

## 4. Manhattan expansion: no ordinary-listing control (known limitation)

The Manhattan pilot (`definitions/bss-manhattan-pilot-2026.sponsor.json`) launches **without** an ordinary-listing control. This was the owner's decision on 2026-11-02, and it is a limitation, not a measurement.

- **Why no control exists.** The only Manhattan ordinary listing is the territory-level directory row `school-british-swim-school-of-manhattan-ny` on `/swim-lessons/directory/new-york.html`. The control rules in §1 refuse it for three reasons:
  - its single "Visit Website" link is the territory page, not a location page (`control_row_mismatch`);
  - it sits on the same page as the Manhattan sponsored card (`control_contaminated`);
  - each of the seven featured venues would need its own row (`missing_control`).

  `test/manhattan.test.mjs` proves the refusal. The editorial row is not edited to make it fit, and there is no other WWK page with Manhattan editorial content.
- **Not comparable anyway.** The card is a `venue_list` card with no single featured location, so §3 would exclude it from the location-paired comparison even if a control existed.
- **What the portal shows.** The Manhattan comparison section shows "Your ordinary directory listing is not measured yet" and no comparison figures. Sponsored-card visibility and clicks are reported on their own. No baseline, lift or ordinary-vs-sponsored claim may be made for Manhattan in any report.
- **Conversions.** The BSS Messenger conversion feed (§2b) covers only the PA and NJ streams. Manhattan leads and enrollments show "Not reported" unless the Manhattan school later supplies aggregate totals through `import-plan` (§2). No Manhattan location map or export exists in the repository.
- **Lifting the limitation later** would need a reviewed change: either a location-level ordinary listing on a page without the card, or a new, separately reported control type. Both require editorial and measurement-definition approval.

## Open items for review

1. Do Jackrabbit reports expose a registration-source value per new enrollment, and is "WaterWiseKids" one of its options? Until confirmed, only `self_reported_any_source` totals are certain.
2. `tag_ordinary_links`: tag ordinary links with `utm_medium=referral` or not.
3. Control window: the owner approved starting the pilot's ordinary-listing control on **2026-11-02**, the same day as the sponsored campaign, so `starts_on` is `2026-11-02`. This only opens the window. Events exist only once the reviewed row patch and client are published, so days before publication show as "no data received". They are never treated as a baseline. For future sponsors, set `starts_on` to the approved start; it can't be earlier than the plan or the sponsored campaign.
4. Directory filters can hide rows. Hidden rows still count an `eligible_view` but cannot produce a `viewable_impression`, the same as a card below the fold. That's why the comparison uses rates per viewable impression.
