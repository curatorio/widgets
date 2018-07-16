

import Widget from './base';
import Logger from '/curator/core/logger';
import Events from '/curator/core/events';
import ConfigWidgetBase from '/curator/config/widget_base';
import LayoutCarousel from '/curator/ui/layout/carousel';
import z from '/curator/core/lib';

let ConfigCarousel = z.extend({}, ConfigWidgetBase, {
    scroll:'more',
    carousel:{
        autoPlay:true,
        autoLoad:true,
        infinite:false,
        matchHeights:false
    },
});

class Carousel extends Widget {

    constructor (options) {
        super ();

        options.postsPerPage = 30;

        this.loading=false;
        this.posts=[];
        this.firstLoad=true;

        if (this.init (options,  ConfigCarousel)) {
            Logger.log("Carousel->init with options:");
            Logger.log(this.options);

            this.allLoaded = false;

            // this.$wrapper = z('<div class="crt-carousel-wrapper"></div>').appendTo(this.$container);
            this.$feed = z('<div class="crt-carousel-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-carousel');
            this.$container.addClass('crt-widget-carousel');

            this.carousel = new LayoutCarousel(this.$feed, this.options.carousel);
            this.carousel.on(Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));

            this.on(Events.FILTER_CHANGED, () => {
                this.$feed.find('.crt-post').remove();
            });

            // load first set of posts
            this.loadPosts(0);
        }
    }

    loadMorePosts  () {
        Logger.log('Carousel->loadMorePosts');

        if (this.feed.postCount > this.feed.postsLoaded) {
            this.feed.loadPosts(this.feed.currentPage + 1);
        }
    }

    onPostsLoaded (event, posts) {
        Logger.log("Carousel->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
             let that = this;
             let $els = [];
            z(posts).each(function(i){
                let p = that.createPostElement(this);
                $els.push(p.$el);

                if (that.options.animate && that.firstLoad) {
                    p.$el.css({opacity: 0});
                    window.setTimeout(function () {
                        p.$el.css({opacity: 0}).animate({opacity: 1});
                    }, i * 100);
                }
            });

            this.carousel.add($els);
            this.carousel.update();

            this.popupManager.setPosts(posts);
        }
        this.firstLoad = false;
    }

    onCarouselChange (event, currentSlide) {
        if (this.options && this.options.carousel.autoLoad) {
            if (currentSlide >= this.feed.postsLoaded - this.carousel.PANES_VISIBLE) {
                this.loadMorePosts();
            }
        }
    }

    destroy  () {
        super.destroy();

        this.feed.destroy();

        this.carousel.off(Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));
        this.carousel.destroy();

        this.$feed.remove();
        this.$container.removeClass('crt-widget-carousel');
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

export default Carousel;