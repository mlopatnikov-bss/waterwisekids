/* ══════════════════════════════════════════════════════════════════════════════
   WaterWiseKids - MAIN JAVASCRIPT
   Shared functionality across all pages
═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Initialize all scripts when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initStickyHeader();
  initScrollToTop();
  initFormValidation();
  initSmoothScroll();
  initActiveNavLink();
  initFormspreeForms();
});

/* ══════════════════════════════════════════════════════════════════════════════
   MOBILE NAVIGATION HAMBURGER TOGGLE
═══════════════════════════════════════════════════════════════════════════════ */
function initMobileNav() {
  const navToggle = document.querySelector('.hamburger');
  const nav = document.querySelector('nav');

  if (!navToggle) return;

  navToggle.addEventListener('click', function () {
    nav.classList.toggle('mobile-open');
    // Update ARIA attribute for accessibility
    const isOpen = nav.classList.contains('mobile-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is clicked
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('mobile-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function (event) {
    const isClickInNav = nav.contains(event.target);
    const isClickOnToggle = navToggle.contains(event.target);

    if (!isClickInNav && !isClickOnToggle && nav.classList.contains('mobile-open')) {
      nav.classList.remove('mobile-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
   STICKY HEADER SCROLL BEHAVIOR
═══════════════════════════════════════════════════════════════════════════════ */
function initStickyHeader() {
  const header = document.querySelector('header');

  if (!header) return;

  let lastScrollY = 0;
  let isHeaderVisible = true;

  window.addEventListener('scroll', function () {
    const currentScrollY = window.scrollY;

    // Add subtle shadow when scrolled
    if (currentScrollY > 10) {
      header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    } else {
      header.style.boxShadow = '0 1px 0 rgba(0, 0, 0, 0.04)';
    }

    lastScrollY = currentScrollY;
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
   SCROLL TO TOP BUTTON
═══════════════════════════════════════════════════════════════════════════════ */
function initScrollToTop() {
  // Create the scroll-to-top button if it doesn't exist
  let scrollTopBtn = document.getElementById('scrollTopBtn');

  if (!scrollTopBtn) {
    scrollTopBtn = document.createElement('button');
    scrollTopBtn.id = 'scrollTopBtn';
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollTopBtn);

    // Add CSS for the button if not already present
    if (!document.getElementById('scrollTopBtnStyles')) {
      const style = document.createElement('style');
      style.id = 'scrollTopBtnStyles';
      style.textContent = `
        .scroll-top-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 44px;
          height: 44px;
          background: var(--blue-600);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          box-shadow: var(--sh-lg);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scroll-top-btn.show {
          opacity: 1;
          visibility: visible;
        }

        .scroll-top-btn:hover {
          background: var(--blue-700);
          transform: translateY(-2px);
          box-shadow: var(--sh-xl);
        }

        @media (max-width: 480px) {
          .scroll-top-btn {
            bottom: 16px;
            right: 16px;
            width: 40px;
            height: 40px;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  });

  scrollTopBtn.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
   FORM VALIDATION (NEWSLETTER SIGNUP)
═══════════════════════════════════════════════════════════════════════════════ */
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!validateForm(form)) {
        e.preventDefault();
      }
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(function (input) {
      input.addEventListener('blur', function () {
        validateField(input);
      });

      input.addEventListener('input', function () {
        if (input.classList.contains('error')) {
          validateField(input);
        }
      });
    });
  });
}

function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input[required], textarea[required]');

  inputs.forEach(function (input) {
    if (!validateField(input)) {
      isValid = false;
    }
  });

  return isValid;
}

function validateField(field) {
  let isValid = true;
  const value = field.value.trim();

  // Remove previous error state
  field.classList.remove('error');
  const existingError = field.parentElement.querySelector('.form-error');
  if (existingError) {
    existingError.remove();
  }

  // Check if required field is empty
  if (field.hasAttribute('required') && value === '') {
    isValid = false;
    showFieldError(field, 'This field is required');
  }

  // Validate email
  if (field.type === 'email' && value !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      showFieldError(field, 'Please enter a valid email address');
    }
  }

  // Validate phone
  if (field.type === 'tel' && value !== '') {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(value.replace(/\D/g, ''))) {
      isValid = false;
      showFieldError(field, 'Please enter a valid 10-digit phone number');
    }
  }

  return isValid;
}

function showFieldError(field, message) {
  field.classList.add('error');
  const errorEl = document.createElement('div');
  errorEl.className = 'form-error';
  errorEl.textContent = message;
  field.parentElement.appendChild(errorEl);
}

/* ══════════════════════════════════════════════════════════════════════════════
   SMOOTH SCROLL FOR ANCHOR LINKS
═══════════════════════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Skip if href is just '#'
      if (href === '#') {
        return;
      }

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();

        // Account for sticky header height
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });

        // Update URL without page jump
        if (history.pushState) {
          history.pushState(null, null, href);
        }
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
   ACTIVE NAV LINK HIGHLIGHTING
═══════════════════════════════════════════════════════════════════════════════ */
function initActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-links a');
  const currentPage = window.location.pathname;

  navLinks.forEach(function (link) {
    const href = link.getAttribute('href');

    // Check if link href matches current page
    if (href === currentPage || (currentPage === '/' && href === '/')) {
      link.classList.add('active');
    } else if (currentPage.startsWith(href) && href !== '/') {
      link.classList.add('active');
    }
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Debounce function for performance optimization
 */
function debounce(func, delay) {
  let timeoutId;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeoutId);
      func(...args);
    };
    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, delay);
  };
}

/**
 * Check if element is in viewport
 */
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Add animation to element when it comes into view
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(function (el) {
    observer.observe(el);
  });
}

// Initialize scroll animations if Intersection Observer is available
if ('IntersectionObserver' in window) {
  document.addEventListener('DOMContentLoaded', initScrollAnimations);
}

/* ══════════════════════════════════════════════════════════════════════════════
   FORMSPREE AJAX HANDLER
   Applies to every Formspree-backed form on the site.

   Previously this was scoped to [data-form="newsletter-sidebar"], which matched
   51 of the 138 Formspree forms. The other 87 fell through to a native POST and
   Formspree redirected the visitor to https://formspree.io/thanks -- an
   off-site, unbranded page, with no way to fire a conversion event. Formspree
   ignores the _next field on this plan (verified 2026-08-25), so submitting via
   fetch and confirming in place is the only way to keep the visitor on site.

   The success message links to a printable ONLY when the form carries a
   data-printable attribute, which is written from a verified on-disk file. The
   old handler hard-coded /education/summer-safety-checklist-printable.html for
   every sidebar form, so 50 of 51 signups were pointed at the wrong checklist.
═══════════════════════════════════════════════════════════════════════════════ */
function initFormspreeForms() {
  var forms = document.querySelectorAll('form[action*="formspree.io"]');

  forms.forEach(function (form) {
    // 71 pages ship their own inline submit+fetch handler. Binding a second
    // one here would POST the same submission twice -- two emails per signup.
    if (form.getAttribute('data-formspree-inline') === '1') { return; }

    form.addEventListener('submit', function (e) {
      // Belt and braces: if any other handler already took this submit, stand down.
      if (e.defaultPrevented) { return; }

      // No fetch/FormData means no AJAX -- let the native POST happen instead of
      // swallowing the submit and stranding the visitor with nothing.
      if (typeof window.fetch !== 'function' || typeof window.FormData !== 'function') {
        return;
      }

      e.preventDefault();

      // Keep native constraint validation (required, type=email) authoritative.
      if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
        if (typeof form.reportValidity === 'function') form.reportValidity();
        return;
      }

      var btn = form.querySelector('button[type="submit"], input[type="submit"]');
      var originalText = btn ? (btn.tagName === 'INPUT' ? btn.value : btn.textContent) : '';
      if (btn) {
        btn.disabled = true;
        if (btn.tagName === 'INPUT') { btn.value = 'Sending...'; } else { btn.textContent = 'Sending...'; }
      }

      var restoreButton = function () {
        if (!btn) return;
        btn.disabled = false;
        if (btn.tagName === 'INPUT') { btn.value = originalText; } else { btn.textContent = originalText; }
      };

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (response) {
        if (!response.ok) { throw new Error('Formspree responded ' + response.status); }
        showFormspreeSuccess(form);
      }).catch(function () {
        restoreButton();
        showFormspreeError(form);
      });
    });
  });
}

function showFormspreeSuccess(form) {
  var sourceEl = form.querySelector('[name="source"]');
  var source = sourceEl ? sourceEl.value : (form.getAttribute('data-form') || 'unknown');
  var printable = form.getAttribute('data-printable');
  var isInquiry = !!form.querySelector('textarea');

  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'form_submission_success',
      form_type: isInquiry ? 'inquiry' : 'newsletter',
      signup_source: source
    });
    // Retained so existing GTM triggers built on the old event keep firing.
    if (form.getAttribute('data-form') === 'newsletter-sidebar') {
      window.dataLayer.push({ event: 'checklist_signup', signup_source: source });
    }
  }

  var html;
  if (printable) {
    html = '<strong>You\'re in!</strong> ' +
      '<a href="' + printable + '" style="color:#075985;font-weight:600;text-decoration:underline;">' +
      'View &amp; print your checklist</a>';
  } else if (isInquiry) {
    html = '<strong>Thanks &mdash; we got your message.</strong> ' +
      'We read every one and normally reply within two business days.';
  } else {
    // No autoresponder exists on this plan -- Formspree only notifies the site
    // owner, so promising an inbox delivery sends the visitor hunting for an
    // email that is never sent. Confirm the signup and deliver value on-page.
    html = '<strong>You\'re in &mdash; thanks!</strong> ' +
      'Every free printable checklist we publish is here: ' +
      '<a href="/education/" style="color:#075985;font-weight:600;text-decoration:underline;">' +
      'browse the guides</a>.';
  }

  var msg = document.createElement('div');
  msg.setAttribute('role', 'status');
  msg.style.cssText = 'background:#dcfce7;color:#166534;padding:14px;border-radius:8px;' +
    'font-size:.9rem;line-height:1.5;margin-top:8px;';
  msg.innerHTML = html;

  form.style.display = 'none';
  form.insertAdjacentElement('afterend', msg);

  // The "we never spam" note under the form is redundant once it has been sent.
  var wrapper = form.parentElement;
  if (wrapper) {
    var notes = wrapper.querySelectorAll('p');
    Array.prototype.forEach.call(notes, function (n) {
      if (n.textContent.toLowerCase().indexOf('spam') > -1) { n.style.display = 'none'; }
    });
  }
}

function showFormspreeError(form) {
  var existing = form.parentElement && form.parentElement.querySelector('.formspree-error');
  if (existing) { existing.parentElement.removeChild(existing); }

  var msg = document.createElement('div');
  msg.className = 'formspree-error';
  msg.setAttribute('role', 'alert');
  msg.style.cssText = 'background:#fef2f2;color:#991b1b;padding:14px;border-radius:8px;' +
    'font-size:.9rem;line-height:1.5;margin-top:8px;';
  msg.innerHTML = 'Sorry &mdash; that didn\'t send. Please try again, or email us at ' +
    '<a href="mailto:waterwisekids.com@gmail.com" style="color:#991b1b;font-weight:600;' +
    'text-decoration:underline;">waterwisekids.com@gmail.com</a>.';
  form.insertAdjacentElement('afterend', msg);
}

/* ══════════════════════════════════════════════════════════════════════════════
   CONSOLE MESSAGES
═══════════════════════════════════════════════════════════════════════════════ */
console.log('%cWaterWiseKids', 'color: #0284c7; font-size: 24px; font-weight: bold;');
console.log('%cBecause Water Safety Saves Lives', 'color: #14b8a6; font-size: 14px; font-weight: 600;');

/* ══════════════════════════════════════════════════════════════════════════════
   MOBILE APP EXPERIENCE LOADER
   Dynamically loads mobile-app CSS + JS on small screens only.
   Desktop users never download these files.
═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  if (window.innerWidth <= 768) {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/assets/css/m-app.css?v=20260831b';
    document.head.appendChild(css);

    var js = document.createElement('script');
    js.src = '/assets/js/m-app.js?v=20260413';
    document.body.appendChild(js);
  }
})();
