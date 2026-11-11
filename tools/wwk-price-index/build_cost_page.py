#!/usr/bin/env python3
"""Build the public cost page from the verified price pilot dataset."""

from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "assets/data/price-index/pilot-observations.json"
FRAGMENT = ROOT / "tools/wwk-price-index/cost-page-main.html"
PAGE = ROOT / "education/swim-lessons-cost.html"

START = "<!-- WWK_PRICE_INDEX_MAIN_START -->"
END = "<!-- WWK_PRICE_INDEX_MAIN_END -->"

TITLE = "Verified Swim Lesson Prices: Pilot Dataset &amp; Method"
DESCRIPTION = (
    "A clearly labeled pilot dataset of verified swim-lesson prices and WaterWiseKids' "
    "transparent method for testing a future U.S. price index. Not a national average."
)


def location_key(row: dict) -> tuple[str, str, str, str]:
    return (row["provider_name"], row["location_name"], row["city"], row["state"])


def money(value: float | None) -> str:
    if value is None:
        return "—"
    return f"${value:,.2f}".replace(".00", "")


def group_table(rows: list[dict]) -> str:
    groups = [row for row in rows if row["class_format"] == "group"]
    body = []
    for row in groups:
        duration = (
            f'{row["duration_minutes"]} min'
            if row["duration_minutes"]
            else row.get("duration_note", "Not stated")
        )
        per_30 = money(row["normalized_per_30_minutes_usd"])
        fee = money(row["mandatory_fee_usd"])
        if row.get("mandatory_fee_label"):
            fee += f'<br><small>{html.escape(row["mandatory_fee_label"])}</small>'
        qualifier = row["price_qualifier"].replace("_", " ")
        if row["subsidized"]:
            qualifier += "; subsidized"
        body.append(
            "<tr>"
            f'<td><a href="{html.escape(row["source_url"], quote=True)}" rel="nofollow">'
            f'{html.escape(row["provider_name"])}</a><br><small>{html.escape(row["location_name"])}, '
            f'{html.escape(row["state"])}</small></td>'
            f'<td>{html.escape(row["provider_type"].replace("_", " ").title())}</td>'
            f'<td>{money(row["normalized_per_lesson_usd"])}</td>'
            f'<td>{per_30}</td>'
            f'<td>{duration}</td>'
            f'<td>{fee}</td>'
            f'<td>{html.escape(qualifier)}</td>'
            "</tr>"
        )
    return (
        '<table style="width:100%;min-width:860px;border-collapse:collapse;font-size:.92rem;">'
        '<thead><tr style="background:#e0f2fe;text-align:left;">'
        '<th style="padding:10px;border:1px solid #cbd5e1;">Provider and location</th>'
        '<th style="padding:10px;border:1px solid #cbd5e1;">Type</th>'
        '<th style="padding:10px;border:1px solid #cbd5e1;">Observed per lesson<br><small>not an average</small></th>'
        '<th style="padding:10px;border:1px solid #cbd5e1;">Per 30 min</th>'
        '<th style="padding:10px;border:1px solid #cbd5e1;">Duration</th>'
        '<th style="padding:10px;border:1px solid #cbd5e1;">Required fee</th>'
        '<th style="padding:10px;border:1px solid #cbd5e1;">Qualifier</th>'
        '</tr></thead><tbody>'
        + "".join(body).replace("<td>", '<td style="padding:10px;border:1px solid #cbd5e1;vertical-align:top;">')
        + "</tbody></table>"
    )


def structured_data(data: dict) -> tuple[str, str]:
    page_url = "https://www.waterwisekids.com/education/swim-lessons-cost.html"
    article = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Verified Swim Lesson Prices: A Pilot Dataset and Method",
        "description": html.unescape(DESCRIPTION),
        "datePublished": "2026-04-06",
        "dateModified": data["as_of"],
        "mainEntityOfPage": page_url,
        "author": {"@type": "Organization", "name": "WaterWiseKids Editorial Team"},
        "publisher": {
            "@type": "Organization",
            "name": "WaterWiseKids",
            "url": "https://www.waterwisekids.com",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.waterwisekids.com/assets/images/waterwisekids-og.png",
            },
        },
        "image": "https://www.waterwisekids.com/assets/images/waterwisekids-og.png",
        "isBasedOn": "https://www.waterwisekids.com/assets/data/price-index/pilot-observations.json",
    }
    dataset = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": data["dataset_name"],
        "description": "A purposive, non-representative convenience sample of official location-level swim-lesson prices collected to test a future index method. No national average is reported.",
        "url": page_url,
        "dateModified": data["as_of"],
        "temporalCoverage": data["as_of"],
        "spatialCoverage": [
            {"@type": "State", "name": state}
            for state in sorted({row["state"] for row in data["observations"]})
        ],
        "version": f"pilot-{data['as_of']}",
        "measurementTechnique": "Official-source purposive convenience sample; package price divided by published lesson count; product formats, membership, commitments, subsidies, and fees kept separate.",
        "publishingPrinciples": f"{page_url}#methodology",
        "license": data["license"],
        "isAccessibleForFree": True,
        "creator": {"@type": "Organization", "name": "WaterWiseKids"},
        "distribution": {
            "@type": "DataDownload",
            "encodingFormat": "application/json",
            "contentUrl": "https://www.waterwisekids.com/assets/data/price-index/pilot-observations.json",
        },
    }
    return json.dumps(article, indent=2), json.dumps(dataset, indent=2)


def replace_jsonld(document: str, article_json: str, dataset_json: str) -> str:
    pattern = re.compile(r'<script type="application/ld\+json">\s*(\{.*?\})\s*</script>', re.S)
    blocks = list(pattern.finditer(document))
    replacements: list[tuple[int, int, str]] = []
    article_done = False
    dataset_done = False
    for match in blocks:
        try:
            value = json.loads(match.group(1))
        except json.JSONDecodeError:
            continue
        kind = value.get("@type")
        if kind == "Article" and not article_done:
            replacements.append((match.start(), match.end(), f'<script type="application/ld+json">\n{article_json}\n</script>'))
            article_done = True
        elif kind in {"FAQPage", "Dataset"} and not dataset_done:
            replacements.append((match.start(), match.end(), f'<script type="application/ld+json">\n{dataset_json}\n</script>'))
            dataset_done = True
    if not article_done or not dataset_done:
        raise RuntimeError("Could not find Article and FAQPage JSON-LD blocks")
    for start, end, replacement in reversed(replacements):
        document = document[:start] + replacement + document[end:]
    return document


def render() -> str:
    data = json.loads(DATA.read_text())
    rows = data["observations"]
    locations = {location_key(row) for row in rows}
    states = {row["state"] for row in rows}
    fragment = FRAGMENT.read_text()
    fragment = fragment.replace("{{OBSERVATION_COUNT}}", str(len(rows)))
    fragment = fragment.replace("{{LOCATION_COUNT}}", str(len(locations)))
    fragment = fragment.replace("{{STATE_COUNT}}", str(len(states)))
    fragment = fragment.replace("{{PILOT_GROUP_TABLE}}", group_table(rows))
    marked = f"{START}\n{fragment.rstrip()}\n{END}"

    document = PAGE.read_text()
    document = re.sub(r"<title>.*?</title>", f"<title>{TITLE}</title>", document, count=1, flags=re.S)
    document = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{DESCRIPTION}">', document, count=1, flags=re.S)
    document = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{TITLE}">', document, count=1, flags=re.S)
    document = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{DESCRIPTION}">', document, count=1, flags=re.S)
    document = re.sub(r'<meta name="twitter:title" content=".*?">', f'<meta name="twitter:title" content="{TITLE}">', document, count=1, flags=re.S)
    document = re.sub(r'<meta name="twitter:description" content=".*?">', f'<meta name="twitter:description" content="{DESCRIPTION}">', document, count=1, flags=re.S)
    document = re.sub(r'<meta property="og:image:alt" content=".*?">', '<meta property="og:image:alt" content="WaterWiseKids verified swim lesson price pilot dataset and methodology">', document, count=1, flags=re.S)
    article_json, dataset_json = structured_data(data)
    document = replace_jsonld(document, article_json, dataset_json)

    if START in document and END in document:
        document = re.sub(re.escape(START) + r".*?" + re.escape(END), marked, document, count=1, flags=re.S)
    else:
        document, count = re.subn(r'<main class="article">.*?</main>', marked, document, count=1, flags=re.S)
        if count != 1:
            raise RuntimeError("Could not find article main block")

    sidebar = '''<aside class="sidebar">
        <div class="sidebar-box">
          <h3 class="sidebar-title">In This Guide</h3>
          <ul class="toc-list">
            <li><a href="#verified-observations">Verified observations</a></li>
            <li><a href="#methodology">Methodology</a></li>
            <li><a href="#comparison">Compare two programs</a></li>
            <li><a href="#data-quality">Data quality</a></li>
            <li><a href="#license">License &amp; disclosure</a></li>
            <li><a href="#faq">Questions</a></li>
          </ul>
        </div>
        <div class="sidebar-box" style="background:#fff7ed;border-color:#fdba74;">
          <h3 class="sidebar-title" style="color:#9a3412;">Pilot dataset, not an average</h3>
          <p style="font-size:.9rem;color:#7c2d12;line-height:1.5;">The national headline remains withheld until the sample clears the published coverage and freshness gates.</p>
          <a href="/assets/data/price-index/pilot-observations.json" style="display:inline-flex;min-height:44px;align-items:center;color:#9a3412;font-weight:700;">Download pilot JSON →</a>
        </div>
        <div class="sidebar-box cta-box">
          <h3 class="sidebar-title cta-title">Find Programs Near You</h3>
          <p class="cta-desc">Compare published prices directly with local programs.</p>
          <a href="/swim-lessons/" class="cta-button">Find Swim Lessons</a>
        </div>
      </aside>'''
    document, count = re.subn(r'<aside class="sidebar">.*?</aside>', sidebar, document, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError("Could not find sidebar")
    return document


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    rendered = render()
    current = PAGE.read_text()
    if args.check:
        if rendered != current:
            print(f"STALE: {PAGE.relative_to(ROOT)}")
            return 1
        print(f"OK: {PAGE.relative_to(ROOT)} is generated from the pilot dataset")
        return 0
    PAGE.write_text(rendered)
    print(f"WROTE: {PAGE.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

