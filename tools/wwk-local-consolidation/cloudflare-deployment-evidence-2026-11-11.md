# Cloudflare Bulk Redirect deployment evidence — 2026-11-11

Cloudflare account `6bbe1397095e741e6e5697776417a335` showed:

- enabled rule: `WWK legacy local consolidation`
- associated list: `wwk_local_consolidation_20261111`
- list status: `Active`
- exact redirect records: 146
- description: 73 legacy NJ/PA local paths to six maintained WWK hubs, with apex
  and `www` records

The dashboard reported one of five Bulk Redirect lists in use. Point-in-time
production checks returned:

- `https://www.waterwisekids.com/beginner-swim-lessons-abington-pa.html?src=verify`
  → HTTP 301 to
  `https://www.waterwisekids.com/swim-lessons/cheltenham-pa.html?src=verify`
- `https://waterwisekids.com/beginner-swim-lessons-ambler-pa.html?src=verify`
  → HTTP 301 to
  `https://www.waterwisekids.com/swim-lessons/cheltenham-pa.html?src=verify`
- `https://www.waterwisekids.com/beginner-swim-lessons-asbury-park-nj.html?src=verify`
  → HTTP 301 to
  `https://www.waterwisekids.com/swim-lessons/asbury-park-nj.html?src=verify`

This evidence verifies the dashboard state and representative live behavior. The
versioned `redirects.json` manifest and generated CSV remain the complete source
of truth.
