# Manhattan guide placement — activation evidence (2026-11-02)

Status: **production D1 activated; website publication pending.** The source change, seed, tests and production D1 upsert are complete. The public page still follows the normal reviewed publish step. Nobody outside WWK has been contacted.

## Approval (gates `sponsor_terms` and `activation`)

- The WWK owner explicitly approved a **second** transparent sponsored placement for the Manhattan pilot on 2026-11-02 and instructed the team to build it. The approval was given under the owner's own account; the original is held outside the repository, and no personal identifier is recorded here.
- Terms are unchanged from the first Manhattan card (`manhattan-pilot-2026-11-02.md`):
  - same tenant `ten_52bf92991a0305d0`, school and campaign `cmp_c7fea2983961d658`;
  - `sponsored_pilot`, `price_cents = 0`;
  - label `Sponsored pilot` with the standard no-fee disclosure;
  - campaign window 2026-11-02 to 2026-12-31.
- Portal access: unchanged. Administrator role only; no sponsor user, membership or invite.

## Placement

| | Statewide card (unchanged) | Guide card (new) |
|---|---|---|
| Slot | `man-directory-new-york` | `man-guide-manhattan` |
| Placement ID | `plc_10e8497ef216c69d` | `plc_e487fb00e271338e` = `stableId('plc', 'https://britishswimschool.com/manhattan/#man-guide-manhattan')` |
| Page | `/swim-lessons/directory/new-york.html` (SHA-256 `cfe4515b…dcbd3a3`, byte-identical) | `/swim-lessons/manhattan-ny.html` (editorial guide, 2026-11-02) |
| Variant | `venue_list`, 7 venues + territory | `venue_list`, 7 venues + territory |
| UTM `utm_content` | `plc_10e8497ef216c69d` | `plc_e487fb00e271338e` |

- Venues and addresses come only from `commercial-poc/seed/sources/official-operator-snapshot-2026-11-02.json` and match the WWK directory data. East Village stays held (`loc_f5b267a33189a894`).
- **Position:** after the guide's editorial "Which Manhattan Pools Are in the WWK Directory?" section, before "Where Else Can Manhattan Families Look?". The guide's editorial venue table links are plain editorial links (no UTM, not `rel=sponsored`).
- **Disclosure on the page:** the guide's "About Sponsorship" section states that the guide carries one labeled no-fee card and the NY directory carries another.
- **Rollback is pure:** the card was inserted by the onboarding packet patch. Removing the card block restores the editorial page to SHA-256 `a4006da0203569a756ec43b55bc3ff11139d1fb1f3fa1b97e61195a6aeb27162`.

## Gates

| Gate | Evidence |
|---|---|
| `sponsor_terms` | The owner approval above. |
| `source_verification` | Unchanged (official snapshot 2026-11-02). |
| `editorial_review` | Label, disclosure sentence, `rel="sponsored noopener"`, official destinations only, no ranking or lift claims, and the guide's editorial content unchanged around the card. The territory SEO audit confirms the 1,303 editorial words exclude the card, all addresses are verified, and the page has no prices or phone numbers. |
| `preview_qa` | Headless Chromium at 1280px and 375px with the collector blocked (`screenshots/manhattan-guide-card-1280.png`, `screenshots/manhattan-guide-card-375.png`). Results below. |
| `portal_access` | Unchanged: administrator role only. |
| `activation` | The owner approval above. The production D1 upsert was applied on 2026-11-02; website publication remained pending when this evidence was recorded. |

`preview_qa` results:
- The "Sponsored pilot" label is visible.
- 8 of 8 links are `rel="sponsored noopener"`.
- No horizontal overflow and no page errors.
- 3 beacons (`eligible_view` etc.) were attempted with the guide placement ID.
- A card click still navigated to the tagged official BMCC page even with tracking unavailable.

## Seed, allowlist and reporting

- **Manifest:** `seed/pilot-tenants.json` gained the slot. `scripts/build-manifest.mjs` regenerated `seed/pilot-manifest.json` with +1 placement, +1 placement page, +8 placement destinations, and the Manhattan inventory note updated in place (still 10 conflicts). `docs/SOURCE-CONFLICTS.md` was regenerated.
- **Pilot seed:** the pilot seed (`staging/scripts/build-pilot-seed.mjs`) now has 9 sponsored placements and 11 locations, with no events, users or memberships.
- **Collector allowlist:** this is the D1 `placement_pages` table. Each Manhattan placement is valid only on its own page. Tests prove that cross-page reuse of either ID is rejected and that `byPlacement` reports the two cards separately.
- **Live D1 step:** complete on 2026-11-02. Ten equivalent bounded preflight queries returned zero conflicts (the single generated compound query exceeded D1's compound-select term limit and changed no data). The onboarding packet's idempotent `d1-upsert.sql` then completed 39 statements and wrote 42 rows, including exactly 1 new placement, 1 placement page and 8 placement destinations for `plc_e487fb00e271338e`; the other writes were idempotent updates to the existing Manhattan pilot records. Post-write checks found both Manhattan placements on only their approved pages, 8 destinations apiece, zero sponsor memberships and zero guide events before publication.
- **Definition:** `onboarding/definitions/bss-manhattan-pilot-2026.sponsor.json`, canonical SHA-256 `e3aea130ff83d4814c38f5dfef91e16b90afd099ca448f6bbc6c9300cdeef525`.
- **Packet:** SHA-256 `b797ec7d91be539b65a25df86830025d5241eb02ce2404d597465111318dd7e2` (regenerated after the Codex correction round fixed the guide's FAQ toggle selector; the card bytes are unchanged). Both page actions are `unchanged`, there are no pending gates, and network, deploy and database actions are all 0.

## Remaining production steps

1. Publish the guide page through the normal reviewed process. The card is already in the page source.
2. Within 15 minutes, load `/swim-lessons/manhattan-ny.html` and confirm the collector records an `eligible_view` for `plc_e487fb00e271338e`, separate from `plc_10e8497ef216c69d`.

Order matters: apply D1 before publishing. If the page goes live first, the collector correctly rejects guide events as an unknown placement or page until the upsert runs. Navigation is never blocked.
