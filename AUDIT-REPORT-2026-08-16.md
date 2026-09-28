# Site Audit — waterwisekids.com

**Date:** 2026-08-16
**Pages scanned:** 723 HTML (631 indexable, 73 noindex, 19 redirect stubs)
**Commit pushed:** `502d42d` → `live` — verified deployed on Cloudflare Pages

---

## Health summary

| Check | Result |
|---|---|
| Broken internal links | ✅ 0 |
| Broken external links | ⚠️ 4 found → **fixed** |
| HTML structural validity (unclosed / stray tags) | ✅ 0 |
| Invalid nested anchors | ⚠️ 8 pages → **fixed** |
| JSON-LD parse errors | ✅ 0 |
| Missing `<title>` / meta description | ✅ 0 |
| Meta description > 160 chars (decoded) | ✅ 0 |
| Missing / duplicate `<h1>` | ✅ 0 |
| Missing canonical | ✅ 0 |
| Missing `lang` / viewport / GTM | ✅ 0 |
| Duplicate element IDs | ✅ 0 |
| Images missing `alt` | ✅ 0 |
| Missing CSS / JS references | ✅ 0 |
| Sitemap sync | ✅ 631 / 631 exact |
| Orphan pages (no inbound links) | ✅ 0 |
| Redirect-hop internal links | ✅ 0 |
| noindex + cross-canonical conflicts | ✅ 0 |
| Orphan CSS classes (unstyled elements) | ✅ 0 real (153 hits all carry inline styles) |
| Asset cache-bust collisions | ✅ 0 — live bytes match repo for all 5 versioned assets |
| Oversized files | ✅ largest is `/education/` at 307 KB (hub with 300+ cards) |

---

## Fixed this run

### 1. Invalid nested anchors — 8 pages → 0

A card-insert script had left a `related-card` anchor unclosed on 7 pages, so the
2–4 cards that followed were nested **inside** it. Nested `<a>` is invalid HTML;
browsers silently restructure it, which made the swallowed cards' links
unreliable and broke the card grid layout.

This class of bug passes tag-balance checks — the counts balance perfectly,
because the host card's `</div></span></a>` simply appear *after* the injected
block instead of before it. It is only detectable by parsing the DOM and looking
for an `<a>` that contains another `<a>`.

- `education/paddleboard-safety-kids.html`
- `education/river-stream-safety-kids.html`
- `education/sibling-discount-swim-lessons.html`
- `education/sun-safety-at-pool.html`
- `education/swim-clinics-intensive-camps.html`
- `education/swim-school-apps-progress-tracking.html`
- `education/water-anxious-kids-preparation.html` (had this **plus** an inline
  `<a>` nested inside a card — both fixed)
- `education/pool-floaties-dangers.html` — nested inline links split into two
  siblings, preserving both `/statistics/` and `drowning-statistics-facts` targets

Net effect: ~19 related-card internal links restored to valid, clickable markup.

### 2. Dead external link (hard 404)

`healthychildren.org/.../Swim-Lessons-When-to-Start.aspx` → **404**, linked from
3 directory pages. Replaced with the current AAP page,
`.../Pages/Swim-Lessons.aspx` ("Swim Lessons for Children: When to Start & What
to Consider") — an exact topical match.

### 3. NDPA site restructure + redirect hops

NDPA moved several URLs. Updated to current canonical paths and dropped the
`www.` redirect hop on all 20 links:

| Old | New | Links |
|---|---|---|
| `www.ndpa.org/layers-of-protection/` | `ndpa.org/layers/` | 3 |
| `www.ndpa.org/resources/` | `ndpa.org/resource-center/` | 3 |
| `www.ndpa.org/drowning-prevention/` | `ndpa.org/` | 1 |
| `www.ndpa.org/` → `ndpa.org/`, bare → trailing slash | — | 17 |

---

## Open items needing Michael (cannot be done from the agent)

### 🔴 P1 — Deploy loop is wedged by a stale git lock

`.git/index.lock` in the project folder is **0 bytes, dated 05:10 UTC today** —
left behind when the deploy loop crashed. Every git write in the mounted folder
now fails with *"Another git process seems to be running."* The Cowork mount is
read-write but denies `unlink`, so the agent cannot remove it.

**Fix (~10 seconds, on the Mac Mini):**

```bash
cd /Users/bss/Documents/Claude/Projects/WATERWISEKIDS.COM
rm -f .git/index.lock
git merge --ff-only origin/live     # fast-forwards 8 commits, no conflicts
```

Then restart the deploy loop via `.deploy/start-deploy-loop.command`.

The local folder is currently **8 commits behind** `live` (a clean
fast-forward — it has no commits of its own, so nothing will be lost). **Live is
not at risk:** today's fixes were pushed directly and are verified deployed.

### 🟠 P2 — `http://` still serves 200 with no HTTPS redirect

Still open from prior audits. Confirmed again today:

```
http://www.waterwisekids.com/                              → 200 (no redirect)
http://www.waterwisekids.com/statistics/state-of-drowning-prevention/ → 200
https://waterwisekids.com/                                 → 301 → www ✅
```

Apex→www redirects correctly, but scheme does not. This lets Google index
`http://` duplicates of indexed pages, including the flagship statistics report.
Cloudflare Pages cannot fix this from the repo — `_redirects` has no scheme
matching.

**Fix:** Cloudflare dashboard → SSL/TLS → Edge Certificates → **Always Use
HTTPS** → on. ~30 seconds.

---

## Notes / non-issues (do not "fix" these)

- **60 external links return 403** to the audit sandbox (CDC, AAP, CPSC, BLS,
  britishswimschool.com, redcross.org, heart.org). These are WAF blocks against
  datacenter IPs, not dead links — `redcross.org` was used as a control and also
  returned 403 while being demonstrably live. Only status `404` and confirmed
  restructures were acted on.
- **`ndpa.org` returned status `000`** from the sandbox (TLS egress blocked). DNS
  resolves and the site is live — verified independently before editing.
- **10 duplicate `<title>` groups** are all redirect stubs paired with their
  canonical targets. Expected, not a defect.
- **153 elements with "orphan" CSS classes** all carry inline styles, so nothing
  renders unstyled. Class names are semantic/JS hooks.
- **68 titles exceed 65 characters.** Google truncates around 60 but still indexes
  the full string, and the `| WaterWiseKids` suffix is deliberate branding. Left
  alone — flagged only as a possible future CTR experiment on the highest-traffic
  pages, which should be driven by GSC CTR data rather than a blanket rewrite.
- `functions/_middleware.js` re-verified as a no-op; `_headers` and `_redirects`
  contain no markup-rewriting rules.
- `robots.txt` live and permissive; AI crawlers not blocked.
