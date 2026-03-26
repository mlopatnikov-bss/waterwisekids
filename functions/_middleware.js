// Cloudflare Pages Function: CSS cache-busting + inline style fixes
export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  // CSS fix: btn-outline missing base button styles
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

  return new HTMLRewriter()
    .on('link[href="/styles.css"]', {
      element(element) {
        element.setAttribute('href', '/styles.css?v=2');
      }
    })
    .on('link[href="styles.css"]', {
      element(element) {
        element.setAttribute('href', 'styles.css?v=2');
      }
    })
    .on('link[href="../styles.css"]', {
      element(element) {
        element.setAttribute('href', '../styles.css?v=2');
      }
    })
    .on('head', {
      element(element) {
        element.append(inlineFix, { html: true });
      }
    })
    .transform(response);
}