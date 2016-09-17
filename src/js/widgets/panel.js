
Curator.PanelDefaults = {
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    apiEndpoint:'https://api.curator.io/v1',
    panel: {
        // speed: 500,
        autoPlay: true,
        autoLoad: true,
        moveAmount:1,
        fixedHeight:false,
        infinite:true
    },
    onPostsLoaded:function(){}
};


Curator.Panel = Curator.augment.extend(Curator.Client, {
    containerHeight: 0,
    loading: false,
    feed: null,
    $container: null,
    $feed: null,
    posts:[],

    constructor: function (options) {
        this.uber.setOptions.call (this, options,  Curator.PanelDefaults);

        Curator.log("Panel->init with options:");
        Curator.log(this.options);

        if (this.uber.init.call (this)) {
            this.options.panel = $.extend({}, Curator.PanelDefaults.panel, options.panel);

            this.allLoaded = false;

            var that = this;

            this.$feed = $('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-panel');

            if (this.options.panel.fixedHeight) {
                this.$container.addClass('crt-panel-fixed-height');
            }

            this.$feed.curatorCarousel(this.options.panel);
            this.$feed.on('curatorCarousel:changed', function (event, carousel, currentSlide) {
                if (!that.allLoaded && that.options.panel.autoLoad) {
                    if (currentSlide >= that.feed.postsLoaded - 4) {
                        that.loadMorePosts();
                    }
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
            $(posts).each(function(){
                var p = that.createPostElement(this);
                $els.push(p.$el);
            });

            that.$feed.curatorCarousel('add',$els);
            that.$feed.curatorCarousel('update');

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
        this.$container.removeClass('crt-panel');

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
