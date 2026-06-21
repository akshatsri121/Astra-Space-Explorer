# NASA Space Explorer — Final Design Specification

## Document Purpose

This document evaluates the three supplied mockups, selects the strongest direction, recommends modifications, and formalizes the complete design system for implementation.

---

## Part 1 — Mockup Evaluation

---

### Mockup A: Homepage

#### Strengths

- **Hero composition is excellent.** The full-bleed Earth photograph paired with the three-word stacked headline ("Explore. Discover. Understand.") creates immediate visual impact without feeling overwrought. The text sits on the dark left half while the image occupies the right — a natural split that is easy to reproduce with CSS.
- **Feature cards are well-proportioned.** The three bottom cards (APOD, Mars Rover Explorer, About) use real imagery as backgrounds, which grounds them in the content rather than relying on abstract graphics. Each card has a clear label, a one-line description, and an arrow affordance.
- **Navigation is clean and conventional.** A left-aligned wordmark ("Astra° SPACE EXPLORER") with right-aligned text links (Home, APOD, Mars Rover, About). The active state uses an underline. Nothing here will confuse a user.
- **Footer is appropriately minimal.** A single-line disclaimer ("Not affiliated with any government agency") avoids the common student-project mistake of building a bloated footer with columns of links that lead nowhere.
- **Dark theme is handled correctly.** The background is a true near-black (#0A0A0A range), not a muddy dark grey. White text on this background has excellent contrast.

#### Weaknesses

- **The "About" card has an image of a satellite that bleeds off the edge.** This creates a visual imbalance — the card feels incomplete compared to the other two, which contain their images within bounds.
- **The subtitle text ("Journey through space with Astra's images, missions, and discoveries.") is low-contrast.** It appears to be a mid-grey on black, which may fail WCAG AA for body text (4.5:1 minimum).
- **No featured APOD preview on the homepage.** The specification requires "a featured APOD preview" on the homepage. The current hero is a static Earth image. This needs to be addressed.
- **The CTA button ("Start Exploring →") has a thin border style** that, while elegant, may be hard to tap on mobile and could feel under-designed to some users.

#### Implementation Difficulty

**Low.** The layout is a single-column stack: nav → hero (two-column with background image) → three-column card grid → footer. CSS Grid or Flexbox handles everything. No JavaScript is required for layout. Responsive collapse (three cards → stacked) is straightforward.

#### Suitability for Student Team

**Excellent.** No exotic CSS. No JavaScript-driven layout. The structure maps directly to semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`). A student can understand every line.

---

### Mockup B: Mars Rover Explorer

#### Strengths

- **Page title has strong presence.** The oversized "MARS ROVER EXPLORER" in a monospace/condensed typeface creates a mission-briefing aesthetic that fits the subject matter. It reads as scientific without being theatrical.
- **Metadata sidebar is well-structured.** Rover name, landing date, and location are presented in a label-value format with clear hierarchy (small grey label, bold white value). This is a pattern students can replicate anywhere.
- **Filter controls are clear.** The Sol selector and camera dropdown sit on a single row with obvious labels ("SOL (MARTIAN DAY)", "INSTRUMENT"). The dataset count ("DATASET: 124 IMAGES") gives the user immediate context about the result set.
- **Gallery layout is effective.** A masonry-esque grid with varied image sizes creates visual interest while remaining grid-based. The "DECODING..." placeholder in one cell is a nice loading-state indicator.
- **The breadcrumb ("← RETURN TO HOME") and status indicator ("● LIVE FROM MARS")** add navigational clarity and a subtle thematic touch without adding complexity.

#### Weaknesses

- **The hero image of the rover is placed inline within the header area,** which creates an awkward middle zone — it's not a full-bleed banner, and it's not a clean text-only header. This area needs clearer spatial rules.
- **The masonry grid, while visually appealing, is harder to implement** than a uniform grid. Students will need to decide between CSS `column-count` (which reflows unpredictably) or a JavaScript masonry library (which adds a dependency). A uniform grid would be safer.
- **"LIVE FROM MARS" is misleading.** The data is not live — it comes from a historical archive. This label should be removed or rephrased to avoid giving users a false impression.
- **The monospace typeface for the page title, while atmospheric, may clash** with the rest of the site if the other pages use a different heading style. Consistency across pages matters.

#### Implementation Difficulty

**Medium.** The masonry gallery is the main complexity driver. If replaced with a uniform grid, difficulty drops to Low. The filter controls require JavaScript to fetch and render results, but this is expected functionality.

#### Suitability for Student Team

**Good, with one caveat.** If the masonry layout is simplified to a uniform grid, this page is entirely within student capability. The filter → fetch → render cycle is a core learning exercise.

---

### Mockup C: APOD Detail Page

#### Strengths

- **Two-column layout is excellent for this content type.** The left column (main content: title, image, metadata, explanation) and right column (controls: date picker, random APOD, recent images) create a clear primary/secondary hierarchy. The user's eye naturally reads the left column first.
- **Metadata table is well-designed.** The "DETAILS" section uses a two-column key-value layout (Date, Photographer, Source, Credit, Constellation, Distance, Category) with clear labels. This is informative without being cluttered.
- **The action buttons below the image** (download, expand, share) use icon-only buttons with thin borders, matching the overall design language. They are compact and unobtrusive.
- **Recent APOD thumbnails in the sidebar** provide a browsing history that encourages exploration. Each thumbnail has a title and date — minimal but sufficient.
- **Section dividers (the teal/cyan horizontal rules)** create clear visual separation between content blocks without adding visual weight.
- **The "SHOW ME" button for random APOD** is a simple, engaging interaction that requires minimal implementation effort.

#### Weaknesses

- **The page is information-dense.** The metadata table includes fields (Constellation, Distance, Category) that are not available from the NASA APOD API. The API returns: date, title, explanation, url, hdurl, media_type, and copyright. Constellation, Distance, and Category would need to be parsed from the explanation text or omitted.
- **The sidebar may not collapse well on mobile.** A two-column layout where the sidebar contains a date picker, navigation buttons, description text, and a thumbnail gallery will require careful stacking decisions for narrow screens.
- **The teal/cyan accent color for section headers ("DETAILS", "EXPLANATION")** appears for the first time on this page. If this accent is not used consistently across all pages, it will feel disjointed.
- **The calendar grid icon in the date navigation** implies a full calendar picker UI, which is a non-trivial component to build from scratch. Using the native `<input type="date">` would be simpler and more accessible.
- **Footer links ("IMAGE CREDITS", "PRIVACY POLICY", "GITHUB")** introduce pages that don't exist in the project specification. Dead links are worse than no links.

#### Implementation Difficulty

**Medium.** The two-column layout itself is simple. The date picker, recent APOD fetch, and random APOD functionality each require JavaScript. The metadata table requires careful data mapping. None of these are individually hard, but together they represent meaningful scope.

#### Suitability for Student Team

**Good.** The page teaches important patterns: fetching data by parameter, rendering structured content, managing a sidebar with independent state. The main risk is scope creep from the metadata fields.

---

## Part 2 — Direction Selection

---

### Selected Direction

**All three mockups belong to a single cohesive direction ("Astra").** They share the same branding, navigation structure, color sensibility, and typographic voice. The evaluation therefore selects the Astra direction in its entirety, with per-page modifications listed below.

### Rationale

The Astra direction succeeds because it:

1. **Respects the specification's "calm, scientific, professional" mandate** without drifting into startup aesthetics or creative-agency theatrics.
2. **Uses a near-black background with white text and minimal accent color** — the simplest possible dark theme, which is easy to implement and hard to get wrong.
3. **Relies on photography (NASA imagery) as the primary visual element,** which means the design stays compelling even with zero custom illustrations or graphics.
4. **Uses conventional layout patterns** (hero + cards, sidebar + content, filter + gallery) that map to well-documented CSS techniques.
5. **Keeps navigation consistent** across all three pages with the same wordmark and link structure.

---

## Part 3 — Recommended Modifications

---

### Homepage Modifications

| # | Modification | Reason |
|---|---|---|
| 1 | Replace the static Earth image with a live APOD preview (today's image + title + "View Full →" link) | Satisfies the specification requirement and makes the homepage dynamic |
| 2 | Contain the About card's satellite image within the card boundary | Fixes visual imbalance |
| 3 | Increase subtitle text contrast to at least `#B0B0B0` on `#0A0A0A` | WCAG AA compliance |
| 4 | Add a subtle solid background fill (not just border) to the CTA button on hover | Improves affordance and tap target visibility |

### Mars Rover Explorer Modifications

| # | Modification | Reason |
|---|---|---|
| 1 | Replace masonry grid with a uniform 3-column grid (equal-height cells with `object-fit: cover`) | Eliminates JavaScript dependency; simpler CSS; predictable layout |
| 2 | Remove "LIVE FROM MARS" indicator | Misleading; the data is archival |
| 3 | Move the rover hero image into a dedicated banner row above the title, or remove it | Resolves the awkward middle zone between header and content |
| 4 | Add pagination or "Load More" to the gallery | The API can return hundreds of images; infinite scroll adds complexity; simple pagination is safer |
| 5 | Use the same heading typeface as other pages (not monospace) for the page title | Cross-page consistency |

### APOD Page Modifications

| # | Modification | Reason |
|---|---|---|
| 1 | Remove metadata fields not available from the API (Constellation, Distance, Category) | These cannot be reliably extracted; showing inaccurate data is worse than omitting it |
| 2 | Replace custom calendar picker with native `<input type="date">` styled to match the dark theme | Reduces implementation effort; better accessibility |
| 3 | Remove footer links (Privacy Policy, Image Credits) that have no corresponding pages | Dead links erode trust |
| 4 | Ensure the teal/cyan accent color is used consistently on all pages (nav underline, card arrows, section labels) | Visual coherence |
| 5 | On mobile, stack the sidebar below the main content, not above it | Content should be primary on small screens |

---

## Part 4 — Final Design Specification

---

### 4.1 Color Palette

#### Core Colors

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#0A0A0A` | Page background, card backgrounds |
| `--bg-elevated` | `#141414` | Cards, elevated surfaces, hover states |
| `--bg-surface` | `#1A1A1A` | Input fields, dropdowns, sidebar panels |
| `--border-subtle` | `#2A2A2A` | Card borders, dividers, table rules |
| `--border-default` | `#3A3A3A` | Input borders, button borders |

#### Text Colors

| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#FFFFFF` | Headings, primary body text |
| `--text-secondary` | `#B0B0B0` | Subtitles, descriptions, metadata labels |
| `--text-tertiary` | `#707070` | Captions, timestamps, placeholder text |
| `--text-disabled` | `#4A4A4A` | Disabled states |

#### Accent Colors

| Token | Hex | Usage |
|---|---|---|
| `--accent-primary` | `#4DA8DA` | Active nav underline, links, section labels, focus rings |
| `--accent-hover` | `#6BBCE6` | Accent hover state |
| `--accent-muted` | `rgba(77, 168, 218, 0.15)` | Accent backgrounds (tags, badges) |

#### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--status-success` | `#4CAF50` | Success messages, online indicators |
| `--status-error` | `#E57373` | Error messages, failed states |
| `--status-warning` | `#FFB74D` | Warning messages |

#### Rules

- Never use pure white (`#FFFFFF`) for large background areas.
- Never use color alone to convey meaning — always pair with text or icons.
- Accent color should be used sparingly — it highlights, not decorates.
- All text/background combinations must pass WCAG AA (4.5:1 for body text, 3:1 for large text).

---

### 4.2 Typography Hierarchy

#### Font Stack

```css
--font-heading: 'Inter', 'Helvetica Neue', Arial, sans-serif;
--font-body: 'Inter', 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

**Inter** is the primary typeface. Load weights 400 (Regular), 500 (Medium), and 700 (Bold) from Google Fonts. Do not load additional weights.

**JetBrains Mono** is used only for data labels (Sol values, dates, image counts, metadata values). Load weight 400 only.

#### Scale

| Level | Element | Size | Weight | Line Height | Letter Spacing | Transform |
|---|---|---|---|---|---|---|
| Display | Hero headline | `clamp(2.5rem, 5vw, 4rem)` | 700 | 1.1 | `-0.02em` | None |
| H1 | Page title | `clamp(2rem, 4vw, 3rem)` | 700 | 1.15 | `-0.01em` | Uppercase |
| H2 | Section heading | `1.5rem` | 700 | 1.3 | `0` | None |
| H3 | Card title | `1.25rem` | 600 | 1.4 | `0` | None |
| Label | Section label | `0.75rem` | 500 | 1.5 | `0.1em` | Uppercase |
| Body | Paragraphs | `1rem` | 400 | 1.7 | `0` | None |
| Body Small | Captions, metadata | `0.875rem` | 400 | 1.6 | `0` | None |
| Mono Data | Data values | `0.875rem` (mono) | 400 | 1.5 | `0.05em` | Uppercase |

#### Rules

- Use a single `<h1>` per page.
- Do not skip heading levels (e.g., `<h1>` → `<h3>`).
- Body text should never be smaller than `0.875rem` (14px).
- Use `text-transform: uppercase` with `letter-spacing: 0.1em` for labels only — never for paragraphs.
- Monospace is for data, not for aesthetic effect.

---

### 4.3 Layout Principles

#### Grid System

Use CSS Grid as the primary layout mechanism with the following base grid:

```css
.page-grid {
  display: grid;
  grid-template-columns: 1fr min(1200px, 90vw) 1fr;
}

.page-grid > * {
  grid-column: 2;
}

.page-grid > .full-bleed {
  grid-column: 1 / -1;
}
```

This creates a centered content column with a `1200px` maximum width and `5vw` side padding, while allowing specific elements (hero images, gallery rows) to break out to full width.

#### Page Structure

Every page follows this vertical stack:

```
┌──────────────────────────────────────┐
│  Header (nav)                        │  Fixed height: 64px
├──────────────────────────────────────┤
│  Page Hero / Title Area              │  Variable height
├──────────────────────────────────────┤
│  Main Content                        │  Flexible
├──────────────────────────────────────┤
│  Footer                              │  Fixed height: ~80px
└──────────────────────────────────────┘
```

#### Content Layouts by Page

| Page | Layout | Details |
|---|---|---|
| Homepage | Single column | Hero → Feature Cards (3-col grid) → Footer |
| APOD | Two column (content + sidebar) | Main content: ~65% width. Sidebar: ~35% width. On mobile: sidebar stacks below. |
| Mars Rover | Single column | Title + metadata → Filters → Gallery (3-col uniform grid) |
| About | Single column | Text content with max-width of `720px` for readability |

#### Rules

- Maximum content width: `1200px`.
- Maximum paragraph width: `720px` (approximately 65–75 characters per line).
- Never let text lines exceed 80 characters. Use `max-width` on text containers.
- Use `full-bleed` class only for hero images and gallery grids.
- Cards and content blocks should align to the grid — no arbitrary positioning.

---

### 4.4 Spacing System

Use a base-4 spacing scale applied consistently via CSS custom properties:

| Token | Value | Common Usage |
|---|---|---|
| `--space-1` | `4px` | Icon padding, tight gaps |
| `--space-2` | `8px` | Inline element gaps, badge padding |
| `--space-3` | `12px` | Input padding, small card padding |
| `--space-4` | `16px` | Default gap, card padding, list item spacing |
| `--space-5` | `24px` | Section sub-spacing, card inner margins |
| `--space-6` | `32px` | Content block margins |
| `--space-7` | `48px` | Section margins |
| `--space-8` | `64px` | Page section spacing |
| `--space-9` | `96px` | Major page divisions (hero → content) |

#### Rules

- All spacing values must come from this scale. No arbitrary pixel values.
- Use `gap` in Grid/Flexbox layouts instead of margins on children.
- Vertical rhythm between page sections: `--space-8` (64px) minimum.
- Card internal padding: `--space-5` (24px).
- Input internal padding: `--space-3` (12px) vertical, `--space-4` (16px) horizontal.

---

### 4.5 Navigation Style

#### Desktop Navigation (≥ 768px)

```
┌──────────────────────────────────────────────────────────────┐
│  [Astra° SPACE EXPLORER]          Home  APOD  Mars  About   │
└──────────────────────────────────────────────────────────────┘
```

- **Wordmark**: Left-aligned. "Astra°" in `--text-primary` at `font-weight: 700`, "SPACE EXPLORER" in `--text-tertiary` at `font-weight: 400`, `letter-spacing: 0.15em`, `text-transform: uppercase`, `font-size: 0.75rem`.
- **Links**: Right-aligned. `font-size: 0.875rem`. `text-transform: uppercase`. `letter-spacing: 0.08em`. `color: --text-secondary`. `font-weight: 500`.
- **Active state**: `color: --text-primary` with a 2px bottom border in `--accent-primary`, offset by `4px`.
- **Hover state**: `color: --text-primary`. Transition: `color 200ms ease`.
- **Height**: `64px`. Vertically centered content.
- **Background**: `--bg-primary` with `backdrop-filter: blur(12px)` and slight transparency (`rgba(10, 10, 10, 0.85)`) when scrolled.
- **Position**: `sticky` at top. `z-index: 100`.

#### Mobile Navigation (< 768px)

- Replace text links with a hamburger icon (three horizontal lines, 24×24px, `--text-primary`).
- On tap, slide in a full-screen overlay (`--bg-primary` at 98% opacity) with vertically stacked links, centered.
- Each link: `font-size: 1.5rem`, `--text-primary`, `padding: --space-4` vertical.
- Active link: underlined with `--accent-primary`.
- Close button: × icon, top-right corner.
- Transition: `opacity 300ms ease, transform 300ms ease`.

#### Rules

- Navigation must be accessible via keyboard (`Tab` to focus, `Enter` to activate).
- Active page must be visually indicated at all times.
- Wordmark is a link to the homepage on every page.
- Never use dropdown menus — the site has only four pages.

---

### 4.6 Component Specifications

#### Buttons

**Primary (Outline)**

```css
.btn-primary {
  background: transparent;
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  padding: var(--space-3) var(--space-5);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  border-radius: 0;          /* Square corners — matches the angular, scientific feel */
  cursor: pointer;
  transition: background 200ms ease, border-color 200ms ease;
}

.btn-primary:hover {
  background: var(--bg-elevated);
  border-color: var(--text-secondary);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

**Secondary (Ghost)**

Same as Primary but with `border: none` and `padding: var(--space-2) var(--space-3)`. Used for icon buttons (download, share, expand).

#### Cards (Feature Cards)

```css
.feature-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 0;
  padding: var(--space-5);
  min-height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  transition: border-color 200ms ease;
}

.feature-card:hover {
  border-color: var(--border-default);
}

.feature-card__bg {
  position: absolute;
  inset: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
  opacity: 0.6;
  z-index: 0;
}

.feature-card__content {
  position: relative;
  z-index: 1;
}
```

#### Form Controls (Dropdowns, Date Inputs)

```css
.input-field {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  border-radius: 0;
  width: 100%;
  transition: border-color 200ms ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.input-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-2);
}
```

#### Image Gallery (Mars Rover)

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
  transition: border-color 200ms ease;
}

.gallery-item:hover {
  border-color: var(--border-default);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms ease;
}

.gallery-item:hover img {
  transform: scale(1.03);
}
```

Responsive: 3 columns → 2 columns at `< 768px` → 1 column at `< 480px`.

---

### 4.7 Image Usage Guidelines

#### Sources

All imagery comes from two sources:

1. **NASA APOD API** — Astronomy photos (JPEG, variable resolution).
2. **NASA Mars Rover Photos API** — Rover camera images (JPEG, typically 1024×1024).

No stock photography. No AI-generated imagery. No illustrations.

#### Rendering Rules

| Context | Sizing | Fit | Aspect Ratio |
|---|---|---|---|
| Hero background | Full-bleed, `100vw × 60vh` min | `object-fit: cover` | Free (image dictates) |
| APOD main image | Content-width, max `720px` | `object-fit: contain` on a dark matte | Preserve original |
| Feature card background | Fill card bounds | `object-fit: cover`, `opacity: 0.6` | Card dictates |
| Gallery thumbnails | Grid cell | `object-fit: cover` | `4:3` enforced |
| Sidebar thumbnails | Fixed `120 × 80px` | `object-fit: cover` | `3:2` enforced |

#### Loading States

- Show a `--bg-surface` colored placeholder with a subtle pulse animation while images load.
- Use `loading="lazy"` on all images below the fold.
- Provide `alt` text for every image: use the NASA-provided title or description.

#### Error States

- If an image fails to load, show a `--bg-surface` box with a small "Image unavailable" label in `--text-tertiary`.
- Never show a broken image icon.

---

### 4.8 Mobile Responsiveness Guidelines

#### Breakpoints

| Name | Value | Targets |
|---|---|---|
| `--bp-mobile` | `< 480px` | Small phones |
| `--bp-tablet` | `480px – 767px` | Large phones, small tablets |
| `--bp-desktop` | `≥ 768px` | Tablets, laptops, desktops |

Only two breakpoints. More is unnecessary for a four-page site.

#### Responsive Behavior by Component

| Component | Desktop (≥ 768px) | Mobile (< 768px) |
|---|---|---|
| Navigation | Horizontal text links | Hamburger + full-screen overlay |
| Hero | Two-column (text left, image right) | Stacked: image above, text below. Image height: `50vh`. |
| Feature cards | Three-column grid | Single column, full width |
| APOD layout | Two-column (content + sidebar) | Single column: content first, sidebar below |
| Mars Rover gallery | Three-column grid | Two columns (tablet), one column (phone) |
| Mars Rover filters | Single row (Sol + Camera side by side) | Stacked vertically |
| Metadata table | Two-column key-value | Single column, label above value |

#### Rules

- Test at `375px` (iPhone SE), `768px` (iPad), and `1440px` (laptop).
- Touch targets must be at least `44 × 44px`.
- Horizontal scrolling is never acceptable.
- Font sizes should not drop below `14px` on any screen.
- Use `clamp()` for fluid typography on headings; do not change body text size across breakpoints.
- Side padding on mobile: `--space-4` (16px).

---

### 4.9 Animation Guidelines

#### Permitted Animations

| Animation | Property | Duration | Easing | Trigger |
|---|---|---|---|---|
| Link hover | `color` | `200ms` | `ease` | `:hover` |
| Button hover | `background`, `border-color` | `200ms` | `ease` | `:hover` |
| Card hover | `border-color` | `200ms` | `ease` | `:hover` |
| Gallery image zoom | `transform: scale(1.03)` | `300ms` | `ease` | `:hover` |
| Image placeholder pulse | `opacity: 0.5 → 1 → 0.5` | `1.5s` | `ease-in-out` | Continuous (while loading) |
| Page content fade-in | `opacity: 0 → 1`, `translateY(8px → 0)` | `400ms` | `ease-out` | On page load (once) |
| Mobile menu | `opacity`, `transform` | `300ms` | `ease` | On open/close |

#### Rules

- **Maximum duration**: No animation longer than `500ms`.
- **No parallax**. No scroll-triggered animations. No `IntersectionObserver`-based reveals.
- **No continuous animations** except the image loading pulse.
- **Respect `prefers-reduced-motion`**: Wrap all animations in `@media (prefers-reduced-motion: no-preference) { ... }`. If the user has reduced motion enabled, remove all animations and transitions.
- **No animation libraries.** All animations must be achievable with CSS `transition` or `@keyframes`.
- **No transform on text.** Only images and containers may be scaled or translated.

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

### 4.10 Design Mistakes to Avoid

These are the most common pitfalls for student teams building dark-themed, image-heavy websites. Every team member should read this list before writing CSS.

#### Color and Contrast

1. **Do not use pure black (`#000000`) as the background.** Use `#0A0A0A`. Pure black against white text creates excessive contrast that causes eye strain on large screens.
2. **Do not use colored text for body content.** The accent color (`--accent-primary`) is for labels, links, and interactive elements only. Paragraphs must be `--text-primary` or `--text-secondary`.
3. **Do not create "rainbow" themes.** The site has one accent color. Adding a second accent color (e.g., orange for Mars, purple for nebulae) fragments the visual identity.
4. **Do not use low-contrast text.** Every text element must be tested against its background. Grey-on-dark-grey is the most common WCAG failure in dark themes.

#### Typography

5. **Do not use more than two typefaces.** Inter for content, JetBrains Mono for data. Adding a third typeface (e.g., a display font for headings) creates visual noise.
6. **Do not set body text below 14px (0.875rem).** Small text on dark backgrounds is particularly hard to read.
7. **Do not use uppercase for paragraphs or explanations.** Uppercase is for labels and short headings only.

#### Layout

8. **Do not center-align body text.** Center alignment is acceptable only for single-line headings in the hero section. All other text must be left-aligned.
9. **Do not add decorative sidebars or panels with no functional purpose.** If a sidebar doesn't contain controls or supplementary content, it should not exist.
10. **Do not create asymmetric grids for the sake of visual interest.** Uniform grids are easier to build, easier to maintain, and easier to make responsive.

#### Images

11. **Do not stretch images.** Always use `object-fit: cover` or `object-fit: contain`. Never set both `width` and `height` on an `<img>` without `object-fit`.
12. **Do not add CSS filters (grayscale, sepia, hue-rotate) to NASA images.** The images are the content. Altering their appearance misrepresents the data.
13. **Do not use images as text backgrounds without a gradient overlay.** If text sits on top of an image, the image must have a dark gradient overlay (`linear-gradient(to top, rgba(10,10,10,0.9), transparent)`) to ensure readability.

#### Interactions

14. **Do not build custom scrollbars.** Use the browser default. Custom scrollbars are a maintenance burden and often break across browsers.
15. **Do not build a custom date picker.** Use `<input type="date">` with dark theme styling. Custom date pickers are one of the most time-consuming components to build and the most fragile to maintain.
16. **Do not add sound effects, auto-playing videos, or background music.** This is a data-viewing tool, not a multimedia experience.

#### Code

17. **Do not use `!important` in production CSS** (except for the `prefers-reduced-motion` override documented above).
18. **Do not inline styles.** All styles belong in CSS files.
19. **Do not nest CSS selectors more than two levels deep.** If you need `.page .section .card .title .text`, your HTML structure is too complex.
20. **Do not add CSS frameworks (Bootstrap, Tailwind, etc.).** The design system documented here is the framework. Adding another layer creates conflicts and learning overhead.

---

### 4.11 Iconography

Use a minimal icon set. Inline SVGs only — no icon font libraries.

#### Required Icons

| Icon | Usage | Size |
|---|---|---|
| Arrow right (`→`) | Card links, CTA buttons | Use text character, not SVG |
| Arrow left (`←`) | Breadcrumb/back navigation | Use text character, not SVG |
| Hamburger (☰) | Mobile menu toggle | `24 × 24px` SVG |
| Close (×) | Mobile menu close | `24 × 24px` SVG |
| Download | APOD image download | `20 × 20px` SVG |
| Expand | APOD image fullscreen | `20 × 20px` SVG |
| Share | APOD share action | `20 × 20px` SVG |
| Calendar | Date input indicator | `16 × 16px` SVG |
| Chevron down | Dropdown indicator | `16 × 16px` SVG |

#### Rules

- All icons must be `currentColor` SVGs so they inherit text color.
- Icon-only buttons must have `aria-label` attributes.
- Do not use emoji as icons.
- Do not add icons for decoration — only for function.

---

### 4.12 Elevation and Depth

The design is intentionally flat. Depth is communicated through border and background shifts, not shadows.

| Level | Background | Border | Usage |
|---|---|---|---|
| Base | `--bg-primary` | None | Page background |
| Raised | `--bg-elevated` | `1px solid --border-subtle` | Cards, feature panels |
| Interactive | `--bg-surface` | `1px solid --border-default` | Inputs, dropdowns |
| Overlay | `rgba(10, 10, 10, 0.95)` | None | Mobile menu, image lightbox |

#### Rules

- No `box-shadow` anywhere in the design.
- No `drop-shadow` CSS filters.
- Depth hierarchy is: background → surface → border change. That's it.

---

### 4.13 Focus and Accessibility

- All interactive elements must have a visible `:focus-visible` state: `outline: 2px solid var(--accent-primary); outline-offset: 2px;`.
- Tab order must follow visual order (top-to-bottom, left-to-right).
- All images must have descriptive `alt` text.
- Form controls must have associated `<label>` elements.
- The page must be navigable and usable without a mouse.
- Color contrast: minimum 4.5:1 for body text, 3:1 for large text (≥ 18px bold or ≥ 24px regular).

---

## Summary

This design specification defines a complete visual system for NASA Space Explorer. It is:

- **Buildable** — Every component uses standard CSS. No libraries. No exotic techniques.
- **Consistent** — One accent color. One type family for content. One spacing scale. One interaction model.
- **Maintainable** — The token system (CSS custom properties) means changing any visual attribute propagates globally.
- **Accessible** — Contrast ratios, focus states, keyboard navigation, and reduced-motion support are specified.
- **Scoped** — The specification intentionally omits features that the project does not need, preventing scope creep.

Implement the CSS custom properties first, then build components on top of them. If a design question arises that this document does not answer, choose the simpler option.
