#!/usr/bin/env python3
"""Validate the WWK swim-level crosswalk and generated public page."""

from __future__ import annotations

import json
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "assets/data/level-crosswalk/v0.1.json"
BUILDER = ROOT / "tools/wwk-level-crosswalk/build_crosswalk_page.py"


def main() -> int:
    errors: list[str] = []
    try:
        data = json.loads(DATA.read_text(encoding="utf-8"), object_pairs_hook=_reject_duplicate_keys)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"crosswalk load failed: {exc}", file=sys.stderr)
        return 1

    if data.get("status") != "public_beta":
        errors.append("status must remain public_beta until independent provider review")
    if date.today() > date.fromisoformat(data["next_review_by"]):
        errors.append("crosswalk is past next_review_by and must be reverified or withdrawn")
    bands = data.get("bands", [])
    band_ids = [item.get("id") for item in bands]
    if band_ids != [f"B{i}" for i in range(1, 8)]:
        errors.append("neutral bands must be the ordered B1–B7 set")
    systems = data.get("systems", [])
    required = {"aqua-tots", "british-swim-school", "goldfish", "safesplash", "red-cross", "ymca"}
    if {item.get("id") for item in systems} != required:
        errors.append("crosswalk must contain exactly the six reviewed systems")
    seen_levels: set[str] = set()
    for system in systems:
        if not str(system.get("source_url", "")).startswith("https://"):
            errors.append(f'{system.get("id")}: missing official HTTPS source')
        if system.get("source_checked_on") != data.get("last_verified"):
            errors.append(f'{system.get("id")}: source check date differs from dataset verification date')
        if not system.get("levels"):
            errors.append(f'{system.get("id")}: no levels')
        for level in system.get("levels", []):
            level_id = level.get("id")
            if level_id in seen_levels:
                errors.append(f"duplicate level id: {level_id}")
            seen_levels.add(level_id)
            if level.get("band_min") not in band_ids or level.get("band_max") not in band_ids:
                errors.append(f"{level_id}: invalid neutral band")
            elif band_ids.index(level["band_min"]) > band_ids.index(level["band_max"]):
                errors.append(f"{level_id}: inverted band range")
            if level.get("confidence") not in {"low", "medium"}:
                errors.append(f"{level_id}: confidence cannot claim high certainty")
            for field in ("age_track", "source_summary"):
                if not level.get(field):
                    errors.append(f"{level_id}: missing {field}")

    disclosure = data.get("ownership_disclosure", "")
    if "British Swim School" not in disclosure or "common ownership" not in disclosure:
        errors.append("common-ownership disclosure is missing")
    if "not a placement decision" not in data.get("disclaimer", ""):
        errors.append("placement disclaimer is missing")

    result = subprocess.run([sys.executable, str(BUILDER), "--check"], cwd=ROOT, capture_output=True, text=True)
    if result.returncode:
        errors.append((result.stderr or result.stdout).strip())

    page = ROOT / "tools/swim-level-crosswalk/index.html"
    if page.exists():
        text = page.read_text(encoding="utf-8")
        for required_text in ("not a placement decision", "receiving school must assess", "Ownership disclosure", "Download JSON v0.1"):
            if required_text not in text:
                errors.append(f"public page missing required guardrail: {required_text}")

    if errors:
        print(f"WWK level crosswalk FAILED ({len(errors)} issue(s))", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"WWK level crosswalk passed: {len(systems)} systems, {len(seen_levels)} sourced levels, no placement claims.")
    return 0


def _reject_duplicate_keys(pairs):
    output = {}
    for key, value in pairs:
        if key in output:
            raise ValueError(f"duplicate JSON key: {key}")
        output[key] = value
    return output


if __name__ == "__main__":
    raise SystemExit(main())
