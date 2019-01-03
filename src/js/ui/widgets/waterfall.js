
import Widget from './base';
import config from '../../config/widget-waterfall';
import Logger from '../../core/logger';
import LayoutWaterfall from '../layouts/waterfall';
import Events from '../../core/events';
import z from '../../core/lib';

class Waterfall extends Widget {

    constructor (options) {
        super ();

        if (this.init (options,  config)) {
            Logger.log("Waterfall->init with options:");

            this.templateId = this.options.templateWidget;
            this.render();

            this.$container.append(this.$el);
            this.$container.addClass('crt-widget-waterfall');

            if (this.options.continuousScroll) {
                z(this.$el).scroll(() => {
                    let height = this.$el.height();
                    let cHeight = this.$refs.feed.height();
                    let scrollTop = this.$el.scrollTop();
                    if (scrollTop >= cHeight - height) {
                        this.onMoreClick();
                    }
                });
            }

            if (!this.options.showLoadMore) {
                this.$refs.loadMore.remove();
            }

            this.ui = new LayoutWaterfall(this.options, this.$refs.feed);

            this.on(Events.FILTER_CHANGED, () => {
                this.$refs.feed.find('.crt-post').remove();
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

    onMoreClick  () {
        Logger.log('Waterfall->onMoreClick');

        this.feed.loadAfter();
    }

    onPostsLoaded (event, posts) {
        Logger.log("Waterfall->onPostsLoaded");

        let postElements = this.createPostElements (posts);

        this.ui.append(postElements);

        let that = this;
        z.each(postElements,function () {
            let post = this;
            if (that.options.showReadMore) {
                post.find('.crt-post').addClass('crt-post-show-read-more');
            }
        });

        if (this.options.showLoadMore) {
            if (this.feed.allPostsLoaded) {
                this.$refs.loadMore.hide();
            } else {
                this.$refs.loadMore.show();
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

        this.$el.remove();

        this.$container.removeClass('crt-widget-waterfall');

        this.destroyListeners();

        delete this.$container;
        delete this.totalPostsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    }
}

export default Waterfall;
