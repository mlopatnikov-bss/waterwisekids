// Strict structural schema for a WWK sponsor definition (schema "wwk.sponsor-definition", version 1).
// Every object is closed: an unknown field is an error, not a warning. Semantic rules
// (stable IDs, ownership, URLs, facts, content) live in validate.mjs.
// SCHEMA.md is the human-readable copy of this file; tests keep the two in step.

export const SCHEMA_NAME = 'wwk.sponsor-definition';
export const SCHEMA_VERSION = 1;

const KEY = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = (p) => new RegExp(`^${p}_[a-f0-9]{16}$`);
const TEXT = /^[^\u0000-\u001f<>]*$/; // printable, no markup

const str = (opts = {}) => ({ t: 'str', ...opts });
const key = () => str({ re: KEY, max: 64 });
const text = (max = 200) => str({ re: TEXT, min: 1, max });
const date = () => str({ re: DATE, date: true });
const id = (p) => str({ re: ID(p) });
const url = () => str({ min: 8, max: 300, url: true });
const int = (opts = {}) => ({ t: 'int', ...opts });
const arr = (of, opts = {}) => ({ t: 'arr', of, ...opts });
const obj = (fields, opt = []) => ({ t: 'obj', fields, optional: new Set(opt) });
const nullable = (of) => ({ t: 'nullable', of });
const oneOf = (...values) => str({ enum: values });

export const APPROVAL_GATES = Object.freeze([
  'sponsor_terms',        // signed terms / written approval of the no-fee or paid scope
  'source_verification',  // every cited fact checked against the official source
  'editorial_review',     // card copy, disclosure and page fit reviewed by WWK editorial
  'preview_qa',           // desktop + mobile preview of every patched page
  'portal_access',        // Access policy + opaque-subject membership provisioned
  'activation',           // final go: SQL applied and page patches published
]);

const fact = obj({
  fact_key: oneOf('address', 'location_page', 'territory_page', 'venue_name'),
  value: text(200),
  source: oneOf('official_snapshot', 'repo_directory_data', 'operator_written_confirmation'),
  source_ref: str({ min: 1, max: 160, re: /^[A-Za-z0-9_./-]+$/ }),
  source_url: nullable(url()),
  observed_on: date(),
});

const location = obj({
  location_key: key(),
  location_id: id('loc'),
  display_name: text(80),
  market_key: key(),
  official_url: url(),
  address_display: text(160),
  facts: arr(fact, { min: 1, max: 12 }),
});

const destination = obj({
  destination_id: id('dst'),
  kind: oneOf('territory', 'location'),
  location_key: nullable(key()),
});

const campaign = obj({
  campaign_key: key(),
  campaign_id: id('cmp'),
  kind: oneOf('sponsored_pilot'),
  display_name: text(80),
  disclosure_label: text(40),
  disclosure_text: text(400),
  starts_on: date(),
  ends_on: date(),
  price_cents: int({ min: 0, max: 10_000_000 }),
  currency: oneOf('USD'),
});

const anchor = obj({
  type: oneOf('existing_marker', 'insert_after'),
  text: nullable(str({ min: 12, max: 400, re: /^[^\n\r]*$/ })),
});

const placement = obj({
  slot_key: key(),
  placement_id: id('plc'),
  page_path: str({ min: 2, max: 200 }),
  market_key: key(),
  variant: oneOf('featured_location', 'venue_list'),
  location_keys: arr(key(), { min: 1, max: 6 }),
  indent: int({ min: 0, max: 16 }),
  anchor,
});

const tenant = obj({
  tenant_key: key(),
  tenant_id: id('ten'),
  display_name: text(100),
  timezone: oneOf('America/New_York', 'America/Chicago', 'America/Denver', 'America/Phoenix', 'America/Los_Angeles'),
  school: obj({ school_id: id('sch'), display_name: text(100), territory_url: url() }),
  locations: arr(location, { min: 1, max: 25 }),
  destinations: arr(destination, { min: 2, max: 30 }),
  campaign,
  placements: arr(placement, { min: 1, max: 12 }),
});

export const DEFINITION_SCHEMA = obj({
  schema: oneOf(SCHEMA_NAME),
  schema_version: int({ min: 1, max: 1 }),
  definition_key: key(),
  prepared_on: date(),
  site: obj({
    host: oneOf('www.waterwisekids.com'),
    collector_url: oneOf('https://events.waterwisekids.com/v1/collect'),
    component_version: str({ re: /^[a-z0-9]{2,12}$/ }),
  }),
  destination_hosts: arr(str({ min: 4, max: 100 }), { min: 1, max: 4 }),
  markets: arr(obj({
    market_key: key(),
    state: str({ re: /^[A-Z]{2}$/ }),
    label: text(80),
    place_names: arr(text(60), { min: 1, max: 8 }),
  }), { min: 1, max: 20 }),
  page_inventory: arr(obj({
    page_path: str({ min: 2, max: 200 }),
    market_key: key(),
    page_status: oneOf('existing', 'proposed_new'),
  }), { min: 1, max: 30 }),
  tenants: arr(tenant, { min: 1, max: 6 }),
  portal: obj({
    users: arr(obj({
      invite_ref: key(),
      display_label: text(80),
      memberships: arr(obj({ tenant_key: key(), role: oneOf('owner', 'viewer') }), { min: 1, max: 6 }),
    }), { min: 0, max: 10 }),
  }),
  approvals: arr(obj({
    gate: oneOf(...APPROVAL_GATES),
    status: oneOf('pending', 'recorded'),
    recorded_on: nullable(date()),
    evidence_ref: nullable(str({ min: 1, max: 200, re: /^[A-Za-z0-9_./#-]+$/ })),
  }), { min: APPROVAL_GATES.length, max: APPROVAL_GATES.length }),
});

function isRealDate(s) {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Structural check. Returns a list of { code, path, detail }; empty means the shape is valid. */
export function checkShape(value, spec = DEFINITION_SCHEMA, path = '$', out = []) {
  const err = (code, detail) => out.push({ code, path, detail });
  switch (spec.t) {
    case 'nullable':
      if (value === null) return out;
      return checkShape(value, spec.of, path, out);
    case 'obj': {
      if (!value || typeof value !== 'object' || Array.isArray(value)) { err('invalid_type', 'expected object'); return out; }
      for (const k of Object.keys(value)) if (!(k in spec.fields)) out.push({ code: 'unknown_field', path: `${path}.${k}`, detail: 'field is not part of schema v1' });
      for (const [k, sub] of Object.entries(spec.fields)) {
        if (!(k in value)) { if (!spec.optional.has(k)) out.push({ code: 'missing_field', path: `${path}.${k}`, detail: 'required' }); continue; }
        checkShape(value[k], sub, `${path}.${k}`, out);
      }
      return out;
    }
    case 'arr':
      if (!Array.isArray(value)) { err('invalid_type', 'expected array'); return out; }
      if (spec.min !== undefined && value.length < spec.min) err('too_few', `at least ${spec.min}`);
      if (spec.max !== undefined && value.length > spec.max) err('too_many', `at most ${spec.max}`);
      value.forEach((v, i) => checkShape(v, spec.of, `${path}[${i}]`, out));
      return out;
    case 'int':
      if (!Number.isSafeInteger(value)) { err('invalid_type', 'expected integer'); return out; }
      if ((spec.min !== undefined && value < spec.min) || (spec.max !== undefined && value > spec.max)) err('invalid_value', `out of range ${spec.min}..${spec.max}`);
      return out;
    case 'str':
      if (typeof value !== 'string') { err('invalid_type', 'expected string'); return out; }
      if (value !== value.trim()) err('invalid_value', 'leading/trailing whitespace');
      if (spec.enum && !spec.enum.includes(value)) { err('invalid_value', `one of: ${spec.enum.join(', ')}`); return out; }
      if (spec.min !== undefined && value.length < spec.min) err('invalid_value', `min length ${spec.min}`);
      if (spec.max !== undefined && value.length > spec.max) err('invalid_value', `max length ${spec.max}`);
      if (spec.re && !spec.re.test(value)) err('invalid_value', `must match ${spec.re}`);
      if (spec.date && !isRealDate(value)) err('invalid_value', 'not a real calendar date');
      return out;
    default:
      throw new Error(`bad spec at ${path}`);
  }
}
