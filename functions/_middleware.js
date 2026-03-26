// Cloudflare Pages Function v4: Full production polish
// - CSS cache-busting
// - btn-outline fix
// - Nav standardization
// - Emoji → CSS icon replacement
// - CTA styling standardization
// - Job card mailto individualization
// - Hamburger menu JS
export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  const inlineCSS = `<style>
/* btn-outline base fix */
.btn-outline {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  padding: 12px 24px !important;
  border-radius: 9999px !important;
  text-decoration: none !important;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
  white-space: nowrap;
}

/* Hide raw emoji in icon spans — replace with clean CSS circles */
.hp-hub-card .icon,
.feature-card > div:first-child,
.stat-card > div:first-child,
.step > div:first-child,
.quality-card > div:first-child {
  font-size: 0 !important;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--blue-50, #EFF6FF);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

/* Emoji used as large standalone icons — hide and use CSS */
.thumb {
  font-size: 0 !important;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
}

/* Star ratings — make them gold text, not emoji */
.stars, .star-rating {
  color: #F59E0B;
  letter-spacing: 1px;
}

/* Checkmark list items on advertise page */
.pricing-card li::before,
.check-list li::before {
  content: none;
}

/* Newsletter subscribe button standardization */
.newsletter button,
.newsletter input[type="submit"],
#newsletter-form button {
  background: var(--blue-600, #2563EB) !important;
  color: white !important;
  border: none !important;
  padding: 12px 28px !important;
  border-radius: 9999px !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  cursor: pointer !important;
  transition: background 0.15s !important;
  white-space: nowrap;
}
.newsletter button:hover,
.newsletter input[type="submit"]:hover,
#newsletter-form button:hover {
  background: var(--blue-700, #1D4ED8) !important;
}

/* Form submit buttons — ensure all look interactive */
form button[type="submit"],
form input[type="submit"],
.inquiry-form button,
.contact-form button {
  background: var(--blue-600, #2563EB) !important;
  color: white !important;
  border: none !important;
  padding: 14px 32px !important;
  border-radius: 9999px !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  cursor: pointer !important;
  transition: background 0.15s, transform 0.1s !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
form button[type="submit"]:hover,
form input[type="submit"]:hover {
  background: var(--blue-700, #1D4ED8) !important;
  transform: translateY(-1px);
}

/* View Details links in job cards — make them look like buttons */
.job-card a[href^="mailto"],
.job-card .details-link,
.job-listing a {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px;
  color: var(--blue-600, #2563EB) !important;
  font-weight: 600 !important;
  text-decoration: none !important;
  padding: 8px 16px !important;
  border: 2px solid var(--blue-600, #2563EB) !important;
  border-radius: 9999px !important;
  transition: all 0.15s !important;
  font-size: 0.9rem !important;
}
.job-card a[href^="mailto"]:hover,
.job-card .details-link:hover,
.job-listing a:hover {
  background: var(--blue-600, #2563EB) !important;
  color: white !important;
}

/* Advertise page CTA hierarchy */
.pricing-card .btn-primary,
.pricing-card a[class*="btn"],
.pricing-card button {
  width: 100%;
  text-align: center;
  justify-content: center;
}

/* FEATURED badge cleanup */
.badge-featured, .featured-badge {
  background: var(--blue-100, #DBEAFE) !important;
  color: var(--blue-700, #1D4ED8) !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  padding: 3px 8px !important;
  border-radius: 4px !important;
}

/* Mobile hamburger menu styles */
@media (max-width: 960px) {
  .wwk-nav-links {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    padding: 16px 0;
    z-index: 1000;
  }
  .wwk-nav-links.open {
    display: flex !important;
  }
  .wwk-nav-links li {
    list-style: none;
  }
  .wwk-nav-links li a {
    display: block;
    padding: 12px 24px;
    color: #1e3a5f;
    text-decoration: none;
    font-weight: 500;
  }
  .wwk-nav-links li a:hover {
    background: #f0f4f8;
  }
}
</style>`;

  const inlineJS = `<script>
// Hamburger menu toggle
document.addEventListener('DOMContentLoaded', function() {
  var hamburger = document.querySelector('.wwk-nav-hamburger');
  var navLinks = document.querySelector('.wwk-nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      var isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });
    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.wwk-nav')) {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Fix job card mailto links — add job title to subject
  document.querySelectorAll('a[href^="mailto:jobs@waterwisekids.com"]').forEach(function(link) {
    var card = link.closest('.job-card') || link.closest('[class*="job"]') || link.parentElement;
    if (card) {
      var h3 = card.querySelector('h3');
      if (h3) {
        var title = h3.textContent.replace(/[^a-zA-Z0-9 —–-]/g, '').trim();
        link.href = 'mailto:jobs@waterwisekids.com?subject=Application: ' + encodeURIComponent(title);
      }
    }
  });
});
</script>`;

  const standardNav = `<nav class="wwk-nav">
    <div class="wwk-nav-inner">
      <a href="/" class="wwk-nav-logo">WaterWiseKids</a>
      <button class="wwk-nav-hamburger" aria-label="Toggle navigation" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <ul class="wwk-nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/education.html">Water Safety</a></li>
        <li><a href="/swim-schools.html">Find Schools</a></li>
        <li><a href="/jobs.html">Aquatics Jobs</a></li>
        <li><a href="/teens.html">Teen Hub</a></li>
        <li><a href="/gear.html">Gear Guide</a></li>
        <li><a href="/advertise.html">Advertise</a></li>
        <li><a href="/jobs/post.html" class="wwk-nav-cta">Post a Job</a></li>
      </ul>
    </div>
  </nav>`;

  return new HTMLRewriter()
    .on('link[href="/styles.css"]', {
      element(element) { element.setAttribute('href', '/styles.css?v=3'); }
    })
    .on('link[href="styles.css"]', {
      element(element) { element.setAttribute('href', 'styles.css?v=3'); }
    })
    .on('link[href="../styles.css"]', {
      element(element) { element.setAttribute('href', '../styles.css?v=3'); }
    })
    .on('head', {
      element(element) { element.append(inlineCSS, { html: true }); }
    })
    .on('body', {
      element(element) {
        element.prepend(standardNav, { html: true });
        element.append(inlineJS, { html: true });
      }
    })
    .on('header', {
      element(element) {
        if (!element.getAttribute('class')) {
          element.remove();
        }
      }
    })
    .on('nav', {
      element(element) { element.remove(); }
    })
    .transform(response);
}
