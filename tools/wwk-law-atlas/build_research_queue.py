#!/usr/bin/env python3
"""Build the 50-state-plus-DC law-atlas research queue."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ATLAS = ROOT / "assets/data/law-atlas/v0.1.json"
OUTPUT = ROOT / "tools/wwk-law-atlas/research-queue.json"

JURISDICTIONS = [
    ("AL", "Alabama"), ("AK", "Alaska"), ("AZ", "Arizona"), ("AR", "Arkansas"),
    ("CA", "California"), ("CO", "Colorado"), ("CT", "Connecticut"), ("DE", "Delaware"),
    ("DC", "District of Columbia"), ("FL", "Florida"), ("GA", "Georgia"), ("HI", "Hawaii"),
    ("ID", "Idaho"), ("IL", "Illinois"), ("IN", "Indiana"), ("IA", "Iowa"),
    ("KS", "Kansas"), ("KY", "Kentucky"), ("LA", "Louisiana"), ("ME", "Maine"),
    ("MD", "Maryland"), ("MA", "Massachusetts"), ("MI", "Michigan"), ("MN", "Minnesota"),
    ("MS", "Mississippi"), ("MO", "Missouri"), ("MT", "Montana"), ("NE", "Nebraska"),
    ("NV", "Nevada"), ("NH", "New Hampshire"), ("NJ", "New Jersey"), ("NM", "New Mexico"),
    ("NY", "New York"), ("NC", "North Carolina"), ("ND", "North Dakota"), ("OH", "Ohio"),
    ("OK", "Oklahoma"), ("OR", "Oregon"), ("PA", "Pennsylvania"), ("RI", "Rhode Island"),
    ("SC", "South Carolina"), ("SD", "South Dakota"), ("TN", "Tennessee"), ("TX", "Texas"),
    ("UT", "Utah"), ("VT", "Vermont"), ("VA", "Virginia"), ("WA", "Washington"),
    ("WV", "West Virginia"), ("WI", "Wisconsin"), ("WY", "Wyoming"),
]

MODULES = [
    {
        "id": "residential_pool_barrier",
        "name": "Residential pool-barrier framework",
        "required_evidence": [
            "controlling statewide statute or adopted-code page",
            "effective date or current-code edition",
            "local-adoption and amendment caveat",
            "enforcing-agency path",
        ],
    },
    {
        "id": "child_life_jacket",
        "name": "Child life-jacket wear rule",
        "required_evidence": [
            "state boating authority or codified statute",
            "child age threshold",
            "vessel and water applicability",
            "exceptions and effective date",
        ],
    },
    {
        "id": "lifeguard_requirements",
        "name": "Public-pool lifeguard requirements",
        "required_evidence": [
            "state health or administrative-code source",
            "facility types covered",
            "staffing or exemption rule",
            "local-enforcement caveat",
        ],
    },
    {
        "id": "school_swim_cpr_mandates",
        "name": "School swim or CPR education mandate",
        "required_evidence": [
            "state education statute or agency rule",
            "grade or student population covered",
            "swim, water-safety, or CPR requirement scope",
            "implementation date and exceptions",
        ],
    },
]


def build() -> dict:
    atlas = json.loads(ATLAS.read_text(encoding="utf-8"))
    published = {item["code"]: item for item in atlas["jurisdictions"]}
    tasks = []
    for code, name in JURISDICTIONS:
        existing = published.get(code, {})
        existing_modules = existing.get("modules", {})
        for module in MODULES:
            public_module = existing_modules.get(module["id"])
            is_published = bool(
                public_module
                and module["id"] == "residential_pool_barrier"
                and public_module.get("status") in {"verified", "verified_framework"}
            )
            tasks.append(
                {
                    "task_id": f"{code.lower()}-{module['id'].replace('_', '-')}",
                    "jurisdiction_code": code,
                    "jurisdiction_name": name,
                    "module_id": module["id"],
                    "module_name": module["name"],
                    "public_status": "published_verified" if is_published else "not_published",
                    "research_status": "source_checked_and_published" if is_published else "queued",
                    "official_source_url": public_module["source_url"] if is_published else None,
                    "official_source_title": public_module["source_title"] if is_published else None,
                    "source_checked_on": public_module["source_checked_on"] if is_published else None,
                    "source_candidates": [],
                    "required_evidence": module["required_evidence"],
                    "independent_second_review": "release_complete" if is_published else "not_started",
                    "publishable_claim": None,
                    "notes": (
                        "Published source is inherited from the verified pilot; future rechecks remain required."
                        if is_published
                        else "No legal claim or source has been selected. Research must begin with current official government material."
                    ),
                }
            )

    published_count = sum(task["public_status"] == "published_verified" for task in tasks)
    return {
        "schema_version": "1.0.0",
        "queue_id": "law-atlas-51-jurisdiction-v1",
        "created_on": atlas["last_verified"],
        "publication_status": "internal_research_queue",
        "scope": {
            "jurisdictions": len(JURISDICTIONS),
            "modules_per_jurisdiction": len(MODULES),
            "total_tasks": len(tasks),
            "published_verified_tasks": published_count,
            "queued_tasks": len(tasks) - published_count,
        },
        "rules": [
            "The queue is not legal guidance and contains no new publishable legal claim.",
            "Only current official government sources may support a module.",
            "A researcher records the exact controlling text, effective date, applicability, exceptions, and local caveat.",
            "A different reviewer must compare the draft summary with every cited source before publication.",
            "No jurisdiction or module is added to the public atlas merely because its task exists or a source candidate was found.",
        ],
        "tasks": tasks,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    rendered = json.dumps(build(), indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != rendered:
            print(f"STALE: {OUTPUT.relative_to(ROOT)}")
            return 1
        print("PASS: 51-jurisdiction law research queue is reproducible")
        return 0
    OUTPUT.write_text(rendered, encoding="utf-8")
    print(f"WROTE: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
