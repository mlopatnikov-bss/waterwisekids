/* WaterWiseKids Find a Pool filters (WWK-WINTER-POOLS-024 r2).
   Progressive enhancement: without JavaScript every pool is listed, grouped as "open to the public", then
   "public access not confirmed", then "members, residents or guests only", and the filter form stays hidden.
   Each card carries data-components: one entry per physical pool at the venue (s = indoor|outdoor|unknown,
   e = open|conditional|unknown|restricted|null, n = season, o = {offering: public|members|unknown}).
   A card matches only if ONE component satisfies every active filter at once, so attributes of different
   pools or access arrangements at the same venue are never combined (e.g. a public indoor pass plus a
   members-only outdoor pool is not a "public outdoor" match). With "Open to the public", an offering filter
   only matches when the operator confirms non-members can take part in that offering.
   The finder starts on "Open to the public"; "Clear filters" returns to that default. Unknown never matches. */
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
  form.hidden = false;
  form.addEventListener('change', apply);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  var reset = form.querySelector('[data-pool-reset]');
  if (reset) reset.addEventListener('click', function () { form.reset(); apply(); });
  apply();
})();
