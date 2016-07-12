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
    root.Curator.Custom = factory(root, root.jQuery, root.Curator);
}
}(this, function(root, jQuery, Curator) {
var widgetDefaults = {
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    apiEndpoint:'https://api.curator.io/v1',
    onPostsLoaded:function(){}
};


var Client = Curator.augment.extend(Curator.Client, {
    containerHeight: 0,
    loading: false,
    feed: null,
    $container: null,
    $feed: null,
    posts:[],
    totalPostsLoaded:0,
    allLoaded:false,

    constructor: function (options) {
        this.uber.setOptions.call (this, options,  widgetDefaults);

        Curator.log("Panel->init with options:");
        Curator.log(this.options);

        if (this.uber.init.call (this)) {
            this.$feed = jQuery('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-custom');

            this.loadPosts(0);
        }
    },

    onPostsLoaded: function (posts) {
        Curator.log("Custom->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            var that = this;
            var postElements = [];
            jQuery(posts).each(function(){
                var p = that.createPostElement(this);
                postElements.push(p.$el);
            });
            that.$feed.append(postElements);

            this.popupManager.setPosts(posts);

            this.options.onPostsLoaded (this, posts);
        }
    },

    onPostsFailed: function (data) {
        Curator.log("Custom->onPostsFailed");
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    },

    onPostClick: function (ev,post) {
        this.popupManager.showPopup(post);
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

    return Client;
}));
