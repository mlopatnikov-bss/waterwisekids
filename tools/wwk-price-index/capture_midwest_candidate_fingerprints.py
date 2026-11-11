#!/usr/bin/env python3
"""Capture point-in-time hashes for the internal Midwest candidate sources."""

from __future__ import annotations

import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "tools/wwk-price-index/midwest-candidate-batch-2026-11-11.json"
OUTPUT = ROOT / "tools/wwk-price-index/midwest-candidate-source-fingerprints.json"


def main() -> int:
    data = json.loads(DATA.read_text())
    urls = {
        source["url"]
        for candidate in data["candidates"]
        for source in candidate["source_evidence"]
    }
    entries = []
    for url in sorted(urls):
        response = subprocess.run(
            ["curl", "--http1.1", "-L", "-sS", "--fail", "--max-time", "45", url],
            check=True,
            capture_output=True,
        )
        content = response.stdout
        entries.append(
            {
                "url": url,
                "http_status": 200,
                "content_length_bytes": len(content),
                "sha256": hashlib.sha256(content).hexdigest(),
            }
        )

    payload = {
        "schema_version": "1.0.0",
        "purpose": "Point-in-time change detection for internal candidates; source content is not republished.",
        "retrieved_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "batch_as_of": data["as_of"],
        "entries": entries,
    }
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"WROTE: {OUTPUT.relative_to(ROOT)} ({len(entries)} official sources)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
