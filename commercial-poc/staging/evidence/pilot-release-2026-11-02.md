# WWK Commercial Pilot release evidence — 2026-11-02

## Scope

- Mike-only pilot; Manhattan is excluded.
- Northwest Philadelphia: LA Fitness Cheltenham.
- Jersey Shore: LA Fitness Howell, Brick, and Toms River.
- Seven sponsored cards across seven relevant WWK pages.
- Every paid-style placement is visibly labeled `Sponsored pilot` and uses `rel="sponsored noopener"`.
- Every outbound link points to an official `britishswimschool.com` page with WWK campaign parameters.

## Cloudflare resources

- D1: `wwk-commercial-pilot` (`dc43f768-372f-4ba3-854f-4883e1cebda4`).
- Collector Worker: `wwk-commercial-collector-pilot` at `events.waterwisekids.com`.
- Portal Worker: `wwk-commercial-portal-pilot` at `sponsors.waterwisekids.com`.
- Access application: `WWK Commercial Pilot Portal` (`80a729df-aa92-4ece-a9b3-aaa07f754846`).
- Access policy: `WWK Commercial Pilot administrator` (`4879d3e8-629d-4037-a6bd-b41674b3c3a1`).

The portal identity key is stored only as a Worker secret. D1 stores only a 68-character opaque HMAC subject, never an email address.

## Verification

- 51 applicable staging tests passed.
- Static analysis: 53 files scanned, 39 modules checked, 0 findings.
- Pilot manifest: 2 tenants, 4 approved locations, 2 campaigns, 7 placements.
- Initial live database: 0 events, 0 daily metrics, 0 conversions; no synthetic activity was loaded.
- Browser smoke test confirmed both sponsor accounts are visible to the administrator and can be switched without changing identity.
- Desktop visual review confirmed the sponsored card is clearly separated from editorial content and remains readable in the existing WWK layout.

The two legacy proposal-boundary tests are intentionally not release gates: they require the public source tree to remain byte-identical and the proposal diffs to apply to an unmodified tree. This release activates those reviewed diffs, so equivalent release-specific assertions validate the seven final pages instead.
