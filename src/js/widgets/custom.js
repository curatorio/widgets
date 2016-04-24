(function (global, Curator, $) {
    "use strict";

    var defaults = {
        feedId:'',
        postsPerPage:12,
        maxPosts:0,
        apiEndpoint:'http://api.curator.io/v1'
    };

    var Client = function (options) {
        this.init(options);
        this.totalPostsLoaded = 0;
        this.allLoaded = false;
    };

    Curator.Templates.postTemplate = ' \
<div class="crt-post-c">\
    <div class="crt-post post<%=id%>"> \
        <div class="crt-post-header"> \
            <span class="social-icon"><i class="<%=network_id==1?\'crt-icon-twitter-bird\':\'crt-icon-instagram\'%>"></i></span> \
            <img src="<%=user_image%>"  /> \
            <div class="crt-post-name"><%=user_full_name%><br/><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div> \
        </div> \
        <div class="crt-post-content <%=image?\'crt-post-content-image\':\'crt-post-content-text\'%>"> \
            <div class="image"> \
                <img src="<%=image%>" /> \
            </div> \
            <div class="text"> \
                <%=this.parseText(text)%> \
            </div> \
        </div> \
        <div class="crt-post-share">Share <a href="#" class="shareFacebook"><i class="crt-icon-facebook"></i></a>  <a href="#" class="shareTwitter"><i class="crt-icon-twitter-bird"></i></a> </div> \
    </div>\
</div>';

    $.extend(Client.prototype,{
        containerHeight: 0,
        loading: false,
        feed: null,
        $container: null,
        $feed: null,
        posts:[],

        init: function (options) {
            Curator.debug = options.debug;

            Curator.log("Custom->init with options:");

            this.options = $.extend({},defaults,options);

            Curator.log(this.options);

            this.feed = new Curator.Feed ({
                debug:this.options.debug,
                feedId:this.options.feedId,
                postsToFetch:this.options.postsPerPage,
                apiEndpoint:this.options.apiEndpoint
            });
            this.$container = jQuery(this.options.container);
            this.$feed = jQuery('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-custom');

            if (!this.feed.checkPowered(this.$container)){
                global.alert ('Container is missing Powered by Curator');
            } else {
                this.loadPosts();
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
            }
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
            jQuery(post).bind('postClick',$.proxy(this.onPostClick, this));
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

    global.Curator.Custom = Client;

    return global.curator;
})(window, window.Curator, window.jQuery);

