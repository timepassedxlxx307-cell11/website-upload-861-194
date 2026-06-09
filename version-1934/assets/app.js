(function () {
    var searchData = window.movieIndex || [];

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function closePanels(except) {
        selectAll("[data-search-results]").forEach(function (panel) {
            if (panel !== except) {
                panel.classList.remove("open");
            }
        });
    }

    function renderSearch(box, query) {
        var panel = box.querySelector("[data-search-results]");
        if (!panel) {
            return;
        }
        var keyword = query.trim().toLowerCase();
        if (!keyword) {
            panel.classList.remove("open");
            panel.innerHTML = "";
            return;
        }
        var results = searchData.filter(function (item) {
            return item.text.indexOf(keyword) !== -1;
        }).slice(0, 12);
        panel.innerHTML = results.map(function (item) {
            return '<a class="search-result" href="./' + item.href + '">' +
                '<img src="' + item.cover + '" alt="' + item.title + '">' +
                '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span>' +
                '</a>';
        }).join("");
        panel.classList.toggle("open", results.length > 0);
        closePanels(panel);
    }

    function setupSearch() {
        selectAll("[data-search-box]").forEach(function (box) {
            var input = box.querySelector("[data-search-input]");
            if (!input) {
                return;
            }
            input.addEventListener("input", function () {
                renderSearch(box, input.value);
            });
            input.addEventListener("focus", function () {
                renderSearch(box, input.value);
            });
        });
        document.addEventListener("click", function (event) {
            if (!event.target.closest("[data-search-box]")) {
                closePanels(null);
            }
        });
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupLocalFilter() {
        var input = document.querySelector("[data-local-filter]");
        var cards = selectAll(".filter-targets .movie-card");
        if (!input || !cards.length) {
            return;
        }
        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var matched = card.textContent.toLowerCase().indexOf(keyword) !== -1;
                card.classList.toggle("is-hidden-by-filter", keyword && !matched);
            });
        });
    }

    window.initMoviePlayer = function (videoId, buttonId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var attached = false;
        var hls = null;

        if (!video || !button || !streamUrl) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (_event, data) {
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
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attach();
            button.classList.add("hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    button.classList.remove("hidden");
                });
            }
        }

        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("hidden");
            }
        });
    };

    setupMenu();
    setupSearch();
    setupHero();
    setupLocalFilter();
})();
