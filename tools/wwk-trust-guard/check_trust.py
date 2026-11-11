#!/usr/bin/env python3
"""Fail a WWK release when high-risk trust claims or directory counts drift."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


EXCLUDED_PARTS = {".git", ".next", "node_modules", "commercial-poc"}
REVIEW_BLOCKED = (
    "verified parent ratings",
    "collects parent ratings",
    "Highly-Rated Schools",
    "4.9 (218 reviews)",
    "4.8 (186 reviews)",
    "Kiddie Splash Academy",
    "Aquatic Elite Academy",
    "H2O Kids Swimming",
)
DIRECTORY_REVIEW_BLOCKED = (
    "read parent reviews",
    "read reviews from other parents",
    "leave a review",
    "submit review",
)
AAP_POLICY_URL = (
    "https://publications.aap.org/pediatrics/article/doi/10.1542/"
    "peds.2026-077410/207630/Prevention-of-Drowning-Policy-Statement"
)


def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def load_directory_data(path: Path) -> dict:
    text = path.read_text(encoding="utf-8").strip()
    prefix = "const SWIM_SCHOOLS_DATA = "
    start = text.find(prefix)
    if start < 0 or not text.endswith(";"):
        raise ValueError(f"Unexpected directory data wrapper: {path}")
    return json.loads(text[start + len(prefix) : -1])


def html_files(root: Path):
    for path in root.rglob("*.html"):
        if not any(part in EXCLUDED_PARTS for part in path.parts):
            yield path


def check(root: Path) -> list[str]:
    errors: list[str] = []
    facts_path = root / "assets/data/safety-facts.json"
    stats_path = root / "assets/data/site-stats.json"
    try:
        facts = load_json(facts_path)
        stats = load_json(stats_path)
    except (OSError, json.JSONDecodeError) as exc:
        return [f"facts/config load failed: {exc}"]

    if facts.get("last_verified") != "2026-11-11":
        errors.append("safety-facts.json must record the current verification date")
    if facts["facts"]["swim_lesson_start_age"].get("source_url") != AAP_POLICY_URL:
        errors.append("canonical AAP lesson-age fact must cite the 2026 policy statement")

    blocked = tuple(x.casefold() for x in facts.get("blocked_phrases", []))
    for path in html_files(root):
        text = path.read_text(encoding="utf-8", errors="ignore")
        folded = text.casefold()
        for phrase in blocked:
            if phrase in folded:
                errors.append(f"{path.relative_to(root)}: blocked safety phrase: {phrase}")

    review_page = (root / "swim-schools.html").read_text(encoding="utf-8")
    review_redirect = (root / "swim-schools/index.html").read_text(encoding="utf-8")
    review_surface = review_page + "\n" + review_redirect
    for phrase in REVIEW_BLOCKED:
        if phrase.casefold() in review_surface.casefold():
            errors.append(f"swim-school comparison surface retains unsupported review claim: {phrase}")
    if "Ownership disclosure:" not in review_page:
        errors.append("swim-schools.html must disclose WWK/British Swim School common ownership")
    if "does not currently publish school ratings or review counts" not in review_page:
        errors.append("swim-schools.html must state the current ratings policy")

    for path in sorted((root / "swim-lessons/directory").glob("*.html")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        folded = text.casefold()
        for phrase in DIRECTORY_REVIEW_BLOCKED:
            if phrase in folded:
                errors.append(
                    f"{path.relative_to(root)}: advertises public reviews but stores only browser-local notes: {phrase}"
                )
        if 'id="reviewModal"' in text:
            for required in (
                "Add a Private Note",
                "Your private rating:",
                "Saved in this browser only",
            ):
                if required not in text:
                    errors.append(
                        f"{path.relative_to(root)}: local note UI is missing disclosure: {required}"
                    )

    for relative in (
        "education/pediatricians-guide-swim-lessons.html",
        "education/water-safety-babies-under-1.html",
        "kids-swim-lessons-philadelphia.html",
    ):
        text = (root / relative).read_text(encoding="utf-8")
        if AAP_POLICY_URL not in text:
            errors.append(f"{relative}: missing direct citation to the 2026 AAP policy")

    try:
        data = load_directory_data(root / "swim-lessons/directory/schools-data.js")
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        errors.append(f"directory data load failed: {exc}")
        return errors

    schools = [school for state_schools in data.values() for school in state_schools]
    actual = {
        "schools": len(schools),
        "cities": len({(school.get("state"), school.get("city")) for school in schools}),
        "jurisdictions": len(data),
    }
    for key, value in actual.items():
        expected = stats["directory"][key]
        if value != expected:
            errors.append(f"directory {key} drift: data={value}, site-stats.json={expected}")

    for chain, expected in stats["directory"]["chain_counts"].items():
        actual_chain = sum(1 for school in schools if school.get("chain") == chain)
        if actual_chain != expected:
            errors.append(
                f"directory chain drift for {chain}: data={actual_chain}, site-stats.json={expected}"
            )

    homepage = (root / "index.html").read_text(encoding="utf-8")
    if f'<span class="stat-number">{stats["directory"]["schools"]}</span>' not in homepage:
        errors.append("homepage school count does not match site-stats.json")
    if re.search(r"View All\s+\d+\s+Guides", homepage):
        errors.append("homepage publishes an exact guide count without a release-time generator")
    for claim in (
        "Founded by a team of certified swim instructors",
        "created by certified swim instructors",
    ):
        if claim.casefold() in homepage.casefold():
            errors.append(f"homepage retains an unverified team credential claim: {claim}")

    price_guard = root / "tools/wwk-price-index/check_price_index.py"
    if price_guard.exists():
        result = subprocess.run(
            [sys.executable, str(price_guard)],
            cwd=root,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            detail = (result.stderr or result.stdout).strip().replace("\n", " | ")
            errors.append(f"price-index guard failed: {detail}")

    collection_queue_guard = root / "tools/wwk-price-index/check_collection_queue.py"
    if collection_queue_guard.exists():
        result = subprocess.run(
            [sys.executable, str(collection_queue_guard)],
            cwd=root,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            detail = (result.stderr or result.stdout).strip().replace("\n", " | ")
            errors.append(f"price collection queue guard failed: {detail}")

    governance_builder = root / "tools/wwk-governance/build_governance_pages.py"
    if governance_builder.exists():
        result = subprocess.run(
            [sys.executable, str(governance_builder), "--check"],
            cwd=root,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            detail = (result.stderr or result.stdout).strip().replace("\n", " | ")
            errors.append(f"governance-page guard failed: {detail}")

    crosswalk_guard = root / "tools/wwk-level-crosswalk/check_crosswalk.py"
    if crosswalk_guard.exists():
        result = subprocess.run(
            [sys.executable, str(crosswalk_guard)],
            cwd=root,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            detail = (result.stderr or result.stdout).strip().replace("\n", " | ")
            errors.append(f"swim-level crosswalk guard failed: {detail}")

    law_atlas_guard = root / "tools/wwk-law-atlas/check_law_atlas.py"
    if law_atlas_guard.exists():
        result = subprocess.run(
            [sys.executable, str(law_atlas_guard)],
            cwd=root,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            detail = (result.stderr or result.stdout).strip().replace("\n", " | ")
            errors.append(f"water-safety law-atlas guard failed: {detail}")

    access_guard = root / "tools/wwk-access-atlas/check_access_pilot.py"
    if access_guard.exists():
        result = subprocess.run(
            [sys.executable, str(access_guard)],
            cwd=root,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            detail = (result.stderr or result.stdout).strip().replace("\n", " | ")
            errors.append(f"swim-access diagnostic guard failed: {detail}")

    transparency_guard = root / "tools/wwk-transparency/check_transparency.py"
    if transparency_guard.exists():
        result = subprocess.run(
            [sys.executable, str(transparency_guard)],
            cwd=root,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            detail = (result.stderr or result.stdout).strip().replace("\n", " | ")
            errors.append(f"school transparency guard failed: {detail}")

    api_guard = root / "tools/wwk-api/check_api.py"
    if api_guard.exists():
        result = subprocess.run(
            [sys.executable, str(api_guard)],
            cwd=root,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            detail = (result.stderr or result.stdout).strip().replace("\n", " | ")
            errors.append(f"open-data API/MCP guard failed: {detail}")

    local_guard = root / "tools/wwk-local-consolidation/check_local_consolidation.py"
    if local_guard.exists():
        result = subprocess.run(
            [sys.executable, str(local_guard)],
            cwd=root,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            detail = (result.stderr or result.stdout).strip().replace("\n", " | ")
            errors.append(f"local-page consolidation guard failed: {detail}")

    cloudflare_redirect_guard = root / "tools/wwk-local-consolidation/build_cloudflare_redirects.py"
    if cloudflare_redirect_guard.exists():
        result = subprocess.run(
            [sys.executable, str(cloudflare_redirect_guard), "--check"],
            cwd=root,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            detail = (result.stderr or result.stdout).strip().replace("\n", " | ")
            errors.append(f"Cloudflare bulk redirect package failed: {detail}")

    ai_visibility_guard = root / "tools/wwk-ai-visibility/check_panel.py"
    if ai_visibility_guard.exists():
        result = subprocess.run(
            [sys.executable, str(ai_visibility_guard)],
            cwd=root,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            detail = (result.stderr or result.stdout).strip().replace("\n", " | ")
            errors.append(f"AI visibility panel guard failed: {detail}")

    spanish_guard = root / "tools/wwk-spanish/check_translation_queue.py"
    if spanish_guard.exists():
        result = subprocess.run(
            [sys.executable, str(spanish_guard)],
            cwd=root,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            detail = (result.stderr or result.stdout).strip().replace("\n", " | ")
            errors.append(f"Spanish publication gate failed: {detail}")

    wait_time_guard = root / "tools/wwk-wait-times/check_wait_times.py"
    if wait_time_guard.exists():
        result = subprocess.run(
            [sys.executable, str(wait_time_guard)],
            cwd=root,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            detail = (result.stderr or result.stdout).strip().replace("\n", " | ")
            errors.append(f"wait-time pilot guard failed: {detail}")

    governance_requirements = {
        "editorial-policy/index.html": "AI tools may help organize research",
        "medical-review-policy/index.html": "does not currently claim that every medical",
        "corrections/index.html": "swim-lesson starting age",
        "ownership-disclosure/index.html": "VTL Holding LLC",
        "authors/michael-plotnikov/index.html": "does not present Michael as a physician",
    }
    for relative, required in governance_requirements.items():
        path = root / relative
        if not path.exists() or required not in path.read_text(encoding="utf-8"):
            errors.append(f"{relative}: missing required governance disclosure")

    about = (root / "about/index.html").read_text(encoding="utf-8")
    for href in (
        "/editorial-policy/",
        "/medical-review-policy/",
        "/corrections/",
        "/ownership-disclosure/",
        "/authors/michael-plotnikov/",
    ):
        if f'href="{href}"' not in about:
            errors.append(f"about/index.html: missing governance link {href}")
    for claim in (
        "team is made up of certified swim instructors",
        "team of certified swim instructors",
        "built by certified swim instructors",
    ):
        if claim in about.casefold():
            errors.append(f"about/index.html: retains an unverified team credential claim: {claim}")

    funding_page = (root / "education/swim-lessons-esa-529-fsa.html").read_text(encoding="utf-8")
    for banned in (
        "explicitly allows swim lessons and aquatics programs",
        "Nevada's Education Savings Account",
        "FSA and HSA funds can pay for swim-related expenses only",
        "The LMN must be renewed annually in most cases",
        "Medicaid and CHIP may cover aquatic therapy",
    ):
        if banned.casefold() in funding_page.casefold():
            errors.append(f"funding guide retains unsupported eligibility claim: {banned}")
    for required in (
        "IRS FAQ Q11",
        "not automatic approval",
        "Arizona’s Department of Education says it makes the final determination",
        "WWK cannot determine individual tax eligibility",
    ):
        if required not in funding_page:
            errors.append(f"funding guide missing required guardrail: {required}")

    handout = (root / "resources/swim-ready-pediatrician-handout/index.html").read_text(encoding="utf-8")
    for required in (
        "after a child's first birthday",
        "no evidence that infant swim lessons reduce drowning incidence",
        "lessons are only one layer of protection",
        "does not replace individual medical advice",
        "owner also operates British Swim School businesses",
    ):
        if required not in handout:
            errors.append(f"pediatrician handout missing safety/disclosure text: {required}")
    if "age 4" in handout.casefold() or "85% of pediatricians" in handout.casefold():
        errors.append("pediatrician handout contains retired age or survey language")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    args = parser.parse_args()
    root = args.root.resolve()
    errors = check(root)
    if errors:
        print(f"WWK trust guard FAILED ({len(errors)} issue(s))", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print("WWK trust guard passed: safety claims, review policy, ownership disclosure, directory counts, price-index gates, crosswalk guardrails, law-atlas sources, access-pilot caveats, school-transparency boundaries, API/MCP limitations, local-page consolidation, AI-visibility measurement, Spanish review gating, and wait-time privacy gates are consistent.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
