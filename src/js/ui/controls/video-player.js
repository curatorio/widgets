import EventBus from "../../core/bus";
import z from "../../core/lib";

class VideoPlayer extends EventBus {
    constructor (videoElement) {
        super();

        this.element = videoElement[0];
        this.videoPlaying = false;

        this.element.addEventListener( "loadedmetadata", this.onMetaData.bind(this));
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

    onMetaData () {
        let width = this.element.videoWidth,
            height = this.element.videoHeight;

        if (width===height) {
            z(this.element).addClass('aspect-square');
        } else if (width > height) {
            z(this.element).addClass('aspect-landscape');
        } else {
            z(this.element).addClass('aspect-portrait');
        }
    }

    destroy() {
        super.destroy();
        this.element.removeEventListener("loadedmetadata", this.onMetaData.bind(this));

        if (this.videoPlaying) {
            this.element.pause();
        }
    }
}

export default VideoPlayer;