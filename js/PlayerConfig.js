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

    if (!videoSrc) {
      this.redirect();
      return;
    }

    video.muted = true; // helps autoplay
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn('Fatal HLS error:', data);
          hls.destroy();
          this.redirect();
        }
      });
    }
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari
      video.src = videoSrc;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(() => {});
      });
      video.addEventListener('error', () => this.redirect());
    }
    else {
      alert('Your browser does not support HLS playback.');
      this.redirect();
    }

    // Optional fullscreen trigger on first click
    document.addEventListener('click', () => {
      if (document.fullscreenElement == null) {
        video.requestFullscreen().catch(() => {});
      }
    }, { once: true });
  }
};
