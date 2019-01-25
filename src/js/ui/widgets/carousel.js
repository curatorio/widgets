
import Widget from './base';
import Logger from '../../core/logger';
import Events from '../../core/events';
import config from '../../config/widget-carousel';
import LayoutCarousel from '../layouts/carousel';
import LayoutCarouselPane from '../layouts/carousel-pane';

class Carousel extends Widget {

    constructor (options) {
        super ();

        options.postsPerPage = 100;

        if (this.init (options,  config)) {
            Logger.log("Carousel->init");

            this.allLoaded = false;
            this.templateId = this.config('templateWidget');
            this.$refs = {
                stage:null,
                slider:null,
            };
            this.render();

            this.$el.appendTo(this.$container);
            this.$container.addClass('crt-widget-carousel');

            this.carousel = new LayoutCarousel(this, this.$el, this.$refs.stage, this.$refs.slider, this.options);
            this.carousel.on(Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));

            this.on(Events.FILTER_CHANGED, () => {
                this.carousel.reset ();
            });

            // load first set of posts
            this.feed.load();
        }
    }

    loadMorePosts  () {
        Logger.log('Carousel->loadMorePosts');

        if (this.feed.postCount > this.feed.postsLoaded) {
            this.feed.loadMore();
        }
    }

    createPane (paneIndex) {
        // Logger.log('Carousel->createPane '+paneIndex);

        let postToLoad = paneIndex;
        if (paneIndex < 0) {
            postToLoad = this.feed.posts.length + paneIndex;
        } else if (paneIndex > this.feed.posts.length - 1) {
            postToLoad = paneIndex % this.feed.posts.length;
        }

        let pane = new LayoutCarouselPane ();
        let postJson = this.feed.posts[postToLoad];
        pane.addPost(this.createPostElement(postJson));

        return pane;
    }

    onPostsLoaded (event, posts) {
        Logger.log("Carousel->onPostsLoaded");

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            this.carousel.setPanesLength(this.feed.posts.length);

            this.popupManager.setPosts(posts);
        }
    }

    onCarouselChange (event, carouselLayout, currentPane) {
        Logger.log("Carousel->onCarouselChange currentPane: "+currentPane);
        if (this.config('autoLoad')) {
            let pos = this.feed.postsLoaded - (this.carousel.PANES_VISIBLE * 2);
            if (currentPane >= pos) {
                this.loadMorePosts();
            }
        }
    }

    onPrevClick () {
        this.carousel.prev();
    }

    onNextClick () {
        this.carousel.next();
    }

    destroy  () {
        super.destroy();

        this.carousel.destroy();
        delete this.carousel;

        this.$container.removeClass('crt-widget-carousel');
        this.$container.removeClass('crt-carousel');
        delete this.$container;

        this.$el.remove();

        delete this.allLoaded;

    }
}

export default Carousel;