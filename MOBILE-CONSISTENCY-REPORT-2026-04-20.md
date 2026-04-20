# Mobile Consistency Report — 2026-04-20

**Run:** Automated daily mobile-consistency-checker
**Status:** Issues found and fixed — pushed to `live`

---

## Summary

| Metric | Count |
|---|---|
| Total HTML pages scanned | 421 |
| Education articles scanned | 180 |
| Pages missing viewport meta | 0 |
| Pages missing main.css (non-printable) | 0 |
| Pages with broken `.hamburger` + main.js setup | 0 |
| **Pages with duplicate/broken inline hamburger script** | **48 → fixed** |

---

## Issue Fixed: Duplicate/broken inline hamburger scripts (48 articles)

### Root cause

Forty-eight education articles loaded `main.js` (which handles the hamburger menu via the `nav.mobile-open` class) AND also had a trailing inline `<script>` block that attempted to toggle an `.active` class on `.hamburger` and `.nav-links`. The inline handler:

1. Duplicates the click listener — double-fires on every tap.
2. Uses the wrong CSS hook — `nav-links.active` is not a selector in `main.css`; the dropdown only opens via `nav.mobile-open .nav-links`. So the inline handler did nothing visible, but stomped on `aria-expanded` that `main.js` was managing.
3. Creates conflicting accessibility state — screen readers saw two flips of `aria-expanded` on a single tap.

This is the same bug class previously fixed for the Apr-14 and Apr-15 article batches (see MOBILE-CONSISTENCY-REPORT-2026-04-15.md). The 48 articles found today were older posts published before that fix landed, which the Apr-15 run had not covered.

### Files patched (48 total, all under `education/`)

aap-infant-swim-lessons-research, aquatic-therapy-kids, at-what-age-can-kids-swim-alone, baby-swim-lessons-8-weeks, backyard-pool-requirements-swim-instructor, beach-safety-tips-kids, can-babies-learn-self-rescue, child-swimming-nutrition-hydration, cognitive-benefits-early-swim-lessons, community-pool-safety-rules, deep-water-readiness-kids, home-swim-lessons-vs-swim-school, hot-tub-spa-safety-kids, hyperventilation-swimming-danger, infant-swim-lesson-wetsuits, isr-vs-traditional-swim-lessons, kids-hair-care-swimmers, kids-swim-caps-guide, nighttime-pool-safety, paddleboard-safety-kids, parent-and-me-swim-lessons-guide, pool-deck-safety, pool-games-safety-guide, pool-slide-safety, post-swim-care-for-kids, public-pool-hygiene, river-stream-safety-kids, rollover-survival-float-toddlers, sibling-discount-swim-lessons, summer-swim-lesson-prep, sun-safety-at-pool, survival-swim-street-clothes-science, swim-bag-essentials, swim-diapers-for-baby-swim-class, swim-lesson-instructor-ratio, swim-lesson-parent-involvement, swim-lessons-autism-sensory, swim-lessons-esa-529-fsa, swim-skill-retention-fade, swim-strokes-guide-kids, swimming-muscle-cramps, swimming-with-ear-tubes, swimtastic-safesplash-swimlabs-comparison, teaching-water-respect, two-self-rescue-skills-children, underwater-swimming-safety-kids, ymca-open-doors-swim-lesson-assistance, ymca-vs-private-swim-school

### Fix applied

Removed the trailing `<script>` block matching this fingerprint:

```html
<script>
document.querySelector('.hamburger').addEventListener('click', function() {
  this.classList.toggle('active');
  document.querySelector('.nav-links').classList.toggle('active');
  this.setAttribute('aria-expanded', this.classList.contains('active'));
});
</script>
```

After the patch, each file still loads `main.js?v=20260407b`, which owns hamburger behavior site-wide via `nav.mobile-open`.

---

## Checks Passing

| Check | Result |
|-------|--------|
| Viewport meta on all content pages | Pass (421/421) |
| `main.css` on all nav/footer pages | Pass (non-printable) |
| Printable pages use `printable-*.css` (standalone) | Pass (8 printable) |
| Pages with `.hamburger` but no main.js | Pass (0) |
| Inline mobile UI scripts (search pill, bell, bottom nav) | Pass (0) |
| Duplicate inline hamburger handlers | Fixed (48 → 0) |
| `nav.mobile-open` toggle handler in main.js | Pass |

---

## Notes

- The 8 printable pages (`*-printable.html`) intentionally do not include `main.css` — they use standalone `printable-poster.css` / `printable-checklist.css`. This is expected per the template standard.
- No other categories of mobile regression detected.
- No CSS or JS source files were modified — fix was scoped to removing broken inline scripts only.
