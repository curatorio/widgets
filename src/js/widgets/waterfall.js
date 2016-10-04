
Curator.WaterfallDefaults = {
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    apiEndpoint:'https://api.curator.io/v1',
    scroll:'more',
    onPostsLoaded:function(){},
    waterfall: {
        gridWidth:250,
        animate:true,
        animateSpeed:400
    }
}; 


Curator.Waterfall = Curator.augment.extend(Curator.Client, {
    containerHeight: 0,
    loading: false,
    feed: null,
    $container: null,
    $feed: null,
    posts:[],
    popupManager:null,
    name:'Waterfall',

    constructor: function (options) {
        this.uber.setOptions.call (this, options,  Curator.WaterfallDefaults);
        this.options.waterfall = $.extend({}, Curator.WaterfallDefaults.waterfall, options.waterfall);

        Curator.log("Waterfall->init with options:");
        Curator.log(this.options);

        if (this.uber.init.call (this)) {
            this.$scroll = $('<div class="crt-feed-scroll"></div>').appendTo(this.$container);
            this.$feed = $('<div class="crt-feed"></div>').appendTo(this.$scroll);
            this.$container.addClass('crt-feed-container');

            if (this.options.scroll=='continuous') {
                $(this.$scroll).scroll(function () {
                    var height = this.$scroll.height();
                    var cHeight = this.$feed.height();
                    var scrollTop = this.$scroll.scrollTop();
                    if (scrollTop >= cHeight - height) {
                        this.loadMorePosts();
                    }
                }.bind(this));
            } else if (this.options.scroll=='none') {
                // no scroll - use javascript to trigger loading
            } else {
                // default to more
                this.$more = $('<div class="crt-feed-more"><a href="#"><span>Load more</span></a></div>').appendTo(this.$scroll);
                this.$more.find('a').on('click',function(ev){
                    ev.preventDefault();
                    this.loadMorePosts();
                }.bind(this));
            }

            this.$feed.gridalicious({
                selector:'.crt-post-c',
                gutter:0,
                width:this.options.waterfall.gridWidth,
                animate:this.options.waterfall.animate,
                animationOptions: {
                    speed: (this.options.waterfall.animateSpeed/2),
                    duration: this.options.waterfall.animateSpeed
                }
            });

            // Load first set of posts
            this.loadPosts(0);
        }
    },
    
    loadPosts : function (page, clear) {
        Curator.log('Waterfall->loadPage');
        if (clear) {
            this.$feed.find('.crt-post-c').remove();
        }
        this.feed.loadPosts(page);
    },

    loadMorePosts : function () {
        Curator.log('Waterfall->loadMorePosts');

        this.feed.loadPosts(this.feed.currentPage+1);
    },

    onPostsLoaded: function (posts) {
        Curator.log("Waterfall->onPostsLoaded");
        
        var postElements = this.createPostElements (posts);

        //this.$feed.append(postElements);
        this.$feed.gridalicious('append', postElements);

        var that = this;
        $.each(postElements,function (i) {
            var post = this;
            if (that.options.waterfall.showReadMore) {
                post.find('.crt-post')
                    .addClass('crt-post-show-read-more');
            }
        });

        this.popupManager.setPosts(posts);

        this.loading = false;
        this.options.onPostsLoaded (this, posts);
    },

    onPostsFailed: function (data) {
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    },

    destroy : function () {
        //this.$feed.slick('unslick');
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
});

