
import Widget from './base';
import Logger from '../core/logger';
import CommonUtils from '../utils/common';
import ConfigWidgetGrid from '../config/widget_grid';
import TemplatingUtils from '../core/templating';
import z from '../core/lib';
import Events from "../core/events";

class Grid extends Widget {

    constructor  (options) {
        super ();

        this.loading=false;
        this.feed=null;
        this.$container=null;
        this.$feed=null;
        this.posts=[];
        this.columnCount=0;
        this.rowsMax = 0;
        this.totalPostsLoaded=0;
        this.allLoaded=false;
        //
        // if ('scrollRestoration' in window.history) {
        //     window.history.scrollRestoration = 'manual';
        // }

        if (this.init (options,  ConfigWidgetGrid)) {
            Logger.log("Grid->init with options:");
            Logger.log(this.options);

            let tmpl = TemplatingUtils.renderTemplate(this.responsiveOptions.templateFeed, {});
            this.$container.append(tmpl);
            this.$feed = this.$container.find('.crt-feed');
            this.$feedWindow = this.$container.find('.crt-feed-window');
            this.$loadMore = this.$container.find('.crt-load-more a');
            this.$scroller = z(window);

            this.$container.addClass('crt-grid');
            this.$container.addClass('crt-widget-grid');

            if (this.responsiveOptions.grid.showLoadMore) {
                this.$feedWindow.css({
                    'position':'relative'
                });
                this.$loadMore.click(this.onMoreClicked.bind(this));
            } else {
                this.$loadMore.hide();
            }

            if (!this.responsiveOptions.grid.hover.showName) {
                this.$container.addClass('crt-grid-hide-name');
            }

            if (!this.responsiveOptions.grid.hover.showFooter) {
                this.$container.addClass('crt-grid-hide-footer');
            }

            if (!this.responsiveOptions.grid.hover.showText) {
                this.$container.addClass('crt-grid-hide-text');
            }

            this.createHandlers();

            // This triggers post loading
            this.rowsMax = this.responsiveOptions.grid.rows;
            this.updateLayout ();
        }
    }

    createHandlers () {
        let id = this.id;
        let updateLayoutDebounced = CommonUtils.debounce( () => {
            this.updateLayout ();
        }, 100);

        z(window).on('resize.'+id, CommonUtils.debounce(() => {
            this.updateResponsiveOptions ();
            this.updateLayout ();
        }, 100));

        z(window).on('curatorCssLoaded.'+id, updateLayoutDebounced);

        z(document).on('ready.'+id, updateLayoutDebounced);

        if (this.responsiveOptions.grid.continuousScroll) {
            z(window).on('scroll.'+id, CommonUtils.debounce(() => {
                this.checkScroll();
            }, 100));
        }

        this.on(Events.FILTER_CHANGED, () => {
            this.$feed.find('.crt-grid-post').remove();
        });
    }

    destroyHandlers () {
        let id = this.id;

        z(window).off('resize.'+id);

        z(window).off('curatorCssLoaded.'+id);

        z(document).off('ready.'+id);

        z(window).off('scroll.'+id);
    }

    loadPosts () {
        // console.log ('LOAD POSTS CALLED!!!?!?!!?!?!');
    }

    updateLayout ( ) {
        // Logger.log("Grid->updateLayout ");
        let cols = Math.floor(this.$container.width()/this.responsiveOptions.grid.minWidth);
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

    updateHeight (animate) {
        let $post = this.$container.find('.crt-grid-post').first();
        let postHeight = $post.height();
        let postMarginBottom = parseInt($post.css("margin-bottom"));
        // let postMarginTop = parseInt($post.css("margin-top"));
        // let postPaddingBottom = parseInt($post.css("padding-bottom"));
        // let postPaddingTop = parseInt($post.css("padding-top"));

        postHeight += postMarginBottom;

        this.$feedWindow.css({'overflow':'hidden'});

        let maxRows = Math.ceil(this.feed.postCount / this.columnCount);
        let rows = this.rowsMax < maxRows ? this.rowsMax : maxRows;

        // if (animate) {
        //     this.$feedWindow.animate({height:rows * postHeight});
        // } else {
        let scrollTopOrig = this.$scroller.scrollTop();
        // }

        this.$feedWindow.height(rows * postHeight);
        let scrollTopNew = this.$scroller.scrollTop();
        // console.log(scrollTopOrig+":"+scrollTopNew);

        if (scrollTopNew > scrollTopOrig+100) {
            // chrome seems to lock scroll position relative to bottom - so scrollTop changes when we adjust height
            // - let's reset
            this.$scroller.scrollTop(scrollTopOrig);
        }
        if (this.responsiveOptions.grid.showLoadMore) {
            let postsVisible = this.columnCount * rows;
            if (this.feed.allPostsLoaded && postsVisible >= this.feed.posts.length) {
                this.$loadMore.hide();
            } else {
                this.$loadMore.show();
            }
        }

        this.trigger(Events.GRID_HEIGHT_CHANGED,this);
    }

    checkScroll () {
        Logger.log("Grid->checkScroll");
        // console.log('scroll');
        let top = this.$container.offset().top;
        let feedBottom = top+this.$feedWindow.height();
        let scrollTop = this.$scroller.scrollTop();
        let windowBottom = scrollTop+z(window).height();
        let diff = windowBottom - feedBottom;

        if (diff > this.responsiveOptions.grid.continuousScrollOffset) {
            if (!this.feed.loading && !this.feed.allPostsLoaded) {
                this.rowsMax += this.responsiveOptions.grid.rowsToAdd;
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
                this.$feed.append(post.$el);
                post.layout();

                if (this.responsiveOptions.animate) {
                    post.$el.css({opacity: 0});
                    anim (post, i);
                    i++;
                }
            }

            this.popupManager.setPosts(posts);

            window.setTimeout(() => {
                this.updateHeight(true);
            },10);
        }
    }

    onMoreClicked (ev) {
        ev.preventDefault();

        let rowsToAdd = 1;

        if (this.columnCount <= 1) {
            rowsToAdd = 4;
        } else if (this.columnCount === 2) {
            rowsToAdd = 2;
        }

        this.rowsMax += rowsToAdd;

        this.updateLayout();
    }

    destroy () {
        super.destroy();

        this.feed.destroy();

        this.destroyHandlers();

        this.$container.empty()
            .removeClass('crt-grid')
            .removeClass('crt-grid-col'+this.columnCount)
            .css({'height':'','overflow':''});

        delete this.$feed;
        delete this.$container;
        delete this.options ;
        delete this.totalPostsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Posts
        // unregistering events etc
        delete this.feed;
    }

}

export default Grid;
