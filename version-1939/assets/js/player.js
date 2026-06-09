(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var stage = document.querySelector("[data-player]");
    if (!stage) {
      return;
    }
    var video = stage.querySelector("video");
    var cover = stage.querySelector(".player-cover");
    var source = video ? video.getAttribute("data-stream") : "";
    var hlsInstance = null;
    var started = false;

    function playVideo() {
      if (!video || !source) {
        return;
      }
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (!started) {
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().catch(function() {});
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
            video.play().catch(function() {});
          });
        } else {
          video.src = source;
          video.play().catch(function() {});
        }
      } else {
        video.play().catch(function() {});
      }
    }

    if (cover) {
      cover.addEventListener("click", playVideo);
    }
    var button = stage.querySelector(".player-play");
    if (button) {
      button.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }
    video.addEventListener("click", function() {
      if (video.paused) {
        video.play().catch(function() {});
      }
    });
    window.addEventListener("pagehide", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
