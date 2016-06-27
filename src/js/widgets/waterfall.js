
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

Curator.Templates.postTemplate = ' \
<div class="crt-post-c">\
    <div class="crt-post post<%=id%>"> \
        <div class="crt-post-header"> \
            <span class="social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
            <img src="<%=user_image%>"  /> \
            <div class="crt-post-name"><span><%=user_full_name%></span><br/><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div> \
        </div> \
        <div class="crt-post-content"> \
            <div class="image crt-post-content-image <%=this.contentImageClasses()%>" > \
                <img src="<%=image%>" /> \
            </div> \
            <div class="text crt-post-content-text <%=this.contentTextClasses()%>"> \
                <%=this.parseText(text)%> \
            </div> \
        </div> \
        <div class="crt-post-share">Share <a href="#" class="shareFacebook"><i class="crt-icon-facebook"></i></a>  <a href="#" class="shareTwitter"><i class="crt-icon-twitter-bird"></i></a> </div> \
    </div>\
</div>';

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

        var that = this;

        this.feed = new Curator.Feed ({
            debug:this.options.debug,
            feedId:this.options.feedId,
            postsToFetch:this.options.postsPerPage,
            apiEndpoint:this.options.apiEndpoint
        });
        this.$container = jQuery(this.options.container);
        this.$scroll = jQuery('<div class="crt-feed-scroll"></div>').appendTo(this.$container);
        this.$feed = jQuery('<div class="crt-feed"></div>').appendTo(this.$scroll);
        this.$container.addClass('crt-feed-container');

        if (!this.feed.checkPowered(this.$container)){
            Curator.alert ('Container is missing Powered by Curator');
        } else {
            //this.$feed.waterfall();

            this.feed.loadPosts(jQuery.proxy(this.onLoadPosts, this),jQuery.proxy(this.onLoadPostsFail, this));

            if (this.scroll=='continuous') {
                jQuery(this.$scroll).scroll(function () {
                    var height = that.$scroll.height();
                    var cHeight = that.$feed.height();
                    var scrollTop = that.$scroll.scrollTop();
                    if (scrollTop >= cHeight - height) {
                        that.feed.loadMorePosts(jQuery.proxy(that.onLoadPosts, that), jQuery.proxy(that.onLoadPostsFail, that));
                    }
                });
            } else {
                this.$more = jQuery('<div class="crt-feed-more"><a href="#"><span>Load more</span></a></div>').appendTo(this.$scroll);
                this.$more.find('a').on('click',function(ev){
                    ev.preventDefault();
                    that.feed.loadMorePosts(jQuery.proxy(that.onLoadPosts, that), jQuery.proxy(that.onLoadPostsFail, that));
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

