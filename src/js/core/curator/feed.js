jQuery.support.cors = true;

var defaults = {
    postsPerPage:24,
    feedId:'xxx',
    debug:false,
    apiEndpoint:'https://api.curator.io/v1'
};

Curator.Feed = function (options) {
    this.init(options);
};

jQuery.extend(Curator.Feed.prototype,{
    loading: false,
    postsLoaded:0,
    postCount:0,
    feedBase:'',

    init: function (options) {
        Curator.log ('Feed->init with options');

        this.options = jQuery.extend({},defaults,options);

        Curator.log(this.options);

        this.feedBase = this.options.apiEndpoint+'/feed';
    },

    getUrl : function (trail) {
        return this.feedBase+'/'+this.options.feedId+trail;
    },

    loadPost : function (id, successCallback, failCallback) {
        failCallback = failCallback || function(){};
        jQuery.get(this.getUrl('/post/' + id), {}, function (data) {
            if (data.success) {
                successCallback (data.post);
            } else {
                failCallback ();
            }
        });
    },

    inappropriatePost: function (id, reason, success, failure) {
        var params = {
            reason: reason
            // where: {
            //     id: {'=': id}
            // }
        };

        jQuery.post(this.getUrl('/post/' + id + '/inappropriate'), params, function (data, textStatus, jqXHR) {
            data = jQuery.parseJSON(data);

            if (data.success === true) {
                success();
            }
            else {
                failure(jqXHR);
            }
        });
    },

    lovePost: function (id, success, failure) {
        var params = {};

        jQuery.post(this.getUrl('/post/' + id + '/love'), params, function (data, textStatus, jqXHR) {
            data = jQuery.parseJSON(data);

            if (data.success === true) {
                success(data.loves);
            }
            else {
                failure(jqXHR);
            }
        });
    },

    loadPosts: function (successCallback, failCallback) {
        failCallback = failCallback || function(data) {
            Curator.log('Feed->loadPosts failed with message');
            Curator.log(data.message);
        };
        Curator.log ('Feed->loadPosts '+this.loading);
        if (this.loading) {
            return false;
        }
        var params = {
            limit : this.options.postsPerPage
        };

        this._loadPosts (params, successCallback, failCallback);
    },

    loadMorePosts : function (successCallback, failCallback) {
        if (this.loading) {
            return false;
        }
        var params = {
            limit : this.options.postsPerPage,
            offset : this.postsLoaded
        };

        this._loadPosts (params,successCallback, failCallback);
    },

    loadPage : function (page) {
        if (this.loading) {
            return false;
        }
        var params = {
            limit : this.options.postsPerPage,
            offset : page * this.options.postsPerPage
        };

        this._loadPosts (params);
    },

    _loadPosts : function (params, successCallback, failCallback) {
        Curator.log ('Feed->_loadPosts');
        var that = this;

        this.loading = true;

        jQuery.ajax({
            url: this.getUrl('/posts'),
            dataType: 'json',
            data: {params:params}
        })
        .success(function (data) {
            Curator.log ('Feed->_loadPosts success');
            
            if (data.success) {
                that.postCount = data.postCount;
                that.postsLoaded += data.posts.length;
                if (successCallback) {
                    successCallback(data.posts);
                }
                if (that.options.onLoad)
                {
                    that.options.onLoad(data.posts);
                }
            } else {
                if (failCallback) {
                    failCallback(data);
                }
                if (that.options.onFail)
                {
                    that.options.onFail(data);
                }
            }
            that.loading = false;
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            Curator.log ('Feed->_loadPosts fail');
            Curator.log(textStatus);
            Curator.log(errorThrown);
        });
    }
});