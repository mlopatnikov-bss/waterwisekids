# Event schema v1 (privacy-safe)

The collector accepts JSON objects with **exactly** these fields. Any other field is rejected. If the field name looks like personal data, the rejection reason is `pii_field`; otherwise it is `unknown_field`. The payload is never stored. Body: a single event object, or `{ "events": [ … ] }` with at most 25 events. Each event is at most 2 KB. Content-Type is `application/json` or `text/plain` (the latter for `navigator.sendBeacon`).

| Field | Type | Rule |
|---|---|---|
| `v` | integer | Must be `1` |
| `event_id` | UUID v4 | Client-generated. This is the idempotency key. |
| `type` | enum | `eligible_view`, `viewable_impression`, `sponsored_click`, `outbound_click` |
| `occurred_at` | ISO-8601 UTC (`Z`) | No more than 5 min in the future and no more than 72 h old at receipt; must fall inside the campaign window. Stored truncated to the minute. |
| `site_host` | string | Allowlisted (`www.waterwisekids.com`). Not stored. |
| `page_path` | string | Lowercase path, `[a-z0-9-_./]`. Must not contain `?`, `#` or `..`. Must be one of the placement's allowlisted pages. |
| `tenant_id`, `school_id`, `campaign_id`, `placement_id` | opaque ID | Must exist and form one ownership chain within a single tenant. |
| `location_id` | opaque ID or null | Optional. If present, it must match the placement's featured location or the destination's location. It is derived server-side either way. |
| `destination_id` | opaque ID | Required for `outbound_click`; forbidden for other types. Must be allowlisted for the placement, on an allowlisted host. |
| `page_view_id` | UUID v4 | Random per page load. Used only for dedupe and never persisted on the client. |
| `referrer_category` | enum | `direct`, `search`, `social`, `email`, `internal`, `other`, `unknown`. Computed client-side; the raw referrer is never sent. |
| `device_class` | enum | `mobile`, `tablet`, `desktop`, `unknown`. Computed client-side; the user agent is never sent. |
| `viewability` | object | Required for `viewable_impression` only: `{ visible_ratio: 0.5–1, visible_ms: ≥ 1000 }` (IAB/MRC display standard). |

**Dedupe.**
- A repeated `event_id` is recorded as a `duplicate_event_id` outcome and is not stored again.
- A second event with the same `page_view_id`, `placement_id`, `type` and destination is recorded as `duplicate_semantic`.
- So each page view yields at most one eligible view, one viewable impression and one sponsored click per placement, and one outbound click per destination.

**Value scanning.** Every string value is scanned for email addresses, phone numbers, IPv4/IPv6 addresses and runs of 9 or more digits. A match is rejected as `pii_value`.

**Imported conversions** do not go through the public collector. `importConversions(db, scope, batch)` takes:

```json
{
  "import_id": "uuid-v4",
  "method": "manual_entry | csv_upload | booking_system_export | crm_export | call_tracking_export",
  "source_label": "short text, [A-Za-z0-9 ()-_.,/], no contact data",
  "confidence": "high | medium | low",
  "rows": [
    { "conversion_date": "YYYY-MM-DD", "conversion_type": "assessment_start | call | qualified_lead | enrollment",
      "location_id": "loc_… or null", "attribution_basis": "self_reported_wwk_mention | utm_matched_in_sponsor_system | self_reported_any_source",
      "count": 0, "estimated_value_cents": null }
  ]
}
```

- The tenant comes from the authenticated scope. A `tenant_id` field in the payload is refused.
- Only aggregate counts are accepted: no names, contact details, notes or child data.
- Re-sending an `import_id` does nothing. A newer import for the same date, type, location, basis and method replaces the older value; it is never added to it.

**UTM contract (for Phase 2).** Outbound links will carry:
- `utm_source=waterwisekids`
- `utm_medium=sponsored_pilot` for sponsored cards, or `referral` for ordinary listings
- `utm_campaign=<campaign_id>`
- `utm_content=<placement_id>`

The opaque IDs reveal nothing to the sponsor's analytics beyond the campaign itself.

**Rejection reason codes:** `not_an_object`, `forbidden_key`, `unknown_field`, `pii_field`, `pii_value`, `missing_field`, `unsupported_schema_version`, `invalid_event_id`, `invalid_event_type`, `invalid_timestamp`, `invalid_site_host`, `page_path_query_or_fragment`, `invalid_page_path`, `invalid_id`, `invalid_page_view_id`, `invalid_referrer_category`, `invalid_device_class`, `missing_destination`, `unexpected_destination`, `missing_viewability`, `below_viewability_threshold`, `unexpected_viewability`, `host_not_allowed`, `unknown_tenant`, `unknown_school`, `unknown_campaign`, `unknown_placement`, `unknown_destination`, `cross_tenant_reference`, `campaign_school_mismatch`, `placement_campaign_mismatch`, `page_not_allowed_for_placement`, `sponsored_click_on_organic_listing`, `destination_host_not_allowed`, `destination_not_allowed_for_placement`, `location_mismatch`, `location_not_eligible`, `timestamp_in_future`, `timestamp_too_old`, `outside_campaign_window`.
