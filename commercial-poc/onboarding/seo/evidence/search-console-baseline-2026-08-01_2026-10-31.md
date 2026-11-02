# Search Console baseline: territory pages (2026-08-01 to 2026-10-31)

**Source:** Google Search Console Performance report, last 3 months (Aug 1 – Oct 31, 2026), with a page-URL filter for each town. The figures were supplied to this worktree as verified on 2026-11-02. They were not fetched by any tool here, and no Search Console account was accessed from this repository.

**Partial totals warning (as reported):** these are filtered page-URL totals. Search Console omits anonymized queries from filtered views and rounds large figures, so the filtered rows need not add up to the site total. Treat the town rows as directional at these volumes.

| Scope | Clicks | Impressions | CTR | Avg. position |
|---|---:|---:|---:|---:|
| Whole site | 944 | 121K | 0.8% | 12.9 |
| Brick, NJ town pages | 0 | 5 | 0% | 24.4 |
| Cheltenham, PA town pages | 0 | 2 | 0% | 17 |
| Howell, NJ town pages | 0 | 3 | 0% | 9 |
| Toms River, NJ town pages | 0 | 11 | 0% | 10.5 |
| Manhattan, NY guide | n/a: no pre-release city URL | 0 | n/a | n/a |

Notes:
- The exact URL filter behind each town row was not supplied. Before the day-14 checkpoint, attach the list of URLs each row covered (primary and consolidated pages) so later checkpoints use the same filter.
- Manhattan: `/swim-lessons/manhattan-ny.html` did not exist before this release. Its baseline is recorded as **zero / not applicable**, and its measurement starts on the launch date.

## Go/no-go result (ROLLOUT-MEASUREMENT.md §2)

**GO.** None of the four towns had a click in three months, and the largest town total was 11 impressions. The consolidation therefore cannot cost measurable organic clicks, and the no-go condition (a consolidated URL earning most of a town's clicks) cannot apply. Because the counts are so low, report later movement in absolute counts, not percentages.
