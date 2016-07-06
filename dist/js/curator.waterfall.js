;(function(root, factory) {
if (typeof define === 'function' && define.amd) {
    // Cheeky wrapper to add root to the factory call
    var factoryWrap = function () { 
        var argsCopy = [].slice.call(arguments); 
        argsCopy.unshift(root);
        return factory.apply(this, argsCopy); 
    };
    define(['jquery', 'curator'], factoryWrap);
} else if (typeof exports === 'object') {
    module.exports = factory(root, require('jquery'), require('curator'));
} else {
    root.Curator.Waterfall = factory(root, root.jQuery, root.Curator);
}
}(this, function(root, jQuery, Curator) {

var widgetDefaults = {
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    apiEndpoint:'https://api.curator.io/v1',
    scroll:'more',
    gridWith:250
};


var Client = function (options) {
    if (options.debug)
    {
        Curator.debug = options.debug;
    }
    Curator.log ('Client->init');

    this.init(options);
};

jQuery.extend(Client.prototype,{
    containerHeight: 0,
    loading: false,
    feed: null,
    $container: null,
    $feed: null,
    posts:[],

    init: function (options) {
        Curator.log("Waterfall->init with options:");

        this.options = jQuery.extend({},widgetDefaults,options);

        Curator.log(this.options);

        if (!Curator.checkContainer(this.options.container)) {
            return;
        }

        var that = this;

        this.feed = new Curator.Feed ({
            debug:this.options.debug,
            feedId:this.options.feedId,
            postsPerPage:this.options.postsPerPage,
            apiEndpoint:this.options.apiEndpoint,
            onLoad:this.onLoadPosts.bind(this),
            onFail:this.onLoadPostsFail.bind(this)
        });
        this.$container = jQuery(this.options.container);
        this.$scroll = jQuery('<div class="crt-feed-scroll"></div>').appendTo(this.$container);
        this.$feed = jQuery('<div class="crt-feed"></div>').appendTo(this.$scroll);
        this.$container.addClass('crt-feed-container');

        if (Curator.checkPowered(this.$container)) {
            this.feed.loadPosts();

            if (this.scroll=='continuous') {
                jQuery(this.$scroll).scroll(function () {
                    var height = that.$scroll.height();
                    var cHeight = that.$feed.height();
                    var scrollTop = that.$scroll.scrollTop();
                    if (scrollTop >= cHeight - height) {
                        that.feed.loadMorePosts();
                    }
                });
            } else {
                this.$more = jQuery('<div class="crt-feed-more"><a href="#"><span>Load more</span></a></div>').appendTo(this.$scroll);
                this.$more.find('a').on('click',function(ev){
                    ev.preventDefault();
                    that.feed.loadMorePosts();
                });
            }

            this.$feed.gridalicious({
                selector:'.crt-post-c',
                gutter:0,
                width:this.options.gridWith
            });
        }
    },

    onLoadPosts: function (posts) {
        Curator.log("loadPosts");
        var that = this;
        var postElements = [];
        jQuery(posts).each(function(){
            var p = that.loadPost(this);
            postElements.push(p.el);
        });

        //this.$feed.append(postElements);
        that.$feed.gridalicious('append',postElements);

        that.loading = false;
    },

    onLoadPostsFail: function (data) {
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    },

    onPostClick: function (ev,postJson) {
        var popup = new Curator.Popup(postJson, this.feed);
        popup.show();
    },

    loadPost: function (postJson) {
        var post = new Curator.Post(postJson);
        jQuery(post).bind('postClick',jQuery.proxy(this.onPostClick, this));
        return post;
    },
    
    loadPage : function (page) {
        this.$feed.find('.crt-post-c').remove();
        this.feed.loadPage(page);
    },

    destroy : function () {
        //this.$feed.slick('unslick');
        this.$feed.remove();
        this.$scroll.remove();
        this.$more.remove();
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


    return Client;
}));
