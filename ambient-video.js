/*!
    * Ambient video v0.0.1
    * Background video player with options.
    *
    * Copyright 2021-2024 Blend Interactive
    * https://blendinteractive.com
*/

Element.prototype.avSetAttributes = function (attrs) {
    for(let key in attrs) {
        this.setAttribute(key, attrs[key]);
    }
};

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

const ambientVideoParent = document.querySelectorAll('.ambient-video');

const buildVideoElementAndPlay = function(element, options) {
    let settings = {
        videoID: options.videoID,
        videoSource: options.videoSource,
        videoPoster: options.videoPoster,
    }
    
    element.querySelector('.ambient-video__media').innerHTML = ambientVideoMarkup;
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

ambientVideoParent.forEach(videoWrap => {
    const videoID = videoWrap.getAttribute('data-ambient-id');

    // Build video controls
    const videoControls = document.createElement('div');
    videoControls.classList.add('ambient-video__controls');
    videoControls.innerHTML = ambientVideoButton;
    videoWrap.appendChild(videoControls);
    
    // Cache play/pause button
    videoPlayPauseBtn = videoWrap.querySelector('.ambient-video__control-btn');
    
    // Check if we should auto play video with sessionStorage
    if (
        sessionStorage.getItem('shouldPromoVideoAutoPlay' + videoID) === 'doAutoPlay' &&
        videoWrap.getAttribute('data-ambient-save-state') !== 'false'
    ) {
        buildVideoElementAndPlay(videoWrap, {
            videoID: videoWrap.getAttribute('data-ambient-id'),
            videoPoster: videoWrap.getAttribute('data-ambient-poster'),
            videoSource: videoWrap.getAttribute('data-ambient-src'),
        });

        videoPlayPauseBtn.setAttribute('aria-label', 'Pause video');
    } else {
        videoWrap.querySelector('.ambient-video__media').innerHTML = ambientPosterMarkup;
        videoWrap.querySelector('.ambient-video__poster').src = videoWrap.getAttribute('data-ambient-poster');
        videoPlayPauseBtn.setAttribute('aria-label', 'Play video');
    }

    // Check if we should just play video if save state is false
    if (
        videoWrap.getAttribute('data-ambient-save-state') === 'false' ||
        videoWrap.getAttribute('data-ambient-save-state') === null)
    {
        buildVideoElementAndPlay(videoWrap, {
            videoID: videoWrap.getAttribute('data-ambient-id'),
            videoPoster: videoWrap.getAttribute('data-ambient-poster'),
            videoSource: videoWrap.getAttribute('data-ambient-src'),
        });

        videoPlayPauseBtn.setAttribute('aria-label', 'Pause video');
    }
    
    
    // Play/pause button
    videoPlayPauseBtn.addEventListener('click', () => {
        let videoEl = videoWrap.querySelector('video');

        if (videoPlayPauseBtn.getAttribute('aria-label').toLowerCase() === 'play video' && !videoEl) {
            
            buildVideoElementAndPlay(videoWrap, {
                videoID: videoWrap.getAttribute('data-ambient-id'),
                videoPoster: videoWrap.getAttribute('data-ambient-poster'),
                videoSource: videoWrap.getAttribute('data-ambient-src'),
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
});