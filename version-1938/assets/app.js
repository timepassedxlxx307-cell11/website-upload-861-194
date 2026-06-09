(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var navToggle = document.querySelector('[data-nav-toggle]');
  var mainNav = document.querySelector('[data-main-nav]');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    var slides = all('.hero-slide', hero);
    var dots = all('.hero-dot', hero);
    var index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  all('[data-local-search]').forEach(function (input) {
    var scope = document.querySelector(input.getAttribute('data-local-search')) || document;
    var cards = all('.movie-card', scope);
    var emptyState = scope.querySelector('[data-empty-state]');

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || '').toLowerCase();
        var matched = !query || text.indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    });
  });

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.SITE_MOVIE_INDEX) {
    var searchInput = searchPage.querySelector('[data-global-search]');
    var searchResults = searchPage.querySelector('[data-search-results]');
    var searchState = searchPage.querySelector('[data-search-state]');

    function card(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-cover" href="./' + movie.file + '" style="background-image: linear-gradient(180deg, rgba(20, 20, 20, 0.08), rgba(20, 20, 20, 0.58)), url(' + movie.image + ');">',
        '    <span class="cover-chip">' + movie.type + '</span>',
        '    <span class="cover-year">' + movie.year + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-card-topline">',
        '      <a href="./category-' + movie.categorySlug + '.html">' + movie.categoryName + '</a>',
        '      <span>★ ' + movie.rating + '</span>',
        '    </div>',
        '    <h2><a href="./' + movie.file + '">' + movie.title + '</a></h2>',
        '    <p>' + movie.oneLine + '</p>',
        '    <div class="movie-card-meta">',
        '      <span>' + movie.region + '</span>',
        '      <span>' + movie.genreShort + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function runSearch() {
      var query = searchInput.value.trim().toLowerCase();
      var source = window.SITE_MOVIE_INDEX;
      var matches = source.filter(function (movie) {
        if (!query) {
          return movie.hot;
        }
        return movie.searchText.toLowerCase().indexOf(query) !== -1;
      }).slice(0, 80);

      searchResults.innerHTML = matches.map(card).join('');
      searchState.textContent = matches.length ? '匹配结果如下' : '没有找到相关影片';
    }

    searchInput.addEventListener('input', runSearch);
    runSearch();
  }
})();
