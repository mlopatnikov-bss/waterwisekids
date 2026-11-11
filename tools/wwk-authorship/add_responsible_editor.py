#!/usr/bin/env python3
"""Add a named responsible editor to WWK's generic visible article bylines."""

from __future__ import annotations

import argparse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EXCLUDED = {".git", ".next", "node_modules", "commercial-poc"}
PROFILE = "/authors/michael-plotnikov/"
OLD = {
    '<div class="article-meta-item">WaterWiseKids Editorial Team</div>': (
        '<div class="article-meta-item">WaterWiseKids Editorial Team · '
        f'<a href="{PROFILE}">Responsible editor: Michael Plotnikov</a></div>'
    ),
    '<div class="article-meta-item">By WaterWiseKids Editorial Team</div>': (
        '<div class="article-meta-item">By WaterWiseKids Editorial Team · '
        f'<a href="{PROFILE}">Responsible editor: Michael Plotnikov</a></div>'
    ),
}


def html_files():
    for path in ROOT.rglob("*.html"):
        if not any(part in EXCLUDED for part in path.parts):
            yield path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    stale: list[str] = []
    changed = 0
    linked = 0
    for path in html_files():
        text = path.read_text(encoding="utf-8", errors="ignore")
        if any(old in text for old in OLD):
            if args.check:
                stale.append(str(path.relative_to(ROOT)))
                continue
            rendered = text
            for old, new in OLD.items():
                rendered = rendered.replace(old, new)
            if rendered != text:
                path.write_text(rendered, encoding="utf-8")
                changed += 1
                text = rendered
        if "Responsible editor: Michael Plotnikov" in text:
            linked += 1
            if f'href="{PROFILE}"' not in text:
                stale.append(f"{path.relative_to(ROOT)} (responsible editor is not linked)")
    if stale:
        print("STALE: generic visible byline remains or link is invalid")
        for item in stale[:50]:
            print(f"- {item}")
        if len(stale) > 50:
            print(f"- ...and {len(stale) - 50} more")
        return 1
    if args.check:
        print(f"OK: {linked} HTML files identify and link the named responsible editor")
    else:
        print(f"UPDATED: {changed} HTML files; {linked} now identify the named responsible editor")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
