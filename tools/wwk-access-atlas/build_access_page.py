#!/usr/bin/env python3
"""Generate the public access-atlas coverage diagnostic pilot."""

from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "terms/index.html"
DATA = ROOT / "assets/data/swim-access/pilot-counties.json"
OUTPUT = ROOT / "swim-access-atlas/index.html"


def render() -> str:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    document = TEMPLATE.read_text(encoding="utf-8")
    url = "https://www.waterwisekids.com/swim-access-atlas/"
    title = "Swim Access Atlas Foundation | Coverage Diagnostic Pilot"
    description = "A transparent three-county data-coverage diagnostic for a future U.S. swim access atlas. It is not an access score or swim-desert ranking."
    replacements = [
        (r"<title>.*?</title>", f"<title>{title}</title>"),
        (r'<meta name="description" content=".*?">', f'<meta name="description" content="{description}">'),
        (r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="{url}">'),
        (r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="{url}">'),
        (r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{title}">'),
        (r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{description}">'),
        (r'<meta name="twitter:title" content=".*?">', f'<meta name="twitter:title" content="{title}">'),
        (r'<meta name="twitter:description" content=".*?">', f'<meta name="twitter:description" content="{description}">'),
    ]
    for pattern, replacement in replacements:
        document, count = re.subn(pattern, replacement, document, count=1, flags=re.S)
        if count != 1:
            raise RuntimeError(f"failed to replace {pattern}")
    schema = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": data["title"],
        "description": description,
        "url": url,
        "dateModified": data["last_verified"],
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "isAccessibleForFree": True,
        "distribution": [{"@type": "DataDownload", "encodingFormat": "application/json", "contentUrl": "https://www.waterwisekids.com/assets/data/swim-access/pilot-counties.json"}],
        "spatialCoverage": [{"@type": "AdministrativeArea", "name": f'{county["name"]}, {county["state"]}'} for county in data["counties"]],
        "creator": {"@type": "Organization", "name": "WaterWiseKids", "url": "https://www.waterwisekids.com/"},
    }
    scripts = list(re.finditer(r'<script type="application/ld\+json">\s*\{.*?\}\s*</script>', document, re.S))
    block = '<script type="application/ld+json">\n' + json.dumps(schema, indent=2) + "\n</script>"
    document = document[:scripts[0].start()] + block + document[scripts[0].end():]
    css = """
    .access-alert{background:#fff7ed;border:2px solid #fb923c;border-radius:12px;padding:1rem 1.1rem;color:#7c2d12;margin-bottom:1rem}
    .access-disclosure{background:#f0f9ff;border-left:5px solid #0284c7;border-radius:10px;padding:1rem 1.1rem;margin:1rem 0 1.5rem}
    .county-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin:1.25rem 0}
    .county-card{border:1px solid #cbd5e1;border-radius:12px;background:#fff;padding:1rem;box-shadow:0 4px 14px rgba(15,23,42,.06)}
    .county-card h3{color:#075985;margin:.1rem 0 .75rem}.county-card .metric{font-size:1.5rem;font-weight:800;color:#0f172a}.county-card small{display:block;color:#64748b}
    .gate-list li{margin-bottom:.6rem}.gate-fail{font-weight:800;color:#991b1b}
    @media(max-width:800px){.county-grid{grid-template-columns:1fr}.content{padding:2rem 1rem}}
    """
    document = document.replace("\n</style>", css + "\n</style>", 1)
    header = '''<div class="page-header" style="--v4-original-order: 2;">
    <div class="page-header-content">
      <h1>Swim Access Atlas Foundation</h1>
      <p>Three-county data coverage diagnostic—not an access ranking</p>
    </div>
  </div>'''
    document, count = re.subn(r'<div class="page-header".*?</div>\s*</div>', header, document, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError("failed to replace header")
    cards = []
    for county in data["counties"]:
        names = "".join(f"<li>{html.escape(name)}</li>" for name in county["observed_school_names"])
        cards.append(f'''<section class="county-card">
  <h3>{html.escape(county["name"])}, {html.escape(county["state"])}</h3>
  <div class="metric">{county["under_18_population"]:,}</div><small>people under 18 · 2024 ACS 5-year estimate (MOE ±{county["under_18_population_moe"]:,})</small>
  <p><strong>{county["wwk_school_locations"]} WWK directory location(s)</strong> assigned through dominant-land-area ZCTA mapping; <strong>{county["wwk_public_pool_venues"]} WWK pool-list venue(s)</strong>.</p>
  <ul>{names}</ul>
  <p>{html.escape(county["interpretation"])}</p>
</section>''')
    failed_gates = "".join(
        f'<li><span class="gate-fail">Not passed:</span> {html.escape(key.replace("_", " "))}</li>'
        for key, value in data["publication_gates"].items()
        if value is False
    )
    body = f'''
<main class="content" style="--v4-original-order: 3;">
  <div class="access-alert"><strong>{html.escape(data["public_label"])}</strong> The current provider and pool files are not complete inventories. A low WWK count cannot show that families lack lessons or pools.</div>
  <div class="access-disclosure"><strong>Why publish this?</strong> It makes the missing data visible before WWK produces thousands of county pages or labels a community. {html.escape(data["methodology_note"])}</div>
  <h2>Pilot coverage diagnostics</h2>
  <div class="county-grid">{''.join(cards)}</div>
  <h2>Why no access score appears</h2>
  <p>A defensible access measure needs verified year-round providers, actual travel time, prices, scholarships, and a documented completeness audit. These gates have not passed:</p>
  <ul class="gate-list">{failed_gates}</ul>
  <p>No county page is generated until its minimum data threshold passes. Drowning-rate fields will also follow CDC small-number suppression rules before publication.</p>
  <h2>Methods and sources</h2>
  <ul>
    <li><a href="{html.escape(data["sources"]["youth_population"]["url"])}">2024 ACS 5-Year Table B09001</a>, field B09001_E001 for population under 18. The source file hash is recorded in the dataset.</li>
    <li><a href="{html.escape(data["sources"]["zcta_county_relationship"]["url"])}">2020 Census ZCTA-to-County relationship file</a>. Each ZCTA is assigned to the county containing its largest land-area share; a ZCTA is only a ZIP approximation.</li>
    <li>The WWK school directory and Find a Pool list are starting datasets, not provider censuses. Duplicate street address plus ZIP is counted once.</li>
  </ul>
  <h2>Ownership and sampling bias</h2>
  <p>{html.escape(data["ownership_disclosure"])} See the full <a href="/ownership-disclosure/">ownership disclosure</a>. Affiliated locations receive no score or preferential treatment; no score is published at all in this pilot.</p>
  <p><a href="/assets/data/swim-access/pilot-counties.json"><strong>Download the pilot JSON</strong></a> under CC BY 4.0. Last verified {html.escape(data["last_verified"])}; review due {html.escape(data["next_review_by"])}.</p>
</main>'''
    document, count = re.subn(r'<div class="content" style="--v4-original-order: 3;">.*?</div>\s*\n\s*<!-- Footer -->', body + "\n\n  <!-- Footer -->", document, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError("failed to replace content")
    document = document.replace(
        '<p>© 2026 WaterWiseKids. All rights reserved. | <a href="/privacy/">Privacy Policy</a> | <a href="/terms/">Terms of Service</a></p>',
        '<p>© 2026 WaterWiseKids. All rights reserved. | <a href="/editorial-policy/">Editorial Policy</a> | <a href="/corrections/">Corrections</a> | <a href="/privacy/">Privacy Policy</a> | <a href="/terms/">Terms of Service</a></p>',
    )
    return re.sub(r"[ \t]+\n", "\n", document)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    rendered = render()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != rendered:
            print(f"STALE: {OUTPUT.relative_to(ROOT)}")
            return 1
        print("OK: access-atlas coverage diagnostic matches versioned data")
        return 0
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(rendered, encoding="utf-8")
    print(f"WROTE: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
