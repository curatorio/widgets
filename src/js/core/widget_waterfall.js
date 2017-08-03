
Curator.Config.Waterfall = $.extend({}, Curator.Config.Defaults, {
    scroll:'more',
    waterfall: {
        gridWidth:300,
        animate:true,
        animateSpeed:400
    }
});


class Waterfall extends Widget {

    constructor (options) {
        super ();

        this.setOptions (options,  Curator.Config.Waterfall);

        Curator.log("Waterfall->init with options:");
        Curator.log(this.options);

        if (this.init (this)) {
            this.$scroll = $('<div class="crt-feed-scroll"></div>').appendTo(this.$container);
            this.$feed = $('<div class="crt-feed"></div>').appendTo(this.$scroll);
            this.$container.addClass('crt-feed-container');

            if (this.options.scroll === 'continuous') {
                $(this.$scroll).scroll(() => {
                    let height = this.$scroll.height();
                    let cHeight = this.$feed.height();
                    let scrollTop = this.$scroll.scrollTop();
                    if (scrollTop >= cHeight - height) {
                        this.loadMorePosts();
                    }
                });
            } else if (this.options.scroll === 'none') {
                // no scroll - use javascript to trigger loading
            } else {
                // default to more
                this.$more = $('<div class="crt-feed-more"><a href="#"><span>Load more</span></a></div>').appendTo(this.$scroll);
                this.$more.find('a').on('click',(ev) => {
                    ev.preventDefault();
                    this.loadMorePosts();
                });
            }

            this.ui = new Curator.UI.Layout.Waterfall({
                selector:'.crt-post-c',
                gutter:0,
                width:this.options.waterfall.gridWidth,
                animate:this.options.waterfall.animate,
                animationOptions: {
                    speed: (this.options.waterfall.animateSpeed/2),
                    duration: this.options.waterfall.animateSpeed
                }
            },this.$feed);

            this.on(Curator.Events.FILTER_CHANGED, event => {
                this.$feed.find('.crt-post-c').remove();
            });

            // Load first set of posts
            this.feed.load();
        }
    }

    loadMorePosts  () {
        Curator.log('Waterfall->loadMorePosts');

        this.feed.loadAfter();
    }


    loadPage  (page) {
        Curator.log('Waterfall->loadPage');

        this.$feed.find('.crt-post').remove();

        this.feed.loadPosts(page);
    }

    onPostsLoaded (event, posts) {
        Curator.log("Waterfall->onPostsLoaded");

        let postElements = this.createPostElements (posts);

        //this.$feed.append(postElements);
        this.ui.append(postElements);

        let that = this;
        $.each(postElements,function (i) {
            let post = this;
            if (that.options.waterfall.showReadMore) {
                post.find('.crt-post')
                    .addClass('crt-post-show-read-more');
            }
        });

        if (this.feed.allPostsLoaded && this.$more) {
            this.$more.hide();
        }

        this.popupManager.setPosts(posts);

        this.loading = false;
        this.options.onPostsLoaded (this, posts);
    }

    destroy  () {
        Curator.log('Waterfall->destroy');
        //this.$feed.slick('unslick');

        super.destroy();

        this.ui.destroy ();

        this.$feed.remove();
        this.$scroll.remove();
        if (this.$more) {
            this.$more.remove();
        }
        this.$container.removeClass('crt-feed-container');

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


Curator.Waterfall = Waterfall;
