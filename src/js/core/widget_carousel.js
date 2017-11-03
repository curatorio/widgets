

Curator.Config.Carousel = $.extend({}, Curator.Config.Defaults, {
    scroll:'more',
    carousel:{
        autoPlay:true,
        autoLoad:true,
        infinite:false
    },
});

class Carousel extends Widget {

    constructor (options) {
        super ();

        options.postsPerPage = 60;

        this.setOptions (options,  Curator.Config.Carousel);

        this.containerHeight=0;
        this.loading=false;
        this.posts=[];
        this.firstLoad=true;

        Curator.log("Carousel->init with options:");
        Curator.log(this.options);

        if (this.init (this)) {

            this.allLoaded = false;

            // this.$wrapper = $('<div class="crt-carousel-wrapper"></div>').appendTo(this.$container);
            this.$feed = $('<div class="crt-carousel-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-carousel');

            this.carousel = new Curator.UI.Layout.Carousel(this.$feed, this.options.carousel);
            this.carousel.on(Curator.Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));

            this.on(Curator.Events.FILTER_CHANGED, event => {
                this.$feed.find('.crt-post').remove();
            });

            // load first set of posts
            this.loadPosts(0);
        }
    }

    loadMorePosts  () {
        Curator.log('Carousel->loadMorePosts');

        if (this.feed.postCount > this.feed.postsLoaded) {
            this.feed.loadPosts(this.feed.currentPage + 1);
        }
    }

    onPostsLoaded (event, posts) {
        Curator.log("Carousel->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
             let that = this;
             let $els = [];
            $(posts).each(function(i){
                let p = that.createPostElement(this);
                $els.push(p.$el);

                if (that.options.animate && that.firstLoad) {
                    p.$el.css({opacity: 0});
                    setTimeout(function () {
                        console.log (i);
                        p.$el.css({opacity: 0}).animate({opacity: 1});
                    }, i * 100);
                }
            });

            this.carousel.add($els);
            this.carousel.update();

            this.popupManager.setPosts(posts);

            this.options.onPostsLoaded (this, posts);
        }
        this.firstLoad = false;
    }

    onCarouselChange (event, currentSlide) {
        if (this.options && this.options.carousel.autoLoad) {
            if (currentSlide >= this.feed.postsLoaded - this.carousel.PANES_VISIBLE) {
                this.loadMorePosts();
            }
        }
    }

    destroy  () {
        super.destroy();

        this.feed.destroy();

        this.carousel.off(Curator.Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));
        this.carousel.destroy();

        this.$feed.remove();
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


Curator.Carousel = Carousel;