/* ════════════════════════════════════════════════════════════════════════════
   WaterWiseKids mobile v4 — WWK-MOBILE-FULL-019 (r2)
   Requested by /assets/js/main.js when the page opens at <=768px or the first time a wider
   session narrows to <=768px. It may arrive at any width; it installs one lifecycle and
   switches the layer on whenever (max-width:768px) matches, independent of the width at load.

   Activation order (idempotent):
     1. wait until /assets/css/wwk-v4.css has applied (probe --wwk-v4-css on :root);
     2. build v4 chrome and task blocks once (try/catch: a failed build removes what it added);
     3. only then add html.wwk-v4, which hides the old injected navigation via CSS.
   Wider than 768px: sheets close, html.wwk-v4 and the hamburger hooks are removed (built nodes
   stay hidden by CSS); narrowing again re-activates without rebuilding.
   Failure: if the stylesheet fails or never applies, or the build throws, html.wwk-v4 is never
   set, nothing is hidden, and the existing m-app/site navigation keeps working.
   Layout stability: if v4 first activates before the first contentful paint it applies the full
   design (html.v4-full). If the page has already painted, nothing on screen is moved: the chrome
   (app bar at its painted height, tab bar, sheets) and the retirement of the clipped category bar
   still apply, task blocks are inserted only where their insertion point is below the visible
   area, and content restyles wait for the next page view.

   It never edits page text, links, JSON-LD, data-cta hooks, school contacts or the near-me
   panel; it only adds elements (and ids on article H2s for the contents list).
   Focused controls are kept fully clear of the app bar and tab bar (section 4).
   Roll back by removing the WWK-MOBILE-FULL-019 block in main.js.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__wwkV4) return;
  var state = window.__wwkV4 = { status: 'waiting', built: false, active: false, full: false, reason: '' };
  var doc = document, root = doc.documentElement;
  var CSS_URL = '/assets/css/wwk-v4.css?v=026care1';
  var DATA_URL = '/assets/data/wwk-v4-data.json?v=20261010v4';
  var mq = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
  function isPhone() { return mq ? mq.matches : window.innerWidth <= 768; }
  var path = location.pathname.replace(/index\.html$/, '');

  function el(tag, attrs, html) {
    var e = doc.createElement(tag);
    if (attrs) for (var k in attrs) { if (attrs[k] != null) e.setAttribute(k, attrs[k]); }
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function svg(d, size) { return '<svg aria-hidden="true" focusable="false" width="' + (size || 24) + '" height="' + (size || 24) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; }
  var I = {
    search: svg('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>'),
    close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    home: svg('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h5v-5h3v5h5V10"/>'),
    guides: svg('<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z"/><path d="M12 6.5v13"/>'),
    pin: svg('<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>'),
    tools: svg('<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
    more: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    target: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/><circle cx="12" cy="12" r="7"/>', 20)
  };

  /* ── 1. Stylesheet readiness (probe, not just a load event: a stale or blocked file fails) ── */
  function cssApplied() {
    try { return getComputedStyle(root).getPropertyValue('--wwk-v4-css').trim() === '1'; } catch (x) { return false; }
  }
  var cssWaiting = false;
  // Ready = the probe rule has applied. Failed = the link reported an error (main.js marks it, or the error event
  // fires here) or the probe has not applied within 10s; the existing navigation then stays for this page view.
  function ensureCss(cb) {
    if (cssApplied()) return cb(true);
    if (cssWaiting) return;
    cssWaiting = true;
    var l = doc.getElementById('wwk-v4-css') || doc.querySelector('link[rel="stylesheet"][href*="/assets/css/wwk-v4.css"]');
    if (!l) {
      l = el('link', { rel: 'stylesheet', id: 'wwk-v4-css', href: CSS_URL });
      l.addEventListener('error', function () { l.setAttribute('data-v4-state', 'error'); });
      doc.head.appendChild(l);
    }
    var done = false, tries = 0, timer = null;
    function finish(ok) { if (done) return; done = true; cssWaiting = false; if (timer) clearInterval(timer); cb(ok); }
    function check() {
      if (cssApplied()) finish(true);
      else if (l.getAttribute('data-v4-state') === 'error' || ++tries > 40) finish(false);
    }
    l.addEventListener('load', check);
    l.addEventListener('error', function () { finish(false); });
    timer = setInterval(check, 250);
    check();
  }

  /* ── 2. Build (once) ── */
  function painted() {           // true once content is visible: first contentful paint happened (or cannot be known)
    try {
      var sup = window.PerformanceObserver && PerformanceObserver.supportedEntryTypes;
      if (!sup || sup.indexOf('paint') === -1) return true;
      var p = performance.getEntriesByType('paint');
      for (var i = 0; i < p.length; i++) if (p[i].name === 'first-contentful-paint') return true;
      return false;
    } catch (x) { return true; }
  }
  // may a block be inserted at viewport y without moving content the visitor can see?
  function fits(y) { return state.full || y >= window.innerHeight; }
  var header = doc.querySelector('header');
  var navEl = doc.querySelector('header nav');
  var hamb = doc.querySelector('header .hamburger');
  var added = [];                     // every node v4 inserts, so a failed build can remove them
  function add(node) { added.push(node); return node; }
  var more, search, qIn, qOut, qStat;
  var lastOpener = null;

  function measure() {
    if (header) {
      var h = Math.round(header.getBoundingClientRect().height);
      if (h > 0) root.style.setProperty('--v4-header-h', h + 'px');
    }
    var tb = doc.querySelector('.v4-tabbar');   // real height incl. safe area: bottom padding and focus scroll padding
    if (tb && tb.getClientRects().length) root.style.setProperty('--v4-tabbar-real', Math.round(tb.getBoundingClientRect().height) + 'px');
    else root.style.removeProperty('--v4-tabbar-real');
  }
  function setExpanded(open) {
    each(doc.querySelectorAll('[data-v4-open]'), function (b) { b.setAttribute('aria-expanded', open && b === lastOpener ? 'true' : 'false'); });
  }
  function sheet(id, title) {
    var d = doc.getElementById(id) || el('dialog', { 'class': 'v4-sheet', id: id, 'aria-labelledby': id + '-title' });
    d.innerHTML = '<div class="v4-sheet-head"><h2 id="' + id + '-title">' + esc(title) + '</h2>' +
      '<button type="button" class="v4-icon-btn" data-v4-close aria-label="Close ' + esc(title.toLowerCase()) + '">' + I.close + '</button></div>' +
      '<div class="v4-sheet-body"></div>';
    d.addEventListener('click', function (e) {
      if (e.target === d || (e.target.closest && e.target.closest('[data-v4-close]'))) closeSheet(d);
    });
    d.addEventListener('close', function () {
      setExpanded(false);
      if (lastOpener && doc.contains(lastOpener)) { try { lastOpener.focus(); } catch (x) {} }
    });
    doc.body.appendChild(add(d));
    return d;
  }
  function openSheet(d, opener) {
    lastOpener = opener || doc.activeElement;
    if (typeof d.showModal === 'function') { if (!d.open) d.showModal(); } else d.setAttribute('open', '');
    setExpanded(true);
  }
  function closeSheet(d) {
    if (!d) return;
    if (typeof d.close === 'function') { if (d.open) d.close(); } else { d.removeAttribute('open'); setExpanded(false); }
  }

  var dataP = null;
  function data() {
    if (!dataP) dataP = fetch(DATA_URL, { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    return dataP;
  }
  // non-urgent uses wait for window load, so the 117 KB guide index never competes with the page's own
  // stylesheets and images on a slow connection; opening search or a state picker fetches it at once
  function dataLater() {
    return new Promise(function (res) {
      if (doc.readyState === 'complete') res(); else window.addEventListener('load', function () { setTimeout(res, 0); });
    }).then(data);
  }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function runSearch() {
    var q = norm(qIn.value);
    data().then(function (d) {
      var terms = q ? q.split(' ') : [];
      if (!terms.length) { qStat.textContent = d.guides.length + ' guides. Type a topic, age or place.'; qOut.innerHTML = ''; return; }
      // every word must start a word in the title, category or card excerpt; title matches rank first
      var scored = [];
      d.guides.forEach(function (g, i) {
        var title = ' ' + norm(g.t + ' ' + g.c) + ' ', all = title + norm(g.e || '') + ' ';
        if (!terms.every(function (t) { return all.indexOf(' ' + t) !== -1; })) return;
        var inTitle = terms.filter(function (t) { return title.indexOf(' ' + t) !== -1; }).length;
        scored.push({ g: g, s: inTitle * 1000 - i });
      });
      var hits = scored.sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.g; });
      qStat.textContent = hits.length ? (hits.length + ' guide' + (hits.length === 1 ? '' : 's') + ' found' + (hits.length > 40 ? ', showing the first 40' : '')) : 'No guides found. Try another word.';
      qOut.innerHTML = hits.slice(0, 40).map(function (g) {
        return '<li><a href="' + esc(g.u) + '"><span>' + esc(g.t) + (g.c ? '<small>' + esc(g.c) + '</small>' : '') + '</span></a></li>';
      }).join('');
    }).catch(function () {
      qStat.innerHTML = 'Search is unavailable right now. <a href="/education/#articleSearch">Browse all guides</a>.';
    });
  }
  function openSearch(opener, q) {
    openSheet(search, opener);
    qIn.value = q != null ? q : qIn.value;
    runSearch();
    try { qIn.focus(); } catch (x) {}
  }

  function guideRows(list) {
    return '<ul class="v4-guide-rows">' + list.map(function (g) {
      return '<li><a href="' + esc(g.u) + '"><span>' + (g.c ? '<span class="cat">' + esc(g.c) + '</span>' : '') + '<strong>' + esc(g.t) + '</strong></span></a></li>';
    }).join('') + '</ul>';
  }
  var TOPICS = [['Pool safety', 'pool'], ['Toddlers', 'toddler'], ['CPR', 'cpr'], ['Swim lessons', 'swim lessons'], ['Open water', 'open water'], ['Bath time', 'bath'], ['Life jackets', 'life jacket']];
  function topicChips(label) {
    return '<div class="v4-chips" role="group" aria-label="' + esc(label) + '">' + TOPICS.map(function (t) {
      return '<button type="button" class="v4-chip" data-v4-open="search" data-v4-q="' + esc(t[1]) + '" aria-haspopup="dialog" aria-expanded="false" aria-controls="v4-search">' + esc(t[0]) + '</button>';
    }).join('') + '</div>';
  }
  // Start here: rendered at build time (no late layout shift) from these entries, which are copied verbatim from the
  // guide cards in /education/index.html via wwk-v4-data.json (check_start_entries in the r1 tools verifies they match).
  // When the guide index loads, rows whose page is no longer listed are dropped and titles refreshed from it.
  var START = [
    { t: 'The Complete Guide to Drowning Prevention', u: '/education/drowning-prevention-guide.html', c: 'Safety Basics' },
    { t: 'Signs of Drowning: What It Really Looks Like', u: '/education/signs-of-drowning.html', c: 'Recognition & Response' },
    { t: 'When Should Kids Start Swim Lessons?', u: '/education/when-to-start-swim-lessons.html', c: 'Readiness' }
  ];
  function startHere(target) {
    var paint = function (rows) {
      target.innerHTML = '<div class="v4-head"><h2 id="v4-start-h">Start here</h2><a href="/education/#articleSearch">All guides</a></div>' + guideRows(rows);
    };
    paint(START);
    dataLater().then(function (d) {
      var by = {}; d.guides.forEach(function (g) { by[g.u] = g; });
      var rows = START.map(function (s) { return by[s.u]; }).filter(Boolean);
      if (!rows.length) { if (target.parentNode) target.parentNode.removeChild(target); return; }
      var changed = rows.length !== START.length || rows.some(function (g, i) { return g.t !== START[i].t || g.c !== START[i].c; });
      if (changed) paint(rows);
    }).catch(function () {});
  }
  function statePicker(target, idSuffix) {
    var id = 'v4-state-' + idSuffix;
    target.innerHTML = '<div class="v4-card"><h2 id="' + id + '-h">Swim lessons by state</h2>' +
      '<div class="v4-field"><label for="' + id + '">State</label><select class="v4-select" id="' + id + '"><option value="">Choose a state…</option></select></div>' +
      '<a class="v4-btn secondary" href="/swim-lessons/directory/#find-near-you">' + I.target + 'Search near me or by ZIP</a></div>';
    var sel = target.querySelector('select');
    var early = function () { data(); };
    sel.addEventListener('focus', early); sel.addEventListener('pointerdown', early);
    dataLater().then(function (d) {
      sel.insertAdjacentHTML('beforeend', d.states.map(function (s) { return '<option value="' + esc(s.u) + '">' + esc(s.n) + '</option>'; }).join(''));
    }).catch(function () {
      target.querySelector('.v4-field').innerHTML = '<a class="v4-btn primary" href="/swim-lessons/directory/">Browse all states</a>';
    });
    sel.addEventListener('change', function () { if (sel.value) location.href = sel.value; });
  }
  function block(cls, labelledBy) { return el('section', { 'class': 'v4-block ' + (cls || ''), 'aria-labelledby': labelledBy || null }); }
  function after(ref, node) { if (ref && ref.parentNode) ref.parentNode.insertBefore(add(node), ref.nextSibling); return node; }
  function searchBlock(cls, label) {
    var b = block(cls);
    b.setAttribute('aria-label', label);
    b.innerHTML = '<button type="button" class="v4-search" data-v4-open="search" aria-haspopup="dialog" aria-expanded="false" aria-controls="v4-search">' + I.search +
      '<span>' + esc(label) + '</span></button><div style="margin-top:12px">' + topicChips('Guide topics') + '</div>';
    return b;
  }

  function build() {
    // More sheet: every header destination (so Jobs, About, Contact... stay one tap from the menu) + follow links
    more = sheet('v4-more', 'Menu');
    var moreCurrent = false;
    var links = [];
    each(doc.querySelectorAll('header .nav-links > li > a'), function (a) { links.push({ href: a.getAttribute('href'), text: a.textContent.trim() }); });
    if (!links.length) links = [{ href: '/education/', text: 'Water Safety' }, { href: '/swim-lessons/', text: 'Find Lessons' }, { href: '/find-a-pool/', text: 'Find a Pool' }, { href: '/aquatic-jobs/', text: 'Aquatic Jobs' }, { href: '/about/', text: 'About' }, { href: '/contact/', text: 'Contact' }];
    var have = {}; links.forEach(function (l) { have[l.href] = 1; });
    // WWK-RESIDENTIAL-POOL-CARE-026: Pool Care (guides + store/service directories) sits after Find a Pool in the menu
    if (!have['/pool-care/']) { var fi = -1; links.forEach(function (l, i) { if (l.href === '/find-a-pool/') fi = i; });
      links.splice(fi >= 0 ? fi + 1 : links.length, 0, { href: '/pool-care/', text: 'Pool Care' }); have['/pool-care/'] = 1; }
    [{ href: '/tools/', text: 'Free tools & printables' }, { href: '/cartoons/', text: 'Cartoons' }].forEach(function (l) { if (!have[l.href]) links.push(l); });
    // Current section (WWK-POOLS-NATIONWIDE-025): the row whose section path contains this page is marked, e.g. Find a Pool on /find-a-pool/ pages
    var inSection = function (h) { return !!h && h !== '/' && h.charAt(0) === '/' && h.charAt(h.length - 1) === '/' && path.indexOf(h) === 0; };
    moreCurrent = links.some(function (l) { return inSection(l.href); });
    var html = '<div class="v4-group"><h3>WaterWiseKids</h3><ul class="v4-rows">' + links.map(function (l) {
      return '<li><a href="' + esc(l.href) + '"' + (inSection(l.href) ? ' aria-current="page"' : '') + '>' + esc(l.text) + '</a></li>';
    }).join('') + '</ul></div>';
    var soc = doc.querySelectorAll('header .wwk-soc-row a');
    if (soc.length) {
      html += '<div class="v4-group"><h3>Follow us</h3><div class="v4-follow">' + Array.prototype.map.call(soc, function (a) {
        return '<a class="v4-chip" href="' + esc(a.getAttribute('href')) + '" target="_blank" rel="noopener"' +
          '' +
          ' aria-label="' + esc(a.getAttribute('aria-label') || a.textContent.trim()) + '">' + esc(a.textContent.trim()) + '</a>';
      }).join('') + '</div></div>';
    }
    more.querySelector('.v4-sheet-body').innerHTML = html;

    // Search sheet: real search over the guide index, fetched only when first needed
    search = sheet('v4-search', 'Search guides');
    search.querySelector('.v4-sheet-body').innerHTML =
      '<label class="v4-visually-hidden" for="v4-q">Search water-safety guides</label>' +
      '<div class="v4-search" style="cursor:text">' + I.search +
      '<input id="v4-q" type="search" autocomplete="off" enterkeyhint="search" placeholder="e.g. life jackets, toddlers, CPR" ' +
      'style="flex:1;min-width:0;border:0;outline:0;font:inherit;font-size:1rem;color:#111827;background:transparent;min-height:48px;padding:0;margin:0;box-shadow:none"></div>' +
      '<p class="v4-muted" id="v4-q-status" role="status" aria-live="polite" style="margin-top:12px"></p>' +
      '<ul class="v4-rows" id="v4-q-results"></ul>';
    qIn = search.querySelector('#v4-q'); qOut = search.querySelector('#v4-q-results'); qStat = search.querySelector('#v4-q-status');
    qIn.addEventListener('input', runSearch);

    // App bar search button (hidden by CSS whenever v4 is not active)
    if (navEl && !navEl.querySelector('.v4-appbar-search')) {
      var sb = add(el('button', { type: 'button', 'class': 'v4-appbar-search', 'aria-label': 'Search guides', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'v4-search', 'data-v4-open': 'search' }, I.search));
      if (hamb && hamb.parentNode === navEl) navEl.insertBefore(sb, hamb); else navEl.appendChild(sb);
    }

    // Tab bar: Home · Guides · Find lessons · Tools · More
    if (!doc.querySelector('.v4-tabbar')) {
      var isArticle = !!doc.querySelector('main.article, link[href*="/assets/css/article.css"]');
      var cur = path === '/' ? 'home'
        : (path.indexOf('/swim-lessons/') === 0 || /swim-lessons|swim-schools|find-swim-lessons/.test(path)) ? 'lessons'
        : (path.indexOf('/education/') === 0 || path.indexOf('/swimmers-hub/') === 0 || isArticle) ? 'guides'
        : (path.indexOf('/tools/') === 0) ? 'tools' : '';
      var tab = function (key, href, icon, label, shortLabel) {
        return '<a href="' + href + '"' + (cur === key ? ' aria-current="page"' : '') + '>' + icon +
          (shortLabel ? '<span class="lbl-long">' + label + '</span><span class="lbl-short">' + shortLabel + '</span>' : '<span>' + label + '</span>') + '</a>';
      };
      var tb = el('nav', { 'class': 'v4-tabbar', 'aria-label': 'Primary' });
      tb.innerHTML = tab('home', '/', I.home, 'Home') + tab('guides', '/education/', I.guides, 'Guides') +
        tab('lessons', '/swim-lessons/', I.pin, 'Find lessons', 'Lessons') + tab('tools', '/tools/', I.tools, 'Tools') +
        '<button type="button"' + (!cur && moreCurrent ? ' class="v4-more-current"' : '') + ' data-v4-open="more" aria-haspopup="dialog" aria-expanded="false" aria-controls="v4-more">' + I.more + '<span>More</span></button>';
      doc.body.appendChild(add(tb));
    }

    // Home: hero CTAs restyled as task cards (CSS), then search, topics, Start here; state picker replaces the state grid
    if (path === '/') {
      var hero = doc.querySelector('section.hero');
      if (hero && !doc.querySelector('.v4-home-tasks') && fits(hero.getBoundingClientRect().bottom)) {
        var t1 = after(hero, searchBlock('v4-home-tasks', 'Search water-safety guides'));
        startHere(after(t1, block('v4-home-start', 'v4-start-h')));
      }
      var sm = doc.querySelector('.state-directory-module'), homeStates = false;
      if (sm && !doc.querySelector('.v4-home-states') && fits(sm.getBoundingClientRect().top)) {
        var t3 = add(el('div', { 'class': 'v4-home-states' })); sm.parentNode.insertBefore(t3, sm); statePicker(t3, 'home'); homeStates = true;
      }
      // body.v4-home hides the state grid (replaced by the picker); hero restyles also need html.v4-full
      if (state.full || homeStates) doc.body.classList.add('v4-home');
    }

    // Guides hub: task first (search, topics, Start here, jump to the library); editorial text stays where it is
    if (path === '/education/') {
      var eh = doc.querySelector('section.page-hero');
      if (eh && !doc.querySelector('.v4-edu-tasks') && fits(eh.getBoundingClientRect().bottom)) {
        var e1 = after(eh, searchBlock('v4-edu-tasks', 'Search all guides'));
        e1.insertAdjacentHTML('beforeend', '<a class="v4-btn secondary" href="#articleSearch">Browse the full guide library</a>');
        startHere(after(e1, block('v4-edu-start', 'v4-start-h')));
      }
      doc.body.classList.add('v4-edu');
    }

    // Articles: contents disclosure and a Find Lessons card (no page text moved or removed)
    var art = doc.querySelector('main.article .article-body');
    if (art && !doc.querySelector('.v4-toc')) {
      var hs = Array.prototype.filter.call(art.querySelectorAll('h2'), function (h) { return h.textContent.trim().length > 0; });
      if (hs.length >= 3 && fits(art.getBoundingClientRect().top)) {
        var items = hs.map(function (h, i) {
          if (!h.id) h.id = 'v4-s' + (i + 1);
          return '<li><a href="#' + esc(h.id) + '">' + esc(h.textContent.replace(/\s+/g, ' ').trim()) + '</a></li>';
        }).join('');
        art.insertBefore(add(el('details', { 'class': 'v4-toc' }, '<summary>In this guide (' + hs.length + ' sections)</summary><nav aria-label="In this guide"><ol>' + items + '</ol></nav>')), art.firstChild);
      }
      if (fits(art.getBoundingClientRect().bottom)) art.appendChild(add(el('aside', { 'class': 'v4-lessons-card v4-card tint', 'aria-labelledby': 'v4-lessons-h' },
        '<h2 id="v4-lessons-h">Find swim lessons near you</h2><p class="v4-muted">Search the nationwide directory by location, ZIP or state.</p>' +
        '<a class="v4-btn primary" href="/swim-lessons/">Find swim lessons</a>')));
    }

    // Find Lessons hub and directory index: state picker near the top (the near-me panel itself is untouched)
    if (path === '/swim-lessons/' || path === '/swim-lessons/directory/') {
      var lh = doc.querySelector('section.page-hero');
      if (lh && !doc.querySelector('.v4-lessons-tasks') && fits(lh.getBoundingClientRect().bottom)) statePicker(after(lh, block('v4-lessons-tasks')), path === '/swim-lessons/' ? 'hub' : 'dir');
    }

    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { if (state.active) measure(); });
      if (header) ro.observe(header);
      var tbo = doc.querySelector('.v4-tabbar'); if (tbo) ro.observe(tbo);
    }
  }
  function unbuild() {
    added.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    added = [];
    doc.body.classList.remove('v4-home', 'v4-edu');
  }

  function enhancePrograms() {
    var box=doc.querySelector('.search-box'),list=doc.getElementById('schoolsList');
    if(!box||!list||!list.querySelector('.school-programs'))return;
    var wrap=doc.querySelector('.v4-program-filters');
    if(!wrap){wrap=el('div',{'class':'v4-program-filters','aria-label':'Filter by listed program'});var labels=['All programs','infant','toddler','preschool','school-age','adult'];labels.forEach(function(label,i){var btn=el('button',{type:'button','class':'v4-chip','data-program':i?label:'','aria-pressed':i?'false':'true'},esc(label));wrap.appendChild(btn);});box.insertAdjacentElement('afterend',wrap);}
    var selected='';
    function filter(){each(list.querySelectorAll('.school-card'),function(card){var found=!selected;each(card.querySelectorAll('.program-badge'),function(badge){if(badge.textContent.trim().toLowerCase()===selected)found=true;});card.hidden=!found;});}
    wrap.addEventListener('click',function(e){var btn=e.target.closest('[data-program]');if(!btn)return;selected=btn.getAttribute('data-program');each(wrap.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',x===btn?'true':'false');});filter();});
    if(window.MutationObserver)new MutationObserver(filter).observe(list,{childList:true});
  }
  enhancePrograms();

  /* ── 3. Hamburger: opens the More sheet only while v4 is active; original attributes restored after ── */
  var HAMB_ATTRS = ['aria-haspopup', 'aria-controls', 'aria-label', 'aria-expanded', 'data-v4-open'];
  var hambOrig = null;
  function hookHamburger(on) {
    if (!hamb) return;
    if (on) {
      if (!hambOrig) { hambOrig = {}; HAMB_ATTRS.forEach(function (a) { hambOrig[a] = hamb.getAttribute(a); }); }
      hamb.setAttribute('aria-haspopup', 'dialog'); hamb.setAttribute('aria-controls', 'v4-more'); hamb.setAttribute('data-v4-open', 'more');
      hamb.setAttribute('aria-label', 'Open menu'); hamb.setAttribute('aria-expanded', 'false');
    } else if (hambOrig) {
      HAMB_ATTRS.forEach(function (a) { if (hambOrig[a] == null) hamb.removeAttribute(a); else hamb.setAttribute(a, hambOrig[a]); });
      hambOrig = null;
    }
  }
  each(doc.querySelectorAll('[data-v4-state-static]'), function(sel) { sel.addEventListener('change', function() { if(sel.value) location.href=sel.value; }); });
  var editorialMq=window.matchMedia('(max-width:768px)');
  function editorialLayout(){each(doc.querySelectorAll('[data-v4-disclosure]'),function(d){d.open=!editorialMq.matches;});}
  editorialLayout();if(editorialMq.addEventListener)editorialMq.addEventListener('change',editorialLayout);
  // capture phase: runs before the site's own hamburger toggle, so the old dropdown never opens while v4 is active
  doc.addEventListener('click', function (e) {
    if (!state.active || !isPhone()) return;
    var t = e.target.closest ? e.target.closest('[data-v4-open]') : null;
    if (!t) return;
    e.preventDefault(); e.stopPropagation();
    if (navEl) navEl.classList.remove('mobile-open');
    if (t.getAttribute('data-v4-open') === 'more') openSheet(more, t);
    else openSearch(t, t.getAttribute('data-v4-q'));
  }, true);

  /* ── 4. Focused controls stay fully clear of the app bar and tab bar (gate A8) ──
     Chromium honours scroll-padding when it reveals a focused element; WebKit does not, and can leave a control a
     few pixels under the tab bar. After the browser's own reveal has settled, scroll the page by the smallest amount
     that puts the control fully between the header and the tab bar (8px gap; a control taller than that space is
     aligned to its top). Nothing happens inside sheets or the chrome, for controls not on screen, if the visitor
     scrolls or presses a key meanwhile, or while an on-screen keyboard has shrunk the visual viewport (the OS keeps
     the caret visible then). Focus, caret and selection are never touched. */
  var focusSeq = 0;
  var CANCEL_EVS = ['wheel', 'touchmove', 'keydown'];
  function keepFocusClear(e) {
    if (!state.active || !isPhone()) return;
    var t = e.target;
    if (!t || t === doc.body || !t.getBoundingClientRect || !t.closest) return;
    if (t.closest('dialog, header, .v4-tabbar')) return;
    var vv = window.visualViewport;
    if (vv && vv.height < window.innerHeight * 0.75) return;
    var seq = ++focusSeq, last = -1, same = 0, frames = 0, cancelled = false;
    var cancel = function () { cancelled = true; };
    CANCEL_EVS.forEach(function (n) { window.addEventListener(n, cancel, true); });
    function done() { CANCEL_EVS.forEach(function (n) { window.removeEventListener(n, cancel, true); }); }
    (function settle() {
      if (seq !== focusSeq || cancelled || doc.activeElement !== t || !state.active) return done();
      var y = window.pageYOffset;
      same = (y === last) ? same + 1 : 0; last = y;
      if (same < 3 && ++frames < 90) { window.requestAnimationFrame(settle); return; }
      done();
      var r = t.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= window.innerHeight || (r.width === 0 && r.height === 0)) return;
      var top = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
      var sticky = doc.querySelector('.directory-search');
      if(sticky && !sticky.contains(t)){var sr=sticky.getBoundingClientRect();if(sr.top>=top-1 && sr.top<top+12)top=Math.max(top,sr.bottom); }
      var tb = doc.querySelector('.v4-tabbar');
      var bottom = (tb && tb.getClientRects().length) ? Math.min(window.innerHeight, tb.getBoundingClientRect().top) : window.innerHeight;
      var gap = 8, dy = 0;
      if (r.height > bottom - top - 2 * gap) {
        if (r.top < top + gap || r.top > bottom - gap - Math.min(r.height, 48)) dy = r.top - (top + gap);
      } else if (r.top < top + gap) dy = r.top - (top + gap);
      else if (r.bottom > bottom - gap) dy = r.bottom - (bottom - gap);
      if (!dy) return;
      try { window.scrollBy({ top: dy, left: 0, behavior: 'instant' }); } catch (x) { window.scrollBy(0, dy); }
    })();
  }
  doc.addEventListener('focusin', keepFocusClear);

  /* ── 5. Lifecycle ── */
  function fail(reason) {
    state.status = 'failed'; state.reason = reason; state.active = false;
    root.classList.remove('wwk-v4', 'v4-full');
    hookHamburger(false);
    unbuild();
    state.built = false;
  }
  function activate() {
    if (state.active || state.status === 'failed' || !isPhone()) return;
    if (state.status !== 'ready') {
      ensureCss(function (ok) {
        if (state.status === 'failed') return;
        if (!ok) return fail('stylesheet did not apply');
        state.status = 'ready';
        sync();
      });
      return;
    }
    if (!state.built) {
      state.full = root.hasAttribute("data-v4-static") || !painted();
      // after paint, keep the app bar at its painted height for this page view so nothing below it moves
      if (!state.full && navEl) {
        var nh = Math.round(navEl.getBoundingClientRect().height);
        if (nh > 0) root.style.setProperty('--v4-appbar-h', nh + 'px');
      }
      try { build(); state.built = true; }
      catch (err) { return fail('build: ' + (err && err.message || err)); }
    }
    hookHamburger(true);
    if (navEl) navEl.classList.remove('mobile-open');
    root.classList.add('wwk-v4');
    if (state.full) root.classList.add('v4-full');
    state.active = true;
    measure();
  }
  function deactivate() {
    if (!state.active) return;
    closeSheet(more); closeSheet(search);
    if (navEl) navEl.classList.remove('mobile-open');
    hookHamburger(false);
    root.classList.remove('wwk-v4');
    state.active = false;
  }
  function sync() {
    if (isPhone()) { if (state.active) measure(); else activate(); }
    else deactivate();
  }
  if (mq) { if (mq.addEventListener) mq.addEventListener('change', sync); else if (mq.addListener) mq.addListener(sync); }
  window.addEventListener('resize', sync);
  sync();
})();
