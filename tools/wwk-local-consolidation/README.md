# WWK local-page consolidation

`redirects.json` is the source of truth for the 73 legacy NJ/PA local URLs and
their six maintained hubs. The repository ships fail-closed transition pages
because GitHub Pages cannot emit per-path HTTP redirects.

Build the Cloudflare import file with:

```bash
python3 tools/wwk-local-consolidation/build_cloudflare_redirects.py
python3 tools/wwk-local-consolidation/build_cloudflare_redirects.py --check
```

The CSV deliberately has no header, matching Cloudflare's documented Bulk
Redirect format. Each path is emitted for the apex and `www` hosts (146 exact
records), preserves query strings, and does not enable broad subdomain or
subpath matching.

Production now has the two Cloudflare account-level objects:

1. a Bulk Redirect List imported from `cloudflare-bulk-redirects.csv`;
2. a Bulk Redirect Rule that enables that list.

The list and rule were verified active on 2026-11-11. Production checks against
both apex and `www` legacy URLs returned HTTP 301, preserved query strings, and
landed on the manifest targets. Keep the transition pages as a recoverable origin
fallback unless a later release deliberately removes them; the manifest remains
the canonical change record.
