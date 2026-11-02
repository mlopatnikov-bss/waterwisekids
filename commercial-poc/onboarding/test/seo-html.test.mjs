// Territory SEO helpers and consolidation transforms: hermetic, string-in/string-out.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as H from '../seo/src/html.mjs';
import { addPrimaryNote, addSitemapUrl, NOTE_CLASS, pruneSitemap, retargetHead, rewriteLinks } from '../seo/src/consolidate.mjs';
import { streetAddresses } from '../seo/src/audit.mjs';

const O = 'https://www.waterwisekids.com';
const page = ({ head = '', body = '' } = {}) => `<!doctype html><html><head><title>T &amp; U</title><meta name="description" content="d">${head}</head><body>${body}</body></html>`;

test('html: head facts, robots and canonical count', () => {
  const html = page({ head: `<link href="${O}/a.html" rel="canonical"><meta content="noindex, follow" name="robots"><meta property="og:url" content="${O}/a.html">` });
  assert.equal(H.title(html), 'T & U');
  assert.deepEqual(H.canonicals(html), [`${O}/a.html`]);
  assert.equal(H.robots(html).noindex, true);
  assert.equal(H.metaContent(html, 'og:url'), `${O}/a.html`);
  assert.deepEqual(H.canonicals(page({ head: `<link rel="canonical" href="${O}/a.html"><link rel="canonical" href="${O}/b.html">` })).length, 2);
  assert.equal(H.robots(page({ head: '<meta name="robots" content="max-snippet:-1">' })).noindex, false);
});

test('html: visible text drops chrome, scripts and sponsored cards; FAQ schema is extracted', () => {
  const card = '<!-- WWK sponsored placement plc_x (Sponsored pilot) -->\n<aside class="wwk-sponsored"><p class="wwk-sponsored__label">Sponsored pilot</p><a href="https://x.example/?utm_medium=sponsored_pilot" rel="sponsored noopener">Go</a></aside>\n<script src="/assets/js/wwk-sponsored.js" defer></script>';
  const ld = '<script type="application/ld+json">{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Q one?","acceptedAnswer":{"@type":"Answer","text":"Answer &amp; more."}}]}</script>';
  const html = page({ head: ld, body: `<header><nav>Menu</nav></header><main><h1>Town</h1><h3>Q one?</h3><p>Answer &amp; more.</p>${card}</main><footer>Foot</footer><script>var hidden=1</script>` });
  const text = H.visibleText(html);
  assert.equal(text, 'Town Q one? Answer & more.');
  assert.match(H.visibleText(html, { keepSponsored: true }), /Sponsored pilot/);
  assert.equal(H.sponsoredBlocks(html).length, 1);
  assert.deepEqual(H.faqSchema(html), [{ question: 'Q one?', answer: 'Answer &amp; more.' }]);
  assert.ok(H.norm(text).includes(H.norm('Answer &amp; more.')), 'entity-encoded schema text matches visible text after normalisation');
  assert.equal(H.wordCount(H.mainText(html)), 5);
});

test('html: internal paths resolve relative, absolute and foreign hrefs', () => {
  assert.equal(H.internalPath('/a.html'), '/a.html');
  assert.equal(H.internalPath('b.html', '/swim-lessons/x.html'), '/swim-lessons/b.html');
  assert.equal(H.internalPath('https://www.waterwisekids.com/c.html#f'), '/c.html');
  assert.equal(H.internalPath('https://waterwisekids.com/c.html'), '/c.html');
  assert.equal(H.internalPath('https://britishswimschool.com/x/'), null);
  assert.equal(H.internalPath('mailto:a@b'), null);
  assert.equal(H.internalPath('#top'), null);
});

test('consolidate: head retarget changes only canonical and og:url', () => {
  const html = page({ head: `<link href="${O}/old.html" rel="canonical"><meta content="${O}/old.html" property="og:url"><meta property="og:title" content="${O}/old.html">`, body: `<a href="${O}/old.html">x</a>` });
  const out = retargetHead(html, `${O}/new.html`);
  assert.deepEqual(H.canonicals(out), [`${O}/new.html`]);
  assert.equal(H.metaContent(out, 'og:url'), `${O}/new.html`);
  assert.equal(H.metaContent(out, 'og:title'), `${O}/old.html`);
  assert.ok(out.includes(`<a href="${O}/old.html">`), 'body untouched');
  assert.equal(retargetHead(out, `${O}/new.html`), out, 'idempotent');
});

test('consolidate: primary-guide note is visible, escaped and idempotent', () => {
  const html = page({ body: '<h1>Old page</h1><p>x</p>' });
  const out = addPrimaryNote(html, '/new.html', 'our main A & B guide');
  assert.match(out, new RegExp(`</h1>\\n<p class="${NOTE_CLASS}"[^>]*>WaterWiseKids now keeps one main page for this search: <a href="/new.html">our main A &amp; B guide</a>\\.</p>`));
  assert.equal(addPrimaryNote(out, '/new.html', 'x'), out);
  assert.throws(() => addPrimaryNote('<p>no heading</p>', '/n.html', 'x'), /no <\/h1>/);
});

test('consolidate: link rewrite repoints, drops new duplicates and self links, keeps pre-existing duplicates', () => {
  const map = new Map([['/old-a.html', '/main.html'], ['/old-b.html', '/main.html'], ['/self-old.html', '/me.html']]);
  const html = [
    '<ul>',
    '<li><a href="/main.html">Main</a></li>',
    '<li><a href="/old-a.html">Old A</a></li>',
    '<li><a href="/keep.html">Keep</a></li>',
    '<li><a href="/keep.html">Keep</a></li>',
    '</ul>',
    '<ul>',
    '<li><a href="/old-b.html">Old B</a></li>',
    '<li><a class="x" href="https://www.waterwisekids.com/self-old.html">Self</a></li>',
    '</ul>',
    '<p>Read <a href="/self-old.html">the old guide</a> and <a href="/old-a.html">this</a>.</p>',
  ].join('\n');
  const r = rewriteLinks(html, '/me.html', map);
  assert.equal(r.rewrites, 5);
  assert.equal(r.removed, 2);
  assert.equal(r.html, [
    '<ul>',
    '<li><a href="/main.html">Main</a></li>',
    '<li><a href="/keep.html">Keep</a></li>',
    '<li><a href="/keep.html">Keep</a></li>',
    '</ul>',
    '<ul>',
    '<li><a href="/main.html">Old B</a></li>',
    '</ul>',
    '<p>Read the old guide and <a href="/main.html">this</a>.</p>',
  ].join('\n'));
  assert.deepEqual(rewriteLinks(r.html, '/me.html', map), { html: r.html, rewrites: 0, removed: 0 }, 'idempotent');
});

test('consolidate: sitemap prune/add are exact and idempotent', () => {
  const xml = `<urlset>\n  <url>\n    <loc>${O}/a.html</loc>\n    <lastmod>2026-01-01</lastmod>\n  </url>\n  <url>\n    <loc>${O}/b.html</loc>\n  </url>\n</urlset>\n`;
  const p = pruneSitemap(xml, new Set([`${O}/a.html`]));
  assert.equal(p.removed, 1);
  assert.equal(p.xml, `<urlset>\n  <url>\n    <loc>${O}/b.html</loc>\n  </url>\n</urlset>\n`);
  const added = addSitemapUrl(p.xml, `${O}/c.html`, '2026-11-02');
  assert.match(added, /<loc>https:\/\/www\.waterwisekids\.com\/c\.html<\/loc>\n {4}<lastmod>2026-11-02<\/lastmod>/);
  assert.equal(addSitemapUrl(added, `${O}/c.html`, '2026-11-02'), added);
  assert.equal(addSitemapUrl(added, `${O}/b.html`, '2026-11-02'), added, 'existing URL not duplicated');
});

test('audit helper: street-address detector finds the address shapes WWK pages use', () => {
  assert.deepEqual(streetAddresses('Pools: 2116 1st Ave New York, NY 10029 and 325 Park Avenue New York; 380 Rector Pl and 885 6th Ave (between 31st and 32nd Streets). Ages 1 to 4 Swim.'),
    ['2116 1st Ave', '325 Park Avenue', '380 Rector Pl', '885 6th Ave']);
  assert.deepEqual(streetAddresses('Children ages 1 to 3 learn at their own pace.'), []);
});
