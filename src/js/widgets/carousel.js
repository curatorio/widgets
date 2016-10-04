
Curator.CarouselDefaults = {
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    apiEndpoint:'https://api.curator.io/v1',
    scroll:'more',
    animate:true,
    carousel:{
        autoPlay:true,
        autoLoad:true
    },
    onPostsLoaded:function(){}
};

Curator.Carousel = Curator.augment.extend(Curator.Client, {
    containerHeight: 0,
    loading: false,
    feed: null,
    $container: null,
    $feed: null,
    posts:[],
    carousel:null,

    constructor: function (options) {
        this.uber.setOptions.call (this, options,  Curator.CarouselDefaults);

        Curator.log("Carousel->init with options:");
        Curator.log(this.options);

        if (this.uber.init.call (this)) {
            this.options.carousel = $.extend({}, Curator.CarouselDefaults.carousel, options.carousel);

            this.allLoaded = false;

            var that = this;

            // this.$wrapper = $('<div class="crt-carousel-wrapper"></div>').appendTo(this.$container);
            this.$feed = $('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-carousel');

            this.$feed.curatorCarousel(this.options.carousel);
            this.$feed.on('curatorCarousel:changed', function (event, carousel, currentSlide) {
                // console.log('curatorCarousel:changed '+currentSlide);
                // console.log('curatorCarousel:changed '+(that.feed.postsLoaded-carousel.PANES_VISIBLE));
                // console.log(carousel.PANES_VISIBLE);
                if (that.options.carousel.autoLoad) {
                    // if (currentSlide >= that.feed.postsLoaded - carousel.PANES_VISIBLE) {
                    that.loadMorePosts();
                    // }
                }
            });

            // load first set of posts
            this.loadPosts(0);
        }
    },

    loadMorePosts : function () {
        Curator.log('Carousel->loadMorePosts');

        this.feed.loadPosts(this.feed.currentPage+1);
    },

    onPostsLoaded: function (posts) {
        Curator.log("Carousel->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            var that = this;
            var $els = [];
            $(posts).each(function(i){
                var p = that.createPostElement(this);
                $els.push(p.$el);

                if (that.options.animate) {
                    p.$el.css({opacity: 0});
                    setTimeout(function () {
                        p.$el.css({opacity: 0}).animate({opacity: 1});
                    }, i * 100);
                }
            });

            that.$feed.curatorCarousel('add',$els);
            that.$feed.curatorCarousel('update');

            // that.$feed.c().trigger('add.owl.carousel',$(p.$el));

            this.popupManager.setPosts(posts);

            this.options.onPostsLoaded (this, posts);
        }
    },

    onPostsFail: function (data) {
        Curator.log("Carousel->onPostsFail");
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    },

    destroy : function () {
        this.$feed.curatorCarousel('destroy');
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

});
