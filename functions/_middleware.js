// Cloudflare Pages Function: rewrite CSS link to bust browser cache
export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }
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
    .transform(response);
}
