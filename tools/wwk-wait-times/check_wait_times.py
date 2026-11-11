#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def main() -> None:
    data = json.loads((ROOT / "assets/data/wait-times/pilot.json").read_text(encoding="utf-8"))
    page = (ROOT / "wait-times/index.html").read_text(encoding="utf-8")
    errors: list[str] = []
    gates = data["publication_gates"]
    if data["status"] == "collection_open_no_statistics" and data["observations"]:
        errors.append("collection status says zero-statistics phase but observations are present")
    if gates["minimum_current_observations_per_market"] < 30:
        errors.append("market minimum dropped below 30")
    if gates["maximum_observation_age_days"] > 45:
        errors.append("freshness window exceeds 45 days")
    if gates["maximum_single_provider_share"] > 0.30:
        errors.append("provider concentration gate exceeds 30%")
    for required in ("No wait-time statistic is publishable yet", "Parent report—needs corroboration", "Do not submit student names", "publishes no ranking at all"):
        if required not in page:
            errors.append(f"wait-time page missing guardrail: {required}")
    if errors:
        raise SystemExit("Wait-time pilot failed:\n- " + "\n- ".join(errors))
    print("WWK wait-time pilot passed: collection is open, zero statistics are published, and freshness, concentration, review and privacy gates are active.")


if __name__ == "__main__":
    main()
