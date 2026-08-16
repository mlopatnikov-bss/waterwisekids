// WaterWiseKids — Cloudflare Pages middleware: INTENTIONALLY A NO-OP.
//
// HISTORY / WHY THIS FILE IS EMPTY
// --------------------------------
// This file previously contained a legacy "production polish" HTMLRewriter that
// was written for an older version of the site. It was verified on 2026-08-16 to
// be DORMANT on production (no `wwk-nav` markup appears in any live response), but
// it was a latent landmine: had Pages Functions ever been enabled or recompiled for
// this project, the old code would have, on EVERY HTML response site-wide:
//
//   1. Removed every <nav> element on the page  (`.on('nav', { element.remove() })`)
//   2. Removed unclassed <header> elements
//   3. Prepended a hardcoded nav pointing at long-dead flat URLs
//      (/education.html, /swim-schools.html, /jobs.html, /teens.html,
//       /gear.html, /advertise.html) instead of the current directory URLs
//      (/education/, /swim-lessons/, /aquatic-jobs/, ...)
//   4. Injected ~200 lines of stale !important CSS overriding current styles
//
// That would have destroyed navigation and internal linking on all ~475 pages at
// once, with no code change to trigger it. Neutralised rather than deleted so the
// rationale survives in the tree.
//
// DO NOT reintroduce presentation logic here. All nav/header/footer markup is
// authored in the page templates; all styling lives in /assets/css/main.css,
// article.css, printable-checklist.css and printable-poster.css; mobile behaviour
// is injected by /assets/js/main.js. Edge rewriting of markup is not used by this
// site and must not be added back.

export async function onRequest(context) {
  return context.next();
}
