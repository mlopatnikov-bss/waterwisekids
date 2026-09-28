# Internal Linking Report — 2026-08-26

Commits: `4953ae65`, `a4e65b18` on `live`. Verified live in a real browser.

## Headline

The link-*count* lever is saturated. The link-*visibility* lever was not.

**49 internal links on 48 education pages were present in the DOM, resolved 200,
and counted in every link audit — but rendered as plain gray body text that no
reader could see.** They are now visible.

## Why no new links were added

Built the full prose-link graph (`<a>` inside `<p>` inside `.article-body`) across
743 HTML files / 409 indexable education articles on `origin/live`:

| metric | result |
|---|---|
| pages with **0 inbound** prose links | **0** |
| pages with **0 outbound** prose links | **0** |
| pages with 1 outbound prose link | 0 |
| minimum outbound prose links | 2 |
| broken internal prose links | **0 of all edges** |

The hygiene target from prior runs (`inbound_prose == 0`) is fully closed, and
standing guidance is that link concentration is *inversely* correlated with rank
here. Adding link #6 to a page that already has 5 would have been busywork, so the
budget went to the defect below instead.

## The defect

`main.css` sets the base link style to `a { color: inherit; text-decoration: none }`.
`article.css` supplied an `a` rule for `.article-body` only — nothing for
`.article-excerpt`, the standfirst above the body, which is `color: var(--gray-700)`.

Result: an `<a>` in the excerpt inherits gray-700 with no underline — pixel-identical
to the surrounding sentence. 413 pages carry `.article-excerpt`; 48 of them had
contextual internal links inside it.

Two pages had already been patched by hand with an inline `color:#0369a1` — colored
but still not underlined, which is a WCAG 1.4.1 (Use of Color) failure on its own.
Those two are useful evidence that blue-700 was the intended treatment all along.

Pre-fix render, confirmed on live: excerpt anchor `rgb(55, 65, 81)` / `none`,
identical to its parent, against body links at `rgb(3, 105, 161)` / `underline`.

## The fix

One rule in `assets/css/article.css`, mirroring the existing `.article-body a`
(same 0-1-1 specificity, same colour):

```css
.article-excerpt a { color: var(--blue-700); text-decoration: underline; }
.article-excerpt a:hover { color: var(--blue-700); }
```

Scope checks before shipping — all clean:

- 0 links sit in `.article-header` but outside `.article-excerpt`, so the selector
  cannot catch author/date meta or breadcrumbs.
- All 49 anchors are bare `<a>` with no classes — no buttons or CTA chips get
  restyled.
- `.article-excerpt` is defined in exactly one stylesheet; 0 page-level `<style>`
  blocks on the 48 pages touch `a` or `.article-excerpt`; 0 printable pages use the
  class, so no printable-sheet mirroring was needed.
- All 413 pages carrying `.article-excerpt` also load `article.css`.

## Verification

Headless Chromium over local HTTP, all 48 pages, then repeated against live:

- **49/49** anchors now `rgb(3, 105, 161)` + `underline`
- contrast **5.93:1** on every one (AA for normal text)
- 375px / 768px / 1280px: no overflow, non-zero boxes
- regression canaries unchanged — `.article-body a` still blue+underlined on all
  48; header/nav links untouched across all 7 header markup variants

## Side effect worth noting

4 of the 5 pages with the fewest outbound prose links were in the fixed cohort:
`child-swimming-nutrition-hydration`, `conditioning-mile-swim-goal`,
`cpr-basics-parents`, `swim-readiness-indicators-age-4`. Their real outbound count
goes 2 → 3, because the third link existed but was dead to readers. The
"fewest outgoing links" cohort and the "invisible links" cohort overlap heavily —
worth checking together in future runs.

`swim-school-referral-programs.html` (out=2, in=2) is the only member of that
cohort not covered; left alone deliberately.

## No sitemap lastmod bump

The 413 HTML diffs are cache-token-only — asserted programmatically, 0 non-token
diff lines. No content payload changed, so bumping `lastmod` would be a false
freshness signal.

## New trap found: verifying too early poisons your own cache key

The first push bumped `article.css` to `?v=20260826c`. I curled that URL ~60s
later — **before GitHub Pages had rebuilt** — and Cloudflare cached the *pre-fix*
stylesheet against the brand-new cache-bust key. From then on every real visitor
got `cf-cache-status: HIT` with `last-modified: 13:05` (the old file) on the URL
whose entire purpose was to bypass caching. A live headless render caught it;
`curl` on the un-tokened URL had looked fine and would have hidden it.

Fixed by re-bumping to `?v=20260826d`, a token never requested, only after
confirming with a cache-bypassing request that origin served the new file.

**Rule:** after pushing a `?v=` bump, wait for the deployed HTML to actually
reference the new token before requesting that token. The verification request is
itself a cache-fill. Verify the *page's* reference first, the asset second.
