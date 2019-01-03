
import SocialFacebook from '../../social/facebook';
import SocialTwitter from '../../social/twitter';
import Logger from '../../core/logger';
import Events from '../../core/events';
import z from '../../core/lib';
import Control from '../controls/control';
import VideoPlayer from "../controls/video-player";

class Post extends Control {
    constructor (widget, postJson, options) {
        super();

        this.options = options;
        this.widget = widget;

        this.json = postJson;
        this.templateId = this.widget.options.templatePost;

        this.$refs = {
            spacer:null,
            postC:null,
        };

        this.render ();

        if (this.widget.config('post.imageHeight', '100%')) {
            this.$refs.spacer.css('padding-bottom', this.options.post.imageHeight);
        }

        if (this.json.video) {
            this.$el.addClass('crt-post-has-video');

            if (this.json.video.indexOf('youtu') === -1 && this.json.video.indexOf('vimeo') === -1 ) {
                // Normal video - not YouTube or Vimeo
                this.videoPlayer = new VideoPlayer(this.$refs.video);
                this.videoPlayer.on('state:changed', (event, playing) => {
                    Logger.log('state:changed '+playing);

                    this.$el.toggleClass('crt-post-video-playing', playing);
                });
                this.videoPlayer.play();

                // if (this.options.autoPlayVideos) {
                //     this.rafContainer = widget.$container[0];
                //     this.reqCount = 0;
                //     this.raf = window.requestAnimationFrame(this.rafTick.bind(this));
                // }
            }
        }

        // this.$refs.postC.click(this.onPostClick.bind(this));

        if (this.json.url.indexOf('http') !== 0) {
            this.$el.find('.crt-post-share').hide ();
        }

        if (this.json.images && this.json.images.length > 0) {
            this.$el.addClass('crt-has-image-carousel');
        }
    }

    onShareFacebookClick () {
        SocialFacebook.share(this.json);
        this.widget.track('share:facebook');
    }

    onShareTwitterClick () {
        SocialTwitter.share(this.json);
        this.widget.track('share:twitter');
    }

    onPostClick (ev) {
        Logger.log('Post->click');

        let target = z(ev.target);

        if (target[0] && target[0].className.indexOf('read-more') > 0) {
            // ignore read more clicks
            return;
        }

        if (target.is('a') && target.attr('href') !== '#' && target.attr('href') !== 'javascript:;') {
            this.widget.track('click:link');
        } else {
            ev.preventDefault();
            this.trigger(Events.POST_CLICK, this, ev);
        }
    }

    setHeight () {
        let height = this.$refs.postC.height();
        if (this.options.maxHeight && this.options.maxHeight > 0 && height > this.options.maxHeight) {
            this.$refs.postC.css({maxHeight: this.options.maxHeight});
            this.$el.addClass('crt-post-max-height');
        }

        this.layout();
    }

    getHeight () {
        if (this.$el.hasClass('crt-post-max-height')) {
            return this.$refs.postC.height();
        } else {
            // let $pane = z(this.$panes[i]);
            let contentHeight = this.$el.find('.crt-post-content').height();
            let footerHeight = this.$el.find('.crt-post-footer').height();
            return contentHeight + footerHeight + 2;
        }
    }

    rafTick () {
        if (this.reqCount % 50 === 0) {
            // Only trigger every 50 frames ...
            let h = this.rafContainer.offsetHeight;
            let visible = this.testInFrame(h);

            if (visible && !this.videoPlayer.isPlaying()) {
                this.videoPlayer.play();
            } else if (!visible && this.videoPlayer.isPlaying()) {
                this.videoPlayer.pause();
            }
        }
        this.reqCount ++;
        this.raf = window.requestAnimationFrame(this.rafTick.bind(this));
    }

    layout () {
        // Logger.log("Post->layout");
        this.layoutFooter();
        this.trigger(Events.POST_LAYOUT_CHANGED, this);
    }

    layoutFooter () {
        // Logger.log("Post->layoutFooter");
        let $userName = this.$el.find('.crt-post-username');
        let $date = this.$el.find('.crt-date');
        let $footer = this.$el.find('.crt-post-footer');
        let $share = this.$el.find('.crt-post-share');
        let $userImage = this.$el.find('.crt-post-userimage');

        let footerWidth = $footer.width();
        let padding = 40;
        let elementsWidth = $userName.width() + $date.width() + $share.width() + $userImage.width() + padding;

        if (elementsWidth > footerWidth) {
            $userName.hide();
        }
    }
}

export default Post;