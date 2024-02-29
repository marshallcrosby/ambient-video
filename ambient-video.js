/*!
    * Ambient video v0.0.2
    * Background video player with options.
    *
    * Copyright 2021-2024 Blend Interactive
    * https://blendinteractive.com
*/

(function() {
    Element.prototype.avSetAttributes = function (attrs) {
        Object.entries(attrs).forEach(([key, value]) => this.setAttribute(key, value));
    };

    const debounce = (func, delay) => {
        let timeoutId;
        return () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(func, delay);
        };
    };

    const customEvent = new Event('ambientResizeDone');
    const handleAmbientResizeDone = () => {
        window.dispatchEvent(customEvent);
    }

    const debouncedResizeHandler = debounce(handleAmbientResizeDone, 300);
    
    let windowWidth = window.innerWidth;
    let newWindowWidth;
    
    window.addEventListener('resize', () => {
        newWindowWidth = window.innerWidth;
        
        if (windowWidth !== newWindowWidth) {
            debouncedResizeHandler();
        }

        windowWidth = newWindowWidth;
    });

    const ambientVideoMarkup = /* html */`
        <video class="ambient-video__video" autoplay loop muted disableremoteplayback>
        </video>
    `;

    const ambientPosterMarkup = /* html */`
        <img class="ambient-video__poster">
    `;

    const ambientVideoButton = /* html */`
        <button class="ambient-video__control-btn" type="button" aria-label="Pause video"></button>
    `;
    
    const buildVideoElementAndPlay = function(element, options) {
        let settings = {
            videoID: options.videoID,
            videoSource: options.videoSource,
            videoPoster: options.videoPoster,
        }

        const videoDomElement = element.querySelector('.ambient-video__video');
        
        if (!videoDomElement) {
            const placeholderDiv = document.createElement('div');
        
            placeholderDiv.innerHTML = ambientVideoMarkup;
            element.querySelector('.ambient-video__media').appendChild(placeholderDiv);
            placeholderDiv.replaceWith(...placeholderDiv.childNodes)
        } else {
            element.querySelector('.ambient-video__media').innerHTML = ambientVideoMarkup;
        }

        const videoElement = element.querySelector('.ambient-video__video');
        
        videoElement.avSetAttributes({
            'autoplay': true,
            'loop': true,
            'muted': true,
            'poster': settings.videoPoster,
            'disableremoteplayback': true,
            'id': settings.videoID,
            'src': settings.videoSource
        });
        
        videoElement.play();
    }

    const displayPoster = (el) => {
        el.querySelector('.ambient-video__media').innerHTML = ambientPosterMarkup;
        el.querySelector('.ambient-video__poster').src = el.getAttribute('data-ambient-poster');
    }

    const ambientConstructor = (el) => {
        const videoID = el.getAttribute('data-ambient-id');
        const hasVideoControls = el.querySelector('.ambient-video__controls');
        const hasVideoElement = el.querySelector('.ambient-video__controls');
        
        // Build video controls
        if (!hasVideoControls) {
            const videoControls = document.createElement('div');
            videoControls.classList.add('ambient-video__controls');
            videoControls.innerHTML = ambientVideoButton;
            el.appendChild(videoControls);
        }
        
        // Cache play/pause button
        const videoPlayPauseBtn = el.querySelector('.ambient-video__control-btn');
        
        // Check if we should auto play video with sessionStorage
        if (
            sessionStorage.getItem('shouldPromoVideoAutoPlay' + videoID) === 'doAutoPlay' &&
            el.getAttribute('data-ambient-save-state') !== 'false'
        ) {
            if (!hasVideoElement) {
                buildVideoElementAndPlay(el, {
                    videoID: el.getAttribute('data-ambient-id'),
                    videoPoster: el.getAttribute('data-ambient-poster'),
                    videoSource: el.getAttribute('data-ambient-src'),
                });
    
                videoPlayPauseBtn.setAttribute('aria-label', 'Pause video');
            }
        } else {
            videoPlayPauseBtn.setAttribute('aria-label', 'Play video');
        }

        // Check if we should just play video if save state is false
        if (
            el.getAttribute('data-ambient-save-state') === 'false' ||
            el.getAttribute('data-ambient-save-state') === null)
        {
            if (!hasVideoElement) {
                buildVideoElementAndPlay(el, {
                    videoID: el.getAttribute('data-ambient-id'),
                    videoPoster: el.getAttribute('data-ambient-poster'),
                    videoSource: el.getAttribute('data-ambient-src'),
                });

                videoPlayPauseBtn.setAttribute('aria-label', 'Pause video');
            }
        }
        
        // Play/pause button
        videoPlayPauseBtn.addEventListener('click', () => {
            let videoEl = el.querySelector('video');

            if (videoPlayPauseBtn.getAttribute('aria-label').toLowerCase() === 'play video' && !videoEl) {
                
                buildVideoElementAndPlay(el, {
                    videoID: el.getAttribute('data-ambient-id'),
                    videoPoster: el.getAttribute('data-ambient-poster'),
                    videoSource: el.getAttribute('data-ambient-src'),
                });
                
                videoPlayPauseBtn.setAttribute('aria-label', 'Pause video');
                sessionStorage.setItem('shouldPromoVideoAutoPlay' + videoID, 'doAutoPlay');
            
            } else if (videoPlayPauseBtn.getAttribute('aria-label').toLowerCase() === 'play video' && videoEl) {
                sessionStorage.setItem('shouldPromoVideoAutoPlay' + videoID, 'doAutoPlay');
                videoPlayPauseBtn.setAttribute('aria-label', 'Pause video');
                videoEl.play();
            
            } else {
                sessionStorage.removeItem('shouldPromoVideoAutoPlay' + videoID);
                videoPlayPauseBtn.setAttribute('aria-label', 'Play video');
                videoEl.pause();
            }
        });
    }

    const ambientDestroy = (el) => {
        const videoEl = el.querySelector('.ambient-video__video');
        const videoControls = el.querySelector('.ambient-video__controls');

        if (videoEl) {

            videoEl.remove();
        }
        
        if (videoControls) {
            videoControls.remove();
        }
    }

    const ambientInit = (el) => {
        const breakpoint = el.getAttribute('data-ambient-breakpoint');

        if (breakpoint) {
            if (window.matchMedia(`(min-width: ${breakpoint})`).matches) {
                ambientConstructor(el);
            } else {
                ambientDestroy(el);
            }
        } else {
            if (!el.classList.contains('ambient-not-responsive')) {
                ambientConstructor(el);
            }

            el.classList.add('ambient-not-responsive');
        }
    }
    
    const ambientVideoParent = document.querySelectorAll('.ambient-video');

    ambientVideoParent.forEach(videoWrap => {
        
        // Build out media element
        const mediaElement = document.createElement('div');
        mediaElement.classList.add('ambient-video__media');
        videoWrap.appendChild(mediaElement);

        displayPoster(videoWrap);
        ambientInit(videoWrap);
    });

    window.addEventListener('ambientResizeDone', () => {
        ambientVideoParent.forEach(videoWrap => {
            ambientInit(videoWrap);
        });
    });
})();