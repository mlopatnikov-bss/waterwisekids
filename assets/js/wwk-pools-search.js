/* WaterWiseKids Find a Pool: static nationwide search (WWK-POOLS-NATIONWIDE-025 r1).
   Progressive enhancement: without JavaScript the page lists every state (with counts) and each state page lists its
   pools, so nothing depends on this script. With JavaScript the search form appears; the compact index
   /assets/data/pools/pools-search.json (no quotes, no prices) is fetched on first use and matched in the browser.
   No geolocation, no maps, no third-party requests.
   Each pool carries its components: one entry per physical pool at the venue [s = indoor|outdoor|unknown,
   e = open|conditional|unknown|restricted|null, n = season, o = {offering: public|members|unknown}].
   A pool matches only if ONE component satisfies every active filter at once (same rule as wwk-pools.js on the state
   pages), so attributes of different pools or access arrangements at one venue are never combined. With "Open to the
   public", an offering filter only matches when the operator confirms non-members can take part in that offering.
   Starts on "Open to the public"; "Clear search" returns to that default. Unknown never matches.
   r1: result links carry the active filters (?access=...#pool-id) so the state page opens on the same view with the chosen pool
   visible; a failed data request (HTTP error or offline) leaves the state list usable and the next search retries. */
(function () {
  'use strict';
  var form = document.getElementById('poolSearch');
  if (!form) return;
  var status = document.getElementById('poolSearchStatus');
  var list = document.getElementById('poolResults');
  var note = document.getElementById('poolSearchNote');
  var DATA = '/assets/data/pools/pools-search.json?v=20261013r1';
  var LIMIT = 60;
  var idx = null, loading = null, states = {}, lastSig = null;
  var OFFERS = [['lessons', 'lessons'], ['openSwim', 'open_swim'], ['lapSwim', 'lap_swim']];
  var ENTRY = { open: 'Open to the public', conditional: 'Open to the public, with conditions', unknown: 'Public access not confirmed', restricted: 'Members, residents or guests only' };
  var SETTING = { indoor: 'Indoor', outdoor: 'Outdoor', both: 'Indoor and outdoor pools', unknown: 'Indoor or outdoor not stated' };
  function val(name) { var el = form.elements[name]; return el ? (el.type === 'checkbox' ? (el.checked ? 'yes' : '') : el.value) : ''; }
  function fold(s) { return String(s || '').toLowerCase().normalize ? String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') : String(s || '').toLowerCase(); }
  function compMatches(p, f) {
    if (f.setting && p.s !== f.setting) return false;
    if (f.season && p.n !== f.season) return false;
    var wanted = OFFERS.filter(function (o) { return f[o[0]]; }).map(function (o) { return o[1]; });
    for (var i = 0; i < wanted.length; i++) { if (!(wanted[i] in p.o)) return false; }
    if (f.access === 'open') {
      if (wanted.length) return wanted.every(function (k) { return p.o[k] === 'public'; });
      return p.e === 'open' || p.e === 'conditional';
    }
    if (f.access === 'unknown' || f.access === 'restricted') return p.e === f.access;
    if (!wanted.length && !p.e) return false;
    return true;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var LOADING = 'Loading pools…', IDLE = 'Type a city, pool or state, or change a filter, to search every listed pool.';
  var FAILED = 'Search could not load. Pick your state below, or try the search again.';
  var lastStatus = IDLE;
  function setStatus(t) { status.textContent = t; lastStatus = t; }
  // One shared request. A failed request (HTTP error or network) is never cached: `loading` is cleared so the next intentional
  // search retries, and every caller attaches its own rejection handler (no unhandled rejections).
  function load() {
    if (idx) return Promise.resolve(idx);
    if (loading) return loading;
    status.textContent = LOADING; form.setAttribute('aria-busy', 'true');
    var p = fetch(DATA, { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (d) {
      var rows = d.p.map(function (r) {
        return { id: r[0], name: r[1], city: r[2], st: r[3], pa: r[4], setting: r[5],
                 comps: r[6].map(function (c) { return { s: c[0], e: c[1], n: c[2], o: c[3] || {} }; }),
                 text: fold([r[1], r[2], r[3], (d.states[r[3]] || [])[0]].join(' ')) };
      });
      states = d.states; idx = rows;
      return idx;
    });
    loading = p;
    p.then(function () {
      form.removeAttribute('aria-busy');
      if (status.textContent === LOADING) status.textContent = lastStatus;   // preload finished before any search
    }, function () {
      if (loading === p) loading = null;
      form.removeAttribute('aria-busy');
    });
    return p;
  }
  function fail() {
    lastSig = null;                       // the next attempt re-renders even with the same filters
    list.innerHTML = ''; list.hidden = true; note.hidden = true;
    setStatus(FAILED);
  }
  function filters() {
    return { q: fold(val('q')).trim(), state: val('state'), setting: val('setting'), season: val('season'), access: val('access'),
             lessons: val('lessons'), openSwim: val('open-swim'), lapSwim: val('lap-swim') };
  }
  // filter context carried to the state page, so the selected pool is shown there in the same filtered view
  function context(f) {
    var q = [];
    if (f.access !== 'open') q.push('access=' + encodeURIComponent(f.access));
    if (f.setting) q.push('setting=' + encodeURIComponent(f.setting));
    if (f.season) q.push('season=' + encodeURIComponent(f.season));
    if (f.lessons) q.push('lessons=yes');
    if (f.openSwim) q.push('open-swim=yes');
    if (f.lapSwim) q.push('lap-swim=yes');
    return q.length ? '?' + q.join('&') : '';
  }
  function render(all) {
    var f = filters();
    var sig = JSON.stringify(f);
    if (sig === lastSig) { status.textContent = lastStatus; return; }
    var detail = !!(f.setting || f.season || f.lessons || f.openSwim || f.lapSwim);
    var terms = f.q ? f.q.split(/\s+/) : [];
    var hits = all.filter(function (r) {
      if (f.state && r.st !== f.state) return false;
      for (var i = 0; i < terms.length; i++) { if (r.text.indexOf(terms[i]) < 0) return false; }
      return r.comps.some(function (p) { return compMatches(p, f); });
    });
    lastSig = sig;
    var shown = hits.slice(0, LIMIT), ctx = context(f);
    list.innerHTML = shown.map(function (r) {
      var nm = states[r.st] || [r.st, ''];
      return '<li><a href="/find-a-pool/' + esc(nm[1]) + '.html' + esc(ctx) + '#' + esc(r.id) + '">' + esc(r.name) + '</a>' +
        '<p>' + esc(r.city) + ', ' + esc(nm[0]) + ' &middot; ' + esc(ENTRY[r.pa] || '') + ' &middot; ' + esc(SETTING[r.setting] || '') + '</p></li>';
    }).join('');
    list.hidden = !shown.length;
    var label = (f.access === 'open' && (f.lessons || f.openSwim || f.lapSwim)) ? ' where non-members can take part in the selected activities'
      : ({ open: ' open to the public', unknown: ' where public access is not confirmed', restricted: ' for members, residents or guests only' }[f.access] || '');
    setStatus(hits.length + ' of ' + all.length + ' pools' + label + (hits.length > LIMIT ? '. Showing the first ' + LIMIT + '; add a city or state to narrow it.' : '.') + (hits.length ? '' : ' Try removing a filter.'));
    note.hidden = !detail;
  }
  function apply() { load().then(render).then(null, fail); }
  var timer = null;
  form.hidden = false;
  // the text box is handled by 'input'; its 'change' (fired on blur, e.g. when a result link is pressed) must not re-render
  // the list under the pointer
  form.addEventListener('change', function (e) { if (e.target.name !== 'q') apply(); });
  form.addEventListener('input', function (e) { if (e.target.name === 'q') { clearTimeout(timer); timer = setTimeout(apply, 150); } });
  form.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
  var reset = form.querySelector('[data-pool-reset]');
  if (reset) reset.addEventListener('click', function () { form.reset(); apply(); });
  setStatus(IDLE);
  // warm the data on first focus; a failure here is reported and the next search retries
  form.addEventListener('focusin', function () { load().then(null, fail); }, { once: true });
})();
