#!/usr/bin/env python3
"""Generate the verified-pilot WaterWiseKids water-safety law atlas."""

from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "terms/index.html"
DATA = ROOT / "assets/data/law-atlas/v0.1.json"
OUTPUT = ROOT / "education/swimming-pool-fence-laws-by-state.html"


def render() -> str:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    document = TEMPLATE.read_text(encoding="utf-8")
    url = "https://www.waterwisekids.com/education/swimming-pool-fence-laws-by-state.html"
    title = "Water-Safety Law Atlas: Verified Pool-Barrier Pilot"
    description = "A source-linked pilot atlas for residential pool-barrier frameworks and child life-jacket rules, with verified government sources and local-code cautions."
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

    dataset_schema = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": data["title"],
        "description": description,
        "url": url,
        "dateModified": data["last_verified"],
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "isAccessibleForFree": True,
        "spatialCoverage": [{"@type": "State", "name": item["name"]} for item in data["jurisdictions"]],
        "distribution": [{"@type": "DataDownload", "encodingFormat": "application/json", "contentUrl": "https://www.waterwisekids.com/assets/data/law-atlas/v0.1.json"}],
        "creator": {"@type": "Organization", "name": "WaterWiseKids", "url": "https://www.waterwisekids.com/"},
    }
    scripts = list(re.finditer(r'<script type="application/ld\+json">\s*\{.*?\}\s*</script>', document, re.S))
    if len(scripts) < 2:
        raise RuntimeError("expected two JSON-LD blocks")
    block = '<script type="application/ld+json">\n' + json.dumps(dataset_schema, indent=2) + "\n</script>"
    document = document[:scripts[0].start()] + block + document[scripts[0].end():]
    breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.waterwisekids.com/"},
            {"@type": "ListItem", "position": 2, "name": "Education", "item": "https://www.waterwisekids.com/education/"},
            {"@type": "ListItem", "position": 3, "name": "Water-Safety Law Atlas", "item": url},
        ],
    }
    pattern = re.compile(r'<script type="application/ld\+json">\s*(\{.*?\})\s*</script>', re.S)
    for match in pattern.finditer(document):
        try:
            value = json.loads(match.group(1))
        except json.JSONDecodeError:
            continue
        if value.get("@type") == "BreadcrumbList":
            replacement = '<script type="application/ld+json">\n' + json.dumps(breadcrumb, indent=2) + "\n</script>"
            document = document[:match.start()] + replacement + document[match.end():]
            break

    css = """
    .atlas-warning{background:#fff7ed;border:2px solid #fb923c;border-radius:12px;padding:1rem 1.1rem;color:#7c2d12;margin-bottom:1.25rem}
    .atlas-status{background:#f0f9ff;border-left:5px solid #0284c7;border-radius:10px;padding:1rem 1.1rem;margin:1rem 0 1.5rem}
    .atlas-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin:1.25rem 0}
    .atlas-card{border:1px solid #cbd5e1;border-radius:12px;background:#fff;padding:1rem;box-shadow:0 4px 14px rgba(15,23,42,.06)}
    .atlas-card h3{margin:.1rem 0 .7rem;color:#075985}
    .atlas-card h4{font-size:1rem;color:#0f172a;margin:1rem 0 .4rem}
    .atlas-card p{font-size:.9rem}
    .atlas-card .status{display:inline-block;background:#dcfce7;color:#166534;border-radius:999px;padding:.25rem .55rem;font-size:.76rem;font-weight:800}
    .atlas-card .baseline{background:#fef3c7;color:#92400e}
    .atlas-card a{font-weight:700}
    .atlas-steps{background:#f8fafc;border-radius:12px;padding:1rem 1.25rem}
    @media(max-width:800px){.atlas-grid{grid-template-columns:1fr}.content{padding:2rem 1rem}}
    """
    document = document.replace("\n</style>", css + "\n</style>", 1)

    header = '''<div class="page-header" style="--v4-original-order: 2;">
    <div class="page-header-content">
      <h1>Water-Safety Law Atlas</h1>
      <p>Verified government sources, plain-English summaries, and explicit gaps</p>
    </div>
  </div>'''
    document, count = re.subn(r'<div class="page-header".*?</div>\s*</div>', header, document, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError("failed to replace header")

    cards = []
    for jurisdiction in data["jurisdictions"]:
        pool = jurisdiction["modules"]["residential_pool_barrier"]
        life = jurisdiction["modules"]["child_life_jacket"]
        secondary = ""
        if pool.get("secondary_source_url"):
            secondary = f' <a href="{html.escape(pool["secondary_source_url"])}" target="_blank" rel="noopener">Enforcement source</a>.'
        cards.append(f'''<section class="atlas-card">
  <span class="status">Government source checked</span>
  <h3>{html.escape(jurisdiction["name"])}</h3>
  <h4>Residential pool-barrier framework</h4>
  <p>{html.escape(pool["plain_language"])}</p>
  <p><strong>Local check:</strong> {html.escape(pool["local_note"])}</p>
  <p><a href="{html.escape(pool["source_url"])}" target="_blank" rel="noopener">{html.escape(pool["source_title"])}</a>.{secondary} Checked {html.escape(pool["source_checked_on"])}.</p>
  <h4>Child life-jacket rule</h4>
  <span class="status baseline">Federal baseline only</span>
  <p>{html.escape(life["plain_language"])}</p>
</section>''')
    coverage = data["coverage"]
    baseline = data["federal_baseline"]
    body = f'''
<main class="content" style="--v4-original-order: 3;">
  <div class="atlas-warning"><strong>Plain-English research, not legal advice.</strong> Codes and boating rules can change, and local amendments may control. Confirm the rule for the property address or trip with the enforcing agency before relying on this atlas.</div>
  <div class="atlas-status"><strong>Verified pilot: {coverage["verified_jurisdictions"]} of {coverage["total_jurisdictions"]} jurisdictions.</strong> {html.escape(coverage["note"])} This page replaces the earlier unsourced “all 50 states” summaries; unpublished is safer than confident but unverified.</div>
  <h2>Verified jurisdictions</h2>
  <div class="atlas-grid">{''.join(cards)}</div>
  <h2>Federal child life-jacket baseline</h2>
  <p>{html.escape(baseline["plain_language"])}</p>
  <p><a href="{html.escape(baseline["source_url"])}" target="_blank" rel="noopener">{html.escape(baseline["source_title"])}</a>, checked {html.escape(baseline["source_checked_on"])}.</p>
  <h2 id="local-code">How to verify a rule for your address</h2>
  <ol class="atlas-steps">
    <li>Ask the city, township, or county building department which adopted code and local amendments apply to the exact address.</li>
    <li>Request the pool-barrier section and permit checklist in writing before purchasing or altering a fence, gate, cover, or alarm.</li>
    <li>For boating, check the state boating authority for child-wear ages, water-specific rules, personal-watercraft rules, and any federal-land overlay.</li>
    <li>Save the dated source and the official's written response with permit and inspection records.</li>
  </ol>
  <h2>Methodology and publication gate</h2>
  <ul>
    <li>Every published module links to a current government source and carries a checked date.</li>
    <li>“Verified framework” means the official source establishes the controlling code system but does not reproduce every paid model-code dimension.</li>
    <li>State-specific boating claims remain unpublished when only the federal baseline has been checked.</li>
    <li>A second reviewer must compare each summary with the cited text before a new jurisdiction is published.</li>
    <li>All entries expire for recheck after 90 days and material changes are recorded in the <a href="/corrections/">Corrections Log</a>.</li>
  </ul>
  <p><a href="/assets/data/law-atlas/v0.1.json"><strong>Download the pilot JSON dataset</strong></a> under CC BY 4.0. Submit an official correction through the <a href="/contact/">contact page</a>.</p>
  <h2>Safety standard versus legal minimum</h2>
  <p>A code-compliant barrier is only one layer. The <a href="/tools/pool-barrier-self-check.html">Pool Barrier Self-Check</a> is based on CPSC safety guidance and is not a permit inspection. Use active adult supervision, barriers, alarms or covers where appropriate, swim skills, life jackets around open water, and CPR preparation together.</p>
</main>'''
    document, count = re.subn(
        r'<div class="content" style="--v4-original-order: 3;">.*?</div>\s*\n\s*<!-- Footer -->',
        body + "\n\n  <!-- Footer -->",
        document,
        count=1,
        flags=re.S,
    )
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
        print("OK: law-atlas pilot page matches versioned data")
        return 0
    OUTPUT.write_text(rendered, encoding="utf-8")
    print(f"WROTE: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
