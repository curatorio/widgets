

class Feed extends EventBus {

    constructor(widget) {
        super ();

        Curator.log ('Feed->init with options');

        this.widget = widget;

        this.posts = [];
        this.currentPage = 0;
        this.postsLoaded = 0;
        this.postCount = 0;
        this.loading = false;
        this.allPostsLoaded = false;
        this.pagination = {
            after:null,
            before:null
        };

        this.options = this.widget.options;

        this.params = this.options.feedParams || {};
        this.params.limit = this.options.postsPerPage;

        this.feedBase = this.options.apiEndpoint+'/feeds';
    }

    loadPosts (page, paramsIn) {
        page = page || 0;
        Curator.log ('Feed->loadPosts '+this.loading);
        if (this.loading) {
            return false;
        }
        this.currentPage = page;

        let params = $.extend({},this.options.feedParams,paramsIn);

        params.limit = this.options.postsPerPage;
        params.offset = page * this.options.postsPerPage;

        this._loadPosts (params);
    }

    loadMore (paramsIn) {
        Curator.log ('Feed->loadMore '+this.loading);
        if (this.loading) {
            return false;
        }

        let params = {
            limit:this.options.postsPerPage
        };
        $.extend(params,this.options.feedParams, paramsIn);

        params.offset = this.posts.length;

        this._loadPosts (params);
    }

    /**
     * First load - get's the most recent posts.
     * @param params - set parameters to send to API
     * @returns {boolean}
     */
    load (params) {
        Curator.log ('Feed->load '+this.loading);

        if (this.loading) {
            return false;
        }
        this.currentPage = 0;

        let loadPostParams = $.extend(this.params, params);

        this._loadPosts (loadPostParams);
    }

    /**
     * Loads posts after the current set
     * @returns {boolean}
     */
    loadAfter () {
        Curator.log ('Feed->loadAfter '+this.loading);

        if (this.loading) {
            return false;
        }
        this.currentPage = 0;

        let params = $.extend({},this.params);

        // TODO should we check we have after?
        if (this.pagination && this.pagination.after) {
            params.after = this.pagination.after;
            delete params.before;
        }

        this._loadPosts (params);
    }

    _loadPosts (params) {
        Curator.log ('Feed->_loadPosts');

        this.loading = true;

        Curator.ajax(
            this.getUrl('/posts'),
            params,
            (data) => {
                Curator.log('Feed->_loadPosts success');

                if (data.success) {
                    this.postCount = data.postCount;
                    this.postsLoaded += data.posts.length;

                    this.allPostsLoaded = this.postsLoaded >= this.postCount;

                    this.posts = this.posts.concat(data.posts);
                    this.networks = data.networks;

                    if (data.pagination) {
                        this.pagination = data.pagination;
                    }

                    this.widget.trigger(Curator.Events.FEED_LOADED, data);
                    this.widget.trigger(Curator.Events.POSTS_LOADED, data.posts);

                    this.trigger(Curator.Events.FEED_LOADED, data);
                    this.trigger(Curator.Events.POSTS_LOADED, data.posts);
                } else {
                    this.trigger(Curator.Events.POSTS_FAILED, data.posts);
                }
                this.loading = false;
            },
            (jqXHR, textStatus, errorThrown) => {
                Curator.log('Feed->_loadPosts fail');
                Curator.log(textStatus);
                Curator.log(errorThrown);

                this.trigger(Curator.Events.POSTS_FAILED, []);
                this.loading = false;
            }
        );
    }

    loadPost (id, successCallback, failCallback) {
        failCallback = failCallback || function(){};
        $.get(this.getUrl('/post/' + id), {}, function (data) {
            if (data.success) {
                successCallback (data.post);
            } else {
                failCallback ();
            }
        });
    }

    inappropriatePost (id, reason, success, failure) {
        let params = {
            reason: reason
            // where: {
            //     id: {'=': id}
            // }
        };

        $.post(this.getUrl('/post/' + id + '/inappropriate'), params, function (data, textStatus, jqXHR) {
            data = $.parseJSON(data);

            if (data.success === true) {
                success();
            }
            else {
                failure(jqXHR);
            }
        });
    }

    lovePost (id, success, failure) {
        let params = {};

        $.post(this.getUrl('/post/' + id + '/love'), params, function (data, textStatus, jqXHR) {
            data = $.parseJSON(data);

            if (data.success === true) {
                success(data.loves);
            }
            else {
                failure(jqXHR);
            }
        });
    }

    getUrl (trail) {
        return this.feedBase+'/'+this.options.feedId+trail;
    }

    destroy () {
        super.destroy();
    }
}

Curator.Feed = Feed;