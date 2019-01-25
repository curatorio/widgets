
import SocialFacebook from '../../social/facebook';
import SocialTwitter from '../../social/twitter';
import Logger from '../../core/logger';
import Events from '../../core/events';
import z from '../../core/lib';
import Control from '../controls/control';
import VideoPlayer from "../controls/video-player";


class BasePost extends Control {
    constructor (widget, postJson) {
        super();

        this.widget = widget;
        this.json = postJson;
        this.templateId = this.widget.config('post.template');
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

    onReadMoreClick (ev) {
        this.widget.track('click:read-more');
        this.trigger(Events.POST_CLICK_READ_MORE, this, this.json, ev);
    }

    setupVideo () {
        if (this.json.video) {
            this.$el.addClass('crt-post-has-video');

            if (this.json.video.indexOf('youtu') === -1 && this.json.video.indexOf('vimeo') === -1 ) {
                // Normal video - not YouTube or Vimeo
                if (this.widget.config('post.autoPlayVideos')) {
                    if (this.$refs.video) {
                        this.videoPlayer = new VideoPlayer(this.$refs.video);
                        this.videoPlayer.on('state:changed', (event, playing) => {
                            this.$el.toggleClass('crt-post-video-playing', playing);
                        });
                        this.videoPlayer.play();
                    }
                }
            }
        }
    }

    setupCarousel () {
        if (this.json.images && this.json.images.length > 0) {
            this.$el.addClass('crt-has-image-carousel');
        }
    }

    setupCommentsLikes () {
        if (this.widget.config('post.showComments')) {
            this.$el.addClass('crt-show-comments');
        }
        if (this.widget.config('post.showLikes')) {
            this.$el.addClass('crt-show-likes');
        }
    }

    setupUserNameImage () {
        if (!this.json.user_image || this.json.user_image === 'https://cdn.curator.io/0.gif') {
            this.$el.addClass('crt-hide-user-image');
        }
        if (!this.json.user_full_name || this.json.user_full_name === '') {
            this.$el.addClass('crt-hide-user-full-name');
        }
        if (!this.json.user_screen_name || this.json.user_screen_name === '') {
            this.$el.addClass('crt-hide-user-screen-name');
        }
    }

    setupShare () {


        if (this.json.url.indexOf('http') !== 0) {
            this.$el.addClass('crt-post-hide-share');
        } else if (!this.widget.config('post.showShare')) {
            this.$el.addClass('crt-post-hide-share');
        }
    }
}

export default BasePost;