
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

        this.createFeed();
        this.createFilter();
        this.createPopupManager();

        return true;
    }

    createFeed () {
        this.feed = new Curator.Feed (this);
        this.feed.on('postsLoaded', (event) => {
            this.onPostsLoaded(event.target);
        });
        this.feed.on('postsFailed', (event) => {
            this.onPostsFail(event.target);
        });
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
        post.on('post:click',this.onPostClick.bind(this));
        post.on('post:readMoreClick',this.onPostClick.bind(this));

        if (this.options.onPostCreated) {
            this.options.onPostCreated (post);
        }

        this.on('post:created',post);

        return post;
    }

    onPostsLoaded (event) {
        Curator.log('Widget->onPostsLoaded');
        Curator.log(event.target);
    }

    onPostsFail (event) {
        Curator.log('Widget->onPostsLoadedFail');
        Curator.log(event.target);
    }

    onPostClick (ev) {
        Curator.log('Widget->onPostClick');
        let post = ev.target;
        Curator.log(ev);
        Curator.log(post);

        if (this.options.showPopupOnClick) {
            this.popupManager.showPopup(post);
        }
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
    }
}


Curator.Widget = Widget;