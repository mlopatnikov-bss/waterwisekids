# Territory growth activation

This layer turns a reviewed sponsor placement into a repeatable traffic-and-conversion program. It does not create sponsorship, change directory order or bypass the existing onboarding approval gates.

## One-day activation sequence

1. Run the existing sponsor onboarding packet and approve the exact placement.
2. Add the territory to `territory-program.json` with one primary URL, one support guide and one directory.
3. Add the territory to the privacy-preserving parent finder.
4. Link the support guide from the primary page, directory and education hub.
5. Run `npm run growth:audit` and the complete onboarding/staging suites.
6. Publish through the normal WWK release flow, then submit the sitemap and inspect the new URLs in Search Console.
7. Confirm portal events and begin the daily health / weekly optimization cadence.

The audit is read-only. It rejects missing pages, missing canonicals, missing sitemap entries, weak support guides, missing reciprocal links and finder omissions. A future sponsor can reuse the same structure without copying the pilot's school, campaign or destination IDs.

See `OPTIMIZATION.md` for the daily, weekly and monthly measurement cadence, experiment decision rules and new-school handoff.
