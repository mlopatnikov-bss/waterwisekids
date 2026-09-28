# New Content Validation — 2026-09-02

Fresh clone of `origin/live` @ `27bcac8`. Audited the clone, never the mount.
Window: commits in the last 24h (2026-09-01 13:01 UTC → 2026-09-02 13:01 UTC).

## Result: PASS — 0 defects, 0 fixes, nothing pushed

## Scope

| set | count |
|---|---|
| HTML files touched in last 24h | 740 |
| …under `education/` | 509 |
| genuinely **new** files (git `--diff-filter=A`) | **2** |
| real articles validated (excl. printables + hub) | 416 |
| printables validated as their own class | 92 |

The 740 figure is inflated by three sitewide sweeps (`2598293` mainEntityOfPage
on 297 nodes, `44171df` publisher.logo on 282, `bf9cdcf` AEO pass). Only two
files were actually created:

- `education/kids-swim-gear-fit-checklist.html` (article, 3,366 words)
- `education/kids-swim-gear-fit-checklist-printable.html` (printable)

Both from `64587a7` — the Kids' Swim Gear Fit Check lead magnet.

## 1. Structural template checks — 416/416 pass

All 13 required markers present, all 4 banned patterns absent, on every real
article:

`main-layout` · `<main class="article">` · `article-header` · `article-meta-item` ·
`article-body` · `article-excerpt` · breadcrumb strip `background: #f8fafc` ·
`main.css` · `article.css` · `GTM-5DN8B3QT` · `tldr-box` · `FAQPage` · `sidebar`

Banned (0 hits sitewide): `article-layout`, `article-main`, `</article>`,
`<main class="main-layout">`.

**93 files initially flagged — all false positives, classified not fixed.**
92 are printables and 1 is `education/index.html` (the hub listing). Neither
page class uses the article template, and neither should. The 92 printables are
internally consistent: 92/92 share one footer fingerprint, 91/92 share one nav.
Checking the *kind* of page rather than the failure count is what kept these out
of the fix queue.

### DOM nesting verified, not just class presence

Playwright would not install in this sandbox (driver permission error), so a
headless render was not possible. Substituted a CSS-analytic check: parsed the
DOM and compared the new article's ancestor path for every structural class
against a reference sibling.

```
main-layout        html > body > div.container > div.main-layout
MAIN               ... > div.main-layout > main.article
article-header     ... > main.article > div.article-header
article-meta-item  ... > div.article-header > div.article-meta > div.article-meta-item
article-excerpt    ... > div.article-header > p.article-excerpt
article-body       ... > main.article > div.article-body
sidebar            ... > div.main-layout > aside.sidebar
```

Identical at every level to `backward-design-swim-curriculum.html`. Confirmed
`article.css` defines rules for all of them, and `.tldr-box` is styled in
`main.css:1920`. **Caveat, stated plainly: this is structural equivalence to 416
rendering siblings, not a pixel render. Not render-verified.**

## 2. Secondary checks — 416/416 pass, zero issues

nav · footer · Article JSON-LD · BreadcrumbList JSON-LD · FAQPage JSON-LD ·
og:title · og:description · og:image · twitter:card · canonical · visible
breadcrumb strip · exactly one `<h1>` · every `<img>` has `alt` · sitemap entry
present.

JSON-LD parses cleanly on all 416 — 0 parse errors.

## 3. Internal links — 0 broken across 416 articles

Resolver masks `<script>`/`<style>`/comments, handles root-relative, bare
relative, extensionless → `.html` and `/index.html`. Canary-gated with a known-good
root-relative link, a directory link, and a known-bad path before the sweep ran —
all three canaries behaved correctly, so the zero is trustworthy rather than a
resolver that silently matched everything.

## 4. Two probes that lied — logged so they aren't re-run naively

**FAQ orphan probe (false positive, 3 of 6 questions).** A naive 45-char
substring match flagged 3 FAQPage questions as missing from the rendered page.
They were present. The mismatch was curly `’` vs straight `'` plus truncation.
After Unicode normalization all 6 schema questions map to rendered `<h3>`s under
"Frequently Asked Questions" — **full parity**. Acting on the first result would
have deleted three healthy Q&A blocks.

**Nav variant probe (false positive, 72 files).** Two nav fingerprints appeared
(344 / 72). The entire difference is `<a href="/"> </a>` vs `<a href="/"></a>` —
one whitespace character. Not a template variant, no functional difference. The
new article carries the 72-file form; harmless.

## 5. Conventions confirmed correct on the new files

**Printables are deliberately `noindex` + sitemap-excluded.** 89 of 92 carry
`<meta name="robots" content="noindex">` and are absent from `sitemap.xml`. The
3 exceptions (`summer-safety-checklist`, `swim-lesson-readiness`,
`pool-safety-rules`) are exactly the 3 that lack the noindex tag and exactly the
3 present in the sitemap — internally consistent, deliberately indexable, not a
defect. The new printable follows the dominant convention correctly.

**Cache-bust keys all current** — no key older than its asset's last commit:

| asset | last commit | `?v=` key |
|---|---|---|
| `main.css` | 20260830 | `20260830a` |
| `article.css` | 20260828 | `20260828d` |
| `main.js` | 20260901 | `20260901a` |
| `printable-checklist.css` | 20260901 | `20260901a` |

New pages did **not** miss the bump — a known recurring failure mode here.

**Sitemap** — 644 URLs; the new article is listed, the new printable correctly
is not.

## Nothing pushed

`live` is unchanged. No edit was warranted.

## Not covered by this run

- Pixel render / visual regression (playwright unavailable in sandbox).
- The 738 files touched by the sitewide sweeps were validated against the
  new-content template rules only, not re-audited for the schema changes those
  commits introduced.
