/**
 * nav.js — Global Navigation Logic
 *
 * Responsibilities:
 *   1. Toggle the mobile menu overlay.
 *   2. Trap focus inside the overlay when open for accessibility.
 *   3. Close the overlay on Escape key.
 *
 * This script runs on every page.
 */

document.addEventListener('DOMContentLoaded', function () {

  var btnOpen  = document.getElementById('mobile-menu-toggle');
  var btnClose = document.getElementById('mobile-menu-close');
  var overlay  = document.getElementById('mobile-menu-overlay');

  if (!btnOpen || !btnClose || !overlay) { return; }

  /* Track the element that had focus before opening the menu */
  var previousFocus = null;

  /**
   * openMenu — Show the overlay and trap focus.
   */
  function openMenu() {
    previousFocus = document.activeElement;
    
    overlay.hidden = false;
    overlay.classList.add('is-open');
    btnOpen.setAttribute('aria-expanded', 'true');

    /* Prevent scrolling on the main page */
    document.body.style.overflow = 'hidden';

    /* Move focus into the menu */
    btnClose.focus();
  }

  /**
   * closeMenu — Hide the overlay and restore focus.
   */
  function closeMenu() {
    overlay.hidden = true;
    overlay.classList.remove('is-open');
    btnOpen.setAttribute('aria-expanded', 'false');

    /* Restore scrolling */
    document.body.style.overflow = '';

    /* Restore focus */
    if (previousFocus) {
      previousFocus.focus();
    }
  }

  /* ── Event Listeners ───────────────────────────────────────────────────── */

  btnOpen.addEventListener('click', openMenu);
  btnClose.addEventListener('click', closeMenu);

  /* Close on Escape key */
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !overlay.hidden) {
      closeMenu();
    }
  });

  /* Focus trap inside the overlay */
  overlay.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') { return; }

    /* Get all focusable elements inside the overlay */
    var focusableElements = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    var firstElement = focusableElements[0];
    var lastElement  = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) { /* Shift + Tab */
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else { /* Tab */
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  });

});
