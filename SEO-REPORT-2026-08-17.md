# SEO Optimizer Report — 2026-08-17

Scope: 725 HTML files on `live` (721 content pages + 4 redirect stubs). Parsed with BeautifulSoup (never regex — site tags are content-first order).

## Result: site is clean on every standard check

| Check | Pages failing |
|---|---|
| Missing `<title>` | 0 |
| Missing meta description | 0 |
| Duplicate meta description | 0 |
| Meta description <70 or >165 chars (decoded) | 0 |
| Missing canonical | 0 |
| Missing `og:title` / `og:description` / `og:image` / `og:url` | 0 |
| Missing `twitter:card` / `twitter:image` | 0 |
| Missing image `alt` | 0 (across all `<img>`) |
| Invalid JSON-LD (parse error) | 0 |
| Article schema missing headline/datePublished/author/image | 0 |
| Relative `og:image` or schema `image` URL | 0 |
| `og:image` pointing at a file not in the repo | 0 |
| Malformed `datePublished` | 0 |
| Missing `html lang` | 0 |
| **FAQPage question with no matching visible body copy** | **0** |
| **Broken internal links** | **0** |
| **Internal links pointing at a redirect stub (redirect hops)** | **0** |
| noindex pages listed in sitemap.xml | 0 |
| sitemap.xml URLs with no matching file | 0 (632 URLs) |

## Fixed this run (5 files)

**4 over-length titles** — the only titles whose *descriptive portion* (before the ` | WaterWiseKids` brand pipe) exceeded ~60 chars, meaning SERP truncation was cutting real words rather than just the brand suffix.

| Page | Before | After |
|---|---|---|
| `education/special-needs-water-safety-checklist.html` | 67 chars | 53 — `Special Needs Water Safety Checklist (Free Printable)` |
| `education/overcoming-water-fear-checklist.html` | 67 chars | 49 — `Overcoming Water Fear: Free Checklist for Parents` |
| `education/holiday-weekend-water-safety-checklist.html` | 67 chars | 55 — `Holiday Weekend Water Safety Checklist (Free Printable)` |
| `education/infant-water-safety-checklist.html` | 65 chars | 48 — `Infant Water Safety Checklist: Baby's First Year` |

Side benefit: dropping "(Free Printable)" from `infant-water-safety-checklist.html` sharpens its separation from the sibling `infant-water-safety-checklist-printable.html`, reducing overlap between the pair.

**1 weak alt attribute** — `index.html` CPR article-card icon: `alt="CPR"` → `alt="CPR basics for parents"`. This was the only non-descriptive alt on the entire site.

## Deliberately NOT changed

- **9 duplicate-title groups / 19 pages** — all legitimate. Two architectures produce them by design: (a) 8 redirect stubs that cross-canonical to their target and correctly inherit the target's title; (b) flat/index canonical pairs (`jobs.html`/`jobs/index.html`, `swim-schools.html`/`swim-schools/index.html`, `teens.html`/`teens/index.html`) where one canonicalizes to the other. Do not "fix" these.
- **6 canonicals that differ from their own path** (`advertise.html`, `education.html`, `gear.html`, `jobs.html`, `teens.html` to directory URLs; `swim-schools/index.html` to `swim-schools.html`). All targets verified to exist. Intentional — `swim-schools.html` is the indexed hub.
- **11 pages with zero `<h1>`** — all redirect stubs. Expected.
- **~101 titles in the 61–70 char range** — the head keyword sits first in every one, so truncation only clips the ` | WaterWiseKids` suffix. Rewriting these would risk keyword dilution for no display gain. Left alone.
- **`og:title` / `twitter:title` / schema `headline`** on the 4 retitled pages keep their longer form. Those surfaces have looser length limits and the extra brand context helps social sharing.

## Previously-open issue now confirmed resolved

The **trademark misattribution in JSON-LD** (Swim Whisperers® and SwimWays credited to Starfish Aquatics) is fixed. Both remaining site-wide mentions now correctly attribute Swim Whisperers® to Swim Angelfish and explicitly state it is *not* a Starfish credential, and identify SwimWays as a Spin Master consumer pool-toy brand.

## Also verified stable

- Homepage guide count: hero stat (343) and CTA ("View All 343 Guides") agree with the rendered `.article-card` count on `/education/` (343). No drift.
