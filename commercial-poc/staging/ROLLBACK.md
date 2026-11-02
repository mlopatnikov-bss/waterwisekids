# Staging rollback plan

Rollback is service-by-service and preserves evidence.

1. **Stop new public events:** remove or disable the sponsored-card client endpoint/config on WWK, or disable the collector route. The Phase 2 client is nonblocking, so school links still navigate if collection is unavailable.
2. **Protect portal data:** disable the portal route or Access application allow policy. To remove only cross-account administration, revoke the administrator's `operator_roles` row; the fresh per-request check makes revocation immediate. Do not expose the Worker without Access.
3. **Worker code rollback:** deploy the last reviewed Worker version or remove its route. Collector and portal versions are independent.
4. **Database:** do not delete D1 during incident response. Record database ID, Worker versions, migration version, UTC time and quality status; export only minimized aggregate evidence under the approved retention/access process.
5. **Public content rollback:** reverse the exact Phase 2 proposal diffs. The proposal tests prove each diff applies and reverses cleanly and that directory order is unchanged.
6. **Post-rollback verification:** collector route unavailable or healthy as intended; portal blocked; WWK links navigate; no public layout regression; incident and recovery recorded.

Destructive D1 deletion is not part of normal rollback. It requires a separate retention decision and explicit action-time approval.


## Manhattan expansion (bss-manhattan-pilot-2026)

Manhattan can be rolled back on its own, without touching the Northwest Philadelphia or Jersey Shore cards or rows.

1. **Remove the card:** `git apply commercial-poc/onboarding/out/bss-manhattan-pilot-2026/rollback/remove-man-directory-new-york.diff` from the repository root, then publish through the normal reviewed process. This restores `/swim-lessons/directory/new-york.html` byte-for-byte to SHA-256 `f5785f02de1c24db19442bd9a4e956ca683758654cd42ab5c9fdf310dcf9cccc`, and `onboarding/test/manhattan.test.mjs` proves it.
1b. **Remove only the Manhattan guide card** (`plc_e487fb00e271338e`): `git apply commercial-poc/onboarding/out/bss-manhattan-pilot-2026/rollback/remove-man-guide-manhattan.diff`, then publish. This restores `/swim-lessons/manhattan-ny.html` to its editorial bytes (SHA-256 `a4006da0203569a756ec43b55bc3ff11139d1fb1f3fa1b97e61195a6aeb27162`, proven in `onboarding/test/manhattan.test.mjs`). The statewide card is untouched. The guide placement's D1 rows stay; with the card removed, it simply receives no events.
2. **Stop counting:** regenerate the packet with `--deactivate-on YYYY-MM-DD` and apply `deactivate.sql`. It ends only campaign `cmp_c7fea2983961d658` for tenant `ten_52bf92991a0305d0`, which means **both** Manhattan cards stop counting. To stop only one card, use step 1 or 1b.
3. **Portal:** there is no Manhattan user or membership to revoke. The administrator keeps read access for final reporting.
4. **Never delete** the Manhattan D1 rows during rollback; deletion needs a separate retention decision.

Regenerate the packet with `npm run onboard -- packet definitions/bss-manhattan-pilot-2026.sponsor.json --write` from `commercial-poc/onboarding/`. It writes to the git-ignored `out/` folder.
