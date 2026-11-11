# WWK crawler-access verification — 2026-11-11

Point-in-time live checks against
`https://www.waterwisekids.com/education/swim-lessons-cost.html` returned HTTP
200 and the complete page title for these user agents:

- Googlebot
- bingbot
- OAI-SearchBot
- ChatGPT-User
- ClaudeBot
- Claude-SearchBot
- PerplexityBot

The live `robots.txt` also returned HTTP 200 and contained `User-agent: *` plus
`Allow: /`. The live sitemap returned HTTP 200. The live `/about/` route returned
HTTP 200 with its real About title, canonical, and indexable robots directive; no
self-referencing redirect stub was observed.

This verifies public HTTP behavior from the test network. It does not prove that
every Cloudflare dashboard control is configured as intended, and it does not
measure crawl frequency or indexing. Recheck after material WAF, bot-management,
DNS, or hosting changes.
