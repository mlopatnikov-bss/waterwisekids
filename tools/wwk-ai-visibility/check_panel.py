#!/usr/bin/env python3
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


HERE = Path(__file__).resolve().parent


def main() -> None:
    data = json.loads((HERE / "panel-v1.json").read_text(encoding="utf-8"))
    rows = data["prompts"]
    errors: list[str] = []
    if len(rows) != 100:
        errors.append(f"expected 100 prompts, found {len(rows)}")
    if len(data["platforms"]) != 6:
        errors.append("expected six platforms")
    ids = [row["prompt_id"] for row in rows]
    if len(ids) != len(set(ids)):
        errors.append("duplicate prompt IDs")
    if Counter(row["locale"] for row in rows)["es-US"] != 10:
        errors.append("expected 10 Spanish prompts")
    if any("WaterWiseKids" in row["prompt"] for row in rows):
        errors.append("brand-seeded prompt would bias mention measurement")
    header = (HERE / "weekly-results-template.csv").read_text(encoding="utf-8").splitlines()[0]
    for required in ("wwk_cited", "wwk_mentioned", "wwk_number_used", "evidence_path"):
        if required not in header:
            errors.append(f"results template missing {required}")
    if errors:
        raise SystemExit("AI visibility panel failed:\n- " + "\n- ".join(errors))
    print("WWK AI visibility panel passed: 100 unbiased prompts, 10 Spanish variants, six platforms, evidence fields present.")


if __name__ == "__main__":
    main()
