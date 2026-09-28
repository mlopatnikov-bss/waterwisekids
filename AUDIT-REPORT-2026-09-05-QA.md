# Quality Assurance Report — 2026-09-05

**Scope:** 11 commits since the last QA run (`d8235283a`, 09-04) through `06d973dca`.
**Surface:** 748 changed HTML files + 3 new files; several checks re-swept the whole repo for residuals.
**Shipped:** `fbc2c7268` → `live`.

---

## Verdict

One genuine defect found and fixed. Everything else passed, with canaries confirming each probe was live.

---

## Defect found and fixed

### Speakable "Quick Answer" contradicted its own page body — `education/aap-infant-swim-lessons-research.html`

The `.tldr-box` on this page is the declared `speakable` target (the block voice assistants and AI answer engines read aloud). It carried two claims the page's own body and FAQ schema refute:

1. **Wrong source for the 88% figure.** It credited "Dr. Robyn Jorgensen's Griffith University study of 7,000+ children" with showing that early swim lessons "reduce drowning risk by up to 88%." The page's own body states the 88% came from a study in the *Archives of Pediatrics and Adolescent Medicine* led by NICHD researchers, and that the Griffith study found benefits in *literacy, numeracy, physical development, and social confidence* — not drowning risk. The two studies were conflated.
2. **Superseded policy asserted as current.** It said the AAP "now recommends swim lessons for children ages 1 to 4," resting on the 2010/2019 updates. The same page's body says plainly that the 2019 policy "has since been superseded by the AAP's revised 2026 policy statement," which recommends beginning classes after the first birthday, individualised with a pediatrician.

The meta description carried the same conflation ("Here is the Griffith University research that changed the guidance").

**Fixed:** rewrote the Quick Answer to attribute the 88% to the Archives/NICHD study, credit Griffith for what it actually measured, and state the 2026 position as current. Rewrote the meta description to match (157 chars, no width regression). Bumped `dateModified` and the visible "Updated" line to 2026-09-05, and aligned the sitemap `lastmod` for that URL.

Severity is higher than a normal body-copy error: this text is explicitly marked for extraction by answer engines.

**Residual sweep:** a sentence-level probe across the whole repo checked 529 sentences containing "88%" — **0** now attribute the figure to Griffith/Jorgensen. Canary confirmed the probe fires on a synthetic violation.

---

## Checks that passed

| Check | Result |
|---|---|
| GTM container (head + noscript) | 748/748 |
| JSON-LD parses | 2,168 blocks, 0 errors |
| JSON-LD host (non-www / http) | 0 |
| Canonical present, `https://www.` host | 748/748 |
| Image alt text | 1,873 images, 0 missing, 0 non-decorative empties |
| Inline CSS on nav/header/footer `a`/`button` | 0 |
| `<meta>` quote parity in `<head>` (raw, per-tag) | 0 odd |
| og ↔ twitter description/title parity | 748/748 equal |
| Tag balance (`strong`/`em`/`div`/`p`/`section`, style+script stripped) | 0 imbalances |
| Viewport meta | 748/748 |
| Header markup variants | 6 — matches expected |
| Footer markup variants | 2 — matches expected |
| Speakable selectors (dead / invalid / ad-matching) | 686 pages, 0 problems |
| CTA labels | consistent house set; BSS CTAs correctly point to the operator's own site |
| Formspree `_gotcha` honeypot | 152 forms repo-wide, **0** missing — the 09-05 fix left no residuals |
| Hands-only-CPR-for-drowning | 2 flagged, both correct on inspection (one teaches breaths-first and contrasts hands-only; one describes the Red Cross app) |

### New lead magnet — clean

`when-to-get-kids-out-of-water-checklist.html`, its `-printable`, and the SVG card all pass: canonical, og/twitter parity, alt text, GTM, Article + BreadcrumbList + FAQPage JSON-LD, SVG carries `role="img"` + `aria-label`. Landing has 7 inbound links; printable is linked from its landing (and correctly absent from the sitemap — matching the convention: 96 printables on disk, 3 in sitemap).

---

## Probe notes (so these aren't re-litigated)

- **Ownership anonymity: 0 real violations.** A loose `our + <facility noun>` regex produced 87 hits, all false positives — WaterWiseKids referring to *its own articles* ("our pool safety rules", "our pool chemistry basics"), printable fields written in the parent's voice ("Our Program's Details"), quoted hypothetical swim-school speech, and copy addressing the reader's own pool. Tightening for content nouns cut it to 11, still all FPs. The brand's ownership separation from British Swim School holds.
- **The AAP-88% proximity probe lies.** A ±200-char window around "88%" flagged 400 pages — but 138 were the *correct* hedged shape introduced by the 09-04 hygiene pass ("research it cites", "cited by the AAP") and 235 were AAP and the figure sitting in unrelated adjacent sentences. Only a probe that requires the AAP to grammatically govern the number, or a sentence-level check, tells the truth. It found exactly 1 candidate, which on reading was itself a false positive ("the research that most moved the AAP found…"). The real defect surfaced from reading the page, not from the grep.

---

## Open items for Michael (unchanged, not QA-fixable)

- Sitemap has not been downloaded by Google since April; the deploy token is read-only, so resubmission needs Michael.
- Sitemap `lastmod` contradicts `dateModified` on ~356 URLs (this run aligned 1).
- `http://` variants remain indexed.
