/*! WaterWiseKids ordinary-listing measurement client v1 (proposed; not deployed).
 *
 * Measures an ORDINARY directory listing with the same definitions as the sponsored
 * card, so the two can be compared fairly. It changes nothing on the page: no label,
 * no style, no order, no href rewrite, no click cancellation.
 *
 * Events: eligible_view, viewable_impression (>= 50 % visible for >= 1 s, IAB/MRC),
 * outbound_click (one per destination per page view). It never sends
 * sponsored_click (the collector rejects it for ordinary listings).
 *
 * Privacy contract: identical to assets/js/wwk-sponsored.js — schema v1 fields only;
 * IDs and page path from data-wwk-* attributes; one in-memory page-view id; referrer
 * category and coarse device class only; no cookies or storage; no URL, user agent or
 * fingerprint reads; inert without a valid data-wwk-collector; errors swallowed.
 */
(function (w) {
  'use strict';
  var doc = w && w.document;
  if (!doc || typeof doc.querySelectorAll !== 'function') return;
  var script = doc.currentScript;
  if (w.__wwkOrdinaryListingClient) return;
  w.__wwkOrdinaryListingClient = true;

  var ID = { ten: /^ten_[a-f0-9]{16}$/, sch: /^sch_[a-f0-9]{16}$/, cmp: /^cmp_[a-f0-9]{16}$/, plc: /^plc_[a-f0-9]{16}$/, loc: /^loc_[a-f0-9]{16}$/, dst: /^dst_[a-f0-9]{16}$/ };
  var PAGE_PATH = /^\/[a-z0-9\-_./]{0,200}$/;
  var MIN_RATIO = 0.5;
  var MIN_MS = 1000;
  var MAX_BATCH = 25;
  var SEARCH = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|yahoo\.com|ecosia\.org|baidu\.com|yandex\.[a-z.]+|search\.brave\.com|startpage\.com)$/;
  var SOCIAL = /(^|\.)(facebook\.com|instagram\.com|t\.co|twitter\.com|x\.com|linkedin\.com|lnkd\.in|pinterest\.[a-z.]+|tiktok\.com|reddit\.com|youtube\.com|nextdoor\.com|threads\.net)$/;
  var EMAIL = /(^|\.)(mail\.google\.com|outlook\.live\.com|outlook\.office\.com|mail\.yahoo\.com|mail\.aol\.com)$/;

  function noop() {}
  function attr(el, name) { try { return el.getAttribute(name); } catch (e) { return null; } }
  function collectorUrl() {
    var raw = script ? attr(script, 'data-wwk-collector') : null;
    if (!raw || typeof w.URL !== 'function') return null;
    try {
      var u = new w.URL(raw);
      if (u.protocol === 'https:') return u.toString();
      if (u.protocol === 'http:' && (u.hostname === '127.0.0.1' || u.hostname === 'localhost')) return u.toString();
    } catch (e) { /* invalid URL: stay inert */ }
    return null;
  }
  var COLLECTOR = collectorUrl();
  if (!COLLECTOR) return;

  function uuid() {
    var c = w.crypto;
    if (c && typeof c.randomUUID === 'function') return c.randomUUID();
    if (c && typeof c.getRandomValues === 'function') {
      var b = new Uint8Array(16); c.getRandomValues(b);
      b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
      var h = ''; for (var i = 0; i < 16; i += 1) h += (b[i] + 0x100).toString(16).slice(1);
      return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
    }
    return null;
  }
  var PAGE_VIEW_ID = uuid();
  if (!PAGE_VIEW_ID) return;

  function referrerCategory() {
    var r = doc.referrer;
    if (!r) return 'direct';
    try {
      var host = new w.URL(r).hostname.toLowerCase();
      if (host === String(w.location.hostname).toLowerCase()) return 'internal';
      if (EMAIL.test(host)) return 'email';
      if (SEARCH.test(host)) return 'search';
      if (SOCIAL.test(host)) return 'social';
      return 'other';
    } catch (e) { return 'unknown'; }
  }
  function deviceClass() {
    try {
      if (typeof w.matchMedia !== 'function') return 'unknown';
      if (w.matchMedia('(max-width: 767px)').matches) return 'mobile';
      if (w.matchMedia('(pointer: coarse)').matches && w.matchMedia('(max-width: 1279px)').matches) return 'tablet';
      return 'desktop';
    } catch (e) { return 'unknown'; }
  }
  var REFERRER = referrerCategory();
  var DEVICE = deviceClass();
  function now() { return (w.performance && typeof w.performance.now === 'function') ? w.performance.now() : new w.Date().getTime(); }

  var queue = [];
  var flushTimer = null;
  function send(body) {
    var nav = w.navigator;
    try { if (nav && typeof nav.sendBeacon === 'function' && nav.sendBeacon(COLLECTOR, body)) return; } catch (e) { /* fall through */ }
    try {
      if (typeof w.fetch === 'function') {
        var p = w.fetch(COLLECTOR, { method: 'POST', body: body, keepalive: true, credentials: 'omit', mode: 'cors', cache: 'no-store',
          referrerPolicy: 'no-referrer', headers: { 'Content-Type': 'text/plain;charset=UTF-8' } });
        if (p && typeof p.then === 'function') p.then(noop, noop);
      }
    } catch (e) { /* swallowed */ }
  }
  function flush() {
    if (flushTimer !== null) { try { w.clearTimeout(flushTimer); } catch (e) { /* ignore */ } flushTimer = null; }
    while (queue.length) {
      var batch = queue.splice(0, MAX_BATCH);
      var body;
      try { body = JSON.stringify(batch.length === 1 ? batch[0] : { events: batch }); } catch (e) { continue; }
      send(body);
    }
  }
  function enqueue(evt, urgent) {
    queue.push(evt);
    if (urgent) { flush(); return; }
    if (flushTimer === null) { try { flushTimer = w.setTimeout(flush, 0); } catch (e) { flush(); } }
  }

  function readListing(el) {
    var c = { el: el, tenant: attr(el, 'data-wwk-tenant'), school: attr(el, 'data-wwk-school'), campaign: attr(el, 'data-wwk-campaign'),
      placement: attr(el, 'data-wwk-placement'), location: attr(el, 'data-wwk-location'), pagePath: attr(el, 'data-wwk-page-path'), sent: {} };
    if (!ID.ten.test(c.tenant || '') || !ID.sch.test(c.school || '') || !ID.cmp.test(c.campaign || '') || !ID.plc.test(c.placement || '')) return null;
    if (c.location !== null && c.location !== '' && !ID.loc.test(c.location)) return null;
    if (!c.location) c.location = null;
    if (!PAGE_PATH.test(c.pagePath || '') || c.pagePath.indexOf('..') !== -1) return null;
    return c;
  }
  function eventFor(c, type, extra) {
    var e = { v: 1, event_id: uuid(), type: type, occurred_at: new w.Date().toISOString(), site_host: String(w.location.hostname),
      page_path: c.pagePath, tenant_id: c.tenant, school_id: c.school, campaign_id: c.campaign, placement_id: c.placement,
      page_view_id: PAGE_VIEW_ID, referrer_category: REFERRER, device_class: DEVICE };
    if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) e[k] = extra[k];
    return e;
  }
  function once(c, key, build, urgent) {
    if (c.sent[key]) return;
    var evt = build();
    if (!evt.event_id) return;
    c.sent[key] = true;
    enqueue(evt, urgent);
  }
  function withLocation(c) { return c.location ? { location_id: c.location } : null; }

  function watchViewability(c) {
    var IO = w.IntersectionObserver;
    if (typeof IO !== 'function') return;
    var ratio = 0; var since = null; var timer = null; var done = false; var io;
    function qualifies() { return ratio >= MIN_RATIO && doc.visibilityState !== 'hidden'; }
    function stop() { if (timer !== null) { try { w.clearTimeout(timer); } catch (e) { /* ignore */ } timer = null; } }
    function fire() {
      timer = null;
      if (done || since === null || !qualifies()) return;
      var ms = Math.round(now() - since);
      if (ms < MIN_MS) { timer = w.setTimeout(fire, MIN_MS - ms); return; }
      done = true;
      try { io.unobserve(c.el); io.disconnect(); } catch (e) { /* ignore */ }
      var r = Math.round(Math.min(1, Math.max(MIN_RATIO, ratio)) * 100) / 100;
      once(c, 'viewable_impression', function () {
        var extra = withLocation(c) || {};
        extra.viewability = { visible_ratio: r, visible_ms: Math.min(ms, 3600000) };
        return eventFor(c, 'viewable_impression', extra);
      }, false);
    }
    function evaluate() {
      if (done) return;
      if (qualifies()) { if (since === null) { since = now(); stop(); timer = w.setTimeout(fire, MIN_MS); } } else { since = null; stop(); }
    }
    try {
      io = new IO(function (entries) {
        for (var i = 0; i < entries.length; i += 1) if (entries[i].target === c.el) ratio = entries[i].isIntersecting ? entries[i].intersectionRatio : 0;
        evaluate();
      }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
      io.observe(c.el);
      doc.addEventListener('visibilitychange', evaluate);
    } catch (e) { /* no viewability measurement */ }
  }

  function onActivate(c, ev) {
    try {
      if (ev && ev.type === 'auxclick' && ev.button !== 1) return;
      var t = ev && ev.target;
      var a = t && typeof t.closest === 'function' ? t.closest('a[data-wwk-destination]') : null;
      if (!a || (typeof c.el.contains === 'function' && !c.el.contains(a))) return;
      var dest = attr(a, 'data-wwk-destination');
      if (!ID.dst.test(dest || '')) return;
      var destLoc = attr(a, 'data-wwk-location');
      once(c, 'outbound_click:' + dest, function () {
        var extra = { destination_id: dest };
        if (destLoc && ID.loc.test(destLoc)) extra.location_id = destLoc;
        return eventFor(c, 'outbound_click', extra);
      }, false);
      flush();
    } catch (e) { /* swallowed */ }
  }

  function init() {
    var nodes;
    try { nodes = doc.querySelectorAll('[data-wwk-ordinary-listing]'); } catch (e) { return; }
    for (var i = 0; i < nodes.length; i += 1) {
      var c = readListing(nodes[i]);
      if (!c) continue;
      once(c, 'eligible_view', function () { return eventFor(c, 'eligible_view', withLocation(c)); }, false);
      (function (x) {
        try {
          x.el.addEventListener('click', function (ev) { onActivate(x, ev); });
          x.el.addEventListener('auxclick', function (ev) { onActivate(x, ev); });
        } catch (e) { /* ignore */ }
      })(c);
      watchViewability(c);
    }
    try {
      w.addEventListener('pagehide', flush);
      doc.addEventListener('visibilitychange', function () { if (doc.visibilityState === 'hidden') flush(); });
    } catch (e) { /* ignore */ }
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : undefined);
