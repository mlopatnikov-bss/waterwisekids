# Traffic and conversion launch checklist + success-metrics contract

Applies to every activation packet. Metric names are the **exact keys the portal already renders** (`src/portal/views.mjs`, `data-metric` attributes) and the thresholds are the **existing data-quality thresholds** (`staging/src/shared/quality.mjs`). Nothing here adds a metric, an event field or a tracker.

## A. Launch checklist (per placement)

Before go-live (Operator, during `preview_qa`):

- [ ] Card renders once per page, labeled **Sponsored pilot**, all links `rel="sponsored noopener"`.
- [ ] Every outbound href equals the `tagged_url` in `destinations.json`: official URL + `utm_source=waterwisekids`, `utm_medium=sponsored_pilot`, `utm_campaign=<campaign_id>`, `utm_content=<placement_id>`. No other parameters.
- [ ] `data-wwk-*` IDs on the card equal `ids.json`.
- [ ] Page canonical equals the placement page URL and the page is in `sitemap.xml` (`content-worklist.md`).
- [ ] With the collector unreachable, card links still navigate (client is non-blocking).

First hour after go-live (Operator):

- [ ] One page load → one `eligible_view` (portal Data status freshness updates).
- [ ] Scroll the card fully into view for ≥ 1 s → one `viewable_impression`.
- [ ] One card click → `sponsored_click` + `outbound_click` for that `destination_id`.
- [ ] Ingest rejection rate in Data status < 5 %; no `critical` check.
- [ ] Sponsor confirms (their analytics) a session with `utm_source=waterwisekids` and `utm_content=<placement_id>`. WWK never receives their analytics data; the sponsor reports a yes/no.

Conversion import ready within 7 days (Operator + Sponsor):

- [ ] Sponsor picks one method: `manual_entry`, `csv_upload`, `booking_system_export`, `crm_export` or `call_tracking_export`.
- [ ] Sponsor agrees to report **aggregate counts only** per day/type/location: `assessment_start`, `call`, `qualified_lead`, `enrollment`, with `attribution_basis` `utm_matched_in_sponsor_system`, `self_reported_wwk_mention` or `self_reported_any_source`. No names, contact details, notes or child data — the importer rejects them.
- [ ] First import accepted; the portal "Reported leads" tile changes from "Not reported".

## B. Success-metrics contract

### Observed (collector; exact)

| Portal metric key | Definition |
|---|---|
| `eligible_view` | Page loads where the card was on the page (one per page view per placement) |
| `viewable_impression` | ≥ 50 % of the card on screen for ≥ 1 continuous second (IAB/MRC display) |
| `sponsored_click` | Clicks on the card (one per page view per placement) |
| `outbound_click` / `outbound_click_sponsored` | Clicks to an allowlisted official destination (one per page view per destination); sponsored-card share shown separately from ordinary listings |
| `viewability_rate` | `viewable_impression ÷ eligible_view` |
| `sponsored_ctr` | `sponsored_click ÷ viewable_impression` |

### Reported (sponsor import; labeled "reported", never "attributed")

| Portal metric key | Definition |
|---|---|
| `reported_leads` | `qualified_lead + assessment_start` imported by the school |
| `reported_enrollments` | `enrollment` imported by the school |

Reports always say which `attribution_basis` was used. Only `utm_matched_in_sponsor_system` rows may be described as linked to WWK traffic; self-reported rows are described as reported.

### Data-quality floor (a metric is not reported for a period that fails these)

| Check | Threshold (from `quality.mjs`) |
|---|---|
| `freshness` | warn > 26 h since the last event, critical > 72 h |
| `completeness` | warn if < 99.9 % of expected days have data |
| `ingest_rejections` | warn > 5 % |
| `ingest_duplicates` | warn > 10 % |
| `rollup_reconciliation` | any difference is critical |
| `conversion_imports` | warn when the last import is > 14 days old |
| `anomalies` | flag days < 0.4× or > 2.5× the median (median ≥ 10) |

### Decision points (proposed — the Approver must confirm before they are used in a sponsor conversation)

| When | Question | Evidence |
|---|---|---|
| Day 7 | Is tracking healthy? | No `critical` checks; every placement has ≥ 1 `eligible_view` |
| Day 30 | Is there enough traffic to judge? | `eligible_view` per placement per day; if most placements see fewer than ~10 views/day, extend the window rather than draw conclusions (PLAN.md pilot gate) |
| Day 60 | Value case | `sponsored_ctr` and `outbound_click_sponsored` compared with a documented baseline; reported leads/enrollments with their attribution basis; limitations stated |

PLAN.md requires 30 baseline days + 60 sponsored days per market. **The live pilot loaded no organic-baseline campaign and no events before 2026-11-02**, so a pre/post baseline does not exist for it. The live pilot seed (`staging/scripts/build-pilot-seed.mjs`) also keeps only `sponsored_card` placements, so ordinary-listing clicks are not tracked either and the portal's "from your ordinary listing" figure will read 0. Until a reviewed decision adds a baseline (for example, tracking the ordinary directory listing as an `organic_listing` placement), the current pilot can report exposure and engagement but not lift. This is recorded as an open item, not a result.

### What the contract forbids

Promising rankings, SEO link equity or enrollments; calling reported conversions "attributed"; combining tenants in one sponsor-facing report; sharing any page-view-level data.
