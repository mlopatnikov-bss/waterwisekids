# Internal Linking Report — 2026-09-24

**Result: NO ACTION. Nothing committed or pushed.**
Measured on a fresh clone of `origin/live` @ `cc2189cde` ("[publish] 1 net-new (how-to-teach-a-child-to-swim)…", 2026-09-24 08:15).
Compared against: yesterday's gate at `3c268962`.

## 1. Corpus: indexable `/education/` pages with `.article-body`

| | 09-23 (`3c268962`) | 09-24 HEAD |
|---|---|---|
| HTML files | 805 | 808 |
| education HTML | 556 | 559 |
| indexable with article-body | 442 | **444** |
| p\|li links in article-body | 6,946 | 6,998 |
| inbound floor | 2 | **2** |
| pages under 2 | 0 | **0** |
| broken hrefs in article-body | 0 | **0** |
| 2-donor band | 73 | 72 |

Blocking-class fingerprint unchanged (`article-related` 121 · `related-articles` 26 · `myth-card` 11), so the probe works the same way it did yesterday.

## 2. Post-publish gate: new pages since 09-23

| new page | inbound donors | verdict |
|---|---|---|
| `education/how-to-teach-a-child-to-swim.html` | 5 | healthy; in sitemap |
| `education/winter-swim-lesson-routine-card.html` | 6 | healthy; in sitemap |
| `education/winter-swim-lesson-routine-card-printable.html` | — | printable twin, outside the count |

## 3. Outbound (pages with the fewest links out to other education content)

- Floor = 1: `water-safety-myths.html`. **The probe miscounts this page; it isn't a real gap.** Its in-body links sit inside `.myth-card` blocks, which the probe skips. Checked by hand, the page has about 11 in-body contextual links (ruled editorial prose on 09-08).
- Next: `adaptive-aquatics-first-session-prep.html` at 2, and 18 pages at 3. Every page links out somewhere; the lowest counts are the same as yesterday.

## 4. Sitewide

- `internal_link_resolution_probe.py --canary`: **809 pages, 36,291 internal links, 0 broken targets, 0 broken fragments.** The canary test passed: the two deliberately broken test links were both caught.
- Sitemap: **669 URLs, 0 that don't resolve, 0 noindex pages listed.**

## 5. Why no links were added

Every check still passes: inbound floor of 2, no pages without outbound links, 0 broken links, and today's new page was already linked from other pages when it was published. Per the standing directive, links aren't added just to lift the pages that have only 2 inbound links. Recommendation stands: run this job as a check after each publish rather than as a daily linker.

## 6. Housekeeping (not touched)

The mounted repo's `live` branch has diverged from `origin/live` (273 local-only vs 32 remote-only commits). That state belongs to another task. All work was done in a `/tmp` clone, which the cleanup step removed.
Still open for Michael: rotate the GitHub token embedded in the mount's remote URL.
