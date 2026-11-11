# WaterWiseKids verified swim lesson price pilot

This directory contains the repeatable build and validation tools for the public
price pilot dataset.

The pilot has two jobs:

1. prove that official provider prices can be normalized without erasing material
   differences such as class format, membership, commitment, subsidies, duration,
   and mandatory fees; and
2. prevent WaterWiseKids from publishing a national, state, or metro headline
   before the sample clears precommitted coverage and freshness gates.

## Unit of observation

One observation is one publicly listed product configuration at one location on
one observation date. Weekday and weekend prices, member and nonmember rates, and
group, semi-private, and private formats stay in separate rows. Package prices are
divided only by the published number of lessons. Mandatory annual fees are stored
separately and are not silently folded into the lesson price.

Only official provider or government pages are eligible. Search snippets,
directories, blogs, social comments, promotional aggregators, and inferred prices
are excluded. A `starting_at` price remains labeled as such. Subsidized municipal
programs remain labeled and are never presented as a typical commercial price.

## Publication gates

The machine-readable gates live in
`assets/data/price-index/pilot-observations.json`. A national headline requires at
least 200 unique locations, 40 states, at least 25 locations in every Census
region, minimum unique-location counts for the product format being described,
at least 25 locations in every provider-type stratum, no single chain above 15%
of locations, 100% official sources, and 90-day freshness. State and metro
estimates have their own minimum coverage and concentration gates.

Clearing those gates permits publication; it does not turn a convenience sample
into a probability sample. The methodology must still label the result as an
observed-sample statistic unless a defensible sampling and weighting design exists.
The pilot itself expires after 90 days: the public page shows a stale warning and
the release guard fails until retained rows are reverified or withdrawn.

## Internal collection queue

`collection-queue.json` is a reproducible 200-task research backlog, not a public
dataset and not evidence that any provider charges a particular price. It assigns
50 tasks to each Census region and 50 to each provider-type target. The existing
directory cannot fill the municipal or nonprofit/YMCA strata, so the queue records
those gaps as explicit provider-discovery tasks with no invented provider name or
URL. A directory website is only a research starting point; it does not become a
price source until a reviewer finds a current official provider or government page.

The queue deliberately keeps `pricing_source_url` empty, every source status at
`not_reviewed`, and every task at `queued`. Promoting a completed task into the
pilot dataset still requires normalization, an official-source fingerprint, and a
second review. Owner-associated BSS locations are flagged and excluded from the
first release unless independently reviewed and explicitly disclosed.

## Internal evidence batches

`midwest-candidate-batch-2026-11-11.json` is the first official-source collection
batch produced from the queue. It is deliberately separate from the public pilot.
Five rows have complete first-review fields and are ready for an independent
second review; the other rows preserve source conflicts or missing normalization
fields as explicit blockers. Nothing in a candidate batch may be promoted
automatically, and a price appearing there is not a published WWK benchmark.

## Commands

```bash
python3 tools/wwk-price-index/check_price_index.py
python3 tools/wwk-price-index/build_collection_queue.py --check
python3 tools/wwk-price-index/check_collection_queue.py
python3 tools/wwk-price-index/capture_midwest_candidate_fingerprints.py
python3 tools/wwk-price-index/check_midwest_candidate_batch.py
python3 tools/wwk-price-index/build_cost_page.py --check
python3 tools/wwk-price-index/build_cost_page.py
```

The checker exits nonzero for malformed rows, stale sources, bad normalization,
unofficial sources, or a published headline that does not clear its gates. A pilot
that correctly withholds its headline exits zero and prints the unmet gates.

## Ownership and conflicts

WaterWiseKids is published by VTL Holding LLC, whose owner also operates
British Swim School franchises serving the Jersey Shore and Northwest Philadelphia.
Those locations receive no special inclusion, weighting, or display treatment. If
their prices enter a future release, they must pass the same source and freshness
rules and carry the disclosure.

