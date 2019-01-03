
import Base from './base';
import Events from '../../core/events';

class Post extends Base {

    constructor (widget, postJson, options) {
        super(widget, postJson, options);

        this.$refs = {
            spacer:null,
            postC:null,
        };

        this.render ();

        if (this.widget.config('post.imageHeight', '100%')) {
            let imageHeight = this.widget.config('post.imageHeight', '100%');
            this.$refs.spacer.css('padding-bottom', imageHeight);
        }

        this.setupVideo();
        this.setupCarousel ();
        this.setupShare ();
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