# WaterWiseKids read-only MCP reference

This dependency-free stdio server exposes four tools over the public WWK datasets:

- `find_swim_schools`
- `get_price_benchmark`
- `translate_level`
- `get_state_laws`

It is a local reference implementation, not a claim that a public hosted MCP transport is live. Every tool preserves the underlying dataset's limitations. In particular, the price tool refuses to publish a benchmark while sampling gates fail, level matches require an in-person assessment, the law tool returns unpublished status for unreviewed states, and directory results are not a complete provider census.

Run a direct read-only test:

```sh
python3 mcp-server/wwk_server.py --call get_state_laws --arguments '{"state":"NJ"}'
```

Or configure an MCP client to launch `python3` with the absolute path to `mcp-server/wwk_server.py` over stdio.

`mcp-server/remote/` contains the production Cloudflare Streamable HTTP server at
`https://mcp.waterwisekids.com/mcp`. Its release evidence records the external
protocol, guardrail, and transport verification.
