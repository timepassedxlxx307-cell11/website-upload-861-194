(function () {
  var frame = document.querySelector('[data-player-frame]');

  if (!frame) {
    return;
  }

  var video = frame.querySelector('video[data-stream]');
  var cover = frame.querySelector('[data-play-cover]');
  var stream = video ? video.getAttribute('data-stream') : '';
  var hls = null;
  var ready = false;

  function prepare() {
    if (ready || !video || !stream) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }

    video.src = stream;
  }

  function playVideo() {
    prepare();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && promise.catch) {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
