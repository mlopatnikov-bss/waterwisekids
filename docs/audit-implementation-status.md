# WaterWiseKids audit implementation status

Last updated: 2026-11-11

This file separates shipped engineering work from claims that require evidence,
time, or an outside human. “Foundation” means the release mechanism and
fail-closed quality gate exist; it does not mean a national dataset has already
been collected.

## Shipped or release-ready

- Trust reset: AAP 2026 starting-age guidance, unverifiable ratings removal,
  ownership disclosure, named owner/author profile, editorial policy, medical
  review policy, corrections log, and safer entity schema.
- Funding guide correction: IRS, Arizona, and Florida claims are narrowed to
  what official sources support; individual eligibility is not promised.
- Price Index pilot: methodology, open files, 17 observations, and minimum-data
  gates that prevent a misleading national average.
- Price Index expansion queue: a reproducible 200-task internal backlog balanced
  across four Census regions and four provider types. Directory gaps remain
  explicit discovery work; no queued item is represented as verified price data.
- Midwest Price Index evidence batch: 10 official-source candidates, including
  five complete first-review rows and five explicitly blocked rows. None is
  promoted before independent review. A generated second-review packet pins the
  exact batch and source fingerprints and requires a decision on every field.
- Six-system Swim Level Crosswalk with approximate skill bands and correction
  workflow.
- Law Atlas pilot limited to verified FL/NJ/PA evidence; unverified states are
  withheld.
- National Law Atlas research queue: 204 bounded tasks across 51 jurisdictions
  and four modules, plus three source-backed pilot-state child-life-jacket drafts
  that remain unpublished pending independent review. A generated legal-review
  packet pins the exact revision and enumerates scope, exception, and currency
  checks for each jurisdiction.
- Access Atlas diagnostic limited to three counties, with no danger or risk
  score and publication thresholds for future county pages.
- Swim School Transparency Standard and claim flow: disclosure-only, never a
  safety certification or paid ranking signal.
- Read-only JSON API, local MCP reference implementation, and public Streamable
  HTTP MCP endpoint at `https://mcp.waterwisekids.com/mcp`. The deployed Worker
  has no write credentials and enforces host, origin, 64 KiB body, immediate burst,
  and Cloudflare rate-limit boundaries.
- Public `llms.txt` navigation aid with dataset, ownership and pilot limitations;
  live crawler checks returned complete HTTP 200 pages for Google, Bing, OpenAI,
  Claude and Perplexity search/retrieval user agents.
- NJ/PA local consolidation: six maintained hubs, 73 noindex fallback pages,
  sitemap cleanup, and active Cloudflare Bulk Redirects providing true 301s.
- A frozen 100-prompt AI-visibility panel with evidence columns and Spanish and
  local subsets.
- Newsroom and evidence-gated seasonal release calendar.
- Mention-share operating guide for YouTube, Reddit, and community collection,
  including ownership disclosure and anti-astroturfing rules.
- Spanish publication queue for 40 pages with a named-native-reviewer and exact-
  revision approval gate.
- AAP-aligned printable pediatrician handout and QR code.
- Wait-time collection pilot with privacy restrictions and minimum sample gates;
  no statistics are published from zero observations.
- Automated trust guard covering all of the above.

## Verified external configuration

- Cloudflare AI Crawl Control currently allows the search/retrieval crawlers
  needed for citations: BingBot, Googlebot, OAI-SearchBot, ChatGPT-User,
  PerplexityBot/User, Claude-SearchBot, Claude-User, and ClaudeBot. Activity is
  visible in the Cloudflare dashboard. No crawler-policy change is required.
- Cloudflare Bulk Redirects has one of five lists in use. The account has one
  active list and one enabled rule for the local consolidation package. The
  list contains 146 exact apex/`www` records for 73 legacy paths, preserves query
  strings, and returned HTTP 301 in production checks on 2026-11-11.
- Cloudflare Email Routing is not onboarded, and the domain already publishes
  active Mailgun MX and SPF records. Enabling Cloudflare routing would risk an MX
  conflict. The safe completion path is to verify or add an exact Mailgun inbound
  route and test both directions before publishing a domain address.
- The MCP custom domain, TLS, health endpoint, protocol initialization, tool list,
  all four tool guardrails, invalid-origin/host rejection, body limit, and burst
  limit were externally verified on 2026-11-11.

## Deliberately gated—not fabricated

- Public Spanish pages and hreflang require a named native-speaking reviewer.
- “Medically reviewed by” requires an accepted, credential-verified independent
  reviewer. A recruitment brief is ready.
- A national Price Index requires enough current, representative observations.
- A 50-state Law Atlas requires statute-level human verification and dates.
- National county Access Atlas pages require real provider, Census, price, and
  scholarship joins that meet the stated thresholds.
- A Wikidata item waits for independent reliable coverage; WWK should not create
  notability by self-reference.
- YouTube/Reddit/community posts and journalist outreach require owner-approved
  representational publishing and real accounts.
- A domain email requires access to the existing Mailgun account, an inspected
  exact inbound route, and a two-direction delivery/authentication test. The DNS
  migration path is deliberately blocked while Mailgun is active.

## Operating principle

No page, badge, dataset, score, reviewer line, language variant, or AI endpoint
is described as live or verified before the evidence and release gate actually
pass. This is the core safeguard against repeating the trust problems found in
the audit.
