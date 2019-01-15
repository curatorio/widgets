
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

            if (!this.options.showLoadMore) {
                this.$refs.loadMore.remove();
            }

            this.ui = new LayoutWaterfall(this.options, this.$refs.feed);

            this.on(Events.FILTER_CHANGED, () => {
                this.$refs.feed.find('.crt-post').remove();
            });

            this.iniListeners();

            // Load first set of posts
            this.feed.load();
        }
    }

    iniListeners () {
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

        if (this.options.autoLoadNew) {
            this.startAutoLoad ();
        }
    }

    destroyListeners () {
        this.stopAutoLoad();
    }

    onMoreClick  () {
        Logger.log('Waterfall->onMoreClick');

        this.feed.loadAfter();
    }

    loadBefore  () {
        Logger.log('Waterfall->loadBefore');

        this.feed.loadBefore();
    }

    onPostsLoaded (event, posts, position) {
        Logger.log("Waterfall->onPostsLoaded "+position);

        if (posts.length > 0) {

            this.popupManager.setPosts(posts);

            let postElements = this.createPostElements(posts);

            if (position === 'before') {
                this.ui.prepend(postElements);
            } else {
                this.ui.append(postElements);
            }
        }

        if (this.options.showLoadMore) {
            if (this.feed.allPostsLoaded) {
                this.$refs.loadMore.hide();
            } else {
                this.$refs.loadMore.show();
            }
        }

        this.trigger(Events.POSTS_RENDERED, this);
    }

    destroy  () {
        Logger.log('Waterfall->destroy');

        super.destroy();

        this.destroyListeners();

        this.ui.destroy ();

        this.$container.removeClass('crt-widget-waterfall');

        this.$el.remove();

        delete this.$container;
    }
}

export default Waterfall;
