# Mobile Consistency Check — 2026-09-08

Corpus: 746 non-stub pages (769 HTML − 23 meta-refresh stubs). Clone at `ccff94b`,
rendered headless Chromium 151 at 390×844 (`isMobile:false, hasTouch:true`, per
`is_mobile_true_hides_horizontal_overflow`). Every sweep canary-gated.

## Shipped — `06f92e4` on `live`

**Mobile autofill was off everywhere but 4 pages.** 162 form fields across 152 files
had no `autocomplete` token, so iOS/Android offered no one-tap fill for email,
phone, name or address. The house pattern already existed — the 4
`education/*-checklist.html` lead magnets carry
`autocomplete="email"` — and 149 of 157 email inputs diverged from it.

| token | fields |
|---|---|
| `email` | 149 |
| `off` (hidden `_gotcha` honeypots) | 151 |
| `tel` | 5 |
| `name` | 4 |
| `street-address` / `address-level2` / `address-level1` / `postal-code` | 1 each |

The honeypot change is the one with a revenue edge: 151 of 154 Formspree
`_gotcha` fields had no `autocomplete="off"`. They are `display:none`, but mobile
autofill can still populate a hidden text input — which silently trips the spam
trap and drops the lead with no error shown. 3 pages already did this correctly.

`type="url"` was deliberately left alone (2 fields): those collect a *school's*
website and an employer's application URL, not the visitor's own, so `autocomplete="url"`
would surface a wrong suggestion.

Diff safety gate: 313 removed / 313 added lines, and 0 of them differ by anything
other than the inserted attribute.

## Swept clean — no change needed

| axis | metric | result |
|---|---|---|
| viewport meta | `user-scalable=no` / `maximum-scale≤1` (WCAG 1.4.4) | **0 / 769** — all 769 are byte-identical `width=device-width, initial-scale=1.0` |
| input font size @390 | computed `font-size < 16px` ⇒ iOS focus-zoom | **0 / 299** visible inputs — all exactly 16px |
| table squeeze @390 | data cell < 60px wide, or intra-cell horizontal overflow, without a scrollable ancestor | **0 / 72** tables on 39 pages |
| wide tables @390 | rendered wider than the viewport | 19 found — **19/19 already inside an `overflow-x:auto` wrapper**, which is why the page-level overflow baseline reads 0 |
| CTA/button text @390 | wraps to ≥3 lines, or text overflows its box | **0** real defects; 0 instances of horizontal overflow |

## Probe trap worth keeping

The CTA probe first reported **1429 hits on 378 pages** — an implausible rate that
turned out to be the denominator, not the site. Classifying "a CTA" as *an `<a>`
with an opaque background and ≥12px horizontal padding* swallows every **card
wrapper**: 1395 `.related-card` + 20 `.hub-card` + 1 `.tool-card` + 12 unclassed
inline-styled link cards. A card is *supposed* to wrap to 3 lines — it holds a
headline plus a description. After restricting to `btn|button|cta` classes the
count fell to **1**, and that one (`british-swim-school/northwest-philadelphia.html`,
"Visit the Official British Swim School of Northwest Philadelphia Site") is the
uniform label shape for that template — both pages that use `.cta-button` carry the
same 10-word phrasing, and the text stays inside its box. Not a defect.

Same shape as `defect_class_inherits_the_audit_denominator`: the grouping column
was wrong, not the corpus.

## Standing note

Rendered *geometry* on mobile remains closed (overflow, rail, tap size at AA 24,
text floor, chrome uniformity, image distortion, clipped text, tablet band).
Both axes that paid today were **declarations that were absent or inert**, not
boxes in the wrong place — consistent with the 09-08 pattern. Note also that the
51 directory email inputs carry an inline `font-size:.9rem` that never applies:
a stylesheet `!important` already forces 16px. Harmless, but it is dead markup.
