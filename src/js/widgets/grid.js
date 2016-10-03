Curator.GridDefaults = {
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    apiEndpoint:'https://api.curator.io/v1',
    onPostsLoaded:function(){},
    animate:true,
    grid: {
        minWidth:200,
        rows:3
    }
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
                <a href="javascript:;" class="crt-play"><i class="play"></i></a> \
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

Curator.Templates.gridFeedTemplate = ' \
<div class="crt-feed-window">\
    <div class="crt-feed"></div>\
</div>\
<div class="crt-feed-more"><a href="#">Load more</a></div>';


Curator.Grid = Curator.augment.extend(Curator.Client, {
    containerHeight: 0,
    loading: false,
    feed: null,
    $container: null,
    $feed: null,
    posts:[],
    totalPostsLoaded:0,
    allLoaded:false,
    previousCol:0,
    page:0,

    constructor: function (options) {
        this.uber.setOptions.call (this, options,  Curator.GridDefaults);

        Curator.log("Panel->init with options:");
        Curator.log(this.options);

        if (this.uber.init.call (this)) {
            this.options.grid = $.extend({}, Curator.GridDefaults.grid, options.grid);

            var tmpl = Curator.Template.render('#gridFeedTemplate', {});
            this.$container.append(tmpl);
            this.$feed = this.$container.find('.crt-feed');
            this.$feedWindow = this.$container.find('.crt-feed-window');
            this.$loadMore = this.$container.find('.crt-feed-more a');

            this.$container.addClass('crt-grid');

            var cols = Math.floor(this.$container.width()/this.options.grid.minWidth);
            var postsNeeded = cols *  (this.options.grid.rows + 1); // get 1 extra row just in case

            if (this.options.grid.showLoadMore) {
                this.$feed.css({
                    position:'absolute',
                    left:0,
                    top:0,
                    width:'100%'
                });
                this.$feedWindow.css({
                    'position':'relative'
                });
                postsNeeded = cols *  (this.options.grid.rows * 2); //
                this.$loadMore.click(this.onMoreClicked.bind(this))
            } else {
                this.$loadMore.hide();
            }
            this.feed.options.postsPerPage = postsNeeded;
            this.loadPosts(0);
        }

        var to = null;
        var that = this;
        $(window).resize(function(){
            clearTimeout(to);
            to = setTimeout(function(){
                that.updateLayout();
            },100);
        });
        this.updateLayout ();

        $(window).on('curatorCssLoaded',function(){
            clearTimeout(to);
            to = setTimeout(function(){
                that.updateLayout();
            },100);
        });

        $(document).on('ready',function(){
            clearTimeout(to);
            to = setTimeout(function(){
                that.updateLayout();
            },100);
        });
    },

    onPostsLoaded: function (posts) {
        Curator.log("Grid->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            var that = this;
            var postElements = [];
            $(posts).each(function(i){
                var p = that.createPostElement(this);
                postElements.push(p.$el);
                that.$feed.append(p.$el);

                if (that.options.animate) {
                    p.$el.css({opacity: 0});
                    setTimeout(function () {
                        p.$el.css({opacity: 0}).animate({opacity: 1});
                    }, i * 100);
                }
            });

            this.popupManager.setPosts(posts);

            this.options.onPostsLoaded (this, posts);

            this.updateHeight();
        }
    },

    createPostElement: function (postJson) {
        var post = new Curator.Post(postJson, '#gridPostTemplate');
        $(post).bind('postClick',$.proxy(this.onPostClick, this));

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

    onMoreClicked: function (ev) {
        ev.preventDefault();

        var postHeight = this.$container.find('.crt-post-c').width();
        var windowHeight = this.options.grid.rows * postHeight;
        // this.$feedWindow.css({'overflow':'hidden'});
        // this.$feedWindow.height(this.options.grid.rows * postHeight);

        this.page += 1;

        var that = this;
        this.$feed.animate({
            'top':0-(windowHeight*this.page)
        },500,'easeInOutSine', function() {
            that.feed.loadMore();
        });
    },

    updateLayout : function ( ) {
        var cols = Math.floor(this.$container.width()/this.options.grid.minWidth);
        var postsNeeded = cols *  this.options.grid.rows;

        this.$container.removeClass('crt-grid-col'+this.previousCol);
        this.previousCol = cols;
        this.$container.addClass('crt-grid-col'+this.previousCol);

        if (postsNeeded > this.feed.postsLoaded) {
            this.loadPosts(this.feed.currentPage+1);
        }

        this.updateHeight();
    },

    updateHeight : function () {
        var postHeight = this.$container.find('.crt-post-c').width();
        this.$feedWindow.css({'overflow':'hidden'});
        this.$feedWindow.height(this.options.grid.rows * postHeight);
    },

    destroy : function () {
        this.$feed.remove();
        this.$container.removeClass('crt-grid').css({'height':'','overflow':''});

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
