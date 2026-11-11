# WaterWiseKids public remote MCP

This package is the production, read-only Cloudflare Worker for the four WWK open-data tools. It uses the MCP Streamable HTTP transport at `https://mcp.waterwisekids.com/mcp` and reads the already-public JSON datasets from `https://www.waterwisekids.com`.

The endpoint and its security boundaries were externally verified on 2026-11-11. See `evidence/remote-release-2026-11-11.md` for the release record.

## Safety boundaries

- The service has no database or write credentials.
- The price tool always returns `not_publishable` while the precommitted sampling gates fail.
- The level tool always requires an assessment by the receiving school.
- The law tool returns an explicit unpublished status outside the reviewed pilot jurisdictions and preserves the not-legal-advice disclaimer.
- Directory results preserve their incompleteness and distance limitations.
- Production requests fail closed if the rate-limit binding is absent.
- Host, browser-origin, and request-size limits are enforced. Rate control has
  two layers: an immediate 30-request/10-second per-instance burst guard and
  Cloudflare's approximate 120-request/60-second per-location binding.

## Local validation

Run installs and builds through the Mac's external-development wrapper:

```sh
/Users/bss/DeveloperTools/bin/dev-external --cwd /absolute/path/to/worktree -- npm install --prefix mcp-server/remote
/Users/bss/DeveloperTools/bin/dev-external --cwd /absolute/path/to/worktree -- npm --prefix mcp-server/remote run check
/Users/bss/DeveloperTools/bin/dev-external --cwd /absolute/path/to/worktree -- npm --prefix mcp-server/remote run bundle:release
```

The dry run proves the Worker bundles. It does not deploy or modify DNS.

## Release sequence

For each update: test and bundle the exact reviewed commit, deploy with the custom
domain and both rate-control layers intact, repeat the external protocol and
boundary checks, record the Cloudflare version ID, and then update the release
evidence. The Worker logs errors only; tool arguments and returned records are not
written to an application database.
