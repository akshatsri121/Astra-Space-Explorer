/**
 * home.js — Home Page Logic
 *
 * Responsibilities:
 *   1. Fetch today's APOD on load.
 *   2. Render the image and title into the Hero section.
 *   3. Provide a silent fallback on failure.
 */

document.addEventListener('DOMContentLoaded', function () {

  var elHeroApod = document.getElementById('hero-apod-column');
  var elImage    = document.getElementById('hero-apod-image');
  var elTitle    = document.getElementById('hero-apod-title');
  var elPlaceholder = document.getElementById('hero-apod-placeholder');

  if (!elHeroApod || !elImage || !elTitle) return;

  function init() {
    fetchTodayAPOD();
  }

  function fetchTodayAPOD() {
    /* Set loading state */
    elHeroApod.setAttribute('aria-busy', 'true');

    var apiKey = (typeof NASA_API_KEY !== 'undefined') ? NASA_API_KEY : 'DEMO_KEY';
    var url = 'https://api.nasa.gov/planetary/apod?api_key=' + apiKey;

    fetch(url)
      .then(function(response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function(data) {
        /* Only image media types are suited for the hero banner */
        if (data.media_type === 'image') {
          renderHero(data);
        } else {
          /* Fallback silently for video APODs */
          renderFallback();
        }
      })
      .catch(function() {
        /* Any error: network, 4xx, 5xx — fallback silently per blueprint */
        renderFallback();
      })
      .finally(function() {
        elHeroApod.setAttribute('aria-busy', 'false');
      });
  }

  function renderHero(data) {
    elImage.src = data.url;
    elImage.alt = data.title;
    elTitle.textContent = data.title;

    elImage.onload = function() {
      elImage.classList.add('is-loaded');
      if (elPlaceholder) elPlaceholder.hidden = true;
    };
  }

  function renderFallback() {
    /* Load a remote static fallback image */
    elImage.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop';
    elImage.alt = 'Space scene (fallback image)';
    elTitle.textContent = 'Explore the Universe';

    elImage.onload = function() {
      elImage.classList.add('is-loaded');
      if (elPlaceholder) elPlaceholder.hidden = true;
    };
  }

  init();

});
