
import Base from './base';
import Events from '../../core/events';

class GridPost extends Base {

    constructor (widget, postJson) {
        super(widget, postJson);

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

    getHeight () {
        // let $pane = z(this.$panes[i]);
        let contentHeight = this.$el.find('.crt-post-content').height();
        let footerHeight = this.$el.find('.crt-post-footer').height();
        return contentHeight + footerHeight + 2;
    }

    showAnim (i) {
        this.$el.css({opacity: 0});

        window.setTimeout (() => {
            this.$el.animate({opacity: 1});
        }, i * 100);
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

    onWidgetResize () {
        this.layoutFooter();
    }

    layoutFooter () {
        if (!this.$el.hasClass('crt-grid-post-new-york')) {
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
}

export default GridPost;