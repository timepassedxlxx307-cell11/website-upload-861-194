function ready(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

function normalize(value) {
  return (value || "").toString().trim().toLowerCase();
}

function initMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");
  if (!button || !panel) {
    return;
  }
  button.addEventListener("click", () => {
    panel.classList.toggle("is-open");
  });
}

function initHero() {
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  if (slides.length <= 1) {
    return;
  }
  let current = 0;
  let timer = null;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  };
  const play = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(current + 1), 5200);
  };
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index);
      play();
    });
  });
  show(0);
  play();
}

function initFilters() {
  const filterInputs = Array.from(document.querySelectorAll("[data-filter-input]"));
  if (!filterInputs.length) {
    return;
  }
  const cards = Array.from(document.querySelectorAll("[data-card]"));
  const empty = document.querySelector("[data-empty-state]");
  const apply = () => {
    const queryInput = document.querySelector("[data-filter-query]");
    const regionInput = document.querySelector("[data-filter-region]");
    const typeInput = document.querySelector("[data-filter-type]");
    const query = normalize(queryInput && queryInput.value);
    const region = normalize(regionInput && regionInput.value);
    const type = normalize(typeInput && typeInput.value);
    let visible = 0;
    cards.forEach((card) => {
      const haystack = normalize(card.textContent + " " + Object.values(card.dataset).join(" "));
      const cardRegion = normalize(card.dataset.region);
      const cardType = normalize(card.dataset.type);
      const matched = (!query || haystack.includes(query)) && (!region || cardRegion === region) && (!type || cardType === type);
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  };
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  const queryInput = document.querySelector("[data-filter-query]");
  if (q && queryInput) {
    queryInput.value = q;
  }
  filterInputs.forEach((input) => {
    input.addEventListener("input", apply);
    input.addEventListener("change", apply);
  });
  apply();
}

ready(() => {
  initMenu();
  initHero();
  initFilters();
});

export async function initPlayer(options) {
  const video = document.getElementById(options.videoId);
  const overlay = document.getElementById(options.overlayId);
  if (!video || !options.url) {
    return;
  }
  let prepared = false;
  let loading = null;
  const attach = async () => {
    if (prepared) {
      return;
    }
    if (loading) {
      await loading;
      return;
    }
    loading = (async () => {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.url;
      } else {
        const module = await import("./hls-dru42stk.js");
        const Hls = module.H;
        if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(options.url);
          hls.attachMedia(video);
          video.hlsInstance = hls;
        } else {
          video.src = options.url;
        }
      }
      prepared = true;
    })();
    await loading;
  };
  const start = async () => {
    await attach();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.controls = true;
    const action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(() => {});
    }
  };
  if (overlay) {
    overlay.addEventListener("click", start);
  }
  video.addEventListener("click", () => {
    if (!prepared && video.paused) {
      start();
    }
  }, { once: true });
}
