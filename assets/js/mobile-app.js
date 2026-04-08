/* ══════════════════════════════════════════════════════════════════════════════
   WaterWiseKids — Mobile App Experience v3
   Airbnb-inspired: search pill, category bar, header action, bottom nav,
   section dividers, offer chevrons, sticky search.
   Only runs at ≤768px — no effect on desktop.
   2026-04-07
═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.innerWidth > 768) return;

  var path = window.location.pathname;
  var isHome = (path === '/' || path === '/index.html');
  var isEdu = (path.indexOf('/education') === 0 && (path === '/education/' || path === '/education/index.html'));

  // ═══════════════════════════════════
  // HEADER ACTION BUTTON (notification or search icon)
  // ═══════════════════════════════════
  var headerNav = document.querySelector('header nav');
  if (headerNav) {
    var actionBtn = document.createElement('div');
    actionBtn.className = 'mobile-header-action';
    if (isHome) {
      // Bell icon
      actionBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>';
    } else {
      // Search icon — tapping goes to education hub
      actionBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/></svg>';
      actionBtn.style.cursor = 'pointer';
      actionBtn.addEventListener('click', function () {
        window.location.href = '/education/';
      });
    }
    headerNav.appendChild(actionBtn);
  }

  // ═══════════════════════════════════
  // SEARCH PILL (homepage only)
  // ═══════════════════════════════════
  if (isHome) {
    var hero = document.querySelector('.hero');
    if (hero) {
      var searchHeader = document.createElement('div');
      searchHeader.className = 'mobile-app-search-header';
      searchHeader.innerHTML =
        '<a href="/education/" class="mobile-app-search-pill">' +
          '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">' +
            '<circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/>' +
          '</svg>' +
          '<div class="search-pill-text">' +
            '<span class="search-pill-title">Search safety guides</span>' +
            '<span class="search-pill-sub">Drowning prevention \u00b7 Pool safety \u00b7 CPR</span>' +
          '</div>' +
        '</a>';
      hero.parentNode.insertBefore(searchHeader, hero.nextSibling);
    }
  }

  // ═══════════════════════════════════
  // HORIZONTAL CATEGORY BAR (homepage)
  // ═══════════════════════════════════
  if (isHome) {
    var categories = [
      { label: 'All',           icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>', href: '/education/', active: true },
      { label: 'Pool Safety',   icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/></svg>', href: '/education/pool-safety-rules.html' },
      { label: 'Toddlers',      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"/></svg>', href: '/education/toddler-water-safety.html' },
      { label: 'CPR',            icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>', href: '/education/cpr-basics-parents.html' },
      { label: 'Lessons',       icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"/></svg>', href: '/education/when-to-start-swim-lessons.html' },
      { label: 'Open Water',    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.485 0 4.5 4.03 4.5 9s-2.015 9-4.5 9m0-18c-2.485 0-4.5 4.03-4.5 9s2.015 9 4.5 9M3.25 8.25h17.5M3.25 15.75h17.5"/></svg>', href: '/education/lake-ocean-safety.html' },
      { label: 'Bath Time',     icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>', href: '/education/bath-time-safety-infants.html' }
    ];

    var catBar = document.createElement('div');
    catBar.className = 'mobile-category-bar';

    categories.forEach(function (cat) {
      var a = document.createElement('a');
      a.href = cat.href;
      a.className = 'mobile-cat-item' + (cat.active ? ' active' : '');
      a.innerHTML = cat.icon + '<span>' + cat.label + '</span>';
      catBar.appendChild(a);
    });

    // Insert after search pill or after hero
    var insertTarget = document.querySelector('.mobile-app-search-header') || document.querySelector('.hero');
    if (insertTarget && insertTarget.parentNode) {
      insertTarget.parentNode.insertBefore(catBar, insertTarget.nextSibling);
    }
  }

  // ═══════════════════════════════════
  // SECTION DIVIDERS (homepage)
  // ═══════════════════════════════════
  if (isHome) {
    var dividerTargets = document.querySelectorAll('.stats-bar, .what-we-offer, .featured-articles, .newsletter-section, .b2b-callout, .about-snippet');
    dividerTargets.forEach(function (sec) {
      if (sec.previousElementSibling && !sec.previousElementSibling.classList.contains('mobile-divider')) {
        var divider = document.createElement('div');
        divider.className = 'mobile-divider';
        sec.parentNode.insertBefore(divider, sec);
      }
    });
  }

  // ═══════════════════════════════════
  // OFFER CARD CHEVRONS
  // ═══════════════════════════════════
  var offerCards = document.querySelectorAll('.offer-card');
  offerCards.forEach(function (card) {
    // Wrap existing content in a flex container if not already
    var existingArrow = card.querySelector('.mobile-offer-arrow');
    if (!existingArrow) {
      var arrow = document.createElement('span');
      arrow.className = 'mobile-offer-arrow';
      arrow.style.cssText = 'margin-left:auto;color:#a3a3a3;flex-shrink:0;display:flex;';
      arrow.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
      card.appendChild(arrow);
    }
  });

  // ═══════════════════════════════════
  // BOTTOM NAVIGATION BAR
  // ═══════════════════════════════════
  var nav = document.createElement('nav');
  nav.className = 'mobile-bottom-nav';
  nav.setAttribute('aria-label', 'Mobile navigation');

  var items = [
    { label: 'Home',    href: '/',              icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>' },
    { label: 'Guides',  href: '/education/',    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>' },
    { label: 'Lessons', href: '/swim-lessons/',  icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>' },
    { label: 'Jobs',    href: '/aquatic-jobs/',  icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75a23.978 23.978 0 01-7.577-1.22 2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>' },
    { label: 'About',   href: '/about/',         icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>' }
  ];

  items.forEach(function (item) {
    var a = document.createElement('a');
    a.href = item.href;
    a.innerHTML = item.icon + '<span>' + item.label + '</span>';

    var isActive = false;
    if (item.href === '/' && (path === '/' || path === '/index.html')) isActive = true;
    else if (item.href !== '/' && path.indexOf(item.href) === 0) isActive = true;

    if (isActive) a.classList.add('active');
    nav.appendChild(a);
  });

  document.body.appendChild(nav);

  // ═══════════════════════════════════
  // STICKY SEARCH (education hub)
  // ═══════════════════════════════════
  var searchBar = document.querySelector('.search-filter-bar');
  if (searchBar) {
    var spacer = document.createElement('div');
    spacer.className = 'search-sticky-spacer';
    searchBar.parentNode.insertBefore(spacer, searchBar.nextSibling);

    var stickyOffset = searchBar.offsetTop;

    function checkSticky() {
      if (window.pageYOffset > stickyOffset - 48) {
        searchBar.classList.add('sticky');
        spacer.classList.add('active');
        spacer.style.height = searchBar.offsetHeight + 'px';
      } else {
        searchBar.classList.remove('sticky');
        spacer.classList.remove('active');
        spacer.style.height = '0';
      }
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          checkSticky();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

})();
