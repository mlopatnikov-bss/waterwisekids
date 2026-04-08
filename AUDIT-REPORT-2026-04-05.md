# WaterWiseKids.com — Full Site Audit Report

**Date:** April 5, 2026
**Scope:** Complete codebase review — structure, content, navigation, credibility
**Goal:** Identify everything that should be cut, fixed, or simplified before V1 launch

---

## A. Recommended Final V1 Site Structure

### KEEP (core V1 pages)

| Page | Path | Why |
|------|------|-----|
| Homepage | `/index.html` | Core page — needs major rewrite but stays |
| About | `/about/index.html` | Establishes who you are — needs honesty edits |
| Contact | `/contact/index.html` | Essential — fix form and email |
| Education Hub | `/education/index.html` | Core value prop — strip false "500+" claim |
| 8 Education Articles | `/education/*.html` | Real content, real value — keep all 8 |
| British Swim School - NW Philly | `/british-swim-school/northwest-philadelphia.html` | Your actual business — keep |
| British Swim School - Jersey Shore | `/british-swim-school/jersey-shore.html` | Your actual business — keep |
| 404 Page | `/404.html` | Functional — keep, clean up dead links in it |

### REWRITE (keep but significantly rework)

| Page | Path | What's Wrong |
|------|------|-------------|
| Homepage | `/index.html` | Massively overscoped — presents as a national platform with jobs, directories, gear, advertising. Needs to be reframed as a focused water safety + local swim lesson resource. |
| About | `/about/index.html` | Claims editorial independence while operating the featured swim schools. Needs honest framing. |
| Contact | `/contact/index.html` | Uses wrong email (`hello@waterwisekids.com` instead of `waterwisekids.com@gmail.com`). Form is broken (Formspree placeholder). |
| Education Hub | `/education/index.html` | Claims "500+ expert articles" — you have 8. Remove the lie, present 8 articles honestly. |

### MERGE

| Pages | Into | Reason |
|-------|------|--------|
| 12 swim-lessons location pages (`/swim-lessons/ambler-pa.html`, etc.) | Merge into the 2 British Swim School pages or a single "Our Locations" page | These are SEO doorway pages for your own business disguised as a neutral directory. Same review counts copy-pasted across pages. Consolidate into honest location info. |
| `/swim-lessons/index.html` | Fold into homepage or British Swim School section | Empty directory pretending to be a school finder |

### HIDE FROM NAV (keep file, remove from navigation)

| Page | Path | Reason |
|------|------|--------|
| Gear Guide | `/gear/index.html` | All product links are `href="#"` (dead). Buying guides all say "Coming Soon." Not ready. |
| Advertise | `/advertise/index.html` | Admits "no audience metrics yet" and "no testimonials yet." Pricing packages with zero customers. Not credible for V1. |
| Teens Hub | `/teens/index.html` | Ambitious section with salary tables, career paths, scholarship listings. Not core to V1 launch. Can expand later. |
| Teen sub-pages (4) | `/teens/scholarships.html`, etc. | Same — premature for V1 |

### DELETE

| Page | Path | Reason |
|------|------|--------|
| Jobs Board | `/jobs/index.html` | Shows "No live job listings yet." Stats bar with fake metrics. An empty job board is worse than no job board. |
| Post a Job | `/jobs/post.html` | Charges $29-$149 with a form that `alert()`s instead of submitting. Pricing table for a non-existent product. |
| Add Your Swim School | `/swim-schools/add.html` | Promises a dashboard that doesn't exist. Charges $49/mo for "Featured" with no payment system. Form is broken (Formspree placeholder). |
| Swim School Directory | `/swim-schools/index.html` | "No schools listed yet." Browse-by-state grid for 50 states with zero listings. Pure vaporware. |

---

## B. Homepage Audit

### Misleading Claims

1. **"America's National Aquatics Hub"** — used in hero badge, meta title, schema markup, footer. This is a local business in Philadelphia and Jersey Shore running a content site with 8 articles. Not a national hub.
2. **"America's largest aquatics directory"** — appears in swim-schools/add.html meta. Zero schools listed.
3. **Schema markup claims `support@waterwisekids.com`** — real email is `waterwisekids.com@gmail.com`.
4. **Homepage search tabs (Schools / Jobs / Articles)** — two of three return zero results. Search is non-functional.
5. **Feature bar claims: "All 50 States," "School Ratings," "Jobs Board"** — none of these exist.

### Weak Sections

1. **Swim School Finder Preview** — shows mock school cards that imply a populated directory. Directory is empty.
2. **Jobs Board Section** — shows job listing cards for a board with zero jobs.
3. **Stats Band** — displays statistics that aren't sourced or real.
4. **Advertising Section** — homepage promotes a paid ad product with zero customers.

### Unnecessary Sections

1. **Gear Guide Section** — 4-column product grid on homepage for a section with dead links.
2. **Regional Spotlights** — promotes your own two British Swim School locations as if they're editorial picks from a neutral platform.
3. **Newsletter Signup** — `alert('Thank you for signing up!')` — not connected to any email system.

### Sections to Simplify

1. **Hero** — too many CTAs and claims. Should be: what the site is + one clear action.
2. **Hubs Overview** — 6 cards promoting sections that mostly don't work. Reduce to what's real: Education + Find Lessons.
3. **FAQ Section** — currently answers questions about features that don't exist (job board, school directory).

### Sections to Remove Entirely

1. Jobs Board preview
2. Gear Guide preview
3. Advertising section
4. Stats Band (unsourced numbers)
5. Newsletter form (non-functional)
6. Search tabs for Schools and Jobs

---

## C. Navigation and Footer Audit

### Navigation — Current State

The nav is **inconsistent across pages**. Some pages show 6-7 links, others show 4. Here's what appears in various combinations: Home, Education, Swim Schools, Jobs, Teens, Gear Guide, Advertise, Contact.

### Navigation — What Should Stay

- **Home**
- **Water Safety** (links to `/education/`)
- **Find Lessons** (links to British Swim School pages or consolidated location page)
- **About**
- **Contact**

### Navigation — What Should Go

- **Swim Schools** (empty directory)
- **Aquatics Jobs** (empty board)
- **Teen Hub** (premature for V1)
- **Gear Guide** (dead links, "Coming Soon")
- **Advertise** (no audience, no customers)

### Footer — Current Problems

1. **Broken links across all pages** — `/privacy/`, `/terms/`, `/blog/`, `/resources/`, `/help/`, `/pricing/`, `/cookies/`, `/schools/faq/`, `/schools/dashboard/` — **none of these pages exist.**
2. **Footer structure is inconsistent** — some pages have 4-column footers with elaborate link grids (Jobs, Teens, Swim Schools). Others have a simple 1-line footer.
3. **"America's National Aquatics Hub" tagline** repeated in footers — misleading.

### Footer — Recommendation

Standardize all pages to a simple footer:
- © 2026 WaterWiseKids
- About | Contact | Privacy Policy | Terms of Service
- Email: waterwisekids.com@gmail.com
- Remove all links to pages that don't exist
- Create simple Privacy Policy and Terms pages (or remove the links until they exist)

---

## D. Page-by-Page Findings

### Homepage (`/index.html`)
- **Current purpose:** Mega-hub landing page for a national aquatics platform
- **Recommendation:** REWRITE
- **Reason:** Presents as something it isn't. Needs to be reframed as a water safety education site run by experienced swim school operators. Cut all sections for non-functional features.

### About (`/about/index.html`)
- **Current purpose:** Mission statement and credibility
- **Recommendation:** REWRITE
- **Reason:** Claims editorial independence while featuring owner's own schools. Honest version: "We run British Swim School locations and built this site to share water safety knowledge." Remove "Editorial Standards" section that claims rigorous review with no named reviewers.

### Contact (`/contact/index.html`)
- **Current purpose:** Contact form and info
- **Recommendation:** REWRITE
- **Reason:** Form broken (Formspree placeholder `YOUR_FORM_ID`). Shows `hello@waterwisekids.com` — should be `waterwisekids.com@gmail.com`. Subject dropdown includes options for non-existent features (Job Posting Question, Add/Update School).

### Education Hub (`/education/index.html`)
- **Current purpose:** Article listing page
- **Recommendation:** REWRITE
- **Reason:** Claims "500+ expert articles" — has 8. Category filters for topics with zero articles (Special Needs, Adult Swimming). Newsletter form uses `alert()`. Sidebar "Most Read" is not data-driven. Remove false claims, present 8 articles cleanly.

### Education Articles (8 pages)
- **Paths:** `/education/drowning-prevention-guide.html`, `when-to-start-swim-lessons.html`, `fear-of-water.html`, `pool-safety-rules.html`, `toddler-water-safety.html`, `swim-milestones-by-age.html`, `cpr-basics-parents.html`, `lake-ocean-safety.html`
- **Recommendation:** KEEP
- **Reason:** Real, useful water safety content. These are the site's actual value. Verify accuracy of any statistics cited.

### Swim Schools Directory (`/swim-schools/index.html`)
- **Current purpose:** National school finder
- **Recommendation:** DELETE
- **Reason:** Zero schools listed. Browse-by-state grid for 50 states with nothing behind it. Search is non-functional.

### Add Your School (`/swim-schools/add.html`)
- **Current purpose:** School submission form with paid tiers
- **Recommendation:** DELETE
- **Reason:** Promises dashboard that doesn't exist. Charges fees with no payment system. Form broken. FAQ answers are fiction.

### Swim Lessons Index (`/swim-lessons/index.html`)
- **Current purpose:** Location listing page
- **Recommendation:** MERGE into simplified location page
- **Reason:** Redirects to the same two businesses you own.

### Swim Lessons — 12 Location Pages
- **Paths:** `/swim-lessons/ambler-pa.html`, `asbury-park-nj.html`, `brick-nj.html`, `cheltenham-pa.html`, `elkins-park-pa.html`, `flourtown-pa.html`, `howell-nj.html`, `jersey-shore.html`, `monmouth-county-nj.html`, `northwest-philadelphia.html`, `ocean-county-nj.html`, `philadelphia.html`
- **Recommendation:** MERGE into 2 British Swim School location pages
- **Reason:** These are SEO doorway pages for your own business. They copy-paste the same review ratings across pages ("4.8/5 (186 reviews)" on all NJ pages, "4.9/5 (218 reviews)" on all PA pages). Present as neutral "find local lessons" content but all roads lead to your two locations.

### British Swim School — NW Philadelphia (`/british-swim-school/northwest-philadelphia.html`)
- **Current purpose:** Location page for your school
- **Recommendation:** KEEP — rewrite review claims
- **Reason:** Core business page. But "4.9/5 (218 reviews)" needs a source or removal. If it's from Google Reviews, say so. If made up, remove.

### British Swim School — Jersey Shore (`/british-swim-school/jersey-shore.html`)
- **Current purpose:** Location page for your school
- **Recommendation:** KEEP — rewrite review claims
- **Reason:** Same as above. "4.8/5 Stars (186 Reviews)" needs sourcing or removal.

### Jobs Board (`/jobs/index.html`)
- **Current purpose:** Aquatics job board
- **Recommendation:** DELETE
- **Reason:** Zero listings. Fake stats bar. Admission text: "We're building America's aquatics job board." Not built = not on V1.

### Post a Job (`/jobs/post.html`)
- **Current purpose:** Paid job posting form
- **Recommendation:** DELETE
- **Reason:** Pricing tiers ($29/$79/$149) for a non-existent service. Form submits via `alert()`. Comparison table promises features (newsletter promo, social shares) that don't exist.

### Teens Hub (`/teens/index.html`)
- **Current purpose:** Career hub for teens in aquatics
- **Recommendation:** HIDE from nav
- **Reason:** Salary table without sources. Career paths for a site with zero job listings. "Browse Open Jobs" CTA links to empty board. Good aspirational content but premature.

### Teen Sub-Pages (4 pages)
- **Paths:** `scholarships.html`, `swim-instructor.html`, `aquatics-careers.html`, `lifeguard-certification.html`
- **Recommendation:** HIDE from nav
- **Reason:** Scholarship listings with specific dollar amounts that need verification. Career advice pages that could be useful later but aren't core V1.

### Gear Guide (`/gear/index.html`)
- **Current purpose:** Product recommendations
- **Recommendation:** HIDE from nav
- **Reason:** Every product link is `href="#"`. Three buying guides marked "Coming Soon." No affiliate links, no merchant links. Completely non-functional.

### Advertise (`/advertise/index.html`)
- **Current purpose:** Sell advertising packages
- **Recommendation:** HIDE from nav
- **Reason:** Admits "Audience metrics will be shared as the platform scales" (= we have no traffic). Testimonials section: "will appear here as partners join" (= zero customers). Pricing from $49-$999/month for a product with no buyers and no proof of audience.

### 404 Page (`/404.html`)
- **Current purpose:** Error page
- **Recommendation:** KEEP — update links
- **Reason:** Links to sections that should be removed (Jobs, Teen Hub). Update to match final V1 nav.

---

## E. Immediate High-Priority Cleanup Actions

**These are the first 10 changes to make, in order:**

### 1. Fix the contact email everywhere
Replace all instances of `hello@waterwisekids.com` and `support@waterwisekids.com` with `waterwisekids.com@gmail.com`. This appears in `/contact/index.html` and homepage schema markup.

### 2. Remove "500+ expert articles" claim
In `/education/index.html`, the meta description (line 7) and hero text (line 323) both claim 500+ articles. You have 8. Change to something honest like "Expert water safety guides for parents."

### 3. Remove "America's National Aquatics Hub" branding
This tagline appears in 20+ locations across the site (meta tags, heroes, footers, schema). Replace with something credible: "Water Safety Resources for Families" or similar.

### 4. Fix or remove all broken Formspree forms
Two forms use `action="https://formspree.io/f/YOUR_FORM_ID"` — literally the placeholder string. Either set up real Formspree form IDs or replace with a simple `mailto:` link to `waterwisekids.com@gmail.com`. Pages affected: `/contact/index.html`, `/swim-schools/add.html`.

### 5. Remove Jobs section entirely
Delete `/jobs/index.html` and `/jobs/post.html`. Remove all nav links, footer links, homepage sections, and CTAs pointing to the jobs board.

### 6. Remove Swim Schools directory section
Delete `/swim-schools/index.html` and `/swim-schools/add.html`. Remove nav links, footer links, and homepage sections promoting the directory.

### 7. Consolidate swim-lessons doorway pages
Merge the 12 location-specific SEO pages into the 2 British Swim School location pages. Remove the copy-pasted fake-neutral review ratings. Remove `/swim-lessons/index.html`.

### 8. Standardize navigation across all pages
Every page should have the same nav: Home, Water Safety, Find Lessons, About, Contact. Remove Jobs, Teens, Gear, Advertise, Swim Schools from nav.

### 9. Standardize footer across all pages
Remove all broken footer links (`/privacy/`, `/terms/`, `/blog/`, `/resources/`, `/pricing/`, `/help/`, `/cookies/`, `/schools/faq/`, `/schools/dashboard/`). Use a simple consistent footer on every page.

### 10. Fix the non-functional newsletter signup
The education page newsletter form fires `alert('Thank you for signing up!')` and does nothing. Either connect it to a real email service or remove it entirely.

---

## Summary

**Total HTML files in repo:** 39
**Recommended for V1 keep/rewrite:** ~14 (homepage, about, contact, education hub, 8 articles, 2 BSS location pages, 404)
**Recommended to delete:** ~8 (jobs board, job post, swim school directory, add school, and potentially swim-lessons index + consolidation)
**Recommended to hide:** ~8 (teens hub + 4 sub-pages, gear guide, advertise)
**Recommended to merge:** ~12 (swim-lessons location pages into BSS pages)

The site's real strength is the 8 water safety education articles and the 2 British Swim School location pages. Everything else is either empty, broken, misleading, or premature. V1 should be a clean, honest water safety resource site that also promotes your swim school locations — not a fake national platform.
