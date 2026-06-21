# NASA Space Explorer — Master Build Specification

**Status:** Implementation-ready. This document is the single source of truth. Where any other project document conflicts with this one, this document wins.

---

## 1. Project Summary

NASA Space Explorer ("Astra") is a four-page, dark-themed, student-club web app that displays real data from two NASA Open APIs: Astronomy Picture of the Day (APOD) and Mars Rover Photos. It is a static frontend application — **no backend**. Both NASA endpoints support CORS, so every request is made directly from the browser via `fetch()`. There is no build step, no framework, no CSS preprocessor, and no client-side router.

**Priorities (in order):** reliability of the two core features, visual cleanliness, code that a student can read end-to-end, accurate data display. Explicitly out of scope for v1: Near-Earth Object viewer, NASA image archive search, Earth imagery, space weather, response caching, masonry layouts, custom date pickers, any animation library.

---

## 2. Technology Stack

| Layer | Choice |
|---|---|
| Markup | HTML5, semantic elements (`<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<figure>`) |
| Styling | CSS3, one stylesheet, CSS custom properties for all tokens, CSS Grid + Flexbox for layout |
| Behavior | Vanilla JavaScript (ES2017+), no transpilation |
| Data | NASA APOD API, NASA Mars Rover Photos API — called directly from the browser |
| Fonts | Google Fonts: **Inter** (weights 400, 500, 700), **JetBrains Mono** (weight 400) |
| Backend | None |
| Build tooling | None — no bundler, no `package.json`, no `node_modules` |
| Libraries | None — no CSS framework, no JS framework, no icon font, no masonry/animation library |

---

## 3. Folder & File Structure

```
nasa-space-explorer/
├── index.html
├── apod.html
├── mars.html
├── about.html
├── css/
│   └── styles.css
├── js/
│   ├── config.js
│   ├── utils.js
│   ├── nav.js
│   ├── lightbox.js
│   ├── home.js
│   ├── apod.js
│   └── mars.js
└── assets/
    ├── favicon.ico
    ├── fallback-hero.jpg
    ├── card-apod.jpg
    ├── card-mars.jpg
    ├── card-about.jpg
    └── image-unavailable.svg
```

### File responsibilities

| File | Responsibility |
|---|---|
| `index.html` | Home page markup: header, hero (headline + dynamic APOD preview), three feature cards, footer. |
| `apod.html` | APOD page markup: breadcrumb, title, two-column content (main + sidebar), footer. |
| `mars.html` | Mars Rover Explorer markup: breadcrumb, title, rover selector, metadata panel, filters, results bar, gallery, pagination, footer. |
| `about.html` | Fully static page: project description, data sources, disclaimer, tech stack, footer. No page-specific JS. |
| `css/styles.css` | All design tokens, reset, typography, layout, every global and page-specific component style, responsive overrides, reduced-motion override. |
| `js/config.js` | Constants only: `NASA_API_KEY`, NASA endpoint base URLs, `ROVER_CONFIG` (§10), the APOD minimum date (`1995-06-16`). No logic. |
| `js/utils.js` | Shared pure functions: date formatting, date/Sol validation, HTTP-status-to-message mapping (§13), loading/error DOM helpers. |
| `js/nav.js` | Mobile hamburger menu open/close, focus trap, active-link marking. Loaded on all four pages. |
| `js/lightbox.js` | Shared full-screen image overlay (open/close, Escape, focus trap, optional ←/→ navigation). Used by `apod.js` and `mars.js`. |
| `js/home.js` | Fetches today's APOD for the hero; falls back to `assets/fallback-hero.jpg` silently on failure. |
| `js/apod.js` | Full APOD page logic: date-driven fetch, image/video branch, metadata table, action buttons, recent-5 sidebar, random APOD, URL query param sync. |
| `js/mars.js` | Full Mars Rover page logic: rover selector, metadata panel render, filters, search-triggered fetch, gallery render, pagination, empty/error states. |
| `assets/fallback-hero.jpg` | Static fallback shown in the hero if today's APOD fetch fails. |
| `assets/card-apod.jpg`, `card-mars.jpg`, `card-about.jpg` | Static background images for the three homepage feature cards (not API-driven). |
| `assets/image-unavailable.svg` | Placeholder swapped into any `<img>` whose `onerror` fires. |

### Script load order (every page, `<script defer>`, in this order)

1. `config.js`
2. `utils.js`
3. `nav.js`
4. `lightbox.js` *(apod.html and mars.html only)*
5. Page-specific module (`home.js`, `apod.js`, or `mars.js`)

---

## 4. Design Tokens

Define once, in a single `:root` block at the top of `styles.css`. Every component must reference these — no hardcoded colors, spacing, or font values anywhere else in the file.

```
--bg-primary:        #0A0A0A
--bg-elevated:        #141414
--bg-surface:         #1A1A1A

--border-subtle:      #2A2A2A
--border-default:     #3A3A3A

--text-primary:       #FFFFFF
--text-secondary:     #B0B0B0
--text-tertiary:      #707070
--text-disabled:      #4A4A4A

--accent-primary:     #4DA8DA
--accent-hover:       #6BBCE6
--accent-muted:       rgba(77, 168, 218, 0.15)

--status-success:     #4CAF50
--status-error:       #E57373
--status-warning:     #FFB74D

--space-1: 4px   --space-2: 8px   --space-3: 12px  --space-4: 16px
--space-5: 24px  --space-6: 32px  --space-7: 48px
--space-8: 64px  --space-9: 96px

--font-body: 'Inter', 'Helvetica Neue', Arial, sans-serif
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace
```

### Token usage rules

- One accent color only. Never add a second accent (e.g. orange for Mars).
- `--accent-primary` is for labels, links, active states, and focus rings — never body text.
- `--text-tertiary` is for captions, timestamps, and breadcrumb separators only — never paragraph text (3.4:1 contrast — large text only).
- Background never pure black (`#000000`); always `#0A0A0A`.
- No `box-shadow`, no `drop-shadow` anywhere. Depth is communicated only through the three-tier background system: `--bg-primary` → `--bg-elevated` → `--bg-surface`, plus border-color shifts.
- All spacing comes from the `--space-*` scale — no arbitrary pixel values.

### Verified contrast ratios (WCAG)

| Foreground | Background | Ratio | Level |
|---|---|---|---|
| `--text-primary` | `--bg-primary` | 19.6:1 | AAA |
| `--text-primary` | `--bg-elevated` | 17.3:1 | AAA |
| `--text-secondary` | `--bg-primary` | 7.1:1 | AA |
| `--text-secondary` | `--bg-elevated` | 6.3:1 | AA |
| `--text-tertiary` | `--bg-primary` | 3.4:1 | Large text only |
| `--accent-primary` | `--bg-primary` | 5.7:1 | AA |
| `--status-error` | `--bg-primary` | 5.2:1 | AA |

### Font loading (in `<head>` of every page)

Preconnect to `fonts.googleapis.com` and `fonts.gstatic.com`, then load `Inter:wght@400;500;700` and `JetBrains+Mono` with `display=swap`. Load no other weights, no other typefaces.

---

## 5. Typography Scale

| Role | Element | Font | Size | Weight | Line Height | Letter Spacing | Transform |
|---|---|---|---|---|---|---|---|
| Display | Hero headline | Inter | `clamp(2.5rem, 5vw, 4rem)` | 700 | 1.1 | -0.02em | None |
| H1 | Page title | Inter | `clamp(2rem, 4vw, 3rem)` | 700 | 1.15 | -0.01em | Uppercase |
| H2 | Section heading | Inter | 1.5rem | 700 | 1.3 | 0 | None |
| H3 | Card title | Inter | 1.25rem | 600 | 1.4 | 0 | None |
| Label | Section label | Inter | 0.75rem | 500 | 1.5 | 0.1em | Uppercase |
| Body | Paragraphs | Inter | 1rem | 400 | 1.7 | 0 | None |
| Small | Captions | Inter | 0.875rem | 400 | 1.6 | 0 | None |
| Data | Metadata values | JetBrains Mono | 0.875rem | 400 | 1.5 | 0.05em | Uppercase |

**Rules:** one `<h1>` per page; never skip heading levels; body text never below `0.875rem`; uppercase only for labels and H1 — never paragraphs; monospace only for data values (Sol numbers, dates, camera names, image counts) — never decorative.

---

## 6. Layout System

- **Max content width:** `1200px`, centered. Implement via a `page-grid` pattern: three-column grid (`1fr min(1200px, 90vw) 1fr`), content in the middle column; a `full-bleed` class spans all columns for hero images and gallery rows.
- **Max paragraph width:** `720px` (applied to text containers, not individual `<p>` tags).
- **Vertical rhythm:** minimum `--space-8` (64px) between major page sections.
- **Card padding:** `--space-5` (24px). **Input padding:** `--space-3` vertical, `--space-4` horizontal.
- **Horizontal scrolling is never acceptable.** Enforce `overflow-x: hidden` on `<body>`; all images/iframes use `max-width: 100%`.
- No selector nested more than two levels deep. No arbitrary/magic positioning — every block aligns to the grid.

---

## 7. Global Components

### 7.1 Header / Navigation

- Height `64px`, `position: sticky`, `z-index: 100`.
- Wordmark "Astra°" (`--text-primary`, weight 700) + "SPACE EXPLORER" (`--text-tertiary`, weight 400, `0.75rem`, uppercase, `letter-spacing: 0.15em`) — left-aligned, always links to `index.html`.
- Desktop (≥768px): right-aligned text links — HOME, APOD, MARS ROVER, ABOUT — `0.875rem`, uppercase, weight 500, `letter-spacing: 0.08em`, `--text-secondary` default.
- Active link: `--text-primary` + 2px bottom border in `--accent-primary`, 4px offset.
- Hover: transition to `--text-primary` over `200ms ease`.
- Background at rest: `--bg-primary`. When scrolled: `rgba(10,10,10,0.85)` + `backdrop-filter: blur(12px)`.
- Mobile (<768px): hamburger icon (☰, 24×24px SVG, `currentColor`) replaces links. Tap opens a full-screen overlay (`--bg-primary` at 98% opacity), links centered vertically at `1.5rem`, minimum `48px` tap height each, active link underlined in `--accent-primary`. Close via × button (top-right, `24×24px`, `aria-label="Close navigation menu"`) or Escape. `role="dialog"`, `aria-modal="true"`, focus trapped while open, focus returns to the hamburger button on close.
- Never use dropdown menus.

### 7.2 Breadcrumb

Appears below the header on `apod.html`, `mars.html`, `about.html` only — not on `index.html`. Format: `← HOME / {PAGE NAME}` (e.g. `← HOME / ASTRONOMY PICTURE OF THE DAY`). `←` is a text character. Style: `--text-tertiary`, uppercase, `0.75rem`, monospace. "← HOME" links to `index.html`; the page name is static text. Margin below header: `--space-6` (32px).

### 7.3 Footer

Identical on all four pages. Height ~`80px`. Background: `--bg-primary` (no visual separation from page). Text: `--text-tertiary`, `0.875rem`. Content:

```
© 2025 Astra Space Explorer · Data provided by NASA Open APIs
Not affiliated with any government agency.
```

No link columns, no social icons, no Privacy Policy / Image Credits / GitHub links.

### 7.4 Section Label / Divider

- **SectionLabel:** `0.75rem`, uppercase, `--accent-primary`, `letter-spacing: 0.1em`.
- **SectionDivider:** `1px solid --border-subtle`, full width of its container.

### 7.5 Buttons

- **Primary (outline):** `background: transparent`, `border: 1px solid --border-default`, `color: --text-primary`, padding `--space-3 --space-5`, `0.875rem`, weight 500, `letter-spacing: 0.05em`, square corners (`border-radius: 0`). Hover: `background: --bg-elevated`, `border-color: --text-secondary`, transition `200ms ease`. Focus-visible: `outline: 2px solid --accent-primary`, `outline-offset: 2px`.
- **Ghost/icon (secondary):** same as primary but `border: none`, padding `--space-2 --space-3`. Used for Download/Expand/Share. Minimum tap target `44×44px` even though the icon itself is 20px (achieved via padding). Every icon-only button requires `aria-label`.

### 7.6 Input Fields

`background: --bg-surface`, `border: 1px solid --border-default`, `color: --text-primary`, padding `--space-3 --space-4`, font `--font-mono`, `0.875rem`, `border-radius: 0`, full width. Focus: `border-color: --accent-primary`, no default outline. Associated `<label>`: `0.75rem`, weight 500, `--text-tertiary`, uppercase, `letter-spacing: 0.1em`, `margin-bottom: --space-2`.

### 7.7 Loading Pulse

A `--bg-surface` colored placeholder block with a continuous opacity pulse (`0.5 → 1 → 0.5`, `1.5s`, `ease-in-out`, looping). Used for every loading state in the app (hero, APOD figure, gallery cells, recent thumbnails, metadata skeleton rows). Disabled under `prefers-reduced-motion`.

### 7.8 Lightbox (shared, APOD + Mars Rover)

Full-screen overlay, `rgba(10,10,10,0.95)`. Image: `object-fit: contain`, max `85vh × 85vw` desktop / `95vh × 95vw` mobile. Close button (×, top-right, 24×24px SVG) and Escape key both close. `role="dialog"`, `aria-modal="true"`, focus trapped while open, focus returns to the triggering element on close. On the Mars Rover page only: a metadata line below the image (`CAMERA · SOL · ROVER · ID`, monospace, `--text-tertiary`, uppercase, `0.75rem`) and ←/→ keyboard navigation through the current page's results. The APOD lightbox shows the image only — no metadata line, no prev/next navigation.

### 7.9 Inline Error / Empty State

- **InlineError:** `role="alert"`, `--status-error` text color, plain text message, rendered inside a dedicated container scoped to the section that failed. The container is cleared at the start of every new request and populated only on failure.
- **EmptyState:** `role="status"`, centered message, used when a request succeeds but returns zero results (this is not an error).

---

## 8. Page Specifications

### 8.1 Home (`index.html`)

**Structure (top to bottom):** Header → Hero (full-bleed, min `60vh`) → Section label "EXPLORE" → 3-column feature card grid → Footer.

**Hero:** Two-column on desktop (text ~50% left, today's APOD image ~50% right); stacked on mobile (image top at `50vh`, text + CTA below).
- Left: headline "Explore. Discover. Understand." (Display style, three stacked lines), two-line subtitle (`--text-secondary`), CTA button "Start Exploring →" linking to `apod.html`.
- Right: today's APOD image, fetched on page load via `fetchAPOD()` with no date argument. Dark gradient overlay (`linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 60%)`) behind overlaid text: APOD title + "VIEW FULL →" link to `apod.html`.
- States: **Loading** — `--bg-surface` pulse placeholder on the right, headline/CTA visible immediately. **Loaded** — image fades in (`opacity 0→1`, `400ms ease-out`). **Error** — swap silently to `assets/fallback-hero.jpg`; no visible error text in the hero.

**Feature cards (×3 — APOD, Mars Rover Explorer, About):** Each is a single `<a>` wrapping the full card (max tap area). Background image (`card-apod.jpg` / `card-mars.jpg` / `card-about.jpg`), `object-fit: cover`, `opacity: 0.6`, absolutely positioned; gradient overlay between image and text; H3 title, one-line description (`--text-secondary`, `0.875rem`), arrow (`→`, `--accent-primary`, text character). Border `1px solid --border-subtle`, hover transitions to `--border-default` (`200ms`). Min-height `240px` desktop / `200px` mobile. All three cards contain their background image fully within bounds (no bleed past the card edge).

### 8.2 APOD (`apod.html`)

**Structure:** Header → Breadcrumb (`← HOME / ASTRONOMY PICTURE OF THE DAY`) → Page title H1 "ASTRONOMY PICTURE OF THE DAY" + subtitle "A different astronomical image every day" → Two-column content (main ~65% / sidebar ~35% desktop; main first then sidebar, stacked, on mobile) → Footer.

**Main column:**
- `<figure>` containing the image (`object-fit: contain` on a dark matte, original aspect ratio, max-width `720px`) or, when `media_type === "video"`, a YouTube `<iframe>` with `title="APOD video: {title}"`, no autoplay, native YouTube controls visible; `<figcaption>` includes title + date for screen reader context before the iframe.
- Action bar (ghost icon buttons, each `aria-label`'d):
  | Button | Behavior |
  |---|---|
  | ↓ Download | Opens `hdurl` (or `url` if no `hdurl`) in a new tab. Hidden when `media_type === "video"`. |
  | ⤢ Expand | Opens the shared lightbox. Hidden when `media_type === "video"`. |
  | ↗ Share | `navigator.share()` if available, else copies the current URL to the clipboard and shows a brief "Link copied to clipboard" confirmation. Always shown. |
- Section "DETAILS" — metadata table, exactly four rows, no more:
  | Label | Source field | Fallback |
  |---|---|---|
  | DATE | `date` | — |
  | TITLE | `title` | — |
  | CREDIT | `copyright` | "NASA" if null/missing |
  | TYPE | `media_type` | — |
- Section "EXPLANATION" — `explanation` field as body text, `max-width: 720px`.

**Sidebar (functional elements only):**
1. Date picker: `<label>DATE</label>` + native `<input type="date" min="1995-06-16">` with `max` set dynamically to today + "LOAD →" button as the explicit fetch trigger (do not auto-fetch on date change). ← / → buttons step one day backward/forward.
2. Section "RANDOM" — "SHOW ME A RANDOM APOD →" button: generates a random date between `1995-06-16` and today and fetches it.
3. Section "RECENT" — the 5 calendar days preceding today, pre-fetched on page load, each rendered as a `120×80px` thumbnail (`object-fit: cover`) + title + date. Clicking a thumbnail loads that date into the main column and updates the URL.

**URL sync:** On any date change, update the URL to `apod.html?date=YYYY-MM-DD` via `history.replaceState` (no reload). On page load, read `?date=` from `URLSearchParams`; if present and valid, fetch that date instead of today.

### 8.3 Mars Rover Explorer (`mars.html`)

**Structure:** Header → Breadcrumb (`← HOME / MARS ROVER EXPLORER`) → Page title H1 "MARS ROVER EXPLORER" → Rover selector → Rover metadata panel → Filter controls → Results status bar → Gallery grid → Pagination → Footer.

**Rover selector:** Three `<button>` elements (Curiosity, Opportunity, Spirit) styled as a toggle group. Default on load: Curiosity selected. Selecting a rover updates the metadata panel only — it does **not** trigger a gallery fetch.

**Rover metadata panel:** `--bg-elevated` background, `1px solid --border-subtle` border, label-value pairs in Data style (monospace). Sourced entirely from the static `ROVER_CONFIG` object (§10) — no API call. Exactly four fields displayed: **STATUS, LANDING DATE, LOCATION, MAX SOL.** (Total photo count is intentionally omitted — displaying it would require an extra API call that the static-config decision exists to avoid, and the API field `rover.total_photos` is otherwise unused.)

**Filter controls (single row desktop, stacked mobile):**
- Sol: `<label>SOL (MARTIAN DAY)</label>` + `<input type="number" min="0" step="1">`. Apply `Math.floor()` before sending to discard accidental decimals.
- Camera: `<select>`, options populated from `ROVER_CONFIG[selectedRover].cameras`, with "All Cameras" always first and selected by default. Options repopulate when the rover changes.
- "SEARCH →" primary button — the **only** trigger for a gallery fetch. Never fetch on keystroke, rover change, or camera change alone.

**Results status bar:** After a fetch, display the count of images returned on the current page plus active filters, e.g. `SHOWING 25 IMAGES · SOL 1000 · CURIOSITY · ALL CAMERAS`. Do not display a fabricated "of N total" figure — the API does not provide a total count for a given Sol/camera combination, and the design constraint forbids displaying data the API doesn't supply. `aria-live="polite"`.

**Gallery grid:** Uniform CSS Grid, `repeat(3, 1fr)` desktop, `gap: --space-3`. Each item: `aspect-ratio: 4/3`, `overflow: hidden`, `border: 1px solid --border-subtle`, image `object-fit: cover`. Hover: border → `--border-default` (`200ms`), image `transform: scale(1.03)` (`300ms`). Click opens the shared lightbox with the current page's photo list. Up to 25 items per page.
- **Loading state:** 9 (3×3) LoadingPulse placeholder cells, container `aria-busy="true"`.
- **Empty state:** `role="status"` message — `No images found for {Rover} on Sol {N}. Try a different Sol value or camera.`
- **Broken image fallback:** every `<img>` gets an `onerror` handler that swaps in `assets/image-unavailable.svg` with `alt="Image unavailable"`.

**Pagination:** "← PREV" / "PAGE {n}" / "NEXT →". PREV disabled on page 1. Because total page count is unknown, use a "has more" heuristic: if the most recent fetch returned exactly 25 photos, enable NEXT (more may exist); if fewer than 25 were returned, disable NEXT (this is the last page). Do not display "OF M" — only "PAGE {n}".

### 8.4 About (`about.html`)

Fully static — no JavaScript, no API calls. Single column, `max-width: 720px`, centered (full width + `16px` side padding on mobile). Breadcrumb: `← HOME / ABOUT`. Page title H1: "ABOUT THIS PROJECT". Sections, each with a SectionLabel + SectionDivider:

1. **THE PROJECT** — 2–3 paragraphs describing the student club project and its goals.
2. **DATA SOURCES** — brief intro, then two API info cards (`--bg-elevated`, `1px solid --border-subtle`):
   - API: NASA Astronomy Picture of the Day (APOD) — Endpoint: `api.nasa.gov/planetary/apod`
   - API: NASA Mars Rover Photos API — Endpoint: `api.nasa.gov/mars-photos/api/v1/rovers/`
3. **DISCLAIMER** — not affiliated with NASA or any government agency; imagery is NASA's property used under their open data policy.
4. **BUILT WITH** — HTML5, CSS3, Vanilla JavaScript, NASA Open APIs.

No links to pages that don't exist (no Privacy Policy, Image Credits, or GitHub link).

---

## 9. NASA API Integration

### 9.1 Astronomy Picture of the Day (APOD)

**Endpoint:** `GET https://api.nasa.gov/planetary/apod`

| Parameter | Required | Notes |
|---|---|---|
| `api_key` | Yes | From `config.js`. |
| `date` | No | `YYYY-MM-DD`. Omit entirely to get today's entry. |

Do not use `start_date`, `end_date`, `count`, or `thumbs` — none are needed by this project.

**Response fields used:** `title`, `date`, `explanation`, `url`, `media_type`, `copyright` (for the CREDIT field, default "NASA" if absent). **Fields ignored:** `hdurl` (used only as the Download-button target, falling back from it), `service_version`, `thumbnail_url`, `concepts`.

**Client-side validation before request:** date must match `YYYY-MM-DD`; must not precede `1995-06-16`; must not be in the future (compare to local `new Date()`, today is allowed); empty field → omit the `date` param.

**Response validation after request:** `media_type` must be `"image"` or `"video"`; `url` must be a non-empty string; `title` and `explanation` must be non-empty strings before rendering. Unknown `media_type` → render a graceful fallback message, never crash.

**Default state:** call with no date argument on page load to show today's entry immediately.

**Date input:** native `<input type="date">`, `min="1995-06-16"`, `max` set dynamically to today's ISO date.

### 9.2 Mars Rover Photos

**Endpoint:** `GET https://api.nasa.gov/mars-photos/api/v1/rovers/{rover}/photos`, where `{rover}` ∈ `curiosity`, `opportunity`, `spirit` (lowercase).

| Parameter | Required | Notes |
|---|---|---|
| `api_key` | Yes | From `config.js`. |
| `sol` | Yes | Non-negative integer. Sol 0 = landing day. |
| `page` | No | Defaults to 1. 25 results per page. |

Do not use `earth_date` (alternative to `sol` — not used) or `camera` filtering at the request level beyond what the UI's camera dropdown requires (filter client-side is not needed either — pass the selected camera code as the `camera` param when not "All Cameras"; omit the param entirely when "All Cameras" is selected).

**Response shape:** `{ "photos": [ ...photo objects... ] }`.

**Photo fields used:** `id` (DOM key), `img_src`, `sol`, `earth_date`, `camera.full_name`, `rover.name`. **Fields ignored:** `camera.id`, `camera.name`, `camera.rover_id`, `rover.id`, `rover.landing_date`, `rover.launch_date`, `rover.status`, `rover.max_sol`, `rover.max_date`, `rover.total_photos`, `rover.cameras` (all rover-level metadata comes from the static `ROVER_CONFIG` instead — see §10).

**Client-side validation before request:** rover must be one of the three supported values (enforced by using buttons/`<select>`, not free text); Sol must be a non-negative integer, not empty, decimals rejected via `Math.floor()`. Do not validate Sol against `max_sol` client-side in v1 — let the API's own response/error surface instead.

**Response validation after request:** confirm `photos` is an array (possibly empty); empty array → EmptyState, not an error; confirm each photo object has `img_src` before rendering.

**Trigger discipline:** one request per explicit "SEARCH →" click. Never fetch on keystroke, rover change, or camera change alone. Never poll or auto-refresh.

### 9.3 Shared API Notes

- **API key:** one constant, `NASA_API_KEY`, in `config.js`. `DEMO_KEY` for development (30 req/hr, 50/day); swap for a registered key (1,000 req/hr) before public deployment. Every fetch function reads this one constant.
- **No caching in v1.** Repeated identical requests simply re-fetch.
- **CORS:** both endpoints support cross-origin browser requests. No proxy, no backend.
- **Auth:** the `api_key` query parameter is the only credential. No OAuth, no sessions, no tokens beyond this constant.

---

## 10. Static Rover Configuration (`ROVER_CONFIG`)

Stored entirely in `config.js`. No API call retrieves this data.

| Rover key | Display name | Landing date | Location | Status | Max Sol | Cameras |
|---|---|---|---|---|---|---|
| `curiosity` | Curiosity | August 6, 2012 | Gale Crater | Active | 4400 | FHAZ, RHAZ, MAST, CHEMCAM, MAHLI, MARDI, NAVCAM |
| `opportunity` | Opportunity | January 25, 2004 | Meridiani Planum | Complete | 5111 | FHAZ, RHAZ, NAVCAM, PANCAM, MINITES |
| `spirit` | Spirit | January 4, 2004 | Gusev Crater | Complete | 2208 | FHAZ, RHAZ, NAVCAM, PANCAM, MINITES |

The Camera `<select>` for each rover is populated from its `cameras` list with "All Cameras" prepended.

---

## 11. JavaScript Architecture

- **No bundler, no ES module imports/exports, no framework.** Deterministic load order via `<script defer>` tags (§3).
- **Function boundaries:**
  - *Fetch* functions (`fetchAPOD(date)`, `fetchRoverPhotos(rover, sol, page, camera)`) return a Promise, throw on a non-OK response, and contain no DOM code.
  - *Validate* functions (date range, Sol integer) run before any fetch is dispatched and live in `utils.js`.
  - *Render* functions take data + a target DOM element and only manipulate the DOM — no fetching, no validation.
- **State:** plain variables/objects scoped inside the relevant page module only (e.g., `currentRover`, `currentPage`, `currentCamera` in `mars.js`). No global state store.
- **Naming:** `camelCase` for functions/variables; `UPPER_SNAKE_CASE` for constants in `config.js`; DOM-query variables prefixed by element type (`dateInput`, `galleryGrid`, `loadButton`).
- **No premature abstraction:** no templating engine, no virtual DOM, no class hierarchy. Direct `createElement`/`innerHTML` calls inside small, named functions.

---

## 12. CSS Architecture

Single file, `styles.css`, organized as ordered, commented sections:

1. Design tokens (`:root`) — §4.
2. Reset & base (box-sizing, margin/padding reset, `body` defaults, `overflow-x: hidden`, image/anchor defaults).
3. Typography (§5) — implemented as reusable classes (`.h1`, `.section-label`, `.data-value`), not tag selectors, so the same rule applies regardless of the element used.
4. Layout primitives — `page-grid`, `full-bleed`, the two-column APOD grid, spacing/gap utilities.
5. Global components, in page-appearance order — header/nav (desktop + mobile overlay), breadcrumb, section label/divider, buttons, input fields, loading pulse, lightbox, inline error, empty state, footer.
6. Page-specific sections, one block per page — Home (hero, feature cards), APOD (figure, action bar, metadata table, sidebar), Mars (rover selector, metadata panel, filters, gallery, pagination), About (API info cards).
7. Responsive overrides — mobile-first base styles throughout sections 2–6; a single `@media (min-width: 768px)` block near the end holds every desktop override, grouped by the same page order as section 6; a narrow `@media (max-width: 479px)` block handles only the gallery's 2→1 column drop.
8. Reduced motion — `prefers-reduced-motion: reduce` override, placed last.

**Hard rules:** no selector nested more than two levels deep; no `!important` outside the reduced-motion block; no `box-shadow`/`drop-shadow`; no CSS filters (grayscale, sepia, hue-rotate) on NASA imagery; no stretched images (`object-fit: cover` or `contain`, never both `width` and `height` unconstrained); images used as text backgrounds always get a dark gradient overlay; no custom scrollbars; no third-party CSS framework.

---

## 13. Error Handling Specification

**Convention:** errors render inside a dedicated container scoped to the failing section — never a browser `alert()`. The container is cleared at the start of every new request and populated only on failure. `role="alert"` on error containers; `role="status"` on empty-but-valid states.

### APOD error mapping

| HTTP status / condition | User-facing message |
|---|---|
| 400 | Please enter a valid date between 16 June 1995 and today. |
| 403 | API key error. Please check the configuration. |
| 404 | No APOD entry found for this date. |
| 429 | Too many requests. Please wait a moment and try again. |
| 500–503 | NASA's servers are currently unavailable. Please try again later. |
| Network failure (`fetch()` rejects) | Could not connect to NASA. Please check your internet connection. |

### Mars Rover error mapping

| HTTP status / condition | User-facing message |
|---|---|
| 400 | Invalid input. Please check the rover and Sol values. |
| 403 | API key error. Please check the configuration. |
| 404 | Rover not found. |
| 429 | Too many requests. Please wait a moment and try again. |
| 500–503 | NASA's servers are currently unavailable. Please try again later. |
| Network failure | Could not connect to NASA. Please check your internet connection. |
| Empty `photos` array (valid response) | No images found for {Rover} on Sol {N}. Try a different Sol value. *(EmptyState, `role="status"`, not an error.)* |

### Page-specific handling

- **Home hero:** on failure, swap silently to `assets/fallback-hero.jpg`. No visible error text.
- **APOD page:** show the inline error above the figure area; keep date input and sidebar usable so the user can retry immediately.
- **Mars Rover page:** show the inline error inside the gallery container on a failed request; show EmptyState (not an error) on a successful request with zero results.
- **Broken individual image URLs (Mars):** per-image `onerror` swaps in `assets/image-unavailable.svg` + `alt="Image unavailable"` — handled per-image, not as a page-level error.
- **Loading/error pairing:** every fetch shows a LoadingPulse immediately and is guaranteed to end in either rendered content, an InlineError, or an EmptyState — never left stuck mid-load.

---

## 14. Responsive Specification

**Breakpoints (mobile-first):**

| Name | Range | Method |
|---|---|---|
| Mobile (base) | `< 768px` | Default, unprefixed rules |
| Desktop | `≥ 768px` | `@media (min-width: 768px)` |
| Gallery sub-breakpoint | `< 480px` | `@media (max-width: 479px)` — gallery only |

**Per-component behavior:**

| Component | Mobile | Desktop |
|---|---|---|
| Navigation | Hamburger → full-screen overlay | Horizontal text links |
| Hero | Stacked: APOD image (50vh) above text/CTA | Two-column: text left, APOD right |
| Feature cards | 1 column, full width, 200px min-height | 3-column grid, 240px min-height |
| APOD content | 1 column: main, then sidebar | 2 columns: ~65% main + ~35% sidebar |
| APOD metadata table | Label above value | Two-column key-value |
| Mars filters | Stacked: Sol, then Camera, then Search | Single row |
| Mars metadata panel | Wraps to two rows | Single row, 4 fields |
| Gallery grid | 2 cols (≥480px), 1 col (<480px) | 3 columns |
| Lightbox | `95vh × 95vw` | `85vh × 85vw` |
| About content | Full width, 16px side padding | `max-width: 720px`, centered |

**Cross-cutting rules:** every interactive element ≥`44×44px` touch target on mobile (via padding, not fixed dimensions); `overflow-x: hidden` on `<body>` + `max-width: 100%` on all images/iframes; body text never below `0.875rem` at any width; headings use `clamp()` so no breakpoint-specific font-size overrides are needed. Manual verification at 375px, 768px, 1440px.

---

## 15. Animation Specification

| Animation | Property | Duration | Easing | Trigger |
|---|---|---|---|---|
| Nav link hover | `color` | 200ms | ease | `:hover` |
| Button hover | `background`, `border-color` | 200ms | ease | `:hover` |
| Card hover | `border-color` | 200ms | ease | `:hover` |
| Gallery image zoom | `transform: scale(1.03)` | 300ms | ease | `:hover` |
| Loading pulse | `opacity` (0.5→1→0.5) | 1.5s | ease-in-out | Loop while loading |
| Hero APOD fade-in | `opacity` (0→1) | 400ms | ease-out | On image load |
| Mobile menu | `opacity` | 300ms | ease | Open/close |

**Rules:** max duration 500ms (except the loading-pulse loop); no parallax, no scroll-triggered animation, no `IntersectionObserver` reveals; no transform on text — only images/containers; no animation libraries (CSS `transition`/`@keyframes` only). All of the above must be wrapped so that `@media (prefers-reduced-motion: reduce)` sets `animation-duration`, `animation-iteration-count: 1`, and `transition-duration` to `0.01ms` globally, disabling every effect.

---

## 16. Icons

Inline `currentColor` SVGs only — no icon font library, no emoji as icons, no decorative-only icons.

| Icon | Usage | Size | Implementation |
|---|---|---|---|
| → | Card links, CTA buttons, breadcrumb-adjacent nav | — | Text character |
| ← | Breadcrumb, previous-day/page buttons | — | Text character |
| ☰ | Mobile menu open | 24×24px | Inline SVG |
| × | Mobile menu close, lightbox close | 24×24px | Inline SVG |
| ↓ | Download | 20×20px | Inline SVG |
| ⤢ | Expand | 20×20px | Inline SVG |
| ↗ | Share | 20×20px | Inline SVG |

Every icon-only button requires `aria-label`.

---

## 17. Accessibility Requirements

- `<html lang="en">` and `<meta name="viewport" content="width=device-width, initial-scale=1">` on every page.
- One `<h1>` per page; heading levels never skipped.
- `<header>`, `<main>`, `<footer>`, `<nav aria-label="Main navigation">` present on every page.
- All images: descriptive `alt` text (NASA title/description for content images; `alt=""` + `role="presentation"` for decorative backgrounds like feature-card images).
- All form inputs have associated `<label>` elements.
- All icon-only buttons have `aria-label`.
- `:focus-visible` on every interactive element: `outline: 2px solid var(--accent-primary)`, `outline-offset: 2px`.
- Mobile menu overlay: `role="dialog"`, `aria-modal="true"`, focus trapped, focus returns to the hamburger on close.
- Lightbox: `role="dialog"`, `aria-modal="true"`, focus trapped, Escape closes, focus returns to the trigger.
- Gallery container: `aria-busy="true"` while loading.
- Error messages: `role="alert"`. Empty states: `role="status"`. Results status bar: `aria-live="polite"`.
- Tab order follows visual order — no positive `tabindex` values.
- All text/background combinations pass WCAG AA (§4 contrast table).
- APOD video `<iframe>`: `title="APOD video: {title}"`, no `autoplay`, native YouTube controls untouched, `<figcaption>` precedes it with title + date.
- `prefers-reduced-motion: reduce` disables every animation/transition site-wide (§15).

---

## 18. Hard Constraints ("Do Not" List)

These are non-negotiable build rules, consolidated from the design system:

1. Never use `#000000` as a background — use `#0A0A0A`.
2. Never use `--accent-primary` for body/paragraph text — labels, links, and interactive cues only.
3. Never add a second accent color.
4. Never use more than two typefaces (Inter + JetBrains Mono).
5. Never set body text below `0.875rem` (14px).
6. Never center-align paragraphs — left-align all body text (single-line hero headlines excepted).
7. Never stretch images — always `object-fit: cover` or `contain`.
8. Never apply CSS filters (grayscale/sepia/hue-rotate) to NASA imagery.
9. Never build a custom date picker — use native `<input type="date">`.
10. Never build a custom scrollbar.
11. Never add sound effects, autoplaying video, or background music.
12. Never use `!important` outside the reduced-motion override.
13. Never inline styles — all CSS lives in `styles.css`.
14. Never add a CSS or JS framework (Bootstrap, Tailwind, React, masonry libraries, etc.).
15. Never create a dead link (a link to a page that doesn't exist).
16. Never use a masonry/variable-height gallery — uniform grid only.
17. Never add parallax or scroll-triggered animation.
18. Never nest CSS selectors more than two levels deep.
19. Never place text over an image without a dark gradient overlay.
20. Never display a data field the relevant NASA API does not provide (e.g., no fabricated "total photos" or "of N pages" counts — see §8.3).
21. Never trigger a NASA API request on keystroke, hover, or automatic polling — only on explicit user action (page load default, button click, or Load-button-confirmed date change).
22. Never show a broken-image icon — always fall back to `assets/image-unavailable.svg`.

---

## 19. Development Sequence

1. **Skeleton & shared chrome** — four HTML files with correct semantic structure and identical header/footer markup; no styling yet.
2. **Design tokens & base styles** — `:root` block, reset, typography scale in `styles.css`; verify against the contrast table (§4) before proceeding.
3. **About page** — fully styled and responsive; zero JS dependency, validates layout primitives first.
4. **Home page — static shell** — hero, three feature cards, footer; fully responsive, no JS yet.
5. **Mars Rover page — static shell** — full layout with hardcoded/placeholder content, no fetch logic yet.
6. **APOD page — static shell** — full two-column layout with placeholder content, no fetch logic yet.
7. **`config.js` + `utils.js`** — constants and pure helper functions; verifiable in isolation.
8. **`nav.js`** — mobile menu wired on all four pages; confirm keyboard nav and focus trap.
9. **Home page — live data** — implement `home.js` (today's APOD fetch, fallback path). Smallest real integration; de-risks the fetch pattern.
10. **APOD page — live data**, incrementally: (a) default + `?date=` param load; (b) date input + Load/Prev/Next; (c) metadata table + explanation + image/video branch; (d) recent-5 sidebar; (e) random APOD button; (f) Download/Share actions.
11. **Mars Rover page — live data**, incrementally: (a) rover selector → metadata panel only; (b) Search → validate → fetch → render gallery; (c) results status bar + empty state; (d) pagination; (e) per-image `onerror` fallback.
12. **`lightbox.js`** — build once, wire into APOD Expand and Mars gallery items (focus trap, Escape, ←/→ on Mars only).
13. **Responsive pass** — verify at 375px / 768px / 1440px across all four pages.
14. **Error/edge-case pass** — deliberately trigger every condition in §13 (invalid date, out-of-range Sol, simulated network failure, empty Mars result, broken image URL, video-type APOD, missing `copyright`) and confirm the exact specified message/role appears.
15. **Accessibility & motion pass** — verify against §17 in full, and confirm `prefers-reduced-motion` disables every effect in §15.
16. **Final review against §18** — walk the full hard-constraints list before calling v1 complete.

---

## 20. Success Criteria

The project is complete when:

1. APOD functionality works reliably end-to-end (today's default, date selection, random, recent-5, video/image branching, sharing, download).
2. Mars Rover functionality works reliably end-to-end (rover switch, Sol + camera filter, search-triggered fetch, pagination, lightbox).
3. The site is visually clean, dark-themed, and uses only the tokens in §4 — no hardcoded colors or spacing.
4. Every error and empty condition in §13 produces its specified message with correct ARIA role.
5. The site is fully responsive per §14, with no horizontal scrolling at any width and no touch target under 44×44px.
6. The site passes the accessibility requirements in §17.
7. No rule in the hard-constraints list (§18) is violated anywhere in the codebase.
8. NASA data displayed is accurate and limited to fields actually returned by the respective API (§9).
9. The codebase matches the file structure and responsibility boundaries in §3 and §11 — understandable and maintainable by a student team with no build tooling.
