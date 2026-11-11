#!/usr/bin/env python3
"""Generate the public WWK swim-level crosswalk from the versioned dataset."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "terms/index.html"
DATA = ROOT / "assets/data/level-crosswalk/v0.1.json"
OUTPUT = ROOT / "tools/swim-level-crosswalk/index.html"


def render() -> str:
    dataset = json.loads(DATA.read_text(encoding="utf-8"))
    document = TEMPLATE.read_text(encoding="utf-8")
    url = "https://www.waterwisekids.com/tools/swim-level-crosswalk/"
    title = "Swim Level Crosswalk | Compare Six Lesson Systems"
    description = "Compare swim lesson levels across Aqua-Tots, British Swim School, Goldfish, SafeSplash, Red Cross, and YMCA using an open, source-linked skill crosswalk."
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
        "@type": "SoftwareApplication",
        "name": "WaterWiseKids Swim Level Crosswalk",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web",
        "url": url,
        "description": description,
        "dateModified": dataset["last_verified"],
        "isAccessibleForFree": True,
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "publisher": {"@type": "Organization", "name": "WaterWiseKids", "url": "https://www.waterwisekids.com/"},
    }
    scripts = list(re.finditer(r'<script type="application/ld\+json">\s*\{.*?\}\s*</script>', document, re.S))
    if len(scripts) < 2:
        raise RuntimeError("expected two JSON-LD blocks")
    block = '<script type="application/ld+json">\n' + json.dumps(schema, indent=2) + "\n</script>"
    document = document[:scripts[0].start()] + block + document[scripts[0].end():]

    breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.waterwisekids.com/"},
            {"@type": "ListItem", "position": 2, "name": "Tools", "item": "https://www.waterwisekids.com/tools/"},
            {"@type": "ListItem", "position": 3, "name": "Swim Level Crosswalk", "item": url},
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

    extra_css = """
    .crosswalk-alert{border:2px solid #f59e0b;background:#fffbeb;color:#78350f;border-radius:12px;padding:1rem 1.1rem;margin-bottom:1.5rem}
    .crosswalk-card{border:1px solid #cbd5e1;border-radius:14px;background:#fff;padding:1.25rem;margin:1rem 0;box-shadow:0 5px 18px rgba(15,23,42,.06)}
    .crosswalk-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
    .crosswalk-card label{display:block;font-weight:700;color:#0f172a;margin-bottom:.4rem}
    .crosswalk-card select{width:100%;min-height:48px;border:1px solid #94a3b8;border-radius:8px;background:#fff;padding:.65rem;font:inherit;color:#0f172a}
    .crosswalk-result{border-left:5px solid #0284c7;background:#f0f9ff;border-radius:10px;padding:1rem 1.1rem;margin-top:1rem}
    .crosswalk-result h3{color:#075985;margin:.1rem 0 .5rem}
    .match-list{display:grid;gap:.75rem;margin-top:1rem}
    .match{border:1px solid #bae6fd;border-radius:10px;background:#fff;padding:.85rem}
    .match strong{display:block;color:#0c4a6e}
    .pill{display:inline-block;border-radius:999px;background:#e0f2fe;color:#075985;font-size:.78rem;font-weight:700;padding:.25rem .55rem;margin:.25rem .25rem 0 0}
    .source-list{padding-left:1.2rem}
    .source-list li{margin-bottom:.75rem}
    .data-links{display:flex;flex-wrap:wrap;gap:.65rem;margin:1rem 0}
    .data-links a{display:inline-block;border:1px solid #0284c7;border-radius:999px;padding:.55rem .8rem;font-weight:700;text-decoration:none}
    @media(max-width:700px){.crosswalk-grid{grid-template-columns:1fr}.content{padding:2rem 1rem}.crosswalk-card{padding:1rem}}
    """
    document = document.replace("\n</style>", extra_css + "\n</style>", 1)

    header = '''<div class="page-header" style="--v4-original-order: 2;">
    <div class="page-header-content">
      <h1>Swim Level Crosswalk</h1>
      <p>Compare six lesson systems by broad skill band—not by marketing name</p>
    </div>
  </div>'''
    document, count = re.subn(r'<div class="page-header".*?</div>\s*</div>', header, document, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError("failed to replace header")

    sources = "\n".join(
        f'<li><a href="{system["source_url"]}" target="_blank" rel="noopener">{system["name"]}: {system["source_title"]}</a> — checked {system["source_checked_on"]}. {system["source_note"]}</li>'
        for system in dataset["systems"]
    )
    body = f'''
<main class="content" style="--v4-original-order: 3;">
  <div class="crosswalk-alert"><strong>Use this as a conversation starter, not a placement decision.</strong> Level names are not standardized. Age tracks, teaching methods, pools, and graduation tests differ. A receiving school must assess the swimmer before enrollment.</div>
  <p>This public beta maps provider-published descriptions to seven neutral skill bands. A match means the descriptions overlap; it does not mean the levels are identical or that a swimmer has demonstrated every skill.</p>
  <div class="crosswalk-card" aria-labelledby="translator-title">
    <h2 id="translator-title">Translate a level</h2>
    <div class="crosswalk-grid">
      <div><label for="source-system">Current lesson system</label><select id="source-system"><option value="">Choose a system</option></select></div>
      <div><label for="source-level">Current level</label><select id="source-level" disabled><option value="">Choose a level</option></select></div>
      <div><label for="target-system">Compare with</label><select id="target-system"><option value="">Choose a system</option></select></div>
    </div>
    <div id="crosswalk-output" aria-live="polite"></div>
  </div>
  <h2 id="methodology">Methodology and guardrails</h2>
  <ul>
    <li>Only current official provider or curriculum-owner pages are used.</li>
    <li>Each description is mapped to one band or a range. Broad provider categories receive lower confidence.</li>
    <li>Age-specific tracks remain separate. A similar skill band does not make an infant, preschool, and school-age class interchangeable.</li>
    <li>No provider pays for its mapping, order, or confidence label. Corrections require an official source.</li>
    <li>The dataset expires for review after 90 days. It is withdrawn or relabeled stale if the source cannot be rechecked.</li>
  </ul>
  <div class="data-links"><a href="/assets/data/level-crosswalk/v0.1.json">Download JSON v0.1</a><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0 license</a><a href="/contact/">Submit an official correction</a></div>
  <h2>Official sources</h2>
  <ul class="source-list">{sources}</ul>
  <h2>Ownership disclosure</h2>
  <p>{dataset["ownership_disclosure"]} See the full <a href="/ownership-disclosure/">ownership and advertising disclosure</a>.</p>
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

    script = r'''
<script>
(function(){
  const DATA_URL='/assets/data/level-crosswalk/v0.1.json';
  const source=document.getElementById('source-system');
  const level=document.getElementById('source-level');
  const target=document.getElementById('target-system');
  const output=document.getElementById('crosswalk-output');
  let data;
  const bandNumber=id=>Number(id.slice(1));
  const overlaps=(a,b)=>bandNumber(a.band_min)<=bandNumber(b.band_max)&&bandNumber(b.band_min)<=bandNumber(a.band_max);
  const escapeHtml=value=>String(value).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  function systemById(id){return data.systems.find(item=>item.id===id);}
  function bandLabel(item){
    const first=data.bands.find(b=>b.id===item.band_min);
    const last=data.bands.find(b=>b.id===item.band_max);
    return first.id===last.id ? `${first.id}: ${first.name}` : `${first.id}–${last.id}: ${first.name} through ${last.name}`;
  }
  function fillSystems(){
    data.systems.forEach(item=>{
      [source,target].forEach(select=>{const option=document.createElement('option');option.value=item.id;option.textContent=item.name;select.appendChild(option);});
    });
  }
  function fillLevels(){
    level.innerHTML='<option value="">Choose a level</option>';
    const system=systemById(source.value);
    level.disabled=!system;
    if(system){system.levels.forEach(item=>{const option=document.createElement('option');option.value=item.id;option.textContent=item.name;level.appendChild(option);});}
    render();
  }
  function render(){
    output.innerHTML='';
    const currentSystem=systemById(source.value);
    const targetSystem=systemById(target.value);
    const current=currentSystem&&currentSystem.levels.find(item=>item.id===level.value);
    if(!current||!targetSystem)return;
    const matches=targetSystem.levels.filter(item=>overlaps(current,item));
    const cards=matches.map(item=>`<div class="match"><strong>${escapeHtml(item.name)}</strong><span class="pill">${escapeHtml(bandLabel(item))}</span><span class="pill">${escapeHtml(item.confidence)} mapping confidence</span><p>${escapeHtml(item.source_summary)}</p><small>${escapeHtml(item.age_track)}</small></div>`).join('');
    output.innerHTML=`<div class="crosswalk-result"><h3>${escapeHtml(current.name)} maps to ${escapeHtml(bandLabel(current))}</h3><p>${escapeHtml(current.source_summary)} <strong>Age track:</strong> ${escapeHtml(current.age_track)}.</p><p><strong>Possible descriptive overlaps in ${escapeHtml(targetSystem.name)}:</strong></p><div class="match-list">${cards||'<p>No overlap is published. Ask the receiving school for an assessment.</p>'}</div><p><strong>Required next step:</strong> ask ${escapeHtml(targetSystem.name)} to assess the swimmer. Do not enroll from this match alone.</p></div>`;
  }
  fetch(DATA_URL).then(response=>{if(!response.ok)throw new Error('data unavailable');return response.json();}).then(value=>{data=value;fillSystems();}).catch(()=>{output.innerHTML='<div class="crosswalk-alert">The crosswalk data could not be loaded. Please try again later.</div>';});
  source.addEventListener('change',fillLevels);level.addEventListener('change',render);target.addEventListener('change',render);
})();
</script>
'''
    document = document.replace("</body>", script + "</body>")
    document = document.replace(
        '<p>© 2026 WaterWiseKids. All rights reserved. | <a href="/privacy/">Privacy Policy</a> | <a href="/terms/">Terms of Service</a></p>',
        '<p>© 2026 WaterWiseKids. All rights reserved. | <a href="/editorial-policy/">Editorial Policy</a> | <a href="/corrections/">Corrections</a> | <a href="/privacy/">Privacy Policy</a> | <a href="/terms/">Terms of Service</a></p>',
    )
    return document


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    rendered = render()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != rendered:
            print(f"STALE: {OUTPUT.relative_to(ROOT)}")
            return 1
        print("OK: swim-level crosswalk page matches versioned data")
        return 0
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(rendered, encoding="utf-8")
    print(f"WROTE: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
