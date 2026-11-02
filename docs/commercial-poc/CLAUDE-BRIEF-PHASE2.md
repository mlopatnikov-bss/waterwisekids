# Claude task: WWK Commercial POC — Phase 2 instrumentation proposal

Read `docs/commercial-poc/PLAN.md`, the Phase 1 verification packet, event schema, manifest, and this brief in full before acting.

## Role and boundary

Claude is the implementation engineer. Codex reviews and either accepts or returns corrections. Phase 1 is accepted after 111/111 Mac-side tests and an independently verified native seed.

Build a reviewable **proposal only** under `commercial-poc/proposal/`. Do not edit any current public WWK HTML, shared production asset, middleware, sitemap, directory data, live checkout, external account, scheduler, or production service. Do not deploy, commit, push, merge, pull, rebase, reset, or checkout.

## Required proposal

1. A reusable, progressively enhanced sponsored-card component using plain HTML/CSS/JavaScript compatible with the current static WWK site.
2. An explicit `Sponsored pilot` label and plain outbound `<a href>` links using `rel="sponsored noopener"`.
3. A privacy-safe tracking client matching `commercial-poc/docs/EVENT-SCHEMA.md`:
   - stable opaque tenant/school/campaign/placement/location/destination IDs from the manifest;
   - in-memory per-page-load UUID only;
   - referrer category and coarse device class only;
   - `IntersectionObserver` viewability at >=50% for >=1 continuous second;
   - eligible view, viewable impression, sponsored click, and outbound click events;
   - `navigator.sendBeacon` when available with a non-blocking `fetch(..., {keepalive:true})` fallback;
   - no `preventDefault`, redirect wrapper, link rewriting, cookie, local/session storage, query-string capture, IP/user-agent handling, fingerprint, or PII;
   - collector failure must never block or delay navigation.
4. A documented UTM contract for official BSS destinations. Use only campaign tags needed by the sponsor's own analytics; never include a person or page-view identifier in a URL.
5. Exact proposed inventory for these eight sponsored pages only:
   - `/swim-lessons/northwest-philadelphia.html`
   - `/swim-lessons/cheltenham-pa.html`
   - `/swim-lessons/philadelphia.html`
   - `/swim-lessons/jersey-shore.html`
   - `/swim-lessons/howell-nj.html`
   - `/swim-lessons/brick-nj.html`
   - `/swim-lessons-toms-river-nj.html`
   - `/swim-lessons/directory/new-york.html`
6. For every page, provide an exact insertion point, the intended destination, manifest IDs, sponsor copy, source-conflict disposition, and a generated unified diff file. Generate diffs without modifying the source page.
7. Isolated proposal previews for desktop/mobile and keyboard review. The card must remain understandable without JavaScript and must not mimic organic ranking.
8. Tests that prove:
   - no public source file was changed;
   - every proposed ID/page/destination is in the manifest and tenant-owned;
   - every sponsored anchor is labeled and has the required `rel`;
   - no held location is promoted or linked;
   - tracking does not cancel navigation;
   - viewability is once per page view and requires the threshold/duration;
   - event schema shape, allowlisted paths/hosts, UTM values, and no-PII/no-storage rules;
   - failures in beacon/fetch are swallowed and ordinary links still work;
   - proposal diffs apply cleanly to the starting source snapshot in check mode, but are never applied to the worktree.

## Commercial/content rules

- Organic directory order stays editorial and is not changed.
- Sponsored inventory is visually separate and clearly labeled.
- Pilot price is $0; do not publish future prices or make performance guarantees.
- Copy may state factual service/location coverage from verified sources. Do not invent claims, ratings, availability, or outcomes.
- Andorra, Asbury Park, and Manhattan East Village remain held and must not be promoted or linked.
- The Manhattan card is territory-level on the existing New York directory page; do not create a Manhattan city page in this phase.
- Any unresolved source issue must stay visible in the inventory report and must not be silently fixed.

## Evidence required

Return changed paths, component and tracking design, exact page inventory, proposed diff summary, UTM examples, test/static-check results, no-public-file-change proof, desktop/mobile preview screenshots, keyboard/no-JS evidence, limitations, and Phase 3 prerequisites. Run heavy commands only through the external wrapper when available. Stop after the Phase 2 proposal; do not apply it.
