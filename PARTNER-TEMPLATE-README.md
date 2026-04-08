# Partner School Profile Template

This document guides the creation and management of partner swim school profile pages on WaterWiseKids.

## Profile Page Structure

Each partner school profile follows this proven structure:

1. **Header & Navigation** — Sticky header with logo and nav links
2. **Hero Section** — School name, tagline, and rating banner with stars
3. **Info Box** — Quick summary (optional: location, founded, accreditations)
4. **Quick Info Grid** — Key details in cards (e.g., age range, certifications, hours)
5. **Why Choose Section** — Bulleted unique value propositions with checkmark styling
6. **Programs Section** — Age-based programs in a grid layout with program cards
7. **Service Areas Section** — Geographic coverage with area-item grid
8. **Reviews Section** — Parent testimonials (3-4 reviews minimum)
9. **FAQ Section** — Expandable Q&A for common questions (6-8 items)
10. **CTA Section** — Call-to-action with button to contact/schedule
11. **Footer** — Links and copyright info

## How to Create a New Partner Page

### Step 1: Copy the Template
Use `/british-swim-school/northwest-philadelphia.html` as your base template. Copy it to your new location:
- **Recommended path:** `/british-swim-school/{location-name}.html`
- **Alternative path:** `/partners/{school-name}.html`

### Step 2: Update Content Sections

Replace these placeholder/example values with the partner's actual information:

- **Head Meta Tags:**
  - `<title>` — Include school name, region, and "WaterWiseKids"
  - `<meta name="description">` — 160 characters max, include service areas
  - `<meta name="keywords">` — School name, location, "swim lessons", "certified instructors"

- **Hero Section:**
  - School name (h1)
  - Tagline or key differentiator
  - Optional: 5-star rating banner (if available)

- **Info Box & Quick Info Grid:**
  - Founded year, accreditations, certifications
  - Age range served (Infant/Toddler through Adult)
  - Class sizes / instructor ratios

- **Why Choose:**
  - 4-6 bullet points of unique value (safety record, credentials, approach, facilities, etc.)

- **Programs:**
  - Break down by age group: Infants, Toddlers, Preschool, School-Age, Teens, Adults
  - For each: title and brief description (2-3 sentences)
  - Use age-badge styling for clarity

- **Service Areas:**
  - List all towns/areas covered (grid layout with arrow styling)
  - Include neighborhoods and surrounding suburbs

- **Reviews:**
  - 3-4 parent testimonials minimum
  - Include name and relation (e.g., "Parent of 4-year-old")
  - Keep them authentic; 2-3 sentences each

- **FAQ:**
  - 6-8 common questions about programs, registration, pricing, location, etc.
  - Use expandable/collapsible styling (JavaScript driven)
  - Answers: 2-4 sentences, practical and direct

- **CTA Button:**
  - Link to: Phone number (tel:), email (mailto:), or external website
  - Button text: "Schedule a Trial" or "Contact Us" (consistent language)

## Required vs. Optional Sections

**Always include:**
- Hero section with school name
- Quick info grid (at minimum: age range, location)
- Why choose section
- Programs section
- Service areas
- CTA button

**Highly recommended:**
- Reviews section (builds trust)
- FAQ section (answers common questions)

**Optional:**
- Info box (useful if school has notable credentials)
- Rating banner (only if 4.5+ stars verified)

## File Naming Convention

Use one of these patterns:

**Primary (recommended for franchise/chain):**
```
/british-swim-school/{location-name}.html
Examples: northwest-philadelphia.html, jersey-shore.html
```

**Alternative (for independent schools or new networks):**
```
/partners/{school-name}.html
Examples: aquatic-academy-chicago.html, swim-smart-denver.html
```

**Rules:**
- Use lowercase with hyphens
- Keep filenames short but descriptive
- Avoid special characters

## Checklist: Adding a New Partner

When you add a new partner school, follow this checklist to ensure full integration:

### Content
- [ ] Create profile page from template (update all sections)
- [ ] Verify school info with partner before publishing
- [ ] Include at least 3 parent reviews
- [ ] Add 6+ FAQ items
- [ ] Confirm service areas are accurate

### Site Integration
- [ ] Add program-card to `/swim-lessons/index.html` with:
  - [ ] Unique `data-partner="school-id"` attribute
  - [ ] Region label in program-card-label
  - [ ] "Learn More" button pointing to profile page
- [ ] Update `/sitemap.xml` (add URL in partner section with today's date)

### Optional
- [ ] Feature on homepage (if flagship partner or new market)
- [ ] Create internal tracking (Google Analytics with partner ID)
- [ ] Add to email announcement or blog post

## Template Styling

All profile pages use consistent styling defined in the BSS template. Key classes:

```html
.hero                    /* Blue gradient header */
.info-box               /* White card with shadow */
.info-grid              /* 3-column responsive grid */
.info-item              /* Card with left border accent */
.why-choose             /* Light blue box with check icons */
.program-grid           /* Auto-fit grid for program cards */
.program-card           /* Light blue gradient card */
.age-badge              /* Blue pill badge for age groups */
.service-area           /* Grid items with arrow prefix */
.reviews                /* White box with review cards */
.review                 /* Individual review with left accent */
.faq-section            /* Expandable FAQ with + / - toggle */
.cta-section            /* Teal gradient with white CTA button */
```

Do not modify these core styles — maintain visual consistency across all partner profiles.

## JavaScript Interactivity

The FAQ section uses a simple expand/collapse pattern. Include this in your page:

```html
<div class="faq-item">
  <h4>Question?</h4>
  <div class="faq-answer">Answer details...</div>
</div>
```

JavaScript will toggle `.active` class on click (or include simple vanilla JS to handle clicks).

## Content Tips

- **Keep it scannable:** Use short sentences, bullet points, and headers
- **Be specific:** "Northwest Philadelphia and surrounding suburbs" is better than "Philadelphia area"
- **Build trust:** Highlight certifications, years in business, instructor credentials
- **Answer real questions:** FAQs should reflect what parents actually ask
- **Show personality:** Each school should feel distinct, not generic

## Future Enhancements

Once established, partners can support:
- Embedded class calendar / booking widget
- Real-time availability status
- Parent review aggregation (Google, Yelp, etc.)
- Program pricing transparency
- Video tours or instructor bios
- Dynamic program-card loading via API

---

**Questions?** Contact waterwisekids.com@gmail.com
