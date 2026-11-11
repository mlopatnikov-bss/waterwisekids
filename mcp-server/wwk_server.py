#!/usr/bin/env python3
"""Dependency-free, read-only MCP stdio server for WaterWiseKids public data."""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "assets/data"


def load(path: str):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def zip_points() -> dict[str, tuple[float, float]]:
    raw = load("assets/data/wwk-zip-points.json")
    output = {}
    for row in raw["z"]:
        zipcode, lat, lon, *_ = row.split(",")
        output[zipcode] = (float(lat), float(lon))
    return output


def haversine_miles(a, b) -> float:
    lat1, lon1 = map(math.radians, a)
    lat2, lon2 = map(math.radians, b)
    dlat, dlon = lat2 - lat1, lon2 - lon1
    value = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 3958.8 * 2 * math.asin(math.sqrt(value))


def age_program(value) -> Optional[str]:
    if value is None or value == "":
        return None
    try:
        age = float(value)
    except (TypeError, ValueError):
        normalized = str(value).strip().casefold().replace("_", "-")
        aliases = {"baby": "infant", "child": "school-age", "kid": "school-age", "kids": "school-age", "school age": "school-age"}
        return aliases.get(normalized, normalized)
    if age < 1:
        return "infant"
    if age < 3:
        return "toddler"
    if age < 6:
        return "preschool"
    if age < 18:
        return "school-age"
    return "adult"


def find_swim_schools(args: dict) -> dict:
    zipcode = str(args.get("zip", "")).strip()
    if len(zipcode) != 5 or not zipcode.isdigit():
        raise ValueError("zip must be a five-digit U.S. ZIP code")
    radius = min(max(float(args.get("radius_miles", 25)), 1), 100)
    points = zip_points()
    if zipcode not in points:
        return {"status": "zip_not_in_census_zcta_file", "zip": zipcode, "results": []}
    program = age_program(args.get("age"))
    indoor = args.get("indoor")
    schools = load("assets/data/api/v1/schools.json")
    results = []
    for school in schools["records"]:
        school_zip = school.get("postal_code")
        if not school_zip or school_zip not in points:
            continue
        if program and program not in school.get("programs", []):
            continue
        if indoor is True and school.get("indoor") is not True:
            continue
        if indoor is False and school.get("indoor") is not False:
            continue
        distance = haversine_miles(points[zipcode], points[school_zip])
        if distance <= radius:
            item = dict(school)
            item["approximate_distance_miles"] = round(distance, 1)
            results.append(item)
    results.sort(key=lambda item: (item["approximate_distance_miles"], item["name"]))
    return {"status": "ok", "zip": zipcode, "radius_miles": radius, "program_filter": program, "results": results[:20], "result_limit": 20, "limitation": schools["completeness"] + "; distance uses ZCTA centroids, not road travel time"}


def get_price_benchmark(args: dict) -> dict:
    state = str(args.get("state", "")).upper().strip()
    data = load("assets/data/price-index/pilot-observations.json")
    rows = [row for row in data["observations"] if row.get("state") == state]
    return {"state": state, "benchmark_status": "not_publishable", "reason": "National and state sampling gates have not passed; returning observations only.", "publication_gates": data.get("publication_gates"), "observations": rows}


def translate_level(args: dict) -> dict:
    chain = str(args.get("chain", "")).casefold().strip()
    level_query = str(args.get("level", "")).casefold().strip()
    data = load("assets/data/level-crosswalk/v0.1.json")
    system = next((item for item in data["systems"] if chain in {item["id"].casefold(), item["name"].casefold()}), None)
    if not system:
        return {"status": "system_not_found", "available_systems": [{"id": item["id"], "name": item["name"]} for item in data["systems"]]}
    level = next((item for item in system["levels"] if level_query in {item["id"].casefold(), item["name"].casefold()}), None)
    if not level:
        return {"status": "level_not_found", "system": system["name"], "available_levels": [{"id": item["id"], "name": item["name"]} for item in system["levels"]]}
    overlaps = []
    low, high = int(level["band_min"][1:]), int(level["band_max"][1:])
    for target in data["systems"]:
        if target["id"] == system["id"]:
            continue
        matches = [item for item in target["levels"] if int(item["band_min"][1:]) <= high and int(item["band_max"][1:]) >= low]
        overlaps.append({"system": target["name"], "levels": matches})
    return {"status": "approximate_descriptive_overlap", "source_system": system["name"], "source_level": level, "matches": overlaps, "required_next_step": "The receiving school must assess the swimmer; do not place or enroll from this mapping alone.", "disclaimer": data["disclaimer"]}


def get_state_laws(args: dict) -> dict:
    state = str(args.get("state", "")).upper().strip()
    data = load("assets/data/law-atlas/v0.1.json")
    record = next((item for item in data["jurisdictions"] if item["code"] == state or item["name"].casefold() == state.casefold()), None)
    if not record:
        return {"status": "state_module_not_yet_published", "state": state, "federal_baseline": data["federal_baseline"], "disclaimer": data["disclaimer"]}
    return {"status": "verified_pilot_record", "jurisdiction": record, "federal_baseline": data["federal_baseline"], "disclaimer": data["disclaimer"]}


TOOLS = {
    "find_swim_schools": (find_swim_schools, {"type": "object", "properties": {"zip": {"type": "string"}, "age": {"oneOf": [{"type": "number"}, {"type": "string"}]}, "indoor": {"type": "boolean"}, "radius_miles": {"type": "number"}}, "required": ["zip"]}),
    "get_price_benchmark": (get_price_benchmark, {"type": "object", "properties": {"state": {"type": "string"}}, "required": ["state"]}),
    "translate_level": (translate_level, {"type": "object", "properties": {"chain": {"type": "string"}, "level": {"type": "string"}}, "required": ["chain", "level"]}),
    "get_state_laws": (get_state_laws, {"type": "object", "properties": {"state": {"type": "string"}}, "required": ["state"]}),
}


def dispatch(request: dict) -> Optional[dict]:
    method = request.get("method")
    request_id = request.get("id")
    if method == "notifications/initialized":
        return None
    if method == "initialize":
        result = {"protocolVersion": "2025-06-18", "capabilities": {"tools": {}}, "serverInfo": {"name": "waterwisekids-open-data", "version": "0.1.0"}, "instructions": "Read-only public data. Preserve every limitation and disclaimer returned by tools."}
    elif method == "tools/list":
        result = {"tools": [{"name": name, "description": func.__doc__ or name.replace("_", " "), "inputSchema": schema} for name, (func, schema) in TOOLS.items()]}
    elif method == "tools/call":
        params = request.get("params", {})
        name = params.get("name")
        if name not in TOOLS:
            return {"jsonrpc": "2.0", "id": request_id, "error": {"code": -32602, "message": "Unknown tool"}}
        try:
            value = TOOLS[name][0](params.get("arguments", {}))
            result = {"content": [{"type": "text", "text": json.dumps(value, indent=2)}], "structuredContent": value}
        except (ValueError, TypeError) as exc:
            result = {"content": [{"type": "text", "text": str(exc)}], "isError": True}
    else:
        return {"jsonrpc": "2.0", "id": request_id, "error": {"code": -32601, "message": "Method not found"}}
    return {"jsonrpc": "2.0", "id": request_id, "result": result}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--call", choices=sorted(TOOLS), help="Call one tool from the command line")
    parser.add_argument("--arguments", default="{}", help="JSON object for --call")
    args = parser.parse_args()
    if args.call:
        print(json.dumps(TOOLS[args.call][0](json.loads(args.arguments)), indent=2))
        return 0
    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            response = dispatch(json.loads(line))
        except json.JSONDecodeError:
            response = {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "Parse error"}}
        if response is not None:
            print(json.dumps(response, separators=(",", ":")), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
