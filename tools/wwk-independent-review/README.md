# WWK independent review packets

These packets turn two unpublished evidence batches into bounded second-review
tasks. Each packet pins the exact candidate and source-fingerprint files by
SHA-256, identifies every decision the reviewer must make, and keeps publication
as a separate guarded code change.

The reviewer must be a different person from the first reviewer, disclose
conflicts, open the official sources independently, and record corrections rather
than inferring missing fields. A completed packet is evidence for a later release;
it does not itself publish any price or legal claim.

Rebuild or validate from the repository root:

```sh
python3 tools/wwk-independent-review/build_review_packets.py
python3 tools/wwk-independent-review/build_review_packets.py --check
```
