#!/usr/bin/env python3
"""Fail closed if the internal collection queue can be mistaken for price data."""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
QUEUE = ROOT / "tools/wwk-price-index/collection-queue.json"
ALLOWED_TYPES = {"chain", "independent", "municipal", "nonprofit_ymca"}
ALLOWED_REGIONS = {"Northeast", "Midwest", "South", "West"}


def validate() -> list[str]:
    data = json.loads(QUEUE.read_text(encoding="utf-8"))
    errors: list[str] = []
    tasks = data.get("tasks", [])
    if data.get("queue_status") != "internal_research_backlog_not_public_price_data":
        errors.append("queue status must explicitly say this is not public price data")
    if len(tasks) != data.get("target_task_count") or len(tasks) != 200:
        errors.append(f"expected exactly 200 research tasks, found {len(tasks)}")
    ids = [task.get("task_id") for task in tasks]
    if len(ids) != len(set(ids)):
        errors.append("task ids are not unique")

    type_counts = Counter(task.get("provider_type_target") for task in tasks)
    region_counts = Counter(task.get("census_region_target") for task in tasks)
    if type_counts != Counter({provider_type: 50 for provider_type in ALLOWED_TYPES}):
        errors.append(f"provider-type plan is unbalanced: {dict(type_counts)}")
    if region_counts != Counter({region: 50 for region in ALLOWED_REGIONS}):
        errors.append(f"region plan is unbalanced: {dict(region_counts)}")

    for task in tasks:
        label = task.get("task_id", "missing-id")
        if task.get("review_status") != "queued":
            errors.append(f"{label}: queue item cannot be marked reviewed")
        if task.get("pricing_source_status") != "not_reviewed":
            errors.append(f"{label}: queue item cannot be marked source-checked")
        if task.get("pricing_source_url") is not None or task.get("source_checked_on") is not None:
            errors.append(f"{label}: unreviewed queue item contains price evidence")
        directory_url = task.get("directory_website_url")
        if directory_url:
            parsed = urlparse(directory_url)
            if parsed.scheme != "https" or not parsed.netloc:
                errors.append(f"{label}: directory website must be HTTPS")
        if task.get("task_type") == "provider_discovery":
            if any(task.get(field) is not None for field in ("provider_name", "chain", "city", "postal_code")):
                errors.append(f"{label}: discovery slot invents provider identity")
        elif task.get("task_type") == "directory_candidate_review":
            if not task.get("provider_name") or not task.get("state_target"):
                errors.append(f"{label}: directory candidate lacks an identity")
        else:
            errors.append(f"{label}: unknown task type")
    return errors


def main() -> int:
    errors = validate()
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print("PASS: 200-task queue is balanced and contains no claimed price evidence")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
