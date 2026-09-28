# AEO Optimizer — Run 2026-08-25 (Batch 44)

**Status: shipped and verified live.** Commit `5895638` on `live`.

## What was optimized

| File | Words | Question H2s | Other |
|---|---|---|---|
| `education/swim-lesson-levels-explained.html` | 3,521 | 6/16 → **13/16** | — |
| `education/swimtastic-safesplash-swimlabs-comparison.html` | 2,884 | 4/11 → **8/11** | — |
| `education/water-rescue-reach-throw-dont-go-card.html` | 2,795 | 2/13 → **8/13** | **+HowTo JSON-LD (4 steps)** |

All three are now at 100% of *convertible* H2s. The remaining statement headings are the utility ones the site convention leaves alone (`📚 Authoritative Sources`, `Frequently Asked Questions`, `Keep Reading`) plus two CTA blocks on the rescue card.

## Scope was re-derived, not inherited

Re-scored all 741 HTML files in a fresh `origin/live` clone. 55 pages scored under 50% question H2s. The top four by size were **listing pages** — `education/index.html` (14,571w, 356 `<h3>`), `swim-lessons/directory/{new-jersey,pennsylvania}.html`, `aquatic-jobs/index.html` — whose statement H2s (`Cities We Cover`, `Local Swim Lesson Guides`) are correct by design. Converting those would damage the directory. They were excluded as a class, not "fixed."

## Three findings worth keeping

1. **A heading can be a question and still not be extractable.** `🐬 What Is Swimtastic? The Beginner-Focused Brand` reads as a question but terminates in a label, so heading-text matching stops on the wrong token. Re-formed to end on the question mark.
2. **A numbered ladder needs a pattern, not free rewriting.** Six sequential `Level N: <skill>` headings would have become six ~0.9-similar siblings if converted to bare questions. Keeping `Level N:` as a prefix and questioning only the predicate preserved the scannable ladder and kept every intra-batch pair under 0.80.
3. **One collision — and the fix was to re-aim the section, not reword it.** The proposed `Step 3: Why Shouldn't You Swim Out to a Drowning Person?` hit **0.826** against this page's own FAQ entry. Rather than paraphrase, the H2 was pointed at the query the section uniquely answers (`When Is It Ever Safe to Go In After Someone?`), leaving the "why not" query to the FAQ. Final: **0 collisions across 17 proposed headings vs 6,720 question headings sitewide.**

## Validation

- **DOM signature diff vs HEAD (scripts stripped): 522/522, 234/234, 243/243 — byte-identical** tag/id/class sequence. Only `<h2>` inner text changed; every `<h2 id>` preserved.
- Parsed with html5lib: 16 metas in `<head>`, **0 in `<body>`**, canonical in head (no unescaped-quote break).
- JSON-LD clean; **FAQ answer drift 0** (6/5/6 Q&A); all 4 HowTo steps verbatim with resolving anchors; speakable selectors each → exactly 1 match.
- Meta descriptions unchanged; 0 placeholders; 0 nested anchors; **brand-voice ownership scan 0 hits**.
- `dateModified` + `sitemap.xml` lastmod bumped for **exactly these 3 URLs** (636 entries, re-parsed clean). No blanket bump.
- Live verified after deploy: all three headings serving, HowTo schema present, `robots.txt` clean (no Cloudflare managed block).

## Backlog

**51 true-article pages remain under 50% question H2s** (13 listing-class pages excluded). Next up: `swim-milestones-by-age` (2,574w, 3/11), `water-slide-safety-checklist` (2,545w, 2/12), `indoor-pool-safety-checklist` (2,494w, **0/10**), `community-pool-swim-lessons-vs-swim-school` (2,412w, 2/10). The `*-card` / `*-checklist` cluster dominates the next tier — collisions are the norm there, so the sitewide 0.80 dup check is mandatory before committing.

Nine non-education pages also remain (`swim-schools.html`, `find-swim-lessons.html`, `british-swim-school/*`, five `swim-lessons/*` town pages) — screen each for listing-vs-article first.

## Note for Michael

The deploy loop still looks down — this run published by direct push from a `/tmp` clone, which worked end to end. No git write commands were run inside the mounted repo.
