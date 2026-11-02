// Event schema v1 and validation. The collector accepts only this allowlisted
// shape. Anything unknown, malformed, PII-shaped, or not owned by the claimed
// tenant is rejected with a fixed reason code; the payload itself is never stored.
import { ENTITY_ID_RE, UUID_V4_RE, sha256Hex } from './ids.mjs';
import { ISO_UTC_RE, localDate, truncateToMinute } from './time.mjs';

export const SCHEMA_VERSION = 1;
export const EVENT_TYPES = Object.freeze(['eligible_view', 'viewable_impression', 'sponsored_click', 'outbound_click']);
export const REFERRER_CATEGORIES = Object.freeze(['direct', 'search', 'social', 'email', 'internal', 'other', 'unknown']);
export const DEVICE_CLASSES = Object.freeze(['mobile', 'tablet', 'desktop', 'unknown']);

export const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;
export const MAX_LATE_ARRIVAL_MS = 72 * 60 * 60 * 1000;
export const MIN_VISIBLE_RATIO = 0.5;   // IAB/MRC display viewability: 50% of pixels ...
export const MIN_VISIBLE_MS = 1000;     // ... for at least one continuous second.
export const MAX_EVENT_BYTES = 2048;

const REQUIRED = ['v', 'event_id', 'type', 'occurred_at', 'site_host', 'page_path', 'tenant_id', 'school_id', 'campaign_id', 'placement_id', 'page_view_id', 'referrer_category', 'device_class'];
const OPTIONAL = ['location_id', 'destination_id', 'viewability'];
const ALLOWED = new Set([...REQUIRED, ...OPTIONAL]);

// Field names that suggest someone is trying to send personal data.
const PII_FIELD_RE = /(e-?mail|phone|tel|ip(_?addr(ess)?)?$|^ip|user_?agent|^ua$|name|address|child|kid|student|family|parent|dob|birth|age$|ssn|zip|postal|lat|lon|geo|fingerprint|cookie|device_?id|ad_?id|idfa|gaid)/i;
// Value patterns that look like personal data, checked on every string value.
const PII_VALUE_PATTERNS = [
  ['email', /[^\s@]+@[^\s@]+\.[^\s@]+/],
  ['phone', /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/],
  ['ipv4', /\b(?:\d{1,3}\.){3}\d{1,3}\b/],
  ['ipv6', /\b(?:[0-9a-f]{1,4}:){3,7}[0-9a-f]{1,4}\b/i],
  ['long_digit_run', /\d{9,}/],
];
const PAGE_PATH_RE = /^\/[a-z0-9\-_./]{0,200}$/;

export class Reject {
  constructor(reason, field = null) { this.reason = reason; this.field = field; }
}

function scanStringsForPii(value, path = '') {
  if (typeof value === 'string') {
    // UUIDs and entity IDs are structurally checked elsewhere; do not let their hex trip the scanners.
    if (UUID_V4_RE.test(value) || ENTITY_ID_RE.test(value) || ISO_UTC_RE.test(value)) return null;
    for (const [kind, re] of PII_VALUE_PATTERNS) if (re.test(value)) return { kind, path };
    return null;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      const hit = scanStringsForPii(v, path ? `${path}.${k}` : k);
      if (hit) return hit;
    }
  }
  return null;
}

/**
 * Structural validation only (no registry). Returns Reject or null.
 */
export function checkShape(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return new Reject('not_an_object');
  const keys = Object.keys(raw);
  for (const k of keys) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') return new Reject('forbidden_key', k);
  }
  for (const k of keys) {
    if (!ALLOWED.has(k)) return new Reject(PII_FIELD_RE.test(k) ? 'pii_field' : 'unknown_field', k);
  }
  const pii = scanStringsForPii(raw);
  if (pii) return new Reject('pii_value', pii.path);
  for (const k of REQUIRED) if (!(k in raw)) return new Reject('missing_field', k);

  if (raw.v !== SCHEMA_VERSION) return new Reject('unsupported_schema_version', 'v');
  if (typeof raw.event_id !== 'string' || !UUID_V4_RE.test(raw.event_id)) return new Reject('invalid_event_id', 'event_id');
  if (!EVENT_TYPES.includes(raw.type)) return new Reject('invalid_event_type', 'type');
  if (typeof raw.occurred_at !== 'string' || !ISO_UTC_RE.test(raw.occurred_at) || Number.isNaN(Date.parse(raw.occurred_at))) return new Reject('invalid_timestamp', 'occurred_at');
  if (typeof raw.site_host !== 'string') return new Reject('invalid_site_host', 'site_host');
  if (typeof raw.page_path !== 'string' || raw.page_path.includes('?') || raw.page_path.includes('#')) return new Reject('page_path_query_or_fragment', 'page_path');
  if (!PAGE_PATH_RE.test(raw.page_path) || raw.page_path.includes('..')) return new Reject('invalid_page_path', 'page_path');
  for (const k of ['tenant_id', 'school_id', 'campaign_id', 'placement_id']) {
    if (typeof raw[k] !== 'string' || !ENTITY_ID_RE.test(raw[k])) return new Reject('invalid_id', k);
  }
  if (!raw.tenant_id.startsWith('ten_') || !raw.school_id.startsWith('sch_') || !raw.campaign_id.startsWith('cmp_') || !raw.placement_id.startsWith('plc_')) return new Reject('invalid_id');
  if ('location_id' in raw && raw.location_id !== null && (typeof raw.location_id !== 'string' || !/^loc_[a-f0-9]{16}$/.test(raw.location_id))) return new Reject('invalid_id', 'location_id');
  if (typeof raw.page_view_id !== 'string' || !UUID_V4_RE.test(raw.page_view_id)) return new Reject('invalid_page_view_id', 'page_view_id');
  if (!REFERRER_CATEGORIES.includes(raw.referrer_category)) return new Reject('invalid_referrer_category', 'referrer_category');
  if (!DEVICE_CLASSES.includes(raw.device_class)) return new Reject('invalid_device_class', 'device_class');

  if (raw.type === 'outbound_click') {
    if (typeof raw.destination_id !== 'string' || !/^dst_[a-f0-9]{16}$/.test(raw.destination_id)) return new Reject('missing_destination', 'destination_id');
  } else if ('destination_id' in raw && raw.destination_id !== null) {
    return new Reject('unexpected_destination', 'destination_id');
  }
  if (raw.type === 'viewable_impression') {
    const vw = raw.viewability;
    if (!vw || typeof vw !== 'object' || Array.isArray(vw)) return new Reject('missing_viewability', 'viewability');
    const vk = Object.keys(vw);
    if (vk.some((k) => k !== 'visible_ratio' && k !== 'visible_ms')) return new Reject('unknown_field', 'viewability');
    if (typeof vw.visible_ratio !== 'number' || !(vw.visible_ratio >= MIN_VISIBLE_RATIO && vw.visible_ratio <= 1)) return new Reject('below_viewability_threshold', 'viewability.visible_ratio');
    if (!Number.isInteger(vw.visible_ms) || vw.visible_ms < MIN_VISIBLE_MS || vw.visible_ms > 3600000) return new Reject('below_viewability_threshold', 'viewability.visible_ms');
  } else if ('viewability' in raw) {
    return new Reject('unexpected_viewability', 'viewability');
  }
  return null;
}

/**
 * Full validation against the registry (tenant ownership, allowlists, windows).
 * @returns {{ok: true, event: object} | {ok: false, reason: string, field: string|null, tenantKey: string}}
 */
export function validateEvent(raw, registry, { receivedAtMs }) {
  const shape = checkShape(raw);
  const knownTenant = raw && typeof raw === 'object' && typeof raw.tenant_id === 'string' && registry.tenants.has(raw.tenant_id) ? raw.tenant_id : '_unknown';
  const fail = (reason, field = null) => ({ ok: false, reason, field, tenantKey: knownTenant });
  if (shape) return fail(shape.reason, shape.field);

  if (!registry.allowedSiteHosts.has(raw.site_host)) return fail('host_not_allowed', 'site_host');
  const tenant = registry.tenants.get(raw.tenant_id);
  if (!tenant) return fail('unknown_tenant', 'tenant_id');
  const school = registry.schools.get(raw.school_id);
  if (!school) return fail('unknown_school', 'school_id');
  if (school.tenant_id !== raw.tenant_id) return fail('cross_tenant_reference', 'school_id');
  const campaign = registry.campaigns.get(raw.campaign_id);
  if (!campaign) return fail('unknown_campaign', 'campaign_id');
  if (campaign.tenant_id !== raw.tenant_id) return fail('cross_tenant_reference', 'campaign_id');
  if (campaign.school_id !== raw.school_id) return fail('campaign_school_mismatch', 'campaign_id');
  const placement = registry.placements.get(raw.placement_id);
  if (!placement) return fail('unknown_placement', 'placement_id');
  if (placement.tenant_id !== raw.tenant_id) return fail('cross_tenant_reference', 'placement_id');
  if (placement.campaign_id !== raw.campaign_id) return fail('placement_campaign_mismatch', 'placement_id');
  if (!placement.pages.has(raw.page_path)) return fail('page_not_allowed_for_placement', 'page_path');
  if (raw.type === 'sponsored_click' && placement.kind !== 'sponsored_card') return fail('sponsored_click_on_organic_listing', 'type');

  let locationId = raw.location_id ?? null;
  let destinationId = null;
  if (raw.type === 'outbound_click') {
    const dest = registry.destinations.get(raw.destination_id);
    if (!dest) return fail('unknown_destination', 'destination_id');
    if (dest.tenant_id !== raw.tenant_id) return fail('cross_tenant_reference', 'destination_id');
    if (!registry.allowedDestinationHosts.has(dest.host)) return fail('destination_host_not_allowed', 'destination_id');
    if (!placement.destinations.has(raw.destination_id)) return fail('destination_not_allowed_for_placement', 'destination_id');
    destinationId = raw.destination_id;
    if (locationId !== null && locationId !== dest.location_id) return fail('location_mismatch', 'location_id');
    locationId = dest.location_id;
  } else if (locationId !== null && locationId !== placement.featured_location_id) {
    return fail('location_mismatch', 'location_id');
  } else {
    locationId = placement.featured_location_id;
  }
  if (locationId !== null) {
    const loc = registry.locations.get(locationId);
    if (!loc || loc.tenant_id !== raw.tenant_id) return fail('cross_tenant_reference', 'location_id');
    if (loc.status !== 'eligible_fixture') return fail('location_not_eligible', 'location_id');
  }

  const occurredMs = Date.parse(raw.occurred_at);
  if (occurredMs > receivedAtMs + MAX_FUTURE_SKEW_MS) return fail('timestamp_in_future', 'occurred_at');
  if (occurredMs < receivedAtMs - MAX_LATE_ARRIVAL_MS) return fail('timestamp_too_old', 'occurred_at');
  const day = localDate(occurredMs, tenant.timezone);
  if (day < campaign.starts_on || day > campaign.ends_on) return fail('outside_campaign_window', 'occurred_at');

  // Semantic dedupe: one count per page view, placement, event type and destination.
  const dedupeKey = sha256Hex([raw.page_view_id, raw.placement_id, raw.type, destinationId ?? ''].join('|'));
  return {
    ok: true,
    event: {
      event_id: raw.event_id,
      schema_version: SCHEMA_VERSION,
      event_type: raw.type,
      tenant_id: raw.tenant_id,
      school_id: raw.school_id,
      campaign_id: raw.campaign_id,
      placement_id: raw.placement_id,
      location_id: locationId,
      destination_id: destinationId,
      page_path: raw.page_path,
      referrer_category: raw.referrer_category,
      device_class: raw.device_class,
      page_view_id: raw.page_view_id,
      occurred_minute: truncateToMinute(raw.occurred_at),
      local_date: day,
      received_date: localDate(receivedAtMs, tenant.timezone),
      dedupe_key: dedupeKey,
    },
  };
}
