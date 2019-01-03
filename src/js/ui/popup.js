import Logger from '../core/logger';
import SocialFacebook from '../social/facebook';
import SocialTwitter from '../social/twitter';
import StringUtils from '../utils/string';
import z from '../core/lib';
import CommonUtils from "../utils/common";
import VideoPlayer from "./controls/video-player";
import Control from './controls/control';

class Popup extends Control {
    
    constructor (popupManager, post, widget) {
        Logger.log("Popup->init ");
        super();

        this.popupManager = popupManager;
        this.json = post;
        this.widget = widget;

        this.templateId = this.widget.config('popup.template');

        this.render();

        if (this.json.image) {
            this.$el.addClass('has-image');
        }

        if (this.json.url) {
            this.$el.addClass('crt-has-read-more');
        }

        if (this.json.video) {
            this.$el.addClass('has-video');
            if (this.json.video && this.json.video.indexOf('youtu') >= 0) {
                // youtube
                this.$refs.video.remove();

                let youTubeId = StringUtils.youtubeVideoId(this.json.video);

                let src = `<div class="crt-responsive-video"><iframe id="ytplayer" src="https://www.youtube.com/embed/${youTubeId}?autoplay=0&rel=0&showinfo" frameborder="0" allowfullscreen></iframe></div>`;
                this.$el.find('.crt-video-container img').remove();
                this.$el.find('.crt-video-container a').remove();
                this.$el.find('.crt-video-container').append(src);
            } else if (this.json.video && this.json.video.indexOf('vimeo') >= 0) {
                // youtube
                this.$refs.video.remove();

                let vimeoId = StringUtils.vimeoVideoId(this.json.video);

                if (vimeoId) {
                    let src = `<div class="crt-responsive-video"><iframe src="https://player.vimeo.com/video/${vimeoId}?color=ffffff&title=0&byline=0&portrait=0" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>`;
                    this.$el.find('.crt-video-container img').remove();
                    this.$el.find('.crt-video-container a').remove();
                    this.$el.find('.crt-video-container').append(src);
                }
            } else {
                // Normal video
                this.videoPlayer = new VideoPlayer(this.$refs.video);
                this.videoPlayer.on('state:changed', (event, playing) => {
                    this.$el.toggleClass('video-playing', playing );
                });
            }
        }

        if (this.json.images)
        {
            this.$page = this.$el.find('.crt-pagination ul');
            for (let i = 0;i < this.json.images.length;i++) {
                this.$page.append('<li><a href="" data-page="'+i+'"></a></li>');
            }
            this.$page.find('a').click(this.onPageClick.bind(this));
            this.currentImage = 0;
            this.$page.find('li:nth-child('+(this.currentImage+1)+')').addClass('selected');
        }

        z(window).on('resize.crt-popup', CommonUtils.debounce(this.onResize.bind(this),50));

        this.onResize ();
    }

    onResize () {
        Logger.log('Popup->onResize');
        let windowWidth = z(window).width ();
        let padding = 60;
        let paddingMobile = 40;
        let rightPanel = 335;
        let leftPanelMax = 600;

        if (windowWidth > 1055) {
            this.$refs.left.width(leftPanelMax+rightPanel);
        } else if (windowWidth > 910) {
            this.$refs.left.width(windowWidth-(padding*2));
        } else if (windowWidth > leftPanelMax+(paddingMobile*2)) {
            this.$refs.left.width(600);
        } else {
            this.$refs.left.width(windowWidth-(paddingMobile*2));
        }
    }

    onPageClick (ev) {
        ev.preventDefault();
        let a = z(ev.target);
        let page = a.data('page');

        let image = this.json.images[page];

        this.$el.find('.crt-image img').attr('src', image.url);
        this.currentImage = page;

        this.$page.find('li').removeClass('selected');
        this.$page.find('li:nth-child('+(this.currentImage+1)+')').addClass('selected');
    }

    onShareFacebookClick () {
        SocialFacebook.share(this.json);
        this.widget.track('share:facebook');
        return false;
    }

    onShareTwitterClick () {
        SocialTwitter.share(this.json);
        this.widget.track('share:twitter');
        return false;
    }

    onClose () {
        this.hide(()=>{
            this.popupManager.onClose();
        });
    }

    onPrevious () {
        this.popupManager.onPrevious();
    }

    onNext () {
        this.popupManager.onNext();
    }

    onPlay () {
        Logger.log('Popup->onPlay');
        this.videoPlayer.playPause();
    }

    show () {
        this.$el.fadeIn( () => {

        });
    }
    
    hide (callback) {
        Logger.log('Popup->hide');

        if (this.videoPlayer) {
            this.videoPlayer.pause();
        }

        this.$el.fadeOut(() => {
            this.destroy();
            callback ();
        });
    }
    
    destroy () {
        super.destroy();

        if (this.videoPlayer) {
            this.videoPlayer.destroy();
        }

        if (this.$el && this.$el.length) {
            this.$el.remove();
        }

        z(window).off('resize.crt-popup');

        delete this.$el;
    }
}

export default Popup;