# Remote MCP deployment worksheet

- [ ] Reviewed commit SHA recorded
- [ ] `npm run check` passes from the external worktree
- [ ] Wrangler dry-run bundle passes
- [ ] Cloudflare account and zone confirmed as WaterWiseKids production
- [ ] Custom domain is exactly `mcp.waterwisekids.com`
- [ ] Rate-limit binding exists and is tested
- [ ] No secrets, write credentials, D1, KV, R2, or service bindings are present
- [ ] `/health` returns read-only mode and expected version
- [ ] Remote MCP initialize succeeds
- [ ] `tools/list` exposes exactly four read-only tools
- [ ] Each tool's guardrail language is present in its result
- [ ] Unreviewed state law returns `state_module_not_yet_published`
- [ ] Price request returns `not_publishable`
- [ ] Level translation requires receiving-school assessment
- [ ] Invalid Host and browser Origin fail
- [ ] 65 KiB request fails with HTTP 413
- [ ] Rate-limit overflow fails with HTTP 429
- [ ] Public API catalog updated only after all checks above pass
