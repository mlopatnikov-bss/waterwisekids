# WWK Commercial Pilot — Manhattan expansion evidence (2026-11-02)

Status at review: **approved for activation.** The source changes and activation packet were reviewed independently on the Mac; production results are recorded separately after rollout. Nobody outside WWK has been contacted.

## Approval scope (gate `sponsor_terms`)

- The WWK owner (Mike) approved a **no-cost** Manhattan pilot on 2026-11-02 as a **separate sponsor account** (its own tenant, school, campaign and placement).
- Terms: `sponsored_pilot`, `price_cents = 0`, visible label `Sponsored pilot`, the standard no-fee disclosure sentence, campaign window 2026-11-02 to 2026-12-31 (same window as the live pilot).
- Portal access: the WWK administrator role only. No Manhattan user, invite, membership, Access policy entry or email exists anywhere in this repository or packet. The administrator role lists every tenant in D1, so the new tenant appears automatically once its rows exist.
- No sponsor-side person is named, identified or contacted. The original approval is held outside the repository.

## Source verification (gate `source_verification`)

Every location, address and destination comes from `commercial-poc/seed/sources/official-operator-snapshot-2026-11-02.json` and is cross-checked against `swim-lessons/directory/schools-data.js` (both are cited as facts in the definition).

| Venue | Address (official snapshot = directory data) | Official location page |
|---|---|---|
| Upper East Side - Dwight School | 2116 1st Ave New York, NY 10029 | `https://britishswimschool.com/manhattan/location/upper-east-side-dwight-school/` |
| St. Bart's Church | 325 Park Avenue New York, NY 10022 | `https://britishswimschool.com/manhattan/location/st-barts/` |
| BMCC (Borough of Manhattan Community College) | 77 Harrison Street New York, NY 10013 | `https://britishswimschool.com/manhattan/location/bmcc/` |
| John Jay College | 524 West 59th St New York, NY 10019 | `https://britishswimschool.com/manhattan/location/john-jay-college/` |
| Liberty Terrace | 380 Rector Pl New York, NY 10280 | `https://britishswimschool.com/manhattan/location/liberty-terrace/` |
| Wall Street | 88 Fulton St New York, NY 10038 | `https://britishswimschool.com/manhattan/location/wall-street/` |
| The Continental | 885 6th Ave (between 31st and 32nd Streets) New York, NY 10001 | `https://britishswimschool.com/manhattan/location/the-continental/` |

Territory destination: `https://britishswimschool.com/manhattan/`.

**Held:** East Village (`loc_f5b267a33189a894`). The official page shows both 720 and 710 E 11th Street and the venue is absent from WWK directory data (conflicts C08/C09). It is not named, shown, linked, seeded or counted.

## Placement

One sponsored card only, on the existing page `/swim-lessons/directory/new-york.html` (3,228 editorial words, self-canonical, the only WWK page with Manhattan editorial content). No city page was created.

- Placement `plc_10e8497ef216c69d` (slot `man-directory-new-york`), `venue_list` with all seven verified venues plus the territory link.
- Inserted after the existing "inclusion is not a ranking" disclaimer inside `section#cities`, outside `#schoolsList`. It is a pure 22-line insertion: removing the card block restores the page to its previous bytes (SHA-256 `f5785f02de1c24db19442bd9a4e956ca683758654cd42ab5c9fdf310dcf9cccc`). Directory order, the organic Manhattan row, JSON-LD and all existing copy are unchanged.
- Every link is `rel="sponsored noopener"` to an official `britishswimschool.com` page with `utm_source=waterwisekids`, `utm_medium=sponsored_pilot`, `utm_campaign=cmp_c7fea2983961d658`, `utm_content=plc_10e8497ef216c69d`.
- The `venue_list` cap was raised from 6 to 7 (`onboarding/src/schema.mjs` `MAX_PLACEMENT_LOCATIONS`, enforced again in `render.mjs`).

## Known limitation: no ordinary-listing control for Manhattan

Manhattan launches **without a paired ordinary-listing control** (owner decision, option (a)).

- The only Manhattan ordinary listing (`school-british-swim-school-of-manhattan-ny`) is a territory-level row that links the territory page, not a location page, and it sits on the same page as the sponsored card. The control rules (`onboarding/src/controls.mjs`) would refuse it (`control_row_mismatch`, `control_contaminated`, `missing_control`), and the editorial row is not changed to make it fit.
- The card features several locations, so even with a control it would be excluded from the location-paired comparison.
- In the pilot portal the Manhattan comparison section shows "Your ordinary directory listing is not measured yet" and no comparison figures. Sponsored-card figures are reported on their own, with no lift or baseline claim.

## Activation packet (offline, regenerable)

`npm run onboard -- packet definitions/bss-manhattan-pilot-2026.sponsor.json --write` from `commercial-poc/onboarding/` writes `onboarding/out/bss-manhattan-pilot-2026/` (git-ignored). It contains 13 files: cards, `d1-preflight.sql`, `d1-upsert.sql`, an empty `portal-memberships.sql`, the portal checklist, the content worklist, `rollback.md` and `rollback/remove-man-directory-new-york.diff`.

- Definition SHA-256 (canonical): `a4fc94dbdaca9a4999fc38898319956dda4957a1c9c3adff69bce4e787a69400`
- Packet SHA-256: `cf0ad3c8a05332b813410dd3d1792df730c59a4170885c23070113bdc8172c5f`
- Counts: 1 tenant, 7 locations, 8 destinations, 1 campaign, 1 placement (`unchanged`, because the page patch is already in the worktree), 0 portal users, 19 IDs. Network, deploy and database actions are all 0.
- Patched page SHA-256: `cfe4515bb42aac5af13c69ca35b48a82cd2155a0dde9f5e2910536e9abdbd3a3` (before: `f5785f02…cccc`).
- `onboarding/test/manhattan.test.mjs` proves `d1-upsert.sql` turns today's two-tenant live database into exactly the three-tenant seed from `staging/scripts/build-pilot-seed.mjs`. It is idempotent, leaves existing tenants' rows untouched, creates no user or membership, and contains no DELETE or DROP.

## Approval gates

- `editorial_review`: recorded after confirming the sponsored disclosure, unchanged directory order, official destinations and absence of ranking/lift claims.
- `preview_qa`: recorded after desktop review of the generated page and mobile review of the byte-equivalent Manhattan card in `commercial-poc/proposal/evidence/previews/preview-report.json`; no overflow or console errors were reported.
- `portal_access`: recorded for the existing WWK administrator role. The portal resolves administrator access dynamically across every present and future tenant; no sponsor-side user or membership is created.
- `activation`: recorded from the owner's explicit 2026-11-02 approval to proceed with the Manhattan pilot.

## Addendum (2026-11-02, later the same day): second Manhattan placement

The owner later approved a second, independently attributed card (`plc_e487fb00e271338e`) on the new editorial guide `/swim-lessons/manhattan-ny.html`. The card described above is unchanged: same page bytes, same ID, same reporting. See `manhattan-guide-placement-2026-11-02.md`.
