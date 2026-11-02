# Staging rollback plan

Rollback is service-by-service and preserves evidence.

1. **Stop new public events:** remove or disable the sponsored-card client endpoint/config on WWK, or disable the collector route. The Phase 2 client is nonblocking, so school links still navigate if collection is unavailable.
2. **Protect portal data:** disable the portal route or Access application allow policy. To remove only cross-account administration, revoke the administrator's `operator_roles` row; the fresh per-request check makes revocation immediate. Do not expose the Worker without Access.
3. **Worker code rollback:** deploy the last reviewed Worker version or remove its route. Collector and portal versions are independent.
4. **Database:** do not delete D1 during incident response. Record database ID, Worker versions, migration version, UTC time and quality status; export only minimized aggregate evidence under the approved retention/access process.
5. **Public content rollback:** reverse the exact Phase 2 proposal diffs. The proposal tests prove each diff applies and reverses cleanly and that directory order is unchanged.
6. **Post-rollback verification:** collector route unavailable or healthy as intended; portal blocked; WWK links navigate; no public layout regression; incident and recovery recorded.

Destructive D1 deletion is not part of normal rollback. It requires a separate retention decision and explicit action-time approval.

