var PlayerConfig = PlayerConfig || {};

PlayerConfig = {
  getUrlParam: function (name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

  redirect: function () {
    window.location.href = '/?ref=liveplayer';
  },

  init: function () {
    const videoSrc = this.getUrlParam('url');
    const video = document.getElementById('video');
    const self = this;

    if (!videoSrc) {
      self.redirect();
      return;
    }

    // Start muted for autoplay
    video.muted = true;

    // First click → unmute + fullscreen (optional)
    const firstClickHandler = () => {
      video.muted = false;
      video.volume = 1.0;
      if (document.fullscreenElement == null) {
        video.requestFullscreen().catch(() => {});
      }
      document.removeEventListener('click', firstClickHandler);
    };
    document.addEventListener('click', firstClickHandler, { once: true });

    // --- HLS / Safari setup ---
    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          console.warn('Fatal HLS error:', data);
          hls.destroy();
          self.redirect();
        }
      });
    }
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = videoSrc;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(() => {});
      });
      video.addEventListener('error', function () {
        self.redirect();
      });
    }
    else {
      alert('Your browser does not support HLS playback.');
      self.redirect();
    }
  }
};
