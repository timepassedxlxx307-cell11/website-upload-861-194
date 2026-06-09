(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  var catalogs = Array.prototype.slice.call(document.querySelectorAll('[data-catalog]'));

  catalogs.forEach(function (catalog) {
    var search = catalog.querySelector('[data-filter-search]');
    var year = catalog.querySelector('[data-filter-year]');
    var type = catalog.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(catalog.querySelectorAll('.movie-card'));

    function applyFilters() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();

        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matchedType = !typeValue || card.getAttribute('data-type') === typeValue;
        card.classList.toggle('hidden-by-filter', !(matchedKeyword && matchedYear && matchedType));
      });
    }

    if (search) {
      search.addEventListener('input', applyFilters);
    }

    if (year) {
      year.addEventListener('change', applyFilters);
    }

    if (type) {
      type.addEventListener('change', applyFilters);
    }
  });

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');

  function createSearchCard(item) {
    return [
      '<article class="movie-card" data-title="' + escapeHtml(item.title) + '" data-year="' + escapeHtml(item.year) + '" data-type="' + escapeHtml(item.type) + '" data-region="' + escapeHtml(item.region) + '" data-genre="' + escapeHtml(item.genre) + '">',
      '<a class="poster-link" href="./' + item.file + '" aria-label="' + escapeHtml(item.title) + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-gradient"></span>',
      '<span class="type-badge">' + escapeHtml(item.type) + '</span>',
      '<span class="play-hover">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + '</p>',
      '<p class="movie-one-line">' + escapeHtml(item.oneLine) + '</p>',
      '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function runSearch(query) {
    if (!searchResults || !window.SEARCH_INDEX) {
      return;
    }

    var normalized = String(query || '').trim().toLowerCase();

    if (!normalized) {
      searchResults.innerHTML = window.SEARCH_INDEX.slice(0, 24).map(createSearchCard).join('');
      return;
    }

    var results = window.SEARCH_INDEX.filter(function (item) {
      return [item.title, item.year, item.type, item.region, item.genre, item.tags, item.oneLine]
        .join(' ')
        .toLowerCase()
        .indexOf(normalized) !== -1;
    }).slice(0, 120);

    searchResults.innerHTML = results.map(createSearchCard).join('');
  }

  if (searchForm && searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;
    runSearch(initial);

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = searchInput.value.trim();
      var nextUrl = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      history.replaceState(null, '', nextUrl);
      runSearch(query);
    });

    searchInput.addEventListener('input', function () {
      runSearch(searchInput.value);
    });
  }
})();
