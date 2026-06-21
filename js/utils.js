/**
 * utils.js — Shared Pure Helper Functions
 *
 * Responsibilities:
 *   1. Date manipulation and formatting.
 *   2. Error message mapping (HTTP status to human-readable strings).
 *
 * This file relies on config.js for constants (like APOD_MIN_DATE).
 * Exposes a global `utils` object to prevent polluting the global namespace.
 */

var utils = (function () {

  /**
   * getTodayISO — Return today's date in local time as "YYYY-MM-DD".
   */
  function getTodayISO() {
    var now   = new Date();
    var year  = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day   = String(now.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  /**
   * formatDate — Convert "YYYY-MM-DD" to "Month DD, YYYY" (e.g. "May 12, 2024").
   * Avoids timezone shifting by splitting the string.
   */
  function formatDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return dateStr;
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;

    var d = new Date(Date.UTC(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    ));

    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  }

  /**
   * isValidDateString — Check if a string matches "YYYY-MM-DD".
   */
  function isValidDateString(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  }

  /**
   * getErrorMessage — Translate a fetch error/status into a friendly string.
   * Matches api_contracts.md specifications.
   */
  function getErrorMessage(error) {
    var message = error && error.message ? error.message : '';

    if (message.indexOf('HTTP 400') !== -1) {
      return 'Invalid request parameters. Please check your inputs and try again.';
    }
    if (message.indexOf('HTTP 403') !== -1) {
      return 'API key error. Please check the configuration.';
    }
    if (message.indexOf('HTTP 404') !== -1) {
      return 'Data not found for the requested parameters.';
    }
    if (message.indexOf('HTTP 429') !== -1) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (message.indexOf('HTTP 5') !== -1) {
      return 'NASA\'s servers are currently unavailable. Please try again later.';
    }
    if (message === 'Failed to fetch' || message.indexOf('NetworkError') !== -1) {
      return 'Could not connect to NASA. Please check your internet connection.';
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /* Expose the public API */
  return {
    getTodayISO: getTodayISO,
    formatDate: formatDate,
    isValidDateString: isValidDateString,
    getErrorMessage: getErrorMessage
  };

})();

