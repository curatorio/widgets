
class Client extends EventBus {

    constructor () {
        Curator.log('Client->construct');

        super ();
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
        $(post).bind('postClick',this.onPostClick.bind(this));
        $(post).bind('postReadMoreClick',this.onPostClick.bind(this));

        if (this.options.onPostCreated) {
            this.options.onPostCreated (post);
        }

        return post;
    }

    onPostsLoaded (event) {
        Curator.log('Client->onPostsLoaded');
        Curator.log(event.target);
    }

    onPostsFail (event) {
        Curator.log('Client->onPostsLoadedFail');
        Curator.log(event.target);
    }

    onPostClick (ev,post) {
        this.popupManager.showPopup(post);
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
}

Curator.Client = Client;