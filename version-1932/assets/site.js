(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (navToggle && nav) {
      navToggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
          showSlide(index);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          showSlide(current + 1);
        }, 5600);
      }
    }

    var filterBoxes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-box]'));
    filterBoxes.forEach(function (box) {
      var input = box.querySelector('[data-search-input]');
      var type = box.querySelector('[data-filter-type]');
      var region = box.querySelector('[data-filter-region]');
      var year = box.querySelector('[data-filter-year]');
      var section = box.parentElement || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-search-card]'));

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function applyFilter() {
        var keyword = normalize(input && input.value);
        var selectedType = normalize(type && type.value);
        var selectedRegion = normalize(region && region.value);
        var selectedYear = normalize(year && year.value);

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedType && cardType !== selectedType) {
            matched = false;
          }
          if (selectedRegion && cardRegion !== selectedRegion) {
            matched = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }

          card.hidden = !matched;
        });
      }

      [input, type, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });
    });

    var playerButtons = Array.prototype.slice.call(document.querySelectorAll('[data-stream]'));
    playerButtons.forEach(function (button) {
      var targetId = button.getAttribute('data-target');
      var video = targetId ? document.getElementById(targetId) : document.querySelector('video');
      var stream = button.getAttribute('data-stream');

      function beginPlayback() {
        if (!video || !stream) {
          return;
        }

        button.classList.add('is-hidden');

        if (video.getAttribute('data-ready') === stream) {
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (video._hlsPlayer) {
            video._hlsPlayer.destroy();
          }
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          video._hlsPlayer = hls;
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.setAttribute('data-ready', stream);
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.setAttribute('data-ready', stream);
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
          video.load();
        } else {
          window.open(stream, '_blank', 'noopener');
        }
      }

      button.addEventListener('click', beginPlayback);
      if (video) {
        video.addEventListener('click', function () {
          if (!video.getAttribute('data-ready')) {
            beginPlayback();
          }
        });
      }
    });
  });
})();
