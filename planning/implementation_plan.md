# NASA Space Explorer — Implementation Plan

**Based on:** `project_specification.md` (v2.0), `api_contracts.md`, `design_specification.md`, `final_visual_specification.md`, `website_blueprint.md`

---

## 0. Architectural Decision (Resolving a Spec Conflict)

`project_specification.md` lists FastAPI as the "preferred" backend technology. However, `api_contracts.md` and `final_visual_specification.md` — the two most implementation-detailed and most recent documents — explicitly state the project requires **no backend**: NASA's APOD and Mars Rover Photos endpoints support CORS, so the browser can call `https://api.nasa.gov` directly via `fetch()`. A backend would only add a proxy layer with no functional benefit, which directly contradicts the specification's own mandate to "avoid unnecessary complexity" and "avoid unnecessary abstraction."

**Decision:** Build this as a static frontend-only application (HTML5 + CSS3 + vanilla JavaScript). No server, no build step, no `package.json`, no `node_modules`. If a backend is later required (e.g., to hide an API key in a public deployment), it can be added as a thin FastAPI proxy without changing any frontend code, since all NASA calls are isolated behind two functions in `config.js`/page modules.

---

## 1. Folder Structure

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

Flat structure by design. Four pages at the root (no routing, no nested directories — matches the blueprint's flat sitemap). One CSS file. Seven small JS files, each with a single responsibility. Five static images, all bundled locally so the site degrades gracefully if NASA's API is unreachable.

---

## 2. File Structure & Purpose of Every File

### HTML

| File | Purpose |
|---|---|
| `index.html` | Home page: sticky header, hero (headline + dynamic APOD preview), three feature cards, footer. |
| `apod.html` | Astronomy Picture of the Day page: breadcrumb, page title, two-column layout (image/metadata/explanation + sidebar with date controls, random button, recent thumbnails). |
| `mars.html` | Mars Rover Explorer page: breadcrumb, page title, rover selector, metadata panel, filter controls, results status bar, gallery grid, pagination. |
| `about.html` | Fully static page: project description, data sources, disclaimer, tech stack. No script tags beyond `nav.js`. |

Each HTML file includes the same `<head>` (Google Fonts preconnect + stylesheet link, viewport meta, favicon, `<title>` per page) and the same `<header>`/`<footer>` markup, differing only in the active nav link and page content. `<script>` tags are placed at the end of `<body>` with `defer`, in a fixed load order (see §5).

### CSS

| File | Purpose |
|---|---|
| `css/styles.css` | The entire visual system in one file: design tokens, reset, typography, layout primitives, all global and page-specific components, responsive overrides, and the reduced-motion override. See §4 for internal organization. |

A single stylesheet is intentional — the design specification calls for "one CSS file" and explicitly warns against frameworks or a build step. Splitting into multiple files would add import complexity with no benefit at this scale (~30 components total).

### JavaScript

| File | Purpose |
|---|---|
| `js/config.js` | Single source of truth for constants: `NASA_API_KEY`, NASA endpoint base URLs, the `ROVER_CONFIG` static object (per-rover name, landing date, location, status, max sol, camera list), and the APOD valid-date floor (`1995-06-16`). Nothing in this file executes logic — constants only. |
| `js/utils.js` | Shared pure helper functions used by more than one page module: date formatting (`YYYY-MM-DD` → "May 12, 2024"), date validation against the APOD floor/today, Sol input validation, HTTP-status-to-message mapping (mirrors the table in `api_contracts.md` §1.6/§2.6), and small DOM helpers for showing/clearing an error container and toggling a loading-pulse state. Centralizing this avoids duplicating validation/error logic across `home.js`, `apod.js`, and `mars.js`. |
| `js/nav.js` | Loaded on every page. Wires up the mobile hamburger toggle, the full-screen overlay (open/close, focus trap, Escape-to-close), and marks the active nav link. Purely DOM/UI logic — no API calls. |
| `js/lightbox.js` | Shared full-screen image overlay used by both `apod.js` (Expand button) and `mars.js` (gallery item click). Exposes simple open/close functions, handles Escape-to-close, focus trapping, and optional ← / → navigation through a supplied image list (used on the Mars page). |
| `js/home.js` | Home-page-only logic: on `DOMContentLoaded`, calls the shared APOD fetch helper for today's date, renders the image/title/"VIEW FULL →" link into the hero, and swaps to `assets/fallback-hero.jpg` on failure (silently — no visible error per the blueprint). |
| `js/apod.js` | All APOD page logic: reads an optional `?date=` query parameter on load; fetches and renders the main APOD entry (image vs. video branch); wires the date input + Load/Prev/Next buttons; wires Download/Expand/Share actions; fetches and renders the five most recent days for the sidebar; wires the "Show Me" random APOD button; updates the URL via `history.replaceState` on date change. |
| `js/mars.js` | All Mars Rover page logic: rover selector (updates the metadata panel from `ROVER_CONFIG`, does not auto-fetch); Sol input + camera dropdown (camera options repopulated per rover) + Search button (the only fetch trigger); renders the gallery grid, results status bar, empty state, and pagination; opens `lightbox.js` with the current page's photo list on item click. |

### Assets

| File | Purpose |
|---|---|
| `assets/favicon.ico` | Browser tab icon. |
| `assets/fallback-hero.jpg` | Static space photograph shown in the hero if today's APOD fetch fails. Bundled locally so the homepage never shows a broken layout. |
| `assets/card-apod.jpg`, `assets/card-mars.jpg`, `assets/card-about.jpg` | Static background images for the three homepage feature cards. These are fixed illustrative images (not API-driven), since the cards represent sections of the site rather than live data. |
| `assets/image-unavailable.svg` | Placeholder swapped into any `<img>` whose `onerror` fires (broken Mars rover photo URLs, per `api_contracts.md` §2.6). |

No icon font, no third-party JS libraries, no CSS framework — consistent with the "minimal dependencies" requirement.

---

## 3. CSS Organization Strategy

Everything lives in `styles.css`, organized top-to-bottom as clearly commented sections so any student can navigate the file without a build tool or preprocessor:

1. **Design tokens (`:root`)** — every color, spacing, and font value as a CSS custom property (`--bg-primary`, `--text-secondary`, `--accent-primary`, `--space-1`…`--space-9`, `--font-body`, `--font-mono`, etc.), copied directly from the final visual specification §5.1. This section is written first and never edited once components are built — components reference tokens, never hardcoded values.
2. **Reset & base** — `box-sizing`, margin/padding reset, `body` background/color/font, `overflow-x: hidden`, base `<a>`/`<img>` defaults (`max-width: 100%`).
3. **Typography** — heading scale, body text, label style, mono-data style, all expressed as reusable classes (`.h1`, `.section-label`, `.data-value`) so the same rules apply whether the element is an `<h1>`, `<dt>`, or `<span>`.
4. **Layout primitives** — the centered `page-grid` (max `1200px`, `min(1200px, 90vw)`), the `full-bleed` escape class, the two-column content grid used by the APOD page, the spacing/gap utilities.
5. **Global components** — one subsection per shared component, in the order they appear on a typical page: header/nav (desktop + mobile overlay), breadcrumb, section label/divider, buttons (primary outline, ghost/icon), input fields, loading-pulse keyframes, lightbox overlay, inline error, empty state, footer.
6. **Page-specific sections** — one subsection per page (`/* === HOME === */`, `/* === APOD === */`, `/* === MARS === */`, `/* === ABOUT === */`), each containing only the markup patterns unique to that page (hero, feature cards; APOD metadata table, sidebar thumbnails; gallery grid, rover metadata panel, pagination; API info cards).
7. **Responsive overrides** — written mobile-first per the blueprint: base rules above target mobile by default, then a single `@media (min-width: 768px)` block near the end of the file contains every desktop override, grouped by the same page order as section 6. A second, narrow `@media (max-width: 479px)` block handles only the gallery's 2-col → 1-col drop.
8. **Reduced motion** — the `prefers-reduced-motion: reduce` override, placed last so it always wins.

**Rules enforced throughout:** no selector nested more than two levels deep; no `!important` outside the reduced-motion block; no `box-shadow`; depth communicated only via the three-tier background/border system (`--bg-primary` → `--bg-elevated` → `--bg-surface`); all spacing values pulled from the `--space-*` scale, never an arbitrary pixel value.

---

## 4. JavaScript Organization Strategy

**No bundler, no ES module imports, no framework.** Every page loads a fixed sequence of `<script defer>` tags so load order is deterministic without tooling:

1. `config.js` — constants must exist before anything else runs.
2. `utils.js` — shared helpers, depends only on `config.js`.
3. `nav.js` — runs on every page; independent of page-specific data.
4. *(APOD and Mars pages only)* `lightbox.js` — shared overlay logic, loaded before the page module that uses it.
5. The page-specific module (`home.js`, `apod.js`, or `mars.js`) — the only file that differs per page. Listens for `DOMContentLoaded` and wires up that page's interactive elements.

**Module boundaries by responsibility, not by page when shared:**
- **State** lives only where it's needed and only as plain variables/objects inside the relevant page module (e.g., `currentRover`, `currentPage` in `mars.js`). No global app-wide state store — unnecessary for four pages with no client-side routing.
- **Fetching** is isolated to one function per endpoint (`fetchAPOD(date)`, `fetchRoverPhotos(rover, sol, page, camera)`), each returning a Promise and throwing on a non-OK response. Page modules call these functions and handle the result; the functions themselves contain no DOM code, so they're trivially reusable (`home.js` and `apod.js` both call `fetchAPOD`).
- **Rendering** functions take data and a target DOM element and only manipulate the DOM — they don't fetch and they don't validate input. This separation (fetch → validate → render) keeps each function short enough that a student can read it top to bottom.
- **Validation** (date range, Sol non-negative integer) lives in `utils.js` and runs *before* a fetch is dispatched, so invalid requests never reach the network.

**Naming convention:** `camelCase` for functions/variables, `UPPER_SNAKE_CASE` for constants in `config.js`, and DOM-query variables prefixed by element type where it aids clarity (`dateInput`, `galleryGrid`, `loadButton`). No abbreviations that aren't immediately obvious.

**No premature abstraction:** the project deliberately does not introduce a templating engine, virtual DOM, or component class hierarchy. Rendering is done with direct `innerHTML`/`createElement` calls inside small, named functions — enough structure to stay readable, not so much that students need to learn a pattern beyond plain JavaScript.

---

## 5. NASA API Integration Strategy

Both endpoints are called directly from the browser; no proxy is required.

| Concern | Approach |
|---|---|
| **API key** | One constant, `NASA_API_KEY`, defined once in `config.js`. `DEMO_KEY` during development; swapped for a registered key before any public deployment. Every fetch function reads from this single constant. |
| **APOD endpoint** | `GET https://api.nasa.gov/planetary/apod` with `api_key` and an optional `date` parameter. Used by `home.js` (today, no date param), `apod.js` (selected/queried date, plus the 5 preceding days for the sidebar, plus a randomly generated date for "Show Me"). |
| **Mars Rover endpoint** | `GET https://api.nasa.gov/mars-photos/api/v1/rovers/{rover}/photos` with `api_key`, `sol`, and `page`. Used only by `mars.js`, triggered exclusively by the explicit "Search" button — never on keystroke or rover/camera change alone. |
| **Rover metadata** | Not fetched from the API at all. Stored as the static `ROVER_CONFIG` object in `config.js` (name, landing date, location, status, max sol, camera list per rover), per the blueprint's recommendation. This removes an API call and makes rover switching instant. |
| **Media-type branching** | `apod.js` inspects `media_type` on every response: `"image"` renders an `<img>`; `"video"` renders a YouTube `<iframe>` inside a `<figure>` with a descriptive `title`/`<figcaption>`, and hides the Download/Expand actions (kept: Share). Any unrecognized value renders a graceful fallback message rather than crashing. |
| **Pagination** | Mars Rover photos return 25 per page with no total count. `mars.js` treats "received exactly 25" as "Next may exist" and "received fewer than 25" as "this is the last page" — a simple heuristic that needs no extra request. |
| **Rate limits** | `DEMO_KEY` allows 30 requests/hour, 50/day — adequate for development and a low-traffic club site. No polling, no auto-refresh, no fetch-on-keystroke anywhere in the app; every fetch is tied to an explicit user action (page load, button click, or date change + Load). |
| **Caching** | None in v1, by design. Repeated identical requests simply re-fetch. This keeps the codebase free of cache-invalidation logic that wouldn't survive scope creep review. |
| **CORS / auth** | Both endpoints support CORS; the `api_key` query parameter is the only credential needed. No OAuth, no cookies, no session handling anywhere in the app. |

---

## 6. Error Handling Strategy

A single convention is used everywhere errors can occur, matching `api_contracts.md` §3 ("Shared Implementation Notes"):

- **Display location:** errors render inside a dedicated, visually distinct container scoped to the section that failed (e.g., directly above the APOD figure, or inside the gallery area) — never as a browser `alert()`. The container is cleared at the start of every new request and only repopulated on failure.
- **Markup:** every error container carries `role="alert"`; every empty-but-valid state (e.g., zero rover photos for a Sol) carries `role="status"` instead, since an empty result is not an error.
- **Message mapping:** a single lookup in `utils.js` translates HTTP status codes (and the "network failure" case where `fetch()` itself rejects) into the exact user-facing strings specified in `api_contracts.md` §1.6/§2.6 (e.g., 403 → "API key error. Please check the configuration.", 429 → "Too many requests. Please wait a moment and try again.").
- **Page-specific failure handling:**
  - *Home hero:* on APOD fetch failure, swap silently to `assets/fallback-hero.jpg` — no visible error text, per the blueprint's explicit instruction that hero failures must be silent.
  - *APOD page:* on fetch failure, show the inline error above the (now-empty) figure area; keep the date input and sidebar fully usable so the user can immediately try another date.
  - *Mars Rover page:* on fetch failure, show the inline error inside the gallery container; on a *successful* response with zero photos, show the EmptyState message ("No images found for [Rover] on Sol [N]. Try a different Sol.") instead of an error — these are deliberately different code paths with different ARIA roles.
  - *Broken image URLs* (individual Mars photos that 404): every `<img>` gets an `onerror` handler that swaps in `assets/image-unavailable.svg` and an `alt="Image unavailable"` — handled per-image, not as a page-level error.
- **Client-side validation runs before any network call:** APOD date input is constrained with native `min`/`max` attributes plus a JS check against the 1995-06-16 floor; Sol input is constrained to non-negative integers via `<input type="number" min="0" step="1">` plus `Math.floor()` before the request is sent. Out-of-range Sol values are *not* validated against each rover's `max_sol` client-side in v1 — the API's own error response is surfaced instead, per `api_contracts.md` §2.5.
- **Loading states are paired 1:1 with error states:** every fetch shows a LoadingPulse placeholder immediately and is guaranteed to either replace it with content or replace it with an error/empty message — never leave the UI stuck mid-load.

---

## 7. Responsive Design Strategy

Mobile-first authoring with exactly two breakpoints, per the design and blueprint documents:

| Breakpoint | Range | Method |
|---|---|---|
| Mobile (base) | `< 768px` | Default, unprefixed rules |
| Desktop | `≥ 768px` | `@media (min-width: 768px)` |
| Gallery sub-breakpoint | `< 480px` | `@media (max-width: 479px)` — gallery only, 2 → 1 columns |

**Per-component behavior:**

| Component | Mobile | Desktop |
|---|---|---|
| Navigation | Hamburger → full-screen overlay, links centered, ≥48px tap height | Horizontal text links, right-aligned |
| Hero | Stacked: APOD image (50vh) above text/CTA | Two-column: text left, APOD right |
| Feature cards | Single column, full width, 200px min-height | 3-column grid, 240px min-height |
| APOD content | Single column: main content, then sidebar | Two-column: ~65% main + ~35% sidebar |
| APOD metadata table | Label above value | Two-column key-value |
| Mars filters | Stacked vertically (Sol, then Camera, then Search) | Single row |
| Mars metadata panel | Wraps to two rows | Single row, 5 points |
| Gallery grid | 2 columns (≥480px), 1 column (<480px) | 3 columns |
| Lightbox | `95vh × 95vw` | `85vh × 85vw` |
| About content | Full width, 16px side padding | `max-width: 720px`, centered |

**Cross-cutting rules:** every interactive element has a minimum 44×44px touch target on mobile (enforced via padding, not fixed width/height); `overflow-x: hidden` on `<body>` plus `max-width: 100%` on every image/iframe guarantees horizontal scrolling never occurs; body text never drops below `0.875rem` (14px) at any breakpoint; headings use `clamp()` for fluid sizing so no breakpoint-specific font-size overrides are needed for `<h1>`/the hero headline. Manual verification targets: 375px (iPhone SE), 768px (iPad), 1440px (laptop).

---

## 8. Development Sequence

A sequence chosen to front-load the lowest-risk, highest-leverage work and defer API integration until the visual system is proven:

1. **Skeleton & shared chrome** — create the four HTML files with correct semantic structure (`<header>`, `<nav aria-label="Main navigation">`, `<main>`, `<footer>`), shared head boilerplate (viewport meta, font links, favicon), and identical header/footer markup across all pages. No styling yet.
2. **Design tokens & base styles** — write the `:root` token block, reset, and typography scale in `styles.css`. Verify every token against the contrast table before moving on (this is the cheapest point to catch a contrast failure).
3. **About page (static, zero JS)** — build it fully styled, content-complete, and responsive. It's the simplest page and validates the layout-primitive classes (`page-grid`, `max-width: 720px` content column, API info cards) with no API dependency in the loop.
4. **Home page — static shell** — hero (headline, subtitle, CTA), three feature cards (static background images), footer. Fully responsive before any JavaScript is added.
5. **Mars Rover page — static shell** — breadcrumb, title, rover selector (non-functional buttons), metadata panel (hardcoded values), filter controls, an empty gallery grid, pagination bar — all laid out and styled, not yet wired to data.
6. **APOD page — static shell** — same approach: lay out the two-column structure, metadata table, sidebar controls, and thumbnail placeholders with placeholder/dummy content first.
7. **Shared JS foundation** — `config.js` (API key + `ROVER_CONFIG`) and `utils.js` (validation, error-message mapping, DOM helpers). No UI changes yet; these are pure functions, easy to verify in isolation.
8. **`nav.js`** — wire the mobile hamburger/overlay on all four pages; confirm keyboard navigation and focus trapping before adding any data-driven complexity elsewhere.
9. **Home page — live data** — implement `home.js`: fetch today's APOD, render into the hero, wire the fallback-on-error path. This is the smallest possible "real" API integration and de-risks the fetch pattern before the more complex pages.
10. **APOD page — live data** — implement `apod.js` incrementally: (a) load today's APOD by default and handle the `?date=` query parameter; (b) wire the date input + Load/Prev/Next; (c) add the metadata table and explanation rendering, including the image/video branch; (d) add the recent-thumbnails sidebar (5 extra fetches); (e) add the random APOD button; (f) wire Download/Share actions.
11. **Mars Rover page — live data** — implement `mars.js` incrementally: (a) rover selector updates the metadata panel from `ROVER_CONFIG` only; (b) Search button performs validation + fetch + render into the gallery; (c) results status bar and empty state; (d) pagination; (e) per-image `onerror` fallback.
12. **`lightbox.js`** — build once, wire into both the APOD Expand button and Mars gallery items, including focus trapping, Escape-to-close, and ← / → navigation on the Mars page.
13. **Responsive pass** — go page by page at 375px / 768px / 1440px, fixing any breakpoint-specific issues found in steps 3–12 rather than assuming earlier work was already correct at every width.
14. **Error/edge-case pass** — deliberately trigger every failure path called out in §6 (invalid date, out-of-range Sol, simulated network failure, empty Mars result, broken image URL, video-type APOD, missing `copyright`) and confirm each produces the specified message and ARIA role.
15. **Accessibility & motion pass** — verify against the accessibility checklist (heading order, alt text, label associations, focus-visible states, `aria-live`/`role` usage, focus trapping in both overlays) and confirm `prefers-reduced-motion` disables every transition/animation in the app.
16. **Final review against "Design Mistakes to Avoid"** — a last pass through both spec documents' mistake lists (pure black background, second accent color, custom date picker, masonry layout, box-shadow, dead links, etc.) before calling v1 complete.
