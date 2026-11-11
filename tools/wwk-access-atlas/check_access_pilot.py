#!/usr/bin/env python3
"""Validate the access-atlas coverage diagnostic against current WWK data."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "assets/data/swim-access/pilot-counties.json"
BUILDER = ROOT / "tools/wwk-access-atlas/build_access_page.py"


def reject_duplicates(pairs):
    output = {}
    for key, value in pairs:
        if key in output:
            raise ValueError(f"duplicate JSON key: {key}")
        output[key] = value
    return output


def load_schools() -> dict:
    text = (ROOT / "swim-lessons/directory/schools-data.js").read_text(encoding="utf-8")
    match = re.search(r"const SWIM_SCHOOLS_DATA = (\{.*\});\s*$", text, re.S)
    if not match:
        raise ValueError("unexpected schools-data.js wrapper")
    return json.loads(match.group(1), object_pairs_hook=reject_duplicates)


def main() -> int:
    errors: list[str] = []
    try:
        data = json.loads(DATA.read_text(encoding="utf-8"), object_pairs_hook=reject_duplicates)
        schools = load_schools()
        pools = json.loads((ROOT / "assets/data/pools/pools-v1.json").read_text(encoding="utf-8"), object_pairs_hook=reject_duplicates)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"access-pilot load failed: {exc}", file=sys.stderr)
        return 1
    if data.get("status") != "coverage_diagnostic_pilot" or data.get("access_score_publication_ready") is not False:
        errors.append("pilot must not be published as an access score")
    if date.today() > date.fromisoformat(data["next_review_by"]):
        errors.append("access pilot is past next_review_by")
    gates = data.get("publication_gates", {})
    if all(value is not False for key, value in gates.items() if key != "minimum_unique_providers_per_county"):
        errors.append("pilot cannot imply all publication gates have passed")
    mapping = data.get("zcta_county_assignments", {})
    school_rows = []
    seen_addresses = set()
    for state_rows in schools.values():
        for school in state_rows:
            address = school.get("postalAddress") or {}
            zipcode = address.get("postalCode")
            county = mapping.get(zipcode)
            if not county:
                continue
            key = (address.get("streetAddress", "").casefold(), zipcode)
            if key in seen_addresses:
                continue
            seen_addresses.add(key)
            school_rows.append((county, school.get("name")))
    pool_rows = []
    for venue in pools.get("venues", []):
        zipcode = (venue.get("address") or {}).get("postal_code")
        county = mapping.get(zipcode)
        if county:
            pool_rows.append((county, venue.get("name")))
    for county in data.get("counties", []):
        fips = county["fips"]
        actual_schools = sorted(name for assigned, name in school_rows if assigned == fips)
        actual_pools = sorted(name for assigned, name in pool_rows if assigned == fips)
        if actual_schools != sorted(county.get("observed_school_names", [])):
            errors.append(f"{fips}: observed school list drifted from directory snapshot")
        if len(actual_schools) != county.get("wwk_school_locations"):
            errors.append(f"{fips}: school count drifted")
        if len(actual_pools) != county.get("wwk_public_pool_venues"):
            errors.append(f"{fips}: pool-list count drifted")
        if not county.get("interpretation") or "not" not in county["interpretation"].casefold():
            errors.append(f"{fips}: interpretation lacks incompleteness warning")
    result = subprocess.run([sys.executable, str(BUILDER), "--check"], cwd=ROOT, capture_output=True, text=True)
    if result.returncode:
        errors.append((result.stderr or result.stdout).strip())
    page = ROOT / "swim-access-atlas/index.html"
    if page.exists():
        text = page.read_text(encoding="utf-8")
        for blocked in ("swim desert", "Access score:", "providers per 10,000"):
            if blocked in text:
                errors.append(f"premature access claim remains: {blocked}")
        for required in ("not an access score", "not complete inventories", "common ownership"):
            if required not in text:
                errors.append(f"public page missing diagnostic disclosure: {required}")
    if errors:
        print(f"WWK access pilot FAILED ({len(errors)} issue(s))", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"WWK access pilot passed: {len(data['counties'])} county diagnostics match current directory and pool snapshots; no access ranking published.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
