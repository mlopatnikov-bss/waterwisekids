#!/usr/bin/env python3
"""Build a balanced, non-publishable price-research queue from directory evidence."""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCHOOLS = ROOT / "assets/data/api/v1/schools.json"
OUTPUT = ROOT / "tools/wwk-price-index/collection-queue.json"

REGIONS = ("Northeast", "Midwest", "South", "West")
PROVIDER_TYPES = ("chain", "independent", "municipal", "nonprofit_ymca")
STATE_REGION = {
    "CT": "Northeast", "ME": "Northeast", "MA": "Northeast", "NH": "Northeast",
    "RI": "Northeast", "VT": "Northeast", "NJ": "Northeast", "NY": "Northeast",
    "PA": "Northeast", "IN": "Midwest", "IL": "Midwest", "MI": "Midwest",
    "OH": "Midwest", "WI": "Midwest", "IA": "Midwest", "KS": "Midwest",
    "MN": "Midwest", "MO": "Midwest", "NE": "Midwest", "ND": "Midwest",
    "SD": "Midwest", "DE": "South", "DC": "South", "FL": "South",
    "GA": "South", "MD": "South", "NC": "South", "SC": "South",
    "VA": "South", "WV": "South", "AL": "South", "KY": "South",
    "MS": "South", "TN": "South", "AR": "South", "LA": "South",
    "OK": "South", "TX": "South", "AZ": "West", "CO": "West",
    "ID": "West", "MT": "West", "NV": "West", "NM": "West",
    "UT": "West", "WY": "West", "AK": "West", "CA": "West",
    "HI": "West", "OR": "West", "WA": "West",
}


def stable_id(prefix: str, *parts: str) -> str:
    value = "\x1f".join(parts).encode("utf-8")
    return f"{prefix}-{hashlib.sha256(value).hexdigest()[:12]}"


def classify(row: dict) -> str:
    chain = row.get("chain")
    if chain == "YMCA":
        return "nonprofit_ymca"
    if chain == "Independent":
        return "independent"
    return "chain"


def owner_conflict(row: dict) -> bool:
    website = (row.get("website") or "").casefold()
    return (
        row.get("chain") == "British Swim School"
        and ("/jersey-shore/" in website or "/northwest-philadelphia/" in website)
    )


def quotas() -> dict[tuple[str, str], int]:
    """Return a 200-task 4x4 plan with 50 tasks per type and per region."""
    output = {}
    for type_index, provider_type in enumerate(PROVIDER_TYPES):
        for region_index, region in enumerate(REGIONS):
            output[(provider_type, region)] = 13 if (type_index + region_index) % 4 in {0, 1} else 12
    return output


def choose(candidates: list[dict], count: int) -> list[dict]:
    """Prefer geographic and chain diversity without treating rows as price evidence."""
    remaining = list(candidates)
    selected: list[dict] = []
    state_counts: Counter[str] = Counter()
    chain_counts: Counter[str] = Counter()
    while remaining and len(selected) < count:
        remaining.sort(
            key=lambda row: (
                owner_conflict(row),
                state_counts[row["state"]],
                chain_counts[row.get("chain") or row["name"]],
                row["state"],
                row["name"],
                row.get("city") or "",
            )
        )
        row = remaining.pop(0)
        selected.append(row)
        state_counts[row["state"]] += 1
        chain_counts[row.get("chain") or row["name"]] += 1
    return selected


def build() -> dict:
    source = json.loads(SCHOOLS.read_text(encoding="utf-8"))
    pools: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for row in source["records"]:
        state = row.get("state")
        if state not in STATE_REGION:
            continue
        pools[(classify(row), STATE_REGION[state])].append(row)

    tasks: list[dict] = []
    target = quotas()
    for provider_type in PROVIDER_TYPES:
        for region in REGIONS:
            cell_target = target[(provider_type, region)]
            candidates = choose(pools[(provider_type, region)], cell_target)
            for row in candidates:
                conflict = owner_conflict(row)
                tasks.append(
                    {
                        "task_id": stable_id(
                            "candidate",
                            row["name"],
                            row.get("city") or "",
                            row["state"],
                            row.get("postal_code") or "",
                        ),
                        "task_type": "directory_candidate_review",
                        "provider_type_target": provider_type,
                        "census_region_target": region,
                        "state_target": row["state"],
                        "provider_name": row["name"],
                        "chain": row.get("chain"),
                        "city": row.get("city"),
                        "postal_code": row.get("postal_code"),
                        "directory_website_url": row.get("website"),
                        "directory_record_scope": row.get("record_scope"),
                        "classification_status": "provisional_directory_label",
                        "pricing_source_status": "not_reviewed",
                        "pricing_source_url": None,
                        "source_checked_on": None,
                        "review_status": "queued",
                        "conflict_of_interest": conflict,
                        "priority_note": (
                            "Owner-associated location: exclude from the first published release unless "
                            "independently reviewed and explicitly disclosed."
                            if conflict
                            else "Locate and verify a current official provider or government price page."
                        ),
                    }
                )
            for slot in range(cell_target - len(candidates)):
                tasks.append(
                    {
                        "task_id": stable_id("discovery", provider_type, region, str(slot + 1)),
                        "task_type": "provider_discovery",
                        "provider_type_target": provider_type,
                        "census_region_target": region,
                        "state_target": None,
                        "provider_name": None,
                        "chain": None,
                        "city": None,
                        "postal_code": None,
                        "directory_website_url": None,
                        "directory_record_scope": None,
                        "classification_status": "provider_not_yet_identified",
                        "pricing_source_status": "not_reviewed",
                        "pricing_source_url": None,
                        "source_checked_on": None,
                        "review_status": "queued",
                        "conflict_of_interest": False,
                        "priority_note": (
                            f"Find one real {provider_type} location in the {region} from an official "
                            "provider or government page; do not use snippets, directories, or aggregators as price evidence."
                        ),
                    }
                )

    type_counts = Counter(task["provider_type_target"] for task in tasks)
    region_counts = Counter(task["census_region_target"] for task in tasks)
    known_counts = Counter(
        task["provider_type_target"]
        for task in tasks
        if task["task_type"] == "directory_candidate_review"
    )
    discovery_counts = Counter(
        task["provider_type_target"] for task in tasks if task["task_type"] == "provider_discovery"
    )
    return {
        "schema_version": "1.0",
        "queue_status": "internal_research_backlog_not_public_price_data",
        "generated_from": "assets/data/api/v1/schools.json",
        "source_directory_generated_on": source.get("generated_on"),
        "target_task_count": 200,
        "rules": [
            "A queue item is not a price observation and must never be published as one.",
            "Only an official provider or government page can become pricing_source_url.",
            "Search snippets, directories, review sites, social posts, and inferred prices are ineligible.",
            "A second reviewer and a source fingerprint are required before an observation can enter a release.",
            "Owner-associated locations are excluded from the first release unless independently reviewed and disclosed.",
        ],
        "design": {
            "tasks_per_provider_type": dict(sorted(type_counts.items())),
            "tasks_per_census_region": dict(sorted(region_counts.items())),
            "known_directory_candidates_per_provider_type": dict(sorted(known_counts.items())),
            "provider_discovery_slots_per_provider_type": dict(sorted(discovery_counts.items())),
            "note": (
                "The current directory cannot fill municipal or nonprofit/YMCA sampling strata. "
                "Unfilled cells are explicit provider-discovery work, not fabricated records."
            ),
        },
        "tasks": sorted(
            tasks,
            key=lambda task: (
                task["provider_type_target"],
                task["census_region_target"],
                task["task_type"],
                task["state_target"] or "",
                task["provider_name"] or "",
                task["task_id"],
            ),
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if the generated queue differs from disk")
    args = parser.parse_args()
    content = json.dumps(build(), indent=2, ensure_ascii=False) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content:
            print("ERROR: collection queue is missing or stale")
            return 1
        print("PASS: collection queue is reproducible")
        return 0
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"WROTE: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
