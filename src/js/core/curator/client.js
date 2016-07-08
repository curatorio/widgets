
Curator.Client = augment.extend(Object, {
    constructor : function () {
        Curator.log('Client->construct');

    },
    init : function (options, defaults) {
        
        this.options = jQuery.extend({}, defaults,options);

        Curator.log(this.options);

        if (!Curator.checkContainer(this.options.container)) {
            return false;
        }

        this.$container = jQuery(this.options.container);

        if (!Curator.checkPowered(this.$container)) {
            return false;
        }

        this.createFeed();
        this.createPopupManager();

        return true;
    },

    createFeed : function () {
        this.feed = new Curator.Feed ({
            debug:this.options.debug,
            feedId:this.options.feedId,
            feedParams:this.options.feedParams,
            postsPerPage:this.options.postsPerPage,
            apiEndpoint:this.options.apiEndpoint,
            onPostsLoaded:this.onPostsLoaded.bind(this),
            onPostsFail:this.onPostsFail.bind(this)
        });
    },
    
    createPopupManager : function () {
        this.popupManager = new Curator.PopupManager(this);
    },

    loadPosts: function (page) {
        this.feed.loadPosts(page);
    },

    createPostElements : function (posts)
    {
        var that = this;
        var postElements = [];
        jQuery(posts).each(function(){
            var p = that.createPostElement(this);
            postElements.push(p.$el);
        });
        return postElements;
    },

    createPostElement: function (postJson) {
        var post = new Curator.Post(postJson);
        jQuery(post).bind('postClick',jQuery.proxy(this.onPostClick, this));

        if (this.options.onPostCreated) {
            this.options.onPostCreated (post);
        }

        return post;
    },

    onPostsLoaded: function (posts) {
        Curator.log('Client->onPostsLoaded');
        Curator.log(posts);
    },

    onPostsFail: function (data) {
        Curator.log('Client->onPostsLoadedFail');
        Curator.log(data);
    },

    onPostClick: function (ev,post) {
        this.popupManager.showPopup(post);
    }
});