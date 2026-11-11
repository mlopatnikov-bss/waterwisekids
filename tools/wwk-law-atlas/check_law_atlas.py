#!/usr/bin/env python3
"""Validate the WWK verified-pilot water-safety law atlas."""

from __future__ import annotations

import json
import subprocess
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "assets/data/law-atlas/v0.1.json"
BUILDER = ROOT / "tools/wwk-law-atlas/build_law_atlas.py"
GOVERNMENT_HOST_SUFFIXES = (".gov", ".gov.au")
OFFICIAL_GOVERNMENT_HOSTS = {"www.uscgboating.org", "uscgboating.org"}


def government_url(value: str) -> bool:
    parsed = urlparse(value)
    host = parsed.hostname or ""
    return parsed.scheme == "https" and (host.endswith(GOVERNMENT_HOST_SUFFIXES) or host in OFFICIAL_GOVERNMENT_HOSTS)


def reject_duplicates(pairs):
    output = {}
    for key, value in pairs:
        if key in output:
            raise ValueError(f"duplicate JSON key: {key}")
        output[key] = value
    return output


def main() -> int:
    errors: list[str] = []
    try:
        data = json.loads(DATA.read_text(encoding="utf-8"), object_pairs_hook=reject_duplicates)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"law atlas load failed: {exc}", file=sys.stderr)
        return 1
    if data.get("status") != "verified_pilot":
        errors.append("atlas must remain labeled verified_pilot until 51 jurisdictions pass review")
    if date.today() > date.fromisoformat(data["next_review_by"]):
        errors.append("law atlas is past next_review_by")
    jurisdictions = data.get("jurisdictions", [])
    coverage = data.get("coverage", {})
    if coverage.get("verified_jurisdictions") != len(jurisdictions):
        errors.append("coverage count differs from published jurisdiction records")
    if coverage.get("total_jurisdictions") != 51:
        errors.append("coverage denominator must include 50 states plus DC")
    seen: set[str] = set()
    for jurisdiction in jurisdictions:
        code = jurisdiction.get("code")
        if code in seen:
            errors.append(f"duplicate jurisdiction code: {code}")
        seen.add(code)
        for topic, module in jurisdiction.get("modules", {}).items():
            if not government_url(module.get("source_url", "")):
                errors.append(f"{code}/{topic}: source is not an HTTPS government URL")
            if module.get("source_checked_on") != data.get("last_verified"):
                errors.append(f"{code}/{topic}: source check date differs from dataset")
            if not module.get("plain_language"):
                errors.append(f"{code}/{topic}: missing summary")
        pool = jurisdiction.get("modules", {}).get("residential_pool_barrier", {})
        if not pool.get("local_note"):
            errors.append(f"{code}: pool-barrier summary lacks local-code caution")
    baseline = data.get("federal_baseline", {})
    if not government_url(baseline.get("source_url", "")):
        errors.append("federal baseline source is not an HTTPS government URL")
    result = subprocess.run([sys.executable, str(BUILDER), "--check"], cwd=ROOT, capture_output=True, text=True)
    if result.returncode:
        errors.append((result.stderr or result.stdout).strip())
    page = ROOT / "education/swimming-pool-fence-laws-by-state.html"
    if page.exists():
        text = page.read_text(encoding="utf-8")
        for blocked in ("All 50 States", "All 15 states below require", "Texas building codes require four-sided"):
            if blocked in text:
                errors.append(f"legacy unsourced claim remains: {blocked}")
        for required in ("Plain-English research, not legal advice", "Verified pilot: 3 of 51", "unpublished is safer"):
            if required not in text:
                errors.append(f"page missing required pilot disclosure: {required}")
    if errors:
        print(f"WWK law atlas FAILED ({len(errors)} issue(s))", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"WWK law atlas passed: {len(jurisdictions)} verified pilot jurisdictions; legacy unsupported national claims removed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
