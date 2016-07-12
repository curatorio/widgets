;(function(root, factory) {
if (typeof define === 'function' && define.amd) {
    // Cheeky wrapper to add root to the factory call
    var factoryWrap = function () { 
        var argsCopy = [].slice.call(arguments); 
        argsCopy.unshift(root);
        return factory.apply(this, argsCopy); 
    };
    define(['jquery', 'curator', 'slick'], factoryWrap);
} else if (typeof exports === 'object') {
    module.exports = factory(root, require('jquery'), require('curator'), require('slick'));
} else {
    root.Curator.Panel = factory(root, root.jQuery, root.Curator, root.slick);
}
}(this, function(root, jQuery, Curator, slick) {

var widgetDefaults = {
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


var Client = Curator.augment.extend(Curator.Client, {
    containerHeight: 0,
    loading: false,
    feed: null,
    $container: null,
    $feed: null,
    posts:[],

    constructor: function (options) {
        this.uber.setOptions.call (this, options,  widgetDefaults);

        Curator.log("Panel->init with options:");
        Curator.log(this.options);

        if (this.uber.init.call (this)) {
            this.options.slick = jQuery.extend({}, widgetDefaults.slick, options.slick);

            this.allLoaded = false;

            var that = this;

            this.$feed = jQuery('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-panel');

            this.$feed.slick(this.options.slick).on('afterChange', function (event, slick, currentSlide) {
                if (!that.allLoaded) {
                    //console.log(currentSlide + '>' + (that.totalPostsLoaded - 4));

                    if (currentSlide >= that.totalPostsLoaded - 4) {
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
            jQuery(posts).each(function(){
                var p = that.createPostElement(this);
                that.$feed.slick('slickAdd',p.$el);
            });
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
        this.$feed.slick('unslick');
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

Curator.Panel = Client;


    return Client;
}));
