var clientDefaults = {
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    apiEndpoint:'https://api.curator.io/v1',
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
        Curator.debug = options.debug;

        Curator.log("Custom->init with options:");

        this.options = jQuery.extend({},clientDefaults,options);

        Curator.log(this.options);

        if (!Curator.checkContainer(this.options.container)) {
            return;
        }

        this.feed = new Curator.Feed ({
            debug:this.options.debug,
            feedId:this.options.feedId,
            postsPerPage:this.options.postsPerPage,
            apiEndpoint:this.options.apiEndpoint
        });
        this.$container = jQuery(this.options.container);
        this.$feed = jQuery('<div class="crt-feed"></div>').appendTo(this.$container);
        this.$container.addClass('crt-custom');

        if (Curator.checkPowered(this.$container)) {
            this.loadPosts();

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
            var postElements = [];
            jQuery(posts).each(function(){
                var p = that.loadPost(this);
                postElements.push(p.el);
            });
            that.$feed.append(postElements);

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

    loadPosts : function () {
        this.feed.loadMorePosts(this.onLoadPosts.bind(this), this.onLoadPostsFail.bind(this));
    },

    destroy : function () {
        this.$feed.remove();
        this.$container.removeClass('crt-custom');

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
