# SEO Optimizer — 2026-09-06

**Repo state:** `live` @ `fbc2c7268` (2026-09-05). Corpus: **765 HTML** — 424 article, 266 legacy root, 52 directory, 23 redirect stub.

**Result: no defects. Nothing committed, nothing pushed.**

Every probe below was canary-gated (a synthetic defect injected and confirmed caught) *and* cardinality-asserted (confirmed the probe actually examined rows). A zero from an unverified probe is indistinguishable from a broken probe, so neither check was skipped.

## The four assigned checks

| Check | Scope examined | Defects |
|---|---|---|
| Meta descriptions | 742 non-stub pages | **0** — none missing, no duplicate groups, none <70 or >160 chars, head quote-parity clean |
| Image alt text | 1,873 `<img>` | **0** — no missing `alt`, no empty non-decorative `alt` |
| FAQ/Article JSON-LD | 2,182 top-level nodes | **0** — all parse; no missing required fields |
| OG tags | 742 non-stub pages | **0** — all five OG properties present; og↔twitter parity 100% |

Canary results: 7 injected defects (missing meta, duplicate meta, unescaped quote, stripped alt, broken JSON-LD, desynced twitter:description, removed og:image) → 7 caught. The duplicate-meta canary initially appeared to fail; isolating it showed the *canary* was self-defeating (I had removed the source page's description in an earlier injection), not the probe. Re-tested clean on an isolated pair.

Cardinality: 1,873/1,873 local image `src` resolved to real files; 4,562 JSON-LD URLs parsed; 765/765 pages carried both canonical and og:url; 15,553 `<strong>` tags counted.

## Five deeper classes (structurally excluded from the four above)

All zero, all cardinality-confirmed: broken local `img src` (0/1,873), JSON-LD non-www or http hosts (0 of 4,562 — all `https://www.`), canonical≠og:url (0/765), redirect-stub health (23 stubs, all with matching refresh target + canonical), tag imbalance across strong/em/b/i/p/li/h2/h3 (0, with `<script>`/`<style>`/comments stripped first).

Schema date sanity: 558 date-bearing nodes — no future dates, none malformed, no `datePublished > dateModified`.

## The 88% attribution surface — confirmed closed

Memory flags this as re-suggested on every run, so I checked it definitively rather than by the verb-only grep that has misfired before. Across 362 distinct sentences containing the figure, **zero real misattributions**. Raw proximity greps look alarming (186 and 192 files) but that is `[^.]*` spanning abbreviation periods, not attribution. The single flagged candidate — *"The research that most moved the AAP found that formal swim lessons reduced drowning risk… by 88%"* — is grammatically correct: the subject of "found" is *the research*, with AAP as the object.

I also checked **inside the `.tldr-box` speakable blocks**, which claim-greps skip: 133 boxes contain the figure across 71 distinct phrasings, and **all 133** use correct citing framing ("research it cites"). Zero misattributions. Please treat this surface as closed and stop re-flagging it.

## One finding for you — not auto-fixed

**92 pages carry an 88% claim in the `.tldr-box` that appears nowhere in the page body or its FAQ schema.** Example: `beginner-swim-lessons-abington-pa.html` contains "88%" exactly once, inside the summary block; the body has zero occurrences.

To be clear about what this is and isn't: the claim is **factually correct and correctly attributed**. This is not the accuracy defect fixed on the AAP page on 09-05. It is a *support* gap — the speakable summary asserts a statistic the page never substantiates, which is a thin-content/E-E-A-T risk rather than a technical error.

I did not touch it, for three reasons: it is body-copy editing rather than the meta/alt/schema/OG scope of this task; it spans 92 pages of one templated family; and that family is the city cluster already flagged as awaiting your decision on the ~100 self-canonical twins. Mass-rewriting body copy there autonomously would pre-empt a call that is yours. The distribution is 90 root + 36 `/swim-lessons/` + 7 `/education/`; 148 boxes carry a %-claim overall, so 56 are already supported — the inconsistency suggests drift rather than deliberate design.

## Not checked

Off-page and authority levers, GSC performance data, internal-link graph, rendered CSS/layout, mobile surface, and the sitemap `lastmod` contradiction (356 URLs, still yours). This report covers on-page meta/alt/schema/OG only.
