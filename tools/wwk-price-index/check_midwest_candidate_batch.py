#!/usr/bin/env python3
"""Validate the internal Midwest price-research batch without promoting it."""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "tools/wwk-price-index/midwest-candidate-batch-2026-11-11.json"
FINGERPRINTS = ROOT / "tools/wwk-price-index/midwest-candidate-source-fingerprints.json"
PUBLIC_DATA = ROOT / "assets/data/price-index/pilot-observations.json"

READY = "ready_for_independent_second_review"
BLOCKED = {"blocked_source_conflict", "blocked_missing_normalization_fields"}
SOURCE_TYPES = {"official_provider", "official_government"}
PROVIDER_TYPES = {"chain", "independent", "municipal", "nonprofit_ymca"}
FORMATS = {"group", "private", "semi_private", "parent_child"}


def load_json_unique(path: Path) -> dict:
    def no_duplicates(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"duplicate JSON key {key!r}")
            result[key] = value
        return result

    return json.loads(path.read_text(), object_pairs_hook=no_duplicates)


def main() -> int:
    errors: list[str] = []
    data = load_json_unique(DATA)
    public = load_json_unique(PUBLIC_DATA)
    fingerprints = load_json_unique(FINGERPRINTS)

    if data.get("publication_status") != "internal_research_only":
        errors.append("candidate batch must remain internal_research_only")
    review = data.get("independent_second_review", {})
    if review.get("status") != "not_started" or review.get("reviewer") is not None:
        errors.append("batch must not claim an independent review before one occurs")
    if data.get("promotion_policy", {}).get("automatic_promotion_allowed") is not False:
        errors.append("automatic promotion must be disabled")

    as_of = date.fromisoformat(data["as_of"])
    ids: set[str] = set()
    evidence_urls: set[str] = set()
    public_ids = {row["id"] for row in public.get("observations", [])}
    ready_count = 0
    blocked_count = 0

    for candidate in data.get("candidates", []):
        candidate_id = candidate.get("candidate_id", "missing-id")
        if candidate_id in ids:
            errors.append(f"{candidate_id}: duplicate candidate id")
        ids.add(candidate_id)
        if candidate_id in public_ids:
            errors.append(f"{candidate_id}: candidate already appears in public pilot")
        if candidate.get("owner_associated") is not False:
            errors.append(f"{candidate_id}: owner-associated candidate is not allowed in this batch")

        observation = candidate.get("observation", {})
        if observation.get("census_region") != "Midwest":
            errors.append(f"{candidate_id}: candidate is not in the Midwest")
        if observation.get("provider_type") not in PROVIDER_TYPES:
            errors.append(f"{candidate_id}: invalid provider type")
        if observation.get("state") in {"NJ", "PA"}:
            errors.append(f"{candidate_id}: owner-market state excluded from this batch")
        try:
            checked = date.fromisoformat(observation["source_checked_on"])
            if checked > as_of:
                errors.append(f"{candidate_id}: source check is after batch date")
        except (KeyError, TypeError, ValueError):
            errors.append(f"{candidate_id}: invalid source check date")

        evidence = candidate.get("source_evidence", [])
        if not evidence:
            errors.append(f"{candidate_id}: no source evidence")
        for source in evidence:
            url = source.get("url", "")
            parsed = urlparse(url)
            if parsed.scheme != "https" or not parsed.netloc:
                errors.append(f"{candidate_id}: evidence URL must be public HTTPS")
            if source.get("source_type") not in SOURCE_TYPES:
                errors.append(f"{candidate_id}: evidence source is not official")
            if not source.get("supports") or not source.get("anchor_note"):
                errors.append(f"{candidate_id}: evidence lacks field map or anchor note")
            evidence_urls.add(url)

        status = candidate.get("promotion_status")
        blockers = candidate.get("blocking_reasons", [])
        if status == READY:
            ready_count += 1
            if blockers:
                errors.append(f"{candidate_id}: ready candidate has blockers")
            required = {
                "provider_name", "location_name", "provider_type", "city", "state",
                "census_region", "class_format", "duration_minutes", "listed_price_usd",
                "lesson_count", "normalized_per_lesson_usd",
                "normalized_per_30_minutes_usd", "normalization", "membership_status",
                "commitment_months", "mandatory_fee_usd", "mandatory_fee_frequency",
                "subsidized", "price_qualifier", "source_checked_on", "source_note",
            }
            missing = sorted(key for key in required if observation.get(key) is None)
            if missing:
                errors.append(f"{candidate_id}: ready candidate missing {', '.join(missing)}")
            if observation.get("class_format") not in FORMATS:
                errors.append(f"{candidate_id}: invalid ready-candidate format")
            price = observation.get("listed_price_usd")
            count = observation.get("lesson_count")
            duration = observation.get("duration_minutes")
            if isinstance(price, (int, float)) and isinstance(count, int) and count > 0:
                per_lesson = round(price / count + 1e-10, 2)
                if observation.get("normalized_per_lesson_usd") != per_lesson:
                    errors.append(f"{candidate_id}: bad per-lesson normalization")
                per_30 = round(per_lesson * 30 / duration + 1e-10, 2)
                if observation.get("normalized_per_30_minutes_usd") != per_30:
                    errors.append(f"{candidate_id}: bad 30-minute normalization")
            else:
                errors.append(f"{candidate_id}: ready candidate lacks numeric normalization inputs")
        elif status in BLOCKED:
            blocked_count += 1
            if not blockers:
                errors.append(f"{candidate_id}: blocked candidate lacks a specific reason")
        else:
            errors.append(f"{candidate_id}: invalid promotion status {status!r}")

    fingerprint_urls = {entry.get("url") for entry in fingerprints.get("entries", [])}
    if fingerprint_urls != evidence_urls:
        errors.append("candidate fingerprints do not cover the exact evidence URL set")
    for entry in fingerprints.get("entries", []):
        if entry.get("http_status") != 200:
            errors.append(f"fingerprint failed HTTP check: {entry.get('url')}")
        digest = entry.get("sha256", "")
        if len(digest) != 64 or any(char not in "0123456789abcdef" for char in digest):
            errors.append(f"fingerprint has invalid SHA-256: {entry.get('url')}")

    if errors:
        print("FAIL: Midwest candidate batch")
        for error in errors:
            print(f"- {error}")
        return 1

    print(
        "PASS: Midwest candidate batch is internally consistent and remains unpublished "
        f"({ready_count} ready for independent review; {blocked_count} blocked; "
        f"{len(evidence_urls)} official sources)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
