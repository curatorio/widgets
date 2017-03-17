$.support.cors = true;

let defaults = {
    postsPerPage:24,
    feedId:'xxx',
    feedParams:{},
    debug:false,
    apiEndpoint:'https://api.curator.io/v1',
    onPostsLoaded:function(data){
        Curator.log('Feed->onPostsLoaded');
        Curator.log(data);
    },
    onPostsFail:function(data) {
        Curator.log('Feed->onPostsFail failed with message');
        Curator.log(data.message);
    }
};

class Feed extends EventBus {

    constructor(client) {
        super ();

        Curator.log ('Feed->init with options');

        this.client = client;

        this.posts = [];
        this.currentPage = 0;
        this.postsLoaded = 0;
        this.postCount = 0;
        this.loading = false;

        this.options = this.client.options;

        this.feedBase = this.options.apiEndpoint+'/feed';
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

                    this.posts = this.posts.concat(data.posts);
                    this.networks = data.networks;

                    this.trigger('postsLoaded',data.posts);
                } else {
                    this.trigger('postsFailed',data.posts);
                }
                this.loading = false;
            },
            (jqXHR, textStatus, errorThrown) => {
                Curator.log('Feed->_loadPosts fail');
                Curator.log(textStatus);
                Curator.log(errorThrown);

                this.trigger('postsFailed',[]);
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
}

Curator.Feed = Feed;