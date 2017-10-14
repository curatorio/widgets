Curator.Config.Grid = $.extend({}, Curator.Config.Defaults, {
    templatePost:'v2-grid-post',
    templateFeed:'v2-grid-feed',
    grid: {
        minWidth:200,
        rows:3
    }
});


class Grid extends Widget {

    constructor  (options) {
        super ();

        this.setOptions (options,  Curator.Config.Grid);

        Curator.log("Grid->init with options:");
        Curator.log(this.options);

        this.containerHeight=0;
        this.loading=false;
        this.feed=null;
        this.$container=null;
        this.$feed=null;
        this.posts=[];
        this.columnCount=0;

        this.rowsMax = 0;
        this.totalPostsLoaded=0;
        this.allLoaded=false;

        if (this.init (this)) {

            let tmpl = Curator.Template.render(this.options.templateFeed, {});
            this.$container.append(tmpl);
            this.$feed = this.$container.find('.crt-feed');
            this.$feedWindow = this.$container.find('.crt-feed-window');
            this.$loadMore = this.$container.find('.crt-feed-more a');

            this.$container.addClass('crt-grid');

            if (this.options.grid.showLoadMore) {
                this.$feedWindow.css({
                    'position':'relative'
                });
                this.$loadMore.click(this.onMoreClicked.bind(this))
            } else {
                this.$loadMore.hide();
            }

            this.createHandlers();

            // This triggers post loading
            this.rowsMax = this.options.grid.rows;
            this.updateLayout ();
        }
    }

    loadPosts () {
        console.log ('LOAD POSTS CALLED!!!?!?!!?!?!');
    }

    updateLayout ( ) {
        // Curator.log("Grid->updateLayout ");
        let cols = Math.floor(this.$container.width()/this.options.grid.minWidth);
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

            if (this.feed.pagination && this.feed.pagination.after) {
                params.after = this.feed.pagination.after;
            }

            // console.log (params);

            this.feed._loadPosts(params);
        } else {
            this.updateHeight(false);
        }
    }

    updateHeight (animate) {
        let postHeight = this.$container.find('.crt-post-c').width();
        this.$feedWindow.css({'overflow':'hidden'});

        let maxRows = Math.ceil(this.feed.postCount / this.columnCount);
        let rows = this.rowsMax < maxRows ? this.rowsMax : maxRows;

        if (animate) {
            this.$feedWindow.animate({height:rows * postHeight});
        } else {
            this.$feedWindow.height(rows * postHeight);
        }

        if (this.options.grid.showLoadMore) {
            if (this.feed.allPostsLoaded) {
                this.$loadMore.hide();
            } else {
                this.$loadMore.show();
            }
        }
    }

    createHandlers () {
        let id = this.id;
        let updateLayoutDebounced = Curator.Utils.debounce( () => {
            this.updateLayout ();
        }, 100);

        $(window).on('resize.'+id, updateLayoutDebounced);

        $(window).on('curatorCssLoaded.'+id, updateLayoutDebounced);

        $(document).on('ready.'+id, updateLayoutDebounced);
    }

    destroyHandlers () {
        let id = this.id;

        $(window).off('resize.'+id);

        $(window).off('curatorCssLoaded.'+id);

        $(document).off('ready.'+id);
    }

    onPostsLoaded (event, posts) {
        Curator.log("Grid->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            let that = this;
            let postElements = [];
            $(posts).each(function(i){
                let p = that.createPostElement.call(that, this);
                postElements.push(p.$el);
                that.$feed.append(p.$el);

                if (that.options.animate) {
                    p.$el.css({opacity:0});
                    setTimeout(function () {
                        p.$el.css({opacity: 0}).animate({opacity: 1});
                    }, i * 100);
                }
            });

            this.popupManager.setPosts(posts);

            this.options.onPostsLoaded (this, posts);

            this.updateHeight(true);
        }
    }

    onMoreClicked (ev) {
        ev.preventDefault();

        let rowsToAdd = 1;

        if (this.columnCount <= 1) {
            rowsToAdd = 4
        } else if (this.columnCount === 2) {
            rowsToAdd = 2
        }

        this.rowsMax +=rowsToAdd;

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

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    }

}

Curator.Grid = Grid;
