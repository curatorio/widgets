
import Widget from './base';
import Logger from '../core/logger';
import CommonUtils from '../utils/common';
import ConfigWidgetGrid from '../config/widget_list';
import TemplatingUtils from '../core/templating';
import z from '../core/lib';
import Events from "../core/events";

class List extends Widget {

    constructor  (options) {
        super ();

        this.loading=false;
        this.feed=null;
        this.$container=null;
        this.$feed=null;
        this.posts=[];
        //
        // if ('scrollRestoration' in window.history) {
        //     window.history.scrollRestoration = 'manual';
        // }

        if (this.init (options,  ConfigWidgetGrid)) {
            Logger.log("List->init with options:");
            Logger.log(this.options);

            let tmpl = TemplatingUtils.renderTemplate(this.responsiveOptions.templateFeed, {});
            this.$container.append(tmpl);
            this.$feed = this.$container.find('.crt-feed');
            this.$feedWindow = this.$container.find('.crt-feed-window');
            this.$loadMore = this.$container.find('.crt-load-more a');
            this.$scroller = z(window);

            this.$container.addClass('crt-list');
            this.$container.addClass('crt-widget-list');

            if (this.responsiveOptions.list.showLoadMore) {
                this.$feedWindow.css({
                    'position':'relative'
                });
                this.$loadMore.click(this.onMoreClicked.bind(this));
            } else {
                this.$loadMore.hide();
            }

            this.createHandlers();

            // This triggers post loading
            this.feed.load();
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

        if (this.responsiveOptions.list.continuousScroll) {
            z(window).on('scroll.'+id, CommonUtils.debounce(() => {
                this.checkScroll();
            }, 100));
        }

        this.on(Events.FILTER_CHANGED, () => {
            this.$feed.find('.crt-list-post').remove();
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
        // Logger.log("List->updateLayout ");
        let cols = Math.floor(this.$container.width()/this.responsiveOptions.list.minWidth);
        cols = cols < 1 ? 1 : cols;

        // set col layout
        this.$container.removeClass('crt-list-col'+this.columnCount);
        this.columnCount = cols;
        this.$container.addClass('crt-list-col'+this.columnCount);

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
        let $post = this.$container.find('.crt-post-c').first();
        let postHeight = $post.width();
        let postMargin = parseInt($post.css("margin-left"));
        postHeight += postMargin;

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
        if (this.responsiveOptions.list.showLoadMore) {
            let postsVisible = this.columnCount * rows;
            if (this.feed.allPostsLoaded && postsVisible >= this.feed.posts.length) {
                this.$loadMore.hide();
            } else {
                this.$loadMore.show();
            }
        }
    }

    checkScroll () {
        Logger.log("List->checkScroll");
        // console.log('scroll');
        let top = this.$container.offset().top;
        let feedBottom = top+this.$feedWindow.height();
        let scrollTop = this.$scroller.scrollTop();
        let windowBottom = scrollTop+z(window).height();
        let diff = windowBottom - feedBottom;

        if (diff > this.responsiveOptions.list.continuousScrollOffset) {
            if (!this.feed.loading && !this.feed.allPostsLoaded) {
                this.rowsMax += this.responsiveOptions.list.rowsToAdd;
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
                this.$feed.append(post.$el);
                post.layout();

                if (this.responsiveOptions.animate) {
                    post.$el.css({opacity: 0});
                    anim (post, i);
                    i++;
                }
            }

            this.popupManager.setPosts(posts);

            if (this.responsiveOptions.list.showLoadMore) {
                if (this.feed.allPostsLoaded) {
                    this.$loadMore.hide();
                } else {
                    this.$loadMore.show();
                }
            } else {
                this.$loadMore.hide();
            }
        }
    }

    onMoreClicked (ev) {
        ev.preventDefault();

        this.feed.loadMorePaginated();
    }

    destroy () {
        super.destroy();

        this.feed.destroy();

        this.destroyHandlers();

        this.$container.empty()
            .removeClass('crt-list')
            .removeClass('crt-list-col'+this.columnCount)
            .css({'height':'','overflow':''});

        delete this.$feed;
        delete this.$container;
        delete this.options ;
        delete this.loading;

        // TODO add code to cascade destroy down to Posts
        // unregistering events etc
        delete this.feed;
    }

}

export default List;
