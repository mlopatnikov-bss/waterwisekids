# Site Audit — waterwisekids.com — 2026-09-16 (evening)

Audited a clean export of **`origin/live` @ `e6ec173c0`**, not the mount. 782 HTML files.
The mount could not be audited — see *Blocking infrastructure finding* below.

## Health summary

| Axis | Denominator | Result | Status |
|---|---|---|---|
| Broken internal links | 34,940 hrefs | 0 | ✅ |
| Broken internal fragments | 34,940 hrefs | 0 | ✅ |
| Broken external links | 978 unique URLs | 0 | ✅ |
| Missing asset refs (css/js/img) | 782 pages | 0 | ✅ |
| HTML validity (unclosed / stray close) | 782 pages | 0 | ✅ |
| Duplicate element IDs | 782 pages | 0 | ✅ |
| Missing / placeholder `alt` | 1,915 images | 0 | ✅ |
| Invalid or thin JSON-LD | 2,291 LD nodes | 0 | ✅ |
| Sitemap entries resolving | 657 locs | 657 / 0 missing / 0 extra | ✅ |
| Canonical self-reference | 657 indexable | 657 | ✅ |
| `og:image` / `twitter:image` depth | 680 pages | 0 | ✅ |
| `lang` / `charset` consistency | 782 pages | 1 value each (`en`, `utf-8`) | ✅ |
| Scripts / ops-reports in web root | `git ls-files` | 0 `.py` `.sh` `.md` | ✅ |
| Oversized HTML | 782 pages | 1 (352 KB) | 🟡 |
| **Generic anchor text** | 782 pages | **1 found, fixed** | 🔴→✅ |
| **Mount ↔ origin/live sync** | — | **unrelated histories** | 🔴 |

Every zero above was **canary-gated**: each probe was first run with `--canary` against a
throwaway copy carrying injected defects, and every defect class fired before the real
run's zeros were trusted. Gates passed for the link, asset/validity, alt+JSON-LD,
index-compliance and editorial probes.

## Action taken — `adb55b1`, pushed to `live`, verified at the edge

The editorial probe flagged the corpus's **last generic anchor**, on
`education/fourth-of-july-water-safety.html`:

> …the swimming-after-eating panic is a myth (we debunked it **here**)…

changed to *"we debunked it in **our swimming-after-eating explainer**"*. The existing
`aria-label` was already descriptive and is untouched; only the visible link text changed.

Pushed as a fast-forward on `e6ec173c0` (parent re-confirmed against the remote
immediately before pushing), exactly one file in the commit. Confirmed live at the edge
on the first poll. Re-ran the link, validity and editorial probes on the patched tree:
generic anchors 1 → 0, every other axis unchanged at 0.

---

## 🔴 Blocking infrastructure finding — the mount is a dead branch, and AutoDeploy is pushing into it

`~/Documents/Claude/Projects/WATERWISEKIDS.COM` and `origin/live` **share no common
ancestor**. `git merge-base` returns nothing; the counts read 273 ahead / 200 behind, but
that is two unrelated histories being compared, not a normal divergence.

- The mount's `live` is stranded at `2476831c5` (**2026-08-20**) — the same strand the
  09-10 audit reported, now four weeks old.
- `origin/live` was rebuilt at some point after 2026-08-20, which is what severed the
  history.
- The mount carries **290 uncommitted changes** (235 untracked, 55 modified) and one
  local commit made this morning — `0e211752b`, 06:06 today, "add FAQPage schema to 4
  article pages, align og:url with canonical on 13 redirect stubs".

**Nothing has been lost.** I verified that all of `0e211752b`'s work is *already present*
on `origin/live`: all four pages carry their `FAQPage` node, and all 13 stubs have
`og:url` equal to canonical. Some other path — a session working from a fresh clone —
is what actually publishes. But that also means the commit made on the mount this
morning went nowhere, and every future one will too.

The mount's `.git` is also degraded: it is 287 MB, and git cannot unlink its own lock and
temp files there (`Operation not permitted` on `.git/objects/**/tmp_obj_*`,
`index.lock`, `HEAD.lock`). A `git worktree` attempt failed outright on a stale lock. I
completed the push from a shallow clone in scratch space instead.

One piece of litter I could not clear because of that same permission wall: a stale
worktree registration for `/tmp/wwk-wt` under `.git/worktrees/`. The directory itself is
gone; only the ~1 KB metadata entry remains, and `worktree prune`/`remove --force` both
fail to unlink it. The re-clone in step 2 below disposes of it along with everything else.

**AutoDeploy is aimed at this branch.** The shipped launcher watches
`$HOME/Documents/Claude/Projects/WATERWISEKIDS.COM` and pushes every 3 minutes. Against
an unrelated history every one of those pushes is rejected, so the app has almost
certainly been failing silently since 2026-08-20.

**I did not attempt to repair this.** Reconciling unrelated histories means a force-push
or a merge that could destroy 200 commits of production work, and it is not a call to
make unattended.

**Recommended, in this order:**

1. Back up the 290 uncommitted changes on the mount (`git stash create` won't survive a
   re-clone — copy them out of the tree).
2. Re-clone `origin/live` fresh into the project folder, or
   `git fetch origin && git reset --hard origin/live` and let the stale branch go.
3. Replay anything from the 290 that is still wanted.
4. Restart AutoDeploy and confirm one push actually lands.
5. `git gc --aggressive` on the replacement clone.

---

## 🟡 Deploy launcher scripts are served publicly — fourth recurrence of this class

Six files under the two `.app` bundles in the web root return **HTTP 200** to anyone:

```
/WaterWiseKids AutoDeploy.app/Contents/MacOS/autodeploy            200
/WaterWiseKids AutoDeploy.app/Contents/Info.plist                  200
/WaterWiseKids AutoDeploy 2.app/Contents/MacOS/autodeploy          200
/WaterWiseKids AutoDeploy.app/autodeploy-backup/Contents/...       200   (+2 more)
```

I scanned all six for credentials: **no secrets, no tokens, no embedded remote URL.** What
they do disclose is internal filesystem layout (`$HOME/Documents/Claude/Projects/…`), the
deploy script names, and the 3-minute push cadence. Low severity, but this is the same
defect class removed in the 09-10 audit and twice before it.

**I deliberately did not delete these.** Unlike the `.deploy/*.py` files removed
previously, these are Michael's *working launcher app*, living in the project folder —
deleting them from git would delete them from his Mac on the next sync and break his
deploy tooling. The right fix is to move the `.app` bundles out of the repo and add them
to `.gitignore`, which needs a decision I shouldn't make for him.

## 🟡 One oversized page

`education/index.html` — **352 KB**, roughly 2.5× the next-largest HTML file. Under the
500 KB threshold prior audits used, so it is a watch item rather than a defect, but it is
the education hub and a first-visit page for a lot of organic traffic.

## Notes on findings I dismissed

Worth recording so future runs don't re-litigate them:

- **`nhswimschool.com` returned 404** to the audit's user-agent but **200** to a browser
  UA. UA-gated, not broken. Verified before reporting.
- **170 external 403s** (bigblueswimschool, britishswimschool, redcross, publications.aap)
  and **20 Amazon 503s** are WAF/bot blocking, not dead links.
- **`ndpa.org` fails TLS** from here — the handshake completes (TLSv1.3, valid GlobalSign
  cert for `*.ndpa.org`) but the server **does not send its intermediate certificate**, so
  strict clients can't build a chain. Control hosts verify fine, so this is not a sandbox
  artifact — it is a real misconfiguration **on NDPA's side**. Browsers mostly paper over
  it by fetching the intermediate via AIA. It affects **115 link instances** across the
  site. Nothing to fix here; worth an email to NDPA, and worth watching in case stricter
  clients start failing.
- **11 "doubled words"** are all song titles — *Twinkle Twinkle*, *Motorboat Motorboat*,
  *Row Row Row Your Boat*. False positives.
- **1 "brand casing"** hit is a regex spanning an `alt` attribute and the adjacent text
  node; all 11 brand mentions on that page are correctly `WaterWiseKids`. False positive.
- **19 `duplicate_canonical_stub_convention`** are the intended redirect-stub convention.

## Editorial backlog (unchanged, needs a human pass)

- `D_ambiguous_anchor_text` — 237
- `F_apostrophe_drift` — 235 pages mixing straight and curly quotes
- `E_duplicate_headings` — 21

These need editorial judgment and are not safe to regex unattended.

## Still open from prior runs

- Rotate the GitHub PAT embedded in the git remote URL.
- Resubmit `sitemap.xml` in GSC — not downloaded since April.
- Jobs API: CORS + Apps Script 403 (access must be set to "Anyone").
- HTTP variants: `http://waterwisekids.com/` 301s correctly, but indexed HTTP URLs persist.
- Outbound canonicalisation backlog: GF 218 / AT 144 / SafeSplash 131 / BigBlue 62.
- `HowTo step.url` — editorial pass outstanding.
- The three date surfaces (lastmod / dateModified / prose) — fix all three or none.
- 122 pages with `.content-grid` off-rail on desktop.
