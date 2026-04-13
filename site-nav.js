/**
 * WaterWiseKids — Shared Site Script (site-nav.js)
 * Provides: mobile nav toggle, active link detection,
 * FAQ accordion, scroll-to-top, smooth scroll.
 */
(function () {
  'use strict';

  /* ── Active nav link ─────────────────────────────── */
  function markActiveNav() {
    var path = window.location.pathname;
    // Normalize: strip trailing slash, lowercase
    path = path.replace(/\/$/, '') || '/';

    document.querySelectorAll('a.wwk-nav-link, .wwk-nav-links a, nav a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      // Exact match or starts-with for section pages
      if (href === path || (href !== '/' && path.indexOf(href) === 0)) {
        a.classList.add('active');
      }
    });
  }

  /* ── Mobile nav hamburger ────────────────────────── */
  function initMobileNav() {
    var hamburger = document.querySelector('.wwk-nav-hamburger') || document.querySelector('.hamburger');
    var navLinks = document.querySelector('.wwk-nav-links') || document.querySelector('.nav-links');
    if (!hamburger || !navLinks) return;

    hamburger.setAttribute('aria-label', 'Toggle navigation');
    hamburger.setAttribute('aria-expanded', 'false');

    hamburger.addEventListener('click', function () {
      // Support both 'open' on navLinks and 'mobile-open' on parent nav
      var nav = hamburger.closest('nav');
      var isOpen;
      if (navLinks.classList.contains('wwk-nav-links')) {
        isOpen = navLinks.classList.toggle('open');
      } else {
        isOpen = nav ? nav.classList.toggle('mobile-open') : navLinks.classList.toggle('open');
      }
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      // Animate hamburger → X
      var spans = hamburger.querySelectorAll('span');
      if (spans.length === 3) {
        if (isOpen) {
          spans[0].style.transform = 'translateY(7px) rotate(45deg)';
          spans[1].style.opacity = '0';
          spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
        } else {
          spans[0].style.transform = '';
          spans[1].style.opacity = '';
          spans[2].style.transform = '';
        }
      }
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        var nav = hamburger.closest('nav');
        if (nav) nav.classList.remove('mobile-open');
        hamburger.setAttribute('aria-expanded', 'false');
        var spans = hamburger.querySelectorAll('span');
        spans.forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; });
      }
    });

    // Close on nav link click (mobile)
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        var nav = hamburger.closest('nav');
        if (nav) nav.classList.remove('mobile-open');
        hamburger.setAttribute('aria-expanded', 'false');
        var spans = hamburger.querySelectorAll('span');
        spans.forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }

  /* ── FAQ accordion ───────────────────────────────── */
  function initFAQ() {
    document.querySelectorAll('.faq-item, .faq-question').forEach(function (el) {
      if (el.classList.contains('faq-question')) return; // handled via parent
      var question = el.querySelector('.faq-question');
      var answer = el.querySelector('.faq-answer');
      if (!question || !answer) return;

      // Set accessible attributes
      question.setAttribute('role', 'button');
      question.setAttribute('tabindex', '0');
      question.setAttribute('aria-expanded', el.classList.contains('open') ? 'true' : 'false');

      function toggle() {
        var isOpen = el.classList.toggle('open');
        question.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }

      question.addEventListener('click', toggle);
      question.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* ── Filter pills (Education hub, etc.) ─────────── */
  function initFilterPills() {
    var pills = document.querySelectorAll('.filter-pill');
    if (!pills.length) return;
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
      });
    });
  }

  /* ── Scroll-to-top button ────────────────────────── */
  function initScrollTop() {
    var btn = document.querySelector('.scroll-top-btn');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Sticky header shadow ────────────────────────── */
  function initStickyHeader() {
    var header = document.querySelector('header, .wwk-nav, nav');
    if (!header) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  /* ── Init ────────────────────────────────────────── */
  function init() {
    markActiveNav();
    initMobileNav();
    initFAQ();
    initFilterPills();
    initScrollTop();
    initStickyHeader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
