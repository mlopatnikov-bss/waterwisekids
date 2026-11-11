#!/usr/bin/env python3
"""Build exact-revision packets for WWK's independent reviewers."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def price_packet() -> str:
    batch_path = ROOT / "tools/wwk-price-index/midwest-candidate-batch-2026-11-11.json"
    fingerprint_path = ROOT / "tools/wwk-price-index/midwest-candidate-source-fingerprints.json"
    batch = load(batch_path)
    ready = [row for row in batch["candidates"] if row["promotion_status"] == "ready_for_independent_second_review"]
    lines = [
        "# Independent review packet — Midwest price candidates",
        "",
        "This packet is for a reviewer who did not perform the first review. It does not authorize publication.",
        "",
        "## Exact revision",
        "",
        f"- Candidate batch SHA-256: `{sha256(batch_path)}`",
        f"- Source-fingerprint file SHA-256: `{sha256(fingerprint_path)}`",
        f"- Review-ready candidates: {len(ready)}",
        "",
        "If either hash differs, stop and request a rebuilt packet.",
        "",
        "## Reviewer declaration",
        "",
        "Record your full name, role/organization, review date, and conflicts. Confirm that you opened every official source independently and did not rely on the candidate summary as evidence.",
        "",
        "For each candidate choose exactly one decision: `approve`, `changes_requested`, `source_unavailable`, or `outside_scope`. Approval means the location, product format, price, duration, ratio, fees, qualifier, and normalization all match the official source. A reviewer must never infer an unstated field.",
        "",
        "## Candidates",
        "",
    ]
    for candidate in ready:
        observation = candidate["observation"]
        lines.extend([
            f"### `{candidate['candidate_id']}`",
            "",
            f"- Provider/location: {observation['provider_name']} — {observation['location_name']}, {observation['state']}",
            f"- Product: {observation['class_format']}; {observation['duration_minutes']} minutes; ratio max {observation.get('ratio_max', 'not stated')}",
            f"- Listed price: ${observation['listed_price_usd']:.2f}; normalized per 30 minutes: ${observation['normalized_per_30_minutes_usd']:.2f}",
            f"- Qualifier: {observation['price_qualifier']}; required fee: ${observation['mandatory_fee_usd']:.2f} ({observation['mandatory_fee_label']})",
            f"- Source checked: {observation['source_checked_on']}",
        ])
        for source in candidate["source_evidence"]:
            lines.append(f"- Official source: {source['url']}")
            lines.append(f"- First-review anchor: {source['anchor_note']}")
        lines.extend([
            "- Decision: ____________________",
            "- Corrections/evidence notes: ____________________",
            "",
        ])
    lines.extend([
        "## Batch outcome",
        "",
        "The reviewer must record a decision for every candidate. One approval does not approve the batch. Promotion remains a separate, reviewed code change that re-runs the Price Index guard.",
        "",
    ])
    return "\n".join(lines)


def law_packet() -> str:
    batch_path = ROOT / "tools/wwk-law-atlas/life-jacket-candidate-batch-2026-11-11.json"
    fingerprint_path = ROOT / "tools/wwk-law-atlas/life-jacket-candidate-source-fingerprints.json"
    batch = load(batch_path)
    lines = [
        "# Independent review packet — pilot-state child life-jacket rules",
        "",
        "This packet is for a second reviewer who did not draft the summaries. It is not legal advice and does not authorize publication.",
        "",
        "## Exact revision",
        "",
        f"- Candidate batch SHA-256: `{sha256(batch_path)}`",
        f"- Source-fingerprint file SHA-256: `{sha256(fingerprint_path)}`",
        f"- Candidate expiration: {batch['expires_on']}",
        "",
        "If either hash differs or the expiration date has passed, stop and request fresh research.",
        "",
        "## Reviewer declaration",
        "",
        "Record your full name, role/organization, review date, and conflicts. Confirm that you opened every cited government source independently. For each jurisdiction choose `approve`, `changes_requested`, `source_unavailable`, or `outside_scope`.",
        "",
        "Approval requires confirming the controlling authority, currency/effective date, child age, vessel type/length, covered waters, underway condition, definitions, exceptions, and any local or seasonal rule that would make the summary misleading.",
        "",
        "## Candidates",
        "",
    ]
    for candidate in batch["candidates"]:
        lines.extend([
            f"### {candidate['jurisdiction_name']} — `{candidate['candidate_id']}`",
            "",
            f"> {candidate['draft_plain_language']}",
            "",
        ])
        for key, value in candidate["scope"].items():
            lines.append(f"- {key.replace('_', ' ').title()}: {value}")
        for source in candidate["sources"]:
            lines.append(f"- Government source ({source['role']}): {source['url']}")
            lines.append(f"- First-review anchor: {source['anchor_note']}")
        lines.extend([
            "- Decision: ____________________",
            "- Corrections/evidence notes: ____________________",
            "",
        ])
    lines.extend([
        "## Batch outcome",
        "",
        "All three decisions and any required corrections must be recorded. Publication remains a separate code change; the public atlas guard must pass after that change.",
        "",
    ])
    return "\n".join(lines)


OUTPUTS = {
    "price-midwest-review-packet.md": price_packet,
    "law-life-jacket-review-packet.md": law_packet,
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    stale: list[str] = []
    for name, builder in OUTPUTS.items():
        path = OUT / name
        rendered = builder()
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != rendered:
                stale.append(name)
        else:
            path.write_text(rendered, encoding="utf-8")
            print(f"WROTE: {path.relative_to(ROOT)}")
    if stale:
        print("STALE: " + ", ".join(stale))
        return 1
    print(f"OK: {len(OUTPUTS)} independent-review packets match their exact source revisions")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
