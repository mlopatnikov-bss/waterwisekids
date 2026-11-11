#!/usr/bin/env python3
"""Validate disclosure-standard and claim-flow safety boundaries."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "assets/data/transparency-standard/v0.1.json"
BUILDER = ROOT / "tools/wwk-transparency/build_transparency_pages.py"


def main() -> int:
    errors: list[str] = []
    data = json.loads(DATA.read_text(encoding="utf-8"))
    if data.get("status") != "public_beta":
        errors.append("standard must remain public_beta")
    if data.get("review_cycle_days") != 90:
        errors.append("badge review cycle must remain 90 days")
    required_ids = {field["id"] for field in data.get("required_fields", [])}
    for required in ("pricing", "maximum_class_ratio", "background_check_policy", "ownership_conflicts"):
        if required not in required_ids:
            errors.append(f"missing required disclosure field: {required}")
    meaning = data.get("badge_meaning", "").casefold()
    for phrase in ("not a safety certification", "endorsement", "inspection"):
        if phrase not in meaning:
            errors.append(f"badge meaning missing boundary: {phrase}")
    if "payment never changes" not in data.get("sort_policy", "").casefold():
        errors.append("paid-sort separation is missing")
    result = subprocess.run([sys.executable, str(BUILDER), "--check"], cwd=ROOT, capture_output=True, text=True)
    if result.returncode:
        errors.append((result.stderr or result.stdout).strip())
    standard = (ROOT / "transparency-standard/index.html").read_text(encoding="utf-8")
    claim = (ROOT / "for-swim-schools/claim/index.html").read_text(encoding="utf-8")
    for phrase in ("Disclosure badge, not a safety badge", "not a safety certification", "Payment never changes"):
        if phrase not in standard:
            errors.append(f"standard page missing: {phrase}")
    for phrase in ("not instant verification", "do not send student names", "manual review", "authorized_attestation"):
        if phrase not in claim.casefold():
            errors.append(f"claim page missing: {phrase}")
    if 'action="https://formspree.io/f/xzdkybrw"' not in claim:
        errors.append("claim form does not use the established contact endpoint")
    partner_page = (ROOT / "for-swim-schools/index.html").read_text(encoding="utf-8")
    for blocked in ("We're certified swim instructors", "799 verified swim schools", "which schools are top rated"):
        if blocked in partner_page:
            errors.append(f"partner page retains unsupported trust claim: {blocked}")
    for required in ("/transparency-standard/", "/for-swim-schools/claim/", "source-checked school locations"):
        if required not in partner_page:
            errors.append(f"partner page missing transparency path: {required}")
    if errors:
        print(f"WWK transparency standard FAILED ({len(errors)} issue(s))", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"WWK transparency standard passed: {len(required_ids)} disclosure fields; badge remains disclosure-only and claims remain manual-review requests.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
