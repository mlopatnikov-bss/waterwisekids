# Google Index Compliance Report — 2026-08-21

**Scope:** fresh clone of `origin/live` @ `de33408` (733 HTML files). The mounted
workspace was 60 behind / 272 ahead of `live` and was **not** used as the audit
source.

**Result:** all presence-level checks clean. One real Google structured-data
**policy violation** found and fixed. Deployed as `fe12a49` and verified live.

---

## Summary

| Check | Result |
|---|---|
| sitemap.xml well-formed | PASS (632 URLs, 0 duplicates, 0 off-host) |
| sitemap URLs resolving to a file | PASS (0 missing) |
| sitemap containing noindex URLs | PASS (0) |
| indexable pages missing from sitemap | 4 — intentional (see below) |
| JSON-LD parse validity | PASS (0 invalid/empty of ~11,000 nodes) |
| JSON-LD required fields | PASS (0 issues) |
| schema image URLs resolving on disk | PASS (0/133 broken) |
| `speakable` cssSelectors resolving in DOM | PASS (0/2301 match nothing) |
| canonical present | PASS (0 missing, 0 relative, 0 pointing at a 404) |
| noindex + cross-canonical conflict | PASS (0) |
| broken internal links | PASS (0) |
| links to redirect stubs (hops) | PASS (0) |
| meta description present / length / duplicates | PASS (0 missing, 0 >165 chars, 0 dupes) |
| `<title>` present / duplicates | PASS (0 missing, 0 dupes) |
| robots.txt | PASS (allows all, declares sitemap) |
| **FAQPage schema answer matches visible page text** | **73 pages failing → fixed 71, 11 pairs remain** |

---

## Fixed and deployed

### FAQPage `acceptedAnswer` text not present on the page — 110 pairs / 71 pages

Google's structured-data policy requires FAQ answer text to be visible on the
source page. On 73 pages the schema carried a **paraphrase** of the answer
rather than the page's actual answer text. The questions were visible; the
answers were not. Schema validators pass this — it only surfaces as suppressed
rich results or, at worst, a manual action.

Example (`best-age-for-swim-lessons.html`):

- schema said: *"It is never too late to learn to swim. Children of any age can benefit…"*
- page said: *"No—it is never too late to begin, and parents should not worry they missed the ideal window…"*

**Fix:** for each failing pair, matched the schema question to its visible
heading and replaced `acceptedAnswer.text` with the page's real answer prose.
Matching was exact-heading first, then fuzzy — but fuzzy matches were only
accepted when the question's distinctive content words also appeared in the
heading. That rule rejected 13 loose matches (e.g. schema *"What should kids
**wear** to swim lessons?"* nearly matched heading *"What should I **bring** to
swim lessons?"* at 0.86 similarity — correctly refused).

**Verification performed:**

- 0 changes outside `<script type="application/ld+json">` blocks (diffed both trees with script bodies masked)
- `Question` / `Answer` node counts unchanged at 2836 each — no content dropped
- all JSON-LD re-parses cleanly
- failing pages 73 → 11
- link, canonical, title, and meta-description checks re-run clean after the edit
- 6/6 sampled pages verified identical against the live site after deploy

Commit `fe12a49` → pushed to `live` → build confirmed (`last-modified`
09:12:18Z, 31s after push), live content matches repo.

**Sitemap `lastmod` deliberately NOT bumped** — the edits were schema-only and
did not change body text.

---

## Needs a content decision (not auto-fixed) — 11 Q&A pairs

These schema questions have **no visible answer anywhere on the page**. Each
needs either a visible Q&A block added, or the question removed from the
schema. Auto-rewriting them would have meant inventing a mapping.

| Page | Schema question with no visible answer |
|---|---|
| `what-should-kids-wear-to-swim-lessons.html` | What should kids wear to swim lessons? |
| `is-it-ever-too-late-for-a-child-to-learn-to-swim.html` | Is it ever too late for a child to learn to swim? |
| `when-should-kids-start-swimming.html` | When should kids start swim lessons? |
| `how-long-does-it-take-a-child-to-learn-to-swim.html` | How long does it take a child to learn to swim? |
| `education/twice-weekly-swim-lessons.html` | How often should kids have swim lessons? |
| `education/free-reduced-swim-lessons-make-a-splash.html` | How do I find free or low-cost swim lessons near me? |
| `education/swim-lesson-level-placement-guide.html` | What swim level should my child start in? |
| `education/swim-lessons-cost.html` | How much do swim lessons cost? |
| `education/what-is-usa-swimming-make-a-splash.html` | Is USA Swimming the same as the Make a Splash Foundation? (+2 more) |
| `education/five-layers-protection-drowning-prevention.html` | Do swim lessons really prevent drowning? |

Note the pattern: in most cases the schema question **is the page's own head
keyword**, and the page never states it as a question. That is the same
vocabulary gap as the hub-cannibalization issue — worth fixing for ranking
reasons as well as compliance.

---

## Verified-intentional, no action

**4 indexable pages absent from sitemap** —
`beginner-swim-lessons-{ambler,elkins-park,flourtown,glenside}-pa.html`. These
are the consolidated duplicate town twins: each carries a cross-canonical to
`/swim-lessons/{town}.html`, has zero inbound internal links, and is correctly
excluded from the sitemap. Consolidation is working as designed.

**23 cross-canonicals** — 19 are meta-refresh redirect stubs (correct: refresh
target and canonical agree, no noindex, not in sitemap). The other 4 are the
town twins above.

**78 noindex pages** — printables plus `404.html`, all self-canonical. No
noindex/canonical conflicts. 866 internal links point at them, which is normal
for downloadable printables.

**94 titles over 65 characters** — nearly all are directory state pages using
the deliberate `Swim Lessons in {STATE}` pattern. Left alone per standing
instruction not to revert that pattern. Longest is 89 chars
(`swim-lessons/directory/georgia.html`); these will truncate in SERPs but the
head keyword sits at the front, so the truncation is cosmetic.

---

## Notes

- **Google sitemap ping is deprecated** (retired June 2023) and was not called.
  Discovery now relies on the `Sitemap:` directive in `robots.txt`, which is
  present and correct, plus Search Console. No action available or needed here.
- `http://` still serves 200 without redirecting to `https://` — pre-existing,
  requires the "Always Use HTTPS" toggle in Cloudflare. Not touched.
