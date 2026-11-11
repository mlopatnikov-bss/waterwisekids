#!/usr/bin/env python3
"""Generate the transparency standard and claim-your-listing request page."""

from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "terms/index.html"
DATA = ROOT / "assets/data/transparency-standard/v0.1.json"


def base_document(title: str, description: str, url: str, name: str) -> str:
    document = TEMPLATE.read_text(encoding="utf-8")
    for pattern, replacement in [
        (r"<title>.*?</title>", f"<title>{title}</title>"),
        (r'<meta name="description" content=".*?">', f'<meta name="description" content="{description}">'),
        (r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="{url}">'),
        (r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="{url}">'),
        (r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{title}">'),
        (r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{description}">'),
        (r'<meta name="twitter:title" content=".*?">', f'<meta name="twitter:title" content="{title}">'),
        (r'<meta name="twitter:description" content=".*?">', f'<meta name="twitter:description" content="{description}">'),
    ]:
        document, count = re.subn(pattern, replacement, document, count=1, flags=re.S)
        if count != 1:
            raise RuntimeError(f"failed to replace {pattern}")
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
    block = '<script type="application/ld+json">\n' + json.dumps(schema, indent=2) + "\n</script>"
    document = document[:scripts[0].start()] + block + document[scripts[0].end():]
    document = document.replace(
        '<p>© 2026 WaterWiseKids. All rights reserved. | <a href="/privacy/">Privacy Policy</a> | <a href="/terms/">Terms of Service</a></p>',
        '<p>© 2026 WaterWiseKids. All rights reserved. | <a href="/editorial-policy/">Editorial Policy</a> | <a href="/corrections/">Corrections</a> | <a href="/privacy/">Privacy Policy</a> | <a href="/terms/">Terms of Service</a></p>',
    )
    return document


def replace_page(document: str, heading: str, subtitle: str, body: str, css: str = "") -> str:
    if css:
        document = document.replace("\n</style>", css + "\n</style>", 1)
    header = f'''<div class="page-header" style="--v4-original-order: 2;">
    <div class="page-header-content"><h1>{heading}</h1><p>{subtitle}</p></div>
  </div>'''
    document, count = re.subn(r'<div class="page-header".*?</div>\s*</div>', header, document, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError("failed to replace header")
    document, count = re.subn(
        r'<div class="content" style="--v4-original-order: 3;">.*?</div>\s*\n\s*<!-- Footer -->',
        f'<main class="content" style="--v4-original-order: 3;">\n{body.strip()}\n</main>\n\n  <!-- Footer -->',
        document,
        count=1,
        flags=re.S,
    )
    if count != 1:
        raise RuntimeError("failed to replace content")
    return re.sub(r"[ \t]+\n", "\n", document)


def render_standard(data: dict) -> str:
    document = base_document(
        "Swim School Transparency Standard | WaterWiseKids",
        "The public disclosure fields, evidence rules, badge limits, review cycle, conflicts policy, and correction process for WaterWiseKids school listings.",
        "https://www.waterwisekids.com/transparency-standard/",
        "WaterWiseKids Swim School Transparency Standard",
    )
    fields = "".join(
        f'<li><strong>{html.escape(field["label"])}</strong><br><small>Accepted record: {html.escape(", ".join(field["evidence"]))}</small></li>'
        for field in data["required_fields"]
    )
    revocations = "".join(f"<li>{html.escape(reason)}</li>" for reason in data["badge_rules"]["revocation_reasons"])
    body = f'''
<div class="standard-alert"><strong>Disclosure badge, not a safety badge.</strong> {html.escape(data["badge_meaning"])}</div>
<p>Version {html.escape(data["schema_version"])} is a public beta. It standardizes facts families repeatedly need to compare programs while preserving “not stated” when a school does not disclose something.</p>
<h2>Required disclosure fields</h2><ol class="field-list">{fields}</ol>
<h2>Evidence labels</h2><ul><li><strong>Official public source:</strong> a current page or document controlled by the school, facility, credential issuer, or government agency.</li><li><strong>Dated school attestation:</strong> an authorized representative supplies information that is not publicly documented; the listing labels it school-submitted.</li><li><strong>Not stated:</strong> no claim is made. Unknown is never converted to “no,” “none,” safe, certified, or noncompliant.</li></ul>
<h2>Badge eligibility</h2><p>A school may display “{html.escape(data["badge_label"])}” only after every required field has a value or an explicit “not stated” label, every claimed fact has evidence or a dated attestation, the representative's authority and material conflicts are reviewed, and the record is no more than {data["review_cycle_days"]} days old.</p>
<div class="badge-demo"><span>WWK Data Disclosure</span><strong>Complete</strong><small>Disclosure reviewed · not a safety certification</small></div>
<p>The badge links to the school's public WWK disclosure record. It does not certify instructors, inspect a pool, guarantee safety, rank quality, or imply WaterWiseKids endorsement.</p>
<h2>Suspension and revocation</h2><ul>{revocations}</ul>
<h2>Payment, ordering and conflicts</h2><p>{html.escape(data["sort_policy"])}</p><p>WaterWiseKids and British Swim School businesses serving the Jersey Shore and Northwest Philadelphia share common ownership. Affiliated schools must disclose that relationship and follow the same fields, expiry rule, and correction standard. See the <a href="/ownership-disclosure/">full disclosure</a>.</p>
<h2>Claim a listing</h2><p>Submitting a claim starts a manual identity and evidence review. It does not publish changes or award a badge automatically. <a href="/for-swim-schools/claim/"><strong>Start a listing claim request</strong></a>.</p>
<p><a href="/assets/data/transparency-standard/v0.1.json">Download the open JSON specification</a> under CC BY 4.0.</p>'''
    css = """
    .standard-alert{background:#fff7ed;border:2px solid #fb923c;border-radius:12px;padding:1rem 1.1rem;color:#7c2d12;margin-bottom:1.25rem}
    .field-list{columns:2;column-gap:2rem}.field-list li{break-inside:avoid;margin-bottom:1rem}.field-list small{color:#64748b}
    .badge-demo{display:inline-flex;flex-direction:column;border:2px solid #0369a1;border-radius:12px;padding:.8rem 1rem;background:#f0f9ff;color:#075985;margin:1rem 0}.badge-demo span{font-size:.78rem;font-weight:700}.badge-demo strong{font-size:1.35rem}.badge-demo small{color:#475569}
    @media(max-width:700px){.field-list{columns:1}.content{padding:2rem 1rem}}
    """
    return replace_page(document, "Swim School Transparency Standard", "Structured disclosure without certification theater", body, css)


def render_claim(data: dict) -> str:
    document = base_document(
        "Claim a Swim School Listing | WaterWiseKids",
        "Request a WaterWiseKids school-listing claim and submit source links for the public Transparency Standard review.",
        "https://www.waterwisekids.com/for-swim-schools/claim/",
        "Claim a WaterWiseKids Swim School Listing",
    )
    body = '''
<div class="claim-alert"><strong>This is a review request, not instant verification.</strong> Submitting does not automatically change a listing, publish a claim, or award a badge. WWK checks identity, sources, conflicts, and completeness first.</div>
<p>Use this form only if you are authorized to represent the school or facility. Do not send student names, health information, background-check reports, identity documents, payment information, passwords, or other sensitive records. Link to public policies where possible.</p>
<form class="claim-form" method="POST" action="https://formspree.io/f/xzdkybrw">
  <input type="hidden" name="_subject" value="WWK listing claim and transparency review">
  <input type="hidden" name="request_type" value="listing_claim_transparency_v0.1">
  <label>School or facility name<input name="school_name" required maxlength="160" autocomplete="organization"></label>
  <label>Existing WWK listing URL, if available<input name="wwk_listing_url" type="url" placeholder="https://www.waterwisekids.com/..."></label>
  <label>Official school website<input name="official_website" type="url" required></label>
  <label>Physical teaching address<textarea name="physical_address" required rows="3"></textarea></label>
  <div class="form-grid"><label>Your name<input name="representative_name" required autocomplete="name"></label><label>Your role<input name="representative_role" required placeholder="Owner, director, authorized manager"></label></div>
  <label>Work email on the school domain<input name="email" type="email" required autocomplete="email"><small>A matching work domain helps establish authority. A nonmatching email may require follow-up.</small></label>
  <label>Public program / age information URL<input name="programs_source" type="url"></label>
  <label>Public pricing and required-fee URL<input name="pricing_source" type="url"></label>
  <label>Public policy URL (make-ups, cancellation, withdrawal)<input name="policy_source" type="url"></label>
  <label>Instructor credential or training disclosure<textarea name="instructor_credentials" rows="3" placeholder="Name the body or write Not stated. Do not upload individual certificates."></textarea></label>
  <label>Maximum class ratios by level<textarea name="class_ratios" rows="3" placeholder="Example: beginner 4:1; advanced 6:1 — or Not stated"></textarea></label>
  <label>Background-check policy and scope<textarea name="background_check_policy" rows="3" placeholder="Link or summarize the policy; do not send reports or personal records."></textarea></label>
  <label>Pool setting, season, and stated water temperature<textarea name="water_environment" rows="3" placeholder="Indoor/outdoor; year-round/seasonal; temperature or Not stated"></textarea></label>
  <label>Adaptive programming, accessibility, scholarships or aid<textarea name="access_and_aid" rows="3"></textarea></label>
  <label>Ownership, sponsorship, or other relationship with WaterWiseKids<textarea name="wwk_relationship" required rows="3" placeholder="Write None known or describe the relationship"></textarea></label>
  <label>Anything else WWK should verify<textarea name="notes" rows="4"></textarea></label>
  <label class="check"><input type="checkbox" name="authorized_attestation" value="yes" required> I am authorized to represent this school and the information I submitted is accurate to the best of my knowledge.</label>
  <label class="check"><input type="checkbox" name="disclosure_not_certification" value="yes" required> I understand that any badge indicates disclosure completeness only, not safety certification, quality rating, inspection, accreditation, or endorsement.</label>
  <button type="submit">Submit claim request</button>
</form>
<p class="privacy-note">This form is processed by Formspree and delivered to WaterWiseKids for manual review. See the <a href="/privacy/">Privacy Policy</a>. For a correction without a claim, use the <a href="/contact/">contact page</a>.</p>'''
    css = """
    .claim-alert{background:#fff7ed;border:2px solid #fb923c;border-radius:12px;padding:1rem 1.1rem;color:#7c2d12;margin-bottom:1.25rem}
    .claim-form{display:grid;gap:1rem;border:1px solid #cbd5e1;border-radius:14px;padding:1.25rem;background:#fff}.claim-form label{font-weight:700;color:#0f172a}.claim-form input,.claim-form textarea{display:block;width:100%;box-sizing:border-box;margin-top:.35rem;border:1px solid #94a3b8;border-radius:8px;padding:.7rem;font:inherit;color:#0f172a;background:#fff}.claim-form small{display:block;color:#64748b;font-weight:400;margin-top:.3rem}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.claim-form .check{display:grid;grid-template-columns:auto 1fr;gap:.65rem;align-items:start;font-weight:500}.claim-form .check input{width:auto;margin:.2rem 0 0}.claim-form button{border:0;border-radius:999px;background:#0369a1;color:#fff;font:inherit;font-weight:800;padding:.85rem 1.25rem;cursor:pointer}.privacy-note{font-size:.88rem;color:#64748b;margin-top:1rem}
    @media(max-width:700px){.form-grid{grid-template-columns:1fr}.content{padding:2rem 1rem}.claim-form{padding:1rem}}
    """
    return replace_page(document, "Claim a Swim School Listing", "Submit identity and source links for manual review", body, css)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = json.loads(DATA.read_text(encoding="utf-8"))
    outputs = {
        ROOT / "transparency-standard/index.html": render_standard(data),
        ROOT / "for-swim-schools/claim/index.html": render_claim(data),
    }
    stale = []
    for path, rendered in outputs.items():
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != rendered:
                stale.append(str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(rendered, encoding="utf-8")
            print(f"WROTE: {path.relative_to(ROOT)}")
    if stale:
        print("STALE: " + ", ".join(stale))
        return 1
    if args.check:
        print("OK: transparency standard and claim form match versioned source")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
