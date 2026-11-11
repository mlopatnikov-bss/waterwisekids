# WaterWiseKids remote MCP candidate

This package is a hosted-ready, read-only Cloudflare Worker for the four WWK open-data tools. It uses the MCP Streamable HTTP transport at `/mcp` and reads the already-public JSON datasets from `https://www.waterwisekids.com`.

It is a **deployment candidate, not a claim that a public endpoint is live**. Do not add a public MCP URL to the site or API catalog until the custom hostname, remote handshake, tool calls, limits, and observability have all been verified.

## Safety boundaries

- The service has no database or write credentials.
- The price tool always returns `not_publishable` while the precommitted sampling gates fail.
- The level tool always requires an assessment by the receiving school.
- The law tool returns an explicit unpublished status outside the reviewed pilot jurisdictions and preserves the not-legal-advice disclaimer.
- Directory results preserve their incompleteness and distance limitations.
- Production requests fail closed if the rate-limit binding is absent.
- Host, browser-origin, request-size, and per-client rate limits are enforced.

## Local validation

Run installs and builds through the Mac's external-development wrapper:

```sh
/Users/bss/DeveloperTools/bin/dev-external --cwd /absolute/path/to/worktree -- npm install --prefix mcp-server/remote
/Users/bss/DeveloperTools/bin/dev-external --cwd /absolute/path/to/worktree -- npm --prefix mcp-server/remote run check
/Users/bss/DeveloperTools/bin/dev-external --cwd /absolute/path/to/worktree -- npm --prefix mcp-server/remote run deploy:candidate
```

The dry run proves the Worker bundles. It does not deploy or modify DNS.

## Release sequence

1. Add `mcp.waterwisekids.com` as a Worker custom domain in the WWK Cloudflare account.
2. Deploy the reviewed commit with `PUBLIC_HOSTNAME=mcp.waterwisekids.com`, `DATA_ORIGIN=https://www.waterwisekids.com`, and the rate-limit binding intact.
3. Verify `/health`, initialize, `tools/list`, and all four tools from an external MCP client.
4. Confirm that an invalid host, invalid browser origin, oversized body, and rate-limit overflow fail closed.
5. Review Worker logs for accidental sensitive data; this service should log errors, not tool arguments or returned records.
6. Only then publish the endpoint in the WWK API catalog and public documentation.
