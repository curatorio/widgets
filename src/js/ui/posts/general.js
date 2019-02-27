
import Base from './base';
import Events from '../../core/events';
import z from '../../core/lib';

class GeneralPost extends Base {
    constructor (widget, postJson, options) {
        super(widget, postJson, options);

        this.render ();

        this.$refs.image.css({opacity:0});

        if (this.json.image) {
            this.$refs.image.on('load', this.onImageLoaded.bind(this));
            this.$refs.image.on('error', this.onImageError.bind(this));
        } else {
            // no image ... call this.onImageLoaded
            window.setTimeout(() => {
                this.setHeight();
            },100);
        }

        if (this.json.image_width > 0) {
            let p = (this.json.image_height/this.json.image_width)*100;
            this.$refs.imageContainer.addClass('crt-image-responsive').css('padding-bottom',p+'%');
        }

        if (this.json.url.indexOf('http') !== 0) {
            this.$el.find('.crt-post-share').hide ();
        }

        this.setupUserNameImage ();
        this.setupVideo ();
        this.setupCarousel ();
        this.setupShare ();
        this.setupCommentsLikes ();
    }

    onImageLoaded () {
        this.$refs.image.animate({opacity:1});

        let img = this.$refs.image[0];


        if (img) {
            // adapt resize container to correct dimensions
            if (img.naturalWidth > 0) {
                let p = (img.naturalHeight / img.naturalWidth) * 100;
                this.$refs.imageContainer.addClass('crt-image-responsive').css('padding-bottom', p + '%');
            }
        }

        this.setHeight();

        this.trigger(Events.POST_IMAGE_LOADED, this);
        this.widget.trigger(Events.POST_IMAGE_LOADED, this);
    }

    onImageError () {
        // Unable to load image!!!
        this.$refs.image.hide();

        this.setHeight();

        this.trigger(Events.POST_IMAGE_FAILED, this);
        this.widget.trigger(Events.POST_IMAGE_FAILED, this);
    }

    setHeight () {
        let height = this.$refs.postC.height();
        let maxHeight = this.widget.config('post.maxHeight',0);
        if (maxHeight > 0 && height > maxHeight) {
            this.$el.css({maxHeight: maxHeight});
            this.$el.addClass('crt-post-max-height');
        }

        this.layout();
    }

    forceHeight (height)
    {
        console.log('->forceHeight '+height);

        // TODO - change to animation ... below doesn't seem to work
        // Stop Zepto Animations ...
        // this.$el.off("webkitTransitionEnd webkitAnimationEnd");
        // this.$el.get(0).style.cssText = "";

        this.$el.css({height: height}, 300);
    }

    getHeight () {
        if (this.$el.hasClass('crt-post-max-height')) {
            return this.$refs.postC.height();
        } else {
            // let $pane = z(this.$panes[i]);
            // let contentHeight = this.$el.find('.crt-post-content').height();
            // console.log(contentHeight);
            // let footerHeight = this.$el.find('.crt-post-footer').height();
            // console.log(footerHeight);
            // return contentHeight + footerHeight + 2;
            return this.$refs.postC.height();
        }
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

export default GeneralPost;