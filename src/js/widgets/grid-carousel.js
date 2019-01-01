
import Widget from './base';
import Logger from '../core/logger';
import Events from '../core/events';
import ConfigWidgetBase from '../config/widget_base';
import LayoutCarousel from '../ui/layout/carousel';
import LayoutCarouselPane from '../ui/layout/carousel-pane';
import z from '../core/lib';
import GridPost from "../ui/post/grid";

let config = z.extend({}, ConfigWidgetBase, {
    autoPlay:true,
    autoLoad:true,
    infinite:true,
    matchHeights:false,
    rows:1,
    templatePost:'grid-carousel-post',
    templateFeed:'grid-carousel-feed',
});

class GridCarousel extends Widget {

    constructor (options) {
        super ();

        options.postsPerPage = 100;

        if (this.init (options,  config)) {
            Logger.log("GridCarousel->init with options:");

            this.allLoaded = false;

            this.templateId = this.options.templateFeed;
            this.render();

            this.$el.appendTo(this.$container);
            this.$container.addClass('crt-widget-grid-carousel');

            this.carousel = new LayoutCarousel(this, this.$el, this.$refs.stage, this.$refs.slider, this.options);
            this.carousel.on(Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));

            this.on(Events.FILTER_CHANGED, () => {
                this.carousel.reset ();
            });

            // load first set of posts
            this.loadPosts(0);
        }
    }

    loadMorePosts  () {
        Logger.log('GridCarousel->loadMorePosts');

        if (this.feed.postCount > this.feed.postsLoaded) {
            this.feed.loadPosts(this.feed.currentPage + 1);
        }
    }

    createPane (paneIndex)
    {
        Logger.log('GridCarousel->createPane '+paneIndex);

        let lastPost = Math.floor(this.feed.posts.length);

        let pane = new LayoutCarouselPane ();

        for (let c = 0 ; c < this.options.rows ; c ++) {
            let cX = (paneIndex * this.options.rows) + c;
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
        let post = new GridPost(postJson, this.options, this);
        post.on(Events.POST_CLICK,this.onPostClick.bind(this));
        post.on(Events.POST_CLICK_READ_MORE,this.onPostClickReadMore.bind(this));
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
            let paneCount = Math.floor(this.feed.posts.length / this.options.rows);
            this.carousel.setPanesLength(paneCount);

            this.popupManager.setPosts(posts);
        }
    }

    onCarouselChange (event, carouselLayout, currentPane) {
        Logger.log("GridCarousel->onCarouselChange currentPane: "+currentPane);
        if (this.options && this.options.autoLoad) {
            let pos = this.feed.postsLoaded - (this.carousel.PANES_VISIBLE * 2);
            if (currentPane * this.options.rows >= pos) {
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

        this.feed.destroy();

        this.carousel.off(Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));
        this.carousel.destroy();

        this.$feed.remove();
        this.$container.removeClass('crt-widget-carousel');

        delete this.$feed;
        delete this.$container;
        delete this.options ;
        delete this.feed.postsLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    }
}

export default GridCarousel;