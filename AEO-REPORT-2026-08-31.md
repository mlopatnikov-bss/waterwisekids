# AEO Report — 2026-08-31 (Batch 50)

Scope re-derived from a fresh `origin/live` clone at `97152a1`. The mount was again stale (`2476831c`, 2026-08-20, with uncommitted working-tree changes from an older run) — **audited the clone, not the mount**, per standing rule.

**Optimized this run (3 files):**

| File | Words | H2 question ratio | Other changes |
|---|---|---|---|
| `education/conditioning-mile-swim-goal.html` | 1,430 | 0/5 → **5/5** | AAP figure corrected; AAP hyperlinked inline |
| `education/bubbles-through-nose-breath-control.html` | 1,394 | 0/5 → **5/5** | headings only |
| `education/body-awareness-exercises-swimmers.html` | 1,371 | 0/5 → **5/5** | headings only |

All three finish at **100% of convertible H2s**. Backlog **18 → 15**.

### The finding that mattered most: word-boundary anchoring was not enough

Batch 49 fixed the skip list by anchoring `sources` to `\bsources\b`, after bare `sources` was found eating "re**sources**". Re-deriving the scorer from scratch this run showed **the anchored version still eats legitimate content questions**, because a skip term can word-boundary-match a real topic:

- `What Backyard Water **Sources** Pose Seasonal Hazards?` (`home-water-safety-framework`, `child-wont-wear-life-jacket`) — "water sources" is a genuine subject heading, matched by `\bsources\b`.
- `How do I **get the** right fit?` and `🎯 How do I **get the** right fit for kids' swim goggles?` (`swim-goggles-for-kids`) — matched by `\bget the\b`.

These headings **already end in `?`**, so skipping them removed each from the numerator *and* the denominator — deflating the ratio of pages that had done the work correctly.

**The fix is not a better substring; it is a different test.** Utility headings are identified by **role**, via whole-heading anchored patterns (`^authoritative sources$`, `^keep reading$`, `^related .* (reading|articles)$`), and the lead-magnet CTA class requires **an acquisition verb AND a printable noun to co-occur** (`get|download|grab|print` … `printable|pdf|checklist|card|worksheet`) rather than either alone. Emoji prefixes are stripped before matching.

The scorer now **asserts its own skip set**: any skipped heading that ends in `?` without a printable noun is reported as suspicious. That assertion returns **0** — previously it would have returned 4. Under-50% count is 18 either way, so, exactly as in Batch 49, **the aggregate was right while individual denominators were wrong.** Generalizable: *assert the composition of the skipped set, not its size — and never skip a heading that is already a question unless it is provably a CTA.*

### The second finding: a number attributed to a named authority that the authority does not state

`conditioning-mile-swim-goal.html` asserted, in body prose: "The American Academy of Pediatrics guidance on youth sports recommends building volume gradually (**no more than ten percent** week-over-week increases)…"

The AAP's own parent-facing guidance says **10% to 20%**: "student athletes do not add more than 10% to 20% to their weekly training loads at a time." The page was **tightening AAP's range and presenting the tightened version as AAP's** — a misattribution to a named authority, not a rounding difference.

Fixed: the figure now reads "adding no more than **ten to twenty percent** to a weekly training load at a time," and the inline mention of the AAP — previously **named but never hyperlinked** — now links to the specific source that carries the claim, rather than to the generic `/sports/` landing page already in the sources block. **Verified before linking**: the destination was GET-probed (200) *and its rendered text was searched for the claim*, per the "probe the replacement destination" rule. `publications.aap.org` returned 403 behind Cloudflare ("Just a moment…") — zero information, not a dead link, so it was not used.

The companion claim on the same sentence ("at least one full rest day per week") **was verified and left alone** — AAP recommends at least 1–2 days off per week from sport-specific training, so the page's conservative reading is sound.

The claim was **confirmed absent from the JSON-LD** before editing, so this was a pure prose fix with no schema coupling — unlike the Batch 47 `teaching-kids` superlative, which remains flagged precisely because it *is* in the FAQ schema.

### Collision handling

15 proposals scored against a **6,186-heading** sitewide corpus (h1+h2+h3 ending in `?` across 753 files) plus intra-batch. **Zero collisions.**

One re-aim: `What Skills Should a Swimmer Have Before Mile Training?` scored **0.776** against `camping-water-safety-checklist :: 🏊 What skills should kids have before the trip?` — under threshold but the closest of the set, and generic where the section is specific. Re-aimed to **`Which Freestyle Fundamentals Come Before Mile Conditioning?`** (0.562), which is what the lead paragraph actually enumerates (steady freestyle, bilateral breathing, streamline push-off, stamina). **Final worst score 0.718.**

**Intra-batch similarity was the predicted risk and it materialised in drafting, not scoring.** `body-awareness`'s two drill sections would naturally read `Which Dryland Drills…?` / `Which In-Water Drills…?` — differing only by one modifier. They were split by *what each section teaches* instead of by location: `What Can Swimmers Practice on the Deck Before Getting In?` vs `Which Swim Drills Teach a Child to Feel Their Body Position?`.

**Self-cannibalization was again the binding constraint**, as in Batches 48 and 49. All three pages carry five FAQ `<h3>`s that already own the obvious definitional queries — `At what age can my child start nose-bubble practice?`, `At what age does body awareness start to develop?`, `What age can my child train for a mile swim?`. Every H2 had to be aimed at an angle its own FAQ does not already answer: mechanism (`Why Do Swimmers Need to Exhale Through the Nose?`), developmental *trajectory* rather than start age (`How Does Nose-Breathing Control Develop From Toddler to Preschool?`), and setting (`What Does Safe Bathtub Practice Look Like Between Lessons?`).

### Method notes

- **id-keyed raw-file replacement with emoji-prefix capture.** All three store emoji as raw UTF-8 (📏 ✅ 📊 🩹 🧠 / 💨 🎓 👶 ⚠️ 🛁 / 🧭 🧘 🌊 🛟 🎲). A regex captured the leading emoji run and re-emitted it byte-for-byte; `count==1` asserted per heading before and after, and nested markup asserted absent. bs4 output was never string-matched against the raw file.
- Section lead-ins were read **before** drafting and re-read after: **all 15 sections open with a direct answer to their new question.** No lead paragraph was altered by the heading work.
- **TOC labels left as short non-verbatim labels**, per Batch 41/42 precedent — all 15 remain accurate after the re-aims (`Readiness Indicators`, `On-Deck Drills`, `The Safety Dimension`, etc.).
- Speakable was already complete on all three (`.tldr-box`, `.article h1`, `.article-excerpt`) and every selector resolves to exactly 1 — nothing was added blind.

### Validation
- Tag balance `err=0 / stackleft=0` on all three.
- html5lib head integrity: 16 metas in `<head>`, **0 metas in `<body>`**, canonical in head, on all three.
- JSON-LD parses clean — `[Article, FAQPage, BreadcrumbList]` on all three; `jerr=0`; **0 HTML entities leaked inside JSON-LD**.
- **FAQ schema↔visible drift 0** across 5/5/5 Q&A, checked against **both** markup shapes (`h3` and `p > strong`).
- Speakable resolved with soupsieve: every selector → exactly 1 on every file. None match zero.
- `headline == h1` on all three. Meta descriptions unchanged, decoded 142 / 138 / 151 (≤160).
- Nested anchors 0. Unsubstituted `__PLACEHOLDER__` 0. Brand-voice ownership scan **0 hits**. All internal `#` anchors resolve.
- **DOM signature diff vs HEAD, scripts stripped.** `bubbles`: **195/195**, `body-awareness`: **192/192** — tag+id+class sequence **byte-identical**, heading text only. `conditioning`: 194→195, accounted for exactly by the one inserted inline `<a>`. Text-node diff: the only removed strings are the 15 replaced headings, the 3 visible `Updated` dates, and the one corrected sentence. **No prose was deleted elsewhere on any file.** Text-only changes, so no render sweep was warranted.
- `dateModified` 2026-08-28 / 2026-08-21 / 2026-08-21 → **2026-08-31**; each page's **visible `Updated` line synced to match** (all three carry one). `sitemap.xml` lastmod bumped for **exactly these 3 URLs** — all three had been sitting at `2026-08-29` while their `dateModified` said Aug 21/28, the known sitemap-vs-dateModified contradiction, now consistent for these three. Re-parsed clean, **642 entries unchanged**. No blanket bump.
- **Live-verified** after push (`15b01e6`): all 15 question H2s serving, all three `dateModified` live, the corrected AAP sentence live with the old wording returning 0 hits, the new inline link present, and all three sitemap `lastmod` values live with 642 entries parsing.

### Flagged for Michael — not changed
1. **Two pages carry question H2s that the previous scorer was silently discarding** (`home-water-safety-framework`, `child-wont-wear-life-jacket`, `swim-goggles-for-kids` — details above). Their content is fine; only the measurement was wrong. Worth knowing because past backlog numbers for those pages were understated.
2. **Batch 49's open item still stands:** `free-reduced-swim-lessons-make-a-splash.html` ships two divergent FAQ blocks, and the one the JSON-LD quotes is stranded below `<div class="related">`. Needs a dedicated pass.
3. **Batch 47/48's open item still stands:** `teaching-kids-safe-pool-entry.html` asserts, in body *and* FAQ schema, that headfirst entries are "a leading cause" of neck and spinal injuries, with zero supporting citation anywhere on the site. Given this run found a *second* unsupported figure attributed to a named authority, a **sitewide sweep for numbers attributed to AAP/CDC/Red Cross that those bodies do not state** is probably worth its own batch.

### Backlog
**15 education articles under 50% question H2s.** The 0/5 template cluster is nearly closed — two remain and should be taken together as the next batch, since they share the template and adjacent topics:
- `weighted-practice-flip-turns-skills` (1,340w, 0/5, 4 near-question H2s already)
- `swim-readiness-indicators-age-4` (1,310w, 0/5)

Then the low-ratio long tail: `national-water-safety-action-plan-explained` (1/11 — **check the `aap_2026` and NDPA two-taxonomies rules before touching**), `new-jersey-pool-fence-law` (1/7 — **VGB scope rule applies**), `end-of-summer-swim-skills-report-card` (1/7), `water-confidence-challenge` (1/5), `make-a-splash-local-partner-badge-decoded` (1/5 — legacy-branding + "Local Partners" terminology question from Batch 49 flag #2; consider taking both in one pass), `swimmers-ear-prevention-checklist` (1/4), `year-round-swim-skills-checklist` (1/4).
