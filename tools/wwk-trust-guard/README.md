# WWK trust guard

This release check protects the public claims most likely to damage family trust:

- AAP swim-lesson starting-age wording and its primary-source citation
- unsupported school rating and review-count claims
- the WaterWiseKids/British Swim School ownership disclosure
- directory, city, jurisdiction, and chain counts derived from `schools-data.js`
- exact guide totals, which remain prohibited until they have a release-time generator
- price-index normalization, official-source freshness, and publication gates

Run from the repository root:

```sh
python3 tools/wwk-trust-guard/check_trust.py
```

`assets/data/safety-facts.json` is the editorial source of truth for high-risk safety claims. Update a fact only after checking its primary source, then update every affected page in the same change. `assets/data/site-stats.json` records publishable directory counts; the guard independently recalculates them from the directory data.
