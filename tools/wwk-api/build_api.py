#!/usr/bin/env python3
"""Build WWK's versioned read-only JSON API catalog and documentation page."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "terms/index.html"
SCHOOLS_SOURCE = ROOT / "swim-lessons/directory/schools-data.js"
SCHOOLS_OUTPUT = ROOT / "assets/data/api/v1/schools.json"
CATALOG_OUTPUT = ROOT / "assets/data/api/v1/catalog.json"
PAGE_OUTPUT = ROOT / "api/index.html"
UPDATED = "2026-11-11"


def load_schools() -> dict:
    text = SCHOOLS_SOURCE.read_text(encoding="utf-8")
    match = re.search(r"const SWIM_SCHOOLS_DATA = (\{.*\});\s*$", text, re.S)
    if not match:
        raise RuntimeError("unexpected schools-data.js wrapper")
    return json.loads(match.group(1))


def build_schools() -> dict:
    source = load_schools()
    rows = []
    for state, schools in sorted(source.items()):
        for school in schools:
            address = school.get("postalAddress") or {}
            rows.append({
                "name": school.get("name"),
                "chain": school.get("chain"),
                "city": school.get("city"),
                "state": state,
                "postal_code": address.get("postalCode"),
                "street_address": address.get("streetAddress"),
                "website": school.get("website"),
                "phone": school.get("phone"),
                "programs": school.get("programs", []),
                "indoor": school.get("indoor"),
                "year_round": school.get("yearRound"),
                "record_scope": "source-checked public location data; not a safety certification, rating, endorsement, or complete provider census",
            })
    return {
        "schema_version": "1.0.0",
        "generated_on": UPDATED,
        "count": len(rows),
        "license": "CC-BY-4.0",
        "completeness": "starting directory; not a complete census of U.S. swim-lesson providers",
        "records": rows,
    }


def build_catalog(school_count: int) -> dict:
    return {
        "api_version": "v1",
        "status": "public_read_only_beta",
        "updated_on": UPDATED,
        "base_url": "https://www.waterwisekids.com/assets/data/",
        "license_note": "WWK-created datasets are CC BY 4.0 unless a dataset says otherwise. Provider and government source material retains its original status.",
        "endpoints": [
            {"id": "schools", "url": "/assets/data/api/v1/schools.json", "format": "application/json", "records": school_count, "limitation": "starting directory, not a complete provider census"},
            {"id": "price_observations", "url": "/assets/data/price-index/pilot-observations.json", "format": "application/json", "limitation": "pilot observations only; no national or state benchmark is publishable"},
            {"id": "level_crosswalk", "url": "/assets/data/level-crosswalk/v0.1.json", "format": "application/json", "limitation": "approximate descriptive overlap, not placement equivalency"},
            {"id": "law_atlas", "url": "/assets/data/law-atlas/v0.1.json", "format": "application/json", "limitation": "three-jurisdiction verified pilot; not legal advice"},
            {"id": "access_diagnostic", "url": "/assets/data/swim-access/pilot-counties.json", "format": "application/json", "limitation": "coverage diagnostic; not an access score or ranking"},
            {"id": "transparency_standard", "url": "/assets/data/transparency-standard/v0.1.json", "format": "application/json", "limitation": "disclosure standard; not safety certification or endorsement"}
        ],
        "mcp": {
            "source_path": "/mcp-server/wwk_server.py",
            "transport": "stdio reference implementation",
            "hosted_status": "not_publicly_hosted",
            "tools": ["find_swim_schools", "get_price_benchmark", "translate_level", "get_state_laws"]
        }
    }


def build_page(catalog: dict) -> str:
    document = TEMPLATE.read_text(encoding="utf-8")
    url = "https://www.waterwisekids.com/api/"
    title = "WaterWiseKids Open Data API & MCP Reference"
    description = "Read-only JSON datasets for swim schools, price observations, level mappings, law research and access diagnostics, plus a local MCP reference server."
    for pattern, replacement in [
        (r"<title>.*?</title>", f"<title>{title}</title>"),
        (r'<meta name="description" content=".*?">', f'<meta name="description" content="{description}">'),
        (r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="{url}">'),
        (r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="{url}">'),
        (r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{title}">'),
        (r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{description}">'),
        (r'<meta name="twitter:title" content=".*?">', f'<meta name="twitter:title" content="{title}">'),
        (r'<meta name="twitter:description" content=".*?">', f'<meta name="twitter:description" content="{description}">'),
    ]:
        document, count = re.subn(pattern, replacement, document, count=1, flags=re.S)
        if count != 1:
            raise RuntimeError(f"failed to replace {pattern}")
    css = """
    .api-alert{background:#fff7ed;border:2px solid #fb923c;border-radius:12px;padding:1rem 1.1rem;color:#7c2d12;margin-bottom:1.25rem}
    .endpoint{border:1px solid #cbd5e1;border-radius:12px;padding:1rem;margin:1rem 0;background:#fff}.endpoint h3{color:#075985;margin:.1rem 0 .5rem}.endpoint code{display:block;overflow-wrap:anywhere;background:#f1f5f9;border-radius:6px;padding:.55rem;color:#0f172a}.endpoint small{color:#64748b}
    .tool-table{width:100%;border-collapse:collapse}.tool-table th,.tool-table td{border:1px solid #cbd5e1;padding:.65rem;text-align:left;vertical-align:top}.tool-table th{background:#f1f5f9}
    @media(max-width:700px){.content{padding:2rem 1rem}.tool-table{font-size:.84rem}}
    """
    document = document.replace("\n</style>", css + "\n</style>", 1)
    header = '''<div class="page-header" style="--v4-original-order: 2;"><div class="page-header-content"><h1>WaterWiseKids Open Data</h1><p>Read-only JSON beta and a local MCP reference server</p></div></div>'''
    document, count = re.subn(r'<div class="page-header".*?</div>\s*</div>', header, document, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError("failed to replace header")
    endpoint_html = "".join(
        f'<section class="endpoint"><h3>{item["id"].replace("_", " ").title()}</h3><code>https://www.waterwisekids.com{item["url"]}</code><p><small>{item["limitation"]}</small></p></section>'
        for item in catalog["endpoints"]
    )
    body = f'''
<div class="api-alert"><strong>Beta means constrained claims.</strong> These files expose source-linked records, not hidden confidence. Price data returns observations rather than a benchmark; level matches are not placement; law summaries are not legal advice; access diagnostics are not rankings.</div>
<p>The API is static, cacheable JSON with stable versioned paths. It requires no key and performs no write operation. Use the <a href="/assets/data/api/v1/catalog.json">machine-readable catalog</a> to discover datasets and their limitations.</p>
<h2>JSON endpoints</h2>{endpoint_html}
<h2>MCP reference server</h2>
<p>The repository includes a dependency-free, read-only stdio MCP server. It is a reference implementation for local use and deployment testing; WWK does <strong>not</strong> yet claim a publicly hosted MCP transport.</p>
<table class="tool-table"><thead><tr><th>Tool</th><th>Behavior and guardrail</th></tr></thead><tbody>
<tr><td><code>find_swim_schools</code></td><td>Returns source-checked directory locations by ZIP-centroid distance and disclosed filters. Results are not a complete market census.</td></tr>
<tr><td><code>get_price_benchmark</code></td><td>Returns “not publishable” while price sampling gates fail; it may return underlying state observations without calling them a benchmark.</td></tr>
<tr><td><code>translate_level</code></td><td>Returns neutral-band overlaps and requires a receiving-school assessment.</td></tr>
<tr><td><code>get_state_laws</code></td><td>Returns verified pilot modules or an explicit unpublished status plus the federal life-jacket baseline.</td></tr>
</tbody></table>
<h2>License and attribution</h2><p>WWK-created datasets are available under CC BY 4.0 unless a file says otherwise. Provider curriculum names, government text and linked source material remain subject to their own rights and terms. Attribute “WaterWiseKids” with the dataset URL and version date.</p>'''
    document, count = re.subn(r'<div class="content" style="--v4-original-order: 3;">.*?</div>\s*\n\s*<!-- Footer -->', f'<main class="content" style="--v4-original-order: 3;">{body}</main>\n\n  <!-- Footer -->', document, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError("failed to replace content")
    document = document.replace('<p>© 2026 WaterWiseKids. All rights reserved. | <a href="/privacy/">Privacy Policy</a> | <a href="/terms/">Terms of Service</a></p>', '<p>© 2026 WaterWiseKids. All rights reserved. | <a href="/editorial-policy/">Editorial Policy</a> | <a href="/corrections/">Corrections</a> | <a href="/privacy/">Privacy Policy</a> | <a href="/terms/">Terms of Service</a></p>')
    return re.sub(r"[ \t]+\n", "\n", document)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    schools = build_schools()
    catalog = build_catalog(schools["count"])
    outputs = {SCHOOLS_OUTPUT: json.dumps(schools, indent=2) + "\n", CATALOG_OUTPUT: json.dumps(catalog, indent=2) + "\n", PAGE_OUTPUT: build_page(catalog)}
    stale = []
    for path, rendered in outputs.items():
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != rendered:
                stale.append(str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(rendered, encoding="utf-8")
            print(f"WROTE: {path.relative_to(ROOT)}")
    if stale:
        print("STALE: " + ", ".join(stale))
        return 1
    if args.check:
        print(f"OK: API catalog and {schools['count']} school records match source data")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
