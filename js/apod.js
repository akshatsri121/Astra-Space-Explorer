/**
 * apod.js — Astronomy Picture of the Day page logic
 *
 * Responsibilities (implementation_plan.md §2, §4):
 *   1. Read an optional ?date= query parameter on page load.
 *   2. Fetch and render today's (or the queried) APOD automatically.
 *   3. Wire the date input + Load / Prev / Next day buttons.
 *   4. Wire the Download, Expand (lightbox), and Share action buttons.
 *   5. Fetch the previous 5 calendar days for the sidebar thumbnails.
 *   6. Wire the "Show me a random APOD" button.
 *   7. Update the browser URL (no page reload) whenever the date changes.
 *
 * Dependencies — loaded before this file via <script defer> in apod.html:
 *   config.js   → NASA_API_KEY, NASA_APOD_URL, APOD_MIN_DATE
 *   utils.js    → formatDate(), getTodayString(), addDays(), getErrorMessage()
 *   nav.js      → mobile menu (runs automatically, needs no call from here)
 *   lightbox.js → openLightbox(), closeLightbox()
 *
 * API reference: api_contracts.md §1
 * Page layout:   website_blueprint.md §3.2
 * Design tokens: final_visual_specification.md §5.5.2
 */

/* =============================================================================
   WAIT FOR THE DOM TO BE FULLY PARSED BEFORE RUNNING ANYTHING
   All code lives inside this callback so we never touch elements that
   do not exist yet.
   ============================================================================= */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------------------------------
     SECTION 1 — DOM REFERENCES
     Grab every element this module needs to read from or write to.
     Naming convention: element type as prefix (btn, input, el) keeps things
     readable for beginners without a framework.
     Source: apod.html hook IDs
     --------------------------------------------------------------------------- */

  /* Figure area — wraps the image or video */
  var elFigure      = document.getElementById('apod-figure');
  var elPlaceholder = document.getElementById('apod-figure-placeholder');
  var elImage       = document.getElementById('apod-image');
  var elVideoWrap   = document.getElementById('apod-video-wrap');
  var elVideo       = document.getElementById('apod-video');
  var elVideoCaption = document.getElementById('apod-video-caption');

  /* Error message area above the figure */
  var elError = document.getElementById('apod-error');

  /* Action bar buttons */
  var btnDownload     = document.getElementById('apod-download-btn');
  var elDownloadLabel = document.getElementById('apod-download-label');
  var btnExpand       = document.getElementById('apod-expand-btn');
  var btnShare        = document.getElementById('apod-share-btn');
  var elShareConfirm  = document.getElementById('apod-share-confirm');

  /* Metadata table cells (the <dd> elements in the <dl>) */
  var elMetaDate   = document.getElementById('apod-meta-date');
  var elMetaTitle  = document.getElementById('apod-meta-title');
  var elMetaCredit = document.getElementById('apod-meta-credit');
  var elMetaType   = document.getElementById('apod-meta-type');

  /* Dynamic Page Title */
  var elPageTitle    = document.getElementById('apod-title');
  var elPageSubtitle = document.getElementById('apod-subtitle');

  /* Explanation section */
  var elExplanationPlaceholder = document.getElementById('apod-explanation-placeholder');
  var elExplanationText        = document.getElementById('apod-explanation-text');

  /* Sidebar date controls */
  var inputDate     = document.getElementById('apod-date-input');
  var elDateError   = document.getElementById('apod-date-error');
  var btnLoad       = document.getElementById('apod-load-btn');
  var btnPrev       = document.getElementById('apod-prev-btn');
  var btnNext       = document.getElementById('apod-next-btn');

  /* Sidebar random APOD button */
  var btnRandom = document.getElementById('apod-random-btn');

  /* Sidebar recent thumbnails list */
  var elRecentList = document.getElementById('apod-recent-list');

  /* Lightbox elements */
  var elLightbox        = document.getElementById('apod-lightbox');
  var elLightboxImage   = document.getElementById('apod-lightbox-image');
  var elLightboxCaption = document.getElementById('apod-lightbox-caption');
  var btnLightboxClose  = document.getElementById('apod-lightbox-close');


  /* ---------------------------------------------------------------------------
     SECTION 2 — MODULE-LEVEL CONSTANTS
     Values that do not change while the page is open.
     NASA_API_KEY and APOD_MIN_DATE come from config.js.
     --------------------------------------------------------------------------- */

  /**
   * The earliest valid APOD date.
   * Defined in config.js as APOD_MIN_DATE; repeated here as a fallback
   * so the module is self-documenting.
   * Source: api_contracts.md §1.3 validation rules
   */
  var MIN_DATE = (typeof APOD_MIN_DATE !== 'undefined') ? APOD_MIN_DATE : '1995-06-16';

  /**
   * Number of recent thumbnail entries to pre-fetch on page load.
   * Source: website_blueprint.md §3.2 implementation notes
   */
  var RECENT_COUNT = 5;


  /* ---------------------------------------------------------------------------
     SECTION 3 — MODULE STATE
     Simple plain variables. No global state store; these are local to the
     DOMContentLoaded closure so they cannot be accidentally mutated from
     other scripts.
     Source: implementation_plan.md §4 (state lives where it is needed)
     --------------------------------------------------------------------------- */

  /**
   * The date string (YYYY-MM-DD) of the APOD currently displayed.
   * Set by fetchAndRenderAPOD() on every successful load.
   */
  var currentDate = null;

  /**
   * The full API response object for the currently displayed APOD.
   * Used by the Download, Expand, and Share buttons so they always
   * act on the visible entry rather than re-fetching.
   */
  var currentData = null;

  /**
   * Whether a fetch is currently in-flight.
   * Prevents double-submits when the user clicks Load rapidly.
   */
  var isFetching = false;


  /* ---------------------------------------------------------------------------
     SECTION 4 — INITIALISATION
     Runs once, immediately when the DOM is ready.
     --------------------------------------------------------------------------- */

  /**
   * init — Entry point. Sets up the page and loads the first APOD.
   *
   * Steps:
   *   a) Set the date input's max attribute to today (prevents future dates).
   *   b) Check whether a ?date= query parameter was passed in the URL.
   *   c) Pre-fill the date input with that date, or with today.
   *   d) Fetch and render the APOD for that date.
   *   e) Start fetching the recent sidebar thumbnails in the background.
   *   f) Attach all button event listeners.
   */
  function init() {
    var today = getTodayString(); /* e.g. "2025-06-20" */

    /* Prevent the user from picking a future date */
    inputDate.max = today;
    inputDate.min = MIN_DATE;

    /* Read the ?date= parameter from the current URL, if present.
       For example: apod.html?date=2024-05-12 → startDate = "2024-05-12"
       Source: website_blueprint.md §3.2, implementation_plan.md §2 (apod.js) */
    var urlParams  = new URLSearchParams(window.location.search);
    var startDate  = urlParams.get('date');

    if (startDate && isValidDateString(startDate)) {
      /* A specific date was requested — use it */
      inputDate.value = startDate;
    } else {
      /* No date (or an invalid one) — default to today */
      inputDate.value = today;
      startDate = null; /* null tells fetchAndRenderAPOD to omit the date param */
    }

    /* Fetch and render the initial APOD */
    fetchAndRenderAPOD(startDate);

    /* Load the five recent thumbnails in the sidebar concurrently.
       This runs in parallel with the main fetch — it does not block it. */
    loadRecentThumbnails(today);

    /* Attach all interactive button listeners */
    wireButtons();
  }


  /* ---------------------------------------------------------------------------
     SECTION 5 — CORE FETCH & RENDER
     --------------------------------------------------------------------------- */

  /**
   * fetchAndRenderAPOD — Fetch one APOD entry and update the entire page.
   *
   * This is the single function that orchestrates a full page update:
   *   showLoading → fetch → renderAPOD / renderError → updateURL
   *
   * @param {string|null} date - A "YYYY-MM-DD" string, or null for today.
   *
   * Source: api_contracts.md §1.8 (fetch pattern), implementation_plan.md §4
   */
  function fetchAndRenderAPOD(date) {
    /* Guard: do not start a second request while one is in flight */
    if (isFetching) { return; }
    isFetching = true;

    /* 1. Show the loading state immediately so the UI does not feel frozen */
    showLoadingState();

/* 2. Build the request URL for your LOCAL BACKEND.
          No API key is needed here, the backend handles it. */
    var params = new URLSearchParams();
    if (date) {
      params.append('date', date);
    }
    var url = 'http://localhost:3000/api/get-data';
    
    // Only append the '?' if we actually have a date parameter
    if (params.toString()) {
      url += '?' + params.toString();
    }

    /* 3. Perform the fetch.
          We use .then()/.catch() instead of async/await so the code is easier
          for beginners who may not yet be familiar with async functions. */
    fetch(url)
      .then(function (response) {
        /* The server responded, but the status might not be OK (200–299).
           Throw an error so the .catch() block handles all failures uniformly.
           Source: api_contracts.md §1.6 error conditions */
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        /* Validate that the required fields are present before rendering.
           Source: api_contracts.md §1.5 response validation */
        if (!data.media_type || !data.url || !data.title) {
          throw new Error('Invalid response: missing required fields.');
        }

        /* Save the response so action buttons can reference it */
        currentData = data;

        /* Record the displayed date (use data.date, not the requested date,
           since NASA may return a different date for edge cases) */
        currentDate = data.date;

        /* Update the date input to match what was actually returned */
        inputDate.value = currentDate;

        /* Render the APOD content onto the page */
        renderAPOD(data);

        /* Update the browser URL without triggering a page reload.
           Enables shareable links: apod.html?date=YYYY-MM-DD
           Source: final_visual_specification.md §5.5.2 improvement 2 */
        updateURL(currentDate);
      })
      .catch(function (error) {
        /* Any fetch failure (network error, 4xx, 5xx, or validation failure)
           lands here. Show a clear, user-friendly error message. */
        renderError(getErrorMessage(error));
      })
      .finally(function () {
        /* Always release the lock, regardless of success or failure,
           so the user can try another date */
        isFetching = false;
      });
  }

  /**
   * renderAPOD — Update every visual element on the page with API data.
   *
   * Called after a successful fetch. Clears any previous error, fills in
   * the figure, metadata table, explanation, and action bar.
   *
   * @param {Object} data - The validated APOD API response object.
   *
   * Source: api_contracts.md §1.4 (fields), final_visual_spec §5.5.2
   */
  function renderAPOD(data) {
    /* Clear any previous error message */
    hideError();

    /* ── Figure: image or video ──────────────────────────────────────────── */
    if (data.media_type === 'image') {
      renderImage(data);
    } else if (data.media_type === 'video') {
      renderVideo(data);
    } else {
      /* Unknown media type — show an informational message instead of crashing.
         Source: api_contracts.md §1.8 (rendering switch) */
      renderError('This APOD entry uses an unsupported media type (' + data.media_type + ').');
      return;
    }

    /* ── Metadata table ──────────────────────────────────────────────────── */
    updateMetadataTable(data);

    /* ── Explanation body text ──────────────────────────────────────────── */
    updateExplanation(data.explanation);

    /* ── Action bar buttons ─────────────────────────────────────────────── */
    updateActionBar(data);

    /* Mark the figure as no longer loading */
    elFigure.setAttribute('aria-busy', 'false');
  }

  /**
   * renderImage — Display an image-type APOD in the figure element.
   *
   * Uses object-fit: contain on a dark background (set via CSS .apod-figure)
   * to preserve the image's original aspect ratio without cropping.
   *
   * @param {Object} data - APOD API response with media_type === 'image'.
   */
  function renderImage(data) {
    /* Hide the loading placeholder */
    elPlaceholder.hidden = true;

    /* Hide the video elements in case a previous entry was a video */
    elVideoWrap.hidden    = true;
    elVideoCaption.hidden = true;

    /* Set the image source and accessible description */
    elImage.src   = data.url;
    elImage.alt   = data.title;

    /* Show the image element */
    elImage.hidden = false;

    /* When the image finishes loading, add .is-loaded to trigger the
       CSS opacity fade-in transition (400ms ease-out per the animation spec).
       Source: final_visual_specification.md §5.7 (hero APOD fade-in) */
    elImage.onload = function () {
      elImage.classList.add('is-loaded');
    };

    /* If the image itself fails to load (broken URL from NASA's archive),
       show a descriptive error rather than a broken icon.
       Source: api_contracts.md §2.6 (broken image URLs) */
    elImage.onerror = function () {
      elImage.hidden = true;
      renderError('The image for this APOD could not be loaded. Try another date.');
    };
  }

  /**
   * renderVideo — Display a video-type APOD (YouTube embed) in the figure.
   *
   * iframe title is required for accessibility: "APOD video: [title]"
   * No autoplay per design_specification.md §4.10 rule 16.
   * Download and Expand buttons are hidden for video entries.
   *
   * @param {Object} data - APOD API response with media_type === 'video'.
   *
   * Source: api_contracts.md §1.6, website_blueprint.md §3.2 video handling
   */
  function renderVideo(data) {
    /* Hide the loading placeholder */
    elPlaceholder.hidden = true;

    /* Hide the image in case a previous entry was an image */
    elImage.hidden = true;
    elImage.classList.remove('is-loaded');

    /* Set the iframe source and accessible title.
       The title must identify the content for screen reader users
       who will encounter the iframe before seeing any surrounding text. */
    elVideo.src   = data.url;
    elVideo.title = 'APOD video: ' + data.title;

    /* Show the video wrapper */
    elVideoWrap.hidden = false;

    /* Populate and show the figcaption — gives screen readers context
       about the video before they encounter the iframe.
       Source: website_blueprint.md §7.10 (video accessibility) */
    elVideoCaption.textContent = data.title + ' · ' + formatDate(data.date);
    elVideoCaption.hidden = false;
  }


  /* ---------------------------------------------------------------------------
     SECTION 6 — METADATA & EXPLANATION
     --------------------------------------------------------------------------- */

  /**
   * updateMetadataTable — Fill in the four-row details table.
   *
   * Only fields the API actually returns are shown:
   *   DATE   → data.date        (formatted as "May 12, 2024")
   *   TITLE  → data.title
   *   CREDIT → data.copyright   (fallback: "NASA" if null or missing)
   *   TYPE   → data.media_type  ("Image" or "Video")
   *
   * Source: final_visual_specification.md §5.5.2 metadata table,
   *         api_contracts.md §1.4, website_blueprint.md §3.2
   *
   * @param {Object} data - APOD API response.
   */
  function updateMetadataTable(data) {
    /* Page Title & Subtitle */
    if (elPageTitle) {
      elPageTitle.textContent = data.title;
      elPageTitle.setAttribute('aria-busy', 'false');
    }
    if (elPageSubtitle) {
      elPageSubtitle.textContent = formatDate(data.date);
      elPageSubtitle.setAttribute('aria-busy', 'false');
    }

    /* DATE — human-readable format via the shared formatDate helper */
    elMetaDate.textContent = formatDate(data.date);

    /* TITLE — as returned by the API */
    elMetaTitle.textContent = data.title;

    /* CREDIT — copyright field, with NASA as the default.
       Some APOD images are NASA public domain and have no copyright value. */
    elMetaCredit.textContent = (data.copyright && data.copyright.trim())
      ? data.copyright.trim()
      : 'NASA';

    /* TYPE — capitalize for display: "image" → "Image" */
    elMetaType.textContent = data.media_type
      ? data.media_type.charAt(0).toUpperCase() + data.media_type.slice(1)
      : '—';
  }

  /**
   * updateExplanation — Set the explanation body text.
   *
   * @param {string} text - NASA's written description from the API response.
   */
  function updateExplanation(text) {
    /* Hide the skeleton loading placeholders */
    elExplanationPlaceholder.hidden = true;

    /* Set the text and reveal the paragraph */
    elExplanationText.textContent = text || '';
    elExplanationText.hidden = false;
  }


  /* ---------------------------------------------------------------------------
     SECTION 7 — ACTION BAR (DOWNLOAD, EXPAND, SHARE)
     --------------------------------------------------------------------------- */

  /**
   * updateActionBar — Configure the three action buttons for the loaded entry.
   *
   * For image entries: all three buttons are enabled.
   * For video entries: Download and Expand are hidden (YouTube videos cannot
   *   be downloaded via URL; lightbox does not apply to embedded video).
   *   Share remains visible.
   *
   * Source: final_visual_specification.md §5.5.2 (action buttons),
   *         website_blueprint.md §3.2 (video handling)
   *
   * @param {Object} data - APOD API response.
   */
  function updateActionBar(data) {
    var isImage = (data.media_type === 'image');

    /* ── Download button ─────────────────────────────────────────────────── */
    if (isImage) {
      /* Link to hdurl (high-res) if available; fall back to url (standard).
         Source: website_blueprint.md §3.2, api_contracts.md §1.4 */
      var downloadUrl = data.hdurl || data.url;
      btnDownload.href = downloadUrl;

      /* Label: "Download" if HD available; "Download SD" if only url */
      elDownloadLabel.textContent = data.hdurl ? 'Download' : 'Download SD';

      /* Update aria-label to match the visible label */
      btnDownload.setAttribute('aria-label',
        data.hdurl ? 'Download APOD image in high resolution'
                   : 'Download APOD image (standard resolution)');

      /* Enable the button */
      btnDownload.removeAttribute('aria-disabled');
      btnDownload.hidden = false;
    } else {
      /* Video entries: hide the download button entirely */
      btnDownload.hidden = true;
    }

    /* ── Expand button (lightbox) ────────────────────────────────────────── */
    if (isImage) {
      btnExpand.removeAttribute('aria-disabled');
      btnExpand.hidden = false;
    } else {
      /* Lightbox does not apply to embedded YouTube videos */
      btnExpand.hidden = true;
    }

    /* ── Share button — enabled for both image and video entries ─────────── */
    btnShare.removeAttribute('aria-disabled');
  }


  /* ---------------------------------------------------------------------------
     SECTION 8 — LOADING & ERROR STATES
     --------------------------------------------------------------------------- */

  /**
   * showLoadingState — Reset the page to the loading state before a fetch.
   *
   * Called at the start of every fetchAndRenderAPOD() call.
   * Ensures the UI never gets "stuck" from a previous state.
   * Source: implementation_plan.md §6 (loading states paired with error states)
   */
  function showLoadingState() {
    /* Clear any previous error */
    hideError();

    /* Clear the explanation text and show its skeleton */
    elExplanationText.hidden = true;
    elExplanationText.textContent = '';
    elExplanationPlaceholder.hidden = false;

    /* Reset the figure to the loading pulse */
    elImage.hidden = true;
    elImage.src    = '';
    elImage.alt    = '';
    elImage.classList.remove('is-loaded');
    elVideoWrap.hidden    = true;
    elVideo.src           = '';
    elVideoCaption.hidden = true;
    elPlaceholder.hidden  = false;

    /* Mark the figure as busy for screen readers */
    elFigure.setAttribute('aria-busy', 'true');

    /* Clear metadata cells back to skeleton pulsing.
       We set textContent to empty — the CSS pulse still shows from the
       .loading-pulse spans rendered in the HTML skeleton. */
    elMetaDate.textContent   = '';
    elMetaTitle.textContent  = '';
    elMetaCredit.textContent = '';
    elMetaType.textContent   = '';

    if (elPageTitle) {
      elPageTitle.innerHTML = '<span class="loading-pulse loading-pulse--line" aria-hidden="true"></span>';
      elPageTitle.setAttribute('aria-busy', 'true');
    }
    if (elPageSubtitle) {
      elPageSubtitle.innerHTML = '<span class="loading-pulse loading-pulse--line-short" aria-hidden="true"></span>';
      elPageSubtitle.setAttribute('aria-busy', 'true');
    }

    /* Disable action buttons while loading */
    btnDownload.setAttribute('aria-disabled', 'true');
    btnExpand.setAttribute('aria-disabled', 'true');
    btnShare.setAttribute('aria-disabled', 'true');

    /* Hide the inline share confirmation if it was showing */
    elShareConfirm.classList.remove('is-visible');
  }

  /**
   * renderError — Display an error message and clear the loading state.
   *
   * The error container has role="alert" in the HTML, so screen readers
   * announce the message immediately without the user having to find it.
   * Source: implementation_plan.md §6, api_contracts.md §3 (error convention)
   *
   * @param {string} message - Human-readable error text to display.
   */
  function renderError(message) {
    /* Hide the loading placeholder — we have a result (an error) */
    elPlaceholder.hidden = true;
    elExplanationPlaceholder.hidden = true;
    elFigure.setAttribute('aria-busy', 'false');

    /* Show the error text */
    elError.textContent = message;
    elError.classList.add('is-visible');
  }

  /**
   * hideError — Clear the error message container.
   */
  function hideError() {
    elError.textContent = '';
    elError.classList.remove('is-visible');
  }


  /* ---------------------------------------------------------------------------
     SECTION 9 — EVENT WIRING
     All button listeners are registered here so they are easy to find.
     --------------------------------------------------------------------------- */

  /**
   * wireButtons — Attach click handlers to every interactive element.
   */
  function wireButtons() {

    /* ── LOAD button: fetch the date currently in the input ──────────────── */
    btnLoad.addEventListener('click', function () {
      var selectedDate = inputDate.value; /* "YYYY-MM-DD" string */

      /* Validate the date before sending a request.
         Source: api_contracts.md §1.5 (client-side validation) */
      if (!isValidDateString(selectedDate)) {
        showDateError('Please enter a valid date in the format YYYY-MM-DD.');
        return;
      }
      if (selectedDate < MIN_DATE) {
        showDateError('APOD started on June 16, 1995. Please select a later date.');
        return;
      }
      if (selectedDate > getTodayString()) {
        showDateError('You cannot select a future date.');
        return;
      }

      /* Clear any previous date validation error */
      hideDateError();

      fetchAndRenderAPOD(selectedDate);
    });

    /* ── PREV button: step one day backward ─────────────────────────────── */
    btnPrev.addEventListener('click', function () {
      /* currentDate is null on the very first load (before any fetch completes).
         Fall back to the input's current value in that case. */
      var baseDate = currentDate || inputDate.value || getTodayString();
      var prevDate = addDays(baseDate, -1);

      /* Do not go before the first APOD */
      if (prevDate < MIN_DATE) { return; }

      inputDate.value = prevDate;
      hideDateError();
      fetchAndRenderAPOD(prevDate);
    });

    /* ── NEXT button: step one day forward ──────────────────────────────── */
    btnNext.addEventListener('click', function () {
      var baseDate = currentDate || inputDate.value || getTodayString();
      var nextDate = addDays(baseDate, 1);

      /* Do not go into the future */
      if (nextDate > getTodayString()) { return; }

      inputDate.value = nextDate;
      hideDateError();
      fetchAndRenderAPOD(nextDate);
    });

    /* ── RANDOM APOD button ──────────────────────────────────────────────── */
    btnRandom.addEventListener('click', function () {
      var randomDate = getRandomDate(MIN_DATE, getTodayString());
      inputDate.value = randomDate;
      hideDateError();
      fetchAndRenderAPOD(randomDate);
    });

    /* ── EXPAND button: open the lightbox with the current image ─────────── */
    btnExpand.addEventListener('click', function () {
      /* Only works for image entries; button is hidden for video */
      if (!currentData || currentData.media_type !== 'image') { return; }

      /* Use hdurl (high resolution) in the lightbox if available */
      var src     = currentData.hdurl || currentData.url;
      var alt     = currentData.title;
      var caption = currentData.title + ' · ' + formatDate(currentData.date);

      /* Populate and open the inline lightbox */
      openInlineLightbox(src, alt, caption);
    });

    /* ── DOWNLOAD button ──────────────────────────────────────────────────
       The href is set by updateActionBar(); this listener is just a guard
       to prevent clicks while aria-disabled is true. */
    btnDownload.addEventListener('click', function (event) {
      if (btnDownload.getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
      }
    });

    /* ── SHARE button ────────────────────────────────────────────────────── */
    btnShare.addEventListener('click', function () {
      if (!currentData) { return; }

      var shareUrl   = window.location.href;
      var shareTitle = currentData.title || 'Astronomy Picture of the Day';

      /* Try the native Web Share API first (works on mobile and some desktops).
         Fall back to copying the URL to the clipboard.
         Source: final_visual_spec §5.5.2, website_blueprint.md §3.2 */
      if (navigator.share) {
        navigator.share({
          title: shareTitle,
          url:   shareUrl
        }).catch(function () {
          /* User may have cancelled the share — that is fine, do nothing */
        });
      } else {
        /* Clipboard fallback */
        navigator.clipboard.writeText(shareUrl)
          .then(function () {
            /* Show brief inline confirmation */
            elShareConfirm.classList.add('is-visible');
            /* Hide the confirmation after 3 seconds */
            setTimeout(function () {
              elShareConfirm.classList.remove('is-visible');
            }, 3000);
          })
          .catch(function () {
            /* Clipboard API may be blocked in some browser contexts — silently ignore */
          });
      }
    });

    /* ── Lightbox close button ───────────────────────────────────────────── */
    btnLightboxClose.addEventListener('click', function () {
      closeInlineLightbox();
    });

    /* ── Lightbox: close on Escape key and Focus Trap ───────────────────── */
    document.addEventListener('keydown', function (event) {
      if (elLightbox.hidden) return;
      
      if (event.key === 'Escape') {
        closeInlineLightbox();
      } else if (event.key === 'Tab') {
        /* Focus Trap */
        var focusableElements = elLightbox.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;
        
        var firstElement = focusableElements[0];
        var lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    });

    /* ── Lightbox: close when clicking outside the image ────────────────── */
    elLightbox.addEventListener('click', function (event) {
      /* Only close if the click was on the backdrop, not on the image itself */
      if (event.target === elLightbox) {
        closeInlineLightbox();
      }
    });

  } /* end wireButtons */


  /* ---------------------------------------------------------------------------
     SECTION 10 — LIGHTBOX (INLINE IMPLEMENTATION)
     A simple full-screen image viewer. If lightbox.js exposes openLightbox()
     and closeLightbox() as globals, those will be used from other pages.
     This inline version handles the APOD-page lightbox directly.
     Source: website_blueprint.md §3.2 (lightbox wireframe)
     --------------------------------------------------------------------------- */

  /** Last focused element before the lightbox opened — restored on close. */
  var lightboxReturnFocus = null;

  /**
   * openInlineLightbox — Show the lightbox with a given image.
   *
   * @param {string} src     - The full-resolution image URL.
   * @param {string} alt     - Descriptive alt text for the image.
   * @param {string} caption - Text shown beneath the image (title · date).
   */
  function openInlineLightbox(src, alt, caption) {
    /* Remember which element triggered the lightbox so we can return focus */
    lightboxReturnFocus = document.activeElement;

    /* Populate the lightbox image */
    elLightboxImage.src = src;
    elLightboxImage.alt = alt;

    /* Populate the caption */
    elLightboxCaption.textContent = caption || '';

    /* Show the lightbox */
    elLightbox.hidden = false;
    elLightbox.classList.add('is-open');

    /* Move focus to the close button so keyboard users can dismiss it */
    btnLightboxClose.focus();

    /* Prevent the page behind from scrolling while the lightbox is open */
    document.body.style.overflow = 'hidden';
  }

  /**
   * closeInlineLightbox — Hide the lightbox and restore the previous focus.
   */
  function closeInlineLightbox() {
    elLightbox.hidden = true;
    elLightbox.classList.remove('is-open');

    /* Clear the image src so the previous image does not flash on next open */
    elLightboxImage.src = '';

    /* Restore scroll */
    document.body.style.overflow = '';

    /* Return focus to the element that opened the lightbox */
    if (lightboxReturnFocus) {
      lightboxReturnFocus.focus();
      lightboxReturnFocus = null;
    }
  }


  /* ---------------------------------------------------------------------------
     SECTION 11 — RECENT THUMBNAILS
     --------------------------------------------------------------------------- */

  /**
   * loadRecentThumbnails — Pre-fetch the five most recent APOD entries
   * and render them as thumbnail items in the sidebar.
   *
   * Each entry: 120×80px image + title + date.
   * Clicking a thumbnail loads that date's APOD in the main column.
   *
   * Fetches run concurrently via Promise.all so all five finish as quickly
   * as the slowest one — far faster than fetching them sequentially.
   *
   * Source: website_blueprint.md §3.2, final_visual_spec §5.5.2,
   *         api_contracts.md §1.8 (recent thumbnails)
   *
   * @param {string} today - Today's date as "YYYY-MM-DD".
   */
  function loadRecentThumbnails(today) {
    /* Build an array of the five previous calendar dates.
       We skip today because the main content area already shows it. */
    var recentDates = [];
    for (var i = 1; i <= RECENT_COUNT; i++) {
      recentDates.push(addDays(today, -i));
    }

/* Fetch dates from local backend in a staggered manner */
    var fetchPromises = recentDates.map(function (date, index) {
      return new Promise(function(resolve) {
        setTimeout(function() {
          var params = new URLSearchParams({ date: date });
          fetch('http://localhost:3000/api/get-data?' + params.toString())
            .then(function (response) {
              if (!response.ok) { throw new Error('HTTP ' + response.status); }
              return response.json();
            })
            .then(resolve)
            .catch(function () {
              resolve(null);
            });
        }, index * 250); /* Stagger each request by 250ms */
      });
    });

    Promise.all(fetchPromises)
      .then(function (results) {
        /* Replace the skeleton list with real thumbnail items */
        renderRecentList(results);

        /* Mark the list as no longer loading */
        elRecentList.setAttribute('aria-busy', 'false');
      });
  }

  /**
   * renderRecentList — Clear the skeleton items and add real thumbnail entries.
   *
   * @param {Array} entries - Array of APOD response objects (may include null).
   */
  function renderRecentList(entries) {
    /* Remove all skeleton placeholder <li> elements */
    elRecentList.innerHTML = '';

    entries.forEach(function (data) {
      if (!data) { return; } /* Skip any failed fetches */
      var item = buildRecentItem(data);
      elRecentList.appendChild(item);
    });
  }

  /**
   * buildRecentItem — Create a single recent-thumbnail <li> element.
   *
   * Each item is a link (clicking it loads that date's APOD) containing:
   *   - A 120×80 thumbnail image (or a pulse placeholder for video entries)
   *   - The APOD title (clamped to 2 lines via CSS)
   *   - The formatted date
   *
   * @param  {Object} data - One APOD API response object.
   * @returns {HTMLElement}  The constructed <li> element.
   */
  function buildRecentItem(data) {
    /* Outer list item */
    var li = document.createElement('li');

    /* The entire item is a clickable link */
    var a = document.createElement('a');
    a.className = 'apod-recent__item';
    a.href      = 'apod.html?date=' + data.date;
    a.setAttribute('aria-label',
      data.title + ', published ' + formatDate(data.date));

    /* When the user clicks a recent item, load it in the main column
       instead of navigating away to a new page. */
    a.addEventListener('click', function (event) {
      event.preventDefault();
      inputDate.value = data.date;
      hideDateError();
      fetchAndRenderAPOD(data.date);
      /* Scroll to the top of the main column so the user sees the update */
      elFigure.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    /* Thumbnail image — only for image media type.
       Video entries get a text placeholder since they have no still image. */
    if (data.media_type === 'image') {
      var img = document.createElement('img');
      img.className   = 'apod-recent__thumb';
      img.src         = data.url;
      img.alt         = '';          /* Decorative — the <a> has a full aria-label */
      img.width       = 120;
      img.height      = 80;
      img.loading     = 'lazy';
      img.setAttribute('role', 'presentation');

      /* Replace broken thumbnails with a silent placeholder */
      img.onerror = function () {
        img.style.display = 'none';
      };

      a.appendChild(img);
    } else {
      /* Video entry: show a small text badge instead of a broken image */
      var badge = document.createElement('span');
      badge.className   = 'apod-recent__thumb';
      badge.textContent = 'VIDEO';
      badge.style.cssText = 'display:flex;align-items:center;justify-content:center;' +
                             'font-size:0.65rem;letter-spacing:0.08em;background:var(--bg-surface);' +
                             'color:var(--text-tertiary);width:120px;height:80px;flex-shrink:0;';
      a.appendChild(badge);
    }

    /* Text info: title + date */
    var info = document.createElement('div');
    info.className = 'apod-recent__info';

    var title = document.createElement('span');
    title.className   = 'apod-recent__title';
    title.textContent = data.title;
    info.appendChild(title);

    var date = document.createElement('span');
    date.className   = 'apod-recent__date';
    date.textContent = formatDate(data.date);
    info.appendChild(date);

    a.appendChild(info);
    li.appendChild(a);
    return li;
  }


  /* ---------------------------------------------------------------------------
     SECTION 12 — URL MANAGEMENT
     --------------------------------------------------------------------------- */

  /**
   * updateURL — Update the browser address bar without reloading the page.
   *
   * Produces shareable links: apod.html?date=2024-05-12
   * Uses history.replaceState (not pushState) so the back button does not
   * create an extra history entry for every date change.
   *
   * Source: implementation_plan.md §2 (apod.js), website_blueprint.md §8 journey 3
   *
   * @param {string} date - The displayed date as "YYYY-MM-DD".
   */
  function updateURL(date) {
    if (!window.history || !window.history.replaceState) { return; }
    var newURL = window.location.pathname + '?date=' + date;
    window.history.replaceState(null, '', newURL);
  }


  /* ---------------------------------------------------------------------------
     SECTION 13 — FORM VALIDATION HELPERS
     --------------------------------------------------------------------------- */

  /**
   * showDateError — Display a validation message below the date input.
   *
   * @param {string} message - The error text to display.
   */
  function showDateError(message) {
    elDateError.textContent = message;
    elDateError.classList.add('is-visible');
  }

  /**
   * hideDateError — Clear the date input validation message.
   */
  function hideDateError() {
    elDateError.textContent = '';
    elDateError.classList.remove('is-visible');
  }


  /* ---------------------------------------------------------------------------
     SECTION 14 — PURE UTILITY FUNCTIONS
     These are small, focused functions with no side effects.
     Shared versions also exist in utils.js; these copies keep apod.js
     self-contained and easier for beginners to read in isolation.
     --------------------------------------------------------------------------- */

  /**
   * getTodayString — Return today's date as a "YYYY-MM-DD" string.
   *
   * Uses the local timezone (not UTC) so the date matches what the user
   * sees on their device.
   *
   * @returns {string} e.g. "2025-06-20"
   */
  function getTodayString() {
    /* If utils.js has already defined this function, delegate to it */
    if (typeof utils !== 'undefined' && typeof utils.getTodayISO === 'function') { return utils.getTodayISO(); }

    var now    = new Date();
    var year   = now.getFullYear();
    var month  = String(now.getMonth() + 1).padStart(2, '0');
    var day    = String(now.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  /**
   * formatDate — Convert a "YYYY-MM-DD" string to a readable label.
   *
   * Example: "2024-05-12" → "May 12, 2024"
   *
   * The Date constructor interprets YYYY-MM-DD as UTC midnight, which can
   * shift the displayed day by one in negative-offset timezones. We work
   * around this by splitting the string manually.
   *
   * @param  {string} dateStr - Date in "YYYY-MM-DD" format.
   * @returns {string} Human-readable date, e.g. "May 12, 2024".
   */
  function formatDate(dateStr) {
    if (!dateStr) { return ''; }

    /* Delegate to utils.js if available */
    if (typeof utils !== 'undefined' && typeof utils.formatDate === 'function') {
      return utils.formatDate(dateStr);
    }

    /* Fallback: parse manually to avoid timezone issues */
    var parts = dateStr.split('-'); /* ["2024", "05", "12"] */
    if (parts.length !== 3) { return dateStr; }

    /* Use a fixed UTC date to get the correct month name */
    var d = new Date(Date.UTC(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1, /* months are 0-indexed */
      parseInt(parts[2], 10)
    ));

    return d.toLocaleDateString('en-US', {
      year:  'numeric',
      month: 'long',
      day:   'numeric',
      timeZone: 'UTC'
    });
  }

  /**
   * addDays — Return a new "YYYY-MM-DD" string offset by N days.
   *
   * @param  {string} dateStr - Base date as "YYYY-MM-DD".
   * @param  {number} days    - Positive (forward) or negative (backward).
   * @returns {string} New date as "YYYY-MM-DD".
   */
  function addDays(dateStr, days) {
    /* Parse manually to avoid timezone displacement */
    var parts = dateStr.split('-');
    var d     = new Date(Date.UTC(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    ));
    d.setUTCDate(d.getUTCDate() + days);

    var year  = d.getUTCFullYear();
    var month = String(d.getUTCMonth() + 1).padStart(2, '0');
    var day   = String(d.getUTCDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  /**
   * isValidDateString — Check that a string matches the YYYY-MM-DD format.
   *
   * @param  {string} dateStr - The string to validate.
   * @returns {boolean}
   */
  function isValidDateString(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') { return false; }
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  }

  /**
   * getRandomDate — Return a random "YYYY-MM-DD" between two date strings.
   *
   * Used by the "Show me a random APOD" button.
   * Source: website_blueprint.md §3.2 (random APOD implementation note)
   *
   * @param  {string} minDateStr - Earliest allowed date ("1995-06-16").
   * @param  {string} maxDateStr - Latest allowed date (today).
   * @returns {string} A random date as "YYYY-MM-DD".
   */
  function getRandomDate(minDateStr, maxDateStr) {
    var minParts = minDateStr.split('-');
    var maxParts = maxDateStr.split('-');

    var minMs = Date.UTC(
      parseInt(minParts[0], 10),
      parseInt(minParts[1], 10) - 1,
      parseInt(minParts[2], 10)
    );
    var maxMs = Date.UTC(
      parseInt(maxParts[0], 10),
      parseInt(maxParts[1], 10) - 1,
      parseInt(maxParts[2], 10)
    );

    /* Pick a random millisecond value between min and max */
    var randomMs = minMs + Math.random() * (maxMs - minMs);
    var d = new Date(randomMs);

    var year  = d.getUTCFullYear();
    var month = String(d.getUTCMonth() + 1).padStart(2, '0');
    var day   = String(d.getUTCDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  /**
   * getErrorMessage — Translate a fetch Error into a user-readable string.
   *
   * Maps HTTP status codes to the exact messages specified in
   * api_contracts.md §1.6 (APOD error conditions).
   *
   * @param  {Error} error - The error thrown by the fetch chain.
   * @returns {string} A friendly message safe to display to the user.
   */
  function getErrorMessage(error) {
    /* Delegate to utils.js if it provides a shared error mapper */
    if (typeof utils !== 'undefined' && typeof utils.getErrorMessage === 'function') {
      return utils.getErrorMessage(error);
    }

    var message = error && error.message ? error.message : '';

    /* Match HTTP status codes from the message string "HTTP 4xx" */
    if (message.indexOf('HTTP 400') !== -1) {
      return 'Please enter a valid date between 16 June 1995 and today.';
    }
    if (message.indexOf('HTTP 403') !== -1) {
      return 'API key error. Please check the configuration.';
    }
    if (message.indexOf('HTTP 404') !== -1) {
      return 'No APOD entry found for this date.';
    }
    if (message.indexOf('HTTP 429') !== -1) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (message.indexOf('HTTP 5') !== -1) {
      /* Covers 500, 502, 503 */
      return 'NASA\'s servers are currently unavailable. Please try again later.';
    }
    if (message === 'Failed to fetch' || message.indexOf('NetworkError') !== -1) {
      return 'Could not connect to NASA. Please check your internet connection.';
    }

    /* Generic fallback for unexpected errors */
    return 'Unable to load this APOD. Please try again or select a different date.';
  }


  /* ---------------------------------------------------------------------------
     KICK OFF — Run the initialisation function now that everything is defined.
     --------------------------------------------------------------------------- */
  init();

}); /* end DOMContentLoaded */
