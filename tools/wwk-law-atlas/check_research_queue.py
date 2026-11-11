#!/usr/bin/env python3
"""Validate that the national law-atlas queue is complete and non-publishable."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
QUEUE = ROOT / "tools/wwk-law-atlas/research-queue.json"
ATLAS = ROOT / "assets/data/law-atlas/v0.1.json"
BUILDER = ROOT / "tools/wwk-law-atlas/build_research_queue.py"
MODULES = {
    "residential_pool_barrier",
    "child_life_jacket",
    "lifeguard_requirements",
    "school_swim_cpr_mandates",
}


def load_unique(path: Path) -> dict:
    def reject_duplicates(pairs):
        output = {}
        for key, value in pairs:
            if key in output:
                raise ValueError(f"duplicate JSON key: {key}")
            output[key] = value
        return output

    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=reject_duplicates)


def main() -> int:
    errors: list[str] = []
    queue = load_unique(QUEUE)
    atlas = load_unique(ATLAS)
    result = subprocess.run(
        [sys.executable, str(BUILDER), "--check"],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode:
        errors.append((result.stderr or result.stdout).strip())

    if queue.get("publication_status") != "internal_research_queue":
        errors.append("queue must remain internal_research_queue")
    tasks = queue.get("tasks", [])
    if len(tasks) != 204:
        errors.append(f"expected 204 tasks, found {len(tasks)}")
    ids = [task.get("task_id") for task in tasks]
    if len(set(ids)) != len(ids):
        errors.append("duplicate task id")

    by_jurisdiction: dict[str, set[str]] = {}
    for task in tasks:
        code = task.get("jurisdiction_code")
        by_jurisdiction.setdefault(code, set()).add(task.get("module_id"))
        if task.get("module_id") not in MODULES:
            errors.append(f"{task.get('task_id')}: unknown module")
        if not task.get("required_evidence"):
            errors.append(f"{task.get('task_id')}: missing evidence checklist")
        status = task.get("public_status")
        if status == "not_published":
            if task.get("research_status") != "queued":
                errors.append(f"{task.get('task_id')}: unpublished task is not queued")
            if any(
                task.get(field) is not None
                for field in ("official_source_url", "official_source_title", "source_checked_on", "publishable_claim")
            ):
                errors.append(f"{task.get('task_id')}: queued task claims unreviewed evidence")
            if task.get("source_candidates") != []:
                errors.append(f"{task.get('task_id')}: generated queue must not invent source candidates")
            if task.get("independent_second_review") != "not_started":
                errors.append(f"{task.get('task_id')}: queued task claims review completion")
        elif status == "published_verified":
            if task.get("module_id") != "residential_pool_barrier":
                errors.append(f"{task.get('task_id')}: only pilot pool modules may be inherited")
            parsed = urlparse(task.get("official_source_url", ""))
            if parsed.scheme != "https" or not parsed.netloc:
                errors.append(f"{task.get('task_id')}: published source is not HTTPS")
            if task.get("research_status") != "source_checked_and_published":
                errors.append(f"{task.get('task_id')}: inherited public status mismatch")
            if task.get("independent_second_review") != "release_complete":
                errors.append(f"{task.get('task_id')}: inherited module review status mismatch")
        else:
            errors.append(f"{task.get('task_id')}: invalid public status")

    if len(by_jurisdiction) != 51:
        errors.append(f"expected 51 jurisdictions, found {len(by_jurisdiction)}")
    for code, module_ids in by_jurisdiction.items():
        if module_ids != MODULES:
            errors.append(f"{code}: module set is incomplete")

    inherited = {
        (task["jurisdiction_code"], task["module_id"], task["official_source_url"])
        for task in tasks
        if task.get("public_status") == "published_verified"
    }
    expected = {
        (item["code"], "residential_pool_barrier", item["modules"]["residential_pool_barrier"]["source_url"])
        for item in atlas["jurisdictions"]
    }
    if inherited != expected:
        errors.append("inherited published tasks do not exactly match the public pilot")

    scope = queue.get("scope", {})
    counts = {
        "jurisdictions": len(by_jurisdiction),
        "modules_per_jurisdiction": len(MODULES),
        "total_tasks": len(tasks),
        "published_verified_tasks": len(inherited),
        "queued_tasks": sum(task.get("public_status") == "not_published" for task in tasks),
    }
    if scope != counts:
        errors.append(f"scope counts drift: expected {counts}, found {scope}")

    if errors:
        print(f"WWK law research queue FAILED ({len(errors)} issue(s))", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print("PASS: law research queue covers 51 jurisdictions x 4 modules; 201 tasks remain claim-free and queued")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
