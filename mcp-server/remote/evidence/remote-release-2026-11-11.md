# WWK remote MCP release evidence — 2026-11-11

- Custom domain: `mcp.waterwisekids.com`
- MCP endpoint: `https://mcp.waterwisekids.com/mcp`
- Health endpoint: `https://mcp.waterwisekids.com/health`
- Server version: `0.2.0`
- Deployed Cloudflare version: `bcface73-0130-445e-8b8e-f1bf7969d55c`
- Deployed source commit before integration rebase: `80763616a`
- Byte-equivalent integrated Worker commit: `0c9d27329`

## Verified externally

- Public DNS resolved through Cloudflare and TLS covered `*.waterwisekids.com`.
- `/health` returned `mode: read_only` and the expected data origin.
- MCP initialization negotiated protocol `2025-06-18`.
- `tools/list` returned exactly `find_swim_schools`, `get_price_benchmark`,
  `translate_level`, and `get_state_laws`.
- The price tool returned `not_publishable`; the California law request returned
  `state_module_not_yet_published`; the level crosswalk required a receiving-school
  assessment; and the finder preserved completeness, distance, safety, and ownership
  disclosures.
- An unapproved browser Origin returned HTTP 403, an invalid Host was rejected,
  and a chunked body above 64 KiB returned HTTP 413.
- A 40-request single-connection burst produced 30 normal MCP transport responses
  followed by 10 HTTP 429 responses from the immediate burst guard.

Cloudflare's separate 120-request/60-second Rate Limiting API binding remains in
place. Cloudflare documents that binding as approximate and eventually consistent;
the immediate per-instance guard exists specifically to stop short bursts while
that distributed count converges.
