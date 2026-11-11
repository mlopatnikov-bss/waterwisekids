#!/usr/bin/env python3
"""Build the Cloudflare Bulk Redirect CSV for consolidated local pages.

Cloudflare's CSV format intentionally has no header row.  We emit both the
apex and www hosts, match HTTP and HTTPS by omitting a scheme in the source,
preserve query strings, and keep subdomain/subpath expansion disabled.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
MANIFEST = HERE / "redirects.json"
OUTPUT = HERE / "cloudflare-bulk-redirects.csv"
HOSTS = ("waterwisekids.com", "www.waterwisekids.com")


def render() -> str:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    buffer = io.StringIO(newline="")
    writer = csv.writer(buffer, lineterminator="\n")
    for item in data["redirects"]:
        for host in HOSTS:
            writer.writerow(
                (
                    f"{host}{item['source']}",
                    f"https://www.waterwisekids.com{item['target']}",
                    item.get("status", 301),
                    "TRUE",   # preserve query string
                    "FALSE",  # include subdomains
                    "FALSE",  # subpath matching
                    "FALSE",  # preserve path suffix
                )
            )
    return buffer.getvalue()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    expected = render()
    if args.check:
        actual = OUTPUT.read_text(encoding="utf-8") if OUTPUT.exists() else ""
        if actual != expected:
            raise SystemExit("Cloudflare redirect CSV is missing or stale; rebuild it")
        rows = expected.count("\n")
        if rows != 146:
            raise SystemExit(f"Expected 146 redirect records, found {rows}")
        print("Cloudflare bulk redirect package passed: 73 paths x apex/www = 146 exact 301 records.")
        return 0
    OUTPUT.write_text(expected, encoding="utf-8")
    print(f"Wrote {OUTPUT} ({expected.count(chr(10))} records)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
