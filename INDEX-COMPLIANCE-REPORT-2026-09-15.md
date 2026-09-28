# Index Compliance — 2026-09-15

**Verdict: COMPLIANT. No push.** Every auto-fixable Google-indexing axis returned zero,
including three axes opened for the first time today. The one thing that changed is an
invariant *breaking* on a surface already flagged for Michael — reported, not fixed.

Measured on a fresh clone of `origin/live` @ `bd4ad7b` (2 publishing commits past the
09-14 close `cab8113e`). Audited the clone, never the mount.

---

## Census

| | |
|---|---|
| HTML files | 780 |
| indexable | 679 |
| noindex | 101 (103 printables incl. `404.html`) |
| redirect stubs | 23 |
| sitemap `<loc>` | 656 |

Delta since the 09-14 close: **40 HTML modified, 0 added, CSS/JS delta 0 bytes.**

## Axes re-measured — all zero

| axis | result |
|---|---|
| canonical (absent / multiple / wrong host / not https / in body) | 0 |
| title / h1 / meta description (missing, dup, over cap, soft-404) | 0 |
| sitemap reconciliation | **656/656 exact, both directions** |
| sitemap lastmod present + well-formed | 656/656 |
| robots.txt | valid, `Allow: /`, correct `Sitemap:` host |
| JSON-LD | 2,282 nodes, 0 unparseable, 0 missing required/recommended |
| JSON-LD interiors | 568 Article / 644 FAQ / 3,071 Q-A / 753 crumb / 47 HowTo / 247 steps — 0 |
| image alt | 1,910/1,910 described, 0 missing, 0 placeholder |
| og / twitter / LD image targets + absolute URLs | 0 |
| schema headline vs Google's 110-char cap | 468 headlines, 0 over |
| internal links | **34,748 links, 0 broken, 0 broken fragments, 0 http-scheme self-links** |

Canary gate PASSED on every probe before any zero was believed.

The only finding the compliance probe emits is **19 duplicate-canonical groups that are
100% the redirect-stub convention** — a stub and its destination share a canonical by
design. Not a defect; matches 09-13 and 09-14 exactly.

## Three NEW axes opened today — all zero

The recorded guidance is that re-running closed axes is churn and that adding value means
opening a *new* axis. Three were genuinely unmeasured:

1. **Canonical TARGET validity (the reverse direction).** Prior probes asked "is this page
   noindex AND canonical-elsewhere?". They never asked whether an *indexable* page
   canonicals **at** a target that is noindex, a stub, or not a file at all — which
   silently deindexes the source. Result: **656 indexable pages checked, all 656
   self-canonical, 0 cross-canonicals, 0 defects.** Unusually tight.
2. **robots.txt Disallow vs the sitemap.** The old check only caught a blunt `Disallow: /`.
   A narrow rule like `Disallow: /education/` shadowing sitemap URLs would have been
   invisible — that's the "Blocked by robots.txt" GSC pair. Result: **0 Disallow rules
   exist; 656/656 sitemap URLs crawlable; 0 indexable pages blocked.**
3. **Redirect-stub chains.** Stub integrity was "target == canonical == a file that
   exists"; it never asked whether that target is *itself* a stub (a 2-hop chain Google
   won't consolidate) or noindex. Result: **23 stubs, 0 chains, 0 missing targets.**

Probe saved verbatim at `.deploy/probes/canonical_target_robots_probe.py`, canary-gated on
all six shapes (the canary builds a real temp root so the robots axis is genuinely
exercised, not faked).

---

## One finding — for Michael, deliberately not fixed

**A recorded invariant broke.** Memory has carried "sitemap lastmod vs dateModified:
direction uniform ahead, **0 behind**" through five measurements. Today there is **1 behind**:

```
education/swimming-pool-fence-laws-by-state.html
  sitemap lastmod : 2026-09-08
  dateModified    : 2026-09-09     <- sitemap claims older than the page's own schema
  true prose change: 2026-09-13    <- both surfaces are stale
```

So the sitemap is telling Google this page last changed 09-08 while the page's own
structured data says 09-09, and the body text actually changed on 09-13 (commit `dd459ab`,
the PA town-answer pattern). It's the only self-contradicting URL in the corpus.

**Why I did not fix it:** the correct value depends on the same question as the standing
open item — *which date surface is authoritative*. Setting lastmod to 09-09 resolves the
contradiction but is still wrong; setting it to 09-13 pre-empts a sitewide editorial call
for one arbitrary page. The recorded rule on this surface is **"fix all three or none."**
So: reported, untouched.

**Re-measurement of that open item**, with a corrected differ (see below):
**136 pages** where a date surface lags a *verified* body-prose change —
109 lastmod-only (legacy root pages that carry no `dateModified` at all) and
27 where both `dateModified` and lastmod lag. Prose-change dates cluster on
09-13 (98) and 09-14 (29). Still needs Michael; still all-or-none.

---

## Probe-trap note (cost me two runs today)

A body-prose differ built for this corpus fails twice before it works:

1. **Including chrome** (nav/header/footer) makes any sitewide chrome commit read as a
   prose change on every page — 679 phantom rows. Scope to `.article-body`, falling back
   to `main`/`article`.
2. **Scoring an unextractable revision as a change.** Treating `container is None` as
   "changed" inflated the result from 136 to **542**. A revision whose container can't be
   found is *undeterminable*, not *changed* — skip it. 606 of 775 files in the window are
   undeterminable this way (the legacy root corpus has no stable container).

Both were caught only because the differ was canary-gated with a negative canary (a
chrome-only edit must **not** register). The first canary I wrote was itself buggy — it
injected into the document's first `<p>`, which lives in chrome that gets stripped, so the
positive canary silently failed. A canary that fails closed is the only reason these
numbers are trustworthy.

## Carried forward, unverified

`web_fetch` still refuses `waterwisekids.com` URLs in a scheduled run ("URL not in
provenance set") — confirmed again today, 3rd time. Live-HTTP checks (serving status,
`http`→`https` variants, edge-cache freshness) remain impossible unattended. The only
remaining route is pasting verbatim leaf URLs into the task file body.
