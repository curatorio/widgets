
import Widget from './base';
import Logger from '../../core/logger';
import CommonUtils from '../../utils/common';
import config from '../../config/widget-list';
import z from '../../core/lib';
import Events from "../../core/events";
import ResizeObserver from 'resize-observer-polyfill/dist/ResizeObserver.es';

class List extends Widget {

    constructor  (options) {
        super ();

        this.loading=false;
        this.feed=null;
        this.$refs.feed=null;
        this.posts=[];

        if (this.init (options,  config)) {
            Logger.log("List->init");

            this.templateId = this.config('widget.template');
            this.render();
            this.$container.append(this.$el);

            this.$scroller = z(window);

            this.$el.addClass('crt-widget-list');

            if (!this.config('widget.showLoadMore')) {
                this.$refs.loadMore.hide();
            }

            this.createHandlers();

            // This triggers post loading
            this.feed.load();
        }
    }

    createHandlers () {
        let id = this.id;

        this._resize = CommonUtils.debounce(this.updateLayout.bind(this));
        this._checkScroll = CommonUtils.debounce(this.checkScroll.bind(this));

        z(window).on('curatorCssLoaded.'+id, this._resize);

        z(document).on('ready.'+id, this._resize);

        if (this.config('widget.continuousScroll')) {
            z(window).on('scroll.'+id, this._checkScroll.bind(this));
        }

        this.on(Events.FILTER_CHANGED, () => {
            this.$refs.feed.find('.crt-list-post').remove();
        });

        this.ro = new ResizeObserver((entries) => {
            if (entries.length > 0) {
                // let entry = entries[0];
                this._resize();
            }
        });

        this.ro.observe(this.$el[0]);
    }

    destroyHandlers () {
        let id = this.id;

        z(window).off('curatorCssLoaded.'+id);

        z(document).off('ready.'+id);

        z(window).off('scroll.'+id);

        if (this.ro) {
            this.ro.disconnect();
            this.ro = null;
        }
    }

    loadPosts () {
        // console.log ('LOAD POSTS CALLED!!!?!?!!?!?!');
    }

    updateLayout ( ) {

    }

    checkScroll () {
        Logger.log("List->checkScroll");
        // console.log('scroll');
        let top = this.$el.offset().top;
        let feedBottom = top+this.$refs.feedWindow.height();
        let scrollTop = this.$scroller.scrollTop();
        let windowBottom = scrollTop+z(window).height();
        let diff = windowBottom - feedBottom;

        if (diff > this.responsiveOptions.list.continuousScrollOffset) {
            if (!this.feed.loading && !this.feed.allPostsLoaded) {
                this.rowsMax += this.responsiveOptions.list.loadMoreRows;
                this.updateLayout();
            }
        }
    }

    onPostsLoaded (event, posts) {
        Logger.log("List->onPostsLoaded");

        this.loading = false;

        if (posts.length !== 0) {
            this.postElements = [];
            let i = 0;

            let anim = (post) => {
                window.setTimeout (() => {
                    post.$el.css({opacity: 0}).animate({opacity: 1});
                }, i * 100);
            };

            for (let postJson of posts) {
                let post = this.createPostElement(postJson);
                this.postElements.push(post);
                this.$refs.feed.append(post.$el);
                post.layout();

                if (this.responsiveOptions.animate) {
                    post.$el.css({opacity: 0});
                    anim (post, i);
                    i++;
                }
            }

            this.popupManager.setPosts(posts);

            if (this.config('widget.showLoadMore')) {
                if (this.feed.allPostsLoaded) {
                    this.$refs.loadMore.hide();
                } else {
                    this.$refs.loadMore.show();
                }
            } else {
                this.$refs.loadMore.hide();
            }
        }
    }

    onMoreClick () {
        this.feed.loadMorePaginated();
    }

    destroy () {
        super.destroy();

        this.destroyHandlers();

        this.$el.empty()
            .removeClass('crt-widget-list')
            .removeClass('crt-list-col'+this.columnCount)
            .css({'height':'','overflow':''});

        delete this.loading;

        // TODO add code to cascade destroy down to Posts
        // unregistering events etc
    }

}

export default List;
