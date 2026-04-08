# WaterWiseKids — Tracking & Measurement Reference

> Last updated: 2026-04-05 (Sprint 6)

## Current State

GTM container **GTM-5DN8B3QT** is installed on all 31+ HTML pages (head snippet + noscript fallback).
GA4 is **not yet connected** — GTM is deployed but no GA4 property is configured inside it.

---

## dataLayer Events (repo-side, ready for GTM triggers)

### 1. `checklist_signup`
**Fires when:** A user successfully submits any newsletter/checklist signup form (Formspree AJAX returns 200).
**Parameter:** `signup_source` (string) — identifies which form converted.
**Source values:**

| Value | Location |
|---|---|
| `homepage-checklist` | Homepage newsletter section |
| `education-hub-checklist` | Education hub newsletter section |
| `article-sidebar-drowning-prevention` | Sidebar form on drowning prevention guide |
| `article-sidebar-when-to-start` | Sidebar form on when-to-start-swim-lessons |
| `article-sidebar-summer-checklist` | Sidebar form on summer water safety checklist |
| `article-sidebar-teach-float` | Sidebar form on teach-child-to-float |
| `article-sidebar-teen-safety` | Sidebar form on water-safety-teens |
| `article-sidebar-bath-safety` | Sidebar form on bath-time-safety-infants |
| `article-sidebar-boating-safety` | Sidebar form on boating-safety-children |
| `article-sidebar-drowning-emergency` | Sidebar form on what-to-do-drowning-emergency |

**Code:** Homepage and education hub have inline AJAX handlers. Article sidebars use the centralized handler in `assets/js/main.js` → `initSidebarNewsletterForms()`.

### 2. `contact_form_submit`
**Fires when:** A user successfully submits the contact form (Formspree AJAX returns 200).
**Parameter:** `form_source` (string) — always `contact-page`.
**Code:** Inline AJAX handler on `contact/index.html`.

### 3. `checklist_print`
**Fires when:** User clicks the "Print or Save as PDF" button on the printable checklist page.
**Parameter:** `print_source` (string) — always `printable-page`.
**Code:** Inline `onclick` on `education/summer-safety-checklist-printable.html`.

---

## data-cta Click Tracking (ready for GTM click trigger)

All major CTAs have `data-cta="[page]-[action]"` attributes. These do NOT fire dataLayer events — they are meant to be captured by a **GTM click trigger** matching the CSS selector `[data-cta]`.

### Convention
`data-cta="[page-slug]-[action-descriptor]"`

### All Current Values

**Homepage (index.html):**
- `home-safety-guides` — Hero CTA → education hub
- `home-find-lessons` — Hero CTA → swim lessons
- `home-offer-guides` — Value card → education hub
- `home-offer-programs` — Value card → swim lessons
- `home-offer-partners` — Value card → for swim schools
- `home-view-all-guides` — Featured guides → education hub
- `home-bss-nwphilly` — BSS card → NW Philly profile
- `home-bss-jerseyshore` — BSS card → Jersey Shore profile
- `home-partnership-link` — Partner section → for swim schools
- `home-about-link` — About section → about page
- `home-b2b-partnerships` — B2B callout → for swim schools

**Education Hub (education/index.html):**
- `edu-hub-find-lessons` — Find Lessons CTA → swim lessons
- `edu-hub-suggest-topic` — Suggest topic → contact

**Swim Lessons (swim-lessons/index.html):**
- `lessons-bss-nwphilly` — BSS NW Philly card
- `lessons-bss-jerseyshore` — BSS Jersey Shore card
- `lessons-recommend` — Recommend a school mailto

**About (about/index.html):**
- `about-contact-cta` — Contact CTA

**Contact (contact/index.html):**
- `contact-email-main` — Email link
- `contact-family-email` — Family mailto
- `contact-partner-email` — Partner mailto

**For Swim Schools (for-swim-schools/index.html):**
- `partners-email-cta` — Partnership email
- `partners-contact-cta` — Contact form link

**BSS Profiles:**
- `bss-nwphilly-trial` — Trial lesson CTA
- `bss-jerseyshore-trial` — Trial lesson CTA

**Education Articles (sidebar CTAs):**
- `boating-safety-find-lessons` — Find Lessons sidebar
- `boating-safety-contact` — Contact sidebar
- `drowning-emergency-find-lessons` — Find Lessons sidebar
- `drowning-emergency-contact` — Contact sidebar

**Printable Checklist:**
- `checklist-print` — Print button
- `checklist-printable-find-lessons` — Find Lessons bottom CTA

---

## data-form Identifiers

| Value | Location | Handler |
|---|---|---|
| `newsletter-homepage` | Homepage | Inline AJAX (index.html) |
| `newsletter-education` | Education hub | Inline AJAX (education/index.html) |
| `newsletter-sidebar` | 8 article sidebars | `main.js` → `initSidebarNewsletterForms()` |
| `contact-main` | Contact page | Inline AJAX (contact/index.html) |

---

## Formspree Endpoints

- **Newsletter signup:** `https://formspree.io/f/mojpyqdo` (all newsletter/checklist forms)
- **Contact form:** `https://formspree.io/f/xzdkybrw` (contact page only)

---

## What Must Be Configured Manually (NOT in repo)

### GTM Setup (tagmanager.google.com)

1. **Create a GA4 property** at analytics.google.com → get the Measurement ID (G-XXXXXXXXXX)
2. **Add GA4 Configuration Tag** in GTM:
   - Tag type: Google Analytics: GA4 Configuration
   - Measurement ID: your G-XXXXXXXXXX
   - Trigger: All Pages
3. **Add GA4 Event Tag for `checklist_signup`:**
   - Tag type: Google Analytics: GA4 Event
   - Event name: `checklist_signup`
   - Event parameter: `signup_source` → read from `dataLayer` variable
   - Trigger: Custom Event → event name equals `checklist_signup`
4. **Add GA4 Event Tag for `contact_form_submit`:**
   - Tag type: Google Analytics: GA4 Event
   - Event name: `contact_form_submit`
   - Event parameter: `form_source` → read from `dataLayer` variable
   - Trigger: Custom Event → event name equals `contact_form_submit`
5. **Add GA4 Event Tag for `checklist_print`:**
   - Tag type: Google Analytics: GA4 Event
   - Event name: `checklist_print`
   - Event parameter: `print_source` → read from `dataLayer` variable
   - Trigger: Custom Event → event name equals `checklist_print`
6. **Add GA4 Event Tag for CTA clicks:**
   - Tag type: Google Analytics: GA4 Event
   - Event name: `cta_click`
   - Event parameter: `cta_name` → read from Click Element's `data-cta` attribute (use a Data Layer Variable or DOM Element Variable)
   - Trigger: Click — All Elements → Click Element matches CSS selector `[data-cta]`
7. **Register Custom Dimensions in GA4:**
   - `signup_source` (event-scoped)
   - `form_source` (event-scoped)
   - `print_source` (event-scoped)
   - `cta_name` (event-scoped)
8. **Publish the GTM container** (Preview first to test)

### Google Search Console Setup

1. Go to search.google.com/search-console
2. Add property: `https://www.waterwisekids.com`
3. Verify ownership (DNS TXT record via Cloudflare, or HTML file upload to repo root)
4. Submit sitemap: `https://www.waterwisekids.com/sitemap.xml`
5. Request indexing for key pages if needed
6. Monitor: Coverage report, Mobile Usability, Core Web Vitals

---

## Articles With Sidebar Newsletter Forms (8 of 19)

1. drowning-prevention-guide
2. when-to-start-swim-lessons
3. summer-water-safety-checklist
4. teach-child-to-float
5. water-safety-teens
6. bath-time-safety-infants
7. boating-safety-children
8. what-to-do-drowning-emergency

**Articles WITHOUT sidebar forms (11):**
fear-of-water, pool-safety-rules, lake-ocean-safety, toddler-water-safety, cpr-basics-parents, swim-milestones-by-age, choosing-a-swim-school, adult-learn-to-swim, vacation-water-safety, first-swim-lesson, water-safety-special-needs

---

## Pages Excluded From Indexing

- `education/summer-safety-checklist-printable.html` — noindex (lead magnet delivery asset)
- 12 legacy root-level HTML files (about.html, articles.html, how-to-*.html, beginner-swim-*.html, are-infant-swim-lessons-safe.html) — noindex + canonical pointing to current pages
- `404.html` — not in sitemap (browsers don't index 404 responses)
