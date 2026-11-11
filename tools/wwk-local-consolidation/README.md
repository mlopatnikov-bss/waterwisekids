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

Deployment requires two Cloudflare account-level objects:

1. a Bulk Redirect List imported from `cloudflare-bulk-redirects.csv`;
2. a Bulk Redirect Rule that enables that list.

Do not remove the transition pages until the edge redirects have been verified
in production. The manifest remains the canonical change record.
