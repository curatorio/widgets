
import Widget from './base';
import Logger from '../../core/logger';
import Events from '../../core/events';
import config from '../../config/widget-panel';
import LayoutCarousel from '../layout/carousel';
import z from '../../core/lib';

class Panel extends Widget {

    constructor  (options) {
        super ();

        this.loading=false;
        this.feed=null;
        this.$container=null;
        this.$feed=null;
        this.posts=[];

        if (this.init (options,  config)) {
            Logger.log("Panel->init with options:");
            Logger.log(this.options);

            this.allLoaded = false;

            this.$feed = z('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-widget-carousel');
            this.$container.addClass('crt-widget-panel');

            if (this.options.panel.fixedHeight) {
                this.$container.addClass('crt-panel-fixed-height');
            }

            this.carousel = new LayoutCarousel(this, this.$feed, this.options.panel);
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
            this.carousel.setPanesLength(this.feed.posts.length);

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
        this.$container.removeClass('crt-widget-panel');
        this.$container.removeClass('crt-carousel');
        this.$container.removeClass('crt-widget-carousel');

        delete this.$feed;
        delete this.$container;
        delete this.feed.postsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    }
}

export default Panel;

