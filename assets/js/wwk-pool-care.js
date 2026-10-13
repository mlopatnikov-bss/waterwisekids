/* WaterWiseKids Pool Care (WWK-RESIDENTIAL-POOL-CARE-026): in-page search and filters.
   Progressive enhancement: without JavaScript every guide and every listing is on the page (forms stay hidden).
   - /pool-care/: guide search filters the guide cards by words in their title, summary, headings and "applies to".
   - /pool-care/stores/ and /pool-care/services/: name/city/area text, state, and services (a listing must offer EVERY
     checked service, as stated on the business's own website). Stores and service companies are separate pages and
     data sets; nothing here mixes them. No network requests, no geolocation, no storage. */
(function () {
  'use strict';
  function fold(s) { s = String(s || '').toLowerCase(); return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s; }
  function terms(q) { q = fold(q).replace(/[^a-z0-9' ]+/g, ' ').trim(); return q ? q.split(/\s+/) : []; }
  function has(text, ts) { for (var i = 0; i < ts.length; i++) { if (text.indexOf(ts[i]) < 0) return false; } return true; }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  // ---- guide search (hub) ----
  var gf = document.getElementById('pcGuideSearch');
  if (gf) {
    var gs = document.getElementById('pcGuideStatus');
    var cards = document.querySelectorAll('.pc-topic .pc-guides li');
    var total = cards.length;
    var gapply = function () {
      var ts = terms(gf.elements.q.value), shown = 0;
      each(cards, function (li) { var ok = has(fold(li.getAttribute('data-text')), ts); li.hidden = !ok; if (ok) shown++; });
      each(document.querySelectorAll('.pc-topic'), function (sec) { sec.hidden = !sec.querySelector('.pc-guides li:not([hidden])'); });
      gs.textContent = ts.length ? (shown ? shown + ' of ' + total + ' guides match.' : 'No guides match. Try a shorter word, such as "filter" or "closing".') : '';
    };
    var gt = null;
    gf.hidden = false;
    gf.addEventListener('input', function () { clearTimeout(gt); gt = setTimeout(gapply, 120); });
    gf.addEventListener('submit', function (e) { e.preventDefault(); gapply(); });
    gf.querySelector('[data-pc-reset]').addEventListener('click', function () { gf.reset(); gapply(); gf.elements.q.focus(); });
  }

  // ---- directory filters (stores / services) ----
  var f = document.getElementById('pcDirFilters');
  if (!f) return;
  var status = document.getElementById('pcDirStatus'), empty = document.getElementById('pcDirEmpty');
  var noun = f.getAttribute('data-noun'), nouns = f.getAttribute('data-nouns');
  var all = document.querySelectorAll('.pc-card'), sections = document.querySelectorAll('.pc-state');
  var N = all.length;
  function apply() {
    var ts = terms(f.elements.q.value), st = f.elements.state.value, want = [];
    each(f.querySelectorAll('input[name="svc"]:checked'), function (c) { want.push(c.value); });
    var shown = 0;
    each(all, function (c) {
      var svc = ' ' + c.getAttribute('data-svc') + ' ';
      var ok = (!st || c.getAttribute('data-state') === st) && has(fold(c.getAttribute('data-text')), ts) &&
               want.every(function (w) { return svc.indexOf(' ' + w + ' ') >= 0; });
      c.hidden = !ok; if (ok) shown++;
    });
    each(sections, function (s) { s.hidden = !s.querySelector('.pc-card:not([hidden])'); });
    var active = ts.length || st || want.length;
    status.textContent = active ? shown + ' of ' + N + ' ' + (N === 1 ? noun : nouns) + ' match.' : 'Showing all ' + N + ' ' + nouns + '.';
    empty.hidden = shown > 0;
  }
  var t = null;
  f.hidden = false;
  f.addEventListener('input', function (e) { if (e.target.name === 'q') { clearTimeout(t); t = setTimeout(apply, 120); } });
  f.addEventListener('change', function (e) { if (e.target.name !== 'q') apply(); });
  f.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
  f.querySelector('[data-pc-reset]').addEventListener('click', function () { f.reset(); apply(); });
  // a state link (#st-tx) or ?state=TX opens the list on that state
  var m = /[?&]state=([A-Za-z]{2})\b/.exec(location.search);
  if (m && f.elements.state.querySelector('option[value="' + m[1].toUpperCase() + '"]')) f.elements.state.value = m[1].toUpperCase();
  apply();
})();
