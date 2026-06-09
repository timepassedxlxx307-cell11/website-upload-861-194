(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("#site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function() {
        nav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var index = 0;
      var timer = null;
      var show = function(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      };
      var start = function() {
        timer = window.setInterval(function() {
          show(index + 1);
        }, 5200);
      };
      var reset = function() {
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      };
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      if (prev) {
        prev.addEventListener("click", function() {
          show(index - 1);
          reset();
        });
      }
      if (next) {
        next.addEventListener("click", function() {
          show(index + 1);
          reset();
        });
      }
      dots.forEach(function(dot, i) {
        dot.addEventListener("click", function() {
          show(i);
          reset();
        });
      });
      show(0);
      start();
    }

    var quickForm = document.querySelector("[data-quick-search]");
    if (quickForm) {
      quickForm.addEventListener("submit", function(event) {
        event.preventDefault();
        var input = quickForm.querySelector("input");
        var value = input ? input.value.trim() : "";
        var target = quickForm.getAttribute("action") || "search.html";
        window.location.href = target + (value ? "?q=" + encodeURIComponent(value) : "");
      });
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var input = document.querySelector("[data-filter-input]");
    var genre = document.querySelector("[data-filter-genre]");
    var year = document.querySelector("[data-filter-year]");
    var region = document.querySelector("[data-filter-region]");
    var noResults = document.querySelector("[data-no-results]");

    if (cards.length && (input || genre || year || region)) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (input && query) {
        input.value = query;
      }
      var normalize = function(value) {
        return String(value || "").toLowerCase();
      };
      var filter = function() {
        var q = normalize(input ? input.value : "");
        var g = normalize(genre ? genre.value : "");
        var y = normalize(year ? year.value : "");
        var r = normalize(region ? region.value : "");
        var visible = 0;
        cards.forEach(function(card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre
          ].join(" "));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (g && normalize(card.dataset.genre).indexOf(g) === -1) {
            ok = false;
          }
          if (y && normalize(card.dataset.year).indexOf(y) === -1) {
            ok = false;
          }
          if (r && normalize(card.dataset.region).indexOf(r) === -1) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (noResults) {
          noResults.classList.toggle("is-visible", visible === 0);
        }
      };
      [input, genre, year, region].forEach(function(el) {
        if (el) {
          el.addEventListener("input", filter);
          el.addEventListener("change", filter);
        }
      });
      filter();
    }
  });
})();
