/* WaterWiseKids: "Swim schools near me" and ZIP search for the swim school directory.
   Proposed 2026-10-08 (task WWK-REQ-fa3fd2ee), not published.
   Revised 2026-10-09 (task WWK-NEAR-MANHATTAN-010), not published: a directory row may carry several
   verified pool points ("venues"); its distance is its nearest pool, and the card names that pool.
   Analytics is off by default (ANALYTICS = false), per the owner's preparation default.

   Privacy, by design:
   - Location is asked for only when the visitor presses "Swim schools near me". Nothing is
     requested on page load, from a link or from a URL.
   - The browser's answer is rounded to 2 decimals (about 1 km) at once and used only in this
     page's memory to find the state and distances. It is never stored (no cookies, no
     localStorage), never put in a URL, never sent to WaterWiseKids or anyone else.
   - ZIP codes typed by the visitor are handled the same way.
   - The two data files fetched after a visitor acts are the same national files for everyone,
     so the request itself reveals nothing about where the visitor is.
   - Analytics is off (ANALYTICS = false). If it is ever switched on, the event carries only the
     method and a coarse outcome (ok, fallback, invalid or error), never a place, a ZIP or a state.

   Data honesty:
   - Distances are shown only for schools with a verified facility coordinate (schools-geo.json).
     Every other listing in the visitor's state is shown without a distance, by town.
   - ZIP positions are Census ZIP Code Tabulation Area internal points, labelled as "the center
     of ZIP ....". Distances are straight-line, rounded, and say so.
   - Only rows present in the public directory data (SWIM_SCHOOLS_DATA) can ever be shown, so the
     directory's location policy is inherited and cannot be bypassed by the coordinate file. */
(function () {
  'use strict';

  var ZIP_URL = '/assets/data/wwk-zip-points.json';
  var GEO_URL = '/swim-lessons/directory/schools-geo.json';
  var RADIUS_MI = 60;          // verified-distance results shown within this straight-line radius
  var NEARBY_STATE_MI = 10;    // another state counts as "also near" if a ZIP area center is this close
  var OUTSIDE_MI = 150;        // farther than this from every ZIP area center: outside the U.S. areas we cover
  var WATCHDOG_MS = 15000;     // some browsers never answer if the prompt is ignored
  var ANALYTICS = false;       // owner's preparation default: no new analytics event is sent
  var NAMES = {AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',
    DE:'Delaware',DC:'Washington, D.C.',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',
    IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',
    MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',
    NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',
    OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',
    UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
    PR:'Puerto Rico',VI:'the U.S. Virgin Islands',GU:'Guam',AS:'American Samoa',MP:'the Northern Mariana Islands'};
  var PROGRAMS = {infant:'Infants', toddler:'Toddlers', preschool:'Preschool', 'school-age':'School-age', adult:'Adults'};

  var panel = document.getElementById('find-near-you');
  if (!panel || panel.getAttribute('data-wwk-ready') === '1') return;
  panel.setAttribute('data-wwk-ready', '1');
  var nearBtn = document.getElementById('wwk-near-me');
  var form = document.getElementById('wwk-zip-form');
  var zipInput = document.getElementById('wwk-zip');
  var zipError = document.getElementById('wwk-zip-error');
  var status = document.getElementById('wwk-near-status');
  var choice = document.getElementById('wwk-near-choice');
  var out = document.getElementById('resultsArea') || document.getElementById('wwk-near-results');
  if (!nearBtn || !form || !zipInput || !status || !choice || !out) return;

  function directory() {
    try { return (typeof SWIM_SCHOOLS_DATA === 'object' && SWIM_SCHOOLS_DATA) ? SWIM_SCHOOLS_DATA : null; }
    catch (e) { return null; }
  }

  // Outcomes are folded so the event can never hint at a place (territory, border ZIP, abroad).
  var OUTCOME = {ok: 'ok', invalid: 'invalid', data_error: 'error'};
  function track(method, outcome) {
    if (!ANALYTICS) return;
    outcome = OUTCOME[outcome] || 'fallback';
    try {
      if (Array.isArray(window.dataLayer)) window.dataLayer.push({event: 'wwk_near', wwk_near_method: method, wwk_near_outcome: outcome});
    } catch (e) { /* never break the search */ }
  }

  function say(msg) {
    status.textContent = '';
    window.setTimeout(function () { status.textContent = msg; }, 40);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  // One sequence number for every search on this page (near me, ZIP, and the directory's own
  // filters). A result is drawn only if no newer search started after it, so a late browser
  // answer can never overwrite a newer search or steal focus.
  var seq = 0, request = 0;
  function nextSearch() { seq++; request++; busy(false); return seq; }
  function current(token) { return token === seq; }
  function clearOurResults() {
    if (out.querySelector('.wwk-near-results')) clear(out);
  }
  ['stateFilter'].forEach(function (id) {
    var e = document.getElementById(id);
    if (e) e.addEventListener('change', function () { seq++; request++; busy(false); });
  });
  ['citySearch', 'schoolSearch'].forEach(function (id) {
    var e = document.getElementById(id);
    if (e) e.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { seq++; request++; busy(false); } });
  });
  Array.prototype.forEach.call(document.querySelectorAll('.btn-search, .btn-clear'), function (b) {
    b.addEventListener('click', function () { seq++; request++; busy(false); });
  });

  // ---- Data (same national files for every visitor, fetched once, only after an action) ----
  var zipData = null, geoData = null, venueData = Object.create(null), zipLoading = null, geoLoading = null;
  function getJSON(url) {
    return fetch(url, {credentials: 'same-origin', cache: 'default'}).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }
  function loadZip() {
    if (zipData) return Promise.resolve(zipData);
    if (zipLoading) return zipLoading;
    zipLoading = getJSON(ZIP_URL).then(function (d) {
      var map = Object.create(null), pts = [];
      for (var i = 0; i < d.z.length; i++) {
        var f = d.z[i].split(',');
        var rec = {zip: f[0], lat: +f[1], lon: +f[2], states: f[3].split('|')};
        map[rec.zip] = rec; pts.push(rec);
      }
      zipData = {map: map, pts: pts, prefixes: d.prefixes || {}};
      return zipData;
    }, function (e) { zipLoading = null; throw e; });
    return zipLoading;
  }
  function loadGeo() {
    if (geoData) return Promise.resolve(geoData);
    if (geoLoading) return geoLoading;
    geoLoading = getJSON(GEO_URL).then(function (d) {
      var idx = Object.create(null);
      function okPoint(r) { return typeof r.lat === 'number' && typeof r.lon === 'number' && Math.abs(r.lat) <= 90 && Math.abs(r.lon) <= 180; }
      (d.rows || []).forEach(function (r) {
        if (okPoint(r)) idx[r.state + '|' + r.name] = r;
      });
      // Pools of one directory row. Each is used only if its row is in SWIM_SCHOOLS_DATA (checked in
      // render) and its link stays on that row's own website (checked in venueUrl).
      var vidx = Object.create(null);
      (Array.isArray(d.venues) ? d.venues : []).forEach(function (v) {
        if (!v || !okPoint(v) || typeof v.venue !== 'string' || typeof v.url !== 'string') return;
        var k = v.state + '|' + v.name;
        (vidx[k] = vidx[k] || []).push(v);
      });
      venueData = vidx;
      geoData = idx;
      return idx;
    }, function () { geoData = Object.create(null); return geoData; });  // distances simply unavailable
    return geoLoading;
  }

  // ---- Geometry ----
  function miles(aLat, aLon, bLat, bLon) {
    var R = 3958.8, toR = Math.PI / 180;
    var dLat = (bLat - aLat) * toR, dLon = (bLon - aLon) * toR;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(aLat * toR) * Math.cos(bLat * toR) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }
  function distanceText(d) {
    if (d < 1) return 'Less than 1 mile away';
    var v = d < 10 ? (Math.round(d * 10) / 10).toFixed(1) : String(Math.round(d));
    return 'About ' + v + ' miles away';
  }
  function nearestByState(lat, lon) {
    var best = Object.create(null);
    for (var i = 0; i < zipData.pts.length; i++) {
      var p = zipData.pts[i];
      var dLon = Math.abs(((p.lon - lon) % 360 + 540) % 360 - 180);           // wraps at the date line
      if (Math.abs(p.lat - lat) > 3 || dLon > 12) continue;                   // cheap pre-filter (well beyond 150 miles)
      var d = miles(lat, lon, p.lat, p.lon);
      var st = p.states[0];
      if (!best[st] || d < best[st]) best[st] = d;
    }
    return best;
  }

  // A pool link is shown only if it is https, has exactly the same origin (scheme, host and port) as the
  // row's own website, and sits under that website's path (for example, a pool page under
  // britishswimschool.com/manhattan/). A different port is a different origin and is refused.
  function venueUrl(row, v) {
    try {
      var base = new URL(row.website), u = new URL(v.url);
      if (u.protocol !== 'https:' || base.protocol !== 'https:' || u.username || u.password || u.search || u.hash) return null;
      if (u.origin !== base.origin || u.pathname.indexOf(base.pathname) !== 0) return null;
      return u.href;
    } catch (e) { return null; }
  }
  // Distance from a point to a row: its nearest verified pool if it has pools, otherwise its own
  // verified point. Returns null when the row has neither.
  function rowDistance(st, row, geo, point) {
    var vs = venueData[st + '|' + row.name];
    if (vs && vs.length) {
      var best = null;
      for (var i = 0; i < vs.length; i++) {
        if (!venueUrl(row, vs[i])) continue;
        var d = miles(point.lat, point.lon, vs[i].lat, vs[i].lon);
        if (!best || d < best.d || (d === best.d && vs[i].venue < best.venue.venue)) best = {d: d, venue: vs[i]};
      }
      if (best) return best;
    }
    var g = geo[st + '|' + row.name];
    return g ? {d: miles(point.lat, point.lon, g.lat, g.lon), venue: null} : null;
  }
  function hasPlace(st, row, geo) {
    var vs = venueData[st + '|' + row.name];
    return !!(geo[st + '|' + row.name] || (vs && vs.some(function (v) { return !!venueUrl(row, v); })));
  }

  // ---- Results ----
  function card(row, dist, venue) {
    var c = el('div', 'school-card wwk-near-card');
    var h = el('div', 'school-header');
    var hd = el('div');
    hd.appendChild(el('h3', 'school-name', row.name));
    hd.appendChild(el('span', 'school-chain', row.chain || ''));
    h.appendChild(hd);
    c.appendChild(h);
    var info = el('div', 'school-info');
    info.appendChild(el('div', null, 'Location: ' + row.city + ', ' + (NAMES[row.state] || row.state)));
    if (dist != null) info.appendChild(el('div', 'wwk-near-distance', distanceText(dist) + ' (straight line)' + (venue ? ' to the nearest pool' : '')));
    var vurl = venue ? venueUrl(row, venue) : null;
    if (vurl) {
      var vp = el('div', 'wwk-near-venue');
      vp.appendChild(document.createTextNode('Nearest pool: '));
      var va = el('a', 'wwk-near-venue-link', venue.venue);
      va.href = vurl; va.target = '_blank'; va.rel = 'noopener';
      va.setAttribute('aria-label', 'Nearest pool: ' + venue.venue + ' (opens the pool page in a new tab)');
      vp.appendChild(va);
      info.appendChild(vp);
    }
    c.appendChild(info);
    if (Array.isArray(row.programs) && row.programs.length) {
      var pr = el('div', 'school-programs');
      row.programs.forEach(function (p) { pr.appendChild(el('span', 'program-badge', PROGRAMS[p] || p)); });
      c.appendChild(pr);
    }
    var url = null;
    try { var u = new URL(row.website); if (u.protocol === 'https:' || u.protocol === 'http:') url = u.href; } catch (e) { url = null; }
    if (url) {
      var act = el('div', 'school-actions');
      var a = el('a', 'visit-site-btn', 'Visit website');
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      a.setAttribute('aria-label', 'Visit the ' + row.name + ' website (opens in a new tab)');
      act.appendChild(a); c.appendChild(act);
    }
    return c;
  }

  function render(opts, token) {
    // opts: {point: {lat, lon} | null, place: text, states: [codes], method, title}
    if (!current(token)) return;                       // a newer search has started
    var D = directory();
    if (!D) { say('The directory did not load. Please reload the page and try again.'); return; }
    var geo = geoData || Object.create(null);
    var near = [], seen = Object.create(null), totalGeo = 0, totalRows = 0, geoStates = Object.create(null);
    for (var st in D) {
      for (var i = 0; i < D[st].length; i++) {
        var row = D[st][i];
        totalRows++;
        if (!hasPlace(st, row, geo)) continue;
        totalGeo++; geoStates[st] = true;
        if (opts.point) {
          var r = rowDistance(st, row, geo, opts.point);
          if (r && r.d <= RADIUS_MI) { near.push({row: row, d: r.d, venue: r.venue}); seen[st + '|' + row.name] = true; }
        }
      }
    }
    near.sort(function (a, b) { return a.d - b.d || a.row.name.localeCompare(b.row.name); });
    var rest = [];
    opts.states.forEach(function (st) {
      (D[st] || []).forEach(function (row) {
        if (seen[st + '|' + row.name]) return;
        var r = opts.point ? rowDistance(st, row, geo, opts.point) : null;
        rest.push({row: row, d: r ? r.d : null, venue: r ? r.venue : null});
      });
    });
    rest.sort(function (a, b) { return a.row.state.localeCompare(b.row.state) || a.row.city.localeCompare(b.row.city) || a.row.name.localeCompare(b.row.name); });
    var stNames = opts.states.map(function (s) { return NAMES[s] || s; }).join(' and ');

    clear(out);
    var wrap = el('div', 'wwk-near-results');
    var head = el('h2', 'wwk-near-heading', opts.title);
    head.id = 'wwk-near-heading'; head.tabIndex = -1;
    wrap.appendChild(head);
    if (opts.point) {
      wrap.appendChild(el('h3', 'wwk-near-sub', 'Within ' + RADIUS_MI + ' miles of ' + opts.place + ' (verified addresses only)'));
      if (near.length) {
        var list = el('div', 'wwk-near-list');
        near.forEach(function (n) { list.appendChild(card(n.row, n.d, n.venue)); });
        wrap.appendChild(list);
      } else {
        wrap.appendChild(el('p', 'wwk-near-note', 'None of the schools with a verified address are within ' + RADIUS_MI + ' miles.'));
      }
    }
    if (opts.states.length) {
      wrap.appendChild(el('h3', 'wwk-near-sub', (opts.point ? 'More listings in ' : 'Listings in ') + stNames + ', by town'));
      if (rest.length) {
        var anyDist = rest.some(function (r) { return r.d != null; });
        wrap.appendChild(el('p', 'wwk-near-note', opts.point
          ? 'Most of these do not have a verified address yet, so they are listed by town. ' +
            (anyDist ? 'A distance is shown where we have one.' : 'None of them has a distance yet.')
          : 'Listed by town. No distances are shown because we could not place this search on the map.'));
        var list2 = el('div', 'wwk-near-list');
        rest.forEach(function (r) { list2.appendChild(card(r.row, r.d, r.venue)); });
        wrap.appendChild(list2);
      } else if (!near.length) {
        wrap.appendChild(el('p', 'wwk-near-note', 'We do not list any swim schools there yet.'));
      }
    }
    var cov = el('p', 'wwk-near-coverage');
    cov.textContent = 'Distances are available for ' + totalGeo + ' of ' + totalRows + ' listings so far' +
      (totalGeo ? ' (' + Object.keys(geoStates).sort().map(function (s) { return NAMES[s] || s; }).join(', ') + ')' : '') +
      '. Distances are straight-line from ' + (opts.method === 'zip' ? 'the center of the ZIP code' : 'your approximate location') +
      ', not driving distance. WaterWiseKids lists a curated selection of schools, not every provider.';
    wrap.appendChild(cov);
    out.appendChild(wrap);
    head.focus();
    var msg = opts.point
      ? near.length + ' with a verified distance within ' + RADIUS_MI + ' miles; ' + rest.length + ' more listed in ' + stNames + '.'
      : rest.length + ' listing' + (rest.length === 1 ? '' : 's') + ' in ' + stNames + '.';
    say((opts.prefix ? opts.prefix + ' ' : '') + msg);
  }

  function askState(message, states, method, point, place, token) {
    if (!current(token)) return;
    clearOurResults();
    clear(choice);
    choice.hidden = false;
    var p = el('p', 'wwk-near-choice-q', message);
    p.id = 'wwk-near-choice-q';
    choice.appendChild(p);
    var row = el('div', 'wwk-near-choice-row');
    row.setAttribute('role', 'group');
    row.setAttribute('aria-labelledby', 'wwk-near-choice-q');
    states.forEach(function (st, i) {
      var b = el('button', 'wwk-near-choice-btn', NAMES[st] || st);
      b.type = 'button';
      b.addEventListener('click', function () {
        if (!current(token)) return;
        choice.hidden = true; clear(choice);
        render({point: point, place: place, states: [st], method: method,
                title: point ? 'Swim schools near ' + place : 'Listings in ' + (NAMES[st] || st)}, token);
      });
      row.appendChild(b);
      if (i === 0) window.setTimeout(function () { b.focus(); }, 0);
    });
    choice.appendChild(row);
    say(message);
  }

  function chooseAnyState(message, method, token) {
    if (!current(token)) return;
    clearOurResults();
    clear(choice); choice.hidden = false;
    var lab = el('label', 'wwk-near-choice-q', message);
    lab.setAttribute('for', 'wwk-near-state');
    var sel = el('select'); sel.id = 'wwk-near-state';
    sel.appendChild(el('option', null, 'Choose a state'));
    sel.firstChild.value = '';
    var D = directory() || {};
    Object.keys(D).sort(function (a, b) { return (NAMES[a] || a).localeCompare(NAMES[b] || b); }).forEach(function (st) {
      var o = el('option', null, (NAMES[st] || st) + ' (' + D[st].length + ')'); o.value = st; sel.appendChild(o);
    });
    var go = el('button', 'wwk-near-choice-btn', 'Show schools'); go.type = 'button';
    go.addEventListener('click', function () {
      if (!sel.value) { sel.focus(); return; }
      var st = sel.value; choice.hidden = true; clear(choice);
      var t = nextSearch();
      render({point: null, place: NAMES[st] || st, states: [st], method: method, title: 'Listings in ' + (NAMES[st] || st)}, t);
    });
    choice.appendChild(lab); choice.appendChild(sel); choice.appendChild(go);
    say(message);
    window.setTimeout(function () { sel.focus(); }, 0);
  }

  function notice(message, token) {           // a message that replaces any earlier results
    if (!current(token)) return;
    clearOurResults();
    say(message);
  }

  // ---- ZIP search ----
  function setZipError(msg) {
    if (msg) {
      zipInput.setAttribute('aria-invalid', 'true');
      zipError.textContent = msg; zipError.hidden = false;   // role="alert" announces it
      zipInput.focus();
    } else {
      zipInput.removeAttribute('aria-invalid');
      zipError.textContent = ''; zipError.hidden = true;
    }
  }
  function normalizeZip(v) {
    var s = String(v || '').trim();
    var m = /^(\d{5})(?:[-\s]?\d{4})?$/.exec(s);
    if (!m || m[1] === '00000') return null;
    return m[1];
  }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var token = nextSearch();                 // also cancels a pending location request
    choice.hidden = true; clear(choice);
    var z = normalizeZip(zipInput.value);
    if (!z) { clearOurResults(); setZipError('Enter a 5-digit ZIP code, like 07731.'); track('zip', 'invalid'); return; }
    setZipError(null);
    say('Looking up ZIP ' + z + '...');
    Promise.all([loadZip(), loadGeo()]).then(function () {
      if (!current(token)) return;
      var D = directory() || {};
      var rec = zipData.map[z];
      if (rec) {
        var covered = rec.states.filter(function (s) { return D[s]; });
        if (!covered.length) {
          track('zip', 'outside');
          notice('ZIP ' + z + ' is in ' + (NAMES[rec.states[0]] || rec.states[0]) + '. We do not list swim schools there yet.', token);
          return;
        }
        var place = 'ZIP ' + z;
        var point = {lat: rec.lat, lon: rec.lon};
        if (covered.length > 1) {
          track('zip', 'ambiguous');
          askState('ZIP ' + z + ' crosses a state line. Which state do you want to see?', covered, 'zip', point, place, token);
          return;
        }
        track('zip', 'ok');
        render({point: point, place: place, states: covered, method: 'zip', title: 'Swim schools near ' + place}, token);
        return;
      }
      var pre = zipData.prefixes[z.slice(0, 3)] || [];
      var prCovered = pre.filter(function (s) { return D[s]; });
      if (pre.length === 1 && prCovered.length === 1) {
        track('zip', 'prefix_only');
        render({point: null, place: NAMES[pre[0]], states: prCovered, method: 'zip', title: 'Listings in ' + NAMES[pre[0]],
                prefix: 'We could not find ZIP ' + z + ' on the Census ZIP map (it may be a PO box or business ZIP), so we used its first three digits.'}, token);
        return;
      }
      track('zip', 'not_found');
      if (pre.length > 1 && prCovered.length) {
        askState('We could not find ZIP ' + z + ' exactly. Its first three digits are used in more than one state or territory. Which state do you want to see?', prCovered, 'zip', null, 'ZIP ' + z, token);
      } else if (pre.length && !prCovered.length) {
        notice('ZIP ' + z + ' looks like it is in ' + (NAMES[pre[0]] || pre[0]) + '. We do not list swim schools there yet.', token);
      } else {
        chooseAnyState('We could not find ZIP ' + z + '. It may be a PO box, business or military ZIP. Choose your state instead:', 'zip', token);
      }
    }, function () {
      if (!current(token)) return;
      track('zip', 'data_error');
      chooseAnyState('ZIP search is not available right now. Choose your state instead:', 'zip', token);
    });
  });
  zipInput.addEventListener('input', function () { if (zipInput.getAttribute('aria-invalid')) setZipError(null); });

  // ---- Near me (explicit visitor choice only) ----
  function busy(on) {
    if (on) { nearBtn.setAttribute('aria-busy', 'true'); nearBtn.setAttribute('aria-disabled', 'true'); }
    else { nearBtn.removeAttribute('aria-busy'); nearBtn.removeAttribute('aria-disabled'); }
  }
  function fallback(msg, outcome, token) {
    if (!current(token)) return;
    busy(false);
    track('geolocation', outcome);
    notice(msg, token);
    zipInput.focus();
  }
  nearBtn.addEventListener('click', function () {
    if (nearBtn.getAttribute('aria-disabled') === 'true') { say('Still waiting for your browser. Check for its location prompt.'); return; }
    var token = nextSearch();
    choice.hidden = true; clear(choice);
    if (!window.isSecureContext || !navigator.geolocation || typeof navigator.geolocation.getCurrentPosition !== 'function') {
      fallback('Your browser cannot share a location here. Enter your ZIP code instead.', 'unsupported', token); return;
    }
    var id = request, done = false;
    busy(true);
    say('Asking your browser for your location. Your browser will ask you first.');
    var watchdog = window.setTimeout(function () {
      if (done || id !== request) return;
      done = true;
      fallback('We did not get a location from your browser. If it asks, allow it and press the button again, or enter your ZIP code.', 'no_answer', token);
    }, WATCHDOG_MS);
    navigator.geolocation.getCurrentPosition(function (pos) {
      if (done || id !== request || !current(token)) return;
      done = true; window.clearTimeout(watchdog);
      var c = pos && pos.coords;
      var lat = c ? Math.round(Number(c.latitude) * 100) / 100 : NaN;     // about 1 km; finer detail is never used
      var lon = c ? Math.round(Number(c.longitude) * 100) / 100 : NaN;
      pos = null; c = null;
      if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        fallback('Your browser sent a location we could not use. Enter your ZIP code instead.', 'bad_position', token); return;
      }
      say('Finding swim schools near you...');
      Promise.all([loadZip(), loadGeo()]).then(function () {
        if (!current(token)) return;
        busy(false);
        var best = nearestByState(lat, lon);
        var states = Object.keys(best).sort(function (a, b) { return best[a] - best[b]; });
        if (!states.length || best[states[0]] > OUTSIDE_MI) {
          track('geolocation', 'outside');
          chooseAnyState('Your location seems to be outside the U.S. areas we cover. Choose a state instead:', 'geolocation', token); return;
        }
        var D = directory() || {};
        var show = states.filter(function (s, i) { return D[s] && (i === 0 || best[s] <= NEARBY_STATE_MI); });
        if (!show.length) {
          track('geolocation', 'outside');
          notice('You seem to be in ' + (NAMES[states[0]] || states[0]) + '. We do not list swim schools there yet.', token); return;
        }
        track('geolocation', 'ok');
        render({point: {lat: lat, lon: lon}, place: 'you', states: show, method: 'geolocation', title: 'Swim schools near you'}, token);
      }, function () {
        if (!current(token)) return;
        busy(false);
        track('geolocation', 'data_error');
        chooseAnyState('Location search is not available right now. Choose your state instead:', 'geolocation', token);
      });
    }, function (err) {
      if (done || id !== request) return;
      done = true; window.clearTimeout(watchdog);
      var code = err && err.code;
      if (code === 1) fallback('Location is turned off for this site, so nothing was shared. You can search by ZIP code instead.', 'denied', token);
      else if (code === 3) fallback('Finding your location took too long. You can search by ZIP code instead.', 'timeout', token);
      else fallback('Your location is not available right now. You can search by ZIP code instead.', 'unavailable', token);
    }, {enableHighAccuracy: false, timeout: 10000, maximumAge: 600000});
  });

  panel.hidden = false;
  // Arriving from a "Swim schools near me" link only moves focus here; it never asks for location.
  if (window.location.hash === '#find-near-you') {
    window.setTimeout(function () { try { panel.scrollIntoView({block: 'start'}); } catch (e) { /* old browsers */ } nearBtn.focus(); }, 0);
  }
})();
