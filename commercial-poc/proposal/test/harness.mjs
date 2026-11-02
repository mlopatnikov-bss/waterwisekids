// Dependency-free browser stand-in for the sponsored-card client. Runs the REAL
// component/wwk-sponsored.js in a vm context with fake DOM, timers, IntersectionObserver
// and transports, and records any access to forbidden browser APIs.
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { webcrypto } from 'node:crypto';
import { PROPOSAL_ROOT } from '../src/build.mjs';

export const CLIENT_SRC = readFileSync(join(PROPOSAL_ROOT, 'component/wwk-sponsored.js'), 'utf8');
export const T0 = Date.parse('2026-10-20T15:00:00.000Z');

const attrRe = /([a-z-]+)="([^"]*)"/g;
const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

class FakeEl {
  constructor(tag, attrs = {}, parent = null) { this.tagName = tag.toUpperCase(); this.attrs = attrs; this.parent = parent; this.listeners = {}; this.children = []; if (parent) parent.children.push(this); }
  getAttribute(n) { return Object.prototype.hasOwnProperty.call(this.attrs, n) ? this.attrs[n] : null; }
  addEventListener(t, fn) { (this.listeners[t] ||= []).push(fn); }
  contains(el) { for (let e = el; e; e = e.parent) if (e === this) return true; return false; }
  closest(sel) {
    if (sel !== 'a[data-wwk-destination]') throw new Error(`unexpected selector ${sel}`);
    for (let e = this; e; e = e.parent) if (e.tagName === 'A' && e.getAttribute('data-wwk-destination') !== null) return e;
    return null;
  }
}

/** Build fake card elements from the generated card HTML. */
export function cardFromHtml(html) {
  const asideTag = html.match(/<aside ([^>]*)>/)[1];
  const attrs = {}; for (const m of asideTag.matchAll(attrRe)) attrs[m[1]] = unescape(m[2]);
  const card = new FakeEl('aside', attrs);
  const anchors = [];
  for (const m of html.matchAll(/<a ([^>]*)>(.*?)<\/a>/g)) {
    const a = {}; for (const x of m[1].matchAll(attrRe)) a[x[1]] = unescape(x[2]);
    const li = new FakeEl('li', {}, card);
    const el = new FakeEl('a', a, li);
    el.span = new FakeEl('span', { class: 'wwk-sponsored__host' }, el);
    anchors.push(el);
  }
  return { card, anchors };
}

export function makeEnv(opts = {}) {
  const {
    cards = [], collector = 'https://collect.example.org/v1/collect', referrer = '', hostname = 'www.waterwisekids.com',
    beacon = 'ok', fetchMode = 'ok', io = true, media = { mobile: false, coarse: false, tablet: false }, visibility = 'visible',
    readyState = 'interactive', crypto = webcrypto, startMs = T0,
  } = opts;
  const forbidden = [];
  const beacons = []; const fetches = [];
  let clock = 0;
  const timers = new Map(); let nextTimer = 1;
  const docListeners = {}; const winListeners = {};
  const observers = [];

  const scriptEl = new FakeEl('script', collector === null ? {} : { 'data-wwk-collector': collector });
  const document = {
    readyState, referrer, visibilityState: visibility, currentScript: scriptEl,
    querySelectorAll(sel) { if (sel !== '[data-wwk-sponsored-card]') throw new Error(`unexpected selector ${sel}`); return cards.map((c) => c.card); },
    addEventListener(t, fn) { (docListeners[t] ||= []).push(fn); },
  };
  const location = { hostname };
  const navigator = {};
  if (beacon !== 'none') navigator.sendBeacon = (url, body) => {
    beacons.push({ url, body });
    if (beacon === 'throw') throw new Error('beacon blew up');
    return beacon !== 'false';
  };
  const FORBIDDEN_DOC = new Set(['cookie', 'location', 'URL', 'documentURI', 'baseURI', 'domain', 'title', 'forms', 'write', 'writeln', 'execCommand']);
  const FORBIDDEN_NAV = new Set(['userAgent', 'userAgentData', 'platform', 'language', 'languages', 'plugins', 'mimeTypes', 'hardwareConcurrency', 'deviceMemory', 'vendor', 'geolocation', 'connection', 'cookieEnabled', 'doNotTrack']);
  const FORBIDDEN_WIN = new Set(['localStorage', 'sessionStorage', 'indexedDB', 'caches', 'open', 'history', 'screen', 'name', 'opener', 'top', 'parent', 'devicePixelRatio', 'eval', 'Function']);
  const trap = (obj, label, isForbidden) => new Proxy(obj, { get(t, p, r) { if (typeof p === 'string' && isForbidden(p)) forbidden.push(`${label}.${p}`); return Reflect.get(t, p, r); } });
  class FakeDate extends Date { constructor(...a) { if (a.length) super(...a); else super(startMs + clock); } static now() { return startMs + clock; } }
  class FakeIO {
    constructor(cb, init) { this.cb = cb; this.init = init; this.targets = new Set(); this.disconnected = false; observers.push(this); }
    observe(t) { this.targets.add(t); }
    unobserve(t) { this.targets.delete(t); }
    disconnect() { this.disconnected = true; this.targets.clear(); }
  }
  const fetchFn = fetchMode === 'none' ? undefined : (url, init) => {
    fetches.push({ url, init });
    if (fetchMode === 'throw') throw new Error('fetch threw synchronously');
    if (fetchMode === 'reject') return Promise.reject(new Error('network down'));
    return Promise.resolve({ ok: true, status: 202 });
  };
  const sandbox = {
    document: trap(document, 'document', (p) => FORBIDDEN_DOC.has(p)),
    location: trap(location, 'location', (p) => p !== 'hostname' && p !== 'then' && p !== 'toJSON'),
    navigator: trap(navigator, 'navigator', (p) => FORBIDDEN_NAV.has(p)),
    crypto, URL, Uint8Array, JSON, Math, Object, String, Number, Error,
    Date: FakeDate,
    performance: { now: () => clock },
    setTimeout: (fn, ms) => { const id = nextTimer++; timers.set(id, { at: clock + Math.max(0, ms || 0), fn }); return id; },
    clearTimeout: (id) => { timers.delete(id); },
    matchMedia: (q) => ({ matches: (q === '(max-width: 767px)' && media.mobile) || (q === '(pointer: coarse)' && media.coarse) || (q === '(max-width: 1279px)' && media.tablet) }),
    addEventListener: (t, fn) => { (winListeners[t] ||= []).push(fn); },
  };
  if (io) sandbox.IntersectionObserver = FakeIO;
  if (fetchFn) sandbox.fetch = fetchFn;
  const context = vm.createContext(sandbox);
  sandbox.window = trap(context, 'window', (p) => FORBIDDEN_WIN.has(p));
  // vm contexts expose the sandbox as globalThis; the client receives `window`.
  const run = () => vm.runInContext(CLIENT_SRC, context, { filename: 'wwk-sponsored.js' });
  const runSource = (src) => vm.runInContext(src, context, { filename: 'self-check.js' });

  function advance(ms) {
    const target = clock + ms;
    for (;;) {
      let next = null;
      for (const [id, t] of timers) if (t.at <= target && (!next || t.at < next[1].at || (t.at === next[1].at && id < next[0]))) next = [id, t];
      if (!next) break;
      timers.delete(next[0]); clock = next[1].at; next[1].fn();
    }
    clock = target;
  }
  function intersect(card, ratio) {
    for (const o of observers) if (o.targets.has(card.card)) o.cb([{ target: card.card, intersectionRatio: ratio, isIntersecting: ratio > 0 }]);
  }
  function setVisibility(v) { document.visibilityState = v; for (const fn of docListeners.visibilitychange || []) fn({ type: 'visibilitychange' }); }
  function fire(el, type = 'click', button = 0) {
    const ev = { type, button, target: el, defaultPrevented: false, calls: [] };
    ev.preventDefault = () => { ev.calls.push('preventDefault'); ev.defaultPrevented = true; };
    ev.stopPropagation = () => { ev.calls.push('stopPropagation'); };
    ev.stopImmediatePropagation = () => { ev.calls.push('stopImmediatePropagation'); };
    // bubble to the owning card
    let card = el; while (card.parent) card = card.parent;
    for (const fn of card.listeners[type] || []) fn(ev);
    return ev;
  }
  function pagehide() { for (const fn of winListeners.pagehide || []) fn({ type: 'pagehide' }); }
  const sent = () => {
    const out = [];
    const bodies = [...beacons.filter((b) => beacon === 'ok').map((b) => b.body), ...fetches.map((f) => f.init.body)];
    for (const body of bodies) { const j = JSON.parse(body); out.push(...(Array.isArray(j.events) ? j.events : [j])); }
    return out;
  };
  return { run, runSource, advance, intersect, setVisibility, fire, pagehide, sent, beacons, fetches, forbidden, observers, timers, docListeners, winListeners, sandbox, now: () => startMs + clock };
}
