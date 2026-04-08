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
  initSidebarNewsletterForms();
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
   SIDEBAR NEWSLETTER FORM AJAX HANDLER
   Handles sidebar checklist signup forms on article pages
═══════════════════════════════════════════════════════════════════════════════ */
function initSidebarNewsletterForms() {
  var sidebarForms = document.querySelectorAll('[data-form="newsletter-sidebar"]');

  sidebarForms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending...';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          // Push dataLayer event for GTM tracking
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'checklist_signup',
              signup_source: form.querySelector('[name="source"]')
                ? form.querySelector('[name="source"]').value
                : 'sidebar'
            });
          }
          // Replace form with success message and printable link
          var wrapper = form.parentElement;
          form.style.display = 'none';
          var msg = document.createElement('div');
          msg.style.cssText = 'background:#dcfce7;color:#166534;padding:14px;border-radius:8px;font-size:.9rem;line-height:1.5;';
          msg.innerHTML = 'You\'re in! <a href="/education/summer-safety-checklist-printable.html" style="color:#075985;font-weight:600;text-decoration:underline;">View &amp; print your checklist</a>';
          wrapper.appendChild(msg);
          // Hide the privacy note
          var privacyNote = wrapper.querySelector('p:last-child');
          if (privacyNote && privacyNote.textContent.indexOf('spam') > -1) {
            privacyNote.style.display = 'none';
          }
        } else {
          btn.disabled = false;
          btn.textContent = originalText;
          alert('Something went wrong. Please try again.');
        }
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = originalText;
        alert('Something went wrong. Please try again.');
      });
    });
  });
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
    css.href = '/assets/css/m-app.css';
    document.head.appendChild(css);

    var js = document.createElement('script');
    js.src = '/assets/js/m-app.js';
    document.body.appendChild(js);
  }
})();
