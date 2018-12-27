
import Widget from './base';
import ConfigWidgetWaterfall from '../config/widget_waterfall';
import Logger from '../core/logger';
import LayoutWaterfall from '../ui/layout/waterfall';
import Events from '../core/events';
import z from '../core/lib';

class Waterfall extends Widget {

    constructor (options) {
        super ();

        if (this.init (options,  ConfigWidgetWaterfall)) {
            Logger.log("Waterfall->init with options:");
            this.templateId = this.options.templateFeed;
            this.json = {};
            this.render();
            this.$container.append(this.$el);

            this.$scroll = this.$container.find('.crt-feed-scroll');
            this.$feed = this.$container.find('.crt-feed');
            this.$container.addClass('crt-widget-waterfall');
            this.$loadMore = this.$container.find('.crt-load-more');

            if (this.options.continuousScroll) {
                z(this.$scroll).scroll(() => {
                    let height = this.$scroll.height();
                    let cHeight = this.$feed.height();
                    let scrollTop = this.$scroll.scrollTop();
                    if (scrollTop >= cHeight - height) {
                        this.loadMorePosts();
                    }
                });
            }

            if (!this.options.showLoadMore) {
                this.$loadMore.remove();
            }

            this.ui = new LayoutWaterfall(this.options, this.$feed);

            this.on(Events.FILTER_CHANGED, () => {
                this.$feed.find('.crt-post').remove();
            });

            // Load first set of posts
            this.feed.load();

            this.iniListeners();
        }
    }

    iniListeners () {

    }

    destroyListeners () {

    }

    loadMorePosts  (ev) {
        ev.preventDefault();
        Logger.log('Waterfall->loadMorePosts');

        this.feed.loadAfter();
    }


    loadPage  (page) {
        Logger.log('Waterfall->loadPage');

        this.$feed.find('.crt-post').remove();

        this.feed.loadPosts(page);
    }

    onPostsLoaded (event, posts) {
        Logger.log("Waterfall->onPostsLoaded");

        let postElements = this.createPostElements (posts);

        //this.$feed.append(postElements);
        this.ui.append(postElements);

        let that = this;
        z.each(postElements,function () {
            let post = this;
            if (that.options.showReadMore) {
                post.find('.crt-post')
                    .addClass('crt-post-show-read-more');
            }
        });

        if (this.options.showLoadMore) {
            if (this.feed.allPostsLoaded) {
                this.$loadMore.hide();
            } else {
                this.$loadMore.show();
            }
        }

        this.popupManager.setPosts(posts);

        this.loading = false;

        this.trigger(Events.POSTS_RENDERED, this);
    }

    destroy  () {
        Logger.log('Waterfall->destroy');

        super.destroy();

        this.feed.destroy();

        this.ui.destroy ();

        this.$feed.remove();
        this.$scroll.remove();
        if (this.$loadMore) {
            this.$loadMore.remove();
        }
        this.$container.removeClass('crt-feed-container')
            .removeClass('crt-widget-waterfall');

        this.destroyListeners();

        delete this.$feed;
        delete this.$scroll;
        delete this.$container;
        delete this.options ;
        delete this.totalPostsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    }
}

export default Waterfall;
