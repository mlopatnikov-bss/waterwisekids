#!/usr/bin/env python3
"""Fingerprint official sources for the pilot-state life-jacket candidate batch."""

from __future__ import annotations

import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "tools/wwk-law-atlas/life-jacket-candidate-batch-2026-11-11.json"
OUTPUT = ROOT / "tools/wwk-law-atlas/life-jacket-candidate-source-fingerprints.json"


def main() -> int:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    urls = sorted({source["url"] for candidate in data["candidates"] for source in candidate["sources"]})
    entries = []
    for url in urls:
        response = subprocess.run(
            ["curl", "--http1.1", "-L", "-sS", "--fail", "--max-time", "45", url],
            check=True,
            capture_output=True,
        )
        entries.append(
            {
                "url": url,
                "http_status": 200,
                "content_length_bytes": len(response.stdout),
                "sha256": hashlib.sha256(response.stdout).hexdigest(),
            }
        )
    payload = {
        "schema_version": "1.0.0",
        "retrieved_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "batch_as_of": data["as_of"],
        "purpose": "Change-detection fingerprints only; third-party legal source text is not republished.",
        "entries": entries,
    }
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"WROTE: {OUTPUT.relative_to(ROOT)} ({len(entries)} official sources)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
