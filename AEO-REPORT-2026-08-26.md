# AEO Optimizer — Run 2026-08-26 (Batch 45)

**Status: shipped and verified live.** Commit `5cec592` on `live`.

## What was optimized

| File | Question H2s | Other |
|---|---|---|
| `education/indoor-pool-safety-checklist.html` | 0/5 → **5/5** | — |
| `education/spot-drowning-warning-signs-card.html` | 0/6 → **6/6** | **+HowTo JSON-LD (4 steps)** |
| `education/community-pool-swim-lessons-vs-swim-school.html` | 2/7 → **7/7** | — |

Two of the three were at **zero** convertible question H2s. All three already carried Article + speakable + FAQPage + BreadcrumbList, so headings were the whole gap — plus one missing HowTo.

Scope was re-derived from a fresh `origin/live` clone (660 indexable pages re-scored), not inherited from the previous backlog list.

## The backlog number was wrong — and it was wrong in a specific way

The prior run reported **51** true-article pages under 50% question H2s. Re-scoring gives **32**.

The gap is a heading class nobody had excluded: every page in the `*-card` / `*-checklist` lead-magnet cluster carries **two CTA H2s** — `Get the free printable X` and `Get the Free X + Weekly Tips`. They are site convention, they are never convertible, and they were sitting in the denominator. On a 7-H2 page that is 29% of the score. The cluster that "dominates the next tier" is exactly the cluster that was being over-counted, so the tier was partly an artifact of the scorer.

A second scorer bug found while reading output: the utility-exclusion regex matched `find` as a prefix, so `Finding Quality Lessons Near You` was silently dropped from the convertible set on the community-pool page. It was a real, convertible heading. Substring matching without word boundaries, again — both patterns are now anchored.

## Three findings worth keeping

1. **A proposed heading can collide with its own page's FAQ.** `What is the difference between aquatic distress and active drowning?` scored **0.945** against an `<h3>` in the same file's FAQ block. The dup check has to include the page being edited, not just the rest of the site. Re-aimed to `What separates a swimmer in distress from one who is drowning?` (0.571) — the section's unique claim is that distress is the stage where the swimmer *can still call out*, which the FAQ does not cover.
2. **Under-threshold is not the same as safe.** `What does the chlorine smell at an indoor pool really mean?` scored 0.762 — legal under the 0.80 rule — against `pool-chemical-safety.html`'s near-identical H2. Passing the rule while duplicating the topical owner's query is how cannibalization gets shipped. Re-aimed to `What does a strong chemical smell at an indoor pool tell you?` (0.636).
3. **Count the list before you put the count in the heading.** The drafted `What are the first three things to do when someone is drowning?` was written from a truncated read of the section. The list has **four** items. Corrected to `first four steps` before commit — a heading that miscounts its own section is worse than a statement heading, because it looks authoritative and is wrong.

Emoji prefixes on this cluster are HTML entities (`&#x1F3E0;`) in the body H2s but **raw UTF-8** in the `📚 Authoritative Sources` H2 of two of the three files. Replacements preserved the exact prefix bytes rather than re-encoding.

## Validation

- **Body DOM signature diff vs HEAD (scripts stripped): 190/190, 215/215, 259/259 — identical** tag/id/class sequence.
- All non-`<h2>` text (h1, h3, h4, p, li) byte-identical to HEAD. Every `<h2 id>` preserved.
- Parsed with html5lib: 16 metas in `<head>`, **0 in `<body>`**, canonical in head.
- JSON-LD clean on all three; FAQ names unique (5/5/5); every FAQ question visible on the page; **FAQ answer drift 0**.
- Speakable selectors → 4/4 resolving per file.
- All 4 HowTo steps verbatim against page text; `#respond` anchor resolves.
- Meta descriptions unchanged (158/156/152 decoded, no unescaped quotes); 0 placeholders; 0 nested anchors; brand-voice ownership scan 0 hits.
- Collision check: 21 candidate headings scored against **6,780** question headings sitewide + intra-batch. Final set — worst score **0.766**, 0 collisions.
- `dateModified` + `sitemap.xml` lastmod bumped for **exactly these 3 URLs** (637 entries, re-parsed clean as XML). No blanket bump.
- Live-verified after deploy: all 18 headings serving, HowTo schema present, sitemap lastmod live.

## Backlog

**32 education articles** remain under 50% question H2s (down from an inflated 51). Next by size: `water-slide-safety-checklist` (2/7), `swim-strokes-guide-kids` (3/7), `new-jersey-pool-fence-law` (1/7), `national-water-safety-action-plan-explained` (1/11), `end-of-summer-swim-skills-report-card` (1/7), and three more at **0/5** — `rolling-recovery-jump-recovery-methods`, `independent-swimming-readiness-checklist`, `drowning-cpr-quick-card`.

`scholarships/index.html` (1/12) surfaces high on size but is a **listing page** — its H2s are foundation names (`Hope Floats Foundation`, `The ZAC Foundation`). Excluded as a class, same as `education/index.html` and the directory pages.

## Note for Michael

Published by direct push from a `/tmp` clone again — no git write commands were run inside the mounted repo. Nothing here needs a decision from you.
