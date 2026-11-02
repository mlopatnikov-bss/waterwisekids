# Phase 3 verification evidence

- `verification.json`: machine-readable result for static checks, 52 tests, migration/seed/reconciliation, both Worker dry-runs, real workerd E2E and guarded teardown.
- `test-output.txt`: complete Node test names and results.
- `e2e-output.txt`: real local workerd/D1 flow result.

The verifier contains no remote Cloudflare operation and removes only its marker-guarded local state directory. Accepted Phase 1/2 files and public WWK source are fingerprint-tested as unchanged.

- `manhattan-pilot-2026-11-02.md`: Manhattan expansion approval scope, verified venues, held location, placement, the no-control limitation and pending gates (gate evidence for `bss-manhattan-pilot-2026`).
