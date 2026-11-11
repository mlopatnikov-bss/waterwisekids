#!/usr/bin/env python3
"""Fail closed if a local consolidation mapping drifts or re-enters the sitemap."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MANIFEST = Path(__file__).with_name("redirects.json")


def main() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    errors: list[str] = []
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    redirects = data["redirects"]
    if len(data["hubs"]) != 6:
        errors.append("expected exactly six maintained local hubs")
    if len(redirects) < 50:
        errors.append("redirect inventory unexpectedly small")
    for hub in data["hubs"].values():
        file = ROOT / hub.lstrip("/")
        text = file.read_text(encoding="utf-8") if file.exists() else ""
        if not text:
            errors.append(f"missing hub {hub}")
        if f"https://www.waterwisekids.com{hub}" not in text:
            errors.append(f"hub canonical missing for {hub}")
        if not re.search(r"owns WaterWiseKids|Affiliation disclosure|ownership disclosure", text, re.I):
            errors.append(f"ownership disclosure missing from {hub}")
        if f"<loc>https://www.waterwisekids.com{hub}</loc>" not in sitemap:
            errors.append(f"hub absent from sitemap: {hub}")
    for row in redirects:
        source, target = row["source"], row["target"]
        text = (ROOT / source.lstrip("/")).read_text(encoding="utf-8")
        for required in ('name="robots" content="noindex,follow"', f'href="https://www.waterwisekids.com{target}"', f'location.replace("{target}")'):
            if required not in text:
                errors.append(f"transition page drift: {source} missing {required}")
        if f"<loc>https://www.waterwisekids.com{source}</loc>" in sitemap:
            errors.append(f"redirect source still in sitemap: {source}")
    if errors:
        raise SystemExit("Local consolidation failed:\n- " + "\n- ".join(errors))
    print(f"WWK local consolidation passed: {len(redirects)} source pages converge on six disclosed hubs; redirect sources are absent from sitemap.")


if __name__ == "__main__":
    main()
