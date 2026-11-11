#!/usr/bin/env python3
"""Consolidate overlapping NJ/PA local-intent pages into six durable hubs.

GitHub Pages cannot emit origin-level 301 responses from repository files. The
generated source pages therefore become noindex transition documents with a
canonical and an immediate client redirect. Cloudflare redirect rules should
mirror ``redirects.json`` so crawlers and users receive HTTP 301 responses at
the edge.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
BASE = "https://www.waterwisekids.com"

HUBS = {
    "andorra": "/swim-lessons-andorra-philadelphia.html",
    "asbury": "/swim-lessons/asbury-park-nj.html",
    "brick": "/swim-lessons/brick-nj.html",
    "cheltenham": "/swim-lessons/cheltenham-pa.html",
    "howell": "/swim-lessons/howell-nj.html",
    "toms-river": "/swim-lessons-toms-river-nj.html",
}

AREA_SLUGS = {
    "andorra": ["andorra-philadelphia", "mount-airy-philadelphia", "northwest-philadelphia"],
    "asbury": [
        "asbury-park-nj",
        "belmar-nj",
        "brielle-nj",
        "oakhurst-nj",
        "ocean-grove-nj",
        "sea-girt-beaches",
        "sea-girt-nj",
    ],
    "brick": ["brick-nj", "brick-township-nj", "brick-beaches"],
    "cheltenham": [
        "abington-pa",
        "ambler-pa",
        "cheltenham-pa",
        "cheltenham-township-pa",
        "elkins-park-pa",
        "flourtown-pa",
        "glenside-pa",
        "jenkintown-pa",
        "spring-house-pa",
        "wyndmoor-pa",
    ],
    "howell": ["howell-nj"],
    "toms-river": ["toms-river-nj"],
}

# Old root-level all-ages pages that compete with the chosen /swim-lessons/
# canonical. Toms River and Andorra remain root-level hubs by design.
ROOT_DUPLICATES = {
    "/swim-lessons-asbury-park-nj.html": HUBS["asbury"],
    "/swim-lessons-brick-nj.html": HUBS["brick"],
    "/swim-lessons-cheltenham-pa.html": HUBS["cheltenham"],
    "/swim-lessons-howell-nj.html": HUBS["howell"],
}


def redirects() -> dict[str, str]:
    mapping = dict(ROOT_DUPLICATES)
    for area, slugs in AREA_SLUGS.items():
        target = HUBS[area]
        for slug in slugs:
            for prefix in ("beginner", "kids", "toddler"):
                source = f"/{prefix}-swim-lessons-{slug}.html"
                if source != target and (ROOT / source.lstrip("/")).exists():
                    mapping[source] = target
    return dict(sorted(mapping.items()))


def label(path: str) -> str:
    stem = Path(path).stem.replace("-", " ")
    return " ".join(word.upper() if word in {"nj", "pa"} else word.title() for word in stem.split())


def transition_html(source: str, target: str) -> str:
    source_label = label(source)
    target_label = label(target)
    target_url = f"{BASE}{target}"
    source_url = f"{BASE}{source}"
    payload = json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": f"{source_label} moved",
            "url": source_url,
            "isPartOf": {"@type": "WebSite", "name": "WaterWiseKids", "url": f"{BASE}/"},
        },
        separators=(",", ":"),
    )
    return f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{source_label} | Guide moved</title>
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="{target_url}">
<meta http-equiv="refresh" content="0;url={target}">
<script type="application/ld+json">{payload}</script>
<style>body{{font-family:Inter,system-ui,sans-serif;margin:0;color:#12344d;background:#f5fbff}}main{{max-width:680px;margin:12vh auto;padding:32px;background:#fff;border-radius:16px;box-shadow:0 8px 28px #0b4f6c1a}}a{{color:#006f9c}}p{{line-height:1.6}}</style>
</head><body><main>
<h1>This local guide has moved</h1>
<p>WaterWiseKids consolidated overlapping age and nearby-town pages into one maintained service-area guide. This reduces duplicate advice and keeps local sources, disclosures and update dates in one place.</p>
<p><a href="{target}">Continue to {target_label}</a>.</p>
<noscript><p>JavaScript is not required; use the link above.</p></noscript>
</main><script>location.replace({json.dumps(target)});</script></body></html>
"""


def update_sitemap(mapping: dict[str, str], *, restore_from_head: bool = False) -> None:
    path = ROOT / "sitemap.xml"
    if restore_from_head:
        text = subprocess.check_output(["git", "show", "HEAD:sitemap.xml"], cwd=ROOT, text=True)
    else:
        text = path.read_text(encoding="utf-8")
    for source in mapping:
        url = re.escape(f"{BASE}{source}")
        text = re.sub(rf"\s*<url>\s*<loc>{url}</loc>.*?</url>", "", text, flags=re.S)
    for target in sorted(set(HUBS.values())):
        url = f"{BASE}{target}"
        if f"<loc>{url}</loc>" not in text:
            block = f"  <url><loc>{url}</loc><lastmod>2026-11-11</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n"
            text = text.replace("</urlset>", block + "</urlset>")
    path.write_text(text, encoding="utf-8")


def main() -> None:
    mapping = redirects()
    for source, target in mapping.items():
        (ROOT / source.lstrip("/")).write_text(transition_html(source, target), encoding="utf-8")
    update_sitemap(mapping, restore_from_head="--sitemap-from-head" in sys.argv)
    manifest = {
        "schema_version": "1.0",
        "generated_on": "2026-11-11",
        "origin": "GitHub Pages behind Cloudflare",
        "repository_fallback": "noindex canonical transition document with immediate client redirect",
        "edge_requirement": "Mirror every mapping as a Cloudflare static 301 redirect.",
        "hubs": HUBS,
        "redirects": [{"source": source, "target": target, "status": 301} for source, target in mapping.items()],
    }
    (Path(__file__).with_name("redirects.json")).write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {len(mapping)} transition pages for {len(HUBS)} local hubs.")


if __name__ == "__main__":
    main()
