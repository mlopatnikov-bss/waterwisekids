-- Migration 0001: WWK Commercial POC staging schema (Cloudflare D1).
-- This is the accepted Phase 1 schema (commercial-poc/src/schema.sql, schema v1) applied
-- unchanged: D1 is SQLite, so no dialect change was required. test/migration.test.mjs proves
-- the resulting tables, columns, constraints and indexes are identical to Phase 1.
-- D1 notes: foreign keys are always enforced; no explicit BEGIN/COMMIT (Wrangler applies
-- each migration atomically and records it in d1_migrations).


CREATE TABLE IF NOT EXISTS schema_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenants (
  tenant_id     TEXT PRIMARY KEY,
  display_name  TEXT NOT NULL,
  timezone      TEXT NOT NULL,
  pilot_status  TEXT NOT NULL CHECK (pilot_status IN ('pilot_fixture')),
  pilot_price_cents INTEGER NOT NULL DEFAULT 0 CHECK (pilot_price_cents = 0),
  created_at    TEXT NOT NULL
);

-- POC users carry only an opaque id and a non-personal demo label. Production users
-- will be keyed by a managed-identity subject (auth_subject); no passwords are stored.
CREATE TABLE IF NOT EXISTS users (
  user_id       TEXT PRIMARY KEY,
  display_label TEXT NOT NULL,
  auth_subject  TEXT UNIQUE,
  is_demo       INTEGER NOT NULL CHECK (is_demo IN (0, 1))
);

CREATE TABLE IF NOT EXISTS tenant_memberships (
  tenant_id TEXT NOT NULL REFERENCES tenants(tenant_id),
  user_id   TEXT NOT NULL REFERENCES users(user_id),
  role      TEXT NOT NULL CHECK (role IN ('owner', 'viewer')),
  PRIMARY KEY (tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS schools (
  school_id    TEXT PRIMARY KEY,
  tenant_id    TEXT NOT NULL REFERENCES tenants(tenant_id),
  display_name TEXT NOT NULL,
  official_url TEXT NOT NULL,
  sources_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
  location_id     TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(tenant_id),
  school_id       TEXT NOT NULL REFERENCES schools(school_id),
  display_name    TEXT NOT NULL,
  address_display TEXT,
  official_url    TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('eligible_fixture', 'needs_owner_confirmation', 'needs_address_confirmation')),
  status_reason   TEXT NOT NULL,
  verified_on     TEXT NOT NULL,
  sources_json    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS campaigns (
  campaign_id   TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(tenant_id),
  school_id     TEXT NOT NULL REFERENCES schools(school_id),
  kind          TEXT NOT NULL CHECK (kind IN ('sponsored_pilot', 'organic_baseline')),
  display_name  TEXT NOT NULL,
  disclosure_label TEXT,
  price_cents   INTEGER NOT NULL DEFAULT 0 CHECK (price_cents = 0),
  starts_on     TEXT NOT NULL,
  ends_on       TEXT NOT NULL,
  CHECK (kind <> 'sponsored_pilot' OR disclosure_label = 'Sponsored pilot'),
  CHECK (kind <> 'organic_baseline' OR disclosure_label IS NULL)
);

CREATE TABLE IF NOT EXISTS placements (
  placement_id         TEXT PRIMARY KEY,
  tenant_id            TEXT NOT NULL REFERENCES tenants(tenant_id),
  campaign_id          TEXT NOT NULL REFERENCES campaigns(campaign_id),
  kind                 TEXT NOT NULL CHECK (kind IN ('sponsored_card', 'organic_listing')),
  display_name         TEXT NOT NULL,
  featured_location_id TEXT REFERENCES locations(location_id),
  link_rel             TEXT,
  inventory_status     TEXT NOT NULL CHECK (inventory_status IN ('fixture_candidate')),
  CHECK (kind <> 'sponsored_card' OR link_rel = 'sponsored noopener')
);

CREATE TABLE IF NOT EXISTS placement_pages (
  placement_id  TEXT NOT NULL REFERENCES placements(placement_id),
  tenant_id     TEXT NOT NULL REFERENCES tenants(tenant_id),
  page_path     TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  source_file   TEXT NOT NULL,
  PRIMARY KEY (placement_id, page_path)
);

CREATE TABLE IF NOT EXISTS destinations (
  destination_id TEXT PRIMARY KEY,
  tenant_id      TEXT NOT NULL REFERENCES tenants(tenant_id),
  location_id    TEXT REFERENCES locations(location_id),
  display_name   TEXT NOT NULL,
  url            TEXT NOT NULL,
  host           TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS placement_destinations (
  placement_id   TEXT NOT NULL REFERENCES placements(placement_id),
  destination_id TEXT NOT NULL REFERENCES destinations(destination_id),
  tenant_id      TEXT NOT NULL REFERENCES tenants(tenant_id),
  PRIMARY KEY (placement_id, destination_id)
);

-- Accepted observed events. occurred_minute is truncated to the minute.
-- page_view_id is a random per-page-load nonce used only for deduplication; it is
-- never persisted by the client and cannot link page views together.
CREATE TABLE IF NOT EXISTS events (
  event_id          TEXT PRIMARY KEY,
  schema_version    INTEGER NOT NULL,
  event_type        TEXT NOT NULL CHECK (event_type IN ('eligible_view', 'viewable_impression', 'sponsored_click', 'outbound_click')),
  tenant_id         TEXT NOT NULL REFERENCES tenants(tenant_id),
  school_id         TEXT NOT NULL,
  campaign_id       TEXT NOT NULL,
  placement_id      TEXT NOT NULL,
  location_id       TEXT,
  destination_id    TEXT,
  page_path         TEXT NOT NULL,
  referrer_category TEXT NOT NULL,
  device_class      TEXT NOT NULL,
  page_view_id      TEXT NOT NULL,
  occurred_minute   TEXT NOT NULL,
  local_date        TEXT NOT NULL,
  received_date     TEXT NOT NULL,
  dedupe_key        TEXT NOT NULL UNIQUE
);
CREATE INDEX IF NOT EXISTS events_tenant_date ON events (tenant_id, local_date, event_type);

-- Ingest outcome counters (no payloads). tenant_key is a known tenant_id or '_unknown'.
CREATE TABLE IF NOT EXISTS ingest_outcomes (
  received_date TEXT NOT NULL,
  tenant_key    TEXT NOT NULL,
  outcome       TEXT NOT NULL CHECK (outcome IN ('accepted', 'duplicate_event_id', 'duplicate_semantic', 'rejected')),
  reason_code   TEXT NOT NULL,
  count         INTEGER NOT NULL,
  PRIMARY KEY (received_date, tenant_key, outcome, reason_code)
);

CREATE TABLE IF NOT EXISTS daily_metrics (
  metric_date     TEXT NOT NULL,
  tenant_id       TEXT NOT NULL REFERENCES tenants(tenant_id),
  campaign_id     TEXT NOT NULL,
  placement_id    TEXT NOT NULL,
  location_key    TEXT NOT NULL,
  page_path       TEXT NOT NULL,
  destination_key TEXT NOT NULL,
  metric          TEXT NOT NULL,
  value           INTEGER NOT NULL CHECK (value >= 0),
  computed_at     TEXT NOT NULL,
  PRIMARY KEY (metric_date, tenant_id, campaign_id, placement_id, location_key, page_path, destination_key, metric)
);

-- Imported / self-reported conversions: aggregate counts only, never individual people.
CREATE TABLE IF NOT EXISTS conversion_imports (
  import_id     TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(tenant_id),
  imported_by   TEXT NOT NULL,
  method        TEXT NOT NULL CHECK (method IN ('manual_entry', 'csv_upload', 'booking_system_export', 'crm_export', 'call_tracking_export')),
  source_label  TEXT NOT NULL,
  confidence    TEXT NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
  received_at   TEXT NOT NULL,
  row_count     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS conversion_records (
  tenant_id         TEXT NOT NULL REFERENCES tenants(tenant_id),
  conversion_date   TEXT NOT NULL,
  conversion_type   TEXT NOT NULL CHECK (conversion_type IN ('assessment_start', 'call', 'qualified_lead', 'enrollment')),
  location_key      TEXT NOT NULL,
  attribution_basis TEXT NOT NULL CHECK (attribution_basis IN ('self_reported_wwk_mention', 'utm_matched_in_sponsor_system', 'self_reported_any_source')),
  method            TEXT NOT NULL,
  count             INTEGER NOT NULL CHECK (count >= 0),
  estimated_value_cents INTEGER CHECK (estimated_value_cents IS NULL OR estimated_value_cents >= 0),
  import_id         TEXT NOT NULL REFERENCES conversion_imports(import_id),
  confidence        TEXT NOT NULL,
  source_label      TEXT NOT NULL,
  PRIMARY KEY (tenant_id, conversion_date, conversion_type, location_key, attribution_basis, method)
);

CREATE TABLE IF NOT EXISTS data_quality_runs (
  run_id      TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL REFERENCES tenants(tenant_id),
  as_of       TEXT NOT NULL,
  range_start TEXT NOT NULL,
  range_end   TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('ok', 'info', 'warn', 'critical')),
  checks_json TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  at          TEXT NOT NULL,
  actor       TEXT NOT NULL,
  action      TEXT NOT NULL,
  tenant_id   TEXT,
  detail_json TEXT NOT NULL
);

INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('schema_version', '1');
