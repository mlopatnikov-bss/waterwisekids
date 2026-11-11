# WWK independent review packets

These packets turn unpublished evidence batches and the first high-risk medical
review set into bounded review tasks. Each packet pins the exact input files by
SHA-256, identifies every decision the reviewer must make, and keeps publication
as a separate guarded code change.

The price and law reviewer must be a different person from the first reviewer,
disclose conflicts, open the official sources independently, and record
corrections rather than inferring missing fields. The medical packet also requires
verifiable role/credential evidence and makes approval exact-revision-specific. A
completed packet is evidence for a later release; it does not itself publish a
claim or reviewer line.

Rebuild or validate from the repository root:

```sh
python3 tools/wwk-independent-review/build_review_packets.py
python3 tools/wwk-independent-review/build_review_packets.py --check
```
