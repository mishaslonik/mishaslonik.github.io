var UserInfo = UserInfo || {
    id: null,
    name: null,
    preferences: {},
    playlist: [],
    currentIndex: 0,
    DataLoaded: false,
};

var PlayerConfig = PlayerConfig || {};

PlayerConfig = {
    ApiUrl: 'https://medjoker.pythonanywhere.com/?UserName=',

    getUrlParam: function (name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    redirect: function (warnText) {

        let url = '/?ref=liveplayer';
        if(warnText)
        {
            url+='&WarnMsg=' + encodeURIComponent(warnText);
        }
        window.location.href = url;
    },

    fetchPlaylists: function (userName) {
        fetch(this.ApiUrl + encodeURIComponent(userName))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                UserInfo.UserResponse = data;
                this.parseUserData(data);
            })
            .catch(err => {
                console.error('Failed to fetch playlists:', err);
                UserInfo.playlist = [];
            })
            .finally(() => {
                UserInfo.DataLoaded = true;
            });
    },
    parseUserData: function (data) {
        UserInfo.Status = data?.data?.liveRoom?.status || 4;
        UserInfo.playlist = [];
    
        const streamDataStr = data?.data?.liveRoom?.streamData?.pull_data?.stream_data;
    
        if (streamDataStr) {
            try {
                const streamData = JSON.parse(streamDataStr);
    
                if (streamData.data) {
                    // Push known quality streams if present
                    const qualities = ['origin', 'uhd', 'hd', 'sd'];
                    qualities.forEach(q => {
                        const url = streamData.data[q]?.main?.hls;
                        if (url) UserInfo.playlist.push(url);
                    });
    
                    // Push any other streams except "ao"
                    Object.keys(streamData.data).forEach(key => {
                        if (key === "ao") return;
                        const url = streamData.data[key]?.main?.hls;
                        if (url && !UserInfo.playlist.includes(url)) {
                            UserInfo.playlist.push(url);
                        }
                    });
                }
            } catch (error) {
                // optionally log or handle parse error
                console.error('Failed to parse streamDataStr:', error);
            }
        }
    },

    tryNextUrl: function () {
        if (!UserInfo.DataLoaded) {
            // Retry until playlist data is loaded
            setTimeout(() => this.tryNextUrl(), 100);
            return;
        }

        if(UserInfo.Status == 4)
        {
            this.redirect(`Користувач @${UserInfo.name} Офлайн!`);
        }

        if (UserInfo.currentIndex >= UserInfo.playlist.length) {
            // No more URLs → redirect
            this.redirect(`Лінк на трансляцію не актуальний! Запросіть новий у бота`);
            return;
        }

        const videoSrc = UserInfo.playlist[UserInfo.currentIndex];
        UserInfo.currentIndex++;
        this.playVideo(videoSrc);
    },

    playVideo: function (videoSrc) {
        const video = document.getElementById('video');
        const self = this;

        // Reset video state
        video.pause();
        video.removeAttribute('src');
        video.load();
        video.muted = true;

        // First click → unmute + fullscreen (set once)
        if (!this._firstClickHandlerAdded) {
            const firstClickHandler = () => {
                video.muted = false;
                video.volume = 1.0;
                if (document.fullscreenElement == null) {
                    video.requestFullscreen().catch(() => { });
                }
                document.removeEventListener('click', firstClickHandler);
            };
            document.addEventListener('click', firstClickHandler, { once: true });
            this._firstClickHandlerAdded = true;
        }

        // --- HLS.js mode ---
        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            if (this._hlsInstance) {
                this._hlsInstance.destroy();
            }
            this._hlsInstance = new Hls();
            this._hlsInstance.loadSource(videoSrc);
            this._hlsInstance.attachMedia(video);

            this._hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(() => { });
            });

            this._hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    console.warn('Fatal HLS error:', data);
                    self._hlsInstance.destroy();
                    self.tryNextUrl();
                }
            });
        }
        // --- Safari native HLS ---
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoSrc;
            video.addEventListener('loadedmetadata', function () {
                video.play().catch(() => { });
            }, { once: true });
            video.addEventListener('error', function () {
                self.tryNextUrl();
            }, { once: true });
        }
        // --- Unsupported browser ---
        else {
            alert('Your browser does not support HLS playback.');
            this.redirect();
        }
    },

    init: function () {
        const userName = this.getUrlParam('u');
        if (!userName) {
            this.redirect();
            return;
        }

        UserInfo.name = userName;
        UserInfo.DataLoaded = false;
        UserInfo.currentIndex = 0;

        this.fetchPlaylists(userName);

        const videoSrc = this.getUrlParam('url');
        this.playVideo(videoSrc);
        //this.tryNextUrl(); // Will wait until DataLoaded == true
    }
};
