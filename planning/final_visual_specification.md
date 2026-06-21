# NASA Space Explorer — Final Visual Specification

**Document type:** Implementation-ready visual specification
**Inputs reviewed:**
- Three UI mockups (Homepage, APOD page, Mars Rover Explorer page)
- `project_specification.md` (v2.0)
- `design_specification.md` (design system, color palette, typography, components)
- `website_blueprint.md` (wireframes, component inventory, user journeys, accessibility)

---

## Part 1 — Mockup Evaluation

---

### Mockup A: Homepage

#### Strengths

1. **The hero section delivers immediate visual impact.** The stacked headline ("Explore. Discover. Understand.") on the left with a full-bleed space photograph on the right creates a strong first impression. The asymmetric split (text left, image right) is a well-understood layout that collapses cleanly on mobile. This aligns with the project specification's call for a "simple hero section" and the blueprint's wireframe (§3.1).

2. **The navigation is exactly what the blueprint specifies.** Left-aligned wordmark ("Astra° SPACE EXPLORER"), right-aligned text links (Home, APOD, Mars Rover, About), active underline on the current page. It matches the blueprint's §2.1 wireframe line-for-line. No dropdown menus, no icons in the nav — just text links. This is the easiest possible navigation to implement.

3. **The three feature cards are well-executed.** Each card uses a real photograph as a background with text overlaid at the bottom. The cards serve as the blueprint's FeatureCard component (§5.2). The arrow affordance (→) on each card provides a clear interactive signal. This directly satisfies the project specification's requirement for "navigation to the APOD page" and "navigation to the Rover Explorer page" from the homepage.

4. **The footer is minimal and honest.** A single line: "Not affiliated with any government agency. Data and imagery from public sources." This matches the blueprint's SiteFooter component (§5.1) — no link columns, no social icons, no bloat. A student can implement this in five minutes.

5. **The dark theme is handled with restraint.** Near-black background, white text, no gratuitous color splashes. This matches the design specification's `--bg-primary: #0A0A0A` and `--text-primary: #FFFFFF` tokens. The mockup doesn't introduce any colors beyond the base palette.

#### Weaknesses

1. **The hero image is static, not today's APOD.** The project specification (§Website Structure → Home) requires "a featured APOD preview." The blueprint's wireframe (§3.1) explicitly shows "TODAY'S APOD IMAGE (right, ~50%)" with "[Dynamic: fetched on page load]" and a "VIEW FULL →" link. The mockup shows a generic Earth photograph instead. This is a specification violation that must be corrected.

2. **The About card's satellite image bleeds off the right edge.** The APOD and Mars Rover cards contain their imagery within bounds, but the About card's satellite is cropped at the card boundary in an unbalanced way. The design specification's `.feature-card` component uses `overflow: hidden`, so the implementation would clip this — but the visual weight of the three cards should feel even.

3. **The subtitle text appears to be low-contrast grey.** The line "Journey through space with Astra's images, missions, and discoveries" reads as approximately #808080 on #0A0A0A. The design specification mandates `--text-secondary: #B0B0B0` as the minimum for descriptive text, which gives a 7.1:1 ratio against `--bg-primary`. The mockup's grey may fall below WCAG AA's 4.5:1 threshold for body text.

4. **The CTA button ("Start Exploring →") is thin-bordered and small.** On mobile, this may fail the blueprint's 44×44px minimum touch target requirement (§6.3). The design specification's `.btn-primary` has `padding: var(--space-3) var(--space-5)` (12px 24px), which should give adequate height, but the mockup appears to have tighter padding than that.

#### Implementation Difficulty

**Low.** The page is a vertical stack: sticky header → full-bleed hero (CSS Grid two-column or Flexbox) → three-column card grid → footer. No JavaScript is required for layout. The only JS needed is the APOD fetch for the hero preview, which the api_contracts document covers with a ready-made `fetchAPOD()` pattern. A student can build this page in a single session.

#### Suitability for Student Team

**Excellent.** Every element maps to a standard HTML element and basic CSS. The hero is a `<section>` with two children in a grid. The cards are `<a>` elements with background images. The footer is a `<footer>` with a `<p>`. No component libraries, no build tools, no complex state management.

---

### Mockup B: Mars Rover Explorer

#### Strengths

1. **The filter controls are clear and well-labeled.** "SOL (MARTIAN DAY)" with a dropdown-style selector and "INSTRUMENT" with an "ALL CAMERAS" dropdown sit on a single row. This maps directly to the blueprint's SolInput and CameraDropdown components (§5.4). The "DATASET: 124 IMAGES" counter in the top-right gives immediate result-set context, matching the blueprint's ResultsStatusBar.

2. **The page title creates a strong page identity.** "MARS ROVER EXPLORER" in large uppercase type immediately tells the user where they are. The blueprint's wireframe (§3.3) shows exactly this pattern: page title in H1, uppercase, with a subtitle below. The mockup follows this faithfully.

3. **The rover metadata panel is well-structured.** Rover name (PERSEVERANCE), landing date (FEB 18, 2021), and location (JEZERO CRATER) are presented in a label-value format. This matches the blueprint's RoverMetadataPanel component (§5.4) — small grey label above, bold white value below. Students can replicate this pattern trivially with `<dl>`, `<dt>`, `<dd>` elements.

4. **The breadcrumb ("← RETURN TO HOME") provides clear escape navigation.** The blueprint (§2.3) specifies this exact pattern: "← HOME / MARS ROVER EXPLORER" in monospace at `0.75rem`. The mockup simplifies it to "← RETURN TO HOME," which is functionally identical and arguably clearer.

5. **The gallery images are visually compelling.** The mix of landscape and detail shots from Mars demonstrates what real API data looks like. This gives stakeholders confidence that the final product will be visually engaging even with minimal design effort — NASA's images do the heavy lifting.

#### Weaknesses

1. **The gallery uses a masonry layout with variable-height cells.** This is the single biggest implementation risk on this page. The blueprint (§3.3) explicitly specifies a "3-column uniform grid" with "aspect-ratio: 4/3" for every cell. The design specification (§4.6) reinforces this: `.gallery-grid { grid-template-columns: repeat(3, 1fr); }` with `.gallery-item { aspect-ratio: 4 / 3; }`. Masonry requires either CSS `column-count` (which reorders items unpredictably) or a JavaScript library (which adds a dependency the project specification explicitly discourages). This must be changed to a uniform grid.

2. **"LIVE FROM MARS" is factually incorrect.** The data comes from NASA's historical archive, not a live feed. The api_contracts document (§2) describes the endpoint as returning photos for a given Sol — this is archival retrieval. Displaying "LIVE FROM MARS" misleads users. The blueprint does not include this indicator anywhere. It must be removed.

3. **The mockup shows "PERSEVERANCE" as the selected rover, but the project specification only supports Curiosity, Opportunity, and Spirit.** The project specification (§Core Feature 2) lists exactly three rovers. The api_contracts document (§2.1) confirms: `{rover}` is one of `curiosity`, `opportunity`, `spirit`. Perseverance uses a different API endpoint. The mockup's rover selection must be corrected to show one of the three supported rovers.

4. **The rover hero image (the Curiosity selfie) floats in an ambiguous zone between the header and the filter controls.** It's not a full-bleed banner, and it's not part of the metadata panel. The blueprint's wireframe (§3.3) does not include a hero image — it goes directly from breadcrumb → page title → rover selector + metadata panel → filter controls → gallery. This image should be removed to match the blueprint and reduce visual complexity.

5. **No pagination controls are visible.** The NASA API returns 25 photos per page (api_contracts §2.3). The blueprint (§3.3) explicitly includes a pagination bar: "[← PREV] PAGE 1 OF 5 [NEXT →]". The mockup shows no way to navigate beyond the first page of results. This must be added.

6. **The "DECODING..." loading state** in one gallery cell is a creative touch, but it deviates from the design specification's loading pattern (a `--bg-surface` pulse placeholder). The blueprint (§5.1) defines a LoadingPulse component that should be used consistently. Inventing a custom loading animation for one component adds implementation effort and visual inconsistency.

#### Implementation Difficulty

**Medium (as mocked), Low (with modifications).** The masonry grid is the primary complexity driver. If replaced with a uniform 3-column grid, the page becomes straightforward CSS Grid + a single `fetch()` call with DOM rendering. The filter controls are standard `<select>` and `<input type="number">` elements. Pagination is two buttons with page-number state. With the recommended simplifications, a student can build this in two sessions.

#### Suitability for Student Team

**Good, after simplifications.** The uniform grid, standard form controls, and fetch-render cycle are all excellent learning exercises. The masonry layout and custom loading animation are unnecessarily ambitious for a student project. Removing them brings this page squarely into student territory.

---

### Mockup C: APOD Page

#### Strengths

1. **The two-column layout is the right choice for this content.** The left column (image, metadata, explanation) and right column (date picker, random APOD, recent thumbnails) create a clear primary/secondary hierarchy. This maps precisely to the blueprint's wireframe (§3.2): "MAIN CONTENT COLUMN (~65%)" and "SIDEBAR (~35%)". The user's eye naturally reads the left column first, which is where the content lives.

2. **The section labels ("DETAILS", "EXPLANATION") with accent-colored horizontal rules create clean visual separation.** This matches the design specification's SectionLabel component (`0.75rem`, uppercase, `--accent-primary`, `letter-spacing: 0.1em`) and the SectionDivider component (`1px solid --border-subtle`). The teal/cyan accent is consistent with `--accent-primary: #4DA8DA`.

3. **The action buttons below the image (download, expand, share) are appropriately minimal.** Three icon buttons with thin borders, matching the design specification's "Secondary (Ghost)" button style. They don't compete with the image for attention. The blueprint (§3.2) specifies exactly these three actions.

4. **The sidebar's "SHOW ME" random APOD button is simple and engaging.** It's a single fetch to a random date — the api_contracts document doesn't use the `count` parameter, but the blueprint (§3.2) describes the implementation: "generate a random date between 1995-06-16 and today; fetch that date's APOD." This is trivial JavaScript and adds genuine discovery value.

5. **The recent APOD thumbnails in the sidebar encourage browsing.** Five small thumbnails with titles and dates provide a browsing history. The blueprint (§3.2) specifies: "pre-fetch the previous 5 calendar days on page load. Display as 120×80px items." This matches the mockup.

6. **The date navigation controls (← calendar grid →) provide clear temporal navigation.** The previous/next arrows and calendar icon give the user three ways to change dates: direct input, sequential stepping, and calendar browsing.

#### Weaknesses

1. **The metadata table includes fields the API does not provide.** The mockup shows "CONSTELLATION: Lyra", "DISTANCE: ~2,300 light-years", and "CATEGORY: Planetary Nebula". The api_contracts document (§1.4) explicitly lists the available fields: `title`, `date`, `explanation`, `url`, `media_type`. Constellation, Distance, and Category are not returned by the API. The blueprint (§3.2) corrects this: "Metadata table: only include fields available from the API. Fields: date, title, copyright (label as CREDIT), media_type." These fabricated fields must be removed.

2. **The date navigation implies a custom calendar picker.** The calendar grid icon between the ← and → arrows suggests a full calendar component. The api_contracts document (§1.8) recommends: "Use `<input type=\"date\">` with `min=\"1995-06-16\"` and `max` set dynamically to today's date." The blueprint (§3.2) agrees: "native `<input type=\"date\">`." Building a custom calendar picker is one of the most time-consuming components in web development. The design specification (§4.10, mistake #15) explicitly warns: "Do not build a custom date picker." This must be replaced with a native date input.

3. **The footer includes links to pages that don't exist.** "IMAGE CREDITS", "PRIVACY POLICY", and "GITHUB" appear in the footer. The project specification defines exactly four pages: Home, APOD, Mars Rover Explorer, and About. The blueprint (§3.4) warns: "Do not add links to external pages that do not exist." The design specification (§4.10) reinforces: "Dead links are worse than no links." These must be removed. The footer should match the homepage's minimal version.

4. **The accent color (teal/cyan) for section labels first appears prominently on this page.** If this color isn't used on the homepage and Mars Rover page with equal prominence, it will feel inconsistent. The design specification defines `--accent-primary: #4DA8DA` for use across all pages — active nav underline, card arrows, section labels, focus rings. The implementation must apply this color consistently everywhere, not just on the APOD page.

5. **The sidebar is content-heavy and will require careful mobile stacking.** On screens below 768px, the blueprint (§6.2) specifies: "Single column: content first, sidebar below." The sidebar contains a date picker, previous/next buttons, a random APOD button, an "about APOD" text block, and five thumbnail items. Stacked vertically below the main content, this adds significant page length on mobile. The "about APOD" text block should be considered for removal — the About page already serves this purpose.

6. **The "PHOTOGRAPHER" field in the metadata table** shows "NASA, ESA, and the Hubble Heritage Team (STScI/AURA)". The API field for this is `copyright`, not "photographer." Some APOD entries have no `copyright` value (meaning NASA is the default copyright holder). The label should read "CREDIT" and gracefully handle missing values by displaying "NASA" as the default.

#### Implementation Difficulty

**Medium.** The two-column layout is simple CSS Grid. The date picker uses native `<input type="date">`. The metadata table is a `<dl>` or `<table>`. The explanation is a `<section>` with a `<p>`. The sidebar components (date input, random button, thumbnail list) each require small amounts of JavaScript. The recent APOD thumbnails require 5 additional API calls on page load, which is the most complex part — but the api_contracts document confirms these are simple GET requests with no special handling. The lightbox (triggered by the expand button) needs focus trapping, which the blueprint (§7.3) describes in detail.

#### Suitability for Student Team

**Good.** The page teaches important patterns: fetching data by parameter, conditional rendering (image vs. video), structured metadata display, sidebar with independent controls. The main risk is scope creep from the metadata fields and the custom calendar — both of which are addressed by the simplifications below.

---

## Part 2 — Direction Selection

---

### Selected Direction

**The Astra direction is selected in its entirety.** All three mockups share a single cohesive visual language: the same wordmark, navigation, color sensibility, typographic voice, and surface treatment. This is not a choice between three competing directions — it's a unified concept with per-page adaptations.

### Why This Direction Works

1. **It matches the project specification's tone.** The specification says the website should feel "clean, modern, organized, scientific, calm, professional" and should not feel "overly futuristic, excessively animated, like a creative agency portfolio." The Astra direction hits every positive adjective and avoids every negative one. The dark background lets NASA imagery shine; the typography is restrained; the animations are limited to hover transitions.

2. **Photography is the design.** The mockups rely on NASA's own imagery for visual impact. This means the design remains compelling with zero custom illustrations, zero stock photography, and zero AI-generated assets. The only images on the site come from the two NASA APIs — which is exactly what the project is about.

3. **The layout patterns are conventional and well-documented.** Hero + cards (homepage), sidebar + content (APOD), filter + gallery (Mars Rover) — these are the three most common web layout patterns. Every CSS tutorial covers them. A student searching "CSS two-column layout" will find applicable guidance immediately.

4. **The component inventory is small.** The blueprint lists roughly 30 components across all pages. Many are shared (header, footer, breadcrumb, section label, loading pulse, lightbox). Page-specific components are simple: a card, a metadata table, a gallery grid, a date input. No component requires more than 50 lines of CSS.

5. **The technical stack aligns perfectly.** HTML5 + CSS3 + Vanilla JavaScript. No React, no Vue, no Tailwind, no build step. The api_contracts document provides copy-paste-ready `fetch()` patterns. A student can open `index.html` in a browser and see results.

---

## Part 3 — Recommended Simplifications

These changes reduce implementation effort without degrading the user experience. Each simplification is cross-referenced to the relevant specification document.

---

### Simplification 1: Replace the masonry gallery with a uniform grid

**Mockup affected:** Mars Rover Explorer
**Specification alignment:** Design specification §4.6 (`.gallery-grid`), Blueprint §3.3 ("3-column uniform grid")

The masonry layout adds visual interest but introduces significant complexity:
- CSS `column-count` reflows items in column-major order (top-to-bottom, then left-to-right), which is confusing for API results that have a natural chronological order.
- JavaScript masonry libraries (e.g., Masonry.js, Isotope) add a dependency, increase bundle size, and require resize listeners.
- Variable-height cells make the loading placeholder state harder to implement — you need to know image dimensions before the images load.

**Replace with:** A uniform `repeat(3, 1fr)` CSS Grid where every cell has `aspect-ratio: 4/3` and `object-fit: cover`. This is three lines of CSS. Images are cropped to fit, which is acceptable for thumbnail browsing — the lightbox shows the full image.

---

### Simplification 2: Use native `<input type="date">` instead of a custom calendar

**Mockup affected:** APOD page
**Specification alignment:** API contracts §1.8, Design specification §4.10 (mistake #15), Blueprint §3.2

The mockup's calendar grid icon implies a custom date picker component. Custom date pickers are:
- One of the most time-consuming UI components to build from scratch (date arithmetic, keyboard navigation, month/year switching, localization).
- A major accessibility liability if not implemented with full ARIA support.
- Unnecessary, because every modern browser provides a native date picker that is already accessible, keyboard-navigable, and locale-aware.

**Replace with:** `<input type="date" id="apod-date" min="1995-06-16">` with `max` set dynamically to today. Style the input to match the dark theme using the `.input-field` class from the design specification (§4.6). Add a "LOAD →" button as the explicit trigger.

Keep the ← and → arrow buttons for stepping one day backward/forward — these are simple JavaScript (`date.setDate(date.getDate() - 1)`).

---

### Simplification 3: Remove metadata fields not provided by the API

**Mockup affected:** APOD page
**Specification alignment:** API contracts §1.4 (available fields), Blueprint §3.2 (implementation notes)

The mockup's metadata table shows Constellation, Distance, Category, Photographer, and Source. The API returns: `date`, `title`, `explanation`, `url`, `hdurl`, `media_type`, and `copyright`.

**Reduce the table to:**

| Label | API field | Notes |
|---|---|---|
| DATE | `date` | Format as human-readable (e.g., "May 12, 2024") |
| TITLE | `title` | As returned |
| CREDIT | `copyright` | If null/missing, display "NASA" |
| TYPE | `media_type` | Display as "Image" or "Video" |

Four rows. Clean, accurate, implementable.

---

### Simplification 4: Remove the "About APOD" text block from the sidebar

**Mockup affected:** APOD page
**Specification alignment:** Blueprint §3.2 (sidebar wireframe)

The sidebar in the mockup contains a block of explanatory text: "Astronomy Picture of the Day (APOD) showcases a different image or photograph of our fascinating universe every day, along with a brief explanation written by a professional astronomer." This is informational padding. The About page (blueprint §3.4) already covers what the project is and what APOD is.

**Remove this block.** The sidebar should contain only functional elements:
1. Date picker + LOAD button
2. ← Previous / Next → day buttons
3. Random APOD button
4. Recent APOD thumbnails (5 items)

This reduces sidebar height (important for mobile stacking) and keeps the sidebar purely interactive.

---

### Simplification 5: Use a consistent, minimal footer on all pages

**Mockup affected:** APOD page (footer has extra links), all pages (consistency)
**Specification alignment:** Blueprint §5.1 (SiteFooter), Design specification §4.10 (no dead links)

The homepage footer is correct: a single disclaimer line. The APOD footer adds "IMAGE CREDITS", "PRIVACY POLICY", "GITHUB" — pages that don't exist in the project specification.

**Standardize all pages to use the homepage's footer:**

```
© 2025 Astra Space Explorer · Data provided by NASA Open APIs
Not affiliated with any government agency.
```

One line, no links (except optionally a link to `api.nasa.gov` on "NASA Open APIs"). This footer is identical across all four pages.

---

### Simplification 6: Remove the rover hero image from the Mars Rover page

**Mockup affected:** Mars Rover Explorer
**Specification alignment:** Blueprint §3.3 (wireframe shows no hero image)

The mockup places a Curiosity rover photograph between the page title and the filter controls. This image:
- Is not part of the blueprint's wireframe.
- Creates an ambiguous layout zone (neither a full-bleed hero nor a content image).
- Takes up vertical space that pushes the gallery further down the page.
- Cannot be dynamically sourced from the API without an extra request.

**Remove it.** The page flow should be: Header → Breadcrumb → Page Title + Subtitle → Rover Selector + Metadata Panel → Filter Controls → Results Status Bar → Gallery → Pagination → Footer. This matches the blueprint exactly.

---

### Simplification 7: Remove "LIVE FROM MARS"

**Mockup affected:** Mars Rover Explorer
**Specification alignment:** API contracts §2.2 (archival data), project specification (accuracy)

The data is not live. It comes from NASA's historical archive indexed by Sol. Displaying "LIVE FROM MARS" is misleading. The project specification requires that "NASA data is displayed accurately." Remove this indicator entirely.

---

### Simplification 8: Use the loading pulse placeholder consistently

**Mockup affected:** Mars Rover Explorer ("DECODING..." text)
**Specification alignment:** Design specification §4.7 (loading states), Blueprint §5.1 (LoadingPulse component)

The mockup shows "DECODING..." with a spinning icon in one gallery cell. The design specification defines a single loading pattern: a `--bg-surface` colored placeholder with a subtle opacity pulse animation. The blueprint defines a LoadingPulse component used globally.

**Replace "DECODING..." with the standard LoadingPulse.** This ensures visual consistency across all loading states (hero image, APOD figure, gallery cells, recent thumbnails) and requires only one CSS `@keyframes` definition.

---

### Simplification 9: Correct the rover list to match the specification

**Mockup affected:** Mars Rover Explorer
**Specification alignment:** Project specification §Core Feature 2, API contracts §2.1

The mockup shows Perseverance. The project supports Curiosity, Opportunity, and Spirit only. Perseverance uses a different API structure. The rover selector must offer exactly three options.

---

## Part 4 — Recommended Improvements

These changes add value without significant implementation cost.

---

### Improvement 1: Make the homepage hero dynamic with today's APOD

**Specification alignment:** Project specification (featured APOD preview), Blueprint §3.1 (HeroAPODPreview component)

On page load, fetch today's APOD and display it as the hero's right-column background. Overlay the APOD title and a "VIEW FULL →" link at the bottom of the image. This satisfies the project specification's requirement and makes the homepage feel alive.

**Fallback:** If the APOD fetch fails, display a static fallback image (a public-domain NASA photograph bundled with the project, e.g., a Hubble deep field image). No error text in the hero — the failure is silent and graceful.

**Implementation cost:** One `fetchAPOD()` call on `DOMContentLoaded`, one image element update, one text element update. Approximately 15 lines of JavaScript.

---

### Improvement 2: Support URL query parameters for shareable APOD links

**Specification alignment:** Blueprint §8, Journey 3 (sharing a specific APOD)

When a user loads an APOD by date, update the browser URL to `apod.html?date=2024-05-12`. On page load, check for this parameter and fetch that date instead of today. This makes APOD links shareable — a user can send a URL to a friend and it will load the correct image.

**Implementation cost:** `URLSearchParams` to read the parameter, `history.replaceState` to update the URL without a page reload. Approximately 10 lines of JavaScript.

---

### Improvement 3: Add pagination to the Mars Rover gallery

**Specification alignment:** Blueprint §3.3 (PaginationBar component), API contracts §2.3 (`page` parameter)

The NASA API returns 25 images per page. Without pagination, users can only see the first 25 images for any Sol. Add a simple "← PREV / PAGE N OF M / NEXT →" bar below the gallery.

**Calculating total pages:** The API doesn't return a total count directly. On the first fetch, if exactly 25 images are returned, assume more pages exist and enable the NEXT button. If fewer than 25 are returned, the current page is the last page. This is a standard "has more" pagination pattern.

**Implementation cost:** One `page` variable in state, one additional parameter in the fetch URL, two buttons with click handlers. Approximately 20 lines of JavaScript.

---

### Improvement 4: Add a lightbox for both APOD and Mars Rover images

**Specification alignment:** Blueprint §3.2 (APOD lightbox), §3.3 (Mars Rover lightbox), §5.1 (ImageLightbox component)

When a user clicks the "EXPAND" button on the APOD page or clicks any gallery image on the Mars Rover page, open a full-screen overlay showing the image at maximum size with `object-fit: contain`. Include a close button (×) and support the Escape key to close.

**For Mars Rover:** Add ← / → keyboard navigation within the current page's results.

**Implementation cost:** One shared lightbox component (a `<div>` with `role="dialog"`, one `<img>`, one close button). Approximately 40 lines of JavaScript for open/close, keyboard handling, and focus trapping. Reused across both pages.

---

### Improvement 5: Pre-populate the rover metadata panel from a static config

**Specification alignment:** Blueprint §3.3 (RoverMetadataPanel, implementation notes)

Instead of making an API call to get rover metadata, store it in a static JavaScript object:

```javascript
const ROVER_CONFIG = {
  curiosity: {
    name: 'Curiosity',
    landing_date: 'August 6, 2012',
    location: 'Gale Crater',
    status: 'Active',
    max_sol: 4400,
    cameras: ['FHAZ', 'RHAZ', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI', 'NAVCAM']
  },
  opportunity: {
    name: 'Opportunity',
    landing_date: 'January 25, 2004',
    location: 'Meridiani Planum',
    status: 'Complete',
    max_sol: 5111,
    cameras: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES']
  },
  spirit: {
    name: 'Spirit',
    landing_date: 'January 4, 2004',
    location: 'Gusev Crater',
    status: 'Complete',
    max_sol: 2208,
    cameras: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES']
  }
};
```

This eliminates an API call and makes the page instantly responsive when the user switches rovers. The blueprint (§3.3) explicitly recommends this: "populated from a static configuration object in JavaScript."

---

## Part 5 — Final Visual Specification

This section is the implementation-ready reference. It supersedes any conflicting details in the individual mockups. Where this document is silent, defer to the design specification and then the blueprint.

---

### 5.1 Design Tokens (CSS Custom Properties)

Define all tokens in a single `:root` block at the top of `styles.css`. Every component must reference these tokens — no hardcoded values anywhere.

```css
:root {
  /* ── Backgrounds ── */
  --bg-primary: #0A0A0A;
  --bg-elevated: #141414;
  --bg-surface: #1A1A1A;

  /* ── Borders ── */
  --border-subtle: #2A2A2A;
  --border-default: #3A3A3A;

  /* ── Text ── */
  --text-primary: #FFFFFF;
  --text-secondary: #B0B0B0;
  --text-tertiary: #707070;
  --text-disabled: #4A4A4A;

  /* ── Accent ── */
  --accent-primary: #4DA8DA;
  --accent-hover: #6BBCE6;
  --accent-muted: rgba(77, 168, 218, 0.15);

  /* ── Status ── */
  --status-error: #E57373;

  /* ── Spacing (base-4) ── */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;

  /* ── Typography ── */
  --font-body: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}
```

**Font loading:** Include in `<head>` on every page:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
```

Load Inter at 400, 500, 700. Load JetBrains Mono at 400 only.

---

### 5.2 Typography Scale

| Role | Element | Font | Size | Weight | Line Height | Letter Spacing | Transform |
|---|---|---|---|---|---|---|---|
| Display | Hero headline | Inter | `clamp(2.5rem, 5vw, 4rem)` | 700 | 1.1 | `-0.02em` | None |
| H1 | Page title | Inter | `clamp(2rem, 4vw, 3rem)` | 700 | 1.15 | `-0.01em` | Uppercase |
| H2 | Section heading | Inter | `1.5rem` | 700 | 1.3 | `0` | None |
| H3 | Card title | Inter | `1.25rem` | 600 | 1.4 | `0` | None |
| Label | Section label | Inter | `0.75rem` | 500 | 1.5 | `0.1em` | Uppercase |
| Body | Paragraphs | Inter | `1rem` | 400 | 1.7 | `0` | None |
| Small | Captions | Inter | `0.875rem` | 400 | 1.6 | `0` | None |
| Data | Metadata values | JetBrains Mono | `0.875rem` | 400 | 1.5 | `0.05em` | Uppercase |

**Rules:**
- One `<h1>` per page. Never skip heading levels.
- Body text never smaller than `0.875rem` (14px).
- Uppercase only for labels and H1 page titles — never for paragraphs.
- Monospace only for data values (Sol numbers, dates, image counts, camera names) — never for decorative effect.

---

### 5.3 Global Navigation

#### Desktop (≥ 768px)

```
┌───────────────────────────────────────────────────────────────────┐
│  Astra° SPACE EXPLORER              HOME   APOD   MARS   ABOUT   │
└───────────────────────────────────────────────────────────────────┘
```

| Element | Style |
|---|---|
| Wordmark "Astra°" | `--text-primary`, `font-weight: 700`, `1rem` |
| Wordmark "SPACE EXPLORER" | `--text-tertiary`, `font-weight: 400`, `0.75rem`, `letter-spacing: 0.15em`, uppercase |
| Nav links | `--text-secondary`, `font-weight: 500`, `0.875rem`, `letter-spacing: 0.08em`, uppercase |
| Active link | `--text-primary` + 2px bottom border in `--accent-primary`, 4px offset |
| Hover link | Transition to `--text-primary` over `200ms ease` |
| Header height | `64px`, sticky, `z-index: 100` |
| Background (at rest) | `--bg-primary` |
| Background (scrolled) | `rgba(10, 10, 10, 0.85)` + `backdrop-filter: blur(12px)` |

#### Mobile (< 768px)

- Replace text links with a hamburger icon (☰), `24×24px`, `--text-primary`.
- On tap: full-screen overlay, `--bg-primary` at 98% opacity.
- Links centered vertically, `1.5rem`, `--text-primary`, minimum `48px` tap height each.
- Active link: `--accent-primary` underline.
- Close button (×): top-right, `24×24px` SVG, `aria-label="Close navigation menu"`.
- Transition: `opacity 300ms ease`.
- Focus trapped within overlay while open.

---

### 5.4 Global Footer

Identical on all four pages:

```
┌───────────────────────────────────────────────────────────────────┐
│  [Astra° logo]   Astra Space Explorer · Data provided by NASA    │
│                  Not affiliated with any government agency.       │
└───────────────────────────────────────────────────────────────────┘
```

- Height: approximately `80px`.
- Text: `--text-tertiary`, `0.875rem`.
- Background: `--bg-primary` (same as page, no visual separation needed — the content above ends with spacing).
- No link columns. No social icons. No "Privacy Policy" or "Image Credits" links.

---

### 5.5 Page Layouts

#### 5.5.1 Home Page

```
┌────────────────────────────────────────────────────────────┐
│ HEADER (64px, sticky)                                       │
├────────────────────────────────────────────────────────────┤
│ HERO (full-bleed, min 60vh)                                 │
│  ┌──────────────────────┬───────────────────────────────┐  │
│  │ Text column (~50%)   │ Today's APOD image (~50%)     │  │
│  │                      │ [fetched on load]             │  │
│  │ "Explore."           │                               │  │
│  │ "Discover."          │ Dark gradient overlay from    │  │
│  │ "Understand."        │ left edge into image          │  │
│  │ [Display, bold]      │                               │  │
│  │                      │ ┌───────────────────────────┐ │  │
│  │ Subtitle (2 lines,   │ │ APOD TITLE               │ │  │
│  │ --text-secondary)    │ │ VIEW FULL →              │ │  │
│  │                      │ └───────────────────────────┘ │  │
│  │ [START EXPLORING →]  │                               │  │
│  └──────────────────────┴───────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│ SECTION LABEL: "EXPLORE"                                    │
├────────────────────────────────────────────────────────────┤
│ FEATURE CARDS (3-column grid, max 1200px)                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ APOD         │ │ MARS ROVER   │ │ ABOUT        │       │
│  │ [img bg 0.6] │ │ [img bg 0.6] │ │ [img bg 0.6] │       │
│  │ Description  │ │ Description  │ │ Description  │       │
│  │ →            │ │ →            │ │ →            │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
├────────────────────────────────────────────────────────────┤
│ FOOTER                                                      │
└────────────────────────────────────────────────────────────┘
```

**Hero states:**

| State | Behavior |
|---|---|
| Loading | Right column: `--bg-surface` pulse placeholder. Headline and button visible immediately. |
| Loaded | APOD image fades in (400ms). Title and "VIEW FULL →" appear at bottom. Gradient overlay from left. |
| Error | Static fallback image (bundled with project). No error text in hero. |

**Feature card specifications:**
- Background image: `object-fit: cover`, `opacity: 0.6`, absolutely positioned.
- Gradient overlay: `linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 60%)` between image and text.
- Card title: H3, `--text-primary`.
- Description: one line, `--text-secondary`, `0.875rem`.
- Arrow: `→` text character, `--accent-primary`.
- Border: `1px solid --border-subtle`, transitions to `--border-default` on hover (200ms).
- Each card is an `<a>` wrapping the entire card for maximum tap area.
- Min-height: `240px` on desktop, `200px` on mobile.

---

#### 5.5.2 APOD Page

```
┌────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
├────────────────────────────────────────────────────────────┤
│ BREADCRUMB: ← HOME / ASTRONOMY PICTURE OF THE DAY          │
├────────────────────────────────────────────────────────────┤
│ PAGE TITLE: ASTRONOMY PICTURE OF THE DAY [H1]              │
│ Subtitle [--text-secondary]                                 │
├────────────────────────────────────────────────────────────┤
│ TWO-COLUMN CONTENT (max 1200px)                             │
│  ┌──────────────────────────────┐ ┌─────────────────────┐  │
│  │ MAIN (~65%)                  │ │ SIDEBAR (~35%)      │  │
│  │                              │ │                     │  │
│  │ [APOD IMAGE / VIDEO]        │ │ DATE                │  │
│  │ object-fit: contain          │ │ [input type="date"] │  │
│  │ max-width: 100%              │ │ [LOAD →]            │  │
│  │                              │ │                     │  │
│  │ [↓] [⤢] [↗]                │ │ [← PREV] [NEXT →]  │  │
│  │ (download, expand, share)    │ │                     │  │
│  │                              │ │ ─── divider ──────  │  │
│  │ ─── DETAILS ──────────────  │ │                     │  │
│  │ DATE    │ May 12, 2024      │ │ RANDOM APOD         │  │
│  │ TITLE   │ The Ring Nebula   │ │ [SHOW ME →]         │  │
│  │ CREDIT  │ NASA/ESA/STScI    │ │                     │  │
│  │ TYPE    │ Image             │ │ ─── divider ──────  │  │
│  │                              │ │                     │  │
│  │ ─── EXPLANATION ──────────  │ │ RECENT APOD         │  │
│  │ [body text, 1rem, lh 1.7]   │ │ [thumb] Title Date  │  │
│  │ [max-width: 720px]          │ │ [thumb] Title Date  │  │
│  │                              │ │ [thumb] Title Date  │  │
│  │                              │ │ [thumb] Title Date  │  │
│  │                              │ │ [thumb] Title Date  │  │
│  └──────────────────────────────┘ └─────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│ FOOTER                                                      │
└────────────────────────────────────────────────────────────┘
```

**Metadata table — final field list:**

| Row label | API field | Fallback |
|---|---|---|
| DATE | `date` | — (always present) |
| TITLE | `title` | — (always present) |
| CREDIT | `copyright` | "NASA" if null/missing |
| TYPE | `media_type` | — (always present) |

**Action buttons:** Ghost style (no border, padding `var(--space-2) var(--space-3)`). Minimum tap target `44×44px`. Each has `aria-label`.

| Button | Action |
|---|---|
| ↓ Download | Open `hdurl` (or `url` if no `hdurl`) in new tab |
| ⤢ Expand | Open lightbox overlay |
| ↗ Share | `navigator.share()` if available; else copy URL to clipboard + show "Link copied" |

**Date controls:**
- Native `<input type="date">` styled with `.input-field` class.
- `min="1995-06-16"`, `max` set dynamically to today.
- "LOAD →" button is the explicit trigger (do not auto-fetch on date change).
- ← and → buttons step one day backward/forward.

**Recent APOD thumbnails:**
- Pre-fetch the previous 5 days on page load.
- Each thumbnail: `120×80px`, `object-fit: cover`.
- Display title and date alongside each thumbnail.
- Clicking a thumbnail loads that date's APOD into the main content area and updates the URL.

**Video handling:**
- When `media_type === "video"`: render `<iframe>` inside `<figure>`. `title="APOD video: [title]"`. No autoplay.
- Hide the Download button (YouTube videos can't be downloaded via URL).
- Hide the Expand button (lightbox doesn't apply to video).
- Keep the Share button.

---

#### 5.5.3 Mars Rover Explorer Page

```
┌────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
├────────────────────────────────────────────────────────────┤
│ BREADCRUMB: ← HOME / MARS ROVER EXPLORER                   │
├────────────────────────────────────────────────────────────┤
│ PAGE TITLE: MARS ROVER EXPLORER [H1]                       │
│ Subtitle [--text-secondary]                                 │
├────────────────────────────────────────────────────────────┤
│ ROVER SELECTOR (3 buttons/options)                          │
│ [Curiosity]  [Opportunity]  [Spirit]                        │
├────────────────────────────────────────────────────────────┤
│ ROVER METADATA PANEL (--bg-elevated surface)                │
│  STATUS: Active  │  LANDING: Aug 6, 2012  │  LOCATION: ... │
│  MAX SOL: 4400   │  TOTAL PHOTOS: 695,670                  │
├────────────────────────────────────────────────────────────┤
│ FILTER CONTROLS                                             │
│  SOL (MARTIAN DAY)        CAMERA           [          ]     │
│  [         1000        ]  [All Cameras ▼]  [ SEARCH → ]    │
├────────────────────────────────────────────────────────────┤
│ RESULTS STATUS BAR                                          │
│  SHOWING 25 OF 124 IMAGES · SOL 1000 · CURIOSITY           │
├────────────────────────────────────────────────────────────┤
│ GALLERY GRID (3-column, uniform, 4:3)                       │
│  ┌────────┐  ┌────────┐  ┌────────┐                       │
│  │ [img]  │  │ [img]  │  │ [img]  │                       │
│  └────────┘  └────────┘  └────────┘                       │
│  ┌────────┐  ┌────────┐  ┌────────┐                       │
│  │ [img]  │  │ [img]  │  │ [img]  │                       │
│  └────────┘  └────────┘  └────────┘                       │
│  (up to 25 items per page)                                  │
├────────────────────────────────────────────────────────────┤
│ PAGINATION                                                  │
│           [← PREV]   PAGE 1 OF 5   [NEXT →]               │
├────────────────────────────────────────────────────────────┤
│ FOOTER                                                      │
└────────────────────────────────────────────────────────────┘
```

**Rover selector:** Three `<button>` elements styled as a toggle group. Selected rover has `--bg-elevated` background + `--accent-primary` bottom border. Others have transparent background. On change: update metadata panel, reset gallery, but do not auto-fetch.

**Metadata panel:** `--bg-elevated` background, `1px solid --border-subtle` border. Label-value pairs using the Data typography style (monospace, `0.875rem`). Values sourced from `ROVER_CONFIG` static object.

**Filter controls:**
- Sol: `<input type="number" min="0">` with `.input-field` class.
- Camera: `<select>` with options populated from `ROVER_CONFIG[selectedRover].cameras`. Always includes "All Cameras" as first option.
- Search: "SEARCH →" button, `.btn-primary` class.

**Gallery grid:**
```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.gallery-item {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  cursor: pointer;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

**Gallery item hover:** `border-color` transitions to `--border-default` (200ms). Image scales to `1.03` (300ms). On click: open lightbox.

**Loading state:** Replace gallery content with 9 (3×3) LoadingPulse placeholder cells.

**Empty state:** Centered message: "No images found for [Rover] on Sol [N]. Try a different Sol value." Uses `role="status"`.

**Pagination:** Two outline buttons (← PREV, NEXT →) with "PAGE N OF M" text between. Disable PREV on page 1. Disable NEXT when fewer than 25 images returned.

**Lightbox (shared with APOD):**
- Full-screen overlay, `rgba(10, 10, 10, 0.95)`.
- Image: `object-fit: contain`, `max: 85vh × 85vw`.
- Close: × button, top-right, `24×24px` SVG.
- Metadata line below image: camera name · sol · rover · image ID (monospace, `--text-tertiary`).
- Keyboard: Escape to close; ← / → to navigate within current page results.
- Focus trapped while open.

---

#### 5.5.4 About Page

```
┌────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
├────────────────────────────────────────────────────────────┤
│ BREADCRUMB: ← HOME / ABOUT                                 │
├────────────────────────────────────────────────────────────┤
│ PAGE TITLE: ABOUT THIS PROJECT [H1]                        │
├────────────────────────────────────────────────────────────┤
│ CONTENT (single column, max 720px, centered)                │
│                                                             │
│ ── THE PROJECT ──────────────────────────────              │
│ [2–3 paragraphs about the student club project]             │
│                                                             │
│ ── DATA SOURCES ─────────────────────────────              │
│ [Brief intro to NASA Open APIs]                             │
│ ┌──────────────────────────────────────────┐               │
│ │ API: NASA APOD                            │               │
│ │ ENDPOINT: api.nasa.gov/planetary/apod     │               │
│ └──────────────────────────────────────────┘               │
│ ┌──────────────────────────────────────────┐               │
│ │ API: NASA Mars Rover Photos               │               │
│ │ ENDPOINT: api.nasa.gov/mars-photos/...    │               │
│ └──────────────────────────────────────────┘               │
│                                                             │
│ ── DISCLAIMER ───────────────────────────────              │
│ [Not affiliated with NASA]                                  │
│                                                             │
│ ── BUILT WITH ───────────────────────────────              │
│ [HTML5, CSS3, Vanilla JavaScript, FastAPI]                  │
│                                                             │
├────────────────────────────────────────────────────────────┤
│ FOOTER                                                      │
└────────────────────────────────────────────────────────────┘
```

- No JavaScript. No API calls. Fully static.
- API info cards: `--bg-elevated` background, `1px solid --border-subtle`.
- Content max-width: `720px` (65–75 characters per line).

---

### 5.6 Responsive Behavior

#### Breakpoints

| Name | Value | Method |
|---|---|---|
| Mobile | `< 768px` | Base styles (mobile-first) |
| Desktop | `≥ 768px` | `@media (min-width: 768px)` |
| Gallery sub-breakpoint | `< 480px` | Gallery goes from 2 columns to 1 |

#### Per-Component Responsive Changes

| Component | Desktop (≥ 768px) | Mobile (< 768px) |
|---|---|---|
| Navigation | Horizontal text links | Hamburger → full-screen overlay |
| Hero | Two-column (text left, APOD right) | Stacked: image top (50vh), text + CTA below |
| Feature cards | 3-column grid | Single column, full-width |
| APOD layout | Two-column (65% main + 35% sidebar) | Single column: main content first, sidebar below |
| APOD metadata | Two-column key-value table | Single column: label above value |
| Mars Rover filters | Sol + Camera + Search on one row | Stacked vertically |
| Mars Rover gallery | 3 columns | 2 columns (≥ 480px), 1 column (< 480px) |
| Mars Rover metadata | Single row, 5 data points | Wraps to 2 rows |
| Lightbox | `85vh × 85vw` | `95vh × 95vw` |
| About content | `max-width: 720px`, centered | Full width, `16px` side padding |

#### Mobile Rules
- Touch targets: minimum `44 × 44px` on all interactive elements.
- Horizontal scrolling: never. Enforce `overflow-x: hidden` on `body`.
- Side padding: `var(--space-4)` (16px) on mobile.
- Font sizes: never below `14px` (`0.875rem`).
- Images: always `max-width: 100%`.

---

### 5.7 Animation Specification

#### Permitted Animations

| Animation | Property | Duration | Easing | Trigger |
|---|---|---|---|---|
| Nav link hover | `color` | `200ms` | `ease` | `:hover` |
| Button hover | `background`, `border-color` | `200ms` | `ease` | `:hover` |
| Card hover | `border-color` | `200ms` | `ease` | `:hover` |
| Gallery image zoom | `transform: scale(1.03)` | `300ms` | `ease` | `:hover` |
| Loading pulse | `opacity` (0.5 → 1 → 0.5) | `1.5s` | `ease-in-out` | Loop (while loading) |
| Hero APOD fade-in | `opacity` (0 → 1) | `400ms` | `ease-out` | On image load |
| Mobile menu | `opacity` | `300ms` | `ease` | On open/close |

#### Animation Rules

- Maximum duration: `500ms` (except the loading pulse loop).
- No parallax. No scroll-triggered animations. No `IntersectionObserver`-based reveals.
- No animation libraries. CSS `transition` and `@keyframes` only.
- No transform on text elements.
- Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 5.8 Elevation System

Flat design. Depth communicated through background color and border shifts, not shadows.

| Level | Background | Border | Usage |
|---|---|---|---|
| Base | `--bg-primary` | None | Page background |
| Raised | `--bg-elevated` | `1px solid --border-subtle` | Cards, metadata panels, API info blocks |
| Interactive | `--bg-surface` | `1px solid --border-default` | Inputs, dropdowns |
| Overlay | `rgba(10, 10, 10, 0.95)` | None | Lightbox, mobile menu |

**No `box-shadow` anywhere. No `drop-shadow` filters.**

---

### 5.9 Iconography

Inline SVGs only. No icon font libraries.

| Icon | Usage | Size | Implementation |
|---|---|---|---|
| → | Card links, CTA buttons, nav arrows | — | Text character, not SVG |
| ← | Breadcrumb, previous buttons | — | Text character, not SVG |
| ☰ | Mobile menu open | `24 × 24px` | Inline SVG |
| × | Mobile menu close, lightbox close | `24 × 24px` | Inline SVG |
| ↓ | Download | `20 × 20px` | Inline SVG |
| ⤢ | Expand | `20 × 20px` | Inline SVG |
| ↗ | Share | `20 × 20px` | Inline SVG |

All SVGs use `currentColor` fill so they inherit text color.
All icon-only buttons require `aria-label`.

---

### 5.10 Colour Contrast Verification

| Foreground | Background | Ratio | WCAG Level |
|---|---|---|---|
| `--text-primary` (#FFF) | `--bg-primary` (#0A0A0A) | 19.6:1 | AAA ✓ |
| `--text-primary` (#FFF) | `--bg-elevated` (#141414) | 17.3:1 | AAA ✓ |
| `--text-secondary` (#B0B0B0) | `--bg-primary` (#0A0A0A) | 7.1:1 | AA ✓ |
| `--text-secondary` (#B0B0B0) | `--bg-elevated` (#141414) | 6.3:1 | AA ✓ |
| `--text-tertiary` (#707070) | `--bg-primary` (#0A0A0A) | 3.4:1 | Large text only |
| `--accent-primary` (#4DA8DA) | `--bg-primary` (#0A0A0A) | 5.7:1 | AA ✓ |
| `--status-error` (#E57373) | `--bg-primary` (#0A0A0A) | 5.2:1 | AA ✓ |

**Rule:** `--text-tertiary` is restricted to captions, timestamps, breadcrumb separators, and placeholder text. Never use it for body paragraphs.

---

### 5.11 Accessibility Checklist

This is the minimum accessibility requirement. Every item must be verified before the project is considered complete.

- [ ] `<html lang="en">` on every page
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">` on every page
- [ ] One `<h1>` per page, heading levels never skipped
- [ ] `<header>`, `<main>`, `<footer>`, `<nav aria-label="Main navigation">` on every page
- [ ] All images have descriptive `alt` text (NASA title for content images; `alt=""` + `role="presentation"` for decorative backgrounds)
- [ ] All form inputs have associated `<label>` elements
- [ ] All icon-only buttons have `aria-label`
- [ ] `:focus-visible` outline on every interactive element: `2px solid var(--accent-primary)`, `offset: 2px`
- [ ] Mobile menu: `role="dialog"`, `aria-modal="true"`, focus trapped
- [ ] Lightbox: `role="dialog"`, `aria-modal="true"`, focus trapped, Escape to close
- [ ] Gallery container: `aria-busy="true"` while loading
- [ ] Error messages: `role="alert"`
- [ ] Empty state: `role="status"`
- [ ] Results status bar: `aria-live="polite"`
- [ ] `prefers-reduced-motion` media query disables all animations
- [ ] Tab order follows visual order (no positive `tabindex` values)
- [ ] All text/background combinations pass WCAG AA

---

### 5.12 Design Mistakes to Avoid

These are the most common errors for student teams building this type of project. Every team member should read this list before writing CSS.

1. **Do not use `#000000` as the background.** Use `#0A0A0A`. Pure black causes eye strain.
2. **Do not use the accent color for body text.** `--accent-primary` is for labels, links, and interactive cues only.
3. **Do not add a second accent color** (e.g., orange for Mars, purple for nebulae).
4. **Do not use more than two typefaces.** Inter + JetBrains Mono. That's it.
5. **Do not set body text below 14px.**
6. **Do not center-align paragraphs.** Left-align all body text.
7. **Do not stretch images.** Always use `object-fit: cover` or `contain`.
8. **Do not apply CSS filters to NASA images.** No grayscale, sepia, or hue-rotate.
9. **Do not build a custom date picker.** Use `<input type="date">`.
10. **Do not build a custom scrollbar.**
11. **Do not add sound effects or background music.**
12. **Do not use `!important`** (except for the `prefers-reduced-motion` override).
13. **Do not inline styles.** All CSS belongs in `.css` files.
14. **Do not add CSS frameworks** (Bootstrap, Tailwind, etc.).
15. **Do not create dead links** (pages that don't exist).
16. **Do not use masonry layouts.** Use uniform grids.
17. **Do not add parallax scrolling or scroll-triggered animations.**
18. **Do not nest CSS selectors more than two levels deep.**
19. **Do not use images as text backgrounds without a gradient overlay.**
20. **Do not display data fields the API doesn't provide.** If the API doesn't return it, don't show it.

---

### 5.13 File Structure Reference

```
nasa-space-explorer/
├── index.html                  (Home page)
├── apod.html                   (APOD page)
├── mars.html                   (Mars Rover Explorer page)
├── about.html                  (About page)
├── css/
│   └── styles.css              (All CSS — tokens, base, components, pages)
├── js/
│   ├── config.js               (API key constant, rover config object)
│   ├── apod.js                 (APOD page logic)
│   ├── mars.js                 (Mars Rover page logic)
│   ├── home.js                 (Homepage APOD preview fetch)
│   ├── nav.js                  (Mobile menu toggle)
│   └── lightbox.js             (Shared lightbox component)
└── assets/
    ├── fallback-hero.jpg        (Static fallback for homepage hero)
    └── image-unavailable.svg    (Broken image placeholder)
```

One CSS file. Six small JS files. Four HTML pages. Two static assets. No build step. No package.json. No node_modules.

---

*End of Final Visual Specification*
*NASA Space Explorer · Version 1.0*
