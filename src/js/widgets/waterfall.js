
var widgetDefaults = {
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    apiEndpoint:'https://api.curator.io/v1',
    scroll:'more',
    gridWith:250,
    onPostsLoaded:function(){}
};


var Client = augment.extend(Curator.Client, {
    containerHeight: 0,
    loading: false,
    feed: null,
    $container: null,
    $feed: null,
    posts:[],
    popupManager:null,
    name:'Waterfall',

    constructor: function (options) {
        Curator.log("Waterfall->init with options:");

        var inited = this.uber.init.call (this, options,  widgetDefaults);
        // console.log(v);
        if (inited) {
            this.$scroll = jQuery('<div class="crt-feed-scroll"></div>').appendTo(this.$container);
            this.$feed = jQuery('<div class="crt-feed"></div>').appendTo(this.$scroll);
            this.$container.addClass('crt-feed-container');
            this.feed.loadPosts(0);

            if (this.options.scroll=='continuous') {
                jQuery(this.$scroll).scroll(function () {
                    var height = that.$scroll.height();
                    var cHeight = that.$feed.height();
                    var scrollTop = that.$scroll.scrollTop();
                    if (scrollTop >= cHeight - height) {
                        that.feed.loadMorePosts();
                    }
                });
            } else if (this.options.scroll=='more') {
                this.$more = jQuery('<div class="crt-feed-more"><a href="#"><span>Load more</span></a></div>').appendTo(this.$scroll);
                this.$more.find('a').on('click',function(ev){
                    ev.preventDefault();
                    that.feed.loadMorePosts();
                });
            } else {
                // no scroll - use javascript to trigger loading
            }

            this.$feed.gridalicious({
                selector:'.crt-post-c',
                gutter:0,
                width:this.options.gridWith
            });

            this.popupManager = new Curator.PopupManager(this);
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

        this.popupManager.setPosts(posts);

        this.loading = false;
        this.options.onPostsLoaded (this, posts);
    },

    onLoadPostsFail: function (data) {
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
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

