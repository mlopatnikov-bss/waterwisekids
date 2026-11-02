# WWK Commercial POC

Status: approved for isolated design and implementation. Nothing in this branch is approved for production deployment.

## Objective

Prove that transparent sponsored placement on WaterWiseKids can create measurable value for swim schools, and give each pilot school a private portal showing its own visibility, engagement, leads, and reported enrollments.

The no-cost pilot tenants are:

1. British Swim School of Northwest Philadelphia (Mike)
2. British Swim School of Jersey Shore (Mike)
3. British Swim School of Manhattan (pilot partner)

The POC must become the evidence base for a national paid product. It must not sell or imply paid organic rankings, SEO link equity, or guaranteed enrollments.

## Product rules

- Organic directory order remains editorial and is never sold.
- Paid or pilot inventory is visually separate and labeled `Sponsored`.
- Production paid links will use `rel="sponsored"`.
- Pilot placements are valued at $0 and still labeled `Sponsored pilot` so the experiment matches the future product.
- Each tenant sees only its own schools, locations, campaigns, placements, events, and conversions.
- WWK distinguishes observed metrics from inferred or self-reported metrics.
- No child, student, family, phone, email, IP address, fingerprint, or other personal data is collected by the POC event pipeline.
- No production deployment, DNS, Cloudflare, Google Tag Manager, Search Console, or analytics-account change occurs without a separate reviewed release decision.

## Measurement model

### Directly observed by WWK

- Sponsored placement eligible page views
- Viewable sponsored-card impressions
- Sponsored-card clicks
- Official-school outbound clicks
- Landing page, placement, campaign, school, and location IDs
- Referrer category, device class, and timestamp at a privacy-safe aggregate level

### Imported or reported

- Assessment starts
- Calls
- Qualified leads
- Enrollments
- Estimated enrollment value

Imported/reported conversions must always show their source and confidence. They must never be presented as WWK-observed facts.

### Search visibility

Google Search Console data may later be imported for WWK pages assigned to a tenant. It must be labeled `WWK search visibility`, not the sponsor's corporate-site search performance. No Google rank scraping.

## POC architecture

1. **WWK placement component**
   - Reusable sponsored card with explicit label.
   - Stable `tenant_id`, `school_id`, `campaign_id`, `placement_id`, and `location_id` attributes.
   - Viewability measurement with `IntersectionObserver`.
   - Outbound links with campaign UTMs.
   - No rendering dependency on the collector: WWK remains usable if tracking is unavailable.

2. **Privacy-safe collector**
   - Validates an allowlisted event schema.
   - Rejects unknown tenants, campaigns, placements, hosts, and destinations.
   - Does not retain raw IP, user agent, URL query strings, or PII.
   - Idempotency/deduplication and rate limiting are designed before deployment.
   - Local POC uses fixtures and a local database; production target is a separately deployed edge service.

3. **Tenant portal**
   - Account-scoped overview and date range.
   - Visibility funnel: eligible views -> viewable impressions -> clicks -> reported leads -> reported enrollments.
   - Daily trend, placement/page performance, location performance, and destination performance.
   - Definitions and source badges on every metric.
   - Data freshness and incomplete-data warnings.
   - Accessible responsive design consistent with WWK.
   - POC authentication adapter with hard separation between demo mode and production auth. Production target: managed identity/access; no homegrown password storage.

4. **Daily rollup and operations**
   - Daily tenant/campaign/location/page rollups.
   - Data-quality checks and anomaly flags.
   - Machine-readable health summary for a future 24/7 agent loop.
   - Daily monitoring; weekly optimization; monthly sponsor-facing report.

## Minimum data model

- tenants
- users / tenant membership
- schools
- locations
- campaigns
- placements
- placement_pages
- events
- daily_metrics
- conversion_imports
- conversion_records
- data_quality_runs
- audit_log

IDs are opaque and stable. Display names are never authorization boundaries.

## Pilot inventory

The seed manifest must be generated from current verified sources, not memory. WWK currently contains:

- Northwest Philadelphia territory and location data
- Jersey Shore territory and location data
- Manhattan territory data and multiple verified venue records in `swim-lessons/directory/schools-geo.json`

The current official operator pages remain the authority for active status and destination URLs. Conflicts must be reported, not silently resolved.

## Success criteria

### Technical gate

- Tenant isolation tests prove no cross-tenant reads.
- Event validation rejects malformed, unknown, and PII-shaped payloads.
- Synthetic event-to-dashboard totals reconcile exactly.
- Duplicate events do not inflate totals.
- Tracking failure never blocks outbound navigation.
- Portal meets keyboard and basic mobile accessibility checks.
- No secret, production credential, or personal data is committed.

### Pilot gate

- At least 30 baseline days and 60 sponsored-placement days per market, unless traffic is too low and the observation window is extended.
- Daily data completeness is visible.
- Sponsored CTR and outbound-click lift are compared with a documented baseline.
- At least one conversion-import method is usable by each pilot tenant.
- Reports distinguish correlation from attribution.
- A school owner can understand value without a WWK operator explaining the dashboard.

### Commercial gate

- Demonstrable exposure and engagement lift over ordinary listings.
- Credible lead/enrollment evidence or a documented traffic-volume limitation.
- Sponsor-ready case study with definitions, dates, limitations, and reproducible totals.
- Pricing is not set until the pilot yields acquisition and retention evidence.

## Delivery phases

### Phase 1 — local vertical slice

- Architecture decision record and threat model
- Seed manifest for three pilot tenants
- Synthetic event generator and fixtures
- Local collector and storage
- Tenant-isolated portal overview
- Daily rollups and data-quality report
- Tests and local runbook

### Phase 2 — WWK instrumentation proposal

- Sponsored-card component
- Tracking client and UTM contract
- Exact proposed WWK page inventory
- Before/after diffs only; no live apply

### Phase 3 — reviewed staging deployment

- Hosting/auth/database selection
- Secrets and access provisioning
- Private staging deployment
- End-to-end synthetic and privacy QA

### Phase 4 — pilot release

- Owner approval
- Production sponsored placements
- Portal accounts for the three pilot tenants
- Daily monitoring and weekly optimization loop

## 24/7 agent boundaries

Agents may monitor health, freshness, broken links, data completeness, anomalies, campaign pacing, and experiment results; generate reports; and prepare proposed changes.

Agents may not autonomously create mass city pages, scrape Google rankings, invent claims, change sponsor status, publish prices, alter attribution definitions, access another tenant, deploy production, or contact a sponsor.

## Immediate implementation decision

Claude implements Phase 1 only in this isolated branch. Codex reviews code, tests, privacy boundaries, and evidence. Any correction round stays in the same worktree. No commit, push, merge, deployment, scheduler, or external-account mutation is authorized in Phase 1.
