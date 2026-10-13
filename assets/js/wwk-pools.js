/* WaterWiseKids Find a Pool filters (WWK-WINTER-POOLS-024 r2).
   Progressive enhancement: without JavaScript every pool is listed, grouped as "open to the public", then
   "public access not confirmed", then "members, residents or guests only", and the filter form stays hidden.
   Each card carries data-components: one entry per physical pool at the venue (s = indoor|outdoor|unknown,
   e = open|conditional|unknown|restricted|null, n = season, o = {offering: public|members|unknown}).
   A card matches only if ONE component satisfies every active filter at once, so attributes of different
   pools or access arrangements at the same venue are never combined (e.g. a public indoor pass plus a
   members-only outdoor pool is not a "public outdoor" match). With "Open to the public", an offering filter
   only matches when the operator confirms non-members can take part in that offering.
   The finder starts on "Open to the public"; "Clear filters" returns to that default. Unknown never matches.
   WWK-POOLS-NATIONWIDE-025 r1: a link from the nationwide search carries its filter context (?access=&setting=&season=&lessons=
   &open-swim=&lap-swim=) plus #pool-id. Those values preset the form, so the selected pool is shown with its own banner, and a
   pool linked by #id that the current filters would hide (e.g. a bare link to a members-only pool) switches "Who can swim" to
   that pool's group. Ordinary visits without parameters or a pool anchor keep the public default. The target pool is scrolled
   into view and focused; "Clear filters" still returns to the public default. */
(function () {
  'use strict';
  var form = document.getElementById('poolFilters');
  if (!form) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll('.pool-card'));
  var regions = Array.prototype.slice.call(document.querySelectorAll('.pool-region'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.pool-group'));
  var status = document.getElementById('poolStatus');
  var note = document.getElementById('poolFilterNote');
  var defNote = document.getElementById('poolDefaultNote');
  var comps = cards.map(function (c) { try { return JSON.parse(c.getAttribute('data-components') || '[]'); } catch (e) { return []; } });
  var OFFERS = [['lessons', 'lessons'], ['openSwim', 'open_swim'], ['lapSwim', 'lap_swim']];
  function val(name) { var el = form.elements[name]; return el ? (el.type === 'checkbox' ? (el.checked ? 'yes' : '') : el.value) : ''; }
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
  function matches(card, list, f) {
    if (f.state && card.getAttribute('data-state') !== f.state) return false;
    return list.some(function (p) { return compMatches(p, f); });
  }
  function apply() {
    var f = { state: val('state'), setting: val('setting'), season: val('season'), access: val('access'),
              lessons: val('lessons'), openSwim: val('open-swim'), lapSwim: val('lap-swim') };
    var detail = !!(f.state || f.setting || f.season || f.lessons || f.openSwim || f.lapSwim);
    var shown = 0, hiddenOther = 0;
    cards.forEach(function (c, i) {
      var ok = matches(c, comps[i], f); c.hidden = !ok; if (ok) shown++;
      if (!ok && f.access === 'open' && c.getAttribute('data-public') !== 'open' && c.getAttribute('data-public') !== 'conditional') hiddenOther++;
    });
    regions.forEach(function (r) {
      var n = r.querySelectorAll('.pool-card:not([hidden])').length, small = r.querySelector('h3 small');
      r.hidden = !n;
      if (small) small.textContent = '(' + n + ')';
    });
    groups.forEach(function (g) {
      var n = g.querySelectorAll('.pool-card:not([hidden])').length, small = g.querySelector('h2 small');
      g.hidden = !n;
      if (small) small.textContent = '(' + n + ')';
    });
    var offerOn = !!(f.lessons || f.openSwim || f.lapSwim);
    var label = (f.access === 'open' && offerOn) ? ' where non-members can take part in the selected activities'
      : ({ open: ' open to the public', unknown: ' where public access is not confirmed', restricted: ' for members, residents or guests only' }[f.access] || '');
    status.textContent = 'Showing ' + shown + ' of ' + cards.length + ' pools' + label + '.' + (shown ? '' : ' Try removing a filter.');
    note.hidden = !detail;
    if (defNote) defNote.hidden = !(f.access === 'open' && !detail && hiddenOther > 0);
  }
  var ctxNote = document.getElementById('poolContextNote');
  var GROUP = { open: 'open', conditional: 'open', unknown: 'unknown', restricted: 'restricted' };
  function setField(name, v) {
    var el = form.elements[name]; if (!el) return false;
    if (el.type === 'checkbox') { el.checked = v === 'yes'; return true; }
    for (var i = 0; i < el.options.length; i++) { if (el.options[i].value === v) { el.value = v; return true; } }
    return false;
  }
  function targetCard() {
    var id; try { id = decodeURIComponent((location.hash || '').slice(1)); } catch (e) { return null; }
    if (!id) return null;
    var c = document.getElementById(id);
    return c && c.classList.contains('pool-card') ? c : null;
  }
  function nonDefault() { return val('access') !== 'open' || !!(val('setting') || val('season') || val('lessons') || val('open-swim') || val('lap-swim')); }
  function explain(why, card) {
    if (!ctxNote) return;
    var lab = { open: 'pools open to the public', unknown: 'pools whose public access is not confirmed', restricted: 'pools for members, residents or guests only', '': 'all pools' }[val('access')];
    var name = card && card.querySelector('.pool-name') ? card.querySelector('.pool-name').textContent : 'this pool';
    ctxNote.textContent = !nonDefault() ? '' : why === 'search' ? 'Filters from your search are applied (' + lab + '), so ' + name + ' is shown. Choose "Clear filters" to return to pools open to the public.'
      : 'Showing ' + lab + ' because you followed a link to ' + name + '. Choose "Clear filters" to return to pools open to the public.';
    ctxNote.hidden = !ctxNote.textContent;
  }
  function reveal(card, why) {
    if (!card) return;
    if (card.hidden) {   // reconcile: show the linked pool in its own group (never relabels it as public)
      form.reset();
      setField('access', GROUP[card.getAttribute('data-public')] || '');
      apply();
      why = why || 'link';
    }
    if (card.hidden) { form.reset(); setField('access', ''); apply(); }
    explain(why, card);
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '-1');
    try { card.scrollIntoView({ block: 'start', behavior: 'instant' }); } catch (e) { card.scrollIntoView(); }   // a deep link jumps; no long smooth scroll
    try { card.focus({ preventScroll: true }); } catch (e) { card.focus(); }
  }
  form.hidden = false;
  // filter context carried from the nationwide search (only recognised values; anything else is ignored)
  var params = {}; var fromSearch = false;
  (location.search || '').replace(/^\?/, '').split('&').forEach(function (kv) {
    if (!kv) return; var i = kv.indexOf('=');
    try { params[decodeURIComponent(kv.slice(0, i < 0 ? kv.length : i))] = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' ')); } catch (e) {}
  });
  ['access', 'setting', 'season', 'lessons', 'open-swim', 'lap-swim'].forEach(function (k) { if (k in params && setField(k, params[k])) fromSearch = true; });
  form.addEventListener('change', function () { if (ctxNote) ctxNote.hidden = true; apply(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  var reset = form.querySelector('[data-pool-reset]');
  if (reset) reset.addEventListener('click', function () { form.reset(); if (ctxNote) ctxNote.hidden = true; apply(); });
  apply();
  var t0 = targetCard();
  if (t0) reveal(t0, fromSearch ? 'search' : '');
  else if (fromSearch) explain('search', null);
  window.addEventListener('hashchange', function () { reveal(targetCard(), 'link'); });
})();
