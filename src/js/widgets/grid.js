Curator.Config.Grid = $.extend({}, Curator.Config.Defaults, {
    templatePost:'v2-grid-post',
    templateFeed:'v2-grid-feed',
    grid: {
        minWidth:200,
        rows:3
    }
});


class Grid extends Client {

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
        this.totalPostsLoaded=0;
        this.allLoaded=false;
        this.previousCol=0;
        this.page=0;
        this.rowsShowing=0;

        if (this.init (this)) {

            let tmpl = Curator.Template.render(this.options.templateFeed, {});
            this.$container.append(tmpl);
            this.$feed = this.$container.find('.crt-feed');
            this.$feedWindow = this.$container.find('.crt-feed-window');
            this.$loadMore = this.$container.find('.crt-feed-more a');

            this.$container.addClass('crt-grid');

            let cols = Math.floor(this.$container.width()/this.options.grid.minWidth);
            let postsNeeded = cols *  (this.options.grid.rows + 1); // get 1 extra row just in case

            if (this.options.grid.showLoadMore) {
                // this.$feed.css({
                //     position:'absolute',
                //     left:0,
                //     top:0,
                //     width:'100%'
                // });
                this.$feedWindow.css({
                    'position':'relative'
                });
                // postsNeeded = cols *  (this.options.grid.rows * 2); //
                this.$loadMore.click(this.onMoreClicked.bind(this))
            } else {
                this.$loadMore.hide();
            }

            this.rowsShowing = this.options.grid.rows;

            this.feed.options.postsPerPage = postsNeeded;
            this.loadPosts(0);
        }

        this.createHandlers();

        // Debounce wrapper ...
        this.updateLayout = Curator.Utils.debounce(this.updateLayout, 20);

        this.updateLayout ();
    }

    createHandlers () {
        let id = this.id;

        $(window).on('resize.'+id, this.updateLayout.bind(this));

        $(window).on('curatorCssLoaded.'+id, this.updateLayout.bind(this));

        $(document).on('ready.'+id, this.updateLayout.bind(this));
    }

    destroyHandlers () {
        let id = this.id;

        $(window).off('resize.'+id);

        $(window).off('curatorCssLoaded.'+id);

        $(document).off('ready.'+id);
    }

    onPostsLoaded (posts) {
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

            this.updateHeight();
        }
    }

    createPostElement (postJson) {
        let post = new Curator.Post(postJson, this.options, this);
        $(post).bind('postClick',$.proxy(this.onPostClick, this));
        
        if (this.options.onPostCreated) {
            this.options.onPostCreated (post);
        }

        return post;
    }

    onPostsFailed (data) {
        Curator.log("Grid->onPostsFailed");
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    }

    onPostClick (ev,post) {
        this.popupManager.showPopup(post);
    }

    onMoreClicked (ev) {
        ev.preventDefault();

        this.rowsShowing = this.rowsShowing + this.options.grid.rows;

        this.updateHeight(true);

        this.feed.loadMore();
    }

    updateLayout ( ) {
        // Curator.log("Grid->updateLayout ");

        let cols = Math.floor(this.$container.width()/this.options.grid.minWidth);
        let postsNeeded = cols *  this.options.grid.rows;

        this.$container.removeClass('crt-grid-col'+this.previousCol);
        this.previousCol = cols;
        this.$container.addClass('crt-grid-col'+this.previousCol);

        if (postsNeeded > this.feed.postsLoaded) {
            this.loadPosts(this.feed.currentPage+1);
        }

        this.updateHeight();
    }

    updateHeight (animate) {
        let postHeight = this.$container.find('.crt-post-c').width();
        this.$feedWindow.css({'overflow':'hidden'});

        let maxRows = Math.ceil(this.feed.postCount / this.previousCol);
        let rows = this.rowsShowing < maxRows ? this.rowsShowing : maxRows;

        if (animate) {
            this.$feedWindow.animate({height:rows * postHeight});
        } else {
            this.$feedWindow.height(rows * postHeight);
        }

        if (this.options.grid.showLoadMore) {
            if (this.rowsShowing >= maxRows) {
                this.$loadMore.hide();
            } else {
                this.$loadMore.show();
            }
        }
    }

    destroy () {
        super.destroy();

        this.destroyHandlers();

        this.$container.empty()
            .removeClass('crt-grid')
            .removeClass('crt-grid-col'+this.previousCol)
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
