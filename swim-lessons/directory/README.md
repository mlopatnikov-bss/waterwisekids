# WaterWiseKids Swim School Directory

## Overview

This directory contains the complete swim school directory system for waterwisekids.com, featuring:

- **1 main directory index page** with state grid and live search
- **51 individual state pages** (50 states + Washington, DC)
- **1 centralized data file** with all swim school listings organized by state

## Files

### Main Files

- `index.html` - Main directory landing page with:
  - Hero banner "Find Swim Lessons Near You"
  - Live search by school name, city, and state
  - Grid of 51 clickable state cards (shows school counts)
  - Dynamic school listings with filters
  - Review system (stores in localStorage)
  - Full responsive design
  - SEO schema markup

- `schools-data.js` - Centralized data file containing:
  - 300+ swim school listings
  - All 51 states + DC represented
  - Minimum 2-10 schools per state
  - Major chains: British Swim School, Goldfish Swim School, Aqua-Tots, SafeSplash, Bear Paddle, Big Blue, Emler, SwimKids, YMCA
  - Each listing includes:
    - Name, chain, address, city, state, zip
    - Website, phone number
    - Programs offered (infant, toddler, preschool, school-age, adult)
    - Indoor/outdoor designation
    - Year-round or seasonal
    - Placeholder ratings and review counts

### State Pages

Individual pages for all 51 states/territories:

- `alabama.html` through `wyoming.html`
- `washington-dc.html` (for Washington, DC)

Each state page features:
- SEO-optimized title and metadata for that state
- Hero banner with state name
- Search bars for school name and city (filtered to state only)
- All schools in that state displayed with full details
- Review system (stores in localStorage)
- Back navigation to directory and main swim-lessons page
- Responsive mobile design
- Schema markup

### Generation Script

- `generate-state-pages.sh` - Bash script that:
  - Generated all 51 state pages from a template
  - Properly substituted state codes and names
  - Applied responsive CSS styling to each page

## Data Structure

Each school listing includes:

```javascript
{
  name: "School Name",
  chain: "Chain Name",
  address: "Street Address",
  city: "City Name",
  state: "ST",
  zip: "12345",
  website: "https://www.example.com",
  phone: "(555) 555-0000",
  programs: ["infant", "toddler", "preschool", "school-age", "adult"],
  indoor: true,
  yearRound: true,
  rating: 4.5,
  reviews: 32
}
```

## Features

### Search & Filter
- Search by school name (case-insensitive)
- Filter by city
- Filter by state
- Real-time dynamic results

### State Navigation
- Click any state card in the grid
- Or use dropdown filter on index page
- Direct links from each state page back to directory

### Review System
- Click "Leave a Review" on any school
- Modal form for 1-5 star ratings
- Text review with localStorage persistence
- Reviews stored per-school

### Responsive Design
- Mobile-first approach
- Hamburger menu on mobile
- Touch-friendly buttons and spacing
- Responsive grid layouts

### SEO Optimization
- Unique title/description per page
- Proper heading hierarchy
- Schema.org markup (WebPage type)
- Canonical URLs
- Open Graph metadata
- Breadcrumb navigation
- Descriptive alt attributes

## Directory Structure

```
/swim-lessons/directory/
  ├── index.html                    (main directory page)
  ├── schools-data.js               (data file - 300+ schools)
  ├── alabama.html through wyoming.html  (50 state pages)
  ├── washington-dc.html            (DC page)
  ├── generate-state-pages.sh       (generation script)
  └── README.md                     (this file)
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- JavaScript ES6+ (const, arrow functions, etc.)
- localStorage for review persistence

## Performance

- Zero external dependencies
- All CSS embedded inline
- Lightweight data file (one load per page)
- No API calls required for core functionality
- Fast state page loads (minimal template repetition)

## Future Enhancements

Potential improvements:
- Backend database for verified listings
- User authentication for reviews
- School signup/claiming
- Advanced filtering (distance, price, specific programs)
- Review moderation
- School comparison tool
- Ratings aggregation

## Total Content

- **52 HTML pages** (1 index + 51 state pages)
- **1 JavaScript data file** with 300+ school listings
- **Covers all 50 states + DC**
- **Major swim chains represented**
- **Fully responsive and SEO-optimized**

