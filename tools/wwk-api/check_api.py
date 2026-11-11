#!/usr/bin/env python3
"""Validate generated API data and core read-only MCP guardrails."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUILDER = ROOT / "tools/wwk-api/build_api.py"
SERVER = ROOT / "mcp-server/wwk_server.py"
REMOTE = ROOT / "mcp-server/remote"


def call(name: str, arguments: dict) -> dict:
    result = subprocess.run([sys.executable, str(SERVER), "--call", name, "--arguments", json.dumps(arguments)], cwd=ROOT, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr or result.stdout)
    return json.loads(result.stdout)


def main() -> int:
    errors: list[str] = []
    result = subprocess.run([sys.executable, str(BUILDER), "--check"], cwd=ROOT, capture_output=True, text=True)
    if result.returncode:
        errors.append((result.stderr or result.stdout).strip())
    catalog = json.loads((ROOT / "assets/data/api/v1/catalog.json").read_text(encoding="utf-8"))
    schools = json.loads((ROOT / "assets/data/api/v1/schools.json").read_text(encoding="utf-8"))
    if schools.get("count") != 799 or len(schools.get("records", [])) != 799:
        errors.append("public schools API count drifted from the directory")
    if catalog.get("mcp", {}).get("hosted_status") != "not_publicly_hosted":
        errors.append("catalog must not claim a hosted MCP endpoint")
    package = json.loads((REMOTE / "package.json").read_text(encoding="utf-8"))
    expected_pins = {
        "agents": "0.33.0",
        "@modelcontextprotocol/server": "2.4.0",
        "zod": "4.6.7",
    }
    for dependency, version in expected_pins.items():
        if package.get("dependencies", {}).get(dependency) != version:
            errors.append(f"remote MCP dependency is not pinned: {dependency}={version}")
    config = json.loads((REMOTE / "wrangler.jsonc").read_text(encoding="utf-8"))
    if config.get("workers_dev") is not False or config.get("preview_urls") is not False:
        errors.append("remote MCP candidate must not expose an unreviewed workers.dev or preview URL")
    if config.get("vars", {}).get("RUNTIME_ENV") != "candidate":
        errors.append("remote MCP configuration must remain in candidate mode before release")
    if not any(item.get("name") == "MCP_RATE_LIMITER" for item in config.get("ratelimits", [])):
        errors.append("remote MCP candidate is missing its rate-limit binding")
    remote_core = (REMOTE / "src/core.mjs").read_text(encoding="utf-8")
    remote_worker = (REMOTE / "src/index.mjs").read_text(encoding="utf-8")
    for phrase in (
        'benchmark_status: "not_publishable"',
        "must assess the swimmer",
        "state_module_not_yet_published",
        "VTL Holding LLC",
        "British Swim School franchises",
    ):
        if phrase not in remote_core:
            errors.append(f"remote MCP core is missing guardrail: {phrase}")
    for phrase in ("MAX_BODY_BYTES", "MCP_RATE_LIMITER", "allowedOriginHostnames", "host_not_allowed"):
        if phrase not in remote_worker:
            errors.append(f"remote MCP transport is missing boundary: {phrase}")
    price = call("get_price_benchmark", {"state": "NJ"})
    if price.get("benchmark_status") != "not_publishable":
        errors.append("MCP price tool published a premature benchmark")
    law = call("get_state_laws", {"state": "TX"})
    if law.get("status") != "state_module_not_yet_published":
        errors.append("MCP law tool did not preserve unpublished status")
    crosswalk = call("translate_level", {"chain": "aqua-tots", "level": "at-5"})
    if "must assess" not in crosswalk.get("required_next_step", ""):
        errors.append("MCP crosswalk omitted required assessment")
    finder = call("find_swim_schools", {"zip": "08723", "age": 4, "indoor": True, "radius_miles": 30})
    if finder.get("status") != "ok" or "not a complete" not in finder.get("limitation", ""):
        errors.append("MCP finder omitted directory completeness limitation")
    page = (ROOT / "api/index.html").read_text(encoding="utf-8")
    for phrase in ("publicly hosted MCP transport", "no national or state benchmark is publishable", "not a complete market census"):
        if phrase not in page:
            errors.append(f"API documentation missing limitation: {phrase}")
    if errors:
        print(f"WWK API/MCP FAILED ({len(errors)} issue(s))", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print("WWK API/MCP passed: 799 public records; local reference and hosted candidate preserve publication guardrails.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
