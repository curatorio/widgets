
import Widget from './base';
import Logger from '../../core/logger';
import Events from '../../core/events';
import config from '../../config/widget-grid-carousel';
import LayoutCarousel from '../layouts/carousel';
import LayoutCarouselPane from '../layouts/carousel-pane';
import GridPost from "../posts/grid";

class GridCarousel extends Widget {

    constructor (options) {
        super ();

        options.postsPerPage = 100;

        if (this.init (options,  config)) {
            Logger.log("GridCarousel->init with options:");

            this.allLoaded = false;

            this.templateId = this.options.templateWidget;
            this.render();

            this.$el.appendTo(this.$container);
            this.$container.addClass('crt-widget-grid-carousel');

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
        Logger.log('GridCarousel->loadMorePosts');

        if (this.feed.postCount > this.feed.postsLoaded) {
            this.feed.loadMore();
        }
    }

    createPane (paneIndex)
    {
        // Logger.log('GridCarousel->createPane '+paneIndex);

        let lastPost = Math.floor(this.feed.posts.length);

        let pane = new LayoutCarouselPane ();

        let rows = this.config('rows');

        for (let c = 0 ; c < rows ; c ++) {
            let cX = (paneIndex * rows) + c;
            if (cX < 0) {
                cX = this.feed.posts.length + cX;
            } else if (cX > lastPost - 1) {
                cX = cX % lastPost;
            }

            let postJson = this.feed.posts[cX];
            if (postJson) {
                pane.addPost(this.createPostElement(postJson));
            }
        }

        return pane;
    }

    createPostElement (postJson) {
        let post = new GridPost(this, postJson);
        post.on(Events.POST_CLICK, this.onPostClick.bind(this));
        post.on(Events.POST_CLICK_READ_MORE, this.onPostClickReadMore.bind(this));
        post.on(Events.POST_IMAGE_LOADED, this.onPostImageLoaded.bind(this));

        this.trigger(Events.POST_CREATED, post);

        return post;
    }

    onPostsLoaded (event, posts) {
        Logger.log("GridCarousel->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            let rows = this.config('rows');
            let paneCount = Math.floor(this.feed.posts.length / rows);
            this.carousel.setPanesLength(paneCount);

            this.popupManager.setPosts(posts);
        }
    }

    onCarouselChange (event, carouselLayout, currentPane) {
        Logger.log("GridCarousel->onCarouselChange currentPane: "+currentPane);
        if (this.config('autoLoad')) {
            let pos = this.feed.postsLoaded - (this.carousel.PANES_VISIBLE * 2);
            let rows = this.config('rows');
            if (currentPane * rows >= pos) {
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

        this.$container.removeClass('crt-widget-grid-carousel');

        this.$el.remove();

        delete this.$container;
    }
}

export default GridCarousel;