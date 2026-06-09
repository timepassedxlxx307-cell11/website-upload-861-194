(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;
    var show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    var start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q') || '';
  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var input = panel.querySelector('[data-movie-search]');
    var list = document.querySelector('[data-movie-list]');
    var empty = document.querySelector('[data-empty-state]');
    var pills = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
    var activeFilter = '全部';
    if (!list) {
      return;
    }
    if (input && queryFromUrl) {
      input.value = queryFromUrl;
    }
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]')).forEach(function (card) {
        var data = (card.getAttribute('data-search') || '').toLowerCase();
        var matchText = !q || data.indexOf(q) !== -1;
        var matchFilter = activeFilter === '全部' || data.indexOf(activeFilter.toLowerCase()) !== -1;
        var ok = matchText && matchFilter;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    if (input) {
      input.addEventListener('input', apply);
    }
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        activeFilter = pill.getAttribute('data-filter') || '全部';
        pills.forEach(function (item) {
          item.classList.toggle('is-active', item === pill);
        });
        apply();
      });
    });
    apply();
  });

  var playOne = function (box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.play-overlay');
    var url = box.getAttribute('data-video');
    if (!video || !url) {
      return;
    }
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    if (!box.getAttribute('data-ready')) {
      box.setAttribute('data-ready', '1');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        box._hls = hls;
      } else {
        video.src = url;
      }
    }
    var played = video.play();
    if (played && typeof played.catch === 'function') {
      played.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  };

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var overlay = box.querySelector('.play-overlay');
    var video = box.querySelector('video');
    if (overlay) {
      overlay.addEventListener('click', function () {
        playOne(box);
      });
    }
    box.addEventListener('click', function (event) {
      if (event.target === box) {
        playOne(box);
      }
    });
    if (video) {
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay && !video.currentTime) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  });
})();
