# Territory growth operating cadence

This cadence applies to Pennsylvania, New Jersey and Manhattan. It separates traffic, engagement and enrollment signals so WWK never claims that a sponsored listing caused an enrollment without supporting attribution.

## Daily health check

- Confirm each sponsored card, destination and reporting endpoint is reachable.
- Confirm portal data freshness and the latest successful collection timestamp.
- Confirm the parent lesson finder and all three local support guides return a successful response.
- Alert only for a broken page, broken destination, stale reporting, collection failure or a material traffic anomaly.

## Weekly optimization review

Use Search Console page and query data for the territory pages and support guides. Record impressions, clicks, click-through rate and average position against the prior comparable period. Search Console data can lag, so label incomplete periods instead of treating them as zero.

Use `keyword-map.json` as the query-to-page contract. Review both the primary locality intent and the decision-intent terms. A term in the map is a hypothesis until Search Console records impressions; do not claim search volume that has not been measured. Update the map when complete-period query evidence shows a better parent phrase or a different page is winning the intent.

Review the GA4 events `sponsor_cta_current_classes` and `sponsor_cta_check_availability` plus the matching `utm_term` values `cta_current_classes` and `cta_check_availability`. The event names make the split reportable without a custom GA4 dimension. Compare outbound clicks and qualified downstream leads when available. Do not select a winner until each variant has at least 100 eligible sponsored-card clicks or the test has run for four complete weeks. If neither threshold is met, continue the test and report it as directional only.

Make at most one material editorial or CTA change per territory in a weekly cycle. Keep the sponsor card labeled, do not reorder ordinary directory results, and preserve the existing campaign and placement identifiers. Re-run `npm run growth:audit` plus the complete onboarding and staging test suites after every change.

## Monthly discovery review

- Check whether major AI answer products cite or surface WWK for a fixed, documented set of local swim-lesson questions.
- Treat AI visibility as a sampled observation, not deterministic rank tracking.
- Review newly emerging nearby-city queries and add coverage only when it can be useful, locally specific and supported by reliable sources.
- Summarize territory traffic, sponsored-card engagement, leads and reported enrollments separately.

## Success measures

The pilot is working when the relevant territory pages gain qualified search impressions and clicks, the sponsored cards produce measurable outbound engagement, and the operator can trace leads or enrollments through an approved UTM, referral selection or matched conversion feed. Traffic alone is not a conversion, and a sponsored-card click alone is not an enrollment.

## Activation handoff

For a new paying school, complete the normal sponsor onboarding packet, research and add its primary and decision-intent clusters to `keyword-map.json`, add its territory to `territory-program.json`, build one substantial local support guide, add it to the finder and internal-link network, pass the audit and tests, publish, submit for indexing, and enroll the account in this cadence. The process reuses the same templates while keeping tenant IDs, destinations and portal access isolated.
