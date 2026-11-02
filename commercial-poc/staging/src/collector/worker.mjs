// wwk-commercial-collector-staging: the PUBLIC collector Worker.
// Routes: POST/OPTIONS /v1/collect and GET/HEAD /v1/health. Nothing else (no portal routes).
//
// Privacy contract (tested):
// - Reads only three request headers: Origin, Content-Type, Content-Length. It never reads
//   the client IP, User-Agent, Referer, Cookie or any other header, and never stores the URL.
// - Stores only validated, minimized events and per-reason-code counters; rejected payloads
//   are never stored.
// - Responses and logs carry counts and reason codes only; nothing from the request is echoed.
// - CORS is granted to exactly one origin (https://www.waterwisekids.com). No wildcard and no
//   reflection of any other Origin. Requests without that Origin are refused.
// - Tracking stays non-blocking: the Phase 2 client never waits for this response.
import { MAX_EVENT_BYTES } from '../../../src/events.mjs';
import { loadRegistry } from '../shared/registry.mjs';
import { ingestDeliveries } from '../shared/ingest.mjs';
import { isD1 } from '../shared/d1.mjs';

export const REQUIRED_ORIGIN = 'https://www.waterwisekids.com';
export const MAX_BATCH_EVENTS = 25;
export const MAX_BODY_BYTES = MAX_BATCH_EVENTS * MAX_EVENT_BYTES;
const BASE_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': 'cross-origin' };

/** Configuration problems (codes only). An empty list means the Worker may serve. */
export function collectorConfigProblems(env) {
  const problems = [];
  if (!env || !isD1(env.DB)) problems.push('missing_d1_binding');
  if (!env || env.ALLOWED_ORIGIN !== REQUIRED_ORIGIN) problems.push('allowed_origin_must_be_exactly_www_waterwisekids_com');
  if (!env || !['pilot', 'staging', 'local'].includes(env.COLLECTOR_ENV)) problems.push('collector_env_must_be_pilot_staging_or_local');
  return problems;
}

function json(status, body, extra = {}) {
  return new Response(body === null ? null : JSON.stringify(body), { status, headers: { ...BASE_HEADERS, ...extra } });
}

async function readCapped(request, max) {
  if (!request.body) return new Uint8Array(0);
  const reader = request.body.getReader();
  const chunks = []; let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { try { await reader.cancel(); } catch { /* ignore */ } return null; }
    chunks.push(value);
  }
  const out = new Uint8Array(size); let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.byteLength; }
  return out;
}

export async function handleCollector(request, env, ctx, { now = () => Date.now(), log = (line) => console.log(JSON.stringify(line)) } = {}) {
  const url = new URL(request.url);
  const problems = collectorConfigProblems(env);
  if (problems.length) {
    log({ worker: 'collector', status: 503, error: 'misconfigured', problems });
    return json(503, { error: 'misconfigured' });
  }
  const origin = request.headers.get('Origin');
  const allowed = origin === REQUIRED_ORIGIN;
  const cors = allowed ? { 'Access-Control-Allow-Origin': REQUIRED_ORIGIN, Vary: 'Origin', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' } : { Vary: 'Origin' };

  if (url.pathname === '/v1/health') {
    if (request.method !== 'GET' && request.method !== 'HEAD') return json(405, { error: 'method_not_allowed' }, { Allow: 'GET, HEAD' });
    return json(200, request.method === 'HEAD' ? null : { ok: true, schema_version: 1 });
  }
  if (url.pathname !== '/v1/collect') return json(404, { error: 'not_found' });
  if (request.method === 'OPTIONS') return allowed ? json(204, null, cors) : json(403, { error: 'origin_not_allowed' }, { Vary: 'Origin' });
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' }, { ...cors, Allow: 'POST, OPTIONS' });
  if (!allowed) { log({ worker: 'collector', status: 403, error: 'origin_not_allowed' }); return json(403, { error: 'origin_not_allowed' }, { Vary: 'Origin' }); }
  if (url.search) return json(400, { error: 'query_not_allowed' }, cors);
  const ctype = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  if (ctype !== 'application/json' && ctype !== 'text/plain') return json(415, { error: 'unsupported_media_type' }, cors);
  const declared = request.headers.get('Content-Length');
  if (declared !== null && !(Number(declared) <= MAX_BODY_BYTES)) return json(413, { error: 'payload_too_large' }, cors);

  const bytes = await readCapped(request, MAX_BODY_BYTES);
  if (bytes === null) return json(413, { error: 'payload_too_large' }, cors);
  let body;
  try { body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { return json(400, { error: 'malformed_json' }, cors); }
  const events = body && Array.isArray(body.events) ? body.events : (body && typeof body === 'object' && !Array.isArray(body) ? [body] : null);
  if (!events || events.length === 0) return json(400, { error: 'no_events' }, cors);
  if (events.length > MAX_BATCH_EVENTS) return json(413, { error: 'too_many_events' }, cors);
  if (body.events && Object.keys(body).some((k) => k !== 'events')) return json(400, { error: 'unknown_envelope_field' }, cors);
  const enc = new TextEncoder();
  for (const e of events) if (enc.encode(JSON.stringify(e ?? null)).byteLength > MAX_EVENT_BYTES) return json(413, { error: 'event_too_large' }, cors);

  try {
    const receivedAtMs = now();
    const registry = await loadRegistry(env.DB);
    const r = await ingestDeliveries(env.DB, registry, events.map((payload) => ({ payload, receivedAtMs })));
    log({ worker: 'collector', status: 202, accepted: r.accepted, duplicates: r.duplicates, rejected: r.rejected, reasons: r.reasons });
    return json(202, { accepted: r.accepted, duplicates: r.duplicates, rejected: r.rejected }, cors);
  } catch (err) {
    log({ worker: 'collector', status: 503, error: 'storage_unavailable', error_name: err && err.name ? String(err.name).slice(0, 40) : 'Error' });
    return json(503, { error: 'temporarily_unavailable' }, cors);
  }
}

export default {
  fetch(request, env, ctx) { return handleCollector(request, env, ctx); },
};
