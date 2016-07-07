
var clientDefaults = {
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    apiEndpoint:'https://api.curator.io/v1',
    scroll:'more',
    slick:{
        dots: false,
        speed: 500,
        fade:true,
        cssEase: 'ease-in-out',
        infinite: false,
        autoplay: true,
        slidesToShow: 1,
        slidesToScroll: 1
    },
    onPostsLoaded:function(){}
};

var Client = function (options) {
    if (options.debug)
    {
        Curator.debug = options.debug;
    }
    Curator.log ('Client->init');
    
    this.init(options);
    this.totalPostsLoaded = 0;
    this.allLoaded = false;
};

jQuery.extend(Client.prototype,{
    containerHeight: 0,
    loading: false,
    feed: null,
    $container: null,
    $feed: null,
    posts:[],

    init: function (options) {
        Curator.log("Carousel->init with options:");

        this.options = jQuery.extend({},clientDefaults,options);

        Curator.log(this.options);

        if (!Curator.checkContainer(this.options.container)) {
            return;
        }

        var that = this;

        this.feed = new Curator.Feed ({
            debug:this.options.debug,
            feedId:this.options.feedId,
            postsPerPage:this.options.postsPerPage,
            apiEndpoint:this.options.apiEndpoint
        });
        this.$container = jQuery(this.options.container);
        //this.$scroll = jQuery('<div class="crt-feed-scroll"></div>').appendTo(this.$container);
        this.$feed = jQuery('<div class="crt-feed"></div>').appendTo(this.$container);
        this.$container.addClass('crt-panel');

        if (Curator.checkPowered(this.$container)) {
            this.feed.loadPosts(jQuery.proxy(this.onLoadPosts, this),jQuery.proxy(this.onLoadPostsFail, this));

            that.$feed.slick(this.options.slick).on('afterChange', function(event, slick, currentSlide) {

                if (!that.allLoaded) {
                    //console.log(currentSlide + '>' + (that.totalPostsLoaded - 4));

                    if (currentSlide >= that.totalPostsLoaded - 4) {
                        that.feed.loadMorePosts(jQuery.proxy(that.onLoadPosts, that), jQuery.proxy(that.onLoadPostsFail, that));
                    }
                }
            });

            this.popupManager = new Curator.PopupManager(this);
        }
    },

    onLoadPosts: function (posts) {
        Curator.log("loadPosts");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            this.totalPostsLoaded += posts.length;

            var that = this;
            //var postElements = [];
            jQuery(posts).each(function(){
                var p = that.loadPost(this);
                //postElements.push(p.el);
                that.$feed.slick('slickAdd',p.el);
            });

            this.popupManager.setPosts(posts);

            this.options.onPostsLoaded (this, posts);
        }
    },

    onLoadPostsFail: function (data) {
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    },

    onPostClick: function (ev,post) {
        this.popupManager.showPopup(post);
    },

    loadPost: function (postJson) {
        var post = new Curator.Post(postJson);
        jQuery(post).bind('postClick',jQuery.proxy(this.onPostClick, this));
        return post;
    },

    destroy : function () {
        this.$feed.slick('unslick');
        this.$feed.remove();
        this.$container.removeClass('crt-carousel');

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
});

Curator.Panel = Client;

