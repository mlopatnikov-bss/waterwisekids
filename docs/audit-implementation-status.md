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
- Six-system Swim Level Crosswalk with approximate skill bands and correction
  workflow.
- Law Atlas pilot limited to verified FL/NJ/PA evidence; unverified states are
  withheld.
- Access Atlas diagnostic limited to three counties, with no danger or risk
  score and publication thresholds for future county pages.
- Swim School Transparency Standard and claim flow: disclosure-only, never a
  safety certification or paid ranking signal.
- Read-only JSON API, local MCP reference implementation, and a tested Cloudflare
  Streamable HTTP deployment candidate with host, origin, body-size, and rate
  limits. No claim of a hosted public endpoint is made before remote verification.
- NJ/PA local consolidation: six maintained hubs, 73 noindex transition pages,
  sitemap cleanup, and a deterministic Cloudflare Bulk Redirect package.
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
- Cloudflare Bulk Redirects is available (0 of 5 lists in use). The account has
  only 10 single redirect slots, so the prepared bulk list is the correct
  mechanism for the 73 paths.
- Cloudflare Email Routing is not onboarded. The site must not publish a domain
  address until a destination is verified and mail flow is tested.

## Deliberately gated—not fabricated

- Public Spanish pages and hreflang require a named native-speaking reviewer.
- “Medically reviewed by” requires an accepted, credential-verified independent
  reviewer. A recruitment brief is ready.
- A national Price Index requires enough current, representative observations.
- The public MCP hostname still requires production deployment and an external
  handshake/tool-call verification before it can be added to the API catalog.
- A 50-state Law Atlas requires statute-level human verification and dates.
- National county Access Atlas pages require real provider, Census, price, and
  scholarship joins that meet the stated thresholds.
- A Wikidata item waits for independent reliable coverage; WWK should not create
  notability by self-reference.
- YouTube/Reddit/community posts and journalist outreach require owner-approved
  representational publishing and real accounts.
- A domain email requires Cloudflare Email Routing onboarding and delivery test.
- True HTTP 301 deployment requires importing and enabling the prepared
  Cloudflare Bulk Redirect list, followed by production verification.

## Operating principle

No page, badge, dataset, score, reviewer line, language variant, or AI endpoint
is described as live or verified before the evidence and release gate actually
pass. This is the core safeguard against repeating the trust problems found in
the audit.
