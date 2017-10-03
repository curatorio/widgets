
Curator.Config.Panel = $.extend({}, Curator.Config.Defaults, {
    panel: {
        // speed: 500,
        autoPlay: true,
        autoLoad: true,
        moveAmount:1,
        fixedHeight:false,
        infinite:true,
        minWidth:2000
    }
});

class Panel extends Widget {

    constructor  (options) {
        super ();

        this.setOptions (options,  Curator.Config.Panel);

        Curator.log("Panel->init with options:");
        Curator.log(this.options);

        this.containerHeight=0;
        this.loading=false;
        this.feed=null;
        this.$container=null;
        this.$feed=null;
        this.posts=[];

        if (this.init (this)) {
            this.allLoaded = false;

            this.$feed = $('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-carousel');
            this.$container.addClass('crt-panel');

            if (this.options.panel.fixedHeight) {
                this.$container.addClass('crt-panel-fixed-height');
            }

            this.carousel = new Curator.UI.Layout.Carousel(this.$feed, this.options.panel);
            this.carousel.on(Curator.Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));

            // load first set of posts
            this.loadPosts(0);
        }
    }

    loadMorePosts   () {
        Curator.log('Panel->loadMorePosts');

        this.feed.loadPosts(this.feed.currentPage+1);
    }

    onPostsLoaded  (event, posts) {
        Curator.log("Panel->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            let that = this;
            let $els = [];
            $(posts).each(function() {
                let p = that.createPostElement(this);
                $els.push(p.$el);
            });


            this.carousel.add($els);
            this.carousel.update();

            this.popupManager.setPosts(posts);

            this.options.onPostsLoaded (this, posts);
        }
    }

    onPostImageLoaded (ev, post) {
        Curator.log('Panel->onPostImageLoaded');
        this.carousel.updateHeight();
    }

    onCarouselChange (event, currentSlide) {
        if (this.options && this.options.panel.autoLoad) {
            if (currentSlide >= this.feed.postsLoaded - 4) {
                this.loadMorePosts();
            }
        }
    }

    destroy   () {

        super.destroy();

        this.carousel.off(Curator.Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));
        this.carousel.destroy();

        this.$feed.remove();
        this.$container.removeClass('crt-panel');
        this.$container.removeClass('crt-carousel');


        delete this.$feed;
        delete this.$container;
        delete this.options ;
        delete this.feed.postsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    }
}

Curator.Panel = Panel;
