#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
QUEUE = Path(__file__).with_name("translation-queue.json")


def main() -> None:
    data = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = data["items"]
    errors: list[str] = []
    if len(rows) != 40:
        errors.append(f"expected 40 priority pages, found {len(rows)}")
    if sorted(row["priority"] for row in rows) != list(range(1, 41)):
        errors.append("priorities must be unique and contiguous")
    for row in rows:
        source = ROOT / row["source"].lstrip("/")
        if not source.exists():
            errors.append(f"missing English source: {row['source']}")
        if row["status"] == "publish_ready":
            for field in ("spanish_path", "native_reviewer", "reviewed_at", "source_sha256", "translation_sha256"):
                if not row.get(field):
                    errors.append(f"publish-ready item {row['source']} missing {field}")
        elif row["status"] not in {"queued", "draft", "in_native_review", "blocked", "publish_ready"}:
            errors.append(f"invalid status for {row['source']}: {row['status']}")
    if errors:
        raise SystemExit("Spanish translation gate failed:\n- " + "\n- ".join(errors))
    print("WWK Spanish gate passed: 40 priority sources exist; no page can become publish-ready without named native review and pinned hashes.")


if __name__ == "__main__":
    main()
