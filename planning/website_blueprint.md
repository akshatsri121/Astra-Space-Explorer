# NASA Space Explorer — Website Blueprint
**Version 1.0 · Implementation-Ready**

---

## Table of Contents

1. [Sitemap](#1-sitemap)
2. [Navigation Structure](#2-navigation-structure)
3. [Page-by-Page Wireframes](#3-page-by-page-wireframes)
4. [Content Hierarchy](#4-content-hierarchy)
5. [Component Inventory](#5-component-inventory)
6. [Responsive Layout Recommendations](#6-responsive-layout-recommendations)
7. [Accessibility Recommendations](#7-accessibility-recommendations)
8. [User Journeys](#8-user-journeys)

---

## 1. Sitemap

All four pages sit at the same hierarchy level. There are no sub-pages, no dynamic routes, and no nesting. The wordmark links to Home from every page.

```
NASA Space Explorer (root)
│
├── Home                    /index.html
├── APOD                    /apod.html
├── Mars Rover Explorer     /mars.html
└── About                   /about.html
```

### 1.1 Page Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                          HOME                                   │
│         (entry point; links to all other pages)                 │
└───────────┬──────────────────┬──────────────────┬──────────────┘
            │                  │                  │
            ▼                  ▼                  ▼
         [APOD]      [MARS ROVER EXPLORER]     [ABOUT]
            │                  │                  │
            └──────────────────┴──────────────────┘
                     (all pages link to each other
                      via the persistent global nav)
```

### 1.2 API Dependencies per Page

| Page | External calls | Fallback required |
|---|---|---|
| Home | NASA APOD API (today's image) | Yes — static fallback image |
| APOD | NASA APOD API (date-driven) | Yes — error message inline |
| Mars Rover Explorer | NASA Mars Rover Photos API | Yes — empty/error state in gallery |
| About | None | Not applicable |

---

## 2. Navigation Structure

### 2.1 Global Header — Desktop (≥ 768px)

Present on every page. Sticky at top, `z-index: 100`, height `64px`.

```
┌───────────────────────────────────────────────────────────────────┐
│  Astra° SPACE EXPLORER              HOME   APOD   MARS   ABOUT   │
└───────────────────────────────────────────────────────────────────┘
```

- **Wordmark** — left-aligned. "Astra°" bold, "SPACE EXPLORER" in `--text-tertiary`, uppercase, wide letter-spacing. Always links to `/index.html`.
- **Nav links** — right-aligned. Uppercase, `0.875rem`, `font-weight: 500`, `--text-secondary` by default.
- **Active state** — current page link: `--text-primary` + 2px bottom border in `--accent-primary`, offset 4px below the text baseline.
- **Hover state** — transition to `--text-primary` over `200ms ease`.
- **Background** — `--bg-primary` at rest. When scrolled: `rgba(10, 10, 10, 0.85)` with `backdrop-filter: blur(12px)`.

### 2.2 Global Header — Mobile (< 768px)

```
┌───────────────────────────────────────────────────────────────────┐
│  Astra° SPACE EXPLORER                                      [☰]  │
└───────────────────────────────────────────────────────────────────┘
```

On tap of ☰, a full-screen overlay slides in:

```
┌───────────────────────────────────────────────────────────────────┐
│                                                              [×]  │
│                                                                   │
│                          HOME                                     │
│                          APOD                                     │
│                          MARS ROVER                               │
│                          ABOUT                                    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

- Overlay background: `--bg-primary` at 98% opacity.
- Links: `1.5rem`, `--text-primary`, centered, `48px` minimum tap height.
- Active page link: `--accent-primary` underline.
- Close button (×): top-right, `24×24px` SVG, `aria-label="Close navigation menu"`.
- Transition: `opacity 300ms ease`, `transform 300ms ease`.

### 2.3 Breadcrumb — Interior Pages

A secondary orientation line appears below the header on APOD, Mars Rover, and About. It does not appear on Home.

```
← HOME / ASTRONOMY PICTURE OF THE DAY
← HOME / MARS ROVER EXPLORER
← HOME / ABOUT
```

- Uses the `←` text character, not an SVG.
- Text in `--text-tertiary`, uppercase, `0.75rem`, monospace font.
- "← HOME" is a link to `/index.html`.
- Page name is static text (not a link).
- Sits below the header at a consistent vertical margin of `--space-6` (32px).

### 2.4 Navigation Rules

- Never use dropdown menus. The site has four pages — flat navigation is sufficient.
- The active page must be indicated at all times, including on mobile overlay.
- Wordmark is always a link to `/index.html`, on every page.
- Keyboard navigation: `Tab` focuses nav links in left-to-right order; `Enter` activates.

---

## 3. Page-by-Page Wireframes

### 3.1 Home Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER — 64px                                                    │
│ [Astra° SPACE EXPLORER]                  HOME  APOD  MARS ROVER  ABOUT │
├─────────────────────────────────────────────────────────────────────────┤
│ HERO SECTION — full-bleed, min 60vh                                     │
│                                                                         │
│  ┌────────────────────────────┬──────────────────────────────────────┐  │
│  │  TEXT (left, ~50%)         │  TODAY'S APOD IMAGE (right, ~50%)   │  │
│  │                            │                                      │  │
│  │                            │  [Dynamic: fetched on page load]     │  │
│  │  Explore.                  │                                      │  │
│  │  Discover.                 │  [Dark gradient overlay fades        │  │
│  │  Understand.               │   from left edge into image]         │  │
│  │  [Display type, bold]      │                                      │  │
│  │                            │                                      │  │
│  │  Subtitle text, 2 lines,   │                                      │  │
│  │  --text-secondary          │  ┌────────────────────────────────┐  │  │
│  │                            │  │ [APOD TITLE — bottom, overlay] │  │  │
│  │  [START EXPLORING →]       │  │ [VIEW FULL →]                  │  │  │
│  │  [outline button]          │  └────────────────────────────────┘  │  │
│  │                            │                                      │  │
│  └────────────────────────────┴──────────────────────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ SECTION LABEL                                                           │
│ ── EXPLORE ─────────────────────────────────────────────────────────── │
├─────────────────────────────────────────────────────────────────────────┤
│ FEATURE CARDS — 3-column grid, max 1200px, centered                     │
│                                                                         │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐   │
│  │ [APOD image bg,   │  │ [Mars image bg,   │  │ [Space image bg,  │   │
│  │  opacity 0.6]     │  │  opacity 0.6]     │  │  opacity 0.6]     │   │
│  │                   │  │                   │  │                   │   │
│  │                   │  │                   │  │                   │   │
│  │ ASTRONOMY         │  │ MARS ROVER        │  │ ABOUT             │   │
│  │ PICTURE OF        │  │ EXPLORER          │  │                   │   │
│  │ THE DAY           │  │                   │  │ One-line          │   │
│  │                   │  │ One-line          │  │ description       │   │
│  │ One-line          │  │ description       │  │                   │   │
│  │ description       │  │                   │  │ →                 │   │
│  │                   │  │ →                 │  │                   │   │
│  │ →                 │  │                   │  │                   │   │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ GLOBAL FOOTER — ~80px                                                   │
│ © 2025 Astra Space Explorer · Data provided by NASA Open APIs          │
│ Not affiliated with any government agency.                              │
└─────────────────────────────────────────────────────────────────────────┘
```

**Hero states:**

| State | Behaviour |
|---|---|
| Loading | Right column shows `--bg-surface` pulse placeholder. Headline and button visible immediately. |
| Loaded | APOD image fades in with dark gradient overlay. Title and "VIEW FULL →" appear at bottom-right. |
| Error | Right column shows static fallback image from NASA image commons. No error text in the hero. |

**Feature card notes:**
- Image backgrounds use `object-fit: cover`, `opacity: 0.6`, absolutely positioned behind text content.
- A `linear-gradient(to top, rgba(10,10,10,0.9), transparent)` overlay sits between image and text.
- Card hover: `border-color` transitions from `--border-subtle` to `--border-default` over `200ms`.
- Arrow (→) is a text character, not an SVG. Color: `--accent-primary`.
- Each card is a `<a>` wrapping the entire card area for maximum tap area.

---

### 3.2 APOD Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER — 64px                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ BREADCRUMB                                                              │
│ ← HOME / ASTRONOMY PICTURE OF THE DAY                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ PAGE TITLE AREA — max 1200px, centered                                  │
│                                                                         │
│  ASTRONOMY PICTURE OF THE DAY                       [H1, uppercase]     │
│  A different astronomical image every day                               │
│  [--text-secondary, 1rem]                                               │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ CONTENT AREA — two-column, max 1200px, centered                         │
│                                                                         │
│  ┌──────────────────────────────────────┐  ┌───────────────────────┐   │
│  │ MAIN CONTENT COLUMN (~65%)            │  │ SIDEBAR (~35%)        │   │
│  │                                       │  │                       │   │
│  │ [SECTION LABEL: IMAGE]                │  │ [SECTION LABEL: DATE] │   │
│  │ ┌───────────────────────────────────┐ │  │ ─────────────────────  │   │
│  │ │                                   │ │  │ DATE                   │   │
│  │ │  APOD IMAGE (contain on dark      │ │  │ [input type="date"  ] │   │
│  │ │  matte, original aspect ratio)    │ │  │ [LOAD →] button        │   │
│  │ │                                   │ │  │                        │   │
│  │ │  — or, if media_type=video —      │ │  │ ─── divider ─────────  │   │
│  │ │  [YouTube iframe embed]           │ │  │                        │   │
│  │ │                                   │ │  │ [SECTION LABEL:        │   │
│  │ └───────────────────────────────────┘ │  │  RANDOM]               │   │
│  │                                       │  │ ─────────────────────  │   │
│  │ [↓ DOWNLOAD]  [⤢ EXPAND]  [↗ SHARE]  │  │ [SHOW ME A RANDOM      │   │
│  │ [ghost icon buttons]                  │  │  APOD →]               │   │
│  │                                       │  │                        │   │
│  │ ─── divider ────────────────────────  │  │ ─── divider ─────────  │   │
│  │                                       │  │                        │   │
│  │ [SECTION LABEL: DETAILS]              │  │ [SECTION LABEL:        │   │
│  │ ─────────────────────────────────     │  │  RECENT]               │   │
│  │ ┌────────────────┬──────────────────┐ │  │ ─────────────────────  │   │
│  │ │ DATE           │ YYYY-MM-DD       │ │  │                        │   │
│  │ │ TITLE          │ Image title...   │ │  │ ┌──────┐ Title         │   │
│  │ │ CREDIT         │ Photographer     │ │  │ │[img] │ Date          │   │
│  │ │ MEDIA TYPE     │ image / video    │ │  │ └──────┘               │   │
│  │ └────────────────┴──────────────────┘ │  │                        │   │
│  │                                       │  │ ┌──────┐ Title         │   │
│  │ ─── divider ────────────────────────  │  │ │[img] │ Date          │   │
│  │                                       │  │ └──────┘               │   │
│  │ [SECTION LABEL: EXPLANATION]          │  │                        │   │
│  │ ─────────────────────────────────     │  │ ┌──────┐ Title         │   │
│  │ [NASA explanation body text,          │  │ │[img] │ Date          │   │
│  │  ~400–800 words, 1rem, lh 1.7]        │  │ └──────┘               │   │
│  │                                       │  │                        │   │
│  └──────────────────────────────────────┘  └───────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ GLOBAL FOOTER                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

**Lightbox overlay (triggered by EXPAND button):**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ LIGHTBOX — full screen, rgba(10,10,10,0.95)                             │
│                                                                [×] ESC  │
│                                                                         │
│            ┌─────────────────────────────────────────┐                 │
│            │                                         │                 │
│            │   [APOD IMAGE — full resolution,        │                 │
│            │    object-fit: contain,                 │                 │
│            │    max 90vh × 90vw]                     │                 │
│            │                                         │                 │
│            └─────────────────────────────────────────┘                 │
│            [APOD TITLE]  ·  [DATE]                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**APOD page implementation notes:**

- On page load: fetch today's APOD automatically. Date picker pre-filled with today's date.
- Date picker: native `<input type="date">`. Set `max` attribute to today's date; set `min` to `1995-06-16` (first APOD).
- "LOAD →" is the explicit trigger; do not auto-fetch on date change.
- If `media_type === "video"`: render a `<figure>` containing a `<iframe>` with `title="APOD video: [title]"`. No autoplay.
- If `media_type === "image"`: render `<figure>` with `<img>` using `object-fit: contain` on a `--bg-primary` matte background.
- Metadata table: only include fields available from the API. Fields: `date`, `title`, `copyright` (label as "CREDIT"), `media_type`. Do not include Constellation, Distance, or Category.
- Download: link to `hdurl` if present; fall back to `url`. Opens in a new tab. If only `url` is available, label button "DOWNLOAD SD".
- Share: attempt the native Web Share API (`navigator.share`). If unsupported, copy the current URL to clipboard and show a brief "Link copied" inline confirmation.
- Recent APOD thumbnails: pre-fetch the previous 5 calendar days on page load. Display as `120×80px` items, `object-fit: cover`. Each item links to the APOD page with `?date=YYYY-MM-DD`.
- Random APOD: generate a random date between `1995-06-16` and today; fetch that date's APOD and update the main content area.

---

### 3.3 Mars Rover Explorer Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER — 64px                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ BREADCRUMB                                                              │
│ ← HOME / MARS ROVER EXPLORER                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ PAGE TITLE AREA — max 1200px, centered                                  │
│                                                                         │
│  MARS ROVER EXPLORER                                [H1, uppercase]     │
│  Browse images captured by NASA's Mars missions                         │
│  [--text-secondary, 1rem]                                               │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ ROVER SELECTOR + METADATA PANEL — full-width surface card               │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ROVER                                                           │   │
│  │ [Curiosity ▼]  [Opportunity ▼]  [Spirit ▼]                     │   │
│  │ (styled select or three radio-style buttons)                    │   │
│  │                                                                 │   │
│  │ ────────────────────────────────────────────────────────────    │   │
│  │                                                                 │   │
│  │  [LABEL: STATUS]    [LABEL: LANDING DATE]  [LABEL: LOCATION]   │   │
│  │  ACTIVE             NOV 26, 2011           GALE CRATER         │   │
│  │                                                                 │   │
│  │  [LABEL: MAX SOL]   [LABEL: TOTAL PHOTOS]                      │   │
│  │  4000+              695,670                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ FILTER CONTROLS — max 1200px, centered                                  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  SOL (MARTIAN DAY)       CAMERA             [         ]         │   │
│  │  [        1000        ]  [All Cameras ▼]    [ SEARCH → ]       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ RESULTS STATUS BAR                                                      │
│  SHOWING 25 OF 124 IMAGES · SOL 1000 · CURIOSITY · ALL CAMERAS         │
│  [--text-tertiary, monospace, uppercase, 0.75rem]                       │
├─────────────────────────────────────────────────────────────────────────┤
│ GALLERY GRID — 3-column uniform grid, full-bleed                        │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    │
│  │             │  │             │  │             │                    │
│  │  [img]      │  │  [img]      │  │  [img]      │                    │
│  │  4:3 ratio  │  │  4:3 ratio  │  │  4:3 ratio  │                    │
│  │             │  │             │  │             │                    │
│  └─────────────┘  └─────────────┘  └─────────────┘                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    │
│  │             │  │  [LOADING   │  │             │                    │
│  │  [img]      │  │   PULSE]    │  │  [img]      │                    │
│  │             │  │             │  │             │                    │
│  └─────────────┘  └─────────────┘  └─────────────┘                    │
│  (up to 25 items per page)                                              │
│                                                                         │
│  [Empty state — shown when no results:]                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  No images found for Sol 1000 with Spirit using PANCAM.         │   │
│  │  Try a different Sol or camera.                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ PAGINATION BAR                                                          │
│                  [← PREV]   PAGE 1 OF 5   [NEXT →]                     │
├─────────────────────────────────────────────────────────────────────────┤
│ GLOBAL FOOTER                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

**Image lightbox (triggered by clicking any gallery item):**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ LIGHTBOX — full screen, rgba(10,10,10,0.95)                             │
│                                                                [×] ESC  │
│                                                                         │
│            ┌─────────────────────────────────────────┐                 │
│            │                                         │                 │
│            │   [ROVER IMAGE — full size,             │                 │
│            │    object-fit: contain,                 │                 │
│            │    max 85vh × 85vw]                     │                 │
│            │                                         │                 │
│            └─────────────────────────────────────────┘                 │
│            CAMERA: MAST · SOL: 1000 · ROVER: CURIOSITY · ID: 12345     │
│            [--text-tertiary, monospace, uppercase, 0.75rem]             │
│                                                                         │
│            [← PREV IMAGE]                      [NEXT IMAGE →]          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Mars Rover page implementation notes:**

- Default state on load: Curiosity selected; metadata panel populated; gallery empty (no auto-search).
- Rover selector: three `<button>` elements styled as a toggle group, or a `<select>`. On change, update metadata panel only. Do not trigger gallery fetch.
- Metadata panel values: populated from a static configuration object in JavaScript (no additional API call needed for this data). Fields per rover: status, landing date, location, max sol, total photos.
- Sol input: `<input type="number">`, min `0`, max derived from rover's known max sol (from static config). Validate on search; show inline error if out of range.
- Camera dropdown options vary by rover. Populate from a static config map keyed by rover name. Always include "All Cameras" as the first option.
- "SEARCH →" button is the only trigger for gallery fetch. Loading state: replace gallery content with 9 pulse-placeholder cells.
- Results status bar: update after fetch with total count, current page, applied filters.
- Gallery: 25 images per page, `aspect-ratio: 4/3`, `object-fit: cover`.
- Pagination: simple previous/next buttons. Disable "PREV" on page 1; disable "NEXT" on last page. Show "PAGE N OF M" between buttons.
- Lightbox: show camera name, sol, rover name, and image ID in monospace. Support ← / → arrow keys for prev/next image within the current page results. Close on Escape or × button.

---

### 3.4 About Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER — 64px                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ BREADCRUMB                                                              │
│ ← HOME / ABOUT                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ PAGE TITLE AREA — max 1200px, centered                                  │
│                                                                         │
│  ABOUT THIS PROJECT                                 [H1, uppercase]     │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ CONTENT — single column, max 720px, centered                            │
│                                                                         │
│  [SECTION LABEL: THE PROJECT]                                           │
│  ──────────────────────────────────────────────────────────────────     │
│  [Body text, 2–3 paragraphs describing the student club project         │
│   and its goals]                                                        │
│                                                                         │
│                                                                         │
│  [SECTION LABEL: DATA SOURCES]                                          │
│  ──────────────────────────────────────────────────────────────────     │
│  [Body text: brief description of NASA Open APIs]                       │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  API           NASA Astronomy Picture of the Day (APOD)          │   │
│  │  ENDPOINT      api.nasa.gov/planetary/apod                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  API           NASA Mars Rover Photos API                        │   │
│  │  ENDPOINT      api.nasa.gov/mars-photos/api/v1/rovers/           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                                                                         │
│  [SECTION LABEL: DISCLAIMER]                                            │
│  ──────────────────────────────────────────────────────────────────     │
│  [Body text: not affiliated with NASA or any government agency.         │
│   All imagery is the property of NASA and used under their              │
│   open data policy.]                                                    │
│                                                                         │
│                                                                         │
│  [SECTION LABEL: BUILT WITH]                                            │
│  ──────────────────────────────────────────────────────────────────     │
│  [Body text: HTML5, CSS3, Vanilla JavaScript, FastAPI (Python),         │
│   NASA Open APIs]                                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
│ GLOBAL FOOTER                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

**About page implementation notes:**

- No JavaScript or API calls. This page is fully static.
- Content width capped at `720px` (approximately 65–75 characters per line).
- API info cards use the raised surface style: `--bg-elevated` background, `1px solid --border-subtle` border.
- Do not add links to external pages that do not exist (no Privacy Policy, no Image Credits, no GitHub unless the repo is actually public).

---

## 4. Content Hierarchy

Content hierarchy defines the priority order in which elements should be perceived and interacted with. It drives decisions about visual weight, DOM order, and screen reader announcement order.

### 4.1 Home Page

| Priority | Element | Rationale |
|---|---|---|
| 1 | Hero headline | Immediate identity and value proposition |
| 2 | Today's APOD preview (right column) | Live data; demonstrates the product's core purpose |
| 3 | "START EXPLORING →" CTA | Primary action; entry to features |
| 4 | Feature cards | Secondary navigation to APOD and Mars Rover |
| 5 | "EXPLORE" section label | Wayfinding between hero and cards |
| 6 | Footer | Legal and attribution |

### 4.2 APOD Page

| Priority | Element | Rationale |
|---|---|---|
| 1 | APOD image or video | The primary content; fills visual attention first |
| 2 | Title and date | Context for the image |
| 3 | Explanation body text | The primary reading content |
| 4 | Download, Expand, Share actions | Utility actions tightly coupled to the image |
| 5 | Metadata table (Date, Title, Credit, Media Type) | Supplementary detail |
| 6 | Date picker (sidebar) | Primary control for navigation |
| 7 | Random APOD button (sidebar) | Secondary discovery action |
| 8 | Recent APODs (sidebar) | Lowest priority; browsing history |

### 4.3 Mars Rover Explorer Page

| Priority | Element | Rationale |
|---|---|---|
| 1 | Filter controls (Rover, Sol, Camera, Search) | The primary task; without this, the page does nothing |
| 2 | Gallery grid | The primary content output |
| 3 | Results status bar | Immediate feedback: how many results, what filters are active |
| 4 | Pagination controls | Navigation through result set |
| 5 | Rover metadata panel | Contextual information to help the user choose a valid Sol |
| 6 | Breadcrumb | Lowest priority |

### 4.4 About Page

| Priority | Element | Rationale |
|---|---|---|
| 1 | Project description | Answers "what is this?" |
| 2 | Data sources and API details | Establishes credibility and transparency |
| 3 | Disclaimer | Legal obligation |
| 4 | Built With | Technical transparency for the student context |

---

## 5. Component Inventory

All components should be implemented as standalone, self-contained units with clearly scoped CSS classes. Components in this inventory are either global (shared across pages) or page-specific.

### 5.1 Global Components

| Component | Pages | States | Notes |
|---|---|---|---|
| **SiteHeader** | All | Default; Scrolled (blur + transparency) | `<header>`, sticky top, 64px |
| **NavLink** | All | Default; Hover; Active; Focus-visible | Uppercase, `0.875rem` |
| **MobileMenuToggle** | All (mobile) | Closed (☰); Open (×) | 24×24px SVG, `aria-label` required |
| **MobileMenuOverlay** | All (mobile) | Open; Closed | `role="dialog"`, `aria-modal="true"`, focus-trapped |
| **SiteFooter** | All | Default | Single-line text, no link columns |
| **Breadcrumb** | APOD, Mars, About | Default | `←` text char, monospace |
| **SectionLabel** | All | Default | `0.75rem`, uppercase, `--accent-primary`, `letter-spacing: 0.1em` |
| **SectionDivider** | All | Default | `1px solid --border-subtle`, full-width |
| **ImageLightbox** | APOD, Mars | Open; Closed | `role="dialog"`, `aria-modal="true"`, focus-trapped, Escape to close |
| **LoadingPulse** | All | Active; Resolved | `--bg-surface` placeholder, opacity pulse animation, `prefers-reduced-motion` aware |
| **InlineError** | APOD, Mars | Default | `role="alert"`, `--status-error` color, text only |
| **EmptyState** | Mars | Default | Centered in gallery container, `role="status"` |

### 5.2 Home Page Components

| Component | Description | States |
|---|---|---|
| **HeroSection** | Full-bleed two-column section | Loading; Loaded; Error |
| **HeroHeadline** | "Explore. Discover. Understand." display text | Static |
| **HeroSubtitle** | Two-line subtitle below headline | Static |
| **HeroAPODPreview** | Today's APOD image + title + "VIEW FULL →" in right column | Loading (LoadingPulse); Loaded; Error (static fallback image) |
| **CTAButton** | "START EXPLORING →" outline button, links to `/apod.html` | Default; Hover; Focus-visible; Active |
| **FeatureCard** | Image-background card with title, description, arrow link | Default; Hover (border-color shift); Focus-visible |

### 5.3 APOD Page Components

| Component | Description | States |
|---|---|---|
| **APODFigure** | `<figure>` wrapping image or video iframe | Loading (LoadingPulse); Loaded; Error ("Image unavailable") |
| **APODImage** | `<img>` with `object-fit: contain` on dark matte | Loading; Loaded; Error |
| **APODVideo** | `<iframe>` YouTube embed with `title` attribute | Loading; Loaded |
| **APODActionBar** | Download, Expand, Share ghost icon buttons | Default; Hover; Focus-visible; Disabled (pre-load) |
| **APODMetadataTable** | Two-column key-value table | Loading (skeleton rows); Populated |
| **APODExplanation** | `<section>` with body text | Loading (LoadingPulse block); Populated |
| **DatePicker** | `<label>` + native `<input type="date">` + LOAD button | Default; Focused; Filled; Error (invalid date range) |
| **RandomAPODButton** | Ghost button; triggers random date fetch | Default; Hover; Focus-visible; Loading |
| **RecentAPODList** | 3–5 thumbnail `<a>` items | Loading (LoadingPulse); Populated |
| **RecentAPODItem** | 120×80px thumbnail + title + date | Default; Hover; Focus-visible |

### 5.4 Mars Rover Page Components

| Component | Description | States |
|---|---|---|
| **RoverSelector** | Three-option selector (Curiosity, Opportunity, Spirit) | Default; Selected; Focus-visible |
| **RoverMetadataPanel** | Surface card: status, landing, location, max sol, photos | Loading; Populated |
| **RoverMetadataItem** | Label + value pair within the metadata panel | Static |
| **SolInput** | `<label>` + `<input type="number">` | Default; Focused; Filled; Error (out of range) |
| **CameraDropdown** | `<label>` + `<select>` | Default; Focused; Populated (options from static config) |
| **SearchButton** | "SEARCH →" primary button | Default; Hover; Focus-visible; Loading |
| **ResultsStatusBar** | Dynamic count + filter summary text | Default (empty); Populated |
| **GalleryGrid** | CSS Grid, 3-column, full-bleed | Loading (9 LoadingPulse cells); Populated; Empty (EmptyState) |
| **GalleryItem** | `<button>` wrapping `<img>`, `aspect-ratio: 4/3` | Default; Hover (scale 1.03); Focus-visible |
| **PaginationBar** | ← PREV · PAGE N OF M · NEXT → | Default; First page (PREV disabled); Last page (NEXT disabled) |
| **LightboxImageMeta** | Camera, Sol, Rover, Image ID in monospace line | Static within open lightbox |

### 5.5 About Page Components

| Component | Description | States |
|---|---|---|
| **TextBlock** | `<section>` with label + divider + body paragraphs | Static |
| **APIInfoCard** | Raised card: API name + endpoint | Static |

### 5.6 Component Design Tokens Summary

Every component must use CSS custom properties exclusively. No hardcoded color or spacing values anywhere.

| Token category | Property | Value |
|---|---|---|
| Backgrounds | `--bg-primary`, `--bg-elevated`, `--bg-surface` | See §4.1 of design spec |
| Borders | `--border-subtle`, `--border-default` | `#2A2A2A`, `#3A3A3A` |
| Text | `--text-primary`, `--text-secondary`, `--text-tertiary` | `#FFF`, `#B0B0B0`, `#707070` |
| Accent | `--accent-primary`, `--accent-hover`, `--accent-muted` | `#4DA8DA`, `#6BBCE6`, `rgba(77,168,218,0.15)` |
| Status | `--status-success`, `--status-error`, `--status-warning` | `#4CAF50`, `#E57373`, `#FFB74D` |
| Spacing | `--space-1` through `--space-9` | 4px scale: 4, 8, 12, 16, 24, 32, 48, 64, 96 |
| Fonts | `--font-heading`, `--font-body`, `--font-mono` | Inter, Inter, JetBrains Mono |

---

## 6. Responsive Layout Recommendations

### 6.1 Breakpoints

Use only two breakpoints. Mobile-first authoring: write base styles for mobile, then override at `768px`.

| Name | Range | Primary targets |
|---|---|---|
| Mobile | `< 768px` | Phones 375px–767px |
| Desktop | `≥ 768px` | Tablets, laptops, desktops |

Within Mobile, a sub-breakpoint at `< 480px` applies to the gallery only (2 columns → 1 column).

**Validation sizes:** 375px (iPhone SE), 768px (iPad portrait), 1440px (laptop/desktop).

### 6.2 Page Layout Changes by Breakpoint

#### Home

| Element | Desktop (≥ 768px) | Mobile (< 768px) |
|---|---|---|
| Global nav | Horizontal text links | Hamburger + full-screen overlay |
| Hero | Two-column: text left, image right | Stacked: APOD image top (50vh), then text and CTA below |
| Hero image gradient | Left edge only | Bottom edge (text sits below image) |
| Feature cards | 3-column CSS Grid | Single column, full-width, stacked |
| Card min-height | 240px | 200px |

#### APOD

| Element | Desktop (≥ 768px) | Mobile (< 768px) |
|---|---|---|
| Content layout | Two-column: 65% main + 35% sidebar | Single column |
| Column order | Main left, sidebar right | Main content first, sidebar below |
| APOD image | Max-width 720px, centered in column | Full container width |
| Metadata table | Two-column key-value | Label above value (single column) |
| Action buttons | Horizontal row below image | Horizontal row below image (unchanged) |
| Recent thumbnails | 120×80px items with title alongside | Full-width rows |

#### Mars Rover Explorer

| Element | Desktop (≥ 768px) | Mobile (< 768px) |
|---|---|---|
| Rover metadata panel | Single row: 5 data points side-by-side | Wraps to two rows |
| Filter controls | Sol + Camera + Search on one line | Stacked: Sol row, Camera row, Search button |
| Gallery grid | 3 columns | 2 columns (≥ 480px) → 1 column (< 480px) |
| Gallery item | `aspect-ratio: 4/3` | `aspect-ratio: 4/3` (unchanged) |
| Lightbox | Full-screen overlay | Full-screen overlay (unchanged) |
| Pagination | Centered row | Centered row (unchanged) |

#### About

| Element | Desktop (≥ 768px) | Mobile (< 768px) |
|---|---|---|
| Content column | `max-width: 720px`, centered | Full width, `16px` side padding |
| API info cards | Matches text column width | Full container width |

### 6.3 Touch Targets

All interactive elements on mobile must meet the 44×44px minimum:

- Navigation links: minimum height `48px` in the overlay.
- CTA buttons: minimum height `44px` enforced via `padding: 12px 24px`.
- Icon buttons (Download, Expand, Share): minimum `44×44px` bounding box even if the icon is 20px — achieved with padding.
- Sol number input: `padding: 12px 16px` gives minimum `44px` height.
- Gallery items on mobile: cells are sized by the grid; they will naturally exceed 44px.
- Pagination buttons: minimum height `44px`.

### 6.4 Typography Fluidity

| Element | Value |
|---|---|
| Hero headline | `clamp(2.5rem, 5vw, 4rem)` — no breakpoint override needed |
| Page title (H1) | `clamp(2rem, 4vw, 3rem)` — no breakpoint override needed |
| Section headings (H2) | `1.5rem` fixed — acceptable at all sizes |
| Body text | `1rem` fixed at all breakpoints — never changes |
| Labels and captions | `0.875rem` fixed — never below this |

### 6.5 Layout Constraints

- Maximum content width: `1200px`, centered with `auto` margins.
- Maximum paragraph width: `720px`. Apply `max-width: 720px` to all `<p>` containers, not to individual `<p>` tags.
- Horizontal scrolling: never acceptable. Enforce `overflow-x: hidden` on `body` and avoid fixed-width elements.
- Side padding on mobile: `--space-4` (16px) applied as `padding-inline` on the page container.
- Images and iframes: always use `max-width: 100%` to prevent overflow on narrow screens.

---

## 7. Accessibility Recommendations

### 7.1 Document Structure

Apply to every page:

- One `<h1>` per page, matching the visible page title.
- Heading levels must not skip: H1 → H2 → H3 in sequence. Never jump from H1 to H3.
- `<html lang="en">` on every page.
- `<meta name="viewport" content="width=device-width, initial-scale=1">` on every page.
- `<header>` wraps the global navigation.
- `<main>` wraps the page-specific content. One `<main>` per page.
- `<footer>` wraps the global footer.
- `<nav aria-label="Main navigation">` wraps the nav link list.
- `<article>` wraps the APOD content block (image + explanation).
- `<section aria-labelledby="[heading-id]">` for each named content section.
- `<figure>` and `<figcaption>` for all APOD images and videos.

### 7.2 Focus Management Rules

| Trigger | Focus behaviour |
|---|---|
| Mobile menu opens | Focus moves to the first menu link |
| Mobile menu closes (via × or Escape) | Focus returns to the hamburger button |
| Lightbox opens | Focus moves to the close (×) button |
| Lightbox closes (via × or Escape) | Focus returns to the element that opened it |
| APOD date loads (new content renders) | Focus remains on the LOAD button; content updates in place |
| Mars gallery search completes | Focus moves to the results status bar (`tabindex="-1"`) |

- Focus must always be visible. All interactive elements must show `:focus-visible` state: `outline: 2px solid var(--accent-primary); outline-offset: 2px;`.
- Tab order must follow visual order at all times. Do not use positive `tabindex` values.
- Use `tabindex="-1"` on the lightbox container and results status bar to allow programmatic focus.

### 7.3 Focus Trapping

Focus must be trapped (cycle within) while the following overlays are open:

- Mobile menu overlay
- Image lightbox (APOD and Mars)

Implement focus trapping by intercepting `Tab` and `Shift+Tab` keydown events and cycling between the first and last focusable elements within the overlay.

### 7.4 Image Alt Text

| Context | Alt text rule | Example |
|---|---|---|
| APOD main image | Use NASA's title from the API response | `alt="Pillars of Creation in Infrared"` |
| APOD hero preview (Home) | Use NASA's title | `alt="Aurora Over Iceland"` |
| Gallery thumbnail (Mars) | Camera name + Sol + image ID | `alt="Curiosity MAST camera, Sol 1000, image ID 12345"` |
| Feature card backgrounds | Purely decorative; use empty alt | `alt=""` and `role="presentation"` |
| Recent APOD thumbnails (sidebar) | Use NASA's title | `alt="Crab Nebula in X-ray"` |
| Image unavailable fallback | Describe the failure | `alt="Image unavailable"` |

Never use the filename as alt text. Never leave `alt` omitted on an `<img>` tag.

### 7.5 Form Accessibility

Every form control must have an associated label:

```
<label for="apod-date">DATE</label>
<input type="date" id="apod-date" name="apod-date" ... />

<label for="sol-input">SOL (MARTIAN DAY)</label>
<input type="number" id="sol-input" name="sol" ... />

<label for="rover-select">ROVER</label>
<select id="rover-select" name="rover"> ... </select>

<label for="camera-select">CAMERA</label>
<select id="camera-select" name="camera"> ... </select>
```

Icon-only buttons require `aria-label`:

```
<button aria-label="Download high-resolution image"> [SVG icon] </button>
<button aria-label="View image fullscreen"> [SVG icon] </button>
<button aria-label="Share this image"> [SVG icon] </button>
<button aria-label="Close image viewer"> [SVG icon] </button>
```

### 7.6 Keyboard Navigation

| Component | Key | Behaviour |
|---|---|---|
| Hamburger button | `Enter`, `Space` | Opens mobile menu overlay |
| Mobile menu / Lightbox | `Escape` | Closes overlay, returns focus |
| Gallery items | `Enter`, `Space` | Opens lightbox |
| Lightbox | `←`, `→` | Navigate to previous / next image |
| Lightbox prev/next buttons | `Enter`, `Space` | Navigate |
| Select dropdowns | Standard browser behaviour | No custom implementation needed |
| Date input | Standard browser behaviour | No custom implementation needed |
| Pagination buttons | `Enter`, `Space` | Load previous / next page |

Never intercept keyboard events unnecessarily. Only add custom keyboard handling for the four cases above.

### 7.7 ARIA Attributes

| Component | Required attributes |
|---|---|
| `<nav>` | `aria-label="Main navigation"` |
| Mobile menu overlay | `role="dialog"`, `aria-modal="true"`, `aria-label="Navigation menu"` |
| Image lightbox | `role="dialog"`, `aria-modal="true"`, `aria-label="Image viewer"` |
| Gallery container (loading) | `aria-busy="true"` while fetching; remove when complete |
| Results status bar | `role="status"` (polite live region); `aria-live="polite"` |
| Inline error messages | `role="alert"` (assertive live region) |
| Empty state message | `role="status"` |
| Loading button state | `aria-disabled="true"` and `aria-label="Loading..."` while request is in progress |

### 7.8 Colour Contrast

All combinations must pass WCAG 2.1 Level AA (4.5:1 for body text, 3:1 for large text ≥ 18px regular or ≥ 14px bold):

| Foreground | Background | Approx. ratio | Status |
|---|---|---|---|
| `--text-primary` (#FFF) | `--bg-primary` (#0A0A0A) | 19.6:1 | ✓ AAA |
| `--text-primary` (#FFF) | `--bg-elevated` (#141414) | 17.3:1 | ✓ AAA |
| `--text-secondary` (#B0B0B0) | `--bg-primary` (#0A0A0A) | 7.1:1 | ✓ AA |
| `--text-secondary` (#B0B0B0) | `--bg-elevated` (#141414) | 6.3:1 | ✓ AA |
| `--text-tertiary` (#707070) | `--bg-primary` (#0A0A0A) | 3.4:1 | ✓ Large text only |
| `--accent-primary` (#4DA8DA) | `--bg-primary` (#0A0A0A) | 5.7:1 | ✓ AA |

**Rule:** Never use `--text-tertiary` (#707070) for body text (paragraph text at any size). Reserve it for captions, timestamps, breadcrumb separators, and placeholder text only.

### 7.9 Reduced Motion

All CSS transitions and `@keyframes` rules must be wrapped in a `prefers-reduced-motion: no-preference` media query. The site must be fully functional with all motion removed. Specifically:

- Page content fade-in: skipped entirely if reduced motion is enabled.
- Mobile menu transition: immediate show/hide.
- Gallery image hover zoom: no transform applied.
- Image loading pulse: no animation; placeholder stays at full opacity.
- Lightbox open/close: immediate, no transition.

### 7.10 Video Accessibility (APOD)

When the APOD `media_type` is `"video"` (YouTube embed):

- The `<iframe>` must have `title="APOD video: [NASA title from API]"`.
- No `autoplay` attribute. YouTube's standard controls must remain visible.
- The surrounding `<figure>` element's `<figcaption>` must include the APOD title and date so screen reader users have context before encountering the iframe.
- Do not attempt to hide or style the YouTube iframe controls.

---

## 8. User Journeys

### Journey 1 — First-Time Visitor Discovering the Site

**Entry point:** Home page  
**User goal:** Understand what the site offers; reach a feature  
**Device:** Desktop

| Step | Screen | User action | System response |
|---|---|---|---|
| 1 | Home | Arrives on page | Hero loads with today's APOD image. Headline visible immediately. |
| 2 | Home | Reads "Explore. Discover. Understand." | Headline communicates purpose. APOD image provides immediate visual engagement. |
| 3 | Home | Notices "VIEW FULL →" on APOD preview | APOD title visible on image. Link is distinct and tappable. |
| 4 | Home → APOD | Clicks "VIEW FULL →" | Navigates to APOD page. Today's APOD loads in full. |
| 5 | APOD | Reads title and explanation | Content is presented clearly. No extraneous elements compete for attention. |
| 6 | APOD | Notices date picker in sidebar | Interface suggests historical navigation is possible. |
| 7 | APOD | Selects a past date; clicks "LOAD →" | Loading pulse replaces image. New APOD loads. |
| 8 | APOD | Clicks "SHOW ME A RANDOM APOD →" | Another APOD loads. User discovers the archive. |
| 9 | APOD → Mars | Clicks "MARS ROVER" in top nav | Navigates to Mars Rover Explorer. |

**Failure states:**
- APOD API fails on load → Hero right column shows a static fallback space image with no error text. Feature card for APOD shows a static image background. APOD page shows an inline error: "Unable to load today's APOD. Please try again."
- Date out of range → Inline error below date picker: "APOD began on June 16, 1995. Please select a later date." Future dates are non-selectable (max attribute on input).

---

### Journey 2 — Exploring Mars Rover Images

**Entry point:** Mars Rover Explorer (from global nav or Home feature card)  
**User goal:** Find and browse images from a specific rover and sol  
**Device:** Desktop or tablet

| Step | Screen | User action | System response |
|---|---|---|---|
| 1 | Mars Rover | Arrives on page | Default: Curiosity selected. Metadata panel shows Curiosity's data. Gallery is empty. |
| 2 | Mars Rover | Reads metadata panel | Learns Curiosity's max sol, landing date, and location. Understands what Sol values are valid. |
| 3 | Mars Rover | Types "1000" in Sol input | Input updates. No fetch triggered. |
| 4 | Mars Rover | Leaves Camera as "All Cameras" | No change. |
| 5 | Mars Rover | Clicks "SEARCH →" | Button shows loading state. Gallery replaces content with 9 pulse placeholders. |
| 6 | Mars Rover | Waits ~1–2 seconds | Gallery populates with up to 25 images. Results bar: "SHOWING 25 OF 124 IMAGES · SOL 1000 · CURIOSITY · ALL CAMERAS". |
| 7 | Mars Rover | Scrolls through gallery | Images are 4:3, uniform grid. Hover shows subtle border highlight. |
| 8 | Mars Rover | Clicks an image | Lightbox opens with full image. Camera name, Sol, Rover, ID shown in metadata line. |
| 9 | Mars Rover (lightbox) | Presses → arrow key | Next image from the page results loads in lightbox. |
| 10 | Mars Rover (lightbox) | Presses Escape | Lightbox closes. Focus returns to the gallery item that was clicked. |
| 11 | Mars Rover | Clicks "NEXT →" in pagination | Images 26–50 load. Status bar updates. |
| 12 | Mars Rover | Changes rover to "Opportunity" | Metadata panel updates. Gallery does not automatically re-fetch. |
| 13 | Mars Rover | Enters new sol; clicks "SEARCH →" | Gallery updates with Opportunity's images. |

**Failure states:**
- No images for selected combination → Gallery shows EmptyState: "No images found for Sol [N] with [Rover] using [Camera]. Try a different Sol value or camera."
- API error → InlineError: "Unable to load images. Please try again later."
- Sol out of range → Sol input shows inline error: "Sol [N] exceeds Curiosity's mission range. Maximum Sol: 4000."

---

### Journey 3 — Revisiting and Sharing a Specific APOD

**Entry point:** APOD page (direct URL with query parameter, or via Home)  
**User goal:** Load a specific date's APOD and share it  
**Device:** Mobile phone

| Step | Screen | User action | System response |
|---|---|---|---|
| 1 | APOD | Arrives on page | Today's APOD loads automatically. Page is single-column on mobile. |
| 2 | APOD | Scrolls down to sidebar (below main content) | Date picker is visible below the explanation. |
| 3 | APOD | Taps the date picker | Native mobile date picker opens. |
| 4 | APOD | Selects December 24, 2020 | Picker closes. Date input shows selected date. |
| 5 | APOD | Taps "LOAD →" | Loading pulse replaces main content area. New APOD fetches. |
| 6 | APOD | Reads December 24 APOD | Image, title, date, and explanation update. URL updates to `?date=2020-12-24`. |
| 7 | APOD | Taps "↗ SHARE" | Native device share sheet opens with current URL and APOD title. |
| 8 | APOD | Shares via messaging app | Recipient receives a link to `apod.html?date=2020-12-24`. |
| 9 | APOD | Taps "↓ DOWNLOAD" | HD image URL opens in a new browser tab. Image downloads. |

**Failure states:**
- Date before 1995-06-16 → Date input `min` attribute prevents selection.
- Date in the future → Date input `max` attribute set to today; future dates non-selectable.
- HD image not available from API → Download button links to `url` (standard resolution); label reads "DOWNLOAD SD" instead of "DOWNLOAD".
- Web Share API not supported → Tapping Share copies the URL to clipboard; a brief inline confirmation text appears: "Link copied to clipboard."

---

### Journey 4 — Mobile User Browsing

**Entry point:** Home page on a phone (375px viewport)  
**User goal:** Explore the site comfortably without a mouse  
**Device:** Mobile phone

| Step | Screen | User action | System response |
|---|---|---|---|
| 1 | Home | Arrives on Home | Hamburger icon in top-right. APOD image stacked above text in hero (50vh image height). |
| 2 | Home | Taps hamburger | Full-screen nav overlay opens. Focus moves to first link. Four links displayed large and vertically centered. |
| 3 | Home | Taps "APOD" | Overlay closes. Focus returns to hamburger button. Navigation to APOD page. |
| 4 | APOD | Page loads | Single-column layout: image → action buttons → metadata (label-above-value) → explanation → sidebar. |
| 5 | APOD | Taps "⤢ EXPAND" | Lightbox opens. Focus moves to close button. Image fills screen with `object-fit: contain`. |
| 6 | APOD (lightbox) | Taps × | Lightbox closes. Focus returns to Expand button. |
| 7 | APOD | Taps hamburger → "MARS ROVER" | Navigates to Mars Rover page. |
| 8 | Mars Rover | Sees filter controls stacked vertically | Sol input first, Camera dropdown below, Search button below that. Each is at least 44px tall. |
| 9 | Mars Rover | Enters sol, selects camera, taps "SEARCH →" | Gallery loads with 2-column grid. |
| 10 | Mars Rover | Taps a gallery image | Lightbox opens. Metadata visible below image. |

**Failure states:**
- Any element narrower than 44px: prevented by CSS `min-height` and `padding` rules.
- Horizontal overflow: prevented by `overflow-x: hidden` on `body` and `max-width: 100%` on all images.

---

### Journey 5 — Student Team Member Understanding the Project

**Entry point:** About page (from top nav)  
**User goal:** Understand the project's purpose, data sources, and technology stack  
**Device:** Any

| Step | Screen | User action | System response |
|---|---|---|---|
| 1 | Any page | Clicks "ABOUT" in top nav | Navigates to About page. Page loads instantly (no API calls). |
| 2 | About | Reads "THE PROJECT" section | Learns the context: student club project, goals, intended audience. |
| 3 | About | Reads "DATA SOURCES" section | Sees the two NASA APIs used, with endpoint URLs. |
| 4 | About | Reads "DISCLAIMER" section | Confirms the project is not affiliated with NASA. |
| 5 | About | Reads "BUILT WITH" section | Sees the technology stack (HTML, CSS, JS, FastAPI). |
| 6 | About | Clicks "← HOME" in breadcrumb | Returns to Home page. |

**Failure states:** None. This page has no dynamic content and no failure states.

---

*End of Website Blueprint*
*NASA Space Explorer · Version 1.0*
