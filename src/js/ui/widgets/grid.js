
import Widget from './base';
import Logger from '../../core/logger';
import CommonUtils from '../../utils/common';
import GridPost from '../posts/grid';
import config from '../../config/widget-grid';
import z from '../../core/lib';
import Events from "../../core/events";
import ResizeObserver from 'resize-observer-polyfill/dist/ResizeObserver.es';

class Grid extends Widget {

    constructor  (options) {
        super ();

        this.loading=false;
        this.posts=[];
        this.columnCount=0;
        this.rowsMax = 0;
        this.totalPostsLoaded=0;
        this.allLoaded=false;
        //
        // if ('scrollRestoration' in window.history) {
        //     window.history.scrollRestoration = 'manual';
        // }

        this.$refs = {
            feedWindow:null
        };

        if (this.init (options,  config)) {
            Logger.log("Grid->init");

            this.templateId = this.config('templateWidget');
            this.render ();

            this.$container.append(this.$el);
            this.$scroller = z(window);

            this.$container.addClass('crt-grid');
            this.$container.addClass('crt-widget-grid');

            if (this.config('showLoadMore')) {
                this.$refs.feedWindow.css({
                    'position':'relative'
                });
            } else {
                this.$refs.loadMore.hide();
            }

            this.createHandlers();

            // This triggers post loading
            this.rowsMax = this.config('rows');
            this.updateLayout ();
        }
    }

    createHandlers () {
        let id = this.id;

        this._resize = CommonUtils.debounce(() => {
            this.updateResponsiveOptions ();
            this.updateLayout ();
        }, 100);

        this.ro = new ResizeObserver((entries) => {
            if (entries.length > 0) {
                // let entry = entries[0];
                this._resize();
            }
        });

        this.ro.observe(this.$container[0]);

        z(window).on('curatorCssLoaded.'+id, this._resize.bind(this));

        z(document).on('ready.'+id, this._resize.bind(this));

        if (this.config('continuousScroll')) {
            z(window).on('scroll.'+id, CommonUtils.debounce(() => {
                this.checkScroll();
            }, 100));
        }

        this.on(Events.FILTER_CHANGED, () => {
            this.$refs.feed.find('.crt-grid-post').remove();
        });
    }

    destroyHandlers () {
        let id = this.id;

        this._resize.cancel();
        this._resize = null;

        z(window).off('curatorCssLoaded.'+id);

        z(document).off('ready.'+id);

        z(window).off('scroll.'+id);

        if (this.ro) {
            this.ro.disconnect();
        }
    }

    loadPosts () {
        // console.log ('LOAD POSTS CALLED!!!?!?!!?!?!');
    }

    updateLayout ( ) {
        Logger.log("Grid->updateLayout ");
        let cols = Math.floor(this.$container.width()/this.config('minWidth'));
        cols = cols < 1 ? 1 : cols;

        // set col layout
        this.$container.removeClass('crt-grid-col'+this.columnCount);
        this.columnCount = cols;
        this.$container.addClass('crt-grid-col'+this.columnCount);

        // figure out if we need more posts
        let postsNeeded = cols *  (this.rowsMax + 1);
        // console.log ('postNeeded '+postsNeeded);
        // console.log ('this.feed.postsLoaded '+this.feed.postsLoaded);
        if (postsNeeded > this.feed.postsLoaded && !this.feed.allPostsLoaded) {
            let limit = postsNeeded - this.feed.postsLoaded;

            let params = {
                limit : limit
            };

            this.feed.loadMorePaginated(params);
        } else {
            this.updateHeight(false);
        }
    }

    createPostElement (postJson) {
        let post = new GridPost(this, postJson, this.options);
        post.on(Events.POST_CLICK,this.onPostClick.bind(this));
        post.on(Events.POST_CLICK_READ_MORE,this.onPostClickReadMore.bind(this));
        post.on(Events.POST_IMAGE_LOADED, this.onPostImageLoaded.bind(this));

        this.trigger(Events.POST_CREATED, post);

        return post;
    }

    updateHeight () {
        let $post = this.$container.find('.crt-grid-post').first();
        let postHeight = $post.height();
        let postMarginBottom = parseInt($post.css("margin-bottom"));
        // let postMarginTop = parseInt($post.css("margin-top"));
        // let postPaddingBottom = parseInt($post.css("padding-bottom"));
        // let postPaddingTop = parseInt($post.css("padding-top"));

        postHeight += postMarginBottom;

        this.$refs.feedWindow.css({'overflow':'hidden'});

        let maxRows = Math.ceil(this.feed.postCount / this.columnCount);
        let rows = this.rowsMax < maxRows ? this.rowsMax : maxRows;

        // if (animate) {
        //     this.$refs.feedWindow.animate({height:rows * postHeight});
        // } else {
        let scrollTopOrig = this.$scroller.scrollTop();
        // }

        this.$refs.feedWindow.height(rows * postHeight);
        let scrollTopNew = this.$scroller.scrollTop();
        // console.log(scrollTopOrig+":"+scrollTopNew);

        if (scrollTopNew > scrollTopOrig+100) {
            // chrome seems to lock scroll position relative to bottom - so scrollTop changes when we adjust height
            // - let's reset
            this.$scroller.scrollTop(scrollTopOrig);
        }
        if (this.config('showLoadMore')) {
            let postsVisible = this.columnCount * rows;
            if (this.feed.allPostsLoaded && postsVisible >= this.feed.posts.length) {
                this.$refs.loadMore.hide();
            } else {
                this.$refs.loadMore.show();
            }
        }

        this.trigger(Events.GRID_HEIGHT_CHANGED,this);
    }

    checkScroll () {
        Logger.log("Grid->checkScroll");
        // console.log('scroll');
        let top = this.$container.offset().top;
        let feedBottom = top+this.$refs.feedWindow.height();
        let scrollTop = this.$scroller.scrollTop();
        let windowBottom = scrollTop+z(window).height();
        let diff = windowBottom - feedBottom;

        if (diff > this.config('continuousScrollOffset')) {
            if (!this.feed.loading && !this.feed.allPostsLoaded) {
                this.rowsMax += this.config('loadMoreRows');
                this.updateLayout();
            }
        }
    }

    onPostsLoaded (event, posts) {
        Logger.log("Grid->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
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

                if (this.config('animate')) {
                    post.$el.css({opacity: 0});
                    anim (post, i);
                    i++;
                }
            }

            this.popupManager.setPosts(posts);

            this.updateHeightTimeout = window.setTimeout(() => {
                this.updateHeight(true);
            },10);
        }
    }

    onMoreClick () {
        this.rowsMax += this.config('loadMoreRows');

        this.updateLayout();
    }

    destroy () {
        super.destroy();

        this.feed.destroy();

        this.destroyHandlers();

        this.$container.empty()
            .removeClass('crt-widget-grid')
            .removeClass('crt-grid')
            .removeClass('crt-grid-col'+this.columnCount)
            .css({'height':'','overflow':''});

        window.clearTimeout(this.updateHeightTimeout);

        delete this.$container;
        delete this.totalPostsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Posts
        // unregistering events etc
        delete this.feed;
    }

}

export default Grid;
