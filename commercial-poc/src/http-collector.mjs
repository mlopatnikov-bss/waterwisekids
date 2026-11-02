// Local HTTP transport for the collector. POST /v1/collect only.
// Privacy: request IP and user agent are never written anywhere. The rate limiter
// holds the socket address in process memory only (rotating window, not persisted).
// Cookies are ignored. Responses never echo the payload.
import { ingestBatch } from './collector.mjs';
import { MAX_EVENT_BYTES } from './events.mjs';

export const MAX_BATCH_EVENTS = 25;
export const MAX_BODY_BYTES = MAX_BATCH_EVENTS * MAX_EVENT_BYTES;

export class RateLimiter {
  /** Fixed-window limiter; keys live only in memory and the map is cleared each window. */
  constructor({ limit = 120, windowMs = 60_000, now = () => Date.now() } = {}) {
    this.limit = limit; this.windowMs = windowMs; this.now = now;
    this.windowStart = now(); this.counts = new Map();
  }
  allow(key, cost = 1) {
    const t = this.now();
    if (t - this.windowStart >= this.windowMs) { this.counts.clear(); this.windowStart = t; }
    const used = this.counts.get(key) || 0;
    if (used + cost > this.limit) return false;
    this.counts.set(key, used + cost);
    return true;
  }
}

function send(res, status, body, extraHeaders = {}) {
  const payload = body === null ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  });
  res.end(payload);
}

export function createCollectorHandler({ db, registry, rateLimiter = new RateLimiter(), allowedOrigins = ['https://www.waterwisekids.com'], now = () => Date.now() }) {
  return function handle(req, res) {
    const origin = req.headers.origin;
    const cors = origin && allowedOrigins.includes(origin)
      ? { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' }
      : {};
    const url = new URL(req.url, 'http://collector.local');
    if (req.method === 'GET' && url.pathname === '/v1/health') return send(res, 200, { ok: true, schema_version: 1 }, cors);
    if (url.pathname !== '/v1/collect') return send(res, 404, { error: 'not_found' }, cors);
    if (req.method === 'OPTIONS') return send(res, 204, null, cors);
    if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' }, { ...cors, Allow: 'POST' });
    if (origin && !allowedOrigins.includes(origin)) return send(res, 403, { error: 'origin_not_allowed' });
    if (url.search) return send(res, 400, { error: 'query_not_allowed' }, cors);
    const ctype = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    if (ctype !== 'application/json' && ctype !== 'text/plain') return send(res, 415, { error: 'unsupported_media_type' }, cors);
    const declared = Number(req.headers['content-length'] || 0);
    if (declared > MAX_BODY_BYTES) { req.resume(); return send(res, 413, { error: 'payload_too_large' }, cors); }

    const limiterKey = req.socket.remoteAddress || 'unknown';
    const chunks = []; let size = 0; let aborted = false;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY_BYTES && !aborted) { aborted = true; send(res, 413, { error: 'payload_too_large' }, cors); req.destroy(); }
      else if (!aborted) chunks.push(c);
    });
    req.on('end', () => {
      if (aborted) return;
      let body;
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return send(res, 400, { error: 'malformed_json' }, cors); }
      const events = body && Array.isArray(body.events) ? body.events : (body && typeof body === 'object' && !Array.isArray(body) ? [body] : null);
      if (!events || events.length === 0) return send(res, 400, { error: 'no_events' }, cors);
      if (events.length > MAX_BATCH_EVENTS) return send(res, 413, { error: 'too_many_events' }, cors);
      if (body.events && Object.keys(body).some((k) => k !== 'events')) return send(res, 400, { error: 'unknown_envelope_field' }, cors);
      if (!rateLimiter.allow(limiterKey, events.length)) return send(res, 429, { error: 'rate_limited' }, { ...cors, 'Retry-After': '60' });
      for (const e of events) {
        if (Buffer.byteLength(JSON.stringify(e ?? null)) > MAX_EVENT_BYTES) return send(res, 413, { error: 'event_too_large' }, cors);
      }
      const r = ingestBatch(db, registry, events, { receivedAtMs: now() });
      return send(res, 202, { accepted: r.accepted, duplicates: r.duplicates, rejected: r.rejected }, cors);
    });
  };
}
