
class Widget extends EventBus {

    constructor () {
        Curator.log('Widget->construct');

        super ();

        this.id = Curator.Utils.uId ();
        Curator.log('id='+this.id);
    }

    setOptions (options, defaults) {

        this.options = $.extend(true,{}, defaults, options);

        if (options.debug) {
            Curator.debug = true;
        }

        // Curator.log(this.options);

        return true;
    }

    init () {

        if (!Curator.checkContainer(this.options.container)) {
            return false;
        }

        this.$container = $(this.options.container);
        this.$container.addClass('crt-feed');

        this.createFeed();
        this.createFilter();
        this.createPopupManager();

        return true;
    }

    createFeed () {
        this.feed = new Curator.Feed (this);
        this.feed.on(Curator.Events.FEED_LOADED, this.onPostsLoaded.bind(this));
        this.feed.on(Curator.Events.FEED_FAILED, this.onPostsFail.bind(this));
    }

    createPopupManager () {
        this.popupManager = new Curator.PopupManager(this);
    }

    createFilter () {
        if (this.options.filter && (this.options.filter.showNetworks || this.options.filter.showSources)) {
            this.filter = new Curator.Filter(this);
        }
    }

    loadPosts (page) {
        this.feed.loadPosts(page);
    }

    createPostElements (posts)
    {
        let that = this;
        let postElements = [];
        $(posts).each(function(){
            let p = that.createPostElement(this);
            postElements.push(p.$el);
        });
        return postElements;
    }

    createPostElement (postJson) {
        let post = new Curator.Post(postJson, this.options, this);
        post.on(Curator.Events.POST_CLICK,this.onPostClick.bind(this));
        post.on(Curator.Events.POST_CLICK_READ_MORE,this.onPostClick.bind(this));
        post.on(Curator.Events.POST_IMAGE_LOADED, this.onPostImageLoaded.bind(this));

        this.trigger(Curator.Events.POST_CREATED, post);

        return post;
    }

    onPostsLoaded (event, posts) {
        Curator.log('Widget->onPostsLoaded');
        Curator.log(posts);
    }

    onPostsFail (event, data) {
        Curator.log('Widget->onPostsLoadedFail');
        Curator.log(data);
    }

    onPostClick (ev, post, postJson) {
        Curator.log('Widget->onPostClick');
        Curator.log(ev);
        Curator.log(postJson);

        if (this.options.showPopupOnClick) {
            this.popupManager.showPopup(post);
        }
    }

    onPostImageLoaded (ev, post) {
        Curator.log('Widget->onPostImageLoaded');
    }

    track (a) {
        Curator.log('Feed->track '+a);

        Curator.ajax(
            this.getUrl('/track/'+this.options.feedId),
            {a:a},
            (data) => {
                Curator.log('Feed->track success');
                Curator.log(data);
            },
            (jqXHR, textStatus, errorThrown) => {
                Curator.log('Feed->_loadPosts fail');
                Curator.log(textStatus);
                Curator.log(errorThrown);
            }
        );
    }

    getUrl (trail) {
        return this.options.apiEndpoint+trail;
    }

    destroy () {
        Curator.log('Widget->destroy');
        if (this.feed) {
            this.feed.destroy()
        }
        if (this.filter) {
            this.filter.destroy()
        }
        if (this.popupManager) {
            this.popupManager.destroy()
        }
        this.$container.removeClass('crt-feed');
    }
}


Curator.Widget = Widget;