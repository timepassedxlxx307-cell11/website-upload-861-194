(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 14) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-thumb]'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === activeIndex);
      });
      thumbs.forEach(function (thumb, itemIndex) {
        thumb.classList.toggle('active', itemIndex === activeIndex);
      });
    }

    function play() {
      if (slides.length < 2) {
        return;
      }
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        showSlide(index);
        play();
      });
    });

    showSlide(0);
    play();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var category = panel.querySelector('[data-filter-category]');
    var sortSelect = panel.querySelector('[data-sort-select]');
    var empty = panel.querySelector('[data-filter-empty]');
    var grid = panel.nextElementSibling;

    while (grid && !grid.hasAttribute('data-card-grid')) {
      grid = grid.nextElementSibling;
    }

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

    function textValue(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category')
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedCategory = category ? category.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matchesKeyword = !keyword || textValue(card).indexOf(keyword) !== -1;
        var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var matchesCategory = !selectedCategory || card.getAttribute('data-category') === selectedCategory;
        var isVisible = matchesKeyword && matchesYear && matchesCategory;
        card.style.display = isVisible ? '' : 'none';
        if (isVisible) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    function applySort() {
      if (!sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      var sorted = cards.slice();

      if (mode === 'newest') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      } else if (mode === 'oldest') {
        sorted.sort(function (a, b) {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        });
      } else if (mode === 'title') {
        sorted.sort(function (a, b) {
          return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'), 'zh-Hans-CN');
        });
      } else {
        sorted.sort(function (a, b) {
          return Number(a.getAttribute('data-index') || 0) - Number(b.getAttribute('data-index') || 0);
        });
      }

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      applyFilter();
    }

    cards.forEach(function (card, index) {
      card.setAttribute('data-index', index);
    });

    [input, year, category].forEach(function (item) {
      if (item) {
        item.addEventListener('input', applyFilter);
        item.addEventListener('change', applyFilter);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', applySort);
    }
  });

  window.initializeMoviePlayer = function (boxId, movieUrl) {
    var box = document.getElementById(boxId);
    if (!box) {
      return;
    }

    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    if (!video || !cover) {
      return;
    }

    function bindVideo() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = movieUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(movieUrl);
        hls.attachMedia(video);
        box.hlsPlayer = hls;
      } else {
        video.src = movieUrl;
      }

      video.setAttribute('data-ready', '1');
    }

    function startPlayback() {
      bindVideo();
      cover.classList.add('is-hidden');
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    cover.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  };
})();
