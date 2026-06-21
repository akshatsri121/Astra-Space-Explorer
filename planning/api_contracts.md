# NASA Space Explorer — API Contracts

**Document version:** 1.0  
**Project version:** 2.0  
**Stack:** HTML · CSS · Vanilla JavaScript (no backend)  
**NASA API base URL:** `https://api.nasa.gov`

> All requests are made directly from the browser. The NASA demo key
> (`DEMO_KEY`) is sufficient for development and light use. A registered
> free API key is recommended for any public deployment.

---

## 1. Astronomy Picture of the Day (APOD)

### 1.1 Endpoint

```
GET https://api.nasa.gov/planetary/apod
```

### 1.2 Purpose

Retrieve a single APOD entry — either today's or a specific past date — and
display its image (or video), title, date, and NASA's explanation to the user.

---

### 1.3 Parameters

#### Required

| Parameter | Type   | Description                                       |
|-----------|--------|---------------------------------------------------|
| `api_key` | string | NASA API key. Use `DEMO_KEY` during development.  |

#### Optional (used by this project)

| Parameter | Type   | Format       | Description                                      |
|-----------|--------|--------------|--------------------------------------------------|
| `date`    | string | `YYYY-MM-DD` | The date of the APOD entry to retrieve. Omitting this parameter returns today's entry. |

#### Optional (not used by this project)

| Parameter    | Notes                                                                 |
|--------------|-----------------------------------------------------------------------|
| `start_date` | Range queries return arrays; the project only displays one entry at a time. Do not use. |
| `end_date`   | Same as above. Do not use.                                            |
| `count`      | Returns random entries. Not aligned with the project's date-selection flow. Do not use. |
| `thumbs`     | Returns a video thumbnail URL. Ignore — video handling is addressed below. |

---

### 1.4 Response Fields

#### Use these fields

| Field         | Type   | Description                                                   |
|---------------|--------|---------------------------------------------------------------|
| `title`       | string | Title of the APOD entry.                                      |
| `date`        | string | Publication date in `YYYY-MM-DD` format.                      |
| `explanation` | string | NASA's written description of the image or phenomenon.        |
| `url`         | string | Primary media URL. For `image` entries this is the image. For `video` entries this is typically a YouTube embed URL. |
| `media_type`  | string | Either `"image"` or `"video"`. Use this to switch rendering behaviour. |

#### Ignore these fields

| Field          | Reason to ignore                                                       |
|----------------|------------------------------------------------------------------------|
| `hdurl`        | High-resolution version of the image. Large file sizes are unnecessary for this project; the standard `url` is sufficient. |
| `copyright`    | Attribution metadata. Excluded from scope in v1; may be added in a later version as a caption note. |
| `service_version` | Internal API versioning field. Not meaningful to display.         |
| `thumbnail_url`   | Only present when `thumbs=True` is requested. Not requested.      |
| `concepts`        | Returned only when `concept_tags=True` is requested. Not requested. |

---

### 1.5 Validation Requirements

**Date input (client-side, before the request is sent):**

- Must match the pattern `YYYY-MM-DD`.
- Must not be earlier than `1995-06-16` (the date of the first APOD entry).
- Must not be in the future (compare against `new Date()` in the user's local timezone, but accept today).
- If the field is empty, omit the `date` parameter entirely to retrieve today's entry.

**Response (after the request completes):**

- Confirm that `media_type` is present and is either `"image"` or `"video"`.
- Confirm that `url` is a non-empty string before attempting to render it.
- Confirm that `title` and `explanation` are non-empty strings before rendering.

---

### 1.6 Error Conditions

| HTTP Status | Scenario                                      | Recommended handling                                          |
|-------------|-----------------------------------------------|---------------------------------------------------------------|
| `400`       | Malformed date or date out of valid range.    | Display: "Please enter a valid date between 16 June 1995 and today." |
| `403`       | Invalid or missing API key.                   | Display: "API key error. Please check the configuration."    |
| `404`       | No entry exists for the requested date (rare). | Display: "No APOD entry found for this date."                |
| `429`       | Rate limit exceeded.                          | Display: "Too many requests. Please wait a moment and try again." |
| `500`–`503` | NASA server error.                            | Display: "NASA's servers are currently unavailable. Please try again later." |
| Network failure | `fetch()` rejects (offline, DNS failure). | Display: "Could not connect to NASA. Please check your internet connection." |

**Video entries:** When `media_type === "video"`, the `url` is typically a
YouTube embed URL. Render it in an `<iframe>` rather than an `<img>`. Do not
attempt to display a video URL as an image.

---

### 1.7 Rate Limiting Considerations

| Key type    | Hourly limit | Daily limit |
|-------------|--------------|-------------|
| `DEMO_KEY`  | 30 requests  | 50 requests |
| Registered  | 1,000 requests | No published daily cap |

**Practical guidance for this project:**

- Each user interaction (date change) triggers one request. Traffic is very
  low for a student club project; `DEMO_KEY` is adequate during development.
- For a public deployment, register a free key at
  `https://api.nasa.gov` and store it as a JavaScript constant at the top of
  the relevant module file (e.g., `const NASA_API_KEY = 'your_key_here';`).
- Do not debounce date changes aggressively — one request per deliberate
  selection is appropriate. Do not poll or auto-refresh.

---

### 1.8 Implementation Recommendations

**Fetch pattern:**

```javascript
async function fetchAPOD(date = null) {
  const params = new URLSearchParams({ api_key: NASA_API_KEY });
  if (date) params.append('date', date);

  const response = await fetch(
    `https://api.nasa.gov/planetary/apod?${params}`
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
```

**Rendering switch:**

```javascript
if (data.media_type === 'image') {
  // render <img src={data.url} alt={data.title}>
} else if (data.media_type === 'video') {
  // render <iframe src={data.url}>
} else {
  // render a fallback message; unknown media types should not crash the page
}
```

**Loading state:** Show a visible loading indicator while the request is in
flight. Hide it on both success and error so the UI does not get stuck.

**Default state:** On page load, call `fetchAPOD()` with no date argument to
display today's entry immediately without requiring the user to interact first.

**Date input:** Use `<input type="date">` with `min="1995-06-16"` and
`max` set dynamically to today's date (`new Date().toISOString().split('T')[0]`).
This provides free browser-native validation and a calendar picker.

---

---

## 2. Mars Rover Photos

### 2.1 Endpoint

```
GET https://api.nasa.gov/mars-photos/api/v1/rovers/{rover}/photos
```

`{rover}` is one of: `curiosity`, `opportunity`, `spirit` (lowercase).

### 2.2 Purpose

Retrieve a page of photos taken by a selected Mars rover on a given Martian
Sol and display them in a gallery layout with basic metadata.

---

### 2.3 Parameters

#### Required

| Parameter | Type    | Description                                      |
|-----------|---------|--------------------------------------------------|
| `api_key` | string  | NASA API key. Use `DEMO_KEY` during development. |
| `sol`     | integer | Martian Sol (mission day) for which to retrieve photos. Sol 0 is the rover's landing day. |

#### Optional (used by this project)

| Parameter | Type    | Description                                                                                 |
|-----------|---------|---------------------------------------------------------------------------------------------|
| `page`    | integer | Results are paginated at 25 photos per page. Defaults to `1`. Include this if implementing simple pagination. |

#### Optional (not used by this project)

| Parameter    | Notes                                                                                    |
|--------------|------------------------------------------------------------------------------------------|
| `earth_date` | Alternative to `sol` using Earth calendar dates. The project uses Sol for its educational value and direct alignment with the spec. Do not use alongside `sol`. |
| `camera`     | Filters by a specific rover camera. Excluded from v1 scope; the full gallery is sufficient. |

---

### 2.4 Response Shape

The response is a JSON object with a single top-level key:

```json
{
  "photos": [ ...array of photo objects... ]
}
```

#### Photo object fields to use

| Field                        | Type   | Description                                              |
|------------------------------|--------|----------------------------------------------------------|
| `id`                         | integer | Unique photo identifier. Use as the React/DOM key.      |
| `img_src`                    | string | Direct URL to the photo image.                           |
| `sol`                        | integer | The Sol on which the photo was taken.                   |
| `earth_date`                 | string | Earth date equivalent in `YYYY-MM-DD` format. Display alongside Sol for context. |
| `camera.full_name`           | string | Human-readable camera name (e.g., "Front Hazard Avoidance Camera"). Display in the gallery item metadata. |
| `rover.name`                 | string | Rover name as stored in the API (e.g., `"Curiosity"`). Useful for confirming the selected rover in the UI. |

#### Photo object fields to ignore

| Field               | Reason to ignore                                                         |
|---------------------|--------------------------------------------------------------------------|
| `camera.id`         | Internal identifier. Not meaningful to display.                          |
| `camera.name`       | Short camera code (e.g., `"FHAZ"`). `camera.full_name` is preferable.   |
| `camera.rover_id`   | Internal rover identifier. Not meaningful to display.                    |
| `rover.id`          | Internal rover identifier. Not meaningful to display.                    |
| `rover.landing_date`| Rover metadata. Out of scope for v1.                                     |
| `rover.launch_date` | Rover metadata. Out of scope for v1.                                     |
| `rover.status`      | Indicates whether the rover is still active. Out of scope for v1.        |
| `rover.max_sol`     | The maximum Sol for which photos exist. May be used in v2 to validate Sol input, but excluded from v1. |
| `rover.max_date`    | Same as above.                                                            |
| `rover.total_photos`| Aggregate count. Not needed for the gallery display.                     |
| `rover.cameras`     | Array of camera objects for the rover. Not needed unless camera filtering is added (v2+). |

---

### 2.5 Validation Requirements

**User inputs (client-side, before the request is sent):**

- **Rover name** must be one of the three strings `curiosity`, `opportunity`,
  `spirit`. Enforce this through a `<select>` element so free-text input is
  not possible.
- **Sol value** must be a non-negative integer (`>= 0`). It must not be
  empty. Decimal values must be rejected.
- The upper bound for Sol varies per rover and changes as missions continue.
  In v1, do not attempt to validate against the rover's `max_sol`; simply
  allow any non-negative integer and surface the API error if the Sol is out
  of range.

**Response (after the request completes):**

- Confirm that `photos` is an array (even if empty).
- If `photos.length === 0`, display a "no photos found" message rather than
  an empty gallery. An empty result is a valid API response, not an error.
- Confirm that each photo object has `img_src` before rendering.

---

### 2.6 Error Conditions

| HTTP Status | Scenario                                         | Recommended handling                                          |
|-------------|--------------------------------------------------|---------------------------------------------------------------|
| `400`       | Malformed Sol value or invalid parameter.        | Display: "Invalid input. Please check the rover and Sol values." |
| `403`       | Invalid or missing API key.                      | Display: "API key error. Please check the configuration."    |
| `404`       | Rover name not found (should not occur if using `<select>`). | Display: "Rover not found."                     |
| `429`       | Rate limit exceeded.                             | Display: "Too many requests. Please wait a moment and try again." |
| `500`–`503` | NASA server error.                               | Display: "NASA's servers are currently unavailable. Please try again later." |
| Network failure | `fetch()` rejects.                           | Display: "Could not connect to NASA. Please check your internet connection." |
| Empty `photos` array | Valid response, but no photos on this Sol. | Display: "No photos found for [Rover] on Sol [value]. Try a different Sol." |

**Broken image URLs:** Individual `img_src` URLs occasionally return 404 or
fail to load (NASA's image archive has gaps). Add an `onerror` handler to
each `<img>` element to replace the broken image with a placeholder rather
than showing a broken-image icon.

---

### 2.7 Rate Limiting Considerations

| Key type   | Hourly limit | Daily limit |
|------------|--------------|-------------|
| `DEMO_KEY` | 30 requests  | 50 requests |
| Registered | 1,000 requests | No published daily cap |

**Practical guidance for this project:**

- Each gallery load (rover + Sol combination) triggers one request (per page).
  This is low volume; `DEMO_KEY` is sufficient during development.
- For a public deployment, use a registered free key (same as APOD).
- Sols with many photos return 25 images per page. For v1, displaying page 1
  only (25 photos) is entirely acceptable and keeps the implementation simple.
  If pagination is added, each page-turn triggers one additional request.
- Do not trigger a request on every keystroke in the Sol input. Trigger only
  on explicit form submission (a "Load Photos" button) or on the `Enter` key.

---

### 2.8 Implementation Recommendations

**Fetch pattern:**

```javascript
async function fetchRoverPhotos(rover, sol, page = 1) {
  const params = new URLSearchParams({
    api_key: NASA_API_KEY,
    sol: sol,
    page: page,
  });

  const response = await fetch(
    `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?${params}`
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.photos; // return the array directly
}
```

**Rover selector:** Use a `<select>` element with three hardcoded `<option>`
entries. Do not construct the rover name from free text.

**Sol input:** Use `<input type="number" min="0" step="1">`. Apply
`Math.floor()` to the value before sending it to discard any accidental
decimal entry.

**Gallery rendering:** Render each photo as an `<img>` inside a card element.
Display `camera.full_name` and `earth_date` as caption text beneath the image.

**Broken image fallback:**

```javascript
imgElement.onerror = () => {
  imgElement.src = 'assets/image-unavailable.svg'; // a simple placeholder
  imgElement.alt = 'Image unavailable';
};
```

**Loading state:** Show a spinner or "Loading photos…" message while the
request is in flight. This is especially important here because rover galleries
can contain large images and the network round-trip is visible to the user.

**Empty state:** Render a clear, friendly message when `photos.length === 0`.
Do not render an empty gallery grid. Suggest trying a nearby Sol value, since
not every Sol has photos for every rover.

---

---

## 3. Shared Implementation Notes

### API Key Management

Store the single API key in one place:

```javascript
// js/config.js
const NASA_API_KEY = 'DEMO_KEY'; // replace with registered key for deployment
```

Import or reference this constant in every module that makes a NASA request.
This ensures the key only needs to be changed in one location.

### Error Display Convention

Errors should appear in a dedicated, visually distinct container within the
relevant section (not as browser alerts). Clear the error container before
each new request and repopulate it only on failure. On success, ensure the
error container is empty.

### No Caching in v1

Do not implement response caching in v1. The additional complexity is not
justified for a student project. If the same request is repeated, a fresh
fetch is acceptable. Caching can be considered a v2 enhancement.

### CORS

Both NASA endpoints support cross-origin requests from the browser. No proxy
or backend is required. Requests can be made directly from JavaScript using
the native `fetch()` API.

### No Authentication Beyond the API Key

NASA's open APIs require only the `api_key` query parameter. No OAuth flow,
no session management, and no token storage beyond the constant in `config.js`
is needed.
