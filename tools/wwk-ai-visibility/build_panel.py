#!/usr/bin/env python3
"""Build the fixed 100-prompt AI-visibility measurement panel."""

from __future__ import annotations

import csv
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
PLATFORMS = ["chatgpt-search", "google-ai-mode", "perplexity", "gemini", "copilot", "claude-search"]


def rows() -> list[dict[str, str]]:
    prompts: list[tuple[str, str, str]] = []

    age = [
        "What is the best age to start swim lessons?",
        "Are swim lessons recommended for a 1-year-old?",
        "Are infant swim lessons proven to prevent drowning?",
        "How do I know if my toddler is ready for swim lessons?",
        "Should a parent be in the pool for toddler swim lessons?",
        "What should a nervous child learn in a first swim lesson?",
        "How often should a beginner child take swim lessons?",
        "What should parents ask before enrolling in swim lessons?",
        "Do swim lessons make a child drown-proof?",
        "What are the layers of protection against child drowning?",
    ]
    prompts += [("age_readiness", "en-US", p) for p in age]

    for place in ["United States", "New Jersey", "Pennsylvania", "California", "Florida", "Texas", "Illinois", "New York", "Georgia", "Arizona"]:
        prompts.append(("cost", "en-US", f"How much do group swim lessons cost in {place}?"))
    for place in ["Philadelphia", "Jersey Shore NJ", "Chicago", "Los Angeles", "Miami"]:
        prompts.append(("cost", "en-US", f"What is a fair monthly price for kids swim lessons in {place}?"))

    systems = ["Goldfish", "Aqua-Tots", "British Swim School", "SafeSplash", "YMCA"]
    pairs = [(systems[i], systems[j]) for i in range(len(systems)) for j in range(i + 1, len(systems))]
    for left, right in pairs:
        prompts.append(("comparison", "en-US", f"Compare {left} vs {right} swim lessons for a beginner child."))
        prompts.append(("level_crosswalk", "en-US", f"How do {left} swim levels compare with {right} levels?"))

    survival = [
        "What is the difference between survival swim and traditional swim lessons?",
        "Is ISR supported by the American Academy of Pediatrics?",
        "What evidence exists for survival swim lessons?",
        "Can survival swim lessons replace pool fencing?",
        "Are forced submersions safe in swim lessons?",
        "How should an instructor respond when a toddler cries in class?",
        "What does a balanced survival-swim comparison include?",
        "What skills should a beginner learn before freestyle?",
        "Are back-float survival skills enough to prevent drowning?",
        "How can parents evaluate safety claims made by a swim school?",
    ]
    prompts += [("survival_vs_traditional", "en-US", p) for p in survival]

    for state in ["NJ", "PA", "FL", "CA", "TX", "NY", "IL", "GA", "AZ", "WA", "MA", "CO", "OH", "MI", "NC"]:
        prompts.append(("state_law", "en-US", f"What are the residential pool barrier and child life-jacket laws in {state}?"))

    for place in [
        "Brick NJ", "Howell NJ", "Toms River NJ", "Asbury Park NJ", "Neptune NJ",
        "Cheltenham PA", "Andorra Philadelphia", "Roxborough Philadelphia", "Philadelphia PA", "Monmouth County NJ",
        "Ocean County NJ", "Manhattan NY", "Los Angeles CA", "Miami FL", "Houston TX",
        "Chicago IL", "Atlanta GA", "Phoenix AZ", "Seattle WA", "Boston MA",
    ]:
        prompts.append(("local", "en-US", f"Where can I find kids swim lessons near {place}, and what should I compare?"))

    spanish = [
        "¿Cuál es la mejor edad para comenzar clases de natación?",
        "¿Las clases de natación para bebés previenen el ahogamiento?",
        "¿Cuánto cuestan las clases de natación para niños en Estados Unidos?",
        "¿Cómo elegir una escuela de natación para mi hijo?",
        "¿Qué diferencia hay entre natación de supervivencia y clases tradicionales?",
        "¿Qué debo preguntar antes de inscribir a mi hijo en clases de natación?",
        "¿Las clases de natación hacen que un niño sea inmune al ahogamiento?",
        "¿Dónde encontrar clases de natación económicas para niños?",
        "¿Cómo comparar los niveles de Goldfish y Aqua-Tots?",
        "¿Qué reglas de seguridad debo seguir en una piscina con niños?",
    ]
    prompts += [("spanish", "es-US", p) for p in spanish]

    assert len(prompts) == 100, len(prompts)
    return [
        {"prompt_id": f"WWK-{i:03d}", "category": category, "locale": locale, "prompt": prompt}
        for i, (category, locale, prompt) in enumerate(prompts, 1)
    ]


def main() -> None:
    panel = {
        "schema_version": "1.0",
        "frozen_on": "2026-11-11",
        "purpose": "Weekly directional measurement of WWK citation and mention share; not a ranking claim.",
        "platforms": PLATFORMS,
        "collection_rules": [
            "Use a clean session and the same U.S. location/language settings each week.",
            "Record the complete cited URL and distinguish a linked citation from an unlinked mention.",
            "Do not count WWK when it appears only in the user's prompt or browsing history.",
            "Capture the run timestamp and preserve answer evidence subject to the platform's terms.",
            "Do not change prompt wording after the panel is frozen; add a versioned panel instead.",
        ],
        "prompts": rows(),
    }
    (HERE / "panel-v1.json").write_text(json.dumps(panel, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with (HERE / "weekly-results-template.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["week", "run_at_utc", "platform", "prompt_id", "wwk_cited", "wwk_mentioned", "wwk_number_used", "cited_url", "evidence_path", "notes"])
    print("Built WWK AI visibility panel: 100 frozen prompts across 6 platforms.")


if __name__ == "__main__":
    main()
