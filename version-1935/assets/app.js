(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setActiveNav() {
    var current = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a").forEach(function (link) {
      var target = link.getAttribute("href");
      if (target === current) {
        link.classList.add("active");
      }
      if (current.indexOf("category-") === 0 && target === "categories.html") {
        link.classList.add("active");
      }
      if (current.indexOf("movie-") === 0 && target === "rankings.html") {
        link.classList.add("active");
      }
    });
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var forms = document.querySelectorAll("[data-filter-form]");
    forms.forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var empty = document.querySelector("[data-filter-empty]");
      var query = new URLSearchParams(window.location.search).get("q") || "";

      function applyFilter() {
        var value = (input.value || "").trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = ((card.dataset.title || "") + " " + (card.dataset.tags || "")).toLowerCase();
          var matched = !value || text.indexOf(value) !== -1;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });
      input.addEventListener("input", applyFilter);

      if (query) {
        input.value = query;
        applyFilter();
      }
    });
  }

  function setupPlayers() {
    document.querySelectorAll("[data-video-player]").forEach(function (video) {
      var shell = video.closest(".player-shell");
      var shade = shell ? shell.querySelector("[data-player-shade]") : null;
      var streamUrl = video.dataset.stream;
      var prepared = false;
      var hlsPlayer = null;

      function prepare() {
        if (prepared || !streamUrl) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsPlayer = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsPlayer.loadSource(streamUrl);
          hlsPlayer.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        prepared = true;
      }

      function start() {
        prepare();
        video.controls = true;
        if (shade) {
          shade.classList.add("is-hidden");
        }
        var playRequest = video.play();
        if (playRequest && typeof playRequest.catch === "function") {
          playRequest.catch(function () {});
        }
      }

      if (shade) {
        shade.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsPlayer) {
          hlsPlayer.destroy();
        }
      });
    });
  }

  ready(function () {
    setActiveNav();
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
