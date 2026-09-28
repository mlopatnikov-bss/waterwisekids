# Internal Linking Report — 2026-09-25

**Result: NO ACTION. Nothing committed or pushed.**
Measured on a fresh clone of `origin/live` @ `8d3987f` ("[publish] Goggles head-term fixes: /gear answer-first…", 2026-09-25).
Compared against: yesterday's gate at `cc2189c`.

## 1. Corpus: indexable `/education/` pages with `.article-body`

| | 09-24 (`cc2189c`) | 09-25 HEAD |
|---|---|---|
| HTML files | 808 | 810 |
| education HTML | 559 | 561 |
| indexable with article-body | 444 | **445** |
| p\|li links in article-body | 6,998 | 7,021 |
| inbound floor | 2 | **2** |
| pages under 2 | 0 | **0** |
| broken hrefs in article-body | 0 | **0** |
| 2-donor band | 72 | 72 |

Blocking-class fingerprint unchanged (`article-related` 121 · `related-articles` 26 · `myth-card` 11), so the probe works the same way it did yesterday.

## 2. Post-publish gate: new pages since 09-24

| new page | inbound donors | verdict |
|---|---|---|
| `education/parent-and-me-swim-class-card.html` | 6 | healthy; in sitemap |
| `education/parent-and-me-swim-class-card-printable.html` | 1 (its landing page) | noindex printable twin, outside the count; correctly not in sitemap |

## 3. Outbound (pages with the fewest links out to other education content)

- Floor = 1: `water-safety-myths.html`. **The probe miscounts this page; it isn't a real gap.** Its in-body links sit inside `.myth-card` blocks (ruled editorial prose on 09-08), and it has about 11 contextual links when counted by hand.
- Next: `adaptive-aquatics-first-session-prep.html` at 2, then a band at 3 (beach-sand-hole-collapse-safety, bubbles-through-nose-breath-control, celebrity-swim-school-endorsements, cpr-basics-parents, cpr-class, distance-vs-skill-based-swim-progress, …). Every page links out somewhere; nothing has changed since yesterday.

## 4. Sitewide

- `internal_link_resolution_probe.py --canary`: **810 pages, 36,390 internal links, 0 broken targets.** The canary test passed: the two deliberately broken test links were both caught.
- **4 "broken fragment" flags, all the probe's own mistake (new today, from this morning's goggles publish):**
  `swim-bag-essentials`, `swim-bag-checklist`, `first-swim-lesson-checklist`, `kids-swim-gear-fit-checklist` → `/gear/#best-goggles-for-kids`.
  The anchor exists: `gear/index.html` line 103 has `<section id="best-goggles-for-kids">`. The probe tries `gear.html` before `gear/index.html`. `gear.html` is a meta-refresh redirect stub (canonical `/gear/`) that doesn't have the anchor, so the probe wrongly reports the fragment as missing. The hosting serves `/gear/` (with the trailing slash) from `gear/index.html`, so these links work. **No content change is needed.** Suggested fix for the probe: when an href ends in `/`, try `base/index.html` before `base.html`.

## 5. Why no links were added

Every check still passes: inbound floor of 2, no pages without outbound links, 0 broken targets, and today's new page was already linked from 6 pages when it was published. Per the standing directive, links aren't added just to lift the pages that have only 2 inbound links. Recommendation stands: run this job as a check after each publish rather than as a daily linker.

## 6. Housekeeping (not touched)

The mounted repo's `live` branch has diverged from `origin/live` (273 local-only commits vs dozens remote-only), and ~400 files have uncommitted changes. That state belongs to another task. All work was done in a `/tmp` clone, which the cleanup step removed.
Still open for Michael: rotate the GitHub token embedded in the mount's remote URL.
