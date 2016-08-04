var widgetDefaults = {
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    apiEndpoint:'https://api.curator.io/v1',
    onPostsLoaded:function(){},
    minWidth:200
};

Curator.Templates.gridPostTemplate = ' \
<div class="crt-post-c">\
    <div class="crt-post post<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>"> \
        <div class="crt-post-content"> \
            <div class="crt-hitarea" > \
                <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" class="spacer" /> \
                <div class="crt-post-content-image" style="background-image: url(<%=image%>);"> </div> \
                <div class="crt-post-content-text-c"> \
                    <div class="crt-post-content-text"> \
                        <%=this.parseText(text)%> \
                    </div> \
                </div> \
                <span class="social-icon social-icon-normal"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
                <div class="crt-post-hover">\
                    <div class="crt-post-header"> \
                        <img src="<%=user_image%>"  /> \
                        <div class="crt-post-name"><span><%=user_full_name%></span><br/><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div> \
                    </div> \
                    <div class="crt-post-hover-text"> \
                        <%=this.parseText(text)%> \
                    </div> \
                    <span class="social-icon social-icon-hover"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
                </div> \
            </div> \
        </div> \
    </div>\
</div>';


var Client = Curator.augment.extend(Curator.Client, {
    containerHeight: 0,
    loading: false,
    feed: null,
    $container: null,
    $feed: null,
    posts:[],
    totalPostsLoaded:0,
    allLoaded:false,
    previousCol:0,

    constructor: function (options) {
        this.uber.setOptions.call (this, options,  widgetDefaults);

        Curator.log("Panel->init with options:");
        Curator.log(this.options);

        if (this.uber.init.call (this)) {
            this.$feed = jQuery('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-grid');

            this.loadPosts(0);
        }

        var to = null;
        var that = this;
        jQuery(window).resize(function(){
            clearTimeout(to);
            to = setTimeout(function(){
                that.updateLayout();
            },100);
        });
        this.updateLayout ();
    },

    onPostsLoaded: function (posts) {
        Curator.log("Grid->onPostsLoaded");

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

    createPostElement: function (postJson) {
        var post = new Curator.Post(postJson, '#gridPostTemplate');
        jQuery(post).bind('postClick',jQuery.proxy(this.onPostClick, this));

        if (this.options.onPostCreated) {
            this.options.onPostCreated (post);
        }

        return post;
    },

    onPostsFailed: function (data) {
        Curator.log("Grid->onPostsFailed");
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    },

    onPostClick: function (ev,post) {
        this.popupManager.showPopup(post);
    },

    updateLayout : function ( ) {
        var m = Math.floor(this.$container.width()/this.options.minWidth);

        this.$container.removeClass('crt-grid-col'+this.previousCol);
        this.previousCol = m;
        this.$container.addClass('crt-grid-col'+this.previousCol);

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
