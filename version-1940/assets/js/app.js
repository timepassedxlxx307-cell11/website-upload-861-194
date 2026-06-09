(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
      });
    }

    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

  searchInputs.forEach(function (input) {
    var container = input.closest('main') || document;
    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-search]'));
    var buttons = Array.prototype.slice.call(container.querySelectorAll('[data-filter-button]'));
    var filterValue = 'all';

    var apply = function () {
      var query = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var filterText = card.getAttribute('data-filter') || '';
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = filterValue === 'all' || filterText.indexOf(filterValue) !== -1;
        card.classList.toggle('is-hidden-by-filter', !(matchQuery && matchFilter));
      });
    };

    input.addEventListener('input', apply);

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        filterValue = button.getAttribute('data-filter-button') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });
  });
})();

function initMoviePlayer(sourceUrl) {
  var video = document.querySelector('[data-player]');
  var cover = document.querySelector('[data-play-cover]');
  var hlsInstance = null;
  var loaded = false;

  if (!video || !cover || !sourceUrl) {
    return;
  }

  var start = function () {
    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      loaded = true;
    }

    cover.classList.add('is-hidden');
    var playAction = video.play();
    if (playAction && typeof playAction.catch === 'function') {
      playAction.catch(function () {});
    }
  };

  cover.addEventListener('click', start);

  video.addEventListener('click', function () {
    if (!loaded) {
      start();
    }
  });

  video.addEventListener('play', function () {
    cover.classList.add('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
