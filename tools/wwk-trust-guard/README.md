# WWK trust guard

This release check protects the public claims most likely to damage family trust:

- AAP swim-lesson starting-age wording and its primary-source citation
- unsupported school rating and review-count claims
- the WaterWiseKids/British Swim School ownership disclosure
- directory, city, jurisdiction, and chain counts derived from `schools-data.js`
- exact guide totals, which remain prohibited until they have a release-time generator
- price-index normalization, official-source freshness, and publication gates
- internal price-candidate source coverage, normalization readiness, and no-promotion status
- 51-jurisdiction law-research coverage and claim-free unpublished tasks
- pilot-state life-jacket source coverage, freshness, and independent-review gating
- exact-revision independent-review packets for price and law candidate batches
- `llms.txt` navigation routes, ownership disclosure, and pilot limitations
- public editorial, medical-review, corrections, ownership, and author disclosures
- named, linked editorial accountability on legacy organizational bylines

Run from the repository root:

```sh
python3 tools/wwk-trust-guard/check_trust.py
```

`assets/data/safety-facts.json` is the editorial source of truth for high-risk safety claims. Update a fact only after checking its primary source, then update every affected page in the same change. `assets/data/site-stats.json` records publishable directory counts; the guard independently recalculates them from the directory data.
