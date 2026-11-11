#!/usr/bin/env python3
"""Validate price observations and enforce publication gates."""

from __future__ import annotations

import json
import subprocess
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "assets/data/price-index/pilot-observations.json"
PAGE = ROOT / "education/swim-lessons-cost.html"

PROVIDER_TYPES = {"chain", "independent", "municipal", "nonprofit_ymca"}
FORMATS = {"group", "private", "semi_private", "parent_child"}
REGIONS = {"Northeast", "Midwest", "South", "West"}
SOURCE_TYPES = {"official_provider", "official_government"}


def location_key(row: dict) -> tuple[str, str, str, str]:
    return (row["provider_name"], row["location_name"], row["city"], row["state"])


def validate() -> tuple[list[str], list[str]]:
    data = json.loads(DATA.read_text())
    errors: list[str] = []
    notes: list[str] = []
    rows = data.get("observations", [])
    as_of = date.fromisoformat(data["as_of"])
    ids: set[str] = set()
    required = {
        "id", "provider_name", "location_name", "provider_type", "city", "state",
        "census_region", "class_format", "listed_price_usd", "lesson_count",
        "normalized_per_lesson_usd", "normalization", "membership_status",
        "commitment_months", "subsidized", "price_qualifier", "source_url",
        "source_type", "source_checked_on", "source_note",
    }

    for index, row in enumerate(rows, 1):
        label = row.get("id", f"row-{index}")
        missing = sorted(required - row.keys())
        if missing:
            errors.append(f"{label}: missing {', '.join(missing)}")
            continue
        if label in ids:
            errors.append(f"{label}: duplicate id")
        ids.add(label)
        if row["provider_type"] not in PROVIDER_TYPES:
            errors.append(f"{label}: invalid provider_type")
        if row["class_format"] not in FORMATS:
            errors.append(f"{label}: invalid class_format")
        if row["census_region"] not in REGIONS:
            errors.append(f"{label}: invalid census_region")
        if row["source_type"] not in SOURCE_TYPES:
            errors.append(f"{label}: source is not official")
        parsed = urlparse(row["source_url"])
        if parsed.scheme != "https" or not parsed.netloc:
            errors.append(f"{label}: source_url must be a public HTTPS URL")
        if row["lesson_count"] <= 0 or row["listed_price_usd"] < 0:
            errors.append(f"{label}: invalid price or lesson count")
        expected = round(row["listed_price_usd"] / row["lesson_count"] + 1e-10, 2)
        if abs(expected - row["normalized_per_lesson_usd"]) > 0.001:
            errors.append(
                f"{label}: normalized price {row['normalized_per_lesson_usd']:.2f} "
                f"does not match {expected:.2f}"
            )
        duration = row.get("duration_minutes")
        if duration is not None and not 10 <= duration <= 120:
            errors.append(f"{label}: implausible duration")
        ratio = row.get("ratio_max")
        if ratio is not None and ratio < 1:
            errors.append(f"{label}: invalid ratio")
        checked = date.fromisoformat(row["source_checked_on"])
        age = (as_of - checked).days
        if age < 0:
            errors.append(f"{label}: source check date is after dataset as_of date")
        for supporting_url in row.get("supporting_source_urls", []):
            supporting = urlparse(supporting_url)
            if supporting.scheme != "https" or not supporting.netloc:
                errors.append(f"{label}: supporting source must be a public HTTPS URL")

    location_rows: dict[tuple[str, str, str, str], dict] = {}
    for row in rows:
        location_rows.setdefault(location_key(row), row)
    locations = list(location_rows.values())
    states = {row["state"] for row in locations}
    regions = {row["census_region"] for row in locations}
    types = Counter(row["provider_type"] for row in locations)
    chain_counts = Counter((row["chain"] or row["provider_name"]) for row in locations if row["provider_type"] == "chain")
    official_share = sum(row["source_type"] in SOURCE_TYPES for row in rows) / len(rows) if rows else 0
    thresholds = data["publication_thresholds"]["national"]
    fresh_share = (
        sum(
            0 <= (as_of - date.fromisoformat(row["source_checked_on"])).days
            <= thresholds["max_source_age_days"]
            for row in rows
        )
        / len(rows)
        if rows
        else 0
    )

    unmet: list[str] = []
    if len(locations) < thresholds["min_unique_locations"]:
        unmet.append(f"locations {len(locations)}/{thresholds['min_unique_locations']}")
    if len(states) < thresholds["min_states"]:
        unmet.append(f"states {len(states)}/{thresholds['min_states']}")
    missing_regions = set(thresholds["required_census_regions"]) - regions
    if missing_regions:
        unmet.append("missing regions " + ", ".join(sorted(missing_regions)))
    for provider_type in PROVIDER_TYPES:
        if types[provider_type] < thresholds["min_locations_per_provider_type"]:
            unmet.append(
                f"{provider_type} locations {types[provider_type]}/"
                f"{thresholds['min_locations_per_provider_type']}"
            )
    if locations and chain_counts:
        top_chain, top_count = chain_counts.most_common(1)[0]
        share = top_count / len(locations)
        if share > thresholds["max_single_chain_share"]:
            unmet.append(
                f"top chain share {top_chain} {share:.1%}/"
                f"{thresholds['max_single_chain_share']:.0%} max"
            )
    if official_share < thresholds["required_official_source_share"]:
        unmet.append(f"official source share {official_share:.1%}/100%")
    if fresh_share < thresholds["required_fresh_source_share"]:
        unmet.append(
            f"fresh source share {fresh_share:.1%}/"
            f"{thresholds['required_fresh_source_share']:.0%}"
        )

    if data["publication_status"] == "published_index" and unmet:
        errors.append("published_index does not clear national gates: " + "; ".join(unmet))
    if data["publication_status"] != "published_index" and data.get("national_headline") is not None:
        errors.append("pilot must not contain a national_headline")

    page = PAGE.read_text().lower()
    if "pilot status — not a national average" not in page:
        errors.append("cost page is missing the prominent pilot status")
    if "there is not yet a defensible national swim-lesson average" not in page:
        errors.append("cost page is missing the no-average statement")
    banned = ["group swim lessons typically cost", "private lessons average", "quick cost summary"]
    for phrase in banned:
        if phrase in page:
            errors.append(f"cost page retains unsupported legacy phrase: {phrase!r}")

    notes.append(
        f"pilot coverage: {len(rows)} observations, {len(locations)} unique locations, "
        f"{len(states)} states, {len(regions)} regions"
    )
    notes.append("national headline withheld; unmet gates: " + "; ".join(unmet))
    return errors, notes


def main() -> int:
    errors, notes = validate()
    for note in notes:
        print(f"INFO: {note}")
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    builder = ROOT / "tools/wwk-price-index/build_cost_page.py"
    result = subprocess.run([sys.executable, str(builder), "--check"], cwd=ROOT)
    if result.returncode:
        return result.returncode
    print("OK: price-index data, publication gates, and public page are consistent")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

