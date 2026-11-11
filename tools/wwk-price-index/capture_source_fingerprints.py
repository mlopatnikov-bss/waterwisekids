#!/usr/bin/env python3
"""Record a non-republishing fingerprint of every official pilot source."""

from __future__ import annotations

import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "assets/data/price-index/pilot-observations.json"
OUTPUT = ROOT / "tools/wwk-price-index/source-fingerprints.json"


def main() -> int:
    data = json.loads(DATA.read_text())
    urls: set[str] = set()
    for row in data["observations"]:
        urls.add(row["source_url"])
        urls.update(row.get("supporting_source_urls", []))

    entries = []
    for url in sorted(urls):
        response = subprocess.run(
            [
                "curl", "--http1.1", "-L", "-sS", "--fail", "--max-time", "30", url,
            ],
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
        "purpose": "Point-in-time change-detection fingerprints; third-party source content is not republished.",
        "retrieved_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "dataset_as_of": data["as_of"],
        "entries": entries,
    }
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"WROTE: {OUTPUT.relative_to(ROOT)} ({len(entries)} official sources)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

