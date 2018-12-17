import EventBus from "../../core/bus";

class VideoPlayer extends EventBus {
    constructor (videoElement) {
        super();

        this.element = videoElement;
        this.videoPlaying = false;
    }


    play () {
        let playPromise = this.element.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                    this.videoPlaying = true;
                    this.trigger('state:changed', this.videoPlaying);
                })
                .catch(() => {
                    // console.error('Video failed to play', error);
                });
        } else {
            this.videoPlaying = true;
            this.trigger('state:changed', this.videoPlaying);
        }
    }

    pause () {
        this.element.pause();
        this.videoPlaying = false;
        this.trigger('state:changed', this.videoPlaying);
    }

    playPause () {
        if (!this.videoPlaying) {
            this.play ();
        } else {
            this.pause ();
        }
    }
    
    isPlaying() {
        return this.videoPlaying;
    }

    destroy() {
        super.destroy();

        if (this.videoPlaying) {
            this.element.pause();
        }
    }
}

export default VideoPlayer;