#!/usr/bin/env python3
"""Validate unpublished life-jacket candidates and their evidence boundary."""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "tools/wwk-law-atlas/life-jacket-candidate-batch-2026-11-11.json"
FINGERPRINTS = ROOT / "tools/wwk-law-atlas/life-jacket-candidate-source-fingerprints.json"
ATLAS = ROOT / "assets/data/law-atlas/v0.1.json"


def load_unique(path: Path) -> dict:
    def reject_duplicates(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"duplicate JSON key: {key}")
            result[key] = value
        return result

    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=reject_duplicates)


def main() -> int:
    errors: list[str] = []
    data = load_unique(DATA)
    fingerprints = load_unique(FINGERPRINTS)
    atlas = load_unique(ATLAS)
    if data.get("publication_status") != "internal_research_only":
        errors.append("candidate batch must remain internal_research_only")
    review = data.get("independent_second_review", {})
    if review != {"status": "not_started", "reviewer": None, "reviewed_on": None}:
        errors.append("candidate batch claims a second review that has not occurred")
    if date.today() > date.fromisoformat(data["expires_on"]):
        errors.append("candidate batch is stale and must be re-researched")

    published_codes = {item["code"] for item in atlas["jurisdictions"]}
    candidates = data.get("candidates", [])
    if {item.get("jurisdiction_code") for item in candidates} != published_codes:
        errors.append("candidate codes must exactly match the three pilot jurisdictions")
    ids: set[str] = set()
    source_urls: set[str] = set()
    for candidate in candidates:
        label = candidate.get("candidate_id", "missing-id")
        if label in ids:
            errors.append(f"{label}: duplicate candidate id")
        ids.add(label)
        if candidate.get("module_id") != "child_life_jacket":
            errors.append(f"{label}: wrong module")
        if candidate.get("promotion_status") != "ready_for_independent_second_review":
            errors.append(f"{label}: candidate status is not review-ready")
        if not candidate.get("draft_plain_language") or not candidate.get("scope"):
            errors.append(f"{label}: draft or scope is missing")
        if candidate.get("source_checked_on") != data.get("as_of"):
            errors.append(f"{label}: source date differs from batch")
        if not candidate.get("sources"):
            errors.append(f"{label}: no official sources")
        for source in candidate.get("sources", []):
            parsed = urlparse(source.get("url", ""))
            if parsed.scheme != "https" or not parsed.netloc:
                errors.append(f"{label}: source URL is not HTTPS")
            if not source.get("source_type", "").startswith("official_government"):
                errors.append(f"{label}: non-government source")
            if not source.get("role") or not source.get("anchor_note"):
                errors.append(f"{label}: source lacks role or anchor")
            source_urls.add(source["url"])

    fingerprint_urls = {entry.get("url") for entry in fingerprints.get("entries", [])}
    if fingerprint_urls != source_urls:
        errors.append("fingerprints do not cover the exact source set")
    for entry in fingerprints.get("entries", []):
        if entry.get("http_status") != 200:
            errors.append(f"source did not return HTTP 200: {entry.get('url')}")
        digest = entry.get("sha256", "")
        if len(digest) != 64 or any(char not in "0123456789abcdef" for char in digest):
            errors.append(f"invalid source fingerprint: {entry.get('url')}")

    public_text = json.dumps(atlas, sort_keys=True)
    for candidate in candidates:
        if candidate["draft_plain_language"] in public_text:
            errors.append(f"{candidate['candidate_id']}: unpublished draft leaked into public atlas")

    if errors:
        print(f"WWK life-jacket candidate batch FAILED ({len(errors)} issue(s))", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"PASS: {len(candidates)} pilot-state life-jacket candidates remain unpublished and await independent review")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
