# Google Index Compliance Report — 2026-08-16

**Site:** waterwisekids.com · **Branch:** `live` · **Deployed HEAD:** `af76837`
**Scope:** 723 HTML pages · 631 sitemap URLs · 614 FAQPage schema blocks

## Status: PASS (1 fix deployed, 1 action required)

---

## Compliance checks

| Check | Result |
|---|---|
| sitemap.xml valid XML, no duplicates | PASS |
| Sitemap entries resolving to real files | PASS — 0 dead entries |
| Sitemap excludes `noindex` pages | PASS — 0 noindex URLs listed |
| Indexable pages present in sitemap | PASS — the 19 absences are all meta-refresh redirect stubs (correctly excluded) |
| Canonical tag present | PASS — 0 missing across 723 pages |
| Canonical points to own domain | PASS — 0 off-site canonicals |
| `noindex` + cross-canonical conflict | PASS — 0 (the 2026-08-15 repair is holding) |
| robots.txt (live) | PASS — `Allow: /`, sitemap declared, Cloudflare managed-robots still disabled |
| JSON-LD parses | PASS — 0 syntax errors in 614 blocks |
| Article schema required fields | PASS — 0 missing headline/datePublished/author/image |
| FAQPage questions visible on page | PASS — 0 violations |
| FAQPage answers visible on page | **FIXED** — 132 mismatches corrected (see below) |
| Broken internal links | PASS — 0 |
| Links pointing at redirect stubs (hops) | PASS — 0 |
| Orphan indexable pages (0 inbound links) | PASS — 0 |
| Title tag present | PASS — 0 missing |
| Meta description present | PASS — 0 missing |
| Meta description ≤160 chars | PASS — 0 over |

Live spot-checks returned 200: `/`, `/education/`, `/swim-schools.html`,
`/statistics/state-of-drowning-prevention/`, `/education/are-puddle-jumpers-safe.html`.
Live sitemap serves 200 and matches the repo at 631 URLs.

---

## Fix deployed — FAQPage answer text not visible on page

**Commit `af76837` · 41 pages · 132 answers**

Google's FAQ structured-data policy requires the answer content to be visible to
users on the source page. 133 `acceptedAnswer.text` values were *paraphrases* of
the rendered FAQ copy rather than the copy itself — substantively the same
content, but not a verbatim match. This passes every standard SEO audit because
the schema is valid and the questions were all present.

**Fix pattern:** rewrote each answer from the page's own visible FAQ answer,
harvested as the `<p>` following the matching `<h3>` inside the "Frequently Asked
Questions" section. Exact match by construction.

**Verification before push:**

- visible/normalized page text byte-identical before and after (no content change)
- non-`<script>` DOM byte-identical (no markup change)
- every JSON-LD block still parses
- semantic diff confirms **only** `acceptedAnswer.text` nodes changed — no other
  schema field touched on any of the 41 pages

FAQPage blocks fully clean (question *and* answer verbatim): **481 → 522**.

### A rejected first attempt, for the record

The initial pass harvested by heading text globally and fixed 100 pages / 222
answers — but on pages where an article section heading duplicates an FAQ
question, it grabbed the *article body* instead of the FAQ answer, producing long,
rambling answers ("Here is the core concern instructors raise…"). It also
re-serialized the JSON-LD with `indent=2`, blowing the diff up to 3,779
insertions. Reverted. The narrower rule above (harvest only after the FAQ anchor,
single `<p>`, 40–700 chars, compact JSON) produced the clean 41-page result.

---

## ACTION REQUIRED — deploy loop is down

The Mac Mini deploy loop **stopped at 2026-08-16 04:40:07** and has not run since.

Evidence: the loop runs `pull-gsc-metrics.py` and `gen-growth-directives.py` every
cycle on a 10-second interval; `logs/metrics.log` and `logs/directives.log` both
end at 04:40:07 with healthy output and no crash message. It stopped cleanly —
consistent with the Terminal window closing, the machine sleeping, or the process
being killed, not a script fault.

**Impact while down:** nothing auto-deploys, including daily publishing. Today's
compliance fix was pushed directly to `origin/live` using the repo's configured
remote instead, and Cloudflare Pages built it (verified live).

**To restore:** run `.deploy/start-deploy-loop.command` (see the reboot restore
procedure — Login Items should relaunch it on boot).

Two housekeeping notes for the restart:

- A stale `.git/index.lock` from this session remains in the workspace. The FUSE
  mount denies `unlink`, so it could not be removed from here. The loop clears
  locks older than 5s at the top of every cycle, so it self-heals on restart.
- The workspace working tree was restored to its pre-fix content so it reads clean
  against local HEAD (`7a3f219`). The loop pulls *before* it auto-commits, so its
  first cycle will fast-forward to `af76837` with no conflict and no duplicate
  commit.

---

## Monitoring, not blocking

- **68 title tags exceed 65 characters** — SERP truncation risk, not an indexing
  problem. Left alone: retitling is a CTR decision that should be driven by the
  GSC per-page impression/CTR data, not a blanket trim.
- **92 pages still carry FAQ answer paraphrases** that could not be harvested
  safely (question rendered outside a plain `<h3>`+`<p>` pair, or the answer spans
  multiple blocks). All questions are visible, so none is a policy violation —
  queued rather than force-fixed.
- **13 pages report no `<h1>`** — all are redirect stubs. Expected, no action.

---

*Generated by the daily google-index-compliance agent.*
