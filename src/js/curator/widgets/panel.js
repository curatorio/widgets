
import Widget from './base';
import Logger from '/curator/core/logger';
import Events from '/curator/core/events';
import ConfigWidgetBase from '/curator/config/widget_base';
import LayoutCarousel from '/curator/ui/layout/carousel';
import z from '/curator/core/lib';

let ConfigPanel = z.extend({}, ConfigWidgetBase, {
    panel: {
        // speed: 500,
        autoPlay: true,
        autoLoad: true,
        moveAmount:1,
        fixedHeight:false,
        infinite:true,
        minWidth:2000
    }
});

class Panel extends Widget {

    constructor  (options) {
        super ();

        this.loading=false;
        this.feed=null;
        this.$container=null;
        this.$feed=null;
        this.posts=[];

        if (this.init (options,  ConfigPanel)) {
            Logger.log("Panel->init with options:");
            Logger.log(this.options);

            this.allLoaded = false;

            this.$feed = z('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-widget-carousel');
            this.$container.addClass('crt-widget-panel');

            if (this.options.panel.fixedHeight) {
                this.$container.addClass('crt-panel-fixed-height');
            }

            this.carousel = new LayoutCarousel(this.$feed, this.options.panel);
            this.carousel.on(Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));

            // load first set of posts
            this.loadPosts(0);
        }
    }

    loadMorePosts   () {
        Logger.log('Panel->loadMorePosts');

        this.feed.loadPosts(this.feed.currentPage+1);
    }

    onPostsLoaded  (event, posts) {
        Logger.log("Panel->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            let that = this;
            let $els = [];
            z(posts).each(function() {
                let p = that.createPostElement(this);
                $els.push(p.$el);
            });


            this.carousel.add($els);
            this.carousel.update();

            this.popupManager.setPosts(posts);
        }
    }

    onPostImageLoaded () {
        // Logger.log('Panel->onPostImageLoaded');
        this.carousel.updateHeight();
    }

    onCarouselChange (event, currentSlide) {
        if (this.options && this.options.panel.autoLoad) {
            if (currentSlide >= this.feed.postsLoaded - 4) {
                this.loadMorePosts();
            }
        }
    }

    destroy   () {

        super.destroy();

        this.feed.destroy();

        this.carousel.off(Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));
        this.carousel.destroy();

        this.$feed.remove();
        this.$container.removeClass('crt-panel');
        this.$container.removeClass('crt-carousel');


        delete this.$feed;
        delete this.$container;
        delete this.options ;
        delete this.feed.postsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    }
}

export default Panel;

