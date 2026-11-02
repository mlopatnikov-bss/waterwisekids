# Territory SEO toolkit

Offline tooling and decision records for the organic and AI-search layer around sponsored pilot territories. It reads the repository only. It never fetches pages, calls Search Console or analytics, deploys anything or contacts anyone. `commercial-poc/` is publicly served, so nothing personal or secret belongs here.

| File | Purpose |
|---|---|
| `territory-map.json` | The decision record: one primary URL per town and search intent, the pages consolidated into it (with the reason for each), the pages kept for different intents, required inbound links and audit policy |
| `src/html.mjs` | Pure HTML helpers (head facts, visible text, JSON-LD, links, sponsored blocks) |
| `src/site.mjs` | Read-only site model: page index, internal link graph, sitemap |
| `src/audit.mjs` | Territory audit. Findings are `error`, `warn` or `info` |
| `src/consolidate.mjs` | Idempotent transforms: canonical and og:url retarget, visible primary-guide note, internal-link rewrite with list de-duplication, sitemap prune/add |
| `cli.mjs` | `audit [--json]` (exits 1 on any error) and `consolidate [--write]` (dry-run by default) |
| `proposals/` | Pre-approval proposal for the Manhattan guide card (superseded: the card is active in the committed Manhattan definition) |
| `ROLLOUT-MEASUREMENT.md` | Release, Search Console, sponsor-metric, AI-search and outreach packet, plus rollback |
| `evidence/audit-before.md`, `evidence/audit-after.md` | Audit output before and after this change |

Tests: `onboarding/test/seo-html.test.mjs` (hermetic) and `onboarding/test/seo-territory.test.mjs` (real repository plus a temporary fixture repository). They run with the rest of the onboarding suite (`npm test` from `onboarding/`).

## Commands (from `commercial-poc/onboarding/`)

```sh
node seo/cli.mjs audit                 # Markdown report; exit 1 if any error
node seo/cli.mjs audit --json          # machine-readable findings and page table
node seo/cli.mjs consolidate           # dry-run: files that would change
node seo/cli.mjs consolidate --write   # apply the map (idempotent; a second run changes nothing)
```

On the operator Mac, wrap these in the external-disk tool, for example `/Users/bss/DeveloperTools/bin/dev-external --cwd "$W" -- node commercial-poc/onboarding/seo/cli.mjs audit`.

## What the audit enforces

- **Primaries:** exactly one self-referencing canonical, indexable, listed in the sitemap, one `<h1>`, a title and a description, at least 400 editorial words (sponsored card excluded), names the town, has enough inbound internal links, links to and from its age/stage siblings, and every page in `required_inbound` links to it.
- **Consolidated pages:** canonical points to the primary (never `noindex` as well), og:url matches, not in the sitemap, shows a visible link to the primary, carries no sponsored card, and no public page links to it.
- **Schema parity:** every FAQPage question and answer is visible on the page. WebPage `url` and the last BreadcrumbList item equal the canonical. Business, review, offer and rating schema types are refused on territory pages because WWK has not verified those facts.
- **Sponsored hygiene:** cards are labeled and every link in them is `rel="sponsored"`. No `utm_medium=sponsored*` link appears outside a card.
- **Hubs:** at least 900 editorial words. Every street address must appear in a verified source. No prices or phone numbers. Links to the state directory. Carries a visible "reviewed" note. No sponsored card unless the map records it as approved.
- Internal links from territory pages should resolve to self-canonical, indexable pages. This is an error on hubs and a warning elsewhere.

## Why canonical and not redirects

The site is static on Cloudflare Pages. `.htaccess` is ignored there. `functions/_middleware.js` matches every route, and Pages does not apply `_redirects` to requests that Functions serve. Whether Functions are compiled for the live project cannot be verified from the repository. Canonical tags, sitemap membership and internal links are the only consolidation signals that are guaranteed to ship. They are also reversible by reverting files. Consolidated URLs keep serving 200 with a visible link to the primary, so old links and bookmarks still work. See `ROLLOUT-MEASUREMENT.md` §6 for an optional, separately verified redirect step.

## Reusing this for a future sponsor territory

1. Add a `territories[]` entry. List every competing page for the town (grep the slug in the repo root, `swim-lessons/` and the age directories). Compare content similarity and intent. Keep pages with a genuinely different age, stage or audience intent, and consolidate same-intent duplicates and township-name variants into one primary. Record the reason for each choice.
2. Run `audit` to see the starting point, save it under `evidence/`, then run `consolidate` (dry-run), review it, and run `consolidate --write`.
3. Fix the remaining editorial findings by hand: sibling links, thin primaries, schema parity, factual corrections. Never add facts that aren't in a verified source.
4. Run `audit` until there are zero errors, then run the onboarding suite.
5. Sponsored cards still go only through the onboarding definition, packet and gates (`../RUNBOOK.md`). This toolkit never adds one.
