// Cloudflare Pages Function: CSS cache-busting, btn-outline fix, and nav standardization
export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  const inlineFix = `<style>
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
</style>`;

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
      element(element) { element.setAttribute('href', '/styles.css?v=2'); }
    })
    .on('link[href="styles.css"]', {
      element(element) { element.setAttribute('href', 'styles.css?v=2'); }
    })
    .on('link[href="../styles.css"]', {
      element(element) { element.setAttribute('href', '../styles.css?v=2'); }
    })
    .on('head', {
      element(element) { element.append(inlineFix, { html: true }); }
    })
    .on('body', {
      element(element) { element.prepend(standardNav, { html: true }); }
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