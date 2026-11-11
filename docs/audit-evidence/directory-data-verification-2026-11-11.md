# Directory-data verification — 2026-11-11

## Goldfish Swim School — Acworth

The audit flagged the Acworth listing's `(775) 459-7366` number because 775 is
associated with Nevada. The current official Goldfish Acworth page was fetched
again on 2026-11-11. Its visible telephone link and Organization JSON-LD both
publish `(775) 459-7366` / `+17754597366` for the Acworth location:

- https://goldfishswimschool.com/acworth/

WWK therefore retained the number. An area-code/location mismatch is a useful
review trigger, but it is not enough evidence to replace or delete an official
provider contact. If Goldfish changes the official page or confirms a correction,
the directory source, generated state page, API export, and preservation fixture
must change together.

## Newton Town Pool rendering

The New Jersey pool page now renders values in the visible facts section:

- Season: `Seasonal (not open all year)`
- Who can swim: resident, day-pass, and member descriptions with their stated
  conditions

Source domains appear only inside the expandable source list, where they belong;
they are no longer substituted for the visible fact values. The checked page is:

- https://www.waterwisekids.com/find-a-pool/new-jersey.html

## About page

The live `/about/` URL returned HTTP 200 and a normal WaterWiseKids title on
2026-11-11. It did not return the self-referencing redirect stub described in the
audit.
