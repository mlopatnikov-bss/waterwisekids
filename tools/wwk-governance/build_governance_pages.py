#!/usr/bin/env python3
"""Generate the public WWK editorial-governance and author pages."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "terms/index.html"
UPDATED = "November 11, 2026"

PAGES = {
    "editorial-policy": {
        "title": "Editorial Policy | WaterWiseKids",
        "name": "Editorial Policy",
        "description": "How WaterWiseKids researches, verifies, writes, updates, and separates editorial work from commercial relationships.",
        "subtitle": "How we research, verify, disclose, and correct our work",
        "body": """
<div class="last-updated"><strong>Effective:</strong> November 11, 2026. This policy applies to new and materially updated WaterWiseKids content.</div>
<h2>Our standard</h2><p>WaterWiseKids publishes practical water-safety education, provider-directory information, and original datasets. We aim to make each factual claim traceable to a named source and to distinguish verified facts from estimates, opinion, and incomplete information.</p>
<h2>Sources and verification</h2><ul><li>Medical and drowning-prevention guidance starts with current primary or institutional sources such as the AAP, CDC, AHA, Red Cross, CPSC, statutes, and government agencies.</li><li>Provider prices, schedules, locations, and policies must link to the provider's current official page or document. We do not turn search snippets, anonymous comments, or directory estimates into verified facts.</li><li>When a source does not establish a field, we say “not stated” rather than infer it.</li><li>Time-sensitive facts carry a checked or modified date and, where appropriate, an expiration or recheck rule.</li></ul>
<h2>Authorship and review</h2><p>Every new page must identify its responsible author or editorial owner. A generic team byline is not a medical credential. Health-related pages may display a named medical or technical reviewer only after that person has reviewed the specific version. Our current reviewer status is explained in the <a href="/medical-review-policy/">Medical Review Policy</a>.</p>
<h2>Use of AI tools</h2><p>AI tools may help organize research, compare drafts, normalize structured data, or flag inconsistencies. They are not treated as sources. A human editor remains responsible for checking the cited source, resolving contradictions, and approving publication. Automated content is blocked when source, conflict, or release checks fail.</p>
<h2>Independence and commercial content</h2><p>Paid visibility does not buy safety recommendations or rank in standard directory results. Sponsored placements are labeled. Corporate relationships and the publisher's swim-school ownership are disclosed on relevant pages and in our <a href="/ownership-disclosure/">Ownership and Advertising Disclosure</a>.</p>
<h2>Corrections</h2><p>We correct material errors in place, update the review date, and record significant trust or safety corrections in the public <a href="/corrections/">Corrections Log</a>. Send evidence-backed corrections through <a href="/contact/">our contact page</a>.</p>
""",
    },
    "medical-review-policy": {
        "title": "Medical Review Policy | WaterWiseKids",
        "name": "Medical Review Policy",
        "description": "How WaterWiseKids handles medical, drowning-prevention, CPR, and other high-risk safety guidance.",
        "subtitle": "What medical review means here—and what it does not",
        "body": """
<div class="last-updated"><strong>Effective:</strong> November 11, 2026. WaterWiseKids is educational and is not a substitute for medical care or emergency instruction.</div>
<h2>Current review status</h2><p>WaterWiseKids does not currently claim that every medical or water-safety page has been reviewed by an independent clinician. A page will say “medically reviewed by” only when a named qualified reviewer has examined that exact version. Until then, the page must rely on cited primary guidance and must not imply clinician endorsement.</p>
<h2>High-risk topics</h2><p>This policy covers CPR, drowning symptoms, rescue response, hypoxic blackout, water-related illness, developmental readiness, special medical needs, and other content where an inaccurate statement could cause harm.</p>
<h2>Source hierarchy</h2><ul><li>Current policy statements and guidance from the AAP, CDC, AHA, Red Cross, CPSC, and appropriate government health agencies.</li><li>Peer-reviewed research when it answers a question the institutional guidance does not.</li><li>Provider or commercial sources only for facts about their own program or product—not as the sole authority for a medical claim.</li></ul>
<h2>Canonical facts and drift checks</h2><p>High-risk sitewide claims are stored in <a href="/assets/data/safety-facts.json">the public safety-facts file</a> with their primary source and verification date. Release checks block phrases that contradict the current canonical guidance. This reduces drift, but it does not replace professional review.</p>
<h2>Emergency and personal advice</h2><p>Our pages cannot diagnose a child, assess an emergency, or replace hands-on CPR and rescue training. In an emergency, call local emergency services. Families should discuss individual medical concerns with a qualified clinician who knows the child.</p>
<h2>Reviewer conflicts</h2><p>A future reviewer must disclose relevant financial or professional relationships. A reviewer employed by a provider discussed on the page cannot be presented as independent without a clear conflict disclosure.</p>
""",
    },
    "corrections": {
        "title": "Corrections Log | WaterWiseKids",
        "name": "Corrections Log",
        "description": "Material WaterWiseKids corrections, what changed, why it changed, and when the correction was made.",
        "subtitle": "Material trust and safety corrections, recorded publicly",
        "body": """
<div class="last-updated"><strong>Log started:</strong> November 11, 2026. Minor spelling, formatting, and broken-link repairs are not listed.</div>
<h2>November 11, 2026 — swim-lesson starting age</h2><p>We corrected pages that repeated outdated or contradictory “age 4” language and aligned the sitewide fact with the AAP's 2026 drowning-prevention policy. The site now says families may consider lessons after the first birthday based on readiness and circumstances; infant lessons are not proven to prevent drowning.</p>
<h2>November 11, 2026 — school ratings and ownership</h2><p>We removed school star ratings and review counts that could not be supported by a transparent collection record. We also added clearer disclosure that the WaterWiseKids owner operates British Swim School franchises serving the Jersey Shore and Northwest Philadelphia.</p>
<h2>November 11, 2026 — swim-lesson price guide</h2><p>We removed unsupported “typical” and “average” national price ranges. The replacement is a clearly labeled pilot dataset of individual official-source observations with no pooled statistic, a second source review, publication gates, and a 90-day freshness rule.</p>
<h2>How to request a correction</h2><p>Use the <a href="/contact/">contact page</a> and include the WaterWiseKids URL, the disputed statement, and a primary or official source. We will distinguish a factual correction from a request to change an opinion, ranking, or clearly labeled advertisement.</p>
""",
    },
    "ownership-disclosure": {
        "title": "Ownership & Advertising Disclosure | WaterWiseKids",
        "name": "Ownership and Advertising Disclosure",
        "description": "Who owns WaterWiseKids, its British Swim School affiliation, and how advertising is separated from editorial and directory results.",
        "subtitle": "Who owns this site and how commercial relationships are handled",
        "body": """
<div class="last-updated"><strong>Effective:</strong> November 11, 2026. This disclosure applies sitewide.</div>
<h2>Ownership</h2><p>WaterWiseKids is owned and published by VTL Holding LLC. The same owner operates British Swim School businesses serving the Jersey Shore and Northwest Philadelphia. Enrollment with those schools may financially benefit VTL Holding LLC.</p>
<h2>How we disclose the relationship</h2><p>Pages that link prominently to an affiliated school include a nearby affiliation disclosure. Comparison and data pages repeat the disclosure when the relationship could affect how a reader interprets the content. An affiliated school is not described as independently endorsed by WaterWiseKids.</p>
<h2>Advertising and sponsored placement</h2><p>Swim schools and aquatics businesses may buy clearly labeled promotional placement. Payment buys visibility only. It does not change safety guidance, create a rating, or determine the default order of standard directory results. Sponsored modules are visually and textually identified.</p>
<h2>Directory and data inclusion</h2><p>Standard directory inclusion and factual correction requests are separate from advertising. Data completeness, source quality, and published methodology—not payment—govern inclusion in public datasets. Affiliated locations must pass the same rules as other providers and carry the ownership disclosure.</p>
<h2>Reviews and endorsements</h2><p>WaterWiseKids does not currently publish school star ratings or review counts. Private browser notes in the directory are not public reviews. If a future review program is introduced, it must publish its collection, verification, moderation, conflict, and incentive rules before ratings appear.</p>
<h2>Questions</h2><p>If a relationship or paid placement is not clear, please <a href="/contact/">contact us</a> so we can review and correct the page.</p>
""",
    },
    "newsroom": {
        "title": "WaterWiseKids Newsroom & Data Releases",
        "name": "Newsroom and Data Releases",
        "description": "Current WaterWiseKids datasets, release status, methodology links, and the evidence-gated annual data-journalism calendar.",
        "subtitle": "Verified releases, withheld claims, and the calendar behind our public data",
        "body": """
<div class="last-updated"><strong>Status checked:</strong> November 11, 2026. Dates below are editorial targets, not promises that a result will be publishable.</div>
<h2>Current public releases</h2>
<ul>
<li><strong>Swim Lesson Price Pilot:</strong> 17 official-source observations across 10 locations and six states. No national, state, or metro average is publishable because the precommitted coverage gates are not met. <a href="/education/swim-lessons-cost.html">Data and methodology</a>.</li>
<li><strong>Swim Level Crosswalk beta:</strong> broad descriptive skill bands for six systems and 38 provider-published levels. It is not a placement tool; the receiving school must assess the swimmer. <a href="/tools/swim-level-crosswalk/">Use the crosswalk</a>.</li>
<li><strong>Water-Safety Law Atlas pilot:</strong> verified modules for Florida, New Jersey and Pennsylvania. Unverified jurisdictions remain unpublished. <a href="/education/swimming-pool-fence-laws-by-state.html">Law Atlas and sources</a>.</li>
<li><strong>Swim Access Atlas foundation:</strong> a three-county data-coverage diagnostic, not an access score, risk rank or “swim desert” label. <a href="/swim-access-atlas/">Methods and missing-data view</a>.</li>
<li><strong>Open data and MCP reference:</strong> versioned JSON datasets and a read-only local MCP reference server. No publicly hosted MCP transport is claimed. <a href="/api/">API documentation</a>.</li>
</ul>
<h2>Evidence-gated release calendar</h2>
<table><thead><tr><th>Target window</th><th>Planned release</th><th>Release gate</th></tr></thead><tbody>
<tr><td>March</td><td>Annual Price Index</td><td>Publish a statistic only if the defined segment clears location, provider-type, concentration, freshness and second-review rules.</td></tr>
<tr><td>May</td><td>Water-safety law update</td><td>Publish only jurisdictions checked against current government or statutory sources with a review date and change log.</td></tr>
<tr><td>Memorial Day–July 4</td><td>Swim Access Atlas</td><td>No county page until it clears the minimum provider/data threshold; never turn missing directory data into a community danger claim.</td></tr>
<tr><td>July 25</td><td>State of Drowning Prevention update</td><td>Use current public-health sources, suppression rules and a named review owner.</td></tr>
<tr><td>September</td><td>Level Crosswalk update</td><td>Recheck provider descriptions, retain version history and require receiving-school assessment.</td></tr>
</tbody></table>
<h2>For journalists and researchers</h2>
<p>Every numerical release should link to its dataset, license, methodology, release date, source list and known limitations. A pilot or withheld result must not be described as a national benchmark. To request a source packet, correction, interview or advance methodology review, use the <a href="/contact/">WaterWiseKids contact page</a> and identify the dataset and deadline.</p>
<h2>Embargoes and corrections</h2>
<p>WaterWiseKids may share a completed release under a written embargo, but it will not preview an unverified headline. Material errors are corrected in place and recorded in the public <a href="/corrections/">Corrections Log</a>. Ownership and British Swim School affiliations are disclosed under the <a href="/ownership-disclosure/">Ownership and Advertising Disclosure</a>.</p>
""",
    },
    "authors/michael-plotnikov": {
        "title": "Michael Plotnikov | WaterWiseKids Publisher",
        "name": "Michael Plotnikov",
        "description": "Profile of Michael Plotnikov, publisher of WaterWiseKids and operator of affiliated British Swim School businesses.",
        "subtitle": "Publisher and responsible editorial owner",
        "body": """
<div class="last-updated"><strong>Profile verified:</strong> November 11, 2026.</div>
<h2>Role</h2><p>Michael Plotnikov is the publisher and responsible editorial owner of WaterWiseKids. He oversees the site's directory, data projects, commercial disclosures, and release standards.</p>
<h2>Relevant business relationship</h2><p>Michael also operates British Swim School businesses serving the Jersey Shore and Northwest Philadelphia through the same ownership group that publishes WaterWiseKids. That relationship can create a financial interest when WaterWiseKids discusses local swim lessons or British Swim School. It is disclosed on relevant pages and governed by the <a href="/ownership-disclosure/">Ownership and Advertising Disclosure</a>.</p>
<h2>What this profile does not claim</h2><p>This profile does not present Michael as a physician or independent medical reviewer. WaterWiseKids lists a professional credential only after it can be verified and connected to the content being reviewed. See the <a href="/medical-review-policy/">Medical Review Policy</a>.</p>
<h2>Contact</h2><p>Questions about editorial standards, corrections, or conflicts can be submitted through the <a href="/contact/">WaterWiseKids contact page</a>.</p>
""",
        "person": True,
    },
}


def build_page(slug: str, page: dict) -> str:
    document = TEMPLATE.read_text()
    url = f"https://www.waterwisekids.com/{slug}/"
    title = page["title"]
    description = page["description"]
    name = page["name"]

    replacements = [
        (r"<title>.*?</title>", f"<title>{title}</title>"),
        (r'<meta name="description" content=".*?">', f'<meta name="description" content="{description}">'),
        (r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="{url}">'),
        (r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="{url}">'),
        (r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{title}">'),
        (r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{description}">'),
        (r'<meta property="og:image:alt" content=".*?">', f'<meta property="og:image:alt" content="{name} — WaterWiseKids">'),
        (r'<meta name="twitter:title" content=".*?">', f'<meta name="twitter:title" content="{title}">'),
        (r'<meta name="twitter:description" content=".*?">', f'<meta name="twitter:description" content="{description}">'),
    ]
    for pattern, replacement in replacements:
        document, count = re.subn(pattern, replacement, document, count=1, flags=re.S)
        if count != 1:
            raise RuntimeError(f"{slug}: failed to replace {pattern}")

    if page.get("person"):
        schema = {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "name": name,
            "description": description,
            "url": url,
            "dateModified": "2026-11-11",
            "mainEntity": {
                "@type": "Person",
                "name": name,
                "jobTitle": "Publisher",
                "worksFor": {"@type": "Organization", "name": "WaterWiseKids", "url": "https://www.waterwisekids.com/"},
            },
        }
    else:
        schema = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": name,
            "description": description,
            "url": url,
            "dateModified": "2026-11-11",
            "publisher": {"@type": "Organization", "name": "WaterWiseKids", "url": "https://www.waterwisekids.com/"},
        }
    scripts = list(re.finditer(r'<script type="application/ld\+json">\s*\{.*?\}\s*</script>', document, re.S))
    if len(scripts) < 2:
        raise RuntimeError(f"{slug}: expected two JSON-LD blocks")
    schema_block = '<script type="application/ld+json">\n' + json.dumps(schema, indent=2) + "\n</script>"
    first = scripts[0]
    document = document[:first.start()] + schema_block + document[first.end():]
    breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.waterwisekids.com/"},
            {"@type": "ListItem", "position": 2, "name": name, "item": url},
        ],
    }
    breadcrumb_block = (
        '<script type="application/ld+json">\n'
        + json.dumps(breadcrumb, indent=2)
        + "\n</script>"
    )
    pattern = re.compile(r'<script type="application/ld\+json">\s*(\{.*?\})\s*</script>', re.S)
    for match in pattern.finditer(document):
        try:
            value = json.loads(match.group(1))
        except json.JSONDecodeError:
            continue
        if value.get("@type") == "BreadcrumbList":
            document = document[:match.start()] + breadcrumb_block + document[match.end():]
            break

    header_content = (
        '<div class="page-header" style="--v4-original-order: 2;">\n'
        '    <div class="page-header-content">\n'
        f'      <h1>{name}</h1>\n'
        f'      <p>{page["subtitle"]}</p>\n'
        '    </div>\n  </div>'
    )
    document, count = re.subn(
        r'<div class="page-header".*?</div>\s*</div>',
        header_content,
        document,
        count=1,
        flags=re.S,
    )
    if count != 1:
        raise RuntimeError(f"{slug}: failed to replace header")
    content = f'<main class="content" style="--v4-original-order: 3;">\n{page["body"].strip()}\n  </main>'
    document, count = re.subn(
        r'<div class="content" style="--v4-original-order: 3;">.*?</div>\s*\n\s*<!-- Footer -->',
        content + "\n\n  <!-- Footer -->",
        document,
        count=1,
        flags=re.S,
    )
    if count != 1:
        raise RuntimeError(f"{slug}: failed to replace content")
    document = document.replace(
        '<p>© 2026 WaterWiseKids. All rights reserved. | <a href="/privacy/">Privacy Policy</a> | <a href="/terms/">Terms of Service</a></p>',
        '<p>© 2026 WaterWiseKids. All rights reserved. | <a href="/editorial-policy/">Editorial Policy</a> | <a href="/corrections/">Corrections</a> | <a href="/privacy/">Privacy Policy</a> | <a href="/terms/">Terms of Service</a></p>',
    )
    return document


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    stale = []
    for slug, page in PAGES.items():
        output = ROOT / slug / "index.html"
        rendered = build_page(slug, page)
        if args.check:
            if not output.exists() or output.read_text() != rendered:
                stale.append(str(output.relative_to(ROOT)))
        else:
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(rendered)
            print(f"WROTE: {output.relative_to(ROOT)}")
    if stale:
        print("STALE: " + ", ".join(stale))
        return 1
    if args.check:
        print(f"OK: {len(PAGES)} governance pages match their source")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

